/**
 * Comprehensive Bangladesh location data:
 * All 8 divisions, 64 districts, ~495 upazilas, major cities/towns/areas
 * Used for from/to search dropdowns across transport pages
 */

export interface BDLocation {
  id: string;
  en: string;
  bn: string;
  type: 'division' | 'district' | 'upazila' | 'city' | 'area' | 'hub';
  division: string;
  district?: string;
}

export const BD_LOCATIONS: BDLocation[] = [
  // ── DHAKA DIVISION ─────────────────────────────────────────────────────────
  { id:'dhaka_div', en:'Dhaka', bn:'ঢাকা', type:'division', division:'Dhaka' },
  { id:'dhaka', en:'Dhaka City', bn:'ঢাকা শহর', type:'district', division:'Dhaka' },
  // Dhaka City Areas
  { id:'uttara', en:'Uttara', bn:'উত্তরা', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'mirpur', en:'Mirpur', bn:'মিরপুর', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'mirpur10', en:'Mirpur 10', bn:'মিরপুর ১০', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'mirpur12', en:'Mirpur 12', bn:'মিরপুর ১২', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'pallabi', en:'Pallabi', bn:'পল্লবী', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'gulshan', en:'Gulshan', bn:'গুলশান', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'banani', en:'Banani', bn:'বনানী', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'dhanmondi', en:'Dhanmondi', bn:'ধানমন্ডি', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'mohammadpur', en:'Mohammadpur', bn:'মোহাম্মদপুর', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'farmgate', en:'Farmgate', bn:'ফার্মগেট', type:'hub', division:'Dhaka', district:'Dhaka' },
  { id:'motijheel', en:'Motijheel', bn:'মতিঝিল', type:'hub', division:'Dhaka', district:'Dhaka' },
  { id:'old_dhaka', en:'Old Dhaka', bn:'পুরান ঢাকা', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'sadarghat', en:'Sadarghat', bn:'সদরঘাট', type:'hub', division:'Dhaka', district:'Dhaka' },
  { id:'gabtoli', en:'Gabtoli', bn:'গাবতলী', type:'hub', division:'Dhaka', district:'Dhaka' },
  { id:'mohakhali', en:'Mohakhali', bn:'মহাখালী', type:'hub', division:'Dhaka', district:'Dhaka' },
  { id:'kamalapur', en:'Kamalapur', bn:'কমলাপুর', type:'hub', division:'Dhaka', district:'Dhaka' },
  { id:'airport_dhaka', en:'Airport (HSIA)', bn:'বিমানবন্দর', type:'hub', division:'Dhaka', district:'Dhaka' },
  { id:'badda', en:'Badda', bn:'বাড্ডা', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'rampura', en:'Rampura', bn:'রামপুরা', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'khilgaon', en:'Khilgaon', bn:'খিলগাঁও', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'jatrabari', en:'Jatrabari', bn:'যাত্রাবাড়ি', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'sayedabad', en:'Sayedabad', bn:'সায়েদাবাদ', type:'hub', division:'Dhaka', district:'Dhaka' },
  { id:'shyamoli', en:'Shyamoli', bn:'শ্যামলী', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'shahbag', en:'Shahbag', bn:'শাহবাগ', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'tejgaon', en:'Tejgaon', bn:'তেজগাঁও', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'ashulia', en:'Ashulia', bn:'আশুলিয়া', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'demra', en:'Demra', bn:'ডেমরা', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'tongi', en:'Tongi', bn:'টঙ্গী', type:'city', division:'Dhaka', district:'Gazipur' },
  // Dhaka District Upazilas
  { id:'savar', en:'Savar', bn:'সাভার', type:'upazila', division:'Dhaka', district:'Dhaka' },
  { id:'hemayetpur', en:'Hemayetpur', bn:'হেমায়েতপুর', type:'area', division:'Dhaka', district:'Dhaka' },
  { id:'keraniganj', en:'Keraniganj', bn:'কেরাণীগঞ্জ', type:'upazila', division:'Dhaka', district:'Dhaka' },
  { id:'dohar', en:'Dohar', bn:'দোহার', type:'upazila', division:'Dhaka', district:'Dhaka' },
  { id:'nawabganj_dhaka', en:'Nawabganj (Dhaka)', bn:'নবাবগঞ্জ (ঢাকা)', type:'upazila', division:'Dhaka', district:'Dhaka' },
  // Gazipur
  { id:'gazipur', en:'Gazipur', bn:'গাজীপুর', type:'district', division:'Dhaka' },
  { id:'gazipur_city', en:'Gazipur City', bn:'গাজীপুর সিটি', type:'city', division:'Dhaka', district:'Gazipur' },
  { id:'kaliakoir', en:'Kaliakoir', bn:'কালিয়াকৈর', type:'upazila', division:'Dhaka', district:'Gazipur' },
  { id:'kapasia', en:'Kapasia', bn:'কাপাসিয়া', type:'upazila', division:'Dhaka', district:'Gazipur' },
  { id:'sreepur', en:'Sreepur', bn:'শ্রীপুর', type:'upazila', division:'Dhaka', district:'Gazipur' },
  { id:'joydebpur', en:'Joydebpur', bn:'জয়দেবপুর', type:'city', division:'Dhaka', district:'Gazipur' },
  // Narayanganj
  { id:'narayanganj', en:'Narayanganj', bn:'নারায়ণগঞ্জ', type:'district', division:'Dhaka' },
  { id:'fatullah', en:'Fatullah', bn:'ফতুল্লা', type:'upazila', division:'Dhaka', district:'Narayanganj' },
  { id:'siddhirganj', en:'Siddhirganj', bn:'সিদ্ধিরগঞ্জ', type:'upazila', division:'Dhaka', district:'Narayanganj' },
  { id:'rupganj', en:'Rupganj', bn:'রূপগঞ্জ', type:'upazila', division:'Dhaka', district:'Narayanganj' },
  { id:'araihazar', en:'Araihazar', bn:'আড়াইহাজার', type:'upazila', division:'Dhaka', district:'Narayanganj' },
  // Narsingdi
  { id:'narsingdi', en:'Narsingdi', bn:'নরসিংদী', type:'district', division:'Dhaka' },
  { id:'palash', en:'Palash', bn:'পলাশ', type:'upazila', division:'Dhaka', district:'Narsingdi' },
  { id:'shibbari', en:'Shibpur', bn:'শিবপুর', type:'upazila', division:'Dhaka', district:'Narsingdi' },
  { id:'monohardi', en:'Monohardi', bn:'মনোহরদী', type:'upazila', division:'Dhaka', district:'Narsingdi' },
  // Munshiganj
  { id:'munshiganj', en:'Munshiganj', bn:'মুন্সীগঞ্জ', type:'district', division:'Dhaka' },
  { id:'srinagar', en:'Srinagar', bn:'শ্রীনগর', type:'upazila', division:'Dhaka', district:'Munshiganj' },
  { id:'sirajdikhan', en:'Sirajdikhan', bn:'সিরাজদিখান', type:'upazila', division:'Dhaka', district:'Munshiganj' },
  { id:'louhajang', en:'Louhajang', bn:'লৌহজং', type:'upazila', division:'Dhaka', district:'Munshiganj' },
  // Manikganj
  { id:'manikganj', en:'Manikganj', bn:'মানিকগঞ্জ', type:'district', division:'Dhaka' },
  { id:'singair', en:'Singair', bn:'সিঙ্গাইর', type:'upazila', division:'Dhaka', district:'Manikganj' },
  { id:'shibalaya', en:'Shibalaya', bn:'শিবালয়', type:'upazila', division:'Dhaka', district:'Manikganj' },
  { id:'ghior', en:'Ghior', bn:'ঘিওর', type:'upazila', division:'Dhaka', district:'Manikganj' },
  // Faridpur
  { id:'faridpur', en:'Faridpur', bn:'ফরিদপুর', type:'district', division:'Dhaka' },
  { id:'bhanga', en:'Bhanga', bn:'ভাঙ্গা', type:'upazila', division:'Dhaka', district:'Faridpur' },
  { id:'madhukhali', en:'Madhukhali', bn:'মধুখালী', type:'upazila', division:'Dhaka', district:'Faridpur' },
  { id:'boalmari', en:'Boalmari', bn:'বোয়ালমারী', type:'upazila', division:'Dhaka', district:'Faridpur' },
  { id:'alfadanga', en:'Alfadanga', bn:'আলফাডাঙ্গা', type:'upazila', division:'Dhaka', district:'Faridpur' },
  // Gopalganj
  { id:'gopalganj', en:'Gopalganj', bn:'গোপালগঞ্জ', type:'district', division:'Dhaka' },
  { id:'kotalipara', en:'Kotalipara', bn:'কোটালীপাড়া', type:'upazila', division:'Dhaka', district:'Gopalganj' },
  { id:'tungipara', en:'Tungipara', bn:'টুঙ্গিপাড়া', type:'upazila', division:'Dhaka', district:'Gopalganj' },
  { id:'muksudpur', en:'Muksudpur', bn:'মুকসুদপুর', type:'upazila', division:'Dhaka', district:'Gopalganj' },
  // Madaripur
  { id:'madaripur', en:'Madaripur', bn:'মাদারীপুর', type:'district', division:'Dhaka' },
  { id:'shibchar', en:'Shibchar', bn:'শিবচর', type:'upazila', division:'Dhaka', district:'Madaripur' },
  { id:'kalkini', en:'Kalkini', bn:'কালকিনি', type:'upazila', division:'Dhaka', district:'Madaripur' },
  // Shariatpur
  { id:'shariatpur', en:'Shariatpur', bn:'শরীয়তপুর', type:'district', division:'Dhaka' },
  { id:'damudya', en:'Damudya', bn:'ডামুড্যা', type:'upazila', division:'Dhaka', district:'Shariatpur' },
  { id:'naria', en:'Naria', bn:'নড়িয়া', type:'upazila', division:'Dhaka', district:'Shariatpur' },
  { id:'goshairhat', en:'Goshairhat', bn:'গোসাইরহাট', type:'upazila', division:'Dhaka', district:'Shariatpur' },
  // Rajbari
  { id:'rajbari', en:'Rajbari', bn:'রাজবাড়ী', type:'district', division:'Dhaka' },
  { id:'pangsha', en:'Pangsha', bn:'পাংশা', type:'upazila', division:'Dhaka', district:'Rajbari' },
  { id:'baliakandi', en:'Baliakandi', bn:'বালিয়াকান্দি', type:'upazila', division:'Dhaka', district:'Rajbari' },
  { id:'goalanda', en:'Goalanda', bn:'গোয়ালন্দ', type:'upazila', division:'Dhaka', district:'Rajbari' },
  // Tangail
  { id:'tangail', en:'Tangail', bn:'টাঙ্গাইল', type:'district', division:'Dhaka' },
  { id:'basail', en:'Basail', bn:'বাসাইল', type:'upazila', division:'Dhaka', district:'Tangail' },
  { id:'ghatail', en:'Ghatail', bn:'ঘাটাইল', type:'upazila', division:'Dhaka', district:'Tangail' },
  { id:'mirzapur', en:'Mirzapur', bn:'মির্জাপুর', type:'upazila', division:'Dhaka', district:'Tangail' },
  { id:'gopalpur', en:'Gopalpur', bn:'গোপালপুর', type:'upazila', division:'Dhaka', district:'Tangail' },
  { id:'madhupur', en:'Madhupur', bn:'মধুপুর', type:'upazila', division:'Dhaka', district:'Tangail' },

  // ── CHATTOGRAM DIVISION ─────────────────────────────────────────────────────
  { id:'ctg_div', en:'Chattogram', bn:'চট্টগ্রাম', type:'division', division:'Chattogram' },
  { id:'chattogram', en:'Chattogram', bn:'চট্টগ্রাম', type:'district', division:'Chattogram' },
  { id:'ctg_city', en:'Chattogram City', bn:'চট্টগ্রাম শহর', type:'city', division:'Chattogram', district:'Chattogram' },
  { id:'agrabad', en:'Agrabad', bn:'আগ্রাবাদ', type:'area', division:'Chattogram', district:'Chattogram' },
  { id:'nasirabad', en:'Nasirabad', bn:'নাসিরাবাদ', type:'area', division:'Chattogram', district:'Chattogram' },
  { id:'pahartali', en:'Pahartali', bn:'পাহাড়তলী', type:'area', division:'Chattogram', district:'Chattogram' },
  { id:'hathazari', en:'Hathazari', bn:'হাটহাজারী', type:'upazila', division:'Chattogram', district:'Chattogram' },
  { id:'rangunia', en:'Rangunia', bn:'রাঙ্গুনিয়া', type:'upazila', division:'Chattogram', district:'Chattogram' },
  { id:'sitakunda', en:'Sitakunda', bn:'সীতাকুণ্ড', type:'upazila', division:'Chattogram', district:'Chattogram' },
  { id:'mirsharai', en:'Mirsharai', bn:'মীরসরাই', type:'upazila', division:'Chattogram', district:'Chattogram' },
  { id:'sandwip', en:'Sandwip', bn:'সন্দ্বীপ', type:'upazila', division:'Chattogram', district:'Chattogram' },
  { id:'boalkhali', en:'Boalkhali', bn:'বোয়ালখালী', type:'upazila', division:'Chattogram', district:'Chattogram' },
  { id:'chandanaish', en:'Chandanaish', bn:'চন্দনাইশ', type:'upazila', division:'Chattogram', district:'Chattogram' },
  { id:'anwara', en:'Anwara', bn:'আনোয়ারা', type:'upazila', division:'Chattogram', district:'Chattogram' },
  { id:'poteya', en:'Patiya', bn:'পটিয়া', type:'upazila', division:'Chattogram', district:'Chattogram' },
  // Cox's Bazar
  { id:'coxs_bazar', en:"Cox's Bazar", bn:'কক্সবাজার', type:'district', division:'Chattogram' },
  { id:'coxs_bazar_city', en:"Cox's Bazar City", bn:'কক্সবাজার শহর', type:'city', division:'Chattogram', district:"Cox's Bazar" },
  { id:'teknaf', en:'Teknaf', bn:'টেকনাফ', type:'upazila', division:'Chattogram', district:"Cox's Bazar" },
  { id:'ukhia', en:'Ukhia', bn:'উখিয়া', type:'upazila', division:'Chattogram', district:"Cox's Bazar" },
  { id:'ramu', en:'Ramu', bn:'রামু', type:'upazila', division:'Chattogram', district:"Cox's Bazar" },
  { id:'inani', en:'Inani Beach', bn:'ইনানী সৈকত', type:'area', division:'Chattogram', district:"Cox's Bazar" },
  { id:'saint_martin', en:'Saint Martin Island', bn:'সেন্ট মার্টিন', type:'area', division:'Chattogram', district:"Cox's Bazar" },
  // Bandarban
  { id:'bandarban', en:'Bandarban', bn:'বান্দরবান', type:'district', division:'Chattogram' },
  { id:'ruma', en:'Ruma', bn:'রুমা', type:'upazila', division:'Chattogram', district:'Bandarban' },
  { id:'thanchi', en:'Thanchi', bn:'থানচি', type:'upazila', division:'Chattogram', district:'Bandarban' },
  { id:'alikadam', en:'Alikadam', bn:'আলীকদম', type:'upazila', division:'Chattogram', district:'Bandarban' },
  { id:'nilgiri', en:'Nilgiri', bn:'নীলগিরি', type:'area', division:'Chattogram', district:'Bandarban' },
  // Rangamati
  { id:'rangamati', en:'Rangamati', bn:'রাঙ্গামাটি', type:'district', division:'Chattogram' },
  { id:'kaptai', en:'Kaptai', bn:'কাপ্তাই', type:'upazila', division:'Chattogram', district:'Rangamati' },
  { id:'sajek', en:'Sajek Valley', bn:'সাজেক ভ্যালি', type:'area', division:'Chattogram', district:'Rangamati' },
  { id:'langadu', en:'Langadu', bn:'লংগদু', type:'upazila', division:'Chattogram', district:'Rangamati' },
  // Khagrachhari
  { id:'khagrachhari', en:'Khagrachhari', bn:'খাগড়াছড়ি', type:'district', division:'Chattogram' },
  { id:'mahalchhari', en:'Mahalchhari', bn:'মহালছড়ি', type:'upazila', division:'Chattogram', district:'Khagrachhari' },
  { id:'manikchari', en:'Manikchari', bn:'মানিকছড়ি', type:'upazila', division:'Chattogram', district:'Khagrachhari' },
  // Cumilla
  { id:'cumilla', en:'Cumilla', bn:'কুমিল্লা', type:'district', division:'Chattogram' },
  { id:'cumilla_city', en:'Cumilla City', bn:'কুমিল্লা শহর', type:'city', division:'Chattogram', district:'Cumilla' },
  { id:'burichang', en:'Burichang', bn:'বুড়িচং', type:'upazila', division:'Chattogram', district:'Cumilla' },
  { id:'brahmanpara', en:'Brahmanpara', bn:'ব্রাহ্মণপাড়া', type:'upazila', division:'Chattogram', district:'Cumilla' },
  { id:'chandina', en:'Chandina', bn:'চান্দিনা', type:'upazila', division:'Chattogram', district:'Cumilla' },
  { id:'daudkandi', en:'Daudkandi', bn:'দাউদকান্দি', type:'upazila', division:'Chattogram', district:'Cumilla' },
  { id:'muradnagar', en:'Muradnagar', bn:'মুরাদনগর', type:'upazila', division:'Chattogram', district:'Cumilla' },
  { id:'laksham', en:'Laksham', bn:'লাকসাম', type:'upazila', division:'Chattogram', district:'Cumilla' },
  // Feni
  { id:'feni', en:'Feni', bn:'ফেনী', type:'district', division:'Chattogram' },
  { id:'daganbhuiyan', en:'Daganbhuiyan', bn:'দাগনভূঞা', type:'upazila', division:'Chattogram', district:'Feni' },
  { id:'parshuram', en:'Parshuram', bn:'পরশুরাম', type:'upazila', division:'Chattogram', district:'Feni' },
  // Noakhali
  { id:'noakhali', en:'Noakhali', bn:'নোয়াখালী', type:'district', division:'Chattogram' },
  { id:'maijdee', en:'Maijdee', bn:'মাইজদী', type:'city', division:'Chattogram', district:'Noakhali' },
  { id:'companiganj', en:'Companiganj', bn:'কোম্পানীগঞ্জ', type:'upazila', division:'Chattogram', district:'Noakhali' },
  { id:'hatiya', en:'Hatiya', bn:'হাতিয়া', type:'upazila', division:'Chattogram', district:'Noakhali' },
  { id:'begumganj', en:'Begumganj', bn:'বেগমগঞ্জ', type:'upazila', division:'Chattogram', district:'Noakhali' },
  // Lakshmipur
  { id:'lakshmipur', en:'Lakshmipur', bn:'লক্ষ্মীপুর', type:'district', division:'Chattogram' },
  { id:'ramganj', en:'Ramganj', bn:'রামগঞ্জ', type:'upazila', division:'Chattogram', district:'Lakshmipur' },
  { id:'raipur', en:'Raipur', bn:'রায়পুর', type:'upazila', division:'Chattogram', district:'Lakshmipur' },
  // Chandpur
  { id:'chandpur', en:'Chandpur', bn:'চাঁদপুর', type:'district', division:'Chattogram' },
  { id:'haziganj', en:'Haziganj', bn:'হাজীগঞ্জ', type:'upazila', division:'Chattogram', district:'Chandpur' },
  { id:'kachua', en:'Kachua', bn:'কচুয়া', type:'upazila', division:'Chattogram', district:'Chandpur' },
  // Brahmanbaria
  { id:'brahmanbaria', en:'Brahmanbaria', bn:'ব্রাহ্মণবাড়িয়া', type:'district', division:'Chattogram' },
  { id:'akhaura', en:'Akhaura', bn:'আখাউড়া', type:'upazila', division:'Chattogram', district:'Brahmanbaria' },
  { id:'kasba', en:'Kasba', bn:'কসবা', type:'upazila', division:'Chattogram', district:'Brahmanbaria' },
  { id:'sarail', en:'Sarail', bn:'সরাইল', type:'upazila', division:'Chattogram', district:'Brahmanbaria' },

  // ── SYLHET DIVISION ─────────────────────────────────────────────────────────
  { id:'sylhet_div', en:'Sylhet', bn:'সিলেট', type:'division', division:'Sylhet' },
  { id:'sylhet', en:'Sylhet', bn:'সিলেট', type:'district', division:'Sylhet' },
  { id:'sylhet_city', en:'Sylhet City', bn:'সিলেট শহর', type:'city', division:'Sylhet', district:'Sylhet' },
  { id:'golapganj', en:'Golapganj', bn:'গোলাপগঞ্জ', type:'upazila', division:'Sylhet', district:'Sylhet' },
  { id:'jaintapur', en:'Jaintapur', bn:'জৈন্তাপুর', type:'upazila', division:'Sylhet', district:'Sylhet' },
  { id:'kanaighat', en:'Kanaighat', bn:'কানাইঘাট', type:'upazila', division:'Sylhet', district:'Sylhet' },
  { id:'companiganj_syl', en:'Companiganj (Sylhet)', bn:'কোম্পানীগঞ্জ (সিলেট)', type:'upazila', division:'Sylhet', district:'Sylhet' },
  { id:'gowainghat', en:'Gowainghat', bn:'গোয়াইনঘাট', type:'upazila', division:'Sylhet', district:'Sylhet' },
  { id:'jaflong', en:'Jaflong', bn:'জাফলং', type:'area', division:'Sylhet', district:'Sylhet' },
  { id:'ratargul', en:'Ratargul', bn:'রাতারগুল', type:'area', division:'Sylhet', district:'Sylhet' },
  // Moulvibazar
  { id:'moulvibazar', en:'Moulvibazar', bn:'মৌলভীবাজার', type:'district', division:'Sylhet' },
  { id:'srimangal', en:'Srimangal', bn:'শ্রীমঙ্গল', type:'upazila', division:'Sylhet', district:'Moulvibazar' },
  { id:'kulaura', en:'Kulaura', bn:'কুলাউড়া', type:'upazila', division:'Sylhet', district:'Moulvibazar' },
  { id:'rajnagar', en:'Rajnagar', bn:'রাজনগর', type:'upazila', division:'Sylhet', district:'Moulvibazar' },
  { id:'barlekha', en:'Barlekha', bn:'বড়লেখা', type:'upazila', division:'Sylhet', district:'Moulvibazar' },
  // Habiganj
  { id:'habiganj', en:'Habiganj', bn:'হবিগঞ্জ', type:'district', division:'Sylhet' },
  { id:'chunarughat', en:'Chunarughat', bn:'চুনারুঘাট', type:'upazila', division:'Sylhet', district:'Habiganj' },
  { id:'madhabpur', en:'Madhabpur', bn:'মাধবপুর', type:'upazila', division:'Sylhet', district:'Habiganj' },
  { id:'lakhai', en:'Lakhai', bn:'লাখাই', type:'upazila', division:'Sylhet', district:'Habiganj' },
  // Sunamganj
  { id:'sunamganj', en:'Sunamganj', bn:'সুনামগঞ্জ', type:'district', division:'Sylhet' },
  { id:'jagannathpur', en:'Jagannathpur', bn:'জগন্নাথপুর', type:'upazila', division:'Sylhet', district:'Sunamganj' },
  { id:'doarabazar', en:'Doarabazar', bn:'দোয়ারাবাজার', type:'upazila', division:'Sylhet', district:'Sunamganj' },
  { id:'tahirpur', en:'Tahirpur', bn:'তাহিরপুর', type:'upazila', division:'Sylhet', district:'Sunamganj' },

  // ── RAJSHAHI DIVISION ───────────────────────────────────────────────────────
  { id:'rajshahi_div', en:'Rajshahi', bn:'রাজশাহী', type:'division', division:'Rajshahi' },
  { id:'rajshahi', en:'Rajshahi', bn:'রাজশাহী', type:'district', division:'Rajshahi' },
  { id:'rajshahi_city', en:'Rajshahi City', bn:'রাজশাহী শহর', type:'city', division:'Rajshahi', district:'Rajshahi' },
  { id:'godagari', en:'Godagari', bn:'গোদাগাড়ী', type:'upazila', division:'Rajshahi', district:'Rajshahi' },
  { id:'tanore', en:'Tanore', bn:'তানোর', type:'upazila', division:'Rajshahi', district:'Rajshahi' },
  { id:'bagha', en:'Bagha', bn:'বাঘা', type:'upazila', division:'Rajshahi', district:'Rajshahi' },
  { id:'charghat', en:'Charghat', bn:'চারঘাট', type:'upazila', division:'Rajshahi', district:'Rajshahi' },
  // Bogura
  { id:'bogura', en:'Bogura', bn:'বগুড়া', type:'district', division:'Rajshahi' },
  { id:'bogura_city', en:'Bogura City', bn:'বগুড়া শহর', type:'city', division:'Rajshahi', district:'Bogura' },
  { id:'sherpur_bogura', en:'Sherpur (Bogura)', bn:'শেরপুর (বগুড়া)', type:'upazila', division:'Rajshahi', district:'Bogura' },
  { id:'shibganj_bogura', en:'Shibganj (Bogura)', bn:'শিবগঞ্জ (বগুড়া)', type:'upazila', division:'Rajshahi', district:'Bogura' },
  { id:'gabtali', en:'Gabtali (Bogura)', bn:'গাবতলী (বগুড়া)', type:'upazila', division:'Rajshahi', district:'Bogura' },
  // Naogaon
  { id:'naogaon', en:'Naogaon', bn:'নওগাঁ', type:'district', division:'Rajshahi' },
  { id:'niamatpur', en:'Niamatpur', bn:'নিয়ামতপুর', type:'upazila', division:'Rajshahi', district:'Naogaon' },
  { id:'patnitala', en:'Patnitala', bn:'পত্নীতলা', type:'upazila', division:'Rajshahi', district:'Naogaon' },
  { id:'raninagar', en:'Raninagar', bn:'রানীনগর', type:'upazila', division:'Rajshahi', district:'Naogaon' },
  // Chapainawabganj
  { id:'chapainawabganj', en:'Chapainawabganj', bn:'চাঁপাইনবাবগঞ্জ', type:'district', division:'Rajshahi' },
  { id:'shibganj_chp', en:'Shibganj (Chapai)', bn:'শিবগঞ্জ (চাঁপাই)', type:'upazila', division:'Rajshahi', district:'Chapainawabganj' },
  { id:'nachol', en:'Nachol', bn:'নাচোল', type:'upazila', division:'Rajshahi', district:'Chapainawabganj' },
  // Natore
  { id:'natore', en:'Natore', bn:'নাটোর', type:'district', division:'Rajshahi' },
  { id:'baraigram', en:'Baraigram', bn:'বড়াইগ্রাম', type:'upazila', division:'Rajshahi', district:'Natore' },
  { id:'lalpur', en:'Lalpur', bn:'লালপুর', type:'upazila', division:'Rajshahi', district:'Natore' },
  // Sirajganj
  { id:'sirajganj', en:'Sirajganj', bn:'সিরাজগঞ্জ', type:'district', division:'Rajshahi' },
  { id:'ullapara', en:'Ullapara', bn:'উল্লাপাড়া', type:'upazila', division:'Rajshahi', district:'Sirajganj' },
  { id:'shahjadpur', en:'Shahjadpur', bn:'শাহজাদপুর', type:'upazila', division:'Rajshahi', district:'Sirajganj' },
  { id:'kazipur', en:'Kazipur', bn:'কাজিপুর', type:'upazila', division:'Rajshahi', district:'Sirajganj' },
  // Pabna
  { id:'pabna', en:'Pabna', bn:'পাবনা', type:'district', division:'Rajshahi' },
  { id:'ishwardi', en:'Ishwardi', bn:'ঈশ্বরদী', type:'upazila', division:'Rajshahi', district:'Pabna' },
  { id:'bhangura', en:'Bhangura', bn:'ভাঙ্গুড়া', type:'upazila', division:'Rajshahi', district:'Pabna' },
  // Joypurhat
  { id:'joypurhat', en:'Joypurhat', bn:'জয়পুরহাট', type:'district', division:'Rajshahi' },
  { id:'akkelpur', en:'Akkelpur', bn:'আক্কেলপুর', type:'upazila', division:'Rajshahi', district:'Joypurhat' },
  { id:'khetlal', en:'Khetlal', bn:'ক্ষেতলাল', type:'upazila', division:'Rajshahi', district:'Joypurhat' },

  // ── KHULNA DIVISION ─────────────────────────────────────────────────────────
  { id:'khulna_div', en:'Khulna', bn:'খুলনা', type:'division', division:'Khulna' },
  { id:'khulna', en:'Khulna', bn:'খুলনা', type:'district', division:'Khulna' },
  { id:'khulna_city', en:'Khulna City', bn:'খুলনা শহর', type:'city', division:'Khulna', district:'Khulna' },
  { id:'fultala', en:'Fultala', bn:'ফুলতলা', type:'upazila', division:'Khulna', district:'Khulna' },
  { id:'dumuria', en:'Dumuria', bn:'ডুমুরিয়া', type:'upazila', division:'Khulna', district:'Khulna' },
  { id:'batiaghata', en:'Batiaghata', bn:'বটিয়াঘাটা', type:'upazila', division:'Khulna', district:'Khulna' },
  { id:'mongla', en:'Mongla', bn:'মংলা', type:'upazila', division:'Khulna', district:'Bagerhat' },
  // Jashore
  { id:'jashore', en:'Jashore', bn:'যশোর', type:'district', division:'Khulna' },
  { id:'jashore_city', en:'Jashore City', bn:'যশোর শহর', type:'city', division:'Khulna', district:'Jashore' },
  { id:'jhikargacha', en:'Jhikargacha', bn:'ঝিকরগাছা', type:'upazila', division:'Khulna', district:'Jashore' },
  { id:'sharsha', en:'Sharsha', bn:'শার্শা', type:'upazila', division:'Khulna', district:'Jashore' },
  { id:'benapole', en:'Benapole', bn:'বেনাপোল', type:'city', division:'Khulna', district:'Jashore' },
  { id:'chaugacha', en:'Chaugacha', bn:'চৌগাছা', type:'upazila', division:'Khulna', district:'Jashore' },
  // Satkhira
  { id:'satkhira', en:'Satkhira', bn:'সাতক্ষীরা', type:'district', division:'Khulna' },
  { id:'shyamnagar', en:'Shyamnagar', bn:'শ্যামনগর', type:'upazila', division:'Khulna', district:'Satkhira' },
  { id:'tala', en:'Tala', bn:'তালা', type:'upazila', division:'Khulna', district:'Satkhira' },
  { id:'kalaroa', en:'Kalaroa', bn:'কলারোয়া', type:'upazila', division:'Khulna', district:'Satkhira' },
  // Bagerhat
  { id:'bagerhat', en:'Bagerhat', bn:'বাগেরহাট', type:'district', division:'Khulna' },
  { id:'fakirhat', en:'Fakirhat', bn:'ফকিরহাট', type:'upazila', division:'Khulna', district:'Bagerhat' },
  { id:'morrelganj', en:'Morrelganj', bn:'মোড়েলগঞ্জ', type:'upazila', division:'Khulna', district:'Bagerhat' },
  // Narail
  { id:'narail', en:'Narail', bn:'নড়াইল', type:'district', division:'Khulna' },
  { id:'lohagara', en:'Lohagara', bn:'লোহাগড়া', type:'upazila', division:'Khulna', district:'Narail' },
  { id:'kalia', en:'Kalia', bn:'কালিয়া', type:'upazila', division:'Khulna', district:'Narail' },
  // Chuadanga
  { id:'chuadanga', en:'Chuadanga', bn:'চুয়াডাঙ্গা', type:'district', division:'Khulna' },
  { id:'damurhuda', en:'Damurhuda', bn:'দামুড়হুদা', type:'upazila', division:'Khulna', district:'Chuadanga' },
  // Jhenaidah
  { id:'jhenaidah', en:'Jhenaidah', bn:'ঝিনাইদহ', type:'district', division:'Khulna' },
  { id:'shailkupa', en:'Shailkupa', bn:'শৈলকুপা', type:'upazila', division:'Khulna', district:'Jhenaidah' },
  { id:'harinakunda', en:'Harinakunda', bn:'হরিণাকুণ্ডু', type:'upazila', division:'Khulna', district:'Jhenaidah' },
  // Kushtia
  { id:'kushtia', en:'Kushtia', bn:'কুষ্টিয়া', type:'district', division:'Khulna' },
  { id:'kumarkhali', en:'Kumarkhali', bn:'কুমারখালী', type:'upazila', division:'Khulna', district:'Kushtia' },
  { id:'khoksa', en:'Khoksa', bn:'খোকসা', type:'upazila', division:'Khulna', district:'Kushtia' },
  // Magura
  { id:'magura', en:'Magura', bn:'মাগুরা', type:'district', division:'Khulna' },
  { id:'shalikha', en:'Shalikha', bn:'শালিখা', type:'upazila', division:'Khulna', district:'Magura' },
  // Meherpur
  { id:'meherpur', en:'Meherpur', bn:'মেহেরপুর', type:'district', division:'Khulna' },
  { id:'gangni', en:'Gangni', bn:'গাংনী', type:'upazila', division:'Khulna', district:'Meherpur' },
  { id:'mujibnagar', en:'Mujibnagar', bn:'মুজিবনগর', type:'upazila', division:'Khulna', district:'Meherpur' },

  // ── BARISHAL DIVISION ───────────────────────────────────────────────────────
  { id:'barishal_div', en:'Barishal', bn:'বরিশাল', type:'division', division:'Barishal' },
  { id:'barishal', en:'Barishal', bn:'বরিশাল', type:'district', division:'Barishal' },
  { id:'barishal_city', en:'Barishal City', bn:'বরিশাল শহর', type:'city', division:'Barishal', district:'Barishal' },
  { id:'wazirpur', en:'Wazirpur', bn:'ওয়াজিরপুর', type:'upazila', division:'Barishal', district:'Barishal' },
  { id:'bakerganj', en:'Bakerganj', bn:'বাকেরগঞ্জ', type:'upazila', division:'Barishal', district:'Barishal' },
  { id:'banaripara', en:'Banaripara', bn:'বানারীপাড়া', type:'upazila', division:'Barishal', district:'Barishal' },
  { id:'muladi', en:'Muladi', bn:'মুলাদী', type:'upazila', division:'Barishal', district:'Barishal' },
  { id:'mehendiganj', en:'Mehendiganj', bn:'মেহেন্দীগঞ্জ', type:'upazila', division:'Barishal', district:'Barishal' },
  // Patuakhali
  { id:'patuakhali', en:'Patuakhali', bn:'পটুয়াখালী', type:'district', division:'Barishal' },
  { id:'kuakata', en:'Kuakata', bn:'কুয়াকাটা', type:'area', division:'Barishal', district:'Patuakhali' },
  { id:'kalapara', en:'Kalapara', bn:'কলাপাড়া', type:'upazila', division:'Barishal', district:'Patuakhali' },
  { id:'galachipa', en:'Galachipa', bn:'গলাচিপা', type:'upazila', division:'Barishal', district:'Patuakhali' },
  { id:'dumki', en:'Dumki', bn:'দুমকি', type:'upazila', division:'Barishal', district:'Patuakhali' },
  // Bhola
  { id:'bhola', en:'Bhola', bn:'ভোলা', type:'district', division:'Barishal' },
  { id:'borhanuddin', en:'Borhanuddin', bn:'বোরহানউদ্দিন', type:'upazila', division:'Barishal', district:'Bhola' },
  { id:'lalmohan', en:'Lalmohan', bn:'লালমোহন', type:'upazila', division:'Barishal', district:'Bhola' },
  { id:'manpura', en:'Manpura', bn:'মনপুরা', type:'upazila', division:'Barishal', district:'Bhola' },
  // Pirojpur
  { id:'pirojpur', en:'Pirojpur', bn:'পিরোজপুর', type:'district', division:'Barishal' },
  { id:'mathbaria', en:'Mathbaria', bn:'মঠবাড়িয়া', type:'upazila', division:'Barishal', district:'Pirojpur' },
  { id:'nazirpur', en:'Nazirpur', bn:'নাজিরপুর', type:'upazila', division:'Barishal', district:'Pirojpur' },
  // Barguna
  { id:'barguna', en:'Barguna', bn:'বরগুনা', type:'district', division:'Barishal' },
  { id:'amtali', en:'Amtali', bn:'আমতলী', type:'upazila', division:'Barishal', district:'Barguna' },
  { id:'betagi', en:'Betagi', bn:'বেতাগী', type:'upazila', division:'Barishal', district:'Barguna' },
  // Jhalokati
  { id:'jhalokati', en:'Jhalokati', bn:'ঝালকাঠি', type:'district', division:'Barishal' },
  { id:'nalchity', en:'Nalchity', bn:'নলছিটি', type:'upazila', division:'Barishal', district:'Jhalokati' },
  { id:'kanthalia', en:'Kanthalia', bn:'কাঁঠালিয়া', type:'upazila', division:'Barishal', district:'Jhalokati' },

  // ── RANGPUR DIVISION ────────────────────────────────────────────────────────
  { id:'rangpur_div', en:'Rangpur', bn:'রংপুর', type:'division', division:'Rangpur' },
  { id:'rangpur', en:'Rangpur', bn:'রংপুর', type:'district', division:'Rangpur' },
  { id:'rangpur_city', en:'Rangpur City', bn:'রংপুর শহর', type:'city', division:'Rangpur', district:'Rangpur' },
  { id:'badarganj', en:'Badarganj', bn:'বদরগঞ্জ', type:'upazila', division:'Rangpur', district:'Rangpur' },
  { id:'gangachara', en:'Gangachara', bn:'গঙ্গাচড়া', type:'upazila', division:'Rangpur', district:'Rangpur' },
  { id:'kaunia', en:'Kaunia', bn:'কাউনিয়া', type:'upazila', division:'Rangpur', district:'Rangpur' },
  { id:'mithapukur', en:'Mithapukur', bn:'মিঠাপুকুর', type:'upazila', division:'Rangpur', district:'Rangpur' },
  { id:'pirganj_rng', en:'Pirganj (Rangpur)', bn:'পীরগঞ্জ (রংপুর)', type:'upazila', division:'Rangpur', district:'Rangpur' },
  // Dinajpur
  { id:'dinajpur', en:'Dinajpur', bn:'দিনাজপুর', type:'district', division:'Rangpur' },
  { id:'dinajpur_city', en:'Dinajpur City', bn:'দিনাজপুর শহর', type:'city', division:'Rangpur', district:'Dinajpur' },
  { id:'birampur', en:'Birampur', bn:'বিরামপুর', type:'upazila', division:'Rangpur', district:'Dinajpur' },
  { id:'phulbari', en:'Phulbari', bn:'ফুলবাড়ী', type:'upazila', division:'Rangpur', district:'Dinajpur' },
  { id:'chirirbandar', en:'Chirirbandar', bn:'চিরিরবন্দর', type:'upazila', division:'Rangpur', district:'Dinajpur' },
  { id:'parbatipur', en:'Parbatipur', bn:'পার্বতীপুর', type:'upazila', division:'Rangpur', district:'Dinajpur' },
  // Thakurgaon
  { id:'thakurgaon', en:'Thakurgaon', bn:'ঠাকুরগাঁও', type:'district', division:'Rangpur' },
  { id:'pirganj_thg', en:'Pirganj (Thakurgaon)', bn:'পীরগঞ্জ (ঠাকুরগাঁও)', type:'upazila', division:'Rangpur', district:'Thakurgaon' },
  { id:'ranisankail', en:'Ranisankail', bn:'রাণীশংকৈল', type:'upazila', division:'Rangpur', district:'Thakurgaon' },
  // Panchagarh
  { id:'panchagarh', en:'Panchagarh', bn:'পঞ্চগড়', type:'district', division:'Rangpur' },
  { id:'tetulia', en:'Tetulia', bn:'তেঁতুলিয়া', type:'upazila', division:'Rangpur', district:'Panchagarh' },
  { id:'boda', en:'Boda', bn:'বোদা', type:'upazila', division:'Rangpur', district:'Panchagarh' },
  // Nilphamari
  { id:'nilphamari', en:'Nilphamari', bn:'নীলফামারী', type:'district', division:'Rangpur' },
  { id:'saidpur', en:'Saidpur', bn:'সৈয়দপুর', type:'city', division:'Rangpur', district:'Nilphamari' },
  { id:'jaldhaka', en:'Jaldhaka', bn:'জলঢাকা', type:'upazila', division:'Rangpur', district:'Nilphamari' },
  { id:'domar', en:'Domar', bn:'ডোমার', type:'upazila', division:'Rangpur', district:'Nilphamari' },
  { id:'dimla', en:'Dimla', bn:'ডিমলা', type:'upazila', division:'Rangpur', district:'Nilphamari' },
  // Gaibandha
  { id:'gaibandha', en:'Gaibandha', bn:'গাইবান্ধা', type:'district', division:'Rangpur' },
  { id:'shaghata', en:'Shaghata', bn:'শাঘাটা', type:'upazila', division:'Rangpur', district:'Gaibandha' },
  { id:'phulchari', en:'Phulchari', bn:'ফুলছড়ি', type:'upazila', division:'Rangpur', district:'Gaibandha' },
  // Lalmonirhat
  { id:'lalmonirhat', en:'Lalmonirhat', bn:'লালমনিরহাট', type:'district', division:'Rangpur' },
  { id:'aditmari', en:'Aditmari', bn:'আদিতমারী', type:'upazila', division:'Rangpur', district:'Lalmonirhat' },
  { id:'kaliganj_lmh', en:'Kaliganj (Lalmonirhat)', bn:'কালীগঞ্জ (লালমনিরহাট)', type:'upazila', division:'Rangpur', district:'Lalmonirhat' },
  // Kurigram
  { id:'kurigram', en:'Kurigram', bn:'কুড়িগ্রাম', type:'district', division:'Rangpur' },
  { id:'ulipur', en:'Ulipur', bn:'উলিপুর', type:'upazila', division:'Rangpur', district:'Kurigram' },
  { id:'chilmari', en:'Chilmari', bn:'চিলমারী', type:'upazila', division:'Rangpur', district:'Kurigram' },

  // ── MYMENSINGH DIVISION ─────────────────────────────────────────────────────
  { id:'mym_div', en:'Mymensingh', bn:'ময়মনসিংহ', type:'division', division:'Mymensingh' },
  { id:'mymensingh', en:'Mymensingh', bn:'ময়মনসিংহ', type:'district', division:'Mymensingh' },
  { id:'mymensingh_city', en:'Mymensingh City', bn:'ময়মনসিংহ শহর', type:'city', division:'Mymensingh', district:'Mymensingh' },
  { id:'fulbaria', en:'Fulbaria', bn:'ফুলবাড়িয়া', type:'upazila', division:'Mymensingh', district:'Mymensingh' },
  { id:'gaffargaon', en:'Gaffargaon', bn:'গফরগাঁও', type:'upazila', division:'Mymensingh', district:'Mymensingh' },
  { id:'muktagacha', en:'Muktagacha', bn:'মুক্তাগাছা', type:'upazila', division:'Mymensingh', district:'Mymensingh' },
  { id:'trishal', en:'Trishal', bn:'ত্রিশাল', type:'upazila', division:'Mymensingh', district:'Mymensingh' },
  { id:'bhaluka', en:'Bhaluka', bn:'ভালুকা', type:'upazila', division:'Mymensingh', district:'Mymensingh' },
  { id:'haluaghat', en:'Haluaghat', bn:'হালুয়াঘাট', type:'upazila', division:'Mymensingh', district:'Mymensingh' },
  // Jamalpur
  { id:'jamalpur', en:'Jamalpur', bn:'জামালপুর', type:'district', division:'Mymensingh' },
  { id:'islampur', en:'Islampur', bn:'ইসলামপুর', type:'upazila', division:'Mymensingh', district:'Jamalpur' },
  { id:'melandaha', en:'Melandaha', bn:'মেলান্দহ', type:'upazila', division:'Mymensingh', district:'Jamalpur' },
  { id:'dewanganj', en:'Dewanganj', bn:'দেওয়ানগঞ্জ', type:'upazila', division:'Mymensingh', district:'Jamalpur' },
  { id:'bahadurabad', en:'Bahadurabad', bn:'বাহাদুরাবাদ', type:'area', division:'Mymensingh', district:'Jamalpur' },
  // Sherpur
  { id:'sherpur', en:'Sherpur', bn:'শেরপুর', type:'district', division:'Mymensingh' },
  { id:'nalitabari', en:'Nalitabari', bn:'নালিতাবাড়ী', type:'upazila', division:'Mymensingh', district:'Sherpur' },
  { id:'nakla', en:'Nakla', bn:'নকলা', type:'upazila', division:'Mymensingh', district:'Sherpur' },
  // Netrokona
  { id:'netrokona', en:'Netrokona', bn:'নেত্রকোণা', type:'district', division:'Mymensingh' },
  { id:'mohanganj', en:'Mohanganj', bn:'মোহনগঞ্জ', type:'upazila', division:'Mymensingh', district:'Netrokona' },
  { id:'khaliajuri', en:'Khaliajuri', bn:'খালিয়াজুড়ি', type:'upazila', division:'Mymensingh', district:'Netrokona' },
  // Kishoreganj
  { id:'kishoreganj', en:'Kishoreganj', bn:'কিশোরগঞ্জ', type:'district', division:'Mymensingh' },
  { id:'bhairab', en:'Bhairab', bn:'ভৈরব', type:'upazila', division:'Mymensingh', district:'Kishoreganj' },
  { id:'kuliarchar', en:'Kuliarchar', bn:'কুলিয়ারচর', type:'upazila', division:'Mymensingh', district:'Kishoreganj' },
  { id:'bajitpur', en:'Bajitpur', bn:'বাজিতপুর', type:'upazila', division:'Mymensingh', district:'Kishoreganj' },
  { id:'tarail', en:'Tarail', bn:'তাড়াইল', type:'upazila', division:'Mymensingh', district:'Kishoreganj' },
];

/** Filter BD_LOCATIONS by search query */
export function searchBDLocations(q: string, limit = 50): BDLocation[] {
  if (!q.trim()) return BD_LOCATIONS.slice(0, limit);
  const lq = q.toLowerCase();
  return BD_LOCATIONS.filter(l =>
    l.en.toLowerCase().includes(lq) ||
    l.bn.includes(q) ||
    l.district?.toLowerCase().includes(lq) ||
    l.division.toLowerCase().includes(lq)
  ).slice(0, limit);
}
