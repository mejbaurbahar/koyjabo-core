import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';
import { useAuth } from '../../contexts/AuthContext';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function EditProfilePage(props: Props) {
  const { theme, device, lang, onBack } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const { user } = useAuth();

  const INITIAL = {
    name:  user?.displayName || '',
    phone: '',
    home:  '',
    work:  '',
    bio:   '',
  };

  const [name,  setName]  = useState(INITIAL.name);
  const [phone, setPhone] = useState(INITIAL.phone);
  const [home,  setHome]  = useState(INITIAL.home);
  const [work,  setWork]  = useState(INITIAL.work);
  const [bio,   setBio]   = useState(INITIAL.bio);

  const isDirty = name !== INITIAL.name ||
    phone !== INITIAL.phone || home !== INITIAL.home || work !== INITIAL.work || bio !== INITIAL.bio;

  const inputStyle: React.CSSProperties = {
    width:'100%', background:tk.inputBg, border:`1px solid ${tk.line}`,
    borderRadius:12, padding:'12px 14px', color:tk.text,
    fontFamily:BEN, fontSize:14, outline:'none', boxSizing:'border-box',
  };
  const readOnlyStyle: React.CSSProperties = { ...inputStyle, background:tk.panelMuted, color:tk.textFaint, opacity:0.7 };

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:500, margin:'0 auto' }}>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?20:24,color:tk.text,marginBottom:20 }}>
          {T(lang,'প্রোফাইল সম্পাদনা','Edit Profile')}
        </h1>

        {/* Avatar */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24 }}>
          {user?.avatarUrl
            ? <img src={user.avatarUrl} alt="avatar" style={{ width:80,height:80,borderRadius:999,objectFit:'cover',marginBottom:10 }}/>
            : <div style={{ width:80,height:80,borderRadius:999,background:`linear-gradient(135deg,${tk.primary},${tk.accent})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:SANS,fontWeight:800,fontSize:28,marginBottom:10 }}>
                {(user?.displayName||user?.username||'KJ').slice(0,2).toUpperCase()}
              </div>
          }
          <button style={{ background:tk.primarySoft,color:tk.primary,border:0,borderRadius:10,padding:'8px 14px',fontFamily:SANS,fontWeight:700,fontSize:13,cursor:'pointer' }}>
            {T(lang,'ছবি পরিবর্তন করুন','Change photo')}
          </button>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {/* Full name — editable */}
          <div>
            <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{T(lang,'পূর্ণ নাম','Full name')}</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle}/>
          </div>

          {/* Username — read-only */}
          <div>
            <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{T(lang,'ইউজারনেম','Username')}</label>
            <input value={user?.username || ''} readOnly disabled style={readOnlyStyle}/>
            <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,marginTop:4 }}>{T(lang,'ইউজারনেম পরিবর্তন করা যাবে না','Username cannot be changed')}</div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{T(lang,'ফোন','Phone')}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={T(lang,'ফোন নম্বর যোগ করুন','Add phone number')} style={inputStyle}/>
          </div>

          {/* Home area */}
          <div>
            <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{T(lang,'বাড়ির এলাকা','Home area')}</label>
            <input value={home} onChange={e => setHome(e.target.value)} placeholder={T(lang,'বাড়ির এলাকা যোগ করুন','Add home area')} style={inputStyle}/>
          </div>

          {/* Work area */}
          <div>
            <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{T(lang,'কর্মস্থল এলাকা','Work area')}</label>
            <input value={work} onChange={e => setWork(e.target.value)} placeholder={T(lang,'কর্মস্থল এলাকা যোগ করুন','Add work area')} style={inputStyle}/>
          </div>

          {/* Email — read-only */}
          <div>
            <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>Email</label>
            <input value={user?.email || 'mejbaur@markopolo.ai'} readOnly style={readOnlyStyle}/>
          </div>

          {/* Bio */}
          <div>
            <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value.slice(0,160))}
              placeholder={T(lang,'নিজের সম্পর্কে লিখুন...','Write about yourself...')}
              style={{ width:'100%',minHeight:80,background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:BEN,fontSize:14,outline:'none',resize:'none',boxSizing:'border-box' }}/>
            <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,textAlign:'right' }}>{bio.length}/160</div>
          </div>

          {/* Save — only shown when dirty */}
          {isDirty && (
            <button style={{ background:tk.primary,color:tk.primaryInk,border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:14,cursor:'pointer' }}>
              {T(lang,'পরিবর্তন সংরক্ষণ করুন','Save changes')}
            </button>
          )}
          <button onClick={onBack} style={{ background:'transparent',border:0,color:tk.textDim,fontFamily:SANS,fontSize:13,cursor:'pointer',padding:'8px 0' }}>
            {T(lang,'বাতিল করুন','Cancel')}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
