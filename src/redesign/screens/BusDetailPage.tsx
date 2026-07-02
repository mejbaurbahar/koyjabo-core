import React, { useEffect, useMemo, useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn, N, Fare } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot, NativeAdCard, AdCluster } from '../components/AdSlot';
import { Pill } from '../components/Pill';
import { BUS_DATA, STATIONS } from '../../../constants';
import BusRouteMap from '../../../components/BusRouteMap';
import BusRating from '../../../components/BusRating';
import BusPhotoGallery from '../../../components/BusPhotoGallery';
import EmergencyHelplineModal from '../../../components/EmergencyHelplineModal';
import { getBusRatings, BusRatingSummary } from '../../../services/communityDataService';
import { earnCoins } from '../utils/koyCoinService';
import type { UserLocation } from '../../../types';
import { getFavoriteBusIds, toggleFavoriteBus } from '../utils/favorites';
import { useDocumentTitle, setCanonicalUrl } from '../utils/useDocumentTitle';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string,p?:Record<string,string>)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const TYPE_COLOR: Record<string, [string,string]> = {
  'AC': ['#006a4e','#10b981'], 'Local': ['#1e3a8a','#3b82f6'],
  'Double-Decker': ['#5b21b6','#7c3aed'], 'Semi-Sitting': ['#0c4a6e','#0ea5e9'],
  'Sitting': ['#92400e','#f59e0b'], 'Metro Rail': ['#00543c','#10b981'],
};

function haversineKm(a: UserLocation, b: UserLocation) {
  const r = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function resolveStationId(value: string, fallback: string) {
  if (!value) return fallback;
  const exact = STATIONS[value.toLowerCase()];
  if (exact) return exact.id;
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return Object.values(STATIONS).find(station =>
    station.id.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized ||
    station.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized ||
    (station.bnName || '').toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
  )?.id || fallback;
}

export function BusDetailPage(props: Props) {
  const { theme, device, lang, params } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });

  const busId = params?.busId ?? '';
  const bus = BUS_DATA.find(b => b.id === busId) ?? BUS_DATA[0];
  const fromId = resolveStationId(params?.from ?? '', bus.stops[0]);
  const toId = resolveStationId(params?.to ?? '', bus.stops[bus.stops.length - 1]);

  const startName = STATIONS[bus.stops[0]]?.name ?? bus.stops[0];
  const endName = STATIONS[bus.stops[bus.stops.length - 1]]?.name ?? bus.stops[bus.stops.length - 1];
  useDocumentTitle(`${bus.name}: ${startName} ⇄ ${endName}`);
  useEffect(() => { setCanonicalUrl(`/bus/${busId}`); }, [busId]);

  // Detect if user's from→to direction is reverse of the bus route order
  // e.g. bus goes Gabtoli(0)→Gulshan(5), user searched Gulshan→Gabtoli → isReversed=true
  const fromIdx = bus.stops.indexOf(fromId);
  const toIdx = bus.stops.indexOf(toId);
  const isRouteReversed = fromIdx > toIdx && fromIdx !== -1 && toIdx !== -1;
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteBusIds());
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showHelpline, setShowHelpline] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<BusRatingSummary | null>(null);

  const realStops = useMemo(() => {
    const stopsInOrder = isRouteReversed ? [...bus.stops].reverse() : bus.stops;
    return stopsInOrder.map((sid, i) => {
      const st = STATIONS[sid];
      return {
        id: sid,
        en: st?.name ?? sid.replace(/_/g,' '),
        bn: st?.bnName ?? sid,
        lat: st?.lat,
        lng: st?.lng,
        isFrom: sid === fromId || (!params?.from && i === 0),
        isTo: sid === toId || (!params?.to && i === stopsInOrder.length - 1),
      };
    });
  }, [bus, fromId, toId, params?.from, params?.to, isRouteReversed]);

  const nearest = useMemo(() => {
    if (!userLocation) return null;
    return realStops.reduce<{ index: number; distance: number } | null>((best, stop, index) => {
      if (typeof stop.lat !== 'number' || typeof stop.lng !== 'number') return best;
      const distance = haversineKm(userLocation, { lat: stop.lat, lng: stop.lng });
      if (!best || distance < best.distance) return { index, distance };
      return best;
    }, null);
  }, [realStops, userLocation]);

  useEffect(() => {
    getBusRatings(bus.id).then(setRatingSummary).catch(() => setRatingSummary(null));
  }, [bus.id]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    if (localStorage.getItem('kj-location-consent') !== 'yes') return;
    const id = navigator.geolocation.watchPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  if (showRating) return (
    <PageShell {...props} canBack>
      <div style={{ padding:isMobile?'16px 12px 100px':'24px 40px 80px', maxWidth:920, margin:'0 auto' }}>
        <div style={{ ...card(18), padding:0, overflow:'hidden', minHeight:isMobile?'calc(100vh - 150px)':'calc(100vh - 190px)', display:'flex' }}>
          <BusRating busId={bus.id} busName={bus.name} onBack={() => { setShowRating(false); getBusRatings(bus.id).then(setRatingSummary).catch(() => setRatingSummary(null)); }} onSuccess={() => earnCoins(10, 'Bus review submitted')}/>
        </div>
      </div>
          <AdCluster tk={tk} lang={lang} count={3} isMobile={isMobile}/>
    </PageShell>
  );
  if (showPhotos) return (
    <PageShell {...props} canBack>
      <div style={{ padding:isMobile?'16px 12px 100px':'24px 40px 80px', maxWidth:920, margin:'0 auto' }}>
        <div style={{ ...card(18), padding:0, overflow:'hidden' }}>
          <BusPhotoGallery busId={bus.id} busName={bus.name} busBnName={bus.bnName} onBack={() => setShowPhotos(false)} onSuccess={() => earnCoins(8, 'Bus photo uploaded')}/>
        </div>
      </div>
          <AdCluster tk={tk} lang={lang} count={3} isMobile={isMobile}/>
    </PageShell>
  );

  const colPair = TYPE_COLOR[bus.type] ?? ['#1e3a8a','#3b82f6'];
  const badge = bus.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const fareAmt = bus.type==='AC'?60:bus.type==='Double-Decker'?50:30;
  const isFavorite = favoriteIds.includes(bus.id);
  const nearestStopName = nearest ? realStops[nearest.index]?.en : undefined;

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 100px':'28px 40px 145px', maxWidth:1180, margin:'0 auto' }}>
        <div style={{ height:isMobile?320:430,borderRadius:16,overflow:'hidden',position:'relative',marginBottom:18,background:'#0a1f14',border:`1px solid ${tk.line}` }}>
          <BusRouteMap
            route={bus}
            userLocation={userLocation}
            highlightStartId={fromId}
            highlightEndId={toId}
            isReversed={isRouteReversed}
            height="100%"
          />
        </div>

        <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'1.35fr 0.8fr',gap:20 }}>
          <div>
            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:14 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${colPair[0]},${colPair[1]})`,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SANS,fontWeight:800,fontSize:15 }}>{badge}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:BEN,fontWeight:700,fontSize:16,color:tk.text }}>{lang==='bn'?bus.bnName:bus.name}</div>
                  <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:2,flexWrap:'wrap' }}>
                    {ratingSummary && ratingSummary.count > 0 ? (
                      <>
                        <span style={{ color:'#f59e0b',fontSize:12 }}>★ {ratingSummary.average.toFixed(1)}</span>
                        <span style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>{ratingSummary.count} {T(lang,'রিভিউ','reviews')}</span>
                      </>
                    ) : (
                      <span style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>{T(lang,'এখনো কোনো রিভিউ নেই','No reviews yet')}</span>
                    )}
                    <Pill tk={tk} tone={bus.type==='AC'?'primary':'mute'}>{bus.type}</Pill>
                  </div>
                </div>
              </div>
              <div style={{ fontFamily:BEN,fontSize:13,color:tk.textDim,marginBottom:12 }}>{bus.routeString}</div>
              <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,marginBottom:12 }}>{bus.hours}</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
                {[
                  {v:N(bus.stops.length, lang),l:T(lang,'স্টপ','stops')},
                  {v:Fare(fareAmt, lang),l:T(lang,'ভাড়া','fare')},
                  {v:bus.type,l:T(lang,'ধরন','type')},
                ].map((s,i)=>(
                  <div key={i} style={{ background:tk.panelMuted,borderRadius:10,padding:'8px 6px',textAlign:'center' }}>
                    <div style={{ fontFamily:SANS,fontWeight:800,fontSize:14,color:tk.text }}>{s.v}</div>
                    <div style={{ fontFamily:SANS,fontSize:10,color:tk.textFaint }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card(18),marginBottom:16 }}>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:14 }}>{T(lang,'স্টপসমূহ','Stops')} <span style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint }}>({N(realStops.length, lang)})</span></div>
              {realStops.map((s,i)=>{
                const isNearest = nearest?.index === i;
                const showHelp = isNearest && nearest.distance <= 1.5;
                return (
                  <div key={s.id} style={{ display:'flex',gap:14,paddingBottom:i<realStops.length-1?12:0,position:'relative' }}>
                    <div style={{ width:20,flexShrink:0,position:'relative',display:'flex',justifyContent:'center' }}>
                      {i<realStops.length-1 && <div style={{ position:'absolute',top:16,bottom:-4,width:2,background:tk.primary,opacity:0.3 }}/>}
                      <div style={{ width:s.isFrom||s.isTo||isNearest?18:12,height:s.isFrom||s.isTo||isNearest?18:12,borderRadius:999,marginTop:4,background:isNearest?'#38bdf8':s.isFrom?tk.primary:s.isTo?tk.accent:tk.panel,border:`2px solid ${isNearest?'#38bdf8':s.isFrom?tk.primary:s.isTo?tk.accent:tk.primary}` }}/>
                    </div>
                    <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
                        <span style={{ fontFamily:BEN,fontWeight:s.isFrom||s.isTo?700:500,fontSize:14,color:tk.text }}>{lang==='bn'?s.bn:s.en}</span>
                        {s.isFrom && <Pill tk={tk} tone="primary">{T(lang,'বোর্ডিং','Boarding')}</Pill>}
                        {s.isTo && <Pill tk={tk} tone="accent">{T(lang,'গন্তব্য','Destination')}</Pill>}
                        {isNearest && <Pill tk={tk} tone="mute">{T(lang,'আপনি এখানে','You are here')}</Pill>}
                      </div>
                      {showHelp && (
                        <button onClick={() => setShowHelpline(true)} style={{ background:tk.accentSoft,border:`1px solid ${tk.accent}55`,borderRadius:999,padding:'6px 10px',fontFamily:BEN,fontWeight:700,fontSize:12,color:tk.accent,cursor:'pointer',whiteSpace:'nowrap' }}>
                          {T(lang,'হেল্পলাইন','Help line')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <NativeAdCard
              tk={tk}
              lang={lang}
              kind={isMobile?'mob-banner':'leaderboard'}
              title={T(lang, 'এই রুটের জন্য অফার', 'Offers along this route')}
              icon="🎯"
            />
          </div>

          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <div style={{ ...card(16),background:`linear-gradient(135deg,${colPair[0]},${colPair[1]})`,color:'#fff',border:'none' }}>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:16,marginBottom:12 }}>{T(lang,'বাস তথ্য','Bus info')}</div>
              {[
                {l:T(lang,'অপারেটর','Operator'),v:bus.name},
                {l:T(lang,'বাস আইডি','Bus ID'),v:bus.id},
                {l:T(lang,'ভাড়া','Fare'),v:'৳ '+N(fareAmt, lang)},
                {l:T(lang,'বাসের ধরন','Type'),v:bus.type},
                {l:T(lang,'সময়সূচি','Hours'),v:bus.hours},
              ].map((d,i)=>(
                <div key={i} style={{ display:'flex',justifyContent:'space-between',gap:12,paddingBottom:8,borderBottom:'1px solid rgba(255,255,255,0.12)',marginBottom:8 }}>
                  <span style={{ fontFamily:BEN,fontSize:13,opacity:0.8 }}>{d.l}</span>
                  <span style={{ fontFamily:SANS,fontWeight:700,fontSize:13,textAlign:'right' }}>{d.v}</span>
                </div>
              ))}
              {nearest && (
                <p style={{ fontFamily:BEN,fontSize:12,opacity:0.82,marginTop:8 }}>
                  {T(lang,'নিকটতম স্টপ','Nearest stop')}: {lang === 'bn' ? realStops[nearest.index]?.bn : realStops[nearest.index]?.en} · {N(nearest.distance.toFixed(1), lang)} km
                </p>
              )}
            </div>
            <div style={card(16)}>
              <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:10 }}>{T(lang,'কমিউনিটি','Community')}</div>
              <button onClick={() => setShowRating(true)} style={{ ...chipBtn(tk),width:'100%',justifyContent:'center',marginBottom:8 }}>
                ★ {T(lang,'রিভিউ দিন','Rate & review')}
              </button>
              <button onClick={() => setShowPhotos(true)} style={{ ...chipBtn(tk),width:'100%',justifyContent:'center' }}>
                {T(lang,'ছবি দেখুন / আপলোড','Photos / upload')}
              </button>
            </div>
            <NativeAdCard
              tk={tk}
              lang={lang}
              kind="mid-rect"
              title={T(lang, 'যাত্রীদের জন্য অফার', 'For your journey')}
              subtitle={T(lang, 'রাইড, ফুড ও পার্সেল', 'Ride, food & parcel')}
              icon="🎁"
              compact
            />
          </div>
        </div>
      </div>

      <div style={{ position:'fixed', bottom: isMobile ? 0 : 60, left:0, right:0, background:tk.panel, backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)', borderTop:`1px solid ${tk.line}`, padding:'12px 16px', display:'flex', gap:10, zIndex:9100 }}>
        <button onClick={()=>setFavoriteIds(toggleFavoriteBus(bus.id))} style={{ ...chipBtn(tk),borderRadius:12,padding:'10px 16px',color:isFavorite?tk.accent:tk.text }}>
          {isFavorite?'♥':'♡'} {T(lang,'সেভ','Save')}
        </button>
        <button onClick={()=>setShowRating(true)} style={{ ...chipBtn(tk),borderRadius:12,padding:'10px 16px' }}>
          ★ {T(lang,'রেট','Rate')}
        </button>
        <button style={{ flex:1,background:tk.primary,color:tk.primaryInk,border:0,borderRadius:12,padding:'12px 20px',fontFamily:SANS,fontWeight:700,fontSize:14,cursor:'pointer' }}>
          {T(lang,'নেভিগেট শুরু','Start navigation')}
        </button>
      </div>

      <EmergencyHelplineModal
        isOpen={showHelpline}
        onClose={() => setShowHelpline(false)}
        userLocation={userLocation}
        currentLocationName={nearestStopName}
      />
          <AdCluster tk={tk} lang={lang} count={3} isMobile={isMobile}/>
    </PageShell>
  );
}
