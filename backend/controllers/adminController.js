const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');
const rolesFilePath = path.join(__dirname, '../data/roles.json');
const eventsFilePath = path.join(__dirname, '../data/events.json');
const sponsorsFilePath = path.join(__dirname, '../data/sponsors.json');
const coordinatorsFilePath = path.join(__dirname, '../data/coordinators.json');
const registrationsFilePath = path.join(__dirname, '../data/registrations.json');
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ==================== DATA ACCESS HELPERS ====================
const getUsersData = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveUsersData = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing users.json:', err);
  }
};

const getRolesData = () => {
  try {
    const data = fs.readFileSync(rolesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveRolesData = (roles) => {
  try {
    fs.writeFileSync(rolesFilePath, JSON.stringify(roles, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing roles.json:', err);
  }
};

const getEventsData = () => {
  try {
    const data = fs.readFileSync(eventsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveEventsData = (events) => {
  try {
    fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing events.json:', err);
  }
};

const getSponsorsData = () => {
  try {
    const data = fs.readFileSync(sponsorsFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
};

const saveSponsorsData = (sponsors) => {
  try {
    fs.writeFileSync(sponsorsFilePath, JSON.stringify(sponsors, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing sponsors.json:', err);
    return false;
  }
};

const getCoordinatorsData = () => {
  try {
    const data = fs.readFileSync(coordinatorsFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
};

const saveCoordinatorsData = (coordinators) => {
  try {
    fs.writeFileSync(coordinatorsFilePath, JSON.stringify(coordinators, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing coordinators.json:', err);
    return false;
  }
};

const getRegistrationsData = () => {
  try {
    const data = fs.readFileSync(registrationsFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
};

// ==================== AUTH & TOKEN ====================
exports.login = (req, res) => {
  const { username, password } = req.body;

  const users = getUsersData();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.json({ success: true, token, user: { username: user.username, role: user.role } });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ==================== DASHBOARD STATS ====================
exports.getDashboardData = (req, res) => {
  try {
    const registrations = getRegistrationsData();
    const sponsors = getSponsorsData();
    const coordinators = getCoordinatorsData();
    const events = getEventsData();

    const totalRevenue = registrations.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const activeSponsors = sponsors.filter(s => s.isActive !== false);
    const activeCoordinators = coordinators.filter(c => c.isActive !== false);

    // Format recent registrations
    const recentRegistrations = [...registrations]
      .reverse()
      .slice(0, 5)
      .map(r => ({
        id: r.registrationId || r.id,
        name: r.fullName || 'Anonymous',
        event: r.eventName || 'General Registration',
        date: r.createdAtFormatted || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recent')
      }));

    res.json({
      success: true,
      data: {
        stats: {
          totalRegistrations: registrations.length,
          revenue: totalRevenue,
          eventsActive: events.length || 12,
          totalSponsors: sponsors.length,
          activeSponsors: activeSponsors.length,
          totalCoordinators: coordinators.length,
          activeCoordinators: activeCoordinators.length
        },
        recentRegistrations
      }
    });
  } catch (err) {
    console.error('Error in getDashboardData:', err);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard metrics' });
  }
};

// ==================== USER MANAGEMENT ====================
exports.getUsers = (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const users = getUsersData().map(u => ({ id: u.id, username: u.username, role: u.role }));
  res.json({ success: true, data: users });
};

exports.createUser = (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const users = getUsersData();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  const newUser = { id: Date.now(), username, password, role };
  users.push(newUser);
  saveUsersData(users);

  res.json({ success: true, message: 'User created successfully', data: { id: newUser.id, username: newUser.username, role: newUser.role } });
};

exports.updateUser = (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;
  const { username, password, role } = req.body;
  
  if (!username || !role) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const users = getUsersData();
  const userIndex = users.findIndex(u => u.id === parseInt(id, 10));

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (users[userIndex].role === 'superadmin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Cannot modify a superadmin' });
  }

  if (users.find(u => u.username === username && u.id !== parseInt(id, 10))) {
    return res.status(400).json({ success: false, message: 'Username already taken' });
  }

  users[userIndex].username = username;
  users[userIndex].role = role;
  if (password) {
    users[userIndex].password = password;
  }

  saveUsersData(users);
  res.json({ success: true, message: 'User updated successfully', data: { id: users[userIndex].id, username: users[userIndex].username, role: users[userIndex].role } });
};

exports.deleteUser = (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;
  const users = getUsersData();
  const userIndex = users.findIndex(u => u.id === parseInt(id, 10));

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (users[userIndex].username === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot delete the primary admin account' });
  }
  
  if (users[userIndex].role === 'superadmin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Cannot delete a superadmin' });
  }

  if (users[userIndex].id === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }

  users.splice(userIndex, 1);
  saveUsersData(users);

  res.json({ success: true, message: 'User deleted successfully' });
};

// ==================== ROLE MANAGEMENT ====================
exports.getRoles = (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const roles = getRolesData();
  res.json({ success: true, data: roles });
};

exports.createRole = (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Role name required' });
  }

  const roles = getRolesData();
  const normalizedName = name.toLowerCase().trim();

  if (roles.find(r => r.name === normalizedName)) {
    return res.status(400).json({ success: false, message: 'Role already exists' });
  }

  const newRole = { id: Date.now(), name: normalizedName };
  roles.push(newRole);
  saveRolesData(roles);

  res.json({ success: true, message: 'Role created successfully', data: newRole });
};

exports.updateRole = (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Role name required' });
  }

  const roles = getRolesData();
  const roleIndex = roles.findIndex(r => r.id === parseInt(id, 10) || r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({ success: false, message: 'Role not found' });
  }

  const oldRoleName = roles[roleIndex].name;
  const normalizedName = name.toLowerCase().trim();

  if (oldRoleName === 'superadmin' && normalizedName !== 'superadmin') {
    return res.status(400).json({ success: false, message: 'Cannot rename system superadmin role' });
  }

  if (roles.find(r => r.name === normalizedName && (r.id !== parseInt(id, 10) && r.id !== id))) {
    return res.status(400).json({ success: false, message: 'Role name already in use' });
  }

  roles[roleIndex].name = normalizedName;
  saveRolesData(roles);

  if (oldRoleName !== normalizedName) {
    const users = getUsersData();
    let updated = false;
    users.forEach(u => {
      if (u.role === oldRoleName) {
        u.role = normalizedName;
        updated = true;
      }
    });
    if (updated) {
      saveUsersData(users);
    }
  }

  res.json({ success: true, message: 'Role updated successfully', data: roles[roleIndex] });
};

exports.deleteRole = (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;
  const roles = getRolesData();
  const roleIndex = roles.findIndex(r => r.id === parseInt(id, 10) || r.id === id);

  if (roleIndex === -1) {
    return res.status(404).json({ success: false, message: 'Role not found' });
  }

  const roleName = roles[roleIndex].name;
  if (roleName === 'superadmin' || roleName === 'admin') {
    return res.status(400).json({ success: false, message: `Cannot delete primary system role '${roleName}'` });
  }

  const users = getUsersData();
  const assignedUsers = users.filter(u => u.role === roleName);
  if (assignedUsers.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: `Cannot delete role '${roleName}' because ${assignedUsers.length} user(s) are currently assigned to it.` 
    });
  }

  roles.splice(roleIndex, 1);
  saveRolesData(roles);

  res.json({ success: true, message: 'Role deleted successfully' });
};

// ==================== EVENT MANAGEMENT ====================
exports.getEvents = (req, res) => {
  const events = getEventsData();
  res.json({ success: true, data: events });
};

exports.updateEvent = (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;
  const { name, venue, timing, fee, feePerHead, feeType, teamSize, subtitle, tag, description } = req.body;

  const events = getEventsData();
  const eventIndex = events.findIndex(e => e.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (name) events[eventIndex].name = name;
  if (venue !== undefined) events[eventIndex].venue = venue;
  if (timing !== undefined) events[eventIndex].timing = timing;
  if (fee !== undefined) events[eventIndex].fee = fee;
  if (feePerHead !== undefined) events[eventIndex].feePerHead = feePerHead;
  if (feeType !== undefined) events[eventIndex].feeType = feeType;
  if (teamSize !== undefined) events[eventIndex].teamSize = teamSize;
  if (subtitle !== undefined) events[eventIndex].subtitle = subtitle;
  if (tag !== undefined) events[eventIndex].tag = tag;
  if (description !== undefined) events[eventIndex].description = description;

  saveEventsData(events);

  res.json({ 
    success: true, 
    message: 'Event updated successfully', 
    data: events[eventIndex] 
  });
};

// ==================== SPONSOR MANAGEMENT ====================
exports.getSponsors = (req, res) => {
  const sponsors = getSponsorsData();
  sponsors.sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));
  res.json({ success: true, data: sponsors });
};

exports.getSponsorById = (req, res) => {
  const { id } = req.params;
  const sponsors = getSponsorsData();
  const sponsor = sponsors.find(s => s.id === id);
  if (!sponsor) {
    return res.status(404).json({ success: false, message: 'Sponsor not found' });
  }
  res.json({ success: true, data: sponsor });
};

exports.createSponsor = (req, res) => {
  const {
    name,
    companyName,
    logo,
    description,
    website,
    contactName,
    contactEmail,
    contactPhone,
    category,
    displayOrder,
    isActive
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Sponsor name is required' });
  }

  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
    return res.status(400).json({ success: false, message: 'Valid contact email address is required' });
  }

  const sponsors = getSponsorsData();
  const now = new Date().toISOString();
  const newSponsor = {
    id: `sponsor-${Date.now()}`,
    name: name.trim(),
    companyName: companyName ? companyName.trim() : '',
    logo: logo ? logo.trim() : '',
    description: description ? description.trim() : '',
    website: website ? website.trim() : '',
    contactName: contactName ? contactName.trim() : '',
    contactEmail: contactEmail ? contactEmail.trim().toLowerCase() : '',
    contactPhone: contactPhone ? contactPhone.trim() : '',
    category: category || 'Gold Sponsor',
    displayOrder: displayOrder !== undefined && displayOrder !== '' ? Number(displayOrder) : sponsors.length + 1,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    createdAt: now,
    updatedAt: now
  };

  sponsors.push(newSponsor);
  saveSponsorsData(sponsors);

  res.status(201).json({ success: true, message: 'Sponsor created successfully', data: newSponsor });
};

exports.updateSponsor = (req, res) => {
  const { id } = req.params;
  const {
    name,
    companyName,
    logo,
    description,
    website,
    contactName,
    contactEmail,
    contactPhone,
    category,
    displayOrder,
    isActive
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Sponsor name is required' });
  }

  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
    return res.status(400).json({ success: false, message: 'Valid contact email address is required' });
  }

  const sponsors = getSponsorsData();
  const index = sponsors.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Sponsor not found' });
  }

  const updatedSponsor = {
    ...sponsors[index],
    name: name.trim(),
    companyName: companyName !== undefined ? companyName.trim() : sponsors[index].companyName,
    logo: logo !== undefined ? logo.trim() : sponsors[index].logo,
    description: description !== undefined ? description.trim() : sponsors[index].description,
    website: website !== undefined ? website.trim() : sponsors[index].website,
    contactName: contactName !== undefined ? contactName.trim() : sponsors[index].contactName,
    contactEmail: contactEmail !== undefined ? contactEmail.trim().toLowerCase() : sponsors[index].contactEmail,
    contactPhone: contactPhone !== undefined ? contactPhone.trim() : sponsors[index].contactPhone,
    category: category || sponsors[index].category,
    displayOrder: displayOrder !== undefined && displayOrder !== '' ? Number(displayOrder) : sponsors[index].displayOrder,
    isActive: isActive !== undefined ? Boolean(isActive) : sponsors[index].isActive,
    updatedAt: new Date().toISOString()
  };

  sponsors[index] = updatedSponsor;
  saveSponsorsData(sponsors);

  res.json({ success: true, message: 'Sponsor updated successfully', data: updatedSponsor });
};

exports.toggleSponsorStatus = (req, res) => {
  const { id } = req.params;
  const sponsors = getSponsorsData();
  const sponsor = sponsors.find(s => s.id === id);

  if (!sponsor) {
    return res.status(404).json({ success: false, message: 'Sponsor not found' });
  }

  sponsor.isActive = !sponsor.isActive;
  sponsor.updatedAt = new Date().toISOString();
  saveSponsorsData(sponsors);

  res.json({ 
    success: true, 
    message: `Sponsor marked as ${sponsor.isActive ? 'Active' : 'Inactive'}`, 
    data: sponsor 
  });
};

exports.deleteSponsor = (req, res) => {
  const { id } = req.params;
  const sponsors = getSponsorsData();
  const index = sponsors.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Sponsor not found' });
  }

  sponsors.splice(index, 1);
  saveSponsorsData(sponsors);

  res.json({ success: true, message: 'Sponsor deleted successfully' });
};

// ==================== LOGO UPLOAD ====================
exports.uploadLogo = (req, res) => {
  try {
    const { imageBase64, fileName } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    // Format: "data:image/png;base64,..."
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid base64 image data' });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    const allowedMime = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/gif': 'gif'
    };

    if (!allowedMime[mimeType]) {
      return res.status(400).json({ success: false, message: 'Unsupported file type. Use PNG, JPG, WEBP, or SVG.' });
    }

    const ext = allowedMime[mimeType];
    const safeName = `sponsor-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const publicUrl = `/uploads/${safeName}`;
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      url: publicUrl,
      fileName: safeName
    });
  } catch (err) {
    console.error('Logo upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to process logo upload' });
  }
};

// ==================== COORDINATOR MANAGEMENT ====================
exports.getCoordinators = (req, res) => {
  const coordinators = getCoordinatorsData();
  coordinators.sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));
  res.json({ success: true, data: coordinators });
};

exports.getCoordinatorById = (req, res) => {
  const { id } = req.params;
  const coordinators = getCoordinatorsData();
  const coordinator = coordinators.find(c => c.id === id);
  if (!coordinator) {
    return res.status(404).json({ success: false, message: 'Coordinator not found' });
  }
  res.json({ success: true, data: coordinator });
};

exports.createCoordinator = (req, res) => {
  const {
    name,
    phone,
    whatsapp,
    email,
    department,
    year,
    role,
    assignedEvents,
    displayOrder,
    isActive
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required' });
  }

  if (!phone || !phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim().replace(/\s+/g, ''))) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit Indian phone number is required (e.g. 9876543210)' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Valid email address is required' });
  }

  if (!Array.isArray(assignedEvents) || assignedEvents.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one assigned event is required' });
  }

  const coordinators = getCoordinatorsData();
  const now = new Date().toISOString();
  const cleanPhone = phone.trim().replace(/\s+/g, '');

  const newCoordinator = {
    id: `coord-${Date.now()}`,
    name: name.trim(),
    phone: cleanPhone,
    whatsapp: whatsapp ? whatsapp.trim().replace(/\s+/g, '') : cleanPhone,
    email: email ? email.trim().toLowerCase() : '',
    department: department ? department.trim() : 'CSE',
    year: year ? year.trim() : '3rd Year',
    role: role || 'Lead Coordinator',
    assignedEvents: assignedEvents.filter(e => e && e.trim()),
    displayOrder: displayOrder !== undefined && displayOrder !== '' ? Number(displayOrder) : coordinators.length + 1,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    createdAt: now,
    updatedAt: now
  };

  coordinators.push(newCoordinator);
  saveCoordinatorsData(coordinators);

  res.status(201).json({ success: true, message: 'Student coordinator created successfully', data: newCoordinator });
};

exports.updateCoordinator = (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    whatsapp,
    email,
    department,
    year,
    role,
    assignedEvents,
    displayOrder,
    isActive
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required' });
  }

  if (!phone || !phone.trim() || !/^[6-9]\d{9}$/.test(phone.trim().replace(/\s+/g, ''))) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit Indian phone number is required (e.g. 9876543210)' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Valid email address is required' });
  }

  if (!Array.isArray(assignedEvents) || assignedEvents.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one assigned event is required' });
  }

  const coordinators = getCoordinatorsData();
  const index = coordinators.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Coordinator not found' });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const updatedCoordinator = {
    ...coordinators[index],
    name: name.trim(),
    phone: cleanPhone,
    whatsapp: whatsapp !== undefined ? whatsapp.trim().replace(/\s+/g, '') : coordinators[index].whatsapp,
    email: email !== undefined ? email.trim().toLowerCase() : coordinators[index].email,
    department: department !== undefined ? department.trim() : coordinators[index].department,
    year: year !== undefined ? year.trim() : coordinators[index].year,
    role: role || coordinators[index].role,
    assignedEvents: assignedEvents.filter(e => e && e.trim()),
    displayOrder: displayOrder !== undefined && displayOrder !== '' ? Number(displayOrder) : coordinators[index].displayOrder,
    isActive: isActive !== undefined ? Boolean(isActive) : coordinators[index].isActive,
    updatedAt: new Date().toISOString()
  };

  coordinators[index] = updatedCoordinator;
  saveCoordinatorsData(coordinators);

  res.json({ success: true, message: 'Coordinator updated successfully', data: updatedCoordinator });
};

exports.toggleCoordinatorStatus = (req, res) => {
  const { id } = req.params;
  const coordinators = getCoordinatorsData();
  const coordinator = coordinators.find(c => c.id === id);

  if (!coordinator) {
    return res.status(404).json({ success: false, message: 'Coordinator not found' });
  }

  coordinator.isActive = !coordinator.isActive;
  coordinator.updatedAt = new Date().toISOString();
  saveCoordinatorsData(coordinators);

  res.json({ 
    success: true, 
    message: `Coordinator marked as ${coordinator.isActive ? 'Active' : 'Inactive'}`, 
    data: coordinator 
  });
};

exports.deleteCoordinator = (req, res) => {
  const { id } = req.params;
  const coordinators = getCoordinatorsData();
  const index = coordinators.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Coordinator not found' });
  }

  coordinators.splice(index, 1);
  saveCoordinatorsData(coordinators);

  res.json({ success: true, message: 'Coordinator deleted successfully' });
};
