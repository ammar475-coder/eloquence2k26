const { WebSocketServer, WebSocket } = require('ws');

let wss = null;
const clients = new Set();

/**
 * Initialize the WebSocket Server attached to the main HTTP server.
 * @param {import('http').Server} server 
 */
function initWebSocket(server) {
  wss = new WebSocketServer({ 
    server,
    path: '/ws/registrations'
  });

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    ws.isAlive = true;

    // Send immediate welcome / initial heartbeat
    try {
      ws.send(JSON.stringify({
        type: 'CONNECTED',
        message: 'Connected to ELOQUENCE 2026 Real-time Registration Gateway',
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('WS Initial handshake send error:', e.message);
    }

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // Non-JSON or ping message
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.warn('WS Client error:', err.message);
      clients.delete(ws);
    });
  });

  // Heartbeat ping interval every 25 seconds to keep active connections alive
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 25000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('[WebSocket Server] Initialized on path /ws/registrations');
  return wss;
}

/**
 * Broadcast a real-time registration event to all active admin/coordinator clients.
 * @param {'CREATE' | 'VERIFY' | 'DELETE' | 'UPDATE'} action 
 * @param {Object} data 
 */
function broadcastRegistrationUpdate(action, data = {}) {
  const payload = JSON.stringify({
    type: 'REGISTRATION_UPDATE',
    action,
    data,
    timestamp: new Date().toISOString()
  });

  let broadcastCount = 0;
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
        broadcastCount++;
      } catch (err) {
        console.warn('WS Broadcast send error:', err.message);
      }
    }
  });

  if (process.env.NODE_ENV !== 'test') {
    console.log(`[WS Broadcast] Action: ${action} | Clients reached: ${broadcastCount}`);
  }
}

function getConnectedClientsCount() {
  return clients.size;
}

module.exports = {
  initWebSocket,
  broadcastRegistrationUpdate,
  getConnectedClientsCount
};
