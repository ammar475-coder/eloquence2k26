const fs = require('fs');
const path = require('path');
// Load backend environment variables
const envPath = fs.existsSync(path.join(__dirname, '.env'))
  ? path.join(__dirname, '.env')
  : path.join(__dirname, 'env');
require('dotenv').config({ path: envPath, quiet: true });
const express = require('express');
const cors = require('cors');

let morgan;
try {
  morgan = require('morgan');
} catch (e) {}

let supabase;
try {
  supabase = require('./config/supabase');
} catch (e) {}

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Middleware
if (morgan) {
  app.use(morgan('dev'));
}
// Robust CORS configuration supporting all production, custom, and local origins
const corsOptions = {
  origin: (origin, callback) => {
    // Reflect request origin or allow if none (e.g. mobile apps, postman, curl)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'x-user-role'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Explicit manual CORS headers injection as a secondary failsafe
app.use((req, res, next) => {
  const reqOrigin = req.headers.origin;
  if (reqOrigin) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, x-user-role');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static assets
app.use('/events', express.static(path.join(__dirname, '../frontend/public/events')));
app.use('/sponsors', express.static(path.join(__dirname, '../frontend/public/sponsors')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Frontend static build serving (Unified deployment on Render)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  
  // SPA Catch-all middleware for client routing (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
} else {
  // Standalone API Mode fallback
  app.get('/', (req, res) => {
    res.json({
      name: "ELOQUENCE '26 Backend API",
      status: "Running",
      healthCheck: "/api/health"
    });
  });
}

const http = require('http');
const { initWebSocketServer } = require('./config/websocket');

// 404 handler for unmatched API requests or invalid paths
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint or resource not found' });
});

// Create HTTP and WebSocket Server
const server = http.createServer(app);
initWebSocketServer(server);

// Start Server
server.listen(PORT, HOST, () => {
  console.log(`[ELOQUENCE'26 Backend] Server running on http://${HOST}:${PORT}`);
  try {
    const { syncTableData } = require('./config/syncSupabase');
    syncTableData();
  } catch (err) {
    console.warn('Sync table data warning:', err.message);
  }

  try {
    const { initSupabaseRealtime } = require('./config/realtimeSupabase');
    initSupabaseRealtime();
  } catch (rtErr) {
    console.warn('Supabase realtime init warning:', rtErr.message);
  }
});

module.exports = server;
