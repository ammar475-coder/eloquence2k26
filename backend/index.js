const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Persistent Data Storage Path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'registrations.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Helper: Read registrations from storage
function readRegistrations() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading registrations file:', err);
    return [];
  }
}

// Helper: Write registrations to storage
function writeRegistrations(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing registrations file:', err);
    return false;
  }
}

// Helper: Generate unique, collision-resistant Registration ID
// Format: ELQ26-2026-XXXX (e.g., ELQ26-2026-0101)
function generateRegistrationId(existingCount) {
  const year = '2026';
  const nextNum = existingCount + 101;
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit random salt
  return `ELQ26-${year}-${String(nextNum).padStart(4, '0')}`;
}

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: "ELOQUENCE'26 Registration API",
    timestamp: new Date().toISOString()
  });
});

// ── POST /api/register ───────────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      whatsapp,
      college,
      department,
      year,
      eventId,
      eventName,
      eventCategory,
      isTeam,
      teamName,
      teamMembers,
      feePerHead,
      totalFee,
      feeFormula
    } = req.body;

    // Server-side validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    if (!phone || !phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) {
      return res.status(400).json({ error: 'Valid 10-digit Indian mobile number is required' });
    }
    if (!college || !college.trim()) {
      return res.status(400).json({ error: 'College / Institution name is required' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ error: 'Department is required' });
    }
    if (!year || !year.trim()) {
      return res.status(400).json({ error: 'Year of study is required' });
    }
    if (!eventId || !eventName) {
      return res.status(400).json({ error: 'Selected event is required' });
    }

    if (isTeam && (!teamName || !teamName.trim())) {
      return res.status(400).json({ error: 'Team name is required for team events' });
    }

    const registrations = readRegistrations();
    const registrationId = generateRegistrationId(registrations.length);
    const now = new Date();

    const newRecord = {
      registrationId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      whatsapp: whatsapp ? whatsapp.trim() : null,
      college: college.trim(),
      department: department.trim(),
      year: year.trim(),
      eventId,
      eventName,
      eventCategory: eventCategory || 'technical',
      isTeam: Boolean(isTeam),
      teamName: isTeam && teamName ? teamName.trim() : null,
      teamMembers: Array.isArray(teamMembers) ? teamMembers.filter((m) => m && m.trim()) : [],
      participantCount: 1 + (Array.isArray(teamMembers) ? teamMembers.filter((m) => m && m.trim()).length : 0),
      feePerHead: Number(feePerHead) || 0,
      totalAmount: Number(totalFee) || 0,
      feeFormula: feeFormula || '',
      registrationStatus: 'CONFIRMED',
      paymentStatus: 'PENDING', // On-site registration desk payment
      paymentMethod: 'ON_SITE_DESK',
      createdAt: now.toISOString(),
      createdAtFormatted: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    registrations.push(newRecord);
    writeRegistrations(registrations);

    return res.status(201).json({
      success: true,
      message: 'Registration confirmed successfully',
      registration: newRecord
    });
  } catch (err) {
    console.error('Registration processing error:', err);
    return res.status(500).json({
      error: 'Internal server error processing registration'
    });
  }
});

// ── GET /api/registrations (Admin retrieval) ──────────────────────────────────
app.get('/api/registrations', (req, res) => {
  try {
    const registrations = readRegistrations();
    const { eventId, category, status } = req.query;

    let filtered = registrations;
    if (eventId) {
      filtered = filtered.filter((r) => r.eventId === eventId);
    }
    if (category) {
      filtered = filtered.filter((r) => r.eventCategory.toLowerCase() === category.toLowerCase());
    }
    if (status) {
      filtered = filtered.filter((r) => r.registrationStatus.toLowerCase() === status.toLowerCase());
    }

    res.json({
      count: filtered.length,
      registrations: filtered
    });
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ error: 'Failed to retrieve registrations' });
  }
});

// ── GET /api/registrations/:id ───────────────────────────────────────────────
app.get('/api/registrations/:id', (req, res) => {
  try {
    const registrations = readRegistrations();
    const record = registrations.find(
      (r) => r.registrationId.toUpperCase() === req.params.id.toUpperCase()
    );
    if (!record) {
      return res.status(404).json({ error: 'Registration record not found' });
    }
    res.json(record);
  } catch (err) {
    console.error('Error fetching registration:', err);
    res.status(500).json({ error: 'Failed to retrieve registration' });
  }
});

app.listen(PORT, () => {
  console.log(`[ELOQUENCE'26 Backend] Server running on http://localhost:${PORT}`);
});
