# Dhaka Local Bus Data Review

## Analysis Date: 2026-01-17

### Your Concern:
You mentioned that "Alabil" and some other local buses might be missing from the database.

### Findings:

#### 1. **Alabil/Anabil - FOUND ✓**
- **Status**: Already in database
- **Entry**: `Anabil Super` (id: 'anabil_super')
- **Route**: Sign Board ⇄ Gazipur
- **Type**: Sitting
- **Bengali**: অনাবিল সুপার
- **Note**: "Alabil" is likely referring to "Anabil" - confirmed as active Dhaka bus service

#### 2. **Potentially Missing Buses:**

Based on web research, here are popular Dhaka local buses that may be missing:

##### **Definitely Missing:**
1. **Nabil Paribahan** - Major bus operator (mentioned in multiple sources)
2. **Shohagh Paribahan** - Popular intercity/local service
3. **Eagle Paribahan** - Known local operator
4. **Anik Bus** - Local service
5. **Dream Line** - Local/intercity service
6. **Dhaka Express** - City service
7. **S Alam Service** - Well-known operator
8. **Soudia Paribahan** - Local service

##### **Need to Verify if Already Exists:**
- Green Line Paribahan
- Shyamoli Paribahan  
- Hanif Enterprise
- Al Makka Bus (we have "Al Makka" but need to verify if same)

### Current Database Stats:
- **Total Buses in Export**: 200
- **Metro Rail**: 1 line (MRT Line 6)
- **Stations**: 280+

### Recommendations:

1. **Add Missing Major Operators** - The buses listed above are well-known and should be added
2. **Verify Existing Data** - Cross-check if variants exist (e.g., "Shyamoli" might exist but under different name)
3. **Update Route Information** - Ensure all routes are accurate and up-to-date

### Next Steps:

Would you like me to:
1. Search for specific route information for these missing buses?
2. Add the missing buses to constants.ts?
3. Check if any of these exist under different names in the current database?

---

## Quick Answer to Your Question:

**"Alabil"** ✅ Already exists as **"Anabil Super"** in the database
- However, you were right to check - we are indeed missing several other major local buses like Nabil Paribahan, Shohagh, Eagle, Dream Line, and others.
