import React from 'react';

interface LandmarkProps {
    onClick: () => void;
    className?: string;
}

// National Martyrs' Memorial (Savar) - Jatiyo Smriti Soudho
export const NationalMemorial = ({ onClick, className }: LandmarkProps) => (
    <div
        onClick={onClick}
        className={`cursor-pointer transition-transform hover:scale-105 group relative ${className}`}
        title="National Martyrs' Memorial"
    >
        <div className="relative w-40 h-48 flex items-end justify-center">
            {/* The 7 triangular pairs */}
            <div className="absolute bottom-0 h-16 w-32 bg-stone-300 clip-triangle-structure opacity-50"></div>
            <div className="absolute bottom-0 h-24 w-24 bg-stone-300 clip-triangle-structure opacity-60"></div>
            <div className="absolute bottom-0 h-32 w-16 bg-stone-200 clip-triangle-structure opacity-80"></div>
            <div className="absolute bottom-0 h-40 w-10 bg-stone-200 clip-triangle-structure opacity-90"></div>
            <div className="absolute bottom-0 h-48 w-4 bg-stone-100 clip-triangle-structure shadow-lg z-10"></div>
        </div>
        <style>{`
      .clip-triangle-structure {
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      }
    `}</style>
    </div>
);

// Ahsan Manzil (Pink Palace)
export const AhsanManzil = ({ onClick, className }: LandmarkProps) => (
    <div
        onClick={onClick}
        className={`cursor-pointer transition-transform hover:scale-105 group relative ${className}`}
        title="Ahsan Manzil (Pink Palace)"
    >
        <div className="relative w-48 h-32 md:w-60 md:h-40 flex flex-col justify-end items-center">
            {/* Dome */}
            <div className="w-16 h-12 bg-pink-400 rounded-t-full border-x-2 border-t-2 border-pink-300 z-10 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-4 bg-black"></div>
            </div>
            {/* Main Body */}
            <div className="w-full h-20 bg-pink-500 rounded-sm shadow-lg flex flex-col justify-between border border-pink-600 relative z-0">
                {/* Windows Row */}
                <div className="flex justify-around mt-2 px-2">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-4 h-6 bg-stone-800 rounded-t-full border border-white/50"></div>)}
                </div>
                {/* Grand Staircase */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-10 bg-stone-300 clip-trapezoid flex flex-col justify-end items-center border-x border-stone-400">
                    <div className="w-full h-1 bg-stone-400 my-[1px]"></div>
                    <div className="w-11/12 h-1 bg-stone-400 my-[1px]"></div>
                    <div className="w-10/12 h-1 bg-stone-400 my-[1px]"></div>
                </div>
            </div>
            <style>{`
        .clip-trapezoid { clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%); }
      `}</style>
        </div>
    </div>
);

// Lalbagh Fort
export const LalbaghFort = ({ onClick, className }: LandmarkProps) => (
    <div
        onClick={onClick}
        className={`cursor-pointer transition-transform hover:scale-105 group relative ${className}`}
        title="Lalbagh Fort"
    >
        <div className="relative w-40 h-32 flex items-end justify-center">
            {/* Central Structure */}
            <div className="w-32 h-20 bg-red-700 relative border-t-4 border-stone-200">
                {/* Main Dome */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-14 h-12 bg-stone-200 rounded-t-full border-2 border-stone-300 z-10">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-black"></div>
                </div>
                {/* Side Domes */}
                <div className="absolute -top-6 left-2 w-8 h-8 bg-stone-200 rounded-t-full border-2 border-stone-300"></div>
                <div className="absolute -top-6 right-2 w-8 h-8 bg-stone-200 rounded-t-full border-2 border-stone-300"></div>

                {/* Archway */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-14 bg-red-900 rounded-t-full border-4 border-stone-200"></div>
            </div>
        </div>
    </div>
);

// National Parliament House (Jatiya Sangsad Bhaban) - Louis Kahn
export const SangsadBhaban = ({ onClick, className }: LandmarkProps) => (
    <div
        onClick={onClick}
        className={`cursor-pointer transition-transform hover:scale-105 group relative ${className}`}
        title="National Parliament House"
    >
        <div className="relative w-48 h-32 md:w-64 md:h-40">
            {/* Main Structure - Concrete Grey */}
            <div className="absolute bottom-0 left-0 w-full h-3/4 bg-stone-300 rounded-lg shadow-lg overflow-hidden flex items-center justify-center border-t border-stone-200">
                {/* The iconic shapes */}
                <div className="flex space-x-2 md:space-x-4 items-center">
                    <div className="w-6 h-8 md:w-8 md:h-12 bg-stone-400 opacity-50 clip-triangle"></div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-400 opacity-50 rounded-full"></div>
                    <div className="w-6 h-12 md:w-8 md:h-16 bg-stone-400 opacity-50"></div>
                </div>
            </div>
            {/* Central Assembly Cylinder */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-28 md:w-32 md:h-36 bg-stone-300 rounded-t-lg border-x border-t border-stone-200 shadow-xl z-10 flex flex-col items-center justify-start pt-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-stone-400 opacity-30 rounded-full border-4 border-stone-300"></div>
            </div>
            {/* Water reflection hint */}
            <div className="absolute -bottom-4 left-0 w-full h-4 bg-blue-200 opacity-30 blur-sm transform scale-y-[-1]"></div>
        </div>
    </div>
);

// Shaheed Minar
export const ShaheedMinar = ({ onClick, className }: LandmarkProps) => (
    <div
        onClick={onClick}
        className={`cursor-pointer transition-transform hover:scale-105 group relative ${className}`}
        title="Shaheed Minar"
    >
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-end justify-center">
            {/* The Red Sun */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full shadow-inner z-0"></div>

            {/* Columns - White/Marble */}
            {/* Left Short */}
            <div className="w-4 md:w-6 h-16 md:h-20 bg-slate-100 border border-slate-300 mx-1 z-10 rounded-t-sm"></div>
            {/* Middle Tall with bend */}
            <div className="relative w-6 md:w-8 h-24 md:h-32 bg-slate-100 border border-slate-300 mx-1 z-10 rounded-t-sm">
                <div className="absolute top-0 w-full h-4 bg-slate-200 transform skew-y-12 origin-top-left"></div>
            </div>
            {/* Right Short */}
            <div className="w-4 md:w-6 h-16 md:h-20 bg-slate-100 border border-slate-300 mx-1 z-10 rounded-t-sm"></div>

            {/* Base */}
            <div className="absolute bottom-0 w-full h-4 bg-slate-200 rounded-full z-20"></div>
        </div>
    </div>
);

// Curzon Hall (Dhaka University)
export const CurzonHall = ({ onClick, className }: LandmarkProps) => (
    <div
        onClick={onClick}
        className={`cursor-pointer transition-transform hover:scale-105 group relative ${className}`}
        title="Curzon Hall"
    >
        <div className="relative w-40 h-28 md:w-56 md:h-36 flex items-end">
            {/* Main Building - Red Brick */}
            <div className="w-full h-20 md:h-24 bg-red-800 rounded-t-md relative flex justify-around items-end border-t-4 border-white shadow-lg">
                {/* Arches */}
                <div className="w-6 h-10 bg-red-900 rounded-t-full border-2 border-white/50"></div>
                <div className="w-6 h-10 bg-red-900 rounded-t-full border-2 border-white/50"></div>
                <div className="w-8 h-12 bg-red-900 rounded-t-full border-2 border-white/50 mb-2"></div> {/* Entrance */}
                <div className="w-6 h-10 bg-red-900 rounded-t-full border-2 border-white/50"></div>
                <div className="w-6 h-10 bg-red-900 rounded-t-full border-2 border-white/50"></div>
            </div>
            {/* Spire/Domes */}
            <div className="absolute top-4 left-2 w-6 h-8 bg-red-700 rounded-t-full border-x-2 border-white"></div>
            <div className="absolute top-4 right-2 w-6 h-8 bg-red-700 rounded-t-full border-x-2 border-white"></div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-red-700 rounded-full border-4 border-white z-10 shadow-md"></div>
        </div>
    </div>
);
