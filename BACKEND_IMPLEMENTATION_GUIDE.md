# Live Bus Tracking - Backend Implementation Guide

## Overview
This document provides complete specifications for implementing the backend WebSocket relay service for the Live Bus Tracking feature.

## System Architecture

```
User Device (Broadcasting)
    ↓
Frontend (liveBusService.ts)
    ↓
WebSocket Connection
    ↓
Backend Server (YOU IMPLEMENT THIS)
    ↓
WebSocket Broadcast
    ↓
All Connected Clients (Map Viewers)
```

## Backend Requirements

### Technology Stack
- **WebSocket Server**: Socket.io, ws, or uWebSockets.js
- **Language**: Node.js (recommended) or any language with WebSocket support
- **Port**: 443 (WSS) or 80 (WS) - Currently configured for `wss://koyjabo-backend.onrender.com`

### Core Functionality
1. Accept WebSocket connections from clients
2. Receive live bus location updates from broadcasting users
3. Relay updates to all connected clients viewing the same bus route
4. Clean up stale connections
5. Rate limiting to prevent abuse

---

## Data Structures

### Message Types

#### 1. Client → Server: Location Update
```typescript
{
  type: 'location_update',
  data: {
    busId: string,        // Unique device/session ID (e.g., "DEVICE_12345")
    busName: string,      // Bus route name (e.g., "Baishakhi Paribahan")
    lat: number,          // Latitude (e.g., 23.8450)
    lng: number,          // Longitude (e.g., 90.2600)
    speed: number,        // Speed in km/h (e.g., 25)
    heading?: number,     // Optional: Direction in degrees (0-359)
    timestamp: number     // Unix timestamp in milliseconds
  }
}
```

#### 2. Server → Clients: Broadcast Update
```typescript
{
  type: 'bus_update',
  data: {
    id: string,           // busId from the broadcasting client
    busName: string,
    lat: number,
    lng: number,
    speed: number,
    heading?: number,
    timestamp: number,
    isUser: false         // Always false for other users' buses
  }
}
```

#### 3. Server → Client: Initial State
When a client connects, send them current active buses:
```typescript
{
  type: 'initial_state',
  data: {
    buses: [
      {
        id: string,
        busName: string,
        lat: number,
        lng: number,
        speed: number,
        timestamp: number,
        isUser: false
      },
      // ... more buses
    ]
  }
}
```

---

## Backend Implementation

### 1. WebSocket Server Setup (Node.js + ws example)

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store active buses
// Map<busId, busData>
const activeBuses = new Map();

// Store connected clients
// Set of WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Send initial state to new client
    ws.send(JSON.stringify({
        type: 'initial_state',
        data: {
            buses: Array.from(activeBuses.values())
        }
    }));

    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);
            handleMessage(ws, msg);
        } catch (error) {
            console.error('Invalid message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});
```

### 2. Message Handler

```javascript
function handleMessage(ws, msg) {
    if (msg.type === 'location_update') {
        const { busId, busName, lat, lng, speed, heading, timestamp } = msg.data;

        // Validate data
        if (!busId || !busName || lat === undefined || lng === undefined) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid location update'
            }));
            return;
        }

        // Store/update bus data
        activeBuses.set(busId, {
            id: busId,
            busName,
            lat,
            lng,
            speed: speed || 0,
            heading,
            timestamp: timestamp || Date.now(),
            isUser: false
        });

        // Broadcast to all clients
        broadcastToAll({
            type: 'bus_update',
            data: activeBuses.get(busId)
        });

        console.log(`Bus update: ${busName} at (${lat}, ${lng})`);
    }
}
```

### 3. Broadcasting Function

```javascript
function broadcastToAll(message) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}
```

### 4. Cleanup Stale Buses

```javascript
// Clean up buses that haven't updated in 30 seconds
setInterval(() => {
    const now = Date.now();
    const STALE_THRESHOLD = 30 * 1000; // 30 seconds

    activeBuses.forEach((bus, busId) => {
        if (now - bus.timestamp > STALE_THRESHOLD) {
            console.log(`Removing stale bus: ${busId}`);
            activeBuses.delete(busId);

            // Notify clients to remove this bus
            broadcastToAll({
                type: 'bus_removed',
                data: { busId }
            });
        }
    });
}, 10000); // Check every 10 seconds
```

---

## Frontend Integration Points

### Current Frontend Implementation

**File**: `services/liveBusService.ts`

**WebSocket Connection**:
```typescript
const WS_URL = 'wss://koyjabo-backend.onrender.com';
```

**Location Update**: Frontend sends updates every time GPS position changes
```typescript
function updateLocation(lat: number, lng: number, speed: number) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    
    ws.send(JSON.stringify({
        type: 'location_update',
        data: {
            busId: 'SELF_DEVICE',
            busName: currentBusName,
            lat,
            lng,
            speed,
            timestamp: Date.now()
        }
    }));
}
```

**Receiving Updates**: Frontend listens for broadcasts
```typescript
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'bus_update') {
        // Update local state
        liveBuses.set(message.data.id, message.data);
        notifySubscribers();
    }
};
```

---

## Security Considerations

### 1. Rate Limiting
Prevent abuse by limiting update frequency per client:

```javascript
const clientRateLimits = new Map();
const MAX_UPDATES_PER_MINUTE = 20;

function checkRateLimit(clientId) {
    const now = Date.now();
    const clientData = clientRateLimits.get(clientId) || { count: 0, resetTime: now + 60000 };

    if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + 60000;
    } else {
        clientData.count++;
    }

    clientRateLimits.set(clientId, clientData);
    return clientData.count <= MAX_UPDATES_PER_MINUTE;
}
```

### 2. Data Validation
Always validate incoming data:

```javascript
function validateLocationUpdate(data) {
    return (
        typeof data.busId === 'string' &&
        typeof data.busName === 'string' &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number' &&
        data.lat >= -90 && data.lat <= 90 &&
        data.lng >= -180 && data.lng <= 180 &&
        data.speed >= 0 && data.speed <= 200 // Reasonable speed limit
    );
}
```

### 3. Authentication (Optional but Recommended)
Add basic authentication:

```javascript
ws.on('message', (message) => {
    const msg = JSON.parse(message);
    
    if (msg.type === 'auth') {
        // Verify token/credentials
        ws.authenticated = true;
    } else if (!ws.authenticated) {
        ws.close(1008, 'Unauthorized');
    } else {
        handleMessage(ws, msg);
    }
});
```

---

## Deployment

### Environment Variables
```bash
PORT=8080
WS_URL=wss://koyjabo-backend.onrender.com
MAX_CONNECTIONS=1000
CLEANUP_INTERVAL=10000
STALE_THRESHOLD=30000
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

### Render.com Deployment
1. Create new Web Service
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Enable WebSocket support in settings

---

## Testing

### Manual Test with wscat
```bash
# Install wscat
npm install -g wscat

# Connect to server
wscat -c wss://koyjabo-backend.onrender.com

# Send location update
{"type":"location_update","data":{"busId":"TEST_1","busName":"Baishakhi Paribahan","lat":23.8450,"lng":90.2600,"speed":20,"timestamp":1735466000000}}
```

### Load Testing
Expected capacity:
- **Concurrent connections**: 500-1000
- **Updates per second**: 50-100
- **Message size**: ~200 bytes

---

## Monitoring & Logging

### Metrics to Track
1. Active connections count
2. Active buses count
3. Messages per second
4. Average message latency
5. Error rate

### Logging Format
```javascript
console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'bus_update',
    busId: data.busId,
    busName: data.busName,
    clientsNotified: clients.size
}));
```

---

## Complete Backend Server Example

**File**: `server.js`

```javascript
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT);
const wss = new WebSocket.Server({ server });

const activeBuses = new Map();
const clients = new Set();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        clients: clients.size,
        activeBuses: activeBuses.size,
        uptime: process.uptime()
    });
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    const clientId = req.headers['sec-websocket-key'];
    console.log(`Client connected: ${clientId}`);
    clients.add(ws);

    // Send initial state
    ws.send(JSON.stringify({
        type: 'initial_state',
        data: { buses: Array.from(activeBuses.values()) }
    }));

    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);
            
            if (msg.type === 'location_update') {
                const { busId, busName, lat, lng, speed, heading, timestamp } = msg.data;

                // Validate
                if (!busId || !busName || lat === undefined || lng === undefined) {
                    return;
                }

                // Store
                const busData = {
                    id: busId,
                    busName,
                    lat,
                    lng,
                    speed: speed || 0,
                    heading,
                    timestamp: timestamp || Date.now(),
                    isUser: false
                };
                
                activeBuses.set(busId, busData);

                // Broadcast
                const broadcastMsg = JSON.stringify({
                    type: 'bus_update',
                    data: busData
                });

                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(broadcastMsg);
                    }
                });

                console.log(`Update: ${busName} at (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
        } catch (error) {
            console.error('Message error:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Cleanup stale buses
setInterval(() => {
    const now = Date.now();
    const STALE_THRESHOLD = 30000;

    activeBuses.forEach((bus, busId) => {
        if (now - bus.timestamp > STALE_THRESHOLD) {
            console.log(`Removing stale bus: ${busId}`);
            activeBuses.delete(busId);
        }
    });
}, 10000);

console.log(`✅ Server running on port ${PORT}`);
console.log(`WebSocket URL: ws://localhost:${PORT}`);
```

**File**: `package.json`

```json
{
  "name": "dhaka-commute-websocket-server",
  "version": "1.0.0",
  "description": "WebSocket relay server for live bus tracking",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "ws": "^8.14.2",
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## Frontend Files (Reference)

The following files are already implemented in the frontend:

1. **`services/liveBusService.ts`** - WebSocket client, handles connection and broadcasting
2. **`components/LiveTracker.tsx`** - "Go Live" UI with offline/proximity checks
3. **`components/MapVisualizer.tsx`** - Displays live bus icons on map

---

## API Endpoints Summary

### WebSocket Endpoint
- **URL**: `wss://koyjabo-backend.onrender.com`
- **Protocol**: WebSocket (WSS)

### HTTP Health Check (Optional)
- **GET** `/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "clients": 25,
    "activeBuses": 8,
    "uptime": 3600
  }
  ```

---

## Implementation Checklist

- [ ] Set up WebSocket server
- [ ] Implement connection handling
- [ ] Implement message routing (location_update → bus_update)
- [ ] Add stale bus cleanup
- [ ] Add rate limiting
- [ ] Add data validation
- [ ] Deploy to production
- [ ] Update frontend WS_URL if needed
- [ ] Test with multiple clients
- [ ] Monitor performance

---

## Support

**Frontend Developer**: Antigravity AI  
**Date**: December 29, 2025  
**Version**: 1.0.0

For questions about frontend integration, refer to:
- `services/liveBusService.ts`
- `components/LiveTracker.tsx`
- `components/MapVisualizer.tsx`
