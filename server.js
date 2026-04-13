import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ─── In-memory state ───────────────────────────────────────────────────────

/** Live buses: id → { id, busName, lat, lng, speed, heading, timestamp } */
const liveBuses = new Map();

/** Visitor stats */
const stats = {
    totalVisits: 0,
    todayVisits: 0,
    uniqueVisitors: new Set(),
    activeWsClients: 0,
    todayDate: new Date().toISOString().split('T')[0],
};

// Reset today's visits at midnight
setInterval(() => {
    const today = new Date().toISOString().split('T')[0];
    if (today !== stats.todayDate) {
        stats.todayDate = today;
        stats.todayVisits = 0;
    }
}, 60_000);

// ─── REST API ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/stats', (_req, res) => {
    res.json({
        totalVisits: stats.totalVisits,
        todayVisits: stats.todayVisits,
        activeUsers: stats.activeWsClients + stats.uniqueVisitors.size,
        uniqueVisitors: stats.uniqueVisitors.size,
    });
});

app.post('/api/visitor/register', (req, res) => {
    const { visitorId } = req.body || {};
    if (visitorId && !stats.uniqueVisitors.has(visitorId)) {
        stats.uniqueVisitors.add(visitorId);
        stats.totalVisits += 1;
        stats.todayVisits += 1;
    }
    res.json({
        ok: true,
        stats: {
            totalVisits: stats.totalVisits,
            todayVisits: stats.todayVisits,
            activeUsers: stats.activeWsClients + stats.uniqueVisitors.size,
            uniqueVisitors: stats.uniqueVisitors.size,
        },
    });
});

// ─── HTTP Server + WebSocket ───────────────────────────────────────────────

const server = createServer(app);
const wss = new WebSocketServer({ server });

/** Broadcast a JSON message to ALL connected clients */
function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === 1 /* OPEN */) {
            client.send(msg);
        }
    });
}

/** Push current live-bus snapshot to a single client (or all) */
function pushBusSnapshot(target) {
    const buses = Array.from(liveBuses.values());
    const msg = JSON.stringify({ type: 'bus_locations_broadcast', buses });
    if (target) {
        if (target.readyState === 1) target.send(msg);
    } else {
        broadcast({ type: 'bus_locations_broadcast', buses });
    }
}

/** Remove buses not updated in the last 5 minutes */
function pruneStale() {
    const cutoff = Date.now() - 5 * 60 * 1000;
    let changed = false;
    liveBuses.forEach((bus, id) => {
        if (bus.timestamp < cutoff) {
            liveBuses.delete(id);
            changed = true;
        }
    });
    if (changed) pushBusSnapshot(null);
}
setInterval(pruneStale, 30_000);

wss.on('connection', (ws, req) => {
    stats.activeWsClients++;
    console.log(`🔌 WS connected — active: ${stats.activeWsClients}`);

    // Send current live-bus state immediately to new subscriber
    pushBusSnapshot(ws);

    // Also send stats so UI can update visitor count
    ws.send(JSON.stringify({
        type: 'stats_update',
        stats: {
            totalVisits: stats.totalVisits,
            todayVisits: stats.todayVisits,
            activeUsers: stats.activeWsClients + stats.uniqueVisitors.size,
            uniqueVisitors: stats.uniqueVisitors.size,
        },
    }));

    ws.on('message', (raw) => {
        try {
            const data = JSON.parse(raw.toString());

            switch (data.type) {

                case 'bus_location_update': {
                    // A user is broadcasting their position on a bus
                    const { busName, lat, lng, speed, heading, id: clientId } = data;
                    const busId = clientId || ws._id || `ws_${Math.random().toString(36).slice(2)}`;

                    // Tag the ws so we can clean up on close
                    if (!ws._broadcastId) ws._broadcastId = busId;

                    liveBuses.set(busId, {
                        id: busId,
                        busName,
                        lat,
                        lng,
                        speed: speed || 0,
                        heading: heading || 0,
                        timestamp: data.timestamp || Date.now(),
                    });

                    // Immediately broadcast updated list to ALL clients
                    pushBusSnapshot(null);
                    break;
                }

                case 'stop_broadcast': {
                    const id = ws._broadcastId;
                    if (id && liveBuses.has(id)) {
                        liveBuses.delete(id);
                        ws._broadcastId = null;
                        pushBusSnapshot(null);
                    }
                    break;
                }

                default:
                    break;
            }
        } catch (e) {
            console.error('WS message parse error:', e);
        }
    });

    ws.on('close', () => {
        stats.activeWsClients = Math.max(0, stats.activeWsClients - 1);
        // Auto-remove any bus this client was broadcasting
        if (ws._broadcastId && liveBuses.has(ws._broadcastId)) {
            liveBuses.delete(ws._broadcastId);
            pushBusSnapshot(null);
        }
        console.log(`🔌 WS disconnected — active: ${stats.activeWsClients}`);
    });

    ws.on('error', (err) => {
        console.error('WS error:', err.message);
    });
});

server.listen(PORT, () => {
    console.log(`🚍 KoyJabo backend running on port ${PORT}`);
    console.log(`   REST:  http://localhost:${PORT}/api/stats`);
    console.log(`   WS:    ws://localhost:${PORT}`);
});
