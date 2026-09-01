require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
let morgan;
try {
  morgan = require('morgan');
} catch (e) {}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
if (morgan) {
  app.use(morgan('dev'));
}
app.use(cors());
app.use(express.json());

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
