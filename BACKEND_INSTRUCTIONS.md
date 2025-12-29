# Backend Implementation Guide for Live Bus Tracking

To make the "Live Bus" feature work where users can see each other, your backend needs to handle WebSocket messages.

## Current Setup
The frontend tries to connect to: `wss://koyjabo-backend.onrender.com`

## Required Backend Logic (Node.js / Express / ws)

You need to handle the `bus_location_update` message and broadcast it to all other connected clients as `bus_locations_broadcast`.

### Example Implementation (server.js):

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server }); // Attach to your existing HTTP server

// Store active buses in memory
let liveBuses = new Map();

wss.on('connection', (ws) => {
    
    // Send current list to new user
    sendBroadcast(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'bus_location_update') {
                 // specific bus/user updating their location
                 const busId = data.busName + '_' + (data.id || 'anon'); // Unique ID strategy
                 
                 // Update memory
                 liveBuses.set(busId, {
                     id: busId,
                     busName: data.busName,
                     lat: data.lat,
                     lng: data.lng,
                     speed: data.speed,
                     timestamp: Date.now()
                 });

                 // Broadcast to ALL clients
                 broadcastAll();
            }
            
            if (data.type === 'stop_broadcast') {
                // Remove from map if needed, or let it timeout
            }

        } catch (e) {
            console.error(e);
        }
    });

    ws.on('close', () => {
        // Handle disconnect
    });
});

function broadcastAll() {
    const list = Array.from(liveBuses.values());
    const msg = JSON.stringify({
        type: 'bus_locations_broadcast',
        buses: list
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

// Cleanup Interval (remove stale buses > 5 mins old)
setInterval(() => {
    const now = Date.now();
    for (const [id, bus] of liveBuses.entries()) {
        if (now - bus.timestamp > 5 * 60 * 1000) {
            liveBuses.delete(id);
        }
    }
}, 60 * 1000);
```

## Frontend Features Added
1. **Inside Bus Mode**: In "Live Navigation", users can click "Go Live".
2. **Live Map**: A new "Live Map" button allows users to see all active buses on a real map.
3. **Real-time Updates**: The map updates markers in real-time as users move.

Start your backend and this feature will actively sync users!
