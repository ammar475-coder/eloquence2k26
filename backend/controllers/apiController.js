<<<<<<< HEAD
const supabase = require('../config/supabase');
=======
const fs = require('fs');
const path = require('path');

// Persistent Data Storage Path
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'registrations.json');
const SPONSORS_FILE = path.join(DATA_DIR, 'sponsors.json');
const COORDINATORS_FILE = path.join(DATA_DIR, 'coordinators.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function readRegistrations() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading registrations file:', err);
    return [];
  }
}

function writeRegistrations(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing registrations file:', err);
    return false;
  }
}

function readSponsors() {
  try {
    const raw = fs.readFileSync(SPONSORS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function readCoordinators() {
  try {
    const raw = fs.readFileSync(COORDINATORS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function generateRegistrationId(existingCount) {
  const year = '2026';
  const nextNum = existingCount + 101;
  return `ELQ26-${year}-${String(nextNum).padStart(4, '0')}`;
}
>>>>>>> 15fb93fdd29b33d6832e79b823712929df5586a7

exports.getStatus = (req, res) => {
  res.json({ success: true, message: 'API is working properly' });
};

<<<<<<< HEAD
exports.registerEvent = async (req, res) => {
  const { currentEvent, fields, totalFee } = req.body;
  
  if (!currentEvent || !fields) {
    return res.status(400).json({ success: false, message: 'Missing required data' });
  }

  // Generate a mock ticket code
  const ticketCode = `ELQ26-${currentEvent.category === 'technical' ? 'TCH' : 'NT'}-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    // 0. Auto-seed the event on the fly (This ensures the event exists in the database before registering!)
    await supabase.from('events').upsert([{
      id: currentEvent.id,
      name: currentEvent.name,
      category: currentEvent.category,
      team_size: currentEvent.teamSize || null,
      min_members: currentEvent.minMembers || 1,
      max_members: currentEvent.maxMembers || 1,
      fee_type: currentEvent.feeType || 'per_head',
      fee_per_head: currentEvent.feePerHead || 50
    }], { onConflict: 'id' });

    // 1. Insert into registrations table
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .insert([{
        event_id: currentEvent.id,
        ticket_code: ticketCode,
        team_name: fields.teamName || null,
        full_name: fields.fullName,
        email: fields.email,
        phone: fields.phone,
        college: fields.college,
        department: fields.department,
        year: fields.year,
        total_fee: totalFee,
        payment_status: 'pending'
      }])
      .select('id');

    if (regError) throw regError;
    const registrationId = regData[0].id;

    // 2. Insert team members if any
    if (fields.teamMembers && fields.teamMembers.length > 0) {
      const membersToInsert = fields.teamMembers.map(member => ({
        registration_id: registrationId,
        member_name: member.name,
        member_email: member.email || null,
        member_phone: member.phone || null
      }));

      const { error: membersError } = await supabase
        .from('registration_members')
        .insert(membersToInsert);

      if (membersError) throw membersError;
    }

    // Prepare response data for the ticket PDF
    const ticketData = {
      ticketCode,
      eventName: currentEvent.name,
      category: currentEvent.category,
      leadName: fields.fullName,
      college: fields.college,       // Not stored in DB yet based on current schema, but needed for PDF
      department: fields.department, // Not stored in DB yet based on current schema
      email: fields.email,
      phone: fields.phone,
      year: fields.year,             // Not stored in DB yet based on current schema
      teamName: fields.teamName || null,
      membersCount: 1 + (fields.teamMembers ? fields.teamMembers.length : 0),
      teamMembersList: fields.teamMembers || [],
      totalFee,
      venue: currentEvent.venue,
      timing: currentEvent.timing,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    res.json({
      success: true,
      message: 'Registration successful',
      ticketData
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database error during registration',
      errorDetails: err.message || JSON.stringify(err)
    });
  }
=======
exports.getHealth = (req, res) => {
  res.json({
    status: 'OK',
    service: "ELOQUENCE'26 Registration API",
    timestamp: new Date().toISOString()
  });
>>>>>>> 15fb93fdd29b33d6832e79b823712929df5586a7
};

exports.getPublicEvents = (req, res) => {
  try {
    const eventsFile = path.join(DATA_DIR, 'events.json');
    if (fs.existsSync(eventsFile)) {
      const data = fs.readFileSync(eventsFile, 'utf-8');
      return res.json({ success: true, data: JSON.parse(data) });
    }
    res.json({ success: true, data: [] });
  } catch (err) {
    console.error('Error reading events:', err);
    res.status(500).json({ success: false, message: 'Could not load events' });
  }
};

exports.registerEvent = (req, res) => {
  try {
    let {
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
      feeFormula,
      currentEvent,
      fields
    } = req.body;

    // Handle nested format if sent from legacy form
    if (fields) {
      fullName = fullName || fields.fullName;
      email = email || fields.email;
      phone = phone || fields.phone;
      whatsapp = whatsapp || fields.whatsapp;
      college = college || fields.college;
      department = department || fields.department;
      year = year || fields.year;
      teamName = teamName || fields.teamName;
      teamMembers = teamMembers || fields.teamMembers;
    }
    if (currentEvent) {
      eventId = eventId || currentEvent.id;
      eventName = eventName || currentEvent.name;
      eventCategory = eventCategory || currentEvent.category;
      isTeam = isTeam !== undefined ? isTeam : currentEvent.isTeam;
      feePerHead = feePerHead || currentEvent.feePerHead;
      totalFee = totalFee !== undefined ? totalFee : req.body.totalFee;
    }

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required', message: 'Full name is required' });
    }
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Valid email address is required', message: 'Valid email address is required' });
    }
    if (!phone || !phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit Indian mobile number is required', message: 'Valid 10-digit Indian mobile number is required' });
    }
    if (!college || !college.trim()) {
      return res.status(400).json({ success: false, error: 'College / Institution name is required', message: 'College / Institution name is required' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, error: 'Department is required', message: 'Department is required' });
    }
    if (!year || !year.trim()) {
      return res.status(400).json({ success: false, error: 'Year of study is required', message: 'Year of study is required' });
    }
    if (!eventId || !eventName) {
      return res.status(400).json({ success: false, error: 'Selected event is required', message: 'Selected event is required' });
    }

    if (isTeam && (!teamName || !teamName.trim())) {
      return res.status(400).json({ success: false, error: 'Team name is required for team events', message: 'Team name is required for team events' });
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
      paymentStatus: 'PENDING',
      paymentMethod: 'ON_SITE_DESK',
      createdAt: now.toISOString(),
      createdAtFormatted: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    registrations.push(newRecord);
    writeRegistrations(registrations);

    return res.status(201).json({
      success: true,
      message: 'Registration confirmed successfully',
      registration: newRecord,
      registrationId,
      ticketData: newRecord
    });
  } catch (err) {
    console.error('Registration processing error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing registration',
      message: 'Internal server error processing registration'
    });
  }
};

exports.getRegistrations = (req, res) => {
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
      success: true,
      count: filtered.length,
      registrations: filtered
    });
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve registrations' });
  }
};

exports.getRegistrationById = (req, res) => {
  try {
    const registrations = readRegistrations();
    const record = registrations.find(
      (r) => r.registrationId.toUpperCase() === req.params.id.toUpperCase()
    );
    if (!record) {
      return res.status(404).json({ success: false, error: 'Registration record not found' });
    }
    res.json(record);
  } catch (err) {
    console.error('Error fetching registration:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve registration' });
  }
};

// ==================== PUBLIC SPONSOR ENDPOINTS ====================
exports.getActiveSponsors = (req, res) => {
  try {
    const sponsors = readSponsors();
    const active = sponsors.filter(s => s.isActive !== false);
    active.sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));
    res.json({ success: true, count: active.length, data: active });
  } catch (err) {
    console.error('Error fetching active sponsors:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch sponsors' });
  }
};

exports.getPublicSponsorById = (req, res) => {
  try {
    const sponsors = readSponsors();
    const sponsor = sponsors.find(s => s.id === req.params.id && s.isActive !== false);
    if (!sponsor) {
      return res.status(404).json({ success: false, message: 'Sponsor not found' });
    }
    res.json({ success: true, data: sponsor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching sponsor' });
  }
};

// ==================== PUBLIC COORDINATOR ENDPOINTS ====================
exports.getActiveCoordinators = (req, res) => {
  try {
    const coordinators = readCoordinators();
    const active = coordinators.filter(c => c.isActive !== false);
    active.sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));
    res.json({ success: true, count: active.length, data: active });
  } catch (err) {
    console.error('Error fetching coordinators:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch coordinators' });
  }
};

exports.getCoordinatorsByEvent = (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const coordinators = readCoordinators();
    const matching = coordinators.filter(c => 
      c.isActive !== false && 
      Array.isArray(c.assignedEvents) && 
      c.assignedEvents.map(e => e.toLowerCase()).includes(eventId.toLowerCase())
    );

    matching.sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));

    res.json({
      success: true,
      eventId,
      count: matching.length,
      data: matching
    });
  } catch (err) {
    console.error('Error fetching event coordinators:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch coordinators for event' });
  }
};
