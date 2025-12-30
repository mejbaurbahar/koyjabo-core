export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    bnTitle: string;
    excerpt: string;
    bnExcerpt: string;
    content: string;
    bnContent: string;
    coverImage: string;
    author: string;
    publishDate: string;
    readTime: string;
    keywords: string[];
    category: string;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        id: 'best-bus-routes-dhaka',
        slug: 'best-bus-routes-dhaka',
        title: 'Top 10 Best Bus Routes in Dhaka: Complete Guide 2025',
        bnTitle: 'ঢাকার সেরা ১০টি বাস রুট: সম্পূর্ণ গাইড ২০২৫',
        excerpt: 'Discover the most efficient and popular bus routes in Dhaka. Learn which buses to take for your daily commute with our comprehensive guide.',
        bnExcerpt: 'ঢাকার সবচেয়ে দক্ষ এবং জনপ্রিয় বাস রুটগুলি আবিষ্কার করুন। আমাদের বিস্তৃত গাইড দিয়ে আপনার দৈনিক যাতায়াতের জন্য কোন বাসগুলি নিতে হবে তা জানুন।',
        coverImage: '/blog-best-bus-routes.png',
        content: `
Dhaka's public transport system is the main lifeline for millions of people every day. However, not knowing the right bus route can lead to wasted time and suffering. Based on coverage, frequency, and user experience, here are the 10 most effective bus routes in Dhaka.

---

## 1. Gulistan – Gabtoli Route

**Best Buses:** Dhanmondi Paribahan, Agargaon Paribahan, Nirapad Paribahan

**Important Stops:**
Gulistan -> Shahbagh -> Karwan Bazar -> Farmgate -> Asad Gate -> Mohammadpur -> Shyamoli -> Gabtoli

**Why it's popular:**

* High frequency (buses every 5-10 minutes)
* Ideal for office goers and students
* Covers major commercial and residential hubs

**Fare:** ৳15–30
**Journey Time:** 45–60 minutes

---

## 2. Uttara – Motijheel Route

**Best Buses:** Projapati Paribahan (A-1), Bihongo Paribahan, Shikor Paribahan

**Stops:**
Uttara -> Airport -> Banani -> Mohakhali -> Tejgaon -> Bijoy Sarani -> Paltan -> Motijheel

**Why it's popular:**

* Connects the airport area with the main commercial district
* Multiple bus options available
* Fast commuting via the north-south corridor

**Fare:** ৳20–40
**Frequency:** Every 3–7 minutes

---

## 3. Mirpur – Gulistan Route

**Best Buses:** BRTC, Talukdar Paribahan, Diabari Paribahan

**Stops:**
Mirpur-10 -> Kazipara -> Farmgate -> Shahbagh -> Gulistan

**Why it's popular:**

* Primary commuting route for Mirpur residents
* Direct access to the city center and shopping districts

**Fare:** ৳15–25

---

## 4. Savar – Motijheel Route

**Best Buses:** Nabinagar Paribahan, Selfin Paribahan

**Stops:**
Savar -> Aminbazar -> Gabtoli -> Shyamoli -> Kallyanpur -> Shahbagh -> Motijheel

**Why it's popular:**

* Essential for workers in the Savar industrial area
* Reliable long-distance service for cross-city travel

**Fare:** ৳30–50

---

## 5. Keraniganj – Gulistan Route

**Best Buses:** Rajdhani Paribahan, Suprabhat Paribahan

**Stops:**
Keraniganj -> Babubazar -> Sadarghat -> Gulistan

**Why it's popular:**

* Makes commuting to Old Dhaka easier and faster
* Frequent service throughout the day

---

## 6. Mohammadpur – Motijheel Route

**Best Buses:** Ajmeri Glory, Baishakhi Paribahan

**Stops:**
Mohammadpur -> Asad Gate -> Farmgate -> Shahbagh -> Motijheel

**Why it's popular:**
* Key route for west-to-center travel
* Passes through major hospitals and education hubs

---

## 7. Jatrabari – Uttara Route

**Best Buses:** Turag, Anabil

**Stops:**
Jatrabari -> Sayedabad -> Paltan -> Mohakhali -> Banani -> Uttara

**Why it's popular:**
* Connects the southern entry point of Dhaka to the northern residential hub

---

## 8. Gazipur – Gulistan Route

**Best Buses:** Bhogra Paribahan, VIP-27

**Stops:**
Gazipur -> Tongi -> Airport -> Mohakhali -> Gulistan

---

## 9. Narayanganj – Motijheel Route

**Best Buses:** Chashara Paribahan, Shital Paribahan

**Why it's popular:**

* Fast and direct commute from Narayanganj to central Dhaka

---

## 10. Dhanmondi – Uttara Route

**Best Buses:** Akash Paribahan, Labiba

**Stops:**
Dhanmondi -> Farmgate -> Mohakhali -> Banani -> Uttara

---

## How to Use Koi Jabo App

1. **Find Best Route**: Enter starting point and destination
2. **Compare Buses**: See all available options in one list
3. **Track Live**: See real-time bus locations (where supported)
4. **Fare Estimate**: Know exactly how much you should pay
5. **Save Routes**: Bookmark your daily commute for 1-tap access

---

## Pro Travel Tips

* **Avoid Peak Hours**: Travel between 10 AM – 4 PM for less crowding
* **Choose Sitting Service**: A bit more expensive but much more comfortable
* **Keep Small Change**: Conductors often struggle with large bills
* **Smart Tracking**: Use Koi Jabo to know exactly when to get off

---

## Conclusion

Knowing the right bus route is crucial for traveling smartly in Dhaka. To save time, compare fares, and ensure a hassle-free journey, Koi Jabo is your most reliable companion.

Use Koi Jabo — 200+ Dhaka bus routes, on one platform.
`,
        bnContent: `
ঢাকার গণপরিবহন ব্যবস্থা প্রতিদিন লক্ষ লক্ষ মানুষের চলাচলের প্রধান ভরসা। কিন্তু সঠিক বাস রুট না জানলে সময় নষ্ট হয়, ভোগান্তিও বাড়ে। এই ব্লগে কভারেজ, ফ্রিকোয়েন্সি ও ব্যবহারকারীর অভিজ্ঞতার ভিত্তিতে ঢাকার সবচেয়ে কার্যকর ১০টি বাস রুট তুলে ধরা হলো।

---

## ১. গুলিস্তান – গাবতলী রুট

**সেরা বাস:** ধানমন্ডি পরিবহন, আগারগাঁও পরিবহন, নিরাপদ পরিবহন

**গুরুত্বপূর্ণ স্টপ:**
গুলিস্তান -> শাহবাগ -> কারওয়ান বাজার -> ফার্মগেট -> আসাদ গেট -> মোহাম্মদপুর -> শ্যামলী -> গাবতলী

**কেন জনপ্রিয়:**

* উচ্চ ফ্রিকোয়েন্সি (প্রতি ৫-১০ মিনিটে বাস)
* অফিস ও শিক্ষার্থীদের জন্য আদর্শ
* শহরের প্রধান সব এলাকাকে সংযুক্ত করে

**ভাড়া:** ৳১৫–৩০
**যাত্রার সময়:** ৪৫–৬০ মিনিট

---

## ২. উত্তরা – মতিঝিল রুট

**সেরা বাস:** প্রজাপতি পরিবহন (এ-১), বিহঙ্গ পরিবহন, শিকর পরিবহন

**স্টপ:**
উত্তরা -> বিমানবন্দর -> বনানী -> মহাখালী -> তেজগাঁও -> বিজয় সরণি -> পল্টন -> মতিঝিল

**কেন জনপ্রিয়:**

* বিমানবন্দর ও প্রধান অফিস এলাকা সরাসরি সংযুক্ত
* একাধিক বাস অপশন পাওয়া যায়
* উত্তর থেকে দক্ষিণ ঢাকার মেরুদণ্ড হিসেবে পরিচিত

**ভাড়া:** ৳২০–৪০
**ফ্রিকোয়েন্সি:** প্রতি ৩–৭ মিনিট

---

## ৩. মিরপুর – গুলিস্তান রুট

**সেরা বাস:** বিআরটিসি, তালুকদার পরিবহন, দিয়াবাড়ি পরিবহন

**স্টপ:**
মিরপুর-১০ -> কাজীপাড়া -> ফার্মগেট -> শাহবাগ -> গুলিস্তান

**কেন জনপ্রিয়:**

* মিরপুরবাসীর প্রধান যাতায়াত রুট

**ভাড়া:** ৳১৫–২৫

---

## ৪. সাভার – মতিঝিল রুট

**সেরা বাস:** নবীনগর পরিবহন, সেলফিন পরিবহন

**স্টপ:**
সাভার -> আমিনবাজার -> গাবতলী -> শ্যামলী -> কল্যাণপুর -> শাহবাগ -> মতিঝিল

**কেন জনপ্রিয়:**

* সাভার ইন্ডাস্ট্রিয়াল এলাকার কর্মীদের জন্য জরুরি

**ভাড়া:** ৳৩০–৫০

---

## ৫. কেরানীগঞ্জ – গুলিস্তান রুট

**সেরা বাস:** রাজধানী পরিবহন, সুপ্রভাত পরিবহন

**স্টপ:**
কেরানীগঞ্জ -> বাবুবাজার -> সদরঘাট -> গুলিস্তান

**কেন জনপ্রিয়:**

* পুরান ঢাকায় যাতায়াত সহজ করে

---

## ৬. মোহাম্মদপুর – মতিঝিল রুট

**সেরা বাস:** আজমেরী গ্লোরি, বৈশাখী পরিবহন

**স্টপ:**
মোহাম্মদপুর -> আসাদ গেট -> ফার্মগেট -> শাহবাগ -> মতিঝিল

---

## ৭. যাত্রাবাড়ী – উত্তরা রুট

**সেরা বাস:** তুরাগ, অনাবিল

**স্টপ:**
যাত্রাবাড়ী -> সায়েদাবাদ -> পল্টন -> মহাখালী -> বনানী -> উত্তরা

---

## ৮. গাজীপুর – গুলিস্তান রুট

**সেরা বাস:** ভোগরা পরিবহন, ভিআইপি-২৭

**স্টপ:**
গাজীপুর -> টঙ্গী -> বিমানবন্দর -> মহাখালী -> গুলিস্তান

---

## ৯. নারায়ণগঞ্জ – মতিঝিল রুট

**সেরা বাস:** চাষাড়া পরিবহন, শীতল পরিবহন

**কেন জনপ্রিয়:**

* নারায়ণগঞ্জ থেকে ঢাকার কেন্দ্রস্থলে সরাসরি যাতায়াত

---

## ১০. ধানমন্ডি – উত্তরা রুট

**সেরা বাস:** আকাশ পরিবহন, লাবিবা

**স্টপ:**
ধানমন্ডি -> ফার্মগেট -> মহাখালী -> বনানী -> উত্তরা

---

## কই যাবো অ্যাপ কীভাবে ব্যবহার করবেন

১. শুরুর স্থান ও গন্তব্য লিখুন
২. সব বাস রুট একসাথে দেখুন
৩. লাইভ বাস লোকেশন ট্র্যাক করুন
৪. ভাড়া তুলনা করুন
৫. নিয়মিত রুট সংরক্ষণ করুন

---

## প্রো ট্রাভেল টিপস

* পিক আওয়ার এড়িয়ে চলুন (১০টা–৪টা)
* সিটিং সার্ভিসে ভ্রমণ আরামদায়ক
* খুচরা টাকা সঙ্গে রাখুন
* GPS বা কই যাবো দিয়ে স্টপ ট্র্যাক করুন

---

## উপসংহার

ঢাকায় স্মার্টভাবে চলাচলের জন্য সঠিক বাস রুট জানা অত্যন্ত গুরুত্বপূর্ণ। সময় বাঁচাতে, ভাড়া তুলনা করতে এবং ঝামেলামুক্ত যাত্রার জন্য কই যাবো আপনার সবচেয়ে নির্ভরযোগ্য সঙ্গী।

কই যাবো ব্যবহার করুন — ঢাকার ২০০+ বাস রুট, এক প্ল্যাটফর্মে।
`,
        author: 'কই যাবো Team',
        publishDate: '2025-12-30',
        readTime: '8 min read',
        keywords: ['Dhaka bus routes', 'best buses Dhaka', 'Dhaka public transport', 'BRTC buses', 'Gulistan Gabtoli bus', 'Uttara Motijheel bus', 'Dhaka commute', 'bus fare Dhaka'],
        category: 'Bus Routes'
    },

    {
        id: 'dhaka-metro-guide',
        slug: 'dhaka-metro-guide',
        title: 'Complete Dhaka Metro Rail Guide 2025: MRT Line-6 Routes, Fare & Timings',
        bnTitle: 'ঢাকা মেট্রো রেল সম্পূর্ণ গাইড ২০২৫: এমআরটি লাইন-৬ রুট, ভাড়া ও সময়সূচী',
        excerpt: 'Everything you need to know about Dhaka Metro Rail (MRT Line-6): stations, fares, timings, and how to travel. Complete guide for commuters.',
        bnExcerpt: 'ঢাকা মেট্রো রেল (এমআরটি লাইন-৬) সম্পর্কে আপনার যা জানা দরকার: স্টেশন, ভাড়া, টাইমিং এবং কীভাবে ভ্রমণ করবেন। যাত্রীদের জন্য সম্পূর্ণ গাইড।',
        coverImage: '/blog-metro-rail-guide.png',
        content: `
Dhaka Metro Rail (MRT Line-6) is Bangladesh's first-ever modern mass rapid transit system, playing a major role in reducing traffic congestion and making commuting fast and reliable. This guide provides all necessary information about MRT Line-6 in one place.

---

## MRT Line-6 Quick Overview

* **Full Route:** Uttara North -> Motijheel
* **Current Operational Section:** Uttara North -> Motijheel (As of December 2025)
* **Total Stations:** 20
* **Line Type:** Elevated (Sky Metro)

It quickly connects the northern part of Dhaka to the southern commercial districts.

---

## MRT Line-6 Stations

1. Uttara North
2. Uttara Center
3. Uttara South
4. Pallabi
5. Mirpur-11
6. Mirpur-10
7. Kazipara
8. Shewrapara
9. Agargaon
10. Bijoy Sarani
11. Farmgate
12. Karwan Bazar
13. Shahbagh
14. Dhaka University
15. Bangladesh Secretariat
16. Motijheel

---

## Metro Rail Fare Structure

Fare is entirely **distance-based**:

* 0–5 km: ৳20
* 5–7 km: ৳30
* 7–9 km: ৳40
* 9–12 km: ৳60
* Full Route: ৳100

**Minimum Fare:** ৳20
**Maximum Fare:** ৳100

---

## Operating Schedule

**General Days:**

* First Train: 8:00 AM
* Last Train: 8:00 PM

**Friday:**

* 3:00 PM – 9:00 PM
* (Jummah Prayer Break: 1:00 PM – 3:00 PM)

---

## How to Buy Tickets

### Option 1: MRT Pass Card (Most Convenient)

1. Collect from any metro station ticket counter
2. **Card Price:** ৳100 (Refundable)
3. **Minimum Recharge:** ৳100
4. Fare is automatically deducted during each trip

### Option 2: Single Journey Ticket

* For one-time travel
* Available from ticket machines or counters

---

## Why Use Metro Rail

* **Traffic-free**: Zero signals or congestion
* **Punctual**: Reach your destination exactly on time
* **Comfortable**: Efficient AC and modern coaches
* **Secure**: Safe and monitored system with security personnel
* **Green**: Most eco-friendly transport in the city

---

## Metro Usage Tips

* Reach the station early during peak hours (8–10 AM, 5–8 PM)
* Use MRT Pass Card to skip long ticket queues
* Account for extra time for bag scanning at entrance
* Check the last train timings for your specific station

---

## How to Use Metro + Bus Smartly

Since metro stations might not be right at your doorstep:

* **Metro + Bus**: Use buses for first/last mile connectivity
* **Koi Jabo**: Search for nearest bus routes from any metro station
* **Compare**: Check fare and time differences between direct bus and metro-bus combo

Get all these insights instantly with Koi Jabo.

---

## Conclusion

Dhaka Metro Rail (MRT Line-6) is a new chapter in the city's transport system. It is now the preferred choice for residents for fast, safe, and reliable travel. Koi Jabo is your smart travel companion for finding the most effective routes using both Metro and buses.

**Use Koi Jabo Today**
Find the best **Metro + Bus** routes for your journey in one place!
`,
        bnContent: `
ঢাকা মেট্রো রেল (MRT Line-6) বাংলাদেশের প্রথম আধুনিক গণপরিবহন ব্যবস্থা, যা ঢাকার যানজট কমাতে ও যাতায়াতকে দ্রুত ও নির্ভরযোগ্য করতে বড় ভূমিকা রাখছে। এই ব্লগে এমআরটি লাইন-৬ সম্পর্কে প্রয়োজনীয় সব তথ্য এক জায়গায় দেওয়া হলো।

---

## এমআরটি লাইন–৬ সংক্ষিপ্ত বিবরণ

* **সম্পূর্ণ রুট:** উত্তরা উত্তর -> মতিঝিল
* **বর্তমান চালু অংশ:** উত্তরা উত্তর -> মতিঝিল (ডিসেম্বর ২০২৫)
* **মোট স্টেশন:** ২০টি
* **লাইন টাইপ:** এলিভেটেড (উড়াল মেট্রো)

এটি ঢাকার উত্তর থেকে দক্ষিণ অংশকে দ্রুত সংযুক্ত করেছে।

---

## এমআরটি লাইন–৬ এর স্টেশনসমূহ

1. উত্তরা উত্তর
2. উত্তরা সেন্টার
3. উত্তরা দক্ষিণ
4. পল্লবী
5. মিরপুর–১১
6. মিরপুর–১০
7. কাজীপাড়া
8. শেওড়াপাড়া
9. আগারগাঁও
10. বিজয় সরণি
11. ফার্মগেট
12. কারওয়ান বাজার
13. শাহবাগ
14. ঢাকা বিশ্ববিদ্যালয়
15. বাংলাদেশ সচিবালয়
16. মতিঝিল

---

## মেট্রো রেল ভাড়া কাঠামো

ভাড়া সম্পূর্ণ **দূরত্বভিত্তিক**:

* ০–৫ কিমি: ৳২০
* ৫–৭ কিমি: ৳৩০
* ৭–৯ কিমি: ৳৪০
* ৯–১২ কিমি: ৳৬০
* সম্পূর্ণ রুট: ৳১০০

**ন্যূনতম ভাড়া:** ৳২০
**সর্বোচ্চ ভাড়া:** ৳১০০

---

## পরিচালনা সময়সূচি

**সাধারণ দিন:**

* প্রথম ট্রেন: সকাল ৮:০০
* শেষ ট্রেন: রাত ৮:০০

**শুক্রবার:**

* বিকেল ৩:০০ – রাত ৯:০০
* (জুমার নামাজের বিরতি: দুপুর ১:০০ – ৩:০০)

---

## কীভাবে টিকিট ক্রয় করবেন

### অপশন ১: এমআরটি পাস কার্ড (সবচেয়ে সুবিধাজনক)

1. যেকোনো মেট্রো স্টেশনের টিকিট কাউন্টার থেকে সংগ্রহ
2. **কার্ড মূল্য:** ৳১০০ (ফেরতযোগ্য)
3. **ন্যূনতম রিচার্জ:** ৳১০০
4. প্রতিবার যাত্রায় স্বয়ংক্রিয়ভাবে ভাড়া কেটে নেওয়া হয়

### অপশন ২: সিঙ্গেল জার্নি টিকিট

* একবারের যাত্রার জন্য
* টিকিট মেশিন বা কাউন্টার থেকে পাওয়া যায়

---

## কেন মেট্রো রেল ব্যবহার করবেন

* যানজটমুক্ত যাতায়াত
* নির্দিষ্ট সময়ের মধ্যে গন্তব্যে পৌঁছানো
* এসি ও আধুনিক কোচ
* নিরাপদ ও মনিটরড সিস্টেম
* পরিবেশবান্ধব পরিবহন

---

## মেট্রো ব্যবহার টিপস

* পিক আওয়ারে (৮–১০টা, ৫–৮টা) আগে স্টেশনে পৌঁছান
* এমআরটি পাস কার্ড ব্যবহার করলে সময় বাঁচে
* ব্যাগ স্ক্যানিংয়ের জন্য অতিরিক্ত সময় ধরুন
* শেষ স্টেশনের সময় মনে রাখুন

---

## মেট্রো + বাস কীভাবে স্মার্টভাবে ব্যবহার করবেন

সব স্টেশন আপনার গন্তব্যের কাছে নাও হতে পারে। তাই—

* মেট্রো + বাস কম্বিনেশন ব্যবহার করুন
* কাছের স্টেশন থেকে বাস রুট খুঁজুন
* ভাড়া ও সময় তুলনা করুন

এসব একসাথে সহজভাবে পেতে ব্যবহার করুন কই যাবো।

---

## উপসংহার

ঢাকা মেট্রো রেল (এমআরটি লাইন–৬) শহরের যাতায়াত ব্যবস্থায় এক নতুন অধ্যায়। দ্রুত, নিরাপদ ও নির্ভরযোগ্য যাত্রার জন্য এটি এখন ঢাকাবাসীর প্রথম পছন্দ। মেট্রো ও বাস একসাথে ব্যবহার করে সবচেয়ে কার্যকর রুট বের করতে কই যাবো আপনার স্মার্ট ট্রাভেল সঙ্গী।

**আজই কই যাবো ব্যবহার করুন**
আপনার যাত্রার জন্য সেরা **মেট্রো + বাস** রুট খুঁজে নিন এক জায়গায়!
`,
        author: 'কই যাবো Team',
        publishDate: '2025-12-30',
        readTime: '10 min read',
        keywords: ['Dhaka metro rail', 'MRT Line 6', 'metro fare Dhaka', 'metro stations Dhaka', 'Dhaka metro timings', 'metro rail Bangladesh', 'Uttara Motijheel metro'],
        category: 'Metro Rail'
    }
];
