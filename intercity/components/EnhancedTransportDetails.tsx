import React, { useState } from 'react';
import { Bus, Train, Plane, Car, Clock, MapPin, Phone, DollarSign, Calendar, Info, ExternalLink, Navigation, Fuel, Coins } from 'lucide-react';
import { BusOption, TrainOption, FlightOption, DrivingInfo, TravelTips } from '../types';

interface EnhancedDetailsProps {
    enhancedData: {
        bus?: BusOption;
        train?: TrainOption;
        flight?: FlightOption;
        driving?: DrivingInfo;
    };
    tips?: TravelTips;
}

// Bus Renderer
export const BusDetailsCard: React.FC<{ bus: BusOption }> = ({ bus }) => {
    return (
        <div className="transport-card bus-card space-y-4 bg-kj-panel dark:border-emerald-600">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800 pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-kj-primary-soft rounded-xl flex items-center justify-center">
                        <Bus className="w-6 h-6 text-kj-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-kj-text text-lg">{bus.operator}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-kj-primary-soft text-emerald-700 rounded-md text-xs font-medium border border-kj-primary/30">
                            {bus.type}
                        </span>
                    </div>
                </div>
            </div>

            {/* Schedule */}
            <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                    <label className="block text-xs text-kj-text-dim mb-1 uppercase tracking-wide">Departure</label>
                    <div className="font-bold text-kj-text text-xl">{bus.departure}</div>
                    <small className="text-xs text-kj-text-dim mt-1 block">{bus.boarding}</small>
                </div>
                <div className="flex items-center px-4 text-kj-text-faint">
                    <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium text-kj-text-dim">{bus.duration}</span>
                    </div>
                </div>
                <div className="flex-1 text-center">
                    <label className="block text-xs text-kj-text-dim mb-1 uppercase tracking-wide">Arrival</label>
                    <div className="font-bold text-kj-text text-xl">{bus.arrival}</div>
                    <small className="text-xs text-kj-text-dim mt-1 block">{bus.dropping}</small>
                </div>
            </div>

            {/* Price & Booking */}
            <div className="flex items-center justify-between pt-3 border-t border-kj-line">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-kj-primary" />
                    <span className="text-2xl font-bold text-kj-primary">৳{bus.price}</span>
                </div>
                {bus.booking_url && (
                    <a
                        href={bus.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-95"
                    >
                        Book Now
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>

            {/* Contact */}
            {bus.contact && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-kj-line dark:border-gray-600">
                    <Phone className="w-4 h-4 text-kj-text-dim" />
                    <a href={`tel:${bus.contact}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {bus.contact}
                    </a>
                </div>
            )}
        </div>
    );
};

// Train Renderer
export const TrainDetailsCard: React.FC<{ train: TrainOption }> = ({ train }) => {
    return (
        <div className="transport-card train-card space-y-4 bg-kj-panel dark:border-orange-600">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Train className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-kj-text text-lg">{train.name}</h3>
                        <span className="text-sm text-kj-text-dim">Train No. {train.number}</span>
                    </div>
                </div>
                {train.off_day !== 'None' && (
                    <div className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-md border border-red-200">
                        Off: {train.off_day}
                    </div>
                )}
            </div>

            {/* Schedule */}
            <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                    <label className="block text-xs text-kj-text-dim mb-1 uppercase tracking-wide">Departure</label>
                    <div className="font-bold text-kj-text text-xl">{train.departure}</div>
                </div>
                <div className="flex items-center px-4 text-kj-text-faint">
                    <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium text-kj-text-dim">{train.duration}</span>
                    </div>
                </div>
                <div className="flex-1 text-center">
                    <label className="block text-xs text-kj-text-dim mb-1 uppercase tracking-wide">Arrival</label>
                    <div className="font-bold text-kj-text text-xl">{train.arrival}</div>
                </div>
            </div>

            {/* Route */}
            <div className="flex items-start gap-2 p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                <Navigation className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-kj-text-dim">{train.route_via}</span>
            </div>

            {/* Classes & Pricing */}
            <div>
                <label className="block text-xs text-kj-text-dim mb-2 uppercase tracking-wide font-medium">Available Classes</label>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(train.classes).map(([className, price]) => (
                        <div key={className} className="flex items-center justify-between p-3 bg-white rounded-lg border border-kj-line hover:border-orange-300 transition-colors">
                            <span className="text-sm font-medium text-kj-text-dim">{className.replace('_', ' ')}</span>
                            <span className="text-sm font-bold text-orange-600">৳{price}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Info */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-kj-line">
                <Phone className="w-4 h-4 text-kj-text-dim mt-0.5" />
                <div className="text-sm">
                    <span className="block text-kj-text-dim text-xs mb-1">Book via:</span>
                    <span className="font-medium text-kj-text-dim">{train.booking}</span>
                </div>
            </div>
        </div>
    );
};

// Flight Renderer
export const FlightDetailsCard: React.FC<{ flight: FlightOption }> = ({ flight }) => {
    return (
        <div className="transport-card flight-card space-y-4 bg-kj-panel dark:border-blue-600">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-kj-text text-lg">{flight.airline}</h3>
                        <span className="text-sm text-kj-text-dim">{flight.flight_no}</span>
                    </div>
                </div>
            </div>

            {/* Flight Route */}
            <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                    <label className="block text-xs text-kj-text-dim mb-1 uppercase tracking-wide">From</label>
                    <div className="font-bold text-kj-text text-2xl">{flight.from_airport}</div>
                    <div className="text-sm text-kj-text-dim mt-1">{flight.departure}</div>
                </div>
                <div className="flex items-center px-4 text-kj-text-faint">
                    <div className="flex flex-col items-center">
                        <Plane className="w-5 h-5 mb-1 text-blue-500 transform rotate-90" />
                        <span className="text-xs font-medium text-kj-text-dim">{flight.total_time}</span>
                    </div>
                </div>
                <div className="flex-1 text-center">
                    <label className="block text-xs text-kj-text-dim mb-1 uppercase tracking-wide">To</label>
                    <div className="font-bold text-kj-text text-2xl">{flight.to_airport}</div>
                    <div className="text-sm text-kj-text-dim mt-1">{flight.arrival}</div>
                </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-center pt-3 border-t border-kj-line">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="text-3xl font-bold text-blue-600">৳{flight.price}</span>
                </div>
            </div>

            {/* Ground Transfer */}
            {flight.ground_transfer && flight.ground_transfer !== 'N/A' && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                        <span className="block text-blue-600 font-medium mb-1">Ground Transfer</span>
                        <span className="text-kj-text-dim">{flight.ground_transfer}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Driving Renderer
export const DrivingDetailsCard: React.FC<{ driving: DrivingInfo }> = ({ driving }) => {
    const totalCost = (driving.fuel_cost || 0) + (driving.toll || 0);

    return (
        <div className="transport-card driving-card space-y-4 bg-kj-panel dark:border-gray-600">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-kj-line pb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-kj-text-dim" />
                </div>
                <div>
                    <h3 className="font-bold text-kj-text text-lg">🚗 Drive Yourself</h3>
                    <span className="text-sm text-kj-text-dim">Personal Vehicle</span>
                </div>
            </div>

            {/* Route Info */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-kj-line">
                    <label className="block text-xs text-kj-text-dim mb-1 uppercase tracking-wide">Distance</label>
                    <div className="font-bold text-kj-text text-lg">{driving.distance_km} km</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-kj-line">
                    <label className="block text-xs text-kj-text-dim mb-1 uppercase tracking-wide">Duration</label>
                    <div className="font-bold text-kj-text text-lg">{driving.duration}</div>
                </div>
            </div>

            {/* Route Path */}
            <div className="p-3 bg-gray-50 rounded-lg border border-kj-line">
                <label className="block text-xs text-kj-text-dim mb-2 uppercase tracking-wide">Route</label>
                <p className="text-sm text-kj-text-dim font-medium">{driving.route}</p>
            </div>

            {/* Costs Breakdown */}
            <div className="space-y-2">
                <label className="block text-xs text-kj-text-dim uppercase tracking-wide font-medium">Cost Breakdown</label>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-kj-line">
                        <div className="flex items-center gap-2">
                            <Fuel className="w-4 h-4 text-kj-text-dim" />
                            <span className="text-sm text-kj-text-dim">Fuel Cost</span>
                        </div>
                        <span className="text-sm font-bold text-kj-text">৳{driving.fuel_cost}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-kj-line">
                        <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-kj-text-dim" />
                            <span className="text-sm text-kj-text-dim">Toll</span>
                        </div>
                        <span className="text-sm font-bold text-kj-text">৳{driving.toll}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg border-2 border-kj-line">
                        <span className="text-sm font-bold text-kj-text-dim uppercase">Total Cost</span>
                        <span className="text-xl font-bold text-kj-text">৳{totalCost}</span>
                    </div>
                </div>
            </div>

            {/* Alternative Route */}
            {driving.alternative_route && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="block text-xs text-blue-600 mb-1 uppercase tracking-wide font-medium">Alternative Route</label>
                    <p className="text-sm text-blue-900">{driving.alternative_route}</p>
                </div>
            )}
        </div>
    );
};

// Tips Renderer
export const TipsSection: React.FC<{ tips: TravelTips }> = ({ tips }) => {
    return (
        <div className="mt-6 p-5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-purple-200" />
                <h3 className="text-lg font-bold text-white">💡 Travel Tips</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {tips.best_option && (
                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <label className="block text-xs text-purple-200 mb-1 uppercase tracking-wide">Best Option</label>
                        <span className="text-white font-semibold">{tips.best_option}</span>
                    </div>
                )}
                {tips.cheapest && (
                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <label className="block text-xs text-purple-200 mb-1 uppercase tracking-wide">Cheapest</label>
                        <span className="text-white font-semibold">{tips.cheapest}</span>
                    </div>
                )}
                {tips.peak_times && (
                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 md:col-span-2">
                        <label className="block text-xs text-purple-200 mb-1 uppercase tracking-wide">Peak Times</label>
                        <span className="text-white font-semibold">{tips.peak_times}</span>
                    </div>
                )}
            </div>

            {tips.booking_sites && tips.booking_sites.length > 0 && (
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <label className="block text-xs text-purple-200 mb-2 uppercase tracking-wide">Book Online</label>
                    <div className="flex flex-wrap gap-2">
                        {tips.booking_sites.map((site, index) => (
                            <a
                                key={index}
                                href={`https://${site}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors border border-white/30"
                            >
                                {site}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Enhanced Details Component
export const EnhancedTransportDetails: React.FC<EnhancedDetailsProps> = ({ enhancedData, tips }) => {
    const { bus, train, flight, driving } = enhancedData;

    return (
        <div className="space-y-4">
            {bus && <BusDetailsCard bus={bus} />}
            {train && <TrainDetailsCard train={train} />}
            {flight && <FlightDetailsCard flight={flight} />}
            {driving && <DrivingDetailsCard driving={driving} />}
            {tips && <TipsSection tips={tips} />}
        </div>
    );
};

// CSS Styles (to be added to global styles or component)
export const enhancedTransportStyles = `
.transport-card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.dark .transport-card {
  background: rgb(30 41 59);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.transport-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.bus-card {
  border-left: 4px solid #10b981;
}

.train-card {
  border-left: 4px solid #f97316;
}

.flight-card {
  border-left: 4px solid #3b82f6;
}

.driving-card {
  border-left: 4px solid #6b7280;
}
`;
