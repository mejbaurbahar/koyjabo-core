import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  ArrowLeftRight,
  MapPin,
  Zap,
  Users,
  Star,
  Bus,
  Navigation,
  Info,
} from 'lucide-react';

interface LocalBusHubProps {
  onBack: () => void;
  language: 'en' | 'bn';
}

const lbl = (language: 'en' | 'bn', en: string, bn: string) =>
  language === 'bn' ? bn : en;

const POPULAR_ROUTES = [
  {
    id: 1,
    operator: 'Green Line',
    route: 'Route 6',
    from: 'Gulshan',
    to: 'Motijheel',
    fromBn: 'গুলশান',
    toBn: 'মতিঝিল',
    fare: 60,
    duration: '42min',
    durationBn: '৪২ মিনিট',
    stops: 9,
    rating: 4.6,
    tags: ['AC'],
  },
  {
    id: 2,
    operator: 'Hanif',
    route: 'Route 11',
    from: 'Uttara',
    to: 'Paltan',
    fromBn: 'উত্তরা',
    toBn: 'পল্টন',
    fare: 50,
    duration: '1h 10m',
    durationBn: '১ ঘণ্টা ১০ মিনিট',
    stops: 18,
    rating: 4.1,
    tags: [],
  },
  {
    id: 3,
    operator: 'BRTC',
    route: 'Double Decker',
    from: 'Motijheel',
    to: 'Gabtoli',
    fromBn: 'মতিঝিল',
    toBn: 'গাবতলী',
    fare: 45,
    duration: '52min',
    durationBn: '৫২ মিনিট',
    stops: 14,
    rating: 4.3,
    tags: ['AC'],
  },
  {
    id: 4,
    operator: 'Projapoti Paribahan',
    route: '',
    from: 'Mirpur',
    to: 'Sadarghat',
    fromBn: 'মিরপুর',
    toBn: 'সদরঘাট',
    fare: 30,
    duration: '45min',
    durationBn: '৪৫ মিনিট',
    stops: 0,
    rating: 3.9,
    tags: [],
  },
  {
    id: 5,
    operator: 'Anabil Super',
    route: '',
    from: 'Gulistan',
    to: 'Savar',
    fromBn: 'গুলিস্তান',
    toBn: 'সাভার',
    fare: 70,
    duration: '1h 30m',
    durationBn: '১ ঘণ্টা ৩০ মিনিট',
    stops: 0,
    rating: 3.8,
    tags: [],
  },
];

const NEARBY_BUSES = [
  { name: 'GL #6', mins: 2, dist: '400m' },
  { name: 'BRTC Double', mins: 5, dist: '900m' },
  { name: 'Hanif #11', mins: 8, dist: '1.4km' },
  { name: 'Projapoti', mins: 12, dist: '2.1km' },
];

const OPERATORS = ['Green Line', 'Hanif', 'BRTC', 'Projapoti', 'Anabil', 'Unique'];

const BUS_TYPES = [
  { en: 'Local', bn: 'লোকাল', icon: '🚌', desc: 'All stops', descBn: 'সব স্টপে থামে' },
  { en: 'AC Seating', bn: 'এসি সিটিং', icon: '❄️', desc: 'Air conditioned', descBn: 'শীতাতপ নিয়ন্ত্রিত' },
  { en: 'Double Decker', bn: 'ডাবল ডেকার', icon: '🚍', desc: 'Two floors', descBn: 'দ্বিতল বাস' },
  { en: 'Gulshan Chaka', bn: 'গুলশান চাকা', icon: '🔄', desc: 'Circular route', descBn: 'বৃত্তাকার রুট' },
];

const SORT_CHIPS = [
  { id: 'fastest', en: 'Fastest', bn: 'দ্রুততম', icon: '⚡' },
  { id: 'cheapest', en: 'Cheapest', bn: 'সস্তা', icon: '৳' },
  { id: 'ac', en: 'AC', bn: 'এসি', icon: '❄️' },
  { id: 'toilet', en: 'Toilet', bn: 'টয়লেট', icon: '🚻' },
  { id: 'less_crowd', en: 'Less crowd', bn: 'কম ভিড়', icon: '👥' },
];

const FILTER_CHIPS = [
  { id: 'name', en: 'Name', bn: 'নাম' },
  { id: 'route', en: 'Route', bn: 'রুট' },
  { id: 'operator', en: 'Operator', bn: 'অপারেটর' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold">
      <Star size={11} fill="currentColor" />
      {rating.toFixed(1)}
    </span>
  );
}

const LocalBusHub: React.FC<LocalBusHubProps> = ({ onBack, language }) => {
  const L = (en: string, bn: string) => lbl(language, en, bn);

  const [searchQuery, setSearchQuery] = useState('');
  const [fromField, setFromField] = useState('');
  const [toField, setToField] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('name');
  const [activeSort, setActiveSort] = useState<string | null>(null);

  const handleSwap = () => {
    setFromField(toField);
    setToField(fromField);
  };

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">

      {/* Back button row */}
      <div className="sticky top-0 z-10 bg-kj-bg border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-kj-panel border border-kj-line text-kj-text-dim hover:text-kj-text active:scale-95 transition-all"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-semibold text-kj-text">
          {L('Local Bus', 'লোকাল বাস')}
        </h1>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Hero card */}
        <div className="bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Bus size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                {L('Every Dhaka bus · in one app', 'ঢাকার সব বাস · এক অ্যাপে')}
              </h2>
              <p className="text-white/80 text-xs mt-0.5">
                {L('Find, compare, and plan your bus journey', 'বাস খুঁজুন, তুলনা করুন, যাত্রা পরিকল্পনা করুন')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: '2,412', label: L('Routes', 'রুট') },
              { value: '1,043', label: L('Stops', 'স্টপ') },
              { value: '140+', label: L('Operators', 'অপারেটর') },
              { value: '★4.4', label: L('Avg rating', 'গড় রেটিং') },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/20 rounded-xl p-2 text-center">
                <div className="text-sm font-bold">{stat.value}</div>
                <div className="text-white/80 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search card */}
        <div className="bg-kj-panel border border-kj-line rounded-2xl p-4 space-y-3">
          {/* Name search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kj-text-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={L(
                'Green Line, Raida #7, BRTC Double, Route 6…',
                'গ্রিন লাইন, রাইদা #৭, বিআরটিসি ডাবল, রুট ৬…'
              )}
              className="w-full pl-9 pr-3 py-2.5 bg-kj-bg border border-kj-line rounded-xl text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:border-kj-primary"
            />
          </div>

          {/* Quick filter chips */}
          <div className="flex gap-2">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeFilter === chip.id
                    ? 'bg-kj-primary text-kj-primary-ink'
                    : 'bg-kj-chip-bg text-kj-chip-text'
                }`}
              >
                {L(chip.en, chip.bn)}
              </button>
            ))}
          </div>

          {/* From / To fields */}
          <div className="relative flex flex-col gap-2">
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              <input
                type="text"
                value={fromField}
                onChange={(e) => setFromField(e.target.value)}
                placeholder={L('From…', 'কোথা থেকে…')}
                className="w-full pl-8 pr-3 py-2.5 bg-kj-bg border border-kj-line rounded-xl text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:border-kj-primary"
              />
            </div>
            <button
              onClick={handleSwap}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-kj-panel border border-kj-line rounded-lg text-kj-text-dim hover:text-kj-primary active:scale-95 transition-all z-10"
              aria-label={L('Swap from and to', 'অদলবদল করুন')}
            >
              <ArrowLeftRight size={14} />
            </button>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" />
              <input
                type="text"
                value={toField}
                onChange={(e) => setToField(e.target.value)}
                placeholder={L('To…', 'কোথায় যাবেন…')}
                className="w-full pl-8 pr-3 py-2.5 bg-kj-bg border border-kj-line rounded-xl text-sm text-kj-text placeholder:text-kj-text-faint focus:outline-none focus:border-kj-primary"
              />
            </div>
          </div>

          {/* Find button */}
          <button className="w-full bg-kj-primary text-kj-primary-ink font-semibold py-3 rounded-xl text-sm active:scale-[0.98] transition-all">
            {L('Find Bus', 'বাস খুঁজুন')}
          </button>

          {/* Sort chips */}
          <div className="flex gap-2 flex-wrap">
            {SORT_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setActiveSort(activeSort === chip.id ? null : chip.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeSort === chip.id
                    ? 'bg-kj-accent-soft text-kj-accent'
                    : 'bg-kj-chip-bg text-kj-chip-text'
                }`}
              >
                <span>{chip.icon}</span>
                {L(chip.en, chip.bn)}
              </button>
            ))}
          </div>
        </div>

        {/* Popular routes */}
        <section>
          <h3 className="text-sm font-semibold text-kj-text mb-2">
            {L('Popular Routes', 'জনপ্রিয় রুট')}
          </h3>
          <div className="space-y-2">
            {POPULAR_ROUTES.map((r) => (
              <div
                key={r.id}
                className="bg-kj-panel border border-kj-line rounded-2xl p-3 flex items-start gap-3"
              >
                <div className="p-2 bg-kj-primary-soft rounded-xl mt-0.5">
                  <Bus size={16} className="text-kj-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-kj-text truncate">
                      {r.operator}
                      {r.route ? ` · ${r.route}` : ''}
                    </span>
                    {r.tags.includes('AC') && (
                      <span className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs rounded-full font-medium">
                        ❄️ AC
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-kj-text-dim mt-0.5">
                    <span>{L(r.from, r.fromBn)}</span>
                    <span className="text-kj-text-faint">↔</span>
                    <span>{L(r.to, r.toBn)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-kj-primary">৳{r.fare}</span>
                    <span className="text-xs text-kj-text-dim">
                      🕐 {L(r.duration, r.durationBn)}
                    </span>
                    {r.stops > 0 && (
                      <span className="text-xs text-kj-text-faint">{r.stops} {L('stops', 'স্টপ')}</span>
                    )}
                    <StarRating rating={r.rating} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live buses nearby */}
        <section className="bg-kj-panel border border-kj-line rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h3 className="text-sm font-semibold text-kj-text">
              {L('Buses near you · live', 'আপনার কাছের বাস · লাইভ')}
            </h3>
          </div>
          <div className="space-y-2">
            {NEARBY_BUSES.map((bus) => (
              <div key={bus.name} className="flex items-center justify-between py-1.5 border-b border-kj-line last:border-0">
                <div className="flex items-center gap-2">
                  <Navigation size={13} className="text-kj-primary" />
                  <span className="text-sm font-medium text-kj-text">{bus.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-kj-text-dim">
                  <span className="font-semibold text-kj-primary">{bus.mins} {L('min', 'মিনিট')}</span>
                  <span className="text-kj-text-faint">{bus.dist}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bus operators grid */}
        <section>
          <h3 className="text-sm font-semibold text-kj-text mb-2">
            {L('Bus Operators', 'বাস অপারেটর')}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {OPERATORS.map((op) => (
              <div
                key={op}
                className="bg-kj-panel border border-kj-line rounded-xl p-3 flex items-center justify-center text-center"
              >
                <span className="text-xs font-medium text-kj-text-dim">{op}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bus types */}
        <section>
          <h3 className="text-sm font-semibold text-kj-text mb-2">
            {L('Bus Types', 'বাসের ধরন')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {BUS_TYPES.map((type) => (
              <div
                key={type.en}
                className="bg-kj-panel border border-kj-line rounded-2xl p-3 flex items-center gap-3"
              >
                <span className="text-2xl">{type.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-kj-text">{L(type.en, type.bn)}</div>
                  <div className="text-xs text-kj-text-dim truncate">{L(type.desc, type.descBn)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Info notice */}
        <div className="flex items-start gap-2 bg-kj-panel-muted border border-kj-line rounded-xl p-3">
          <Info size={14} className="text-kj-text-faint mt-0.5 shrink-0" />
          <p className="text-xs text-kj-text-faint leading-relaxed">
            {L(
              'KoyJabo shows info only · visit operator counters to purchase tickets',
              'কয়জাবো শুধু তথ্য দেখায় · টিকিট কিনতে অপারেটর কাউন্টারে যান'
            )}
          </p>
        </div>

      </div>
    </div>
  );
};

export default LocalBusHub;
