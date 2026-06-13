import React from 'react';

interface HomeHeroStripProps {
  language: 'en' | 'bn';
}

const HomeHeroStrip: React.FC<HomeHeroStripProps> = ({ language }) => {
  const lbl = (en: string, bn: string) => (language === 'bn' ? bn : en);

  return (
    <div className="w-full h-[180px] md:h-[200px] relative overflow-hidden shrink-0 md:rounded-2xl border-b md:border border-kj-line bg-[#070d1c]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1530] via-[#0c1a38] to-[#06101f]" />

      {/* Stars */}
      <div className="absolute inset-0 opacity-70">
        {[['12%','18%'],['22%','42%'],['35%','12%'],['48%','28%'],['62%','15%'],['78%','35%'],['88%','20%']].map(([l,t], i) => (
          <span key={i} className="absolute w-1 h-1 rounded-full bg-white/80" style={{ left: l, top: t }} />
        ))}
      </div>

      {/* Moon */}
      <div className="absolute top-5 left-8 w-12 h-12 rounded-full bg-[#f5d76e] shadow-[0_0_24px_rgba(245,215,110,0.45)] kj-anim-glow-soft" />

      {/* Plane */}
      <div className="absolute top-8 right-16 text-lg opacity-90 kj-anim-fly-soft">✈️</div>

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-[42%] bg-[#1a2744]">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] border-t border-dashed border-white/25" />
        <div className="absolute top-[calc(50%+10px)] left-0 right-0 h-[2px] border-t border-dashed border-white/15" />
      </div>

      {/* Bus */}
      <div className="absolute bottom-[18%] left-[38%] kj-anim-drive-soft">
        <div className="w-16 h-8 rounded-lg bg-gradient-to-r from-[#00c4d4] to-[#0096b8] shadow-[0_0_16px_rgba(0,245,255,0.35)] flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">BUS</span>
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-4 right-4 bg-kj-panel/90 border border-kj-line rounded-full px-2.5 py-1 flex items-center gap-1.5 kj-glass">
        <span className="w-1.5 h-1.5 rounded-full bg-kj-primary animate-pulse" />
        <span className="text-[10px] font-bold text-kj-text tracking-wide uppercase">
          {lbl('Live · Dhaka', 'লাইভ · ঢাকা')}
        </span>
      </div>

      <div className="absolute bottom-4 left-4 bg-kj-panel/90 border border-kj-line rounded-lg px-2.5 py-1 kj-glass">
        <span className="text-[10px] font-bold text-kj-text tracking-[0.14em] uppercase">
          {lbl('Motijheel', 'মতিঝিল')}
        </span>
      </div>
    </div>
  );
};

export default HomeHeroStrip;
