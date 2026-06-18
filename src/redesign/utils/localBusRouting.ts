import { BUS_DATA, STATIONS } from '../../../constants';
import type { BusRoute } from '../../../types';
import type { Suggestion } from '../components/SuggestionDropdown';

export type TransitLeg =
  | { kind: 'walk'; from: string; to: string; distanceKm: number; durationMin: number }
  | { kind: 'bus'; from: string; to: string; bus: BusRoute; distanceKm: number; durationMin: number; fare: number };

export interface TransitRouteOption {
  id: string;
  title: string;
  totalFare: number;
  totalDuration: number;
  totalDistance: number;
  transfers: number;
  legs: TransitLeg[];
}

export function normalizePlace(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9\u0980-\u09ff]+/g, '');
}

export function stopLabelFromId(id: string) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function buildLocalBusLocationSuggestions(): Suggestion[] {
  const map = new Map<string, Suggestion>();
  Object.values(STATIONS).forEach(s => map.set(normalizePlace(s.name), { id: s.id, label: s.name, sub: s.bnName }));
  BUS_DATA.forEach(bus => {
    bus.routeString.split(/[⇄→-]/).map(part => part.trim()).filter(Boolean).forEach(part => {
      const key = normalizePlace(part);
      if (!map.has(key)) map.set(key, { id: key || part, label: part, sub: bus.name });
    });
    bus.stops.forEach(stopId => {
      const station = STATIONS[stopId];
      const label = station?.name ?? stopLabelFromId(stopId);
      const key = normalizePlace(label);
      if (!map.has(key)) map.set(key, { id: stopId, label, sub: station?.bnName ?? bus.name });
    });
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }));
}

export function resolveLocationKey(value: string, suggestions: Suggestion[]) {
  const key = normalizePlace(value);
  if (!key) return '';
  const exact = suggestions.find(s =>
    normalizePlace(s.id) === key ||
    normalizePlace(s.label) === key ||
    normalizePlace(s.sub ?? '') === key
  );
  return exact?.id ?? key;
}

export function isSameLocationValue(from: string, to: string, suggestions: Suggestion[]) {
  const fromKey = resolveLocationKey(from, suggestions);
  const toKey = resolveLocationKey(to, suggestions);
  return Boolean(fromKey && toKey && fromKey === toKey);
}

export function matchesBusStation(route: BusRoute, query: string) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const qNorm = normalizePlace(query);
  return route.routeString.toLowerCase().includes(q) ||
    route.name.toLowerCase().includes(q) ||
    route.bnName.includes(query) ||
    route.stops.some(stopId => {
      const station = STATIONS[stopId];
      return normalizePlace(stopId).includes(qNorm) ||
        normalizePlace(station?.name ?? stopLabelFromId(stopId)).includes(qNorm) ||
        normalizePlace(station?.bnName ?? '').includes(qNorm);
    });
}

export function resolveStationId(value: string) {
  const key = normalizePlace(value);
  if (!key) return '';

  const exact = Object.values(STATIONS).find(s =>
    normalizePlace(s.id) === key ||
    normalizePlace(s.name) === key ||
    normalizePlace(s.bnName ?? '') === key
  );
  if (exact) return exact.id;

  const partial = Object.values(STATIONS).find(s =>
    normalizePlace(s.name).includes(key) ||
    key.includes(normalizePlace(s.name)) ||
    normalizePlace(s.bnName ?? '').includes(key)
  );
  return partial?.id ?? '';
}

const activeBuses = BUS_DATA.filter(bus => bus.active !== false);
const busesByStop = new Map<string, BusRoute[]>();
activeBuses.forEach(bus => {
  bus.stops.forEach(stopId => {
    if (!busesByStop.has(stopId)) busesByStop.set(stopId, []);
    busesByStop.get(stopId)!.push(bus);
  });
});
const busStopIds = Array.from(busesByStop.keys()).filter(stopId => Boolean(STATIONS[stopId]));

function distanceKm(aId: string, bId: string) {
  const a = STATIONS[aId];
  const b = STATIONS[bId];
  if (!a || !b) return 0;
  const radius = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function labelOf(stopId: string) {
  return STATIONS[stopId]?.name ?? stopLabelFromId(stopId);
}

function nearestBusStops(stationId: string, limit = 8, maxKm = 3) {
  if (!STATIONS[stationId]) return [];
  return busStopIds
    .map(stopId => ({ stopId, walkKm: distanceKm(stationId, stopId) }))
    .filter(item => item.walkKm <= maxKm)
    .sort((a, b) => a.walkKm - b.walkKm)
    .slice(0, limit);
}

function busesBetween(fromStopId: string, toStopId: string) {
  const fromBuses = busesByStop.get(fromStopId) ?? [];
  return fromBuses.filter(bus => bus.stops.includes(toStopId));
}

function segmentDistanceKm(bus: BusRoute, fromStopId: string, toStopId: string) {
  const fromIdx = bus.stops.indexOf(fromStopId);
  const toIdx = bus.stops.indexOf(toStopId);
  if (fromIdx === -1 || toIdx === -1) return 0;
  const start = Math.min(fromIdx, toIdx);
  const end = Math.max(fromIdx, toIdx);
  let distance = 0;
  for (let i = start; i < end; i += 1) {
    const a = bus.stops[i];
    const b = bus.stops[i + 1];
    distance += STATIONS[a] && STATIONS[b] ? distanceKm(a, b) : 1.2;
  }
  return Math.max(distance, Math.abs(toIdx - fromIdx) * 0.8);
}

function busFare(bus: BusRoute, distance: number) {
  const rate = bus.type === 'AC' ? 5 : bus.type === 'Double-Decker' ? 3.2 : 2.53;
  return Math.max(bus.type === 'AC' ? 40 : 10, Math.ceil(distance * rate));
}

function busTime(distance: number) {
  return Math.max(8, Math.round((distance / 15) * 60));
}

function walkLeg(fromId: string, toId: string): TransitLeg | null {
  if (fromId === toId) return null;
  const distance = distanceKm(fromId, toId);
  if (!distance) return null;
  return { kind: 'walk', from: labelOf(fromId), to: labelOf(toId), distanceKm: distance, durationMin: Math.max(2, Math.round((distance / 5) * 60)) };
}

function busLeg(bus: BusRoute, fromId: string, toId: string): TransitLeg {
  const distance = segmentDistanceKm(bus, fromId, toId);
  return { kind: 'bus', from: labelOf(fromId), to: labelOf(toId), bus, distanceKm: distance, durationMin: busTime(distance), fare: busFare(bus, distance) };
}

function packRoute(id: string, title: string, legs: TransitLeg[], transfers: number): TransitRouteOption {
  return {
    id,
    title,
    legs,
    transfers,
    totalFare: legs.reduce((sum, leg) => sum + (leg.kind === 'bus' ? leg.fare : 0), 0),
    totalDuration: legs.reduce((sum, leg) => sum + leg.durationMin, 0) + transfers * 5,
    totalDistance: legs.reduce((sum, leg) => sum + leg.distanceKm, 0),
  };
}

export function planLocalBusTransit(fromValue: string, toValue: string, maxRoutes = 4): TransitRouteOption[] {
  const fromId = resolveStationId(fromValue);
  const toId = resolveStationId(toValue);
  if (!fromId || !toId || fromId === toId) return [];

  const startStops = nearestBusStops(fromId, 10, 3.2);
  const endStops = nearestBusStops(toId, 10, 3.2);
  const routes: TransitRouteOption[] = [];
  const seen = new Set<string>();

  startStops.forEach(start => {
    endStops.forEach(end => {
      busesBetween(start.stopId, end.stopId).forEach(bus => {
        const legs = [
          walkLeg(fromId, start.stopId),
          busLeg(bus, start.stopId, end.stopId),
          walkLeg(end.stopId, toId),
        ].filter((leg): leg is TransitLeg => Boolean(leg));
        const key = `direct-${bus.id}-${start.stopId}-${end.stopId}`;
        if (!seen.has(key)) {
          seen.add(key);
          routes.push(packRoute(key, start.stopId === fromId && end.stopId === toId ? 'Direct bus' : 'Walk + bus', legs, 0));
        }
      });
    });
  });

  if (routes.length < maxRoutes) {
    startStops.forEach(start => {
      endStops.forEach(end => {
        const firstLegBuses = busesByStop.get(start.stopId) ?? [];
        const secondLegBuses = busesByStop.get(end.stopId) ?? [];
        firstLegBuses.forEach(firstBus => {
          secondLegBuses.forEach(secondBus => {
            if (firstBus.id === secondBus.id) return;
            const transferStops = firstBus.stops
              .filter(stopId => secondBus.stops.includes(stopId) && STATIONS[stopId])
              .slice(0, 6);
            transferStops.forEach(transferStop => {
              const key = `transfer-${firstBus.id}-${secondBus.id}-${start.stopId}-${transferStop}-${end.stopId}`;
              if (seen.has(key)) return;
              seen.add(key);
              const legs = [
                walkLeg(fromId, start.stopId),
                busLeg(firstBus, start.stopId, transferStop),
                busLeg(secondBus, transferStop, end.stopId),
                walkLeg(end.stopId, toId),
              ].filter((leg): leg is TransitLeg => Boolean(leg));
              routes.push(packRoute(key, `Via ${labelOf(transferStop)}`, legs, 1));
            });
          });
        });
      });
    });
  }

  return routes
    .filter(route => route.legs.some(leg => leg.kind === 'bus'))
    .sort((a, b) => a.totalDuration - b.totalDuration || a.totalFare - b.totalFare)
    .slice(0, maxRoutes);
}
