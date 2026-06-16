import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleTheme }) => {
    return (
        <div
            onClick={toggleTheme}
            className="w-[52px] h-[28px] rounded-full relative cursor-pointer transition-all duration-300"
            style={{ background: isDarkMode ? 'var(--kj-primary)' : 'var(--kj-line)' }}
            role="button"
            aria-label="Toggle Dark Mode"
        >
            <div
                className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300"
                style={{ left: isDarkMode ? 'calc(100% - 25px)' : '3px' }}
            >
                {isDarkMode
                    ? <Moon className="w-3 h-3" style={{ color: 'var(--kj-primary)' }} />
                    : <Sun className="w-3 h-3" style={{ color: 'var(--kj-amber)' }} />
                }
            </div>
        </div>
    );
};

export default ThemeToggle;
