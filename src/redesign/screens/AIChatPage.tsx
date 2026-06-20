import React, { useState, useEffect, useRef } from 'react';
import { KJ_TOKENS, T, SANS, BEN, chipBtn } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { Icon } from '../components/Icons';
import { askGeminiRoute, ChatMessage } from '../../../services/geminiService';
import { askGitHubModels } from '../../../services/githubModelsService';
import { getAllSessions, saveChatMessage } from '../../../services/chatHistoryManager';

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

// Nearest area from GPS coords using major Bangladesh locations
function nearestArea(lat: number, lng: number): string {
  const areas = [
    { name: 'Uttara', lat: 23.8759, lng: 90.3795 },
    { name: 'Mirpur', lat: 23.8223, lng: 90.3654 },
    { name: 'Gulshan', lat: 23.7928, lng: 90.4144 },
    { name: 'Banani', lat: 23.7937, lng: 90.4066 },
    { name: 'Dhanmondi', lat: 23.7461, lng: 90.3742 },
    { name: 'Mohammadpur', lat: 23.7625, lng: 90.3580 },
    { name: 'Farmgate', lat: 23.7581, lng: 90.3903 },
    { name: 'Motijheel', lat: 23.7330, lng: 90.4182 },
    { name: 'Old Dhaka', lat: 23.7104, lng: 90.4074 },
    { name: 'Khilgaon', lat: 23.7502, lng: 90.4279 },
    { name: 'Badda', lat: 23.7814, lng: 90.4278 },
    { name: 'Demra', lat: 23.7126, lng: 90.4559 },
    { name: 'Savar', lat: 23.8580, lng: 90.2660 },
    { name: 'Gazipur', lat: 23.9999, lng: 90.4203 },
    { name: 'Narayanganj', lat: 23.6238, lng: 90.5000 },
    { name: 'Chattogram', lat: 22.3569, lng: 91.7832 },
    { name: 'Sylhet', lat: 24.8949, lng: 91.8687 },
    { name: 'Rajshahi', lat: 24.3745, lng: 88.6042 },
    { name: 'Khulna', lat: 22.8456, lng: 89.5403 },
    { name: 'Barishal', lat: 22.7010, lng: 90.3535 },
  ];
  let best = areas[0], bestDist = Infinity;
  for (const a of areas) {
    const d = (a.lat - lat) ** 2 + (a.lng - lng) ** 2;
    if (d < bestDist) { bestDist = d; best = a; }
  }
  return best.name;
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
  const recents = getAllSessions()
    .slice()
    .sort((a, b) => b.lastUpdated - a.lastUpdated)
    .slice(0, 6)
    .map(session => ({
      id: session.id,
      title: session.messages.find(message => message.role === 'user')?.text || T(lang, 'নতুন কথোপকথন', 'New conversation'),
    }));

  async function send() {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    const userMsg = { id: Date.now(), isUser:true, text:userText };
    setMessages(m => [...m, userMsg]);
    const nextSessionId = saveChatMessage({ role: 'user', text: userText, timestamp: Date.now() } as any, sessionId);
    setSessionId(nextSessionId);
    setInput('');
    setIsLoading(true);
    try {
      const currentMessages = [...messages, userMsg];
      const chatHistory: ChatMessage[] = currentMessages
        .filter(m => !(m as any).rich)
        .map(m => ({ role: m.isUser ? 'user' : 'assistant', text: m.text }));

      // Inject GPS area context when user didn't specify a "from" location
      const hasFrom = /\bfrom\b|থেকে|হতে|\bfrom\b/i.test(userText);
      const area = userAreaRef.current;
      const queryForOffline = (!hasFrom && area)
        ? `${userText} [Context: User is in ${area} area]`
        : userText;

      let response: string;
      try {
        // CF Workers AI gets the raw query (has its own system prompt with GPS note)
        response = await askGitHubModels(userText, chatHistory);
      } catch {
        // Offline fallback gets GPS context injected
        response = await askGeminiRoute(queryForOffline, undefined, chatHistory, 'Mejbaur');
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
            <div style={{ padding:'18px 16px', borderBottom:`1px solid ${tk.line}` }}>
              <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:10 }}>
                {T(lang,'সাম্প্রতিক কথোপকথন','Recent conversations')}
              </div>
              {recents.length > 0 ? recents.map((r)=>(
                <div key={r.id} style={{ padding:'8px 10px',borderRadius:10,cursor:'default',fontFamily:BEN,fontSize:13,color:tk.textDim,marginBottom:4 }}
                  onMouseEnter={e=>(e.currentTarget.style.background=tk.chipBg)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  💬 {r.title}
                </div>
              )) : (
                <div style={{ fontFamily:BEN,fontSize:13,color:tk.textFaint,lineHeight:1.6,padding:'8px 0' }}>
                  {T(lang,'এখনো কোনো কথোপকথন নেই। প্রশ্ন করলে এখানে দেখা যাবে।','No conversations yet. Ask a question and it will appear here.')}
                </div>
              )}
            </div>
            <div style={{ padding:'16px' }}>
              <div style={{ fontFamily:SANS,fontSize:10,fontWeight:700,color:tk.textFaint,letterSpacing:1.4,textTransform:'uppercase',marginBottom:10 }}>
                {T(lang,'পরামর্শ','Suggestions')}
              </div>
              {suggestions.map((s,i)=>(
                <button key={i} onClick={()=>setInput(T(lang,s.bn,s.en))} style={{ display:'block',width:'100%',textAlign:'left',padding:'8px 10px',borderRadius:10,border:`1px solid ${tk.line}`,background:'transparent',color:tk.text,fontFamily:BEN,fontSize:12,cursor:'pointer',marginBottom:6 }}>
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
