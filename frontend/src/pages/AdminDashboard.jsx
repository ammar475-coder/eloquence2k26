import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaChartBar, FaUsers, FaSignOutAlt, FaPlus, FaUserShield, FaEdit, FaTrash, FaUserTag } from 'react-icons/fa';

export default function AdminDashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Users State
  const [users, setUsers] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
  // Roles State
  const [roles, setRoles] = useState([]);
  const [isRoleFormVisible, setIsRoleFormVisible] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchRoles();
  }, [token]);

  const fetchDashboardData = () => {
    fetch('/api/admin/dashboard', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
        else handleAuthError();
      })
      .catch(handleAuthError)
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => { if (result.success) setUsers(result.data); })
      .catch(console.error);
  };

  const fetchRoles = () => {
    fetch('/api/admin/roles', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => { 
        if (result.success) {
          setRoles(result.data);
          if (result.data.length > 0 && !role) {
            setRole(result.data[0].name);
          }
        }
      })
      .catch(console.error);
  };

  const handleAuthError = () => {
    toast.error('Session expired or unauthorized');
    onLogout();
  };

  const resetUserForm = () => {
    setUsername('');
    setPassword('');
    setRole(roles.length > 0 ? roles[0].name : '');
    setEditingUserId(null);
    setIsFormVisible(false);
  };

  const handleOpenCreateForm = () => {
    setIsRoleFormVisible(false);
    resetUserForm();
    setIsFormVisible(true);
  };

  const handleOpenEditForm = (user) => {
    setIsRoleFormVisible(false);
    setUsername(user.username);
    setPassword('');
    setRole(user.role);
    setEditingUserId(user.id);
    setIsFormVisible(true);
  };

  const handleOpenRoleForm = () => {
    setIsFormVisible(false);
    setNewRoleName('');
    setIsRoleFormVisible(true);
  };

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleName) return toast.error('Role name required');

    const loadingToast = toast.loading('Creating role...');
    fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newRoleName })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Role created!', { id: loadingToast });
          setRoles([...roles, result.data]);
          setIsRoleFormVisible(false);
          setNewRoleName('');
        } else {
          toast.error(result.message || 'Failed to create role', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  const handleSubmitUser = (e) => {
    e.preventDefault();
    if (!username || !role) return toast.error('Fill required fields');
    if (!editingUserId && !password) return toast.error('Password required for new users');

    const loadingToast = toast.loading(editingUserId ? 'Updating user...' : 'Creating user...');
    const method = editingUserId ? 'PUT' : 'POST';
    const url = editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username, password, role })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success(`User ${editingUserId ? 'updated' : 'created'} successfully!`, { id: loadingToast });
          if (editingUserId) setUsers(users.map(u => u.id === editingUserId ? result.data : u));
          else setUsers([...users, result.data]);
          resetUserForm();
        } else {
          toast.error(result.message || 'Operation failed', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  const handleDeleteUser = (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const loadingToast = toast.loading('Deleting user...');

    fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('User deleted successfully', { id: loadingToast });
          setUsers(users.filter(u => u.id !== id));
        } else {
          toast.error(result.message || 'Failed to delete user', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoCircle}><FaUserShield size={24} /></div>
          <h2 style={styles.sidebarTitle}>Admin Panel</h2>
        </div>
        
        <nav style={styles.navMenu}>
          <button style={activeTab === 'dashboard' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem} onClick={() => setActiveTab('dashboard')}>
            <FaChartBar style={styles.navIcon} /> Dashboard
          </button>
          <button style={activeTab === 'roles' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem} onClick={() => setActiveTab('roles')}>
            <FaUsers style={styles.navIcon} /> Roles Management
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={onLogout} style={styles.logoutBtn}><FaSignOutAlt style={styles.navIcon} /> Log Out</button>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.topHeader}>
          <h1 style={styles.pageTitle}>{activeTab === 'dashboard' ? 'Overview Dashboard' : 'Roles & Access Management'}</h1>
          <div style={styles.userProfile}><div style={styles.avatar}>A</div></div>
        </header>

        <div style={styles.contentWrapper}>
          {activeTab === 'dashboard' && (
            <div style={styles.dashboardView}>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Registrations</div>
                  <div style={styles.statValue}>{data?.stats?.totalRegistrations || 0}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Revenue Collected</div>
                  <div style={styles.statValue}>₹{data?.stats?.revenue || 0}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Active Events</div>
                  <div style={styles.statValue}>{data?.stats?.eventsActive || 0}</div>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Recent Registrations</h3>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Participant Name</th>
                        <th style={styles.th}>Event Enrolled</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.recentRegistrations?.map(reg => (
                        <tr key={reg.id} style={styles.tr}>
                          <td style={styles.td}><span style={styles.idBadge}>#{reg.id}</span></td>
                          <td style={styles.td}><span style={styles.strongText}>{reg.name}</span></td>
                          <td style={styles.td}>{reg.event}</td>
                          <td style={styles.td}>{reg.date}</td>
                        </tr>
                      ))}
                      {!data?.recentRegistrations?.length && <tr><td colSpan="4" style={styles.emptyState}>No recent registrations found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div style={styles.rolesView}>
              <div style={styles.rolesHeader}>
                <button onClick={handleOpenRoleForm} style={styles.secondaryBtn}>
                  <FaUserTag style={{ marginRight: '8px' }} /> Manage Roles
                </button>
                <button onClick={handleOpenCreateForm} style={styles.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Create New User
                </button>
              </div>

              {/* Manage Roles Form */}
              {isRoleFormVisible && (
                <div style={styles.card}>
                  <div style={styles.formHeader}>
                    <h3 style={styles.cardTitle}>Create Custom Role</h3>
                    <button onClick={() => setIsRoleFormVisible(false)} style={styles.closeBtn}>Cancel</button>
                  </div>
                  <form onSubmit={handleCreateRole} style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Role Name</label>
                      <input 
                        type="text" 
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        style={styles.input}
                        placeholder="e.g., event_manager"
                        required 
                      />
                    </div>
                    <div style={styles.formActions}>
                      <button type="submit" style={styles.primaryBtn}>Save Role</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Create/Edit User Form */}
              {isFormVisible && (
                <div style={styles.card}>
                  <div style={styles.formHeader}>
                    <h3 style={styles.cardTitle}>{editingUserId ? 'Edit User' : 'Create New User'}</h3>
                    <button onClick={resetUserForm} style={styles.closeBtn}>Cancel</button>
                  </div>
                  <form onSubmit={handleSubmitUser} style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Username</label>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.input}
                        placeholder="Enter username"
                        required 
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Password {editingUserId && '(Leave blank to keep current)'}</label>
                      <input 
                        type="text" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        placeholder={editingUserId ? "Enter new password" : "Secure password"}
                        required={!editingUserId} 
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Assign Role</label>
                      <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        style={styles.select}
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div style={styles.formActions}>
                      <button type="submit" style={styles.primaryBtn}>
                        {editingUserId ? 'Save Changes' : 'Create Account'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Users List */}
              <div style={{ ...styles.card, marginTop: (isFormVisible || isRoleFormVisible) ? '2rem' : '0' }}>
                <h3 style={styles.cardTitle}>Current Users</h3>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Username</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Status</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} style={styles.tr}>
                          <td style={styles.td}><span style={styles.strongText}>{user.username}</span></td>
                          <td style={styles.td}>
                            <span style={styles.roleBadgeBasic}>
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}><span style={styles.statusActive}>● Active</span></td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button onClick={() => handleOpenEditForm(user)} style={styles.actionBtnEdit} title="Edit User"><FaEdit /></button>
                            <button onClick={() => handleDeleteUser(user.id)} style={styles.actionBtnDelete} title="Delete User"><FaTrash /></button>
                          </td>
                        </tr>
                      ))}
                      {!users.length && <tr><td colSpan="4" style={styles.emptyState}>No users found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '"Inter", sans-serif' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' },
  spinner: { width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  sidebar: { width: '260px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.02)' },
  sidebarHeader: { padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' },
  logoCircle: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  sidebarTitle: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' },
  navMenu: { flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  navItem: { display: 'flex', alignItems: 'center', padding: '0.875rem 1rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', textAlign: 'left' },
  navItemActive: { background: '#eff6ff', color: '#2563eb', fontWeight: '600' },
  navIcon: { marginRight: '12px', fontSize: '1.1rem' },
  sidebarFooter: { padding: '1.5rem', borderTop: '1px solid #f1f5f9' },
  logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.875rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' },
  topHeader: { background: '#ffffff', height: '80px', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 },
  pageTitle: { margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' },
  userProfile: { display: 'flex', alignItems: 'center' },
  avatar: { width: '40px', height: '40px', background: '#e2e8f0', color: '#475569', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.2rem', border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  contentWrapper: { padding: '2rem', flex: 1, overflowY: 'auto' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  statLabel: { color: '#64748b', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' },
  statValue: { color: '#0f172a', fontSize: '2.5rem', fontWeight: '800' },
  card: { background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' },
  cardTitle: { margin: 0, padding: '1.5rem', borderBottom: '1px solid #e2e8f0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', background: '#f8fafc' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#ffffff', padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '1rem 1.5rem', color: '#334155', fontSize: '0.9rem' },
  strongText: { fontWeight: '600', color: '#0f172a' },
  idBadge: { background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' },
  emptyState: { padding: '3rem', textAlign: 'center', color: '#94a3b8' },
  rolesView: { display: 'flex', flexDirection: 'column' },
  rolesHeader: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem' },
  createBtn: { display: 'flex', alignItems: 'center', background: '#2563eb', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
  secondaryBtn: { display: 'flex', alignItems: 'center', background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  closeBtn: { marginRight: '1.5rem', background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' },
  formGrid: { padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  formActions: { display: 'flex', alignItems: 'flex-end', flex: 1 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px', flex: 1 },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#334155' },
  input: { padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' },
  select: { padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', background: '#ffffff' },
  primaryBtn: { padding: '0.75rem 1.5rem', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
  roleBadgeBasic: { background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' },
  statusActive: { color: '#10b981', fontWeight: '600', fontSize: '0.85rem' },
  actionBtnEdit: { background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '1rem', marginRight: '1rem' },
  actionBtnDelete: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }
};
