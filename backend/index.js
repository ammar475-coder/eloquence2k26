const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
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

// Middleware
if (morgan) {
  app.use(morgan('dev'));
}
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded files (sponsor logos, assets)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Base route for testing
app.get('/', (req, res) => {
  res.send('Backend Server is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`[ELOQUENCE'26 Backend] Server running on http://localhost:${PORT}`);
});

module.exports = app;
