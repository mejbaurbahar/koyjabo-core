import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Navigation, RefreshCw, Radio } from 'lucide-react';
import { getBusLiveLocation, reportBusLocation, BusLocationReport, getAuthUser } from '../services/communityDataService';
import { trackFeatureUsage } from '../services/analyticsService';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface Props {
  busId: string;
  busName: string;
  stops?: { id: string; name: string }[];
  onBack: () => void;
}

function timeAgo(ts: number, t: (key: string, params?: Record<string, string | number>) => string, formatNumber: (n: number | string) => string): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return t('history.justNow');
  if (diff < 60) return `${formatNumber(diff)} ${t('history.minutesAgo')}`;
  return `${formatNumber(Math.floor(diff / 60))} ${t('history.hoursAgo')}`;
}

const HEADING_OPTS = ['উত্তর', 'দক্ষিণ', 'পূর্ব', 'পশ্চিম'];

export default function BusLiveTracking({ busId, busName, stops = [], onBack }: Props) {
  const user = getAuthUser();
  const { t, language, formatNumber } = useLanguage();
  const { showToast } = useToast();
  const [reports, setReports] = useState<BusLocationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stopId, setStopId] = useState('');
  const [stopName, setStopName] = useState('');
  const [heading, setHeading] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { trackFeatureUsage('bus_live_tracking'); }, []);

  const load = async () => {
    const data = await getBusLiveLocation(busId);
    setReports(data?.reports ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [busId]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sName = stopId ? (stops.find(s => s.id === stopId)?.name ?? stopName) : stopName;
    if (!sName.trim()) return;
    setSubmitting(true);
    await reportBusLocation(busId, busName, stopId || crypto.randomUUID(), sName, heading || undefined);
    await load();
    setShowForm(false);
    setStopId(''); setStopName(''); setHeading('');
    setSubmitting(false);
    showToast(t('community.locationReported'), 'success');
  };

  const latest = reports[reports.length - 1];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('community.liveLocationTitle')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{busName} · {t('community.reportsCount', { count: formatNumber(reports.length) })}</p>
        </div>
        <button onClick={refresh} disabled={refreshing} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl">
          {t('community.reportNow')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {latest && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">{t('community.latestLocation')}</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <p className="font-bold text-green-900 dark:text-green-200">{latest.stopName}</p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  {latest.heading ? `${t('community.headingTowards', { heading: latest.heading })} · ` : ''}{timeAgo(latest.timestamp, t, formatNumber)}
                </p>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t('community.shareBusLocation')}</h3>
            {stops.length > 0 ? (
              <select value={stopId} onChange={e => setStopId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white">
                <option value="">{t('community.pickStop')}</option>
                {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            ) : (
              <input value={stopName} onChange={e => setStopName(e.target.value)}
                placeholder={t('community.typeStopName')}
                className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" required />
            )}
            <select value={heading} onChange={e => setHeading(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white">
              <option value="">{t('community.pickDirectionOptional')}</option>
              {HEADING_OPTS.map(h => <option key={h} value={h}>{t('community.headingTowards', { heading: h })}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl">
                {submitting ? t('community.submitting') : t('community.submit')}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl">{t('common.cancel')}</button>
            </div>
          </form>
        )}

        {loading && <div className="text-center py-10 text-gray-400">{t('common.loading')}</div>}

        {!loading && reports.length === 0 && !showForm && (
          <div className="text-center py-12">
            <Navigation className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('community.noLiveReports')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('community.promptReportIfSeen')}</p>
          </div>
        )}

        {reports.slice().reverse().map((r, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.stopName}</p>
                  {r.heading && <p className="text-xs text-gray-500 dark:text-gray-400">{t('community.headingTowards', { heading: r.heading })}</p>}
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{timeAgo(r.timestamp, t, formatNumber)}</span>
            </div>
          </div>
        ))}
        <div className="h-4" />
      </div>
    </div>
  );
}
