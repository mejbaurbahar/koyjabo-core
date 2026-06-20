const KEY = 'kj_coins';

interface Tx { type: 'earn' | 'spend'; amount: number; reason: string; ts: number; }
interface State { balance: number; adFreeUntil: number; transactions: Tx[]; lastDailyBonus: string; claimedBonuses: string[]; }

function load(): State {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) return s; } catch {}
  return { balance: 0, adFreeUntil: 0, transactions: [], lastDailyBonus: '', claimedBonuses: [] };
}

function save(s: State) {
  if (s.transactions.length > 100) s.transactions = s.transactions.slice(-100);
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getBalance(): number { return load().balance; }
export function isAdFree(): boolean { return load().adFreeUntil > Date.now(); }
export function getAdFreeUntil(): number { return load().adFreeUntil; }
export function getTransactions(): Tx[] { return load().transactions.slice().reverse(); }

export function earnCoins(amount: number, reason: string) {
  const s = load();
  s.balance += amount;
  s.transactions.push({ type: 'earn', amount, reason, ts: Date.now() });
  save(s);
}

export function activateAdFree(hours: number, cost: number): boolean {
  const s = load();
  if (s.balance < cost) return false;
  s.balance -= cost;
  const base = Math.max(s.adFreeUntil, Date.now());
  s.adFreeUntil = base + hours * 3600 * 1000;
  s.transactions.push({ type: 'spend', amount: cost, reason: `Ad-free ${hours}h`, ts: Date.now() });
  save(s);
  return true;
}

export function claimOneTimeBonus(id: string, amount: number, reason: string): boolean {
  const s = load();
  if (!s.claimedBonuses) s.claimedBonuses = [];
  if (s.claimedBonuses.includes(id)) return false;
  s.balance += amount;
  s.claimedBonuses.push(id);
  s.transactions.push({ type: 'earn', amount, reason, ts: Date.now() });
  save(s);
  return true;
}

export function isOneTimeClaimed(id: string): boolean {
  const s = load();
  return (s.claimedBonuses || []).includes(id);
}

export function claimDailyBonus(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const s = load();
  if (s.lastDailyBonus === today) return false;
  s.balance += 10;
  s.lastDailyBonus = today;
  s.transactions.push({ type: 'earn', amount: 10, reason: 'Daily bonus', ts: Date.now() });
  save(s);
  return true;
}
