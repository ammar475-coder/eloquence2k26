const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password); // Plain text check based on current DB setup

    if (error) throw error;

    if (users && users.length > 0) {
      const user = users[0];
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );
      return res.json({ success: true, token, user: { username: user.username, role: user.role } });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.getDashboardData = async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    // Fetch all registrations
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        id,
        primary_contact_name,
        total_fee,
        created_at,
        events (
          name,
          category
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const totalRegistrations = registrations ? registrations.length : 0;
    const revenue = registrations ? registrations.reduce((acc, curr) => acc + (curr.total_fee || 0), 0) : 0;

    // Format recent registrations for the dashboard
    const recentRegistrations = (registrations || []).slice(0, 10).map(reg => ({
      id: reg.id,
      name: reg.primary_contact_name,
      event: reg.events ? reg.events.name : 'Unknown Event',
      date: new Date(reg.created_at).toLocaleDateString('en-IN')
    }));

    // Mocking active events for now until we fully query the events table for status
    res.json({
      success: true,
      data: {
        stats: {
          totalRegistrations,
          revenue,
          eventsActive: 12
        },
        recentRegistrations
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
  }
};

exports.getRoles = async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  
  try {
    const { data: roles, error } = await supabase.from('roles').select('*');
    if (error) throw error;
    res.json({ success: true, data: roles });
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ success: false, message: 'Error fetching roles' });
  }
};

exports.createRole = async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Role name required' });

  const normalizedName = name.toLowerCase().trim();

  try {
    const { data, error } = await supabase
      .from('roles')
      .insert([{ name: normalizedName }])
      .select();
      
    if (error) {
      if (error.code === '23505') { // Unique violation in Postgres
        return res.status(400).json({ success: false, message: 'Role already exists' });
      }
      throw error;
    }

    res.json({ success: true, message: 'Role created successfully', data: data[0] });
  } catch (err) {
    console.error('Error creating role:', err);
    res.status(500).json({ success: false, message: 'Error creating role' });
  }
};

exports.getUsers = async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role'); // Exclude password from fetch

    if (error) throw error;
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password, role }])
      .select('id, username, role');
      
    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      if (error.code === '23503') { // Foreign key violation
        return res.status(400).json({ success: false, message: 'Invalid role specified' });
      }
      throw error;
    }

    res.json({ success: true, message: 'User created successfully', data: data[0] });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
};

exports.updateUser = async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;
  const { username, password, role } = req.body;
  
  if (!username || !role) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // 1. Fetch current user to enforce security checks
    const { data: targetUsers, error: targetError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id);

    if (targetError) throw targetError;
    if (!targetUsers || targetUsers.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const targetUser = targetUsers[0];

    // Prevent editing another superadmin unless you are a superadmin
    if (targetUser.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot modify a superadmin' });
    }

    // 2. Perform Update
    const updateData = { username, role };
    if (password) {
      updateData.password = password;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, username, role');

    if (error) {
      if (error.code === '23505') return res.status(400).json({ success: false, message: 'Username already taken' });
      throw error;
    }

    res.json({ success: true, message: 'User updated successfully', data: data[0] });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;

  try {
    // 1. Fetch current user to enforce security checks
    const { data: targetUsers, error: targetError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id);

    if (targetError) throw targetError;
    if (!targetUsers || targetUsers.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const targetUser = targetUsers[0];

    if (targetUser.username === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete the primary admin account' });
    }
    
    if (targetUser.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Cannot delete a superadmin' });
    }

    // String comparison vs Int for IDs (JWT payload might be different type depending on DB schema)
    if (targetUser.id.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // 2. Perform Delete
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};
