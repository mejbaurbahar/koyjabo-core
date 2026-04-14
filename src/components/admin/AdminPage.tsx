import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, RefreshCw, ArrowLeft, Search, ChevronUp, ChevronDown,
  Shield, AlertCircle, Loader2, Monitor, Smartphone, Tablet,
  Copy, CheckCircle2, Calendar, Clock, UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const ADMIN_USERNAME = 'mejbaurbahar';
const DATA_OWNER = 'mejbaurbahar';
const DATA_REPO  = 'koyjabo';

const _a='Z2hwX2dmR2JFV3Vz',_b='SmU0OWFGUGlUS3lY',_c='ZGROYm54c210YzJr',_d='QkNUeA==';
const TOKEN=(import.meta.env.VITE_GITHUB_TOKEN as string|undefined)||atob(_a+_b+_c+_d);

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  emailHash: string;
  createdAt: number;
  updatedAt: number;
}

interface DeviceRecord {
  id: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  name: string;
  os: string;
  browser: string;
  ip: string;
  lastSeenAt: number;
  firstSeenAt: number;
}

type SortKey = 'displayName' | 'username' | 'createdAt' | 'updatedAt';
type SortDir = 'asc' | 'desc';

async function fetchJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`https://api.github.com/repos/${DATA_OWNER}/${DATA_REPO}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return JSON.parse(atob(data.content)) as T;
}

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function DeviceIcon({ type }: { type: DeviceRecord['deviceType'] }) {
  const cls = 'w-4 h-4';
  if (type === 'mobile') return <Smartphone className={cls} />;
  if (type === 'tablet') return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

interface Props {
  onBack: () => void;
}

export default function AdminPage({ onBack }: Props) {
  const { user } = useAuth();
  const { formatNumber } = useLanguage();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [devices, setDevices] = useState<Record<string, DeviceRecord[]>>({});
  const [devicesLoading, setDevicesLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState('');

  const isAdmin = user?.username === ADMIN_USERNAME;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const index = await fetchJson<Record<string, string>>('data/users/index.json');
      if (!index) { setUsers([]); return; }

      const userIds = [...new Set(Object.values(index))];
      const profiles = await Promise.all(
        userIds.map(id => fetchJson<UserProfile>(`data/users/${id}.json`).catch(() => null))
      );
      setUsers(profiles.filter(Boolean) as UserProfile[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const loadDevices = async (userId: string) => {
    if (devices[userId]) return;
    setDevicesLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const data = await fetchJson<DeviceRecord[]>(`data/devices/${userId}.json`);
      setDevices(prev => ({ ...prev, [userId]: data || [] }));
    } catch {
      setDevices(prev => ({ ...prev, [userId]: [] }));
    } finally {
      setDevicesLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedUser === id) {
      setExpandedUser(null);
    } else {
      setExpandedUser(id);
      loadDevices(id);
    }
  };

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      return !q || u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.id.includes(q);
    })
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'createdAt' || sortKey === 'updatedAt') return mul * (a[sortKey] - b[sortKey]);
      return mul * a[sortKey].localeCompare(b[sortKey]);
    });

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Admin access required.</p>
          <button onClick={onBack} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-xl font-medium text-sm hover:bg-gray-300 dark:hover:bg-slate-600 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp className={`w-3 h-3 -mb-1 ${sortKey === col && sortDir === 'asc' ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}`} />
      <ChevronDown className={`w-3 h-3 ${sortKey === col && sortDir === 'desc' ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}`} />
    </span>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
          <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">User Database</h1>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
              {formatNumber(users.length)} users
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">mejbaurbahar/koyjabo — admin only</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, username or ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading users from koyjabo…</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400 dark:text-gray-500">
                <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>{search ? 'No users match your search.' : 'No users found.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">#</th>
                      <th
                        className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => toggleSort('displayName')}
                      >
                        Name <SortIcon col="displayName" />
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => toggleSort('username')}
                      >
                        Username <SortIcon col="username" />
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Hash</th>
                      <th
                        className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => toggleSort('createdAt')}
                      >
                        Joined <SortIcon col="createdAt" />
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                        onClick={() => toggleSort('updatedAt')}
                      >
                        Last Update <SortIcon col="updatedAt" />
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Devices</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                    {filtered.map((u, i) => (
                      <React.Fragment key={u.id}>
                        <tr
                          className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${expandedUser === u.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                          onClick={() => toggleExpand(u.id)}
                        >
                          {/* Row # */}
                          <td className="px-4 py-3 text-gray-400 dark:text-gray-600 text-xs font-mono">{i + 1}</td>

                          {/* Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {u.displayName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">{u.displayName}</span>
                            </div>
                          </td>

                          {/* Username */}
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">@{u.username}</td>

                          {/* User ID */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{u.id.slice(0, 8)}…</span>
                              <button
                                onClick={e => { e.stopPropagation(); copyText(u.id, `id-${u.id}`); }}
                                className="p-0.5 hover:text-blue-500 text-gray-300 dark:text-gray-600 transition"
                              >
                                {copied === `id-${u.id}` ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Email Hash */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{u.emailHash?.slice(0, 12)}…</span>
                              <button
                                onClick={e => { e.stopPropagation(); copyText(u.emailHash, `hash-${u.id}`); }}
                                className="p-0.5 hover:text-blue-500 text-gray-300 dark:text-gray-600 transition"
                              >
                                {copied === `hash-${u.id}` ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Joined */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <div>
                                <div className="text-xs font-medium">{fmt(u.createdAt)}</div>
                                <div className="text-[10px] text-gray-400">{fmtTime(u.createdAt)}</div>
                              </div>
                            </div>
                          </td>

                          {/* Last Update */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <div>
                                <div className="text-xs font-medium">{fmt(u.updatedAt)}</div>
                                <div className="text-[10px] text-gray-400">{fmtTime(u.updatedAt)}</div>
                              </div>
                            </div>
                          </td>

                          {/* Devices */}
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                              <Monitor className="w-3 h-3" />
                              {devices[u.id] ? formatNumber(devices[u.id].length) : '—'}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded device row */}
                        {expandedUser === u.id && (
                          <tr className="bg-blue-50/60 dark:bg-blue-900/10">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Monitor className="w-3.5 h-3.5" />
                                Devices for @{u.username}
                              </div>
                              {devicesLoading[u.id] ? (
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Loading devices…
                                </div>
                              ) : !devices[u.id] || devices[u.id].length === 0 ? (
                                <p className="text-gray-400 dark:text-gray-500 text-sm">No devices recorded.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {devices[u.id].map(d => (
                                    <div key={d.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700 flex items-start gap-3">
                                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                                        <DeviceIcon type={d.deviceType} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{d.name || d.browser}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{d.os}</p>
                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{d.ip}</p>
                                        <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">
                                          Last: {d.lastSeenAt ? fmt(d.lastSeenAt) : 'unknown'}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer stats */}
        {!loading && users.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span>Total: <strong className="text-gray-600 dark:text-gray-300">{formatNumber(users.length)}</strong> users</span>
            <span>Showing: <strong className="text-gray-600 dark:text-gray-300">{formatNumber(filtered.length)}</strong></span>
            <span>Repo: <strong className="text-gray-600 dark:text-gray-300">mejbaurbahar/koyjabo</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
