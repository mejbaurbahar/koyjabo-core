import React, { useState } from 'react';
import { ArrowLeft, Ticket, ExternalLink, Train } from 'lucide-react';
import { buildSeatAvailabilityLinks } from '../services/communityDataService';

interface Props { onBack: () => void; }

interface TrainEntry {
  name: string;
  number: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  days: string;
}

const TRAINS: TrainEntry[] = [
  { name: 'সোনার বাংলা এক্সপ্রেস', number: '787', from: 'ঢাকা', to: 'চট্টগ্রাম', departure: '07:00', arrival: '13:00', days: 'রোজ' },
  { name: 'তূর্ণা-নিশীথা', number: '742', from: 'ঢাকা', to: 'চট্টগ্রাম', departure: '23:00', arrival: '05:00', days: 'রোজ' },
  { name: 'সুবর্ণ এক্সপ্রেস', number: '723', from: 'ঢাকা', to: 'চট্টগ্রাম', departure: '06:40', arrival: '12:30', days: 'রোজ' },
  { name: 'সুন্দরবন এক্সপ্রেস', number: '725', from: 'ঢাকা', to: 'খুলনা', departure: '06:20', arrival: '16:15', days: 'রোজ' },
  { name: 'চিত্রা এক্সপ্রেস', number: '763', from: 'ঢাকা', to: 'খুলনা', departure: '19:00', arrival: '06:15', days: 'রোজ' },
  { name: 'একতা এক্সপ্রেস', number: '705', from: 'ঢাকা', to: 'রাজশাহী', departure: '06:20', arrival: '13:05', days: 'রোজ' },
  { name: 'সিল্কসিটি এক্সপ্রেস', number: '753', from: 'ঢাকা', to: 'রাজশাহী', departure: '14:40', arrival: '21:40', days: 'রোজ' },
  { name: 'দ্রুতযান এক্সপ্রেস', number: '757', from: 'ঢাকা', to: 'দিনাজপুর', departure: '07:30', arrival: '17:40', days: 'রোজ' },
  { name: 'পদ্মা এক্সপ্রেস', number: '767', from: 'ঢাকা', to: 'রাজশাহী', departure: '23:10', arrival: '06:35', days: 'রোজ' },
  { name: 'তিস্তা এক্সপ্রেস', number: '709', from: 'ঢাকা', to: 'লালমনিরহাট', departure: '07:45', arrival: '19:40', days: 'রোজ' },
  { name: 'মোহনগঞ্জ এক্সপ্রেস', number: '727', from: 'ঢাকা', to: 'মোহনগঞ্জ', departure: '07:30', arrival: '14:20', days: 'রোজ' },
  { name: 'জয়ন্তিকা এক্সপ্রেস', number: '715', from: 'ঢাকা', to: 'সিলেট', departure: '10:30', arrival: '17:00', days: 'রোজ' },
  { name: 'পারাবত এক্সপ্রেস', number: '709', from: 'ঢাকা', to: 'সিলেট', departure: '14:40', arrival: '21:00', days: 'রোজ' },
];

export default function SeatAvailability({ onBack }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TrainEntry | null>(null);

  const filtered = TRAINS.filter(t =>
    t.name.includes(search) || t.from.includes(search) || t.to.includes(search) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    const links = buildSeatAvailabilityLinks(selected.name, selected.number);
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={() => setSelected(null)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <Train className="w-5 h-5 text-blue-500" />
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900 dark:text-white">{selected.name}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">ট্রেন নং {selected.number}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">ছাড়বে</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{selected.departure}</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{selected.from}</p>
              </div>
              <div className="flex-1 flex items-center px-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <Train className="w-5 h-5 text-gray-400 mx-2" />
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">পৌঁছাবে</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{selected.arrival}</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">{selected.to}</p>
              </div>
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">{selected.days} চলে</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">সিট বুকিং ও প্রাপ্যতা</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">রিয়েল-টাইম সিট প্রাপ্যতা দেখতে নিচের যেকোনো লিংকে যান:</p>
            <div className="space-y-2">
              <a href={links.railwayGov} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                <ExternalLink className="w-4 h-4 shrink-0" /> বাংলাদেশ রেলওয়ে e-Ticketing
              </a>
              <a href={links.shohoz} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                <ExternalLink className="w-4 h-4 shrink-0" /> Shohoz.com এ টিকিট কাটুন
              </a>
              <a href={links.seatplan} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-amber-50 dark:hover:bg-amber-900/30">
                <ExternalLink className="w-4 h-4 shrink-0" /> Seatplan.net এ সিট দেখুন
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">টিপস</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• যাত্রার ১০ দিন আগে টিকিট কাটুন — জনপ্রিয় রুটে আসন দ্রুত শেষ হয়</li>
              <li>• ঈদ বা ছুটির আগে ৩০ দিন আগে বুক করুন</li>
              <li>• এসি বার্থ ও শোভন চেয়ার আগে শেষ হয়</li>
              <li>• ই-টিকিটে NID লাগে — সাথে রাখুন</li>
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
          <Ticket className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">সিট প্রাপ্যতা</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Train Seat Availability & Booking</p>
        </div>
      </div>

      <div className="p-4 shrink-0">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ট্রেনের নাম বা গন্তব্য খুঁজুন..."
          className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm dark:text-white" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.map(t => (
          <button key={t.number + t.name} onClick={() => setSelected(t)}
            className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 text-left hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.from} → {t.to}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t.departure}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">ছাড়বে</p>
              </div>
            </div>
          </button>
        ))}
        <div className="h-4" />
      </div>
    </div>
  );
}
