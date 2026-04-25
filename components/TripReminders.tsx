import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Plus, Trash2, Toggle, Clock, Calendar } from 'lucide-react';
import { getLocalReminders, saveLocalReminders, syncReminders, pullReminders, TripReminder, getAuthUser } from '../services/communityDataService';

interface Props { onBack: () => void; }

const DAY_LABELS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
const BEFORE_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function scheduleNextAlarm(reminder: TripReminder) {
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
            body: `${reminder.minutesBefore} মিনিট পরে যাত্রা শুরু করুন${reminder.busName ? ` · ${reminder.busName}` : ''}`,
            icon: '/icon-192x192.png',
          });
        }
      }, msUntil);
      break;
    }
  }
}

export default function TripReminders({ onBack }: Props) {
  const user = getAuthUser();
  const [reminders, setReminders] = useState<TripReminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    label: '', busName: '', fromStop: '', toStop: '',
    days: [1, 2, 3, 4, 5] as number[],
    time: '08:00', minutesBefore: 15,
  });

  useEffect(() => {
    requestNotificationPermission();
    pullReminders().then(() => {
      const loaded = getLocalReminders();
      setReminders(loaded);
      loaded.filter(r => r.enabled).forEach(scheduleNextAlarm);
    });
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
      userId: user?.id || '',
      label: form.label,
      busName: form.busName || undefined,
      fromStop: form.fromStop || undefined,
      toStop: form.toStop || undefined,
      days: form.days.sort(),
      time: form.time,
      minutesBefore: form.minutesBefore,
      enabled: true,
      createdAt: Date.now(),
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveLocalReminders(updated);
    scheduleNextAlarm(newReminder);
    setShowForm(false);
    setForm({ label: '', busName: '', fromStop: '', toStop: '', days: [1, 2, 3, 4, 5], time: '08:00', minutesBefore: 15 });
    setSyncing(true);
    await syncReminders();
    setSyncing(false);
  };

  const toggleEnabled = async (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setReminders(updated);
    saveLocalReminders(updated);
    const toggled = updated.find(r => r.id === id);
    if (toggled?.enabled) scheduleNextAlarm(toggled);
    await syncReminders();
  };

  const deleteReminder = async (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveLocalReminders(updated);
    await syncReminders();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">যাত্রা রিমাইন্ডার</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trip Reminders {syncing ? '· সংরক্ষণ হচ্ছে...' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl">
          <Plus className="w-4 h-4" /> যোগ করুন
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">নতুন রিমাইন্ডার</h3>
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="রিমাইন্ডার নাম (যেমন: অফিসে যাওয়া)"
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" required />
            <input value={form.busName} onChange={e => setForm(f => ({ ...f, busName: e.target.value }))}
              placeholder="বাসের নাম (ঐচ্ছিক)"
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" />
            <div className="grid grid-cols-2 gap-2">
              <input value={form.fromStop} onChange={e => setForm(f => ({ ...f, fromStop: e.target.value }))}
                placeholder="যাত্রা শুরু" className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" />
              <input value={form.toStop} onChange={e => setForm(f => ({ ...f, toStop: e.target.value }))}
                placeholder="গন্তব্য" className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">দিন নির্বাচন করুন</p>
              <div className="flex gap-1.5 flex-wrap">
                {DAY_LABELS.map((day, i) => (
                  <button key={i} type="button" onClick={() => toggleDay(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${form.days.includes(i) ? 'bg-violet-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">যাত্রার সময়</p>
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">আগে সতর্ক করুন</p>
                <select value={form.minutesBefore} onChange={e => setForm(f => ({ ...f, minutesBefore: Number(e.target.value) }))}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white">
                  {BEFORE_OPTIONS.map(m => <option key={m} value={m}>{m} মিনিট আগে</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-sm rounded-xl">যোগ করুন</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl">বাতিল</button>
            </div>
          </form>
        )}

        {reminders.length === 0 && !showForm && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">কোনো রিমাইন্ডার নেই</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">নিয়মিত যাত্রার জন্য রিমাইন্ডার যোগ করুন</p>
          </div>
        )}

        {reminders.map(r => (
          <div key={r.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border transition-all shadow-sm ${r.enabled ? 'border-violet-200 dark:border-violet-800' : 'border-gray-100 dark:border-gray-700 opacity-60'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Bell className={`w-4 h-4 ${r.enabled ? 'text-violet-500' : 'text-gray-400'}`} />
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{r.label}</h3>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.time}</span>
                  {r.busName && <span>🚌 {r.busName}</span>}
                </div>
                {(r.fromStop || r.toStop) && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{r.fromStop} → {r.toStop}</p>
                )}
                <div className="flex gap-1 mt-2">
                  {DAY_LABELS.map((d, i) => (
                    <span key={i} className={`text-xs px-1.5 py-0.5 rounded font-medium ${r.days.includes(i) ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>{d}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{r.minutesBefore} মিনিট আগে সতর্ক করবে</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => toggleEnabled(r.id)}
                  className={`w-10 h-6 rounded-full transition-colors ${r.enabled ? 'bg-violet-500' : 'bg-gray-200 dark:bg-slate-600'} relative`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${r.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <button onClick={() => deleteReminder(r.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="h-4" />
      </div>
    </div>
  );
}
