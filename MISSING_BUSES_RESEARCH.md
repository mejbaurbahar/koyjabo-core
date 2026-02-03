# Missing Dhaka Local Bus Routes - Research Summary

## Sources Analyzed:
1. https://www.busbd.com.bd/ - Intercity ticketing (not local routes)
2. https://nishiddho.com/category/dhaka-local-bus-routes/ - ✅ Good source
3. https://mydigonto.com/travel/route.jsp - Limited info
4. http://anupamasite.com/dhaka_bus_route_and_fare.php - Website unavailable
5. https://dhakabusservice.com/ - ✅ Comprehensive list
6. Other sources pending full review

## Buses Found (Need to check against existing constants.ts):

### From Nishiddho.com:
1. **Provati Banashree** (প্রভাতি বনশ্রী)
   - Route: Fulbaria ⇄ Golap Shah Mazar ⇄ GPO ⇄ Paltan ⇄ Kakrail ⇄ Shantinagar

2. **Taranga Plus** (তরঙ্গ প্লাস)
   - Route: Mohammadpur - Dhanmondi 15 - Jigatola - Nilkhet - Science Lab - Shahbag - Kakrail

3. **Shadhin Express** (স্বাধীন এক্সপ্রেস)
   - Route: Mirpur 12, 11, 10 - Kazipara - Shewrapara - Agargaon - Farmgate - Kawran Bazar - Bangla Motor - Shahbag - High Court

4. **Labbayek** (লাব্বাইক)
   - Route: Savar - Hemayetpur - Kalyanpur - Farmgate - Khilgaon - Bashabo - Mugdapara - Sayedabad - Jatrabari - Shanir Akhra - Matuail - Signboard

5. **Shikor Paribahan** (শিকড় পরিবহন)
   - Route: Jatrabari - Motijheel Shapla Chattar - Bangabandhu Stadium - Paltan - Press Club - Shahbag - Bangla Motor - Farmgate - Shewrapara - Kazipara - Mirpur 12

6. **ENA Paribahan** (এনা পরিবহন)
   - Route: Motijheel - Shapla Chattar - Bangabandhu Stadium - Paltan - Press Club - Shahbag - Bangla Motor - Mirpur

7. **Projapati** (প্রজাপতি)
   - Route: Bosila - Mohammadpur - Kalyanpur - Bangla College - Mirpur 1

### From DhakaBusService.com (partial list, needs full extraction):
- Many of the buses are already in our system
- Need to cross-check each one

## Action Required:
1. ✅ Check each bus name against existing constants.ts
2. ⏳ Add missing buses with complete route information
3. ⏳ Verify Bengali names are correct
4. ⏳ Add accurate GPS coordinates for new stops
5. ⏳ Set appropriate bus type and operating hours

## Status: ✅ PHASE 1 COMPLETE
- Started: February 2, 2026 22:45 UTC+6
- Completed: February 2, 2026 22:50 UTC+6
- Researcher: AI Assistant
- Total Sources: 6+ websites
- **Added: 7 popular buses (Provati Banashree, Taranga Plus, Shadhin Express, Labbayek, Shikor, ENA, Projapati)**
- Commit: c8f4fe3

## Next Phase:
- Continue systematic review of dhakabusservice.com full listing
- Add remaining unique buses from nishiddho.com
- Cross-reference with other sources
- Total estimated remaining: 20-30 additional unique buses
