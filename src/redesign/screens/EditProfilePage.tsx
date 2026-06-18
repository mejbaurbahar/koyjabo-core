import React, { useMemo, useState } from 'react';
import { updateProfile } from '../../services/githubAuthService';
import { KJ_TOKENS, T, SANS, BEN } from '../tokens';
import { PageShell } from './PageShell';

interface Props { theme:'dark'|'light'; device:'desktop'|'mobile'; lang:'bn'|'en'; route:string; canBack:boolean; onNav:(r:string)=>void; onNavTab?:(r:string)=>void; onBack:()=>void; onLang:()=>void; onTheme:()=>void; onMenu:()=>void; params?:Record<string,string>; }

type SessionUser = {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  provider?: 'manual' | 'google';
  hasPassword?: boolean;
};

type ProfileMeta = {
  phone?: string;
  homeArea?: string;
  workArea?: string;
  bio?: string;
};

function readSessionUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem('koyjabo_auth_session');
    const user = raw ? JSON.parse(raw)?.user : null;
    return user?.id ? user as SessionUser : null;
  } catch {
    return null;
  }
}

function profileMetaKey(userId: string) {
  return `koyjabo_profile_meta_${userId}`;
}

function readProfileMeta(userId?: string): ProfileMeta {
  if (!userId) return {};
  try {
    const raw = localStorage.getItem(profileMetaKey(userId));
    return raw ? JSON.parse(raw) as ProfileMeta : {};
  } catch {
    return {};
  }
}

function writeProfileMeta(userId: string, meta: ProfileMeta) {
  localStorage.setItem(profileMetaKey(userId), JSON.stringify(meta));
}

function patchSessionUser(patch: Partial<SessionUser>) {
  const raw = localStorage.getItem('koyjabo_auth_session');
  if (!raw) return;
  const session = JSON.parse(raw);
  session.user = { ...session.user, ...patch };
  localStorage.setItem('koyjabo_auth_session', JSON.stringify(session));
  window.dispatchEvent(new Event('koyjabo-auth-changed'));
}

export function EditProfilePage(props: Props) {
  const { theme, device, lang, onBack } = props;
  const tk = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const user = useMemo(() => readSessionUser(), []);
  const meta = useMemo(() => readProfileMeta(user?.id), [user?.id]);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(meta.phone || '');
  const [homeArea, setHomeArea] = useState(meta.homeArea || '');
  const [workArea, setWorkArea] = useState(meta.workArea || '');
  const [bio, setBio] = useState(meta.bio || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'warn' | 'err'; text: string } | null>(null);
  const font = lang === 'bn' ? BEN : SANS;
  const lbl = (en: string, bn: string) => T(lang, bn, en);

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    background: tk.inputBg,
    border: `1px solid ${tk.line}`,
    borderRadius: 12,
    padding: '12px 14px',
    color: tk.text,
    fontFamily: font,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const handleSave = async () => {
    if (!user?.id) {
      setMessage({ kind: 'err', text: lbl('Please sign in again before saving.', 'সেভ করার আগে আবার সাইন ইন করুন।') });
      return;
    }

    const nextName = displayName.trim();
    const nextUsername = username.trim().toLowerCase();
    if (!nextName) {
      setMessage({ kind: 'err', text: lbl('Full name is required.', 'পূর্ণ নাম প্রয়োজন।') });
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(nextUsername)) {
      setMessage({ kind: 'err', text: lbl('Username must be 3-30 letters, numbers, or underscores.', 'ইউজারনেম ৩-৩০ অক্ষর, সংখ্যা বা আন্ডারস্কোর হতে হবে।') });
      return;
    }

    setSaving(true);
    setMessage(null);

    const nextMeta = {
      phone: phone.trim(),
      homeArea: homeArea.trim(),
      workArea: workArea.trim(),
      bio: bio.trim(),
    };

    try {
      writeProfileMeta(user.id, nextMeta);
      patchSessionUser({ displayName: nextName, username: nextUsername });

      const changedRemoteName = nextName !== (user.displayName || '') || nextUsername !== (user.username || '');
      if (changedRemoteName) {
        const result = await updateProfile(user.id, nextName, nextUsername);
        if (!result.success) {
          setMessage({ kind: 'warn', text: result.error || lbl('Saved on this device. Online sync failed.', 'এই ডিভাইসে সেভ হয়েছে। অনলাইন সিঙ্ক ব্যর্থ হয়েছে।') });
          return;
        }
      }

      setMessage({ kind: 'ok', text: lbl('Profile saved.', 'প্রোফাইল সেভ হয়েছে।') });
    } catch (error) {
      const text = error instanceof Error ? error.message : lbl('Saved on this device. Online sync failed.', 'এই ডিভাইসে সেভ হয়েছে। অনলাইন সিঙ্ক ব্যর্থ হয়েছে।');
      setMessage({ kind: 'warn', text });
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { label: lbl('Full name', 'পূর্ণ নাম'), value: displayName, onChange: setDisplayName, editable: true },
    { label: lbl('Username', 'ইউজারনেম'), value: username, onChange: setUsername, editable: true },
    { label: 'Email', value: user?.email || '', onChange: undefined, editable: false },
    { label: lbl('Phone', 'ফোন'), value: phone, onChange: setPhone, editable: true },
    { label: lbl('Home area', 'বাড়ির এলাকা'), value: homeArea, onChange: setHomeArea, editable: true },
    { label: lbl('Work area', 'কর্মস্থল এলাকা'), value: workArea, onChange: setWorkArea, editable: true },
  ];

  return (
    <PageShell {...props}>
      <div style={{ padding:isMobile?'16px 16px 48px':'28px 40px 48px', maxWidth:500, margin:'0 auto' }}>
        <h1 style={{ fontFamily:BEN,fontWeight:700,fontSize:isMobile?20:24,color:tk.text,marginBottom:20 }}>{lbl('Edit Profile', 'প্রোফাইল সম্পাদনা')}</h1>

        <div style={{ display:'flex',flexDirection:'column',alignItems:'center',marginBottom:24 }}>
          <div style={{ width:80,height:80,borderRadius:999,background:`linear-gradient(135deg,${tk.primary},${tk.accent})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:SANS,fontWeight:800,fontSize:28,marginBottom:10 }}>
            {(displayName || username || 'KJ').slice(0,2).toUpperCase()}
          </div>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {fields.map(field => (
            <div key={field.label}>
              <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>{field.label}</label>
              <input
                value={field.value}
                readOnly={!field.editable}
                onChange={event => field.onChange?.(event.target.value)}
                placeholder={field.editable ? lbl('Not set yet', 'এখনো সেট করা নেই') : ''}
                style={{ ...fieldStyle, background:field.editable?tk.inputBg:tk.panelMuted, color:field.editable?tk.text:tk.textFaint, opacity:field.editable?1:0.7 }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontFamily:SANS,fontSize:11,fontWeight:700,color:tk.textFaint,textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6 }}>Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value.slice(0,160))}
              placeholder={lbl('Write about yourself...', 'নিজের সম্পর্কে লিখুন...')}
              style={{ ...fieldStyle, minHeight:80, resize:'none' }}/>
            <div style={{ fontFamily:SANS,fontSize:11,color:tk.textFaint,textAlign:'right' }}>{bio.length}/160</div>
          </div>

          {message && (
            <div style={{
              border:`1px solid ${message.kind === 'err' ? tk.accent : message.kind === 'warn' ? '#f59e0b' : tk.primary}`,
              background: message.kind === 'err' ? tk.accentSoft : message.kind === 'warn' ? 'rgba(245,158,11,.12)' : tk.primarySoft,
              color: message.kind === 'err' ? tk.accent : message.kind === 'warn' ? '#f59e0b' : tk.primary,
              borderRadius:12,
              padding:'10px 12px',
              fontFamily:font,
              fontSize:13,
            }}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background:tk.primary,color:tk.primaryInk,border:0,borderRadius:14,padding:'13px 20px',fontFamily:SANS,fontWeight:700,fontSize:14,cursor:saving?'wait':'pointer',opacity:saving?0.75:1 }}
          >
            {saving ? lbl('Saving...', 'সেভ হচ্ছে...') : lbl('Save changes', 'পরিবর্তন সংরক্ষণ করুন')}
          </button>
          <button onClick={onBack} style={{ background:'transparent',border:0,color:tk.textDim,fontFamily:SANS,fontSize:13,cursor:'pointer',padding:'8px 0' }}>
            {lbl('Cancel', 'বাতিল করুন')}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
