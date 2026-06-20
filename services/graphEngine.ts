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
import { busRouteConfidence, metroConfidence, confidenceBadge, fareEstimateNote } from './transportKnowledge';
import { BD_TRAIN_ROUTES, TRAIN_STATIONS } from '../data/bangladeshTrainData';
import { AIRPORTS_DATA, DOMESTIC_ROUTES } from '../data/bangladeshFlightData';
import { LAUNCH_TERMINALS, LAUNCH_ROUTES } from '../data/bangladeshLaunchData';
import { INTERCITY_BUS_ROUTES, MAJOR_TRANSPORT_HUBS } from '../data/intercityData';
import { fuzzyMatchLocation } from './travelAI';
import { searchLocationsSync } from './locationSearchService';

// ── Constants ─────────────────────────────────────────────────────────────────
const WALK_SPEED_KMH = 4.5;           // Average walking speed
const WALK_MAX_METERS = 600;          // Auto-generate walk edges within this range
const TRANSFER_PENALTY_MIN = 20;      // Real-world Dhaka: ~20 min wait+walk per transfer
const BUS_AVG_KMH = 15;              // Dhaka bus avg (traffic)
const METRO_AVG_KMH = 35;            // MRT-6 average
const SCORE_W_TIME = 0.4;
const SCORE_W_COST = 0.1;
const SCORE_W_XFER = 0.5;            // Heavy penalty for transfers — prefer direct routes

// Metro fare schedule (BDT) based on stations apart
const METRO_FARE_SCHEDULE = [20, 20, 30, 30, 40, 40, 60, 60, 80, 80, 100, 100, 100, 100, 100, 100];

// Bus fare per km (BDT) — BRTA rate
const BUS_FARE_PER_KM = 2.53;
const BUS_MIN_FARE = 10;

// ── Types ─────────────────────────────────────────────────────────────────────

export type EdgeMode = 'bus' | 'metro' | 'walk' | 'transfer' | 'train' | 'flight' | 'launch';

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
  type: 'bus_stop' | 'metro_station' | 'rail_station' | 'transfer_hub' | 'airport' | 'launch_terminal';
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
  tag: 'balanced' | 'fastest' | 'cheapest' | 'direct';
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

  // 3b. Add airport nodes (nationwide)
  for (const ap of AIRPORTS_DATA) {
    const id = `airport_${ap.iata.toLowerCase()}`;
    if (!nodes.has(id)) {
      nodes.set(id, {
        id, name: ap.en, bnName: ap.bn,
        lat: ap.lat, lng: ap.lng, type: 'airport',
      });
    }
  }

  // 3c. Add launch terminals
  for (const lt of LAUNCH_TERMINALS) {
    const id = `launch_${lt.id}`;
    if (!nodes.has(id)) {
      nodes.set(id, {
        id, name: lt.en, bnName: lt.bn,
        lat: lt.lat, lng: lt.lng, type: 'launch_terminal',
      });
    }
  }

  // 4. Bus route edges — consecutive stops (skip discontinued routes)
  for (const bus of BUS_DATA.filter(b => b.active !== false)) {
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

  // 4.6 Flight edges — domestic routes
  for (const route of DOMESTIC_ROUTES) {
    const fromId = `airport_${route.from.toLowerCase()}`;
    const toId = `airport_${route.to.toLowerCase()}`;
    const fromNode = nodes.get(fromId);
    const toNode = nodes.get(toId);
    if (!fromNode || !toNode) continue;

    // Parse duration e.g. "1h 5m" → minutes
    const durMatch = route.dur.match(/(\d+)h\s*(?:(\d+)m)?/);
    const timeMin = durMatch ? parseInt(durMatch[1]) * 60 + parseInt(durMatch[2] ?? '0') : 60;
    const costBDT = route.fareEco;

    addEdge(graph, fromId, { to: toId, mode: 'flight', timeMin, costBDT, routeId: route.id, routeName: route.flightNo });
    addEdge(graph, toId, { to: fromId, mode: 'flight', timeMin, costBDT, routeId: route.id, routeName: route.flightNo });
  }

  // 4.7 Launch/ferry edges
  // Build a set of unique routes (from→to), keep shortest duration per pair
  const launchPairs = new Map<string, { timeMin: number; costBDT: number; routeName: string }>();
  for (const lr of LAUNCH_ROUTES) {
    const fromId = `launch_${lr.from}`;
    const toId = `launch_${lr.to}`;
    const fromNode = nodes.get(fromId);
    const toNode = nodes.get(toId);
    if (!fromNode || !toNode) continue;

    const durMatch = lr.dur.match(/(\d+)h\s*(?:(\d+)m)?/);
    const timeMin = durMatch ? parseInt(durMatch[1]) * 60 + parseInt(durMatch[2] ?? '0') : 600;
    const costBDT = lr.deck; // deck fare as base cost
    const key = `${fromId}|${toId}`;
    const existing = launchPairs.get(key);
    if (!existing || timeMin < existing.timeMin) {
      launchPairs.set(key, { timeMin, costBDT, routeName: lr.name.en });
    }
  }
  for (const [key, val] of launchPairs) {
    const [fromId, toId] = key.split('|');
    addEdge(graph, fromId, { to: toId, mode: 'launch', timeMin: val.timeMin, costBDT: val.costBDT, routeName: val.routeName });
    addEdge(graph, toId, { to: fromId, mode: 'launch', timeMin: val.timeMin, costBDT: val.costBDT, routeName: val.routeName });
  }

  // 4.8 Intercity bus edges — district-to-district connections
  // Maps district names from INTERCITY_BUS_ROUTES to existing graph node IDs
  const DISTRICT_TO_NODE: Record<string, string> = {
    // Dhaka Division
    'Dhaka': 'kamalapur', 'Gazipur': 'joydebpur', 'Narayanganj': 'narayanganj',
    'Narsingdi': 'narsingdi', 'Manikganj': 'gabtoli', 'Munshiganj': 'muktarpur',
    'Tangail': 'tangail', 'Faridpur': 'faridpur', 'Gopalganj': 'kashiani',
    'Madaripur': 'madaripur', 'Rajbari': 'rajbari', 'Shariatpur': 'mawa',
    'Kishoreganj': 'kishoreganj',
    // Chattogram Division
    'Chattogram': 'chattogram', "Cox's Bazar": 'coxsbazar', 'Cumilla': 'comilla',
    'Brahmanbaria': 'brahmanbaria', 'Chandpur': 'chandpur', 'Feni': 'feni',
    'Noakhali': 'maijdi_court', 'Lakshmipur': 'chaumuhani',
    'Khagrachhari': 'chattogram', 'Rangamati': 'chattogram', 'Bandarban': 'chattogram',
    // Rajshahi Division
    'Rajshahi': 'rajshahi', 'Chapai Nawabganj': 'chapainawabganj', 'Natore': 'natore',
    'Naogaon': 'santahar', 'Pabna': 'paksey', 'Sirajganj': 'sirajganj',
    'Bogura': 'bogra', 'Joypurhat': 'akkelpur',
    // Khulna Division
    'Khulna': 'khulna', 'Jashore': 'jessore', 'Satkhira': 'satkhira',
    'Bagerhat': 'mongla', 'Narail': 'narail', 'Magura': 'magura',
    'Jhenaidah': 'jessore', 'Kushtia': 'kushtia_court', 'Chuadanga': 'chuadanga',
    'Meherpur': 'darshana',
    // Barishal Division
    'Barishal': 'barisal', 'Bhola': 'barisal', 'Jhalokathi': 'barisal',
    'Pirojpur': 'barisal', 'Patukhali': 'barisal', 'Barguna': 'barisal',
    // Sylhet Division
    'Sylhet': 'sylhet', 'Moulvibazar': 'moulvibazar', 'Habiganj': 'habiganj',
    'Sunamganj': 'sunamganj',
    // Rangpur Division
    'Rangpur': 'rangpur', 'Dinajpur': 'dinajpur', 'Thakurgaon': 'thakurgaon',
    'Panchagarh': 'panchagarh', 'Nilphamari': 'nilphamari', 'Kurigram': 'kurigram',
    'Lalmonirhat': 'lalmonirhat', 'Gaibandha': 'gaibandha',
    // Mymensingh Division
    'Mymensingh': 'mymensingh', 'Jamalpur': 'jamalpur', 'Sherpur': 'jamalpur',
    'Netrokona': 'netrokona',
    // Major hubs
    'Benapole': 'benapole', 'Sreemangal': 'srimangal', 'Bhairab': 'bhairab',
    'Teknaf': 'chattogram', 'Kuakata': 'barisal',
  };

  // Dhaka terminal name → STATIONS node id
  const DHAKA_TERMINAL_MAP: Record<string, string> = {
    'Gabtoli': 'gabtoli', 'Sayedabad': 'sayedabad', 'Mohakhali': 'mohakhali',
    'Gulistan': 'gulistan', 'Kamalapur': 'kamalapur',
  };

  const parseIntercityFare = (fareStr: string): number => {
    const nums = fareStr.replace(/[৳,]/g, '').match(/\d+/g);
    if (!nums) return 300;
    return parseInt(nums[0]);
  };

  // Parse Dhaka terminal from route string e.g. "Dhaka (Gabtoli) ⇄ Bogura"
  const parseDhakaTerminal = (route: string): string => {
    const m = route.match(/Dhaka \(([^)]+)\)/);
    if (m) return DHAKA_TERMINAL_MAP[m[1]] ?? 'kamalapur';
    return 'kamalapur';
  };

  const allIntercityRoutes = [...INTERCITY_BUS_ROUTES, ...MAJOR_TRANSPORT_HUBS];
  for (const r of allIntercityRoutes) {
    if (r.district === 'Dhaka' || r.costNonAC === '-') continue;
    const destNodeId = DISTRICT_TO_NODE[r.district];
    if (!destNodeId) continue;
    const destNode = nodes.get(destNodeId);
    if (!destNode) continue;

    const dhakaNodeId = parseDhakaTerminal(r.route);
    const dhakaNode = nodes.get(dhakaNodeId);
    if (!dhakaNode) continue;

    const fare = parseIntercityFare(r.costNonAC);
    // Estimate duration from straight-line distance at 60 km/h avg intercity
    const distM = haversineM(dhakaNode.lat, dhakaNode.lng, destNode.lat, destNode.lng);
    const timeMin = Math.round((distM / 1000 / 60) * 60 + 30); // +30 min for boarding/stops

    const operatorName = r.busOperators[0] ?? 'Intercity Bus';
    addEdge(graph, dhakaNodeId, {
      to: destNodeId, mode: 'bus', timeMin, costBDT: fare,
      routeName: operatorName, routeBnName: operatorName,
    });
    addEdge(graph, destNodeId, {
      to: dhakaNodeId, mode: 'bus', timeMin, costBDT: fare,
      routeName: operatorName, routeBnName: operatorName,
    });
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
      case 'flight':
        instruction = `✈️ Fly **${edge.routeName}** from ${fn} → ${tn} (৳${edge.costBDT})`;
        instructionBn = `✈️ **${edge.routeName}** ফ্লাইটে ${fn} থেকে ${tn} (৳${edge.costBDT})`;
        break;
      case 'launch':
        instruction = `⛴️ Take **${edge.routeName}** launch from ${fn} → ${tn}`;
        instructionBn = `⛴️ **${edge.routeName}** লঞ্চে ${fn} থেকে ${tn}`;
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
  const segCounts: number[] = [];
  for (const step of steps) {
    const prev = merged[merged.length - 1];
    const canMerge = prev &&
      prev.mode === step.mode &&
      prev.mode !== 'transfer' &&
      (prev.mode === 'walk' || prev.routeName === step.routeName);
    if (canMerge) {
      prev.toId = step.toId;
      prev.toName = step.toName;
      prev.toBnName = step.toBnName;
      prev.timeMin += step.timeMin;
      prev.costBDT += step.costBDT;
      if (prev.mode === 'walk') {
        const t = Math.round(prev.timeMin);
        prev.instruction = `🚶 Walk ${t} min from ${prev.fromName} to ${prev.toName}`;
        prev.instructionBn = `🚶 ${prev.fromBnName} থেকে ${prev.toBnName} পর্যন্ত হেঁটে যান (${t} মিনিট)`;
      } else {
        prev.instruction = prev.instruction.replace(/→.*/, `→ ${step.toName}`);
        prev.instructionBn = prev.instructionBn.replace(/→.*/, `→ ${step.toBnName}`);
      }
      segCounts[segCounts.length - 1]++;
    } else {
      merged.push({ ...step });
      segCounts.push(1);
    }
  }
  // Metro fare is zone-based (total stations apart), not a sum of per-segment fares
  for (let i = 0; i < merged.length; i++) {
    if (merged[i].mode === 'metro') {
      merged[i].costBDT = METRO_FARE_SCHEDULE[Math.min(segCounts[i], METRO_FARE_SCHEDULE.length - 1)];
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

  // 3. Cheapest — minimize cost; walking counted as ৳1.5/min to prevent absurd walk chains
  const cheapestWeight: WeightFn = (edge) =>
    edge.costBDT + (edge.mode === 'walk' ? edge.timeMin * 1.5 : 0) + edge.timeMin * 0.01;

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

  // Add ALL direct single-bus routes not already represented
  const directs = findAllDirectBuses(fromId, toId);
  for (const direct of directs) {
    const alreadyShown = results.some(r =>
      r.transfers === 0 && r.steps.some(s => s.routeName === direct.steps[0].routeName)
    );
    if (!alreadyShown) results.push(direct);
  }

  // Filter routes where total walking time exceeds 25 min (impractical for passengers)
  const practical = results.filter(r => {
    const walkMin = r.steps.filter(s => s.mode === 'walk').reduce((sum, s) => sum + s.timeMin, 0);
    return walkMin <= 25;
  });
  const finalRoutes = practical.length > 0 ? practical : results;

  // Deduplicate: remove routes that are identical (same steps sequence)
  const seen = new Set<string>();
  const unique = finalRoutes.filter(r => {
    const key = r.steps.map(s => `${s.fromId}-${s.mode}-${s.toId}`).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: direct (0 transfers) always first, then by score
  return unique.sort((a, b) => {
    if (a.transfers === 0 && b.transfers > 0) return -1;
    if (b.transfers === 0 && a.transfers > 0) return 1;
    return a.score - b.score;
  });
}

// ── Direct bus route finder — returns ALL buses serving this pair ─────────────

function findAllDirectBuses(fromId: string, toId: string): GraphRoute[] {
  const { nodes } = getGraph();
  const routes: GraphRoute[] = [];

  for (const bus of BUS_DATA.filter(b => b.active !== false)) {
    const fromIdx = bus.stops.indexOf(fromId);
    const toIdx = bus.stops.indexOf(toId);
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= toIdx) continue;

    let totalTime = 0;
    let totalCost = 0;
    for (let i = fromIdx; i < toIdx; i++) {
      const a = nodes.get(bus.stops[i]);
      const b2 = nodes.get(bus.stops[i + 1]);
      if (!a || !b2) continue;
      const distKm = haversineM(a.lat, a.lng, b2.lat, b2.lng) / 1000;
      totalTime += (distKm / BUS_AVG_KMH) * 60;
      totalCost += Math.max(BUS_MIN_FARE, Math.ceil(distKm * BUS_FARE_PER_KM));
    }
    if (totalTime === 0) continue;

    const fromNode = nodes.get(fromId);
    const toNode = nodes.get(toId);
    if (!fromNode || !toNode) continue;

    const roundedTime = Math.round(totalTime);
    const roundedCost = Math.round(totalCost);
    routes.push({
      steps: [{
        fromId, fromName: fromNode.name, fromBnName: fromNode.bnName,
        toId, toName: toNode.name, toBnName: toNode.bnName,
        mode: 'bus', timeMin: totalTime, costBDT: roundedCost,
        routeName: bus.name, routeBnName: bus.bnName,
        instruction: `🚌 Take **${bus.name}** from ${fromNode.name} → ${toNode.name}`,
        instructionBn: `🚌 **${bus.bnName || bus.name}** বাসে ${fromNode.bnName || fromNode.name} থেকে ${toNode.bnName || toNode.name}`,
      }],
      totalTimeMin: roundedTime,
      totalCostBDT: roundedCost,
      transfers: 0,
      score: roundedTime * SCORE_W_TIME + roundedCost * SCORE_W_COST,
      tag: 'direct',
    });
  }
  // Sort direct buses: fastest first
  return routes.sort((a, b) => a.totalTimeMin - b.totalTimeMin);
}

// ── Location resolver ─────────────────────────────────────────────────────────
// Converts free-text to the nearest graph node id

// Airport IATA codes → node id mapping (only IATA codes + explicit airport keywords)
// Do NOT include city names here — those should match train stations first
const AIRPORT_ALIASES: Record<string, string> = {
  'dac': 'airport_dac', 'shahjalal': 'airport_dac', 'hsia': 'airport_dac',
  'cgp': 'airport_cgp', 'shah amanat': 'airport_cgp',
  'cxb': 'airport_cxb',
  'osmani': 'airport_zyl', 'zyl': 'airport_zyl',
  'jsr': 'airport_jsr',
  'spd': 'airport_spd',
  'bzl': 'airport_bzl',
  'rjh': 'airport_rjh',
};

// Common spelling variant → canonical graph node ID
// These handle British/Bengali spelling differences that partial matching misses
const SPELLING_ALIASES: Record<string, string> = {
  // Barishal vs Barisal
  'barishal': 'barisal', 'বরিশাল': 'barisal',
  // Cox's Bazar — prefer train station over airport
  "cox's bazar": 'coxsbazar', 'coxs bazar': 'coxsbazar', 'cox bazar': 'coxsbazar',
  // Chattogram / Chittagong / Comilla / Cumilla
  'chittagong': 'chattogram', 'চট্টগ্রাম': 'chattogram',
  'cumilla': 'comilla', 'comilla': 'comilla',
  // Dhaka variants
  'dhaka': 'kamalapur', 'ঢাকা': 'kamalapur',
  // Jashore vs Jessore
  'jashore': 'jessore', 'যশোর': 'jessore',
  // Kushtia
  'kushtia': 'kushtia_court',
  // Nawabganj
  'chapainawabganj': 'chapainawabganj', 'chapai nawabganj': 'chapainawabganj',
};

// Launch terminal aliases for common name resolution
const LAUNCH_ALIASES: Record<string, string> = {
  'sadarghat': 'launch_sadarghat', 'সদরঘাট': 'launch_sadarghat',
  'barisal ghat': 'launch_barisal', 'barishal ghat': 'launch_barisal',
  'khulna ghat': 'launch_khulna',
  'chandpur ghat': 'launch_chandpur', 'চাঁদপুর': 'launch_chandpur',
};

// Node type priority for routing (higher = prefer when tie-breaking)
const NODE_TYPE_PRIORITY: Record<string, number> = {
  rail_station: 100, airport: 90, launch_terminal: 80,
  transfer_hub: 70, metro_station: 60, bus_stop: 10,
};

export function resolveLocation(query: string): string | null {
  const { nodes } = getGraph();
  const q = query.toLowerCase().trim();

  // Direct node id match
  if (nodes.has(q)) return q;

  // Spelling alias lookup (before everything — fixes Barishal/barisal, Cox's etc.)
  const aliasId = SPELLING_ALIASES[q];
  if (aliasId && nodes.has(aliasId)) return aliasId;

  // Handle "City (Station)" format — try the parenthetical content first
  const parenMatch = q.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inner = parenMatch[1].toLowerCase();
    if (nodes.has(inner)) return inner;
    for (const [id, node] of nodes) {
      if (node.name.toLowerCase().includes(inner)) return id;
    }
    // Also try without the parenthetical
    const outer = q.replace(/\s*\([^)]+\)/, '').trim();
    if (nodes.has(outer)) return outer;
  }

  // Launch alias lookup
  const launchId = LAUNCH_ALIASES[q] ?? LAUNCH_ALIASES[query];
  if (launchId && nodes.has(launchId)) return launchId;

  // Match by name — score by exact > startsWith > contains, break ties by node type priority
  let bestId: string | null = null;
  let bestScore = -1;

  for (const [id, node] of nodes) {
    const nameLower = node.name.toLowerCase();
    const bnMatch = node.bnName && node.bnName.includes(query);
    const typePriority = NODE_TYPE_PRIORITY[node.type] ?? 10;

    let score = 0;
    if (nameLower === q || node.bnName === query) score = 1000 + typePriority;
    else if (nameLower.startsWith(q)) score = 500 + typePriority;
    else if (nameLower.includes(q) || bnMatch) score = 100 + typePriority;

    if (score > bestScore) { bestScore = score; bestId = id; }
  }
  if (bestId && bestScore >= 100) return bestId;

  // Airport alias lookup — IATA codes and explicit airport names only
  const airportId = AIRPORT_ALIASES[q];
  if (airportId && nodes.has(airportId)) return airportId;

  // Fuzzy intercity → district match (fallback)
  const fuzzy = fuzzyMatchLocation(query);
  if (fuzzy) {
    const fLower = fuzzy.toLowerCase();
    let fBest: string | null = null;
    let fBestScore = -1;
    for (const [id, node] of nodes) {
      if (node.name.toLowerCase().includes(fLower)) {
        const s = NODE_TYPE_PRIORITY[node.type] ?? 10;
        if (s > fBestScore) { fBestScore = s; fBest = id; }
      }
    }
    if (fBest) return fBest;
  }

  // OSM extended search: find matching location → find nearest high-priority graph node
  const osmResults = searchLocationsSync(query, 5);
  for (const r of osmResults) {
    if (!r.lat || !r.lng) continue;
    // Find nearest TRANSPORT node (not just any bus stop) within 5km
    let nearestId: string | null = null;
    let nearestScore = -1;
    for (const [id, node] of nodes) {
      const typePriority = NODE_TYPE_PRIORITY[node.type] ?? 10;
      if (typePriority < 60) continue; // Skip plain bus stops for inter-city resolve
      const d = haversineM(r.lat, r.lng, node.lat, node.lng);
      if (d > 5000) continue; // 5km max
      const score = typePriority - d / 100; // closer + higher priority = better
      if (score > nearestScore) { nearestScore = score; nearestId = id; }
    }
    if (nearestId) return nearestId;
    // Fallback: accept any node within 2km
    let fallbackId: string | null = null;
    let fallbackDist = Infinity;
    for (const [id, node] of nodes) {
      const d = haversineM(r.lat, r.lng, node.lat, node.lng);
      if (d < 2000 && d < fallbackDist) { fallbackDist = d; fallbackId = id; }
    }
    if (fallbackId) return fallbackId;
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
  balanced: { en: 'Recommended Route',          bn: 'প্রস্তাবিত রুট',             emoji: '🏆' },
  fastest:  { en: 'Fastest Route',              bn: 'দ্রুততম রুট',               emoji: '⚡' },
  cheapest: { en: 'Budget Route',               bn: 'সাশ্রয়ী রুট',               emoji: '💸' },
  direct:   { en: 'Direct Bus (No Transfer)',   bn: 'সরাসরি বাস (বদলাতে হবে না)', emoji: '🚌' },
};

// Extract key journey points: origin, transfer hubs, destination
function keyJourneyPoints(steps: PathStep[]): string[] {
  const points: string[] = [];
  if (steps.length === 0) return points;
  points.push(steps[0].fromName);
  for (let i = 0; i < steps.length - 1; i++) {
    // Transfer point: where vehicle changes
    if (steps[i].mode !== steps[i + 1].mode ||
        (steps[i].routeName && steps[i + 1].routeName && steps[i].routeName !== steps[i + 1].routeName)) {
      points.push(steps[i].toName);
    }
  }
  points.push(steps[steps.length - 1].toName);
  return [...new Set(points)];
}

// Build reasoning text for each route
function routeReason(route: GraphRoute, isBn: boolean): string {
  const vehicles = [...new Set(route.steps.filter(s => s.mode === 'bus' || s.mode === 'metro' || s.mode === 'train').map(s => s.routeName || ''))].filter(Boolean);
  if (route.transfers === 0) {
    return isBn
      ? `সরাসরি ${vehicles[0] || 'বাস'} — কোনো বদল নেই, বোর্ড করুন এবং পৌঁছে নামুন।`
      : `Direct ${vehicles[0] || 'bus'} — board once, no changes needed.`;
  }
  if (route.transfers === 1) {
    const hub = route.steps.find((_, i) => i > 0 && route.steps[i - 1].routeName !== route.steps[i].routeName)?.fromName || '';
    return isBn
      ? `${hub ? hub + '-এ ' : ''}একবার বদল করতে হবে। স্থানীয় যাত্রীরা এই পথ বেশি ব্যবহার করেন।`
      : `One transfer${hub ? ` at ${hub}` : ''}. Common commuter route used by locals.`;
  }
  return isBn
    ? `${route.transfers}টি বদল প্রয়োজন। উপরের সরাসরি বিকল্প না থাকলে এটি ব্যবহার করুন।`
    : `${route.transfers} transfers needed. Use only when direct options above are unavailable.`;
}

export function formatRoutes(
  routes: GraphRoute[],
  fromName: string,
  toName: string,
  isBn: boolean,
): string {
  if (routes.length === 0) {
    return isBn
      ? `🤔 **${fromName} → ${toName}** এর জন্য কোনো রুট পাওয়া যায়নি। আরও নির্দিষ্ট স্টেশনের নাম দিন।`
      : `🤔 No route found from **${fromName}** to **${toName}**. Try a more specific station name.`;
  }

  const header = isBn
    ? `🗺️ **${fromName} → ${toName}**\n\n`
    : `🗺️ **${fromName} → ${toName}**\n\n`;

  const sections = routes.map((route) => {
    const label = TAG_LABELS[route.tag];
    const title = `${label.emoji} **${isBn ? label.bn : label.en}**`;

    // Key journey flow: Origin → Hub → Destination
    const keyPoints = keyJourneyPoints(route.steps);
    const flow = keyPoints.join(' → ');

    const summary = isBn
      ? `⏱️ ~${Math.round(route.totalTimeMin)} মিনিট | 💰 ৳${route.totalCostBDT} | 🔄 ${route.transfers === 0 ? 'সরাসরি' : route.transfers + ' বদল'}`
      : `⏱️ ~${Math.round(route.totalTimeMin)} min | 💰 ৳${route.totalCostBDT} | 🔄 ${route.transfers === 0 ? 'Direct' : route.transfers + ' transfer(s)'}`;

    // Human-readable steps — skip short walks < 3 min
    const steps = route.steps
      .filter(s => !(s.mode === 'walk' && s.timeMin < 3))
      .map(s => {
        if (s.mode === 'walk') return `  🚶 Walk ~${Math.round(s.timeMin)} min to **${s.toName}**`;
        if (s.mode === 'bus') return `  🚌 **${s.routeName}** — ${s.fromName} → ${s.toName}`;
        if (s.mode === 'metro') return `  🚇 **Metro MRT-6** ✅ — ${s.fromName} → ${s.toName} (৳${s.costBDT})`;
        if (s.mode === 'train') return `  🚂 **${s.routeName}** — ${s.fromName} → ${s.toName}`;
        if (s.mode === 'flight') return `  ✈️ **${s.routeName}** — ${s.fromName} → ${s.toName} (৳${s.costBDT})`;
        if (s.mode === 'launch') return `  ⛴️ **${s.routeName}** — ${s.fromName} → ${s.toName}`;
        return `  📍 ${s.fromName} → ${s.toName}`;
      });

    const reason = routeReason(route, isBn);

    // Confidence label
    const hasModes = route.steps.map(s => s.mode);
    const ds = hasModes.includes('metro') ? metroConfidence() : busRouteConfidence(route.steps[0]?.routeName);
    const dsLabel = confidenceBadge(ds, isBn);
    const fareNote = fareEstimateNote(isBn);

    return [title, `📍 ${flow}`, summary, ...steps, `💡 ${reason}`, `_${dsLabel} · ${fareNote}_`].join('\n');
  });

  // Peak-hour warning
  const hour = new Date().getHours();
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
  const peakNote = isPeak
    ? (isBn
        ? '\n\n⏰ **পিক আওয়ার:** ট্রাফিক জ্যাম আছে — বাসের সময় ১.৫-২x বেশি। মেট্রো সবচেয়ে দ্রুত।'
        : '\n\n⏰ **Peak hours:** Heavy traffic — bus times 1.5–2x longer. Metro is fastest option.')
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
