import React, { useState, useEffect, useRef } from 'react';
import { STATIONS } from '../../../constants';
import { KJ_TOKENS, T, SANS, BEN, chipBtn } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Icon } from '../components/Icons';
import { askGeminiRoute, ChatMessage } from '../../../services/geminiService';
import { askGitHubModels } from '../../../services/githubModelsService';
import { getAllSessions, getSession, saveChatMessage, deleteSession } from '../../../services/chatHistoryManager';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

function AvatarAI({ tk }: { tk: any }) {
  return (
    <div style={{ width:32,height:32,borderRadius:999,background:`linear-gradient(135deg,${tk.primary},${tk.accent})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
      <svg viewBox="0 0 32 32" width="32" height="32">
        <rect x="8" y="10" width="16" height="14" rx="5" fill="rgba(255,255,255,0.9)"/>
        <circle cx="13" cy="16" r="1.8" fill={tk.primaryDeep} className="kj-ai-eye"/>
        <circle cx="19" cy="16" r="1.8" fill={tk.primaryDeep} className="kj-ai-eye2"/>
        <path d="M13 21 Q16 23 19 21" stroke={tk.accent} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

type Msg = { id: number; isUser: boolean; text: string; rich?: string };
const INIT_MESSAGES: Msg[] = [
  { id:1, isUser:false, text:'hello', rich:'greeting' },
];

function ChatBubble({ msg, tk, lang }: { msg: any; tk: any; lang:'bn'|'en' }) {
  const isUser = msg.isUser;
  if (msg.rich === 'greeting') {
    return (
      <div style={{ display:'flex',gap:10,alignSelf:'flex-start',maxWidth:'80%' }}>
        <AvatarAI tk={tk}/>
        <div style={{ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:16,padding:'12px 16px',color:tk.text }}>
          <div style={{ fontFamily:BEN,fontSize:14,lineHeight:1.6 }}>
            {T(lang,'হ্যালো! আমি কই যাবো AI। বাংলাদেশের যেকোনো পরিবহন সম্পর্কে জিজ্ঞেস করুন।','Hello! I\'m KoyJabo AI. Ask me anything about transport in Bangladesh.')}
          </div>
        </div>
      </div>
    );
  }
  if (msg.rich === 'table') {
    return (
      <div style={{ display:'flex',gap:10,alignSelf:'flex-start',maxWidth:'90%' }}>
        <AvatarAI tk={tk}/>
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          <div style={{ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:16,padding:'12px 16px',color:tk.text,fontFamily:BEN,fontSize:14,lineHeight:1.6 }}>
            {T(lang,'গুলশান → মতিঝিল রুটে ৩টি বিকল্প আছে:','Gulshan → Motijheel has 3 options:')}
          </div>
          <div style={{ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:16,overflow:'hidden' }}>
            <table style={{ width:'100%',borderCollapse:'collapse',fontFamily:SANS,fontSize:12 }}>
              <thead>
                <tr style={{ background:tk.primarySoft }}>
                  {[T(lang,'মাধ্যম','Mode'),T(lang,'সময়','Time'),T(lang,'ভাড়া','Fare'),T(lang,'রেটিং','Rating')].map((h,i)=>(
                    <th key={i} style={{ padding:'8px 10px',textAlign:'left',color:tk.text,fontWeight:700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m:'🚌 Green Line', t:'48 min', f:'৳ 60', r:'★4.2', best:true },
                  { m:'🚇 Metro', t:'32 min', f:'৳ 40', r:'★5.0', best:false },
                  { m:'🚕 CNG', t:'35 min', f:'৳ 120', r:'★3.8', best:false },
                ].map((row,i)=>(
                  <tr key={i} style={{ borderTop:`1px solid ${tk.line}`,background:row.best?tk.primarySoft:'transparent' }}>
                    <td style={{ padding:'8px 10px',color:tk.text,fontWeight:row.best?700:400 }}>{row.m}</td>
                    <td style={{ padding:'8px 10px',color:tk.textDim }}>{row.t}</td>
                    <td style={{ padding:'8px 10px',color:tk.text,fontWeight:700 }}>{row.f}</td>
                    <td style={{ padding:'8px 10px',color:'#f59e0b' }}>{row.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
            {[T(lang,'🗺 রুট দেখুন','🗺 See route'),T(lang,'📊 তুলনা','📊 Compare'),T(lang,'⭐ রিভিউ','⭐ Reviews')].map((c,i)=>(
              <button key={i} style={chipBtn(tk)}>{c}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (msg.rich === 'coxs') {
    return (
      <div style={{ display:'flex',gap:10,alignSelf:'flex-start',maxWidth:'85%' }}>
        <AvatarAI tk={tk}/>
        <div style={{ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:16,padding:'12px 16px',color:tk.text,fontFamily:BEN,fontSize:14,lineHeight:1.7 }}>
          {T(lang,
            "কক্সবাজার যাওয়ার ৩টি উপায়:\n\n🚌 বাস (গ্রীন লাইন/হানিফ): ৳৯০০–২৫০০, রাতে ছাড়ে, ১০–১২ ঘণ্টা\n🚆 ট্রেন (কক্সবাজার এক্সপ্রেস): ৳২০০–১২০০, রাত ১০টায় ছাড়ে, ৯ ঘণ্টা\n✈️ ফ্লাইট (বিমান/ইউএস বাংলা): ৳৪৫০০+, ৫৫ মিনিট",
            "3 ways to reach Cox's Bazar:\n\n🚌 Bus (Green Line/Hanif): ৳900–2500, overnight, 10–12h\n🚆 Train (Cox's Bazar Express): ৳200–1200, 10PM, 9h\n✈️ Flight (Biman/US-Bangla): ৳4500+, 55 min"
          )}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display:'flex',gap:10,alignSelf:isUser?'flex-end':'flex-start',maxWidth:'80%',flexDirection:isUser?'row-reverse':'row' }}>
      {!isUser && <AvatarAI tk={tk}/>}
      {isUser && <div style={{ width:32,height:32,borderRadius:999,background:tk.accentSoft,color:tk.accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:SANS,fontWeight:700,fontSize:12 }}>MF</div>}
      <div style={{ background:isUser?tk.primary:tk.panel,color:isUser?tk.primaryInk:tk.text,border:isUser?0:`1px solid ${tk.line}`,borderRadius:16,padding:'12px 16px',fontFamily:BEN,fontSize:14,lineHeight:1.6 }}>
        {isUser ? msg.text : renderMd(msg.text, tk)}
      </div>
    </div>
  );
}

function renderMd(text: string, tk: any) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} style={{ height:6 }} />;
    if (/^─{3,}$/.test(trimmed)) return <div key={i} style={{ borderTop:`1px solid ${tk.line}`,margin:'8px 0' }} />;

    // Parse **bold** inline
    const parseBold = (s: string) => {
      const parts = s.split(/\*\*(.+?)\*\*/);
      return parts.map((p, j) => j % 2 === 1
        ? <strong key={j} style={{ fontWeight:700, color:tk.text }}>{p}</strong>
        : p);
    };

    const isRoute = /^\d+\.\s/.test(trimmed);
    const isHeader = /^[🗺️🏆⚡📍🚌🚇🚂✈️🚢🛳️⛴️🚶]/.test(trimmed) && trimmed.length < 120;
    const isKV = /^[💰⏱️🔄⚠️📌📞🎁📝✅]/.test(trimmed);

    return (
      <div key={i} style={{
        display:'flex', gap: isRoute ? 6 : 0,
        marginBottom: isHeader ? 6 : isRoute ? 3 : 2,
        paddingLeft: isRoute ? 4 : 0,
        background: isHeader && trimmed.startsWith('🏆') ? `${tk.primarySoft}33` : isHeader && trimmed.startsWith('⚡') ? `${tk.accentSoft}22` : 'transparent',
        borderRadius: isHeader ? 6 : 0,
        padding: isHeader ? '3px 6px' : '0',
      }}>
        {parseBold(trimmed)}
      </div>
    );
  });
}

// Find nearest station name from GPS coords using all known STATIONS
function nearestArea(lat: number, lng: number): string {
  const stationList = Object.values(STATIONS).filter((s: any) => s.lat && s.lng);
  let best: any = stationList[0];
  let bestDist = Infinity;
  for (const s of stationList as any[]) {
    const d = (s.lat - lat) ** 2 + (s.lng - lng) ** 2;
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return best?.name || 'Dhaka';
}

export function AIChatPage(props: Props) {
  const { theme, device, lang } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>(INIT_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const userAreaRef = useRef<string>('');

  useEffect(() => {
    const consent = localStorage.getItem('kj-location-consent');
    if (consent !== 'yes') return;
    // Use stored area first (fast), then refresh in background
    const stored = localStorage.getItem('kj-location-area');
    if (stored) userAreaRef.current = stored;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const area = nearestArea(pos.coords.latitude, pos.coords.longitude);
        userAreaRef.current = area;
        localStorage.setItem('kj-location-area', area);
      },
      () => {},
      { timeout: 5000, maximumAge: 300000 }
    );
  }, []);
  const suggestions = [
    { bn:'কোন বাস গুলশান থেকে মতিঝিল?', en:'Bus Gulshan to Motijheel?' },
    { bn:'বিমানবন্দর → ফার্মগেট', en:'Airport → Farmgate' },
    { bn:'সদরঘাট লঞ্চ সময়', en:'Sadarghat launch times' },
    { bn:'মেট্রো সময়সূচি', en:'Metro schedule' },
  ];

  const [showAllRecents, setShowAllRecents] = useState(false);
  const [allRecents, setAllRecents] = useState(() =>
    getAllSessions().slice().sort((a, b) => b.lastUpdated - a.lastUpdated)
      .map(s => ({ id: s.id, title: s.messages.find(m => m.role === 'user')?.text || T(lang, 'নতুন কথোপকথন', 'New conversation') }))
  );
  const recents = showAllRecents ? allRecents : allRecents.slice(0, 5);

  function loadSession(id: string) {
    const session = getSession(id);
    if (!session) return;
    setSessionId(id);
    const msgs: Msg[] = session.messages.map((m, i) => ({ id: i, isUser: m.role === 'user', text: m.text }));
    setMessages(msgs.length ? msgs : INIT_MESSAGES);
  }

  function handleDeleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteSession(id);
    setAllRecents(prev => prev.filter(r => r.id !== id));
    if (sessionId === id) { setSessionId(null); setMessages(INIT_MESSAGES); }
  }

  async function send() {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    const userMsg = { id: Date.now(), isUser:true, text:userText };
    setMessages(m => [...m, userMsg]);
    const nextSessionId = saveChatMessage({ role: 'user', text: userText, timestamp: Date.now() } as any, sessionId);
    setSessionId(nextSessionId);
    setInput('');
    setIsLoading(true);
    // Refresh recents list (new session title)
    setAllRecents(getAllSessions().slice().sort((a, b) => b.lastUpdated - a.lastUpdated)
      .map(s => ({ id: s.id, title: s.messages.find(m => m.role === 'user')?.text || T(lang, 'নতুন কথোপকথন', 'New conversation') })));
    try {
      const currentMessages = [...messages, userMsg];
      const chatHistory: ChatMessage[] = currentMessages
        .filter(m => !(m as any).rich)
        .map(m => ({ role: m.isUser ? 'user' : 'assistant', text: m.text }));

      const hasFrom = /\bfrom\b|থেকে|হতে/i.test(userText);
      const area = userAreaRef.current;

      // Extract destination from "how to go X", "route to X", "reach X" etc.
      function extractGoToDest(q: string): string | null {
        const m = q.match(
          /^(?:how\s+(?:to\s+)?(?:go|get)\s+(?:to\s+)?|route\s+to\s+|(?:reach|take\s+me\s+to|go\s+to|directions?\s+to|best\s+(?:bus|way)\s+(?:to|for)|nearest\s+way\s+to|how\s+can\s+i\s+(?:get\s+to|reach)\s+))(.+?)(?:\?|$)/i
        ) || q.match(/(?:কিভাবে\s+যাব[োো]?\s+|যেতে\s+চাই\s+|যাবো?\s+কিভাবে\s+)(.+?)(?:\?|।|$)/i);
        return m ? m[1].trim().replace(/[?।]$/, '').trim() : null;
      }

      const goToDest = !hasFrom ? extractGoToDest(userText) : null;
      let queryForOffline: string;
      if (area && goToDest) {
        // Build unambiguous "FROM to DEST" — prevents positional reversal
        queryForOffline = `${area} to ${goToDest} [Context: User is in ${area} area]`;
      } else if (!hasFrom && area) {
        queryForOffline = `${userText} from ${area} [Context: User is in ${area} area]`;
      } else {
        queryForOffline = userText;
      }

      let response: string;
      try {
        response = await askGitHubModels(userText, chatHistory);
      } catch {
        response = await askGeminiRoute(queryForOffline, undefined, chatHistory, 'Mejbaur');
        // Prepend "Your current location" when GPS was injected and area not already in response
        if (!hasFrom && area && response && !response.includes(area)) {
          const prefix = lang === 'bn'
            ? `📍 **আপনার বর্তমান অবস্থান:** ${area}\n\n`
            : `📍 **Your current location:** ${area}\n\n`;
          response = prefix + response;
        }
      }
      saveChatMessage({ role: 'assistant', text: response, timestamp: Date.now() } as any, nextSessionId);
      setMessages(m => [...m, { id: Date.now()+1, isUser:false, text:response }]);
    } catch {
      setMessages(m => [...m, { id: Date.now()+1, isUser:false, text:T(lang,'দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।','Sorry, something went wrong. Please try again.') }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageShell {...props}>
      <div style={{ display:'flex', height: isMobile ? 'calc(100vh - 52px - 60px)' : 'calc(100vh - 60px)', overflow:'hidden', position:'relative' }}>
        {/* Left sidebar — fixed on desktop */}
        {!isMobile && (
          <div style={{ width:280,flexShrink:0,borderRight:`1px solid ${tk.line}`,display:'flex',flexDirection:'column',overflow:'hidden auto',background:tk.panel }}>
            <div style={{ padding:'14px 16px', borderBottom:`1px solid ${tk.line}` }}>
              <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:10 }}>
                {T(lang,'সাম্প্রতিক কথোপকথন','Recent conversations')}
              </div>
              {recents.length > 0 ? (
                <>
                  {recents.map((r) => (
                    <div key={r.id}
                      onClick={() => loadSession(r.id)}
                      style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 8px',borderRadius:10,cursor:'pointer',fontFamily:BEN,fontSize:12,color:tk.textDim,marginBottom:3,background: sessionId===r.id ? tk.primarySoft : 'transparent' }}
                      onMouseEnter={e=>(e.currentTarget.style.background=tk.chipBg)}
                      onMouseLeave={e=>(e.currentTarget.style.background=sessionId===r.id ? tk.primarySoft : 'transparent')}>
                      <span style={{ flexShrink:0 }}>💬</span>
                      <span style={{ flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.title}</span>
                      <button
                        onClick={e => handleDeleteSession(r.id, e)}
                        style={{ flexShrink:0,background:'none',border:'none',cursor:'pointer',color:tk.textFaint,fontSize:14,padding:'0 2px',lineHeight:1 }}
                        title={T(lang,'মুছুন','Delete')}>×</button>
                    </div>
                  ))}
                  {allRecents.length > 5 && (
                    <button onClick={() => setShowAllRecents(v => !v)} style={{ width:'100%',background:'none',border:`1px solid ${tk.line}`,borderRadius:8,padding:'5px',fontFamily:SANS,fontSize:11,color:tk.textFaint,cursor:'pointer',marginTop:4 }}>
                      {showAllRecents ? T(lang,'কম দেখুন','Show less') : T(lang,`আরও ${allRecents.length - 5}টি দেখুন`,`Load ${allRecents.length - 5} more`)}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ fontFamily:BEN,fontSize:12,color:tk.textFaint,lineHeight:1.6,padding:'6px 0' }}>
                  {T(lang,'এখনো কোনো কথোপকথন নেই।','No conversations yet.')}
                </div>
              )}
            </div>
            <div style={{ padding:'14px 16px' }}>
              <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:10 }}>
                {T(lang,'পরামর্শ','Suggestions')}
              </div>
              {suggestions.map((s,i)=>(
                <button key={i} onClick={()=>setInput(T(lang,s.bn,s.en))} style={{ display:'block',width:'100%',textAlign:'left',padding:'7px 10px',borderRadius:10,border:`1px solid ${tk.line}`,background:'transparent',color:tk.text,fontFamily:BEN,fontSize:12,cursor:'pointer',marginBottom:5 }}>
                  {T(lang,s.bn,s.en)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main chat */}
        <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
          <div style={{ flex:1, minHeight:0, overflow:'auto', padding:'16px', paddingBottom: isMobile ? '80px' : '16px', display:'flex',flexDirection:'column',gap:14 }}>
            {messages.map(msg => <ChatBubble key={msg.id} msg={msg} tk={tk} lang={lang}/>)}
            {isLoading && (
              <div style={{ display:'flex',gap:10,alignSelf:'flex-start',maxWidth:'80%' }}>
                <AvatarAI tk={tk}/>
                <div style={{ background:tk.panel,border:`1px solid ${tk.line}`,borderRadius:16,padding:'12px 16px',color:tk.textDim,fontFamily:SANS,fontSize:18,letterSpacing:4 }}>
                  <span className="kj-ai-dots">···</span>
                </div>
              </div>
            )}
          </div>
          {/* Mobile suggestion chips */}
          {isMobile && (
            <div style={{ display:'flex',gap:6,padding:'8px 12px',overflowX:'auto',borderTop:`1px solid ${tk.line}` }}>
              {suggestions.slice(0,3).map((s,i)=>(
                <button key={i} onClick={()=>setInput(T(lang,s.bn,s.en))} style={{ flexShrink:0,background:tk.panelMuted,border:`1px solid ${tk.line}`,borderRadius:999,padding:'6px 12px',fontFamily:BEN,fontSize:11,color:tk.textDim,cursor:'pointer',whiteSpace:'nowrap' }}>
                  {T(lang,s.bn,s.en)}
                </button>
              ))}
            </div>
          )}
          {/* Input bar — fixed on mobile so it's always visible above tab bar */}
          <div style={{
            position: isMobile ? 'fixed' : 'relative',
            bottom: isMobile ? 60 : 'auto',
            left: isMobile ? 0 : 'auto',
            right: isMobile ? 0 : 'auto',
            zIndex: isMobile ? 120 : 'auto',
            padding:'12px 16px',
            paddingBottom: isMobile ? '14px' : '12px',
            borderTop:`1px solid ${tk.line}`,
            background: tk.panel,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display:'flex', gap:10, alignItems:'flex-end',
          }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
              placeholder={T(lang,'আপনার প্রশ্ন লিখুন...','Type your question...')}
              style={{ flex:1,background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:14,padding: isMobile ? '14px 16px' : '12px 14px',fontFamily:BEN,fontSize: isMobile ? 16 : 14,color:tk.text,outline:'none',minWidth:0 }}/>
            <button onClick={send} disabled={isLoading} style={{ width:44,height:44,borderRadius:999,background:isLoading?tk.panelMuted:tk.primary,color:tk.primaryInk,border:0,cursor:isLoading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Icon.arrowR s={18}/>
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
