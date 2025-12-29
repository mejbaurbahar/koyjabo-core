# Live Bus Tracking - Complete File List for Backend Team

## 📋 Overview
This document lists all files needed by the backend team to implement the Live Bus Tracking WebSocket relay server.

---

## 🎯 Main Implementation Guide

### **BACKEND_IMPLEMENTATION_GUIDE.md**
**Location**: `h:\Dhaka-Commute\BACKEND_IMPLEMENTATION_GUIDE.md`

**Description**: Complete backend implementation guide with:
- WebSocket server setup (Node.js example)
- Data structures and message formats
- Security considerations (rate limiting, validation)
- Deployment instructions
- Complete working server code
- Testing procedures

**This is the PRIMARY document for backend team.**

---

## 📁 Frontend Reference Files

These files show how the frontend is already implemented. Backend team should review to understand the integration:

### 1. **services/liveBusService.ts**
**Location**: `h:\Dhaka-Commute\services\liveBusService.ts`

**Purpose**: Frontend WebSocket client
- Connects to `wss://koyjabo-backend.onrender.com`
- Sends location updates when user clicks "Go Live"
- Receives broadcasts from other users
- Manages subscription system for MapVisualizer

**Key Functions**:
- `startBroadcasting(busName)` - User starts broadcasting
- `stopBroadcasting()` - User stops broadcasting
- `updateLocation(lat, lng, speed)` - Sends location to backend
- `subscribe(callback)` - Components subscribe to receive bus updates

---

### 2. **components/LiveTracker.tsx**
**Location**: `h:\Dhaka-Commute\components\LiveTracker.tsx`

**Purpose**: "Go Live" UI Component
- Displays "Go Live (Inside Bus)" button
- Checks if user is online (offline detection)
- Checks if user is near the bus route (proximity verification - 0.5km)
- Maintains broadcasting state across navigation
- Sends GPS updates to liveBusService

**Features**:
- Offline prevention
- Proximity verification (must be within 500m of route)
- State persistence

---

### 3. **components/MapVisualizer.tsx**
**Location**: `h:\Dhaka-Commute\components\MapVisualizer.tsx`

**Purpose**: Map View with Live Bus Icons
- Subscribes to liveBusService for bus updates
- Filters buses by route name
- Calculates bus positions on schematic map
- Renders green bus icons

**Key Logic**:
- Lines 310-335: Subscription to liveBusService
- Lines 336-385: Bus position calculation
- Lines 1168-1215: Live bus icon rendering (green icons with pulsing animation)

---

## 🔧 Development/Testing Files (Optional)

These are NOT needed for backend implementation but may be useful for testing:

### **services/liveBusSimulator.ts**
**Location**: `h:\Dhaka-Commute\services\liveBusSimulator.ts`

**Purpose**: Frontend simulator for testing (development only)
- Creates fake buses for testing without backend
- NOT related to backend implementation
- Used by frontend developers to test UI

### **components/LiveBusSimulatorController.tsx**
**Location**: `h:\Dhaka-Commute\components\LiveBusSimulatorController.tsx`

**Purpose**: UI controls for the simulator (development only)
- NOT related to backend implementation

---

## 📋 Message Flow Example

### User Broadcasting Flow:

```
1. User clicks "Go Live (Inside Bus)" for "Baishakhi" route
   ↓
2. LiveTracker.tsx checks:
   - Is user online? ✅
   - Is location available? ✅
   - Is user within 500m of route? ✅
   ↓
3. LiveTracker.tsx calls:
   liveBusService.startBroadcasting("Baishakhi Paribahan")
   ↓
4. liveBusService.ts establishes WebSocket connection:
   ws = new WebSocket('wss://koyjabo-backend.onrender.com')
   ↓
5. GPS position updates trigger:
   liveBusService.updateLocation(23.8450, 90.2600, 25)
   ↓
6. liveBusService sends to backend:
   {
     "type": "location_update",
     "data": {
       "busId": "SELF_DEVICE",
       "busName": "Baishakhi Paribahan",
       "lat": 23.8450,
       "lng": 90.2600,
       "speed": 25,
       "timestamp": 1735466000000
     }
   }
   ↓
7. BACKEND RELAYS to all connected clients:
   {
     "type": "bus_update",
     "data": {
       "id": "SELF_DEVICE",
       "busName": "Baishakhi Paribahan",
       "lat": 23.8450,
       "lng": 90.2600,
       "speed": 25,
       "timestamp": 1735466000000,
       "isUser": false
     }
   }
   ↓
8. Other users' MapVisualizer.tsx receives update
   ↓
9. Green bus icon appears on their map
```

---

## 🚀 Backend Implementation Checklist

- [ ] Read `BACKEND_IMPLEMENTATION_GUIDE.md`
- [ ] Review `services/liveBusService.ts` to understand client expectations
- [ ] Set up WebSocket server (use example code from guide)
- [ ] Implement message handling:
  - [ ] `location_update` → relay as `bus_update`
  - [ ] Send `initial_state` on connection
- [ ] Implement cleanup for stale buses (30s timeout)
- [ ] Add rate limiting (20 updates/minute per client)
- [ ] Add data validation
- [ ] Deploy to `wss://koyjabo-backend.onrender.com`
- [ ] Test with frontend
- [ ] Monitor performance

---

## 🔗 WebSocket URL

**Current Configuration**: `wss://koyjabo-backend.onrender.com`

**Configured in**: `services/liveBusService.ts` (line 15)

```typescript
const WS_URL = 'wss://koyjabo-backend.onrender.com';
```

If you deploy to a different URL, notify frontend team to update this constant.

---

## 📊 Expected Load

**Concurrent Users**: 500-1000
**Broadcasting Users**: 50-100 at peak
**Updates per Second**: 10-50
**Message Size**: ~200 bytes

---

## 🧪 Testing

### Local Testing
1. Run backend server locally (e.g., `ws://localhost:8080`)
2. Temporarily update `WS_URL` in `liveBusService.ts`
3. Test with frontend app
4. Check console for connection logs

### Production Testing
1. Deploy to `wss://koyjabo-backend.onrender.com`
2. Frontend should connect automatically
3. Use browser console to verify:
   ```javascript
   // Check if connected
   console.log('WebSocket state:', ws.readyState);
   // 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
   ```

---

## 📝 Summary for Backend Team

**What you need to do**:
1. Implement a WebSocket relay server
2. Accept connections from frontend clients
3. Receive `location_update` messages
4. Broadcast as `bus_update` to all clients
5. Clean up stale buses
6. Deploy to production

**What you DON'T need**:
- No bus route logic (frontend handles this)
- No GPS tracking (frontend does this)
- No map rendering (frontend does this)
- No database (optional for analytics only)

**Your only job**: Be a **message relay** between clients

---

## 🎯 Quick Start

1. **Read**: `BACKEND_IMPLEMENTATION_GUIDE.md`
2. **Copy**: Example server code from the guide
3. **Install**: `npm install ws express cors`
4. **Run**: `node server.js`
5. **Test**: Connect from frontend
6. **Deploy**: To Render.com or your platform

---

## 📞 Contact

For questions about:
- **Frontend integration**: Check `services/liveBusService.ts`
- **Message format**: See `BACKEND_IMPLEMENTATION_GUIDE.md` → Data Structures
- **UI behavior**: Check `components/LiveTracker.tsx`
- **Map rendering**: Check `components/MapVisualizer.tsx`

---

**Generated**: December 29, 2025  
**Frontend Version**: 1.0.0  
**Required Backend**: WebSocket relay server with message broadcasting
