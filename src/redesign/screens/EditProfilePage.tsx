import React, { useState } from 'react';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

export function EditProfilePage(props: Props) {
  const { theme, device, lang, onBack } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const [bio, setBio] = useState('');
  const fields = [
    { l:T(lang,'পূর্ণ নাম','Full name'), v:'Mejbaur Fagun', editable:true },
    { l:T(lang,'ইউজারনেম','Username'), v:'mejbaur_fagun', editable:true },
    { l:'Email', v:'mejbaur@markopolo.ai', editable:false },
    { l:T(lang,'ফোন','Phone'), v:'+880 1700-000000', editable:true },
    { l:T(lang,'বাড়ির এলাকা','Home area'), v:T(lang,'বনানী, ঢাকা','Banani, Dhaka'), editable:true },
    { l:T(lang,'কর্মস্থল এলাকা','Work area'), v:T(lang,'কারওয়ান বাজার, ঢাকা','Karwan Bazar, Dhaka'), editable:true },
  ];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:500, margin:'0 auto' }}>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?20:24,color:tk.text,marginBottom:20 }}>{T(lang,'প্রোফাইল সম্পাদনা','Edit Profile')}</h1>

        {/* Avatar */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24 }}>
          <div style={{ width:80,height:80,borderRadius:999,background:`linear-gradient(135deg,${tk.primary},${tk.accent})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:SANS,fontWeight:800,fontSize:28,marginBottom:10 }}>MF</div>
          <button style={{ background:tk.primarySoft,color:tk.primary,border:0,borderRadius:10,padding:'8px 14px',fontFamily:SANS,fontWeight:700,fontSize:13,cursor:'pointer' }}>
            {T(lang,'ছবি পরিবর্তন করুন','Change photo')}
          </button>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {fields.map((f,i)=>(
            <div key={i}>
              <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{f.l}</label>
              <input defaultValue={f.v} readOnly={!f.editable}
                style={{ width:'100%',background:f.editable?tk.inputBg:tk.panelMuted,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:f.editable?tk.text:tk.textFaint,fontFamily:BEN,fontSize:14,outline:'none',boxSizing:'border-box',opacity:f.editable?1:0.7 }}/>
            </div>
          ))}
          <div>
            <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value.slice(0,160))}
              placeholder={T(lang,'নিজের সম্পর্কে লিখুন...','Write about yourself...')}
              style={{ width:'100%',minHeight:80,background:tk.inputBg,border:`1px solid ${tk.line}`,borderRadius:12,padding:'12px 14px',color:tk.text,fontFamily:BEN,fontSize:14,outline:'none',resize:'none',boxSizing:'border-box' }}/>
            <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,textAlign:'right' }}>{bio.length}/160</div>
          </div>

          <button style={{ background:tk.primary,color:tk.primaryInk,border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:14,cursor:'pointer' }}>
            {T(lang,'পরিবর্তন সংরক্ষণ করুন','Save changes')}
          </button>
          <button onClick={onBack} style={{ background:'transparent',border:0,color:tk.textDim,fontFamily:SANS,fontSize:13,cursor:'pointer',padding:'8px 0' }}>
            {T(lang,'বাতিল করুন','Cancel')}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
