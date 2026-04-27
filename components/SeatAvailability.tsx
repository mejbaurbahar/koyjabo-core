import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Ticket, ExternalLink, Train, Search, ChevronLeft, Star } from 'lucide-react';
import { BD_TRAIN_ROUTES, BDTrainRoute } from '../data/bangladeshTrainData';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureUsage } from '../services/analyticsService';

interface Props { onBack: () => void; }

function getFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem('seat_avail_favs') || '[]'); } catch { return []; }
}
function saveFavorites(ids: string[]) {
  localStorage.setItem('seat_avail_favs', JSON.stringify(ids));
}

export default function SeatAvailability({ onBack }: Props) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<BDTrainRoute | null>(null);
  const [favorites, setFavorites] = useState<string[]>(getFavorites);

  useEffect(() => { trackFeatureUsage('seat_availability'); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return BD_TRAIN_ROUTES;
    return BD_TRAIN_ROUTES.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.bnName.includes(q) ||
      r.from.toLowerCase().includes(q) ||
      r.to.toLowerCase().includes(q) ||
      r.number.includes(q)
    );
  }, [search]);

  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  };

  const favoriteRoutes = BD_TRAIN_ROUTES.filter(r => favorites.includes(r.id));

  if (selected) {
    const railwayLink = 'https://eticket.railway.gov.bd/';
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 px-3 py-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-600 dark:text-gray-400 font-medium text-sm">
            <ChevronLeft className="w-5 h-5" />
            {lbl('Back', 'ফিরে যান')}
          </button>
          <Train className="w-5 h-5 text-blue-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">{language === 'bn' ? selected.bnName : selected.name}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{lbl('Train No.', 'ট্রেন নং')} {selected.number}</p>
          </div>
          <button onClick={(e) => toggleFavorite(selected.id, e)}
            className={`p-2 rounded-full transition-colors ${favorites.includes(selected.id) ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}>
            <Star className="w-5 h-5" fill={favorites.includes(selected.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">{lbl('Departs', 'ছাড়বে')}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{selected.dhakaDepart}</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{selected.from}</p>
              </div>
              <div className="flex-1 flex items-center px-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <Train className="w-5 h-5 text-gray-400 mx-2 shrink-0" />
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">{lbl('Arrives', 'পৌঁছাবে')}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{selected.destinationArrive}</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">{selected.to}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">{lbl('Return Departs', 'ফেরত ছাড়বে')}</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{selected.returnDepart}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">{lbl('Arrives Dhaka', 'ঢাকা পৌঁছাবে')}</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{selected.dhakaArrive}</p>
              </div>
            </div>
            {selected.offDay && (
              <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
                {lbl('Off day:', 'ছুটির দিন:')} {selected.offDay}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{lbl('Fare (approx.)', 'আনুমানিক ভাড়া')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {selected.fare.shuvoron && <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-2 text-center"><p className="text-xs text-gray-500 dark:text-gray-400">{lbl('Shuvoron', 'শুভ্রন')}</p><p className="text-sm font-bold text-gray-900 dark:text-white">৳{selected.fare.shuvoron}</p></div>}
              {selected.fare.shovan && <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-2 text-center"><p className="text-xs text-gray-500 dark:text-gray-400">{lbl('Shobon', 'শোভন')}</p><p className="text-sm font-bold text-gray-900 dark:text-white">৳{selected.fare.shovan}</p></div>}
              {selected.fare.shovanChair && <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2 text-center"><p className="text-xs text-blue-600 dark:text-blue-400">{lbl('Shobon Chair', 'শোভন চেয়ার')}</p><p className="text-sm font-bold text-blue-800 dark:text-blue-200">৳{selected.fare.shovanChair}</p></div>}
              {selected.fare.firstClass && <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-2 text-center"><p className="text-xs text-amber-600 dark:text-amber-400">{lbl('1st Class', '১ম শ্রেণী')}</p><p className="text-sm font-bold text-amber-800 dark:text-amber-200">৳{selected.fare.firstClass}</p></div>}
              {selected.fare.acChair && <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2 text-center"><p className="text-xs text-purple-600 dark:text-purple-400">{lbl('AC Chair', 'এসি চেয়ার')}</p><p className="text-sm font-bold text-purple-800 dark:text-purple-200">৳{selected.fare.acChair}</p></div>}
              {selected.fare.acBerth && <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-2 text-center"><p className="text-xs text-indigo-600 dark:text-indigo-400">{lbl('AC Berth', 'এসি বার্থ')}</p><p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">৳{selected.fare.acBerth}</p></div>}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">{lbl('Book Ticket', 'টিকিট বুকিং')}</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
              {lbl('Book your seat on the official Bangladesh Railway portal:', 'বাংলাদেশ রেলওয়ের অফিসিয়াল পোর্টালে সিট বুক করুন:')}
            </p>
            <a href={railwayLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-amber-50 dark:hover:bg-amber-900/30">
              <ExternalLink className="w-4 h-4 shrink-0" /> {lbl('Bangladesh Railway e-Ticketing', 'বাংলাদেশ রেলওয়ে ই-টিকেটিং')}
            </a>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">{lbl('Tips', 'টিপস')}</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• {lbl('Book 10 days ahead — popular routes fill fast', 'যাত্রার ১০ দিন আগে টিকিট কাটুন — জনপ্রিয় রুটে আসন দ্রুত শেষ হয়')}</li>
              <li>• {lbl('Book 30 days ahead for Eid/holidays', 'ঈদ বা ছুটির আগে ৩০ দিন আগে বুক করুন')}</li>
              <li>• {lbl('AC Berth and Shuvoron Chair sell out first', 'এসি বার্থ ও শোভন চেয়ার আগে শেষ হয়')}</li>
              <li>• {lbl('NID required for e-ticket — carry it', 'ই-টিকিটে NID লাগে — সাথে রাখুন')}</li>
            </ul>
          </div>
          <div className="h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0">
          <Ticket className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{lbl('Seat Availability', 'সিট প্রাপ্যতা')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{BD_TRAIN_ROUTES.length} {lbl('trains', 'ট্রেন')}</p>
        </div>
      </div>

      <div className="p-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lbl('Search by train name, number, or destination...', 'ট্রেনের নাম, নম্বর বা গন্তব্য খুঁজুন...')}
            className="w-full pl-9 pr-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm dark:text-white" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-2">
        {/* Favorites section */}
        {!search && favoriteRoutes.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> {lbl('Saved Trains', 'পছন্দের ট্রেন')}
            </p>
            {favoriteRoutes.map(t => (
              <button key={t.id} onClick={() => setSelected(t)}
                className="w-full bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800 text-left hover:border-yellow-400 dark:hover:border-yellow-600 transition-colors active:scale-[0.99] mb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{language === 'bn' ? t.bnName : t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.from} → {t.to} · #{t.number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t.dhakaDepart}</p>
                    <button onClick={(e) => toggleFavorite(t.id, e)} className="text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </button>
            ))}
            <div className="border-b border-gray-100 dark:border-gray-800 mb-3" />
          </div>
        )}

        {filtered.map(t => (
          <button key={t.id} onClick={() => setSelected(t)}
            className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 text-left hover:border-blue-300 dark:hover:border-blue-700 transition-colors active:scale-[0.99]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{language === 'bn' ? t.bnName : t.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.from} → {t.to} · #{t.number}</p>
                {t.offDay && <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{lbl('Off:', 'ছুটি:')} {t.offDay}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t.dhakaDepart}</p>
                  <p className="text-xs text-gray-400">{lbl('departs', 'ছাড়বে')}</p>
                </div>
                <button onClick={(e) => toggleFavorite(t.id, e)}
                  className={`p-1.5 rounded-full transition-colors ${favorites.includes(t.id) ? 'text-yellow-500' : 'text-gray-200 dark:text-gray-700 hover:text-yellow-400'}`}>
                  <Star className="w-4 h-4" fill={favorites.includes(t.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Train className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{lbl('No trains found', 'কোনো ট্রেন পাওয়া যায়নি')}</p>
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}
