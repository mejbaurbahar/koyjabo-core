import React, { useState, useEffect } from 'react';
import { KJ_TOKENS, T, SANS, BEN, N } from '../tokens';
import { PageShell } from './PageShell';
import {
  getBalance, isAdFree, getAdFreeUntil, getTransactions,
  activateAdFree, claimDailyBonus, claimOneTimeBonus, isOneTimeClaimed,
} from '../utils/koyCoinService';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

const EARN_STEPS = [
  { e:'📅', bn:'প্রতিদিন লগইন', en:'Daily login', pts:'+10', col:'#10b981' },
  { e:'🔍', bn:'বাস/ট্রেন/মেট্রো সার্চ', en:'Search bus/train/metro/launch', pts:'+5', col:'#0ea5e9' },
  { e:'🔀', bn:'ট্রানজিট রুট দেখুন', en:'View transit route', pts:'+5', col:'#7c3aed' },
  { e:'✈️', bn:'ফ্লাইট বিস্তারিত', en:'View flight detail', pts:'+2', col:'#f59e0b' },
  { e:'🤖', bn:'AI সহায়ক ব্যবহার', en:'Use AI assistant', pts:'+3', col:'#ec4899' },
  { e:'⭐', bn:'বাস রিভিউ দিন', en:'Submit bus review', pts:'+10', col:'#f59e0b' },
  { e:'📸', bn:'বাসের ছবি আপলোড', en:'Upload bus photo', pts:'+8', col:'#10b981' },
  { e:'✅', bn:'ভ্রমণ সম্পন্ন করুন', en:'Complete a trip', pts:'+15', col:'#0ea5e9' },
  { e:'👍', bn:'Facebook ফলো করুন', en:'Follow on Facebook', pts:'+20', col:'#1877f2', oneTime:true },
  { e:'💼', bn:'LinkedIn ফলো করুন', en:'Follow on LinkedIn', pts:'+20', col:'#0a66c2', oneTime:true },
];

const AD_FREE_PLANS = [
  { hours:1, cost:50, e:'⚡', bn:'১ ঘন্টা', en:'1 hour', col:'#10b981' },
  { hours:6, cost:200, e:'🔥', bn:'৬ ঘন্টা', en:'6 hours', col:'#0ea5e9' },
  { hours:24, cost:500, e:'👑', bn:'২৪ ঘন্টা', en:'24 hours', col:'#a855f7' },
];

function fmtTime(ms: number): string {
  const diff = ms - Date.now();
  if (diff <= 0) return '';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:false });
}

export function KoyCoinsPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';

  const [balance, setBalance] = useState(getBalance);
  const [adFree, setAdFree] = useState(isAdFree);
  const [adFreeUntil, setAdFreeUntil] = useState(getAdFreeUntil);
  const [txns, setTxns] = useState(getTransactions);
  const [toast, setToast] = useState('');
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [fbClaimed, setFbClaimed] = useState(() => isOneTimeClaimed('follow-facebook'));
  const [liClaimed, setLiClaimed] = useState(() => isOneTimeClaimed('follow-linkedin'));

  const refresh = () => {
    setBalance(getBalance());
    setAdFree(isAdFree());
    setAdFreeUntil(getAdFreeUntil());
    setTxns(getTransactions());
  };

  useEffect(() => {
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleClaim = () => {
    if (claimDailyBonus()) { refresh(); setDailyClaimed(true); showToast(T(lang, '+১০ কয়েন পেলেন!', '+10 coins earned!')); }
    else showToast(T(lang, 'আজকের বোনাস নেওয়া হয়েছে', 'Daily bonus already claimed'));
  };

  const handleActivate = (hours: number, cost: number) => {
    if (balance < cost) { showToast(T(lang, 'পর্যাপ্ত কয়েন নেই', 'Not enough coins')); return; }
    if (activateAdFree(hours, cost)) { refresh(); showToast(T(lang, 'বিজ্ঞাপনমুক্ত সক্রিয়!', 'Ad-free activated!')); }
  };

  const card = (p=16): React.CSSProperties => ({ background:tk.panel, border:`1px solid ${tk.line}`, borderRadius:16, padding:p });
  const gold = '#f59e0b';

  return (
    <PageShell {...props}>
      {toast && (
        <div style={{ position:'fixed', top:72, left:'50%', transform:'translateX(-50%)', zIndex:9999, background:tk.primary, color:tk.primaryInk, padding:'10px 20px', borderRadius:999, fontFamily:SANS, fontWeight:700, fontSize:13, boxShadow:tk.shadowLg, whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      <div style={{ padding:isMobile?'0 0 80px':'0 0 48px' }}>
        {/* Hero — transit ticket style */}
        <div style={{ background:`linear-gradient(135deg,#1a0a00 0%,#7c2d00 50%,#b45309 100%)`, padding:isMobile?'28px 20px':'40px 48px', color:'#fff', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 0%,rgba(245,158,11,0.3),transparent 70%)', pointerEvents:'none' }}/>
          {/* Ticket notch decorations */}
          <div style={{ position:'absolute', left:-16, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:999, background:tk.bg }}/>
          <div style={{ position:'absolute', right:-16, top:'50%', transform:'translateY(-50%)', width:32, height:32, borderRadius:999, background:tk.bg }}/>

          <div style={{ display:'flex', alignItems:'center', gap:isMobile?16:32, flexWrap:'wrap', position:'relative' }}>
            {/* Balance */}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:44, filter:'drop-shadow(0 0 16px rgba(245,158,11,0.7))' }}>🪙</div>
              <div style={{ fontFamily:SANS, fontWeight:900, fontSize:isMobile?52:64, lineHeight:1, letterSpacing:-3 }}>{N(balance, lang)}</div>
              <div style={{ fontFamily:BEN, fontSize:13, opacity:0.8 }}>{T(lang,'কয় কয়েন','KoyCoins')}</div>
            </div>

            {/* Divider — dashed like transit ticket */}
            <div style={{ width:1, alignSelf:'stretch', borderLeft:'2px dashed rgba(255,255,255,0.25)', margin:'4px 0', display:isMobile?'none':'block' }}/>

            {/* Status */}
            <div style={{ flex:1, minWidth:160 }}>
              {adFree ? (
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(245,158,11,0.25)', border:'1px solid rgba(245,158,11,0.5)', borderRadius:12, padding:'10px 16px', marginBottom:10 }}>
                    <span style={{ fontSize:18 }}>✅</span>
                    <div>
                      <div style={{ fontFamily:SANS, fontWeight:700, fontSize:13 }}>{T(lang,'বিজ্ঞাপনমুক্ত সক্রিয়','Ad-free active')}</div>
                      <div style={{ fontFamily:SANS, fontSize:11, opacity:0.8 }}>{T(lang,'বাকি','Remaining')}: {fmtTime(adFreeUntil)}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily:BEN, fontSize:12, opacity:0.65 }}>{T(lang,'কোনো বিজ্ঞাপন দেখাবে না','No ads are showing')}</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily:BEN, fontSize:15, fontWeight:700, marginBottom:6 }}>{T(lang,'বিজ্ঞাপন বন্ধ করুন','Skip all ads')}</div>
                  <div style={{ fontFamily:BEN, fontSize:13, opacity:0.7 }}>{T(lang,'কয়েন ব্যবহার করে সব বিজ্ঞাপন বন্ধ করুন','Spend coins to remove all ads')}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding:isMobile?'16px 16px':'24px 48px', display:'flex', flexDirection:'column', gap:18 }}>
          {/* Daily bonus */}
          <div style={{ ...card(14), display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${gold},#d97706)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🎁</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,'ডেইলি বোনাস','Daily bonus')}</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint, marginTop:2 }}>+{N(10,lang)} {T(lang,'কয়েন প্রতিদিন','coins per day')}</div>
            </div>
            <button onClick={handleClaim} style={{ background:dailyClaimed?tk.panelMuted:`linear-gradient(135deg,${gold},#d97706)`, color:dailyClaimed?tk.textFaint:'#fff', border:`1px solid ${dailyClaimed?tk.line:gold}`, borderRadius:10, padding:'9px 18px', fontFamily:SANS, fontWeight:700, fontSize:13, cursor:dailyClaimed?'default':'pointer' }}>
              {dailyClaimed ? T(lang,'✓ সংগ্রহ হয়েছে','✓ Claimed') : T(lang,'সংগ্রহ করুন','Claim')}
            </button>
          </div>

          {/* Skip ads — transit ticket style plans */}
          <div style={card()}>
            <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, color:tk.text, marginBottom:14 }}>
              🚫 {T(lang,'বিজ্ঞাপনমুক্ত প্ল্যান','Ad-free plans')}
            </div>
            <div style={{ display:'flex', flexDirection:isMobile?'column':'row', gap:10 }}>
              {AD_FREE_PLANS.map((p,i)=>{
                const canAfford = balance >= p.cost;
                return (
                  <div key={i} style={{ flex:1, background:canAfford?`${p.col}14`:'transparent', border:`1.5px solid ${canAfford?p.col:tk.line}`, borderRadius:14, padding:'14px 12px', position:'relative', overflow:'hidden' }}>
                    {/* Ticket notch */}
                    <div style={{ position:'absolute', left:-8, top:'50%', transform:'translateY(-50%)', width:16, height:16, borderRadius:999, background:tk.bg, border:`1.5px solid ${canAfford?p.col:tk.line}` }}/>
                    <div style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', width:16, height:16, borderRadius:999, background:tk.bg, border:`1.5px solid ${canAfford?p.col:tk.line}` }}/>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:24, marginBottom:4 }}>{p.e}</div>
                      <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,p.bn,p.en)}</div>
                      <div style={{ borderTop:`1px dashed ${canAfford?p.col:tk.line}`, margin:'8px 0' }}/>
                      <div style={{ fontFamily:SANS, fontWeight:800, fontSize:15, color:canAfford?p.col:tk.textFaint }}>🪙 {N(p.cost, lang)}</div>
                      <button onClick={()=>handleActivate(p.hours,p.cost)} style={{ marginTop:10, width:'100%', background:canAfford?`linear-gradient(135deg,${p.col},${p.col}99)`:'transparent', color:canAfford?'#fff':tk.textFaint, border:`1px solid ${canAfford?p.col:tk.line}`, borderRadius:8, padding:'8px 0', fontFamily:SANS, fontWeight:700, fontSize:12, cursor:canAfford?'pointer':'default' }}>
                        {T(lang,'ব্যবহার করুন','Use')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete travel */}
          <div style={{ ...card(14), display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:'rgba(16,185,129,0.15)', border:'1px solid #10b981', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>✅</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:14, color:tk.text }}>{T(lang,'ভ্রমণ সম্পন্ন করুন','Complete a trip')}</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint, marginTop:2 }}>+{N(15,lang)} {T(lang,'কয়েন প্রতিটি সম্পূর্ণ যাত্রায়','coins per completed journey')}</div>
            </div>
            <button onClick={()=>{ claimOneTimeBonus(`trip-${Date.now()}`,15,'Trip completed'); refresh(); showToast(T(lang,'+১৫ কয়েন পেলেন!','+15 coins earned!')); }} style={{ background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:0, borderRadius:10, padding:'9px 16px', fontFamily:SANS, fontWeight:700, fontSize:12, cursor:'pointer' }}>
              {T(lang,'সম্পন্ন হয়েছে','Done')}
            </button>
          </div>

          {/* Social follows */}
          <div style={card()}>
            <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, color:tk.text, marginBottom:14 }}>
              🌐 {T(lang,'সোশ্যাল ফলো করুন (একবার)','Follow us (one-time bonus)')}
            </div>
            <div style={{ display:'flex', flexDirection:isMobile?'column':'row', gap:10 }}>
              {[
                { id:'follow-facebook', bn:'Facebook ফলো', en:'Follow Facebook', col:'#1877f2', soft:'rgba(24,119,242,0.12)', pts:20, url:'https://facebook.com/koyjabo', e:'👍', claimed:fbClaimed, setClaimed:setFbClaimed },
                { id:'follow-linkedin', bn:'LinkedIn ফলো', en:'Follow LinkedIn', col:'#0a66c2', soft:'rgba(10,102,194,0.12)', pts:20, url:'https://linkedin.com/company/koyjabo', e:'💼', claimed:liClaimed, setClaimed:setLiClaimed },
              ].map((s,i)=>(
                <div key={i} style={{ flex:1, background:s.claimed?tk.panelMuted:s.soft, border:`1.5px solid ${s.claimed?tk.line:s.col}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:24 }}>{s.e}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:BEN, fontWeight:700, fontSize:13, color:tk.text }}>{T(lang,s.bn,s.en)}</div>
                    <div style={{ fontFamily:SANS, fontSize:11, color:s.claimed?tk.textFaint:s.col, fontWeight:700 }}>🪙 +{N(s.pts, lang)} {s.claimed?T(lang,'সংগ্রহ হয়েছে','claimed'):T(lang,'কয়েন','coins')}</div>
                  </div>
                  <button onClick={()=>{ if(s.claimed) return; window.open(s.url,'_blank'); setTimeout(()=>{ const ok = claimOneTimeBonus(s.id, s.pts, T(lang,s.bn,s.en)+' follow'); if(ok){ refresh(); s.setClaimed(true); showToast(T(lang,`+${s.pts} কয়েন পেলেন!`,`+${s.pts} coins earned!`)); }}, 1500); }} style={{ background:s.claimed?'transparent':`linear-gradient(135deg,${s.col},${s.col}99)`, color:s.claimed?tk.textFaint:'#fff', border:`1px solid ${s.claimed?tk.line:s.col}`, borderRadius:9, padding:'8px 14px', fontFamily:SANS, fontWeight:700, fontSize:12, cursor:s.claimed?'default':'pointer', whiteSpace:'nowrap' }}>
                    {s.claimed ? T(lang,'✓ সম্পন্ন','✓ Done') : T(lang,'ফলো করুন','Follow')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* How to earn — transit timeline */}
          <div style={card()}>
            <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, color:tk.text, marginBottom:16 }}>
              💡 {T(lang,'কীভাবে কয়েন পাবেন','How to earn coins')}
            </div>
            <div style={{ position:'relative' }}>
              {EARN_STEPS.map((step,i)=>(
                <div key={i} style={{ display:'flex', gap:14 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:24, flexShrink:0 }}>
                    <div style={{ width:24, height:24, borderRadius:999, background:`${step.col}22`, border:`2px solid ${step.col}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>{step.e}</div>
                    {i < EARN_STEPS.length-1 && <div style={{ width:2, flex:1, background:`${step.col}33`, minHeight:16 }}/>}
                  </div>
                  <div style={{ flex:1, paddingBottom:i < EARN_STEPS.length-1?12:0, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                    <div>
                      <div style={{ fontFamily:BEN, fontSize:13, color:tk.text }}>{T(lang,step.bn,step.en)}</div>
                      {(step as any).oneTime && <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{T(lang,'একবার','One-time')}</div>}
                    </div>
                    <div style={{ fontFamily:SANS, fontWeight:800, fontSize:13, color:step.col, flexShrink:0 }}>{step.pts.replace(/(\d+)/, m => N(m, lang))}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction history */}
          {txns.length > 0 && (
            <div style={card()}>
              <div style={{ fontFamily:BEN, fontWeight:700, fontSize:15, color:tk.text, marginBottom:14 }}>
                📋 {T(lang,'লেনদেনের ইতিহাস','Transaction history')}
              </div>
              <div style={{ position:'relative' }}>
                {txns.slice(0,15).map((tx,i)=>(
                  <div key={i} style={{ display:'flex', gap:12 }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:22, flexShrink:0 }}>
                      <div style={{ width:22, height:22, borderRadius:999, background:tx.type==='earn'?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)', border:`1.5px solid ${tx.type==='earn'?'#10b981':'#ef4444'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, flexShrink:0 }}>
                        {tx.type==='earn'?'↑':'↓'}
                      </div>
                      {i < txns.slice(0,15).length-1 && <div style={{ width:2, flex:1, background:'rgba(255,255,255,0.06)', minHeight:14 }}/>}
                    </div>
                    <div style={{ flex:1, paddingBottom:i<Math.min(txns.length,15)-1?12:0, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                      <div>
                        <div style={{ fontFamily:BEN, fontSize:12, color:tk.text }}>{tx.reason}</div>
                        <div style={{ fontFamily:SANS, fontSize:10, color:tk.textFaint }}>{fmtDate(tx.ts)}</div>
                      </div>
                      <div style={{ fontFamily:SANS, fontWeight:700, fontSize:13, color:tx.type==='earn'?'#10b981':'#ef4444', flexShrink:0 }}>
                        {tx.type==='earn'?'+':'-'}{N(tx.amount, lang)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {txns.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:44, marginBottom:12, filter:'drop-shadow(0 0 12px rgba(245,158,11,0.5))' }}>🪙</div>
              <div style={{ fontFamily:BEN, fontSize:15, color:tk.text, fontWeight:700 }}>{T(lang,'কয়েন অর্জন শুরু করুন','Start earning coins')}</div>
              <div style={{ fontFamily:SANS, fontSize:12, color:tk.textFaint, marginTop:6 }}>{T(lang,'বাস/ট্রানজিট সার্চ করুন ও কয়েন পান','Search bus/transit routes to earn coins')}</div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
