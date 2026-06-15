import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Clock, ChevronDown, ChevronUp, Plus, ExternalLink, Map, Flag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { submitTrafficReport, getTodayTrafficReports, upvoteTrafficReport, TrafficReport, getAuthUser } from '../services/communityDataService';
import { trackFeatureUsage } from '../services/analyticsService';
import SponsoredAdSlot from './SponsoredAdSlot';



interface Props {
  onBack: () => void;
}

interface AdminAlert {
  id: string;
  titleBn: string;
  titleEn: string;
  descriptionBn?: string;
  descriptionEn?: string;
  url?: string;
  source?: string;
  timestamp: number;
  icon: string;
}

const ADMIN_ALERTS: AdminAlert[] = [
  {
    id: 'fare-notice-diesel-2025',
    titleBn: 'ডিজেল চালিত বাস ও মিনিবাসের সর্বোচ্চ ভাড়া নির্ধারণ সংক্রান্ত প্রজ্ঞাপন',
    titleEn: 'Official notification on maximum fare for diesel-powered buses and minibuses',
    descriptionBn: 'সড়ক পরিবহন ও মহাসড়ক বিভাগ (RTHD) কর্তৃক জারিকৃত সর্বোচ্চ বাস ভাড়া সংক্রান্ত সরকারি প্রজ্ঞাপন।',
    descriptionEn: 'Official government notification issued by the Road Transport and Highways Division (RTHD) regarding maximum bus fares.',
    url: 'https://rthd.gov.bd/pages/notices/%E0%A6%A1%E0%A6%BF%E0%A6%9C%E0%A7%87%E0%A6%B2-%E0%A6%9A%E0%A6%BE%E0%A6%B2%E0%A6%BF%E0%A6%A4-%E0%A6%AC%E0%A6%BE%E0%A6%B8-%E0%A6%93-%E0%A6%AE%E0%A6%BF%E0%A6%A8%E0%A6%BF%E0%A6%AC%E0%A6%BE%E0%A6%B8%E0%A7%87%E0%A6%B0-%E0%A6%B8%E0%A6%B0%E0%A7%8D%E0%A6%AC%E0%A7%8B%E0%A6%9A%E0%A7%8D%E0%A6%9A-%E0%A6%AD%E0%A6%BE%E0%A6%A1%E0%A6%BC%E0%A6%BE-%E0%A6%A8%E0%A6%BF%E0%A6%B0%E0%A7%8D%E0%A6%A7%E0%A6%BE%E0%A6%B0%E0%A6%A3-%E0%A6%B8%E0%A6%82%E0%A6%95%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%A4-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%9C%E0%A7%8D%E0%A6%9E%E0%A6%BE%E0%A6%AA%E0%A6%A8-rdici2-69ea0138fec635b1a07ad32b',
    source: 'rthd.gov.bd',
    timestamp: Date.now(),
    icon: '📋',
  },
];

type AlertType = { value: TrafficReport['type']; icon: string; color: string };

const ALERT_TYPES: AlertType[] = [
  { value: 'heavy_traffic', icon: '🚦', color: 'text-red-500' },
  { value: 'accident', icon: '🚨', color: 'text-red-600' },
  { value: 'road_block', icon: '🚧', color: 'text-amber-500' },
  { value: 'bus_delayed', icon: '🚌', color: 'text-amber-400' },
  { value: 'bus_cancelled', icon: '❌', color: 'text-red-500' },
];

const FILTER_CHIPS = [
  { key: 'all', labelEn: 'All', labelBn: 'সব' },
  { key: 'heavy_traffic', labelEn: 'Traffic', labelBn: 'যানজট' },
  { key: 'road_block', labelEn: 'Roadblock', labelBn: 'বাধা' },
  { key: 'accident', labelEn: 'Accident', labelBn: 'দুর্ঘটনা' },
  { key: 'bus_delayed', labelEn: 'Bus Delay', labelBn: 'বাস বিলম্ব' },
  { key: 'bus_cancelled', labelEn: 'Cancelled', labelBn: 'বাতিল' },
];

function timeAgo(ts: number, t: (key: string) => string): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return t('roadAlerts.justNow');
  if (diff < 60) return `${diff}${t('roadAlerts.minutesAgo')}`;
  return `${Math.floor(diff / 60)}${t('roadAlerts.hoursAgo')}`;
}

function severityDotClass(s: string) {
  if (s === 'high') return 'bg-red-500';
  if (s === 'medium') return 'bg-amber-400';
  return 'bg-emerald-400';
}

function severityBadgeClass(s: string) {
  if (s === 'high') return 'bg-red-500/15 text-red-400 border border-red-500/20';
  if (s === 'medium') return 'bg-amber-400/15 text-amber-400 border border-amber-400/20';
  return 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/20';
}

export default function RoadAlerts({ onBack }: Props) {
  const { t, language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const { showToast } = useToast();
  const user = getAuthUser();
  const [reports, setReports] = useState<TrafficReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [form, setForm] = useState({
    location: '', type: 'heavy_traffic' as TrafficReport['type'],
    severity: 'medium' as TrafficReport['severity'], description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const getTypeLabel = (value: TrafficReport['type']) => {
    const map: Record<string, string> = {
      heavy_traffic: t('roadAlerts.typeHeavy'),
      accident: t('roadAlerts.typeAccident'),
      road_block: t('roadAlerts.typeRoadBlock'),
      bus_delayed: t('roadAlerts.typeBusDelayed'),
      bus_cancelled: t('roadAlerts.typeBusCancelled'),
    };
    return map[value] || value;
  };

  const getSeverityLabel = (s: string) => {
    if (s === 'high') return t('roadAlerts.severityHigh');
    if (s === 'medium') return t('roadAlerts.severityMedium');
    return t('roadAlerts.severityLow');
  };

  React.useEffect(() => {
    trackFeatureUsage('road_alerts');
    setLoading(true);
    getTodayTrafficReports().then(r => { setReports(r); setLoading(false); });
    const interval = setInterval(() => {
      getTodayTrafficReports().then(r => setReports(r));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.location.trim() || !form.description.trim()) return;
    setSubmitting(true);
    const ok = await submitTrafficReport(form.location, form.type, form.severity, form.description);
    if (ok) {
      setShowForm(false);
      setForm({ location: '', type: 'heavy_traffic', severity: 'medium', description: '' });
      const fresh = await getTodayTrafficReports();
      setReports(fresh);
      showToast(t('roadAlerts.reportSuccess'), 'success');
    } else {
      showToast(t('community.submitError'), 'error');
    }
    setSubmitting(false);
  };

  const handleUpvote = async (reportId: string) => {
    await upvoteTrafficReport(reportId);
    const fresh = await getTodayTrafficReports();
    setReports(fresh);
  };

  const filteredReports = activeFilter === 'all' ? reports : reports.filter(r => r.type === activeFilter);

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bengali font-bold text-base text-kj-text">
          {lbl('Road Alerts', 'রোড অ্যালার্ট')}
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)', color: '#fff' }}
        >
          <Plus className="w-3.5 h-3.5" />
          {t('roadAlerts.reportBtn')}
        </button>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">

        {/* Page title */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
            {lbl('✦ KoyJabo · Live Traffic & Road Alerts', '✦ কই যাবো · লাইভ ট্রাফিক ও রোড অ্যালার্ট')}
          </span>
          <h1 className="font-bengali font-bold leading-tight tracking-tight mt-1.5 text-kj-text" style={{ fontSize: 26 }}>
            {lbl('Stay Alert on the Road', 'রাস্তায় সতর্ক থাকুন')}
          </h1>
          <p className="font-bengali text-[13px] text-kj-text-dim leading-relaxed mt-1">
            {lbl('Community-reported traffic, accidents & road closures.', 'সম্প্রদায়ের রিপোর্ট করা যানজট, দুর্ঘটনা ও রাস্তা বন্ধ।')}
          </p>
          <div className="flex gap-5 mt-3 flex-wrap">
            {[
              { v: String(reports.length), l: lbl('Reports', 'রিপোর্ট') },
              { v: lbl('Live', 'লাইভ'), l: lbl('Updates', 'আপডেট') },
              { v: '5m', l: lbl('Refresh', 'রিফ্রেশ') },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-sans font-extrabold text-[18px] tracking-tight leading-none text-kj-primary">{s.v}</div>
                <div className="text-[11px] text-kj-text-faint mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Report form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="dc-card p-4 space-y-3">
            <h3 className="font-bold text-kj-text text-sm flex items-center gap-2">
              <Flag className="w-4 h-4 text-orange-400" />
              {t('roadAlerts.newReport')}
            </h3>
            <input
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder={t('roadAlerts.locationPlaceholder')}
              className="w-full bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text placeholder-kj-text-faint focus:border-kj-primary/60 outline-none transition-colors"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as TrafficReport['type'] }))}
                className="bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text focus:border-kj-primary/60 outline-none"
              >
                {ALERT_TYPES.map(at => <option key={at.value} value={at.value}>{at.icon} {getTypeLabel(at.value)}</option>)}
              </select>
              <select
                value={form.severity}
                onChange={e => setForm(f => ({ ...f, severity: e.target.value as TrafficReport['severity'] }))}
                className="bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text focus:border-kj-primary/60 outline-none"
              >
                <option value="low">{t('roadAlerts.severityOptLow')}</option>
                <option value="medium">{t('roadAlerts.severityOptMedium')}</option>
                <option value="high">{t('roadAlerts.severityOptHigh')}</option>
              </select>
            </div>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={t('roadAlerts.descPlaceholder')}
              rows={2}
              className="w-full bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text placeholder-kj-text-faint resize-none focus:border-kj-primary/60 outline-none transition-colors"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 font-bold text-sm rounded-xl text-white disabled:opacity-50 transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' }}
              >
                {submitting ? t('roadAlerts.sending') : t('roadAlerts.reportAction')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-kj-chip-bg text-kj-text-dim font-semibold text-sm rounded-xl hover:bg-kj-line transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        {/* Official notices */}
        {ADMIN_ALERTS.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-kj-primary">
              {lbl('📌 Official Notices', '📌 সরকারি নোটিশ')}
            </span>
            {ADMIN_ALERTS.map(alert => (
              <div key={alert.id} className="dc-card border-kj-primary/30 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xl shrink-0">{alert.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-kj-text text-sm leading-snug">
                          {language === 'bn' ? alert.titleBn : alert.titleEn}
                        </p>
                        {alert.source && (
                          <p className="text-[11px] text-kj-primary mt-0.5">{alert.source}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
                      className="p-1 text-kj-primary hover:brightness-110 shrink-0"
                    >
                      {expanded === alert.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expanded === alert.id && (
                    <div className="mt-3 pt-3 border-t border-kj-line">
                      {(language === 'bn' ? alert.descriptionBn : alert.descriptionEn) && (
                        <p className="text-sm text-kj-text-dim mb-2">
                          {language === 'bn' ? alert.descriptionBn : alert.descriptionEn}
                        </p>
                      )}
                      {alert.url && (
                        <a
                          href={alert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-kj-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {lbl('View full notice', 'সম্পূর্ণ নোটিশ দেখুন')}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={`flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === chip.key
                  ? 'bg-kj-primary text-white shadow-md shadow-kj-primary/30'
                  : 'bg-kj-panel border border-kj-line text-kj-text-dim hover:border-kj-primary/40'
              }`}
            >
              {lbl(chip.labelEn, chip.labelBn)}
            </button>
          ))}
        </div>

        {/* Map preview placeholder */}
        <div className="dc-card overflow-hidden">
          <div className="h-[180px] bg-kj-chip-bg flex flex-col items-center justify-center gap-2">
            <Map className="w-10 h-10 text-kj-text-faint" />
            <p className="text-xs text-kj-text-faint font-medium">{lbl('Map preview coming soon', 'ম্যাপ প্রিভিউ শীঘ্রই আসছে')}</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-kj-text-faint text-sm">{t('roadAlerts.loading')}</div>
        )}

        {/* Empty state */}
        {!loading && filteredReports.length === 0 && (
          <div className="dc-card p-10 text-center">
            <AlertTriangle className="w-12 h-12 text-kj-text-faint mx-auto mb-3" />
            <p className="font-bold text-kj-text-dim">{t('roadAlerts.noReportsToday')}</p>
            <p className="text-sm text-kj-text-faint mt-1">{t('roadAlerts.reportIfYouSee')}</p>
          </div>
        )}

        {/* Alert cards */}
        <div className="space-y-3">
          {filteredReports.map(r => {
            const typeInfo = ALERT_TYPES.find(at => at.value === r.type) || ALERT_TYPES[0];
            return (
              <div key={r.id} className="dc-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Severity dot */}
                    <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${severityDotClass(r.severity)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-kj-text text-sm">{r.location}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${severityBadgeClass(r.severity)}`}>
                              {getSeverityLabel(r.severity)}
                            </span>
                          </div>
                          <p className="text-xs text-kj-text-dim mt-0.5">
                            {typeInfo.icon} {getTypeLabel(r.type)}
                          </p>
                        </div>
                        <button
                          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          className="p-1 text-kj-text-faint hover:text-kj-text-dim shrink-0"
                        >
                          {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {expanded === r.id && (
                        <div className="mt-3 pt-3 border-t border-kj-line">
                          <p className="text-sm text-kj-text-dim">{r.description}</p>
                          <p className="text-xs text-kj-text-faint mt-2">{t('roadAlerts.reportedBy')} {r.displayName}</p>
                        </div>
                      )}

                      {/* Card footer */}
                      <div className="flex items-center justify-between mt-3 gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpvote(r.id)}
                            className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-colors ${
                              r.upvotes.includes(user?.id ?? '')
                                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                                : 'bg-kj-chip-bg text-kj-text-dim hover:bg-orange-500/10 border border-kj-line'
                            }`}
                          >
                            👍 {t('roadAlerts.correct')} ({r.upvotes.length})
                          </button>
                          <button className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg font-bold bg-kj-chip-bg text-kj-text-dim border border-kj-line hover:border-kj-primary/40 transition-colors">
                            <Map className="w-3 h-3" />
                            {lbl('Map', 'ম্যাপ')}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-kj-text-faint">
                          <Clock className="w-3 h-3" />
                          {timeAgo(r.timestamp, t)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <SponsoredAdSlot language={language} size="300x250" compact />
      </div>
    </div>
  );
}
