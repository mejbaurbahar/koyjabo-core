export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    bnTitle: string;
    excerpt: string;
    content: string;
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
        title: 'Top 10 Best Bus Routes in Dhaka: Complete Guide 2024',
        bnTitle: 'ঢাকার সেরা ১০টি বাস রুট: সম্পূর্ণ গাইড ২০২৪',
        excerpt: 'Discover the most efficient and popular bus routes in Dhaka. Learn which buses to take for your daily commute with our comprehensive guide.',
        content: `
# Top 10 Best Bus Routes in Dhaka

Dhaka's public transport system serves millions daily. Finding the right bus route can save you time and money. Here are the top 10 most efficient bus routes in Dhaka based on coverage, frequency, and reliability.

## 1. Gulistan - Gabtoli Route

**Best Buses**: Dhanmondi Paribahan, Agargaon Paribahan, Nirapad Paribahan

This is one of Dhaka's busiest routes, connecting the commercial hub of Gulistan to the western terminal at Gabtoli. Key stops include:

- Gulistan
- Shahbagh
- Karwan Bazar  
- Farmgate
- Asad Gate
- Mohammadpur
- Shyamoli
- Gabtoli

**Why it's best**: High frequency (buses every 5-10 minutes), covers major commercial and residential areas.

**Fare**: ৳15-30 depending on distance  
**Peak Hours**: 8-10 AM, 5-8 PM  
**Journey Time**: 45-60 minutes

## 2. Uttara - Motijheel Route

**Best Buses**: Projapati Paribahan (A1), Bihongo Paribahan, Shikor Paribahan

This north-south corridor is essential for commuters traveling from Uttara to the old city:

- Uttara
- Airport
- Banani
- Mohakhali
- Tejgaon
- Bijoy Sarani
- Paltan
- Motijheel

**Why it's best**: Connects airport area to commercial district, multiple bus options.

**Fare**: ৳20-40  
**Frequency**: Every 3-7 minutes  
**Journey Time**: 60-90 minutes

## 3. Mirpur - Jatrabari Route

**Best Buses**: Anabil Paribahan (11), BRTC, Suprabhat Paribahan

Critical route connecting northwestern Dhaka to the southern hub:

- Mirpur-10
- Kazipara
- Shyamoli
- Dhanmondi
- Science Lab
- Shahbagh
- Paltan
- Jatrabari

**Why it's best**: Serves multiple residential zones, good connectivity.

**Fare**: ৳15-35  
**Peak Frequency**: Every 5-8 minutes  
**Journey Time**: 60-75 minutes

## 4. Abdullahpur - Sayedabad Route

**Best Buses**: Bihongo Dhor, Nirapad Service, Sohag Paribahan

One of the longest and most comprehensive routes:

- Abdullahpur
- Uttara
- Mohakhali
- Malibagh
- Rampura
- Badda
- Sayedabad

**Why it's best**: Covers eastern residential areas, direct connectivity.

**Fare**: ৳25-45  
**Frequency**: Every 10-15 minutes  
**Journey Time**: 70-90 minutes

## 5. Mohammadpur - Gulistan Route

**Best Buses**: Dhanmondi Paribahan, Nirapad, Suprobhat

Popular for residents of Mohammadpur:

- Mohammadpur
- Dhanmondi
- Science Lab
- Shahbagh
- Press Club
- Gulistan

**Why it's best**: Short journey time, high frequency, serves university area.

**Fare**: ৳10-25  
**Frequency**: Every 5 minutes  
**Journey Time**: 30-40 minutes

## 6. Uttara - Sadarghat Route

**Best Buses**: BRTC AC, Shyamoli NR, Sirajganj Paribahan

For those commuting to Old Dhaka:

- Uttara
- Mohakhali
- Malibagh
- Kamalapur
- Gulistan
- Sadarghat

**Why it's best**: Direct route to river terminal, AC options available.

**Fare**: ৳20-50 (AC buses higher)  
**Frequency**: Every 15-20 minutes  
**Journey Time**: 75-90 minutes

## 7. Mirpur - Motijheel Route

**Best Buses**: Anabil Paribahan, BRTC, Supravat Paribahan

Important route for office-goers:

- Mirpur-1
- Mirpur-10
- Agargaon
- Bijoy Sarani
- Karwan Bazar
- Motijheel

**Why it's best**: Connects major employment zones.

**Fare**: ৳15-30  
**Frequency**: Every 5-10 minutes  
**Journey Time**: 50-65 minutes

## 8. Demra - Gabtoli Route

**Best Buses**: Gazipur Paribahan, Uttara Paribahan

East-west connectivity:

- Demra
- Jatrabari
- Sayedabad
- Shahbagh
- Farmgate
- Mohammadpur
- Gabtoli

**Why it's best**: Comprehensive east-west coverage.

**Fare**: ৳25-40  
**Frequency**: Every 10-15 minutes  
**Journey Time**: 80-100 minutes

## 9. Mohakhali - Gulistan Route

**Best Buses**: Various operators (very frequent service)

Extremely popular short route:

- Mohakhali
- Tejgaon
- Farmgate
- Karwan Bazar
- Shahbagh
- Gulistan

**Why it's best**: Maximum frequency, multiple operators.

**Fare**: ৳15-25  
**Frequency**: Every 2-5 minutes  
**Journey Time**: 30-45 minutes

## 10. Airport - Gulistan Route

**Best Buses**: Airport Special, BRTC, Various AC services

Essential for airport connectivity:

- Hazrat Shahjalal Airport
- Uttara
- Banani
- Mohakhali
- Tejgaon
- Karwan Bazar
- Gulistan

**Why it's best**: Airport access, frequent service, luggage-friendly.

**Fare**: ৳20-60 (depending on AC/Non-AC)  
**Frequency**: Every 10-15 minutes  
**Journey Time**: 50-70 minutes

## How to Use কই যাবো App for These Routes

1. **Search by Destination**: Enter your starting point and destination
2. **View All Routes**: See all available bus options
3. **Check Live Status**: See real-time bus locations (where available)
4. **Compare Fares**: Choose the most economical option
5. **Save Favorites**: Bookmark your regular routes

## Pro Tips

- **Avoid Peak Hours**: Travel between 10 AM - 4 PM for less crowding
- **Choose Sitting Service**: Pay slightly more for guaranteed seats
- **Use Apps**: Track buses in real-time with কই যাবো
- **Keep Change**: Conductors often don't have large bills
- **Know Your Stops**: Count stops or use GPS to avoid missing your destination

## Conclusion

These routes form the backbone of Dhaka's public transport system. Use the কই যাবো app to find the exact bus you need, compare routes, and navigate Dhaka like a pro.

**Download কই যাবো**: Your smart companion for navigating Dhaka's 200+ bus routes!
`,
        author: 'কই যাবো Team',
        publishDate: '2024-12-15',
        readTime: '8 min read',
        keywords: ['Dhaka bus routes', 'best buses Dhaka', 'Dhaka public transport', 'BRTC buses', 'Gulistan Gabtoli bus', 'Uttara Motijheel bus', 'Dhaka commute', 'bus fare Dhaka'],
        category: 'Bus Routes'
    },

    {
        id: 'dhaka-metro-guide',
        slug: 'dhaka-metro-guide',
        title: 'Complete Dhaka Metro Rail Guide: MRT Line-6 Routes, Fare & Timings',
        bnTitle: 'ঢাকা মেট্রো রেল সম্পূর্ণ গাইড: এমআরটি লাইন-৬ রুট, ভাড়া ও সময়সূচী',
        excerpt: 'Everything you need to know about Dhaka Metro Rail (MRT Line-6): stations, fares, timings, and how to travel. Complete guide for commuters.',
        content: `
# Complete Dhaka Metro Rail Guide (MRT Line-6)

Dhaka Metro Rail (MRT Line-6) is Bangladesh's first-ever metro system, revolutionizing urban transport. This guide covers everything you need to know.

## MRT Line-6 Overview

**Full Route**: Uttara North - Motijheel  
**Operational Section**: Uttara North - Agargaon (as of Dec 2024)  
**Total Stations**: 20 (when fully operational)  
**Current Operational Stations**: 9

## All MRT Line-6 Stations

### Operational Stations (Uttara-Agargaon)

1. **Uttara North** (উত্তরা উত্তর)
2. **Uttara Center** (উত্তরা কেন্দ্র)
3. **Uttara South** (উত্তরা দক্ষিণ)
4. **Pallabi** (পল্লবী)
5. **Mirpur-11** (মিরপুর-১১)
6. **Mirpur-10** (মিরপুর-১০)
7. **Kazipara** (কাজীপাড়া)
8. **Shewrapara** (শেওড়াপাড়া)
9. **Agargaon** (আগারগাঁও)

### Upcoming/Planned Stations

10. **Bijoy Sarani** (বিজয় সরণি)
11. **Farmgate** (ফার্মগেট)
12. **Karwan Bazar** (কারওয়ান বাজার)
13. **Shahbagh** (শাহবাগ)
14. **Dhaka University** (ঢাকা বিশ্ববিদ্যালয়)
15. **Bangladesh Secretariat** (বাংলাদেশ সচিবালয়)
16. **Motijheel** (মতিঝিল)

## Metro Rail Fare Structure

The fare is distance-based:

| Distance | Fare (৳) |
|----------|----------|
| 0-5 km | 20 |
| 5-7 km | 30 |
| 7-9 km | 40 |
| 9-12 km | 50 |
| 12-15 km | 60 |
| 15-17 km | 70 |
| 17-20 km | 80 |
| Full route | 100 |

**Minimum Fare**: ৳20  
**Maximum Fare**: ৳100

### Sample Fares (Current Operational Section)

- Uttara North → Uttara South: ৳20
- Uttara North → Mirpur-10: ৳30
- Uttara North → Agargaon: ৳40
- Mirpur-11 → Agargaon: ৳20
- Pallabi → Shewrapara: ৳20

## Operating Hours

**Daily Schedule**:
- First Train: 8:00 AM
- Last Train: 8:00 PM
- Friday: 3:00 PM - 9:00 PM (Prayer break: 1:00 PM - 3:00 PM)

**Frequency**: Trains every 5-8 minutes during peak hours

**Peak Hours**:
- Morning: 8:00 AM - 10:00 AM
- Evening: 5:00 PM - 8:00 PM

## How to Buy Tickets

### Option 1: MRT Pass Card (Recommended)

1. **Purchase at Stations**: Available at ticket counters
2. **Card Cost**: ৳100 (refundable)
3. **Load Money**: Minimum ৳100
4. **Recharge**: At any station counter or machine

**Benefits**:
- No queue for tickets
- Faster entry/exit
- Can be recharged multiple times
- Discounts for regular users

### Option 2: Token System

1. Go to ticket counter
2. Tell destination
3. Pay fare
4. Receive token
5. Insert at entry gate
6. Drop at exit gate

## Journey Experience

### Train Features

- **Air-conditioned**: All trains fully AC
- **Capacity**: 2,340 passengers per train
- **Carriages**: 6 coaches per train
- **Speed**: Maximum 100 km/h
- **Journey Time**: Uttara North to Agargaon in 18 minutes

### Facilities

✓ **Elevators**: At all stations  
✓ **Escalators**: Smooth movement between levels  
✓ **Toilets**: Clean facilities at stations  
✓ **Security**: CCTV cameras and security personnel  
✓ **Accessibility**: Wheelchair friendly  
✓ **Women's Coaches**: Dedicated coaches for women

## Rules & Regulations

### Dos ✓

- Queue properly while boarding
- Stand right on escalators (walk left)
- Give priority to elderly and disabled
- Keep station and train clean
- Follow staff instructions

### Don'ts ✗

- No smoking
- No eating or drinking
- No sitting on floors
- No loud music
- No photography/videography without permission
- Don't block doors

## Comparing Metro with Buses

### Metro Advantages

✓ **Fixed Time**: No traffic delays  
✓ **Clean & Cool**: AC environment  
✓ **Safe**: Lower accident risk  
✓ **Fast**: Direct route, no stops  
✓ **Comfortable**: Guaranteed seats in off-peak  

### Bus Advantages

✓ **More Routes**: 200+ bus routes vs limited metro  
✓ **Cheaper**: Can cost less for short distances  
✓ **Door-to-Door**: Buses reach more areas  
✓ **Flexible**: Multiple route options  

## Metro + Bus Combination

**Best Strategy**: Use metro for main tra

nsport corridors, buses for first/last mile:

**Example Route: Mirpur to Gulistan**
1. Take metro: Mirpur-10 → Agargaon (৳20)
2. Take bus: Agargaon → Gulistan (৳15)
3. **Total**: ৳35, 40 minutes

**VS Direct Bus**: ৳30, 60-90 minutes

## Using কই যاবো App with Metro

The কই যাবো app helps you:

1. **Find Nearest Metro Station**: Based on your location
2. **Calculate Metro Fare**: Between any two stations
3. **Combined Routes**: Metro + Bus options
4. **Compare Costs**: Metro vs Bus vs Mixed
5. **Save Routes**: Bookmark your daily commute

## Future Expansions

### MRT Line-6 Full Completion (Target: 2025)

All 16 stations from Uttara North to Motijheel operational

### MRT Line-1 (Planned)

Airport - Kamalapur - Purbachal

### MRT Line-5 (Planned)

Gabtoli - Dasherkandi

## Pro Tips

1. **Avoid Friday Prayer Time**: Service limited 1-3 PM
2. **Rush Hours**: Expect crowd 8-10 AM, 5-8 PM
3. **Buy Pass Card**: Save time on daily commute
4. **Check Last Train**: Don't get stranded after 8 PM
5. **Use Elevators**: Faster than escalators during peak
6. **Keep Right**: On escalators, stand right, walk left

## Common Questions

**Q: Is metro faster than bus?**  
A: Yes, for direct routes. Metro is traffic-free.

**Q: Can I carry luggage?**  
A: Small bags allowed. Large luggage may be restricted.

**Q: Is there parking?**  
A: Limited parking at some stations. Use rickshaw/CNG.

**Q: Can children travel free?**  
A: Children under 3 feet (approx. 5 years) travel free.

## Conclusion

Dhaka Metro Rail is transforming city commutes. While still expanding, it's already serving thousands daily. Use কই যাবো app to plan your journey with both metro and buses for the most efficient route.

**Try কই যাবো Today**: Find the best metro + bus combination for your journey!
`,
        author: 'কই যাবো Team',
        publishDate: '2024-12-20',
        readTime: '10 min read',
        keywords: ['Dhaka metro rail', 'MRT Line 6', 'metro fare Dhaka', 'metro stations Dhaka', 'Dhaka metro timings', 'metro rail Bangladesh', 'Uttara Motijheel metro'],
        category: 'Metro Rail'
    }
];
