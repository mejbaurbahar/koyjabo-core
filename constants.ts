import { BusRoute, Station, MetroStation, MetroLine } from './types';

// Coordinate mapping for major Dhaka locations
export const STATIONS: Record<string, Station> = {
  'gabtoli': { id: 'gabtoli', name: 'Gabtoli', bnName: 'গাবতলী', lat: 23.783479, lng: 90.343815 },
  'saturia': { id: 'saturia', name: 'Saturia', bnName: 'সাটুরিয়া', lat: 23.9315, lng: 90.0247 },
  'pakutia': { id: 'pakutia', name: 'Pakutia', bnName: 'পাকুটিয়া', lat: 24.0207, lng: 89.9871 },
  'nagorpur': { id: 'nagorpur', name: 'Nagorpur', bnName: 'নাগরপুর', lat: 24.0577, lng: 89.8762 },
  'kusura': { id: 'kusura', name: 'Kusura', bnName: 'কুসুরা', lat: 23.8647, lng: 90.1654 },
  'daragram': { id: 'daragram', name: 'Daragram', bnName: 'দড়গ্রাম', lat: 23.9250, lng: 90.0500 },
  'baliati': { id: 'baliati', name: 'Baliati', bnName: 'বালিয়াটি', lat: 23.9950, lng: 90.0287 },
  'citakhola': { id: 'citakhola', name: 'Citakhola', bnName: 'চিতাখোলা', lat: 23.9500, lng: 90.0100 },
  'chachitara': { id: 'chachitara', name: 'Chachitara', bnName: 'চাচিতারা', lat: 23.9700, lng: 89.9800 },
  'kalur_ghat': { id: 'kalur_ghat', name: 'Kalur Ghat', bnName: 'কালুর ঘাট', lat: 24.0200, lng: 89.9200 },
  'technical': { id: 'technical', name: 'Technical', bnName: 'টেকনিক্যাল', lat: 23.781468, lng: 90.351741 },
  'mirpur1': { id: 'mirpur1', name: 'Mirpur 1', bnName: 'মিরপুর ১', lat: 23.7930, lng: 90.3530 },
  'mirpur2': { id: 'mirpur2', name: 'Mirpur 2', bnName: 'মিরপুর ২', lat: 23.8050, lng: 90.3635 },
  'mirpur6': { id: 'mirpur6', name: 'Mirpur 6', bnName: 'মিরপুর ৬', lat: 23.8100, lng: 90.3620 },
  'mirpur7': { id: 'mirpur7', name: 'Mirpur 7', bnName: 'মিরপুর ৭', lat: 23.8130, lng: 90.3630 },
  'mirpur10': { id: 'mirpur10', name: 'Mirpur 10', bnName: 'মিরপুর ১০', lat: 23.8075, lng: 90.3685 },
  'mirpur11': { id: 'mirpur11', name: 'Mirpur 11', bnName: 'মিরপুর ১১', lat: 23.8191, lng: 90.3653 },
  'mirpur12': { id: 'mirpur12', name: 'Mirpur 12', bnName: 'মিরপুর ১২', lat: 23.8245, lng: 90.3710 },
  'mirpur13': { id: 'mirpur13', name: 'Mirpur 13', bnName: 'মিরপুর ১৩', lat: 23.8160, lng: 90.3700 },
  'mirpur14': { id: 'mirpur14', name: 'Mirpur 14', bnName: 'মিরপুর ১৪', lat: 23.8120, lng: 90.3750 },
  'pallabi': { id: 'pallabi', name: 'Pallabi', bnName: 'পল্লবী', lat: 23.820280, lng: 90.365015 },
  'purobi': { id: 'purobi', name: 'Purobi', bnName: 'পূর্বী', lat: 23.8210, lng: 90.3620 },
  'kalshi': { id: 'kalshi', name: 'Kalshi', bnName: 'কালশী', lat: 23.821979, lng: 90.377623 },
  'ecb': { id: 'ecb', name: 'ECB Square', bnName: 'ইসিবি স্কয়ার', lat: 23.822639, lng: 90.393673 },
  'kuril': { id: 'kuril', name: 'Kuril Bishwa Road', bnName: 'কুড়িল বিশ্ব রোড', lat: 23.820215, lng: 90.420297 },
  'kuril_flyover': { id: 'kuril_flyover', name: 'Kuril Flyover', bnName: 'কুড়িল ফ্লাইওভার', lat: 23.8220, lng: 90.4080 },
  'bashundhara': { id: 'bashundhara', name: 'Bashundhara', bnName: 'বসুন্ধরা', lat: 23.8120, lng: 90.4250 },
  'notun_bazar': { id: 'notun_bazar', name: 'Notun Bazar', bnName: 'নতুন বাজার', lat: 23.7950, lng: 90.4250 },
  'badda': { id: 'badda', name: 'Badda', bnName: 'বাড্ডা', lat: 23.7850, lng: 90.4285 },
  'badda_link_road': { id: 'badda_link_road', name: 'Badda Link Road', bnName: 'বাড্ডা লিংক রোড', lat: 23.780698, lng: 90.425392 },
  'uttar_badda': { id: 'uttar_badda', name: 'Uttar Badda', bnName: 'উত্তর বাড্ডা', lat: 23.7880, lng: 90.4250 },
  'madhya_badda': { id: 'madhya_badda', name: 'Madhya Badda', bnName: 'মধ্য বাড্ডা', lat: 23.7820, lng: 90.4250 },
  'merul': { id: 'merul', name: 'Merul Badda', bnName: 'মেরুল বাড্ডা', lat: 23.7700, lng: 90.4200 },
  'rampura': { id: 'rampura', name: 'Rampura Bridge', bnName: 'রামপুরা ব্রিজ', lat: 23.7650, lng: 90.4180 },
  'rampura_bazar': { id: 'rampura_bazar', name: 'Rampura Bazar', bnName: 'রামপুরা বাজার', lat: 23.7620, lng: 90.4180 },
  'banasree': { id: 'banasree', name: 'Banasree', bnName: 'বনশ্রী', lat: 23.7635, lng: 90.4350 },
  'south_banasree': { id: 'south_banasree', name: 'South Banasree', bnName: 'দক্ষিণ বনশ্রী', lat: 23.7550, lng: 90.4350 },
  'demra': { id: 'demra', name: 'Demra Staff Quarter', bnName: 'ডেমরা', lat: 23.719699, lng: 90.490799 },
  'airport': { id: 'airport', name: 'Airport', bnName: 'বিমানবন্দর', lat: 23.8475, lng: 90.4025 },

  'uttara': { id: 'uttara', name: 'Uttara (House Building)', bnName: 'উত্তরা', lat: 23.8660, lng: 90.3950 },
  'abdullahpur': { id: 'abdullahpur', name: 'Abdullahpur', bnName: 'আবদুল্লাহপুর', lat: 23.8796, lng: 90.4012 },
  'mohakhali': { id: 'mohakhali', name: 'Mohakhali', bnName: 'মহাখালী', lat: 23.777982, lng: 90.397547 },
  'farmgate': { id: 'farmgate', name: 'Farmgate', bnName: 'ফার্মগেট', lat: 23.758142, lng: 90.390308 },
  'shahbag': { id: 'shahbag', name: 'Shahbag', bnName: 'শাহবাগ', lat: 23.7389, lng: 90.3965 },
  'gulistan': { id: 'gulistan', name: 'Gulistan', bnName: 'গুলিস্তান', lat: 23.7275, lng: 90.4105 },
  'motijheel': { id: 'motijheel', name: 'Motijheel', bnName: 'মতিঝিল', lat: 23.7330, lng: 90.4170 },
  'sayedabad': { id: 'sayedabad', name: 'Sayedabad', bnName: 'সায়েদাবাদ', lat: 23.7161, lng: 90.4284 },
  'jatrabari': { id: 'jatrabari', name: 'Jatrabari', bnName: 'যাত্রাবাড়ী', lat: 23.710488, lng: 90.433803 },
  'mridha_bari': { id: 'mridha_bari', name: 'Mridha Bari', bnName: 'মৃধা বাড়ী', lat: 23.713144, lng: 90.452264 },
  'savar': { id: 'savar', name: 'Savar', bnName: 'সাভার', lat: 23.839529, lng: 90.257713 },
  'hemayetpur': { id: 'hemayetpur', name: 'Hemayetpur', bnName: 'হেমায়েতপুর', lat: 23.792779, lng: 90.269631 },
  'kallyanpur': { id: 'kallyanpur', name: 'Kallyanpur', bnName: 'কল্যাণপুর', lat: 23.777912, lng: 90.360964 },
  'shyamoli': { id: 'shyamoli', name: 'Shyamoli', bnName: 'শ্যামলী', lat: 23.775211, lng: 90.365503 },
  'dhanmondi27': { id: 'dhanmondi27', name: 'Dhanmondi 27', bnName: 'ধানমন্ডি ২৭', lat: 23.7570, lng: 90.3760 },
  'dhanmondi32': { id: 'dhanmondi32', name: 'Dhanmondi 32', bnName: 'ধানমন্ডি ৩২', lat: 23.7517, lng: 90.3779 },
  'dhanmondi15': { id: 'dhanmondi15', name: 'Dhanmondi 15', bnName: 'ধানমন্ডি ১৫', lat: 23.744577, lng: 90.372565 },
  'newmarket': { id: 'newmarket', name: 'New Market', bnName: 'নিউ মার্কেট', lat: 23.734215, lng: 90.384422 },
  'azimpur': { id: 'azimpur', name: 'Azimpur', bnName: ' আজিমপুর', lat: 23.7298, lng: 90.3854 },
  'banani': { id: 'banani', name: 'Banani', bnName: 'বনানী', lat: 23.7930, lng: 90.4040 },
  'gulshan1': { id: 'gulshan1', name: 'Gulshan 1', bnName: 'গুলশান ১', lat: 23.780408, lng: 90.416506 },
  'gulshan2': { id: 'gulshan2', name: 'Gulshan 2', bnName: 'গুলশান ২', lat: 23.7950, lng: 90.4150 },
  'shia_masjid': { id: 'shia_masjid', name: 'Shia Masjid', bnName: 'শিয়া মসজিদ', lat: 23.7660, lng: 90.3580 },
  'japan_garden': { id: 'japan_garden', name: 'Japan Garden City', bnName: 'জাপান গার্ডেন সিটি', lat: 23.7680, lng: 90.3570 },
  'ring_road': { id: 'ring_road', name: 'Ring Road', bnName: 'রিং রোড', lat: 23.7700, lng: 90.3560 },
  'adabor': { id: 'adabor', name: 'Adabor', bnName: 'আদাবর', lat: 23.7700, lng: 90.3550 },
  'amin_bazar': { id: 'amin_bazar', name: 'Amin Bazar', bnName: 'আমিন বাজার', lat: 23.786368, lng: 90.329233 },
  'boliarpur': { id: 'boliarpur', name: 'Boliarpur', bnName: 'বলিয়ারপুর', lat: 23.7953, lng: 90.2903 },
  'modhumoti': { id: 'modhumoti', name: 'Modhumoti', bnName: 'মধুমত', lat: 23.7920, lng: 90.3100 },
  'parbat': { id: 'parbat', name: 'Parbat', bnName: 'পর্বত', lat: 23.783689, lng: 90.337466 },
  'mazar_road': { id: 'mazar_road', name: 'Mazar Road', bnName: 'মাজার রোড', lat: 23.783079, lng: 90.346950 },
  'amtola': { id: 'amtola', name: 'Amtola', bnName: 'আমতলা', lat: 23.781141, lng: 90.398561 },
  'post_office_gulshan': { id: 'post_office_gulshan', name: 'Post Office (Gulshan)', bnName: 'পোস্ট অফিস (গুলশান)', lat: 23.7998, lng: 90.3940 },
  'agargaon': { id: 'agargaon', name: 'Agargaon', bnName: 'আগারগাঁও', lat: 23.7780, lng: 90.3800 },
  'fulbaria': { id: 'fulbaria', name: 'Fulbaria', bnName: 'ফুলবাড়িয়া', lat: 23.7220, lng: 90.4080 },
  'paltan': { id: 'paltan', name: 'Paltan', bnName: 'পল্টন', lat: 23.730082, lng: 90.410056 },
  'press_club': { id: 'press_club', name: 'Press Club', bnName: 'প্রেস ক্লাব', lat: 23.7290, lng: 90.4030 },
  'kawran_bazar': { id: 'kawran_bazar', name: 'Kawran Bazar', bnName: 'কাওরান বাজার', lat: 23.751312, lng: 90.392715 },
  'sadarghat': { id: 'sadarghat', name: 'Sadarghat', bnName: 'সদরঘাট', lat: 23.7050, lng: 90.4050 },
  'malibagh': { id: 'malibagh', name: 'Malibagh', bnName: 'মালিবাগ', lat: 23.7500, lng: 90.4150 },
  'malibagh_railgate': { id: 'malibagh_railgate', name: 'Malibagh Railgate', bnName: 'মালিবাগ রেলগেট', lat: 23.749602, lng: 90.412588 },
  'mouchak': { id: 'mouchak', name: 'Mouchak', bnName: 'মৌচাক', lat: 23.745847, lng: 90.412111 },
  'mogbazar': { id: 'mogbazar', name: 'Mogbazar', bnName: 'মগবাজার', lat: 23.748681, lng: 90.403379 },
  'postagola': { id: 'postagola', name: 'Postagola', bnName: 'পোস্তগোলা', lat: 23.6950, lng: 90.4300 },
  'science_lab': { id: 'science_lab', name: 'Science Lab', bnName: 'সায়েন্স ল্যাব', lat: 23.739087, lng: 90.383247 },
  'city_college': { id: 'city_college', name: 'City College', bnName: 'সিটি কলেজ', lat: 23.739744, lng: 90.382611 },
  'khilkhet': { id: 'khilkhet', name: 'Khilkhet', bnName: 'খিলক্ষেত', lat: 23.8300, lng: 90.4172 },
  'kakali': { id: 'kakali', name: 'Kakali', bnName: 'কাকলী', lat: 23.7950, lng: 90.4050 },
  'nabisco': { id: 'nabisco', name: 'Nabisco', bnName: 'নাবিস্কো', lat: 23.7650, lng: 90.4020 },
  'satrasta': { id: 'satrasta', name: 'Satrasta', bnName: 'সাতরাস্তা', lat: 23.7600, lng: 90.3980 },
  'shantinagar': { id: 'shantinagar', name: 'Shantinagar', bnName: 'শান্তিনগর', lat: 23.7410, lng: 90.4150 },
  'tongi': { id: 'tongi', name: 'Tongi', bnName: 'টঙ্গী', lat: 23.8900, lng: 90.4020 },
  'gazipur': { id: 'gazipur', name: 'Gazipur Chourasta', bnName: 'গাজীপুর চৌরাস্তা', lat: 23.9900, lng: 90.3950 },
  'gazipur_bypass': { id: 'gazipur_bypass', name: 'Gazipur Bypass', bnName: 'গাজীপুর বাইপাস', lat: 23.9700, lng: 90.3900 },
  'kachukhet': { id: 'kachukhet', name: 'Kachukhet', bnName: 'কাচুক্ষেত', lat: 23.7980, lng: 90.3900 },
  'bijoy_sarani': { id: 'bijoy_sarani', name: 'Bijoy Sarani', bnName: 'বিজয় সরণি', lat: 23.764647, lng: 90.388429 },
  'signboard': { id: 'signboard', name: 'Sign Board', bnName: 'সাইনবোর্ড', lat: 23.6900, lng: 90.4600 },
  'chittagong_road': { id: 'chittagong_road', name: 'Chittagong Road', bnName: 'চট্টগ্রাম রোড', lat: 23.6800, lng: 90.4700 },
  'shankar': { id: 'shankar', name: 'Shankar', bnName: 'শংকর', lat: 23.750751, lng: 90.368417 },
  'mohammadpur': { id: 'mohammadpur', name: 'Mohammadpur', bnName: 'মোহাম্মদপুর', lat: 23.7620, lng: 90.3600 },
  'jigatola': { id: 'jigatola', name: 'Jigatola', bnName: 'জিগাতলা', lat: 23.738890, lng: 90.375884 },
  'madanpur': { id: 'madanpur', name: 'Madanpur', bnName: 'মদনপুর', lat: 23.6700, lng: 90.5200 },
  'chandra': { id: 'chandra', name: 'Chandra', bnName: 'চন্দ্রা', lat: 24.047874, lng: 90.237952 },
  'kamalapur': { id: 'kamalapur', name: 'Kamalapur Railway Station', bnName: 'কমলাপুর রেলওয়ে স্টেশন', lat: 23.7320, lng: 90.4262 },
  'high_court': { id: 'high_court', name: 'High Court', bnName: 'হাইকোর্ট', lat: 23.731076, lng: 90.404683 },
  'sony_cinema': { id: 'sony_cinema', name: 'Sony Cinema Hall', bnName: 'সনি সিনেমা হল', lat: 23.8005, lng: 90.3554 },
  'ansar_camp': { id: 'ansar_camp', name: 'Ansar Camp', bnName: 'আনসার ক্যাম্প', lat: 23.7911, lng: 90.3539 },
  'kadamtoli': { id: 'kadamtoli', name: 'Kadamtoli', bnName: 'কদমতলী', lat: 23.6900, lng: 90.4400 },
  'dholpur': { id: 'dholpur', name: 'Dholpur', bnName: 'ধোলপুর', lat: 23.7100, lng: 90.4300 },
  'kazipara': { id: 'kazipara', name: 'Kazipara', bnName: 'কাজীপাড়া', lat: 23.7970, lng: 90.3700 },
  'shewrapara': { id: 'shewrapara', name: 'Shewrapara', bnName: 'শেওড়াপাড়া', lat: 23.7900, lng: 90.3750 },
  'idb': { id: 'idb', name: 'IDB Bhaban', bnName: 'আইডিবি ভবন', lat: 23.7750, lng: 90.3820 },
  'wireless': { id: 'wireless', name: 'Wireless Gate', bnName: 'ওয়্যারলেস গেট', lat: 23.781141, lng: 90.398561 },
  'chairman_bari': { id: 'chairman_bari', name: 'Chairman Bari', bnName: 'চেয়ারম্যান বাড়ি', lat: 23.7880, lng: 90.4020 },
  'mes': { id: 'mes', name: 'MES', bnName: 'এমইএস', lat: 23.816136, lng: 90.405322 },
  'shewra': { id: 'shewra', name: 'Shewra', bnName: 'শেওড়া', lat: 23.8200, lng: 90.4050 },
  'jashimuddin': { id: 'jashimuddin', name: 'Jashimuddin', bnName: 'জসীমউদ্দীন', lat: 23.8610, lng: 90.3990 },
  'rajlakshmi': { id: 'rajlakshmi', name: 'Rajlakshmi', bnName: 'রাজলক্ষ্মী', lat: 23.8660, lng: 90.3985 },
  'azampur': { id: 'azampur', name: 'Azampur', bnName: 'আজমপুর', lat: 23.8680, lng: 90.3980 },
  'shonir_akhra': { id: 'shonir_akhra', name: 'Shonir Akhra', bnName: 'সোনির আখড়া', lat: 23.7000, lng: 90.4450 },
  'rayerbag': { id: 'rayerbag', name: 'Rayerbag', bnName: 'রায়েরবাগ', lat: 23.6980, lng: 90.4500 },
  'matuail': { id: 'matuail', name: 'Matuail', bnName: 'মাটুয়াইল', lat: 23.6950, lng: 90.4550 },
  'maniknagar': { id: 'maniknagar', name: 'Manik Nagar', bnName: 'মানিক নগর', lat: 23.7200, lng: 90.4300 },
  'tt_para': { id: 'tt_para', name: 'TT Para', bnName: 'টিটি পাড়া', lat: 23.7280, lng: 90.4300 },
  'mugdapara': { id: 'mugdapara', name: 'Mugdapara', bnName: 'মুগদাপাড়া', lat: 23.7300, lng: 90.4320 },
  'bashabo': { id: 'bashabo', name: 'Bashabo', bnName: 'বাশাবো', lat: 23.7350, lng: 90.4350 },
  'khilgaon': { id: 'khilgaon', name: 'Khilgaon', bnName: 'খিলগাঁও', lat: 23.7480, lng: 90.4250 },
  'hazipara': { id: 'hazipara', name: 'Hazipara', bnName: 'হাজীপাড়া', lat: 23.7600, lng: 90.4180 },
  'bashtola': { id: 'bashtola', name: 'Bashtola', bnName: 'বাঁশতলা', lat: 23.7900, lng: 90.4250 },
  'shahjadpur': { id: 'shahjadpur', name: 'Shahjadpur', bnName: 'শাহজাদপুর', lat: 23.7920, lng: 90.4250 },
  'nadda': { id: 'nadda', name: 'Nadda', bnName: 'নদ্দা', lat: 23.8050, lng: 90.4250 },
  'jamuna_future_park': { id: 'jamuna_future_park', name: 'Jamuna Future Park', bnName: 'যমুনা ফিউচার পার্ক', lat: 23.8130, lng: 90.4220 },
  'station_road': { id: 'station_road', name: 'Station Road', bnName: 'স্টেশন রোড', lat: 23.9000, lng: 90.4000 },
  'mill_gate': { id: 'mill_gate', name: 'Mill Gate', bnName: 'মিল গেট', lat: 23.9100, lng: 90.4000 },
  'board_bazar': { id: 'board_bazar', name: 'Board Bazar', bnName: 'বোর্ড বাজার', lat: 23.9300, lng: 90.3980 },
  'college_gate': { id: 'college_gate', name: 'College Gate', bnName: 'কলেজ গেট', lat: 23.7680, lng: 90.3720 },
  'asad_gate': { id: 'asad_gate', name: 'Asad Gate', bnName: 'আসাদ গেট', lat: 23.7600, lng: 90.3750 },
  'shukrabad': { id: 'shukrabad', name: 'Shukrabad', bnName: 'শুক্রাবাদ', lat: 23.7520, lng: 90.3780 },
  'nilkhet': { id: 'nilkhet', name: 'Nilkhet', bnName: 'নীলক্ষেত', lat: 23.732624, lng: 90.385156 },
  'bakshi_bazar': { id: 'bakshi_bazar', name: 'Bakshi Bazar', bnName: 'বক্সী বাজার', lat: 23.7220, lng: 90.3950 },
  'chankhar_pul': { id: 'chankhar_pul', name: 'Chankhar Pul', bnName: 'চাঁখার পুল', lat: 23.7250, lng: 90.4000 },
  'palashi': { id: 'palashi', name: 'Palashi', bnName: 'পলাশী', lat: 23.7280, lng: 90.3900 },
  'eden_college': { id: 'eden_college', name: 'Eden College', bnName: 'ইডেন কলেজ', lat: 23.7300, lng: 90.3880 },
  'bangla_motor': { id: 'bangla_motor', name: 'Bangla Motor', bnName: 'বাংলা মোটর', lat: 23.7450, lng: 90.3950 },
  'matsya_bhaban': { id: 'matsya_bhaban', name: 'Matsya Bhaban', bnName: 'মৎস্য ভবন', lat: 23.7320, lng: 90.4000 },
  'kakrail': { id: 'kakrail', name: 'Kakrail', bnName: 'কাকরাইল', lat: 23.737942, lng: 90.408922 },
  'gpo': { id: 'gpo', name: 'GPO', bnName: 'জিপিও', lat: 23.7280, lng: 90.4100 },
  'golap_shah_mazar': { id: 'golap_shah_mazar', name: 'Golap Shah Mazar', bnName: 'গোলাপ শাহ মাজার', lat: 23.7230, lng: 90.4100 },
  'naya_bazar': { id: 'naya_bazar', name: 'Naya Bazar', bnName: 'নয়া বাজার', lat: 23.7150, lng: 90.4050 },
  'babubazar': { id: 'babubazar', name: 'Babubazar', bnName: 'বাবুবাজার', lat: 23.708804, lng: 90.401636 },
  'keraniganj': { id: 'keraniganj', name: 'Keraniganj', bnName: 'কেরানীগঞ্জ', lat: 23.701278, lng: 90.397486 },
  'bosila': { id: 'bosila', name: 'Bosila', bnName: 'বসিলা', lat: 23.7500, lng: 90.3450 },
  'diabari': { id: 'diabari', name: 'Diabari', bnName: 'ডায়াবাড়ি', lat: 23.8800, lng: 90.3800 },
  'rupnagar': { id: 'rupnagar', name: 'Rupnagar', bnName: 'রূপনগর', lat: 23.8150, lng: 90.3550 },
  'rupnagar_abashik': { id: 'rupnagar_abashik', name: 'Rupnagar Abashik', bnName: 'রূপনগর আবাসিক', lat: 23.8150, lng: 90.3550 },
  'beribadh': { id: 'beribadh', name: 'Beribadh', bnName: 'বেড়িবাঁধ', lat: 23.8300, lng: 90.3400 },
  'birulia': { id: 'birulia', name: 'Birulia', bnName: 'বিরুলিয়া', lat: 23.8500, lng: 90.3300 },
  'ashulia': { id: 'ashulia', name: 'Ashulia', bnName: 'আশুলিয়া', lat: 23.8900, lng: 90.3000 },
  'zirabo': { id: 'zirabo', name: 'Zirabo', bnName: 'জিরাবো', lat: 23.913008, lng: 90.319143 },
  'fantasy_kingdom': { id: 'fantasy_kingdom', name: 'Fantasy Kingdom', bnName: 'ফ্যান্টাসি কিংডম', lat: 23.9350, lng: 90.2850 },
  'nandan_park': { id: 'nandan_park', name: 'Nandan Park', bnName: 'নন্দন পার্ক', lat: 24.0000, lng: 90.2500 },
  'baipayl': { id: 'baipayl', name: 'Baipayl', bnName: 'বাইপাইল', lat: 23.938078, lng: 90.269763 },
  'nobinagar': { id: 'nobinagar', name: 'Nobinagar', bnName: 'নবীনগর', lat: 23.911852, lng: 90.260500 },
  'konabari': { id: 'konabari', name: 'Konabari', bnName: 'কোনাবাড়ি', lat: 24.0200, lng: 90.3200 },
  'dhour': { id: 'dhour', name: 'Dhour', bnName: 'ধৌর', lat: 23.8750, lng: 90.3600 },
  'kamarpara': { id: 'kamarpara', name: 'Kamarpara', bnName: 'কামারপাড়া', lat: 23.8850, lng: 90.3850 },
  'maowa': { id: 'maowa', name: 'Maowa', bnName: 'মাওয়া', lat: 23.4700, lng: 90.2600 },
  'munshiganj': { id: 'munshiganj', name: 'Munshiganj', bnName: 'মুন্সীগঞ্জ', lat: 23.5435, lng: 90.5312 },
  'vashantek': { id: 'vashantek', name: 'Vashantek', bnName: 'ভাসানটেক', lat: 23.8180, lng: 90.3850 },
  'jahangir_gate': { id: 'jahangir_gate', name: 'Jahangir Gate', bnName: 'জাহাঙ্গীর গেট', lat: 23.775766, lng: 90.389945 },
  'staff_road': { id: 'staff_road', name: 'Staff Road', bnName: 'স্টাফ রোড', lat: 23.8000, lng: 90.4020 },
  'sainik_club': { id: 'sainik_club', name: 'Sainik Club', bnName: 'সৈনিক ক্লাব', lat: 23.7950, lng: 90.4000 },
  'shishu_mela': { id: 'shishu_mela', name: 'Shishu Mela', bnName: 'শিশু মেলা', lat: 23.772993, lng: 90.367162 },


  'shibu_market': { id: 'shibu_market', name: 'Shibu Market', bnName: 'শিবু মার্কেট', lat: 23.6500, lng: 90.4800 },
  'chashara': { id: 'chashara', name: 'Chashara', bnName: 'চাষাড়া', lat: 23.6200, lng: 90.5000 },
  'dhamrai': { id: 'dhamrai', name: 'Dhamrai', bnName: 'ধামরাই', lat: 23.9200, lng: 90.2100 },
  'manikganj': { id: 'manikganj', name: 'Manikganj', bnName: 'মানিকগঞ্জ', lat: 23.8600, lng: 90.0000 },
  'chiriyakhana': { id: 'chiriyakhana', name: 'National Zoo (Chiriyakhana)', bnName: 'জাতীয় চিড়িয়াখানা', lat: 23.8150, lng: 90.3500 },
  'shib_bari': { id: 'shib_bari', name: 'Shib Bari', bnName: 'শিব বাড়ি', lat: 24.0050, lng: 90.4000 },
  'ghatar_char': { id: 'ghatar_char', name: 'Ghatar Char', bnName: 'ঘাটার চর', lat: 23.7450, lng: 90.3400 },
  'paturia': { id: 'paturia', name: 'Paturia', bnName: 'পাটুরিয়া', lat: 23.7800, lng: 89.6300 },
  'tajmahal_road': { id: 'tajmahal_road', name: 'Tajmahal Road', bnName: 'তাজমহল রোড', lat: 23.7650, lng: 90.3650 },
  'arambagh': { id: 'arambagh', name: 'Arambagh', bnName: 'আরামবাগ', lat: 23.7300, lng: 90.4200 },
  'jurain': { id: 'jurain', name: 'Jurain', bnName: 'জুরাইন', lat: 23.6900, lng: 90.4300 },
  'dayaganj': { id: 'dayaganj', name: 'Dayaganj', bnName: 'দয়াগঞ্জ', lat: 23.7000, lng: 90.4250 },
  'victoria_park': { id: 'victoria_park', name: 'Victoria Park', bnName: 'ভিক্টোরিয়া পার্ক', lat: 23.7080, lng: 90.4100 },
  'gandaria': { id: 'gandaria', name: 'Gandaria', bnName: 'গেন্ডারিয়া', lat: 23.7020, lng: 90.4220 },
  'tikatuli': { id: 'tikatuli', name: 'Tikatuli', bnName: 'টিকাটুলি', lat: 23.7180, lng: 90.4200 },
  'hasnabad': { id: 'hasnabad', name: 'Hasnabad', bnName: 'হাসনাবাদ', lat: 23.6700, lng: 90.4200 },
  'nimtola': { id: 'nimtola', name: 'Nimtola', bnName: 'নিমতলা', lat: 23.5500, lng: 90.3000 },
  'sreenagar': { id: 'sreenagar', name: 'Sreenagar', bnName: 'শ্রীনগর', lat: 23.5300, lng: 90.2800 },
  'kuchimura': { id: 'kuchimura', name: 'Kuchimura', bnName: 'কুচিমুড়া', lat: 23.6000, lng: 90.3500 },
  'rajendrapur': { id: 'rajendrapur', name: 'Rajendrapur', bnName: 'রাজেন্দ্রপুর', lat: 24.0800, lng: 90.3800 },
  'rajarbag': { id: 'rajarbag', name: 'Rajarbag', bnName: 'রাজারবাগ', lat: 23.739767, lng: 90.420006 },
  'fokirapul': { id: 'fokirapul', name: 'Fokirapul', bnName: 'ফকিরাপুল', lat: 23.734861, lng: 90.417244 },
  'gulshan_bridge': { id: 'gulshan_bridge', name: 'Gulshan Bridge', bnName: 'গুলশান ব্রিজ', lat: 23.7850, lng: 90.4100 },
  'dhakeshwari': { id: 'dhakeshwari', name: 'Dhakeshwari', bnName: 'ঢাকেশ্বরী', lat: 23.7250, lng: 90.3900 },
  'panthapath': { id: 'panthapath', name: 'Panthapath', bnName: 'পন্থপথ', lat: 23.751652, lng: 90.385700 },
  'bata_signal': { id: 'bata_signal', name: 'Bata Signal', bnName: 'বাটা সিগনাল', lat: 23.7400, lng: 90.3900 },
  'katabon': { id: 'katabon', name: 'Katabon', bnName: 'কাটাবন', lat: 23.7380, lng: 90.3900 },
  'salimullah_road': { id: 'salimullah_road', name: 'Salimullah Road', bnName: 'সলিমুল্লাহ রোড', lat: 23.7630, lng: 90.3620 },
  'jakir_hossen_road': { id: 'jakir_hossen_road', name: 'Jakir Hossen Road', bnName: 'জাকির হোসেন রোড', lat: 23.7640, lng: 90.3640 },
  'baitul_mukarram': { id: 'baitul_mukarram', name: 'Baitul Mukarram', bnName: 'বাইতুল মুকার্রম', lat: 23.7280, lng: 90.4130 },
  'jagannath_university': { id: 'jagannath_university', name: 'Jagannath University', bnName: 'জগন্নাথ বিশ্ববিদ্যালয়', lat: 23.7090, lng: 90.4110 },
  'washpur': { id: 'washpur', name: 'Washpur', bnName: 'ওয়াশপুর', lat: 23.7580, lng: 90.3420 },


  'town_hall': { id: 'town_hall', name: 'Town Hall', bnName: 'টাউন হল', lat: 23.7650, lng: 90.3620 },

  // Chittagong Road Corridor (South-East)

  'kanchpur': { id: 'kanchpur', name: 'Kanchpur', bnName: 'কাঁচপুর', lat: 23.6950, lng: 90.5100 },
  'dholairpar': { id: 'dholairpar', name: 'Dholairpar', bnName: 'ধোলাইরপাড়', lat: 23.6980, lng: 90.4320 },
  'konapara': { id: 'konapara', name: 'Konapara', bnName: 'কোনাপাড়া', lat: 23.7100, lng: 90.4550 },
  'kajla': { id: 'kajla', name: 'Kajla', bnName: 'কাজলা', lat: 23.7080, lng: 90.4400 },
  'manikdi': { id: 'manikdi', name: 'Manikdi', bnName: 'মানিকদি', lat: 23.8250, lng: 90.3900 },
  'pagla': { id: 'pagla', name: 'Pagla', bnName: 'পাগলা', lat: 23.6550, lng: 90.4350 },
  'new_jail': { id: 'new_jail', name: 'New Jail (Keraniganj)', bnName: 'নতুন জেল', lat: 23.6600, lng: 90.3700 },
  'kamrangirchar': { id: 'kamrangirchar', name: 'Kamrangirchar', bnName: 'কমরাঙ্গিরচর', lat: 23.7100, lng: 90.3700 },
  'amulia': { id: 'amulia', name: 'Amulia', bnName: 'আমুলিয়া', lat: 23.7300, lng: 90.4700 },
  'sreepur': { id: 'sreepur', name: 'Sreepur', bnName: 'শ্রীপুর', lat: 24.1900, lng: 90.4700 },
  'kapasia': { id: 'kapasia', name: 'Kapasia', bnName: 'কাপাসিয়া', lat: 24.1000, lng: 90.5700 },
  'beraid': { id: 'beraid', name: 'Beraid', bnName: 'বেরাইদ', lat: 23.7900, lng: 90.4600 },
  'meghna_ghat': { id: 'meghna_ghat', name: 'Meghna Ghat', bnName: 'মেঘনা ঘাট', lat: 23.6000, lng: 90.6000 },
  'sonargaon': { id: 'sonargaon', name: 'Sonargaon', bnName: 'সোনারগাঁও', lat: 23.6300, lng: 90.6000 },
  'vulta': { id: 'vulta', name: 'Vulta', bnName: 'ভুলতা', lat: 23.8000, lng: 90.5800 },
  'rupganj': { id: 'rupganj', name: 'Rupganj', bnName: 'রূপগঞ্জ', lat: 23.7800, lng: 90.5500 },
  'fatullah': { id: 'fatullah', name: 'Fatullah', bnName: 'ফতুল্লাহ', lat: 23.6300, lng: 90.4800 },
  'panchabati': { id: 'panchabati', name: 'Panchabati', bnName: 'পঞ্চবটী', lat: 23.6300, lng: 90.4600 },
  'dhaleshwar': { id: 'dhaleshwar', name: 'Dhaleshwar', bnName: 'ধলেশ্বর', lat: 23.6500, lng: 90.3000 },
  'narayanganj': { id: 'narayanganj', name: 'Narayanganj', bnName: 'নারায়ণগঞ্জ', lat: 23.6230, lng: 90.5000 },
  'link_road': { id: 'link_road', name: 'Link Road', bnName: 'লিংক রোড', lat: 23.6400, lng: 90.4900 },
  'taltola': { id: 'taltola', name: 'Taltola', bnName: 'তালতলা', lat: 23.7720, lng: 90.3800 },
  'kalampur': { id: 'kalampur', name: 'Kalampur', bnName: 'কালামপুর', lat: 23.9000, lng: 90.1500 },
  'savar_cantonment': { id: 'savar_cantonment', name: 'Savar Cantonment', bnName: 'সাভার ক্যান্টনমেন্ট', lat: 23.8800, lng: 90.2600 },
  'shimultola': { id: 'shimultola', name: 'Shimultola', bnName: 'শিমুলতলা', lat: 23.8600, lng: 90.2700 },
  'jamgora': { id: 'jamgora', name: 'Jamgora', bnName: 'জামগোড়া', lat: 23.9300, lng: 90.2800 },
  'palli_bidyut': { id: 'palli_bidyut', name: 'Palli Bidyut', bnName: 'পল্লী বিদ্যুৎ', lat: 23.9000, lng: 90.2600 },
  'mirpur_dohs': { id: 'mirpur_dohs', name: 'Mirpur DOHS', bnName: 'মিরপুর ডোহস', lat: 23.8300, lng: 90.3700 },
  '300_feet': { id: '300_feet', name: '300 Feet', bnName: '৩০০ ফুট', lat: 23.8200, lng: 90.4500 },

  'police_plaza': { id: 'police_plaza', name: 'Police Plaza', bnName: 'পুলিশ প্লাজা', lat: 23.7700, lng: 90.4100 },
  'duairipara': { id: 'duairipara', name: 'Duairipara', bnName: 'দুয়ারিপাড়া', lat: 23.8200, lng: 90.3600 },
  'shial_bari': { id: 'shial_bari', name: 'Shial Bari', bnName: 'শিয়াল বাড়ি', lat: 23.8100, lng: 90.3500 },
  'proshika_moor': { id: 'proshika_moor', name: 'Proshika Moor', bnName: 'প্রশিকা মোড়', lat: 23.8100, lng: 90.3600 },
  'zia_uddyan': { id: 'zia_uddyan', name: 'Zia Uddyan', bnName: 'জিয়া উদ্দ্যান', lat: 23.765679, lng: 90.383138 },
  'old_airport': { id: 'old_airport', name: 'Old Airport', bnName: 'পুরানো বিমানবন্দর', lat: 23.7700, lng: 90.3900 },
  'metro_hall': { id: 'metro_hall', name: 'Metro Hall', bnName: 'মেট্রো হল', lat: 23.6300, lng: 90.5000 },
  'jalkuri': { id: 'jalkuri', name: 'Jalkuri', bnName: 'জালকুড়ি', lat: 23.6600, lng: 90.4800 },
  'bangladesh_bank': { id: 'bangladesh_bank', name: 'Bangladesh Bank', bnName: 'বাংলাদেশ ব্যাংক', lat: 23.7300, lng: 90.4200 },
  'barmi': { id: 'barmi', name: 'Barmi', bnName: 'বরমি', lat: 24.1500, lng: 90.4500 },
  'joydebpur': { id: 'joydebpur', name: 'Joydebpur', bnName: 'জয়দেবপুর', lat: 23.9900, lng: 90.4200 },
  'surabari': { id: 'surabari', name: 'Surabari', bnName: 'সুরাবাড়ি', lat: 24.0000, lng: 90.3000 },
  'narsinghpur': { id: 'narsinghpur', name: 'Narsinghpur', bnName: 'নরসিংপুর', lat: 23.9500, lng: 90.2800 },
  'jarun': { id: 'jarun', name: 'Jarun', bnName: 'জারুন', lat: 24.0100, lng: 90.3100 },
  'dhupkhola': { id: 'dhupkhola', name: 'Dhupkhola', bnName: 'ধুপখোলা', lat: 23.7000, lng: 90.4200 },
  'golapbagh': { id: 'golapbagh', name: 'Golapbagh', bnName: 'গোলাপবাগ', lat: 23.7200, lng: 90.4300 },
  'janapoth': { id: 'janapoth', name: 'Janapoth Moor', bnName: 'জনপথ মোড়', lat: 23.7100, lng: 90.4300 },
  'shonbari': { id: 'shonbari', name: 'Shonbari', bnName: 'সোনবাড়ি', lat: 23.9500, lng: 90.3000 },
  'ichapura': { id: 'ichapura', name: 'Ichapura', bnName: 'ইছাপুরা', lat: 23.8500, lng: 90.5000 },
  'kanchan_bridge': { id: 'kanchan_bridge', name: 'Kanchan Bridge', bnName: 'কাঞ্চন ব্রিজ', lat: 23.8200, lng: 90.5200 },
  'nila_market': { id: 'nila_market', name: 'Nila Market', bnName: 'নীলা মার্কেট', lat: 23.8200, lng: 90.4800 },
  'charighat': { id: 'charighat', name: 'Ghatar Char', bnName: 'ঘাটার চর', lat: 23.7500, lng: 90.3400 },
  'tolarbag': { id: 'tolarbag', name: 'Tolarbag', bnName: 'তোলারবাগ', lat: 23.7900, lng: 90.3500 },
  'bangla_college': { id: 'bangla_college', name: 'Bangla College', bnName: 'বাংলা কলেজ', lat: 23.7800, lng: 90.3500 },
  'darussalam': { id: 'darussalam', name: 'Darussalam', bnName: 'দারুসসালাম', lat: 23.7800, lng: 90.3500 },
  'manik_mia': { id: 'manik_mia', name: 'Manik Mia Avenue', bnName: 'মানিক মিয়া এভিনিউ', lat: 23.7600, lng: 90.3800 },
  'khamar_bari': { id: 'khamar_bari', name: 'Khamar Bari', bnName: 'খামার বাড়ি', lat: 23.7600, lng: 90.3900 },
  'khilgaon_flyover': { id: 'khilgaon_flyover', name: 'Khilgaon Flyover', bnName: 'খিলগাঁও ফ্লাইওভার', lat: 23.7500, lng: 90.4200 },
  'sikder_medical': { id: 'sikder_medical', name: 'Sikder Medical', bnName: 'সিকদার মেডিকেল', lat: 23.7400, lng: 90.3600 },
  'kalabagan': { id: 'kalabagan', name: 'Kalabagan', bnName: 'কলাবাগান', lat: 23.7450, lng: 90.3820 },
  'hazaribag': { id: 'hazaribag', name: 'Hazaribag', bnName: 'হাজারীবাগ', lat: 23.7300, lng: 90.3700 },

  'star_kabab': { id: 'star_kabab', name: 'Star Kabab', bnName: 'স্টার কাবাব', lat: 23.747872, lng: 90.370378 },
  'bot_tola': { id: 'bot_tola', name: 'Bot Tola', bnName: 'বট তলা', lat: 23.7520, lng: 90.3920 },
  'cantonment': { id: 'cantonment', name: 'Cantonment', bnName: 'ক্যান্টনমেন্ট', lat: 23.8200, lng: 90.4000 },
  'adamjee_college': { id: 'adamjee_college', name: 'Adamjee College', bnName: 'আদমজী কলেজ', lat: 23.7947, lng: 90.3933 },
  'workshop': { id: 'workshop', name: 'Workshop', bnName: 'ওয়ার্কশপ', lat: 23.7750, lng: 90.3920 },
  'saudi_colony': { id: 'saudi_colony', name: 'Saudi Colony', bnName: 'সৌদি কলোনি', lat: 23.7720, lng: 90.3930 },
  'kuril_chourasta': { id: 'kuril_chourasta', name: 'Kuril Chourasta', bnName: 'কুড়িল চৌরাস্তা', lat: 23.8220, lng: 90.4200 },
  'ittefaq_moor': { id: 'ittefaq_moor', name: 'Ittefaq Moor', bnName: 'ইত্তেফাক মোড়', lat: 23.7280, lng: 90.4200 },
  'dainik_bangla_moor': { id: 'dainik_bangla_moor', name: 'Dainik Bangla Moor', bnName: 'দৈনিক বাংলা মোড়', lat: 23.7300, lng: 90.4180 },
  'ray_saheb_bazar': { id: 'ray_saheb_bazar', name: 'Ray Saheb Bazar', bnName: 'রায় সাহেব বাজার', lat: 23.7120, lng: 90.4080 },
  'zirani_bazar': { id: 'zirani_bazar', name: 'Zirani Bazar', bnName: 'জিরানী বাজার', lat: 23.993767, lng: 90.255110 },
  'tarabo': { id: 'tarabo', name: 'Tarabo', bnName: 'তারাবো', lat: 23.7285, lng: 90.5173 },
  'khidma_hospital': { id: 'khidma_hospital', name: 'Khidma Hospital', bnName: 'খিদমা হাসপাতাল', lat: 23.749002, lng: 90.420231 },
  'baunia': { id: 'baunia', name: 'Baunia', bnName: 'বাউনিয়া', lat: 23.7988, lng: 90.3847 },
  'tongi_college_gate': { id: 'tongi_college_gate', name: 'Tongi College Gate', bnName: 'টঙ্গী কলেজ গেট', lat: 23.8950, lng: 90.4050 },
  'bhogra': { id: 'bhogra', name: 'Bhogra', bnName: 'ভোগড়া', lat: 23.9850, lng: 90.4100 },
  'kazla': { id: 'kazla', name: 'Kazla', bnName: 'কাজলা', lat: 23.7050, lng: 90.4400 },
  'bashundhara_300_feet': { id: 'bashundhara_300_feet', name: 'Bashundhara 300 Feet', bnName: 'বসুন্ধরা ৩০০ ফিট', lat: 23.8180, lng: 90.4480 },
  'showari_ghat': { id: 'showari_ghat', name: 'Showari Ghat', bnName: 'সোয়ারী ঘাট', lat: 23.7100, lng: 90.3900 },
  'buet_market': { id: 'buet_market', name: 'BUET Market', bnName: 'বুয়েট মার্কেট', lat: 23.8180, lng: 90.3660 },
  'kadamtali': { id: 'kadamtali', name: 'Kadamtali', bnName: 'কদমতলী', lat: 23.6650, lng: 90.3850 },

  // Savar-Hemayetpur corridor intermediate stops
  'rajfulbaria': { id: 'rajfulbaria', name: 'Rajfulbaria', bnName: 'রাজফুলবাড়ীয়া', lat: 23.8300, lng: 90.2750 },
  'nabinagar_savar': { id: 'nabinagar_savar', name: 'Nabinagar (Savar)', bnName: 'নবীনগর (সাভার)', lat: 23.8350, lng: 90.2650 },
  'bank_town': { id: 'bank_town', name: 'Bank Town', bnName: 'ব্যাংক টাউন', lat: 23.8420, lng: 90.2580 },

  // Hemayetpur to Paturia - Dhaka-Aricha Highway (N5) stops
  'aminbazar_bridge': { id: 'aminbazar_bridge', name: 'Aminbazar Bridge', bnName: 'আমিনবাজার ব্রিজ', lat: 23.7845, lng: 90.3410 },
  'baipail_more': { id: 'baipail_more', name: 'Baipail More', bnName: 'বাইপাইল মোড়', lat: 23.9450, lng: 90.2650 },
  'savar_bus_stand': { id: 'savar_bus_stand', name: 'Savar Bus Stand', bnName: 'সাভার বাস স্ট্যান্ড', lat: 23.8480, lng: 90.2620 },
  'nabinagar_bazar': { id: 'nabinagar_bazar', name: 'Nabinagar Bazar', bnName: 'নবীনগর বাজার', lat: 23.9080, lng: 90.2520 },
  'mirzapur_savar': { id: 'mirzapur_savar', name: 'Mirzapur (Savar)', bnName: 'মির্জাপুর', lat: 23.9350, lng: 90.2400 },
  'shimulia': { id: 'shimulia', name: 'Shimulia', bnName: 'শিমুলিয়া', lat: 23.9200, lng: 90.1800 },
  'singair': { id: 'singair', name: 'Singair', bnName: 'সিঙ্গাইর', lat: 23.7950, lng: 90.1200 },
  'manikganj_bazar': { id: 'manikganj_bazar', name: 'Manikganj Bazar', bnName: 'মানিকগঞ্জ বাজার', lat: 23.8650, lng: 90.0050 },
  // Note: aricha_ghat already exists in Regional section below

  // Additional Mirpur area stops
  'mirpur3': { id: 'mirpur3', name: 'Mirpur 3', bnName: 'মিরপুর ৩', lat: 23.8000, lng: 90.3580 },
  'mirpur4': { id: 'mirpur4', name: 'Mirpur 4', bnName: 'মিরপুর ৪', lat: 23.7980, lng: 90.3600 },
  'mirpur5': { id: 'mirpur5', name: 'Mirpur 5', bnName: 'মিরপুর ৫', lat: 23.8020, lng: 90.3610 },
  'mirpur8': { id: 'mirpur8', name: 'Mirpur 8', bnName: 'মিরপুর ৮', lat: 23.8110, lng: 90.3640 },
  'mirpur9': { id: 'mirpur9', name: 'Mirpur 9', bnName: 'মিরপুর ৯', lat: 23.8090, lng: 90.3660 },

  // Uttara area intermediate stops
  'uttara_sector1': { id: 'uttara_sector1', name: 'Uttara Sector 1', bnName: 'উত্তরা সেক্টর ১', lat: 23.8650, lng: 90.3900 },
  'uttara_sector3': { id: 'uttara_sector3', name: 'Uttara Sector 3', bnName: 'উত্তরা সেক্টর ৩', lat: 23.8680, lng: 90.3920 },
  'uttara_sector5': { id: 'uttara_sector5', name: 'Uttara Sector 5', bnName: 'উত্তরা সেক্টর ৫', lat: 23.8700, lng: 90.3950 },
  'uttara_sector7': { id: 'uttara_sector7', name: 'Uttara Sector 7', bnName: 'উত্তরা সেক্টর ৭', lat: 23.8720, lng: 90.3970 },
  'uttara_sector10': { id: 'uttara_sector10', name: 'Uttara Sector 10', bnName: 'উত্তরা সেক্টর ১০', lat: 23.8620, lng: 90.3980 },
  'uttara_sector12': { id: 'uttara_sector12', name: 'Uttara Sector 12', bnName: 'উত্তরা সেক্টর ১২', lat: 23.8600, lng: 90.4000 },

  // Gazipur-Tongi corridor
  'konabari_bus_stand': { id: 'konabari_bus_stand', name: 'Konabari Bus Stand', bnName: 'কোনাবাড়ি বাস স্ট্যান্ড', lat: 24.0180, lng: 90.3180 },
  'mirzapur': { id: 'mirzapur', name: 'Mirzapur', bnName: 'মির্জাপুর', lat: 24.0500, lng: 90.3500 },
  'hotapara': { id: 'hotapara', name: 'Hotapara', bnName: 'হোতাপাড়া', lat: 23.9200, lng: 90.4050 },
  'cherag_ali': { id: 'cherag_ali', name: 'Cherag Ali', bnName: 'চেরাগ আলী', lat: 23.9050, lng: 90.4030 },

  // Dhanmondi area intermediate stops
  'dhanmondi2': { id: 'dhanmondi2', name: 'Dhanmondi 2', bnName: 'ধানমন্ডি ২', lat: 23.7580, lng: 90.3700 },
  'dhanmondi4': { id: 'dhanmondi4', name: 'Dhanmondi 4', bnName: 'ধানমন্ডি ৪', lat: 23.7560, lng: 90.3720 },
  'dhanmondi5': { id: 'dhanmondi5', name: 'Dhanmondi 5', bnName: 'ধানমন্ডি ৫', lat: 23.7540, lng: 90.3740 },
  'dhanmondi8': { id: 'dhanmondi8', name: 'Dhanmondi 8', bnName: 'ধানমন্ডি ৮', lat: 23.7510, lng: 90.3760 },
  'dhanmondi9': { id: 'dhanmondi9', name: 'Dhanmondi 9', bnName: 'ধানমন্ডি ৯', lat: 23.7490, lng: 90.3770 },

  // Jatrabari-Demra corridor
  'shanir_akhra': { id: 'shanir_akhra', name: 'Shanir Akhra', bnName: 'শনির আখড়া', lat: 23.6980, lng: 90.4420 },
  'madartek': { id: 'madartek', name: 'Madartek', bnName: 'মদারটেক', lat: 23.7080, lng: 90.4380 },
  'kodom_foara': { id: 'kodom_foara', name: 'Kodom Foara', bnName: 'কদম ফোয়ারা', lat: 23.7020, lng: 90.4360 },

  // Mohakhali-Gulshan area
  'mohakhali_bus_stand': { id: 'mohakhali_bus_stand', name: 'Mohakhali Bus Stand', bnName: 'মহাখালী বাস স্ট্যান্ড', lat: 23.7800, lng: 90.4070 },
  'mohakhali_tb_gate': { id: 'mohakhali_tb_gate', name: 'Mohakhali TB Gate', bnName: 'মহাখালী টিবি গেট', lat: 23.7790, lng: 90.4060 },
  'mohakhali_flyover': { id: 'mohakhali_flyover', name: 'Mohakhali Flyover', bnName: 'মহাখালী ফ্লাইওভার', lat: 23.779177, lng: 90.398912 },

  // Old Dhaka area
  'lalbagh': { id: 'lalbagh', name: 'Lalbagh', bnName: 'লালবাগ', lat: 23.7180, lng: 90.3950 },
  'nazimuddin_road': { id: 'nazimuddin_road', name: 'Nazimuddin Road', bnName: 'নাজিমুদ্দিন রোড', lat: 23.7150, lng: 90.4020 },
  'kotwali': { id: 'kotwali', name: 'Kotwali', bnName: 'কোতোয়ালি', lat: 23.7100, lng: 90.4050 },
  'islampur': { id: 'islampur', name: 'Islampur', bnName: 'ইসলামপুর', lat: 23.7130, lng: 90.4000 },

  // Additional key stops
  'tejgaon': { id: 'tejgaon', name: 'Tejgaon', bnName: 'তেজগাঁও', lat: 23.7630, lng: 90.3950 },
  'tejgaon_industrial': { id: 'tejgaon_industrial', name: 'Tejgaon Industrial Area', bnName: 'তেজগাঁও শিল্পাঞ্চল', lat: 23.7650, lng: 90.3930 },
  'maghbazar': { id: 'maghbazar', name: 'Maghbazar', bnName: 'মগবাজার', lat: 23.7500, lng: 90.4100 },
  'moghbazar_crossing': { id: 'moghbazar_crossing', name: 'Moghbazar Crossing', bnName: 'মগবাজার মোড়', lat: 23.7510, lng: 90.4110 },
  'segunbagicha': { id: 'segunbagicha', name: 'Segunbagicha', bnName: 'সেগুনবাগিচা', lat: 23.7420, lng: 90.4000 },
  'hatirpool': { id: 'hatirpool', name: 'Hatirpool', bnName: 'হাতিরপুল', lat: 23.7480, lng: 90.3920 },

  // Uttara-Airport corridor
  'jasimuddin_square': { id: 'jasimuddin_square', name: 'Jasimuddin Square', bnName: 'জসীমউদ্দীন স্কয়ার', lat: 23.8610, lng: 90.3990 },
  'rajlakshmi_crossing': { id: 'rajlakshmi_crossing', name: 'Rajlakshmi Crossing', bnName: 'রাজলক্ষ্মী মোড়', lat: 23.8660, lng: 90.3985 },

  // Amin Bazar area


  // New stations from user feedback
  'cmh': { id: 'cmh', name: 'CMH', bnName: 'সিএমএইচ', lat: 23.7750, lng: 90.3950 },
  'air_hq': { id: 'air_hq', name: 'Air Head Quarter', bnName: 'এয়ার হেড কোয়ার্টার', lat: 23.7720, lng: 90.3920 },
  'garrison': { id: 'garrison', name: 'Garrison', bnName: 'গ্যারিসন', lat: 23.7800, lng: 90.3950 },
  'signal': { id: 'signal', name: 'Signal', bnName: 'সিগন্যাল', lat: 23.7850, lng: 90.3980 },
  'dhaka_uddan': { id: 'dhaka_uddan', name: 'Dhaka Uddan', bnName: 'ঢাকা উদ্যান', lat: 23.7550, lng: 90.3450 },
  'rainkhola': { id: 'rainkhola', name: 'Rainkhola', bnName: 'রাইনখোলা', lat: 23.8100, lng: 90.3500 },
  'coca_cola': { id: 'coca_cola', name: 'Coca Cola', bnName: 'কোকা কোলা', lat: 23.7950, lng: 90.4280 },
  'vatara_moor': { id: 'vatara_moor', name: 'Vatara Mor', bnName: 'ভাটারা মোড়', lat: 23.8000, lng: 90.4300 },
  'sayeed_nagar': { id: 'sayeed_nagar', name: 'Sayeed Nagar', bnName: 'সাঈদ নগর', lat: 23.8100, lng: 90.4400 },
  'kawla': { id: 'kawla', name: 'Kawla', bnName: 'কাওলা', lat: 23.8450, lng: 90.4050 },
  'city_center': { id: 'city_center', name: 'City Center', bnName: 'সিটি সেন্টার', lat: 23.7300, lng: 90.4150 },
  'banani_bazar': { id: 'banani_bazar', name: 'Banani Bazar', bnName: 'বনানী বাজার', lat: 23.7940, lng: 90.4060 },

  // Dhaka University & Medical
  'tsc': { id: 'tsc', name: 'TSC (Dhaka University)', bnName: 'টিএসসি', lat: 23.7330, lng: 90.3950 },
  'doyel_chattar': { id: 'doyel_chattar', name: 'Doyel Chattar', bnName: 'দোয়েল চত্বর', lat: 23.7280, lng: 90.4000 },
  'curzon_hall': { id: 'curzon_hall', name: 'Curzon Hall', bnName: 'কার্জন হল', lat: 23.7250, lng: 90.4020 },
  'dhaka_medical': { id: 'dhaka_medical', name: 'Dhaka Medical College', bnName: 'ঢাকা মেডিকেল', lat: 23.7230, lng: 90.3970 },
  'engineering_institute': { id: 'engineering_institute', name: 'Engineering Institute', bnName: 'ইঞ্জিনিয়ারিং ইনস্টিটিউট', lat: 23.7300, lng: 90.3980 },

  // Keraniganj & Old Dhaka
  'ati_bazar': { id: 'ati_bazar', name: 'Ati Bazar', bnName: 'আটি বাজার', lat: 23.7200, lng: 90.3500 },
  'ruhitpur': { id: 'ruhitpur', name: 'Ruhitpur', bnName: 'রুহিতপুর', lat: 23.6800, lng: 90.3000 },
  'jinira': { id: 'jinira', name: 'Jinira', bnName: 'জিঞ্জিরা', lat: 23.707060, lng: 90.400434 },
  'mitford': { id: 'mitford', name: 'Mitford Hospital', bnName: 'মিটফোর্ড', lat: 23.7100, lng: 90.3950 },

  // Regional
  aricha_ghat: { id: 'aricha_ghat', name: 'Aricha Ghat', bnName: 'আরিচা ঘাট', lat: 23.8500, lng: 89.7800 },
  padma_bridge_north: { id: 'padma_bridge_north', name: 'Padma Bridge North', bnName: 'পদ্মা সেতু উত্তর', lat: 23.4700, lng: 90.2600 },
  mondolpara: { id: 'mondolpara', name: 'Mondolpara', bnName: 'মন্ডলপাড়া', lat: 23.6100, lng: 90.5000 },
  salna: { id: 'salna', name: 'Salna', bnName: 'সালনা', lat: 24.0300, lng: 90.4000 },
  rajendrapur_chowrasta: { id: 'rajendrapur_chowrasta', name: 'Rajendrapur Chowrasta', bnName: 'রাজেন্দ্রপুর চৌরাস্তা', lat: 24.0800, lng: 90.4000 },

  // ===== MAJOR EDUCATIONAL INSTITUTIONS =====
  dhaka_university: { id: 'dhaka_university', name: 'Dhaka University', bnName: 'ঢাকা বিশ্ববিদ্যালয়', lat: 23.7340, lng: 90.3930 },
  buet: { id: 'buet', name: 'BUET', bnName: 'বুয়েট', lat: 23.7266, lng: 90.3925 },
  jahangirnagar_university: { id: 'jahangirnagar_university', name: '  Jahangirnagar University', bnName: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়', lat: 23.8813, lng: 90.2660 },
  nsu: { id: 'nsu', name: 'North South University', bnName: 'নর্থ সাউথ বিশ্ববিদ্যালয়', lat: 23.8120, lng: 90.4250 },
  brac_university: { id: 'brac_university', name: 'BRAC University', bnName: 'ব্র্যাক বিশ্ববিদ্যালয়', lat: 23.7808, lng: 90.4067 },
  iub: { id: 'iub', name: 'Independent University Bangladesh', bnName: 'ইন্ডিপেন্ডেন্ট ইউনিভার্সিটি', lat: 23.8119, lng: 90.4252 },
  aiub: { id: 'aiub', name: 'AIUB', bnName: 'এআইইউবি', lat: 23.7504, lng: 90.3919 },
  uttara_university: { id: 'uttara_university', name: 'Uttara University', bnName: 'উত্তরা বিশ্ববিদ্যালয়', lat: 23.8697, lng: 90.3870 },

  // ===== MEDICAL & HEALTHCARE (Expanded) =====
  bsmmu: { id: 'bsmmu', name: 'BSMMU (PG Hospital)', bnName: 'বিএসএমএমইউ (পিজি)', lat: 23.7379, lng: 90.3980 },
  bir_dem: { id: 'bir_dem', name: 'BIRDEM Hospital', bnName: 'বারডেম হাসপাতাল', lat: 23.7381, lng: 90.3961 },
  square_hospital: { id: 'square_hospital', name: 'Square Hospital', bnName: 'স্কয়ার হাসপাতাল', lat: 23.7510, lng: 90.3813 },
  labaid_hospital: { id: 'labaid_hospital', name: 'Labaid Hospital', bnName: 'লাবএইড হাসপাতাল', lat: 23.7410, lng: 90.3820 },
  united_hospital: { id: 'united_hospital', name: 'United Hospital', bnName: 'ইউনাইটেড হাসপাতাল', lat: 23.8147, lng: 90.4240 },
  evercare_hospital: { id: 'evercare_hospital', name: 'Evercare Hospital', bnName: 'এভারকেয়ার হাসপাতাল', lat: 23.8115, lng: 90.4312 },
  kurmitola_hospital: { id: 'kurmitola_hospital', name: 'Kurmitola General Hospital', bnName: 'কুর্মিটোলা জেনারেল হাসপাতাল', lat: 23.8242, lng: 90.4085 },
  holy_family: { id: 'holy_family', name: 'Holy Family Hospital', bnName: 'হলি ফ্যামিলি হাসপাতাল', lat: 23.7460, lng: 90.4010 },
  ssmc: { id: 'ssmc', name: 'Sir Salimullah Medical College', bnName: 'স্যার সলিমুল্লাহ মেডিকেল', lat: 23.7100, lng: 90.4000 },
  suhrawardy_hospital: { id: 'suhrawardy_hospital', name: 'Shaheed Suhrawardy Medical College', bnName: 'শহীদ সোহরাওয়ার্দী হাসপাতাল', lat: 23.7705, lng: 90.3722 },
  pangu_hospital: { id: 'pangu_hospital', name: 'Pangu Hospital (NITOR)', bnName: 'পঙ্গু হাসপাতাল', lat: 23.7712, lng: 90.3695 },
  shishu_hospital: { id: 'shishu_hospital', name: 'Dhaka Shishu Hospital', bnName: 'ঢাকা শিশু হাসপাতাল', lat: 23.7725, lng: 90.3682 },
  eye_hospital: { id: 'eye_hospital', name: 'National Institute of Ophthalmology', bnName: 'জাতীয় চক্ষু বিজ্ঞান ইনস্টিটিউট', lat: 23.7735, lng: 90.3705 },
  cancer_hospital: { id: 'cancer_hospital', name: 'National Institute of Cancer Research', bnName: 'জাতীয় ক্যান্সার ইনস্টিটিউট', lat: 23.7772, lng: 90.4005 },
  chest_hospital: { id: 'chest_hospital', name: 'Chest Hospital (NIDCH)', bnName: 'বক্ষব্যাধি হাসপাতাল', lat: 23.7760, lng: 90.4020 },
  mental_hospital: { id: 'mental_hospital', name: 'National Institute of Mental Health', bnName: 'জাতীয় মানসিক স্বাস্থ্য ইনস্টিটিউট', lat: 23.7722, lng: 90.3665 },
  mugda_medical: { id: 'mugda_medical', name: 'Mugda Medical College Hospital', bnName: 'মুগদা মেডিকেল হাসপাতাল', lat: 23.7255, lng: 90.4352 },
  ibn_sina_dhanmondi: { id: 'ibn_sina_dhanmondi', name: 'Ibn Sina Hospital (Dhanmondi)', bnName: 'ইবনে সিনা (ধানমন্ডি)', lat: 23.7495, lng: 90.3705 },
  ibn_sina_kalyanpur: { id: 'ibn_sina_kalyanpur', name: 'Ibn Sina Medical College (Kalyanpur)', bnName: 'ইবনে সিনা (কল্যাণপুর)', lat: 23.7820, lng: 90.3580 },
  popular_dhanmondi: { id: 'popular_dhanmondi', name: 'Popular Diagnostic Center (Dhanmondi)', bnName: 'পপুলার (ধানমন্ডি)', lat: 23.7450, lng: 90.3815 },
  dmch: { id: 'dmch', name: 'Dhaka Medical College Hospital', bnName: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', lat: 23.7230, lng: 90.3970 },
  burn_institute: { id: 'burn_institute', name: 'Sheikh Hasina National Institute of Burn', bnName: 'শেখ হাসিনা বার্ন ইনস্টিটিউট', lat: 23.7215, lng: 90.3995 },
  nicvd: { id: 'nicvd', name: 'National Institute of Cardiovascular Diseases', bnName: 'জাতীয় হৃদরোগ ইনস্টিটিউট', lat: 23.7710, lng: 90.3715 },
  nikdu: { id: 'nikdu', name: 'National Institute of Kidney Diseases', bnName: 'জাতীয় কিডনি ইনস্টিটিউট', lat: 23.7720, lng: 90.3725 },
  nins: { id: 'nins', name: 'National Institute of Neurosciences', bnName: 'ন্যাশনাল ইনস্টিটিউট অব নিউরোসায়েন্স', lat: 23.7730, lng: 90.3695 },
  anwar_khan: { id: 'anwar_khan', name: 'Anwar Khan Modern Medical College', bnName: 'আনোয়ার খান মডার্ন মেডিকেল', lat: 23.7445, lng: 90.3835 },
  central_hospital: { id: 'central_hospital', name: 'Central Hospital (Dhanmondi)', bnName: 'সেন্ট্রাল হাসপাতাল', lat: 23.7435, lng: 90.3855 },
  green_life: { id: 'green_life', name: 'Green Life Medical College', bnName: 'গ্রীন লাইফ মেডিকেল কলেজ', lat: 23.7425, lng: 90.3845 },
  bangladesh_medical: { id: 'bangladesh_medical', name: 'Bangladesh Medical College', bnName: 'বাংলাদেশ মেডিকেল কলেজ', lat: 23.7505, lng: 90.3715 },
  samorita_hospital: { id: 'samorita_hospital', name: 'Samorita Hospital', bnName: 'শমরিতা হাসপাতাল', lat: 23.7515, lng: 90.3865 },
  brb_hospital: { id: 'brb_hospital', name: 'BRB Hospital (Panthapath)', bnName: 'বিআরবি হাসপাতাল', lat: 23.7525, lng: 90.3875 },
  impulse_hospital: { id: 'impulse_hospital', name: 'Impulse Hospital', bnName: 'ইমপালস হাসপাতাল', lat: 23.7645, lng: 90.3895 },
  metropolitan_hospital: { id: 'metropolitan_hospital', name: 'Metropolitan Hospital (Mohakhali)', bnName: 'মেট্রোপলিটন হাসপাতাল', lat: 23.7765, lng: 90.4015 },
  universal_medical: { id: 'universal_medical', name: 'Universal Medical College', bnName: 'ইউনিভার্সাল মেডিকেল কলেজ', lat: 23.7745, lng: 90.4045 },
  national_heart_foundation: { id: 'national_heart_foundation', name: 'National Heart Foundation', bnName: 'ন্যাশনাল হার্ট ফাউন্ডেশন', lat: 23.8055, lng: 90.3555 },
  kidney_foundation: { id: 'kidney_foundation', name: 'Kidney Foundation Hospital', bnName: 'কিডনি ফাউন্ডেশন হাসপাতাল', lat: 23.8065, lng: 90.3545 },
  delta_hospital: { id: 'delta_hospital', name: 'Delta Hospital (Mirpur)', bnName: 'ডেল্টা হাসপাতাল', lat: 23.7855, lng: 90.3525 },
  aichi_medical: { id: 'aichi_medical', name: 'Aichi Medical College', bnName: 'আইচি মেডিকেল কলেজ', lat: 23.8825, lng: 90.3855 },
  uttara_adhunik: { id: 'uttara_adhunik', name: 'Uttara Adhunik Medical College', bnName: 'উত্তরা আধুনিক মেডিকেল কলেজ', lat: 23.8715, lng: 90.3955 },
  japan_bangla: { id: 'japan_bangla', name: 'Japan Bangladesh Friendship Hospital', bnName: 'জাপান বাংলাদেশ ফ্রেন্ডশিপ হাসপাতাল', lat: 23.7421, lng: 90.3755 },
  sikder_medical_hosp: { id: 'sikder_medical_hosp', name: 'Sikder Medical College Hospital', bnName: 'সিকদার মেডিকেল কলেজ হাসপাতাল', lat: 23.7405, lng: 90.3625 },
  icddrb: { id: 'icddrb', name: 'ICDDR,B (Cholera Hospital)', bnName: 'আইসিডিডিআর,বি', lat: 23.7785, lng: 90.4065 },
  asgar_ali: { id: 'asgar_ali', name: 'Asgar Ali Hospital', bnName: 'আসগর আলী হাসপাতাল', lat: 23.7025, lng: 90.4285 },
  addin_hospital: { id: 'addin_hospital', name: 'Ad-din Women\'s Medical College', bnName: 'আদ-দ্বীন হাসপাতাল', lat: 23.7485, lng: 90.4025 },
  dhaka_community_hosp: { id: 'dhaka_community_hosp', name: 'Dhaka Community Hospital', bnName: 'ঢাকা কমিউনিটি হাসপাতাল', lat: 23.7475, lng: 90.4015 },
  labaid_gulshan: { id: 'labaid_gulshan', name: 'Labaid Specialized Hospital (Gulshan)', bnName: 'লাবএইড (গুলশান)', lat: 23.7815, lng: 90.4165 },
  shahabuddin_medical: { id: 'shahabuddin_medical', name: 'Shahabuddin Medical College Hospital', bnName: 'শাহাবুদ্দিন মেডিকেল কলেজ', lat: 23.7915, lng: 90.4155 },
  city_hospital_mirdpur: { id: 'city_hospital_mirdpur', name: 'City Hospital (Mohammadpur)', bnName: 'সিটি হাসপাতাল (মোহাম্মদপুর)', lat: 23.7615, lng: 90.3585 },
  al_rajhi: { id: 'al_rajhi', name: 'Al-Rajhi Hospital (Farmgate)', bnName: 'আল-রাজী হাসপাতাল', lat: 23.7575, lng: 90.3885 },
  ibn_sina_malibagh: { id: 'ibn_sina_malibagh', name: 'Ibn Sina Diagnostic Center (Malibagh)', bnName: 'ইবনে সিনা (মালিবাগ)', lat: 23.7515, lng: 90.4135 },
  popular_shantinagar: { id: 'popular_shantinagar', name: 'Popular Diagnostic (Shantinagar)', bnName: 'পপুলার (শান্তিনগর)', lat: 23.7425, lng: 90.4145 },
  birdem_2: { id: 'birdem_2', name: 'BIRDEM 2 (Segunbagicha)', bnName: 'বারডেম ২ (সেগুনবাগিচা)', lat: 23.7335, lng: 90.4055 },
  ent_institute: { id: 'ent_institute', name: 'National Institute of ENT', bnName: 'জাতীয় ইএনটি ইনস্টিটিউট', lat: 23.7625, lng: 90.3995 },
  lab_medicine: { id: 'lab_medicine', name: 'National Institute of Laboratory Medicine', bnName: 'ল্যাবরেটরি মেডিসিন ইনস্টিটিউট', lat: 23.7745, lng: 90.3725 },
  shishu_swasthya: { id: 'shishu_swasthya', name: 'Shishu Swasthya Foundation Hospital', bnName: 'শিশু স্বাস্থ্য ফাউন্ডেশন', lat: 23.8045, lng: 90.3655 },
  marks_medical: { id: 'marks_medical', name: 'Marks Medical College Hospital', bnName: 'মার্কস মেডিকেল কলেজ', lat: 23.8015, lng: 90.3525 },
  al_manar_mohammadpur: { id: 'al_manar_mohammadpur', name: 'Al-Manar Hospital (Mohammadpur)', bnName: 'আল-মানার হাসপাতাল', lat: 23.7635, lng: 90.3565 },
  medinova_dhanmondi: { id: 'medinova_dhanmondi', name: 'Medinova Medical Services', bnName: 'মেডিনোভা (ধানমন্ডি)', lat: 23.7435, lng: 90.3765 },
  comfort_diagnostic: { id: 'comfort_diagnostic', name: 'Comfort Diagnostic Center', bnName: 'কমফোর্ট ডায়াগনস্টিক', lat: 23.7455, lng: 90.3845 },
  cmh_dhaka: { id: 'cmh_dhaka', name: 'Combined Military Hospital (CMH)', bnName: 'সিএমএইচ (ঢাকা)', lat: 23.8185, lng: 90.4125 },
  dhaka_dental: { id: 'dhaka_dental', name: 'Dhaka Dental College & Hospital', bnName: 'ঢাকা ডেন্টাল কলেজ', lat: 23.8125, lng: 90.3755 },
  ahsania_mission_cancer: { id: 'ahsania_mission_cancer', name: 'Ahsania Mission Cancer Hospital', bnName: 'আহছানিয়া মিশন ক্যান্সার হাসপাতাল', lat: 23.8755, lng: 90.3855 },
  islami_bank_central: { id: 'islami_bank_central', name: 'Islami Bank Central Hospital', bnName: 'ইসলামী ব্যাংক সেন্ট্রাল হাসপাতাল', lat: 23.7385, lng: 90.4125 },
  bihs_hospital: { id: 'bihs_hospital', name: 'BIHS General Hospital', bnName: 'বিআইএইচএস জেনারেল হাসপাতাল', lat: 23.7885, lng: 90.3525 },
  hitech_multicare: { id: 'hitech_multicare', name: 'Hitech Multicare Hospital', bnName: 'হাইটেক মাল্টিকীয়ার হাসপাতাল', lat: 23.8215, lng: 90.4215 },
  al_helal_specialized: { id: 'al_helal_specialized', name: 'Al Helal Specialized Hospital', bnName: 'আল হেলাল স্পেশালাইজড হাসপাতাল', lat: 23.8015, lng: 90.3715 },
  health_and_hope: { id: 'health_and_hope', name: 'Health and Hope Hospital', bnName: 'হেলথ এন্ড হোপ হাসপাতাল', lat: 23.7515, lng: 90.3855 },
  bangladesh_eye_hosp: { id: 'bangladesh_eye_hosp', name: 'Bangladesh Eye Hospital', bnName: 'বাংলাদেশ আই হাসপাতাল', lat: 23.7535, lng: 90.3705 },
  vision_eye_hosp: { id: 'vision_eye_hosp', name: 'Vision Eye Hospital', bnName: 'ভিশন আই হাসপাতাল', lat: 23.7518, lng: 90.3872 },
  ortho_care: { id: 'ortho_care', name: 'Ortho Care Hospital (Shyamoli)', bnName: 'অরথো কেয়ার হাসপাতাল', lat: 23.7745, lng: 90.3685 },
  care_medical: { id: 'care_medical', name: 'Care Medical College (Mohammadpur)', bnName: 'কেয়ার মেডিকেল কলেজ', lat: 23.7625, lng: 90.3555 },
  northern_medical: { id: 'northern_medical', name: 'Northern International Medical College', bnName: 'নর্দান ইন্টারন্যাশনাল মেডিকেল', lat: 23.7485, lng: 90.3755 },
  east_west_medical: { id: 'east_west_medical', name: 'East West Medical College', bnName: 'ইস্ট ওয়েস্ট মেডিকেল কলেজ', lat: 23.8955, lng: 90.3825 },
  banani_clinic_hosp: { id: 'banani_clinic_hosp', name: 'Banani Clinic & Hospital', bnName: 'বনানী ক্লিনিক', lat: 23.7925, lng: 90.4075 },
  prescription_point_gulshan: { id: 'prescription_point_gulshan', name: 'Prescription Point (Gulshan)', bnName: 'প্রেসক্রিপশন পয়েন্ট (গুলশান)', lat: 23.7995, lng: 90.4165 },

  // ===== REGIONAL HOSPITALS =====
  savar_hospital: { id: 'savar_hospital', name: 'Savar Upazila Health Complex', bnName: 'সাভার উপজেলা স্বাস্থ্য কমপ্লেক্স', lat: 23.8485, lng: 90.2625 },
  enam_medical: { id: 'enam_medical', name: 'Enam Medical College & Hospital', bnName: 'এনাম মেডিকেল কলেজ', lat: 23.8465, lng: 90.2642 },
  manikganj_hospital: { id: 'manikganj_hospital', name: 'Manikganj Sadar Hospital', bnName: 'মানিকগঞ্জ সদর হাসপাতাল', lat: 23.8625, lng: 89.9985 },
  ashulia_hospital: { id: 'ashulia_hospital', name: 'Ashulia Women & Children Hospital', bnName: 'আশুলিয়া নারী ও শিশু হাসপাতাল', lat: 23.8925, lng: 90.3025 },
  gazipur_medical: { id: 'gazipur_medical', name: 'Shaheed Tajuddin Ahmad Medical College', bnName: 'শহীদ তাজউদ্দীন আহমদ মেডিকেল', lat: 23.9925, lng: 90.3985 },
  sreepur_hospital: { id: 'sreepur_hospital', name: 'Sreepur Upazila Health Complex', bnName: 'শ্রীপুর উপজেলা স্বাস্থ্য কমপ্লেক্স', lat: 24.1925, lng: 90.4725 },
  munshiganj_hospital: { id: 'munshiganj_hospital', name: 'Munshiganj General Hospital', bnName: 'মুন্সীগঞ্জ জেনারেল হাসপাতাল', lat: 23.5455, lng: 90.5332 },
  narayanganj_hospital: { id: 'narayanganj_hospital', name: 'Narayanganj General (Victoria) Hospital', bnName: 'নারায়ণগঞ্জ ভিক্টোরিয়া হাসপাতাল', lat: 23.6255, lng: 90.5020 },
  keraniganj_hospital: { id: 'keraniganj_hospital', name: 'Keraniganj Upazila Health Complex', bnName: 'কেরানীগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্স', lat: 23.6825, lng: 90.3825 },
  crp_savar: { id: 'crp_savar', name: 'CRP (Savar)', bnName: 'সিআরপি (সাভার)', lat: 23.8320, lng: 90.2780 },
  malek_medical: { id: 'malek_medical', name: 'Colonel Maleque Medical College', bnName: 'কর্নেল মালেক মেডিকেল', lat: 23.8650, lng: 89.9850 },
  monno_medical: { id: 'monno_medical', name: 'Monno Medical College', bnName: 'মুন্নু মেডিকেল কলেজ', lat: 23.8500, lng: 89.9200 },
  sonargaon_hospital: { id: 'sonargaon_hospital', name: 'Sonargaon Health Complex', bnName: 'সোনারগাঁও স্বাস্থ্য কমপ্লেক্স', lat: 23.6300, lng: 90.6100 },
  siddhirganj_hospital: { id: 'siddhirganj_hospital', name: 'Siddhirganj 300 Bed Hospital', bnName: 'সিদ্ধিরগঞ্জ ৩০০ শয্যা হাসপাতাল', lat: 23.6650, lng: 90.5150 },
  sreenagar_hospital: { id: 'sreenagar_hospital', name: 'Sreenagar Health Complex', bnName: 'শ্রীনগর স্বাস্থ্য কমপ্লেক্স', lat: 23.5350, lng: 90.2850 },

  // ===== POLICE STATIONS (THANAS) =====
  mirpur_thana: { id: 'mirpur_thana', name: 'Mirpur Model Thana', bnName: 'মিরপুর মডেল থানা', lat: 23.8055, lng: 90.3615 },
  pallabi_thana: { id: 'pallabi_thana', name: 'Pallabi Thana', bnName: 'পল্লবী থানা', lat: 23.8245, lng: 90.3625 },
  uttara_west_thana: { id: 'uttara_west_thana', name: 'Uttara West Thana', bnName: 'উত্তরা পশ্চিম থানা', lat: 23.8710, lng: 90.3880 },
  uttara_east_thana: { id: 'uttara_east_thana', name: 'Uttara East Thana', bnName: 'উত্তরা পূর্ব থানা', lat: 23.8730, lng: 90.4020 },
  gulshan_thana: { id: 'gulshan_thana', name: 'Gulshan Thana', bnName: 'গুলশান থানা', lat: 23.7925, lng: 90.4165 },
  banani_thana: { id: 'banani_thana', name: 'Banani Thana', bnName: 'বনানী থানা', lat: 23.7935, lng: 90.4055 },
  dhanmondi_thana: { id: 'dhanmondi_thana', name: 'Dhanmondi Thana', bnName: 'ধানমন্ডি থানা', lat: 23.7480, lng: 90.3760 },
  shahbag_thana: { id: 'shahbag_thana', name: 'Shahbag Thana', bnName: 'শাহবাগ থানা', lat: 23.7405, lng: 90.3955 },
  mohammadpur_thana: { id: 'mohammadpur_thana', name: 'Mohammadpur Thana', bnName: 'মোহাম্মদপুর থানা', lat: 23.7625, lng: 90.3605 },
  tejgaon_thana: { id: 'tejgaon_thana', name: 'Tejgaon Thana', bnName: 'তেজগাঁও থানা', lat: 23.7655, lng: 90.3925 },
  badda_thana: { id: 'badda_thana', name: 'Badda Thana', bnName: 'বাড্ডা থানা', lat: 23.7855, lng: 90.4255 },
  paltan_thana: { id: 'paltan_thana', name: 'Paltan Thana', bnName: 'পল্টন থানা', lat: 23.7310, lng: 90.4130 },
  motijheel_thana: { id: 'motijheel_thana', name: 'Motijheel Thana', bnName: 'মতিঝিল থানা', lat: 23.7335, lng: 90.4175 },
  jatrabari_thana: { id: 'jatrabari_thana', name: 'Jatrabari Thana', bnName: 'যাত্রাবাড়ী থানা', lat: 23.7055, lng: 90.4355 },
  khilgaon_thana: { id: 'khilgaon_thana', name: 'Khilgaon Thana', bnName: 'খিলগাঁও থানা', lat: 23.7485, lng: 90.4255 },

  // ===== REGIONAL THANAS =====
  savar_thana: { id: 'savar_thana', name: 'Savar Model Thana', bnName: 'সাভার মডেল থানা', lat: 23.8450, lng: 90.2600 },
  ashulia_thana: { id: 'ashulia_thana', name: 'Ashulia Thana', bnName: 'আশুলিয়া থানা', lat: 23.8900, lng: 90.3000 },
  manikganj_thana: { id: 'manikganj_thana', name: 'Manikganj Sadar Thana', bnName: 'মানিকগঞ্জ সদর থানা', lat: 23.8600, lng: 90.0000 },
  gazipur_thana: { id: 'gazipur_thana', name: 'Gazipur Sadar Thana', bnName: 'গাজীপুর সদর থানা', lat: 23.9900, lng: 90.3950 },
  sreepur_thana: { id: 'sreepur_thana', name: 'Sreepur Thana', bnName: 'শ্রীপুর থানা', lat: 24.1900, lng: 90.4700 },
  lohajang_thana: { id: 'lohajang_thana', name: 'Lohajang (Mawa) Thana', bnName: 'লৌহজং থানা', lat: 23.4700, lng: 90.2600 },
  munshiganj_thana: { id: 'munshiganj_thana', name: 'Munshiganj Sadar Thana', bnName: 'মুন্সীগঞ্জ সদর থানা', lat: 23.5435, lng: 90.5312 },
  narayanganj_thana: { id: 'narayanganj_thana', name: 'Narayanganj Model Thana', bnName: 'নারায়ণগঞ্জ মডেল থানা', lat: 23.6230, lng: 90.5000 },
  keraniganj_thana: { id: 'keraniganj_thana', name: 'Keraniganj Thana', bnName: 'কেরানীগঞ্জ থানা', lat: 23.6800, lng: 90.3800 },
  savar_highway_thana: { id: 'savar_highway_thana', name: 'Savar Highway Thana', bnName: 'সাভার হাইওয়ে থানা', lat: 23.8500, lng: 90.2650 },
  saturia_thana: { id: 'saturia_thana', name: 'Saturia Thana', bnName: 'সাটুরিয়া থানা', lat: 23.9315, lng: 90.0247 },
  singair_thana: { id: 'singair_thana', name: 'Singair Thana', bnName: 'সিঙ্গাইর থানা', lat: 23.7950, lng: 90.1200 },
  konabari_thana: { id: 'konabari_thana', name: 'Konabari Thana', bnName: 'কোনাবাড়ি থানা', lat: 24.0200, lng: 90.3200 },
  fatullah_thana: { id: 'fatullah_thana', name: 'Fatullah Thana', bnName: 'ফতুল্লাহ থানা', lat: 23.6300, lng: 90.4850 },
  siddhirganj_thana: { id: 'siddhirganj_thana', name: 'Siddhirganj Thana', bnName: 'সিদ্ধিরগঞ্জ থানা', lat: 23.6700, lng: 90.5100 },
  sonargaon_thana: { id: 'sonargaon_thana', name: 'Sonargaon Thana', bnName: 'সোনারগাঁও থানা', lat: 23.6400, lng: 90.6000 },
  sreenagar_thana: { id: 'sreenagar_thana', name: 'Sreenagar Thana', bnName: 'শ্রীনগর থানা', lat: 23.5300, lng: 90.2800 },
  south_keraniganj_thana: { id: 'south_keraniganj_thana', name: 'South Keraniganj Thana', bnName: 'দক্ষিণ কেরানীগঞ্জ থানা', lat: 23.6600, lng: 90.3700 },
  gazaria_thana: { id: 'gazaria_thana', name: 'Gazaria Thana', bnName: 'গজারিয়া থানা', lat: 23.5400, lng: 90.6100 },

  // ===== FIRE STATIONS =====
  fire_service_hq: { id: 'fire_service_hq', name: 'Fire Service HQ (Fulbaria)', bnName: 'ফায়ার সার্ভিস সদর দপ্তর', lat: 23.7225, lng: 90.4085 },
  mirpur_fire_station: { id: 'mirpur_fire_station', name: 'Mirpur Fire Station', bnName: 'মিরপুর ফায়ার স্টেশন', lat: 23.8105, lng: 90.3655 },
  uttara_fire_station: { id: 'uttara_fire_station', name: 'Uttara Fire Station', bnName: 'উত্তরা ফায়ার স্টেশন', lat: 23.8655, lng: 90.3905 },
  kurmitola_fire_station: { id: 'kurmitola_fire_station', name: 'Kurmitola Fire Station', bnName: 'কুর্মিটোলা ফায়ার স্টেশন', lat: 23.8245, lng: 90.4088 },
  khilgaon_fire_station: { id: 'khilgaon_fire_station', name: 'Khilgaon Fire Station', bnName: 'খিলগাঁও ফায়ার স্টেশন', lat: 23.7488, lng: 90.4258 },
  baridhara_fire_station: { id: 'baridhara_fire_station', name: 'Baridhara Fire Station', bnName: 'বারিধারা ফায়ার স্টেশন', lat: 23.8075, lng: 90.4255 },
  mohammadpur_fire_station: { id: 'mohammadpur_fire_station', name: 'Mohammadpur Fire Station', bnName: 'মোহাম্মদপুর ফায়ার স্টেশন', lat: 23.7655, lng: 90.3625 },
  lalbagh_fire_station: { id: 'lalbagh_fire_station', name: 'Lalbagh Fire Station', bnName: 'লালবাগ ফায়ার স্টেশন', lat: 23.7185, lng: 90.3955 },
  sadarghat_fire_station: { id: 'sadarghat_fire_station', name: 'Sadarghat Fire Station', bnName: 'সদরঘাট ফায়ার স্টেশন', lat: 23.7055, lng: 90.4055 },

  // ===== REGIONAL FIRE STATIONS =====
  savar_fire_station: { id: 'savar_fire_station', name: 'Savar Fire Station', bnName: 'সাভার ফায়ার স্টেশন', lat: 23.8475, lng: 90.2615 },
  depz_fire_station: { id: 'depz_fire_station', name: 'DEPZ (Ashulia) Fire Station', bnName: 'ডিইপিজেড ফায়ার স্টেশন', lat: 23.8915, lng: 90.2915 },
  manikganj_fire_station: { id: 'manikganj_fire_station', name: 'Manikganj Fire Station', bnName: 'মানিকগঞ্জ ফায়ার স্টেশন', lat: 23.8615, lng: 90.0015 },
  gazipur_fire_station: { id: 'gazipur_fire_station', name: 'Gazipur Fire Station', bnName: 'গাজীপুর ফায়ার স্টেশন', lat: 23.9915, lng: 90.3965 },
  sreepur_fire_station: { id: 'sreepur_fire_station', name: 'Sreepur Fire Station', bnName: 'শ্রীপুর ফায়ার স্টেশন', lat: 24.1915, lng: 90.4715 },
  mawa_fire_station: { id: 'mawa_fire_station', name: 'Mawa Fire Station', bnName: 'মাওয়া ফায়ার স্টেশন', lat: 23.4725, lng: 90.2625 },
  munshiganj_fire_station: { id: 'munshiganj_fire_station', name: 'Munshiganj Fire Station', bnName: 'মুন্সীগঞ্জ ফায়ার স্টেশন', lat: 23.5450, lng: 90.5332 },
  narayanganj_fire_station: { id: 'narayanganj_fire_station', name: 'Narayanganj Fire Station', bnName: 'নারায়ণগঞ্জ ফায়ার স্টেশন', lat: 23.6255, lng: 90.5025 },
  keraniganj_fire_station: { id: 'keraniganj_fire_station', name: 'Keraniganj Fire Station', bnName: 'কেরানীগঞ্জ ফায়ার স্টেশন', lat: 23.6825, lng: 90.3825 },
  zirabo_fire_station: { id: 'zirabo_fire_station', name: 'Zirabo Fire Station', bnName: 'জিরাবো ফায়ার স্টেশন', lat: 23.9200, lng: 90.2850 },
  bhogra_fire_station: { id: 'bhogra_fire_station', name: 'Bhogra Fire Station', bnName: 'ভোগড়া ফায়ার স্টেশন', lat: 23.9850, lng: 90.4150 },
  board_bazar_fire_station: { id: 'board_bazar_fire_station', name: 'Board Bazar Fire Station', bnName: 'বোর্ড বাজার ফায়ার স্টেশন', lat: 23.9305, lng: 90.3985 },
  maona_fire_station: { id: 'maona_fire_station', name: 'Maona Fire Station', bnName: 'মাওনা ফায়ার স্টেশন', lat: 24.1950, lng: 90.4750 },
  sonargaon_fire_station: { id: 'sonargaon_fire_station', name: 'Sonargaon Fire Station', bnName: 'সোনারগাঁও ফায়ার স্টেশন', lat: 23.6350, lng: 90.6050 },
  sreenagar_fire_station: { id: 'sreenagar_fire_station', name: 'Sreenagar Fire Station', bnName: 'শ্রীনগর ফায়ার স্টেশন', lat: 23.5350, lng: 90.2850 },
  padma_bridge_fire_station: { id: 'padma_bridge_fire_station', name: 'Padma Bridge (Dogachi) Fire Station', bnName: 'পদ্মা সেতু (ডোগাছি) ফায়ার স্টেশন', lat: 23.4750, lng: 90.2650 },
  jail_fire_station: { id: 'jail_fire_station', name: 'New Jail (Keraniganj) Fire Station', bnName: 'নতুন জেল ফায়ার স্টেশন', lat: 23.6580, lng: 90.3720 },

  // ===== SHOPPING & COMMERCIAL (Already existing entries below) =====
  bashundhara_city: { id: 'bashundhara_city', name: 'Bashundhara City Shopping Mall', bnName: 'বসুন্ধরা সিটি', lat: 23.7500, lng: 90.3880 },
  jamuna_center: { id: 'jamuna_center', name: 'Jamuna Future Park', bnName: 'যমুনা ফিউচার পার্ক', lat: 23.8130, lng: 90.4220 },
  rifles_square: { id: 'rifles_square', name: 'Rifles Square', bnName: 'রাইফেলস স্কয়ার', lat: 23.7550, lng: 90.3900 },
  eastern_plaza: { id: 'eastern_plaza', name: 'Eastern Plaza', bnName: 'ইস্টার্ন প্লাজা', lat: 23.7300, lng: 90.4130 },

  // ===== BUSINESS & OFFICE AREAS =====
  banani_dohs: { id: 'banani_dohs', name: 'Banani DOHS', bnName: 'বনানী ডোহস', lat: 23.7940, lng: 90.4070 },
  baridhara: { id: 'baridhara', name: 'Baridhara', bnName: 'বারিধারা', lat: 23.8070, lng: 90.4250 },
  baridhara_dohs: { id: 'baridhara_dohs', name: 'Baridhara DOHS', bnName: 'বারিধারা ডোহস', lat: 23.8120, lng: 90.4280 },
  dilkusha: { id: 'dilkusha', name: 'Dilkusha', bnName: 'দিলকুশা', lat: 23.7310, lng: 90.4170 },

  // ===== LANDMARKS & TOURIST SPOTS =====
  lalbagh_fort: { id: 'lalbagh_fort', name: 'Lalbagh Fort', bnName: 'লালবাগ কেল্লা', lat: 23.7180, lng: 90.3920 },
  national_museum: { id: 'national_museum', name: 'National Museum', bnName: 'জাতীয় জাদুঘর', lat: 23.7380, lng: 90.3980 },
  shaheed_minar: { id: 'shaheed_minar', name: 'Shaheed Minar', bnName: 'শহীদ মিনার', lat: 23.7280, lng: 90.3980 },
  national_parliament: { id: 'national_parliament', name: 'National Parliament', bnName: 'জাতীয় সংসদ ভবন', lat: 23.7626, lng: 90.3795 },

  // ===== RESIDENTIAL AREAS =====
  uttara_sec11: { id: 'uttara_sec11', name: 'Uttara Sector 11', bnName: 'উত্তরা সেক্টর ১১', lat: 23.8630, lng: 90.4010 },
  uttara_sec13: { id: 'uttara_sec13', name: 'Uttara Sector 13', bnName: 'উত্তরা সেক্টর ১৩', lat: 23.8590, lng: 90.4020 },
  uttara_sec14: { id: 'uttara_sec14', name: 'Uttara Sector 14', bnName: 'উত্তরা সেক্টর ১৪', lat: 23.8580, lng: 90.4040 },
  nikunja: { id: 'nikunja', name: 'Nikunja', bnName: 'নিকুঞ্জ', lat: 23.8300, lng: 90.4150 },

  // ===== GOVERNMENT OFFICES =====
  secretariat: { id: 'secretariat', name: 'Secretariat', bnName: 'সচিবালয়', lat: 23.7280, lng: 90.4020 },
  supreme_court: { id: 'supreme_court', name: 'Supreme Court', bnName: 'সুপ্রিম কোর্ট', lat: 23.7280, lng: 90.4030 },


  // ===== INDUSTRIAL & EPZ =====
  dhaka_epz: { id: 'dhaka_epz', name: 'Dhaka EPZ', bnName: 'ঢাকা ইপিজেড', lat: 23.8900, lng: 90.2900 },

  // ===== NARAYANGANJ AREA =====
  nitolganj: { id: 'nitolganj', name: 'Nitolganj', bnName: 'নিতলগঞ্জ', lat: 23.6150, lng: 90.5100 },

  // ===== BRTC TERMINALS & MAJOR STOPS =====
  cbs_2: { id: 'cbs_2', name: 'CBS-2 Fulbaria', bnName: 'সিবিএস-২ ফুলবাড়িয়া', lat: 23.7285, lng: 90.4133 },
  nagda: { id: 'nagda', name: 'Nagda', bnName: 'নগদা', lat: 23.8420, lng: 90.4150 },
  sheikh_russel_park: { id: 'sheikh_russel_park', name: 'Sheikh Russel Park', bnName: 'শেখ রাসেল পার্ক', lat: 23.7304, lng: 90.4129 },

  toll_plaza: { id: 'toll_plaza', name: 'Toll Plaza', bnName: 'টোল প্লাজা', lat: 23.7320, lng: 90.4180 },

  atir_bazar: { id: 'atir_bazar', name: 'Atir Bazar', bnName: 'আটির বাজার', lat: 23.7520, lng: 90.3615 },
  keraniganj_kadomtoli: { id: 'keraniganj_kadomtoli', name: 'Kadomtoli', bnName: 'কদমতলী', lat: 23.6580, lng: 90.3520 },


  bardo_bari_tongi: { id: 'bardo_bari_tongi', name: 'Bardo Bari Tongi', bnName: 'বড়বাড়ি', lat: 23.8920, lng: 90.4110 },


  cocacola: { id: 'cocacola', name: 'Coca Cola', bnName: 'কোকাকোলা', lat: 23.8350, lng: 90.4220 },
  bansree: { id: 'bansree', name: 'Bansree', bnName: 'বনশ্রী', lat: 23.7580, lng: 90.4380 },


  bandura: { id: 'bandura', name: 'Bandura', bnName: 'বান্দুরা', lat: 23.7050, lng: 90.4420 },
  gauripur: { id: 'gauripur', name: 'Gauripur', bnName: 'গৌরিপুর', lat: 23.8800, lng: 90.3850 },

  diabari_metro: { id: 'diabari_metro', name: 'Diabari Metro Station', bnName: 'দিয়াবাড়ী মেট্রো', lat: 23.8285, lng: 90.3920 },
  house_building: { id: 'house_building', name: 'House Building', bnName: 'হাউজ বিল্ডিং', lat: 23.8812, lng: 90.4050 },

  elevated_exp_jasimuddin: { id: 'elevated_exp_jasimuddin', name: 'Jasimuddin (Elevated Expressway)', bnName: 'জসিম উদ্দিন', lat: 23.8730, lng: 90.3980 },
  elevated_exp_khejurbagan: { id: 'elevated_exp_khejurbagan', name: 'Khejurbagan (Elevated Expressway)', bnName: 'খেজুরবাগান', lat: 23.7850, lng: 90.4175 },

  itakhola: { id: 'itakhola', name: 'Itakhola', bnName: 'ইটাখোলা', lat: 23.9785, lng: 90.5220 },
  bishnondi_ferry: { id: 'bishnondi_ferry', name: 'Bishnondi Ferry Ghat', bnName: 'বিশনন্দী ফেরী ঘাট', lat: 23.6180, lng: 90.5550 },

  narayanganj_railgate: { id: 'narayanganj_railgate', name: 'Narayanganj 1 No Rail Gate', bnName: 'নারায়ণগঞ্জ ১নং রেল গেইট', lat: 23.6238, lng: 90.5013 },
  ghatarchar: { id: 'ghatarchar', name: 'Ghatarchar', bnName: 'ঘাটারচর', lat: 23.7490, lng: 90.3620 },


  paglabazar: { id: 'paglabazar', name: 'Pagla Bazar', bnName: 'পাগলা বাজার', lat: 23.7180, lng: 90.3480 },

  // === CHATTOGRAM CITY STATIONS ===
  agrabad:        { id: 'agrabad',        name: 'Agrabad',             bnName: 'আগ্রাবাদ',          lat: 22.3302, lng: 91.8228 },
  new_market_ctg: { id: 'new_market_ctg', name: 'New Market (Ctg)',    bnName: 'নিউ মার্কেট',       lat: 22.3434, lng: 91.8068 },
  gec_circle:     { id: 'gec_circle',     name: 'GEC Circle',          bnName: 'জিইসি সার্কেল',    lat: 22.3601, lng: 91.8257 },
  muradpur:       { id: 'muradpur',       name: 'Muradpur',            bnName: 'মুরাদপুর',          lat: 22.3742, lng: 91.8196 },
  oxygen:         { id: 'oxygen',         name: 'Oxygen',              bnName: 'অক্সিজেন',          lat: 22.4095, lng: 91.8175 },
  pahartali:      { id: 'pahartali',      name: 'Pahartali',           bnName: 'পাহাড়তলী',         lat: 22.4014, lng: 91.8014 },
  halishahar:     { id: 'halishahar',     name: 'Halishahar',          bnName: 'হালিশহর',           lat: 22.3767, lng: 91.7944 },
  patenga:        { id: 'patenga',        name: 'Patenga',             bnName: 'পতেঙ্গা',           lat: 22.2978, lng: 91.7896 },
  cepz:           { id: 'cepz',           name: 'CEPZ',                bnName: 'সিইপিজেড',          lat: 22.3181, lng: 91.7934 },
  lalkhan_bazar:  { id: 'lalkhan_bazar',  name: 'Lalkhan Bazar',       bnName: 'লালখান বাজার',      lat: 22.3378, lng: 91.8241 },
  chawkbazar_ctg: { id: 'chawkbazar_ctg', name: 'Chawkbazar',          bnName: 'চকবাজার',           lat: 22.3326, lng: 91.8297 },
  anderkilla:     { id: 'anderkilla',     name: 'Anderkilla',          bnName: 'আন্দরকিল্লা',       lat: 22.3325, lng: 91.8302 },
  tiger_pass:     { id: 'tiger_pass',     name: 'Tiger Pass',          bnName: 'টাইগার পাস',        lat: 22.3260, lng: 91.8285 },
  kotwali_ctg:    { id: 'kotwali_ctg',    name: 'Kotwali (Ctg)',       bnName: 'কোতোয়ালি',         lat: 22.3368, lng: 91.8262 },
  sholoshahar:    { id: 'sholoshahar',    name: 'Sholoshahar',         bnName: 'ষোলশহর',            lat: 22.3622, lng: 91.8210 },
  khulshi:        { id: 'khulshi',        name: 'Khulshi',             bnName: 'খুলশী',             lat: 22.3699, lng: 91.8283 },
  nasirabad_ctg:  { id: 'nasirabad_ctg',  name: 'Nasirabad',           bnName: 'নাসিরাবাদ',         lat: 22.3776, lng: 91.8029 },
  kalurghat_ctg:  { id: 'kalurghat_ctg',  name: 'Kalurghat',           bnName: 'কালুরঘাট',          lat: 22.3950, lng: 91.8107 },
  foys_lake:      { id: 'foys_lake',      name: "Foy's Lake",          bnName: 'ফয়েজ লেক',         lat: 22.3998, lng: 91.7933 },
  bayazid:        { id: 'bayazid',        name: 'Bayazid Bostami',     bnName: 'বায়েজিদ বোস্তামী', lat: 22.4195, lng: 91.8023 },
  chandgaon:      { id: 'chandgaon',      name: 'Chandgaon',           bnName: 'চান্দগাঁও',         lat: 22.3447, lng: 91.8633 },
  dampara:        { id: 'dampara',        name: 'Dampara',             bnName: 'দামপাড়া',           lat: 22.3378, lng: 91.8327 },
  two_no_gate:    { id: 'two_no_gate',    name: '2 No. Gate',          bnName: '২নং গেট',           lat: 22.3434, lng: 91.7960 },
  bahaddarhat:    { id: 'bahaddarhat',    name: 'Bahaddarhat',         bnName: 'বহদ্দারহাট',        lat: 22.3456, lng: 91.8041 },
  jubilee_road:   { id: 'jubilee_road',   name: 'Jubilee Road',        bnName: 'জুবিলি রোড',        lat: 22.3319, lng: 91.8250 },
  ctg_station:    { id: 'ctg_station',    name: 'Chattogram Station',  bnName: 'চট্টগ্রাম স্টেশন',  lat: 22.3410, lng: 91.8350 },
  akshar_dighi:   { id: 'akshar_dighi',   name: 'Akshar Dighi',        bnName: 'আখতারুজ্জামান দীঘি', lat: 22.3350, lng: 91.8180 },
  reazuddin_bazar:{ id: 'reazuddin_bazar',name: 'Reazuddin Bazar',     bnName: 'রিয়াজউদ্দিন বাজার', lat: 22.3343, lng: 91.8260 },

  // === SYLHET CITY STATIONS ===
  ambarkhana:     { id: 'ambarkhana',     name: 'Ambarkhana',          bnName: 'আম্বরখানা',         lat: 24.9007, lng: 91.8584 },
  zindabazar:     { id: 'zindabazar',     name: 'Zindabazar',          bnName: 'জিন্দাবাজার',       lat: 24.8964, lng: 91.8681 },
  bondor_bazar_syl: { id: 'bondor_bazar_syl', name: 'Bondor Bazar (Syl)', bnName: 'বন্দর বাজার',  lat: 24.8925, lng: 91.8672 },
  chouhatta:      { id: 'chouhatta',      name: 'Chouhatta',           bnName: 'চৌহাট্টা',          lat: 24.8975, lng: 91.8580 },
  taltola_syl:    { id: 'taltola_syl',    name: 'Taltola (Syl)',       bnName: 'তালতলা',            lat: 24.8940, lng: 91.8650 },
  pathantula:     { id: 'pathantula',     name: 'Pathantula',          bnName: 'পাঠানটুলা',         lat: 24.9030, lng: 91.8650 },
  tilagor:        { id: 'tilagor',        name: 'Tilagor',             bnName: 'তিলাগড়',            lat: 24.9150, lng: 91.8700 },
  shibganj_syl:   { id: 'shibganj_syl',   name: 'Shibganj (Syl)',      bnName: 'শিবগঞ্জ',           lat: 24.9200, lng: 91.8750 },
  medical_syl:    { id: 'medical_syl',    name: 'Medical College (Syl)',bnName: 'মেডিকেল কলেজ',     lat: 24.9100, lng: 91.8700 },
  airport_syl:    { id: 'airport_syl',    name: 'Sylhet Airport',      bnName: 'ওসমানী বিমানবন্দর', lat: 24.9591, lng: 91.8670 },
  uposhohor_syl:  { id: 'uposhohor_syl',  name: 'Uposhohor (Syl)',     bnName: 'উপশহর',             lat: 24.9050, lng: 91.8550 },
  kumarpara_syl:  { id: 'kumarpara_syl',  name: 'Kumarpara (Syl)',     bnName: 'কুমারপাড়া',        lat: 24.8990, lng: 91.8590 },
  dorgah_gate:    { id: 'dorgah_gate',    name: 'Dorgah Gate',         bnName: 'দরগাহ গেট',         lat: 24.9070, lng: 91.8620 },
  kazir_bazar:    { id: 'kazir_bazar',    name: 'Kazir Bazar',         bnName: 'কাজির বাজার',       lat: 24.8950, lng: 91.8660 },
  syl_station:    { id: 'syl_station',    name: 'Sylhet Station',      bnName: 'সিলেট রেলওয়ে স্টেশন', lat: 24.8975, lng: 91.8746 },

  // === RAJSHAHI CITY STATIONS ===
  shaheb_bazar:   { id: 'shaheb_bazar',   name: 'Shaheb Bazar',        bnName: 'সাহেব বাজার',       lat: 24.3636, lng: 88.6241 },
  new_market_raj: { id: 'new_market_raj', name: 'New Market (Raj)',     bnName: 'নিউ মার্কেট',       lat: 24.3640, lng: 88.6050 },
  zero_point_raj: { id: 'zero_point_raj', name: 'Zero Point (Raj)',     bnName: 'জিরো পয়েন্ট',      lat: 24.3700, lng: 88.6170 },
  court_raj:      { id: 'court_raj',      name: 'Court (Raj)',          bnName: 'কোর্ট',             lat: 24.3670, lng: 88.5975 },
  upashahar_raj:  { id: 'upashahar_raj',  name: 'Upashahar (Raj)',      bnName: 'উপশহর',             lat: 24.3760, lng: 88.6050 },
  rajpara:        { id: 'rajpara',        name: 'Rajpara',              bnName: 'রাজপাড়া',           lat: 24.3710, lng: 88.5940 },
  ghoramara:      { id: 'ghoramara',      name: 'Ghoramara',            bnName: 'ঘোড়ামারা',          lat: 24.3800, lng: 88.5890 },
  loco_shed_raj:  { id: 'loco_shed_raj',  name: 'Loco Shed (Raj)',      bnName: 'লোকো শেড',          lat: 24.3620, lng: 88.6140 },
  raj_station:    { id: 'raj_station',    name: 'Rajshahi Station',     bnName: 'রাজশাহী রেলওয়ে স্টেশন', lat: 24.3736, lng: 88.5946 },

  // === KHULNA CITY STATIONS ===
  rupsha:         { id: 'rupsha',         name: 'Rupsha',               bnName: 'রূপসা',              lat: 22.8142, lng: 89.5597 },
  majhirghat:     { id: 'majhirghat',     name: 'Majhirghat',           bnName: 'মাঝিরঘাট',           lat: 22.8250, lng: 89.5580 },
  sonadanga:      { id: 'sonadanga',      name: 'Sonadanga',            bnName: 'সোনাডাঙ্গা',         lat: 22.8370, lng: 89.5430 },
  khalishpur:     { id: 'khalishpur',     name: 'Khalishpur',           bnName: 'খালিশপুর',           lat: 22.8450, lng: 89.5330 },
  khulna_station: { id: 'khulna_station', name: 'Khulna Station',       bnName: 'খুলনা রেলওয়ে স্টেশন', lat: 22.8350, lng: 89.5500 },
  new_market_khu: { id: 'new_market_khu', name: 'New Market (Khu)',     bnName: 'নিউ মার্কেট',        lat: 22.8300, lng: 89.5570 },
  boyra:          { id: 'boyra',          name: 'Boyra',                bnName: 'বয়রা',               lat: 22.8200, lng: 89.5640 },
  shiromoni:      { id: 'shiromoni',      name: 'Shiromoni',            bnName: 'শিরোমণি',            lat: 22.8500, lng: 89.5400 },
  daulatpur:      { id: 'daulatpur',      name: 'Daulatpur',            bnName: 'দৌলতপুর',            lat: 22.8560, lng: 89.5300 },
  khu_bus_terminal: { id: 'khu_bus_terminal', name: 'Khulna Bus Terminal', bnName: 'খুলনা বাস টার্মিনাল', lat: 22.8290, lng: 89.5510 },

  // === BARISAL CITY STATIONS ===
  natuabazar:     { id: 'natuabazar',     name: 'Natuabazar',           bnName: 'নতুয়াবাজার',         lat: 22.7010, lng: 90.3640 },
  rupatali:       { id: 'rupatali',       name: 'Rupatali',             bnName: 'রুপাতলী',             lat: 22.7100, lng: 90.3700 },
  bsl_college:    { id: 'bsl_college',    name: 'Barisal College Road', bnName: 'কলেজ রোড',            lat: 22.7050, lng: 90.3680 },
  sadar_hosp_bsl: { id: 'sadar_hosp_bsl', name: 'Sadar Hospital (Bsl)', bnName: 'সদর হাসপাতাল',       lat: 22.7020, lng: 90.3660 },
  amtala_bsl:     { id: 'amtala_bsl',     name: 'Amtala (Bsl)',         bnName: 'আমতলা',               lat: 22.7080, lng: 90.3720 },
  band_road:      { id: 'band_road',      name: 'Band Road',            bnName: 'ব্যান্ড রোড',         lat: 22.6980, lng: 90.3650 },
  bsl_launch:     { id: 'bsl_launch',     name: 'Barisal Launch Terminal', bnName: 'বরিশাল লঞ্চ টার্মিনাল', lat: 22.6950, lng: 90.3620 },
  bsl_stadium:    { id: 'bsl_stadium',    name: 'Barisal Stadium',      bnName: 'বরিশাল স্টেডিয়াম',  lat: 22.7040, lng: 90.3700 },

  // === MYMENSINGH CITY STATIONS ===
  notun_bazar_mym: { id: 'notun_bazar_mym', name: 'Notun Bazar (Mym)',  bnName: 'নতুন বাজার',          lat: 24.7471, lng: 90.4203 },
  town_hall_mym:  { id: 'town_hall_mym',  name: 'Town Hall (Mym)',      bnName: 'টাউন হল',             lat: 24.7460, lng: 90.4050 },
  charpara_mym:   { id: 'charpara_mym',   name: 'Charpara (Mym)',       bnName: 'চরপাড়া',             lat: 24.7520, lng: 90.4100 },
  maskanda:       { id: 'maskanda',       name: 'Maskanda',             bnName: 'মাসকান্দা',           lat: 24.7600, lng: 90.4200 },
  agri_univ_mym:  { id: 'agri_univ_mym',  name: 'Agri University (Mym)',bnName: 'কৃষি বিশ্ববিদ্যালয়', lat: 24.7237, lng: 90.4304 },
  mym_station:    { id: 'mym_station',    name: 'Mymensingh Station',   bnName: 'ময়মনসিংহ রেলওয়ে স্টেশন', lat: 24.7475, lng: 90.4024 },
  ganginarpar:    { id: 'ganginarpar',    name: 'Ganginarpar',          bnName: 'গাঙ্গিনারপাড়',       lat: 24.7550, lng: 90.4150 },

  // === RANGPUR CITY STATIONS ===
  zero_point_rng: { id: 'zero_point_rng', name: 'Zero Point (Rng)',     bnName: 'জিরো পয়েন্ট',       lat: 25.7467, lng: 89.2549 },
  shapla_chattar: { id: 'shapla_chattar', name: 'Shapla Chattar',       bnName: 'শাপলা চত্বর',        lat: 25.7500, lng: 89.2600 },
  dhap:           { id: 'dhap',           name: 'Dhap',                 bnName: 'ধাপ',                 lat: 25.7550, lng: 89.2650 },
  modern_more:    { id: 'modern_more',    name: 'Modern More',          bnName: 'মডার্ন মোড়',         lat: 25.7600, lng: 89.2700 },
  rng_station:    { id: 'rng_station',    name: 'Rangpur Station',      bnName: 'রংপুর রেলওয়ে স্টেশন', lat: 25.7350, lng: 89.2400 },
  jail_mohar:     { id: 'jail_mohar',     name: 'Jail Mohar',           bnName: 'জেল মোড়',            lat: 25.7480, lng: 89.2480 },
  medical_rng:    { id: 'medical_rng',    name: 'Medical College (Rng)',bnName: 'মেডিকেল কলেজ',       lat: 25.7620, lng: 89.2730 },
  rng_bus_stand:  { id: 'rng_bus_stand',  name: 'Rangpur Bus Stand',    bnName: 'রংপুর বাস স্ট্যান্ড', lat: 25.7440, lng: 89.2530 },

  // === MISSING LOCAL DHAKA-AREA STOPS ===
  janapath_moor:  { id: 'janapath_moor',  name: 'Janapath Mor',         bnName: 'জনপথ মোড়',           lat: 23.7108, lng: 90.4342 },
  kachpur_bridge: { id: 'kachpur_bridge', name: 'Kachpur Bridge',        bnName: 'কাঁচপুর ব্রিজ',       lat: 23.6652, lng: 90.5093 },
  katchpur:       { id: 'katchpur',       name: 'Katchpur',              bnName: 'কাঁচপুর',              lat: 23.6680, lng: 90.5050 },
  tetuljhora:     { id: 'tetuljhora',     name: 'Tetuljhora',            bnName: 'তেতুলঝরা',            lat: 23.8549, lng: 90.2869 },
  dhamsona:       { id: 'dhamsona',       name: 'Dhamsona',              bnName: 'ধামসোনা',              lat: 23.9750, lng: 90.4400 },
  yearpur:        { id: 'yearpur',        name: 'Yearpur',               bnName: 'ইয়ারপুর',             lat: 23.9500, lng: 90.3850 },
  basila:         { id: 'basila',         name: 'Basila',                bnName: 'বসিলা',                lat: 23.7563, lng: 90.3384 },
  aftabnagar:     { id: 'aftabnagar',     name: 'Aftabnagar',            bnName: 'আফতাবনগর',            lat: 23.7618, lng: 90.4450 },
  basabo:         { id: 'basabo',         name: 'Basabo',                bnName: 'বাসাবো',               lat: 23.7480, lng: 90.4270 },
  mawa:           { id: 'mawa',           name: 'Mawa Ghat',             bnName: 'মাওয়া ঘাট',           lat: 23.4103, lng: 90.3385 },
  mugda:          { id: 'mugda',          name: 'Mugda',                 bnName: 'মুগদা',                lat: 23.7484, lng: 90.4280 },
  pubail:         { id: 'pubail',         name: 'Pubail',                bnName: 'পুবাইল',               lat: 23.9187, lng: 90.4470 },
  sonapur:        { id: 'sonapur',        name: 'Sonapur',               bnName: 'সোনারপুর',             lat: 23.6503, lng: 90.4852 },
  tongi_station:  { id: 'tongi_station',  name: 'Tongi Station',         bnName: 'টঙ্গী স্টেশন',        lat: 23.8901, lng: 90.4025 },
  shimrail:       { id: 'shimrail',       name: 'Shimrail',              bnName: 'শিমরাইল',              lat: 23.6651, lng: 90.4972 },
  kaliakoir:      { id: 'kaliakoir',      name: 'Kaliakoir',             bnName: 'কালিয়াকৈর',            lat: 24.0730, lng: 90.2240 },
  dohar:          { id: 'dohar',          name: 'Dohar',                 bnName: 'দোহার',                lat: 23.6342, lng: 90.1563 },
  trishal:        { id: 'trishal',        name: 'Trishal',               bnName: 'ত্রিশাল',              lat: 24.6383, lng: 90.3754 },
  nandail:        { id: 'nandail',        name: 'Nandail',               bnName: 'নান্দাইল',             lat: 24.4614, lng: 90.5164 },
  salehpur:       { id: 'salehpur',       name: 'Salehpur',              bnName: 'সালেহপুর',             lat: 24.5650, lng: 90.3510 },
  sahjalal:       { id: 'sahjalal',       name: 'Hazrat Shahjalal Area', bnName: 'শাহজালাল এলাকা',      lat: 23.8550, lng: 90.4000 },
  jasimuddin:     { id: 'jasimuddin',     name: 'Jasimuddin',            bnName: 'জসিমউদ্দিন',           lat: 23.8610, lng: 90.3990 },
  dhanmondi:      { id: 'dhanmondi',      name: 'Dhanmondi',             bnName: 'ধানমন্ডি',             lat: 23.7500, lng: 90.3750 },
  shahjalal_airport: { id: 'shahjalal_airport', name: 'Shahjalal Airport', bnName: 'শাহজালাল বিমানবন্দর', lat: 23.8434, lng: 90.4029 },

  // === INTERCITY TERMINAL STATIONS (city center endpoints for BRTC routes) ===
  barisal:        { id: 'barisal',        name: 'Barisal',               bnName: 'বরিশাল',               lat: 22.7010, lng: 90.3535 },
  chittagong:     { id: 'chittagong',     name: 'Chattogram',            bnName: 'চট্টগ্রাম',             lat: 22.3569, lng: 91.7832 },
  sylhet:         { id: 'sylhet',         name: 'Sylhet',                bnName: 'সিলেট',                lat: 24.8949, lng: 91.8687 },
  rajshahi:       { id: 'rajshahi',       name: 'Rajshahi',              bnName: 'রাজশাহী',              lat: 24.3745, lng: 88.6042 },
  khulna:         { id: 'khulna',         name: 'Khulna',                bnName: 'খুলনা',                lat: 22.8456, lng: 89.5403 },
  rangpur:        { id: 'rangpur',        name: 'Rangpur',               bnName: 'রংপুর',                lat: 25.7439, lng: 89.2752 },
  mymensingh:     { id: 'mymensingh',     name: 'Mymensingh',            bnName: 'ময়মনসিংহ',            lat: 24.7471, lng: 90.4203 },
  dhaka:          { id: 'dhaka',          name: 'Dhaka',                 bnName: 'ঢাকা',                 lat: 23.8103, lng: 90.4125 },
  bogra:          { id: 'bogra',          name: 'Bogura',                bnName: 'বগুড়া',                lat: 24.8465, lng: 89.3773 },
  dinajpur:       { id: 'dinajpur',       name: 'Dinajpur',              bnName: 'দিনাজপুর',             lat: 25.6279, lng: 88.6338 },
  pabna:          { id: 'pabna',          name: 'Pabna',                 bnName: 'পাবনা',                lat: 24.0064, lng: 89.2372 },
  kushtia:        { id: 'kushtia',        name: 'Kushtia',               bnName: 'কুষ্টিয়া',             lat: 23.9011, lng: 89.1214 },
  faridpur:       { id: 'faridpur',       name: 'Faridpur',              bnName: 'ফরিদপুর',              lat: 23.6042, lng: 89.8438 },
  narsingdi:      { id: 'narsingdi',      name: 'Narsingdi',             bnName: 'নরসিংদী',              lat: 23.9218, lng: 90.7148 },
  comilla:        { id: 'comilla',        name: 'Comilla',               bnName: 'কুমিল্লা',             lat: 23.4607, lng: 91.1809 },
  chandpur:       { id: 'chandpur',       name: 'Chandpur',              bnName: 'চাঁদপুর',              lat: 23.2327, lng: 90.6508 },
  noakhali:       { id: 'noakhali',       name: 'Noakhali',              bnName: 'নোয়াখালী',             lat: 22.8696, lng: 91.0988 },
  feni:           { id: 'feni',           name: 'Feni',                  bnName: 'ফেনী',                 lat: 23.0145, lng: 91.4023 },
  brahmanbaria:   { id: 'brahmanbaria',   name: 'Brahmanbaria',          bnName: 'ব্রাহ্মণবাড়িয়া',      lat: 23.9594, lng: 91.1112 },
  lakshmipur:     { id: 'lakshmipur',     name: 'Lakshmipur',            bnName: 'লক্ষ্মীপুর',            lat: 22.9424, lng: 90.8416 },
  khagrachari:    { id: 'khagrachari',    name: 'Khagrachhari',          bnName: 'খাগড়াছড়ি',            lat: 23.1193, lng: 91.9847 },
  rangamati:      { id: 'rangamati',      name: 'Rangamati',             bnName: 'রাঙ্গামাটি',            lat: 22.7323, lng: 92.2985 },
  coxsbazar:      { id: 'coxsbazar',      name: "Cox's Bazar",           bnName: 'কক্সবাজার',             lat: 21.4272, lng: 92.0058 },
  kaptai:         { id: 'kaptai',         name: 'Kaptai',                bnName: 'কাপ্তাই',              lat: 22.4898, lng: 92.2113 },
  chandraghona:   { id: 'chandraghona',   name: 'Chandraghona',          bnName: 'চন্দ্রঘোনা',           lat: 22.4917, lng: 92.1483 },
  manikchhari:    { id: 'manikchhari',    name: 'Manikchhari',           bnName: 'মানিকছড়ি',             lat: 22.8570, lng: 91.8140 },
  ramgarh:        { id: 'ramgarh',        name: 'Ramgarh',               bnName: 'রামগড়',                lat: 22.9681, lng: 91.9491 },
  habiganj:       { id: 'habiganj',       name: 'Habiganj',              bnName: 'হবিগঞ্জ',              lat: 24.3745, lng: 91.4158 },
  sunamganj:      { id: 'sunamganj',      name: 'Sunamganj',             bnName: 'সুনামগঞ্জ',             lat: 25.0658, lng: 91.3954 },
  jaflong:        { id: 'jaflong',        name: 'Jaflong',               bnName: 'জাফলং',                lat: 25.1542, lng: 92.1100 },
  chatak:         { id: 'chatak',         name: 'Chatak',                bnName: 'ছাতক',                 lat: 25.0528, lng: 91.6467 },
  bholaganj:      { id: 'bholaganj',      name: 'Bholaganj',             bnName: 'ভোলাগঞ্জ',             lat: 25.1030, lng: 91.6920 },
  jamalpur:       { id: 'jamalpur',       name: 'Jamalpur',              bnName: 'জামালপুর',             lat: 24.8996, lng: 89.9451 },
  netrokona:      { id: 'netrokona',      name: 'Netrokona',             bnName: 'নেত্রকোণা',             lat: 24.8811, lng: 90.7225 },
  kurigram:       { id: 'kurigram',       name: 'Kurigram',              bnName: 'কুড়িগ্রাম',             lat: 25.8051, lng: 89.6361 },
  narail:         { id: 'narail',         name: 'Narail',                bnName: 'নড়াইল',                lat: 23.1723, lng: 89.5096 },
  satkhira:       { id: 'satkhira',       name: 'Satkhira',              bnName: 'সাতক্ষীরা',             lat: 22.7188, lng: 89.0728 },
  magura:         { id: 'magura',         name: 'Magura',                bnName: 'মাগুরা',               lat: 23.4871, lng: 89.8464 },
  jhikargacha:    { id: 'jhikargacha',    name: 'Jhikargacha',           bnName: 'ঝিকরগাছা',             lat: 23.1079, lng: 89.1744 },
  navaron:        { id: 'navaron',        name: 'Navaron',               bnName: 'নাভারণ',               lat: 23.0669, lng: 88.9948 },
  muksudpur:      { id: 'muksudpur',      name: 'Muksudpur',             bnName: 'মুকসুদপুর',            lat: 23.1744, lng: 89.7583 },
  benapole:       { id: 'benapole',       name: 'Benapole',              bnName: 'বেনাপোল',              lat: 23.0271, lng: 88.9455 },
  jessore:        { id: 'jessore',        name: 'Jashore',               bnName: 'যশোর',                 lat: 23.1668, lng: 89.2069 },
  bagerhat:       { id: 'bagerhat',       name: 'Bagerhat',              bnName: 'বাগেরহাট',             lat: 22.6528, lng: 89.7862 },
  mongla:         { id: 'mongla',         name: 'Mongla',                bnName: 'মোংলা',                lat: 22.4744, lng: 89.5812 },
  shyamnagar:     { id: 'shyamnagar',     name: 'Shyamnagar',            bnName: 'শ্যামনগর',             lat: 22.1300, lng: 89.0530 },
  patuakhali:     { id: 'patuakhali',     name: 'Patuakhali',            bnName: 'পটুয়াখালী',             lat: 22.3596, lng: 90.3290 },
  barguna:        { id: 'barguna',        name: 'Barguna',               bnName: 'বরগুনা',               lat: 22.1502, lng: 90.1127 },
  pirojpur:       { id: 'pirojpur',       name: 'Pirojpur',              bnName: 'পিরোজপুর',             lat: 22.5797, lng: 89.9770 },
  gopalganj:      { id: 'gopalganj',      name: 'Gopalganj',             bnName: 'গোপালগঞ্জ',            lat: 23.0031, lng: 89.8225 },
  madaripur:      { id: 'madaripur',      name: 'Madaripur',             bnName: 'মাদারীপুর',            lat: 23.1735, lng: 90.1886 },
  gosairhat:      { id: 'gosairhat',      name: 'Gosairhat',             bnName: 'গোসাইরহাট',            lat: 23.1700, lng: 90.5900 },
  madhukhali:     { id: 'madhukhali',     name: 'Madhukhali',            bnName: 'মধুখালী',              lat: 23.3487, lng: 89.9069 },
  pathorghata:    { id: 'pathorghata',    name: 'Pathorghata',           bnName: 'পাথরঘাটা',             lat: 21.9617, lng: 90.1164 },
  bhola:          { id: 'bhola',          name: 'Bhola',                 bnName: 'ভোলা',                 lat: 22.6890, lng: 90.6448 },
  naogaon:        { id: 'naogaon',        name: 'Naogaon',               bnName: 'নওগাঁ',                lat: 24.8134, lng: 88.9341 },
  nawabganj:      { id: 'nawabganj',      name: 'Chapai Nawabganj',      bnName: 'চাঁপাইনবাবগঞ্জ',       lat: 24.5919, lng: 88.2821 },
  natore:         { id: 'natore',         name: 'Natore',                bnName: 'নাটোর',                lat: 24.4184, lng: 89.0031 },
  panchagarh:     { id: 'panchagarh',     name: 'Panchagarh',            bnName: 'পঞ্চগড়',              lat: 26.3433, lng: 88.5534 },
  thakurgaon:     { id: 'thakurgaon',     name: 'Thakurgaon',            bnName: 'ঠাকুরগাঁও',            lat: 26.0328, lng: 88.4616 },
  kuakata:        { id: 'kuakata',        name: 'Kuakata',               bnName: 'কুয়াকাটা',             lat: 21.8141, lng: 90.1183 },
  bhairab:        { id: 'bhairab',        name: 'Bhairab',               bnName: 'ভৈরব',                 lat: 24.0530, lng: 90.9776 },
  ramganj:        { id: 'ramganj',        name: 'Ramganj',               bnName: 'রামগঞ্জ',              lat: 23.1720, lng: 90.8620 },
  bhurunagamari:  { id: 'bhurunagamari',  name: 'Bhurunagamari',         bnName: 'ভুরুঙ্গামারী',          lat: 26.2649, lng: 89.6908 },
};


export const BUS_DATA: BusRoute[] = [
  {
    id: '13_no',
    name: '13 No.',
    bnName: '১৩নং',
    routeString: 'Mohammadpur ⇄ Azimpur',
    stops: ['mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'newmarket', 'nilkhet', 'azimpur'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '4_no_alike',
    name: '4 No. Alike',
    bnName: '৪নং',
    routeString: 'Balughat ⇄ Motijheel',
    stops: ['mirpur14', 'kachukhet', 'jahangir_gate', 'bijoy_sarani', 'farmgate', 'bangla_motor', 'shahbag', 'paltan', 'gulistan', 'motijheel'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '6_no',
    name: '6 No.',
    bnName: '৬নং',
    routeString: 'Kamalapur ⇄ Notun Bazar',
    stops: ['kamalapur', 'motijheel', 'gulistan', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'mogbazar', 'kawran_bazar', 'farmgate', 'jahangir_gate', 'bijoy_sarani', 'mohakhali', 'gulshan1', 'gulshan2', 'notun_bazar'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },

  {
    id: '7_no',
    name: '7 No.',
    bnName: '৭নং',
    routeString: 'Gabtoli ⇄ Sadarghat',
    stops: ['gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'kalabagan', 'science_lab', 'katabon', 'shahbag', 'matsya_bhaban', 'engineering_institute', 'high_court', 'press_club', 'paltan', 'gpo', 'golap_shah_mazar', 'gulistan', 'naya_bazar', 'ray_saheb_bazar', 'sadarghat'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: '8_no',
    name: '8 No.',
    bnName: '৮নং',
    routeString: 'Jatrabari ⇄ Gabtoli',
    stops: ['jatrabari', 'janapath_moor', 'sayedabad', 'motijheel', 'dainik_bangla_moor', 'paltan', 'press_club', 'matsya_bhaban', 'high_court', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'khamar_bari', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'technical', 'mazar_road', 'gabtoli'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: '9_no',
    name: '9 No.',
    bnName: '৯নং',
    routeString: 'College Gate ⇄ Mirpur 12',
    stops: ['college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'bangla_college', 'tolarbag', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'proshika_moor', 'pallabi', 'buet_market', 'mirpur12'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'achia',
    name: 'Achia',
    bnName: 'আছিয়া',
    routeString: 'Gabtoli ⇄ Demra',
    stops: ['gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'jamuna_future_park', 'bashundhara', 'bashundhara_300_feet', 'nadda', 'coca_cola', 'vatara_moor', 'notun_bazar', 'bashtola', 'shahjadpur', 'uttar_badda', 'badda', 'merul', 'rampura', 'banasree', 'demra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 12:00 PM'
  },
  {
    id: 'achim',
    name: 'Achim Paribahan',
    bnName: 'আছিম পরিবহন',
    routeString: 'Gabtoli ⇄ Demra',
    stops: ['hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'jamuna_future_park', 'bashundhara', 'nadda', 'notun_bazar', 'bashtola', 'shahjadpur', 'uttar_badda', 'badda', 'madhya_badda', 'merul', 'rampura', 'banasree', 'demra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'active_paribahan',
    name: 'Active Paribahan',
    bnName: 'এক্টিভ পরিবহন',
    routeString: 'Shia Masjid ⇄ Abdullahpur',
    stops: ['shia_masjid', 'adabor', 'shyamoli', 'technical', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewrapara', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'agradut', // Overwriting/Updating existing if duplicate ID
    name: 'Agradut',
    bnName: 'অগ্রদূত',
    routeString: 'Savar ⇄ Notun Bazar',
    stops: ['savar', 'nabinagar_savar', 'bank_town', 'hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'agargaon', 'zia_uddyan', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'bashtola', 'shahjadpur', 'uttar_badda', 'notun_bazar'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 10:30 PM'
  },
  {
    id: 'airport_bangabandhu',
    name: 'Airport Bangabandhu Avenue',
    bnName: 'এয়ারপোর্ট বঙ্গবন্ধু এভিনিউ',
    routeString: 'Fulbaria ⇄ Abdullahpur',
    stops: ['fulbaria', 'golap_shah_mazar', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'bijoy_sarani', 'tejgaon', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'mohakhali_bus_stand', 'amtola', 'chairman_bari', 'sainik_club', 'banani', 'kakali', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'uttara_sector7', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ajmeri',
    name: 'Ajmeri Glory',
    bnName: 'আজমেরী গ্লোরী',
    routeString: 'Sadarghat ⇄ Chandra',
    stops: ['sadarghat', 'ray_saheb_bazar', 'naya_bazar', 'golap_shah_mazar', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'moghbazar_crossing', 'mogbazar', 'satrasta', 'nabisco', 'mohakhali', 'mohakhali_flyover', 'amtola', 'sainik_club', 'banani', 'kakali', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur_bypass', 'bhogra', 'konabari', 'konabari_bus_stand', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 12:00 AM'
  },
  {
    id: 'ajmi',
    name: 'Ajmi',
    bnName: 'আজমী',
    routeString: 'Dhamrai ⇄ Chittagong Road',
    stops: ['dhamrai', 'savar', 'nabinagar_savar', 'bank_town', 'hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'kalabagan', 'city_college', 'newmarket', 'nilkhet', 'azimpur', 'bakshi_bazar', 'gulistan', 'tikatuli', 'sayedabad', 'jatrabari', 'shanir_akhra', 'rayerbag', 'matuail', 'signboard', 'chittagong_road'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'akash',
    name: 'Akash',
    bnName: 'আকাশ',
    routeString: 'Kadamtoli ⇄ Tongi',
    stops: ['kadamtoli', 'keraniganj', 'babubazar', 'naya_bazar', 'gulistan', 'paltan', 'shahbag', 'farmgate', 'mohakhali', 'banani', 'airport', 'uttara', 'tongi'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 10:30 PM'
  },
  {
    id: 'akik',
    name: 'Akik',
    bnName: 'আকিক',
    routeString: 'Ansar Camp ⇄ Uttar Badda',
    stops: ['ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'jamuna_future_park', 'bashundhara', 'bashundhara_300_feet', 'nadda', 'notun_bazar', 'bashtola', 'shahjadpur', 'uttar_badda'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'al_madina_plus_one',
    name: 'Al Madina Plus One',
    bnName: 'আল মনিদা প্লাস ওয়ান',
    routeString: 'Nandan Park ⇄ Kamalapur',
    stops: ['nandan_park', 'zirani_bazar', 'zirabo', 'baipayl', 'nobinagar', 'savar', 'nabinagar_savar', 'bank_town', 'hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel', 'kamalapur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'al_makka',
    name: 'Al Makka',
    bnName: 'আল মক্কা',
    routeString: 'Motijheel ⇄ Mirpur 1',
    stops: ['motijheel', 'dainik_bangla_moor', 'gulistan', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'mogbazar', 'satrasta', 'nabisco', 'mohakhali', 'amtola', 'chairman_bari', 'kakali', 'banani', 'ecb', 'kalshi', 'purobi', 'mirpur10', 'mirpur2', 'mirpur1'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'alif',
    name: 'Alif',
    bnName: 'আলিফ',
    routeString: 'Mirpur 10 ⇄ Rampura',
    stops: ['mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'agargaon', 'taltola', 'zia_uddyan', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'merul', 'rampura'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'alif_4',
    name: 'Alif (Japan Garden-Abdullahpur)',
    bnName: 'আলিফ',
    routeString: 'Japan Garden City ⇄ Abdullahpur',
    stops: ['japan_garden', 'ring_road', 'adabor', 'shyamoli', 'shishu_mela', 'agargaon', 'zia_uddyan', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'amtola', 'chairman_bari', 'sainik_club', 'kakali', 'banani', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'alif_3',
    name: 'Alif (Mirpur-Banasree)',
    bnName: 'আলিফ',
    routeString: 'Mirpur 1 ⇄ Banasree',
    stops: ['mirpur1', 'mirpur2', 'mirpur10', 'kazipara', 'shewrapara', 'agargaon', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'merul', 'rampura', 'banasree'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'alif_1',
    name: 'Alif (Mirpur-Nandan)',
    bnName: 'আলিফ',
    routeString: 'Mirpur 14 ⇄ Nandan Park',
    stops: ['mirpur14', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'mazar_road', 'konabari', 'rupnagar', 'beribadh', 'birulia', 'ashulia', 'zirabo', 'fantasy_kingdom', 'nandan_park'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'alif_2',
    name: 'Alif (Shia Masjid-Banasree)',
    bnName: 'আলিফ',
    routeString: 'Shia Masjid ⇄ Banasree',
    stops: ['shia_masjid', 'japan_garden', 'adabor', 'shyamoli', 'shishu_mela', 'agargaon', 'taltola', 'zia_uddyan', 'bijoy_sarani', 'tejgaon', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'merul', 'rampura', 'banasree'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'anabil_super',
    name: 'Anabil Super',
    bnName: 'অনাবিল সুপার',
    routeString: 'Sign Board ⇄ Gazipur',
    stops: ['signboard', 'shonir_akhra', 'shanir_akhra', 'jatrabari', 'sayedabad', 'mugdapara', 'bashabo', 'khilgaon', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur_bypass', 'gazipur'],
    type: 'Sitting',
    hours: '6:00 AM - 12:00 PM'
  },
  {
    id: 'arnob',
    name: 'Arnob',
    bnName: 'অরনব',
    routeString: 'Hemayetpur ⇄ Demra',
    stops: ['hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'agargaon', 'zia_uddyan', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'merul', 'rampura', 'banasree', 'demra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ashirbad',
    name: 'Ashirbad Pahibahan',
    bnName: 'আশীর্বাদ পরিবহন',
    routeString: 'Duairipara ⇄ Azimpur',
    stops: ['duairipara', 'rupnagar_abashik', 'shial_bari', 'proshika_moor', 'mirpur3', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'shukrabad', 'dhanmondi32', 'kalabagan', 'city_college', 'newmarket', 'nilkhet', 'azimpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ashulia_classic',
    name: 'Ashulia Classic',
    bnName: 'আশুলিয়া ক্লাসিক',
    routeString: 'Nobinagar ⇄ Satrasta',
    stops: ['nobinagar', 'baipayl', 'jamgora', 'fantasy_kingdom', 'zirabo', 'ashulia', 'kamarpara', 'abdullahpur', 'uttara', 'azampur', 'rajlakshmi', 'jashimuddin', 'airport', 'khilkhet', 'kuril', 'kuril_chourasta', 'shewra', 'mes', 'kakali', 'banani', 'chairman_bari', 'amtola', 'mohakhali', 'nabisco', 'satrasta'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'asmani',
    name: 'Asmani',
    bnName: 'আসমানী',
    routeString: 'Mirpur 14 ⇄ Madanpur',
    stops: ['mirpur14', 'mirpur13', 'mirpur11', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'agargaon', 'taltola', 'zia_uddyan', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'merul', 'rampura', 'banasree', 'khilgaon_flyover', 'tt_para', 'mugdapara', 'kamalapur', 'maniknagar', 'tt_para', 'sayedabad', 'jatrabari', 'shonir_akhra', 'shanir_akhra', 'rayerbag', 'matuail', 'signboard', 'chittagong_road', 'kachpur_bridge', 'madanpur'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'atcl',
    name: 'ATCL',
    bnName: 'এটিসিএল',
    routeString: 'Mohammadpur ⇄ Arambagh',
    stops: ['mohammadpur', 'asad_gate', 'shukrabad', 'kalabagan', 'city_college', 'science_lab', 'katabon', 'bata_signal', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'arambagh'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ayath',
    name: 'Ayath',
    bnName: 'আয়াত',
    routeString: 'Chiriyakhana ⇄ Kamalapur',
    stops: ['chiriyakhana', 'rainkhola', 'shial_bari', 'sony_cinema', 'mirpur2', 'mirpur10', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'mogbazar', 'mouchak', 'malibagh', 'rajarbag', 'kamalapur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'bahon',
    name: 'Bahon',
    bnName: 'বাহন',
    routeString: 'Mirpur 14 ⇄ Khilgaon',
    stops: ['mirpur14', 'mirpur10', 'mirpur2', 'mirpur1', 'ansar_camp', 'bangla_college', 'technical', 'mazar_road', 'darussalam', 'kallyanpur', 'shyamoli', 'shishu_mela', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'science_lab', 'katabon', 'shahbag', 'high_court', 'press_club', 'paltan', 'dainik_bangla_moor', 'motijheel', 'ittefaq_moor', 'arambagh', 'kamalapur', 'bashabo', 'khilgaon', 'khidma_hospital'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'baishakhi',
    name: 'Baishakhi Paribahan',
    bnName: 'বৈশাখী পরিবহন',
    routeString: 'Savar ⇄ Notun Bazar',
    stops: ['savar', 'nabinagar_savar', 'bank_town', 'hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'agargaon', 'taltola', 'zia_uddyan', 'bijoy_sarani', 'tejgaon', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'bashtola', 'shahjadpur', 'uttar_badda', 'notun_bazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'balaka',
    name: 'Balaka',
    bnName: 'বলাকা',
    routeString: 'Sayedabad ⇄ Gazipur',
    stops: ['sayedabad', 'mugdapara', 'bashabo', 'khilgaon', 'khidma_hospital', 'malibagh_railgate', 'hazipara', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'notun_bazar', 'nadda', 'bashundhara', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'gazipur', 'bhogra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'bashumoti',
    name: 'Bashumoti',
    bnName: 'বসুমতি',
    routeString: 'Gazipur ⇄ Gabtoli',
    stops: ['gazipur', 'board_bazar', 'mill_gate', 'station_road', 'tongi', 'tongi_college_gate', 'abdullahpur', 'airport', 'khilkhet', 'kuril', 'kuril_chourasta', 'kalshi', 'pallabi', 'mirpur11', 'mirpur10', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'gabtoli'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'basumati_transport',
    name: 'Basumati Transport',
    bnName: 'বাসুমতি ট্রান্সপোর্ট',
    routeString: 'Gabtoli ⇄ Gazipur',
    stops: ['gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'station_road', 'mill_gate', 'board_bazar', 'gazipur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'best_satabdi',
    name: 'Best Satabdi AC',
    bnName: 'বেষ্ট শতাব্দী এসি',
    routeString: 'Azimpur ⇄ Diabari',
    stops: ['azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'khamar_bari', 'farmgate', 'jahangir_gate', 'mohakhali', 'amtola', 'chairman_bari', 'sainik_club', 'banani', 'kakali', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'diabari'],
    type: 'AC',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'best_transport',
    name: 'Best Transport',
    bnName: 'বেষ্ট ট্রান্সপোর্ট',
    routeString: 'Mirpur 10 ⇄ Jatrabari',
    stops: ['mirpur10', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel', 'dainik_bangla_moor', 'ittefaq_moor', 'sayedabad', 'janapath_moor', 'jatrabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'bhuiyan',
    name: 'Bhuiyan',
    bnName: 'ভূঁইয়া',
    routeString: 'Japan Garden City ⇄ Abdullahpur',
    stops: ['japan_garden', 'ring_road', 'adabor', 'shyamoli', 'shishu_mela', 'agargaon', 'zia_uddyan', 'bijoy_sarani', 'old_airport', 'jahangir_gate', 'mohakhali', 'amtola', 'chairman_bari', 'sainik_club', 'kakali', 'banani', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'bihanga',
    name: 'Bihanga',
    bnName: 'বিহঙ্গ',
    routeString: 'Mirpur 12 ⇄ Azimpur',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'mirpur9', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'shukrabad', 'kalabagan', 'city_college', 'newmarket', 'nilkhet', 'azimpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'bihanga_2',
    name: 'Bihanga (Mirpur-Notun Bazar)',
    bnName: 'বিহঙ্গ',
    routeString: 'Mirpur 12 ⇄ Notun Bazar',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan_bridge', 'gulshan1', 'badda_link_road', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'bikalpa_auto',
    name: 'Bikalpa Bus Auto Service',
    bnName: 'বিকল্প বাস অটো সার্ভিস',
    routeString: 'Mirpur 12 ⇄ Motijheel',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'mirpur1', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'bijoy_sarani', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'bikalpa_city_super',
    name: 'Bikalpa Bus City Super Service',
    bnName: 'বিকল্প বাস সিটি সুপার সার্ভিস',
    routeString: 'Mirpur 12 ⇄ Dhakeshwari',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'shukrabad', 'dhanmondi32', 'kalabagan', 'city_college', 'newmarket', 'nilkhet', 'azimpur', 'dhakeshwari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'bikash',
    name: 'Bikash',
    bnName: 'বিকাশ',
    routeString: 'Azimpur ⇄ Kamarpara',
    stops: ['azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi27', 'dhanmondi32', 'khamar_bari', 'farmgate', 'jahangir_gate', 'mohakhali', 'amtola', 'chairman_bari', 'sainik_club', 'banani', 'kakali', 'staff_road', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur', 'kamarpara'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'bikash_paribahan',
    name: 'Bikash Paribahan',
    bnName: 'বিকাশ পরিবহন',
    routeString: 'Sign Board ⇄ Dhour',
    stops: ['signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'kazla', 'jatrabari', 'janapath_moor', 'sayedabad', 'gulistan', 'chankhar_pul', 'bakshi_bazar', 'azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'khamar_bari', 'farmgate', 'jahangir_gate', 'mohakhali', 'amtola', 'chairman_bari', 'sainik_club', 'banani', 'kakali', 'staff_road', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur', 'kamarpara', 'dhour'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'bondhu',
    name: 'Bondhu',
    bnName: 'বন্ধু',
    routeString: 'Gulistan ⇄ Narayanganj',
    stops: ['gulistan', 'tikatuli', 'sayedabad', 'jatrabari', 'shanir_akhra', 'signboard', 'chashara', 'shibu_market', 'mondolpara'],
    type: 'Local',
    hours: '5:30 AM - 11:00 PM'
  },
  {
    id: 'bondhu_paribahan',
    name: 'Bondhu Paribahan',
    bnName: 'বন্ধু পরিবহন',
    routeString: 'Gulistan ⇄ Notun Bazar',
    stops: ['gulistan', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'moghbazar_crossing', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'borak',
    name: 'Borak',
    bnName: 'বোরাক',
    routeString: 'Palashi ⇄ Meghna Ghat',
    stops: ['palashi', 'chittagong_road', 'sonargaon', 'chashara', 'meghna_ghat'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brihottor_mirpur',
    name: 'Brihottor Mirpur',
    bnName: 'বৃহত্তর মিরপুর',
    routeString: 'Chiriyakhana ⇄ Chandra',
    stops: ['chiriyakhana', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'savar', 'nobinagar', 'baipayl', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_gazipur',
    name: 'BRTC (Gabtoli-Gazipur)',
    bnName: 'বি আর টিসি',
    routeString: 'Gabtoli ⇄ Gazipur',
    stops: ['gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur_bypass', 'bhogra', 'gazipur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_kamalapur',
    name: 'BRTC (Kamalapur-Kuril)',
    bnName: 'বি আর টিসি',
    routeString: 'Kamalapur ⇄ Kuril',
    stops: ['kamalapur', 'motijheel', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'farmgate', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_savar',
    name: 'BRTC (Madanpur-Savar)',
    bnName: 'বি আর টিসি',
    routeString: 'Madanpur ⇄ Savar',
    stops: ['madanpur', 'kanchpur', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'shanir_akhra', 'jatrabari', 'sayedabad', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'khamar_bari', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'tetuljhora', 'dhamsona', 'yearpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'savar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_badda',
    name: 'BRTC (Mohammadpur-Kuril)',
    bnName: 'বি আর টিসি',
    routeString: 'Mohammadpur ⇄ Kuril',
    stops: ['mohammadpur', 'asad_gate', 'khamar_bari', 'farmgate', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_mohammadpur',
    name: 'BRTC (Mohammadpur-Motijheel)',
    bnName: 'বি আর টিসি',
    routeString: 'Mohammadpur ⇄ Motijheel',
    stops: ['mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'bata_signal', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_airport',
    name: 'BRTC (Motijheel-Abdullahpur)',
    bnName: 'বি আর টিসি',
    routeString: 'Motijheel ⇄ Abdullahpur',
    stops: ['motijheel', 'gulistan', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_chandra',
    name: 'BRTC (Motijheel-Chandra)',
    bnName: 'বি আর টিসি',
    routeString: 'Motijheel ⇄ Chandra',
    stops: ['motijheel', 'ittefaq_moor', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'khamar_bari', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'tetuljhora', 'dhamsona', 'yearpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'baipayl', 'zirabo', 'zirani_bazar', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_tongi',
    name: 'BRTC (Motijheel-Tongi)',
    bnName: 'বি আর টিসি',
    routeString: 'Motijheel ⇄ Tongi',
    stops: ['motijheel', 'dainik_bangla_moor', 'ittefaq_moor', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'mohakhali_bus_stand', 'amtola', 'chairman_bari', 'kakali', 'banani', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_vulta',
    name: 'BRTC (Vulta-Kuril)',
    bnName: 'বি আর টিসি',
    routeString: 'Vulta ⇄ Kuril',
    stops: ['vulta', 'kanchan_bridge', 'nila_market', '300_feet', 'bashundhara_300_feet', 'kuril'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_elevated',
    name: 'BRTC Elevated',
    bnName: 'বিআরটিসি এলিভেটেড',
    routeString: 'Rajlakshmi ⇄ Farmgate',
    stops: ['rajlakshmi', 'airport', 'farmgate', 'bijoy_sarani'],
    type: 'Sitting',
    hours: '7:00 AM - 6:00 PM'
  },
  {
    id: 'cantonment',
    name: 'Cantonment',
    bnName: 'ক্যান্টনমেন্ট',
    routeString: 'Mirpur 14 ⇄ Savar',
    stops: ['mirpur14', 'mirpur13', 'mirpur11', 'mirpur10', 'mirpur9', 'mirpur8', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'savar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'champion',
    name: 'Champion',
    bnName: 'চ্যাম্পিয়ন',
    routeString: 'Vashantek ⇄ Gabtoli',
    stops: ['vashantek', 'mirpur14', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'gabtoli'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'city_link',
    name: 'City Link',
    bnName: 'সিটি লিংক',
    routeString: 'Chittagong Road ⇄ Ghatar Char',
    stops: ['chittagong_road', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'kazla', 'jatrabari', 'janapath_moor', 'sayedabad', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bata_signal', 'science_lab', 'city_college', 'jigatola', 'dhanmondi15', 'star_kabab', 'shankar', 'mohammadpur', 'bosila', 'ghatar_char'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'd_link',
    name: 'D Link',
    bnName: 'ডি লিংক',
    routeString: 'Fulbaria ⇄ Dhamrai',
    stops: ['fulbaria', 'chankhar_pul', 'bakshi_bazar', 'azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'savar', 'dhamrai'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'd_one',
    name: 'D One Transport',
    bnName: 'ডি ওয়ান',
    routeString: 'Motijheel ⇄ Dhamrai',
    stops: ['motijheel', 'dainik_bangla_moor', 'paltan', 'press_club', 'matsya_bhaban', 'high_court', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'khamar_bari', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'nobinagar', 'dhamrai'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'deepan',
    name: 'Deepan',
    bnName: 'দীপন',
    routeString: 'Mohammadpur ⇄ Motijheel',
    stops: ['mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'katabon', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'desh_bangla',
    name: 'Desh Bangla',
    bnName: 'দেশ বাংলা',
    routeString: 'Postagola ⇄ Kamarpara',
    stops: ['postagola', 'dholairpar', 'jatrabari', 'janapath_moor', 'sayedabad', 'mugdapara', 'malibagh', 'rampura_bazar', 'rampura', 'merul', 'uttar_badda', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'abdullahpur', 'kamarpara'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'dewan',
    name: 'Dewan',
    bnName: 'দেওয়ান',
    routeString: 'Azimpur ⇄ Kuril',
    stops: ['azimpur', 'eden_college', 'nilkhet', 'newmarket', 'science_lab', 'city_college', 'katabon', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'kuril_chourasta'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'dhaka_metro',
    name: 'Dhaka Metro Service',
    bnName: 'ঢাকা মেট্রো সার্ভিস',
    routeString: 'Mirpur 1 ⇄ Azimpur',
    stops: ['mirpur1', 'ansar_camp', 'technical', 'mirpur10', 'mirpur14', 'kallyanpur', 'shyamoli', 'asad_gate', 'dhanmondi32', 'shukrabad', 'kalabagan', 'science_lab', 'newmarket', 'nilkhet', 'azimpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'dhaka_paribahan',
    name: 'Dhaka Paribahan',
    bnName: 'ঢাকা পরিবহন',
    routeString: 'Gulistan ⇄ Shib Bari',
    stops: ['gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'farmgate', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'kakali', 'banani', 'airport', 'uttara', 'gazipur', 'shib_bari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'dhakar_chaka_2',
    name: 'Dhakar Chaka (Banani)',
    bnName: 'ঢাকার চাকা',
    routeString: 'Banani ⇄ Notun Bazar',
    stops: ['banani', 'gulshan2', 'notun_bazar'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'dhakar_chaka_1',
    name: 'Dhakar Chaka (Gulshan)',
    bnName: 'ঢাকার চাকা',
    routeString: 'Police Plaza ⇄ Gulshan 2',
    stops: ['police_plaza', 'gulshan1', 'gulshan2'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'dip_paribahan',
    name: 'Dip Paribahan',
    bnName: 'দ্বীপ পরিবহন',
    routeString: 'Azimpur ⇄ Kuril',
    stops: ['azimpur', 'city_college', 'kalabagan', 'panthapath', 'kawran_bazar', 'satrasta', 'nabisco', 'mohakhali', 'wireless', 'gulshan1', 'badda_link_road', 'notun_bazar', 'bashundhara', 'kuril'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'dipon',
    name: 'Dipon',
    bnName: 'দিপন',
    routeString: 'Tajmahal Road ⇄ Arambagh',
    stops: ['tajmahal_road', 'salimullah_road', 'jakir_hossen_road', 'shankar', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'baitul_mukarram', 'gulistan', 'motijheel', 'dainik_bangla_moor', 'ittefaq_moor', 'arambagh'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'dishari',
    name: 'Dishari',
    bnName: 'দিশারি',
    routeString: 'Chiriyakhana ⇄ Keraniganj',
    stops: ['chiriyakhana', 'rainkhola', 'shial_bari', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'golap_shah_mazar', 'naya_bazar', 'ray_saheb_bazar', 'babubazar', 'mitford', 'jinira'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'elevated_expressway',
    name: 'Elevated Expressway',
    bnName: 'এলিভেটেড এক্সপ্রেসওয়ে',
    routeString: 'Gulistan ⇄ Shib Bari',
    stops: ['gulistan', 'shahbag', 'farmgate', 'airport', 'tongi_college_gate', 'board_bazar', 'bhogra', 'shib_bari'],
    type: 'AC',
    hours: '7:00 AM - 9:00 PM'
  },
  {
    id: 'elite',
    name: 'Elite',
    bnName: 'এলিট',
    routeString: 'Agargaon ⇄ Abdullahpur',
    stops: ['agargaon', 'taltola', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'purobi', 'pallabi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'etc',
    name: 'ETC Transport',
    bnName: 'ইটিসি',
    routeString: 'Mirpur 12 ⇄ Sadarghat',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'golap_shah_mazar', 'naya_bazar', 'ray_saheb_bazar', 'sadarghat'],
    type: 'Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'etc_transport',
    name: 'ETC Transport',
    bnName: 'ইটিসি ট্রান্সপোর্ট',
    routeString: 'Golap Shah Mazar ⇄ Mirpur 12',
    stops: ['golap_shah_mazar', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'khamar_bari', 'agargaon', 'taltola', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'purobi', 'pallabi', 'mirpur12'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'everest',
    name: 'Everest Paribahan',
    bnName: 'এভারেস্ট পরিবহন',
    routeString: 'Rupnagar ⇄ Keraniganj',
    stops: ['rupnagar_abashik', 'mirpur2', 'mirpur1', 'ansar_camp', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'gulistan', 'babubazar', 'keraniganj'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'falgun',
    name: 'Falgun',
    bnName: 'ফাল্গুন',
    routeString: 'Azimpur ⇄ Uttara',
    stops: ['azimpur', 'nilkhet', 'newmarket', 'science_lab', 'bata_signal', 'katabon', 'shahbag', 'matsya_bhaban', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'malibagh_railgate', 'khidma_hospital', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'shahjadpur', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'uttara'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'faysal',
    name: 'Faysal',
    bnName: 'ফয়সাল',
    routeString: 'Mohammadpur ⇄ Abdullahpur',
    stops: ['mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'shahbag', 'bangla_motor', 'farmgate', 'mohakhali', 'mohakhali_flyover', 'banani', 'kakali', 'staff_road', 'mes', 'shewra', 'kuril', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'first_ten',
    name: 'First Ten',
    bnName: 'ফার্স্ট টেন',
    routeString: 'Vashantek ⇄ Gabtoli',
    stops: ['vashantek', 'mirpur14', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'gabtoli'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ftcl',
    name: 'FTCL',
    bnName: 'এফটিসিএল',
    routeString: 'Mohammadpur ⇄ Banasree',
    stops: ['mohammadpur', 'shia_masjid', 'japan_garden', 'adabor', 'shyamoli', 'shishu_mela', 'agargaon', 'taltola', 'zia_uddyan', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'merul', 'rampura', 'banasree'],
    type: 'Sitting',
    hours: '6:30 AM - 10:30 PM'
  },
  {
    id: 'ftcl_3',
    name: 'FTCL (Mohammadpur-Arambagh)',
    bnName: 'এফটিসিএল',
    routeString: 'Mohammadpur ⇄ Arambagh',
    stops: ['mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'bata_signal', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel', 'arambagh'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'gangchil_mawa',
    name: 'Gangchil (Mawa)',
    bnName: 'গাংচিল',
    routeString: 'Mohammadpur ⇄ Mawa',
    stops: ['mohammadpur', 'shankar', 'dhanmondi15', 'jigatola', 'city_college', 'newmarket', 'nilkhet', 'azimpur', 'bakshi_bazar', 'gulistan', 'jatrabari', 'jurain', 'postagola', 'keraniganj', 'kuchimura', 'sreenagar', 'mawa'],
    type: 'Sitting',
    hours: '6:00 AM - 9:00 PM'
  },
  {
    id: 'gazipur_paribahan',
    name: 'Gazipur Paribahan',
    bnName: 'গাজীপুর পরিবহন',
    routeString: 'Motijheel ⇄ Shib Bari',
    stops: ['motijheel', 'dainik_bangla_moor', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'moghbazar_crossing', 'mogbazar', 'satrasta', 'nabisco', 'mohakhali', 'mohakhali_flyover', 'mohakhali_bus_stand', 'amtola', 'chairman_bari', 'sainik_club', 'kakali', 'banani', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur', 'bhogra', 'shib_bari'],
    type: 'Semi-Sitting',
    hours: '5:00 AM - 12:00 AM'
  },
  {
    id: 'grameen',
    name: 'Grameen',
    bnName: 'গ্রামীণ',
    routeString: 'Mirpur 14 ⇄ Gabtoli',
    stops: ['mirpur14', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'gabtoli'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'grameen_suveccha',
    name: 'Grameen Suveccha',
    bnName: 'গ্রামীণ শুভেচ্ছা',
    routeString: 'Fulbaria ⇄ Chandra',
    stops: ['fulbaria', 'chankhar_pul', 'bakshi_bazar', 'azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'savar', 'baipayl', 'zirabo', 'nandan_park', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'great_bikrampur',
    name: 'Great Bikrampur',
    bnName: 'গ্রেট বিক্রমপুর',
    routeString: 'Gulistan ⇄ Mawa',
    stops: ['gulistan', 'tikatuli', 'sayedabad', 'jatrabari', 'jurain', 'postagola', 'keraniganj', 'kuchimura', 'nimtola', 'sreenagar', 'mawa'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'green_anabil',
    name: 'Green Anabil',
    bnName: 'গ্রীন অনাবিল',
    routeString: 'Chashara ⇄ Gazipur',
    stops: ['chashara', 'shibu_market', 'jalkuri', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'shanir_akhra', 'jatrabari', 'sayedabad', 'mugdapara', 'bashabo', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur_bypass', 'bhogra', 'gazipur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'green_dhaka',
    name: 'Green Dhaka',
    bnName: 'গ্রীন ঢাকা',
    routeString: 'Motijheel ⇄ Abdullahpur',
    stops: ['motijheel', 'gulistan', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'malibagh_railgate', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'gulshan_chaka',
    name: 'Gulshan Chaka',
    bnName: 'গুলশান চাকা',
    routeString: 'Banani ⇄ Notun Bazar',
    stops: ['banani', 'gulshan2', 'notun_bazar'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'hazi_transport',
    name: 'Hazi Transport',
    bnName: 'হাজী ট্রান্সপোর্ট',
    routeString: 'Mirpur 12 ⇄ Azimpur',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'shukrabad', 'kalabagan', 'city_college', 'newmarket', 'nilkhet', 'azimpur'],
    type: 'Sitting',
    hours: '6:30 AM - 11:30 PM'
  },
  {
    id: 'himachal',
    name: 'Himachal',
    bnName: 'হিমাচল',
    routeString: 'Mirpur 12 ⇄ Motijheel',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'bijoy_sarani', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'himachal_narayanganj',
    name: 'Himachal',
    bnName: 'হিমাচল',
    routeString: 'Gabtoli ⇄ Narayanganj',
    stops: ['gabtoli', 'technical', 'kallyanpur', 'shyamoli', 'college_gate', 'asad_gate', 'dhanmondi27', 'kalabagan', 'city_college', 'newmarket', 'nilkhet', 'azimpur', 'gulistan', 'sayedabad', 'jatrabari', 'shanir_akhra', 'signboard', 'chashara', 'mondolpara'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'himachal_suveccha',
    name: 'Himachal Suveccha',
    bnName: 'হিমাচল শুভেচ্ছা',
    routeString: 'Metro Hall ⇄ Mirpur 12',
    stops: ['metro_hall', 'chashara', 'shibu_market', 'jalkuri', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'jatrabari', 'janapoth', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'farmgate', 'bijoy_sarani', 'agargaon', 'taltola', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'purobi', 'pallabi', 'mirpur12'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'himalay',
    name: 'Himalay',
    bnName: 'হিমালয়',
    routeString: 'Madanpur ⇄ Tongi',
    stops: ['madanpur', 'jatrabari', 'bangladesh_bank', 'mogbazar', 'mohakhali', 'tongi'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ilish',
    name: 'Ilish Paribahan',
    bnName: 'ইলিশ পরিবহন',
    routeString: 'Gulistan ⇄ Mawa',
    stops: ['gulistan', 'tikatuli', 'sayedabad', 'jatrabari', 'jurain', 'postagola', 'keraniganj', 'kuchimura', 'nimtola', 'sreenagar', 'mawa'],
    type: 'Local',
    hours: '5:30 AM - 10:00 PM'
  },
  {
    id: 'itihash',
    name: 'Itihash',
    bnName: 'ইতিহাস',
    routeString: 'Mirpur 14 ⇄ Chandra',
    stops: ['mirpur14', 'mirpur13', 'mirpur11', 'mirpur10', 'mirpur9', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'savar', 'nobinagar', 'baipayl', 'zirabo', 'nandan_park', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'jm_super',
    name: 'J M Super Paribahan',
    bnName: 'জে এম সুপার পরিবহন',
    routeString: 'Jatrabari ⇄ Tongi',
    stops: ['jatrabari', 'janapath_moor', 'sayedabad', 'mugdapara', 'bashabo', 'khilgaon', 'khidma_hospital', 'malibagh_railgate', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'jabale_noor_1',
    name: 'Jabale Noor (Agargaon-Abdullahpur)',
    bnName: 'জাবালে নুর পরিবহন',
    routeString: 'Agargaon ⇄ Abdullahpur',
    stops: ['agargaon', 'taltola', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'purobi', 'pallabi', 'kalshi', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'jabale_noor_2',
    name: 'Jabale Noor (Gabtoli-Notun Bazar)',
    bnName: 'জাবালে নুর পরিবহন',
    routeString: 'Gabtoli ⇄ Notun Bazar',
    stops: ['gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'mirpur10', 'kalshi', 'kuril', 'kuril_chourasta', 'jamuna_future_park', 'bashundhara', 'nadda', 'notun_bazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'janjabil',
    name: 'Janjabil',
    bnName: 'জানযাবিল',
    routeString: 'Gabtoli ⇄ Babubazar',
    stops: ['gabtoli', 'beribadh', 'sikder_medical', 'hazaribag', 'kamrangirchar', 'showari_ghat', 'babubazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'kamal_plus',
    name: 'Kamal Plus Paribahan',
    bnName: 'কামাল প্লাস পরিবহন',
    routeString: 'Chittagong Road ⇄ Ghatar Char',
    stops: ['chittagong_road', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'kazla', 'jatrabari', 'janapath_moor', 'sayedabad', 'gulistan', 'chankhar_pul', 'bakshi_bazar', 'azimpur', 'nilkhet', 'newmarket', 'science_lab', 'city_college', 'jigatola', 'dhanmondi15', 'star_kabab', 'shankar', 'mohammadpur', 'bosila', 'ghatar_char'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'kanak_2',
    name: 'Kanak',
    bnName: 'কনক',
    routeString: 'Mirpur 1 ⇄ Abdullahpur',
    stops: ['mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'khajababa',
    name: 'Khajababa Paribahan',
    bnName: 'খাজাবাবা',
    routeString: 'Mirpur 12 ⇄ Jatrabari',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'shukrabad', 'kalabagan', 'city_college', 'newmarket', 'nilkhet', 'azimpur', 'bakshi_bazar', 'chankhar_pul', 'gulistan', 'sayedabad', 'jatrabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'kironmala',
    name: 'Kironmala Paribahan',
    bnName: 'কিরণমালা',
    routeString: 'Chiriyakhana ⇄ Konabari',
    stops: ['chiriyakhana', 'mirpur1', 'sony_cinema', 'rupnagar', 'birulia', 'ashulia', 'zirabo', 'narsinghpur', 'surabari', 'jarun', 'konabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'labbaik',
    name: 'Labbaik',
    bnName: 'লাব্বাইক',
    routeString: 'Savar ⇄ Sign Board',
    stops: ['savar', 'nabinagar_savar', 'bank_town', 'hemayetpur', 'yearpur', 'dhamsona', 'tetuljhora', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'moghbazar_crossing', 'mogbazar', 'mouchak', 'malibagh', 'rajarbag', 'khilgaon_flyover', 'khidma_hospital', 'bashabo', 'mugdapara', 'maniknagar', 'golapbagh', 'sayedabad', 'janapath_moor', 'jatrabari', 'kazla', 'shonir_akhra', 'shanir_akhra', 'rayerbag', 'matuail', 'signboard'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'lal_sabuj',
    name: 'Lal Sabuj',
    bnName: 'লাল সবুজ',
    routeString: 'Nandan Park ⇄ Motijheel',
    stops: ['nandan_park', 'zirabo', 'baipayl', 'nobinagar', 'savar', 'nabinagar_savar', 'bank_town', 'hemayetpur', 'yearpur', 'dhamsona', 'tetuljhora', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'lams',
    name: 'Lams',
    bnName: 'ল্যামস',
    routeString: 'Mirpur 12 ⇄ Gabtoli',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'gabtoli'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'malancha',
    name: 'Malancha',
    bnName: 'মালঞ্চ',
    routeString: 'Mohammadpur ⇄ Dhupkhola',
    stops: ['mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'bata_signal', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'dayaganj', 'dhupkhola'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'manjil_express',
    name: 'Manjil Express',
    bnName: 'মাঞ্জিল এক্সপ্রেস',
    routeString: 'Chittagong Road ⇄ Abdullahpur',
    stops: ['chittagong_road', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'kazla', 'jatrabari', 'janapath_moor', 'sayedabad', 'gulistan', 'gpo', 'paltan', 'kakrail', 'malibagh', 'mouchak', 'mogbazar', 'satrasta', 'nabisco', 'mohakhali', 'amtola', 'chairman_bari', 'sainik_club', 'banani', 'kakali', 'staff_road', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 10:30 PM'
  },
  {
    id: 'meghla_transport',
    name: 'Meghla Transport',
    bnName: 'মেঘলা ট্রান্সপোর্ট',
    routeString: 'Kalabagan ⇄ Vulta',
    stops: ['kalabagan', 'science_lab', 'katabon', 'bata_signal', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'sayedabad', 'janapath_moor', 'jatrabari', 'shonir_akhra', 'signboard', 'kanchpur', 'tarabo', 'vulta'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'meshkat',
    name: 'Meshkat',
    bnName: 'মেশকাত',
    routeString: 'Mohammadpur ⇄ Chittagong Road',
    stops: ['mohammadpur', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'matsya_bhaban', 'paltan', 'dainik_bangla_moor', 'motijheel', 'ittefaq_moor', 'jatrabari', 'shonir_akhra', 'rayerbag', 'matuail', 'signboard', 'chittagong_road'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'midline',
    name: 'Midline',
    bnName: 'মিডলাইন',
    routeString: 'Mohammadpur ⇄ Khilgaon',
    stops: ['mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'katabon', 'shahbag', 'matsya_bhaban', 'engineering_institute', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel', 'dainik_bangla_moor', 'ittefaq_moor', 'arambagh', 'kamalapur', 'bashabo', 'khilgaon', 'khidma_hospital'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'mirpur_link',
    name: 'Mirpur Link',
    bnName: 'মিরপুর লিংক',
    routeString: 'ECB Square ⇄ Azimpur',
    stops: ['ecb', 'kalshi', 'purobi', 'mirpur11', 'mirpur10', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'khamar_bari', 'dhanmondi27', 'shukrabad', 'dhanmondi32', 'kalabagan', 'city_college', 'newmarket', 'nilkhet', 'azimpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'mirpur_mission',
    name: 'Mirpur Mission',
    bnName: 'মিরপুর মিশন',
    routeString: 'Chiriyakhana ⇄ Motijheel',
    stops: ['chiriyakhana', 'mirpur1', 'ansar_camp', 'technical', 'khamar_bari', 'farmgate', 'press_club', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'mirpur_transport',
    name: 'Mirpur Transport Service',
    bnName: 'মিরপুর ট্রান্সপোর্ট সার্ভিস',
    routeString: 'Gulistan ⇄ Mirpur 12',
    stops: ['gulistan', 'golap_shah_mazar', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'khamar_bari', 'agargaon', 'taltola', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'purobi', 'pallabi', 'mirpur12'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'mirpur_united',
    name: 'Mirpur United Service',
    bnName: 'মিরপুর ইউনাইটেড সার্ভিস',
    routeString: 'Sadarghat ⇄ Mirpur 12',
    stops: ['sadarghat', 'ray_saheb_bazar', 'naya_bazar', 'golap_shah_mazar', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'farmgate', 'khamar_bari', 'agargaon', 'taltola', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'purobi', 'pallabi', 'mirpur12'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'mm_lovely',
    name: 'MM Lovely',
    bnName: 'এম এম লাভলী',
    routeString: 'Savar ⇄ Signboard',
    stops: ['savar', 'hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'mogbazar', 'mouchak', 'malibagh', 'mugdapara', 'rajarbag', 'khilgaon_flyover', 'khidma_hospital', 'bashabo', 'maniknagar', 'golapbagh', 'sayedabad', 'janapath_moor', 'jatrabari', 'kazla', 'shonir_akhra', 'rayerbag', 'matuail', 'signboard'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'modhumoti_2',
    name: 'Modhumoti',
    bnName: 'মধুমতি',
    routeString: 'Chiriyakhana ⇄ Demra',
    stops: ['chiriyakhana', 'rainkhola', 'shial_bari', 'sony_cinema', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'agargaon', 'taltola', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'badda_link_road', 'merul', 'rampura', 'banasree', 'demra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'mohona',
    name: 'Mohona',
    bnName: 'মোহনা',
    routeString: 'Mirpur 14 ⇄ Fantasy Kingdom',
    stops: ['mirpur14', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'mazar_road', 'konabari', 'rupnagar', 'beribadh', 'birulia', 'ashulia', 'zirabo', 'fantasy_kingdom'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'moitri',
    name: 'Moitri',
    bnName: 'মৈত্রী',
    routeString: 'Mohammadpur ⇄ Arambagh',
    stops: ['mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'bata_signal', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel', 'arambagh'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'moumita',
    name: 'Moumita',
    bnName: 'মৌমিতা',
    routeString: 'Chashara ⇄ Chandra',
    stops: ['chashara', 'shibu_market', 'jalkuri', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'kazla', 'jatrabari', 'janapath_moor', 'sayedabad', 'gulistan', 'chankhar_pul', 'bakshi_bazar', 'azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'savar', 'baipayl', 'zirani_bazar', 'nandan_park', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'mtcl_2',
    name: 'MTCL-2',
    bnName: 'এমটিসিএল ২',
    routeString: 'Mohammadpur ⇄ Fantasy Kingdom',
    stops: ['mohammadpur', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'shukrabad', 'kalabagan', 'city_college', 'science_lab', 'bata_signal', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel', 'dainik_bangla_moor', 'ittefaq_moor', 'arambagh', 'fantasy_kingdom'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'nabakali',
    name: 'Nabakali',
    bnName: 'নবকালি',
    routeString: 'Chiriyakhana ⇄ Keraniganj',
    stops: ['chiriyakhana', 'rainkhola', 'shial_bari', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'shukrabad', 'dhanmondi32', 'kalabagan', 'science_lab', 'katabon', 'shahbag', 'high_court', 'fulbaria', 'naya_bazar', 'ray_saheb_bazar', 'babubazar', 'mitford', 'jinira'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'new_shuktara',
    name: 'New Shuktara',
    bnName: 'নিউ শুকতারা',
    routeString: 'Gabtoli ⇄ Sadarghat',
    stops: ['gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'asad_gate', 'newmarket', 'azimpur', 'gulistan', 'sadarghat'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'new_vision',
    name: 'New Vision',
    bnName: 'নিউ ভিশন',
    routeString: 'Chiriyakhana ⇄ Motijheel',
    stops: ['chiriyakhana', 'rainkhola', 'shial_bari', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'dainik_bangla_moor', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'nilachal',
    name: 'Nilachal',
    bnName: 'নীলাচল',
    routeString: 'Gabtoli ⇄ Aricha',
    stops: ['gabtoli', 'technical', 'hemayetpur', 'savar', 'nabinagar_bazar', 'manikganj_bazar', 'aricha_ghat'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'nilachol',
    name: 'Nilachol',
    bnName: 'নিলাচল',
    routeString: 'Chittagong Road ⇄ Paturia',
    stops: ['chittagong_road', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'kazla', 'jatrabari', 'janapath_moor', 'sayedabad', 'gulistan', 'chankhar_pul', 'bakshi_bazar', 'azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'savar', 'nobinagar', 'manikganj', 'paturia'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'nishorgo',
    name: 'Nishorgo',
    bnName: 'নিসর্গ',
    routeString: 'Mirpur 14 ⇄ Azimpur',
    stops: ['mirpur14', 'mirpur10', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'asad_gate', 'shyamoli', 'mohammadpur', 'shankar', 'dhanmondi15', 'jigatola', 'science_lab', 'newmarket', 'nilkhet', 'eden_college', 'azimpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'nur_e_makka',
    name: 'Nur E Makka',
    bnName: 'নূর এ মক্কা',
    routeString: 'Chiriyakhana ⇄ Malibagh Railgate',
    stops: ['chiriyakhana', 'rainkhola', 'shial_bari', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'jamuna_future_park', 'bashundhara', 'nadda', 'notun_bazar', 'bashtola', 'shahjadpur', 'uttar_badda', 'badda', 'madhya_badda', 'merul', 'rampura', 'rampura_bazar', 'hazipara', 'malibagh_railgate'],
    type: 'Sitting',
    hours: '5:30 AM - 10:30 PM'
  },
  {
    id: 'omama',
    name: 'Omama International',
    bnName: 'ওমামা ইন্টারন্যাশনাল',
    routeString: 'Motijheel ⇄ Airport',
    stops: ['motijheel', 'dainik_bangla_moor', 'paltan', 'press_club', 'matsya_bhaban', 'high_court', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'jahangir_gate', 'mohakhali', 'amtola', 'chairman_bari', 'sainik_club', 'banani', 'kakali', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'onabil',
    name: 'Onabil',
    bnName: 'অনাবিল',
    routeString: 'Sign Board ⇄ Gazipur',
    stops: ['signboard', 'shonir_akhra', 'shanir_akhra', 'jatrabari', 'sayedabad', 'mugdapara', 'bashabo', 'khilgaon', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur_bypass', 'gazipur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'one_transport',
    name: 'One Transport',
    bnName: 'ওয়ান ট্রান্সপোর্ট',
    routeString: 'Nandan Park ⇄ Motijheel',
    stops: ['nandan_park', 'zirani_bazar', 'zirabo', 'baipayl', 'nobinagar', 'savar', 'nabinagar_savar', 'bank_town', 'hemayetpur', 'yearpur', 'dhamsona', 'tetuljhora', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'padma_line',
    name: 'Padma Line',
    bnName: 'পদ্মা লাইন',
    routeString: 'Gabtoli ⇄ Paturia',
    stops: ['gabtoli', 'amin_bazar', 'hemayetpur', 'savar_bus_stand', 'nabinagar_bazar', 'dhamrai', 'manikganj_bazar', 'paturia'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 10:30 PM'
  },
  {
    id: 'pallabi_local',
    name: 'Pallabi Local Service',
    bnName: 'পল্লবী লোকাল সার্ভিস',
    routeString: 'Asad Gate ⇄ Mirpur 12',
    stops: ['asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'technical', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur6', 'mirpur11', 'mirpur12'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 10:30 PM'
  },
  {
    id: 'pallabi_super',
    name: 'Pallabi Super',
    bnName: 'পল্লবী সুপার',
    routeString: 'Mirpur 12 ⇄ Sayedabad',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'agargaon', 'zia_uddyan', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'mohakhali_flyover', 'mohakhali_bus_stand', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur'],
    type: 'Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'paristhan',
    name: 'Paristhan',
    bnName: 'পরিস্হান',
    routeString: 'Bosila ⇄ Abdullahpur',
    stops: ['bosila', 'dhaka_uddan', 'mohammadpur', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'bangla_college', 'tolarbag', 'ansar_camp', 'mirpur1', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'power_paribahan',
    name: 'Power Paribahan',
    bnName: 'পাওয়ার পরিবহন',
    routeString: 'Mirpur 14 ⇄ Konabari',
    stops: ['mirpur14', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'mazar_road', 'konabari', 'rupnagar', 'beribadh', 'birulia', 'ashulia', 'zirabo', 'narsinghpur', 'surabari', 'jarun', 'konabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'prattay',
    name: 'Prattay',
    bnName: 'প্রত্যয়',
    routeString: 'Gabtoli ⇄ Babubazar',
    stops: ['gabtoli', 'mazar_road', 'beribadh', 'sikder_medical', 'hazaribag', 'kamrangirchar', 'showari_ghat', 'babubazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'prochesta',
    name: 'Prochesta',
    bnName: 'প্রচেষ্টা',
    routeString: 'Maowa ⇄ Abdullahpur',
    stops: ['maowa', 'keraniganj', 'babubazar', 'naya_bazar', 'ray_saheb_bazar', 'golap_shah_mazar', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'moghbazar_crossing', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'provati_banasree',
    name: 'Provati Banasree',
    bnName: 'প্রভাতী বনশ্রী',
    routeString: 'Fulbaria ⇄ Baromi',
    stops: ['fulbaria', 'golap_shah_mazar', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mogbazar', 'satrasta', 'nabisco', 'mohakhali', 'amtola', 'chairman_bari', 'banani', 'kakali', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'station_road', 'mill_gate', 'board_bazar', 'gazipur', 'joydebpur', 'sreepur', 'barmi'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'purbachol',
    name: 'Purbachol Logistics',
    bnName: 'পূর্বাচল লজিস্টিকস',
    routeString: 'Mirpur 14 ⇄ Chandra',
    stops: ['mirpur14', 'mirpur13', 'mirpur11', 'mirpur10', 'mirpur9', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'tetuljhora', 'dhamsona', 'yearpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'savar', 'baipayl', 'zirani_bazar', 'zirabo', 'nandan_park', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'raida',
    name: 'Raida Enterprise',
    bnName: 'রাইদা এন্টারপ্রাইজ',
    routeString: 'Postagola ⇄ Diabari',
    stops: ['postagola', 'dholairpar', 'jurain', 'dayaganj', 'tikatuli', 'maniknagar', 'mugdapara', 'bashabo', 'khilgaon', 'khidma_hospital', 'malibagh', 'rampura', 'merul', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'vatara_moor', 'coca_cola', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'kuril_chourasta', 'khilkhet', 'kawla', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'diabari'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'raja_city',
    name: 'Raja City',
    bnName: 'রাজা সিটি',
    routeString: 'Postagola ⇄ Ghatar Char',
    stops: ['postagola', 'dholairpar', 'jurain', 'dayaganj', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'shahbag', 'bata_signal', 'science_lab', 'city_college', 'jigatola', 'dhanmondi15', 'star_kabab', 'shankar', 'mohammadpur', 'bosila', 'ghatar_char'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'rajanigandha',
    name: 'Rajanigandha',
    bnName: 'রজনীগন্ধা',
    routeString: 'Sign Board ⇄ Ghatar Char',
    stops: ['signboard', 'shonir_akhra', 'shanir_akhra', 'jatrabari', 'sayedabad', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'city_college', 'jigatola', 'dhanmondi15', 'star_kabab', 'shankar', 'mohammadpur', 'dhaka_uddan', 'basila', 'ghatar_char'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'rajdhani_super',
    name: 'Rajdhani Super',
    bnName: 'রাজধানী বাস',
    routeString: 'Hemayetpur ⇄ Demra',
    stops: ['hemayetpur', 'yearpur', 'dhamsona', 'tetuljhora', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'jamuna_future_park', 'bashundhara', 'nadda', 'notun_bazar', 'bashtola', 'shahjadpur', 'uttar_badda', 'badda', 'madhya_badda', 'merul', 'rampura', 'banasree', 'demra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ramjan',
    name: 'Ramjan',
    bnName: 'রমজান',
    routeString: 'Gabtoli ⇄ Demra',
    stops: ['gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'bata_signal', 'shahbag', 'matsya_bhaban', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'banasree', 'demra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'rob_rob',
    name: 'Rob Rob',
    bnName: 'রব রব',
    routeString: 'Gabtoli ⇄ Banasree',
    stops: ['gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'mirpur2', 'mirpur10', 'purobi', 'kalshi', 'ecb', 'mes', 'banani', 'kakali', 'post_office_gulshan', 'gulshan2', 'gulshan1', 'badda_link_road', 'merul', 'rampura', 'banasree'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 12:00 PM'
  },
  {
    id: 'rois',
    name: 'Rois',
    bnName: 'রাইস',
    routeString: 'Postagola ⇄ Gabtoli',
    stops: ['postagola', 'jurain', 'dholairpar', 'jatrabari', 'sayedabad', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'shahbag', 'bangla_motor', 'kawran_bazar', 'farmgate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'technical', 'mazar_road', 'gabtoli'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'rongdhonu',
    name: 'Rongdhonu Express',
    bnName: 'রংধনু এক্সপ্রেস',
    routeString: 'Adabor ⇄ Postagola',
    stops: ['adabor', 'mohammadpur', 'shia_masjid', 'shyamoli', 'college_gate', 'asad_gate', 'kalabagan', 'science_lab', 'katabon', 'bata_signal', 'shahbag', 'kakrail', 'fokirapul', 'motijheel', 'dayaganj', 'jurain', 'dholairpar', 'postagola'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'runway',
    name: 'Runway Express',
    bnName: 'রানওয়ে এক্সপ্রেস',
    routeString: 'Keraniganj ⇄ ECB Square',
    stops: ['keraniganj', 'kadamtali', 'babubazar', 'naya_bazar', 'ray_saheb_bazar', 'golap_shah_mazar', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'bot_tola', 'farmgate', 'agargaon', 'taltola', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'mirpur12', 'ecb'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'rupa',
    name: 'Rupa Paribahan',
    bnName: 'রুপা পরিবহন',
    routeString: 'Gabtoli ⇄ Mirpur 14',
    stops: ['gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur14'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'rupkotha',
    name: 'Rupkotha',
    bnName: 'রুপকথা',
    routeString: 'Gabtoli ⇄ Abdullahpur',
    stops: ['gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'mirpur11', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'safety_druti',
    name: 'Safety Druti',
    bnName: 'সেফটি দ্রুতি',
    routeString: 'Mirpur 12 ⇄ Azimpur',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'kalabagan', 'city_college', 'newmarket', 'nilkhet', 'azimpur'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'sakalpa',
    name: 'Sakalpa Transport',
    bnName: 'স্বকল্প ট্রান্সপোর্ট',
    routeString: 'Chiriyakhana ⇄ Kamalapur',
    stops: ['chiriyakhana', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'kazipara', 'shewrapara', 'agargaon', 'bijoy_sarani', 'farmgate', 'bangla_motor', 'mogbazar', 'malibagh', 'kamalapur'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 10:30 PM'
  },
  {
    id: 'salsabil',
    name: 'Salsabil',
    bnName: 'সালসাবিল',
    routeString: 'Jatrabari ⇄ Gazipur',
    stops: ['jatrabari', 'sayedabad', 'mugdapara', 'bashabo', 'khilgaon', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur_bypass', 'gazipur'],
    type: 'Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'savar_paribahan',
    name: 'Savar Paribahan',
    bnName: 'সাভার পরিবহন',
    routeString: 'Sadarghat ⇄ Nandan Park',
    stops: ['sadarghat', 'mitford', 'ray_saheb_bazar', 'naya_bazar', 'golap_shah_mazar', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'science_lab', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'savar', 'baipayl', 'zirani_bazar', 'nandan_park'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'sb_link',
    name: 'SB Link',
    bnName: 'এসবি লিংক',
    routeString: 'Hemayetpur ⇄ Paturia',
    stops: ['hemayetpur', 'aminbazar_bridge', 'rajfulbaria', 'bank_town', 'savar_bus_stand', 'nabinagar_savar', 'baipail_more', 'nabinagar_bazar', 'mirzapur_savar', 'dhamsona', 'singair', 'shimulia', 'manikganj_bazar', 'aricha_ghat', 'paturia'],
    type: 'Local',
    hours: '5:00 AM - 11:00 PM'
  },
  {
    id: 'selfie',
    name: 'Selfie',
    bnName: 'সেলফি',
    routeString: 'Gabtoli ⇄ Paturia',
    stops: ['gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'savar', 'nobinagar', 'manikganj', 'paturia'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'shadhin',
    name: 'Shadhin',
    bnName: 'স্বাধীন',
    routeString: 'Bosila ⇄ Demra',
    stops: ['bosila', 'mohammadpur', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bangla_motor', 'moghbazar_crossing', 'mogbazar', 'mouchak', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'banasree', 'demra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'shadhin_express',
    name: 'Shadhin Express',
    bnName: 'স্বাধীন এক্সপ্রেস',
    routeString: 'Mirpur 12 ⇄ Maowa',
    stops: ['mirpur12', 'pallabi', 'purobi', 'mirpur11', 'mirpur10', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'golap_shah_mazar', 'naya_bazar', 'babubazar', 'keraniganj', 'rajendrapur', 'maowa'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'shahria',
    name: 'Shahria Enterprise',
    bnName: 'শাহরিয়া এন্টারপ্রাইজ',
    routeString: 'Gabtoli ⇄ Postagola',
    stops: ['gabtoli', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'shukrabad', 'kalabagan', 'city_college', 'science_lab', 'katabon', 'shahbag', 'matsya_bhaban', 'kakrail', 'arambagh', 'motijheel', 'ittefaq_moor', 'tikatuli', 'dayaganj', 'gandaria', 'jurain', 'postagola'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'shatabdi',
    name: 'Shatabdi',
    bnName: 'শতাব্দী',
    routeString: 'Motijheel ⇄ Kamarpara',
    stops: ['motijheel', 'dainik_bangla_moor', 'paltan', 'kakrail', 'malibagh', 'mouchak', 'moghbazar_crossing', 'mogbazar', 'satrasta', 'nabisco', 'mohakhali', 'mohakhali_flyover', 'mohakhali_bus_stand', 'amtola', 'chairman_bari', 'banani', 'kakali', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'kamarpara'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'shatabdi_narayanganj',
    name: 'Shatabdi',
    bnName: 'শতাব্দী',
    routeString: 'Motijheel ⇄ Narayanganj',
    stops: ['motijheel', 'gulistan', 'tikatuli', 'sayedabad', 'jatrabari', 'shanir_akhra', 'signboard', 'chashara', 'mondolpara', 'nitolganj'],
    type: 'Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'siam_transport',
    name: 'Siam Transport',
    bnName: 'সিয়াম ট্রান্সপোর্ট',
    routeString: 'Banasree ⇄ Nobinagar',
    stops: ['banasree', 'rampura', 'merul', 'badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur', 'kamarpara', 'dhour', 'beribadh', 'ashulia', 'zirabo', 'fantasy_kingdom', 'jamgora', 'shimultola', 'baipayl', 'palli_bidyut', 'savar_cantonment', 'nobinagar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'skyline',
    name: 'Skyline',
    bnName: 'স্কাই লাইন',
    routeString: 'Sadarghat ⇄ Gazipur',
    stops: ['sadarghat', 'ray_saheb_bazar', 'naya_bazar', 'golap_shah_mazar', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'moghbazar_crossing', 'mogbazar', 'satrasta', 'nabisco', 'mohakhali', 'mohakhali_flyover', 'mohakhali_bus_stand', 'amtola', 'chairman_bari', 'sainik_club', 'banani', 'kakali', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'somota',
    name: 'Somota Paribahan',
    bnName: 'সমতা পরিবহন',
    routeString: 'Chittagong Road ⇄ Abdullahpur',
    stops: ['chittagong_road', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'kazla', 'jatrabari', 'janapath_moor', 'sayedabad', 'gulistan', 'chankhar_pul', 'bakshi_bazar', 'dhakeshwari', 'azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'ansar_camp', 'mirpur1', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'somoy',
    name: 'Somoy',
    bnName: 'সময়',
    routeString: 'Sign Board ⇄ Mirpur 12',
    stops: ['signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'shanir_akhra', 'jatrabari', 'sayedabad', 'gulistan', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'farmgate', 'bijoy_sarani', 'agargaon', 'taltola', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'mirpur12'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'somoy_niyantran',
    name: 'Somoy Niyantran',
    bnName: 'সময় নিয়ন্ত্রণ',
    routeString: 'Mirpur 12 ⇄ Keraniganj',
    stops: ['mirpur12', 'pallabi', 'purobi', 'mirpur11', 'mirpur10', 'kazipara', 'shewrapara', 'taltola', 'agargaon', 'bijoy_sarani', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'golap_shah_mazar', 'naya_bazar', 'ray_saheb_bazar', 'babubazar', 'keraniganj'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'super',
    name: 'Super',
    bnName: 'সুপার',
    routeString: 'Gulistan ⇄ Nobinagar',
    stops: ['gulistan', 'shahbag', 'farmgate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'tetuljhora', 'dhamsona', 'yearpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'savar', 'nobinagar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'suprobhat',
    name: 'Suprobhat',
    bnName: 'সুপ্রভাত',
    routeString: 'Sadarghat ⇄ Gazipur',
    stops: ['sadarghat', 'ray_saheb_bazar', 'naya_bazar', 'golap_shah_mazar', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur_bypass', 'gazipur'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'suveccha',
    name: 'Suveccha',
    bnName: 'শুভেচ্ছা',
    routeString: 'Chittagong Road ⇄ Chandra',
    stops: ['chittagong_road', 'signboard', 'matuail', 'rayerbag', 'shonir_akhra', 'shanir_akhra', 'kazla', 'jatrabari', 'sayedabad', 'gulistan', 'chankhar_pul', 'bakshi_bazar', 'dhakeshwari', 'azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'tetuljhora', 'dhamsona', 'yearpur', 'hemayetpur', 'bank_town', 'nabinagar_savar', 'savar', 'nobinagar', 'baipayl', 'zirani_bazar', 'nandan_park', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'suvojatri',
    name: 'Suvojatri',
    bnName: 'শুভযাত্রী',
    routeString: 'Fulbaria ⇄ Manikganj',
    stops: ['fulbaria', 'golap_shah_mazar', 'gpo', 'paltan', 'press_club', 'high_court', 'matsya_bhaban', 'shahbag', 'bata_signal', 'science_lab', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'manikganj'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'swajan',
    name: 'Swajan Paribahan',
    bnName: 'স্বজন পরিবহন',
    routeString: 'Savar ⇄ Sadarghat',
    stops: ['savar', 'nabinagar_savar', 'bank_town', 'hemayetpur', 'yearpur', 'dhamsona', 'tetuljhora', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'golap_shah_mazar', 'naya_bazar', 'ray_saheb_bazar', 'sadarghat'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'talukdar',
    name: 'Talukdar',
    bnName: 'তালুকদার',
    routeString: 'Chiriyakhana ⇄ Chittagong Road',
    stops: ['chiriyakhana', 'rainkhola', 'shial_bari', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'mogbazar', 'mouchak', 'malibagh', 'mugdapara', 'rajarbag', 'khilgaon_flyover', 'khidma_hospital', 'bashabo', 'maniknagar', 'golapbagh', 'sayedabad', 'janapath_moor', 'jatrabari', 'kazla', 'shonir_akhra', 'rayerbag', 'matuail', 'signboard', 'chittagong_road'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'tanjil',
    name: 'Tanjil',
    bnName: 'তানজিল',
    routeString: 'Chiriyakhana ⇄ Sadarghat',
    stops: ['chiriyakhana', 'rainkhola', 'shial_bari', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'golap_shah_mazar', 'naya_bazar', 'ray_saheb_bazar', 'sadarghat'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'taranga_plus',
    name: 'Taranga Plus',
    bnName: 'তরঙ্গ প্লাস',
    routeString: 'Mohammadpur ⇄ South Banasree',
    stops: ['mohammadpur', 'shankar', 'star_kabab', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'bata_signal', 'shahbag', 'matsya_bhaban', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'banasree', 'south_banasree'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'tetulia',
    name: 'Tetulia',
    bnName: 'তেতুলিয়া',
    routeString: 'Shia Masjid ⇄ Abdullahpur',
    stops: ['shia_masjid', 'japan_garden', 'ring_road', 'adabor', 'shyamoli', 'shishu_mela', 'agargaon', 'taltola', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'purobi', 'pallabi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'thikana_express',
    name: 'Thikana Express',
    bnName: 'ঠিকানা এক্সপ্রেস',
    routeString: 'Shonbari ⇄ Chandra',
    stops: ['shonbari', 'sreenagar', 'nimtola', 'kuchimura', 'rajendrapur', 'hasnabad', 'postagola', 'dholairpar', 'jurain', 'jatrabari', 'janapath_moor', 'sayedabad', 'gulistan', 'chankhar_pul', 'bakshi_bazar', 'azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi32', 'dhanmondi27', 'asad_gate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'darussalam', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'savar', 'baipayl', 'zirani_bazar', 'zirabo', 'nandan_park', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'titas',
    name: 'Titas',
    bnName: 'তিতাস',
    routeString: 'Chiriyakhana ⇄ Chandra',
    stops: ['chiriyakhana', 'rainkhola', 'shial_bari', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'gabtoli', 'parbat', 'amin_bazar', 'modhumoti', 'boliarpur', 'hemayetpur', 'savar', 'nobinagar', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'transilva',
    name: 'Transilva',
    bnName: 'ট্রান্সিলভা',
    routeString: 'Mirpur 1 ⇄ Jatrabari',
    stops: ['mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'dhanmondi27', 'dhanmondi32', 'kalabagan', 'science_lab', 'bata_signal', 'shahbag', 'matsya_bhaban', 'engineering_institute', 'high_court', 'press_club', 'gpo', 'gulistan', 'motijheel', 'ittefaq_moor', 'sayedabad', 'janapath_moor', 'jatrabari', 'kazla'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'trust_1',
    name: 'Trust Transport (Mirpur 10-Banani)',
    bnName: 'ট্রাষ্ট ট্রান্সপোর্ট',
    routeString: 'Mirpur 10 ⇄ Banani',
    stops: ['mirpur10', 'mirpur13', 'mirpur14', 'kachukhet', 'sainik_club', 'banani', 'kakali'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'trust_2',
    name: 'Trust Transport (Mirpur 10-Shahbag)',
    bnName: 'ট্রাষ্ট ট্রান্সপোর্ট',
    routeString: 'Mirpur 10 ⇄ Shahbag',
    stops: ['mirpur10', 'mirpur13', 'mirpur14', 'kachukhet', 'garrison', 'adamjee_college', 'workshop', 'saudi_colony', 'jahangir_gate', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'trust_3',
    name: 'Trust Transport (Mirpur DOHS-Motijheel)',
    bnName: 'ট্রাষ্ট ট্রান্সপোর্ট',
    routeString: 'Mirpur DOHS ⇄ Motijheel',
    stops: ['mirpur_dohs', 'kalshi', 'ecb', 'cantonment', 'adamjee_college', 'garrison', 'workshop', 'saudi_colony', 'jahangir_gate', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'dainik_bangla_moor', 'motijheel'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'trust_ac',
    name: 'Trust Transport AC',
    bnName: 'ট্রাষ্ট ট্রান্সপোর্ট এসি',
    routeString: 'Mirpur DOHS ⇄ Kawran Bazar',
    stops: ['mirpur_dohs', 'kalshi', 'ecb', 'cantonment', 'adamjee_college', 'garrison', 'workshop', 'saudi_colony', 'jahangir_gate', 'farmgate', 'kawran_bazar'],
    type: 'AC',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'turag',
    name: 'Turag',
    bnName: 'তুরাগ',
    routeString: 'Jatrabari ⇄ Tongi',
    stops: ['jatrabari', 'janapath_moor', 'sayedabad', 'mugdapara', 'bashabo', 'malibagh_railgate', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'victor_classic',
    name: 'Victor Classic',
    bnName: 'ভিক্টর ক্লাসিক',
    routeString: 'Sadarghat ⇄ Abdullahpur',
    stops: ['sadarghat', 'ray_saheb_bazar', 'naya_bazar', 'gulistan', 'paltan', 'kakrail', 'malibagh', 'mogbazar', 'mohakhali', 'banani', 'kuril', 'airport', 'uttara', 'abdullahpur'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'vip_27',
    name: 'VIP 27',
    bnName: 'ভিআইপি ২৭',
    routeString: 'Azimpur ⇄ Gazipur',
    stops: ['azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'tejgaon', 'mohakhali', 'mohakhali_flyover', 'banani', 'kakali', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'cherag_ali', 'hotapara', 'station_road', 'mill_gate', 'board_bazar', 'gazipur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'welcome',
    name: 'Welcome',
    bnName: 'ওয়েলকম',
    routeString: 'Nandan Park ⇄ Motijheel',
    stops: ['nandan_park', 'zirani_bazar', 'zirabo', 'baipayl', 'nobinagar', 'savar', 'nabinagar_savar', 'bank_town', 'hemayetpur', 'yearpur', 'dhamsona', 'tetuljhora', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'shishu_mela', 'college_gate', 'asad_gate', 'khamar_bari', 'farmgate', 'kawran_bazar', 'bot_tola', 'bangla_motor', 'shahbag', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'winner',
    name: 'Winner',
    bnName: 'উইনার',
    routeString: 'Azimpur ⇄ Kuril',
    stops: ['azimpur', 'eden_college', 'nilkhet', 'newmarket', 'science_lab', 'city_college', 'kalabagan', 'panthapath', 'kawran_bazar', 'bot_tola', 'satrasta', 'nabisco', 'mohakhali', 'amtola', 'wireless', 'gulshan1', 'badda', 'badda_link_road', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'kuril_chourasta'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'j.m_super',
    name: 'J.M Super Paribahan',
    bnName: 'জে.এম সুপার পরিবহন',
    routeString: 'Jatrabari ⇄ Tongi',
    stops: ['jatrabari', 'janapath_moor', 'sayedabad', 'mugdapara', 'bashabo', 'khilgaon', 'khidma_hospital', 'hazipara', 'rampura_bazar', 'rampura', 'merul', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara_sector5', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },

  // ===== NEW BUSES ADDED FROM WEB SCRAPING (Dec 2024) =====
  {
    id: 'prajapati',
    name: 'Prajapati',
    bnName: 'প্রজাপতি',
    routeString: 'Bosila ⇄ Abdullahpur',
    stops: ['bosila', 'mohammadpur', 'asad_gate', 'college_gate', 'shyamoli', 'kallyanpur', 'technical', 'ansar_camp', 'mirpur1', 'mirpur10', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'konok',
    name: 'Konok',
    bnName: 'কনক',
    routeString: 'Mirpur 1 ⇄ Abdullahpur',
    stops: ['mirpur1', 'mirpur10', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'new_pallabi',
    name: 'New Pallabi',
    bnName: 'নিউ পল্লবী',
    routeString: 'Gabtoli ⇄ Abdullahpur',
    stops: ['gabtoli', 'mazar_road', 'technical', 'ansar_camp', 'mirpur1', 'mirpur10', 'mirpur11', 'purobi', 'pallabi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'provati_bonoshri_mirpur',
    name: 'Provati Bonoshri (Mirpur-Uttara)',
    bnName: 'প্রভাতী বনশ্রী',
    routeString: 'Mirpur 12 ⇄ Uttara',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'kazipara', 'shewrapara', 'agargaon', 'bijoy_sarani', 'jahangir_gate', 'mohakhali', 'banani', 'kakali', 'staff_road', 'mes', 'shewra', 'kuril', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'uttara'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ababil',
    name: 'Ababil Bus',
    bnName: 'আবাবিল বাস',
    routeString: 'Motijheel ⇄ Tongi',
    stops: ['motijheel', 'dainik_bangla_moor', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'moghbazar_crossing', 'mogbazar', 'nabisco', 'mohakhali', 'wireless', 'gulshan1', 'badda_link_road', 'madhya_badda', 'badda', 'uttar_badda', 'shahjadpur', 'bashtola', 'notun_bazar', 'nadda', 'bashundhara', 'jamuna_future_park', 'kuril', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur', 'tongi'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'agragami',
    name: 'Agragami',
    bnName: 'অগ্রগামী',
    routeString: 'Sayedabad ⇄ Gazipur',
    stops: ['sayedabad', 'janapath_moor', 'jatrabari', 'shanir_akhra', 'shonir_akhra', 'postagola', 'jurain', 'dayaganj', 'tikatuli', 'gulistan', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'moghbazar_crossing', 'mogbazar', 'nabisco', 'mohakhali', 'banani', 'kakali', 'mes', 'shewra', 'kuril', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur', 'tongi', 'tongi_college_gate', 'gazipur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'motijheel_bonoshree',
    name: 'Motijheel Bonoshree Transport',
    bnName: 'মতিঝিল বনশ্রী ট্রান্সপোর্ট',
    routeString: 'Motijheel ⇄ Notun Bazar',
    stops: ['motijheel', 'gulistan', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'moghbazar_crossing', 'mogbazar', 'satrasta', 'nabisco', 'mohakhali', 'mohakhali_flyover', 'wireless', 'gulshan1', 'gulshan2', 'badda_link_road', 'notun_bazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'cantonment_mini',
    name: 'Cantonment Mini Service',
    bnName: 'ক্যান্টনমেন্ট মিনি সার্ভিস',
    routeString: 'Mirpur 14 ⇄ Mohakhali',
    stops: ['mirpur14', 'kachukhet', 'garrison', 'adamjee_college', 'sainik_club', 'banani', 'kakali', 'mohakhali'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'smart_winner',
    name: 'Smart Winner Transport',
    bnName: 'স্মার্ট উইনার ট্রান্সপোর্ট',
    routeString: 'Azimpur ⇄ Kamarpara',
    stops: ['azimpur', 'nilkhet', 'newmarket', 'city_college', 'kalabagan', 'dhanmondi27', 'dhanmondi32', 'shukrabad', 'khamar_bari', 'farmgate', 'jahangir_gate', 'mohakhali', 'amtola', 'chairman_bari', 'sainik_club', 'banani', 'kakali', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jashimuddin', 'rajlakshmi', 'azampur', 'uttara', 'abdullahpur', 'kamarpara'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '3_no_airport',
    name: '3 No. Airport',
    bnName: '৩নং এয়ারপোর্ট',
    routeString: 'Bongo Bazar ⇄ Abdullahpur',
    stops: ['fulbaria', 'high_court', 'press_club', 'matsya_bhaban', 'shahbag', 'bangla_motor', 'kawran_bazar', 'farmgate', 'jahangir_gate', 'mohakhali', 'amtola', 'chairman_bari', 'sainik_club', 'banani', 'kakali', 'staff_road', 'post_office_gulshan', 'mes', 'shewra', 'kuril', 'kuril_chourasta', 'khilkhet', 'airport', 'jasimuddin_square', 'jashimuddin', 'rajlakshmi_crossing', 'rajlakshmi', 'azampur', 'uttara_sector7', 'uttara', 'abdullahpur'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },

  // ===== NEW BUSES ADDED FROM WEB SCRAPING (Round 2) =====
  {
    id: 'shikor',
    name: 'Shikor Paribahan',
    bnName: 'শিখর পরিবহন',
    routeString: 'Mirpur 12 ⇄ Jatrabari',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'kazipara', 'agargaon', 'farmgate', 'kawran_bazar', 'shahbag', 'matsya_bhaban', 'paltan', 'gulistan', 'tikatuli', 'sayedabad', 'jatrabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '6_no_motijheel_banani',
    name: '6 No. Motijheel Banani Transport',
    bnName: '৬নং মতিঝিল বনানী ট্রান্সপোর্ট',
    routeString: 'Kamalapur ⇄ Notun Bazar',
    stops: ['kamalapur', 'motijheel', 'gulistan', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'mogbazar', 'kawran_bazar', 'farmgate', 'jahangir_gate', 'bijoy_sarani', 'mohakhali', 'gulshan1', 'gulshan2', 'notun_bazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'alaka',
    name: 'Alaka ATCL',
    bnName: 'আলাকা এটিসিএল',
    routeString: 'Arambagh ⇄ Mohammadpur',
    stops: ['arambagh', 'motijheel', 'gulistan', 'paltan', 'shahbag', 'science_lab', 'city_college', 'jigatola', 'dhanmondi15', 'shankar', 'mohammadpur'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'torongo_local',
    name: 'Torongo',
    bnName: 'তরঙ্গ',
    routeString: 'Mohammadpur ⇄ Notun Bazar',
    stops: ['mohammadpur', 'asad_gate', 'farmgate', 'mohakhali', 'amtola', 'gulshan1', 'badda', 'notun_bazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'volvo_2',
    name: 'Volvo 2',
    bnName: 'ভলভো ২',
    routeString: 'Pallabi ⇄ Motijheel',
    stops: ['mirpur12', 'mirpur11', 'mirpur10', 'kazipara', 'shewrapara', 'agargaon', 'farmgate', 'shahbag', 'paltan', 'gulistan', 'motijheel'],
    type: 'AC',
    hours: '7:00 AM - 9:00 PM'
  },
  {
    id: 'dhanmondi_circular',
    name: 'Dhanmondi Circular Bus',
    bnName: 'ধানমন্ডি সার্কুলার বাস',
    routeString: 'Dhanmondi Circular',
    stops: ['dhanmondi27', 'dhanmondi32', 'kalabagan', 'science_lab', 'newmarket', 'nilkhet', 'azimpur', 'bata_signal', 'city_college', 'jigatola', 'shankar', 'dhanmondi15', 'dhanmondi27'],
    type: 'Local',
    hours: '8:00 AM - 8:00 PM'
  },

  // ===== BRTC DHAKA LOCAL ROUTES =====
  {
    id: 'brtc_mugda_tongi',
    name: 'BRTC Mugda-Tongi',
    bnName: 'বিআরটিসি মুগদা-টঙ্গী',
    routeString: 'Mugda ⇄ Tongi',
    stops: ['mugda', 'khilgaon', 'mouchak', 'malibagh', 'rampura', 'banasree', 'aftabnagar', 'badda', 'shahjadpur', 'kuril', 'airport', 'jasimuddin', 'abdullahpur', 'tongi'],
    type: 'Double-Decker',
    hours: '6:30 AM - 10:30 PM'
  },
  {
    id: 'brtc_mugda_boardbazar',
    name: 'BRTC Mugda-Board Bazar',
    bnName: 'বিআরটিসি মুগদা-বোর্ড বাজার',
    routeString: 'Mugda ⇄ Board Bazar',
    stops: ['mugda', 'khilgaon', 'mouchak', 'malibagh', 'rampura', 'badda', 'shahjadpur', 'kuril', 'nikunja', 'khilkhet', 'airport', 'jasimuddin', 'abdullahpur', 'tongi', 'board_bazar'],
    type: 'Double-Decker',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_taltola_secretariat',
    name: 'BRTC Taltola-Secretariat (Women)',
    bnName: 'বিআরটিসি তালতলা-সচিবালয় (মহিলা)',
    routeString: 'Taltola ⇄ Secretariat',
    stops: ['taltola', 'shyamoli', 'asad_gate', 'dhanmondi', 'science_lab', 'shahbag', 'press_club', 'secretariat'],
    type: 'Double-Decker',
    hours: '8:00 AM - 8:40 AM'
  },
  {
    id: 'brtc_cocacola_secretariat',
    name: 'BRTC Coca Cola-Secretariat (Women)',
    bnName: 'বিআরটিসি কোকাকোলা-সচিবালয় (মহিলা)',
    routeString: 'Coca Cola ⇄ Secretariat',
    stops: ['cocacola', 'khilkhet', 'airport', 'kawran_bazar', 'farmgate', 'bangla_motor', 'shahbag', 'press_club', 'secretariat'],
    type: 'Double-Decker',
    hours: '8:00 AM - 8:40 AM'
  },
  {
    id: 'brtc_rampura_bansree_secretariat',
    name: 'BRTC Rampura-Bansree-Secretariat (Women)',
    bnName: 'বিআরটিসি রামপুরা-বনশ্রী-সচিবালয় (মহিলা)',
    routeString: 'Rampura-Bansree ⇄ Secretariat',
    stops: ['rampura', 'bansree', 'aftabnagar', 'basabo', 'khilgaon', 'malibagh', 'mogbazar', 'wireless', 'shahbag', 'secretariat'],
    type: 'Double-Decker',
    hours: '8:00 AM - 8:35 AM'
  },
  {
    id: 'brtc_gulistan_gauripur_ac',
    name: 'BRTC Gulistan-Gauripur (AC)',
    bnName: 'বিআরটিসি গুলিস্তান-গৌরিপুর (এসি)',
    routeString: 'Gulistan ⇄ Gauripur',
    stops: ['gulistan', 'sheikh_russel_park', 'farmgate', 'mohakhali', 'banani', 'gulshan1', 'badda', 'shahjadpur', 'uttara', 'abdullahpur', 'tongi', 'board_bazar', 'gauripur'],
    type: 'AC',
    hours: '6:00 AM - 8:00 PM'
  },
  {
    id: 'brtc_gulistan_nabobganj',
    name: 'BRTC Gulistan-Nabobganj',
    bnName: 'বিআরটিসি গুলিস্তান-নবাবগঞ্জ',
    routeString: 'Gulistan ⇄ Nabobganj',
    stops: ['gulistan', 'golap_shah_mazar', 'sadarghat', 'postagola', 'jatrabari', 'demra', 'shimrail', 'tarabo', 'rupganj', 'bandura'],
    type: 'Double-Decker',
    hours: '7:00 AM - 8:00 PM'
  },
  {
    id: 'brtc_jurain_tongi',
    name: 'BRTC Jurain-Tongi',
    bnName: 'বিআরটিসি জুরাইন-টঙ্গী',
    routeString: 'Jurain ⇄ Tongi',
    stops: ['jurain', 'jatrabari', 'malibagh', 'mogbazar', 'sahjalal', 'farmgate', 'mohakhali', 'banani', 'gulshan1', 'badda', 'shahjadpur', 'airport', 'jasimuddin', 'abdullahpur', 'tongi', 'bardo_bari_tongi'],
    type: 'Double-Decker',
    hours: '7:00 AM - 8:00 PM'
  },
  {
    id: 'brtc_mirpur10_kadomtoli_gabtali',
    name: 'BRTC Mirpur 10-Kadomtoli',
    bnName: 'বিআরটিসি মিরপুর ১০-কদমতলী',
    routeString: 'Mirpur 10 ⇄ Kadomtoli',
    stops: ['mirpur10', 'mirpur11', 'mirpur13', 'shewrapara', 'shyamoli', 'asad_gate', 'mohammadpur', 'shukrabad', 'dhanmondi', 'newmarket', 'azimpur', 'press_club', 'paltan', 'motijheel', 'jatrabari', 'demra', 'keraniganj_kadomtoli'],
    type: 'Double-Decker',
    hours: '6:00 AM - 8:00 PM'
  },
  {
    id: 'brtc_bardobari_motijheel',
    name: 'BRTC Bardo Bari-Motijheel',
    bnName: 'বিআরটিসি বড়বাড়ি-মতিঝিল',
    routeString: 'Bardo Bari ⇄ Motijheel',
    stops: ['bardo_bari_tongi', 'tongi', 'abdullahpur', 'airport', 'mohakhali', 'farmgate', 'bangla_motor', 'shahbag', 'press_club', 'gulistan', 'motijheel'],
    type: 'Double-Decker',
    hours: '7:30 AM - 9:30 PM'
  },
  {
    id: 'brtc_mirpur_motijheel_stationroad',
    name: 'BRTC Mirpur-Motijheel-Station Road',
    bnName: 'বিআরটিসি মিরপুর-মতিঝিল-স্টেশন রোড',
    routeString: 'Mirpur 12/10 ⇄ Station Road',
    stops: ['mirpur12', 'mirpur10', 'shewrapara', 'gabtoli', 'asad_gate', 'mohammadpur', 'dhanmondi', 'science_lab', 'shahbag', 'motijheel', 'kamalapur', 'malibagh', 'mouchak', 'tongi_station'],
    type: 'Double-Decker',
    hours: '8:00 AM - 11:30 PM'
  },
  {
    id: 'brtc_mirpur12_motijheel',
    name: 'BRTC Mirpur 12-Motijheel',
    bnName: 'বিআরটিসি মিরপুর ১২-মতিঝিল',
    routeString: 'Mirpur 12 ⇄ Motijheel',
    stops: ['mirpur12', 'mirpur10', 'shewrapara', 'asad_gate', 'farmgate', 'bangla_motor', 'shahbag', 'press_club', 'motijheel'],
    type: 'Double-Decker',
    hours: '9:00 AM - 10:00 PM'
  },
  {
    id: 'brtc_mirpur12_motijheel_women',
    name: 'BRTC Mirpur-Motijheel (Women)',
    bnName: 'বিআরটিসি মিরপুর-মতিঝিল (মহিলা)',
    routeString: 'Mirpur 12 ⇄ Motijheel',
    stops: ['mirpur12', 'mirpur10', 'shewrapara', 'asad_gate', 'farmgate', 'bangla_motor', 'shahbag', 'press_club', 'motijheel'],
    type: 'Double-Decker',
    hours: '7:00 AM - 9:00 PM'
  },
  {
    id: 'brtc_mirpur10_motijheel_women',
    name: 'BRTC Mirpur 10-Motijheel (Women)',
    bnName: 'বিআরটিসি মিরপুর ১০-মতিঝিল (মহিলা)',
    routeString: 'Mirpur 10 ⇄ Motijheel',
    stops: ['mirpur10', 'shewrapara', 'asad_gate', 'farmgate', 'bangla_motor', 'shahbag', 'press_club', 'motijheel'],
    type: 'Double-Decker',
    hours: '7:30 AM - 9:30 PM'
  },
  {
    id: 'brtc_rayerbag_tongi_stationroad',
    name: 'BRTC Rayerbag-Motijheel-Station Road',
    bnName: 'বিআরটিসি রায়েরবাগ-মতিঝিল-স্টেশন রোড',
    routeString: 'Rayerbag ⇄ Tongi Station Road',
    stops: ['rayerbag', 'mohammadpur', 'asad_gate', 'farmgate', 'bangla_motor', 'shahbag', 'press_club', 'motijheel', 'mouchak', 'malibagh', 'mogbazar', 'wireless', 'banasree', 'aftabnagar', 'badda', 'shahjadpur', 'airport', 'tongi_station'],
    type: 'Double-Decker',
    hours: '7:00 AM - 10:30 PM'
  },
  {
    id: 'brtc_ghatarchar_kanchpur_route26',
    name: 'BRTC Ghatarchar-Kanchpur (Route 26)',
    bnName: 'বিআরটিসি ঘাটারচর-কাচপুর (রুট ২৬)',
    routeString: 'Ghatarchar ⇄ Kanchpur',
    stops: ['ghatarchar', 'mohammadpur', 'asad_gate', 'dhanmondi', 'science_lab', 'shahbag', 'press_club', 'paltan', 'motijheel', 'jatrabari', 'demra', 'kalshi', 'kanchpur'],
    type: 'Double-Decker',
    hours: '7:30 AM - 9:30 PM'
  },
  {
    id: 'brtc_elevated_exp_jasimuddin_khejurbagan',
    name: 'BRTC Elevated Expressway',
    bnName: 'বিআরটিসি এলিভেটেড এক্সপ্রেসওয়ে',
    routeString: 'Jasimuddin ⇄ Khejurbagan',
    stops: ['elevated_exp_jasimuddin', 'kawla', 'khilkhet', 'mohakhali', 'tejgaon', 'elevated_exp_khejurbagan'],
    type: 'Double-Decker',
    hours: '7:00 AM - 7:30 PM'
  },
  {
    id: 'brtc_kuril_itakhola_daihatsu',
    name: 'BRTC Kuril-Itakhola (AC)',
    bnName: 'বিআরটিসি কুড়িল-ইটাখোলা (এসি)',
    routeString: 'Kuril Bishwaroad ⇄ Itakhola',
    stops: ['kuril', 'khilkhet', 'airport', 'jasimuddin', 'abdullahpur', 'tongi', 'board_bazar', 'kaliakoir', 'pubail', 'salehpur', 'itakhola'],
    type: 'AC',
    hours: '6:10 AM - 8:00 PM'
  },
  {
    id: 'brtc_kuril_itakhola_ashok',
    name: 'BRTC Kuril-Itakhola (AC Deluxe)',
    bnName: 'বিআরটিসি কুড়িল-ইটাখোলা (এসি ডিলাক্স)',
    routeString: 'Kuril Bishwaroad ⇄ Itakhola',
    stops: ['kuril', 'khilkhet', 'airport', 'jasimuddin', 'abdullahpur', 'tongi', 'board_bazar', 'kaliakoir', 'pubail', 'salehpur', 'itakhola'],
    type: 'AC',
    hours: '6:10 AM - 8:00 PM'
  },
  {
    id: 'brtc_kuril_bishnondi',
    name: 'BRTC Kuril-Bishnondi Ferry Ghat (AC)',
    bnName: 'বিআরটিসি কুড়িল-বিশনন্দী (এসি)',
    routeString: 'Kuril Bishwaroad ⇄ Bishnondi Ferry Ghat',
    stops: ['kuril', 'khilkhet', 'shahjalal_airport', 'jasimuddin', 'uttara', 'abdullahpur', 'tongi', 'kaliakoir', 'gazipur', 'sreepur', 'kapasia', 'bishnondi_ferry'],
    type: 'AC',
    hours: '6:20 AM - 8:00 PM'
  },
  {
    id: 'brtc_diabari_uttara_abdullahpur',
    name: 'BRTC Diabari-Uttara-Abdullahpur (Metro Shuttle)',
    bnName: 'বিআরটিসি দিয়াবাড়ী-উত্তরা-আব্দুল্লাহপুর',
    routeString: 'Diabari ⇄ Uttara ⇄ Abdullahpur',
    stops: ['diabari_metro', 'uttara', 'house_building', 'abdullahpur'],
    type: 'Metro Shuttle',
    hours: '6:30 AM - 8:00 PM'
  },
  {
    id: 'brtc_tongi_motijheel_dd',
    name: 'BRTC Tongi-Motijheel',
    bnName: 'বিআরটিসি টঙ্গী-মতিঝিল',
    routeString: 'Tongi ⇄ Motijheel',
    stops: ['tongi', 'bardo_bari_tongi', 'abdullahpur', 'jasimuddin', 'airport', 'banani', 'mohakhali', 'farmgate', 'bangla_motor', 'shahbag', 'press_club', 'paltan', 'motijheel'],
    type: 'Double-Decker',
    hours: '6:00 AM - 7:00 PM'
  },
  {
    id: 'brtc_mohammadpur_kuril',
    name: 'BRTC Mohammadpur-Kuril',
    bnName: 'বিআরটিসি মোহাম্মদপুর-কুড়িল',
    routeString: 'Mohammadpur ⇄ Kuril Bishwaroad',
    stops: ['mohammadpur', 'asad_gate', 'farmgate', 'bangla_motor', 'sahjalal', 'mohakhali', 'banani', 'gulshan1', 'gulshan2', 'badda', 'shahjadpur', 'kuril'],
    type: 'Double-Decker',
    hours: '6:30 AM - 7:20 PM'
  },
  {
    id: 'brtc_mohammadpur_jigatola_motijheel_women',
    name: 'BRTC Mohammadpur-Jigatola-Motijheel (Women)',
    bnName: 'বিআরটিসি মোহাম্মদপুর-জিগাতলা-মতিঝিল (মহিলা)',
    routeString: 'Mohammadpur ⇄ Motijheel',
    stops: ['mohammadpur', 'jigatola', 'dhanmondi', 'science_lab', 'shahbag', 'press_club', 'paltan', 'motijheel'],
    type: 'Double-Decker',
    hours: '7:30 AM - 5:30 PM'
  },
  {
    id: 'brtc_mohammadpur_tongi_motijheel',
    name: 'BRTC Mohammadpur-Tongi-Motijheel',
    bnName: 'বিআরটিসি মোহাম্মদপুর-টঙ্গী-মতিঝিল',
    routeString: 'Mohammadpur ⇄ Tongi Station',
    stops: ['mohammadpur', 'shyamoli', 'asad_gate', 'farmgate', 'mohakhali', 'banani', 'gulshan1', 'badda', 'airport', 'tongi_station', 'motijheel'],
    type: 'Double-Decker',
    hours: '7:30 AM - 9:00 PM'
  },
  {
    id: 'brtc_mohammadpur_mirpur10_kadomtoli',
    name: 'BRTC Mirpur 10-Kadomtoli',
    bnName: 'বিআরটিসি মিরপুর ১০-কদমতলী',
    routeString: 'Mirpur 10 ⇄ Kadomtoli',
    stops: ['mirpur10', 'shewrapara', 'gabtoli', 'asad_gate', 'mohammadpur', 'shukrabad', 'dhanmondi', 'newmarket', 'azimpur', 'press_club', 'jatrabari', 'demra', 'keraniganj_kadomtoli'],
    type: 'Double-Decker',
    hours: '7:00 AM - 7:20 PM'
  },
  {
    id: 'brtc_ghatarchar_kanchpur_mohammadpur',
    name: 'BRTC Ghatarchar-Kanchpur (Route 26)',
    bnName: 'বিআরটিসি ঘাটারচর-কাচপুর (রুট ২৬)',
    routeString: 'Ghatarchar ⇄ Kanchpur',
    stops: ['ghatarchar', 'mohammadpur', 'dhanmondi', 'science_lab', 'shahbag', 'press_club', 'paltan', 'motijheel', 'jatrabari', 'demra', 'shimrail', 'kanchpur'],
    type: 'Double-Decker',
    hours: '7:10 AM - 6:00 PM'
  },
  {
    id: 'brtc_bhairab_kanchpur_dreamholiday',
    name: 'BRTC Bhairab-Narsingdi-Kanchpur',
    bnName: 'বিআরটিসি ভৈরব-নরসিংদী-কাচপুর',
    routeString: 'Bhairab ⇄ Kanchpur',
    stops: ['bhairab', 'narsingdi', 'pagla', 'katchpur', 'shimrail', 'demra', 'jatrabari', 'malibagh', 'mogbazar', 'mohakhali', 'kuril', 'kanchpur'],
    type: 'Double-Decker',
    hours: '6:30 AM - 9:30 PM'
  },
  {
    id: 'brtc_diabari_abdullahpur_shuttle',
    name: 'BRTC Diabari-Abdullahpur Metro Shuttle',
    bnName: 'বিআরটিসি দিয়াবাড়ী-আব্দুল্লাহপুর মেট্রো শাটল',
    routeString: 'Diabari Metro ⇄ Abdullahpur',
    stops: ['diabari_metro', 'uttara_sector7', 'uttara_sector5', 'uttara', 'house_building', 'abdullahpur'],
    type: 'Double-Decker',
    hours: '7:00 AM - 8:20 PM'
  },
  {
    id: 'brtc_kalyanpur_mirpur10_kadomtoli_dd',
    name: 'BRTC Mirpur 10-Kadomtoli',
    bnName: 'বিআরটিসি মিরপুর ১০-কদমতলী',
    routeString: 'Mirpur 10 ⇄ Kadomtoli',
    stops: ['mirpur10', 'shewrapara', 'mohammadpur', 'dhanmondi', 'science_lab', 'shahbag', 'press_club', 'paltan', 'motijheel', 'jatrabari', 'demra', 'keraniganj_kadomtoli'],
    type: 'Double-Decker',
    hours: '6:00 AM - 8:00 PM'
  },

  // ===== BRTC INTERCITY ROUTES =====
  // Dhaka to Divisions
  {
    id: 'brtc_dhaka_khulna_ac',
    name: 'BRTC Dhaka-Khulna (AC)',
    bnName: 'বিআরটিসি ঢাকা-খুলনা (এসি)',
    routeString: 'Gulistan CBS-2 ⇄ Khulna',
    stops: ['gulistan', 'cbs_2', 'dhaka', 'munshiganj', 'madaripur', 'gopalganj', 'narail', 'jessore', 'khulna'],
    type: 'AC',
    hours: '7:00 AM - Hourly'
  },
  {
    id: 'brtc_dhaka_lakshmipur_ac',
    name: 'BRTC Dhaka-Lakshmipur (AC)',
    bnName: 'বিআরটিসি ঢাকা-লক্ষ্মীপুর (এসি)',
    routeString: 'Kamalapur ⇄ Lakshmipur',
    stops: ['kamalapur', 'motijheel', 'narayanganj', 'comilla', 'chandpur', 'ramganj', 'lakshmipur'],
    type: 'AC',
    hours: '7:00 AM - Every 30 min'
  },
  {
    id: 'brtc_dhaka_faridpur_ac',
    name: 'BRTC Dhaka-Faridpur (AC)',
    bnName: 'বিআরটিসি ঢাকা-ফরিদপুর (এসি)',
    routeString: 'Gulistan ⇄ Faridpur',
    stops: ['gulistan', 'cbs_2', 'dhaka', 'dohar', 'nawabganj', 'faridpur'],
    type: 'AC',
    hours: '7:00 AM - Hourly'
  },
  {
    id: 'brtc_dhaka_shyamnagar_ac',
    name: 'BRTC Dhaka-Shyamnagar (AC)',
    bnName: 'বিআরটিসি ঢাকা-শ্যামনগর (এসি)',
    routeString: 'Gulistan ⇄ Shyamnagar',
    stops: ['gulistan', 'cbs_2', 'faridpur', 'gopalganj', 'khulna', 'satkhira', 'shyamnagar'],
    type: 'AC',
    hours: '7:15 AM'
  },
  {
    id: 'brtc_gulistan_gosairhat_ac',
    name: 'BRTC Gulistan-Gosairhat (AC)',
    bnName: 'বিআরটিসি গুলিস্তান-গোসাইরহাট (এসি)',
    routeString: 'Gulistan ⇄ Gosairhat',
    stops: ['gulistan', 'cbs_2', 'narayanganj', 'comilla', 'feni', 'noakhali', 'gosairhat'],
    type: 'AC',
    hours: '7:00 AM'
  },
  {
    id: 'brtc_gulistan_madhukhali_ac',
    name: 'BRTC Gulistan-Madhukhali (AC)',
    bnName: 'বিআরটিসি গুলিস্তান-মধুখালি (এসি)',
    routeString: 'Gulistan ⇄ Madhukhali',
    stops: ['gulistan', 'cbs_2', 'munshiganj', 'faridpur', 'madhukhali'],
    type: 'AC',
    hours: '7:30 AM'
  },
  {
    id: 'brtc_narsingdi_dhaka_ac',
    name: 'BRTC Narsingdi-Dhaka (AC)',
    bnName: 'বিআরটিসি নরসিংদী-ঢাকা (এসি)',
    routeString: 'Narsingdi ⇄ Gulistan',
    stops: ['narsingdi', 'bhairab', 'narayanganj', 'demra', 'jatrabari', 'gulistan'],
    type: 'AC',
    hours: '7:00 AM - Every 30 min'
  },
  {
    id: 'brtc_bhairab_dhaka_dd',
    name: 'BRTC Bhairab-Dhaka',
    bnName: 'বিআরটিসি ভৈরব-ঢাকা',
    routeString: 'Bhairab ⇄ Gulistan',
    stops: ['bhairab', 'narsingdi', 'narayanganj', 'demra', 'jatrabari', 'motijheel', 'gulistan'],
    type: 'Double-Decker',
    hours: '5:40 AM - Frequent'
  },
  {
    id: 'brtc_sonapur_sylhet_chatak',
    name: 'BRTC Sonapur-Sylhet-Chatak',
    bnName: 'বিআরটিসি সোনাপুর-সিলেট-ছাতক',
    routeString: 'Sonapur ⇄ Chatak',
    stops: ['sonapur', 'noakhali', 'comilla', 'brahmanbaria', 'habiganj', 'sylhet', 'chatak'],
    type: 'Sitting',
    hours: '5:40 AM Daily'
  },
  {
    id: 'brtc_sonapur_jaflong',
    name: 'BRTC Sonapur-Jaflong',
    bnName: 'বিআরটিসি সোনাপুর-জাফলং',
    routeString: 'Sonapur ⇄ Jaflong',
    stops: ['sonapur', 'noakhali', 'comilla', 'brahmanbaria', 'habiganj', 'sylhet', 'jaflong'],
    type: 'Sitting',
    hours: '6:45 PM'
  },
  {
    id: 'brtc_chandpur_coxsbazar_ac',
    name: 'BRTC Chandpur-Cox\'s Bazar (AC)',
    bnName: 'বিআরটিসি চাঁদপুর-কক্সবাজার (এসি)',
    routeString: 'Chandpur ⇄ Cox\'s Bazar',
    stops: ['chandpur', 'comilla', 'feni', 'chittagong', 'coxsbazar'],
    type: 'AC',
    hours: '6:45 PM Nightly'
  },

  // Regional Intercity Routes
  {
    id: 'brtc_khulna_barisal_ac',
    name: 'BRTC Khulna-Barisal (AC)',
    bnName: 'বিআরটিসি খুলনা-বরিশাল (এসি)',
    routeString: 'Khulna ⇄ Barisal',
    stops: ['khulna', 'bagerhat', 'pirojpur', 'barisal'],
    type: 'AC',
    hours: '8:30 AM'
  },
  {
    id: 'brtc_khulna_kuakata_ac',
    name: 'BRTC Khulna-Kuakata (AC)',
    bnName: 'বিআরটিসি খুলনা-কুয়াকাটা (এসি)',
    routeString: 'Khulna ⇄ Kuakata',
    stops: ['khulna', 'bagerhat', 'pirojpur', 'patuakhali', 'kuakata'],
    type: 'AC',
    hours: '8:45 PM'
  },
  {
    id: 'brtc_khulna_chittagong_ac',
    name: 'BRTC Khulna-Chittagong (AC)',
    bnName: 'বিআরটিসি খুলনা-চট্টগ্রাম (এসি)',
    routeString: 'Khulna ⇄ Chittagong',
    stops: ['khulna', 'bagerhat', 'barisal', 'bhola', 'noakhali', 'feni', 'chittagong'],
    type: 'AC',
    hours: '9:00 PM'
  },
  {
    id: 'brtc_jessore_kuakata_ac',
    name: 'BRTC Jessore-Kuakata (AC)',
    bnName: 'বিআরটিসি যশোর-কুয়াকাটা (এসি)',
    routeString: 'Jessore ⇄ Kuakata',
    stops: ['jessore', 'khulna', 'bagerhat', 'pirojpur', 'patuakhali', 'kuakata'],
    type: 'AC',
    hours: '6:30 AM'
  },
  {
    id: 'brtc_chittagong_rangamati',
    name: 'BRTC Chittagong-Rangamati',
    bnName: 'বিআরটিসি চট্টগ্রাম-রাঙ্গামাটি',
    routeString: 'Chittagong CBT ⇄ Rangamati',
    stops: ['chittagong', 'chandraghona', 'kaptai', 'rangamati'],
    type: 'Sitting',
    hours: '7:00 AM - Multiple daily'
  },
  {
    id: 'brtc_chittagong_khagrachari',
    name: 'BRTC Chittagong-Khagrachari',
    bnName: 'বিআরটিসি চট্টগ্রাম-খাগড়াছড়ি',
    routeString: 'Chittagong CBT ⇄ Khagrachari',
    stops: ['chittagong', 'ramgarh', 'manikchhari', 'khagrachari'],
    type: 'Sitting',
    hours: '7:00 AM - 4 daily trips'
  },
  {
    id: 'brtc_chittagong_sylhet',
    name: 'BRTC Chittagong-Sylhet',
    bnName: 'বিআরটিসি চট্টগ্রাম-সিলেট',
    routeString: 'Chittagong ⇄ Sylhet',
    stops: ['chittagong', 'feni', 'comilla', 'brahmanbaria', 'habiganj', 'sylhet'],
    type: 'Sitting',
    hours: '7:00 AM'
  },
  {
    id: 'brtc_chittagong_sunamganj_ac',
    name: 'BRTC Chittagong-Sunamganj (AC)',
    bnName: 'বিআরটিসি চট্টগ্রাম-সুনামগঞ্জ (এসি)',
    routeString: 'Chittagong ⇄ Sunamganj',
    stops: ['chittagong', 'feni', 'comilla', 'brahmanbaria', 'habiganj', 'sylhet', 'sunamganj'],
    type: 'AC',
    hours: '9:15 PM'
  },
  {
    id: 'brtc_barisal_kuakata_ac',
    name: 'BRTC Barisal-Kuakata (AC)',
    bnName: 'বিআরটিসি বরিশাল-কুয়াকাটা (এসি)',
    routeString: 'Barisal ⇄ Kuakata',
    stops: ['barisal', 'patuakhali', 'kuakata'],
    type: 'AC',
    hours: '8:00 AM'
  },
  {
    id: 'brtc_barisal_rangpur',
    name: 'BRTC Barisal-Rangpur',
    bnName: 'বিআরটিসি বরিশাল-রংপুর',
    routeString: 'Barisal ⇄ Rangpur',
    stops: ['barisal', 'gopalganj', 'faridpur', 'dhaka', 'gazipur', 'mymensingh', 'jamalpur', 'rangpur'],
    type: 'Sitting',
    hours: '5:45 AM'
  },
  {
    id: 'brtc_barisal_chapainawabganj',
    name: 'BRTC Barisal-Chapainawabganj',
    bnName: 'বিআরটিসি বরিশাল-চাঁপাইনবাবগঞ্জ',
    routeString: 'Barisal ⇄ Chapainawabganj',
    stops: ['barisal', 'gopalganj', 'faridpur', 'pabna', 'rajshahi', 'nawabganj'],
    type: 'Sitting',
    hours: '6:30 AM'
  },
  {
    id: 'brtc_kuakata_dhaka_ac',
    name: 'BRTC Kuakata-Dhaka (AC)',
    bnName: 'বিআরটিসি কুয়াকাটা-ঢাকা (এসি)',
    routeString: 'Kuakata ⇄ Gulistan',
    stops: ['kuakata', 'patuakhali', 'barisal', 'gopalganj', 'faridpur', 'munshiganj', 'dhaka', 'gulistan'],
    type: 'AC',
    hours: '6:15 AM & 8:20 AM'
  },
  {
    id: 'brtc_rangpur_shyamnagar',
    name: 'BRTC Rangpur-Shyamnagar (Nightly)',
    bnName: 'বিআরটিসি রংপুর-শ্যামনগর (নৈশ)',
    routeString: 'Rangpur ⇄ Shyamnagar',
    stops: ['rangpur', 'dinajpur', 'pabna', 'kushtia', 'jessore', 'khulna', 'satkhira', 'shyamnagar'],
    type: 'Sitting',
    hours: '5:30 PM Nightly'
  },
  {
    id: 'brtc_kurigram_shyamnagar',
    name: 'BRTC Kurigram-Shyamnagar',
    bnName: 'বিআরটিসি কুড়িগ্রাম-শ্যামনগর',
    routeString: 'Kurigram ⇄ Shyamnagar',
    stops: ['kurigram', 'rangpur', 'bogra', 'pabna', 'kushtia', 'jessore', 'khulna', 'satkhira', 'shyamnagar'],
    type: 'Sitting',
    hours: '6:00 AM'
  },
  {
    id: 'brtc_panchagarh_mongla',
    name: 'BRTC Panchagarh-Mongla (Nightly)',
    bnName: 'বিআরটিসি পঞ্চগড়-মংলা (নৈশ)',
    routeString: 'Panchagarh ⇄ Mongla',
    stops: ['panchagarh', 'thakurgaon', 'dinajpur', 'bogra', 'pabna', 'kushtia', 'jessore', 'khulna', 'bagerhat', 'mongla'],
    type: 'Sitting',
    hours: '4:00 PM Nightly'
  },
  {
    id: 'brtc_panchagarh_chapai_ac',
    name: 'BRTC Panchagarh-Chapainawabganj (AC)',
    bnName: 'বিআরটিসি পঞ্চগড়-চাঁপাইনবাবগঞ্জ (এসি)',
    routeString: 'Panchagarh ⇄ Chapainawabganj',
    stops: ['panchagarh', 'thakurgaon', 'dinajpur', 'natore', 'rajshahi', 'nawabganj'],
    type: 'AC',
    hours: '6:10 AM'
  },
  {
    id: 'brtc_panchagarh_pirojpur',
    name: 'BRTC Panchagarh-Pirojpur (Nightly)',
    bnName: 'বিআরটিসি পঞ্চগড়-পিরোজপুর (নৈশ)',
    routeString: 'Panchagarh ⇄ Pirojpur',
    stops: ['panchagarh', 'thakurgaon', 'dinajpur', 'bogra', 'pabna', 'faridpur', 'barisal', 'pirojpur'],
    type: 'AC',
    hours: '3:30 PM Nightly'
  },
  {
    id: 'brtc_rangpur_gopalganj_ac',
    name: 'BRTC Rangpur-Gopalganj (AC)',
    bnName: 'বিআরটিসি রংপুর-গোপালগঞ্জ (এসি)',
    routeString: 'Rangpur ⇄ Gopalganj',
    stops: ['rangpur', 'dinajpur', 'bogra', 'pabna', 'faridpur', 'gopalganj'],
    type: 'AC',
    hours: '7:00 AM'
  },
  {
    id: 'brtc_dinajpur_kuakata_ac',
    name: 'BRTC Dinajpur-Kuakata (AC)',
    bnName: 'বিআরটিসি দিনাজপুর-কুয়াকাটা (এসি)',
    routeString: 'Dinajpur ⇄ Kuakata',
    stops: ['dinajpur', 'bogra', 'pabna', 'faridpur', 'gopalganj', 'barisal', 'patuakhali', 'kuakata'],
    type: 'AC',
    hours: '3:20 PM'
  },
  {
    id: 'brtc_dinajpur_benapole_ac',
    name: 'BRTC Dinajpur-Benapole (AC)',
    bnName: 'বিআরটিসি দিনাজপুর-বেনাপোল (এসি)',
    routeString: 'Dinajpur ⇄ Benapole',
    stops: ['dinajpur', 'bogra', 'pabna', 'kushtia', 'jessore', 'benapole'],
    type: 'AC',
    hours: '6:00 PM'
  },
  {
    id: 'shohagh_benapole_1',
    name: 'Shohagh Paribahan (Dhaka-Benapole via Narail)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-বেনাপোল)',
    routeString: 'Dhaka ⇄ Benapole',
    stops: ['kamalapur', 'sayedabad', 'gulistan', 'narail', 'jessore', 'navaron', 'jhikargacha', 'benapole'],
    type: 'Sitting',
    hours: '5:40 AM - 10:45 PM',
  },
  {
    id: 'shohagh_benapole_2',
    name: 'Shohagh Paribahan (Dhaka-Benapole via Muksudpur)',
    bnName: 'শোহাগ পরিবহন (মুকসুদপুর-বেনাপোল)',
    routeString: 'Dhaka ⇄ Benapole',
    stops: ['kamalapur', 'sayedabad', 'gulistan', 'muksudpur', 'narail', 'jessore', 'navaron', 'jhikargacha', 'benapole'],
    type: 'Sitting',
    hours: '6:00 AM - 11:15 PM',
  },
  {
    id: 'shohagh_benapole_3',
    name: 'Shohagh Paribahan (Abdullahpur-Benapole via Muksudpur)',
    bnName: 'শোহাগ পরিবহন (আবদুল্লাহপুর-বেনাপোল)',
    routeString: 'Abdullahpur ⇄ Benapole',
    stops: ['abdullahpur', 'muksudpur', 'narail', 'jessore', 'navaron', 'jhikargacha', 'benapole'],
    type: 'AC',
    hours: '5:45 AM - 10:30 PM',
  },
  {
    id: 'shohagh_benapole_4',
    name: 'Shohagh Paribahan (Dhaka-Benapole via Magura, AC)',
    bnName: 'শোহাগ পরিবহন (মাগুরা-বেনাপোল, এসি)',
    routeString: 'Dhaka ⇄ Benapole',
    stops: ['kamalapur', 'sayedabad', 'magura', 'jessore', 'benapole'],
    type: 'AC',
    hours: '7:30 AM - 10:45 PM',
  },
  {
    id: 'hanif_benapole',
    name: 'Hanif Enterprise (Dhaka-Benapole)',
    bnName: 'হানিফ এন্টারপ্রাইজ (ঢাকা-বেনাপোল)',
    routeString: 'Dhaka ⇄ Benapole',
    stops: ['kamalapur', 'sayedabad', 'magura', 'jessore', 'jhikargacha', 'navaron', 'benapole'],
    type: 'Sitting',
    hours: '9:45 PM - 11:00 PM',
  },
  {
    id: 'royal_coach_benapole',
    name: 'Royal Coach (Dhaka-Benapole, AC)',
    bnName: 'রয়েল কোচ (ঢাকা-বেনাপোল, এসি)',
    routeString: 'Dhaka ⇄ Benapole',
    stops: ['kamalapur', 'abdullahpur', 'narail', 'jessore', 'navaron', 'benapole'],
    type: 'AC',
    hours: '8:45 PM - 11:55 PM',
  },
  {
    id: 'royal_maitri_benapole',
    name: 'Royal Maitri Service (Dhaka-Benapole)',
    bnName: 'রয়েল মৈত্রী সার্ভিস (ঢাকা-বেনাপোল)',
    routeString: 'Dhaka ⇄ Benapole',
    stops: ['kamalapur', 'narail', 'jessore', 'navaron', 'benapole'],
    type: 'AC',
    hours: '11:55 PM',
  },
  {
    id: 'star_deluxe_benapole',
    name: 'Star Deluxe (Dhaka-Benapole, AC)',
    bnName: 'স্টার ডিলাক্স (ঢাকা-বেনাপোল, এসি)',
    routeString: 'Dhaka (Abdullahpur) ⇄ Benapole',
    stops: ['abdullahpur', 'sayedabad', 'narail', 'jessore', 'navaron', 'benapole'],
    type: 'AC',
    hours: '5:45 AM',
  },
  // ── Shohagh Paribahan — all major intercity corridors ────────────────────
  {
    id: 'shohagh_chittagong',
    name: 'Shohagh Paribahan (Dhaka-Chittagong)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-চট্টগ্রাম)',
    routeString: 'Dhaka ⇄ Chittagong',
    stops: ['sayedabad', 'comilla', 'feni', 'chittagong'],
    type: 'AC',
    hours: '6:00 AM - 11:30 PM',
  },
  {
    id: 'shohagh_coxsbazar',
    name: 'Shohagh Paribahan (Dhaka-Cox\'s Bazar)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-কক্সবাজার)',
    routeString: 'Dhaka ⇄ Cox\'s Bazar',
    stops: ['sayedabad', 'comilla', 'feni', 'chittagong', 'coxsbazar'],
    type: 'AC',
    hours: '7:00 AM - 10:00 PM',
  },
  {
    id: 'shohagh_sylhet',
    name: 'Shohagh Paribahan (Dhaka-Sylhet)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-সিলেট)',
    routeString: 'Dhaka ⇄ Sylhet',
    stops: ['mohakhali_bus_stand', 'narsingdi', 'brahmanbaria', 'sylhet'],
    type: 'AC',
    hours: '6:00 AM - 11:00 PM',
  },
  {
    id: 'shohagh_khulna',
    name: 'Shohagh Paribahan (Dhaka-Khulna)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-খুলনা)',
    routeString: 'Dhaka ⇄ Khulna',
    stops: ['gabtoli', 'faridpur', 'jessore', 'khulna'],
    type: 'AC',
    hours: '6:00 AM - 11:00 PM',
  },
  {
    id: 'shohagh_rajshahi',
    name: 'Shohagh Paribahan (Dhaka-Rajshahi)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-রাজশাহী)',
    routeString: 'Dhaka ⇄ Rajshahi',
    stops: ['gabtoli', 'sirajganj', 'natore', 'rajshahi'],
    type: 'AC',
    hours: '6:00 AM - 11:00 PM',
  },
  {
    id: 'shohagh_rangpur',
    name: 'Shohagh Paribahan (Dhaka-Rangpur)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-রংপুর)',
    routeString: 'Dhaka ⇄ Rangpur',
    stops: ['gabtoli', 'bogra', 'rangpur'],
    type: 'AC',
    hours: '6:00 AM - 10:30 PM',
  },
  {
    id: 'shohagh_dinajpur',
    name: 'Shohagh Paribahan (Dhaka-Dinajpur)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-দিনাজপুর)',
    routeString: 'Dhaka ⇄ Dinajpur',
    stops: ['gabtoli', 'bogra', 'rangpur', 'dinajpur'],
    type: 'AC',
    hours: '6:00 AM - 9:00 PM',
  },
  {
    id: 'shohagh_barisal',
    name: 'Shohagh Paribahan (Dhaka-Barishal)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-বরিশাল)',
    routeString: 'Dhaka ⇄ Barishal',
    stops: ['sayedabad', 'faridpur', 'barisal'],
    type: 'AC',
    hours: '6:00 AM - 10:00 PM',
  },
  {
    id: 'shohagh_mymensingh',
    name: 'Shohagh Paribahan (Dhaka-Mymensingh)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-ময়মনসিংহ)',
    routeString: 'Dhaka ⇄ Mymensingh',
    stops: ['mohakhali_bus_stand', 'mymensingh'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM',
  },
  {
    id: 'shohagh_bogura',
    name: 'Shohagh Paribahan (Dhaka-Bogura)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-বগুড়া)',
    routeString: 'Dhaka ⇄ Bogura',
    stops: ['gabtoli', 'sirajganj', 'bogra'],
    type: 'AC',
    hours: '6:00 AM - 11:00 PM',
  },
  {
    id: 'shohagh_cumilla',
    name: 'Shohagh Paribahan (Dhaka-Cumilla)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-কুমিল্লা)',
    routeString: 'Dhaka ⇄ Cumilla',
    stops: ['sayedabad', 'comilla'],
    type: 'Sitting',
    hours: '6:00 AM - 11:00 PM',
  },
  {
    id: 'shohagh_jashore',
    name: 'Shohagh Paribahan (Dhaka-Jashore)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-যশোর)',
    routeString: 'Dhaka ⇄ Jashore',
    stops: ['sayedabad', 'faridpur', 'narail', 'jessore'],
    type: 'AC',
    hours: '6:00 AM - 11:30 PM',
  },
  {
    id: 'shohagh_pabna',
    name: 'Shohagh Paribahan (Dhaka-Pabna)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-পাবনা)',
    routeString: 'Dhaka ⇄ Pabna',
    stops: ['gabtoli', 'sirajganj', 'paksey'],
    type: 'Sitting',
    hours: '6:00 AM - 11:00 PM',
  },
  {
    id: 'shohagh_kushtia',
    name: 'Shohagh Paribahan (Dhaka-Kushtia)',
    bnName: 'শোহাগ পরিবহন (ঢাকা-কুষ্টিয়া)',
    routeString: 'Dhaka ⇄ Kushtia',
    stops: ['gabtoli', 'faridpur', 'kushtia_court'],
    type: 'Sitting',
    hours: '6:00 AM - 11:00 PM',
  },
  {
    id: 'brtc_panchagarh_patuakhali_ac',
    name: 'BRTC Panchagarh-Patuakhali (AC Nightly)',
    bnName: 'বিআরটিসি পঞ্চগড়-পটুয়াখালী (এসি নৈশ)',
    routeString: 'Panchagarh ⇄ Patuakhali',
    stops: ['panchagarh', 'thakurgaon', 'dinajpur', 'bogra', 'pabna', 'faridpur', 'gopalganj', 'barisal', 'patuakhali'],
    type: 'AC',
    hours: '3:20 PM Nightly'
  },
  {
    id: 'brtc_bhurunagamari_gopalganj_ac',
    name: 'BRTC Bhurunagamari-Gopalganj (AC Nightly)',
    bnName: 'বিআরটিসি ভুরুঙ্গামারী-গোপালগঞ্জ (এসি নৈশ)',
    routeString: 'Bhurunagamari ⇄ Gopalganj',
    stops: ['bhurunagamari', 'kurigram', 'rangpur', 'bogra', 'pabna', 'faridpur', 'gopalganj'],
    type: 'AC',
    hours: '5:20 PM Nightly'
  },
  {
    id: 'brtc_kurigram_pirojpur_ac',
    name: 'BRTC Kurigram-Pirojpur (AC Nightly)',
    bnName: 'বিআরটিসি কুড়িগ্রাম-পিরোজপুর (এসি নৈশ)',
    routeString: 'Kurigram ⇄ Pirojpur',
    stops: ['kurigram', 'rangpur', 'bogra', 'pabna', 'faridpur', 'gopalganj', 'barisal', 'pirojpur'],
    type: 'AC',
    hours: '4:30 PM Nightly'
  },
  {
    id: 'brtc_mymensingh_bholaganj',
    name: 'BRTC Mymensingh-Bholaganj',
    bnName: 'বিআরটিসি ময়মনসিংহ-ভোলাগঞ্জ',
    routeString: 'Mymensingh ⇄ Bholaganj',
    stops: ['mymensingh', 'netrokona', 'sunamganj', 'sylhet', 'bholaganj'],
    type: 'Sitting',
    hours: '9:00 AM'
  },
  {
    id: 'brtc_netrokona_mongla',
    name: 'BRTC Netrokona-Mongla',
    bnName: 'বিআরটিসি নেত্রকোনা-মংলা',
    routeString: 'Netrokona ⇄ Mongla',
    stops: ['netrokona', 'mymensingh', 'dhaka', 'faridpur', 'gopalganj', 'khulna', 'bagerhat', 'mongla'],
    type: 'Sitting',
    hours: '7:00 AM'
  },
  {
    id: 'brtc_mymensingh_nandail_dd',
    name: 'BRTC Mymensingh-Nandail',
    bnName: 'বিআরটিসি ময়মনসিংহ-নান্দাইল',
    routeString: 'Mymensingh ⇄ Nandail',
    stops: ['mymensingh', 'trishal', 'nandail'],
    type: 'Double-Decker',
    hours: '7:50 AM - Every 30 min'
  },
  {
    id: 'brtc_pabna_kuakata',
    name: 'BRTC Pabna-Kuakata',
    bnName: 'বিআরটিসি পাবনা-কুয়াকাটা',
    routeString: 'Pabna ⇄ Kuakata',
    stops: ['pabna', 'kushtia', 'faridpur', 'gopalganj', 'barisal', 'patuakhali', 'kuakata'],
    type: 'Sitting',
    hours: '6:20 AM'
  },
  {
    id: 'brtc_pabna_pathorghata',
    name: 'BRTC Pabna-Pathorghata',
    bnName: 'বিআরটিসি পাবনা-পাথরঘাটা',
    routeString: 'Pabna ⇄ Pathorghata',
    stops: ['pabna', 'kushtia', 'faridpur', 'gopalganj', 'barisal', 'barguna', 'pathorghata'],
    type: 'Sitting',
    hours: '5:40 AM'
  },
  {
    id: 'brtc_rajshahi_naogaon_ac',
    name: 'BRTC Rajshahi-Naogaon (AC)',
    bnName: 'বিআরটিসি রাজশাহী-নওগাঁ (এসি)',
    routeString: 'Rajshahi ⇄ Naogaon',
    stops: ['rajshahi', 'natore', 'naogaon'],
    type: 'AC',
    hours: '6:45 AM - Multiple daily'
  },
  {
    id: 'brtc_bogra_dinajpur_ac',
    name: 'BRTC Bogra-Dinajpur (AC)',
    bnName: 'বিআরটিসি বগুড়া-দিনাজপুর (এসি)',
    routeString: 'Bogra ⇄ Dinajpur',
    stops: ['bogra', 'naogaon', 'natore', 'dinajpur'],
    type: 'AC',
    hours: '6:50 AM'
  },
  {
    id: 'brtc_bogra_panchagarh_khulna',
    name: 'BRTC Panchagarh-Khulna',
    bnName: 'বিআরটিসি পঞ্চগড়-খুলনা',
    routeString: 'Panchagarh ⇄ Khulna',
    stops: ['panchagarh', 'thakurgaon', 'dinajpur', 'bogra', 'pabna', 'kushtia', 'jessore', 'khulna'],
    type: 'Sitting',
    hours: '6:00 AM'
  },
  {
    id: 'itihash_paribahan',
    name: 'Itihash Paribahan',
    bnName: 'ইতিহাস পরিবহন',
    routeString: 'Mirpur 14 ⇄ Chandra',
    stops: ['mirpur14', 'mirpur10', 'mirpur1', 'gabtoli', 'savar', 'nobinagar', 'chandra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'selfie_paribahan',
    name: 'Selfie Paribahan',
    bnName: 'সেলফি পরিবহন',
    routeString: 'Gabtoli ⇄ Paturia',
    stops: ['gabtoli', 'savar', 'manikganj', 'paturia'],
    type: 'Sitting',
    hours: '5:00 AM - 9:00 PM'
  },
  {
    id: 'provati_banasree_2',
    name: 'Provati Banasree',
    bnName: 'প্রভাতী বনশ্রী',
    routeString: 'Gulistan ⇄ Gazipur',
    stops: ['gulistan', 'shahbag', 'farmgate', 'mohakhali', 'banani', 'airport', 'tongi', 'board_bazar', 'gazipur'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 11:00 PM'
  },
  {
    id: 'thikana',
    name: 'Thikana Paribahan',
    bnName: 'ঠিকানা পরিবহন',
    routeString: 'Sayedabad ⇄ Savar',
    stops: ['sayedabad', 'jatrabari', 'gulistan', 'shahbag', 'science_lab', 'kallyanpur', 'gabtoli', 'savar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'bandhan',
    name: 'Bandhan Paribahan',
    bnName: 'বন্ধন পরিবহন',
    routeString: 'Gulistan ⇄ Narayanganj',
    stops: ['gulistan', 'jatrabari', 'signboard', 'narayanganj'],
    type: 'Sitting',
    hours: '5:30 AM - 11:30 PM'
  },
  {
    id: 'utsab',
    name: 'Utsab Paribahan',
    bnName: 'উৎসব পরিবহন',
    routeString: 'Gulistan ⇄ Narayanganj',
    stops: ['gulistan', 'jatrabari', 'signboard', 'narayanganj'],
    type: 'Sitting',
    hours: '5:30 AM - 11:30 PM'
  },
  {
    id: 'great_elish',
    name: 'Great Elish',
    bnName: 'গ্রেট ইলিশ',
    routeString: 'Gulistan ⇄ Mawa',
    stops: ['gulistan', 'jatrabari', 'sayedabad', 'postagola', 'maowa'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'dighirpar',
    name: 'Dighirpar Transport',
    bnName: 'দিঘীরপাড় পরিবহন',
    routeString: 'Gulistan ⇄ Munshiganj',
    stops: ['gulistan', 'jatrabari', 'sayedabad', 'postagola', 'munshiganj'],
    type: 'Local',
    hours: '6:00 AM - 9:00 PM'
  },
  {
    id: 'vip_27_2',
    name: 'VIP 27',
    bnName: 'ভিআইপি ২৭',
    routeString: 'Azimpur ⇄ Gazipur',
    stops: ['azimpur', 'newmarket', 'science_lab', 'farmgate', 'mohakhali', 'banani', 'airport', 'gazipur'],
    type: 'Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'winner_2',
    name: 'Winner',
    bnName: 'উইনার',
    routeString: 'Gulistan ⇄ Gazipur',
    stops: ['gulistan', 'shahbag', 'farmgate', 'mohakhali', 'banani', 'airport', 'tongi', 'board_bazar', 'gazipur'],
    type: 'Sitting',
    hours: '6:00 AM - 11:30 PM'
  },
  {
    id: 'gazipur_paribahan_2',
    name: 'Gazipur Paribahan',
    bnName: 'গাজীপুর পরিবহন',
    routeString: 'Gulistan ⇄ Gazipur',
    stops: ['gulistan', 'shahbag', 'farmgate', 'mohakhali', 'banani', 'airport', 'tongi', 'board_bazar', 'gazipur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'prochesta_paribahan',
    name: 'Prochesta Paribahan',
    bnName: 'প্রচেষ্টা পরিবহন',
    routeString: 'Gulistan ⇄ Mawa',
    stops: ['gulistan', 'jatrabari', 'sayedabad', 'postagola', 'maowa'],
    type: 'Sitting',
    hours: '5:30 AM - 10:00 PM'
  },
  {
    id: 'nayan',
    name: 'Nayan Paribahan',
    bnName: 'নয়ন পরিবহন',
    routeString: 'Gulistan ⇄ Munshiganj',
    stops: ['gulistan', 'jatrabari', 'sayedabad', 'postagola', 'munshiganj'],
    type: 'Local',
    hours: '6:00 AM - 9:00 PM'
  },
  {
    id: 'nagorpur',
    name: 'Nagorpur',
    bnName: 'নাগরপুর',
    routeString: 'Nagorpur ⇄ Gabtoli',
    stops: ['gabtoli', 'mazar_road', 'savar', 'kalampur', 'kusura', 'saturia', 'daragram', 'baliati', 'citakhola', 'chachitara', 'pakutia', 'kalur_ghat', 'nagorpur'],
    type: 'Local',
    hours: '6:00 AM - 9:00 PM'
  },
  {
    id: 'raida_paribahan',
    name: 'Raida Paribahan',
    bnName: 'রাইদা পরিবহন',
    routeString: 'Diabari ⇄ Postagola',
    stops: ['diabari', 'uttara', 'airport', 'khilkhet', 'kuril', 'notun_bazar', 'badda', 'rampura', 'malibagh', 'sayedabad', 'jatrabari', 'postagola'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'trans_silva',
    name: 'Trans Silva',
    bnName: 'ট্রান্স সিলভা',
    routeString: 'Mirpur 1 ⇄ Jatrabari',
    stops: ['mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10', 'kazipara', 'shewrapara', 'agargaon', 'farmgate', 'shahbag', 'paltan', 'gulistan', 'motijheel', 'jatrabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'gangchil_paribahan',
    name: 'Gangchil Paribahan',
    bnName: 'গাংচিল পরিবহন',
    routeString: 'Gulistan ⇄ Mawa',
    stops: ['gulistan', 'jatrabari', 'sayedabad', 'postagola', 'kadamtoli', 'hasnabad', 'nimtola', 'kuchimura', 'sreenagar', 'maowa'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'bikrompur_express',
    name: 'Bikrompur Express',
    bnName: 'বিক্রমপুর এক্সপ্রেস',
    routeString: 'Gulistan ⇄ Mawa',
    stops: ['gulistan', 'jatrabari', 'sayedabad', 'postagola', 'kadamtoli', 'hasnabad', 'nimtola', 'kuchimura', 'sreenagar', 'maowa'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'munshiganj_super',
    name: 'Munshiganj Super Service',
    bnName: 'মুন্সীগঞ্জ সুপার সার্ভিস',
    routeString: 'Gulistan ⇄ Munshiganj',
    stops: ['gulistan', 'jatrabari', 'sayedabad', 'postagola', 'kadamtoli', 'munshiganj'],
    type: 'Sitting',
    hours: '6:00 AM - 9:00 PM'
  },
  {
    id: 'prochesta_abdullahpur',
    name: 'Prochesta (Abdullahpur-Mawa)',
    bnName: 'প্রচেষ্টা (আবদুল্লাহপুর-মাওয়া)',
    routeString: 'Abdullahpur ⇄ Mawa',
    stops: ['abdullahpur', 'uttara', 'airport', 'khilkhet', 'kuril', 'nadda', 'notun_bazar', 'badda', 'rampura', 'malibagh', 'gulistan', 'babubazar', 'keraniganj', 'hasnabad', 'nimtola', 'kuchimura', 'sreenagar', 'maowa'],
    type: 'Sitting',
    hours: '5:30 AM - 10:00 PM'
  },
  {
    id: 'provati_banashree',
    name: 'Provati Banashree',
    bnName: 'প্রভাতি বনশ্রী',
    routeString: 'Fulbaria ⇄ Azampur',
    stops: ['fulbaria', 'golap_shah_mazar', 'gpo', 'paltan', 'kakrail', 'shantinagar', 'malibagh', 'mouchak', 'mogbazar', 'wireless', 'banani', 'kuril', 'airport', 'uttara', 'azampur'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'labbayek',
    name: 'Labbayek',
    bnName: 'লাব্বাইক',
    routeString: 'Savar ⇄ Signboard',
    stops: ['savar', 'hemayetpur', 'gabtoli', 'kallyanpur', 'farmgate', 'bangla_motor', 'shahbag', 'paltan', 'gulistan', 'khilgaon', 'bashabo', 'mugdapara', 'sayedabad', 'jatrabari', 'shanir_akhra', 'matuail', 'signboard'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 9:30 PM'
  },
  {
    id: 'shikor_paribahan',
    name: 'Shikor Paribahan',
    bnName: 'শিকড় পরিবহন',
    routeString: 'Jatrabari ⇄ Mirpur 12',
    stops: ['jatrabari', 'motijheel', 'paltan', 'press_club', 'shahbag', 'bangla_motor', 'farmgate', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur11', 'mirpur12'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ena_paribahan',
    name: 'ENA Paribahan',
    bnName: 'এনা পরিবহন',
    routeString: 'Motijheel ⇄ Mirpur 1',
    stops: ['motijheel', 'paltan', 'press_club', 'shahbag', 'bangla_motor', 'farmgate', 'agargaon', 'shewrapara', 'kazipara', 'mirpur10', 'mirpur2', 'mirpur1'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'projapati',
    name: 'Projapati',
    bnName: 'প্রজাপতি',
    routeString: 'Bosila ⇄ Mirpur 10',
    stops: ['bosila', 'mohammadpur', 'kallyanpur', 'bangla_college', 'ansar_camp', 'mirpur1', 'sony_cinema', 'mirpur2', 'mirpur10'],
    type: 'Local',
    hours: '6:00 AM - 9:30 PM'
  },
  {
    id: 'victor_classic_narayanganj',
    name: 'Victor Classic',
    bnName: 'ভিক্টর ক্লাসিক',
    routeString: 'Gabtoli ⇄ Narayanganj',
    stops: ['gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'asad_gate', 'dhanmondi32', 'kalabagan', 'science_lab', 'shahbag', 'matsya_bhaban', 'high_court', 'press_club', 'paltan', 'gpo', 'gulistan', 'motijheel', 'kamalapur', 'narayanganj'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ruposhi_bangla',
    name: 'Ruposhi Bangla',
    bnName: 'রূপসী বাংলা',
    routeString: 'Mirpur 14 ⇄ Jatrabari',
    stops: ['mirpur14', 'mirpur13', 'mirpur11', 'mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'paltan', 'gulistan', 'tikatuli', 'jatrabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'modhumita',
    name: 'Modhumita',
    bnName: 'মধুমিতা',
    routeString: 'Mirpur 10 ⇄ Demra',
    stops: ['mirpur10', 'mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'gulistan', 'tikatuli', 'sayedabad', 'jatrabari', 'shanir_akhra', 'signboard', 'demra'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'jhilik',
    name: 'Jhilik Paribahan',
    bnName: 'ঝিলিক পরিবহন',
    routeString: 'Savar ⇄ Sadarghat',
    stops: ['savar', 'hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'asad_gate', 'katabon', 'shahbag', 'paltan', 'gulistan', 'naya_bazar', 'ray_saheb_bazar', 'sadarghat'],
    type: 'Local',
    hours: '6:00 AM - 9:30 PM'
  },
  {
    id: 'shahin',
    name: 'Shahin Paribahan',
    bnName: 'শাহীন পরিবহন',
    routeString: 'Gabtoli ⇄ Sayedabad',
    stops: ['gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'college_gate', 'asad_gate', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'paltan', 'gulistan', 'tikatuli', 'jatrabari', 'sayedabad'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'bonolata',
    name: 'Bonolata',
    bnName: 'বনলতা',
    routeString: 'Mirpur 10 ⇄ Sadarghat',
    stops: ['mirpur10', 'kallyanpur', 'shyamoli', 'asad_gate', 'dhanmondi32', 'kalabagan', 'science_lab', 'shahbag', 'bangla_motor', 'press_club', 'gulistan', 'naya_bazar', 'sadarghat'],
    type: 'Local',
    hours: '6:00 AM - 9:30 PM'
  },
  {
    id: 'nabin',
    name: 'Nabin Paribahan',
    bnName: 'নবীন পরিবহন',
    routeString: 'Uttara ⇄ Motijheel',
    stops: ['uttara', 'azampur', 'airport', 'khilkhet', 'kuril', 'kuril_chourasta', 'mohakhali', 'jahangir_gate', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'paltan', 'motijheel'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'sonar_tori',
    name: 'Sonar Tori',
    bnName: 'সোনার তরী',
    routeString: 'Savar ⇄ Jatrabari',
    stops: ['savar', 'hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'farmgate', 'kawran_bazar', 'bangla_motor', 'gulistan', 'tikatuli', 'jatrabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'probashi',
    name: 'Probashi',
    bnName: 'প্রবাসী',
    routeString: 'Mirpur 10 ⇄ Narayanganj',
    stops: ['mirpur10', 'kallyanpur', 'shyamoli', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'paltan', 'gulistan', 'motijheel', 'kamalapur', 'narayanganj'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 9:30 PM'
  },

  // === NUMBERED ROUTES ===
  {
    id: '1_no',
    name: '1 No.',
    bnName: '১নং',
    routeString: 'Sadarghat ⇄ Mirpur 1',
    stops: ['sadarghat', 'golap_shah_mazar', 'gpo', 'naya_bazar', 'gulistan', 'paltan', 'press_club', 'high_court', 'shahbag', 'bangla_motor', 'farmgate', 'college_gate', 'shishu_mela', 'shyamoli', 'kallyanpur', 'technical', 'ansar_camp', 'mirpur1'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '2_no',
    name: '2 No.',
    bnName: '২নং',
    routeString: 'Kamalapur ⇄ Mirpur 10',
    stops: ['kamalapur', 'motijheel', 'gulistan', 'paltan', 'shahbag', 'bangla_motor', 'farmgate', 'bijoy_sarani', 'jahangir_gate', 'shewrapara', 'kazipara', 'mirpur2', 'mirpur10'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '5_no',
    name: '5 No.',
    bnName: '৫নং',
    routeString: 'Mohammadpur ⇄ Gulistan',
    stops: ['mohammadpur', 'shankar', 'shia_masjid', 'adabor', 'shyamoli', 'asad_gate', 'college_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'paltan', 'gulistan'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '10_no',
    name: '10 No.',
    bnName: '১০নং',
    routeString: 'Abdullahpur ⇄ Gulistan',
    stops: ['abdullahpur', 'uttara', 'azampur', 'airport', 'khilkhet', 'kuril', 'mohakhali', 'jahangir_gate', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'paltan', 'gulistan'],
    type: 'Local',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: '11_no',
    name: '11 No.',
    bnName: '১১নং',
    routeString: 'Mirpur 11 ⇄ Motijheel',
    stops: ['mirpur11', 'purobi', 'mirpur10', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'college_gate', 'bangla_motor', 'farmgate', 'shahbag', 'paltan', 'motijheel'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '12_no',
    name: '12 No.',
    bnName: '১২নং',
    routeString: 'Mirpur 12 ⇄ Gulistan',
    stops: ['mirpur12', 'pallabi', 'mirpur11', 'purobi', 'mirpur10', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'asad_gate', 'bangla_motor', 'farmgate', 'shahbag', 'paltan', 'gulistan'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '14_no',
    name: '14 No.',
    bnName: '১৪নং',
    routeString: 'Mirpur 14 ⇄ Motijheel',
    stops: ['mirpur14', 'kachukhet', 'kazipara', 'shewrapara', 'mirpur12', 'mirpur11', 'mirpur10', 'technical', 'kallyanpur', 'shyamoli', 'asad_gate', 'bangla_motor', 'farmgate', 'bijoy_sarani', 'jahangir_gate', 'shahbag', 'paltan', 'gulistan', 'motijheel'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '15_no',
    name: '15 No.',
    bnName: '১৫নং',
    routeString: 'Gabtoli ⇄ Jatrabari',
    stops: ['gabtoli', 'technical', 'kallyanpur', 'shyamoli', 'asad_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'paltan', 'gulistan', 'tikatuli', 'sayedabad', 'jatrabari'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '16_no',
    name: '16 No.',
    bnName: '১৬নং',
    routeString: 'Mirpur 10 ⇄ Demra',
    stops: ['mirpur10', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'notun_bazar', 'badda', 'merul', 'rampura', 'malibagh', 'shantinagar', 'motijheel', 'tikatuli', 'jatrabari', 'demra'],
    type: 'Local',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: '17_no',
    name: '17 No.',
    bnName: '১৭নং',
    routeString: 'Uttara ⇄ Sadarghat',
    stops: ['uttara', 'azampur', 'airport', 'banani', 'mohakhali', 'jahangir_gate', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'paltan', 'press_club', 'high_court', 'gulistan', 'golap_shah_mazar', 'gpo', 'sadarghat'],
    type: 'Local',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: '18_no',
    name: '18 No.',
    bnName: '১৮নং',
    routeString: 'Savar ⇄ Sadarghat',
    stops: ['savar', 'hemayetpur', 'boliarpur', 'amin_bazar', 'gabtoli', 'technical', 'shyamoli', 'farmgate', 'shahbag', 'paltan', 'gulistan', 'sadarghat'],
    type: 'Local',
    hours: '5:30 AM - 10:00 PM'
  },
  {
    id: '19_no',
    name: '19 No.',
    bnName: '১৯নং',
    routeString: 'Gabtoli ⇄ Demra',
    stops: ['gabtoli', 'technical', 'kallyanpur', 'shyamoli', 'farmgate', 'bangla_motor', 'shahbag', 'paltan', 'motijheel', 'kamalapur', 'tikatuli', 'jatrabari', 'shonir_akhra', 'demra'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: '20_no',
    name: '20 No.',
    bnName: '২০নং',
    routeString: 'Mirpur 12 ⇄ Sadarghat',
    stops: ['mirpur12', 'pallabi', 'mirpur10', 'shewrapara', 'kazipara', 'agargaon', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'press_club', 'paltan', 'gulistan', 'sadarghat'],
    type: 'Local',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: '21_no',
    name: '21 No.',
    bnName: '২১নং',
    routeString: 'Abdullahpur ⇄ Motijheel',
    stops: ['abdullahpur', 'uttara', 'airport', 'banani', 'mohakhali', 'jahangir_gate', 'bijoy_sarani', 'farmgate', 'kawran_bazar', 'paltan', 'motijheel'],
    type: 'Local',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: '25_no',
    name: '25 No.',
    bnName: '২৫নং',
    routeString: 'Mohammadpur ⇄ Motijheel',
    stops: ['mohammadpur', 'shankar', 'dhanmondi32', 'dhanmondi27', 'science_lab', 'newmarket', 'nilkhet', 'azimpur', 'palashi', 'gulistan', 'paltan', 'motijheel'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },

  // === PRIVATE OPERATORS (MISSING) ===
  {
    id: 'bortoman_paribahan',
    name: 'Bortoman Paribahan',
    bnName: 'বর্তমান পরিবহন',
    routeString: 'Mirpur 2 ⇄ Gulistan',
    stops: ['mirpur2', 'sony_cinema', 'mirpur1', 'ansar_camp', 'technical', 'mazar_road', 'gabtoli', 'kallyanpur', 'shyamoli', 'asad_gate', 'college_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'paltan', 'gulistan'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'jatri_seva',
    name: 'Jatri Seva',
    bnName: 'যাত্রী সেবা',
    routeString: 'Jatrabari ⇄ Mirpur 10',
    stops: ['jatrabari', 'sayedabad', 'tikatuli', 'gulistan', 'paltan', 'shahbag', 'bangla_motor', 'farmgate', 'bijoy_sarani', 'shewrapara', 'kazipara', 'mirpur2', 'mirpur10'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'bismillah_city',
    name: 'Bismillah',
    bnName: 'বিসমিল্লাহ',
    routeString: 'Gabtoli ⇄ Jatrabari',
    stops: ['gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'asad_gate', 'college_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'gulistan', 'tikatuli', 'sayedabad', 'jatrabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'laxmi_paribahan',
    name: 'Laxmi Paribahan',
    bnName: 'লক্ষ্মী পরিবহন',
    routeString: 'Mohammadpur ⇄ Azimpur',
    stops: ['mohammadpur', 'shankar', 'dhanmondi15', 'jigatola', 'city_college', 'science_lab', 'newmarket', 'nilkhet', 'azimpur'],
    type: 'Local',
    hours: '6:00 AM - 9:30 PM'
  },
  {
    id: 'nishata_paribahan',
    name: 'Nishata',
    bnName: 'নিশাতা',
    routeString: 'Gabtoli ⇄ Motijheel',
    stops: ['gabtoli', 'technical', 'ansar_camp', 'mirpur1', 'kallyanpur', 'shyamoli', 'college_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'paltan', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'dristy_paribahan',
    name: 'Dristy',
    bnName: 'দৃষ্টি',
    routeString: 'Mirpur 10 ⇄ Demra',
    stops: ['mirpur10', 'purobi', 'kalshi', 'ecb', 'mes', 'shewra', 'kuril', 'notun_bazar', 'badda', 'merul', 'rampura', 'malibagh', 'motijheel', 'tikatuli', 'jatrabari', 'demra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'progati_paribahan',
    name: 'Progati Paribahan',
    bnName: 'প্রগতি পরিবহন',
    routeString: 'Savar ⇄ Motijheel',
    stops: ['savar', 'hemayetpur', 'boliarpur', 'modhumoti', 'amin_bazar', 'parbat', 'gabtoli', 'technical', 'kallyanpur', 'shyamoli', 'farmgate', 'kawran_bazar', 'bangla_motor', 'shahbag', 'paltan', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 10:00 PM'
  },
  {
    id: 'monowar_paribahan',
    name: 'Monowar Paribahan',
    bnName: 'মনোয়ার পরিবহন',
    routeString: 'Jatrabari ⇄ Gabtoli',
    stops: ['jatrabari', 'sayedabad', 'tikatuli', 'gulistan', 'paltan', 'shahbag', 'bangla_motor', 'farmgate', 'college_gate', 'shyamoli', 'kallyanpur', 'technical', 'gabtoli'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'comfort_transport',
    name: 'Comfort Transport',
    bnName: 'কমফোর্ট ট্রান্সপোর্ট',
    routeString: 'Mirpur 10 ⇄ Gulistan',
    stops: ['mirpur10', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'college_gate', 'asad_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'paltan', 'gulistan'],
    type: 'Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'shuvo_paribahan',
    name: 'Shuvo Paribahan',
    bnName: 'শুভ পরিবহন',
    routeString: 'Ashulia ⇄ Motijheel',
    stops: ['ashulia', 'zirabo', 'baipayl', 'nobinagar', 'savar', 'hemayetpur', 'amin_bazar', 'gabtoli', 'technical', 'shyamoli', 'farmgate', 'shahbag', 'paltan', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 10:00 PM'
  },
  {
    id: 'modina_paribahan',
    name: 'Modina Paribahan',
    bnName: 'মদিনা পরিবহন',
    routeString: 'Gabtoli ⇄ Motijheel',
    stops: ['gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'college_gate', 'asad_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'paltan', 'gulistan', 'motijheel'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'unique_service_city',
    name: 'Unique Service',
    bnName: 'ইউনিক সার্ভিস',
    routeString: 'Mirpur 12 ⇄ Motijheel',
    stops: ['mirpur12', 'pallabi', 'mirpur11', 'mirpur10', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'farmgate', 'kawran_bazar', 'paltan', 'motijheel'],
    type: 'Sitting',
    hours: '6:00 AM - 10:30 PM'
  },
  {
    id: 'national_paribahan_city',
    name: 'National Paribahan',
    bnName: 'ন্যাশনাল পরিবহন',
    routeString: 'Gabtoli ⇄ Sadarghat',
    stops: ['gabtoli', 'mazar_road', 'technical', 'kallyanpur', 'shyamoli', 'asad_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'press_club', 'paltan', 'gulistan', 'golap_shah_mazar', 'sadarghat'],
    type: 'Semi-Sitting',
    hours: '5:30 AM - 11:00 PM'
  },
  {
    id: 'shikha_paribahan',
    name: 'Shikha Paribahan',
    bnName: 'শিখা পরিবহন',
    routeString: 'Uttara ⇄ Jatrabari',
    stops: ['uttara', 'azampur', 'airport', 'banani', 'mohakhali', 'farmgate', 'kawran_bazar', 'shahbag', 'paltan', 'gulistan', 'tikatuli', 'jatrabari'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'sobuj_paribahan',
    name: 'Sobuj Paribahan',
    bnName: 'সবুজ পরিবহন',
    routeString: 'Mirpur 1 ⇄ Demra',
    stops: ['mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'college_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'paltan', 'motijheel', 'tikatuli', 'jatrabari', 'shonir_akhra', 'demra'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'rupali_paribahan',
    name: 'Rupali Paribahan',
    bnName: 'রূপালী পরিবহন',
    routeString: 'Mirpur 10 ⇄ Sadarghat',
    stops: ['mirpur10', 'mirpur2', 'mirpur1', 'ansar_camp', 'technical', 'kallyanpur', 'shyamoli', 'asad_gate', 'college_gate', 'bangla_motor', 'farmgate', 'kawran_bazar', 'shahbag', 'press_club', 'paltan', 'gulistan', 'sadarghat'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 11:00 PM'
  },
  {
    id: 'seba_paribahan',
    name: 'Seba Paribahan',
    bnName: 'সেবা পরিবহন',
    routeString: 'Gabtoli ⇄ Demra',
    stops: ['gabtoli', 'technical', 'kallyanpur', 'shyamoli', 'college_gate', 'bangla_motor', 'farmgate', 'shahbag', 'paltan', 'gulistan', 'tikatuli', 'sayedabad', 'jatrabari', 'demra'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },

  // === CHATTOGRAM CITY BUS ROUTES ===
  {
    id: 'ctg_agrabad_oxygen',
    name: 'Agrabad–Oxygen',
    bnName: 'আগ্রাবাদ–অক্সিজেন',
    routeString: 'Patenga ⇄ Oxygen',
    stops: ['patenga', 'cepz', 'two_no_gate', 'bahaddarhat', 'new_market_ctg', 'akshar_dighi', 'kotwali_ctg', 'agrabad', 'lalkhan_bazar', 'dampara', 'jubilee_road', 'gec_circle', 'sholoshahar', 'muradpur', 'oxygen'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ctg_agrabad_pahartali',
    name: 'Agrabad–Pahartali',
    bnName: 'আগ্রাবাদ–পাহাড়তলী',
    routeString: 'Agrabad ⇄ Pahartali',
    stops: ['agrabad', 'lalkhan_bazar', 'gec_circle', 'khulshi', 'nasirabad_ctg', 'sholoshahar', 'muradpur', 'foys_lake', 'pahartali'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ctg_agrabad_halishahar',
    name: 'Agrabad–Halishahar',
    bnName: 'আগ্রাবাদ–হালিশহর',
    routeString: 'Agrabad ⇄ Halishahar',
    stops: ['agrabad', 'two_no_gate', 'halishahar'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ctg_new_market_kalurghat',
    name: 'New Market–Kalurghat',
    bnName: 'নিউ মার্কেট–কালুরঘাট',
    stops: ['new_market_ctg', 'akshar_dighi', 'reazuddin_bazar', 'chawkbazar_ctg', 'anderkilla', 'kotwali_ctg', 'agrabad', 'muradpur', 'oxygen', 'bayazid', 'kalurghat_ctg'],
    routeString: 'New Market ⇄ Kalurghat',
    type: 'Local',
    hours: '6:00 AM - 9:30 PM'
  },
  {
    id: 'ctg_patenga_oxygen',
    name: 'Patenga–Oxygen (Express)',
    bnName: 'পতেঙ্গা–অক্সিজেন',
    routeString: 'Patenga ⇄ Oxygen',
    stops: ['patenga', 'cepz', 'two_no_gate', 'agrabad', 'gec_circle', 'muradpur', 'oxygen'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ctg_chandgaon_agrabad',
    name: 'Chandgaon–Agrabad',
    bnName: 'চান্দগাঁও–আগ্রাবাদ',
    routeString: 'Chandgaon ⇄ Agrabad',
    stops: ['chandgaon', 'khulshi', 'gec_circle', 'lalkhan_bazar', 'dampara', 'agrabad'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'ctg_brtc_city',
    name: 'BRTC Ctg City',
    bnName: 'বিআরটিসি চট্টগ্রাম সিটি',
    routeString: 'Dampara ⇄ Oxygen',
    stops: ['dampara', 'kotwali_ctg', 'agrabad', 'lalkhan_bazar', 'gec_circle', 'sholoshahar', 'muradpur', 'oxygen'],
    type: 'Double-Decker',
    hours: '7:00 AM - 9:00 PM'
  },

  // === SYLHET CITY BUS ROUTES ===
  {
    id: 'syl_ambarkhana_tilagor',
    name: 'Ambarkhana–Tilagor',
    bnName: 'আম্বরখানা–তিলাগড়',
    routeString: 'Ambarkhana ⇄ Tilagor',
    stops: ['ambarkhana', 'pathantula', 'chouhatta', 'dorgah_gate', 'uposhohor_syl', 'tilagor'],
    type: 'Local',
    hours: '6:30 AM - 9:30 PM'
  },
  {
    id: 'syl_zindabazar_shibganj',
    name: 'Zindabazar–Shibganj',
    bnName: 'জিন্দাবাজার–শিবগঞ্জ',
    routeString: 'Zindabazar ⇄ Shibganj',
    stops: ['zindabazar', 'kazir_bazar', 'bondor_bazar_syl', 'taltola_syl', 'ambarkhana', 'chouhatta', 'dorgah_gate', 'kumarpara_syl', 'medical_syl', 'tilagor', 'shibganj_syl'],
    type: 'Local',
    hours: '6:30 AM - 9:30 PM'
  },
  {
    id: 'syl_airport_city',
    name: 'Airport–Zindabazar',
    bnName: 'বিমানবন্দর–জিন্দাবাজার',
    routeString: 'Airport ⇄ Zindabazar',
    stops: ['airport_syl', 'shibganj_syl', 'tilagor', 'medical_syl', 'ambarkhana', 'chouhatta', 'taltola_syl', 'zindabazar'],
    type: 'Semi-Sitting',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'syl_kumarpara_tilagor',
    name: 'Kumarpara–Tilagor',
    bnName: 'কুমারপাড়া–তিলাগড়',
    routeString: 'Kumarpara ⇄ Tilagor',
    stops: ['kumarpara_syl', 'uposhohor_syl', 'chouhatta', 'dorgah_gate', 'tilagor'],
    type: 'Local',
    hours: '6:30 AM - 9:00 PM'
  },

  // === RAJSHAHI CITY BUS ROUTES ===
  {
    id: 'raj_shaheb_bazar_upashahar',
    name: 'Shaheb Bazar–Upashahar',
    bnName: 'সাহেব বাজার–উপশহর',
    routeString: 'Shaheb Bazar ⇄ Upashahar',
    stops: ['shaheb_bazar', 'loco_shed_raj', 'zero_point_raj', 'court_raj', 'new_market_raj', 'upashahar_raj'],
    type: 'Local',
    hours: '6:30 AM - 9:30 PM'
  },
  {
    id: 'raj_shaheb_bazar_ghoramara',
    name: 'Shaheb Bazar–Ghoramara',
    bnName: 'সাহেব বাজার–ঘোড়ামারা',
    routeString: 'Shaheb Bazar ⇄ Ghoramara',
    stops: ['shaheb_bazar', 'loco_shed_raj', 'zero_point_raj', 'rajpara', 'ghoramara'],
    type: 'Local',
    hours: '6:30 AM - 9:30 PM'
  },
  {
    id: 'raj_station_upashahar',
    name: 'Station–Upashahar',
    bnName: 'স্টেশন–উপশহর',
    routeString: 'Rajshahi Station ⇄ Upashahar',
    stops: ['raj_station', 'rajpara', 'court_raj', 'zero_point_raj', 'shaheb_bazar', 'loco_shed_raj', 'new_market_raj', 'upashahar_raj'],
    type: 'Local',
    hours: '6:30 AM - 9:00 PM'
  },

  // === KHULNA CITY BUS ROUTES ===
  {
    id: 'khu_rupsha_daulatpur',
    name: 'Rupsha–Daulatpur',
    bnName: 'রূপসা–দৌলতপুর',
    routeString: 'Rupsha ⇄ Daulatpur',
    stops: ['rupsha', 'boyra', 'new_market_khu', 'khulna_station', 'majhirghat', 'khu_bus_terminal', 'sonadanga', 'khalishpur', 'daulatpur'],
    type: 'Local',
    hours: '6:00 AM - 10:00 PM'
  },
  {
    id: 'khu_new_market_shiromoni',
    name: 'New Market–Shiromoni',
    bnName: 'নিউ মার্কেট–শিরোমণি',
    routeString: 'New Market ⇄ Shiromoni',
    stops: ['new_market_khu', 'majhirghat', 'sonadanga', 'khalishpur', 'shiromoni'],
    type: 'Local',
    hours: '6:30 AM - 9:30 PM'
  },
  {
    id: 'khu_station_khalishpur',
    name: 'Station–Khalishpur',
    bnName: 'স্টেশন–খালিশপুর',
    routeString: 'Khulna Station ⇄ Khalishpur',
    stops: ['khulna_station', 'khu_bus_terminal', 'sonadanga', 'khalishpur'],
    type: 'Local',
    hours: '6:30 AM - 9:30 PM'
  },

  // === BARISAL CITY BUS ROUTES ===
  {
    id: 'bsl_launch_rupatali',
    name: 'Launch Terminal–Rupatali',
    bnName: 'লঞ্চ টার্মিনাল–রুপাতলী',
    routeString: 'Launch Terminal ⇄ Rupatali',
    stops: ['bsl_launch', 'band_road', 'natuabazar', 'sadar_hosp_bsl', 'bsl_college', 'bsl_stadium', 'amtala_bsl', 'rupatali'],
    type: 'Local',
    hours: '7:00 AM - 9:00 PM'
  },
  {
    id: 'bsl_band_road_rupatali',
    name: 'Band Road–Rupatali',
    bnName: 'ব্যান্ড রোড–রুপাতলী',
    routeString: 'Band Road ⇄ Rupatali',
    stops: ['band_road', 'natuabazar', 'sadar_hosp_bsl', 'bsl_college', 'amtala_bsl', 'rupatali'],
    type: 'Local',
    hours: '7:00 AM - 8:30 PM'
  },

  // === MYMENSINGH CITY BUS ROUTES ===
  {
    id: 'mym_station_agri_univ',
    name: 'Mym Station–Agri Univ',
    bnName: 'ময়মনসিংহ স্টেশন–কৃষি বিশ্ববিদ্যালয়',
    routeString: 'Mym Station ⇄ Agri University',
    stops: ['mym_station', 'town_hall_mym', 'notun_bazar_mym', 'ganginarpar', 'agri_univ_mym'],
    type: 'Local',
    hours: '7:00 AM - 9:00 PM'
  },
  {
    id: 'mym_maskanda_town_hall',
    name: 'Maskanda–Town Hall',
    bnName: 'মাসকান্দা–টাউন হল',
    routeString: 'Maskanda ⇄ Town Hall',
    stops: ['maskanda', 'charpara_mym', 'notun_bazar_mym', 'town_hall_mym', 'mym_station'],
    type: 'Local',
    hours: '7:00 AM - 8:30 PM'
  },

  // === RANGPUR CITY BUS ROUTES ===
  {
    id: 'rng_zero_point_modern',
    name: 'Zero Point–Modern More',
    bnName: 'জিরো পয়েন্ট–মডার্ন মোড়',
    routeString: 'Zero Point ⇄ Modern More',
    stops: ['rng_bus_stand', 'zero_point_rng', 'jail_mohar', 'shapla_chattar', 'dhap', 'modern_more', 'medical_rng'],
    type: 'Local',
    hours: '7:00 AM - 9:00 PM'
  },
  {
    id: 'rng_station_modern',
    name: 'Rng Station–Modern More',
    bnName: 'রংপুর স্টেশন–মডার্ন মোড়',
    routeString: 'Rangpur Station ⇄ Modern More',
    stops: ['rng_station', 'rng_bus_stand', 'zero_point_rng', 'shapla_chattar', 'dhap', 'modern_more'],
    type: 'Local',
    hours: '7:00 AM - 9:00 PM'
  }
];

export const METRO_STATIONS: Record<string, MetroStation> = {
  'uttara_north': {
    id: 'uttara_north',
    name: 'Uttara North Metro Station',
    bnName: 'উত্তরা উত্তর',
    lat: 23.8693,
    lng: 90.3675,
    distanceFromStart: 0.0,
    description: 'Near Diabari, residential areas, and local markets'
  },
  'uttara_center': {
    id: 'uttara_center',
    name: 'Uttara Center Metro Station',
    bnName: 'উত্তরা কেন্দ্র',
    lat: 23.8587,
    lng: 90.3702,
    distanceFromStart: 1.2,
    description: 'Central Uttara, close to Rajuk College, commercial areas, and shopping centers'
  },
  'uttara_south': {
    id: 'uttara_south',
    name: 'Uttara South Metro Station',
    bnName: 'উত্তরা দক্ষিণ',
    lat: 23.8512,
    lng: 90.3727,
    distanceFromStart: 2.2,
    description: 'Near Uttara Sector 10 & 12, residential areas, schools, and local markets'
  },
  'pallabi': {
    id: 'pallabi',
    name: 'Pallabi Metro Station',
    bnName: 'পল্লবী',
    lat: 23.8329,
    lng: 90.3694,
    distanceFromStart: 3.8,
    description: 'Pallabi area, residential zones, local markets, and bus stands'
  },
  'mirpur_11': {
    id: 'mirpur_11',
    name: 'Mirpur 11 Metro Station',
    bnName: 'মিরপুর ১১',
    lat: 23.8207,
    lng: 90.3672,
    distanceFromStart: 4.8,
    description: 'Mirpur Section 11, residential areas, markets, and educational institutions'
  },
  'mirpur_10': {
    id: 'mirpur_10',
    name: 'Mirpur 10 Metro Station',
    bnName: 'মিরপুর ১০',
    lat: 23.8069,
    lng: 90.3683,
    distanceFromStart: 5.9,
    description: 'Mirpur Section 10 roundabout, major bus stop, shopping areas, banks, and restaurants'
  },
  'kazipara': {
    id: 'kazipara',
    name: 'Kazipara Metro Station',
    bnName: 'কাজীপাড়া',
    lat: 23.7995,
    lng: 90.3725,
    distanceFromStart: 7.0,
    description: 'Kazipara area, residential zones, local markets, and mosques'
  },
  'shewrapara': {
    id: 'shewrapara',
    name: 'Shewrapara Metro Station',
    bnName: 'শেওড়াপাড়া',
    lat: 23.7924,
    lng: 90.3756,
    distanceFromStart: 8.0,
    description: 'Shewrapara area, residential zones, markets, and bus stops'
  },
  'agargaon': {
    id: 'agargaon',
    name: 'Agargaon Metro Station',
    bnName: 'আগারগাঁও',
    lat: 23.7784,
    lng: 90.3802,
    distanceFromStart: 9.2,
    description: 'Agargaon area, government offices (IDB Bhaban, Election Commission), hospitals (NICVD), and bus stops'
  },
  'bijoy_sarani': {
    id: 'bijoy_sarani',
    name: 'Bijoy Sarani Metro Station',
    bnName: 'বিজয় সরণি',
    lat: 23.7709,
    lng: 90.3873,
    distanceFromStart: 10.8,
    description: 'Near Military Museum, banks, offices, and well-connected road junctions'
  },
  'farmgate': {
    id: 'farmgate',
    name: 'Farmgate Metro Station',
    bnName: 'ফার্মগেট',
    lat: 23.7578,
    lng: 90.3912,
    distanceFromStart: 11.9,
    description: 'Major commercial and transit hub, Farmgate Bus Terminal, shopping malls, banks, hospitals, offices, and restaurants'
  },
  'karwan_bazar': {
    id: 'karwan_bazar',
    name: 'Karwan Bazar Metro Station',
    bnName: 'কারওয়ান বাজার',
    lat: 23.7516,
    lng: 90.3934,
    distanceFromStart: 13.0,
    description: 'Largest wholesale market in Dhaka, corporate offices, banks, shopping complexes, and eateries'
  },
  'shahbagh': {
    id: 'shahbagh',
    name: 'Shahbagh Metro Station',
    bnName: 'শাহবাগ',
    lat: 23.7389,
    lng: 90.3965,
    distanceFromStart: 14.1,
    description: 'Dhaka Medical College Hospital, University of Dhaka vicinity, National Museum, banks, bookstores, cafes, and government offices'
  },
  'dhaka_university': {
    id: 'dhaka_university',
    name: 'Dhaka University Metro Station',
    bnName: 'ঢাকা বিশ্ববিদ্যালয়',
    lat: 23.7325,
    lng: 90.3958,
    distanceFromStart: 15.3,
    description: 'Main campus of University of Dhaka, academic buildings, libraries, cultural centers, bookstores, cafes, and banks'
  },
  'bangladesh_secretariat': {
    id: 'bangladesh_secretariat',
    name: 'Bangladesh Secretariat',
    bnName: 'বাংলাদেশ সচিবালয়',
    lat: 23.7282,
    lng: 90.4045,
    distanceFromStart: 16.4,
    description: 'Government administrative offices, banks, business centers, and nearby shops and eateries'
  },
  'motijheel': {
    id: 'motijheel',
    name: 'Motijheel Metro Station',
    bnName: 'মতিঝিল',
    lat: 23.7270,
    lng: 90.4132,
    distanceFromStart: 17.5,
    description: "Dhaka's central business district, headquarters of major banks, corporate offices, shopping malls, financial institutions, and restaurants"
  }
};

// Metro Lines
export const METRO_LINES: Record<string, MetroLine> = {
  'mrt6': {
    id: 'mrt6',
    name: 'MRT Line 6',
    bnName: 'এমআরটি লাইন ৬',
    stations: [
      'uttara_north',
      'uttara_center',
      'uttara_south',
      'pallabi',
      'mirpur_11',
      'mirpur_10',
      'kazipara',
      'shewrapara',
      'agargaon',
      'bijoy_sarani',
      'farmgate',
      'karwan_bazar',
      'shahbagh',
      'dhaka_university',
      'bangladesh_secretariat',
      'motijheel'
    ],
    color: '#00A651' // Metro green color
  }
};

// Railway Stations
export const RAILWAY_STATIONS: Record<string, MetroStation> = {
  'kamalapur': {
    id: 'kamalapur',
    name: 'Kamalapur Railway Station',
    bnName: 'কমলাপুর রেলওয়ে স্টেশন',
    lat: 23.7333191,
    lng: 90.4265487,
    description: 'Main railway station in Dhaka, connects to all major cities'
  },
  'tejgaon_railway': {
    id: 'tejgaon_railway',
    name: 'Tejgaon Railway Station',
    bnName: 'তেজগাঁও রেলওয়ে স্টেশন',
    lat: 23.7601822,
    lng: 90.3947722,
    description: 'Railway station in Tejgaon industrial area'
  },
  'airport_railway': {
    id: 'airport_railway',
    name: 'Dhaka Airport Railway Station',
    bnName: 'ঢাকা বিমানবন্দর রেলওয়ে স্টেশন',
    lat: 23.8518873,
    lng: 90.4081706,
    description: 'Railway station near Hazrat Shahjalal International Airport'
  },
  'tongi_junction': {
    id: 'tongi_junction',
    name: 'Tongi Junction',
    bnName: 'টঙ্গী জংশন',
    lat: 23.89859,
    lng: 90.4084504,
    description: 'Major railway junction connecting northern routes'
  },
  'banani_railway': {
    id: 'banani_railway',
    name: 'Banani Railway Station',
    bnName: 'বনানী রেলওয়ে স্টেশন',
    lat: 23.79558,
    lng: 90.400856,
    description: 'Railway station in Banani diplomatic zone'
  },
  'cantonment_railway': {
    id: 'cantonment_railway',
    name: 'Dhaka Cantonment Railway Station',
    bnName: 'ঢাকা ক্যান্টনমেন্ট রেলওয়ে স্টেশন',
    lat: 23.81557,
    lng: 90.41036,
    description: 'Railway station in Dhaka Cantonment area'
  },
  'gandaria_railway': {
    id: 'gandaria_railway',
    name: 'Gandaria Railway Station',
    bnName: 'গেন্ডারিয়া রেলওয়ে স্টেশন',
    lat: 23.7014878,
    lng: 90.4289931,
    description: 'Railway station in Gandaria residential area'
  }
};

// Airports
export const AIRPORTS: Record<string, MetroStation> = {
  'tejgaon_airport': {
    id: 'tejgaon_airport',
    name: 'Tejgaon Airport',
    bnName: 'তেজগাঁও বিমানবন্দর',
    lat: 23.7803181,
    lng: 90.3821504,
    description: 'Domestic airport in Tejgaon area'
  },
  'shahjalal_airport': {
    id: 'shahjalal_airport',
    name: 'Hazrat Shahjalal International Airport',
    bnName: 'হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর',
    lat: 23.8434344,
    lng: 90.4029252,
    description: 'Main international airport of Bangladesh'
  },
  'shah_amanat_airport': {
    id: 'shah_amanat_airport',
    name: 'Shah Amanat International Airport (Chittagong)',
    bnName: 'শাহ আমানত আন্তর্জাতিক বিমানবন্দর (চট্টগ্রাম)',
    lat: 22.2496,
    lng: 91.8133,
    description: 'International airport serving Chittagong'
  },
  'osmani_airport': {
    id: 'osmani_airport',
    name: 'Osmani International Airport (Sylhet)',
    bnName: 'ওসমানী আন্তর্জাতিক বিমানবন্দর (সিলেট)',
    lat: 24.9591,
    lng: 91.8670,
    description: 'International airport serving Sylhet'
  },
  'coxs_bazar_airport': {
    id: 'coxs_bazar_airport',
    name: "Cox's Bazar Airport",
    bnName: 'কক্সবাজার বিমানবন্দর',
    lat: 21.4522,
    lng: 91.9639,
    description: "Airport serving Cox's Bazar"
  },
  'jessore_airport': {
    id: 'jessore_airport',
    name: 'Jessore Airport (Jashore)',
    bnName: 'যশোর বিমানবন্দর',
    lat: 23.1838,
    lng: 89.1608,
    description: 'Airport serving Jessore / Jashore'
  },
  'saidpur_airport': {
    id: 'saidpur_airport',
    name: 'Saidpur Airport',
    bnName: 'সৈয়দপুর বিমানবন্দর',
    lat: 25.7592,
    lng: 88.9088,
    description: 'Airport serving Saidpur and Rangpur division'
  },
  'barisal_airport': {
    id: 'barisal_airport',
    name: 'Barisal Airport',
    bnName: 'বরিশাল বিমানবন্দর',
    lat: 22.8010,
    lng: 90.3012,
    description: 'Airport serving Barishal'
  },
  'rajshahi_airport': {
    id: 'rajshahi_airport',
    name: 'Shah Makhdum Airport (Rajshahi)',
    bnName: 'শাহ মখদুম বিমানবন্দর (রাজশাহী)',
    lat: 24.4371,
    lng: 88.6161,
    description: 'Airport serving Rajshahi'
  }
};
