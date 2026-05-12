import React, { useState, useEffect } from 'react';
import { Bus, Train, Ship, TramFront } from 'lucide-react';

export const AnimatedLogo = ({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) => {
    const [iconIndex, setIconIndex] = useState(0);
    // Sequence: Bus -> Rail (Train) -> Ship -> Metro (TramFront)
    const icons = [Bus, Train, Ship, TramFront];

    useEffect(() => {
        const interval = setInterval(() => {
            setIconIndex((prev) => (prev + 1) % icons.length);
        }, 2000); // Change icon every 2 seconds
        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = icons[iconIndex];

    const containerSizeClass = size === 'large' ? 'w-10 h-10 rounded-xl' : (size === 'small' ? 'w-8 h-8 md:w-11 md:h-11 rounded-lg' : 'w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl');
    const iconSize = size === 'large' ? 28 : (size === 'small' ? 20 : 24);
    const bengaliSize = size === 'large' ? 'text-xl' : (size === 'small' ? 'text-base md:text-lg' : 'text-lg md:text-xl');

    return (
        <div className="flex items-center gap-0 outline-none cursor-pointer select-none group">
            <div className={`bg-kj-primary relative flex flex-col items-center justify-center shadow-kj transition-all duration-300 group-hover:shadow-kj-lg group-hover:scale-105 overflow-hidden ${containerSizeClass}`}>
                {/* Bengali "ক" letter — primary content */}
                <span className={`font-bengali font-bold text-kj-primary-ink leading-none ${bengaliSize}`}>
                    ক
                </span>
                {/* Accent underline bar at bottom */}
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-kj-accent" />
                {/* Animated transport icon — small overlay, fades in/out */}
                <CurrentIcon
                    size={Math.round(iconSize * 0.45)}
                    className="absolute top-[3px] right-[3px] text-kj-primary-ink/50 animate-in fade-in zoom-in duration-500"
                    key={iconIndex}
                    strokeWidth={2}
                />
            </div>
            <img
                src="/logo.png"
                alt="Logo"
                className={`${size === 'large' ? 'h-24 scale-150 ml-4' : (size === 'small' ? 'h-14 md:h-20 scale-110 md:scale-125 -ml-1' : 'h-16 md:h-20 scale-[2] origin-left ml-2 md:ml-2')} w-auto`}
            />
        </div>
    );
};
