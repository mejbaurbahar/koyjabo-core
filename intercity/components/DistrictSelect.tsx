import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { LOCATIONS_DATA } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface DistrictSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  placeholder?: string;
}

const DistrictSelect: React.FC<DistrictSelectProps> = ({ label, value, onChange, name, placeholder }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations based on search term
  const filteredData = Object.entries(LOCATIONS_DATA).reduce((acc, [category, locations]) => {
    const matched = locations.filter(loc =>
      loc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (matched.length > 0) {
      acc[category] = matched;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const handleSelect = (location: string) => {
    onChange(location);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const displayValue = value || placeholder || t('common.select');

  return (
    <div className="relative group" ref={dropdownRef}>
      <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 md:mb-1 ml-1 transition-colors">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 md:pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
          <MapPin size={16} className="md:w-[18px] md:h-[18px]" />
        </div>
        <button
          type="button"
          onClick={toggleDropdown}
          className="block w-full pl-8 md:pl-10 pr-8 md:pr-10 py-2 md:py-3 text-sm md:text-base border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm outline-none text-gray-700 dark:text-gray-200 font-medium cursor-pointer text-left border"
        >
          {displayValue}
        </button>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
          <ChevronDown className={`h-3 w-3 md:h-4 md:w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-[999] w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-[300px] md:max-h-[350px] overflow-hidden flex flex-col">
            {/* Search Input In Dropdown */}
            <div className="p-2 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('intercity.searchLocation')}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="overflow-y-auto flex-1 h-full max-h-[250px] md:max-h-[300px]">
              <div
                onClick={() => handleSelect('')}
                className="px-3 py-2 text-sm md:text-base hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-gray-500 dark:text-gray-400 border-b border-gray-50 dark:border-slate-700"
              >
                {placeholder || t('common.select')}
              </div>

              {Object.keys(filteredData).length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">{t('home.noResults')}</div>
              ) : (
                Object.entries(filteredData).map(([category, locations]) => (
                  <div key={category}>
                    <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-gray-50 dark:bg-slate-700 sticky top-0 border-y border-gray-100 dark:border-slate-600 z-10">
                      {t(`intercity.locationCategories.${category}`)}
                    </div>
                    {locations.map((location) => (
                      <div
                        key={`${category}-${location}`}
                        onClick={() => handleSelect(location)}
                        className={`px-3 py-2 text-sm md:text-base hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer ${value === location ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-200'
                          }`}
                      >
                        {location}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistrictSelect;