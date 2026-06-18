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
    }));
    const routes = (history.routeSearches || []).map(item => ({
      id: `route-${item.timestamp}-${item.from}-${item.to}`,
      mode: lbl('Route', 'রুট'),
      title: `${item.from || lbl('Any', 'যেকোনো')} → ${item.to || lbl('Any', 'যেকোনো')}`,
      detail: lbl('Local bus search', 'লোকাল বাস সার্চ'),
      timestamp: item.timestamp,
    }));
    const intercity = (history.intercitySearches || []).map(item => ({
      id: `intercity-${item.timestamp}-${item.from}-${item.to}`,
      mode: lbl('Intercity', 'আন্তঃজেলা'),
      title: `${item.from} → ${item.to}`,
      detail: item.transportType,
      timestamp: item.timestamp,
    }));
    const trains = (history.trainSearches || []).map(item => ({
      id: `train-${item.timestamp}-${item.trainId}`,
      mode: lbl('Train', 'ট্রেন'),
      title: item.trainName,
      detail: `${item.from} → ${item.to}`,
      timestamp: item.timestamp,
    }));
    return [...bus, ...routes, ...intercity, ...trains].sort((a, b) => b.timestamp - a.timestamp);
  }, [history, lang]);

  const totalSearches = records.length;
  const journeyDays = journeyHistory.length + (todayJourney && todayJourney.points.length > 0 ? 1 : 0);
  const hasData = totalSearches > 0 || journeyDays > 0 || (history.communityFeatureHistory || []).length > 0;

  return (
    <PageShell {...props} canBack>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '16px 12px 100px' : '32px 24px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ ...card, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: lbl('Searches', 'সার্চ'), value: totalSearches },
            { label: lbl('Journey days', 'যাত্রার দিন'), value: journeyDays },
            { label: lbl('Features opened', 'ফিচার ব্যবহার'), value: (history.communityFeatureHistory || []).length },
          ].map(item => (
            <div key={item.label} style={{ background: tk.panelMuted, borderRadius: 12, padding: 14 }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, color: tk.text }}>{item.value}</div>
              <div style={{ fontFamily: font, fontSize: 12, color: tk.textDim }}>{item.label}</div>
            </div>
          ))}
        </div>

        {!hasData ? (
          <div style={{ ...card, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: font, fontWeight: 700, fontSize: 20, color: tk.text, marginBottom: 8 }}>
              {lbl('No history yet', 'এখনো কোনো ইতিহাস নেই')}
            </div>
            <div style={{ fontFamily: font, fontSize: 14, color: tk.textDim, lineHeight: 1.6 }}>
              {lbl('Your real searches and journeys will appear here after you use KoyJabo.', 'কই যাবো ব্যবহার করলে আপনার আসল সার্চ ও যাত্রা এখানে দেখা যাবে।')}
            </div>
          </div>
        ) : (
          <>
            {records.length > 0 && (
              <div style={card}>
                <div style={{ fontFamily: font, fontWeight: 700, fontSize: 16, color: tk.text, marginBottom: 12 }}>
                  {lbl('Recent searches', 'সাম্প্রতিক সার্চ')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {records.slice(0, 50).map(record => (
                    <div key={record.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: `1px solid ${tk.line}` }}>
                      <div style={{ background: tk.primarySoft, border: `1px solid ${tk.primary}33`, color: tk.primary, borderRadius: 999, padding: '4px 10px', fontFamily: font, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                        {record.mode}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: font, fontWeight: 700, fontSize: 14, color: tk.text }}>{record.title}</div>
                        <div style={{ fontFamily: font, fontSize: 12, color: tk.textDim, marginTop: 2 }}>{record.detail}</div>
                      </div>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: tk.textFaint, flexShrink: 0 }}>{formatDate(record.timestamp, lang)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(todayJourney || journeyHistory.length > 0) && (
              <div style={card}>
                <div style={{ fontFamily: font, fontWeight: 700, fontSize: 16, color: tk.text, marginBottom: 12 }}>
                  {lbl('Location journey history', 'লোকেশন যাত্রার ইতিহাস')}
                </div>
                {[todayJourney, ...journeyHistory].filter(Boolean).map((journey) => (
                  <div key={journey!.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: `1px solid ${tk.line}` }}>
                    <div>
                      <div style={{ fontFamily: SANS, fontWeight: 700, color: tk.text }}>{journey!.date}</div>
                      <div style={{ fontFamily: font, fontSize: 12, color: tk.textDim }}>{journey!.points.length} {lbl('location points', 'লোকেশন পয়েন্ট')}</div>
                    </div>
                    <div style={{ fontFamily: SANS, fontWeight: 800, color: tk.primary }}>{journey!.totalDistance.toFixed(1)} km</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AdSlot tk={tk} lang={lang} kind={isMobile ? 'mob-banner' : 'leaderboard'} />
        </div>
      </div>
    </PageShell>
  );
}
