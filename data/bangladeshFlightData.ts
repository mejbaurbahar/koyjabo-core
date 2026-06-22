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

// Bangladesh: 8 domestic airports
export const AIRPORTS_DATA = [
  { iata: 'DAC', en: 'Dhaka (Shahjalal Intl)', bn: 'ঢাকা (শাহজালাল আন্তর্জাতিক)', city: 'Dhaka',      lat: 23.8434, lng: 90.4029 },
  { iata: 'CGP', en: 'Chittagong (Shah Amanat)', bn: 'চট্টগ্রাম (শাহ আমানত)',      city: 'Chittagong', lat: 22.2496, lng: 91.8133 },
  { iata: 'CXB', en: "Cox's Bazar",              bn: 'কক্সবাজার',                  city: "Cox's Bazar", lat: 21.4522, lng: 91.9639 },
  { iata: 'ZYL', en: 'Sylhet (Osmani Intl)',     bn: 'সিলেট (ওসমানী আন্তর্জাতিক)', city: 'Sylhet',     lat: 24.9591, lng: 91.8670 },
  { iata: 'JSR', en: 'Jashore',                  bn: 'যশোর',                       city: 'Jashore',    lat: 23.1838, lng: 89.1608 },
  { iata: 'SPD', en: 'Saidpur',                  bn: 'সৈয়দপুর',                   city: 'Saidpur',    lat: 25.7592, lng: 88.9088 },
  { iata: 'BZL', en: 'Barisal',                  bn: 'বরিশাল',                     city: 'Barisal',    lat: 22.8010, lng: 90.3012 },
  { iata: 'RJH', en: 'Rajshahi (Shah Makhdum)',  bn: 'রাজশাহী (শাহ মখদুম)',        city: 'Rajshahi',   lat: 24.4371, lng: 88.6161 },
];

// Airlines: BG=Biman, BS=US-Bangla, VQ=Novoair, 2A=Air Astra
export const DOMESTIC_ROUTES: DomesticRoute[] = [

  // ── DAC ↔ CGP (Dhaka ↔ Chittagong) ─────────────────────────────────────────
  { id:'bg601', from:'DAC', to:'CGP', airline:'BG', flightNo:'BG601', dep:'06:00', arr:'07:00', dur:'1h 0m', daysOp:'Daily', fareEco:4499, fareBiz:9500, aircraft:'Boeing 737-800' },
  { id:'bg603', from:'DAC', to:'CGP', airline:'BG', flightNo:'BG603', dep:'09:00', arr:'10:00', dur:'1h 0m', daysOp:'Daily', fareEco:4499, fareBiz:9500, aircraft:'Boeing 737-800' },
  { id:'bg605', from:'DAC', to:'CGP', airline:'BG', flightNo:'BG605', dep:'13:00', arr:'14:00', dur:'1h 0m', daysOp:'Daily', fareEco:4799, fareBiz:9800, aircraft:'Dash 8-400' },
  { id:'bg607', from:'DAC', to:'CGP', airline:'BG', flightNo:'BG607', dep:'17:00', arr:'18:00', dur:'1h 0m', daysOp:'Daily', fareEco:4799, fareBiz:9800, aircraft:'Boeing 737-800' },
  { id:'bg609', from:'DAC', to:'CGP', airline:'BG', flightNo:'BG609', dep:'20:00', arr:'21:00', dur:'1h 0m', daysOp:'Daily', fareEco:4999, fareBiz:10200, aircraft:'Boeing 737-800' },
  { id:'bs141', from:'DAC', to:'CGP', airline:'BS', flightNo:'BS141', dep:'07:30', arr:'08:30', dur:'1h 0m', daysOp:'Daily', fareEco:3999, aircraft:'Boeing 737-800' },
  { id:'bs143', from:'DAC', to:'CGP', airline:'BS', flightNo:'BS143', dep:'10:30', arr:'11:30', dur:'1h 0m', daysOp:'Daily', fareEco:3999, aircraft:'ATR 72-600' },
  { id:'bs145', from:'DAC', to:'CGP', airline:'BS', flightNo:'BS145', dep:'14:30', arr:'15:30', dur:'1h 0m', daysOp:'Daily', fareEco:4199, aircraft:'Boeing 737-800' },
  { id:'bs147', from:'DAC', to:'CGP', airline:'BS', flightNo:'BS147', dep:'18:30', arr:'19:30', dur:'1h 0m', daysOp:'Daily', fareEco:4399, aircraft:'Boeing 737-800' },
  { id:'vq101', from:'DAC', to:'CGP', airline:'VQ', flightNo:'VQ101', dep:'08:00', arr:'09:00', dur:'1h 0m', daysOp:'Daily', fareEco:3799, aircraft:'ATR 72-600' },
  { id:'vq103', from:'DAC', to:'CGP', airline:'VQ', flightNo:'VQ103', dep:'12:20', arr:'13:20', dur:'1h 0m', daysOp:'Daily', fareEco:3799, aircraft:'ATR 72-600' },
  { id:'vq105', from:'DAC', to:'CGP', airline:'VQ', flightNo:'VQ105', dep:'16:00', arr:'17:00', dur:'1h 0m', daysOp:'Daily', fareEco:3999, aircraft:'ATR 72-600' },
  { id:'2a201', from:'DAC', to:'CGP', airline:'2A', flightNo:'2A201', dep:'09:30', arr:'10:30', dur:'1h 0m', daysOp:'Daily', fareEco:3599, aircraft:'ATR 72-600' },
  { id:'2a203', from:'DAC', to:'CGP', airline:'2A', flightNo:'2A203', dep:'16:05', arr:'17:05', dur:'1h 0m', daysOp:'Daily', fareEco:3599, aircraft:'ATR 72-600' },
  // Return CGP→DAC
  { id:'bg602', from:'CGP', to:'DAC', airline:'BG', flightNo:'BG602', dep:'07:30', arr:'08:30', dur:'1h 0m', daysOp:'Daily', fareEco:4499, fareBiz:9500, aircraft:'Boeing 737-800' },
  { id:'bg604', from:'CGP', to:'DAC', airline:'BG', flightNo:'BG604', dep:'10:30', arr:'11:30', dur:'1h 0m', daysOp:'Daily', fareEco:4499, fareBiz:9500, aircraft:'Boeing 737-800' },
  { id:'bg606', from:'CGP', to:'DAC', airline:'BG', flightNo:'BG606', dep:'14:30', arr:'15:30', dur:'1h 0m', daysOp:'Daily', fareEco:4799, fareBiz:9800, aircraft:'Dash 8-400' },
  { id:'bg608', from:'CGP', to:'DAC', airline:'BG', flightNo:'BG608', dep:'18:30', arr:'19:30', dur:'1h 0m', daysOp:'Daily', fareEco:4799, fareBiz:9800, aircraft:'Boeing 737-800' },
  { id:'bg610', from:'CGP', to:'DAC', airline:'BG', flightNo:'BG610', dep:'21:30', arr:'22:30', dur:'1h 0m', daysOp:'Daily', fareEco:4999, fareBiz:10200, aircraft:'Boeing 737-800' },
  { id:'bs142', from:'CGP', to:'DAC', airline:'BS', flightNo:'BS142', dep:'09:00', arr:'10:00', dur:'1h 0m', daysOp:'Daily', fareEco:3999, aircraft:'Boeing 737-800' },
  { id:'bs144', from:'CGP', to:'DAC', airline:'BS', flightNo:'BS144', dep:'12:00', arr:'13:00', dur:'1h 0m', daysOp:'Daily', fareEco:3999, aircraft:'ATR 72-600' },
  { id:'bs146', from:'CGP', to:'DAC', airline:'BS', flightNo:'BS146', dep:'16:00', arr:'17:00', dur:'1h 0m', daysOp:'Daily', fareEco:4199, aircraft:'Boeing 737-800' },
  { id:'bs148', from:'CGP', to:'DAC', airline:'BS', flightNo:'BS148', dep:'20:00', arr:'21:00', dur:'1h 0m', daysOp:'Daily', fareEco:4399, aircraft:'Boeing 737-800' },
  { id:'vq102', from:'CGP', to:'DAC', airline:'VQ', flightNo:'VQ102', dep:'09:30', arr:'10:30', dur:'1h 0m', daysOp:'Daily', fareEco:3799, aircraft:'ATR 72-600' },
  { id:'vq104', from:'CGP', to:'DAC', airline:'VQ', flightNo:'VQ104', dep:'13:50', arr:'14:50', dur:'1h 0m', daysOp:'Daily', fareEco:3799, aircraft:'ATR 72-600' },
  { id:'2a202', from:'CGP', to:'DAC', airline:'2A', flightNo:'2A202', dep:'11:00', arr:'12:00', dur:'1h 0m', daysOp:'Daily', fareEco:3599, aircraft:'ATR 72-600' },
  { id:'2a204', from:'CGP', to:'DAC', airline:'2A', flightNo:'2A204', dep:'17:35', arr:'18:35', dur:'1h 0m', daysOp:'Daily', fareEco:3599, aircraft:'ATR 72-600' },

  // ── DAC ↔ CXB (Dhaka ↔ Cox's Bazar) ───────────────────────────────────────
  { id:'bg611', from:'DAC', to:'CXB', airline:'BG', flightNo:'BG611', dep:'07:00', arr:'08:05', dur:'1h 5m', daysOp:'Daily', fareEco:4999, fareBiz:10500, aircraft:'Boeing 737-800' },
  { id:'bg613', from:'DAC', to:'CXB', airline:'BG', flightNo:'BG613', dep:'11:00', arr:'12:05', dur:'1h 5m', daysOp:'Daily', fareEco:4999, fareBiz:10500, aircraft:'Boeing 737-800' },
  { id:'bg615', from:'DAC', to:'CXB', airline:'BG', flightNo:'BG615', dep:'15:00', arr:'16:05', dur:'1h 5m', daysOp:'Daily', fareEco:5199, fareBiz:11000, aircraft:'Boeing 737-800' },
  { id:'bg617', from:'DAC', to:'CXB', airline:'BG', flightNo:'BG617', dep:'19:30', arr:'20:35', dur:'1h 5m', daysOp:'Daily', fareEco:5499, fareBiz:11500, aircraft:'Boeing 737-800' },
  { id:'bs151', from:'DAC', to:'CXB', airline:'BS', flightNo:'BS151', dep:'08:30', arr:'09:35', dur:'1h 5m', daysOp:'Daily', fareEco:4499, aircraft:'Boeing 737-800' },
  { id:'bs153', from:'DAC', to:'CXB', airline:'BS', flightNo:'BS153', dep:'12:00', arr:'13:05', dur:'1h 5m', daysOp:'Daily', fareEco:4499, aircraft:'ATR 72-600' },
  { id:'bs155', from:'DAC', to:'CXB', airline:'BS', flightNo:'BS155', dep:'16:00', arr:'17:05', dur:'1h 5m', daysOp:'Daily', fareEco:4699, aircraft:'Boeing 737-800' },
  { id:'bs157', from:'DAC', to:'CXB', airline:'BS', flightNo:'BS157', dep:'20:00', arr:'21:05', dur:'1h 5m', daysOp:'Daily', fareEco:4899, aircraft:'Boeing 737-800' },
  { id:'vq111', from:'DAC', to:'CXB', airline:'VQ', flightNo:'VQ111', dep:'09:30', arr:'10:35', dur:'1h 5m', daysOp:'Daily', fareEco:4299, aircraft:'ATR 72-600' },
  { id:'vq113', from:'DAC', to:'CXB', airline:'VQ', flightNo:'VQ113', dep:'14:30', arr:'15:35', dur:'1h 5m', daysOp:'Daily', fareEco:4299, aircraft:'ATR 72-600' },
  { id:'vq115', from:'DAC', to:'CXB', airline:'VQ', flightNo:'VQ115', dep:'18:00', arr:'19:05', dur:'1h 5m', daysOp:'Daily', fareEco:4499, aircraft:'ATR 72-600' },
  { id:'2a211', from:'DAC', to:'CXB', airline:'2A', flightNo:'2A211', dep:'10:30', arr:'11:35', dur:'1h 5m', daysOp:'Daily', fareEco:3999, aircraft:'ATR 72-600' },
  { id:'2a213', from:'DAC', to:'CXB', airline:'2A', flightNo:'2A213', dep:'17:00', arr:'18:05', dur:'1h 5m', daysOp:'Daily', fareEco:3999, aircraft:'ATR 72-600' },
  // Return CXB→DAC
  { id:'bg612', from:'CXB', to:'DAC', airline:'BG', flightNo:'BG612', dep:'08:35', arr:'09:40', dur:'1h 5m', daysOp:'Daily', fareEco:4999, fareBiz:10500, aircraft:'Boeing 737-800' },
  { id:'bg614', from:'CXB', to:'DAC', airline:'BG', flightNo:'BG614', dep:'12:35', arr:'13:40', dur:'1h 5m', daysOp:'Daily', fareEco:4999, fareBiz:10500, aircraft:'Boeing 737-800' },
  { id:'bg616', from:'CXB', to:'DAC', airline:'BG', flightNo:'BG616', dep:'16:35', arr:'17:40', dur:'1h 5m', daysOp:'Daily', fareEco:5199, fareBiz:11000, aircraft:'Boeing 737-800' },
  { id:'bg618', from:'CXB', to:'DAC', airline:'BG', flightNo:'BG618', dep:'21:05', arr:'22:10', dur:'1h 5m', daysOp:'Daily', fareEco:5499, fareBiz:11500, aircraft:'Boeing 737-800' },
  { id:'bs152', from:'CXB', to:'DAC', airline:'BS', flightNo:'BS152', dep:'10:10', arr:'11:15', dur:'1h 5m', daysOp:'Daily', fareEco:4499, aircraft:'Boeing 737-800' },
  { id:'bs154', from:'CXB', to:'DAC', airline:'BS', flightNo:'BS154', dep:'13:40', arr:'14:45', dur:'1h 5m', daysOp:'Daily', fareEco:4499, aircraft:'ATR 72-600' },
  { id:'bs156', from:'CXB', to:'DAC', airline:'BS', flightNo:'BS156', dep:'17:40', arr:'18:45', dur:'1h 5m', daysOp:'Daily', fareEco:4699, aircraft:'Boeing 737-800' },
  { id:'vq112', from:'CXB', to:'DAC', airline:'VQ', flightNo:'VQ112', dep:'11:10', arr:'12:15', dur:'1h 5m', daysOp:'Daily', fareEco:4299, aircraft:'ATR 72-600' },
  { id:'vq114', from:'CXB', to:'DAC', airline:'VQ', flightNo:'VQ114', dep:'16:10', arr:'17:15', dur:'1h 5m', daysOp:'Daily', fareEco:4299, aircraft:'ATR 72-600' },
  { id:'2a212', from:'CXB', to:'DAC', airline:'2A', flightNo:'2A212', dep:'12:10', arr:'13:15', dur:'1h 5m', daysOp:'Daily', fareEco:3999, aircraft:'ATR 72-600' },
  { id:'2a214', from:'CXB', to:'DAC', airline:'2A', flightNo:'2A214', dep:'18:40', arr:'19:45', dur:'1h 5m', daysOp:'Daily', fareEco:3999, aircraft:'ATR 72-600' },

  // ── DAC ↔ ZYL (Dhaka ↔ Sylhet) ──────────────────────────────────────────────
  { id:'bg621', from:'DAC', to:'ZYL', airline:'BG', flightNo:'BG621', dep:'08:00', arr:'08:50', dur:'0h 50m', daysOp:'Daily', fareEco:3999, fareBiz:8500, aircraft:'Dash 8-400' },
  { id:'bg623', from:'DAC', to:'ZYL', airline:'BG', flightNo:'BG623', dep:'12:30', arr:'13:20', dur:'0h 50m', daysOp:'Daily', fareEco:3999, fareBiz:8500, aircraft:'Dash 8-400' },
  { id:'bg625', from:'DAC', to:'ZYL', airline:'BG', flightNo:'BG625', dep:'17:00', arr:'17:50', dur:'0h 50m', daysOp:'Daily', fareEco:4199, fareBiz:9000, aircraft:'Dash 8-400' },
  { id:'bs161', from:'DAC', to:'ZYL', airline:'BS', flightNo:'BS161', dep:'09:30', arr:'10:20', dur:'0h 50m', daysOp:'Daily', fareEco:3699, aircraft:'ATR 72-600' },
  { id:'bs163', from:'DAC', to:'ZYL', airline:'BS', flightNo:'BS163', dep:'14:00', arr:'14:50', dur:'0h 50m', daysOp:'Daily', fareEco:3699, aircraft:'ATR 72-600' },
  { id:'bs165', from:'DAC', to:'ZYL', airline:'BS', flightNo:'BS165', dep:'18:30', arr:'19:20', dur:'0h 50m', daysOp:'Daily', fareEco:3899, aircraft:'ATR 72-600' },
  { id:'vq121', from:'DAC', to:'ZYL', airline:'VQ', flightNo:'VQ121', dep:'11:00', arr:'11:50', dur:'0h 50m', daysOp:'Daily', fareEco:3599, aircraft:'ATR 72-600' },
  { id:'vq123', from:'DAC', to:'ZYL', airline:'VQ', flightNo:'VQ123', dep:'15:30', arr:'16:20', dur:'0h 50m', daysOp:'Daily', fareEco:3599, aircraft:'ATR 72-600' },
  { id:'2a221', from:'DAC', to:'ZYL', airline:'2A', flightNo:'2A221', dep:'10:00', arr:'10:50', dur:'0h 50m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  { id:'2a223', from:'DAC', to:'ZYL', airline:'2A', flightNo:'2A223', dep:'16:30', arr:'17:20', dur:'0h 50m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  // Return ZYL→DAC
  { id:'bg622', from:'ZYL', to:'DAC', airline:'BG', flightNo:'BG622', dep:'09:20', arr:'10:10', dur:'0h 50m', daysOp:'Daily', fareEco:3999, fareBiz:8500, aircraft:'Dash 8-400' },
  { id:'bg624', from:'ZYL', to:'DAC', airline:'BG', flightNo:'BG624', dep:'13:50', arr:'14:40', dur:'0h 50m', daysOp:'Daily', fareEco:3999, fareBiz:8500, aircraft:'Dash 8-400' },
  { id:'bg626', from:'ZYL', to:'DAC', airline:'BG', flightNo:'BG626', dep:'18:20', arr:'19:10', dur:'0h 50m', daysOp:'Daily', fareEco:4199, fareBiz:9000, aircraft:'Dash 8-400' },
  { id:'bs162', from:'ZYL', to:'DAC', airline:'BS', flightNo:'BS162', dep:'11:00', arr:'11:50', dur:'0h 50m', daysOp:'Daily', fareEco:3699, aircraft:'ATR 72-600' },
  { id:'bs164', from:'ZYL', to:'DAC', airline:'BS', flightNo:'BS164', dep:'15:20', arr:'16:10', dur:'0h 50m', daysOp:'Daily', fareEco:3699, aircraft:'ATR 72-600' },
  { id:'bs166', from:'ZYL', to:'DAC', airline:'BS', flightNo:'BS166', dep:'20:00', arr:'20:50', dur:'0h 50m', daysOp:'Daily', fareEco:3899, aircraft:'ATR 72-600' },
  { id:'vq122', from:'ZYL', to:'DAC', airline:'VQ', flightNo:'VQ122', dep:'12:20', arr:'13:10', dur:'0h 50m', daysOp:'Daily', fareEco:3599, aircraft:'ATR 72-600' },
  { id:'2a222', from:'ZYL', to:'DAC', airline:'2A', flightNo:'2A222', dep:'11:20', arr:'12:10', dur:'0h 50m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },

  // ── DAC ↔ JSR (Dhaka ↔ Jashore) ─────────────────────────────────────────────
  { id:'bg631', from:'DAC', to:'JSR', airline:'BG', flightNo:'BG631', dep:'08:00', arr:'08:50', dur:'0h 50m', daysOp:'Daily', fareEco:3799, fareBiz:8000, aircraft:'Dash 8-400' },
  { id:'bg633', from:'DAC', to:'JSR', airline:'BG', flightNo:'BG633', dep:'14:00', arr:'14:50', dur:'0h 50m', daysOp:'Daily', fareEco:3799, fareBiz:8000, aircraft:'Dash 8-400' },
  { id:'bs171', from:'DAC', to:'JSR', airline:'BS', flightNo:'BS171', dep:'10:00', arr:'10:50', dur:'0h 50m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'bs173', from:'DAC', to:'JSR', airline:'BS', flightNo:'BS173', dep:'15:30', arr:'16:20', dur:'0h 50m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'vq131', from:'DAC', to:'JSR', airline:'VQ', flightNo:'VQ131', dep:'12:00', arr:'12:50', dur:'0h 50m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  { id:'2a231', from:'DAC', to:'JSR', airline:'2A', flightNo:'2A231', dep:'09:00', arr:'09:50', dur:'0h 50m', daysOp:'Daily', fareEco:2999, aircraft:'ATR 72-600' },
  // Return JSR→DAC
  { id:'bg632', from:'JSR', to:'DAC', airline:'BG', flightNo:'BG632', dep:'09:20', arr:'10:10', dur:'0h 50m', daysOp:'Daily', fareEco:3799, fareBiz:8000, aircraft:'Dash 8-400' },
  { id:'bg634', from:'JSR', to:'DAC', airline:'BG', flightNo:'BG634', dep:'15:20', arr:'16:10', dur:'0h 50m', daysOp:'Daily', fareEco:3799, fareBiz:8000, aircraft:'Dash 8-400' },
  { id:'bs172', from:'JSR', to:'DAC', airline:'BS', flightNo:'BS172', dep:'11:20', arr:'12:10', dur:'0h 50m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'bs174', from:'JSR', to:'DAC', airline:'BS', flightNo:'BS174', dep:'16:50', arr:'17:40', dur:'0h 50m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'vq132', from:'JSR', to:'DAC', airline:'VQ', flightNo:'VQ132', dep:'13:20', arr:'14:10', dur:'0h 50m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  { id:'2a232', from:'JSR', to:'DAC', airline:'2A', flightNo:'2A232', dep:'10:20', arr:'11:10', dur:'0h 50m', daysOp:'Daily', fareEco:2999, aircraft:'ATR 72-600' },

  // ── DAC ↔ SPD (Dhaka ↔ Saidpur) ─────────────────────────────────────────────
  { id:'bg641', from:'DAC', to:'SPD', airline:'BG', flightNo:'BG641', dep:'09:00', arr:'10:00', dur:'1h 0m', daysOp:'Daily', fareEco:3999, fareBiz:8500, aircraft:'Dash 8-400' },
  { id:'bg643', from:'DAC', to:'SPD', airline:'BG', flightNo:'BG643', dep:'15:00', arr:'16:00', dur:'1h 0m', daysOp:'Daily', fareEco:3999, fareBiz:8500, aircraft:'Dash 8-400' },
  { id:'bs181', from:'DAC', to:'SPD', airline:'BS', flightNo:'BS181', dep:'11:00', arr:'12:00', dur:'1h 0m', daysOp:'Daily', fareEco:3699, aircraft:'ATR 72-600' },
  { id:'bs183', from:'DAC', to:'SPD', airline:'BS', flightNo:'BS183', dep:'16:30', arr:'17:30', dur:'1h 0m', daysOp:'Daily', fareEco:3699, aircraft:'ATR 72-600' },
  { id:'vq141', from:'DAC', to:'SPD', airline:'VQ', flightNo:'VQ141', dep:'13:00', arr:'14:00', dur:'1h 0m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'2a241', from:'DAC', to:'SPD', airline:'2A', flightNo:'2A241', dep:'10:00', arr:'11:00', dur:'1h 0m', daysOp:'Daily', fareEco:3199, aircraft:'ATR 72-600' },
  // Return SPD→DAC
  { id:'bg642', from:'SPD', to:'DAC', airline:'BG', flightNo:'BG642', dep:'10:30', arr:'11:30', dur:'1h 0m', daysOp:'Daily', fareEco:3999, fareBiz:8500, aircraft:'Dash 8-400' },
  { id:'bg644', from:'SPD', to:'DAC', airline:'BG', flightNo:'BG644', dep:'16:30', arr:'17:30', dur:'1h 0m', daysOp:'Daily', fareEco:3999, fareBiz:8500, aircraft:'Dash 8-400' },
  { id:'bs182', from:'SPD', to:'DAC', airline:'BS', flightNo:'BS182', dep:'12:30', arr:'13:30', dur:'1h 0m', daysOp:'Daily', fareEco:3699, aircraft:'ATR 72-600' },
  { id:'bs184', from:'SPD', to:'DAC', airline:'BS', flightNo:'BS184', dep:'18:00', arr:'19:00', dur:'1h 0m', daysOp:'Daily', fareEco:3699, aircraft:'ATR 72-600' },
  { id:'vq142', from:'SPD', to:'DAC', airline:'VQ', flightNo:'VQ142', dep:'14:30', arr:'15:30', dur:'1h 0m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'2a242', from:'SPD', to:'DAC', airline:'2A', flightNo:'2A242', dep:'11:30', arr:'12:30', dur:'1h 0m', daysOp:'Daily', fareEco:3199, aircraft:'ATR 72-600' },

  // ── DAC ↔ BZL (Dhaka ↔ Barisal) ─────────────────────────────────────────────
  { id:'bg651', from:'DAC', to:'BZL', airline:'BG', flightNo:'BG651', dep:'09:30', arr:'10:20', dur:'0h 50m', daysOp:'Daily', fareEco:3599, fareBiz:7500, aircraft:'Dash 8-400' },
  { id:'bg653', from:'DAC', to:'BZL', airline:'BG', flightNo:'BG653', dep:'15:30', arr:'16:20', dur:'0h 50m', daysOp:'Daily', fareEco:3599, fareBiz:7500, aircraft:'Dash 8-400' },
  { id:'bs191', from:'DAC', to:'BZL', airline:'BS', flightNo:'BS191', dep:'11:30', arr:'12:20', dur:'0h 50m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  { id:'bs193', from:'DAC', to:'BZL', airline:'BS', flightNo:'BS193', dep:'17:00', arr:'17:50', dur:'0h 50m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  { id:'vq151', from:'DAC', to:'BZL', airline:'VQ', flightNo:'VQ151', dep:'13:30', arr:'14:20', dur:'0h 50m', daysOp:'Daily', fareEco:3099, aircraft:'ATR 72-600' },
  // Return BZL→DAC
  { id:'bg652', from:'BZL', to:'DAC', airline:'BG', flightNo:'BG652', dep:'10:50', arr:'11:40', dur:'0h 50m', daysOp:'Daily', fareEco:3599, fareBiz:7500, aircraft:'Dash 8-400' },
  { id:'bg654', from:'BZL', to:'DAC', airline:'BG', flightNo:'BG654', dep:'16:50', arr:'17:40', dur:'0h 50m', daysOp:'Daily', fareEco:3599, fareBiz:7500, aircraft:'Dash 8-400' },
  { id:'bs192', from:'BZL', to:'DAC', airline:'BS', flightNo:'BS192', dep:'12:50', arr:'13:40', dur:'0h 50m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  { id:'bs194', from:'BZL', to:'DAC', airline:'BS', flightNo:'BS194', dep:'18:20', arr:'19:10', dur:'0h 50m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  { id:'vq152', from:'BZL', to:'DAC', airline:'VQ', flightNo:'VQ152', dep:'14:50', arr:'15:40', dur:'0h 50m', daysOp:'Daily', fareEco:3099, aircraft:'ATR 72-600' },

  // ── DAC ↔ RJH (Dhaka ↔ Rajshahi) ────────────────────────────────────────────
  { id:'bg661', from:'DAC', to:'RJH', airline:'BG', flightNo:'BG661', dep:'10:00', arr:'10:55', dur:'0h 55m', daysOp:'Daily', fareEco:3799, fareBiz:8000, aircraft:'Dash 8-400' },
  { id:'bg663', from:'DAC', to:'RJH', airline:'BG', flightNo:'BG663', dep:'16:00', arr:'16:55', dur:'0h 55m', daysOp:'Daily', fareEco:3799, fareBiz:8000, aircraft:'Dash 8-400' },
  { id:'bs201', from:'DAC', to:'RJH', airline:'BS', flightNo:'BS201', dep:'12:00', arr:'12:55', dur:'0h 55m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'bs203', from:'DAC', to:'RJH', airline:'BS', flightNo:'BS203', dep:'17:30', arr:'18:25', dur:'0h 55m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'vq161', from:'DAC', to:'RJH', airline:'VQ', flightNo:'VQ161', dep:'14:00', arr:'14:55', dur:'0h 55m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  { id:'2a251', from:'DAC', to:'RJH', airline:'2A', flightNo:'2A251', dep:'11:00', arr:'11:55', dur:'0h 55m', daysOp:'Daily', fareEco:2999, aircraft:'ATR 72-600' },
  // Return RJH→DAC
  { id:'bg662', from:'RJH', to:'DAC', airline:'BG', flightNo:'BG662', dep:'11:25', arr:'12:20', dur:'0h 55m', daysOp:'Daily', fareEco:3799, fareBiz:8000, aircraft:'Dash 8-400' },
  { id:'bg664', from:'RJH', to:'DAC', airline:'BG', flightNo:'BG664', dep:'17:25', arr:'18:20', dur:'0h 55m', daysOp:'Daily', fareEco:3799, fareBiz:8000, aircraft:'Dash 8-400' },
  { id:'bs202', from:'RJH', to:'DAC', airline:'BS', flightNo:'BS202', dep:'13:25', arr:'14:20', dur:'0h 55m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'bs204', from:'RJH', to:'DAC', airline:'BS', flightNo:'BS204', dep:'18:55', arr:'19:50', dur:'0h 55m', daysOp:'Daily', fareEco:3499, aircraft:'ATR 72-600' },
  { id:'vq162', from:'RJH', to:'DAC', airline:'VQ', flightNo:'VQ162', dep:'15:25', arr:'16:20', dur:'0h 55m', daysOp:'Daily', fareEco:3299, aircraft:'ATR 72-600' },
  { id:'2a252', from:'RJH', to:'DAC', airline:'2A', flightNo:'2A252', dep:'12:25', arr:'13:20', dur:'0h 55m', daysOp:'Daily', fareEco:2999, aircraft:'ATR 72-600' },

  // ── CGP ↔ CXB (Chittagong ↔ Cox's Bazar) ─────────────────────────────────
  { id:'bs701', from:'CGP', to:'CXB', airline:'BS', flightNo:'BS701', dep:'09:00', arr:'09:30', dur:'0h 30m', daysOp:'Daily', fareEco:2499, aircraft:'ATR 72-600' },
  { id:'bs703', from:'CGP', to:'CXB', airline:'BS', flightNo:'BS703', dep:'14:00', arr:'14:30', dur:'0h 30m', daysOp:'Daily', fareEco:2499, aircraft:'ATR 72-600' },
  { id:'vq701', from:'CGP', to:'CXB', airline:'VQ', flightNo:'VQ701', dep:'11:00', arr:'11:30', dur:'0h 30m', daysOp:'Daily', fareEco:2299, aircraft:'ATR 72-600' },
  // Return CXB→CGP
  { id:'bs702', from:'CXB', to:'CGP', airline:'BS', flightNo:'BS702', dep:'10:00', arr:'10:30', dur:'0h 30m', daysOp:'Daily', fareEco:2499, aircraft:'ATR 72-600' },
  { id:'bs704', from:'CXB', to:'CGP', airline:'BS', flightNo:'BS704', dep:'15:00', arr:'15:30', dur:'0h 30m', daysOp:'Daily', fareEco:2499, aircraft:'ATR 72-600' },
  { id:'vq702', from:'CXB', to:'CGP', airline:'VQ', flightNo:'VQ702', dep:'12:00', arr:'12:30', dur:'0h 30m', daysOp:'Daily', fareEco:2299, aircraft:'ATR 72-600' },
];
