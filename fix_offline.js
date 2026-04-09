const fs = require('fs');
let content = fs.readFileSync('H:/Dhaka-Commute/intercity/offlineService.ts', 'utf8');

// Find the section to replace (from "    let result = '';" to just before "    return {")
const startMarker = "    let result = '';";
const endMarker = "\n    return {";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found. start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

const before = content.substring(0, startIdx);
const after = content.substring(endIdx);

const newBlock = `    let result = '';

    // Boarding terminal lookup helper
    const getBoardingTerminal = (origin: string, dest: string, bn: boolean): string => {
        if (origin !== 'Dhaka') return bn ? \`\${origin} বাস টার্মিনাল\` : \`\${origin} Bus Terminal\`;
        const gabtoli = ['Rajshahi', 'Chapainawabganj', 'Pabna', 'Kushtia', 'Jashore', 'Khulna', 'Satkhira', 'Benapole', 'Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari'];
        const sayedabad = ['Barishal', 'Patuakhali', 'Bhola', 'Chandpur', 'Lakshmipur', 'Noakhali', 'Feni', 'Cumilla', 'Chattogram', "Cox's Bazar", 'Bandarban', 'Rangamati', 'Khagrachari', 'Teknaf'];
        const mohakhaliN = ['Rangpur', 'Dinajpur', 'Bogura', 'Gaibandha', 'Kurigram', 'Nilphamari', 'Lalmonirhat', 'Saidpur', 'Panchagarh', 'Thakurgaon', 'Joypurhat', 'Naogaon'];
        const mohakhali = ['Sylhet', 'Brahmanbaria', 'Habiganj', 'Moulvibazar', 'Sunamganj', 'Kishoreganj', 'Narsingdi', 'Mymensingh', 'Netrokona', 'Sherpur', 'Jamalpur', 'Tangail', 'Gazipur'];
        if (gabtoli.includes(dest)) return bn ? 'গাবতলী বাস টার্মিনাল, ঢাকা' : 'Gabtoli Bus Terminal, Dhaka';
        if (sayedabad.includes(dest)) return bn ? 'সায়েদাবাদ বাস টার্মিনাল, ঢাকা' : 'Sayedabad Bus Terminal, Dhaka';
        if (mohakhaliN.includes(dest)) return bn ? 'কল্যাণপুর / মহাখালী বাস টার্মিনাল, ঢাকা' : 'Kalyanpur / Mohakhali Bus Terminal, Dhaka';
        if (mohakhali.includes(dest)) return bn ? 'মহাখালী বাস টার্মিনাল, ঢাকা' : 'Mohakhali Bus Terminal, Dhaka';
        return bn ? 'নিকটস্থ বাস টার্মিনাল' : 'Nearest Bus Terminal';
    };

    // Available modes
    const availableModesArr: string[] = [];
    if (connTo.bus) availableModesArr.push(isBn ? 'বাস' : 'Bus');
    if (connTo.train) availableModesArr.push(isBn ? 'ট্রেন' : 'Train');
    if (connTo.plane) availableModesArr.push(isBn ? 'ফ্লাইট' : 'Flight');
    if (connTo.boat) availableModesArr.push(isBn ? 'লঞ্চ' : 'Launch');
    const modesStr = availableModesArr.join('/');

    // Time estimates
    const busTimeH = distance > 0 ? Math.max(1, Math.ceil(distance / 50)) : 3;
    const trainTimeH = distance > 0 ? Math.max(2, Math.ceil(distance / 55)) : 4;

    if (isBn) {
        result = \`**রুট: \${from} থেকে \${to}** — দূরত্ব: \${distance > 0 ? distance + ' কিমি' : 'অজানা'}\\n\\n\`;

        // ── 1. বাস ──
        const busFareDisplay = busInfo?.fare || \`\${Math.max(150, Math.round(distance * 2.8))}-\${Math.max(350, Math.round(distance * 5.2))}\`;
        const terminal = getBoardingTerminal(from, to, true);
        result += \`🚌 বাস – \${busTimeH}-\${busTimeH + 1}h | ৳\${busFareDisplay}\\n\`;
        result += \`**বোর্ডিং পয়েন্ট:** \${terminal}  \\n\`;
        if (busInfo) {
            const fp = busInfo.fare.split('-');
            result += \`**নন-এসি ভাড়া:** ৳\${fp[0] || busInfo.fare}  \\n\`;
            if (fp[1]) result += \`**এসি ভাড়া:** ৳\${fp[1]}  \\n\`;
            result += \`**অপারেটর:** \${busInfo.buses.join(' · ')}  \\n\`;
        }
        if (brtcRoutes.length > 0) {
            result += \`**বিআরটিসি (সরকারি বাস):**  \\n\`;
            brtcRoutes.forEach(br => result += \`- \${(br as any).bnName} (\${(br as any).type}) — \${(br as any).hours}  \\n\`);
        }
        if (routesToDisplay.length > 0) {
            result += \`**পাওয়া রুট (\${routesToDisplay.length}টি):**  \\n\`;
            routesToDisplay.slice(0, 8).forEach((r: any) => {
                const price = r.prices?.[0]?.price ?? '—';
                const cls = r.prices?.[1] ? 'AC/Non-AC' : (r.prices?.[0]?.className ?? 'Non-AC');
                const dep = r.schedule?.[0]?.departureTime ? \` · \${r.schedule[0].departureTime}\` : '';
                result += \`- **\${r.operatorName || 'বাস'}** (\${cls}) — ৳\${price}\${dep}  \\n\`;
            });
        }
        if (!busInfo && brtcRoutes.length === 0 && routesToDisplay.length === 0) {
            const estNonAC = Math.max(150, Math.round(distance * 2.8));
            const estAC = Math.max(350, Math.round(distance * 5.2));
            result += \`**আনুমানিক নন-এসি ভাড়া:** ৳\${estNonAC}  \\n\`;
            result += \`**আনুমানিক এসি ভাড়া:** ৳\${estAC}  \\n\`;
            result += \`স্থানীয় বাস টার্মিনালে হানিফ, শ্যামলী বা এনা-র কাউন্টারে যোগাযোগ করুন।  \\n\`;
        }
        result += \`**টিকেট:** কাউন্টার থেকে সংগ্রহ করুন বা shohoz.com / redbus.in  \\n\`;
        result += \`\\n\`;

        // ── 2. ট্রেন ──
        if (trainInfo) {
            result += \`🚂 ট্রেন – \${trainTimeH}h | ৳\${trainInfo.fare}\\n\`;
            result += \`**স্টেশন:** ঢাকা কমলাপুর রেলওয়ে স্টেশন  \\n\`;
            result += \`**ট্রেনসমূহ:** \${trainInfo.trains.join(' · ')}  \\n\`;
            const tfp = trainInfo.fare.split('-');
            result += \`**শোভন ভাড়া:** ৳\${tfp[0] || trainInfo.fare}  \\n\`;
            if (tfp[1]) result += \`**স্নিগ্ধা / এসি ভাড়া:** ৳\${tfp[1]}  \\n\`;
            result += \`**অনলাইন বুকিং:** eticket.railway.gov.bd  \\n\`;
            result += \`**টিপস:** ৩-৫ দিন আগে টিকেট কেটে নিন, বিশেষত শুক্র-শনিবার ও ছুটির সময়।  \\n\`;
            result += \`\\n\`;
        } else if (connFrom.train && connTo.train) {
            result += \`🚂 ট্রেন – সংযোগ প্রয়োজন\\n\`;
            result += \`সরাসরি ট্রেন নেই। ঢাকা কমলাপুর হয়ে সংযোগ ট্রেন পাওয়া যেতে পারে।  \\n\\n\`;
        }

        // ── 3. বিমান ──
        if (airInfo) {
            result += \`🛫 বিমান – \${airInfo.time} | ৳\${airInfo.fare}\\n\`;
            result += \`**বিমানবন্দর:** হজরত শাহজালাল আন্তর্জাতিক বিমানবন্দর, ঢাকা  \\n\`;
            result += \`**এয়ারলাইন্স:** \${airInfo.airlines.join(' · ')}  \\n\`;
            const afp = airInfo.fare.split('-');
            result += \`**সর্বনিম্ন ভাড়া:** ৳\${afp[0] || airInfo.fare} (একমুখী, বেসিক)  \\n\`;
            if (afp[1]) result += \`**সর্বোচ্চ ভাড়া:** ৳\${afp[1]}  \\n\`;
            result += \`**বুকিং:** biman.com.bd · us-bangla.com · novoair.com · airastra.com  \\n\`;
            result += \`**টিপস:** ১-২ সপ্তাহ আগে বুক করলে সস্তায় পাওয়া যায়।  \\n\`;
            result += \`\\n\`;
        }

        // ── 4. লঞ্চ ──
        if (launchInfo) {
            result += \`🚢 লঞ্চ – \${launchInfo.time} | ৳\${launchInfo.fare}\\n\`;
            result += \`**টার্মিনাল:** সদরঘাট লঞ্চ টার্মিনাল, ঢাকা  \\n\`;
            result += \`**লঞ্চসমূহ:** \${launchInfo.operators.join(' · ')}  \\n\`;
            const lfp = launchInfo.fare.split('-');
            result += \`**ডেক ভাড়া:** ৳\${lfp[0] || launchInfo.fare}  \\n\`;
            if (lfp[1]) result += \`**কেবিন / ভিআইপি ভাড়া:** ৳\${lfp[1]}  \\n\`;
            result += \`**ছাড়ার সময়:** সাধারণত সন্ধ্যা ৬টা – রাত ৮টার মধ্যে  \\n\`;
            result += \`**টিপস:** এসি কেবিন আগেই বুক করুন, বিশেষত ঈদ ও ছুটির মৌসুমে।  \\n\`;
            result += \`\\n\`;
        } else if (connTo.boat && (from === 'Dhaka' || connFrom.boat)) {
            result += \`🚢 নৌপথ – তথ্য সীমিত\\n\`;
            result += \`এই রুটে নৌযান চলাচল করতে পারে। সদরঘাট টার্মিনালে খোঁজ নিন।  \\n\\n\`;
        }

        if (!busInfo && !trainInfo && distance > 200 && from !== 'Dhaka' && to !== 'Dhaka') {
            result += \`💡 **পরামর্শ:** সরাসরি সার্ভিস কম থাকলে **ঢাকা** হয়ে যাওয়া সুবিধাজনক (\${modesStr} পাওয়া যায়)।  \\n\`;
        }
        if (from === 'Gazipur' || to === 'Gazipur') {
            result += \`💡 **গাজীপুর নোট:** গাজীপুর চৌরাস্তা বা বোর্ড বাজার থেকে দূরপাল্লার বাসে উঠা যায়।  \\n\`;
        }

    } else {
        // ── ENGLISH ──
        result = \`**Route: \${from} to \${to}** — Distance: \${distance > 0 ? distance + ' km' : 'N/A'}\\n\\n\`;

        const busFareDisplay = busInfo?.fare || \`\${Math.max(150, Math.round(distance * 2.8))}-\${Math.max(350, Math.round(distance * 5.2))}\`;
        const terminal = getBoardingTerminal(from, to, false);

        // ── 1. Bus ──
        result += \`🚌 By Bus – \${busTimeH}-\${busTimeH + 1}h | ৳\${busFareDisplay}\\n\`;
        result += \`**Boarding Point:** \${terminal}  \\n\`;
        if (busInfo) {
            const fp = busInfo.fare.split('-');
            result += \`**Non-AC Fare:** ৳\${fp[0] || busInfo.fare}  \\n\`;
            if (fp[1]) result += \`**AC Fare:** ৳\${fp[1]}  \\n\`;
            result += \`**Operators:** \${busInfo.buses.join(' · ')}  \\n\`;
        }
        if (brtcRoutes.length > 0) {
            result += \`**BRTC (Government Bus):**  \\n\`;
            brtcRoutes.forEach(br => result += \`- \${(br as any).name} (\${(br as any).type}) — \${(br as any).hours}  \\n\`);
        }
        if (routesToDisplay.length > 0) {
            result += \`**Found Routes (\${routesToDisplay.length}):**  \\n\`;
            routesToDisplay.slice(0, 8).forEach((r: any) => {
                const price = r.prices?.[0]?.price ?? '—';
                const cls = r.prices?.[1] ? 'AC/Non-AC' : (r.prices?.[0]?.className ?? 'Non-AC');
                const dep = r.schedule?.[0]?.departureTime ? \` · \${r.schedule[0].departureTime}\` : '';
                result += \`- **\${r.operatorName || 'Bus'}** (\${cls}) — ৳\${price}\${dep}  \\n\`;
            });
        }
        if (!busInfo && brtcRoutes.length === 0 && routesToDisplay.length === 0) {
            const estNonAC = Math.max(150, Math.round(distance * 2.8));
            const estAC = Math.max(350, Math.round(distance * 5.2));
            result += \`**Est. Non-AC Fare:** ৳\${estNonAC}  \\n\`;
            result += \`**Est. AC Fare:** ৳\${estAC}  \\n\`;
            result += \`Check the local bus terminal in **\${from}**. Operators like Hanif, Shyamoli, and Ena have counters in most district hubs.  \\n\`;
        }
        result += \`**Tickets:** Buy at counter or shohoz.com / redbus.in  \\n\`;
        result += \`\\n\`;

        // ── 2. Train ──
        if (trainInfo) {
            result += \`🚂 By Train – \${trainTimeH}h | ৳\${trainInfo.fare}\\n\`;
            result += \`**Station:** Dhaka Kamalapur Railway Station  \\n\`;
            result += \`**Trains:** \${trainInfo.trains.join(' · ')}  \\n\`;
            const tfp = trainInfo.fare.split('-');
            result += \`**Shovan (Economy) Fare:** ৳\${tfp[0] || trainInfo.fare}  \\n\`;
            if (tfp[1]) result += \`**Snigdha / AC Fare:** ৳\${tfp[1]}  \\n\`;
            result += \`**Online Booking:** eticket.railway.gov.bd  \\n\`;
            result += \`**Tip:** Book 3–5 days ahead, especially for weekends and holidays.  \\n\`;
            result += \`\\n\`;
        } else if (connFrom.train && connTo.train) {
            result += \`🚂 By Train – Connection Required\\n\`;
            result += \`No direct train. A connecting train via Dhaka Kamalapur may be available.  \\n\\n\`;
        }

        // ── 3. Flight ──
        if (airInfo) {
            result += \`🛫 By Flight – \${airInfo.time} | ৳\${airInfo.fare}\\n\`;
            result += \`**Airport:** Hazrat Shahjalal International Airport, Dhaka  \\n\`;
            result += \`**Airlines:** \${airInfo.airlines.join(' · ')}  \\n\`;
            const afp = airInfo.fare.split('-');
            result += \`**Lowest Fare:** ৳\${afp[0] || airInfo.fare} (one-way, basic)  \\n\`;
            if (afp[1]) result += \`**Highest Fare:** ৳\${afp[1]}  \\n\`;
            result += \`**Booking:** biman.com.bd · us-bangla.com · novoair.com · airastra.com  \\n\`;
            result += \`**Tip:** Book 1–2 weeks ahead for best prices.  \\n\`;
            result += \`\\n\`;
        }

        // ── 4. Launch ──
        if (launchInfo) {
            result += \`🚢 By Launch – \${launchInfo.time} | ৳\${launchInfo.fare}\\n\`;
            result += \`**Terminal:** Sadarghat Launch Terminal, Dhaka  \\n\`;
            result += \`**Operators:** \${launchInfo.operators.join(' · ')}  \\n\`;
            const lfp = launchInfo.fare.split('-');
            result += \`**Deck Fare:** ৳\${lfp[0] || launchInfo.fare}  \\n\`;
            if (lfp[1]) result += \`**Cabin / VIP Fare:** ৳\${lfp[1]}  \\n\`;
            result += \`**Departure:** Usually 6 PM – 8 PM  \\n\`;
            result += \`**Tip:** Book AC cabin in advance during Eid and holidays.  \\n\`;
            result += \`\\n\`;
        } else if (connTo.boat && (from === 'Dhaka' || connFrom.boat)) {
            result += \`🚢 By Launch – Limited Info\\n\`;
            result += \`Waterway service may be available. Check at Sadarghat Terminal, Dhaka.  \\n\\n\`;
        }

        if (!busInfo && !trainInfo && distance > 200 && from !== 'Dhaka' && to !== 'Dhaka') {
            result += \`💡 **Tip:** If direct transport is limited, traveling via **Dhaka** is often the most reliable route (\${modesStr} available).  \\n\`;
        }
        if (from === 'Gazipur' || to === 'Gazipur') {
            result += \`💡 **Gazipur Note:** Most intercity buses pass through **Gazipur Chowrasta** or **Board Bazar** — you can board from there.  \\n\`;
        }
    }`;

const newContent = before + newBlock + after;
fs.writeFileSync('H:/Dhaka-Commute/intercity/offlineService.ts', newContent, 'utf8');
console.log('Done! File written successfully.');
console.log('Before length:', before.length, 'New block length:', newBlock.length, 'After length:', after.length);
