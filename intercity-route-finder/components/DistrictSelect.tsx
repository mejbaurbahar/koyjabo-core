import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { LOCATIONS_DATA } from '../constants';

interface DistrictSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  placeholder?: string;
}

const DistrictSelect: React.FC<DistrictSelectProps> = ({ label, value, onChange, name, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: string) => {
    onChange(location);
    setIsOpen(false);
  };

  const displayValue = value || placeholder || "Select Location";

  return (
    <div className="relative group" ref={dropdownRef}>
      <label className="block text-xs md:text-sm font-medium text-kj-text-dim mb-0.5 md:mb-1 ml-1 transition-colors">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 md:pl-3 flex items-center pointer-events-none text-kj-text-faint group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
          <MapPin size={16} className="md:w-[18px] md:h-[18px]" />
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="block w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2 md:py-3 text-sm md:text-base border-kj-line dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-kj-chip-bg transition-all shadow-sm outline-none text-kj-text-dim font-medium cursor-pointer text-left border"
        >
          {displayValue}
        </button>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-3 pointer-events-none text-kj-text-faint">
          <ChevronDown className={`h-3 w-3 md:h-4 md:w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-[100] w-full mt-1 bg-kj-panel border border-kj-line dark:border-slate-600 rounded-xl shadow-lg max-h-[200px] md:max-h-[280px] overflow-y-auto">
            <div
              onClick={() => handleSelect('')}
              className="px-3 py-1.5 text-sm md:text-base hover:bg-kj-chip-bg cursor-pointer text-kj-text-dim"
            >
              {placeholder || "Select Location"}
            </div>
            {Object.entries(LOCATIONS_DATA).map(([category, locations]) => (
              <div key={category}>
                <div className="px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-kj-chip-bg sticky top-0">
                  {category}
                </div>
                {locations.map((location) => (
                  <div
                    key={`${category}-${location}`}
                    onClick={() => handleSelect(location)}
                    className={`px-3 py-1.5 text-sm md:text-base hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer ${value === location ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium' : 'text-green-600 dark:text-green-400'
                      }`}
                  >
                    {location}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DistrictSelect;