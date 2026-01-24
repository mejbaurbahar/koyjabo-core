
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plane } from 'lucide-react';

// --- Helper Hook for Rotating Messages ---
const useMessageRotator = (messages: string[], interval: number = 5000) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [messages.length, interval]);
  return messages[index];
};

// --- Message Data ---
const planeMessages = [
  "After I land, how do I go to Gulshan 2?",
  "Taxi fare to Dhanmondi will be expensive.",
  "Which route avoids Mohakhali traffic?",
  "ঢাকায় নতুুন, বাসের ভাড়া জানবো কিভাবে?",
  "Is the traffic bad in Uttara right now?",
  "এয়ারপোর্ট থেকে মেট্রো স্টেশন কাছে?",
  "Flying over the Padma Bridge was amazing!",
  "Can't wait to eat Kacchi Biryani!",
  "কাস্টমস পার হতে কতক্ষণ লাগবে আল্লাহ জানে।",
  "Look at the traffic from up here!",
  "Finally home after 2 years.",
  "এয়ারপোর্ট থেকে উবার পাবো তো?"
];

const metroMessages = [
  "Uttara to Motijheel: 100 Taka well spent.",
  "কারওয়ান বাজার থেকে শাহবাগ ভাড়া কত?",
  "Getting off at Farmgate... bus to Mohammadpur?",
  "মিরপুর ১০ থেকে মতিঝিল মাত্র ৩০ মিনিট!",
  "Next stop: Dhaka University.",
  "উত্তরা নর্থ থেকে আগারগাঁও যাচ্ছি।",
  "MRT Pass এ ব্যালেন্স নেই, রিচার্জ করতে হবে।",
  "This AC is a life saver in this heat.",
  "Rapid Pass এ টাকা রিচার্জ করতে হবে।",
  "অফিস ধরতে পারবো তো?",
  "Thank god I avoided the road traffic.",
  "কারওয়ান বাজার নামবো, বাজার করতে হবে।",
  "Crowd is manageable today."
];

const busMessages = [
  "How do I go to New Market from here?",
  "ভাড়া কি ৫ টাকা বাড়ল?",
  "স্টুডেন্ট হাফ পাশ নিবে তো?",
  "Waybill এর নামে ডাকাতি করতেছে!",
  "This bus goes to Mirpur 12 via Farmgate?",
  "সাভার যাবো কি ভাবে?",
  "মামা, শাহবাগ মোড়ে নামবো!",
  "Does this bus stop at Shyamoli?",
  "আজকে রাস্তায় অনেক জ্যাম!",
  "ও মামা, আস্তে যান!",
  "ভাড়া কি বাড়াইছে নাকি?",
  "সিট নাই, দাঁড়িয়ে যেতে হবে।",
  "Farmgate flyover is totally blocked.",
  "গুলিস্তান জিরো পয়েন্টে নামিয়ে দিয়েন।",
  "ওই মামা যান না কেন?"
];

const busJamMessages = [
  "এখন জ্যামে বসে থাকো।",
  "ধুর! সিগনাল পরলো আবার!",
  "ট্রাফিক পুলিশ কি ঘুমায়?",
  "অফিস তো শেষ!",
  "মামা, ইঞ্জিন বন্ধ করেন, তেল বাঁচবে।",
  "সিগনাল কি ছাড়বে না?",
  "হেঁটে গেলেই আগে পৌঁছাতাম।"
];

const boatMessages = [
  "পারাপার ভাড়া ১০ টাকা হলো কবে?",
  "Is this the trawler to Zinzira?",
  "Reaching Sadarghat... bus for Mirpur 10?",
  "সদর ঘাট থেকে বনানী যাবো কিভাবে?",
  "বুড়িগঙ্গা নদীর হাওয়াটা দারুণ।",
  "Is the launch leaving on time?",
  "Looking for the best Biryani in Old Dhaka.",
  "মাঝিকে ১০ টাকা দিলাম।",
  "সাবধানে উঠেন, পানি অনেক!",
  "Keraniganj textile market is busy.",
  "Launch horn is deafening!",
  "নদীর ওই পারে যাবো।"
];


export const Sun = () => (
  <div className="absolute top-8 right-[15%] w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-[0_0_50px_rgba(255,165,0,0.6)] z-0 animate-pulse-slow mix-blend-screen transition-all duration-1000"></div>
);

export const Moon = () => (
  <div className="absolute top-8 right-[15%] w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.4)] z-0 animate-pulse-slow transition-all duration-1000">
    <div className="absolute top-3 left-4 w-3 h-3 bg-slate-200 rounded-full opacity-50"></div>
    <div className="absolute bottom-5 right-4 w-5 h-5 bg-slate-200 rounded-full opacity-50"></div>
    <div className="absolute top-8 right-3 w-2 h-2 bg-slate-200 rounded-full opacity-50"></div>
  </div>
);

export const Stars = () => (
  <div className="absolute inset-0 z-0">
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full animate-pulse"
        style={{
          width: Math.random() > 0.5 ? '2px' : '3px',
          height: Math.random() > 0.5 ? '2px' : '3px',
          top: `${Math.random() * 60}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.8 + 0.2,
          animationDuration: `${Math.random() * 3 + 2}s`
        }}
      ></div>
    ))}
  </div>
);

export const Skyline = ({ isNight }: { isNight?: boolean }) => {
  // Memoize the random buildings so they don't re-render/flicker constantly
  const buildings = useMemo(() => Array.from({ length: 30 }).map(() => ({
    height: Math.floor(Math.random() * 12) + 6,
    width: Math.floor(Math.random() * 5) + 3,
    windows: Array.from({ length: 6 }).map(() => Math.random() > 0.6)
  })), []);

  return (
    <div className={`absolute bottom-0 w-full flex items-end z-0 pointer-events-none transition-colors duration-1000 ${isNight ? 'text-slate-800' : 'text-indigo-900 opacity-20'}`}>
      {buildings.map((b, i) => (
        <div key={i} className="bg-current mx-[2px] rounded-t-sm relative" style={{ height: `${b.height}rem`, width: `${b.width}rem` }}>
          {/* Lit Windows at Night */}
          {isNight && (
            <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1 content-start overflow-hidden opacity-80">
              {b.windows.map((isLit, j) => (
                isLit && (
                  <div key={j} className="w-full h-1 bg-yellow-400/50 rounded-sm shadow-[0_0_2px_rgba(250,204,21,0.8)]"></div>
                )
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const Cloud = ({ className }: { className: string }) => (
  <div className={`absolute ${className} transition-opacity duration-1000`} style={{ willChange: 'transform' }}>
    <div className="relative">
      <div className="w-20 h-8 bg-white rounded-full"></div>
      <div className="absolute -top-4 left-3 w-10 h-10 bg-white rounded-full"></div>
      <div className="absolute -top-6 left-8 w-12 h-12 bg-white rounded-full"></div>
    </div>
  </div>
);

export const Rain = () => {
  // Memoize random drop values
  const drops = useMemo(() => Array.from({ length: 50 }).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 0.5 + Math.random() * 0.5
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute top-0 w-[1px] h-10 md:h-16 bg-gradient-to-b from-transparent to-blue-200 opacity-30 rain-anim"
          style={{
            left: `${d.left}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`
          }}
        ></div>
      ))}
    </div>
  );
};

export const Fog = () => (
  <div className="absolute bottom-0 w-full h-1/2 z-20 pointer-events-none overflow-hidden">
    {/* Fog Layer 1 */}
    <div className="absolute bottom-0 w-[120%] -left-[10%] h-full bg-gradient-to-t from-white/30 via-white/10 to-transparent blur-xl fog-anim"></div>
    {/* Fog Layer 2 */}
    <div className="absolute bottom-0 w-[120%] left-0 h-2/3 bg-gradient-to-t from-slate-100/20 via-slate-100/5 to-transparent blur-2xl fog-anim" style={{ animationDelay: '-10s', animationDuration: '25s' }}></div>
  </div>
);

const ThoughtBubble = ({ text, className }: { text: string, className?: string }) => (
  <div className={`absolute z-50 flex flex-col items-center min-w-[120px] md:min-w-[180px] max-w-[150px] md:max-w-[250px] ${className}`}>
    <div className="bg-white px-3 py-2 md:px-4 md:py-3 rounded-2xl shadow-xl border border-stone-200 transition-all duration-300">
      <p className="text-[10px] md:text-sm text-stone-800 font-medium leading-tight md:leading-snug text-center italic font-serif">
        "{text}"
      </p>
    </div>
    <div className="flex flex-col items-center -mt-1 space-y-[2px]">
      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full shadow-sm border border-stone-100"></div>
      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white/90 rounded-full"></div>
      <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-white/80 rounded-full"></div>
    </div>
  </div>
);

// Headlight Beam Component
const Headlight = ({ isNight, className, rotation = '0deg', width = 'w-32' }: { isNight: boolean, className?: string, rotation?: string, width?: string }) => {
  if (!isNight) return null;
  return (
    <div
      className={`absolute h-16 bg-gradient-to-r from-yellow-100/40 via-yellow-200/10 to-transparent blur-md transform origin-left pointer-events-none z-40 ${className} ${width}`}
      style={{
        clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)',
        rotate: rotation
      }}
    >
    </div>
  );
};

export const Airplane = () => {
  const message = useMessageRotator(planeMessages, 6000);

  return (
    <div className="absolute top-20 left-0 z-0 plane-anim opacity-90" style={{ willChange: 'transform' }}>
      <div className="relative group">
        <Plane size={64} className="text-white fill-slate-200 drop-shadow-xl z-20 relative" />
        {/* Contrail */}
        <div className="absolute top-1/2 right-full w-32 h-1.5 bg-white opacity-50 blur-sm"></div>

        {/* Thought Bubble */}
        <div className="absolute top-12 left-6 bubble-anim z-30 flex flex-col items-center" style={{ animationDuration: '45s' }}>
          <div className="h-6 w-0.5 bg-white/80 -rotate-12 origin-bottom mb-[-2px] shadow-sm"></div>
          <ThoughtBubble text={message} className="" />
        </div>
      </div>
    </div>
  );
};

export const MetroTrack = () => (
  <div className="absolute bottom-0 w-[120%] -left-[10%] h-full z-10 pointer-events-none">
    {/* The Track (Viaduct) */}
    <div className="absolute top-24 w-full h-12 bg-stone-300 border-b-8 border-stone-400 shadow-xl flex items-center overflow-hidden z-20">
      {/* Concrete Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]"></div>
      {/* Sound Barrier / Wall */}
      <div className="absolute top-0 w-full h-4 bg-stone-400 border-b border-stone-500"></div>
      {/* Segment lines */}
      <div className="w-full h-full flex justify-between">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="w-[1px] h-full bg-stone-500/20"></div>
        ))}
      </div>
    </div>

    {/* Pillars */}
    <div className="w-full h-full flex justify-around px-20">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="flex flex-col items-center h-full relative group">
          <div className="absolute top-[6.5rem] w-24 md:w-40 h-8 bg-stone-400 clip-hammerhead shadow-lg z-10">
            <div className="w-full h-full bg-gradient-to-b from-stone-300 to-stone-400"></div>
          </div>
          <div className="w-10 md:w-14 h-full bg-stone-300 relative mt-24 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] border-x border-stone-400">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-stone-500/40 via-transparent to-stone-500/40"></div>
          </div>
        </div>
      ))}
    </div>
    <style>{`
          .clip-hammerhead { clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%); }
        `}</style>
  </div>
);

export const MetroTrain = ({ isNight }: { isNight: boolean }) => {
  const message = useMessageRotator(metroMessages, 5000);

  return (
    <div className="absolute top-[5rem] left-full z-20 metro-anim flex items-end filter drop-shadow-md" style={{ willChange: 'transform' }}>
      {/* Headlight */}
      <Headlight isNight={isNight} className="top-8 -left-28 rotate-180" width="w-40" />

      {/* Thought Bubble */}
      <div className="absolute -top-28 left-1/2 bubble-anim w-56 z-30" style={{ animationDuration: '20s' }}>
        <ThoughtBubble text={message} />
      </div>

      {/* HEAD CAR */}
      <div className="relative w-48 h-14 bg-gradient-to-b from-slate-100 to-slate-300 rounded-l-[3rem] rounded-r-sm border border-slate-400 overflow-hidden flex items-center z-20 shadow-lg">
        {/* Cockpit Window with Reflection */}
        <div className="absolute left-1 top-2 w-10 h-8 bg-slate-800 rounded-l-2xl rounded-tr-md skew-x-12 border-r-2 border-slate-600 opacity-90 overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/30 to-transparent"></div>
        </div>

        <div className="absolute top-5 left-12 w-full h-5 bg-green-600 skew-x-[-20deg] shadow-sm"></div>
        <div className="absolute bottom-1 w-full h-1.5 bg-red-600 opacity-90"></div>

        <div className="ml-16 flex space-x-3 z-10 mt-1">
          <div className={`w-10 h-6 ${isNight ? 'bg-yellow-100/60' : 'bg-slate-800'} rounded-sm border border-slate-500 relative overflow-hidden transition-colors duration-1000`}></div>
          <div className={`w-10 h-6 ${isNight ? 'bg-yellow-100/60' : 'bg-slate-800'} rounded-sm border border-slate-500 relative overflow-hidden transition-colors duration-1000`}></div>
        </div>
        <div className="absolute right-4 top-2 w-6 h-10 bg-slate-300 border border-slate-400 shadow-inner">
          <div className="w-[1px] h-full bg-slate-400 mx-auto"></div>
        </div>
      </div>

      {/* MIDDLE CARS */}
      {[1, 2, 3].map((car, i) => (
        <div key={i} className="relative w-44 h-14 bg-gradient-to-b from-slate-100 to-slate-300 border-y border-r border-slate-400 ml-[1px] flex items-center justify-between px-3 overflow-hidden shadow-lg">
          <div className="absolute top-5 left-[-20px] w-[130%] h-5 bg-green-600 skew-x-[-20deg] shadow-sm"></div>
          <div className="absolute bottom-1 w-full h-1.5 bg-red-600 opacity-90"></div>
          <div className="w-6 h-10 bg-slate-300 border border-slate-400 z-10 mt-1 shadow-inner relative">
            <div className="w-[1px] h-full bg-slate-400 mx-auto"></div>
          </div>
          <div className="flex space-x-3 z-10 mt-1">
            <div className={`w-10 h-6 ${isNight ? 'bg-yellow-100/60' : 'bg-slate-800'} rounded-sm border border-slate-500 relative overflow-hidden transition-colors duration-1000`}></div>
            <div className={`w-10 h-6 ${isNight ? 'bg-yellow-100/60' : 'bg-slate-800'} rounded-sm border border-slate-500 relative overflow-hidden transition-colors duration-1000`}></div>
          </div>
          <div className="w-6 h-10 bg-slate-300 border border-slate-400 z-10 mt-1 shadow-inner relative">
            <div className="w-[1px] h-full bg-slate-400 mx-auto"></div>
          </div>
          <div className="absolute -right-1 top-3 w-2 h-8 bg-slate-700 z-0 flex flex-col justify-center space-y-[2px]">
            <div className="w-full h-[1px] bg-slate-500"></div>
            <div className="w-full h-[1px] bg-slate-500"></div>
            <div className="w-full h-[1px] bg-slate-500"></div>
          </div>
          {i === 1 && (
            <div className="absolute -top-3 left-1/2 w-12 h-4 border-b-2 border-stone-600 flex justify-center">
              <div className="w-12 h-[2px] bg-stone-700 absolute top-0"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const CityBus = ({ isNight, isStopped }: { isNight: boolean, isStopped: boolean }) => {
  const busRef = useRef<HTMLDivElement>(null);
  const [shouldHalt, setShouldHalt] = useState(false);
  const [jamMsgIndex, setJamMsgIndex] = useState(0);

  // Rotate regular messages when moving
  const regularMessage = useMessageRotator(busMessages, 5500);

  // Rotate jam messages only when halted
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (shouldHalt) {
      interval = setInterval(() => {
        setJamMsgIndex(prev => (prev + 1) % busJamMessages.length);
      }, 3000); // Change thought every 3 seconds while stuck in traffic
    }
    return () => clearInterval(interval);
  }, [shouldHalt]);

  const jamMessage = busJamMessages[jamMsgIndex];

  // Smart Halt Logic: Only stop if we haven't passed the traffic police yet
  useEffect(() => {
    if (isStopped && busRef.current) {
      const rect = busRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      // Traffic police is around 80% of the screen (right-20%)
      // Stop only if the front of the bus (rect.right) hasn't reached the police yet
      if (rect.right < (screenWidth * 0.75)) {
        setShouldHalt(true);
        // Auto-resume after 3.5 seconds to prevent permanent stuck
        const timer = setTimeout(() => {
          setShouldHalt(false);
        }, 3500);
        return () => clearTimeout(timer);
      } else {
        setShouldHalt(false);
      }
    } else {
      setShouldHalt(false);
    }
  }, [isStopped]);

  const currentMessage = shouldHalt ? jamMessage : regularMessage;

  return (
    <div
      ref={busRef}
      className="absolute bottom-2 left-0 z-30 bus-anim"
      style={{ willChange: 'transform', animationPlayState: shouldHalt ? 'paused' : 'running' }}
    >
      {/* Headlights - Positioned at Front (Right) */}
      <Headlight isNight={isNight} className="bottom-0 -right-28" />

      {/* Thought Bubble */}
      <div className="absolute -top-24 left-4 bubble-anim w-48 z-40" style={{ animationDuration: '25s' }}>
        <ThoughtBubble text={currentMessage} />
      </div>

      <div className="relative w-36 h-16 bg-red-600 rounded-lg shadow-xl border border-red-800 transform -scale-x-100">
        {/* Lights (Visual dots) */}
        <div className={`absolute top-4 -left-1 w-2 h-3 ${isNight ? 'bg-yellow-100 shadow-[0_0_10px_rgba(255,255,0,0.8)]' : 'bg-yellow-200'} blur-[1px] opacity-90 rounded-sm`}></div>
        <div className={`absolute bottom-4 -left-1 w-2 h-3 ${isNight ? 'bg-yellow-100 shadow-[0_0_10px_rgba(255,255,0,0.8)]' : 'bg-yellow-200'} blur-[1px] opacity-90 rounded-sm`}></div>

        {/* Windows */}
        <div className="absolute top-2 left-3 right-3 h-7 bg-cyan-900 rounded flex space-x-1 px-1 items-center border border-cyan-950">
          <div className="w-1/3 h-5 bg-gradient-to-b from-cyan-200/60 to-cyan-400/20 rounded-sm"></div>
          <div className="w-1/3 h-5 bg-gradient-to-b from-cyan-200/60 to-cyan-400/20 rounded-sm"></div>
          <div className="w-1/3 h-5 bg-gradient-to-b from-cyan-200/60 to-cyan-400/20 rounded-sm"></div>
        </div>
        <div className="absolute bottom-6 w-full h-1 bg-white/30"></div>
        <div className="absolute -bottom-2 left-5 w-7 h-7 bg-black rounded-full border-4 border-stone-700 animate-spin">
          <div className="absolute top-1 left-1 w-1 h-1 bg-stone-500 rounded-full"></div>
        </div>
        <div className="absolute -bottom-2 right-5 w-7 h-7 bg-black rounded-full border-4 border-stone-700 animate-spin">
          <div className="absolute top-1 left-1 w-1 h-1 bg-stone-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export const CNG = ({ isNight }: { isNight: boolean }) => (
  <div className="absolute bottom-3 left-full z-30 cng-anim" style={{ willChange: 'transform' }}>
    {/* Headlight */}
    <Headlight isNight={isNight} className="bottom-[-10px] -right-28" />

    <div className="relative w-24 h-16">
      <div className="absolute bottom-2 w-20 h-12 bg-green-700 rounded-lg border border-green-900 shadow-md rounded-tr-3xl"></div>
      <div className="absolute top-0 left-2 w-16 h-8 bg-stone-800 rounded-t-lg opacity-90 border-2 border-stone-600">
        <div className="w-full h-full grid grid-cols-3 gap-[1px] opacity-50">
          <div className="bg-stone-500"></div>
          <div className="bg-stone-500"></div>
          <div className="bg-stone-500"></div>
        </div>
      </div>
      <div className={`absolute bottom-6 right-2 w-1 h-2 ${isNight ? 'bg-yellow-100 shadow-[0_0_8px_rgba(255,255,0,0.8)]' : 'bg-yellow-400'} blur-[1px]`}></div>
      <div className="absolute bottom-0 left-2 w-6 h-6 bg-black rounded-full border-2 border-stone-500 animate-spin"></div>
      <div className="absolute bottom-0 right-4 w-6 h-6 bg-black rounded-full border-2 border-stone-500 animate-spin"></div>
    </div>
  </div>
);

export const TrafficPolice = ({ isNight, isStopped }: { isNight: boolean, isStopped: boolean }) => (
  <div className="absolute bottom-4 right-[20%] flex flex-col items-center select-none pointer-events-auto transform scale-125 origin-bottom" title="Dhaka Metropolitan Police">
    {/* Cap */}
    <div className="w-6 h-2 bg-white rounded-t-sm z-20 shadow-sm relative">
      <div className="absolute bottom-0 w-full h-[2px] bg-blue-900"></div>
    </div>
    {/* Head */}
    <div className="w-5 h-5 bg-[#d2a679] rounded-full -mt-1 z-10 relative">
      {/* Sunglasses */}
      <div className="absolute top-2 left-1 w-3 h-1 bg-black/80 rounded-full"></div>
    </div>
    {/* Vest/Body */}
    <div className="relative w-8 h-10 bg-sky-300 rounded-t-md -mt-1 z-0 flex justify-center shadow-md">
      {/* Neon Vest */}
      <div className={`absolute top-0 w-8 h-6 bg-lime-400 ${isNight ? 'brightness-125 drop-shadow-[0_0_5px_rgba(163,230,53,0.8)]' : ''}`}>
        <div className="w-full h-1 bg-stone-300 mt-2 opacity-80"></div> {/* Reflective strip */}
      </div>
      {/* Arm Left (Signal) - Animated */}
      <div className={`absolute -left-2 top-1 w-3 h-8 bg-sky-300 rounded-full origin-top border-l border-black/10 transition-transform duration-300 ${isStopped ? 'rotate-[160deg] -translate-y-1' : 'police-arm-anim'}`}>
        <div className="absolute bottom-0 w-3 h-3 bg-[#d2a679] rounded-full">
          <div className="w-full h-full bg-white opacity-40 rounded-full scale-50"></div> {/* Glove hint */}
        </div>
      </div>
      {/* Arm Right (Side) */}
      <div className="absolute -right-2 top-1 w-3 h-8 bg-sky-300 rounded-full origin-top transform -rotate-12 border-r border-black/10">
        <div className="absolute bottom-0 w-3 h-3 bg-[#d2a679] rounded-full"></div>
      </div>
      {/* Belt */}
      <div className="absolute bottom-0 w-full h-1.5 bg-slate-900 z-10"></div>
    </div>
    {/* Legs */}
    <div className="flex space-x-0.5 -mt-0.5">
      <div className="w-3.5 h-9 bg-slate-800 rounded-b-sm"></div>
      <div className="w-3.5 h-9 bg-slate-800 rounded-b-sm"></div>
    </div>
    {/* Shadow */}
    <div className="absolute bottom-0 w-12 h-1.5 bg-black/30 blur-[2px] rounded-full scale-x-125"></div>
  </div>
);

export const RiverBoat = ({ isNight }: { isNight: boolean }) => {
  const message = useMessageRotator(boatMessages, 6500);

  return (
    <div className="absolute bottom-3 left-0 z-40 boat-anim" style={{ willChange: 'transform' }}>
      {/* Headlight on boat (Searchlight) */}
      <Headlight isNight={isNight} className="bottom-4 -right-28 -rotate-6 scale-75 opacity-70" />

      <div className="relative w-40 h-14 rock-boat-anim origin-bottom" style={{ willChange: 'transform' }}>
        {/* Thought Bubble */}
        <div className="absolute -top-28 -right-10 bubble-anim w-52 z-50" style={{ animationDuration: '35s' }}>
          <ThoughtBubble text={message} />
        </div>

        {/* Wake/Trail */}
        <div className="absolute bottom-1 -left-8 w-24 h-2 bg-white/30 blur-sm rounded-full"></div>

        {/* Hull */}
        <div className="absolute bottom-0 w-full h-10 bg-orange-900 rounded-b-full shadow-xl border-t-2 border-orange-950 overflow-hidden">
          <div className="absolute top-2 w-full h-1 bg-yellow-600/30"></div>
        </div>
        <div className="absolute bottom-8 left-6 w-24 h-8 bg-white border border-stone-300 shadow-md flex items-center justify-around px-1 z-10">
          <div className={`w-5 h-4 ${isNight ? 'bg-yellow-100' : 'bg-blue-300'} border border-blue-400 transition-colors duration-1000`}></div>
          <div className={`w-5 h-4 ${isNight ? 'bg-yellow-100' : 'bg-blue-300'} border border-blue-400 transition-colors duration-1000`}></div>
          <div className={`w-5 h-4 ${isNight ? 'bg-yellow-100' : 'bg-blue-300'} border border-blue-400 transition-colors duration-1000`}></div>
        </div>
        <div className="absolute bottom-16 left-4 w-28 h-1 bg-stone-600 z-20"></div>
        <div className="absolute bottom-16 left-6 w-1 h-8 bg-stone-500 z-10"></div>
        <div className="absolute bottom-16 right-12 w-1 h-8 bg-stone-500 z-10"></div>
        <div className="absolute -top-4 right-4 w-1 h-20 bg-black z-0"></div>
        {/* Flag removed as per request */}
      </div>
    </div>
  );
};

export const RiverWaves = ({ isNight }: { isNight: boolean }) => (
  <div className={`absolute bottom-0 w-full h-16 z-40 overflow-hidden border-t-4 transition-colors duration-1000 ${isNight ? 'bg-[#0f2027] border-[#1f3b4d]' : 'bg-[#005c97] border-[#4ca1af]'}`}>
    {/* SVG Waves Layer 1 (Slow) */}
    <div className="absolute bottom-0 w-[200%] h-full flex wave-anim opacity-50" style={{ willChange: 'transform' }}>
      <svg className="w-1/2 h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M0 50 Q 250 80 500 50 T 1000 50 V 100 H 0 Z" fill={isNight ? '#14303d' : '#1e75a8'} />
      </svg>
      <svg className="w-1/2 h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M0 50 Q 250 80 500 50 T 1000 50 V 100 H 0 Z" fill={isNight ? '#14303d' : '#1e75a8'} />
      </svg>
    </div>

    {/* SVG Waves Layer 2 (Faster, Offset) */}
    <div className="absolute bottom-[-10px] left-[-200px] w-[200%] h-full flex wave-anim opacity-70" style={{ animationDuration: '7s', willChange: 'transform' }}>
      <svg className="w-1/2 h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M0 60 Q 250 30 500 60 T 1000 60 V 100 H 0 Z" fill={isNight ? '#1b4052' : '#2980b9'} />
      </svg>
      <svg className="w-1/2 h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M0 60 Q 250 30 500 60 T 1000 60 V 100 H 0 Z" fill={isNight ? '#1b4052' : '#2980b9'} />
      </svg>
    </div>
  </div>
);
