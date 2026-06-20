/**
 * useLocationSearch — Universal Bangladesh location search hook
 * Searches across:
 *   1. Local STATIONS (729 Dhaka bus stops) — synchronous, always fast
 *   2. TRAIN_STATIONS (139 nationwide railway) — synchronous
 *   3. OSM extended database (14,642 locations) — async, lazy loaded
 *
 * Returns merged, deduplicated suggestions ranked by relevance.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { STATIONS } from '../constants';
import { TRAIN_STATIONS } from '../data/bangladeshTrainData';
import { LAUNCH_TERMINALS } from '../data/bangladeshLaunchData';
import { AIRPORTS_DATA } from '../data/bangladeshFlightData';
import { searchLocationsSync, preloadLocations, type LocationResult } from '../services/locationSearchService';

export interface LocationSuggestion {
  id: string;
  label: string;
  sub: string;
  lat?: number;
  lng?: number;
  category: string;
}

// ── Static lookup tables (built once) ────────────────────────────────────────

let _staticList: LocationSuggestion[] | null = null;

function getStaticLocations(): LocationSuggestion[] {
  if (_staticList) return _staticList;

  const list: LocationSuggestion[] = [];
  const seen = new Set<string>();

  // Bus stops (Dhaka — highest priority for local bus page)
  for (const s of Object.values(STATIONS)) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    list.push({ id: s.id, label: s.name, sub: s.bnName || '', lat: s.lat, lng: s.lng, category: 'bus_stop' });
  }

  // Nationwide train stations
  // Use 'rail_' prefix when id conflicts with a bus stop (e.g. 'kamalapur')
  for (const [id, t] of Object.entries(TRAIN_STATIONS)) {
    const safeId = seen.has(id) ? `rail_${id}` : id;
    if (seen.has(safeId)) continue;
    seen.add(safeId);
    list.push({ id: safeId, label: t.name, sub: t.bnName || '', lat: t.lat, lng: t.lng, category: 'railway_station' });
  }

  // Launch terminals
  for (const lt of LAUNCH_TERMINALS) {
    const id = `launch_${lt.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    list.push({ id, label: lt.en, sub: lt.bn || '', lat: lt.lat, lng: lt.lng, category: 'ferry_terminal' });
  }

  // Airports
  for (const ap of AIRPORTS_DATA) {
    const id = `airport_${ap.iata.toLowerCase()}`;
    if (seen.has(id)) continue;
    seen.add(id);
    list.push({ id, label: ap.en, sub: ap.bn || '', lat: ap.lat, lng: ap.lng, category: 'airport' });
  }

  _staticList = list;
  return list;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseLocationSearchOptions {
  limit?: number;
  categories?: string[]; // filter by category, e.g. ['railway_station']
  includeOSM?: boolean;  // include extended OSM data (default: true)
}

export function useLocationSearch(
  query: string,
  options: UseLocationSearchOptions = {}
): { suggestions: LocationSuggestion[]; loading: boolean } {
  const { limit = 20, categories, includeOSM = true } = options;
  const [osmResults, setOsmResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload OSM data in background
  useEffect(() => {
    if (includeOSM) preloadLocations();
  }, [includeOSM]);

  // Debounced OSM search
  useEffect(() => {
    if (!includeOSM || !query.trim()) {
      setOsmResults([]);
      setLoading(false);
      return;
    }

    // Try synchronous first (if already loaded)
    const syncResults = searchLocationsSync(query, limit);
    if (syncResults.length > 0) {
      setOsmResults(syncResults);
      setLoading(false);
      return;
    }

    // Otherwise debounce for async load
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const { searchLocations } = await import('../services/locationSearchService');
        const results = await searchLocations(query, limit);
        setOsmResults(results);
      } catch {
        setOsmResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, limit, includeOSM]);

  const suggestions = useCallback(() => {
    const q = query.toLowerCase().trim();
    const staticList = getStaticLocations();

    if (!q) {
      // No query — return items of the right category (or popular defaults if no filter)
      if (categories) {
        return staticList.filter(s => categories.includes(s.category)).slice(0, limit);
      }
      return staticList.slice(0, limit);
    }

    // Search static list
    const staticMatches = staticList.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.sub.toLowerCase().includes(q) ||
      s.sub.includes(query)
    );

    // Deduplicate OSM results by normalized name to avoid showing same place twice
    const norm = (s: string) => s.toLowerCase().replace(/[\s\-\.,'()]+/g, '');
    const seenNames = new Set<string>(staticMatches.map(s => norm(s.label)));
    const staticIds = new Set(staticMatches.map(s => s.id));

    const osmMapped: LocationSuggestion[] = osmResults
      .filter(r => {
        if (!r.name || staticIds.has(r.id)) return false;
        const n = norm(r.name);
        if (seenNames.has(n)) return false;
        seenNames.add(n);
        return true;
      })
      .map(r => ({
        id: r.id,
        label: r.name,
        sub: r.bnName || r.category,
        lat: r.lat ?? undefined,
        lng: r.lng ?? undefined,
        category: r.category,
      }));

    const merged = [...staticMatches, ...osmMapped];
    const filtered = categories ? merged.filter(s => categories.includes(s.category)) : merged;
    return filtered.slice(0, limit);
  }, [query, osmResults, limit, categories]);

  return { suggestions: suggestions(), loading };
}

// Convenience: plain function for non-React contexts
export function searchAllLocations(query: string, limit = 20): LocationSuggestion[] {
  const staticList = getStaticLocations();
  if (!query.trim()) return staticList.slice(0, limit);

  const q = query.toLowerCase().trim();
  const norm = (s: string) => s.toLowerCase().replace(/[\s\-\.,'()]+/g, '');
  const staticMatches = staticList.filter(s =>
    s.label.toLowerCase().includes(q) ||
    s.sub.toLowerCase().includes(q)
  );

  const seenNames = new Set<string>(staticMatches.map(s => norm(s.label)));
  const staticIds = new Set(staticMatches.map(s => s.id));

  const osmSync = searchLocationsSync(query, limit)
    .filter(r => {
      if (!r.name || staticIds.has(r.id)) return false;
      const n = norm(r.name);
      if (seenNames.has(n)) return false;
      seenNames.add(n);
      return true;
    })
    .map(r => ({ id: r.id, label: r.name, sub: r.bnName || r.category, lat: r.lat ?? undefined, lng: r.lng ?? undefined, category: r.category }));

  return [...staticMatches, ...osmSync].slice(0, limit);
}
