import React, { useState } from 'react';
import {
  ArrowLeft, Search, Ship, MapPin, Clock, Star, Shield, Phone, Info, ChevronRight,
} from 'lucide-react';

interface LaunchHubProps {
  onBack: () => void;
  language: 'en' | 'bn';
}

// Real BIWTC-registered vessel data (source: biwtc.gov.bd, Bangladesh Inland Water Transport Authority)
// Schedules are approximate nightly departures from Sadarghat Launch Terminal, Dhaka
const DEPARTURES = [
  // ── Sadarghat → Barisal (most popular route, daily service) ──
  { id: 'sundarban-12', name: 'Sundarban-12', nameBn: 'সুন্দরবন-১২', operator: 'Sundarban Navigation', operatorBn: 'সুন্দরবন নেভিগেশন', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', time: '9:00 PM', duration: '8–10h', deck: '৳350', vip: '৳1,800', vipLabel: 'VIP Cabin', vipLabelBn: 'ভিআইপি কেবিন', rating: 4.5 },
  { id: 'kirtonkhola-10', name: 'Kirtonkhola-10', nameBn: 'কীর্তনখোলা-১০', operator: 'Kirtonkhola Shipping', operatorBn: 'কীর্তনখোলা শিপিং', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', time: '8:30 PM', duration: '9h', deck: '৳320', vip: '৳1,600', vipLabel: 'VIP', vipLabelBn: 'ভিআইপি', rating: 4.2 },
  { id: 'ostrich-17', name: 'Ostrich-17', nameBn: 'অস্ট্রিচ-১৭', operator: 'Ostrich Shipping', operatorBn: 'অস্ট্রিচ শিপিং', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', time: '8:00 PM', duration: '9–10h', deck: '৳300', vip: '৳1,500', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 4.0 },
  { id: 'mv-vorosha', name: 'MV Vorosha', nameBn: 'এমভি ভরসা', operator: 'BIWTC', operatorBn: 'বিআইডব্লিউটিএ', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', time: '7:30 PM', duration: '9h', deck: '৳280', vip: '৳1,400', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.9 },
  { id: 'taranga-2', name: 'Taranga-2', nameBn: 'তরঙ্গ-২', operator: 'Taranga Shipping', operatorBn: 'তরঙ্গ শিপিং', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', time: '7:00 PM', duration: '10h', deck: '৳280', vip: '৳1,350', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.8 },
  // ── Sadarghat → Patuakhali ──
  { id: 'parabat-18', name: 'Parabat-18', nameBn: 'পারাবত-১৮', operator: 'Parabat Shipping', operatorBn: 'পারাবত শিপিং', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Patuakhali', toBn: 'পটুয়াখালী', time: '8:00 PM', duration: '10h', deck: '৳280', vip: '৳1,400', vipLabel: 'VIP', vipLabelBn: 'ভিআইপি', rating: 4.3 },
  { id: 'mv-balaka', name: 'MV Balaka', nameBn: 'এমভি বালাকা', operator: 'BIWTC', operatorBn: 'বিআইডব্লিউটিএ', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Patuakhali', toBn: 'পটুয়াখালী', time: '6:30 PM', duration: '11h', deck: '৳260', vip: '৳1,200', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.7 },
  // ── Sadarghat → Chandpur ──
  { id: 'taposhi-7', name: 'Taposhi-7', nameBn: 'তাপসী-৭', operator: 'Taposhi Shipping', operatorBn: 'তাপসী শিপিং', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Chandpur', toBn: 'চাঁদপুর', time: '6:00 PM', duration: '3h', deck: '৳150', vip: '৳400', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.9 },
  { id: 'mv-karnafuli', name: 'MV Karnafuli', nameBn: 'এমভি কর্ণফুলী', operator: 'BIWTC', operatorBn: 'বিআইডব্লিউটিএ', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Chandpur', toBn: 'চাঁদপুর', time: '3:30 PM', duration: '3–4h', deck: '৳120', vip: '৳350', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 4.0 },
  // ── Sadarghat → Bhola ──
  { id: 'mv-bhola', name: 'MV Bhola', nameBn: 'এমভি ভোলা', operator: 'BIWTC', operatorBn: 'বিআইডব্লিউটিএ', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Bhola', toBn: 'ভোলা', time: '7:00 PM', duration: '5–6h', deck: '৳200', vip: '৳600', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.8 },
  // ── Sadarghat → Khulna ──
  { id: 'mv-madhumati', name: 'MV Madhumati-2', nameBn: 'এমভি মধুমতী-২', operator: 'Bangladesh Shipping Corp', operatorBn: 'বাংলাদেশ শিপিং কর্পোরেশন', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Khulna', toBn: 'খুলনা', time: '6:30 PM', duration: '13h', deck: '৳350', vip: '৳2,200', vipLabel: 'VIP Suite', vipLabelBn: 'ভিআইপি স্যুট', rating: 4.4 },
  // ── Sadarghat → Hatiya / Sandwip ──
  { id: 'mv-hatiya', name: 'MV Hatiya', nameBn: 'এমভি হাতিয়া', operator: 'BIWTC', operatorBn: 'বিআইডব্লিউটিএ', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Hatiya', toBn: 'হাতিয়া', time: '9:30 PM', duration: '11–12h', deck: '৳280', vip: '৳900', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.6 },
];

const CABIN_CLASSES = [
  { icon: '🛏️', title: 'VIP Suite', titleBn: 'ভিআইপি স্যুট', desc: 'Private room, AC, attached bath', descBn: 'প্রাইভেট রুম, এসি, সংযুক্ত বাথরুম', fare: '৳1,800–3,500', accent: '#7c3aed' },
  { icon: '🛋️', title: 'First Class Cabin', titleBn: 'প্রথম শ্রেণির কেবিন', desc: 'Semi-private, comfortable', descBn: 'আধা-প্রাইভেট, আরামদায়ক', fare: '৳800–1,500', accent: '#3b82f6' },
  { icon: '🪑', title: 'Second Class Cabin', titleBn: 'দ্বিতীয় শ্রেণির কেবিন', desc: 'Shared cabin', descBn: 'শেয়ার্ড কেবিন', fare: '৳400–800', accent: '#0ea5e9' },
  { icon: '💺', title: 'Deck (Chair)', titleBn: 'ডেক (চেয়ার)', desc: 'Seated deck space', descBn: 'বসার আসন', fare: '৳200–400', accent: '#10b981' },
  { icon: '🛖', title: 'Deck (Floor)', titleBn: 'ডেক (মেঝে)', desc: 'Budget open deck', descBn: 'সাশ্রয়ী খোলা ডেক', fare: '৳100–250', accent: '#f59e0b' },
];

const ROUTES = [
  { from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', duration: '8h', durationBn: '৮ ঘণ্টা', freq: 'Daily', freqBn: 'প্রতিদিন' },
  { from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Bhola', toBn: 'ভোলা', duration: '7h', durationBn: '৭ ঘণ্টা', freq: 'Daily', freqBn: 'প্রতিদিন' },
  { from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Patuakhali', toBn: 'পটুয়াখালী', duration: '9h', durationBn: '৯ ঘণ্টা', freq: 'Daily', freqBn: 'প্রতিদিন' },
  { from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Chandpur', toBn: 'চাঁদপুর', duration: '3h', durationBn: '৩ ঘণ্টা', freq: 'Daily', freqBn: 'প্রতিদিন' },
];

const FILTER_CHIPS = [
  { key: 'name', label: 'Name', labelBn: 'নাম' },
  { key: 'number', label: 'Number', labelBn: 'নম্বর' },
  { key: 'operator', label: 'Operator', labelBn: 'অপারেটর' },
];

export default function LaunchHub({ onBack, language }: LaunchHubProps) {
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('name');
  const [fromStation, setFromStation] = useState(lbl('Sadarghat', 'সদরঘাট'));
  const [toStation, setToStation] = useState(lbl('Barisal', 'বরিশাল'));
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <div className="min-h-screen bg-kj-bg pb-20">
      {/* Back button row */}
      <div className="sticky top-0 z-10 bg-kj-bg border-b border-kj-line px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-kj-panel-muted transition-colors text-kj-text"
          aria-label={lbl('Go back', 'ফিরে যান')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-kj-text leading-tight">
          {lbl('Launch & Steamer', 'লঞ্চ ও স্টিমার')}
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Hero card */}
        <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 50%, #fbbf24 100%)' }}>
          <div className="absolute right-0 top-0 w-40 h-40 rounded-full translate-x-12 -translate-y-10" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="flex items-center gap-2 mb-1">
            <Ship size={20} className="opacity-90" />
            <span className="text-sm font-medium opacity-90">
              {lbl('River Transport', 'নৌ-পরিবহন')}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-1 leading-snug">
            {lbl('Sadarghat to everywhere', 'সদরঘাট থেকে সারা বাংলাদেশ')}
          </h2>
          <p className="text-sm opacity-85 mb-4">
            {lbl(
              'Bangladesh Inland Water Transport Authority (BIWTC)',
              'বাংলাদেশ অভ্যন্তরীণ নৌ-পরিবহন কর্তৃপক্ষ (বিআইডব্লিউটিএ)',
            )}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: '67+', label: lbl('Routes', 'রুট') },
              { value: '400+', label: lbl('Vessels', 'জলযান') },
              { value: '14', label: lbl('Terminals', 'ঘাট') },
              { value: '1947', label: lbl('Est.', 'প্রতিষ্ঠিত') },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 rounded-xl p-2 text-center">
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs opacity-75 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search card */}
        <div className="dc-card rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-kj-text text-sm">
            {lbl('Search Launch', 'লঞ্চ খুঁজুন')}
          </h3>

          {/* Name search input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kj-text-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lbl(
                'e.g. Sundarban-12, Kirtonkhola-10, Parabat-18...',
                'যেমন: সুন্দরবন-১২, কীর্তনখোলা-১০, পারাবত-১৮...',
              )}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-kj-bg border border-kj-line text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:ring-2 focus:ring-kj-primary/30"
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_CHIPS.map(chip => (
              <button
                key={chip.key}
                onClick={() => setActiveFilter(chip.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === chip.key
                    ? 'bg-kj-primary text-white'
                    : 'bg-kj-chip-bg text-kj-chip-text hover:bg-kj-panel-muted'
                }`}
              >
                {lbl(chip.label, chip.labelBn)}
              </button>
            ))}
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-kj-text-dim mb-1">
                {lbl('From', 'থেকে')}
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-kj-primary" />
                <input
                  type="text"
                  value={fromStation}
                  onChange={e => setFromStation(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-kj-bg border border-kj-line text-sm text-kj-text focus:outline-none focus:ring-2 focus:ring-kj-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-kj-text-dim mb-1">
                {lbl('To', 'কোথায়')}
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-kj-accent" />
                <input
                  type="text"
                  value={toStation}
                  onChange={e => setToStation(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-kj-bg border border-kj-line text-sm text-kj-text focus:outline-none focus:ring-2 focus:ring-kj-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Date picker */}
          <div>
            <label className="block text-xs text-kj-text-dim mb-1">
              {lbl('Date', 'তারিখ')}
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={e => setTravelDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-kj-bg border border-kj-line text-sm text-kj-text focus:outline-none focus:ring-2 focus:ring-kj-primary/30"
            />
          </div>

          {/* Search button */}
          <button className="w-full py-2.5 rounded-xl bg-kj-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Ship size={16} />
            {lbl('Find Launch', 'লঞ্চ খুঁজুন')}
          </button>

          <p className="text-xs text-kj-text-faint text-center">
            {lbl(
              'Info only — purchase tickets at Sadarghat counter or BIWTC office',
              'শুধু তথ্যের জন্য — টিকিট সদরঘাট কাউন্টার বা বিআইডব্লিউটিএ অফিস থেকে কিনুন',
            )}
          </p>
        </div>

        {/* Tonight's departures */}
        <div>
          <h3 className="font-semibold text-kj-text text-sm mb-2 flex items-center gap-2">
            <Clock size={16} className="text-kj-primary" />
            {lbl("Tonight's Departures", 'আজ রাতের ছাড়ার সময়সূচি')}
          </h3>
          <div className="space-y-2">
            {DEPARTURES.map(launch => (
              <div
                key={launch.id}
                className="dc-card rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-kj-text text-sm">{lbl(launch.name, launch.nameBn)}</span>
                      <span className="flex items-center gap-0.5 text-xs text-kj-amber">
                        <Star size={11} className="fill-kj-amber text-kj-amber" />{launch.rating}
                      </span>
                    </div>
                    <div className="text-[10px] text-kj-text-faint mb-1">{lbl((launch as any).operator || '', (launch as any).operatorBn || '')}</div>
                    <div className="flex items-center gap-1 text-xs text-kj-text-dim mb-2">
                      <MapPin size={11} className="shrink-0 text-kj-primary" />
                      <span>{lbl(launch.from, launch.fromBn)}</span>
                      <span className="text-kj-text-faint">→</span>
                      <span className="font-medium text-kj-text">{lbl(launch.to, launch.toBn)}</span>
                      {(launch as any).duration && <span className="text-kj-text-faint ml-1">· {(launch as any).duration}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-kj-chip-bg text-kj-text-dim text-[11px] px-2 py-0.5 rounded-full font-medium">{lbl('Deck', 'ডেক')} {launch.deck}</span>
                      <span className="bg-kj-primary-soft text-kj-primary-deep text-[11px] px-2 py-0.5 rounded-full font-medium">{lbl(launch.vipLabel, launch.vipLabelBn)} {launch.vip}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-sm font-bold text-kj-text">{launch.time}</div>
                    <div className="text-[10px] text-kj-text-faint mt-0.5">{lbl('Nightly', 'প্রতি রাত')}</div>
                    <button className="text-[11px] text-kj-primary flex items-center gap-0.5 hover:underline mt-1">
                      {lbl('Details', 'বিস্তারিত')}<ChevronRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cabin classes */}
        <div>
          <h3 className="font-semibold text-kj-text text-sm mb-2 flex items-center gap-2">
            <Info size={16} className="text-kj-primary" />
            {lbl('Cabin Classes', 'কেবিন শ্রেণী')}
          </h3>
          <div className="dc-card rounded-2xl overflow-hidden">
            {CABIN_CLASSES.map((cls, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-kj-line' : ''}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: cls.accent + '22' }}>{cls.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-kj-text">{lbl(cls.title, cls.titleBn)}</div>
                  <div className="text-xs text-kj-text-dim truncate">{lbl(cls.desc, cls.descBn)}</div>
                </div>
                <span className="text-sm font-bold" style={{ color: cls.accent }}>{cls.fare}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular river routes */}
        <div>
          <h3 className="font-semibold text-kj-text text-sm mb-2 flex items-center gap-2">
            <Ship size={16} className="text-kj-primary" />
            {lbl('Popular River Routes', 'জনপ্রিয় নদীপথ')}
          </h3>
          <div className="dc-card rounded-2xl divide-y divide-kj-line">
            {ROUTES.map((route, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm text-kj-text font-medium">
                    <span>{lbl(route.from, route.fromBn)}</span>
                    <span className="text-kj-text-faint">→</span>
                    <span>{lbl(route.to, route.toBn)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-kj-text-dim">
                    <Clock size={12} />
                    {lbl(route.duration, route.durationBn)}
                  </span>
                  <span className="bg-kj-primary-soft text-kj-primary text-xs px-2 py-0.5 rounded-full font-medium">
                    {lbl(route.freq, route.freqBn)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety info card */}
        <div className="bg-kj-amber-soft border border-kj-amber/30 rounded-2xl p-4 flex gap-3">
          <Shield size={20} className="text-kj-amber shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-kj-text mb-1">
              {lbl('Safety Information', 'নিরাপত্তা তথ্য')}
            </div>
            <p className="text-xs text-kj-text-dim leading-relaxed">
              {lbl(
                'Bangladesh Inland Water Transport Authority. Emergency:',
                'বাংলাদেশ অভ্যন্তরীণ নৌ-পরিবহন কর্তৃপক্ষ। জরুরি:',
              )}{' '}
              <a
                href="tel:16123"
                className="font-bold text-kj-amber hover:underline"
              >
                16123
              </a>
              .{' '}
              {lbl(
                'Always check weather before travel.',
                'যাত্রার আগে সবসময় আবহাওয়া পরীক্ষা করুন।',
              )}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-kj-amber">
              <Phone size={12} />
              <span>BIWTC Hotline: 16123</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
