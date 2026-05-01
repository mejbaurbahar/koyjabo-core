import React, { useState, useEffect } from 'react';
import { SangsadBhaban, ShaheedMinar, CurzonHall, AhsanManzil, NationalMemorial, LalbaghFort } from './DhakaLandmarks';
import { Cloud, Airplane, MetroTrack, MetroTrain, CityBus, RiverBoat, Sun, Moon, Skyline, Stars, RiverWaves, Rain, Fog, TrafficPolice } from './DhakaAnimationElements';
import AdSenseAd from './AdSenseAd';
import { X, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';


// --- Fixed Landmark Data ---
const landmarkData: Record<string, string> = {
    "National Martyrs' Memorial": "১৯৭১ সালের বাংলাদেশের স্বাধীনতা যুদ্ধে শহীদদের স্মরণে নির্মিত সাভারের এই স্মৃতিসৌধটি সাত জোড়া ত্রিভুজাকার দেয়াল নিয়ে গঠিত, যা পর্যায়ক্রমে প্রশস্ত হয়ে ত্যাগের বিশালতাকে প্রতীকায়িত করে।",
    "Ahsan Manzil": "পিংক Palace বা গোলাপী প্রাসাদ নামেও পরিচিত, এটি ছিল ঢাকার নবাবদের আনুষ্ঠানিক আবাসিক প্রাসাদ ও দপ্তর। বুড়িগঙ্গা নদীর তীরে অবস্থিত এই ভবনটি ইন্দো-সারাসেনিক রিভাইভাল স্থাপত্যশৈলীর এক অনন্য নিদর্শন।",
    "Lalbagh Fort": "পুরান ঢাকায় অবস্থিত ১৭শ শতাব্দীর একটি অসমাপ্ত মুঘল দুর্গ কমপ্লেক্স। এখানে পরী বিবির সমাধি, একটি মসজিদ এবং দেওয়ান-ই-আম রয়েছে, যা মুঘল আমলের জাঁকজমকের নীরব সাক্ষী হিসেবে দাঁড়িয়ে আছে।",
    "Shaheed Minar": "১৯৫২ সালের ভাষা আন্দোলনের মিছিলে নিহতদের স্মরণে নির্মিত একটি শক্তিশালী জাতীয় স্মৃতিস্তম্ভ। এটি বাংলা ভাষার প্রতি ভালোবাসা এবং অদম্য সাহসের প্রতীক।",
    "Curzon Hall": "ইউরোপীয় ও মুঘল স্থাপত্যশৈলীর এক অপূর্ব সংমিশ্রণ, এই ভবনটি ঢাকা বিশ্ববিদ্যালয়ের বিজ্ঞান অনুষদের অংশ। মূলত লর্ড কার্জনের নামানুসারে এটি একটি টাউন হল হিসেবে নির্মাণের উদ্দেশ্য ছিল।",
    "Jatiya Sangsad Bhaban": "বাংলাদেশের জাতীয় সংসদ ভবন, যা প্রখ্যাত স্থপতি লুই আই কান নকশা করেছিলেন। এটি বিশ্বের অন্যতম বৃহত্তম আইনসভা কমপ্লেক্স, যা এর বিশাল কংক্রিটের নান্দনিকতা এবং জ্যামিতিক আকৃতির ব্যবহারের জন্য বিখ্যাত।"
};

const DhakaAlive: React.FC<{ hideIndicator?: boolean }> = ({ hideIndicator = false }) => {
    useLanguage(); // ensures component is within LanguageProvider context
    const [selectedLandmark, setSelectedLandmark] = useState<string | null>(null);
    const [description, setDescription] = useState<string>("");
    const [isNight, setIsNight] = useState(false);
    const [weather, setWeather] = useState<'clear' | 'rain' | 'fog'>('clear');
    const [isTrafficStopped, setIsTrafficStopped] = useState(false);
    const [usingLiveWeather, setUsingLiveWeather] = useState(false);

    // --- Live Weather & Time Logic ---
    useEffect(() => {
        // 1. Fallback Logic (Simulation based on Time)
        const runSimulation = () => {
            if (usingLiveWeather) return; // Don't overwrite if we have live data

            const hour = new Date().getHours();
            setIsNight(hour >= 18 || hour < 6);

            // Simulation Weather Logic:
            // Rain: 8 PM (20:00) to 4 AM (04:00) - Late Night
            // Fog: 5 AM (05:00) to 9 AM (09:00) - Early Morning
            if (hour >= 20 || hour < 4) {
                setWeather('rain');
            } else if (hour >= 5 && hour < 9) {
                setWeather('fog');
            } else {
                setWeather('clear');
            }
        };

        // 2. Live Weather Fetcher
        const fetchLiveWeather = async (lat: number, lon: number) => {
            try {
                // Using Open-Meteo (Free, No API Key required)
                // Docs: https://open-meteo.com/en/docs
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,is_day&timezone=auto`
                );
                const data = await response.json();

                if (data.current) {
                    setUsingLiveWeather(true);

                    // Set Day/Night (is_day: 1 = Day, 0 = Night)
                    setIsNight(data.current.is_day === 0);

                    // Map WMO Weather Codes to App States
                    const code = data.current.weather_code;

                    // Rain Codes: 51-57 (Drizzle), 61-67 (Rain), 80-82 (Showers), 95-99 (Thunderstorm)
                    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
                        setWeather('rain');
                    }
                    // Fog Codes: 45, 48
                    else if ([45, 48].includes(code)) {
                        setWeather('fog');
                    }
                    // Clear/Cloudy: 0, 1, 2, 3
                    else {
                        setWeather('clear');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch weather, reverting to simulation:", error);
                setUsingLiveWeather(false); // Fallback will take over next interval
            }
        };

        // 3. Initialize
        runSimulation(); // Run immediate fallback check

        // PERFORMANCE OPTIMIZATION: Defer weather API to avoid blocking critical path
        // Previously this was blocking LCP with 2,483ms delay!
        const weatherTimer = setTimeout(() => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchLiveWeather(position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                        console.log("Location access denied or unavailable, using simulation.");
                    }
                );
            }
        }, 2000); // Wait 2 seconds before fetching weather

        // 4. Background Loop for Simulation Fallback (updates every minute)
        const interval = setInterval(runSimulation, 60000);
        return () => {
            clearInterval(interval);
            clearTimeout(weatherTimer);
        };
    }, [usingLiveWeather]);


    // --- Traffic Cycle Logic ---
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const runCycle = () => {
            setIsTrafficStopped(prevState => {
                // If currently stopped, switch to GO (false) for longer duration
                // If currently going, switch to STOP (true) for shorter duration
                const nextState = !prevState;
                // GO duration: 12s, STOP duration: 5s
                const duration = nextState ? 5000 : 12000;

                timeoutId = setTimeout(runCycle, duration);
                return nextState;
            });
        };

        // Initial start
        timeoutId = setTimeout(runCycle, 10000); // Start the first stop after 10s

        return () => clearTimeout(timeoutId);
    }, []);

    const handleLandmarkClick = (name: string) => {
        setSelectedLandmark(name);
        setDescription(landmarkData[name] || "Description not available.");
    };

    const closeModal = () => {
        setSelectedLandmark(null);
        setDescription("");
    };

    // Dynamic Background Gradient
    const bgGradient = isNight
        ? "bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]"
        : "bg-gradient-to-b from-[#4ca1af] to-[#E0F6FF]";

    // Dynamic Landmark Lighting (Dim them slightly at night)
    const landmarkBrightness = isNight ? "brightness-75 contrast-125" : "";

    return (
        <div className={`h-full w-full relative overflow-hidden ${bgGradient} font-sans transition-colors duration-1000 ease-in-out`}>

            {/* --- Sky Layer (Z-0) --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {isNight ? (
                    <>
                        <Stars />
                        <Moon />
                    </>
                ) : (
                    <Sun />
                )}

                {/* Clouds - Less opaque at night */}
                <Cloud className={`top-16 left-[10%] cloud-anim-1 ${isNight ? 'opacity-10' : 'opacity-80'}`} scale="scale-150" />
                <Cloud className={`top-32 left-[60%] cloud-anim-2 ${isNight ? 'opacity-10' : 'opacity-80'}`} scale="scale-100" />
                <Cloud className={`top-8 right-[10%] cloud-anim-1 delay-700 ${isNight ? 'opacity-5' : 'opacity-60'}`} scale="scale-75" />

                <Airplane />
            </div>

            {/* --- Far Background Layer (Skyline & Far Landmarks) (Z-5) --- */}
            <div className={`absolute bottom-32 w-full h-64 md:h-96 z-0 flex items-end justify-center pointer-events-none ${isNight ? 'opacity-60' : 'opacity-80'}`}>
                <Skyline isNight={isNight} />
                <div className={`absolute bottom-0 transform scale-75 origin-bottom ${isNight ? 'brightness-75' : 'opacity-60'}`}>
                    <NationalMemorial onClick={() => handleLandmarkClick("National Martyrs' Memorial")} className="pointer-events-auto" />
                </div>
            </div>

            {/* --- Mid-Ground: Metro Infrastructure (Z-10) --- */}
            <div className={`absolute bottom-24 w-full h-[50vh] z-10 pointer-events-none ${isNight ? 'brightness-75' : ''}`}>
                <MetroTrack />
                <MetroTrain isNight={isNight} />
            </div>

            {/* --- Main Landmark Layer (Foreground) (Z-20) --- */}
            <div className="absolute bottom-40 w-full z-20 px-4">
                <div className={`w-full max-w-[1600px] mx-auto flex items-end justify-between md:space-x-4 ${landmarkBrightness} transition-all duration-1000`}>

                    {/* Left Group */}
                    <div className="flex items-end -space-x-4 md:space-x-4">
                        <div className="transform scale-90 md:scale-100 hover:-translate-y-2 transition-transform duration-500 origin-bottom">
                            <LalbaghFort onClick={() => handleLandmarkClick("Lalbagh Fort")} />
                        </div>
                        <div className="transform scale-90 md:scale-100 z-10 hover:-translate-y-2 transition-transform duration-500 origin-bottom">
                            <AhsanManzil onClick={() => handleLandmarkClick("Ahsan Manzil")} />
                        </div>
                    </div>

                    {/* Center Group */}
                    <div className="flex items-end space-x-2">
                        <div className="mb-4 transform hover:-translate-y-2 transition-transform duration-500">
                            <ShaheedMinar onClick={() => handleLandmarkClick("Shaheed Minar")} />
                        </div>
                    </div>

                    {/* Right Group */}
                    <div className="flex items-end -space-x-4 md:space-x-4">
                        <div className="transform scale-90 md:scale-100 z-10 hover:-translate-y-2 transition-transform duration-500 origin-bottom">
                            <CurzonHall onClick={() => handleLandmarkClick("Curzon Hall")} />
                        </div>
                        <div className="transform scale-110 origin-bottom hover:-translate-y-2 transition-transform duration-500">
                            <SangsadBhaban onClick={() => handleLandmarkClick("Jatiya Sangsad Bhaban")} />
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Ground Layer (Road Surface) (Z-30) --- */}
            {/* Darker road at night */}
            <div className={`absolute bottom-16 w-full h-24 bg-[#3a3a3a] border-t-[6px] border-[#5a5a5a] z-30 flex items-center overflow-hidden shadow-[0_-5px_15px_rgba(0,0,0,0.3)] ${isNight ? 'brightness-75' : ''}`}>
                {/* Asphalt Texture */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:12px_12px]"></div>
                {/* Road Markings */}
                <div className="absolute top-1/2 left-0 w-full h-0 border-t-2 border-dashed border-yellow-400 opacity-60"></div>
            </div>

            {/* --- Ground Layer (Traffic) (Z-35) --- */}
            <div className="absolute bottom-16 w-full h-24 z-[35] pointer-events-none">
                <CityBus isNight={isNight} isStopped={isTrafficStopped} />
                <TrafficPolice isNight={isNight} isStopped={isTrafficStopped} />
            </div>



            {/* --- River Layer (Surface) (Z-40) --- */}
            <RiverWaves isNight={isNight} />

            {/* --- River Layer (Traffic) (Z-45) --- */}
            <div className="absolute bottom-0 w-full h-16 z-[45] pointer-events-none">
                <RiverBoat isNight={isNight} />
            </div>

            {/* --- Weather Layers (Foreground) (Z-60) --- */}
            {weather === 'rain' && <Rain />}
            {weather === 'fog' && <Fog />}

            {/* --- Info Modal (Z-50) --- */}
            {selectedLandmark && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-stone-100">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles size={20} className="text-yellow-300 animate-pulse" />
                                {selectedLandmark}
                            </h2>
                            <button onClick={closeModal} className="hover:bg-white/20 p-1 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="prose prose-stone">
                                <p className="text-lg leading-relaxed text-stone-700 font-light">
                                    {description}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* --- Location Indicator (Bottom Right) --- */}
            {!hideIndicator && (
            </div>
            )}
            
            <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
              <div className="pointer-events-auto bg-white/10 backdrop-blur-sm rounded-xl p-1">
                <AdSenseAd adSlot="auto" className="w-full max-w-sm" />
              </div>
            </div>
        </div>
    );
};

export default React.memo(DhakaAlive);
