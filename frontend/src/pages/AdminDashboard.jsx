import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  FaChartBar, 
  FaUsers, 
  FaSignOutAlt, 
  FaPlus, 
  FaUserShield, 
  FaEdit, 
  FaTrash, 
  FaUserTag, 
  FaChevronDown, 
  FaChevronRight, 
  FaUserCheck,
  FaShieldAlt,
  FaKey,
  FaLock,
<<<<<<< HEAD
  FaSun,
  FaMoon
=======
  FaCalendarAlt,
  FaLaptopCode,
  FaGamepad,
  FaTrophy,
  FaBolt,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaSearch,
  FaCheckCircle,
  FaTimes,
  FaCircle,
  FaListUl
>>>>>>> 3d136d39c84c327736d92cfbf6a6c894128c0997
} from 'react-icons/fa';
import defaultEvents from '../data/events.js';

export default function AdminDashboard({ token, onLogout }) {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState('dashboard');
=======
  const [activeTab, setActiveTab] = useState('events');
>>>>>>> 3d136d39c84c327736d92cfbf6a6c894128c0997
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dark / Light Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'light');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('adminTheme', nextTheme);
  };

  const isDark = theme === 'dark';
  const styles = getDashboardStyles(isDark);

  // Users State
  const [users, setUsers] = useState([]);
  const [isUserFormVisible, setIsUserFormVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userSearch, setUserSearch] = useState('');

  // User Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('');

  // Roles State
  const [roles, setRoles] = useState([]);
  const [isRoleFormVisible, setIsRoleFormVisible] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleNameInput, setRoleNameInput] = useState('');

  // Events State
  const [eventsList, setEventsList] = useState(defaultEvents);
  const [eventFilter, setEventFilter] = useState('all');
  const [eventSearch, setEventSearch] = useState('');
  const [isEventEditModalOpen, setIsEventEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Event Edit Form Fields
  const [eventName, setEventName] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventTiming, setEventTiming] = useState('');
  const [eventFee, setEventFee] = useState('');
  const [eventTeamSize, setEventTeamSize] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchRoles();
    fetchEvents();
  }, [token]);

  // Handle ESC key to close modal overlays
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isUserFormVisible) resetUserForm();
        if (isRoleFormVisible) resetRoleForm();
        if (isEventEditModalOpen) resetEventEditModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUserFormVisible, isRoleFormVisible, isEventEditModalOpen]);

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
      .then(result => { 
        if (result.success) setUsers(result.data); 
      })
      .catch(console.error);
  };

  const fetchRoles = () => {
    fetch('/api/admin/roles', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => { 
        if (result.success) {
          setRoles(result.data);
          if (result.data.length > 0 && !userRole) {
            setUserRole(result.data[0].name);
          }
        }
      })
      .catch(console.error);
  };

  const fetchEvents = () => {
    fetch('/api/admin/events', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setEventsList(result.data);
        }
      })
      .catch(() => {
        // Fallback to defaultEvents if API is unreachable
      });
  };

  const handleAuthError = () => {
    toast.error('Session expired or unauthorized');
    onLogout();
  };

  // ==================== USER MANAGEMENT HANDLERS ====================
  const resetUserForm = () => {
    setUsername('');
    setPassword('');
    setUserRole(roles.length > 0 ? roles[0].name : '');
    setEditingUserId(null);
    setIsUserFormVisible(false);
  };

  const handleOpenCreateUserForm = () => {
    resetUserForm();
    setIsUserFormVisible(true);
  };

  const handleOpenEditUserForm = (user) => {
    setUsername(user.username);
    setPassword('');
    setUserRole(user.role);
    setEditingUserId(user.id);
    setIsUserFormVisible(true);
  };

  const handleSubmitUser = (e) => {
    e.preventDefault();
    if (!username || !userRole) return toast.error('Please fill in required fields');
    if (!editingUserId && !password) return toast.error('Password is required for new users');

    const loadingToast = toast.loading(editingUserId ? 'Updating user...' : 'Creating user...');
    const method = editingUserId ? 'PUT' : 'POST';
    const url = editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username, password, role: userRole })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success(`User ${editingUserId ? 'updated' : 'created'} successfully!`, { id: loadingToast });
          if (editingUserId) {
            setUsers(users.map(u => u.id === editingUserId ? result.data : u));
          } else {
            setUsers([...users, result.data]);
          }
          resetUserForm();
        } else {
          toast.error(result.message || 'Operation failed', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  const handleDeleteUser = (id, targetUsername) => {
    if (!window.confirm(`Are you sure you want to delete user "${targetUsername}"?`)) return;
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
          if (editingUserId === id) resetUserForm();
        } else {
          toast.error(result.message || 'Failed to delete user', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  // ==================== ROLE MANAGEMENT HANDLERS ====================
  const resetRoleForm = () => {
    setRoleNameInput('');
    setEditingRoleId(null);
    setIsRoleFormVisible(false);
  };

  const handleOpenCreateRoleForm = () => {
    resetRoleForm();
    setIsRoleFormVisible(true);
  };

  const handleOpenEditRoleForm = (roleItem) => {
    setRoleNameInput(roleItem.name);
    setEditingRoleId(roleItem.id);
    setIsRoleFormVisible(true);
  };

  const handleSubmitRole = (e) => {
    e.preventDefault();
    if (!roleNameInput.trim()) return toast.error('Role name is required');

    const loadingToast = toast.loading(editingRoleId ? 'Updating role...' : 'Creating role...');
    const method = editingRoleId ? 'PUT' : 'POST';
    const url = editingRoleId ? `/api/admin/roles/${editingRoleId}` : '/api/admin/roles';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: roleNameInput.trim() })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success(`Role ${editingRoleId ? 'updated' : 'created'} successfully!`, { id: loadingToast });
          if (editingRoleId) {
            setRoles(roles.map(r => r.id === editingRoleId ? result.data : r));
            fetchUsers();
          } else {
            setRoles([...roles, result.data]);
          }
          resetRoleForm();
        } else {
          toast.error(result.message || 'Operation failed', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  const handleDeleteRole = (id, roleName) => {
    if (!window.confirm(`Are you sure you want to delete role "${roleName}"?`)) return;
    const loadingToast = toast.loading('Deleting role...');

    fetch(`/api/admin/roles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Role deleted successfully', { id: loadingToast });
          setRoles(roles.filter(r => r.id !== id));
          if (editingRoleId === id) resetRoleForm();
        } else {
          toast.error(result.message || 'Failed to delete role', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  // ==================== EVENT MANAGEMENT HANDLERS ====================
  const resetEventEditModal = () => {
    setEditingEvent(null);
    setEventName('');
    setEventVenue('');
    setEventTiming('');
    setEventFee('');
    setEventTeamSize('');
    setIsEventEditModalOpen(false);
  };

  const handleOpenEditEventModal = (eventItem) => {
    setEditingEvent(eventItem);
    setEventName(eventItem.name || '');
    setEventVenue(eventItem.venue || '');
    setEventTiming(eventItem.timing || '');
    setEventFee(eventItem.fee || '');
    setEventTeamSize(eventItem.teamSize || '');
    setIsEventEditModalOpen(true);
  };

  const handleSubmitEventEdit = (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    if (!eventName.trim() || !eventVenue.trim() || !eventTiming.trim() || !eventFee.trim()) {
      return toast.error('Please fill in all required event details');
    }

    const loadingToast = toast.loading('Saving event changes...');

    fetch(`/api/admin/events/${editingEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        name: eventName.trim(),
        venue: eventVenue.trim(),
        timing: eventTiming.trim(),
        fee: eventFee.trim(),
        teamSize: eventTeamSize.trim()
      })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Event updated! Changes live on main events page.', { id: loadingToast });
          setEventsList(eventsList.map(item => item.id === editingEvent.id ? result.data : item));
          resetEventEditModal();
        } else {
          toast.error(result.message || 'Failed to update event', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server connection error', { id: loadingToast }));
  };

  // Helper for counting users in a role
  const getUserCountForRole = (rName) => {
    return users.filter(u => u.role?.toLowerCase() === rName.toLowerCase()).length;
  };

  // Filtered users
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filtered events
  const filteredEventsList = eventsList.filter(e => {
    const matchesCategory = eventFilter === 'all' || e.category === eventFilter;
    const matchesSearch = eventSearch.trim() === '' || 
      e.name.toLowerCase().includes(eventSearch.toLowerCase()) ||
      (e.venue && e.venue.toLowerCase().includes(eventSearch.toLowerCase())) ||
      (e.timing && e.timing.toLowerCase().includes(eventSearch.toLowerCase())) ||
      (e.fee && e.fee.toLowerCase().includes(eventSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  const isUserManagementActive = activeTab === 'manage-users' || activeTab === 'manage-roles';

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoCircle}>
            <FaUserShield size={22} />
          </div>
          <div>
            <h2 style={styles.sidebarTitle}>Admin Panel</h2>
            <span style={styles.sidebarSubtitle}>Eloquence 2026</span>
          </div>
        </div>
        
        <nav style={styles.navMenu}>
          {/* Dashboard Tab */}
          <button 
            style={activeTab === 'dashboard' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem} 
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartBar style={styles.navIcon} /> Dashboard
          </button>

          {/* User Management Dropdown Group */}
          <div style={styles.dropdownGroup}>
            <button 
              style={isUserManagementActive ? { ...styles.dropdownToggle, ...styles.dropdownToggleActive } : styles.dropdownToggle}
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <div style={styles.dropdownToggleLeft}>
                <FaUsers style={styles.navIcon} />
                <span>User Management</span>
              </div>
              <span style={styles.dropdownChevron}>
                {isUserDropdownOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </span>
            </button>

            {/* Dropdown Submenu */}
            {isUserDropdownOpen && (
              <div style={styles.submenu}>
                <button 
                  style={activeTab === 'manage-users' ? { ...styles.subnavItem, ...styles.subnavItemActive } : styles.subnavItem}
                  onClick={() => setActiveTab('manage-users')}
                >
                  <div style={styles.subnavLabelRow}>
                    <FaUserCheck style={styles.subnavIcon} />
                    <span>Manage Users</span>
                  </div>
                  <span style={styles.badgeCount}>{users.length}</span>
                </button>

                <button 
                  style={activeTab === 'manage-roles' ? { ...styles.subnavItem, ...styles.subnavItemActive } : styles.subnavItem}
                  onClick={() => setActiveTab('manage-roles')}
                >
                  <div style={styles.subnavLabelRow}>
                    <FaShieldAlt style={styles.subnavIcon} />
                    <span>Manage Roles</span>
                  </div>
                  <span style={styles.badgeCount}>{roles.length}</span>
                </button>
              </div>
            )}
          </div>

          {/* Events Navigation Item (Single item without dropdown) */}
          <button 
            style={activeTab === 'events' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem} 
            onClick={() => setActiveTab('events')}
          >
            <div style={styles.dropdownToggleLeft}>
              <FaCalendarAlt style={styles.navIcon} />
              <span>Events</span>
            </div>
            <span style={styles.badgeCount}>{eventsList.length}</span>
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={onLogout} style={styles.logoutBtn}>
            <FaSignOutAlt style={styles.navIcon} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <header style={styles.topHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              {activeTab === 'dashboard' && 'Overview Dashboard'}
              {activeTab === 'manage-users' && 'User Management'}
              {activeTab === 'manage-roles' && 'Role Management'}
              {activeTab === 'events' && 'Events Management'}
            </h1>
            <p style={styles.pageSubtitle}>
              {activeTab === 'dashboard' && 'Live event analytics and incoming registration overview.'}
              {activeTab === 'manage-users' && 'Create, edit, assign roles, and remove system user accounts.'}
              {activeTab === 'manage-roles' && 'Configure custom access roles, permissions, and security hierarchy.'}
              {activeTab === 'events' && 'Edit event details, venues, schedules, and entry fees in real-time.'}
            </p>
          </div>
          <div style={styles.headerRight}>
            {/* Theme Toggle Button (Icon only) */}
            <button
              onClick={toggleTheme}
              style={styles.themeToggleBtn}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <FaSun size={18} style={{ color: '#fbbf24' }} />
              ) : (
                <FaMoon size={17} style={{ color: '#6366f1' }} />
              )}
            </button>

            <div style={styles.userProfile}>
              <div style={styles.avatar}>A</div>
            </div>
          </div>
        </header>

        <div style={styles.contentWrapper}>
          {/* ======================================================== */}
          {/* 1. DASHBOARD VIEW                                        */}
          {/* ======================================================== */}
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
                  <div style={styles.statValue}>{eventsList.length}</div>
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
                      {!data?.recentRegistrations?.length && (
                        <tr><td colSpan="4" style={styles.emptyState}>No recent registrations found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. MANAGE USERS VIEW                                     */}
          {/* ======================================================== */}
          {activeTab === 'manage-users' && (
            <div style={styles.viewContainer}>
              <div style={styles.viewHeader}>
                <div style={styles.searchBox}>
                  <input 
                    type="text" 
                    placeholder="Search users by username or role..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
                <button onClick={handleOpenCreateUserForm} style={styles.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Create New User
                </button>
              </div>

              {/* Users Table */}
              <div style={styles.card}>
                <div style={styles.cardHeaderFlex}>
                  <h3 style={styles.cardTitle}>System Users ({filteredUsers.length})</h3>
                </div>
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
                      {filteredUsers.map(user => (
                        <tr key={user.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.userCell}>
                              <div style={styles.userAvatarSm}>{user.username.charAt(0).toUpperCase()}</div>
                              <span style={styles.strongText}>{user.username}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.roleBadge,
                              ...(user.role === 'superadmin' ? styles.roleBadgeSuper : 
                                 user.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeDefault)
                            }}>
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.statusActive}>
                              <FaCircle size={7} style={{ marginRight: '6px' }} /> Active
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button 
                              onClick={() => handleOpenEditUserForm(user)} 
                              style={styles.actionBtnEdit} 
                              title="Edit User"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id, user.username)} 
                              style={styles.actionBtnDelete} 
                              title="Delete User"
                              disabled={user.username === 'admin'}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredUsers.length && (
                        <tr>
                          <td colSpan="4" style={styles.emptyState}>
                            No users found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. MANAGE ROLES VIEW                                     */}
          {/* ======================================================== */}
          {activeTab === 'manage-roles' && (
            <div style={styles.viewContainer}>
              <div style={styles.viewHeader}>
                <p style={styles.viewDescription}>
                  Roles define user permissions and access control. You can add custom roles, rename them, or delete unused roles.
                </p>
                <button onClick={handleOpenCreateRoleForm} style={styles.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Create New Role
                </button>
              </div>

              {/* Roles Table */}
              <div style={styles.card}>
                <div style={styles.cardHeaderFlex}>
                  <h3 style={styles.cardTitle}>System & Custom Roles ({roles.length})</h3>
                </div>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Role Name</th>
                        <th style={styles.th}>Assigned Users</th>
                        <th style={styles.th}>Type</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(roleItem => {
                        const userCount = getUserCountForRole(roleItem.name);
                        const isSystem = roleItem.name === 'superadmin' || roleItem.name === 'admin';

                        return (
                          <tr key={roleItem.id} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={styles.roleCell}>
                                <span style={{
                                  ...styles.roleBadge,
                                  ...(roleItem.name === 'superadmin' ? styles.roleBadgeSuper : 
                                     roleItem.name === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeDefault)
                                }}>
                                  {roleItem.name.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.userCountBadge}>
                                {userCount} user{userCount !== 1 ? 's' : ''}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {isSystem ? (
                                <span style={styles.systemBadge}>System Protected</span>
                              ) : (
                                <span style={styles.customBadge}>Custom Role</span>
                              )}
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                              <button 
                                onClick={() => handleOpenEditRoleForm(roleItem)} 
                                style={styles.actionBtnEdit} 
                                title="Edit Role"
                                disabled={roleItem.name === 'superadmin'}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => handleDeleteRole(roleItem.id, roleItem.name)} 
                                style={{
                                  ...styles.actionBtnDelete,
                                  opacity: isSystem ? 0.35 : 1,
                                  cursor: isSystem ? 'not-allowed' : 'pointer'
                                }} 
                                title={isSystem ? "Cannot delete system roles" : "Delete Role"}
                                disabled={isSystem}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. EVENTS MANAGEMENT PAGE                                */}
          {/* ======================================================== */}
          {activeTab === 'events' && (
            <div style={styles.viewContainer}>
              {/* Filter & Search Bar */}
              <div style={styles.viewHeader}>
                <div style={styles.searchBox}>
                  <input 
                    type="text" 
                    placeholder="Search events by name, venue, timing, or fee..." 
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <div style={styles.filterPillGroup}>
                  {['all', 'technical', 'non-technical'].map(cat => (
                    <button
                      key={cat}
                      style={eventFilter === cat ? styles.filterPillActive : styles.filterPill}
                      onClick={() => setEventFilter(cat)}
                    >
                      {cat === 'all' ? (
                        <span>All Events ({eventsList.length})</span>
                      ) : cat === 'technical' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <FaBolt size={11} /> Technical ({eventsList.filter(e => e.category === 'technical').length})
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <FaGamepad size={12} /> Non-Tech ({eventsList.filter(e => e.category === 'non-technical').length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Events Table */}
              <div style={styles.card}>
                <div style={styles.cardHeaderFlex}>
                  <h3 style={styles.cardTitle}>
                    <FaCalendarAlt style={{ marginRight: '8px', color: '#2563eb' }} />
                    All Events ({filteredEventsList.length})
                  </h3>
                  <span style={styles.cardSubText}>Live database synchronized with main events page</span>
                </div>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Event Name</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Venue</th>
                        <th style={styles.th}>Time / Schedule</th>
                        <th style={styles.th}>Registration Fee</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEventsList.map(evt => (
                        <tr key={evt.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div>
                              <span style={styles.strongText}>{evt.name}</span>
                              <div style={styles.tableSubText}>
                                <span style={styles.idBadgeMini}>{evt.id.toUpperCase()}</span> {evt.subtitle || evt.alias}
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={evt.category === 'technical' ? styles.badgeTech : styles.badgeNonTech}>
                              {evt.category === 'technical' ? (
                                <><FaBolt style={{ marginRight: '4px' }} /> Technical</>
                              ) : (
                                <><FaGamepad style={{ marginRight: '4px' }} /> Non-Tech</>
                              )}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.venueText}>
                              <FaMapMarkerAlt style={{ color: '#64748b', marginRight: '6px', fontSize: '0.85rem' }} />
                              {evt.venue}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.timeText}>
                              <FaClock style={{ color: '#64748b', marginRight: '6px', fontSize: '0.85rem' }} />
                              {evt.timing}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div>
                              <span style={styles.feeHighlight}>{evt.fee}</span>
                              {evt.teamSize && <div style={styles.tableSubText}>{evt.teamSize}</div>}
                            </div>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button
                              onClick={() => handleOpenEditEventModal(evt)}
                              style={styles.actionBtnEdit}
                              title="Edit Event Details"
                            >
                              <FaEdit style={{ marginRight: '4px' }} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredEventsList.length && (
                        <tr>
                          <td colSpan="6" style={styles.emptyState}>
                            No events match the search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ======================================================== */}
      {/* OVERLAY MODAL: EDIT EVENT                                */}
      {/* ======================================================== */}
      {isEventEditModalOpen && editingEvent && (
        <div style={styles.modalBackdrop} onClick={resetEventEditModal}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconBoxEvent}>
                  <FaCalendarAlt size={18} />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>
                    Edit Event: {editingEvent.id.toUpperCase()}
                  </h3>
                  <p style={styles.modalSubtitle}>
                    Updates made here immediately reflect on the live events page.
                  </p>
                </div>
              </div>
              <button onClick={resetEventEditModal} style={styles.modalCloseBtn} title="Close (Esc)">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitEventEdit} style={styles.modalForm}>
              <div style={styles.modalFormBody}>
                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Event Name *</label>
                  <input 
                    type="text" 
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. PPT PRESENTATION"
                    required 
                    autoFocus
                  />
                </div>

                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Venue *</label>
                  <input 
                    type="text" 
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. CSE Seminar Hall / Drawing Hall"
                    required 
                  />
                </div>

                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Time / Schedule *</label>
                  <input 
                    type="text" 
                    value={eventTiming}
                    onChange={(e) => setEventTiming(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. 10:00 AM – 01:00 PM"
                    required 
                  />
                </div>

                <div style={styles.formRowTwo}>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Registration Fee *</label>
                    <input 
                      type="text" 
                      value={eventFee}
                      onChange={(e) => setEventFee(e.target.value)}
                      style={styles.input}
                      placeholder="e.g. ₹100 per head / ₹200 per squad"
                      required 
                    />
                  </div>

                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Team Size / Format</label>
                    <input 
                      type="text" 
                      value={eventTeamSize}
                      onChange={(e) => setEventTeamSize(e.target.value)}
                      style={styles.input}
                      placeholder="e.g. Max of 3 members / Individual"
                    />
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={resetEventEditModal} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn}>
                  Save Event Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* OVERLAY MODAL: CREATE / EDIT USER                        */}
      {/* ======================================================== */}
      {isUserFormVisible && (
        <div style={styles.modalBackdrop} onClick={resetUserForm}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconBox}>
                  <FaUserShield size={18} />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>
                    {editingUserId ? `Edit User: ${username}` : 'Create New User Account'}
                  </h3>
                  <p style={styles.modalSubtitle}>
                    {editingUserId ? 'Update account details and assigned permissions.' : 'Add a new administrative user to the system.'}
                  </p>
                </div>
              </div>
              <button onClick={resetUserForm} style={styles.modalCloseBtn} title="Close (Esc)">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} style={styles.modalForm}>
              <div style={styles.modalFormBody}>
                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Username *</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                    placeholder="Enter username (e.g. jdoe)"
                    required 
                    autoFocus
                  />
                </div>

                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>
                    {editingUserId ? 'New Password' : 'Password *'}
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    placeholder={editingUserId ? "•••••••• (Leave blank to keep existing)" : "Enter secure password"}
                    required={!editingUserId} 
                  />
                  {editingUserId && (
                    <span style={styles.inputHelper}>
                      Leave blank if you want to keep the current password.
                    </span>
                  )}
                </div>

                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Assign Role *</label>
                  <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value)}
                    style={styles.select}
                    required
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{r.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={resetUserForm} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn}>
                  {editingUserId ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* OVERLAY MODAL: CREATE / EDIT ROLE                        */}
      {/* ======================================================== */}
      {isRoleFormVisible && (
        <div style={styles.modalBackdrop} onClick={resetRoleForm}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconBoxRole}>
                  <FaShieldAlt size={18} />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>
                    {editingRoleId ? 'Edit Role Name' : 'Create New Custom Role'}
                  </h3>
                  <p style={styles.modalSubtitle}>
                    {editingRoleId ? 'Rename this role across the system.' : 'Define a new security role for user accounts.'}
                  </p>
                </div>
              </div>
              <button onClick={resetRoleForm} style={styles.modalCloseBtn} title="Close (Esc)">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitRole} style={styles.modalForm}>
              <div style={styles.modalFormBody}>
                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Role Identifier / Name *</label>
                  <input 
                    type="text" 
                    value={roleNameInput}
                    onChange={(e) => setRoleNameInput(e.target.value)}
                    style={styles.input}
                    placeholder="e.g., event_coordinator, judge, volunteer"
                    required 
                    autoFocus
                  />
                  <span style={styles.inputHelper}>
                    Role names are automatically converted to lowercase and synced with assigned accounts.
                  </span>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={resetRoleForm} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn}>
                  {editingRoleId ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

<<<<<<< HEAD
const getDashboardStyles = (isDark) => ({
  container: { 
    display: 'flex', 
    minHeight: '100vh', 
    background: isDark ? '#090d16' : '#f1f5f9', 
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    transition: 'background 0.25s ease, color 0.25s ease'
  },
  loadingContainer: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    background: isDark ? '#090d16' : '#f1f5f9' 
  },
  spinner: { 
    width: '40px', 
    height: '40px', 
    border: isDark ? '4px solid #1e293b' : '4px solid #cbd5e1', 
    borderTop: '4px solid #3b82f6', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
=======
const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' },
  spinner: { width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' },
>>>>>>> 3d136d39c84c327736d92cfbf6a6c894128c0997
  
  // Sidebar
  sidebar: { 
    width: '270px', 
    background: isDark ? '#0d1322' : '#ffffff', 
    borderRight: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', 
    display: 'flex', 
    flexDirection: 'column', 
    boxShadow: isDark ? '4px 0 20px rgba(0,0,0,0.35)' : '4px 0 12px rgba(0,0,0,0.03)', 
    zIndex: 20,
    transition: 'background 0.25s ease, border-color 0.25s ease'
  },
  sidebarHeader: { 
    padding: '1.75rem 1.5rem', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9' 
  },
  logoCircle: { 
    width: '42px', 
    height: '42px', 
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
    borderRadius: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: 'white', 
    boxShadow: '0 4px 10px rgba(37,99,235,0.25)' 
  },
  sidebarTitle: { 
    margin: 0, 
    fontSize: '1.15rem', 
    fontWeight: '700', 
    color: isDark ? '#f8fafc' : '#0f172a', 
    lineHeight: 1.2 
  },
  sidebarSubtitle: { 
    fontSize: '0.75rem', 
    color: isDark ? '#94a3b8' : '#64748b', 
    fontWeight: '600', 
    letterSpacing: '0.04em' 
  },
  
  // Nav
<<<<<<< HEAD
  navMenu: { 
    flex: 1, 
    padding: '1.5rem 1rem', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.4rem' 
  },
  navItem: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '0.85rem 1rem', 
    borderRadius: '10px', 
    border: 'none', 
    background: 'transparent', 
    color: isDark ? '#94a3b8' : '#64748b', 
    fontSize: '0.92rem', 
    fontWeight: '600', 
    cursor: 'pointer', 
    textAlign: 'left', 
    transition: 'all 0.2s ease', 
    width: '100%' 
  },
  navItemActive: { 
    background: isDark ? '#1e293b' : '#eff6ff', 
    color: isDark ? '#60a5fa' : '#2563eb',
    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
  },
  navIcon: { 
    marginRight: '12px', 
    fontSize: '1.1rem', 
    flexShrink: 0 
  },
  
  // Dropdown
  dropdownGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.2rem' 
  },
  dropdownToggle: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '0.85rem 1rem', 
    borderRadius: '10px', 
    border: 'none', 
    background: 'transparent', 
    color: isDark ? '#94a3b8' : '#64748b', 
    fontSize: '0.92rem', 
    fontWeight: '600', 
    cursor: 'pointer', 
    width: '100%', 
    transition: 'all 0.2s ease' 
  },
  dropdownToggleActive: { 
    color: isDark ? '#f8fafc' : '#0f172a', 
    background: isDark ? '#161f33' : '#f8fafc' 
  },
  dropdownToggleLeft: { 
    display: 'flex', 
    alignItems: 'center' 
  },
  dropdownChevron: { 
    color: isDark ? '#64748b' : '#94a3b8', 
    display: 'flex', 
    alignItems: 'center' 
  },
  submenu: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.25rem', 
    paddingLeft: '1.5rem', 
    marginTop: '0.2rem', 
    marginBottom: '0.4rem' 
  },
  subnavItem: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '0.65rem 0.85rem', 
    borderRadius: '8px', 
    border: 'none', 
    background: 'transparent', 
    color: isDark ? '#94a3b8' : '#64748b', 
    fontSize: '0.86rem', 
    fontWeight: '500', 
    cursor: 'pointer', 
    textAlign: 'left', 
    transition: 'all 0.2s ease' 
  },
  subnavItemActive: { 
    background: isDark ? '#1e3a8a' : '#dbeafe', 
    color: isDark ? '#93c5fd' : '#1d4ed8', 
    fontWeight: '700' 
  },
  subnavIcon: { 
    marginRight: '10px', 
    fontSize: '0.95rem' 
  },
  badgeCount: { 
    background: isDark ? '#1e293b' : '#e2e8f0', 
    color: isDark ? '#94a3b8' : '#475569', 
    padding: '0.15rem 0.45rem', 
    borderRadius: '999px', 
    fontSize: '0.72rem', 
    fontWeight: '700' 
  },
=======
  navMenu: { flex: 1, padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '10px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', width: '100%' },
  navItemActive: { background: '#eff6ff', color: '#2563eb' },
  navIcon: { marginRight: '12px', fontSize: '1.1rem', flexShrink: 0 },
  
  // Dropdown
  dropdownGroup: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  dropdownToggle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '10px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'all 0.2s ease' },
  dropdownToggleActive: { color: '#0f172a', background: '#f8fafc' },
  dropdownToggleLeft: { display: 'flex', alignItems: 'center' },
  dropdownChevron: { color: '#94a3b8', display: 'flex', alignItems: 'center' },
  
  submenu: { display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.2rem', marginTop: '0.2rem', marginBottom: '0.4rem' },
  subnavLabelRow: { display: 'flex', alignItems: 'center' },
  subnavItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.86rem', fontWeight: '500', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', width: '100%' },
  subnavItemActive: { background: '#dbeafe', color: '#1d4ed8', fontWeight: '700' },
  subnavIcon: { marginRight: '10px', fontSize: '0.95rem' },

  badgeCount: { background: '#e2e8f0', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700' },
>>>>>>> 3d136d39c84c327736d92cfbf6a6c894128c0997

  sidebarFooter: { 
    padding: '1.25rem 1rem', 
    borderTop: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9' 
  },
  logoutBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%', 
    padding: '0.8rem', 
    background: isDark ? '#271418' : '#fef2f2', 
    color: isDark ? '#f87171' : '#ef4444', 
    border: isDark ? '1px solid #4c1d24' : '1px solid #fee2e2', 
    borderRadius: '10px', 
    fontSize: '0.9rem', 
    fontWeight: '600', 
    cursor: 'pointer', 
    transition: 'background 0.2s ease' 
  },
  
  // Main Layout
<<<<<<< HEAD
  mainContent: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    overflowX: 'hidden',
    background: isDark ? '#090d16' : '#f1f5f9',
    transition: 'background 0.25s ease'
  },
  topHeader: { 
    background: isDark ? '#0d1322' : '#ffffff', 
    minHeight: '85px', 
    padding: '1rem 2.5rem', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', 
    position: 'sticky', 
    top: 0, 
    zIndex: 10, 
    backdropFilter: 'blur(8px)',
    transition: 'background 0.25s ease, border-color 0.25s ease'
  },
  pageTitle: { 
    margin: 0, 
    fontSize: '1.5rem', 
    fontWeight: '800', 
    color: isDark ? '#f8fafc' : '#0f172a', 
    letterSpacing: '-0.02em' 
  },
  pageSubtitle: { 
    margin: '0.25rem 0 0 0', 
    fontSize: '0.85rem', 
    color: isDark ? '#94a3b8' : '#64748b', 
    fontWeight: '400' 
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  themeToggleBtn: {
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
    background: isDark ? '#161f33' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    cursor: 'pointer',
    boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    padding: 0
  },
  userProfile: { 
    display: 'flex', 
    alignItems: 'center' 
  },
  avatar: { 
    width: '42px', 
    height: '42px', 
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
    color: '#ffffff', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: '700', 
    fontSize: '1.1rem', 
    border: isDark ? '2px solid #1e293b' : '2px solid #ffffff', 
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)' 
  },
  contentWrapper: { 
    padding: '2.5rem', 
    flex: 1, 
    overflowY: 'auto' 
  },
=======
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' },
  topHeader: { background: '#ffffff', minHeight: '85px', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(8px)' },
  pageTitle: { margin: 0, fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' },
  pageSubtitle: { margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '400' },
  userProfile: { display: 'flex', alignItems: 'center' },
  avatar: { width: '42px', height: '42px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
  contentWrapper: { padding: '2.5rem', flex: 1, overflowY: 'auto' },
>>>>>>> 3d136d39c84c327736d92cfbf6a6c894128c0997

  // Views & Headers
  viewContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.5rem' 
  },
  viewHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    gap: '1rem', 
    flexWrap: 'wrap' 
  },
  viewDescription: { 
    margin: 0, 
    fontSize: '0.9rem', 
    color: isDark ? '#94a3b8' : '#64748b', 
    maxWidth: '650px' 
  },
  searchBox: { 
    flex: 1, 
    maxWidth: '400px' 
  },
  searchInput: { 
    width: '100%', 
    padding: '0.75rem 1.25rem', 
    borderRadius: '10px', 
    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1', 
    background: isDark ? '#0c1220' : '#ffffff', 
    fontSize: '0.9rem', 
    outline: 'none', 
    color: isDark ? '#f8fafc' : '#0f172a', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    transition: 'border-color 0.2s, background 0.2s'
  },
  createBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    background: '#2563eb', 
    color: '#ffffff', 
    border: 'none', 
    padding: '0.75rem 1.4rem', 
    borderRadius: '10px', 
    fontSize: '0.92rem', 
    fontWeight: '600', 
    cursor: 'pointer', 
    boxShadow: '0 2px 6px rgba(37,99,235,0.25)', 
    transition: 'background 0.2s' 
  },

  filterPillGroup: { display: 'flex', gap: '0.5rem', background: '#ffffff', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' },
  filterPill: { border: 'none', background: 'transparent', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', cursor: 'pointer' },
  filterPillActive: { border: 'none', background: '#2563eb', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 5px rgba(37,99,235,0.2)' },

  // Cards & Tables
<<<<<<< HEAD
  card: { 
    background: isDark ? '#111827' : '#ffffff', 
    borderRadius: '16px', 
    border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', 
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.03)', 
    overflow: 'hidden',
    transition: 'background 0.25s ease, border-color 0.25s ease'
  },
  cardHeaderFlex: { 
    padding: '1.25rem 1.75rem', 
    borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', 
    background: isDark ? '#161f33' : '#f8fafc', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  cardTitle: { 
    margin: 0, 
    fontSize: '1.05rem', 
    fontWeight: '700', 
    color: isDark ? '#f8fafc' : '#0f172a' 
  },
  tableResponsive: { 
    overflowX: 'auto' 
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse' 
  },
  th: { 
    background: isDark ? '#111827' : '#ffffff', 
    padding: '1rem 1.75rem', 
    textAlign: 'left', 
    color: isDark ? '#94a3b8' : '#64748b', 
    fontWeight: '600', 
    fontSize: '0.75rem', 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em', 
    borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0' 
  },
  tr: { 
    borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9' 
  },
  td: { 
    padding: '1.1rem 1.75rem', 
    color: isDark ? '#cbd5e1' : '#334155', 
    fontSize: '0.9rem' 
  },
  
  userCell: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px' 
  },
  userAvatarSm: { 
    width: '30px', 
    height: '30px', 
    borderRadius: '8px', 
    background: isDark ? '#1e293b' : '#e0e7ff', 
    color: isDark ? '#818cf8' : '#4338ca', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: '700', 
    fontSize: '0.85rem' 
  },
  strongText: { 
    fontWeight: '600', 
    color: isDark ? '#f8fafc' : '#0f172a' 
  },
  idBadge: { 
    background: isDark ? '#1e293b' : '#f1f5f9', 
    color: isDark ? '#94a3b8' : '#475569', 
    padding: '0.25rem 0.5rem', 
    borderRadius: '6px', 
    fontSize: '0.8rem', 
    fontWeight: '600' 
  },
=======
  card: { background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', overflow: 'hidden' },
  cardHeaderFlex: { padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center' },
  cardSubText: { fontSize: '0.8rem', color: '#64748b' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#ffffff', padding: '1rem 1.75rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '1.1rem 1.75rem', color: '#334155', fontSize: '0.9rem' },
  
  userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatarSm: { width: '30px', height: '30px', borderRadius: '8px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' },
  strongText: { fontWeight: '600', color: '#0f172a' },
  tableSubText: { fontSize: '0.78rem', color: '#64748b', marginTop: '2px' },
  idBadge: { background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' },
  idBadgeMini: { background: '#eff6ff', color: '#2563eb', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', marginRight: '4px' },
>>>>>>> 3d136d39c84c327736d92cfbf6a6c894128c0997
  
  roleBadge: { 
    display: 'inline-block', 
    padding: '0.25rem 0.75rem', 
    borderRadius: '999px', 
    fontSize: '0.72rem', 
    fontWeight: '700', 
    letterSpacing: '0.03em' 
  },
  roleBadgeSuper: { 
    background: isDark ? '#451a03' : '#fef3c7', 
    color: isDark ? '#fcd34d' : '#92400e', 
    border: isDark ? '1px solid #78350f' : '1px solid #fde68a' 
  },
  roleBadgeAdmin: { 
    background: isDark ? '#1e1b4b' : '#e0e7ff', 
    color: isDark ? '#a5b4fc' : '#3730a3', 
    border: isDark ? '1px solid #312e81' : '1px solid #c7d2fe' 
  },
  roleBadgeDefault: { 
    background: isDark ? '#1e293b' : '#f1f5f9', 
    color: isDark ? '#cbd5e1' : '#334155', 
    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0' 
  },
  
  userCountBadge: { 
    background: isDark ? '#064e3b' : '#ecfdf5', 
    color: isDark ? '#6ee7b7' : '#065f46', 
    padding: '0.25rem 0.65rem', 
    borderRadius: '6px', 
    fontSize: '0.8rem', 
    fontWeight: '600' 
  },
  systemBadge: { 
    background: isDark ? '#1e293b' : '#f1f5f9', 
    color: isDark ? '#94a3b8' : '#64748b', 
    padding: '0.25rem 0.65rem', 
    borderRadius: '6px', 
    fontSize: '0.75rem', 
    fontWeight: '600' 
  },
  customBadge: { 
    background: isDark ? '#064e3b' : '#f0fdf4', 
    color: isDark ? '#6ee7b7' : '#166534', 
    padding: '0.25rem 0.65rem', 
    borderRadius: '6px', 
    fontSize: '0.75rem', 
    fontWeight: '600' 
  },
  
<<<<<<< HEAD
  statusActive: { 
    color: '#10b981', 
    fontWeight: '600', 
    fontSize: '0.85rem' 
  },
  actionBtnEdit: { 
    background: isDark ? '#1e3a8a' : '#eff6ff', 
    border: isDark ? '1px solid #2563eb' : '1px solid #bfdbfe', 
    color: isDark ? '#93c5fd' : '#2563eb', 
    cursor: 'pointer', 
    fontSize: '0.9rem', 
    padding: '0.45rem 0.65rem', 
    borderRadius: '6px', 
    marginRight: '0.5rem', 
    transition: 'all 0.15s' 
  },
  actionBtnDelete: { 
    background: isDark ? '#450a0a' : '#fef2f2', 
    border: isDark ? '1px solid #991b1b' : '1px solid #fecaca', 
    color: isDark ? '#fca5a5' : '#ef4444', 
    cursor: 'pointer', 
    fontSize: '0.9rem', 
    padding: '0.45rem 0.65rem', 
    borderRadius: '6px', 
    transition: 'all 0.15s' 
  },
  emptyState: { 
    padding: '3rem', 
    textAlign: 'center', 
    color: isDark ? '#64748b' : '#94a3b8', 
    fontSize: '0.9rem' 
  },
=======
  badgeTech: { display: 'inline-flex', alignItems: 'center', background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', border: '1px solid #bfdbfe' },
  badgeNonTech: { display: 'inline-flex', alignItems: 'center', background: '#ecfdf5', color: '#047857', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', border: '1px solid #a7f3d0' },
  
  venueText: { fontSize: '0.85rem', color: '#1e293b', fontWeight: '500', display: 'flex', alignItems: 'center' },
  timeText: { fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center' },
  feeHighlight: { fontWeight: '700', color: '#059669', fontSize: '0.9rem' },

  actionBtnEdit: { display: 'inline-flex', alignItems: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: '0.45rem 0.75rem', borderRadius: '6px', marginRight: '0.5rem', transition: 'all 0.15s' },
  actionBtnDelete: { background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', padding: '0.45rem 0.65rem', borderRadius: '6px', transition: 'all 0.15s' },
  statusActive: { display: 'inline-flex', alignItems: 'center', color: '#10b981', fontWeight: '600', fontSize: '0.85rem' },
  emptyState: { padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' },
>>>>>>> 3d136d39c84c327736d92cfbf6a6c894128c0997

  // Stats Grid for Dashboard
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
    gap: '1.5rem', 
    marginBottom: '2rem' 
  },
  statCard: { 
    background: isDark ? '#111827' : '#ffffff', 
    padding: '1.75rem', 
    borderRadius: '16px', 
    border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', 
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.03)', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.5rem',
    transition: 'background 0.25s ease, border-color 0.25s ease'
  },
  statLabel: { 
    color: isDark ? '#94a3b8' : '#64748b', 
    fontSize: '0.8rem', 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em' 
  },
  statValue: { 
    color: isDark ? '#ffffff' : '#0f172a', 
    fontSize: '2.4rem', 
    fontWeight: '800' 
  },
  dashboardView: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.5rem' 
  },

  // ==================== OVERLAY MODALS ====================
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1.5rem'
  },
  modalCard: {
    background: isDark ? '#111827' : '#ffffff',
    width: '100%',
    maxWidth: '540px',
    borderRadius: '16px',
    boxShadow: isDark 
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px #1e293b' 
      : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'background 0.25s ease'
  },
  modalHeader: {
    padding: '1.5rem 1.75rem',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
    background: isDark ? '#111827' : '#ffffff'
  },
  modalHeaderLeft: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center'
  },
  modalIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: isDark ? '#1e293b' : '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  modalIconBoxRole: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: isDark ? '#064e3b' : '#ecfdf5',
    color: isDark ? '#6ee7b7' : '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  modalIconBoxEvent: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: '#fef3c7',
    color: '#d97706',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '700',
    color: isDark ? '#f8fafc' : '#0f172a'
  },
  modalSubtitle: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.8rem',
    color: isDark ? '#94a3b8' : '#64748b'
  },
  modalCloseBtn: {
    background: isDark ? '#1e293b' : '#f8fafc',
    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isDark ? '#cbd5e1' : '#64748b',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column'
  },
  modalFormBody: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
<<<<<<< HEAD
    gap: '1.25rem',
    background: isDark ? '#111827' : '#ffffff'
=======
    gap: '1.15rem',
    background: '#ffffff'
>>>>>>> 3d136d39c84c327736d92cfbf6a6c894128c0997
  },
  formRowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  modalInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: { 
    fontSize: '0.85rem', 
    fontWeight: '600', 
    color: isDark ? '#e2e8f0' : '#334155' 
  },
  input: { 
    padding: '0.75rem 1rem', 
    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1', 
    borderRadius: '8px', 
    fontSize: '0.92rem', 
    outline: 'none', 
    background: isDark ? '#0c1220' : '#ffffff', 
    color: isDark ? '#f8fafc' : '#0f172a',
    transition: 'border-color 0.2s, background 0.2s'
  },
  inputHelper: { 
    fontSize: '0.75rem', 
    color: isDark ? '#64748b' : '#94a3b8', 
    marginTop: '0.2rem' 
  },
  select: { 
    padding: '0.75rem 1rem', 
    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1', 
    borderRadius: '8px', 
    fontSize: '0.92rem', 
    outline: 'none', 
    background: isDark ? '#0c1220' : '#ffffff', 
    color: isDark ? '#f8fafc' : '#0f172a' 
  },
  modalFooter: {
    padding: '1.25rem 1.75rem',
    borderTop: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
    background: isDark ? '#161f33' : '#f8fafc',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    alignItems: 'center'
  },
  primaryBtn: { 
    padding: '0.75rem 1.5rem', 
    background: '#10b981', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '0.92rem', 
    fontWeight: '600', 
    cursor: 'pointer', 
    boxShadow: '0 2px 5px rgba(16,185,129,0.25)' 
  },
  cancelBtn: { 
    padding: '0.75rem 1.2rem', 
    background: isDark ? '#1e293b' : '#ffffff', 
    color: isDark ? '#cbd5e1' : '#475569', 
    border: isDark ? '1px solid #334155' : '1px solid #cbd5e1', 
    borderRadius: '8px', 
    fontSize: '0.92rem', 
    fontWeight: '600', 
    cursor: 'pointer' 
  }
});
