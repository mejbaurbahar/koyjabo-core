import SponsoredAdSlot from './SponsoredAdSlot';
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
  const [favorites, setFavorites] = useState<string[]>(getFavorites());

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
      <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">
        {/* Sticky back bar */}
        <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setSelected(null)}
            className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bengali font-bold text-base text-kj-text flex-1 truncate">
            {language === 'bn' ? selected.bnName : selected.name}
          </span>
          <button onClick={(e) => toggleFavorite(selected.id, e)}
            className={`w-9 h-9 rounded-xl border border-kj-line bg-kj-panel flex items-center justify-center transition-colors ${favorites.includes(selected.id) ? 'text-kj-amber border-kj-amber/40' : 'text-kj-text-faint'}`}>
            <Star className="w-4 h-4" fill={favorites.includes(selected.id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto w-full">
          {/* Vehicle info header */}
          <div className="dc-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0">
                <Train className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-kj-text text-base truncate">{language === 'bn' ? selected.bnName : selected.name}</p>
                <p className="text-xs text-kj-text-dim">{lbl('Train No.', 'ট্রেন নং')} {selected.number}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <p className="text-[11px] text-kj-text-faint uppercase tracking-wide">{lbl('Departs', 'ছাড়বে')}</p>
                <p className="text-2xl font-black text-kj-text">{selected.dhakaDepart}</p>
                <p className="text-xs font-semibold text-kj-primary truncate max-w-[80px]">{selected.from}</p>
              </div>
              <div className="flex-1 flex items-center px-3">
                <div className="flex-1 h-px bg-kj-line" />
                <div className="mx-2 w-7 h-7 rounded-full bg-kj-chip-bg border border-kj-line flex items-center justify-center">
                  <Train className="w-3.5 h-3.5 text-kj-text-faint" />
                </div>
                <div className="flex-1 h-px bg-kj-line" />
              </div>
              <div className="text-center">
                <p className="text-[11px] text-kj-text-faint uppercase tracking-wide">{lbl('Arrives', 'পৌঁছাবে')}</p>
                <p className="text-2xl font-black text-kj-text">{selected.destinationArrive}</p>
                <p className="text-xs font-semibold text-green-500 truncate max-w-[80px]">{selected.to}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-kj-line">
              <div className="bg-kj-chip-bg rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-kj-text-faint uppercase tracking-wide mb-0.5">{lbl('Return Departs', 'ফেরত ছাড়বে')}</p>
                <p className="text-sm font-bold text-kj-text-dim">{selected.returnDepart}</p>
              </div>
              <div className="bg-kj-chip-bg rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-kj-text-faint uppercase tracking-wide mb-0.5">{lbl('Arrives Dhaka', 'ঢাকা পৌঁছাবে')}</p>
                <p className="text-sm font-bold text-kj-text-dim">{selected.dhakaArrive}</p>
              </div>
            </div>

            {selected.offDay && (
              <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl py-1.5">
                {lbl('Off day:', 'ছুটির দিন:')} {selected.offDay}
              </p>
            )}
          </div>

          {/* Fare grid */}
          <div className="dc-card p-4">
            <p className="text-[11px] font-bold text-kj-text-faint uppercase tracking-widest mb-3">{lbl('Fare (approx.)', 'আনুমানিক ভাড়া')}</p>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
              {selected.fare.shuvan && (
                <div className="bg-kj-chip-bg rounded-xl p-2.5 text-center">
                  <p className="text-xs text-kj-text-faint">{lbl('Shuvan', 'শুভন')}</p>
                  <p className="text-sm font-bold text-kj-text mt-0.5">৳{selected.fare.shuvan}</p>
                </div>
              )}
              {selected.fare.shuvanChair && (
                <div className="bg-kj-primary-soft rounded-xl p-2.5 text-center">
                  <p className="text-xs text-kj-primary">{lbl('Shuvan Chair', 'শুভন চেয়ার')}</p>
                  <p className="text-sm font-bold text-kj-primary mt-0.5">৳{selected.fare.shuvanChair}</p>
                </div>
              )}
              {selected.fare.snigdha && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2.5 text-center">
                  <p className="text-xs text-purple-600 dark:text-purple-400">{lbl('Snigdha', 'স্নিগ্ধা')}</p>
                  <p className="text-sm font-bold text-purple-800 dark:text-purple-200 mt-0.5">৳{selected.fare.snigdha}</p>
                </div>
              )}
              {selected.fare.firstClassBerth && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-2.5 text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400">{lbl('1st Class Berth', '১ম শ্রেণী বার্থ')}</p>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mt-0.5">৳{selected.fare.firstClassBerth}</p>
                </div>
              )}
              {selected.fare.acBerth && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-2.5 text-center">
                  <p className="text-xs text-kj-neon-violet dark:text-indigo-400">{lbl('AC Berth', 'এসি বার্থ')}</p>
                  <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200 mt-0.5">৳{selected.fare.acBerth}</p>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="dc-card p-4">
            <p className="text-[11px] font-bold text-kj-text-faint uppercase tracking-widest mb-3">{lbl('Seat Legend', 'আসন কিংবদন্তি')}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-kj-panel border border-kj-line" />
                <span className="text-xs text-kj-text-dim">{lbl('Available', 'পাওয়া যাচ্ছে')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-kj-primary" />
                <span className="text-xs text-kj-text-dim">{lbl('Selected', 'বেছে নেওয়া')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-kj-chip-bg border border-kj-line flex items-center justify-center">
                  <span className="text-[8px] text-kj-text-faint line-through">●</span>
                </div>
                <span className="text-xs text-kj-text-dim">{lbl('Taken', 'ভরা')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-pink-400" />
                <span className="text-xs text-kj-text-dim">{lbl('Ladies', 'মহিলা')}</span>
              </div>
            </div>
          </div>

          {/* Book ticket */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-400/20 p-4">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">{lbl('Book Ticket', 'টিকিট বুকিং')}</p>
            <p className="text-xs text-kj-text-dim mb-3">
              {lbl('Book your seat on the official Bangladesh Railway portal:', 'বাংলাদেশ রেলওয়ের অফিসিয়াল পোর্টালে সিট বুক করুন:')}
            </p>
            <a href={railwayLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-kj-panel border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-primary hover:border-kj-primary/40 transition-colors">
              <ExternalLink className="w-4 h-4 shrink-0" /> {lbl('Bangladesh Railway e-Ticketing', 'বাংলাদেশ রেলওয়ে ই-টিকেটিং')}
            </a>
          </div>

          {/* Tips */}
          <div className="dc-card p-4">
            <p className="text-[11px] font-bold text-kj-text-faint uppercase tracking-widest mb-3">{lbl('Tips', 'টিপস')}</p>
            <ul className="space-y-2 text-sm text-kj-text-dim">
              <li className="flex items-start gap-2"><span className="text-kj-primary mt-0.5">✦</span>{lbl('Book 10 days ahead — popular routes fill fast', 'যাত্রার ১০ দিন আগে টিকিট কাটুন — জনপ্রিয় রুটে আসন দ্রুত শেষ হয়')}</li>
              <li className="flex items-start gap-2"><span className="text-kj-primary mt-0.5">✦</span>{lbl('Book 30 days ahead for Eid/holidays', 'ঈদ বা ছুটির আগে ৩০ দিন আগে বুক করুন')}</li>
              <li className="flex items-start gap-2"><span className="text-kj-primary mt-0.5">✦</span>{lbl('AC Berth and Shuvoron Chair sell out first', 'এসি বার্থ ও শোভন চেয়ার আগে শেষ হয়')}</li>
              <li className="flex items-start gap-2"><span className="text-kj-primary mt-0.5">✦</span>{lbl('NID required for e-ticket — carry it', 'ই-টিকিটে NID লাগে — সাথে রাখুন')}</li>
            </ul>
          </div>

          <div className="h-4" />
        </div>
      </div>
    );
  }

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
          {lbl('Seat Availability', 'আসন প্রাপ্যতা')}
        </span>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto w-full">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kj-text-faint" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={lbl('Search by train name, number, or destination...', 'ট্রেনের নাম, নম্বর বা গন্তব্য খুঁজুন...')}
            className="w-full pl-9 pr-4 bg-kj-panel border border-kj-line rounded-xl py-2.5 text-sm text-kj-text placeholder:text-kj-text-faint focus:border-kj-primary/40 outline-none transition-colors" />
        </div>

        {/* Stat strip */}
        <div className="flex gap-4">
          <div>
            <div className="font-extrabold text-lg text-kj-primary leading-none">{BD_TRAIN_ROUTES.length}</div>
            <div className="text-[11px] text-kj-text-faint">{lbl('Trains', 'ট্রেন')}</div>
          </div>
          <div>
            <div className="font-extrabold text-lg text-kj-primary leading-none">{favorites.length}</div>
            <div className="text-[11px] text-kj-text-faint">{lbl('Saved', 'পছন্দের')}</div>
          </div>
        </div>

        {/* Favorites section */}
        {!search && favoriteRoutes.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-kj-amber uppercase tracking-widest mb-2 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> {lbl('Saved Trains', 'পছন্দের ট্রেন')}
            </p>
            <div className="space-y-2">
              {favoriteRoutes.map(tr => (
                <button key={tr.id} onClick={() => setSelected(tr)}
                  className="w-full dc-card p-4 text-left border-kj-amber/30 hover:border-kj-amber/60 transition-colors active:scale-[0.99]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-kj-text text-sm truncate">{language === 'bn' ? tr.bnName : tr.name}</p>
                      <p className="text-xs text-kj-text-dim mt-0.5">{tr.from} → {tr.to} · #{tr.number}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-sm font-bold text-kj-primary">{tr.dhakaDepart}</p>
                      <button onClick={(e) => toggleFavorite(tr.id, e)} className="text-kj-amber">
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-b border-kj-line my-3" />
          </div>
        )}

        {/* Train list */}
        <div className="space-y-2">
          {filtered.map(tr => (
            <button key={tr.id} onClick={() => setSelected(tr)}
              className="w-full dc-card p-4 text-left hover:border-kj-primary/40 transition-colors active:scale-[0.99]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-kj-text text-sm truncate">{language === 'bn' ? tr.bnName : tr.name}</p>
                  <p className="text-xs text-kj-text-dim mt-0.5">{tr.from} → {tr.to} · #{tr.number}</p>
                  {tr.offDay && <p className="text-xs text-amber-500 mt-0.5">{lbl('Off:', 'ছুটি:')} {tr.offDay}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-kj-primary">{tr.dhakaDepart}</p>
                    <p className="text-[10px] text-kj-text-faint">{lbl('departs', 'ছাড়বে')}</p>
                  </div>
                  <button onClick={(e) => toggleFavorite(tr.id, e)}
                    className={`p-1.5 rounded-full transition-colors ${favorites.includes(tr.id) ? 'text-kj-amber' : 'text-kj-text-faint hover:text-kj-amber'}`}>
                    <Star className="w-4 h-4" fill={favorites.includes(tr.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-kj-chip-bg border border-kj-line flex items-center justify-center mx-auto mb-4">
                <Train className="w-8 h-8 text-kj-text-faint" />
              </div>
              <p className="text-kj-text-dim font-semibold">{lbl('No trains found', 'কোনো ট্রেন পাওয়া যায়নি')}</p>
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>
    
        <SponsoredAdSlot language={language as 'en' | 'bn'} size="300x250" compact />
</div>
  );
}
