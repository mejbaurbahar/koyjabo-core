import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot, NativeAdCard } from '../components/AdSlot';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const STATIONS = ['Uttara North','Uttara Center','Uttara South','Pallabi','Mirpur 11','Mirpur 10','Kazipara','Shewrapara','Agargaon','Bijoy Sarani','Farmgate','Karwan Bazar','Shahbag','Dhaka University','Secretariat','Motijheel','Kamalapur'];
const FARES = [20,30,40,50,60,70,80,80,90,90,90,100,100,100,100,100];

export function MetroTokenPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const fare = from && to ? (() => { const a=STATIONS.indexOf(from),b=STATIONS.indexOf(to); return a>=0&&b>=0 ? FARES[Math.abs(a-b)-1]||100 : null; })() : null;

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:700, margin:'0 auto' }}>
        <div style={{ background:tk.metroBg,borderRadius:22,padding:isMobile?18:24,marginBottom:20,color:'#fff' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:10 }}>
            <div style={{ width:44,height:44,borderRadius:12,background:tk.primary,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:SANS,fontWeight:800,fontSize:15 }}>M6</div>
            <div>
              <div style={{ fontFamily:SANS,fontSize:11,fontWeight:700,letterSpacing:1.3,color:'#7fb89c',textTransform:'uppercase' }}>{T(lang,'একক যাত্রা','Single Journey')}</div>
              <h2 style={{ fontFamily:BEN,fontWeight:700,fontSize:20,margin:0 }}>{T(lang,'একক যাত্রা টোকেন','Single Journey Token')}</h2>
            </div>
          </div>
          <p style={{ fontFamily:BEN,fontSize:14,opacity:0.85,margin:0 }}>{T(lang,'যেকোনো একটি যাত্রায় ট্যাপ করুন','Tap and ride any single journey')}</p>
        </div>

        {/* Fare calculator */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:14 }}>{T(lang,'ভাড়া হিসাব করুন','Calculate fare')}</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12 }}>
            <div>
              <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.2,textTransform:'uppercase',marginBottom:6 }}>{T(lang,'কোথা থেকে','From')}</div>
              <select value={from} onChange={e=>setFrom(e.target.value)} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:10,padding:'10px 12px',color:tk.text,fontFamily:BEN,fontSize:13,outline:'none' }}>
                <option value="">{T(lang,'স্টেশন বেছে নিন','Select station')}</option>
                {STATIONS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.2,textTransform:'uppercase',marginBottom:6 }}>{T(lang,'কোথায়','To')}</div>
              <select value={to} onChange={e=>setTo(e.target.value)} style={{ width:'100%',background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:10,padding:'10px 12px',color:tk.text,fontFamily:BEN,fontSize:13,outline:'none' }}>
                <option value="">{T(lang,'স্টেশন বেছে নিন','Select station')}</option>
                {STATIONS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {fare && (
            <div style={{ background:tk.primarySoft,borderRadius:14,padding:16,textAlign:'center' }}>
              <div style={{ fontFamily:SANS,fontWeight:800,fontSize:32,color:tk.primary }}>৳ {fare}</div>
              <div style={{ fontFamily:BEN,fontSize:13,color:tk.textDim }}>{from} → {to}</div>
            </div>
          )}
        </div>

        {/* Fare table */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:12 }}>{T(lang,'ভাড়ার তালিকা','Fare table')}</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            {STATIONS.slice(1).map((s,i)=>(
              <div key={s} style={{ display:'flex',justifyContent:'space-between',padding:'8px 10px',borderRadius:10,background:tk.panelMuted }}>
                <span style={{ fontFamily:SANS,fontSize:12,color:tk.textDim }}>Uttara N → {s}</span>
                <span style={{ fontFamily:SANS,fontWeight:700,fontSize:12,color:tk.primary }}>৳{FARES[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to buy */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:14 }}>{T(lang,'কীভাবে টোকেন কিনবেন','How to buy token')}</div>
          {[
            { e:'🏧', t:T(lang,'টোকেন ভেন্ডিং মেশিন বা কাউন্টারে যান','Go to token vending machine or counter') },
            { e:'🖥️', t:T(lang,'গন্তব্য স্টেশন বেছে নিন','Select your destination station') },
            { e:'💳', t:T(lang,'নগদ বা কার্ডে পেমেন্ট করুন','Pay with cash or card') },
            { e:'🎫', t:T(lang,'টোকেন নিন, গেটে ট্যাপ করুন','Collect token, tap at gate') },
          ].map((s,i)=>(
            <div key={i} style={{ display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:i<3?`1px solid ${tk.line}`:'none' }}>
              <div style={{ width:36,height:36,borderRadius:10,background:tk.primarySoft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>{s.e}</div>
              <span style={{ fontFamily:BEN,fontSize:13,color:tk.text }}>{s.t}</span>
            </div>
          ))}
        </div>

        {/* Good to know */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:15,color:tk.text,marginBottom:12 }}>{T(lang,'জানা ভালো','Good to know')}</div>
          <div style={{ display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:10 }}>
            {[
              { e:'⏱️', t:T(lang,'টোকেন মাত্র ৯০ মিনিট বৈধ','Token valid for 90 minutes only') },
              { e:'🚫', t:T(lang,'বের হওয়ার পর পুনরায় প্রবেশ নেই','No re-entry after exit') },
              { e:'💰', t:T(lang,'হারানো টোকেন = পূর্ণ ভাড়া','Lost token = full fare again') },
              { e:'👶', t:T(lang,'৩ বছরের নিচে শিশু: বিনামূল্যে','Children under 3: free') },
            ].map((g,i)=>(
              <div key={i} style={{ display:'flex',gap:10,alignItems:'flex-start',padding:10,background:tk.panelMuted,borderRadius:12 }}>
                <span style={{ fontSize:18 }}>{g.e}</span>
                <span style={{ fontFamily:BEN,fontSize:12,color:tk.textDim,lineHeight:1.5 }}>{g.t}</span>
              </div>
            ))}
          </div>
        </div>
          <NativeAdCard
            tk={tk}
            lang={lang}
            kind="multiplex"
            title={T(lang, 'মেট্রো যাত্রীদের অফার', 'Offers for metro riders')}
            icon="🎫"
          />
        <NativeAdCard
          tk={tk}
          lang={lang}
          kind={isMobile?'mob-banner':'leaderboard'}
          title={T(lang, 'পরিবহন ডিল', 'Transit deals')}
          icon="🚇"
        />
      </div>
    </PageShell>
  );
}
