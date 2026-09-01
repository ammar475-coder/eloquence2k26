const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');
const rolesFilePath = path.join(__dirname, '../data/roles.json');

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

  // If role name changed, update all users with the old role name
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

  // Check if any user is currently assigned this role
  const users = getUsersData();
  const assignedUsers = users.filter(u => u.role === roleName);
  if (assignedUsers.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: `Cannot delete role '${roleName}' because ${assignedUsers.length} user(s) are currently assigned to it. Reassign their roles first.` 
    });
  }

  roles.splice(roleIndex, 1);
  saveRolesData(roles);

  res.json({ success: true, message: 'Role deleted successfully' });
};

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

exports.getDashboardData = (req, res) => {
  res.json({
    success: true,
    data: {
      stats: {
        totalRegistrations: 42,
        revenue: 15000,
        eventsActive: 8
      },
      recentRegistrations: [
        { id: 1, name: 'John Doe', event: 'Code Debugging', date: '2026-09-01' },
        { id: 2, name: 'Jane Smith', event: 'Web Design', date: '2026-09-01' }
      ]
    }
  });
};

exports.getUsers = (req, res) => {
  // Only superadmins or authorized roles should see all users
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const users = getUsersData().map(u => ({ id: u.id, username: u.username, role: u.role })); // hide passwords
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

  const newUser = {
    id: Date.now(),
    username,
    password,
    role
  };

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

  // Prevent editing another superadmin unless you are a superadmin
  if (users[userIndex].role === 'superadmin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Cannot modify a superadmin' });
  }

  // Check if new username conflicts
  if (users.find(u => u.username === username && u.id !== parseInt(id, 10))) {
    return res.status(400).json({ success: false, message: 'Username already taken' });
  }

  users[userIndex].username = username;
  users[userIndex].role = role;
  if (password) { // Only update password if provided
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
