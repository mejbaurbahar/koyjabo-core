/**
 * Transport Knowledge Service
 * Wraps all transport data with confidence metadata.
 * Every piece of information has a source, confidence level, and freshness date.
 */

export type DataConfidence = 'verified' | 'estimated' | 'community' | 'unknown';

export interface DataSource {
  confidence: DataConfidence;
  sourceLabel: string;  // e.g. "BRTA circular April 2026"
  lastUpdated: string;  // ISO date
}

// Official verified sources
const SOURCES = {
  BRTA:     { label: 'BRTA official circular (Apr 2026)',   updated: '2026-04-23' },
  DMTCL:    { label: 'DMTCL MRT-6 official schedule',       updated: '2026-06-01' },
  BR:       { label: 'Bangladesh Railway official data',     updated: '2026-05-01' },
  BIWTC:    { label: 'BIWTC launch terminal data',           updated: '2026-06-14' },
  KOYJABO:  { label: 'KoyJabo verified route database',      updated: '2026-06-20' },
  ESTIMATE: { label: 'Calculated (BRTA ৳2.53/km rate)',      updated: '2026-04-23' },
  AI:       { label: 'AI-generated (not verified)',          updated: '2026-06-20' },
};

/** What confidence level a local bus route answer has */
export function busRouteConfidence(busName?: string): DataSource {
  if (!busName) return { confidence: 'unknown', sourceLabel: SOURCES.AI.label, lastUpdated: SOURCES.AI.updated };
  return {
    confidence: 'community',
    sourceLabel: SOURCES.KOYJABO.label,
    lastUpdated: SOURCES.KOYJABO.updated,
  };
}

/** Metro route: fully verified */
export function metroConfidence(): DataSource {
  return { confidence: 'verified', sourceLabel: SOURCES.DMTCL.label, lastUpdated: SOURCES.DMTCL.updated };
}

/** Train route: verified from BR/Shohoz */
export function trainConfidence(): DataSource {
  return { confidence: 'verified', sourceLabel: SOURCES.BR.label, lastUpdated: SOURCES.BR.updated };
}

/** Launch route: verified from BIWTC */
export function launchConfidence(): DataSource {
  return { confidence: 'verified', sourceLabel: SOURCES.BIWTC.label, lastUpdated: SOURCES.BIWTC.updated };
}

/** Calculated fare using BRTA formula */
export function fareEstimateNote(isBn: boolean): string {
  return isBn
    ? '📊 ভাড়া আনুমানিক (BRTA হার ৳২.৫৩/কিমি)'
    : '📊 Fare estimated (BRTA rate ৳2.53/km)';
}

/** Format confidence badge */
export function confidenceBadge(ds: DataSource, isBn: boolean): string {
  switch (ds.confidence) {
    case 'verified':
      return isBn ? `✅ যাচাইকৃত — ${ds.sourceLabel}` : `✅ Verified — ${ds.sourceLabel}`;
    case 'community':
      return isBn ? `🏘️ কমিউনিটি-যাচাইকৃত রুট` : `🏘️ Community-verified route`;
    case 'estimated':
      return isBn ? `📊 আনুমানিক — ${ds.sourceLabel}` : `📊 Estimated — ${ds.sourceLabel}`;
    case 'unknown':
    default:
      return isBn ? `⚠️ অযাচাইকৃত তথ্য — নিশ্চিত করুন` : `⚠️ Unverified — please confirm before travel`;
  }
}

/**
 * Key transport facts — all verified from official sources.
 * These are the "ground truth" the AI should reference.
 */
export const VERIFIED_FACTS = {
  metro: {
    line: 'MRT Line 6',
    stations: ['Uttara North','Uttara Center','Uttara South','Pallabi','Mirpur-11','Mirpur-10',
      'Kazipara','Shewrapara','Agargaon','Bijoy Sarani','Farmgate','Karwan Bazar',
      'Shahbag','Dhaka University','Secretariat','Motijheel'],
    firstTrain: '07:10',
    lastTrain: '21:40',
    closedDay: 'Friday',
    headwayMin: 8,
    fareMin: 20,
    fareMax: 100,
    source: 'DMTCL official',
  },
  brtaFares: {
    cityBusPerKm: 2.53,
    intercityNonAcPerKm: 2.23,
    intercityAcPerKm: 2.90,
    minimumFare: 10,
    effectiveDate: '2026-04-23',
    source: 'BRTA circular April 2026',
  },
  launchRoutes: [
    { from: 'Sadarghat', to: 'Barisal',    hours: 9,  deckFare: 350,  vipFare: 1800 },
    { from: 'Sadarghat', to: 'Khulna',     hours: 13, deckFare: 350,  vipFare: 2200 },
    { from: 'Sadarghat', to: 'Patuakhali', hours: 10, deckFare: 280,  vipFare: 1400 },
    { from: 'Sadarghat', to: 'Chandpur',   hours: 3,  deckFare: 150,  vipFare: 400  },
    { from: 'Sadarghat', to: 'Bhola',      hours: 6,  deckFare: 200,  vipFare: 600  },
    { from: 'Sadarghat', to: 'Hatiya',     hours: 11, deckFare: 280,  vipFare: 900  },
  ],
  intercityBuses: {
    'Dhaka-Cox_Bazar':    { operators: ['Green Line','Hanif','S.Alam','Shyamoli','TR Travels'],      durationH: [8,10], fareNonAc: 1200, fareAc: 2500 },
    'Dhaka-Chittagong':   { operators: ['Shyamoli','Hanif','Green Line','Ena','BRTC'],               durationH: [6,7],  fareNonAc: 680,  fareAc: 1500 },
    'Dhaka-Sylhet':       { operators: ['Shyamoli','Hanif','Green Line','Ena'],                      durationH: [6,7],  fareNonAc: 600,  fareAc: 1200 },
    'Dhaka-Khulna':       { operators: ['Shyamoli','Hanif','Eagle','Greyhound'],                     durationH: [7,8],  fareNonAc: 700,  fareAc: 1400 },
    'Dhaka-Rajshahi':     { operators: ['Shyamoli','Hanif','Green Line','BRTC','National'],          durationH: [6,7],  fareNonAc: 600,  fareAc: 1100 },
    'Dhaka-Barishal':     { operators: ['Sakura','Sohagh','Suravi','Eagle'],                         durationH: [4,5],  fareNonAc: 400,  fareAc: 700  },
    'Dhaka-Comilla':      { operators: ['BRTC','Titas','Rupsha'],                                    durationH: [2,3],  fareNonAc: 200,  fareAc: 350  },
  },
  trains: {
    'Dhaka-Chittagong': { express: ['Suborna Express','Sonar Bangla Express','Turna Nishitha'], durationH: [4,5] },
    'Dhaka-Sylhet':     { express: ['Upaban Express','Jayantika Express','Parabat Express'],    durationH: [6,8] },
    'Dhaka-Rajshahi':   { express: ['Silk City Express','Padma Express','Dhumketu Express'],    durationH: [6,7] },
    'Dhaka-Cox_Bazar':  { express: ["Cox's Bazar Express","Parjotak Express"],                  durationH: [8,10] },
    'Dhaka-Khulna':     { express: ['Sundarban Express','Chitra Express'],                      durationH: [9,10] },
  },
  airports: {
    'Dhaka':     { iata: 'DAC', name: 'Hazrat Shahjalal International Airport', international: true },
    'Chittagong':{ iata: 'CGP', name: 'Shah Amanat International Airport',       international: true },
    'Sylhet':    { iata: 'ZYL', name: 'Osmani International Airport',             international: true },
    "Cox's Bazar":{ iata: 'CXB', name: "Cox's Bazar Airport",                    international: false },
    'Jashore':   { iata: 'JSR', name: 'Jashore Airport',                          international: false },
    'Saidpur':   { iata: 'SPD', name: 'Saidpur Airport',                          international: false },
    'Barishal':  { iata: 'BZL', name: 'Barishal Airport',                         international: false },
    'Rajshahi':  { iata: 'RJH', name: 'Shah Makhdum Airport',                     international: false },
  },
};

/** Returns null if there IS verified data, or a "no data" message if not */
export function noVerifiedDataMessage(from: string, to: string, isBn: boolean): string {
  return isBn
    ? `⚠️ **${from} → ${to}** এর জন্য যাচাইকৃত সরাসরি রুট পাওয়া যায়নি।\n\n**বিকল্প পরামর্শ:**\n- নিকটতম বড় টার্মিনাল থেকে গাড়ি খুঁজুন (গাবতলী, সায়েদাবাদ, মহাখালী)\n- Google Maps-এ লাইভ ট্র্যাফিক দেখুন\n- Shohoz.com বা BusBD app-এ টিকিট খুঁজুন\n\n_এই রুটের তথ্য আমাদের ডাটাবেসে যোগ করতে নিচের ফিডব্যাক বোতাম ব্যবহার করুন।_`
    : `⚠️ No verified direct route found for **${from} → ${to}**.\n\n**Suggestions:**\n- Check nearest major terminal (Gabtoli, Sayedabad, Mohakhali)\n- Use Google Maps for live traffic\n- Search Shohoz.com or BusBD app for tickets\n\n_Help improve data: use the feedback button to report this route._`;
}
