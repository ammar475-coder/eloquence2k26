const { WebSocketServer, WebSocket } = require('ws');

let wssInstance = null;

function initWebSocketServer(server) {
  wssInstance = new WebSocketServer({ 
    server,
    path: '/ws/registrations'
  });

  wssInstance.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    // Send welcome payload upon connection
    try {
      ws.send(JSON.stringify({
        type: 'CONNECTED',
        message: "Connected to ELOQUENCE '26 Live Registration WebSocket Stream",
        timestamp: new Date().toISOString()
      }));
    } catch (_) {}

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (_) {}
    });

    ws.on('error', (err) => {
      console.warn('[WS] Client error:', err.message);
    });
  });

  const interval = setInterval(() => {
    if (!wssInstance) return;
    wssInstance.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      try { ws.ping(); } catch (_) {}
    });
  }, 30000);

  wssInstance.on('close', () => {
    clearInterval(interval);
  });

  console.log('[WebSocket] Live stream server mounted on /ws/registrations');
  return wssInstance;
}

function broadcastRegistrationUpdate(action, data) {
  if (!wssInstance) return 0;
  const payload = JSON.stringify({
    type: 'REGISTRATION_UPDATE',
    action,
    data,
    timestamp: new Date().toISOString()
  });

  let sentCount = 0;
  wssInstance.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      try {
        client.send(payload);
        sentCount++;
      } catch (_) {}
    }
  });
  return sentCount;
}

module.exports = {
  initWebSocketServer,
  broadcastRegistrationUpdate
};
