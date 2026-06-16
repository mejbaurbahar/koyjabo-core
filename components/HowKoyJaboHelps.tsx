import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onTryNow?: () => void;
}

const STEPS = [
  {
    icon: '😕',
    en: 'At the bus stand — which bus do I take?',
    bn: 'বাসস্ট্যান্ডে — কোন বাসে উঠবো?',
    color: '#ff2a6d',
  },
  {
    icon: '📱',
    en: 'Open KoyJabo and type your destination',
    bn: 'KoyJabo খুলুন, গন্তব্য লিখুন',
    color: '#00f5ff',
  },
  {
    icon: '✅',
    en: 'Get the right bus, fare & time — instantly',
    bn: 'সঠিক বাস, ভাড়া ও সময় — সাথে সাথে',
    color: '#10b981',
  },
  {
    icon: '🎉',
    en: 'Hop on the right bus, stress-free!',
    bn: 'নিশ্চিন্তে সঠিক বাসে উঠে যাত্রা!',
    color: '#ffb800',
  },
];

export const HowKoyJaboHelps: React.FC<Props> = ({ onTryNow }) => {
  const { language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;

  return (
    <div className="dc-card rounded-[22px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
            ✦ KoyJabo
          </p>
          <h2 className="font-bengali font-bold text-base text-kj-text mt-0.5">
            {lbl('How KoyJabo helps', 'কই যাবো কীভাবে সাহায্য করে')}
          </h2>
        </div>
        {onTryNow && (
          <button
            onClick={onTryNow}
            className="flex items-center gap-1 text-xs font-bold text-kj-primary font-bengali"
          >
            {lbl('Try now', 'এখনই')} <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 4-step horizontal flow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {STEPS.map((step, i) => (
          <div key={i} className="relative">
            <div
              className="rounded-2xl p-3.5 flex flex-col gap-2 h-full"
              style={{ background: `${step.color}12`, border: `1px solid ${step.color}30` }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white font-sans shrink-0"
                  style={{ background: step.color }}
                >
                  {i + 1}
                </span>
                <span className="text-xl leading-none">{step.icon}</span>
              </div>
              <p className="font-bengali text-[12px] leading-snug text-kj-text-dim">
                {lbl(step.en, step.bn)}
              </p>
            </div>
            {/* Connector arrow */}
            {i < STEPS.length - 1 && (
              <div className="hidden sm:flex absolute -right-1.5 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-3 h-3 text-kj-text-faint" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div
        className="rounded-xl p-3 text-center"
        style={{ background: 'linear-gradient(135deg, var(--kj-primary-soft), var(--kj-panel))' }}
      >
        <p className="font-bengali text-[12px] text-kj-primary font-bold">
          {lbl(
            '2,400+ routes · 64 districts · works offline · free forever',
            '২,৪০০+ রুট · ৬৪ জেলা · অফলাইনেও চলে · সম্পূর্ণ ফ্রি'
          )}
        </p>
      </div>
    </div>
  );
};

export default HowKoyJaboHelps;
