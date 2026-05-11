import cluster from 'cluster';
import os from 'os';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 10000;

// Render sets WEB_CONCURRENCY; default to 1 so single-process behaviour is unchanged
const WORKERS = parseInt(process.env.WEB_CONCURRENCY || '1', 10);

// Maximum WebSocket connections per IP address
const MAX_WS_PER_IP = parseInt(process.env.MAX_WS_PER_IP || '5', 10);

// Global WebSocket cap — raise when moving to a larger instance
const MAX_WS_TOTAL = parseInt(process.env.MAX_WS_TOTAL || '50000', 10);

// Minimum milliseconds between full-bus broadcasts (throttle)
const BROADCAST_INTERVAL_MS = parseInt(process.env.BROADCAST_INTERVAL_MS || '500', 10);

// ─── Cluster master ─────────────────────────────────────────────────────────
// The master owns the single source-of-truth for liveBuses and relays
// throttled snapshots to all workers via IPC.  Each worker owns only its
// own WebSocket clients and broadcasts what the master sends.

if (cluster.isPrimary && WORKERS > 1) {
    console.log(`[master] PID ${process.pid} – spawning ${WORKERS} workers`);

    const workers = new Set();
    const liveBuses = new Map();
    let broadcastTimer = null;
    let lastBroadcast = 0;

    function scheduleBroadcast() {
        if (broadcastTimer) return;
        const delay = Math.max(0, BROADCAST_INTERVAL_MS - (Date.now() - lastBroadcast));
        broadcastTimer = setTimeout(() => {
            broadcastTimer = null;
            lastBroadcast = Date.now();
            const buses = Array.from(liveBuses.values());
            const msg = { type: 'broadcast_buses', buses };
            for (const w of workers) w.send(msg);
        }, delay);
    }

    setInterval(() => {
        const cutoff = Date.now() - 5 * 60 * 1000;
        let changed = false;
        liveBuses.forEach((bus, id) => {
            if (bus.timestamp < cutoff) { liveBuses.delete(id); changed = true; }
        });
        if (changed) scheduleBroadcast();
    }, 30_000);

    function spawnWorker() {
        const w = cluster.fork();
        workers.add(w);
        w.on('message', (msg) => {
            if (msg.type === 'bus_update') {
                liveBuses.set(msg.bus.id, msg.bus);
                scheduleBroadcast();
            } else if (msg.type === 'bus_remove') {
                if (liveBuses.delete(msg.busId)) scheduleBroadcast();
            } else if (msg.type === 'get_snapshot') {
                w.send({ type: 'snapshot', buses: Array.from(liveBuses.values()) });
            }
        });
        w.on('exit', () => { workers.delete(w); spawnWorker(); });
    }

    for (let i = 0; i < WORKERS; i++) spawnWorker();

} else {
    startServer();
}

// ─── Worker / standalone server ─────────────────────────────────────────────

function startServer() {
    const isWorker = cluster.isWorker;

    const app = express();
    app.use(cors({ origin: '*' }));
    app.use(express.json({ limit: '16kb' }));

    // ── HTTP rate limit (per IP, in-process) ──────────────────────────────
    const httpRate = new Map();  // ip → { count, resetAt }
    const HTTP_LIMIT = 300;
    const HTTP_WINDOW = 60_000;

    app.use((req, res, next) => {
        const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString().split(',')[0].trim();
        const now = Date.now();
        const e = httpRate.get(ip);
        if (!e || now > e.resetAt) {
            httpRate.set(ip, { count: 1, resetAt: now + HTTP_WINDOW });
        } else if (++e.count > HTTP_LIMIT) {
            return res.status(429).json({ error: 'Too many requests' });
        }
        next();
    });

    setInterval(() => {
        const now = Date.now();
        httpRate.forEach((v, k) => { if (now > v.resetAt) httpRate.delete(k); });
    }, 60_000);

    // ── Visitor stats ──────────────────────────────────────────────────────
    const VISITOR_CAP = 50_000;  // prevent unbounded growth
    const stats = {
        totalVisits: 0,
        todayVisits: 0,
        uniqueVisitors: new Set(),
        activeWsClients: 0,
        todayDate: new Date().toISOString().split('T')[0],
    };

    setInterval(() => {
        const today = new Date().toISOString().split('T')[0];
        if (today !== stats.todayDate) { stats.todayDate = today; stats.todayVisits = 0; }
    }, 60_000);

    // ── REST endpoints ─────────────────────────────────────────────────────
    // /health is pinged by UptimeRobot (free) every 5 min to keep Render free tier awake
    app.get('/health', (_req, res) => res.json({ ok: true, pid: process.pid }));

    app.get('/api/stats', (_req, res) => {
        res.json({
            totalVisits: stats.totalVisits,
            todayVisits: stats.todayVisits,
            activeUsers: stats.activeWsClients,
            uniqueVisitors: stats.uniqueVisitors.size,
        });
    });

    app.post('/api/visitor/register', (req, res) => {
        const { visitorId } = req.body || {};
        if (visitorId && !stats.uniqueVisitors.has(visitorId) && stats.uniqueVisitors.size < VISITOR_CAP) {
            stats.uniqueVisitors.add(visitorId);
            stats.totalVisits++;
            stats.todayVisits++;
        }
        res.json({
            ok: true,
            stats: {
                totalVisits: stats.totalVisits,
                todayVisits: stats.todayVisits,
                activeUsers: stats.activeWsClients,
                uniqueVisitors: stats.uniqueVisitors.size,
            },
        });
    });

    // ── WebSocket server ───────────────────────────────────────────────────
    const server = createServer(app);
    const wss = new WebSocketServer({ server, maxPayload: 64 * 1024 });

    const wsPerIp = new Map();   // ip → open-connection count
    let totalWsConnections = 0;

    // ── Bus state (standalone mode only – cluster mode uses IPC) ────────────
    const localBuses = new Map();
    let broadcastTimer = null;
    let lastBroadcast = 0;
    let currentBuses = [];       // last computed snapshot (used for new-joiner send)

    function scheduleLocalBroadcast() {
        if (broadcastTimer) return;
        const delay = Math.max(0, BROADCAST_INTERVAL_MS - (Date.now() - lastBroadcast));
        broadcastTimer = setTimeout(() => {
            broadcastTimer = null;
            lastBroadcast = Date.now();
            currentBuses = Array.from(localBuses.values());
            pushToAllClients(currentBuses);
        }, delay);
    }

    if (!isWorker) {
        setInterval(() => {
            const cutoff = Date.now() - 5 * 60 * 1000;
            let changed = false;
            localBuses.forEach((bus, id) => {
                if (bus.timestamp < cutoff) { localBuses.delete(id); changed = true; }
            });
            if (changed) scheduleLocalBroadcast();
        }, 30_000);
    }

    function pushToAllClients(buses) {
        const msg = JSON.stringify({ type: 'bus_locations_broadcast', buses });
        wss.clients.forEach(ws => {
            if (ws.readyState === 1) ws.send(msg, { binary: false });
        });
    }

    // ── IPC: receive snapshots/broadcasts from master ──────────────────────
    if (isWorker) {
        process.on('message', (msg) => {
            if (msg.type === 'snapshot') {
                currentBuses = msg.buses;
            } else if (msg.type === 'broadcast_buses') {
                currentBuses = msg.buses;
                pushToAllClients(currentBuses);
            }
        });
        process.send({ type: 'get_snapshot' });
    }

    // ── Connection handler ─────────────────────────────────────────────────
    wss.on('connection', (ws, req) => {
        const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString().split(',')[0].trim();

        // Reject if at capacity
        if (totalWsConnections >= MAX_WS_TOTAL) {
            ws.close(1008, 'Server at capacity — try again later');
            return;
        }
        if ((wsPerIp.get(ip) || 0) >= MAX_WS_PER_IP) {
            ws.close(1008, 'Too many connections from this IP');
            return;
        }

        wsPerIp.set(ip, (wsPerIp.get(ip) || 0) + 1);
        totalWsConnections++;
        stats.activeWsClients++;
        ws._ip = ip;
        ws._isAlive = true;

        // Send current bus state and visitor count to new client
        ws.send(JSON.stringify({ type: 'bus_locations_broadcast', buses: currentBuses }));
        ws.send(JSON.stringify({
            type: 'stats_update',
            stats: {
                totalVisits: stats.totalVisits,
                todayVisits: stats.todayVisits,
                activeUsers: stats.activeWsClients,
                uniqueVisitors: stats.uniqueVisitors.size,
            },
        }));

        ws.on('pong', () => { ws._isAlive = true; });

        ws.on('message', (raw) => {
            let data;
            try { data = JSON.parse(raw.toString()); } catch { return; }

            if (data.type === 'bus_location_update') {
                const { busName, lat, lng, speed, heading, id: clientId } = data;
                const busId = clientId || `ws_${Math.random().toString(36).slice(2)}`;
                if (!ws._broadcastId) ws._broadcastId = busId;
                const bus = { id: busId, busName, lat, lng, speed: speed || 0, heading: heading || 0, timestamp: data.timestamp || Date.now() };
                if (isWorker) {
                    process.send({ type: 'bus_update', bus });
                } else {
                    localBuses.set(busId, bus);
                    scheduleLocalBroadcast();
                }
            } else if (data.type === 'stop_broadcast') {
                const id = ws._broadcastId;
                if (id) {
                    if (isWorker) {
                        process.send({ type: 'bus_remove', busId: id });
                    } else if (localBuses.delete(id)) {
                        scheduleLocalBroadcast();
                    }
                    ws._broadcastId = null;
                }
            }
        });

        ws.on('close', () => {
            totalWsConnections = Math.max(0, totalWsConnections - 1);
            stats.activeWsClients = Math.max(0, stats.activeWsClients - 1);
            const remaining = (wsPerIp.get(ws._ip) || 1) - 1;
            if (remaining <= 0) wsPerIp.delete(ws._ip);
            else wsPerIp.set(ws._ip, remaining);

            if (ws._broadcastId) {
                if (isWorker) {
                    process.send({ type: 'bus_remove', busId: ws._broadcastId });
                } else if (localBuses.delete(ws._broadcastId)) {
                    scheduleLocalBroadcast();
                }
            }
        });

        ws.on('error', () => { /* errors surface via 'close' */ });
    });

    // ── Heartbeat: terminate zombie connections every 30 s ─────────────────
    const heartbeat = setInterval(() => {
        wss.clients.forEach(ws => {
            if (!ws._isAlive) { ws.terminate(); return; }
            ws._isAlive = false;
            ws.ping();
        });
    }, 30_000);

    // ── Graceful shutdown ──────────────────────────────────────────────────
    function shutdown(signal) {
        console.log(`[${signal}] graceful shutdown…`);
        clearInterval(heartbeat);
        wss.clients.forEach(ws => ws.close(1001, 'Server restarting'));
        wss.close();
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(1), 10_000);
    }
    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT',  () => shutdown('SIGINT'));

    server.listen(PORT, () => {
        const role = isWorker ? `worker[${process.pid}]` : 'standalone';
        console.log(`KoyJabo backend (${role}) on port ${PORT}`);
    });
}
