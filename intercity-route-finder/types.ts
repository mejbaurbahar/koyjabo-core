export enum TransportMode {
  BUS = 'BUS', // Intercity Bus
  TRAIN = 'TRAIN',
  AIR = 'AIR',
  LOCAL_BUS = 'LOCAL_BUS',
  RICKSHAW = 'RICKSHAW',
  WALK = 'WALK',
  CNG = 'CNG',
  METRO_RAIL = 'METRO_RAIL',
  FERRY = 'FERRY'
}

export interface Schedule {
  operator: string;
  type: string; // e.g., "AC Scania", "Non-AC"
  departureTime: string;
  arrivalTime: string;
  price: string;
  counter: string;
  contactNumber?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WeatherInfo {
  temperature: string;
  condition: string; // "Sunny", "Rainy", "Cloudy"
  icon: 'SUN' | 'CLOUD' | 'RAIN' | 'WIND';
  advice: string; // "Pack an umbrella", "Wear sunglasses"
}

export interface RouteStep {
  mode: TransportMode;
  from: string;
  to: string;
  instruction: string;
  duration: string;
  distance?: string;
  cost?: string;
  startCoordinates?: Coordinates;
  endCoordinates?: Coordinates;
  details?: {
    busName?: string; // For Local Bus e.g., "Boishaki"
    busCounter?: string; // For Intercity
    counterPhone?: string;
    trainName?: string;
    flightName?: string;
    departureTime?: string;
    arrivalTime?: string;
    operator?: string;
    ticketType?: string;
    schedules?: Schedule[]; // List of available options for this leg
  };
}

export interface TravelOption {
  id: string;
  type: 'AIR' | 'BUS' | 'TRAIN' | 'FERRY';
  title: string;
  summary: string;
  totalDuration: string;
  totalCostRange: string;
  destinationWeather?: WeatherInfo; // New Weather Field
  steps: RouteStep[];
  recommended?: boolean;
}

export interface RoutingResponse {
  origin: string;
  destination: string;
  options: TravelOption[];
}

// ==================== NEW ENHANCED TYPES ====================

// Bus Details
export interface BusOption {
  operator: string;
  type: string; // "AC", "Non-AC"
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  boarding: string;
  dropping: string;
  contact: string;
  booking_url: string;
}

// Train Details
export interface TrainClasses {
  Shovon?: number;
  Shovon_Chair?: number;
  AC_Chair?: number;
  AC_Berth?: number;
  Snigdha?: number;
  [key: string]: number | undefined;
}

export interface TrainOption {
  name: string;
  number: string;
  departure: string;
  arrival: string;
  duration: string;
  route_via: string;
  classes: TrainClasses;
  off_day: string;
  booking: string;
}

// Flight Details
export interface FlightOption {
  airline: string;
  flight_no: string;
  departure: string;
  arrival: string;
  from_airport: string;
  to_airport: string;
  price: number;
  ground_transfer: string;
  total_time: string;
}

// Driving Info
export interface DrivingInfo {
  distance_km: number;
  duration: string;
  route: string;
  fuel_cost: number;
  toll: number;
  alternative_route?: string;
}

// Travel Tips
export interface TravelTips {
  best_option?: string;
  cheapest?: string;
  booking_sites?: string[];
  peak_times?: string;
}

// Enhanced Search Results
export interface EnhancedSearchResults {
  bus?: BusOption[];
  train?: TrainOption[];
  flight?: FlightOption[];
  driving?: DrivingInfo;
  tips?: TravelTips;
}

// Enhanced API Response
export interface EnhancedIntercityResponse {
  from: string;
  to: string;
  date: string;
  distance_km?: number;
  results: EnhancedSearchResults;
}

// Demo/Cache Response Type
export interface RouteResponse {
  from: string;
  to: string;
  date: string;
  source: string;
  result: string;
}

// Location District Map Type
export type DistrictMap = {
  [category: string]: string[];
};

export interface ErrorResponse {
  error?: string;
  message?: string;
  status?: number;
}