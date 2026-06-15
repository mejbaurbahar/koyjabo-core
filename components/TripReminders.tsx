import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import { getLocalReminders, saveLocalReminders, syncReminders, pullReminders, TripReminder, getAuthUser } from '../services/communityDataService';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';
import SponsoredAdSlot from './SponsoredAdSlot';


interface Props { onBack: () => void; }

const DAY_LABELS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BEFORE_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function scheduleNextAlarm(reminder: TripReminder, lang: string = 'bn') {
  if (!reminder.enabled) return;
  const now = new Date();
  const [hh, mm] = reminder.time.split(':').map(Number);
  for (let d = 0; d < 7; d++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + d);
    candidate.setHours(hh, mm - reminder.minutesBefore, 0, 0);
    if (candidate > now && reminder.days.includes(candidate.getDay())) {
      const msUntil = candidate.getTime() - now.getTime();
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`কই যাবো — ${reminder.label}`, {
            body: lang === 'bn'
              ? `${reminder.minutesBefore} মিনিট পরে যাত্রা শুরু করুন${reminder.busName ? ` · ${reminder.busName}` : ''}`
              : `Depart in ${reminder.minutesBefore} min${reminder.busName ? ` · ${reminder.busName}` : ''}`,
            icon: '/icon-192x192.png',
          });
        }
      }, msUntil);
      break;
    }
  }
}

export default function TripReminders({ onBack }: Props) {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const DAY_LABELS = language === 'bn' ? DAY_LABELS_BN : DAY_LABELS_EN;
  const user = getAuthUser();
  const [reminders, setReminders] = useState<TripReminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);
  const [form, setForm] = useState({
    label: '', busName: '', fromStop: '', toStop: '',
    days: [1, 2, 3, 4, 5] as number[],
    time: '08:00', minutesBefore: 15,
  });

  useEffect(() => {
    trackFeatureUsage('trip_reminders');
    requestNotificationPermission();
    if ('Notification' in window) setNotifPermission(Notification.permission);
    pullReminders().then(() => {
      const loaded = getLocalReminders();
      setReminders(loaded);
      loaded.filter(r => r.enabled).forEach(r => scheduleNextAlarm(r, language));
    });

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if ('Notification' in window) setNotifPermission(Notification.permission);
      const current = getLocalReminders();
      const now = Date.now();
      current.filter(r => r.enabled).forEach(r => {
        scheduleNextAlarm(r, language);
        const [hh, mm] = r.time.split(':').map(Number);
        const fire = new Date();
        fire.setHours(hh, mm - r.minutesBefore, 0, 0);
        const msSinceFire = now - fire.getTime();
        if (msSinceFire >= 0 && msSinceFire <= 30 * 60 * 1000 && r.days.includes(new Date().getDay())) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`কই যাবো — ${r.label}`, {
              body: language === 'bn'
                ? `${r.minutesBefore} মিনিট আগে যাত্রার সতর্কতা মিস হয়েছিল${r.busName ? ` · ${r.busName}` : ''}`
                : `Missed alert from ${r.minutesBefore} min ago${r.busName ? ` · ${r.busName}` : ''}`,
              icon: '/icon-192x192.png',
            });
          }
        }
      });
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const toggleDay = (d: number) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d],
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || form.days.length === 0) return;
    const newReminder: TripReminder = {
      id: crypto.randomUUID(),
      userId: user?.id || 'anonymous',
      label: form.label.trim(),
      busName: form.busName.trim() || undefined,
      fromStop: form.fromStop.trim() || undefined,
      toStop: form.toStop.trim() || undefined,
      days: [...form.days].sort(),
      time: form.time,
      minutesBefore: form.minutesBefore,
      enabled: true,
      createdAt: Date.now(),
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveLocalReminders(updated);
    scheduleNextAlarm(newReminder, language);
    setShowForm(false);
    setForm({ label: '', busName: '', fromStop: '', toStop: '', days: [1, 2, 3, 4, 5], time: '08:00', minutesBefore: 15 });
    if (user) {
      setSyncing(true);
      await syncReminders();
      setSyncing(false);
    }
  };

  const toggleEnabled = async (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setReminders(updated);
    saveLocalReminders(updated);
    const toggled = updated.find(r => r.id === id);
    if (toggled?.enabled) scheduleNextAlarm(toggled, language);
    if (user) await syncReminders();
  };

  const deleteReminder = async (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveLocalReminders(updated);
    if (user) await syncReminders();
  };

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
          {lbl('Trip Reminders', 'ট্রিপ রিমাইন্ডার')}
        </span>
        {syncing && (
          <span className="ml-auto text-[11px] text-kj-text-faint">{lbl('Saving...', 'সংরক্ষণ...')}</span>
        )}
      </div>

      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">

        {/* Page title */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
            {lbl('✦ KoyJabo · Trip Reminders', '✦ কই যাবো · ট্রিপ রিমাইন্ডার')}
          </span>
          <h1 className="font-bengali font-bold leading-tight tracking-tight mt-1.5 text-kj-text" style={{ fontSize: 26 }}>
            {lbl('Never Miss a Bus', 'বাস কখনো মিস করবেন না')}
          </h1>
          <p className="font-bengali text-[13px] text-kj-text-dim leading-relaxed mt-1">
            {lbl('Set alerts for your daily commute — we\'ll notify you on time.', 'নিয়মিত যাত্রার জন্য সতর্কতা সেট করুন — সময়মতো জানাবো।')}
          </p>
        </div>

        {/* Notification permission prompt */}
        {notifPermission !== null && notifPermission !== 'granted' && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/25">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-400">{lbl('Enable Notifications', 'নোটিফিকেশন চালু করুন')}</p>
              <p className="text-xs text-kj-text-dim mt-0.5">
                {lbl('Allow notifications so reminders can reach you.', 'রিমাইন্ডার পেতে নোটিফিকেশনের অনুমতি দিন।')}
              </p>
            </div>
            <button
              onClick={() => Notification.requestPermission().then(p => setNotifPermission(p))}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-black shrink-0 active:scale-95 transition-all"
            >
              {lbl('Allow', 'অনুমতি দিন')}
            </button>
          </div>
        )}

        {/* Add reminder button */}
        <button
          onClick={() => setShowForm(v => !v)}
          className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-kj-primary/20"
          style={{ background: 'linear-gradient(135deg, var(--kj-primary) 0%, #7c3aed 100%)' }}
        >
          <Plus className="w-4 h-4" />
          {lbl('Add Reminder', 'রিমাইন্ডার যোগ করুন')}
        </button>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleAdd} className="dc-card p-4 border-kj-primary/30 space-y-3">
            <h3 className="font-bold text-kj-text text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-kj-primary" />
              {lbl('New Reminder', 'নতুন রিমাইন্ডার')}
            </h3>
            <input
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder={lbl('Reminder name (e.g. Go to office)', 'রিমাইন্ডার নাম (যেমন: অফিসে যাওয়া)')}
              className="w-full bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text placeholder-kj-text-faint focus:border-kj-primary/60 outline-none transition-colors"
              required
            />
            <input
              value={form.busName}
              onChange={e => setForm(f => ({ ...f, busName: e.target.value }))}
              placeholder={lbl('Bus name (optional)', 'বাসের নাম (ঐচ্ছিক)')}
              className="w-full bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text placeholder-kj-text-faint focus:border-kj-primary/60 outline-none transition-colors"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={form.fromStop}
                onChange={e => setForm(f => ({ ...f, fromStop: e.target.value }))}
                placeholder={lbl('From stop', 'যাত্রা শুরু')}
                className="bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text placeholder-kj-text-faint focus:border-kj-primary/60 outline-none transition-colors"
              />
              <input
                value={form.toStop}
                onChange={e => setForm(f => ({ ...f, toStop: e.target.value }))}
                placeholder={lbl('To stop', 'গন্তব্য')}
                className="bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text placeholder-kj-text-faint focus:border-kj-primary/60 outline-none transition-colors"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-kj-text-dim mb-2">{lbl('Select days', 'দিন নির্বাচন করুন')}</p>
              <div className="flex gap-1.5 flex-wrap">
                {DAY_LABELS.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      form.days.includes(i)
                        ? 'bg-kj-primary text-white shadow-sm shadow-kj-primary/30'
                        : 'bg-kj-chip-bg text-kj-text-dim border border-kj-line hover:border-kj-primary/40'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {form.days.length === 0 && (
                <p className="text-xs text-red-400 mt-1">{lbl('Select at least one day', 'কমপক্ষে একটি দিন নির্বাচন করুন')}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-bold text-kj-text-dim mb-1">{lbl('Trip time', 'যাত্রার সময়')}</p>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text focus:border-kj-primary/60 outline-none transition-colors"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-kj-text-dim mb-1">{lbl('Notify before', 'আগে সতর্ক করুন')}</p>
                <select
                  value={form.minutesBefore}
                  onChange={e => setForm(f => ({ ...f, minutesBefore: Number(e.target.value) }))}
                  className="w-full bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text focus:border-kj-primary/60 outline-none"
                >
                  {BEFORE_OPTIONS.map(m => (
                    <option key={m} value={m}>{m} {lbl('min before', 'মিনিট আগে')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={form.days.length === 0}
                className="flex-1 py-2.5 font-bold text-sm rounded-xl text-white disabled:opacity-40 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, var(--kj-primary) 0%, #7c3aed 100%)' }}
              >
                {lbl('Add Reminder', 'যোগ করুন')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-kj-chip-bg text-kj-text-dim font-semibold text-sm rounded-xl hover:bg-kj-line transition-colors"
              >
                {lbl('Cancel', 'বাতিল')}
              </button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {reminders.length === 0 && !showForm && (
          <div className="dc-card p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-kj-chip-bg flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-kj-text-faint" />
            </div>
            <p className="font-bold text-kj-text text-lg mb-1">{lbl('No reminders set', 'এখনো কোনো রিমাইন্ডার নেই')}</p>
            <p className="text-sm text-kj-text-dim mb-6">{lbl('Set alerts for your daily commute so you never miss a bus.', 'নিয়মিত যাত্রার জন্য সতর্কতা সেট করুন — বাস মিস হবে না।')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-2xl text-white active:scale-95 transition-all shadow-lg shadow-kj-primary/25"
              style={{ background: 'linear-gradient(135deg, var(--kj-primary) 0%, #7c3aed 100%)' }}
            >
              <Plus className="w-5 h-5" />
              {lbl('Add Your First Reminder', 'প্রথম রিমাইন্ডার যোগ করুন')}
            </button>
          </div>
        )}

        {/* Reminder cards */}
        <div className="space-y-3">
          {reminders.map(r => (
            <div
              key={r.id}
              className={`dc-card p-4 transition-all ${r.enabled ? 'border-kj-primary' : 'opacity-60'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.enabled ? 'bg-kj-primary/15' : 'bg-kj-chip-bg'}`}>
                  <Bell className={`w-4 h-4 ${r.enabled ? 'text-kj-primary' : 'text-kj-text-faint'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-kj-text text-sm">{r.label}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-kj-text-dim flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.time}</span>
                    {r.busName && <span>🚌 {r.busName}</span>}
                    {(r.fromStop || r.toStop) && (
                      <span className="text-kj-text-faint">{r.fromStop} → {r.toStop}</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {DAY_LABELS.map((d, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ${
                          r.days.includes(i)
                            ? 'bg-kj-primary/15 text-kj-primary'
                            : 'bg-kj-chip-bg text-kj-text-faint'
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-kj-text-faint mt-1">
                    {r.minutesBefore} {lbl('min early alert', 'মিনিট আগে সতর্ক করবে')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleEnabled(r.id)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${r.enabled ? 'bg-kj-primary' : 'bg-kj-chip-bg border border-kj-line'}`}
                    aria-label={r.enabled ? 'Disable reminder' : 'Enable reminder'}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${r.enabled ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <SponsoredAdSlot language={language} size="300x250" compact />
      </div>
    </div>
  );
}
