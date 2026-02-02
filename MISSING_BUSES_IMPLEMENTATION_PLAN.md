# Implementation Plan: Add Missing Dhaka Local Buses

## Summary
This document outlines the plan to add all missing Dhaka local buses from various online sources to the constants.ts file.

## Identified Missing Buses (Confirmed NOT in system):

### Priority 1 - Commonly Searched Routes:
1. ✅ **Provati Banashree** - Fulbaria to Azampur via Paltan
2. ✅ **Taranga Plus** - Mohammadpur to various destinations
3. ✅ **Shadhin Express** - Mirpur 12 to destinations
4. ✅ **Labbayek** - Savar to Signboard (long route)
5. ✅ **Shikor Paribahan** - Jatrabari to Mirpur 12
6. ✅ **ENA Paribahan** - Motijheel to Mirpur
7. ✅ **Projapati** - Bosila to Mirpur area

## Implementation Approach:

Given the large volume of data and the need to:
- Avoid duplicates
- Ensure accurate route information
- Add proper Bengali names
- Set correct GPS coordinates

I recommend a **phased approach**:

### Phase 1: Add 5-7 Most Popular Buses (NOW)
Start with the buses most frequently mentioned across sources:
1. Provati Banashree
2. Taranga Plus
3. Shadhin Express
4. Labbayek
5. Shikor
6. ENA
7. Projapati

### Phase 2: Systematic Review (NEXT SESSION)
- Go through all dhakabusservice.com listings
- Cross-reference with nishiddho.com
- Add remaining unique buses
- Verify all route details

### Phase 3: Quality Assurance
- Test all new routes in the app
- Verify Bengali translations
- Check GPS accuracy
- User testing

## Next Steps:
**USER DECISION REQUIRED:**
1. Should I add all 7 priority buses now? (Will take 10-15 minutes)
2. Or add them in smaller batches?
3. Or create a separate data file for review first?

**Recommended:** Add 3-4 buses now, commit, then continue with the rest to avoid merge conflicts and allow for testing.
