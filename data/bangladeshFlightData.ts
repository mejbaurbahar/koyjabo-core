export interface DomesticRoute {
  id: string;
  from: string;
  to: string;
  airline: string;
  flightNo: string;
  dep: string;
  arr: string;
  dur: string;
  daysOp: string;
  fareEco: number;
  fareBiz?: number;
  aircraft: string;
}

export const AIRPORTS_DATA = [
  { iata: 'DAC', en: 'Dhaka (Shahjalal)', bn: 'ঢাকা (শাহজালাল)', city: 'Dhaka', lat: 23.8434, lng: 90.4029 },
  { iata: 'CGP', en: 'Chittagong (Shah Amanat)', bn: 'চট্টগ্রাম (শাহ আমানত)', city: 'Chittagong', lat: 22.2496, lng: 91.8133 },
  { iata: 'CXB', en: "Cox's Bazar", bn: 'কক্সবাজার', city: "Cox's Bazar", lat: 21.4522, lng: 91.9639 },
  { iata: 'ZYL', en: 'Sylhet (Osmani)', bn: 'সিলেট (ওসমানী)', city: 'Sylhet', lat: 24.9591, lng: 91.8670 },
  { iata: 'JSR', en: 'Jessore', bn: 'যশোর', city: 'Jessore', lat: 23.1838, lng: 89.1608 },
  { iata: 'SPD', en: 'Saidpur', bn: 'সৈয়দপুর', city: 'Saidpur', lat: 25.7592, lng: 88.9088 },
  { iata: 'BZL', en: 'Barisal', bn: 'বরিশাল', city: 'Barisal', lat: 22.8010, lng: 90.3012 },
  { iata: 'RJH', en: 'Rajshahi', bn: 'রাজশাহী', city: 'Rajshahi', lat: 24.4371, lng: 88.6161 },
];

export const DOMESTIC_ROUTES: DomesticRoute[] = [
  {
    id: 'bg601',
    from: 'DAC', to: 'CGP',
    airline: 'BG', flightNo: 'BG601',
    dep: '07:15', arr: '08:15', dur: '1h 0m',
    daysOp: 'Daily', fareEco: 4499, fareBiz: 9500,
    aircraft: 'Boeing 737',
  },
  {
    id: 'bs141',
    from: 'DAC', to: 'CGP',
    airline: 'BS', flightNo: 'BS141',
    dep: '09:40', arr: '10:40', dur: '1h 0m',
    daysOp: 'Daily', fareEco: 4199,
    aircraft: 'ATR 72',
  },
  {
    id: 'vq101',
    from: 'DAC', to: 'CGP',
    airline: 'VQ', flightNo: 'VQ101',
    dep: '12:20', arr: '13:20', dur: '1h 0m',
    daysOp: 'Daily', fareEco: 4650,
    aircraft: 'ATR 72',
  },
  {
    id: '2a201',
    from: 'DAC', to: 'CGP',
    airline: '2A', flightNo: '2A201',
    dep: '16:05', arr: '17:05', dur: '1h 0m',
    daysOp: 'Daily', fareEco: 3990,
    aircraft: 'ATR 72',
  },
  {
    id: 'bg605',
    from: 'DAC', to: 'CGP',
    airline: 'BG', flightNo: 'BG605',
    dep: '19:00', arr: '20:00', dur: '1h 0m',
    daysOp: 'Daily', fareEco: 4799, fareBiz: 9800,
    aircraft: 'Dash 8',
  },
  {
    id: 'bg611',
    from: 'DAC', to: 'CXB',
    airline: 'BG', flightNo: 'BG611',
    dep: '08:00', arr: '09:05', dur: '1h 5m',
    daysOp: 'Daily', fareEco: 4999, fareBiz: 10500,
    aircraft: 'Boeing 737',
  },
  {
    id: 'bs151',
    from: 'DAC', to: 'CXB',
    airline: 'BS', flightNo: 'BS151',
    dep: '10:45', arr: '11:50', dur: '1h 5m',
    daysOp: 'Daily', fareEco: 4599,
    aircraft: 'ATR 72',
  },
  {
    id: 'vq111',
    from: 'DAC', to: 'CXB',
    airline: 'VQ', flightNo: 'VQ111',
    dep: '14:30', arr: '15:35', dur: '1h 5m',
    daysOp: 'Daily', fareEco: 4799,
    aircraft: 'ATR 72',
  },
  {
    id: '2a211',
    from: 'DAC', to: 'CXB',
    airline: '2A', flightNo: '2A211',
    dep: '17:00', arr: '18:05', dur: '1h 5m',
    daysOp: 'Daily', fareEco: 4299,
    aircraft: 'ATR 72',
  },
  {
    id: 'bg613',
    from: 'DAC', to: 'CXB',
    airline: 'BG', flightNo: 'BG613',
    dep: '20:00', arr: '21:05', dur: '1h 5m',
    daysOp: 'Daily', fareEco: 5199, fareBiz: 11000,
    aircraft: 'Boeing 737',
  },
  {
    id: 'bg621',
    from: 'DAC', to: 'ZYL',
    airline: 'BG', flightNo: 'BG621',
    dep: '09:00', arr: '09:50', dur: '0h 50m',
    daysOp: 'Daily', fareEco: 3999, fareBiz: 8500,
    aircraft: 'Dash 8',
  },
  {
    id: 'bs161',
    from: 'DAC', to: 'ZYL',
    airline: 'BS', flightNo: 'BS161',
    dep: '11:30', arr: '12:20', dur: '0h 50m',
    daysOp: 'Daily', fareEco: 3799,
    aircraft: 'ATR 72',
  },
  {
    id: 'vq121',
    from: 'DAC', to: 'ZYL',
    airline: 'VQ', flightNo: 'VQ121',
    dep: '15:00', arr: '15:50', dur: '0h 50m',
    daysOp: 'Daily', fareEco: 4100,
    aircraft: 'ATR 72',
  },
  {
    id: 'bg623',
    from: 'DAC', to: 'ZYL',
    airline: 'BG', flightNo: 'BG623',
    dep: '18:30', arr: '19:20', dur: '0h 50m',
    daysOp: 'Daily', fareEco: 4199, fareBiz: 9000,
    aircraft: 'Dash 8',
  },
  {
    id: 'bg631',
    from: 'DAC', to: 'JSR',
    airline: 'BG', flightNo: 'BG631',
    dep: '08:30', arr: '09:20', dur: '0h 50m',
    daysOp: 'Daily', fareEco: 3799, fareBiz: 8000,
    aircraft: 'Dash 8',
  },
  {
    id: 'bs171',
    from: 'DAC', to: 'JSR',
    airline: 'BS', flightNo: 'BS171',
    dep: '13:00', arr: '13:50', dur: '0h 50m',
    daysOp: 'Daily', fareEco: 3599,
    aircraft: 'ATR 72',
  },
  {
    id: 'bg641',
    from: 'DAC', to: 'SPD',
    airline: 'BG', flightNo: 'BG641',
    dep: '09:30', arr: '10:30', dur: '1h 0m',
    daysOp: 'Daily', fareEco: 3999, fareBiz: 8500,
    aircraft: 'Dash 8',
  },
  {
    id: 'bs181',
    from: 'DAC', to: 'SPD',
    airline: 'BS', flightNo: 'BS181',
    dep: '14:00', arr: '15:00', dur: '1h 0m',
    daysOp: 'Daily', fareEco: 3799,
    aircraft: 'ATR 72',
  },
  {
    id: 'bg651',
    from: 'DAC', to: 'BZL',
    airline: 'BG', flightNo: 'BG651',
    dep: '10:00', arr: '10:50', dur: '0h 50m',
    daysOp: 'Daily', fareEco: 3599, fareBiz: 7500,
    aircraft: 'Dash 8',
  },
  {
    id: 'bs191',
    from: 'DAC', to: 'BZL',
    airline: 'BS', flightNo: 'BS191',
    dep: '14:30', arr: '15:20', dur: '0h 50m',
    daysOp: 'Daily', fareEco: 3399,
    aircraft: 'ATR 72',
  },
  {
    id: 'bg661',
    from: 'DAC', to: 'RJH',
    airline: 'BG', flightNo: 'BG661',
    dep: '11:00', arr: '11:55', dur: '0h 55m',
    daysOp: 'Daily', fareEco: 3799, fareBiz: 8000,
    aircraft: 'Dash 8',
  },
  {
    id: 'bs201',
    from: 'DAC', to: 'RJH',
    airline: 'BS', flightNo: 'BS201',
    dep: '15:30', arr: '16:25', dur: '0h 55m',
    daysOp: 'Daily', fareEco: 3599,
    aircraft: 'ATR 72',
  },
];
