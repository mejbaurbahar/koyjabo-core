import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, TrendingDown, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';
import AdSenseAd from './AdSenseAd';



interface Props { onBack: () => void; }

// Fares based on BRTA-approved rates (August 2022 revision):
// Non-AC city bus: ৳2.55/km (min ৳10), avg 10km trip ≈ ৳25
// AC bus: ৳2.65/km, avg 10km trip ≈ ৳27
// Non-AC intercity: ৳2.20/km
const TRANSPORT_MODES = [
  { id: 'metro', label: 'মেট্রো রেল', labelEn: 'Metro Rail', icon: '🚇', avgPerTrip: 40 },
  { id: 'bus', label: 'লোকাল বাস', labelEn: 'Local Bus', icon: '🚌', avgPerTrip: 25 },
  { id: 'brtc', label: 'বিআরটিসি', labelEn: 'BRTC Bus', icon: '🚍', avgPerTrip: 35 },
  { id: 'cng', label: 'সিএনজি', labelEn: 'CNG Auto', icon: '🛺', avgPerTrip: 80 },
  { id: 'uber', label: 'উবার/পাঠাও', labelEn: 'Uber/Pathao', icon: '🚗', avgPerTrip: 150 },
  { id: 'rickshaw', label: 'রিকশা', labelEn: 'Rickshaw', icon: '🛵', avgPerTrip: 50 },
];

interface Leg { mode: string; fare: number; trips: number; }
interface SavedCalc { legs: Leg[]; workDays: number; savedAt: number; }

const STORAGE_KEY = 'kj_commute_calc';

function loadSaved(): SavedCalc | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'); } catch { return null; }
}
function saveCurrent(legs: Leg[], workDays: number) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ legs, workDays, savedAt: Date.now() })); } catch { /**/ }
}
function clearSaved() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /**/ }
}

export default function CommuteCostCalculator({ onBack }: Props) {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  const [legs, setLegs] = useState<Leg[]>([]);
  const [workDays, setWorkDays] = useState(22);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => { trackFeatureUsage('cost_calculator'); }, []);

  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setLegs(saved.legs);
      setWorkDays(saved.workDays);
      setHasSaved(true);
    }
  }, []);

  const addLeg = () => {
    const updated = [...legs, { mode: 'bus', fare: 20, trips: 2 }];
    setLegs(updated);
    saveCurrent(updated, workDays);
    setHasSaved(true);
  };

  const removeLeg = (i: number) => {
    const updated = legs.filter((_, idx) => idx !== i);
    setLegs(updated);
    if (updated.length > 0) { saveCurrent(updated, workDays); setHasSaved(true); }
    else { clearSaved(); setHasSaved(false); }
  };

  const updateLeg = (i: number, field: keyof Leg, value: string | number) => {
    const updated = legs.map((leg, idx) => idx === i ? { ...leg, [field]: value } : leg);
    setLegs(updated);
    saveCurrent(updated, workDays);
    setHasSaved(true);
  };

  const updateWorkDays = (v: number) => {
    setWorkDays(v);
    if (legs.length > 0) { saveCurrent(legs, v); setHasSaved(true); }
  };

  const handleClear = () => {
    setLegs([]);
    setWorkDays(22);
    clearSaved();
    setHasSaved(false);
  };

  const dailyCost = legs.reduce((sum, l) => sum + l.fare * l.trips, 0);
  const monthlyCost = dailyCost * workDays;
  const yearlyCost = monthlyCost * 12;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-kj-bg overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-kj-panel border-b border-kj-line shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg rounded-full">
          <ArrowLeft className="w-5 h-5 text-kj-text-dim" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-kj-text">{lbl('Cost Calculator', 'খরচ ক্যালকুলেটর')}</h1>
          <p className="text-xs text-kj-text-dim">{lbl('Commute Cost Calculator', 'যাতায়াত খরচ ক্যালকুলেটর')}</p>
        </div>
        {hasSaved && (
          <button onClick={handleClear} className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
            <Trash2 className="w-3.5 h-3.5" /> {lbl('Clear', 'মুছুন')}
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-4 space-y-4 pb-nav-safe" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="bg-kj-panel rounded-2xl p-4 border border-kj-line space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-kj-text text-sm">{lbl('Daily Commute', 'দৈনিক যাতায়াত')}</h3>
            <button onClick={addLeg} className="text-xs text-kj-primary font-semibold hover:underline">
              + {lbl('Add', 'যোগ করুন')}
            </button>
          </div>

          {legs.length === 0 && (
            <button onClick={addLeg}
              className="w-full py-8 border-2 border-dashed border-kj-line dark:border-slate-600 rounded-xl text-kj-text-faint hover:border-emerald-400 hover:text-kj-primary transition-colors text-sm">
              + {lbl('Tap to add your first transport leg', 'যাতায়াতের তথ্য যোগ করুন')}
            </button>
          )}

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
                  className="flex-1 bg-white dark:bg-slate-700 border border-kj-line dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:text-white">
                  {TRANSPORT_MODES.map(m => (
                    <option key={m.id} value={m.id}>{language === 'bn' ? m.label : m.labelEn}</option>
                  ))}
                </select>
                <button onClick={() => removeLeg(i)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-kj-text-dim mb-1">{lbl('Fare per trip (৳)', 'প্রতি যাত্রায় ভাড়া (৳)')}</p>
                  <input type="number" min={0} value={leg.fare}
                    onChange={e => updateLeg(i, 'fare', Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-700 border border-kj-line dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:text-white" />
                </div>
                <div>
                  <p className="text-xs text-kj-text-dim mb-1">{lbl('Trips per day', 'দৈনিক যাত্রার সংখ্যা')}</p>
                  <input type="number" min={1} max={10} value={leg.trips}
                    onChange={e => updateLeg(i, 'trips', Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-700 border border-kj-line dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:text-white" />
                </div>
              </div>
            </div>
          ))}

          {legs.length > 0 && (
            <div>
              <p className="text-xs text-kj-text-dim mb-1">{lbl('Working days per month', 'মাসে কর্মদিবস')}</p>
              <input type="number" min={1} max={31} value={workDays}
                onChange={e => updateWorkDays(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-slate-700 border border-kj-line dark:border-gray-600 rounded-xl px-3 py-2 text-sm dark:text-white" />
            </div>
          )}
        </div>




        <AdSenseAd adSlot="auto" native className="w-full max-w-[728px] mx-auto px-2 md:px-0 shrink-0" />

        {legs.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: lbl('Daily', 'দৈনিক'), value: dailyCost },
                { label: lbl('Monthly', 'মাসিক'), value: monthlyCost },
                { label: lbl('Yearly', 'বার্ষিক'), value: yearlyCost },
              ].map(({ label, value }) => (
                <div key={label} className="bg-kj-panel rounded-2xl p-3 border border-kj-line text-center">
                  <p className="text-xs text-kj-text-dim mb-1">{label}</p>
                  <p className="text-lg font-black text-kj-text">৳{value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {monthlyCost > 1500 && (
              <div className="bg-kj-primary-soft dark:bg-emerald-900/20 border border-kj-primary/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-kj-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                      {lbl('A pass could save you money!', 'পাস কিনলে সাশ্রয় হতে পারে!')}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-kj-primary mt-1">
                      {lbl(
                        `Metro Rapid Pass (৳1,000) could reduce monthly costs. You're currently spending ৳${monthlyCost.toLocaleString()}/month.`,
                        `মেট্রো র‍্যাপিড পাস (৳1,000) + বিআরটিসি পাস (৳800) = ৳1,800/মাস। বর্তমান খরচ ৳${monthlyCost.toLocaleString()} — সাশ্রয় হতে পারে ৳${Math.max(0, monthlyCost - 1800).toLocaleString()}`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-kj-panel rounded-2xl p-4 border border-kj-line">
          <h3 className="font-bold text-kj-text text-sm mb-3">{lbl('Average fares by mode', 'ধরন অনুযায়ী গড় ভাড়া')}</h3>
          <div className="space-y-2">
            {TRANSPORT_MODES.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-kj-text-dim">{m.icon} {language === 'bn' ? m.label : m.labelEn}</span>
                <span className="font-semibold text-kj-text">৳{m.avgPerTrip} {lbl('avg', 'গড়')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-4" />

      </div>
    </div>
  );
}
