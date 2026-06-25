import React, { useEffect, useState } from 'react';
import { KJ_TOKENS, SANS, BEN, T, Tokens, Lang } from '../tokens';
import { AdSlot } from '../components/AdSlot';
import { PageShell } from './PageShell';
import { findOperator, findRoutesByFromTo } from '../../../data/intercityOperatorData';
import BusRating from '../../../components/BusRating';
import BusPhotoGallery from '../../../components/BusPhotoGallery';
import { getBusRatings, BusRatingSummary } from '../../../services/communityDataService';
import { earnCoins } from '../utils/koyCoinService';
import { useDocumentTitle, setCanonicalUrl } from '../utils/useDocumentTitle';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:Lang; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

type TabId = 'seats' | 'route' | 'bus' | 'photos' | 'reviews' | 'policy';

const TABS: { id: TabId; en: string; bn: string }[] = [
  { id: 'seats', en: 'Seats', bn: 'সিট' },
  { id: 'route', en: 'Route & Stops', bn: 'রুট ও স্টপ' },
  { id: 'bus', en: 'Bus & Amenities', bn: 'বাস ও সুবিধা' },
  { id: 'photos', en: 'Photos', bn: 'ছবি' },
  { id: 'reviews', en: 'Reviews', bn: 'রিভিউ' },
  { id: 'policy', en: 'Policy', bn: 'নীতি' },
];

type StopEntry = { name: string; nameBn: string; time: string; kind: 'boarding' | 'stop' | 'rest' | 'destination' };

// Build stop list from route params
function buildStops(route: string, counter: string, from: string, to: string): StopEntry[] {
  // Parse origin/destination from route string e.g. "Dhaka (Gabtoli) ⇄ Benapole (Land Port)"
  const parts = route.split(/⇄|→|->/);
  const originRaw = parts[0]?.trim() || from || 'Dhaka';
  const destRaw = parts[1]?.trim() || to || 'Destination';

  // Extract terminal name from parenthetical if present
  const extractTerminal = (s: string) => {
    const m = s.match(/\(([^)]+)\)/);
    return m ? m[1].trim() : '';
  };
  const originCity = originRaw.replace(/\([^)]+\)/, '').trim();
  const originTerminal = extractTerminal(originRaw) || counter?.split('/')[0]?.trim() || '';
  const destCity = destRaw.replace(/\([^)]+\)/, '').trim();
  const destTerminal = extractTerminal(destRaw);

  const stops: StopEntry[] = [];

  // Boarding stop(s) — show counter locations in Dhaka
  const counters = counter ? counter.split('/').map(c => c.trim()).filter(Boolean) : [];
  if (counters.length > 0) {
    counters.forEach((c, i) => {
      stops.push({ name: `${c} (${originCity})`, nameBn: c, time: '', kind: i === 0 ? 'boarding' : 'stop' });
    });
  } else {
    stops.push({ name: originTerminal || originCity, nameBn: originCity, time: '', kind: 'boarding' });
  }

  // Destination
  stops.push({
    name: destTerminal ? `${destCity} (${destTerminal})` : destCity,
    nameBn: destCity,
    time: '',
    kind: 'destination',
  });

  return stops;
}

const AMENITIES = [
  { label: 'AC', labelBn: 'এসি', icon: '❄️', available: true },
  { label: 'Recliner', labelBn: 'রিক্লাইনার', icon: '💺', available: true },
  { label: 'Charger', labelBn: 'চার্জার', icon: '🔌', available: true },
  { label: 'Toilet', labelBn: 'টয়লেট', icon: '🚻', available: true },
  { label: 'Snacks', labelBn: 'স্ন্যাকস', icon: '🍿', available: true },
  { label: 'Water', labelBn: 'পানি', icon: '💧', available: true },
  { label: 'WiFi', labelBn: 'ওয়াইফাই', icon: '📶', available: false },
  { label: 'TV', labelBn: 'টিভি', icon: '📺', available: true },
];

// Seat layout: 10 rows × 4 seats (2+2)
type SeatState = 'available' | 'booked' | 'selected' | 'ladies';
const INITIAL_SEATS: SeatState[][] = Array.from({ length: 10 }, () =>
  Array.from({ length: 4 }, () => 'available' as SeatState)
);

const SEAT_COLORS: Record<SeatState, { bg: string; border: string }> = {
  available:  { bg: 'transparent',   border: '#10b981' },
  booked:     { bg: '#374151',        border: '#374151' },
  selected:   { bg: '#10b981',        border: '#10b981' },
  ladies:     { bg: '#fce7f355',      border: '#ec4899' },
};

const SEAT_LABEL_MAP: Record<SeatState, { en: string; bn: string }> = {
  available: { en: 'Available', bn: 'খালি' },
  booked:    { en: 'Booked',    bn: 'বুকড' },
  selected:  { en: 'Selected',  bn: 'নির্বাচিত' },
  ladies:    { en: "Ladies'",   bn: 'মহিলা' },
};

// Set to true once Shohoz/BusBD/Bdtickets affiliate approvals are final
const AFFILIATE_APPROVED = false;

const TICKET_PLATFORMS = [
  {
    id: 'shohoz',
    name: 'Shohoz',
    nameBn: 'শহজ',
    color: '#e11d48',
    icon: '🎟️',
    tagline: 'Book bus tickets online',
    taglineBn: 'অনলাইনে বাস টিকেট বুক করুন',
    url: 'https://www.shohoz.com/bus?utm_source=koyjabo&utm_medium=affiliate&utm_campaign=intercity',
  },
  {
    id: 'busbd',
    name: 'BusBD',
    nameBn: 'বাসবিডি',
    color: '#2563eb',
    icon: '🚌',
    tagline: 'Compare & book bus seats',
    taglineBn: 'বাস সিট তুলনা করে বুক করুন',
    url: 'https://www.busbd.com.bd/?utm_source=koyjabo&utm_medium=affiliate&utm_campaign=intercity',
  },
  {
    id: 'bdtickets',
    name: 'Bdtickets',
    nameBn: 'বিডিটিকেটস',
    color: '#7c3aed',
    icon: '📲',
    tagline: 'Fast online ticket booking',
    taglineBn: 'দ্রুত অনলাইন টিকেট বুকিং',
    url: 'https://bdtickets.com/?utm_source=koyjabo&utm_medium=affiliate&utm_campaign=intercity',
  },
];

const SPONSORED_CARDS = [
  {
    brand: 'Pathao', brandColor: '#e8173b', icon: '🛵',
    title: '50% off your first ride',
    titleBn: 'প্রথম রাইডে ৫০% ছাড়',
    sub: 'New users · Code: HELLOPATHAO',
    subBn: 'নতুন ব্যবহারকারী · কোড: HELLOPATHAO',
  },
  {
    brand: 'Pathao', brandColor: '#e8173b', icon: '📦',
    title: '12% off parcel every Friday',
    titleBn: 'প্রতি শুক্রবার পার্সেলে ১২% ছাড়',
    sub: 'Code: FAST10 · 1 use per Friday',
    subBn: 'কোড: FAST10 · সপ্তাহে ১ বার',
  },
];

function SeatsTab({ tk, lang }: { tk: Tokens; lang: Lang }) {
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const [seats, setSeats] = useState<SeatState[][]>(INITIAL_SEATS);

  const toggleSeat = (row: number, col: number) => {
    setSeats((prev) => {
      const next = prev.map((r) => [...r]);
      const cur = next[row][col];
      if (cur === 'booked' || cur === 'ladies') return next;
      next[row][col] = cur === 'selected' ? 'available' : 'selected';
      return next;
    });
  };

  return (
    <div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: tk.textFaint, marginBottom: 16, lineHeight: 1.5 }}>
        {lbl('Seats shown for reference · purchase at operator counter', 'সিট শুধু রেফারেন্সের জন্য · কাউন্টারে কিনুন')}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        {(Object.entries(SEAT_COLORS) as [SeatState, typeof SEAT_COLORS[SeatState]][]).map(([state, meta]) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              background: meta.bg, border: `2px solid ${meta.border}`,
            }} />
            <span style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, color: tk.textDim }}>
              {lbl(SEAT_LABEL_MAP[state].en, SEAT_LABEL_MAP[state].bn)}
            </span>
          </div>
        ))}
      </div>

      {/* Seat grid */}
      <div style={{
        background: tk.panelMuted, borderRadius: 16, padding: 20,
        border: `1px solid ${tk.line}`, display: 'inline-block',
      }}>
        {/* Front label */}
        <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, textAlign: 'center', marginBottom: 12 }}>
          {lbl('FRONT →', 'সামনে →')}
        </div>
        {seats.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, width: 18, textAlign: 'right', flexShrink: 0 }}>
              {ri + 1}
            </span>
            {row.map((state, ci) => (
              <React.Fragment key={ci}>
                {ci === 2 && (
                  <div style={{ width: 12, flexShrink: 0 }} />
                )}
                <button
                  onClick={() => toggleSeat(ri, ci)}
                  style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: SEAT_COLORS[state].bg,
                    border: `2px solid ${SEAT_COLORS[state].border}`,
                    cursor: state === 'booked' ? 'not-allowed' : 'pointer',
                    fontFamily: SANS, fontSize: 10, fontWeight: 600,
                    color: state === 'selected' ? '#fff' : state === 'booked' ? '#6b7280' : state === 'ladies' ? '#ec4899' : '#10b981',
                    transition: 'all 0.1s ease',
                  }}
                  title={`Row ${ri + 1} Seat ${ci + 1} — ${lbl(SEAT_LABEL_MAP[state].en, SEAT_LABEL_MAP[state].bn)}`}
                >
                  {`${ri + 1}${String.fromCharCode(65 + ci)}`}
                </button>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteTab({ tk, lang, stops }: { tk: Tokens; lang: Lang; stops: StopEntry[] }) {
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const kindColor: Record<string, string> = { boarding: '#10b981', stop: '#3b82f6', rest: '#f59e0b', destination: '#ef4444' };
  const kindLabel: Record<string, { en: string; bn: string }> = {
    boarding: { en: 'Boarding', bn: 'যাত্রা শুরু' },
    stop: { en: 'Stop', bn: 'স্টপ' },
    rest: { en: 'Rest Stop', bn: 'বিরতি' },
    destination: { en: 'Destination', bn: 'গন্তব্য' },
  };
  return (
    <div>
      {stops.map((stop, i) => (
        <div key={stop.name} style={{ display: 'flex', gap: 16, position: 'relative' }}>
          {/* Vertical line */}
          {i < stops.length - 1 && (
            <div style={{
              position: 'absolute', left: 14, top: 28, bottom: 0, width: 2,
              background: tk.line, zIndex: 0,
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: kindColor[stop.kind], border: `3px solid ${tk.bg}`,
              boxShadow: `0 0 0 2px ${kindColor[stop.kind]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {stop.kind === 'boarding' && <span style={{ fontSize: 11 }}>▶</span>}
              {stop.kind === 'destination' && <span style={{ fontSize: 11 }}>★</span>}
              {stop.kind === 'rest' && <span style={{ fontSize: 11 }}>☕</span>}
              {stop.kind === 'stop' && <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>•</span>}
            </div>
          </div>
          <div style={{ paddingBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 15, fontWeight: 600, color: tk.text }}>
                {lbl(stop.name, stop.nameBn)}
              </span>
              <span style={{
                background: `${kindColor[stop.kind]}22`, border: `1px solid ${kindColor[stop.kind]}`,
                borderRadius: 6, padding: '2px 8px',
                fontFamily: SANS, fontSize: 11, fontWeight: 600, color: kindColor[stop.kind],
              }}>
                {lbl(kindLabel[stop.kind].en, kindLabel[stop.kind].bn)}
              </span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: tk.textFaint, marginTop: 2 }}>
              🕐 {stop.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BusTab({ tk, lang }: { tk: Tokens; lang: Lang }) {
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {AMENITIES.map((a) => (
        <div key={a.label} style={{
          background: a.available ? '#10b98122' : tk.panelMuted,
          border: `1px solid ${a.available ? '#10b981' : tk.line}`,
          borderRadius: 14, padding: '16px 8px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 26, marginBottom: 6 }}>{a.icon}</div>
          <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, fontWeight: 600, color: a.available ? '#10b981' : tk.textFaint }}>
            {lbl(a.label, a.labelBn)}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 10, color: a.available ? '#10b981' : tk.textFaint, marginTop: 3 }}>
            {a.available ? lbl('✓ Available', '✓ আছে') : lbl('N/A', 'নেই')}
          </div>
        </div>
      ))}
    </div>
  );
}

const TRAVEL_PACKAGES: Record<string, { title: string; titleBn: string; price: string; nights: string; url: string; img: string }[]> = {
  "cox's bazar": [
    { title: "Cox's Bazar 3N/4D Package", titleBn: "কক্সবাজার ৩ রাত ৪ দিন", price: "৳8,500", nights: "3 nights", url: "https://www.go.com.bd/?utm_source=koyjabo&utm_medium=leads", img: "🏖️" },
    { title: "Honeymoon Special Package", titleBn: "হানিমুন স্পেশাল", price: "৳14,000", nights: "3 nights", url: "https://www.go.com.bd/?utm_source=koyjabo&utm_medium=leads", img: "💑" },
  ],
  "sylhet": [
    { title: "Sylhet Tea Garden Tour 2N/3D", titleBn: "সিলেট চা বাগান ২ রাত ৩ দিন", price: "৳6,500", nights: "2 nights", url: "https://www.go.com.bd/?utm_source=koyjabo&utm_medium=leads", img: "🍃" },
  ],
  "chittagong": [
    { title: "Chittagong City + Rangamati 3D", titleBn: "চট্টগ্রাম + রাঙামাটি ৩ দিন", price: "৳7,200", nights: "2 nights", url: "https://www.go.com.bd/?utm_source=koyjabo&utm_medium=leads", img: "⛰️" },
  ],
  "khulna": [
    { title: "Sundarbans 2N/3D Package", titleBn: "সুন্দরবন ২ রাত ৩ দিন", price: "৳9,500", nights: "2 nights", url: "https://www.go.com.bd/?utm_source=koyjabo&utm_medium=leads", img: "🌿" },
  ],
  "rajshahi": [
    { title: "Rajshahi Heritage 2D Tour", titleBn: "রাজশাহী ঐতিহ্য ২ দিন ভ্রমণ", price: "৳5,000", nights: "1 night", url: "https://www.go.com.bd/?utm_source=koyjabo&utm_medium=leads", img: "🏛️" },
  ],
};

function TravelPackagesSection({ tk, lang, toCity }: { tk: Tokens; lang: Lang; toCity: string }) {
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const key = toCity.toLowerCase();
  const packages = TRAVEL_PACKAGES[key];
  if (!packages || packages.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' as const, color: tk.textFaint, marginBottom: 12 }}>
        {lbl('Travel Packages', 'ট্রাভেল প্যাকেজ')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
        {packages.map((pkg, i) => (
          <a
            key={i}
            href={pkg.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{
              background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
              textDecoration: 'none', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: '#06b6d422', border: '1px solid #06b6d444',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              {pkg.img}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#06b6d4', marginBottom: 2, textTransform: 'uppercase' as const, letterSpacing: 0.4 }}>
                {lbl('PACKAGE', 'প্যাকেজ')}
              </div>
              <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, fontWeight: 600, color: tk.text }}>
                {lbl(pkg.title, pkg.titleBn)}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: tk.textDim }}>
                {pkg.nights} · {lbl('from', 'থেকে')} {pkg.price}
              </div>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#10b981', flexShrink: 0 }}>
              {pkg.price} ›
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function IntercityDetailPage(props: Props) {
  const { theme, device, lang, onNav, params } = props;
  const isMobile = device === 'mobile';
  const tk: Tokens = KJ_TOKENS[theme];
  const [activeTab, setActiveTab] = useState<TabId>('seats');
  const [showPhotos, setShowPhotos] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<BusRatingSummary | null>(null);
  const lbl = (en: string, bn: string) => T(lang, bn, en);

  // Use passed operator data or fall back to defaults
  const operatorName = params?.operator || 'Green Line Paribahan';
  const operatorInitials = operatorName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const routeText = params?.route || 'Dhaka ⇄ Cox\'s Bazar';
  const fareNonAC = params?.costNonAC || '৳680';
  const fareAC = params?.costAC && params.costAC !== '-' ? params.costAC : null;
  const counterLocation = params?.counter || 'Sayedabad / Arambagh';
  const contactNumber = params?.contact || '16557';
  const fromCity = params?.from || 'Dhaka';
  const toCity = params?.to || params?.district || 'Destination';

  useDocumentTitle(`${operatorName}: ${fromCity} → ${toCity}`);
  useEffect(() => {
    const slug = (operatorName + '-' + fromCity + '-' + toCity).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setCanonicalUrl(`/intercity/${slug}`);
  }, [operatorName, fromCity, toCity]);

  // Look up real operator + route data
  const realOperator = findOperator(operatorName);
  const realRoutes = fromCity && toCity ? findRoutesByFromTo(fromCity, toCity).filter(r => r.operator.id === (realOperator?.id || '')) : [];
  const realRoute = realRoutes[0]?.route || null;

  // Use real stops if available, else build from params
  const routeStops: StopEntry[] = realRoute
    ? realRoute.stops.map(s => ({
        name: s.name,
        nameBn: s.bnName,
        time: s.arrivalTime || '',
        kind: (s.type === 'origin' ? 'boarding' : s.type === 'destination' ? 'destination' : s.type === 'major' ? 'rest' : 'stop') as StopEntry['kind'],
      }))
    : buildStops(routeText, counterLocation, fromCity, toCity);

  // Use real data for display fields when available
  const displayFareNonAC = realRoute?.fareNonAC || fareNonAC;
  const displayFareAC = realRoute?.fareAC || fareAC;
  const displayDuration = realRoute?.durationHrs || '';
  const displayCounters = realRoute ? realRoute.dhakaCounters.join(' / ') : counterLocation;
  const displayContact = realOperator?.phone[0] || contactNumber;
  const departureTimes = realRoute?.departureTimes || [];
  const busTypes = realRoute?.busType || (realOperator?.busTypes || []);
  const operatorPolicy = realOperator?.policy || null;

  React.useEffect(() => {
    getBusRatings(operatorName).then(setRatingSummary).catch(() => setRatingSummary(null));
  }, [operatorName]);

  // Full-screen photo/rating views
  if (showPhotos) return (
    <PageShell {...props} canBack>
      <div style={{ padding: isMobile ? '16px 12px 100px' : '24px 40px 80px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 18, padding: 0, overflow: 'hidden' }}>
          <BusPhotoGallery
            busId={operatorName}
            busName={operatorName}
            busBnName={realOperator?.bnName || operatorName}
            onBack={() => setShowPhotos(false)}
            onSuccess={() => earnCoins(8, 'Photo uploaded')}
          />
        </div>
      </div>
    </PageShell>
  );

  if (showRating) return (
    <PageShell {...props} canBack>
      <div style={{ padding: isMobile ? '16px 12px 100px' : '24px 40px 80px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{
          background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 18,
          padding: 0, overflow: 'hidden',
          minHeight: isMobile ? 'calc(100vh - 150px)' : 'calc(100vh - 190px)',
          display: 'flex',
        }}>
          <BusRating
            busId={operatorName}
            busName={operatorName}
            onBack={() => {
              setShowRating(false);
              getBusRatings(operatorName).then(setRatingSummary).catch(() => setRatingSummary(null));
            }}
            onSuccess={() => earnCoins(10, 'Review submitted')}
          />
        </div>
      </div>
    </PageShell>
  );

  const tabContent = () => {
    switch (activeTab) {
      case 'seats': return <SeatsTab tk={tk} lang={lang} />;
      case 'route': return <RouteTab tk={tk} lang={lang} stops={routeStops} />;
      case 'bus': return <BusTab tk={tk} lang={lang} />;
      case 'photos': return (
        <BusPhotoGallery
          busId={operatorName}
          busName={operatorName}
          busBnName={realOperator?.bnName || operatorName}
          onBack={() => setActiveTab('bus')}
          onSuccess={() => earnCoins(8, 'Photo uploaded')}
        />
      );
      case 'reviews': return (
        <BusRating
          busId={operatorName}
          busName={operatorName}
          onBack={() => setActiveTab('bus')}
          onSuccess={() => {
            earnCoins(10, 'Review submitted');
            getBusRatings(operatorName).then(setRatingSummary).catch(() => {});
          }}
        />
      );
      case 'policy': {
        const pol = operatorPolicy;
        const policyItems = pol ? [
          { icon: '❌', title: lbl('Cancellation', 'বাতিল নীতি'), text: T(lang, pol.cancellationBn || '', pol.cancellation) },
          { icon: '💰', title: lbl('Refund', 'রিফান্ড'), text: T(lang, pol.refundBn || '', pol.refund) },
          { icon: '🧳', title: lbl('Luggage', 'মালপত্র'), text: T(lang, pol.luggageBn || '', pol.luggage) },
          { icon: '🚌', title: lbl('Boarding', 'বোর্ডিং'), text: T(lang, pol.boardingBn || '', pol.boarding) },
          { icon: '👶', title: lbl('Children', 'শিশু'), text: T(lang, pol.childPolicyBn || '', pol.childPolicy) },
        ] : [{ icon: '📋', title: lbl('Policy', 'নীতি'), text: lbl('Contact operator for policy details.', 'অপারেটরের সাথে যোগাযোগ করুন।') }];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {policyItems.map((item, i) => (
              <div key={i} style={{ background: tk.panelMuted, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 4 }}>{item.icon} {item.title}</div>
                <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, color: tk.textDim, lineHeight: 1.6 }}>{item.text}</div>
              </div>
            ))}
            {pol?.specialNotes?.map((note, i) => (
              <div key={`note-${i}`} style={{ background: `${tk.amber}22`, border: `1px solid ${tk.amber}44`, borderRadius: 10, padding: '10px 12px', fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, color: tk.textDim }}>
                ℹ️ {pol.specialNotesBn?.[i] ? T(lang, pol.specialNotesBn[i], note) : note}
              </div>
            ))}
            {departureTimes.length > 0 && (
              <div style={{ background: tk.panelMuted, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 8 }}>🕐 {lbl('Departure Times (from Dhaka)', 'ঢাকা থেকে ছাড়ার সময়')}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {departureTimes.map((t, i) => (
                    <span key={i} style={{ background: tk.primarySoft, color: tk.primary, borderRadius: 8, padding: '4px 10px', fontFamily: SANS, fontSize: 13, fontWeight: 700 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            {busTypes.length > 0 && (
              <div style={{ background: tk.panelMuted, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 8 }}>🚌 {lbl('Bus Types', 'বাসের ধরন')}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {busTypes.map((t, i) => (
                    <span key={i} style={{ background: tk.accentSoft, color: tk.accent, borderRadius: 8, padding: '4px 10px', fontFamily: SANS, fontSize: 12, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
    }
  };

  return (
    <PageShell {...props}>
    <div style={{ color: tk.text }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 55%, #022c22 100%)',
        padding: isMobile ? '28px 16px 24px' : '40px 32px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(16,185,129,0.12), transparent)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #006a4e 0%, #10b981 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: SANS, fontSize: 16, fontWeight: 800, color: '#fff',
              flexShrink: 0,
            }}>
              {operatorInitials}
            </div>
            <div>
              <h1 style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: isMobile ? 20 : 26, fontWeight: 800, color: '#fff', margin: 0 }}>
                {operatorName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  ⭐ {ratingSummary
                    ? `${ratingSummary.average.toFixed(1)} (${ratingSummary.count} ${lbl('reviews', 'রিভিউ')})`
                    : `4.2 (${lbl('loading...', 'লোড হচ্ছে...')})`}
                </span>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '3px 10px',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} className="kj-anim-pulse" />
                  <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.07em' }}>
                    {lbl('Live info', 'লাইভ তথ্য')}
                  </span>
                </div>
              </div>
              {/* Photo / Review action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => setShowPhotos(true)}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 10, padding: '8px 14px', color: '#fff',
                    fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  📷 {lbl('Photos', 'ছবি')}
                </button>
                <button
                  onClick={() => setShowRating(true)}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 10, padding: '8px 14px', color: '#fff',
                    fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  ★ {lbl('Review', 'রিভিউ')}
                </button>
              </div>
            </div>
          </div>

          {/* Journey strip */}
          <div style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16,
            padding: isMobile ? '14px 16px' : '16px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{routeText.split('⇄')[0]?.trim() || 'Dhaka'}</div>
              <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: '#fff' }}>{displayCounters.split('/')[0]?.trim() || 'Counter'}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{lbl('Boarding point', 'বোর্ডিং পয়েন্ট')}</div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{lbl('Overnight', 'রাত্রিকালীন')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontSize: 16 }}>🚌</span>
                <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.4)' }} />
              </div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{routeText.split('⇄')[1]?.trim() || "Destination"}</div>
              <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: '#fff' }}>{displayFareNonAC}</div>
              {displayFareAC && <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>AC: {displayFareAC}</div>}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { val: fromCity, label: lbl('From', 'থেকে') },
              { val: toCity, label: lbl('To', 'গন্তব্য') },
              { val: displayFareNonAC, label: lbl('Non-AC', 'নন-এসি') },
              ...(displayFareAC ? [{ val: displayFareAC, label: lbl('AC', 'এসি') }] : []),
              ...(displayDuration ? [{ val: displayDuration, label: lbl('Duration', 'সময়') }] : []),
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 14px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: '#fff' }}>{s.val}</div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content + sidebar layout */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px' : '24px 32px',
        display: 'flex', gap: 28, alignItems: 'flex-start',
      }}>
        {/* Main panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', overflowX: 'auto', gap: 4,
            borderBottom: `1px solid ${tk.line}`, marginBottom: 24, paddingBottom: 0,
          }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 14px', whiteSpace: 'nowrap',
                  fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? tk.primary : tk.textDim,
                  borderBottom: `2px solid ${activeTab === tab.id ? tk.primary : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {lbl(tab.en, tab.bn)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ marginBottom: 24 }}>{tabContent()}</div>

          {/* Inline ads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
            <AdSlot tk={tk} lang={lang} kind="mid-rect" />
          </div>

          {/* Book Online — affiliate ticket platforms (hidden until partner approval) */}
          {AFFILIATE_APPROVED && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 12 }}>
              🎟️ {lbl('Book Ticket Online', 'অনলাইনে টিকেট বুক করুন')}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              {TICKET_PLATFORMS.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  style={{
                    flex: '1 1 140px', minWidth: 130,
                    background: `${p.color}12`, border: `1.5px solid ${p.color}44`,
                    borderRadius: 14, padding: '14px 12px', textDecoration: 'none',
                    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 28 }}>{p.icon}</span>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: p.color }}>{p.name}</span>
                  <span style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, color: tk.textDim, textAlign: 'center' as const, lineHeight: 1.4 }}>
                    {lbl(p.tagline, p.taglineBn)}
                  </span>
                </a>
              ))}
            </div>
            <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, color: tk.textFaint, marginTop: 8 }}>
              ℹ️ {lbl('KoyJabo links to partner platforms · prices may vary', 'KoyJabo পার্টনার প্ল্যাটফর্মে লিঙ্ক করে · দাম ভিন্ন হতে পারে')}
            </div>
          </div>
          )}

          {/* Sponsored native cards */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 12 }}>
              {lbl('Sponsored', 'বিজ্ঞাপন')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SPONSORED_CARDS.map((card) => (
                <div key={card.brand} style={{
                  background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 14,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${card.brandColor}22`, border: `1px solid ${card.brandColor}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: card.brandColor, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      {card.brand}
                    </div>
                    <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 14, fontWeight: 600, color: tk.text }}>
                      {lbl(card.title, card.titleBn)}
                    </div>
                    <div style={{ fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 12, color: tk.textDim }}>
                      {lbl(card.sub, card.subBn)}
                    </div>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 18, color: tk.textFaint }}>›</span>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Packages */}
          <TravelPackagesSection tk={tk} lang={lang} toCity={toCity} />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
          </div>
        </div>

        {/* Right sidebar — desktop only */}
        {!isMobile && (
          <div style={{
            width: 280, flexShrink: 0,
            position: 'sticky', top: 76,
          }}>
            {/* Price info card */}
            <div style={{
              background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 18,
              padding: 20, boxShadow: tk.shadow,
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              marginBottom: 16,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: tk.text, marginBottom: 16 }}>
                {lbl('Price Info', 'মূল্য তথ্য')}
              </div>
              <div style={{ borderBottom: `1px solid ${tk.line}`, paddingBottom: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: tk.textDim }}>{lbl('AC Sleeper', 'এসি স্লিপার')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#10b981' }}>৳900–1200</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: tk.textDim }}>{lbl('Non-AC', 'নন-এসি')}</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#10b981' }}>৳700</span>
                </div>
              </div>

              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: tk.textFaint, marginBottom: 10 }}>
                {lbl('Where to Buy', 'কোথায় কিনবেন')}
              </div>
              {[
                { icon: '🏢', label: displayCounters },
                { icon: '📞', label: displayContact },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                  fontFamily: SANS, fontSize: 13, color: tk.textDim,
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}

              {AFFILIATE_APPROVED && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: tk.textFaint, marginBottom: 8 }}>
                  {lbl('Book Online', 'অনলাইনে বুক করুন')}
                </div>
                {TICKET_PLATFORMS.map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                      background: `${p.color}10`, border: `1px solid ${p.color}33`,
                      borderRadius: 8, padding: '8px 10px', textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: p.color }}>{p.name}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 12, color: tk.textFaint }}>›</span>
                  </a>
                ))}
                <div style={{ fontFamily: SANS, fontSize: 10, color: tk.textFaint, lineHeight: 1.4 }}>
                  ℹ️ {lbl('Partner links · info only', 'পার্টনার লিঙ্ক · শুধু তথ্য')}
                </div>
              </div>
              )}
              {!AFFILIATE_APPROVED && (
                <div style={{
                  marginTop: 14, background: tk.amberSoft, border: `1px solid ${tk.amber}`,
                  borderRadius: 10, padding: '8px 10px',
                  fontFamily: lang === 'bn' ? BEN : SANS, fontSize: 11, color: tk.textDim, lineHeight: 1.5,
                }}>
                  ℹ {lbl("KoyJabo doesn't sell tickets · info only", 'KoyJabo টিকেট বিক্রি করে না · শুধু তথ্য')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
    </PageShell>
  );
}
