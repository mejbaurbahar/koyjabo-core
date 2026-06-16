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
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-kj-bg overflow-hidden">

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line shrink-0 flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="font-bengali font-bold text-base text-kj-text truncate">
            {lbl('Live Tracking', 'লাইভ ট্র্যাকিং')}
          </span>
          <span
            className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold text-kj-primary-ink"
            style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}
          >
            {busName}
          </span>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center hover:border-kj-primary/40 hover:text-kj-primary transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 text-kj-primary-ink text-xs font-bold rounded-xl shrink-0 transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px -4px rgba(16,185,129,0.5)' }}
        >
          <span className="hidden xs:inline">{t('community.reportNow')}</span>
          <Radio className="w-4 h-4 xs:hidden" />
        </button>
      </div>

      {/* Live status bar */}
      <div
        className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 border-b border-kj-line"
        style={{ background: 'rgba(0,245,255,0.05)' }}
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-xs font-semibold text-kj-primary">
          {lbl('Live location', 'লাইভ অবস্থান')}
        </span>
        <span className="text-xs text-kj-text-dim">
          · {t('community.reportsCount', { count: formatNumber(reports.length) })}
        </span>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-4 space-y-3 pb-6"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >

        {/* Latest location highlight */}
        {latest && (
          <div
            className="rounded-2xl p-4 border border-green-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.04) 100%)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-green-400 mb-2">{t('community.latestLocation')}</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="font-bold text-kj-text">{latest.stopName}</p>
                <p className="text-xs text-kj-text-dim mt-0.5">
                  {latest.heading ? `${t('community.headingTowards', { heading: latest.heading })} · ` : ''}{timeAgo(latest.timestamp, t, formatNumber)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Report form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-4 border border-kj-line space-y-3"
            style={{ background: 'var(--kj-panel)' }}
          >
            <h3 className="font-bold text-kj-text text-sm">{t('community.shareBusLocation')}</h3>
            {stops.length > 0 ? (
              <select
                value={stopId}
                onChange={e => setStopId(e.target.value)}
                className="w-full bg-kj-input-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text focus:outline-none focus:border-kj-primary/50"
              >
                <option value="">{t('community.pickStop')}</option>
                {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            ) : (
              <input
                value={stopName}
                onChange={e => setStopName(e.target.value)}
                placeholder={t('community.typeStopName')}
                className="w-full bg-kj-input-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text focus:outline-none focus:border-kj-primary/50"
                required
              />
            )}
            <select
              value={heading}
              onChange={e => setHeading(e.target.value)}
              className="w-full bg-kj-input-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text focus:outline-none focus:border-kj-primary/50"
            >
              <option value="">{t('community.pickDirectionOptional')}</option>
              {HEADING_OPTS.map(h => <option key={h} value={h}>{t('community.headingTowards', { heading: h })}</option>)}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 text-white font-semibold text-sm rounded-xl disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                {submitting ? t('community.submitting') : t('community.submit')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-kj-chip-bg text-kj-text-dim font-semibold text-sm rounded-xl"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-kj-text-faint">{t('common.loading')}</div>
        )}

        {/* Empty state */}
        {!loading && reports.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.12)' }}
            >
              <Navigation className="w-7 h-7 text-kj-text-faint" />
            </div>
            <p className="text-kj-text-dim font-medium">{t('community.noLiveReports')}</p>
            <p className="text-sm text-kj-text-faint mt-1">{t('community.promptReportIfSeen')}</p>
          </div>
        )}

        {/* Report list */}
        {reports.slice().reverse().map((r, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 border border-kj-line transition-colors hover:border-kj-primary/20"
            style={{ background: 'var(--kj-panel)' }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-kj-text text-sm">{r.stopName}</p>
                  {r.heading && <p className="text-xs text-kj-text-dim mt-0.5">{t('community.headingTowards', { heading: r.heading })}</p>}
                </div>
              </div>
              <span className="text-xs text-kj-text-faint shrink-0 mt-0.5">{timeAgo(r.timestamp, t, formatNumber)}</span>
            </div>
          </div>
        ))}

        <div className="h-4" />
      </div>
    </div>
  );
}
