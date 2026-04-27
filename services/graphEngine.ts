/**
 * KoyJabo Graph Routing Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture:
 *   Nodes  = Stops / Stations (from STATIONS + METRO_STATIONS)
 *   Edges  = Connections (bus, metro, walk, transfer)
 *   Algo   = Dijkstra with multi-criteria scoring
 *             score = time*0.6 + cost*0.3 + transfers*0.1  (balanced)
 *   Output = 3 ranked routes: Best (balanced) · Fastest · Cheapest
 *
 * Designed to replace / wrap the legacy routePlanner.ts heuristics.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BUS_DATA, STATIONS, METRO_STATIONS } from '../constants';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../data/bangladeshTrainData';
import { fuzzyMatchLocation } from './travelAI';

// ── Constants ─────────────────────────────────────────────────────────────────
const WALK_SPEED_KMH = 4.5;           // Average walking speed
const WALK_MAX_METERS = 600;          // Auto-generate walk edges within this range
const TRANSFER_PENALTY_MIN = 5;       // +5 min per mode change
const BUS_AVG_KMH = 15;              // Dhaka bus avg (traffic)
const METRO_AVG_KMH = 35;            // MRT-6 average
const SCORE_W_TIME = 0.6;
const SCORE_W_COST = 0.3;
const SCORE_W_XFER = 0.1;

// Metro fare schedule (BDT) based on stations apart
const METRO_FARE_SCHEDULE = [20, 20, 30, 30, 40, 40, 60, 60, 80, 80, 100, 100, 100, 100, 100, 100];

// Bus fare per km (BDT) — BRTA rate
const BUS_FARE_PER_KM = 2.42;
const BUS_MIN_FARE = 10;

// ── Types ─────────────────────────────────────────────────────────────────────

export type EdgeMode = 'bus' | 'metro' | 'walk' | 'transfer' | 'train';

export interface GraphEdge {
  to: string;          // destination node id
  mode: EdgeMode;
  timeMin: number;     // travel time in minutes
  costBDT: number;     // fare in BDT
  routeId?: string;    // bus/metro/train route id
  routeName?: string;
  routeBnName?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  bnName: string;
  lat: number;
  lng: number;
  type: 'bus_stop' | 'metro_station' | 'rail_station' | 'transfer_hub';
}

export interface PathStep {
  fromId: string;
  fromName: string;
  fromBnName: string;
  toId: string;
  toName: string;
  toBnName: string;
  mode: EdgeMode;
  timeMin: number;
  costBDT: number;
  routeName?: string;
  routeBnName?: string;
  instruction: string;   // human-readable (English)
  instructionBn: string; // human-readable (Bengali)
}

export interface GraphRoute {
  steps: PathStep[];
  totalTimeMin: number;
  totalCostBDT: number;
  transfers: number;
  score: number;
  tag: 'balanced' | 'fastest' | 'cheapest';
}

// ── Haversine distance (meters) ───────────────────────────────────────────────
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Graph builder ─────────────────────────────────────────────────────────────

type AdjacencyList = Map<string, GraphEdge[]>;
type NodeMap = Map<string, GraphNode>;

let _graph: AdjacencyList | null = null;
let _nodes: NodeMap | null = null;

function addEdge(graph: AdjacencyList, from: string, edge: GraphEdge) {
  if (!graph.has(from)) graph.set(from, []);
  graph.get(from)!.push(edge);
}

function buildGraph(): { graph: AdjacencyList; nodes: NodeMap } {
  const graph: AdjacencyList = new Map();
  const nodes: NodeMap = new Map();

  // 1. Add bus stop nodes
  for (const [id, s] of Object.entries(STATIONS)) {
    nodes.set(id, {
      id, name: s.name, bnName: s.bnName ?? s.name,
      lat: s.lat, lng: s.lng, type: 'bus_stop',
    });
  }

  // 2. Add metro station nodes
  for (const [id, m] of Object.entries(METRO_STATIONS)) {
    nodes.set(id, {
      id, name: m.name, bnName: m.bnName,
      lat: m.lat, lng: m.lng, type: 'metro_station',
    });
  }

  // 3. Add railway station nodes
  for (const [id, t] of Object.entries(TRAIN_STATIONS)) {
    if (!nodes.has(id)) {
      nodes.set(id, {
        id, name: t.name, bnName: t.bnName,
        lat: (t as any).lat ?? 23.73, lng: (t as any).lng ?? 90.42,
        type: 'rail_station',
      });
    }
  }

  // 4. Bus route edges — consecutive stops
  for (const bus of BUS_DATA) {
    for (let i = 0; i < bus.stops.length - 1; i++) {
      const fromId = bus.stops[i];
      const toId = bus.stops[i + 1];
      const fromNode = nodes.get(fromId);
      const toNode = nodes.get(toId);
      if (!fromNode || !toNode) continue;

      const distM = haversineM(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng);
      const distKm = distM / 1000;
      const timeMin = (distKm / BUS_AVG_KMH) * 60;
      const costBDT = Math.max(BUS_MIN_FARE, Math.ceil(distKm * BUS_FARE_PER_KM));

      // Both directions (buses run both ways)
      const edgeFwd: GraphEdge = {
        to: toId, mode: 'bus', timeMin, costBDT,
        routeId: bus.id, routeName: bus.name, routeBnName: bus.bnName,
      };
      const edgeBwd: GraphEdge = {
        to: fromId, mode: 'bus', timeMin, costBDT,
        routeId: bus.id, routeName: bus.name, routeBnName: bus.bnName,
      };
      addEdge(graph, fromId, edgeFwd);
      addEdge(graph, toId, edgeBwd);
    }
  }

  // 4.5 Train edges — BD_TRAIN_ROUTES
  for (const train of BD_TRAIN_ROUTES) {
    if (!train.stops) continue;
    for (let i = 0; i < train.stops.length - 1; i++) {
      const fromSt = train.stops[i];
      const toSt = train.stops[i + 1];
      const fromNode = nodes.get(fromSt);
      const toNode = nodes.get(toSt);
      if (!fromNode || !toNode) continue;
      
      const distM = haversineM(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng);
      const timeMin = (distM / 1000 / 45) * 60; // 45 km/h train avg
      const costBDT = Math.max(45, Math.ceil((distM / 1000) * 1.5)); // rough train fare

      addEdge(graph, fromSt, {
        to: toSt, mode: 'train', timeMin, costBDT,
        routeId: train.id, routeName: train.name, routeBnName: train.bnName
      });
      // Assuming trains run both ways for the graph
      addEdge(graph, toSt, {
        to: fromSt, mode: 'train', timeMin, costBDT,
        routeId: train.id, routeName: train.name, routeBnName: train.bnName
      });
    }
  }

  // 5. Metro edges — ordered station list from METRO_STATIONS
  // Build ordered metro sequence from constants
  const METRO_ORDER = [
    'uttara_north', 'uttara_center', 'uttara_south', 'pallabi',
    'mirpur_11', 'mirpur_10', 'kazipara', 'shewrapara', 'agargaon',
    'bijoy_sarani', 'farmgate', 'kawran_bazar', 'shahbag',
    'dhaka_university', 'secretariat', 'motijheel',
  ];
  // Also try keys that match common METRO_STATIONS keys
  const metroKeys = Object.keys(METRO_STATIONS);
  const orderedMetro = METRO_ORDER.filter(id => metroKeys.includes(id) || nodes.has(id));

  for (let i = 0; i < orderedMetro.length - 1; i++) {
    const fromId = orderedMetro[i];
    const toId = orderedMetro[i + 1];
    const fromNode = nodes.get(fromId);
    const toNode = nodes.get(toId);
    if (!fromNode || !toNode) continue;

    const distM = haversineM(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng);
    const distKm = distM / 1000;
    const timeMin = (distKm / METRO_AVG_KMH) * 60 + 1; // +1 for station dwell
    const stationsApart = 1;
    const fare = METRO_FARE_SCHEDULE[Math.min(stationsApart, METRO_FARE_SCHEDULE.length - 1)];

    addEdge(graph, fromId, { to: toId, mode: 'metro', timeMin, costBDT: fare, routeName: 'MRT-6', routeBnName: 'মেট্রোরেল MRT-6' });
    addEdge(graph, toId, { to: fromId, mode: 'metro', timeMin, costBDT: fare, routeName: 'MRT-6', routeBnName: 'মেট্রোরেল MRT-6' });
  }

  // 6. Walking edges — auto-generate between ANY two nodes within WALK_MAX_METERS
  const allNodeIds = Array.from(nodes.keys());
  for (let i = 0; i < allNodeIds.length; i++) {
    const a = nodes.get(allNodeIds[i])!;
    for (let j = i + 1; j < allNodeIds.length; j++) {
      const b = nodes.get(allNodeIds[j])!;
      const distM = haversineM(a.lat, a.lng, b.lat, b.lng);
      if (distM > WALK_MAX_METERS) continue;

      const timeMin = (distM / 1000 / WALK_SPEED_KMH) * 60;
      addEdge(graph, a.id, { to: b.id, mode: 'walk', timeMin, costBDT: 0 });
      addEdge(graph, b.id, { to: a.id, mode: 'walk', timeMin, costBDT: 0 });
    }
  }

  return { graph, nodes };
}

function getGraph(): { graph: AdjacencyList; nodes: NodeMap } {
  if (!_graph || !_nodes) {
    const built = buildGraph();
    _graph = built.graph;
    _nodes = built.nodes;
  }
  return { graph: _graph, nodes: _nodes };
}

let _graphPromise: Promise<{ graph: AdjacencyList; nodes: NodeMap }> | null = null;

// ── Lazy-Load Graph Initialization ────────────────────────────────────────────

export async function initGraphAsync() {
  if (!_graphPromise) {
    _graphPromise = new Promise((resolve) => {
      // Use setTimeout to avoid blocking main thread (simulates worker)
      setTimeout(() => {
        const built = buildGraph();
        _graph = built.graph;
        _nodes = built.nodes;
        resolve(built);
      }, 0);
    });
  }
  return _graphPromise;
}

// ── Dijkstra / A* ─────────────────────────────────────────────────────────────

type WeightFn = (edge: GraphEdge, currentMode: EdgeMode | null) => number;

interface DijkstraState {
  cost: number;
  fCost: number; // For A* sorting
  node: string;
  path: Array<{ from: string; edge: GraphEdge }>;
  lastMode: EdgeMode | null;
  transfers: number;
}

function dijkstra(
  startId: string,
  endId: string,
  weightFn: WeightFn,
): DijkstraState | null {
  const { graph, nodes } = getGraph();

  // Nighttime & Peak traffic logic
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 22; // 10 PM to 6 AM
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
  const trafficMultiplier = isPeak ? 1.8 : 1.0;

  // Min-heap (simple array-based priority queue for small graphs)
  const pq: DijkstraState[] = [];
  const dist = new Map<string, number>();

  const push = (s: DijkstraState) => {
    pq.push(s);
    pq.sort((a, b) => a.fCost - b.fCost); // O(n log n) — A* sort by fCost
  };

  push({ cost: 0, fCost: 0, node: startId, path: [], lastMode: null, transfers: 0 });
  dist.set(startId, 0);

  while (pq.length > 0) {
    const current = pq.shift()!;

    if (current.node === endId) return current;

    // Skip stale queue entries (check against actual g-cost)
    if ((dist.get(current.node) ?? Infinity) < current.cost) continue;

    const edges = graph.get(current.node) ?? [];
    for (const edge of edges) {
      const isTransfer = current.lastMode !== null && edge.mode !== current.lastMode && edge.mode !== 'walk' && current.lastMode !== 'walk';
      const transferPenalty = isTransfer ? TRANSFER_PENALTY_MIN : 0;
      
      const baseCost = weightFn(edge, current.lastMode);
      
      // Nighttime pruning: heavily penalize bus routes at night
      const nightPenalty = (isNight && edge.mode === 'bus') ? 9999 : 0;
      
      // Traffic multiplier applied to bus time
      const timeCost = edge.mode === 'bus' ? baseCost * trafficMultiplier : baseCost;
      
      const newCost = current.cost + timeCost + transferPenalty + nightPenalty;

      if (newCost < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, newCost);
        
        // A* Heuristic calculation (h-cost)
        const toNodeObj = nodes.get(edge.to);
        const endNodeObj = nodes.get(endId);
        let h = 0;
        if (toNodeObj && endNodeObj) {
           const distToEnd = haversineM(toNodeObj.lat, toNodeObj.lng, endNodeObj.lat, endNodeObj.lng);
           h = (distToEnd / 1000 / METRO_AVG_KMH) * 60; // optimistic time heuristic
        }
        const fCost = newCost + h;

        push({
          cost: newCost,
          fCost,
          node: edge.to,
          path: [...current.path, { from: current.node, edge }],
          lastMode: edge.mode,
          transfers: current.transfers + (isTransfer ? 1 : 0),
        });
      }
    }
  }

  return null; // no path found
}

// ── Path to Steps ─────────────────────────────────────────────────────────────

function pathToSteps(state: DijkstraState, nodes: NodeMap): PathStep[] {
  return state.path.map(({ from, edge }) => {
    const fromNode = nodes.get(from);
    const toNode = nodes.get(edge.to);
    const fn = fromNode?.name ?? from;
    const fnBn = fromNode?.bnName ?? from;
    const tn = toNode?.name ?? edge.to;
    const tnBn = toNode?.bnName ?? edge.to;

    let instruction = '';
    let instructionBn = '';
    const walkMin = Math.round(edge.timeMin);

    switch (edge.mode) {
      case 'walk':
        instruction = `🚶 Walk ${walkMin} min from ${fn} to ${tn}`;
        instructionBn = `🚶 ${fn} থেকে ${tn} পর্যন্ত হেঁটে যান (${walkMin} মিনিট)`;
        break;
      case 'bus':
        instruction = `🚌 Take **${edge.routeName}** from ${fn} → ${tn}`;
        instructionBn = `🚌 **${edge.routeBnName ?? edge.routeName}** বাসে ${fn} থেকে ${tn}`;
        break;
      case 'metro':
        instruction = `🚇 Take MRT-6 from **${fn}** → **${tn}** (৳${edge.costBDT})`;
        instructionBn = `🚇 MRT-6 মেট্রোরেলে **${fn}** থেকে **${tn}** (৳${edge.costBDT})`;
        break;
      case 'train':
        instruction = `🚂 Take **${edge.routeName}** from ${fn} → ${tn}`;
        instructionBn = `🚂 **${edge.routeBnName ?? edge.routeName}** ট্রেনে ${fn} থেকে ${tn}`;
        break;
      case 'transfer':
        instruction = `🔄 Transfer at ${fn}`;
        instructionBn = `🔄 ${fn}-এ ট্রান্সফার করুন`;
        break;
    }

    return {
      fromId: from, fromName: fn, fromBnName: fnBn,
      toId: edge.to, toName: tn, toBnName: tnBn,
      mode: edge.mode, timeMin: edge.timeMin, costBDT: edge.costBDT,
      routeName: edge.routeName, routeBnName: edge.routeBnName,
      instruction, instructionBn,
    };
  });
}

// ── Merge consecutive same-route steps ───────────────────────────────────────

function mergeSteps(steps: PathStep[]): PathStep[] {
  const merged: PathStep[] = [];
  for (const step of steps) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.mode === step.mode &&
      prev.routeName === step.routeName &&
      prev.mode !== 'walk' &&
      prev.mode !== 'transfer'
    ) {
      // Extend previous step
      prev.toId = step.toId;
      prev.toName = step.toName;
      prev.toBnName = step.toBnName;
      prev.timeMin += step.timeMin;
      prev.costBDT += step.costBDT;
      prev.instruction = prev.instruction.replace(/→.*/, `→ ${step.toName}`);
      prev.instructionBn = prev.instructionBn.replace(/→.*/, `→ ${step.toBnName}`);
    } else {
      merged.push({ ...step });
    }
  }
  return merged;
}

// ── Public API: findRoutes ────────────────────────────────────────────────────

export function findRoutes(
  fromId: string,
  toId: string,
): GraphRoute[] {
  const { nodes } = getGraph();
  if (!nodes.has(fromId) || !nodes.has(toId)) return [];
  if (fromId === toId) return [];

  const results: GraphRoute[] = [];

  // --- Weight functions for 3 optimization criteria ---

  // 1. Balanced (default) — weighted score
  const balancedWeight: WeightFn = (edge, lastMode) => {
    const isXfer = lastMode !== null && edge.mode !== lastMode && edge.mode !== 'walk' && lastMode !== 'walk';
    return edge.timeMin * SCORE_W_TIME + edge.costBDT * SCORE_W_COST + (isXfer ? TRANSFER_PENALTY_MIN * SCORE_W_XFER : 0);
  };

  // 2. Fastest — minimize time only
  const fastestWeight: WeightFn = (edge) => edge.timeMin;

  // 3. Cheapest — minimize cost, break ties by time
  const cheapestWeight: WeightFn = (edge) => edge.costBDT + edge.timeMin * 0.01;

  const weightFns: Array<[WeightFn, GraphRoute['tag']]> = [
    [balancedWeight, 'balanced'],
    [fastestWeight, 'fastest'],
    [cheapestWeight, 'cheapest'],
  ];

  for (const [wFn, tag] of weightFns) {
    const state = dijkstra(fromId, toId, wFn);
    if (!state) continue;

    const rawSteps = pathToSteps(state, nodes);
    const steps = mergeSteps(rawSteps);

    const totalTimeMin = steps.reduce((s, x) => s + x.timeMin, 0);
    const totalCostBDT = steps.reduce((s, x) => s + x.costBDT, 0);
    const transfers = steps.filter(s => s.mode !== 'walk').length - 1;

    const score =
      totalTimeMin * SCORE_W_TIME +
      totalCostBDT * SCORE_W_COST +
      Math.max(0, transfers) * TRANSFER_PENALTY_MIN * SCORE_W_XFER;

    results.push({ steps, totalTimeMin, totalCostBDT, transfers: Math.max(0, transfers), score, tag });
  }

  // Deduplicate: remove routes that are identical (same steps sequence)
  const seen = new Set<string>();
  return results.filter(r => {
    const key = r.steps.map(s => `${s.fromId}-${s.mode}-${s.toId}`).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Location resolver ─────────────────────────────────────────────────────────
// Converts free-text to the nearest graph node id

export function resolveLocation(query: string): string | null {
  const { nodes } = getGraph();
  const q = query.toLowerCase().trim();

  // Direct node id match
  if (nodes.has(q)) return q;

  // Match by name (partial, case-insensitive)
  for (const [id, node] of nodes) {
    if (node.name.toLowerCase().includes(q) || (node.bnName && node.bnName.includes(query))) return id;
  }

  // Fuzzy intercity → district match (fallback)
  const fuzzy = fuzzyMatchLocation(query);
  if (fuzzy) {
    // Try matching district to a known node
    const fLower = fuzzy.toLowerCase();
    for (const [id, node] of nodes) {
      if (node.name.toLowerCase().includes(fLower)) return id;
    }
  }

  return null;
}

// ── First-mile / Last-mile virtual node injection ─────────────────────────────
// Adds a temporary "USER_START" node connected to the N nearest stops via walking

export function findRoutesFromCoords(
  userLat: number, userLng: number,
  destId: string,
  topN = 3,
): GraphRoute[] {
  const { nodes, graph } = getGraph();
  const VIRTUAL = '__USER_START__';

  // Find N nearest nodes
  const sorted = Array.from(nodes.values())
    .map(n => ({ id: n.id, dist: haversineM(userLat, userLng, n.lat, n.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, topN);

  // Temporarily inject virtual node
  nodes.set(VIRTUAL, { id: VIRTUAL, name: 'Your Location', bnName: 'আপনার অবস্থান', lat: userLat, lng: userLng, type: 'bus_stop' });
  const walkEdges: GraphEdge[] = sorted.map(({ id, dist }) => ({
    to: id,
    mode: 'walk',
    timeMin: (dist / 1000 / WALK_SPEED_KMH) * 60,
    costBDT: 0,
  }));
  graph.set(VIRTUAL, walkEdges);

  const routes = findRoutes(VIRTUAL, destId);

  // Clean up virtual node
  nodes.delete(VIRTUAL);
  graph.delete(VIRTUAL);

  return routes;
}

// ── AI Formatter ──────────────────────────────────────────────────────────────
// Converts GraphRoute[] into a human-readable string (EN or BN)

const TAG_LABELS: Record<GraphRoute['tag'], { en: string; bn: string; emoji: string }> = {
  balanced: { en: 'Best Route (Balanced)', bn: 'সেরা রুট (সুষম)', emoji: '🏆' },
  fastest:  { en: 'Fastest Route',         bn: 'দ্রুততম রুট',   emoji: '⚡' },
  cheapest: { en: 'Cheapest Route',        bn: 'সাশ্রয়ী রুট',   emoji: '💸' },
};

export function formatRoutes(
  routes: GraphRoute[],
  fromName: string,
  toName: string,
  isBn: boolean,
): string {
  if (routes.length === 0) {
    return isBn
      ? `🤔 **${fromName} → ${toName}** এর জন্য কোনো রুট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে নির্দিষ্ট স্টেশনের নাম দিন।`
      : `🤔 No route found from **${fromName}** to **${toName}**. Please specify a more exact station name.`;
  }

  const header = isBn
    ? `🗺️ **${fromName} → ${toName}** রুট পরিকল্পনা\n\n`
    : `🗺️ **${fromName} → ${toName}** Route Options\n\n`;

  const sections = routes.map((route, idx) => {
    const label = TAG_LABELS[route.tag];
    const title = `${label.emoji} **${isBn ? label.bn : label.en}**`;
    const summary = isBn
      ? `⏱️ ~${Math.round(route.totalTimeMin)} মিনিট | 💰 ৳${route.totalCostBDT} | 🔄 ${route.transfers} ট্রান্সফার`
      : `⏱️ ~${Math.round(route.totalTimeMin)} min | 💰 ৳${route.totalCostBDT} | 🔄 ${route.transfers} transfer(s)`;

    const steps = route.steps
      .map((s, i) => `  ${i + 1}. ${isBn ? s.instructionBn : s.instruction}`)
      .join('\n');

    return `${title}\n${summary}\n${steps}`;
  });

  // Peak-hour warning
  const hour = new Date().getHours();
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
  const peakNote = isPeak
    ? (isBn
        ? '\n\n⏰ **পিক আওয়ার সতর্কতা:** বর্তমানে ট্রাফিক জ্যাম আছে — বাসের সময় ১.৫-২x বেশি লাগতে পারে। মেট্রো সবচেয়ে দ্রুত।'
        : '\n\n⏰ **Peak Hour Alert:** Heavy traffic now — bus time may be 1.5–2x longer. Metro is fastest.')
    : '';

  return header + sections.join('\n\n─────\n\n') + peakNote;
}

// ── Convenience wrapper for geminiService integration ────────────────────────

export async function planAndFormat(
  fromQuery: string,
  toQuery: string,
  isBn: boolean,
): Promise<string> {
  // Ensure graph is loaded asynchronously
  await initGraphAsync();

  const fromId = resolveLocation(fromQuery);
  const toId = resolveLocation(toQuery);

  const { nodes } = getGraph();

  const fromName = fromId ? (nodes.get(fromId)?.name ?? fromQuery) : fromQuery;
  const toName = toId ? (nodes.get(toId)?.name ?? toQuery) : toQuery;

  if (!fromId || !toId) {
    const missing = !fromId ? fromQuery : toQuery;
    return isBn
      ? `🤔 **"${missing}"** জায়গাটি আমার ডাটাবেসে খুঁজে পাচ্ছি না। সঠিক স্টেশনের নাম দিন (যেমন: মিরপুর ১০, ফার্মগেট, মতিঝিল)।`
      : `🤔 I couldn't find **"${missing}"** in my database. Please use an exact station name (e.g. Mirpur 10, Farmgate, Motijheel).`;
  }

  const routes = findRoutes(fromId, toId);
  return formatRoutes(routes, fromName, toName, isBn);
}
