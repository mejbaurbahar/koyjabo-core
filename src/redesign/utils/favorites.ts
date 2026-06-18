export const BUS_FAVORITES_KEY = 'koyjabo_favorite_buses';

export function getFavoriteBusIds(): string[] {
  try {
    const raw = localStorage.getItem(BUS_FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function setFavoriteBusIds(ids: string[]): void {
  try {
    localStorage.setItem(BUS_FAVORITES_KEY, JSON.stringify(Array.from(new Set(ids))));
    window.dispatchEvent(new Event('koyjabo:favorites-changed'));
  } catch {
    // localStorage can be unavailable in private browsing.
  }
}

export function toggleFavoriteBus(busId: string): string[] {
  const current = getFavoriteBusIds();
  const next = current.includes(busId) ? current.filter(id => id !== busId) : [...current, busId];
  setFavoriteBusIds(next);
  return next;
}
