import React from 'react';

// This is a placeholder file to document the renderBusDetails function structure
// The actual function should be inserted into App.tsx between renderServerError and renderHomeContent

const renderBusDetails = () => {
    if (!selectedBus) return null;

    const generalFareInfo = calculateFare(selectedBus);

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden w-full">
            {/* Mobile Header */}
            <div className="md:hidden bg-white px-5 py-4 shadow-sm border-b border-kj-line fixed top-[65px] w-full z-40 flex items-center justify-between">
                <button onClick={() => setView(AppView.HOME)} className="p-2 -ml-2 hover:bg-kj-chip-bg rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-kj-text-dim" />
                </button>
                <div className="flex-1 ml-3">
                    <h2 className="text-lg font-bold text-kj-text">{selectedBus.name}</h2>
                    <p className="text-xs text-kj-text-dim">{selectedBus.bnName}</p>
                </div>
                <button
                    onClick={(e) => toggleFavorite(e, selectedBus.id)}
                    className="p-2 hover:bg-kj-chip-bg rounded-full transition-colors"
                >
                    <Heart className={`w-5 h-5 ${favorites.includes(selectedBus.id) ? 'fill-red-500 text-red-500' : 'text-kj-text-faint'}`} />
                </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center gap-3 p-4 border-b border-kj-line bg-white z-20 shrink-0">
                <button onClick={() => setView(AppView.HOME)} className="p-2 -ml-2 hover:bg-kj-chip-bg rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-kj-text-dim" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-kj-text">{selectedBus.name}</h2>
                    <p className="text-xs text-kj-text-dim">{selectedBus.bnName}</p>
                </div>
                <button
                    onClick={(e) => toggleFavorite(e, selectedBus.id)}
                    className="p-2 hover:bg-kj-chip-bg rounded-full transition-colors"
                >
                    <Heart className={`w-5 h-5 ${favorites.includes(selectedBus.id) ? 'fill-red-500 text-red-500' : 'text-kj-text-faint'}`} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-[130px] md:pt-4 pb-24 md:pb-4">
                {/* Trip Plan (if selected from suggestions) */}
                {selectedTrip && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <h3 className="font-bold text-blue-900 text-sm uppercase tracking-wider">Your Trip Plan</h3>
                        <div className="space-y-3">
                            {selectedTrip.steps.map((step, idx) => (
                                <div key={idx} className={`flex gap-3 ${step.type === 'bus' && step.busRoute?.id === selectedBus.id ? 'opacity-100' : 'opacity-70'}`}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                                    ${step.type === 'walk' ? 'bg-gray-200 text-kj-text-dim' :
                                                step.type === 'metro' ? 'bg-blue-200 text-blue-700' :
                                                    'bg-green-200 text-green-700'
                                            }
                                  `}>
                                            {idx + 1}
                                        </div>
                                        {idx < selectedTrip.steps.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-sm font-semibold text-kj-text">{step.instruction}</p>
                                        {step.type === 'bus' && step.busRoute?.id === selectedBus.id && (
                                            <span className="inline-block mt-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Current Step</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Type */}
                    <div className="bg-white p-3 rounded-2xl border border-kj-line shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center text-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                            <Info className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-kj-text-faint uppercase font-bold tracking-wider">Type</span>
                        <span className="font-bold text-kj-text text-sm mt-0.5">{selectedBus.type}</span>
                    </div>

                    {/* Stops */}
                    <div className="bg-white p-3 rounded-2xl border border-kj-line shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center text-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-2">
                            <Bus className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-kj-text-faint uppercase font-bold tracking-wider">Stops</span>
                        <span className="font-bold text-kj-text text-sm mt-0.5">
                            {fareStart && fareEnd ? (
                                Math.abs(selectedBus.stops.indexOf(fareEnd) - selectedBus.stops.indexOf(fareStart)) + 1
                            ) : (
                                selectedBus.stops.length
                            )}
                        </span>
                    </div>

                    {/* Fare */}
                    <div className="bg-white p-3 rounded-2xl border border-kj-line shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center text-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                            <Coins className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-kj-text-faint uppercase font-bold tracking-wider">{fareStart && fareEnd ? 'Fare' : 'Max Fare'}</span>
                        <span className="font-bold text-kj-text text-sm mt-0.5">
                            {fareStart && fareEnd && fareInfo ? (
                                `৳${fareInfo.min}${fareInfo.max !== fareInfo.min ? ` - ${fareInfo.max}` : ''}`
                            ) : (
                                `~৳${generalFareInfo.max}`
                            )}
                        </span>
                    </div>
                </div>

                {/* Additional Stats when fare is selected */}
                {fareStart && fareEnd && (
                    <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-white p-3 rounded-2xl border border-kj-line shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center text-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                                <Gauge className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-kj-text-faint uppercase font-bold tracking-wider">{userLocation ? 'Speed' : 'Stops'}</span>
                            <span className="font-bold text-kj-text text-sm mt-0.5">
                                {userLocation ? (
                                    `${(speed || 0).toFixed(0)} km/h`
                                ) : (
                                    Math.abs(selectedBus.stops.indexOf(fareEnd) - selectedBus.stops.indexOf(fareStart)) + 1
                                )}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-kj-line shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center text-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                                <Flag className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-kj-text-faint uppercase font-bold tracking-wider">Distance</span>
                            <span className="font-bold text-kj-text text-sm mt-0.5">
                                {fareInfo ? `${fareInfo.distance.toFixed(1)} km` : '-- km'}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-kj-line shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center text-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-kj-text-faint uppercase font-bold tracking-wider">ETA</span>
                            <span className="font-bold text-kj-text text-sm mt-0.5">
                                {fareInfo ? formatETA((fareInfo.distance / 15) * 60) : '--'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Map Visualizer */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-kj-line overflow-hidden w-full">
                    <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="font-bold text-kj-text-dim text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Live View
                        </h3>
                        <span className="text-[10px] bg-white border border-kj-line px-2 py-0.5 rounded text-kj-text-dim font-medium hidden md:block">Click & Drag to pan</span>
                        <span className="text-[10px] bg-white border border-kj-line px-2 py-0.5 rounded text-kj-text-dim font-medium md:hidden">Scroll to pan</span>
                    </div>
                    <div className="w-full">
                        <MapVisualizer
                            route={selectedBus}
                            userStationIndex={nearestStopIndex}
                            userDistance={nearestStopDistance}
                            highlightStartIdx={fareStartIndex}
                            highlightEndIdx={fareEndIndex}
                            isReversed={isReversed}
                            userLocation={userLocation}
                        />
                    </div>
                </div>

                {/* Fare Calculator */}
                <div className="bg-white p-4 rounded-2xl border border-kj-line shadow-sm">
                    <h3 className="font-bold text-kj-text mb-3 flex items-center gap-2 text-sm">
                        <Coins className="w-4 h-4 text-yellow-500" /> Stop-to-Stop Fare
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-[10px] font-bold text-kj-text-faint uppercase mb-1 block">From</label>
                            <select
                                className="w-full bg-gray-50 border border-kj-line rounded-lg p-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-dhaka-green/20"
                                value={fareStart}
                                onChange={e => setFareStart(e.target.value)}
                            >
                                <option value="">Select...</option>
                                {selectedBus.stops.map(id => {
                                    const s = STATIONS[id];
                                    return s ? <option key={id} value={id}>{s.name}</option> : null;
                                })}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-kj-text-faint uppercase mb-1 block">To</label>
                            <select
                                className="w-full bg-gray-50 border border-kj-line rounded-lg p-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-dhaka-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                value={fareEnd}
                                onChange={e => setFareEnd(e.target.value)}
                                disabled={!fareStart}
                            >
                                <option value="">{fareStart ? 'Select...' : 'Select From first'}</option>
                                {selectedBus.stops.map(id => {
                                    const s = STATIONS[id];
                                    return s ? <option key={id} value={id}>{s.name}</option> : null;
                                })}
                            </select>
                        </div>
                    </div>
                    {fareInfo ? (
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                            <div>
                                <p className="text-[10px] text-green-600 font-bold uppercase">Estimated Cost</p>
                                <p className="text-xs text-green-600">Distance: {fareInfo.distance.toFixed(1)} km</p>
                            </div>
                            <span className="text-xl font-bold text-green-800">৳{fareInfo.min} - {fareInfo.max}</span>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-3 rounded-xl border border-kj-line text-center">
                            <p className="text-xs text-kj-text-faint">Select start and end stops to calculate fare</p>
                        </div>
                    )}
                </div>

                {/* Full Route List */}
                <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-kj-line overflow-hidden">
                    <h3 className="font-bold text-kj-text-dim px-4 py-3 border-b border-kj-line bg-gray-50/30 text-sm">Full Route List</h3>
                    <div className="relative">
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100"></div>
                        <div className="space-y-0">
                            {selectedBus.stops.map((stopId, idx) => {
                                const station = STATIONS[stopId];
                                if (!station) return null;

                                const isHighlighted = fareStart && fareEnd &&
                                    selectedBus.stops.indexOf(fareStart) <= idx &&
                                    selectedBus.stops.indexOf(fareEnd) >= idx &&
                                    selectedBus.stops.indexOf(fareStart) !== -1;

                                const isLast = idx === selectedBus.stops.length - 1;
                                const isFirst = idx === 0;

                                const validStopIds = selectedBus.stops.filter(id => !!STATIONS[id]);
                                const filteredIdx = validStopIds.indexOf(stopId);
                                const isNearest = nearestStopIndex !== -1 && nearestStopIndex === filteredIdx;

                                const isWithinRange = nearestStopDistance < 2000;

                                return (
                                    <div key={stopId} className={`px-4 py-3.5 hover:bg-kj-chip-bg flex items-center gap-4 relative z-10 group border-b border-gray-50 last:border-0 transition-colors 
                    ${isNearest && isWithinRange ? 'bg-blue-50/50' : ''}
                    ${isHighlighted ? 'bg-green-50 border-l-4 border-l-green-500 -ml-[1px]' : ''}
                  `}>
                                        <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center shrink-0 transition-all
                      ${isNearest && isWithinRange
                                                ? 'bg-kj-accent w-6 h-6 ring-2 ring-red-100 animate-pulse'
                                                : isHighlighted
                                                    ? 'bg-kj-primary w-5 h-5 ring-2 ring-green-100 scale-110'
                                                    : isFirst
                                                        ? 'bg-green-600 w-5 h-5 ring-2 ring-green-100'
                                                        : isLast
                                                            ? 'bg-red-500 w-5 h-5 ring-2 ring-red-100'
                                                            : isNearest
                                                                ? 'bg-orange-400 w-5 h-5'
                                                                : 'bg-gray-300'
                                            }
                    `}>
                                            {(isFirst || isLast) && !isNearest && !isHighlighted && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                            {isNearest && isWithinRange && <MapPin className="w-3 h-3 text-white" />}
                                            {isHighlighted && !isNearest && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm group-hover:text-kj-primary transition-colors ${isFirst || isLast || isNearest || isHighlighted ? 'font-bold text-kj-text' : 'font-medium text-kj-text-dim'} ${isNearest && isWithinRange && idx < (nearestStopIndex !== -1 ? selectedBus.stops.indexOf(validStopIds[nearestStopIndex]) : -1) ? 'text-kj-text-faint line-through decoration-gray-300' : ''}`}>
                                                {station.name}
                                                {isNearest && isWithinRange && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">You</span>}
                                                {isNearest && !isWithinRange && <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">is {(nearestStopDistance / 1000).toFixed(1)}km away from {globalNearestStationName || 'location'}</span>}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky CTA */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-4 border-t border-kj-line pb-safe z-30">
                <button
                    onClick={() => setView(AppView.LIVE_NAV)}
                    className="w-full bg-gradient-to-r from-dhaka-green to-[#005c44] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Navigation className="w-5 h-5" />
                    Start Live Navigation
                </button>
            </div>
        </div>
    );
};

export default renderBusDetails;
