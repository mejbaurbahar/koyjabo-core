import React from 'react';
import { TravelOption } from '../types';
import { Plane, Bus, Train, Clock, Ship, Car } from 'lucide-react';

interface RouteCardProps {
  option: TravelOption;
  isSelected: boolean;
  onClick: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ option, isSelected, onClick }) => {
  const getIcon = () => {
    switch (option.type) {
      case 'AIR': return <Plane className="w-5 h-5" />;
      case 'TRAIN': return <Train className="w-5 h-5" />;
      case 'BUS': return <Bus className="w-5 h-5" />;
      case 'FERRY': return <Ship className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const getThemeColor = () => {
    switch (option.type) {
      case 'AIR': return { bg: 'from-blue-500 to-indigo-600', icon: 'bg-blue-500', border: 'border-blue-400', ring: 'ring-blue-500/50' };
      case 'TRAIN': return { bg: 'from-orange-500 to-amber-600', icon: 'bg-orange-500', border: 'border-orange-400', ring: 'ring-orange-500/50' };
      case 'BUS': return { bg: 'from-emerald-500 to-teal-600', icon: 'bg-kj-primary', border: 'border-emerald-400', ring: 'ring-emerald-500/50' };
      case 'FERRY': return { bg: 'from-cyan-500 to-blue-600', icon: 'bg-cyan-500', border: 'border-cyan-400', ring: 'ring-cyan-500/50' };
      default: return { bg: 'from-gray-500 to-slate-600', icon: 'bg-gray-500', border: 'border-gray-400', ring: 'ring-gray-500/50' };
    }
  };

  const color = getThemeColor();

  return (
    <div
      onClick={onClick}
      className={`
        relative group rounded-2xl p-4 cursor-pointer transition-all duration-300 border-2 overflow-hidden
        ${isSelected
          ? `bg-white/90 dark:bg-kj-chip-bg/90 backdrop-blur-xl ${color.border} ring-2 ${color.ring} shadow-xl shadow-black/10`
          : `bg-white/70 dark:bg-kj-chip-bg/70 backdrop-blur-lg border-kj-line/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-kj-chip-bg/90 hover:border-kj-line/50 dark:hover:border-gray-600/50 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5`
        }
      `}
    >
      {/* Gradient overlay when selected */}
      {isSelected && (
        <div className={`absolute inset-0 bg-gradient-to-br ${color.bg} opacity-5 -z-10`}></div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg ${isSelected ? `bg-gradient-to-br ${color.bg} text-white scale-110` : `bg-kj-chip-bg text-kj-text-dim group-hover:text-kj-text-dim dark:group-hover:text-gray-200 group-hover:bg-kj-chip-bg dark:group-hover:bg-slate-600`}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-bold text-base transition-colors ${isSelected ? 'bg-gradient-to-r ' + color.bg + ' bg-clip-text text-transparent' : 'text-kj-text'}`}>
                {option.type === 'BUS' ? 'Bus' : option.type === 'TRAIN' ? 'Train' : option.type === 'AIR' ? 'Flight' : option.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-kj-text-dim">
                <Clock size={13} className="opacity-70" />
                <span className="font-medium">{option.totalDuration}</span>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-bold text-base transition-colors ${isSelected ? `text-transparent bg-clip-text bg-gradient-to-r ${color.bg}` : 'text-kj-primary'}`}>
                {option.totalCostRange}
              </div>
              <div className="text-[10px] text-kj-text-dim uppercase tracking-wide font-semibold mt-0.5">BDT</div>
            </div>
          </div>

          {/* Description / Summary */}
          <p className="text-xs text-kj-text-dim mt-3 line-clamp-2 leading-relaxed">
            {option.title !== 'Bus' && option.title !== 'Train' && option.title !== 'Flight' ? option.title : option.summary}
            {option.steps[0]?.instruction && ` - ${option.steps[0].instruction}`}
          </p>
        </div>
      </div>
    </div>
  );
};