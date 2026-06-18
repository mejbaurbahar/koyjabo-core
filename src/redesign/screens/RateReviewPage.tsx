import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function RateReviewPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [aspects, setAspects] = useState<Record<string,number>>({ Comfort:0, Punctuality:0, Cleanliness:0, Value:0, Safety:0 });
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [anon, setAnon] = useState(false);
  const card = (r=16): React.CSSProperties => ({ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:r,padding:16 });

  const allTags = [T(lang,'পরিষ্কার','Clean'),T(lang,'AC ভালো','AC works'),T(lang,'আরামদায়ক','Comfortable'),T(lang,'সময়মতো','On-time'),T(lang,'নিরাপদ','Safe'),T(lang,'বন্ধুত্বপূর্ণ স্টাফ','Friendly staff'),T(lang,'মূল্যমান ভালো','Good value'),T(lang,'সুপারিশযোগ্য','Recommended')];

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);
  }

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:600, margin:'0 auto' }}>
        <div style={{ fontFamily:BEN,fontWeight:700,fontSize:18,color:tk.text,marginBottom:20 }}>
          {T(lang,'গ্রীন লাইন পরিবহন রেটিং','Rate Green Line Paribahan')}
        </div>

        {/* Star picker */}
        <div style={{ ...card(18),marginBottom:16,display:'flex',flexDirection:'column',alignItems:'center',gap:14 }}>
          <div style={{ fontFamily:BEN,fontSize:14,color:tk.textDim }}>{T(lang,'সামগ্রিক রেটিং','Overall rating')}</div>
          <div style={{ display:'flex',gap:8 }}>
            {[1,2,3,4,5].map(s=>(
              <span key={s} onClick={()=>setStars(s)} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
                style={{ fontSize:36,cursor:'pointer',color:(hover||stars)>=s?'#f59e0b':tk.textFaint,transition:'color .1s' }}>★</span>
            ))}
          </div>
          {(hover||stars)>0 && <div style={{ fontFamily:BEN,fontSize:13,color:tk.primary }}>{[T(lang,'খুব খারাপ','Very poor'),T(lang,'খারাপ','Poor'),T(lang,'ঠিক আছে','OK'),T(lang,'ভালো','Good'),T(lang,'দুর্দান্ত','Excellent')][(hover||stars)-1]}</div>}
        </div>

        {/* Aspect ratings */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text,marginBottom:12 }}>{T(lang,'বিস্তারিত রেটিং','Aspect ratings')}</div>
          {Object.keys(aspects).map(aspect=>(
            <div key={aspect} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
              <span style={{ fontFamily:SANS,fontSize:12,color:tk.textDim,width:90,flexShrink:0 }}>{aspect}</span>
              <div style={{ display:'flex',gap:4 }}>
                {[1,2,3,4,5].map(s=>(
                  <span key={s} onClick={()=>setAspects(a=>({...a,[aspect]:s}))}
                    style={{ fontSize:18,cursor:'pointer',color:aspects[aspect]>=s?'#f59e0b':tk.textFaint }}>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text,marginBottom:12 }}>{T(lang,'আপনার অভিজ্ঞতা','Your experience')}</div>
          <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
            {allTags.map(t=>(
              <button key={t} onClick={()=>toggleTag(t)} style={{ padding:'6px 12px',borderRadius:999,border:`1px solid ${tags.includes(t)?tk.primary:tk.line}`,background:tags.includes(t)?tk.primarySoft:'transparent',color:tags.includes(t)?tk.primary:tk.textDim,fontFamily:BEN,fontSize:12,cursor:'pointer' }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Photo upload */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <div style={{ fontFamily:BEN,fontWeight:700,fontSize:14,color:tk.text,marginBottom:12 }}>{T(lang,'ছবি আপলোড','Upload photos')}</div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            {[['#10b981','#064e3b'],['#3b82f6','#1e3a8a']].map(([c1,c2],i)=>(
              <div key={i} style={{ width:70,height:70,borderRadius:12,background:`linear-gradient(135deg,${c1},${c2})`,position:'relative',cursor:'pointer' }}>
                <button style={{ position:'absolute',top:-6,right:-6,width:20,height:20,borderRadius:999,background:tk.accent,color:'#fff',border:0,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',padding:0 }}>✕</button>
              </div>
            ))}
            <div style={{ width:70,height:70,borderRadius:12,background:tk.panelMuted,border:`2px dashed ${tk.line}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,cursor:'pointer',position:'relative' }}>
              <div style={{ width:70,height:70,borderRadius:12,background:`conic-gradient(${tk.primary} 72%, transparent 0)`,position:'absolute',inset:0,opacity:0.3 }}/>
              <span style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,position:'relative' }}>72%</span>
            </div>
            <div style={{ width:70,height:70,borderRadius:12,background:tk.panelMuted,border:`2px dashed ${tk.line}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,cursor:'pointer',color:tk.textFaint }}>+</div>
          </div>
        </div>

        {/* Text */}
        <div style={{ ...card(18),marginBottom:16 }}>
          <textarea value={text} onChange={e=>setText(e.target.value.slice(0,500))}
            placeholder={T(lang,'আপনার রিভিউ লিখুন... (সর্বোচ্চ ৫০০ অক্ষর)','Write your review... (max 500 chars)')}
            style={{ width:'100%',minHeight:100,background:'transparent',border:0,color:tk.text,fontFamily:BEN,fontSize:14,lineHeight:1.6,outline:'none',resize:'none',boxSizing:'border-box' }}/>
          <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,textAlign:'right' }}>{text.length}/500</div>
        </div>

        {/* Anonymous toggle */}
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
          <div onClick={()=>setAnon(a=>!a)} style={{ width:36,height:22,borderRadius:999,background:anon?tk.primary:tk.line,position:'relative',cursor:'pointer',transition:'background .2s' }}>
            <div style={{ position:'absolute',top:2,left:anon?16:2,width:18,height:18,borderRadius:999,background:'#fff',transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }}/>
          </div>
          <span style={{ fontFamily:BEN,fontSize:13,color:tk.text }}>{T(lang,'বেনামে পোস্ট করুন','Post anonymously')}</span>
        </div>

        <button style={{ width:'100%',background:tk.primary,color:tk.primaryInk,border:0,borderRadius:14,padding:'14px 20px',fontFamily:BEN,fontWeight:700,fontSize:16,cursor:'pointer',boxShadow:`0 6px 16px -6px ${tk.primary}` }}>
          {T(lang,'রিভিউ পোস্ট করুন','Post Review')}
        </button>
      </div>
    </PageShell>
  );
}
