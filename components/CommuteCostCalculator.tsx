import HowKoyJaboHelps from './HowKoyJaboHelps';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, TrendingDown, Trash2, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';
import SponsoredAdSlot from './SponsoredAdSlot';

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

type Period = 'daily' | 'monthly' | 'yearly';

export default function CommuteCostCalculator({ onBack }: Props) {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  const [legs, setLegs] = useState<Leg[]>([]);
  const [workDays, setWorkDays] = useState(22);
  const [hasSaved, setHasSaved] = useState(false);
  const [activePeriod, setActivePeriod] = useState<Period>('monthly');

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

  const displayCost = activePeriod === 'daily' ? dailyCost : activePeriod === 'monthly' ? monthlyCost : yearlyCost;

  const DOT_COLORS = ['bg-kj-primary', 'bg-kj-accent', 'bg-kj-amber', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];

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
        <span className="font-bengali font-bold text-base text-kj-text flex-1">
          {lbl('Fare Calculator', 'ভাড়া হিসাব')}
        </span>
        {hasSaved && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bengali"
          >
            <Trash2 className="w-3.5 h-3.5" /> {lbl('Clear', 'মুছুন')}
          </button>
        )}
      </div>

      <div className="px-4 py-5 space-y-5 max-w-4xl mx-auto w-full">

        {/* Hero card */}
        <div
          className="rounded-[22px] p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-white/70 font-sans">
                {lbl('✦ KoyJabo · Tools', '✦ কই যাবো · টুলস')}
              </p>
              <h1 className="font-bengali font-bold text-xl text-white leading-tight mt-0.5">
                {lbl('Commute Cost Calculator', 'ভাড়া হিসাব')}
              </h1>
              <p className="font-bengali text-[12px] text-white/70 mt-0.5">
                {lbl('Daily · Monthly · Yearly estimates', 'দৈনিক · মাসিক · বার্ষিক হিসাব')}
              </p>
            </div>
          </div>
        </div>

        {/* Mode comparison section */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans mb-3">
            {lbl('Average fares by mode', 'ধরন অনুযায়ী গড় ভাড়া')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {TRANSPORT_MODES.map((m) => (
              <div key={m.id} className="dc-card rounded-2xl p-3.5 flex flex-col gap-2">
                <span className="text-2xl leading-none">{m.icon}</span>
                <div>
                  <p className="font-bengali text-[11px] text-kj-text-faint">{language === 'bn' ? m.label : m.labelEn}</p>
                  <p className="font-sans font-extrabold text-[20px] leading-tight text-kj-primary tracking-tight">৳{m.avgPerTrip}</p>
                  <p className="text-[10px] text-kj-text-faint font-bengali">{lbl('per ride avg', 'প্রতি যাত্রা গড়')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Period selector + inputs */}
        <div className="dc-card rounded-[22px] p-5 space-y-4">
          <h2 className="font-bengali font-bold text-base text-kj-text">
            {lbl('Your commute legs', 'আপনার দৈনিক যাতায়াত')}
          </h2>

          {/* Period chip row */}
          <div className="flex gap-2">
            {(['daily', 'monthly', 'yearly'] as Period[]).map((p) => {
              const label = p === 'daily' ? lbl('Daily', 'দৈনিক') : p === 'monthly' ? lbl('Monthly', 'মাসিক') : lbl('Yearly', 'বার্ষিক');
              const active = activePeriod === p;
              return (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border font-bengali ${
                    active
                      ? 'text-kj-primary-ink border-kj-primary'
                      : 'bg-kj-panel-muted text-kj-text border-kj-line hover:border-kj-primary/40'
                  }`}
                  style={active ? {
                    background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
                    boxShadow: '0 4px 12px -4px var(--kj-primary)',
                  } : undefined}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Leg list */}
          <div className="space-y-3">
            {legs.length === 0 && (
              <button
                onClick={addLeg}
                className="w-full py-8 border-2 border-dashed border-kj-line rounded-2xl text-kj-text-faint hover:border-kj-primary/60 hover:text-kj-primary transition-colors text-sm font-bengali flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {lbl('Tap to add your first transport leg', 'যাতায়াতের তথ্য যোগ করুন')}
              </button>
            )}

            {legs.map((leg, i) => (
              <div key={i} className="dc-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT_COLORS[i % DOT_COLORS.length]}`} />
                  <span className="text-lg">{TRANSPORT_MODES.find(m => m.id === leg.mode)?.icon}</span>
                  <select
                    value={leg.mode}
                    onChange={e => {
                      const mode = TRANSPORT_MODES.find(m => m.id === e.target.value);
                      updateLeg(i, 'mode', e.target.value);
                      if (mode) updateLeg(i, 'fare', mode.avgPerTrip);
                    }}
                    className="flex-1 bg-kj-input-bg border border-kj-line rounded-xl px-3 py-2 text-sm text-kj-text focus:outline-none focus:border-kj-primary/50"
                  >
                    {TRANSPORT_MODES.map(m => (
                      <option key={m.id} value={m.id}>{language === 'bn' ? m.label : m.labelEn}</option>
                    ))}
                  </select>
                  <button onClick={() => removeLeg(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans mb-1.5">
                      {lbl('Fare per trip (৳)', 'প্রতি যাত্রায় ভাড়া (৳)')}
                    </p>
                    <input
                      type="number" min={0} value={leg.fare}
                      onChange={e => updateLeg(i, 'fare', Number(e.target.value))}
                      className="w-full bg-kj-input-bg border border-kj-line rounded-xl px-3 py-2 text-sm text-kj-text focus:outline-none focus:border-kj-primary/50"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans mb-1.5">
                      {lbl('Trips per day', 'দৈনিক যাত্রার সংখ্যা')}
                    </p>
                    <input
                      type="number" min={1} max={10} value={leg.trips}
                      onChange={e => updateLeg(i, 'trips', Number(e.target.value))}
                      className="w-full bg-kj-input-bg border border-kj-line rounded-xl px-3 py-2 text-sm text-kj-text focus:outline-none focus:border-kj-primary/50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Working days input */}
          {legs.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans mb-1.5">
                {lbl('Working days per month', 'মাসে কর্মদিবস')}
              </p>
              <input
                type="number" min={1} max={31} value={workDays}
                onChange={e => updateWorkDays(Number(e.target.value))}
                className="w-full bg-kj-input-bg border border-kj-line rounded-xl px-3 py-2 text-sm text-kj-text focus:outline-none focus:border-kj-primary/50"
              />
            </div>
          )}

          {/* Add leg button */}
          <button
            onClick={addLeg}
            className="w-full py-3 border-2 border-dashed border-kj-line rounded-2xl text-kj-text-dim hover:border-kj-primary/60 hover:text-kj-primary transition-colors text-sm font-bengali flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {lbl('Add transport leg', 'আরেকটি যাতায়াত যোগ করুন')}
          </button>
        </div>

        {/* Result card */}
        {legs.length > 0 && (
          <>
            <div className="dc-card rounded-[22px] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
                  {activePeriod === 'daily' ? lbl('Daily total', 'দৈনিক মোট') : activePeriod === 'monthly' ? lbl('Monthly total', 'মাসিক মোট') : lbl('Yearly total', 'বার্ষিক মোট')}
                </p>
              </div>
              <div className="text-center py-2">
                <p className="font-sans font-extrabold text-[42px] leading-none tracking-tight text-kj-primary">
                  ৳{displayCost.toLocaleString()}
                </p>
                <p className="font-bengali text-sm text-kj-text-dim mt-1">
                  {activePeriod === 'daily'
                    ? lbl(`${legs.length} leg${legs.length > 1 ? 's' : ''} · per workday`, `${legs.length}টি পথ · প্রতি কর্মদিন`)
                    : activePeriod === 'monthly'
                    ? lbl(`${workDays} working days/month`, `${workDays} কর্মদিন/মাস`)
                    : lbl(`12 months · ${workDays} days/month`, `১২ মাস · ${workDays} দিন/মাস`)
                  }
                </p>
              </div>

              {/* Comparison row */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-dashed border-kj-line">
                {[
                  { label: lbl('Daily', 'দৈনিক'), value: dailyCost },
                  { label: lbl('Monthly', 'মাসিক'), value: monthlyCost },
                  { label: lbl('Yearly', 'বার্ষিক'), value: yearlyCost },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-kj-text-faint font-sans mb-1">{label}</p>
                    <p className="font-sans font-extrabold text-base text-kj-text">৳{value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {monthlyCost > 1500 && (
              <div
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: 'var(--kj-primary-soft)', border: '1px solid color-mix(in srgb, var(--kj-primary) 30%, transparent)' }}
              >
                <TrendingDown className="w-5 h-5 text-kj-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-kj-primary text-sm font-bengali">
                    {lbl('A pass could save you money!', 'পাস কিনলে সাশ্রয় হতে পারে!')}
                  </p>
                  <p className="text-xs text-kj-text-dim mt-1 font-bengali leading-relaxed">
                    {lbl(
                      `Metro Rapid Pass (৳1,000) could reduce monthly costs. You're currently spending ৳${monthlyCost.toLocaleString()}/month.`,
                      `মেট্রো র‍্যাপিড পাস (৳1,000) + বিআরটিসি পাস (৳800) = ৳1,800/মাস। বর্তমান খরচ ৳${monthlyCost.toLocaleString()} — সাশ্রয় হতে পারে ৳${Math.max(0, monthlyCost - 1800).toLocaleString()}`
                    )}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Ad slot */}
        <SponsoredAdSlot language={language} size="300x250" compact />

      </div>
    </div>
  );
}
