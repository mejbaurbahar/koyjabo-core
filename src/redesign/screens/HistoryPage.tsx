import React, { useMemo } from 'react';
import { KJ_TOKENS, T, SANS, BEN, Tokens } from '../tokens';
import { PageShell } from './PageShell';
import { AdSlot } from '../components/AdSlot';
import { getUserHistory } from '../../../services/analyticsService';
import { getJourneyHistory, getTodayJourney } from '../../../services/journeyTrackerService';

interface ScreenProps {
  theme: 'dark' | 'light';
  device: 'desktop' | 'mobile';
  lang: 'bn' | 'en';
  route: string;
  canBack: boolean;
  onNav: (r: string) => void;
  onBack: () => void;
  onLang: () => void;
  onTheme: () => void;
  onMenu: () => void;
}

function formatDate(timestamp: number, lang: 'bn' | 'en') {
  return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function HistoryPage(props: ScreenProps) {
  const { theme, device, lang } = props;
  const tk: Tokens = KJ_TOKENS[theme];
  const isMobile = device === 'mobile';
  const lbl = (en: string, bn: string) => T(lang, bn, en);
  const font = lang === 'bn' ? BEN : SANS;
  const card: React.CSSProperties = { background: tk.panel, border: `1px solid ${tk.line}`, borderRadius: 16, padding: 16 };

  const history = getUserHistory();
  const todayJourney = getTodayJourney();
  const journeyHistory = getJourneyHistory();

  const records = useMemo(() => {
    const bus = (history.busSearches || []).map(item => ({
      id: `bus-${item.timestamp}-${item.busId}`,
      mode: lbl('Bus', 'বাস'),
      title: item.busName,
      detail: item.busId,
      timestamp: item.timestamp,
      color: tk.primary,
    }));
    const routes = (history.routeSearches || []).map(item => ({
      id: `route-${item.timestamp}-${item.from}-${item.to}`,
      mode: lbl('Route', 'রুট'),
      title: `${item.from || lbl('Any', 'যেকোনো')} → ${item.to || lbl('Any', 'যেকোনো')}`,
      detail: lbl('Local bus search', 'লোকাল বাস সার্চ'),
      timestamp: item.timestamp,
      color: '#818cf8',
    }));
    const intercity = (history.intercitySearches || []).map(item => ({
      id: `intercity-${item.timestamp}-${item.from}-${item.to}`,
      mode: lbl('Intercity', 'আন্তঃজেলা'),
      title: `${item.from} → ${item.to}`,
      detail: item.transportType,
      timestamp: item.timestamp,
      color: tk.amber,
    }));
    const trains = (history.trainSearches || []).map(item => ({
      id: `train-${item.timestamp}-${item.trainId}`,
      mode: lbl('Train', 'ট্রেন'),
      title: item.trainName,
      detail: `${item.from} → ${item.to}`,
      timestamp: item.timestamp,
      color: '#34d399',
    }));
    return [...bus, ...routes, ...intercity, ...trains].sort((a, b) => b.timestamp - a.timestamp);
  }, [history, lang, tk.primary, tk.amber]);

  const totalSearches = records.length;
  const todayCount = records.filter(item => new Date(item.timestamp).toDateString() === new Date().toDateString()).length;
  const journeyDays = journeyHistory.length + (todayJourney && todayJourney.points.length > 0 ? 1 : 0);
  const featureCount = (history.communityFeatureHistory || []).length;
  const hasData = totalSearches > 0 || journeyDays > 0 || featureCount > 0;
  const modeCounts = records.reduce<Record<string, number>>((acc, item) => {
    acc[item.mode] = (acc[item.mode] || 0) + 1;
    return acc;
  }, {});

  return (
    <PageShell {...props} canBack>
      <div style={{ padding: isMobile ? '16px 12px 100px' : '24px 40px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          borderRadius: 22,
          padding: isMobile ? 18 : 28,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #006a4e 0%, #10b981 40%, #3b82f6 100%)',
          color: '#fff',
          boxShadow: tk.shadowLg,
        }}>
          <div style={{ position: 'absolute', right: -20, top: -30, width: 180, height: 180, borderRadius: 999, background: 'rgba(255,255,255,0.15)', pointerEvents: 'none' }} />
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, opacity: 0.85, textTransform: 'uppercase' }}>
            {lbl('Your real KoyJabo activity', 'আপনার আসল কই যাবো কার্যকলাপ')}
          </span>
          <h1 style={{ fontFamily: font, fontSize: isMobile ? 22 : 30, fontWeight: 700, margin: '6px 0 18px', lineHeight: 1.2 }}>
            {hasData
              ? lbl(`${totalSearches} searches recorded`, `${totalSearches}টি সার্চ সংরক্ষিত`)
              : lbl('No history yet', 'এখনো কোনো ইতিহাস নেই')}
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 10 }}>
            {[
              { label: lbl('Total searches', 'মোট সার্চ'), value: totalSearches, icon: '🔎' },
              { label: lbl('Today', 'আজ'), value: todayCount, icon: '📅' },
              { label: lbl('Journey days', 'যাত্রার দিন'), value: journeyDays, icon: '📍' },
              { label: lbl('Features opened', 'ফিচার ব্যবহার'), value: featureCount, icon: '✨' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: isMobile ? 16 : 22 }}>{s.value}</div>
                <div style={{ fontFamily: font, fontSize: 10, fontWeight: 700, opacity: 0.85, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {!hasData ? (
          <div style={{ ...card, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: font, fontWeight: 700, fontSize: 20, color: tk.text, marginBottom: 8 }}>
              {lbl('No real history found', 'কোনো আসল ইতিহাস পাওয়া যায়নি')}
            </div>
            <div style={{ fontFamily: font, fontSize: 14, color: tk.textDim, lineHeight: 1.6 }}>
              {lbl('Search buses, trains, intercity routes, or use community features. Your real activity will appear here.', 'বাস, ট্রেন, আন্তঃজেলা রুট সার্চ করলে বা কমিউনিটি ফিচার ব্যবহার করলে আপনার আসল কার্যকলাপ এখানে দেখা যাবে।')}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 20 }}>
            <div style={card}>
              <div style={{ fontFamily: font, fontWeight: 700, fontSize: 16, color: tk.text, marginBottom: 12 }}>
                {lbl('Recent activity', 'সাম্প্রতিক কার্যকলাপ')}
              </div>
              {records.length > 0 ? records.slice(0, 50).map((record, index) => (
                <div key={record.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: index ? `1px solid ${tk.line}` : 'none' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: record.color, boxShadow: `0 0 0 4px ${record.color}22`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: font, fontWeight: 700, fontSize: 14, color: tk.text }}>{record.title}</div>
                    <div style={{ fontFamily: font, fontSize: 12, color: tk.textDim, marginTop: 2 }}>{record.mode} · {record.detail}</div>
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, flexShrink: 0 }}>{formatDate(record.timestamp, lang)}</div>
                </div>
              )) : (
                <div style={{ fontFamily: font, fontSize: 14, color: tk.textDim, padding: '28px 0', textAlign: 'center' }}>
                  {lbl('No searches yet', 'এখনো কোনো সার্চ নেই')}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={card}>
                <div style={{ fontFamily: font, fontWeight: 700, fontSize: 16, color: tk.text, marginBottom: 12 }}>
                  {lbl('Mode split', 'মোড বিভাজন')}
                </div>
                {Object.entries(modeCounts).length > 0 ? Object.entries(modeCounts).map(([mode, count]) => {
                  const pct = totalSearches ? Math.round((count / totalSearches) * 100) : 0;
                  return (
                    <div key={mode} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: font, fontSize: 13, color: tk.text, marginBottom: 6 }}>
                        <span>{mode}</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 999, background: tk.panelMuted, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: tk.primary }} />
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ fontFamily: font, color: tk.textDim }}>{lbl('No mode data yet', 'এখনো মোড ডেটা নেই')}</div>
                )}
              </div>

              {(todayJourney || journeyHistory.length > 0) && (
                <div style={card}>
                  <div style={{ fontFamily: font, fontWeight: 700, fontSize: 16, color: tk.text, marginBottom: 12 }}>
                    {lbl('Location journey history', 'লোকেশন যাত্রার ইতিহাস')}
                  </div>
                  {[todayJourney, ...journeyHistory].filter(Boolean).map((journey, index) => (
                    <div key={journey!.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: index ? `1px solid ${tk.line}` : 'none' }}>
                      <div>
                        <div style={{ fontFamily: SANS, fontWeight: 700, color: tk.text }}>{journey!.date}</div>
                        <div style={{ fontFamily: font, fontSize: 12, color: tk.textDim }}>{journey!.points.length} {lbl('location points', 'লোকেশন পয়েন্ট')}</div>
                      </div>
                      <div style={{ fontFamily: SANS, fontWeight: 800, color: tk.primary }}>{journey!.totalDistance.toFixed(1)} km</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ margin: '20px 0' }}>
          <AdSlot tk={tk} lang={lang} kind="multiplex" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>
      </div>
    </PageShell>
  );
}
