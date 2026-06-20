import React from 'react';
import { Tokens, Lang, SANS, BEN, T } from '../tokens';

interface Props {
  tk: Tokens;
  lang: Lang;
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
  onNav: (r: string) => void;
}

export function LocationConsentModal({ tk, lang, open, onAllow, onDeny, onNav }: Props) {
  if (!open) return null;
  const isBn = lang === 'bn';
  const font = isBn ? BEN : SANS;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      padding: 20,
    }}>
      <div style={{
        background: tk.panel, border: `1px solid ${tk.line}`,
        borderRadius: 20, padding: '28px 24px 24px',
        maxWidth: 400, width: '100%', boxShadow: tk.shadowLg,
        boxSizing: 'border-box',
      }}>
        {/* Icon + brand */}
        <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `linear-gradient(135deg,${tk.primary},${tk.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0,
          }}>📍</div>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 17, color: tk.text }}>
              {T(lang, 'আপনার অবস্থান ব্যবহার করি?', 'Use your location?')}
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: tk.textFaint, marginTop: 2 }}>KoyJabo</div>
          </div>
        </div>

        {/* Bullets */}
        <div style={{ display:'flex', flexDirection:'column', gap: 10, marginBottom: 20 }}>
          {[
            { icon:'🚌', en:'Find buses near you automatically', bn:'কাছের বাস স্বয়ংক্রিয়ভাবে খুঁজুন' },
            { icon:'🤖', en:'AI answers "how to go" from your location', bn:'AI আপনার অবস্থান থেকে রুট দেয়' },
            { icon:'🔒', en:'Location never shared or stored on servers', bn:'অবস্থান কখনো সার্ভারে সংরক্ষণ হয় না' },
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', gap: 10, alignItems:'flex-start' }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontFamily: font, fontSize: 13, color: tk.textDim, lineHeight: 1.5 }}>
                {T(lang, item.bn, item.en)}
              </span>
            </div>
          ))}
        </div>

        {/* T&C note */}
        <div style={{
          background: tk.panelMuted, borderRadius: 10, padding: '10px 12px',
          fontFamily: SANS, fontSize: 11, color: tk.textFaint, lineHeight: 1.6,
          marginBottom: 20,
        }}>
          {T(lang,
            'অ্যাপটি ব্যবহার করে আপনি আমাদের ',
            'By continuing you agree to our '
          )}
          <span onClick={() => onNav('terms')} style={{ color: tk.primary, cursor:'pointer', textDecoration:'underline' }}>
            {T(lang, 'সেবার শর্তাবলী', 'Terms of Service')}
          </span>
          {T(lang, ' ও ', ' and ')}
          <span onClick={() => onNav('privacy')} style={{ color: tk.primary, cursor:'pointer', textDecoration:'underline' }}>
            {T(lang, 'গোপনীয়তা নীতি', 'Privacy Policy')}
          </span>
          {T(lang, '-তে সম্মত হচ্ছেন।', '.')}
        </div>

        {/* Buttons */}
        <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
          <button onClick={onAllow} style={{
            background: tk.primary, color: tk.primaryInk, border: 'none',
            borderRadius: 12, padding: '14px', width: '100%',
            fontFamily: font, fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}>
            {T(lang, '📍 অবস্থান অনুমতি দিন', '📍 Allow Location')}
          </button>
          <button onClick={onDeny} style={{
            background: 'transparent', color: tk.textFaint,
            border: `1px solid ${tk.line}`, borderRadius: 12, padding: '12px', width: '100%',
            fontFamily: font, fontSize: 13, cursor: 'pointer',
          }}>
            {T(lang, 'না, ধন্যবাদ', 'No thanks')}
          </button>
        </div>

        <div style={{ textAlign:'center', marginTop: 12, fontFamily: SANS, fontSize: 10, color: tk.textFaint }}>
          {T(lang, 'সেটিংস থেকে যেকোনো সময় পরিবর্তন করা যাবে', 'Change anytime from Settings')}
        </div>
      </div>
    </div>
  );
}
