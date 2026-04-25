import React, { useState } from 'react';
import { ArrowLeft, MapPin, Bus, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props { onBack: () => void; }

const GUIDES = [
  {
    area: 'মিরপুর', areaEn: 'Mirpur',
    description: 'ঢাকার উত্তর-পশ্চিমের ঘনবসতিপূর্ণ এলাকা। মেট্রো, অনেক লোকাল বাস সুবিধা আছে।',
    metroAccess: ['মিরপুর-১', 'মিরপুর-১০', 'মিরপুর-১১', 'কাজীপাড়া', 'শেওড়াপাড়া'],
    buses: ['০১', '১৩', '৩৫', '৫৫', '৬০', 'ভার্সিটি এক্সপ্রেস'],
    tips: ['মিরপুর-১০ থেকে মেট্রো নিন মতিঝিল যেতে', 'সকাল ৮-১০টা ভীষণ ভিড় থাকে', 'শাহবাগ বা ফার্মগেট যেতে বাস সুবিধাজনক'],
    landmarks: ['মিরপুর চিড়িয়াখানা', 'শহীদ বুদ্ধিজীবী স্মৃতিসৌধ', 'বাংলাদেশ ক্রিকেট স্টেডিয়াম'],
    icon: '🏘️',
  },
  {
    area: 'ধানমন্ডি', areaEn: 'Dhanmondi',
    description: 'আবাসিক ও বাণিজ্যিক মিশ্রিত এলাকা। শিক্ষা প্রতিষ্ঠান ও শপিং মলে ভরপুর।',
    metroAccess: ['বিজয় সরণি (কাছাকাছি)'],
    buses: ['সিটি বাস রুট ৮', '২৮', 'গুলিস্তান-ধানমন্ডি'],
    tips: ['ধানমন্ডি-২৭ থেকে বাস বেশি পাওয়া যায়', 'শুক্রবার রাস্তা অপেক্ষাকৃত ফাঁকা থাকে', 'রিকশা কম দূরত্বের জন্য ভালো'],
    landmarks: ['রবীন্দ্র সরোবর', '৩২ নম্বর বঙ্গবন্ধু জাদুঘর', 'ধানমন্ডি লেক'],
    icon: '🌳',
  },
  {
    area: 'মতিঝিল', areaEn: 'Motijheel',
    description: 'ঢাকার প্রধান বাণিজ্যিক কেন্দ্র। ব্যাংক, সরকারি অফিস এখানে অবস্থিত।',
    metroAccess: ['মতিঝিল', 'বাংলাদেশ সচিবালয়'],
    buses: ['প্রায় সব রুটের টার্মিনাল এখানে'],
    tips: ['মেট্রো সবচেয়ে দ্রুত বিকল্প', 'অফিস সময়ে (৮-১০টা, ৫-৭টা) ভীষণ যানজট', 'শাপলা চত্বরে যানজট এড়াতে বিকল্প রাস্তা ব্যবহার করুন'],
    landmarks: ['শাপলা চত্বর', 'বাংলাদেশ ব্যাংক ভবন', 'জনতা ব্যাংক ভবন'],
    icon: '🏦',
  },
  {
    area: 'উত্তরা', areaEn: 'Uttara',
    description: 'ঢাকার উত্তরে আধুনিক আবাসিক এলাকা। এয়ারপোর্টের কাছে।',
    metroAccess: ['উত্তরা উত্তর', 'উত্তরা সেন্টার', 'উত্তরা দক্ষিণ'],
    buses: ['বিআরটিসি এয়ারপোর্ট বাস', 'গাজীপুর রুট'],
    tips: ['এয়ারপোর্ট যেতে মেট্রো + হাঁটা সুবিধাজনক', 'সেক্টর ৩, ৭, ১১ থেকে মেট্রো সহজ', 'গাজীপুর যেতে বিআরটিসি বাস ব্যবহার করুন'],
    landmarks: ['হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর', 'উত্তরা মডেল টাউন', 'জামে মসজিদ'],
    icon: '✈️',
  },
  {
    area: 'গুলশান-বনানী', areaEn: 'Gulshan-Banani',
    description: 'অভিজাত কূটনৈতিক এলাকা। দূতাবাস, আন্তর্জাতিক রেস্তোরাঁ ও অফিস।',
    metroAccess: ['নিকটস্থ: বিজয় সরণি'],
    buses: ['গুলশান-মতিঝিল সার্ভিস', 'বিআরটিসি স্পেশাল'],
    tips: ['গুলশান ২ চত্বর থেকে বাস পাওয়া যায়', 'সিএনজি ও উবার সহজলভ্য', 'ভিড় কম কিন্তু ভাড়া বেশি'],
    landmarks: ['গুলশান লেক', 'বনানী কবরস্থান', 'ওয়েস্টিন হোটেল'],
    icon: '🏢',
  },
  {
    area: 'পুরান ঢাকা', areaEn: 'Old Dhaka',
    description: 'ঐতিহাসিক ঢাকার কেন্দ্র। সরু গলি, ঐতিহ্যবাহী ব্যবসা ও স্থাপত্য।',
    metroAccess: ['বাংলাদেশ সচিবালয় (পায়ে হেঁটে)'],
    buses: ['গুলিস্তান-সদরঘাট', 'পুরান ঢাকা সার্ভিস'],
    tips: ['রিকশা ও ইজিবাইক মূল যান', 'সদরঘাট থেকে লঞ্চে বরিশাল যাওয়া যায়', 'সন্ধ্যায় ইফতার বাজারে ভিড় থাকে'],
    landmarks: ['আহসান মঞ্জিল', 'লালবাগ কেল্লা', 'বুড়িগঙ্গা নদী', 'সদরঘাট লঞ্চ টার্মিনাল'],
    icon: '🏛️',
  },
  {
    area: 'ফার্মগেট-কারওয়ান বাজার', areaEn: 'Farmgate-Karwan Bazar',
    description: 'ঢাকার কেন্দ্রীয় সংযোগস্থল। মিডিয়া অফিস, কিচেন মার্কেট এখানে।',
    metroAccess: ['ফার্মগেট'],
    buses: ['প্রায় সব রুটের সংযোগস্থল'],
    tips: ['মেট্রো সবচেয়ে দ্রুত যাতায়াতের মাধ্যম', 'বাজার সময়ে প্রচুর ভিড় থাকে', 'রাত ১০টার পর বাস কম থাকে'],
    landmarks: ['সোনারগাঁও হোটেল', 'কারওয়ান বাজার', 'বিটিভি ভবন'],
    icon: '🔁',
  },
  {
    area: 'যাত্রাবাড়ী-সায়েদাবাদ', areaEn: 'Jatrabari-Sayedabad',
    description: 'দক্ষিণ-পূর্ব ঢাকার ব্যস্ত প্রবেশদ্বার। দেশের প্রধান বাস টার্মিনাল।',
    metroAccess: ['পরিকল্পনাধীন MRT-2'],
    buses: ['সায়েদাবাদ থেকে সারা দেশে ইন্টারসিটি বাস'],
    tips: ['ইন্টারসিটি বাসের জন্য আগে টিকিট কাটুন', 'সায়েদাবাদ বাস টার্মিনাল থেকে ঢাকার বাইরে যান', 'ভোরে ও বিকালে সবচেয়ে বেশি বাস থাকে'],
    landmarks: ['সায়েদাবাদ বাস টার্মিনাল', 'যাত্রাবাড়ী চৌরাস্তা'],
    icon: '🚍',
  },
];

export default function NeighbourhoodGuides({ onBack }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof GUIDES[0] | null>(null);

  const filtered = GUIDES.filter(g =>
    g.area.includes(search) || g.areaEn.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={() => setSelected(null)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-2xl">{selected.icon}</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{selected.area}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{selected.areaEn} Local Guide</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">{selected.description}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2"><span>🚇</span> মেট্রো স্টেশন</h3>
            {selected.metroAccess.map(m => <p key={m} className="text-sm text-blue-800 dark:text-blue-200 py-0.5">• {m}</p>)}
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-800">
            <h3 className="font-bold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2"><Bus className="w-4 h-4" /> বাস রুট</h3>
            <div className="flex flex-wrap gap-2">
              {selected.buses.map(b => (
                <span key={b} className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs px-2.5 py-1 rounded-full font-medium">{b}</span>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">💡 ট্রাভেল টিপস</h3>
            {selected.tips.map((tip, i) => <p key={i} className="text-sm text-amber-800 dark:text-amber-200 py-0.5">• {tip}</p>)}
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800">
            <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> দর্শনীয় স্থান</h3>
            {selected.landmarks.map(l => <p key={l} className="text-sm text-purple-800 dark:text-purple-200 py-0.5">• {l}</p>)}
          </div>
          <div className="h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">এলাকাভিত্তিক গাইড</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Neighbourhood Transport Guides</p>
        </div>
      </div>

      <div className="p-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="এলাকা খুঁজুন..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 grid grid-cols-2 gap-3 content-start">
        {filtered.map(g => (
          <button key={g.area} onClick={() => setSelected(g)}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-left shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors active:scale-95">
            <span className="text-3xl block mb-2">{g.icon}</span>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{g.area}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{g.areaEn}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{g.metroAccess.length} মেট্রো স্টেশন</p>
          </button>
        ))}
        <div className="col-span-2 h-4" />
      </div>
    </div>
  );
}
