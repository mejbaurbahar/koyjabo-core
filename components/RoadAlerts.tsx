import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Clock, MapPin, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { submitTrafficReport, getTodayTrafficReports, upvoteTrafficReport, TrafficReport, getAuthUser } from '../services/communityDataService';

interface Props {
  onBack: () => void;
}

const ALERT_TYPES: { value: TrafficReport['type']; label: string; icon: string; color: string }[] = [
  { value: 'heavy_traffic', label: 'ভারী যানজট', icon: '🚦', color: 'text-red-600' },
  { value: 'accident', label: 'দুর্ঘটনা', icon: '🚨', color: 'text-red-700' },
  { value: 'road_block', label: 'রাস্তা বন্ধ', icon: '🚧', color: 'text-orange-600' },
  { value: 'bus_delayed', label: 'বাস বিলম্বিত', icon: '🚌', color: 'text-amber-600' },
  { value: 'bus_cancelled', label: 'বাস বাতিল', icon: '❌', color: 'text-red-600' },
];

const SEVERITY_LABELS: Record<string, string> = {
  low: 'কম', medium: 'মাঝারি', high: 'তীব্র',
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return 'এখনই';
  if (diff < 60) return `${diff} মিনিট আগে`;
  return `${Math.floor(diff / 60)} ঘণ্টা আগে`;
}

export default function RoadAlerts({ onBack }: Props) {
  const { t } = useLanguage();
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

  React.useEffect(() => {
    setLoading(true);
    getTodayTrafficReports().then(r => { setReports(r); setLoading(false); });
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">রাস্তা ও ট্রাফিক সতর্কতা</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">আজকের রিপোর্ট — {reports.length}টি সক্রিয়</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> রিপোর্ট
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">নতুন সমস্যা রিপোর্ট করুন</h3>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="স্থান / রাস্তার নাম (যেমন: মিরপুর-১০ ফ্লাইওভার)"
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" required />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white">
                {ALERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
              <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as any }))}
                className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white">
                <option value="low">কম তীব্র</option>
                <option value="medium">মাঝারি</option>
                <option value="high">তীব্র</option>
              </select>
            </div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="বিস্তারিত বিবরণ..."
              rows={2}
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white resize-none" required />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors">
                {submitting ? 'পাঠানো হচ্ছে...' : 'রিপোর্ট করুন'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl">
                বাতিল
              </button>
            </div>
          </form>
        )}

        {loading && <div className="text-center py-10 text-gray-400">লোড হচ্ছে...</div>}

        {!loading && reports.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">আজ কোনো রিপোর্ট নেই</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">সমস্যা দেখলে রিপোর্ট করুন</p>
          </div>
        )}

        {reports.map(r => {
          const typeInfo = ALERT_TYPES.find(t => t.value === r.type) || ALERT_TYPES[0];
          return (
            <div key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{r.location}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor(r.severity)}`}>{SEVERITY_LABELS[r.severity]}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{typeInfo.label} · {timeAgo(r.timestamp)}</p>
                    </div>
                  </div>
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {expanded === r.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{r.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">রিপোর্ট করেছেন: {r.displayName}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <button onClick={() => handleUpvote(r.id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${r.upvotes.includes(user?.id ?? '') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}>
                    👍 সঠিক ({r.upvotes.length})
                  </button>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {timeAgo(r.timestamp)}
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
