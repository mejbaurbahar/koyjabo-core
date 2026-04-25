import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronRight, MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props { onBack: () => void; }

interface Stop {
  id: string;
  name: string;
}

interface Leg {
  from: string;
  to: string;
  suggestion: string;
}

const COMMON_STOPS = [
  'মিরপুর-১', 'মিরপুর-১০', 'মিরপুর-১১', 'কাজীপাড়া', 'শেওড়াপাড়া', 'আগারগাঁও',
  'বিজয় সরণি', 'ফার্মগেট', 'কারওয়ান বাজার', 'শাহবাগ', 'বাংলাদেশ সচিবালয়',
  'মতিঝিল', 'উত্তরা উত্তর', 'উত্তরা সেন্টার', 'উত্তরা দক্ষিণ', 'পল্লবী',
  'গুলশান-১', 'গুলশান-২', 'বনানী', 'মহাখালী', 'ধানমন্ডি-২৭', 'সায়েদাবাদ',
  'যাত্রাবাড়ী', 'গুলিস্তান', 'সদরঘাট', 'আজিমপুর', 'নিউমার্কেট', 'পরীবাগ',
];

function suggestRoute(from: string, to: string): string {
  const metro = ['মিরপুর-১', 'মিরপুর-১০', 'মিরপুর-১১', 'কাজীপাড়া', 'শেওড়াপাড়া',
    'আগারগাঁও', 'বিজয় সরণি', 'ফার্মগেট', 'কারওয়ান বাজার', 'শাহবাগ',
    'বাংলাদেশ সচিবালয়', 'মতিঝিল', 'উত্তরা উত্তর', 'উত্তরা সেন্টার', 'উত্তরা দক্ষিণ', 'পল্লবী'];
  if (metro.includes(from) && metro.includes(to)) {
    return `মেট্রো রেল (MRT-6) ব্যবহার করুন — দ্রুততম বিকল্প`;
  }
  if (from.includes('উত্তরা') || to.includes('উত্তরা')) {
    return 'BRT বা মেট্রো রেল নিন — সরাসরি সংযোগ আছে';
  }
  if (from.includes('সায়েদাবাদ') || to.includes('সায়েদাবাদ')) {
    return 'গুলিস্তান হয়ে লোকাল বাস নিন';
  }
  return 'লোকাল বাস বা সিএনজি ব্যবহার করুন — রুট অনুযায়ী পরিবর্তন হতে পারে';
}

export default function MultiStopPlanner({ onBack }: Props) {
  const { t } = useLanguage();
  const [stops, setStops] = useState<Stop[]>([
    { id: '1', name: '' },
    { id: '2', name: '' },
  ]);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [planned, setPlanned] = useState(false);
  const [query, setQuery] = useState('');
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const addStop = () => {
    setStops(s => [...s, { id: crypto.randomUUID(), name: '' }]);
    setPlanned(false);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(s => s.filter(x => x.id !== id));
    setPlanned(false);
  };

  const updateStop = (id: string, name: string) => {
    setStops(s => s.map(x => x.id === id ? { ...x, name } : x));
    setPlanned(false);
  };

  const plan = () => {
    const filled = stops.filter(s => s.name.trim());
    if (filled.length < 2) return;
    const newLegs: Leg[] = [];
    for (let i = 0; i < filled.length - 1; i++) {
      newLegs.push({
        from: filled[i].name,
        to: filled[i + 1].name,
        suggestion: suggestRoute(filled[i].name, filled[i + 1].name),
      });
    }
    setLegs(newLegs);
    setPlanned(true);
  };

  const filtered = COMMON_STOPS.filter(s =>
    s.includes(query) || s.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">মাল্টি-স্টপ প্ল্যানার</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Multi-Stop Journey Planner</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-2">
          {stops.map((stop, i) => (
            <div key={stop.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-500 text-white' : i === stops.length - 1 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'}`}>
                  {i + 1}
                </div>
                {i < stops.length - 1 && <div className="w-0.5 h-4 bg-gray-200 dark:bg-slate-600 my-0.5" />}
              </div>
              <div className="flex-1 relative">
                <input
                  value={stop.name}
                  onChange={e => { updateStop(stop.id, e.target.value); setQuery(e.target.value); setFocusedId(stop.id); }}
                  onFocus={() => setFocusedId(stop.id)}
                  onBlur={() => setTimeout(() => setFocusedId(null), 200)}
                  placeholder={i === 0 ? 'যাত্রা শুরু' : i === stops.length - 1 ? 'গন্তব্য' : `স্টপ ${i + 1}`}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm dark:text-white"
                />
                {focusedId === stop.id && query && filtered.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
                    {filtered.map(s => (
                      <button key={s} type="button" onMouseDown={() => { updateStop(stop.id, s); setQuery(''); setFocusedId(null); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {stops.length > 2 && (
                <button onClick={() => removeStop(stop.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button onClick={addStop} className="flex items-center gap-1.5 px-3 py-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl">
              <Plus className="w-4 h-4" /> স্টপ যোগ করুন
            </button>
            <button onClick={plan}
              disabled={stops.filter(s => s.name.trim()).length < 2}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-semibold text-sm rounded-xl">
              রুট পরিকল্পনা করুন
            </button>
          </div>
        </div>

        {planned && legs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm px-1">আপনার যাত্রা পরিকল্পনা</h3>
            {legs.map((leg, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <span className="text-blue-600 dark:text-blue-400">{leg.from}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-green-600 dark:text-green-400">{leg.to}</span>
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{leg.suggestion}</p>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">মোট যাত্রা</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{legs.length}টি পর্যায়ে {stops.filter(s => s.name).length}টি স্টপ</p>
            </div>
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}
