import React, { useState } from 'react';
import { ArrowLeft, Calculator, TrendingDown } from 'lucide-react';

interface Props { onBack: () => void; }

const TRANSPORT_MODES = [
  { id: 'metro', label: 'মেট্রো রেল', icon: '🚇', avgPerTrip: 40 },
  { id: 'bus', label: 'লোকাল বাস', icon: '🚌', avgPerTrip: 20 },
  { id: 'brtc', label: 'বিআরটিসি বাস', icon: '🚍', avgPerTrip: 30 },
  { id: 'cng', label: 'সিএনজি', icon: '🛺', avgPerTrip: 80 },
  { id: 'uber', label: 'উবার/পাঠাও', icon: '🚗', avgPerTrip: 150 },
  { id: 'rickshaw', label: 'রিকশা', icon: '🛵', avgPerTrip: 50 },
];

interface Leg {
  mode: string;
  fare: number;
  trips: number;
}

export default function CommuteCostCalculator({ onBack }: Props) {
  const [legs, setLegs] = useState<Leg[]>([{ mode: 'metro', fare: 40, trips: 2 }]);
  const [workDays, setWorkDays] = useState(22);
  const [calculated, setCalculated] = useState(false);

  const addLeg = () => setLegs(l => [...l, { mode: 'bus', fare: 20, trips: 2 }]);
  const removeLeg = (i: number) => setLegs(l => l.filter((_, idx) => idx !== i));
  const updateLeg = (i: number, field: keyof Leg, value: string | number) =>
    setLegs(l => l.map((leg, idx) => idx === i ? { ...leg, [field]: value } : leg));

  const dailyCost = legs.reduce((sum, l) => sum + l.fare * l.trips, 0);
  const monthlyCost = dailyCost * workDays;
  const yearlyCost = monthlyCost * 12;

  const metroPass = 1000;
  const brtcPass = 800;
  const savings = Math.max(0, monthlyCost - metroPass - brtcPass);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">যাতায়াত খরচ ক্যালকুলেটর</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Commute Cost Calculator</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">দৈনিক যাতায়াতের তথ্য</h3>
            <button onClick={addLeg} className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">+ যোগ করুন</button>
          </div>

          {legs.map((leg, i) => (
            <div key={i} className="space-y-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">{TRANSPORT_MODES.find(m => m.id === leg.mode)?.icon}</span>
                <select value={leg.mode}
                  onChange={e => {
                    const mode = TRANSPORT_MODES.find(m => m.id === e.target.value);
                    updateLeg(i, 'mode', e.target.value);
                    if (mode) updateLeg(i, 'fare', mode.avgPerTrip);
                  }}
                  className="flex-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:text-white">
                  {TRANSPORT_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                {legs.length > 1 && (
                  <button onClick={() => removeLeg(i)} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">প্রতি যাত্রায় ভাড়া (৳)</p>
                  <input type="number" min={0} value={leg.fare}
                    onChange={e => updateLeg(i, 'fare', Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">দৈনিক যাত্রার সংখ্যা</p>
                  <input type="number" min={1} max={10} value={leg.trips}
                    onChange={e => updateLeg(i, 'trips', Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:text-white" />
                </div>
              </div>
            </div>
          ))}

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">মাসে কর্মদিবস</p>
            <input type="number" min={1} max={31} value={workDays}
              onChange={e => setWorkDays(Number(e.target.value))}
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm dark:text-white" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'দৈনিক', value: dailyCost },
            { label: 'মাসিক', value: monthlyCost },
            { label: 'বার্ষিক', value: yearlyCost },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">৳{value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {monthlyCost > 1500 && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">পাস কিনলে সাশ্রয় হতে পারে</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  মেট্রো র‍্যাপিড পাস (৳1,000) + বিআরটিসি পাস (৳800) = ৳1,800/মাস।
                  আপনার বর্তমান খরচ ৳{monthlyCost.toLocaleString()} — পাস কিনলে প্রায় ৳{Math.max(0, monthlyCost - 1800).toLocaleString()} সাশ্রয় হতে পারে।
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">ধরন অনুযায়ী গড় ভাড়া</h3>
          <div className="space-y-2">
            {TRANSPORT_MODES.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{m.icon} {m.label}</span>
                <span className="font-semibold text-gray-900 dark:text-white">৳{m.avgPerTrip} গড়</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}
