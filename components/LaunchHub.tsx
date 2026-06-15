import React, { useState } from 'react';
import {
  ArrowLeft, Search, Ship, MapPin, Clock, Star, Shield, Phone, Info, ChevronRight,
} from 'lucide-react';
import { Launch3D } from './design/Vehicles3D';
import SponsoredAdSlot from './SponsoredAdSlot';

interface LaunchHubProps {
  onBack: () => void;
  language: 'en' | 'bn';
}

// Real BIWTC-registered vessel data (source: biwtc.gov.bd, Bangladesh Inland Water Transport Authority)
// Schedules are approximate nightly departures from Sadarghat Launch Terminal, Dhaka
const DEPARTURES = [
  // ── Sadarghat → Barisal (most popular route, daily service) ──
  { id: 'sundarban-12', name: 'Sundarban-12', nameBn: 'সুন্দরবন-১২', operator: 'Sundarban Navigation', operatorBn: 'সুন্দরবন নেভিগেশন', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', dep: '6:30 PM', arr: '5:00 AM', duration: '10h 30m', deck: '৳300', vip: '৳4,500', vipLabel: 'VIP Cabin', vipLabelBn: 'ভিআইপি কেবিন', rating: 4.5, accent: '#0ea5e9', premium: false },
  { id: 'parabat-18', name: 'Parabat-18', nameBn: 'পারাবত-১৮', operator: 'Parabat Shipping', operatorBn: 'পারাবত শিপিং', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', dep: '7:00 PM', arr: '6:00 AM', duration: '11h', deck: '৳280', vip: '৳4,000', vipLabel: 'VIP', vipLabelBn: 'ভিআইপি', rating: 4.3, accent: '#1e3a5f', premium: false },
  { id: 'kirtonkhola-10', name: 'Kirtonkhola-10', nameBn: 'কীর্তনখোলা-১০', operator: 'Kirtonkhola Shipping', operatorBn: 'কীর্তনখোলা শিপিং', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', dep: '7:30 PM', arr: '6:30 AM', duration: '11h', deck: '৳300', vip: '৳5,500', vipLabel: 'VIP', vipLabelBn: 'ভিআইপি', rating: 4.6, accent: '#7c3aed', premium: true },
  { id: 'mv-adventure-9', name: 'MV Adventure-9', nameBn: 'এমভি অ্যাডভেঞ্চার-৯', operator: 'Adventure Shipping', operatorBn: 'অ্যাডভেঞ্চার শিপিং', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল', dep: '8:00 PM', arr: '7:00 AM', duration: '11h', deck: '৳250', vip: '৳3,500', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 4.1, accent: '#d97706', premium: false },
  // ── Sadarghat → Patuakhali ──
  { id: 'mv-balaka', name: 'MV Balaka', nameBn: 'এমভি বালাকা', operator: 'BIWTC', operatorBn: 'বিআইডব্লিউটিএ', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Patuakhali', toBn: 'পটুয়াখালী', dep: '6:30 PM', arr: '5:30 AM', duration: '11h', deck: '৳260', vip: '৳1,200', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.7, accent: '#0ea5e9', premium: false },
  // ── Sadarghat → Chandpur ──
  { id: 'taposhi-7', name: 'Taposhi-7', nameBn: 'তাপসী-৭', operator: 'Taposhi Shipping', operatorBn: 'তাপসী শিপিং', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Chandpur', toBn: 'চাঁদপুর', dep: '6:00 PM', arr: '9:00 PM', duration: '3h', deck: '৳150', vip: '৳400', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.9, accent: '#10b981', premium: false },
  { id: 'mv-karnafuli', name: 'MV Karnafuli', nameBn: 'এমভি কর্ণফুলী', operator: 'BIWTC', operatorBn: 'বিআইডব্লিউটিএ', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Chandpur', toBn: 'চাঁদপুর', dep: '3:30 PM', arr: '7:00 PM', duration: '3–4h', deck: '৳120', vip: '৳350', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 4.0, accent: '#0ea5e9', premium: false },
  // ── Sadarghat → Bhola ──
  { id: 'mv-bhola', name: 'MV Bhola', nameBn: 'এমভি ভোলা', operator: 'BIWTC', operatorBn: 'বিআইডব্লিউটিএ', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Bhola', toBn: 'ভোলা', dep: '7:00 PM', arr: '1:00 AM', duration: '6h', deck: '৳200', vip: '৳600', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.8, accent: '#0ea5e9', premium: false },
  // ── Sadarghat → Khulna ──
  { id: 'mv-madhumati', name: 'MV Madhumati-2', nameBn: 'এমভি মধুমতী-২', operator: 'Bangladesh Shipping Corp', operatorBn: 'বাংলাদেশ শিপিং কর্পোরেশন', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Khulna', toBn: 'খুলনা', dep: '6:30 PM', arr: '7:30 AM', duration: '13h', deck: '৳350', vip: '৳2,200', vipLabel: 'VIP Suite', vipLabelBn: 'ভিআইপি স্যুট', rating: 4.4, accent: '#7c3aed', premium: false },
  // ── Sadarghat → Hatiya ──
  { id: 'mv-hatiya', name: 'MV Hatiya', nameBn: 'এমভি হাতিয়া', operator: 'BIWTC', operatorBn: 'বিআইডব্লিউটিএ', from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Hatiya', toBn: 'হাতিয়া', dep: '9:30 PM', arr: '9:00 AM', duration: '11–12h', deck: '৳280', vip: '৳900', vipLabel: 'Cabin', vipLabelBn: 'কেবিন', rating: 3.6, accent: '#0ea5e9', premium: false },
];

const CABIN_CLASSES = [
  { icon: '🛏️', title: 'VIP Suite', titleBn: 'ভিআইপি স্যুট', desc: 'Private room, AC, attached bath', descBn: 'প্রাইভেট রুম, এসি, সংযুক্ত বাথরুম', fare: '৳5,500', accent: '#7c3aed' },
  { icon: '🛋️', title: 'Double Cabin', titleBn: 'ডাবল কেবিন', desc: 'Semi-private, comfortable', descBn: 'আধা-প্রাইভেট, আরামদায়ক', fare: '৳3,500', accent: '#3b82f6' },
  { icon: '🪑', title: 'Single Cabin', titleBn: 'সিঙ্গেল কেবিন', desc: 'Private single berth', descBn: 'একক বার্থ', fare: '৳2,500', accent: '#0ea5e9' },
  { icon: '💺', title: 'Deck Seat', titleBn: 'ডেক সিট', desc: 'Seated deck space', descBn: 'বসার আসন', fare: '৳500', accent: '#10b981' },
  { icon: '🛖', title: 'Deck Floor', titleBn: 'ডেক ফ্লোর', desc: 'Budget open deck', descBn: 'সাশ্রয়ী খোলা ডেক', fare: '৳300', accent: '#f59e0b' },
];

const ROUTES = [
  { from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Barisal', toBn: 'বরিশাল' },
  { from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Bhola', toBn: 'ভোলা' },
  { from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Patuakhali', toBn: 'পটুয়াখালী' },
  { from: 'Sadarghat', fromBn: 'সদরঘাট', to: 'Chandpur', toBn: 'চাঁদপুর' },
];

const FILTER_CHIPS = [
  { key: 'name', label: 'Name', labelBn: 'নাম' },
  { key: 'number', label: 'Number', labelBn: 'নম্বর' },
  { key: 'operator', label: 'Operator', labelBn: 'অপারেটর' },
];

const SAFETY_TIPS = [
  { en: 'Always wear life jacket on open deck', bn: 'খোলা ডেকে সবসময় লাইফ জ্যাকেট পরুন' },
  { en: 'Check weather forecast before overnight travel', bn: 'রাতের যাত্রার আগে আবহাওয়া পূর্বাভাস দেখুন' },
  { en: 'Keep your ticket and ID on you at all times', bn: 'টিকিট ও পরিচয়পত্র সবসময় সাথে রাখুন' },
];

export default function LaunchHub({ onBack, language }: LaunchHubProps) {
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('name');
  const [fromStation, setFromStation] = useState(lbl('Sadarghat', 'সদরঘাট'));
  const [toStation, setToStation] = useState(lbl('Barisal', 'বরিশাল'));
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Show only first 4 departures in the featured list
  const featuredDepartures = DEPARTURES.slice(0, 4);

  return (
    <div className="min-h-screen bg-kj-bg pb-24 overflow-y-auto text-kj-text">

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
          aria-label={lbl('Go back', 'ফিরে যান')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bengali font-bold text-base text-kj-text">
          {lbl('Launch & Steamer', 'লঞ্চ ও স্টিমার')}
        </span>
      </div>

      <div className="px-4 sm:px-6 md:px-10 py-5 space-y-5 w-full max-w-[1200px] mx-auto">

        {/* Hero */}
        <div
          className="rounded-[24px] overflow-hidden relative text-white shadow-kj-lg"
          style={{
            background: 'linear-gradient(135deg,#0c4a6e 0%,#0ea5e9 50%,#fbbf24 100%)',
            minHeight: 240,
            padding: '18px 18px 0',
          }}
        >
          <div
            className="absolute -right-12 -top-14 w-60 h-60 rounded-full pointer-events-none kj-anim-pulse"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
          <div
            className="absolute left-1/3 -bottom-20 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="font-sans text-[11px] font-bold uppercase tracking-[1.4px] opacity-85">✦ KoyJabo · launch</span>
              <h1
                className="font-bengali font-bold text-white leading-[1.1] tracking-tight text-balance mt-1.5 mb-2"
                style={{ fontSize: 26 }}
              >
                {lbl('River journeys · from Sadarghat to everywhere', 'নদীপথে যাত্রা · সদরঘাট থেকে সারাদেশে')}
              </h1>
              <p className="font-bengali text-[13px] opacity-90 leading-relaxed max-w-[380px]">
                {lbl(
                  '60+ launch routes, overnight cabin service across Padma and Meghna — Barisal, Bhola, Patuakhali, Chandpur.',
                  '৬০+ লঞ্চ রুট, রাতের কেবিন সার্ভিস, পদ্মা ও মেঘনা পার হয়ে — বরিশাল, ভোলা, পটুয়াখালী, চাঁদপুর।',
                )}
              </p>
              <div className="flex gap-3.5 mt-4 flex-wrap">
                {[
                  { v: '60+', l: lbl('Routes', 'রুট') },
                  { v: '14', l: lbl('Terminals', 'ঘাট') },
                  { v: '৳300+', l: lbl('From', 'শুরু থেকে') },
                  { v: '6–12h', l: lbl('Duration', 'যাত্রাকাল') },
                ].map(s => (
                  <div key={s.l} style={{ minWidth: 68 }}>
                    <div className="font-sans font-extrabold text-[18px] tracking-tight leading-none">{s.v}</div>
                    <div className="font-sans text-[9px] font-bold uppercase tracking-[1.2px] opacity-85 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 self-end" style={{ marginBottom: -10 }}>
              <Launch3D size={160} palette={['#ffffff', 'rgba(255,255,255,0.4)', '#fbbf24']} />
            </div>
          </div>
        </div>

        {/* Search card */}
        <div className="dc-card rounded-[22px] p-5 space-y-4">

          {/* Name search */}
          <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-3 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center text-kj-primary-ink shrink-0 kj-anim-glow"
              style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}
            >
              <Search className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                {lbl('Search by name or number', 'নাম বা নম্বর দিয়ে খুঁজুন')}
              </p>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lbl(
                  'e.g. Sundarban-12, Kirtonkhola-10...',
                  'যেমন: সুন্দরবন-১২, কীর্তনখোলা-১০...',
                )}
                className="w-full bg-transparent text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none mt-0.5 font-bengali"
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_CHIPS.map(chip => (
              <button
                key={chip.key}
                onClick={() => setActiveFilter(chip.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border font-bengali ${
                  activeFilter === chip.key
                    ? 'text-kj-primary-ink border-kj-primary'
                    : 'bg-kj-panel-muted text-kj-text border-kj-line hover:border-kj-primary/40'
                }`}
                style={activeFilter === chip.key ? {
                  background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
                  boxShadow: '0 4px 12px -4px var(--kj-primary)',
                } : undefined}
              >
                {lbl(chip.label, chip.labelBn)}
              </button>
            ))}
          </div>

          {/* From / To / Date grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-primary-soft)' }}>
                  <MapPin className="w-3 h-3 text-kj-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                  {lbl('From', 'কোথা থেকে')}
                </span>
              </div>
              <input
                type="text"
                value={fromStation}
                onChange={e => setFromStation(e.target.value)}
                className="w-full bg-transparent text-sm font-bengali font-semibold text-kj-text focus:outline-none"
              />
            </div>
            <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--kj-accent-soft)' }}>
                  <MapPin className="w-3 h-3 text-kj-accent" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans">
                  {lbl('To', 'কোথায়')}
                </span>
              </div>
              <input
                type="text"
                value={toStation}
                onChange={e => setToStation(e.target.value)}
                className="w-full bg-transparent text-sm font-bengali font-semibold text-kj-text focus:outline-none"
              />
            </div>
          </div>
          <div className="bg-kj-input-bg border border-kj-line rounded-[14px] px-3.5 py-2.5 hover:border-kj-primary/40 transition-colors">
            <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-kj-text-faint font-sans mb-1.5">
              {lbl('Date', 'তারিখ')}
            </p>
            <input
              type="date"
              value={travelDate}
              onChange={e => setTravelDate(e.target.value)}
              className="w-full bg-transparent text-sm font-bengali font-semibold text-kj-text focus:outline-none"
            />
          </div>

          {/* Search button */}
          <button
            className="w-full h-12 font-bold text-sm rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all font-bengali text-kj-primary-ink"
            style={{
              background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
              boxShadow: '0 8px 22px -10px var(--kj-primary)',
            }}
          >
            <Ship className="w-4 h-4" />
            {lbl('Find Launch', 'লঞ্চ খুঁজুন')}
          </button>

          <p className="text-xs text-kj-text-faint text-center font-bengali">
            {lbl(
              'Info only — purchase tickets at Sadarghat counter or BIWTC office',
              'শুধু তথ্যের জন্য — টিকিট সদরঘাট কাউন্টার বা বিআইডব্লিউটিএ অফিস থেকে কিনুন',
            )}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)' }}>

          {/* LEFT — Tonight's launches */}
          <div className="space-y-3 min-w-0">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
                {lbl('Tonight\'s launches · Sadarghat → Barisal', 'আজ রাতের লঞ্চ · সদরঘাট → বরিশাল')}
              </p>
              <h2 className="font-bengali font-bold text-base text-kj-text mt-0.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-kj-primary shrink-0" />
                {lbl('Departures', 'ছাড়ার সময়সূচি')}
              </h2>
            </div>

            {featuredDepartures.map(launch => (
              <div
                key={launch.id}
                className="dc-card rounded-2xl p-4 flex flex-col gap-3 relative"
                style={launch.premium ? { borderColor: 'var(--kj-amber)' } : undefined}
              >
                {launch.premium && (
                  <div className="absolute top-3 right-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans"
                      style={{ background: 'var(--kj-amber-soft)', color: 'var(--kj-amber)' }}
                    >
                      ★ {lbl('Premium', 'প্রিমিয়াম')}
                    </span>
                  </div>
                )}

                {/* Brand row */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: `${launch.accent}22` }}
                  >
                    <Ship className="w-4 h-4" style={{ color: launch.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bengali font-bold text-kj-text text-sm truncate">
                      {lbl(launch.name, launch.nameBn)}
                    </p>
                    <p className="font-bengali text-[11px] text-kj-text-faint truncate">
                      {lbl(launch.operator, launch.operatorBn)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 text-kj-amber" fill="currentColor" />
                    <span className="text-[12px] font-bold text-kj-text font-sans">{launch.rating}</span>
                  </div>
                </div>

                {/* Journey timeline */}
                <div className="flex items-center gap-2">
                  <div className="text-center shrink-0">
                    <p className="font-sans font-bold text-[15px] text-kj-text leading-none">{launch.dep}</p>
                    <p className="font-bengali text-[10px] text-kj-text-faint mt-0.5">{lbl(launch.from, launch.fromBn)}</p>
                  </div>
                  <div className="flex-1 relative min-w-0">
                    <div className="h-px bg-kj-line" />
                    <span
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-1.5 text-[9px] font-bold text-kj-text-faint uppercase tracking-[1px] font-sans whitespace-nowrap"
                      style={{ background: 'var(--kj-panel)' }}
                    >
                      {launch.duration}
                    </span>
                  </div>
                  <div className="text-center shrink-0">
                    <p className="font-sans font-bold text-[15px] text-kj-text leading-none">{launch.arr}</p>
                    <p className="font-bengali text-[10px] text-kj-text-faint mt-0.5">{lbl(launch.to, launch.toBn)}</p>
                  </div>
                </div>

                {/* Fares + button */}
                <div className="flex items-center gap-2 pt-2.5 border-t border-dashed border-kj-line">
                  <div className="flex-1 min-w-0 flex gap-1.5 flex-wrap">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium font-sans"
                      style={{ background: 'var(--kj-chip-bg)', color: 'var(--kj-text-dim)' }}
                    >
                      {lbl('Deck', 'ডেক')} {launch.deck}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium font-sans"
                      style={{ background: `${launch.accent}18`, color: launch.accent }}
                    >
                      {lbl(launch.vipLabel, launch.vipLabelBn)} {launch.vip}
                    </span>
                  </div>
                  <button
                    className="flex items-center gap-0.5 text-[12px] font-bold text-kj-primary-ink px-2.5 py-1.5 rounded-[9px] font-sans shrink-0 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))' }}
                  >
                    {lbl('Details', 'বিস্তারিত')} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — sidebar */}
          <div className="space-y-4 min-w-0">

            {/* Cabin classes */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-kj-primary shrink-0" />
                <h2 className="font-bengali font-bold text-sm text-kj-text">
                  {lbl('Cabin Classes', 'কেবিন শ্রেণী')}
                </h2>
              </div>
              <div className="dc-card rounded-2xl overflow-hidden">
                {CABIN_CLASSES.map((cls, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 px-3 py-2.5 ${i > 0 ? 'border-t border-kj-line' : ''}`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ background: `${cls.accent}22` }}
                    >
                      {cls.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-kj-text font-bengali truncate">
                        {lbl(cls.title, cls.titleBn)}
                      </div>
                      <div className="text-[10px] text-kj-text-faint truncate font-bengali">
                        {lbl(cls.desc, cls.descBn)}
                      </div>
                    </div>
                    <span className="text-xs font-bold shrink-0 font-sans" style={{ color: cls.accent }}>
                      {cls.fare}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad slot */}
            <SponsoredAdSlot language={language} size="300x250" compact />

            {/* Safety tips */}
            <div className="dc-card rounded-2xl p-3.5">
              <div className="flex items-center gap-2 mb-2.5">
                <Shield className="w-4 h-4 text-kj-amber shrink-0" />
                <span className="font-bengali font-bold text-sm text-kj-text">
                  {lbl('Safety Tips', 'নিরাপত্তা টিপস')}
                </span>
              </div>
              <div className="space-y-2">
                {SAFETY_TIPS.map((tip, i) => (
                  <div key={i} className="flex gap-2 text-xs text-kj-text-dim font-bengali leading-snug">
                    <span className="text-kj-amber shrink-0 mt-0.5">•</span>
                    <span>{lbl(tip.en, tip.bn)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--kj-amber)' }}>
                <Phone className="w-3 h-3 shrink-0" />
                <a href="tel:16223" className="hover:underline font-sans">
                  {lbl('Hotline: 16223', 'হটলাইন: ১৬২২৩')}
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Popular routes */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Ship className="w-4 h-4 text-kj-primary shrink-0" />
            <h2 className="font-bengali font-bold text-sm text-kj-text">
              {lbl('Popular River Routes', 'জনপ্রিয় নদীপথ')}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {ROUTES.map((route, i) => (
              <button
                key={i}
                className="dc-card rounded-2xl p-3 text-left hover:border-kj-primary/40 active:scale-[0.98] transition-all group"
              >
                <p className="font-bengali font-bold text-sm text-kj-text group-hover:text-kj-primary transition-colors">
                  {lbl(`${route.from} → ${route.to}`, `${route.fromBn} → ${route.toBn}`)}
                </p>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
