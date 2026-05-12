import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Station {
    id: string;
    name: string;
    bnName?: string; // Bengali Name
}

interface SearchableSelectProps {
    options: Station[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, disabled }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selected = options.find(o => o.id === value);
        if (selected) {
            setSearchTerm(selected.name);
        } else if (!value) {
            setSearchTerm('');
        }
    }, [value, options]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Revert to selected value if no new valid selection made
                const selected = options.find(o => o.id === value);
                if (selected) setSearchTerm(selected.name);
                else if (!value) setSearchTerm('');
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef, value, options]);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        if (e.target.value === '') {
                            onChange('');
                        }
                    }}
                    onFocus={() => {
                        if (!disabled) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full pl-2 md:pl-3 pr-10 md:pr-14 py-2 md:py-3.5 bg-kj-panel text-kj-text rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-kj-primary/30 disabled:bg-gray-100 dark:disabled:bg-kj-panel disabled:text-kj-text-faint dark:disabled:text-kj-text-dim border border-transparent focus:border-green-400/30 transition-all shadow-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchTerm && !disabled && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onChange('');
                                setSearchTerm('');
                                setIsOpen(false);
                            }}
                            className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Clear"
                            aria-label="Clear selection"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <MapPin className="w-4 h-4 text-kj-text-faint pointer-events-none mx-1" />
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 w-full mt-1 bg-kj-panel rounded-xl shadow-xl border border-kj-line max-h-60 overflow-y-auto z-[9999] animate-in fade-in slide-in-from-top-2">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => {
                                    onChange(option.id);
                                    setSearchTerm(option.name);
                                    setIsOpen(false);
                                }}
                                className="px-4 py-3 hover:bg-kj-chip-bg dark:hover:bg-slate-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-center justify-between group"
                            >
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-kj-text">
                                        {option.name}
                                    </div>
                                    {option.bnName && (
                                        <div className="text-xs text-kj-text-dim mt-0.5">
                                            {option.bnName}
                                        </div>
                                    )}
                                </div>
                                {value === option.id && <div className="w-2 h-2 rounded-full bg-kj-primary"></div>}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-xs text-kj-text-faint text-center">{t('home.noResults')}</div>
                    )}
                </div>
            )}
        </div>
    );
};
