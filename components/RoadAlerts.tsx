import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Clock, ChevronDown, ChevronUp, Plus, ExternalLink } from 'lucide-react';
import AdSenseAd from './AdSenseAd';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { submitTrafficReport, getTodayTrafficReports, upvoteTrafficReport, TrafficReport, getAuthUser } from '../services/communityDataService';
import { trackFeatureUsage } from '../services/analyticsService';



interface Props {
  onBack: () => void;
}

// ── Admin pre-alerts (pinned official notices) ────────────────────────────────
// Add or remove entries here to manage pinned government/admin notices.
interface AdminAlert {
  id: string;
  titleBn: string;
  titleEn: string;
  descriptionBn?: string;
  descriptionEn?: string;
  url?: string;
  source?: string;
  timestamp: number;  // Unix ms — used for display only
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
  { value: 'heavy_traffic', icon: '🚦', color: 'text-red-600' },
  { value: 'accident', icon: '🚨', color: 'text-red-700' },
  { value: 'road_block', icon: '🚧', color: 'text-orange-600' },
  { value: 'bus_delayed', icon: '🚌', color: 'text-amber-600' },
  { value: 'bus_cancelled', icon: '❌', color: 'text-red-600' },
];

function timeAgo(ts: number, t: (key: string) => string): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return t('roadAlerts.justNow');
  if (diff < 60) return `${diff}${t('roadAlerts.minutesAgo')}`;
  return `${Math.floor(diff / 60)}${t('roadAlerts.hoursAgo')}`;
}

export default function RoadAlerts({ onBack }: Props) {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const user = getAuthUser();
  const [reports, setReports] = useState<TrafficReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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

  const severityColor = (s: string) =>
    s === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
    s === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-kj-bg overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-kj-panel border-b border-kj-line shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg rounded-full">
          <ArrowLeft className="w-5 h-5 text-kj-text-dim" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-kj-text">{t('roadAlerts.title')}</h1>
          <p className="text-xs text-kj-text-dim">
            {t('roadAlerts.activeReports').replace('{count}', String(reports.length))}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0">
          <Plus className="w-4 h-4 shrink-0" /> <span className="hidden xs:inline">{t('roadAlerts.reportBtn')}</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-4 space-y-3 pb-nav-safe" style={{ WebkitOverflowScrolling: 'touch' }}>
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-kj-panel rounded-2xl p-4 shadow-sm border border-kj-line space-y-3">
            <h3 className="font-bold text-kj-text text-sm">{t('roadAlerts.newReport')}</h3>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder={t('roadAlerts.locationPlaceholder')}
              className="w-full bg-gray-50 dark:bg-slate-700 border border-kj-line dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" required />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as TrafficReport['type'] }))}
                className="bg-gray-50 dark:bg-slate-700 border border-kj-line dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white">
                {ALERT_TYPES.map(at => <option key={at.value} value={at.value}>{at.icon} {getTypeLabel(at.value)}</option>)}
              </select>
              <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as TrafficReport['severity'] }))}
                className="bg-gray-50 dark:bg-slate-700 border border-kj-line dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white">
                <option value="low">{t('roadAlerts.severityOptLow')}</option>
                <option value="medium">{t('roadAlerts.severityOptMedium')}</option>
                <option value="high">{t('roadAlerts.severityOptHigh')}</option>
              </select>
            </div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder={t('roadAlerts.descPlaceholder')}
              rows={2}
              className="w-full bg-gray-50 dark:bg-slate-700 border border-kj-line dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white resize-none" required />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors">
                {submitting ? t('roadAlerts.sending') : t('roadAlerts.reportAction')}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-kj-chip-bg text-kj-text-dim font-semibold text-sm rounded-xl">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        <AdSenseAd adSlot="auto" adFormat="fluid" layoutKey="-6t+ed+2i-1n-4w" className="my-4 max-w-[728px] mx-auto" />




        {ADMIN_ALERTS.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide px-1">
              {language === 'bn' ? '📌 সরকারি নোটিশ' : '📌 Official Notices'}
            </p>
            {ADMIN_ALERTS.map(alert => (
              <div key={alert.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xl">{alert.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm leading-snug">
                          {language === 'bn' ? alert.titleBn : alert.titleEn}
                        </p>
                        {alert.source && (
                          <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">{alert.source}</p>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
                      className="p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 shrink-0">
                      {expanded === alert.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {expanded === alert.id && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      {(language === 'bn' ? alert.descriptionBn : alert.descriptionEn) && (
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                          {language === 'bn' ? alert.descriptionBn : alert.descriptionEn}
                        </p>
                      )}
                      {alert.url && (
                        <a href={alert.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                          <ExternalLink className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'সম্পূর্ণ নোটিশ দেখুন' : 'View full notice'}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && <div className="text-center py-10 text-kj-text-faint">{t('roadAlerts.loading')}</div>}

        {!loading && reports.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-kj-text-faint mx-auto mb-3" />
            <p className="text-kj-text-dim font-medium">{t('roadAlerts.noReportsToday')}</p>
            <p className="text-sm text-kj-text-faint mt-1">{t('roadAlerts.reportIfYouSee')}</p>
          </div>
        )}

        {reports.map(r => {
          const typeInfo = ALERT_TYPES.find(at => at.value === r.type) || ALERT_TYPES[0];
          return (
            <div key={r.id} className="bg-kj-panel rounded-2xl shadow-sm border border-kj-line overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-kj-text text-sm">{r.location}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(r.severity)}`}>{getSeverityLabel(r.severity)}</span>
                      </div>
                      <p className="text-xs text-kj-text-dim mt-0.5">{getTypeLabel(r.type)} · {timeAgo(r.timestamp, t)}</p>
                    </div>
                  </div>
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    className="p-1 text-kj-text-faint hover:text-kj-text-dim dark:hover:text-kj-text-faint">
                    {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {expanded === r.id && (
                  <div className="mt-3 pt-3 border-t border-kj-line">
                    <p className="text-sm text-kj-text-dim">{r.description}</p>
                    <p className="text-xs text-kj-text-faint mt-2">{t('roadAlerts.reportedBy')} {r.displayName}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <button onClick={() => handleUpvote(r.id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${r.upvotes.includes(user?.id ?? '') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-kj-chip-bg text-kj-text-dim hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}>
                    👍 {t('roadAlerts.correct')} ({r.upvotes.length})
                  </button>
                  <div className="flex items-center gap-1 text-xs text-kj-text-faint">
                    <Clock className="w-3 h-3" />
                    {timeAgo(r.timestamp, t)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="h-4" />

      </div>
    </div>
  );
}
