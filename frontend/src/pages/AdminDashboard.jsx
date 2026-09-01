import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  FaChartBar, 
  FaUsers, 
  FaSignOutAlt, 
  FaPlus, 
  FaUserShield, 
  FaEdit, 
  FaTrash, 
  FaChevronDown, 
  FaChevronRight, 
  FaUserCheck,
  FaShieldAlt,
  FaHandshake,
  FaUserTie,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaUpload,
  FaToggleOn,
  FaToggleOff,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaRupeeSign,
  FaFilter,
  FaCheck,
  FaTimes,
  FaImage
} from 'react-icons/fa';
import events from '../data/events.js';

export default function AdminDashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================== USERS STATE ====================
  const [users, setUsers] = useState([]);
  const [isUserFormVisible, setIsUserFormVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('');

  // ==================== ROLES STATE ====================
  const [roles, setRoles] = useState([]);
  const [isRoleFormVisible, setIsRoleFormVisible] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleNameInput, setRoleNameInput] = useState('');

  // ==================== SPONSORS STATE ====================
  const [sponsors, setSponsors] = useState([]);
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [sponsorCategoryFilter, setSponsorCategoryFilter] = useState('all');
  const [isSponsorFormVisible, setIsSponsorFormVisible] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Sponsor Form Fields
  const [sponsorName, setSponsorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sponsorLogo, setSponsorLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [sponsorDesc, setSponsorDesc] = useState('');
  const [sponsorWebsite, setSponsorWebsite] = useState('');
  const [sponsorContactName, setSponsorContactName] = useState('');
  const [sponsorContactEmail, setSponsorContactEmail] = useState('');
  const [sponsorContactPhone, setSponsorContactPhone] = useState('');
  const [sponsorCategory, setSponsorCategory] = useState('Gold Sponsor');
  const [sponsorDisplayOrder, setSponsorDisplayOrder] = useState('1');
  const [sponsorIsActive, setSponsorIsActive] = useState(true);

  const fileInputRef = useRef(null);

  // ==================== COORDINATORS STATE ====================
  const [coordinators, setCoordinators] = useState([]);
  const [coordSearch, setCoordSearch] = useState('');
  const [coordEventFilter, setCoordEventFilter] = useState('all');
  const [isCoordFormVisible, setIsCoordFormVisible] = useState(false);
  const [editingCoordId, setEditingCoordId] = useState(null);

  // Coordinator Form Fields
  const [coordName, setCoordName] = useState('');
  const [coordPhone, setCoordPhone] = useState('');
  const [coordWhatsapp, setCoordWhatsapp] = useState('');
  const [coordEmail, setCoordEmail] = useState('');
  const [coordDept, setCoordDept] = useState('CSE');
  const [coordYear, setCoordYear] = useState('3rd Year');
  const [coordRole, setCoordRole] = useState('Lead Coordinator');
  const [coordEvents, setCoordEvents] = useState([]);
  const [coordDisplayOrder, setCoordDisplayOrder] = useState('1');
  const [coordIsActive, setCoordIsActive] = useState(true);

  // ==================== INITIAL DATA FETCH ====================
  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchRoles();
    fetchSponsors();
    fetchCoordinators();
  }, [token]);

  // Handle ESC key to close modal overlays
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isUserFormVisible) resetUserForm();
        if (isRoleFormVisible) resetRoleForm();
        if (isSponsorFormVisible) resetSponsorForm();
        if (isCoordFormVisible) resetCoordForm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUserFormVisible, isRoleFormVisible, isSponsorFormVisible, isCoordFormVisible]);

  const handleAuthError = () => {
    toast.error('Session expired or unauthorized');
    onLogout();
  };

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

  const fetchSponsors = () => {
    fetch('/api/admin/sponsors', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => {
        if (result.success) setSponsors(result.data);
      })
      .catch(console.error);
  };

  const fetchCoordinators = () => {
    fetch('/api/admin/coordinators', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => {
        if (result.success) setCoordinators(result.data);
      })
      .catch(console.error);
  };

  // ==================== USER HANDLERS ====================
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

  // ==================== ROLE HANDLERS ====================
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

  // ==================== SPONSOR HANDLERS ====================
  const resetSponsorForm = () => {
    setSponsorName('');
    setCompanyName('');
    setSponsorLogo('');
    setLogoPreview('');
    setSponsorDesc('');
    setSponsorWebsite('');
    setSponsorContactName('');
    setSponsorContactEmail('');
    setSponsorContactPhone('');
    setSponsorCategory('Gold Sponsor');
    setSponsorDisplayOrder(String(sponsors.length + 1));
    setSponsorIsActive(true);
    setEditingSponsorId(null);
    setIsSponsorFormVisible(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenCreateSponsorForm = () => {
    resetSponsorForm();
    setIsSponsorFormVisible(true);
  };

  const handleOpenEditSponsorForm = (sponsor) => {
    setSponsorName(sponsor.name || '');
    setCompanyName(sponsor.companyName || '');
    setSponsorLogo(sponsor.logo || '');
    setLogoPreview(sponsor.logo || '');
    setSponsorDesc(sponsor.description || '');
    setSponsorWebsite(sponsor.website || '');
    setSponsorContactName(sponsor.contactName || '');
    setSponsorContactEmail(sponsor.contactEmail || '');
    setSponsorContactPhone(sponsor.contactPhone || '');
    setSponsorCategory(sponsor.category || 'Gold Sponsor');
    setSponsorDisplayOrder(String(sponsor.displayOrder !== undefined ? sponsor.displayOrder : 1));
    setSponsorIsActive(sponsor.isActive !== false);
    setEditingSponsorId(sponsor.id);
    setIsSponsorFormVisible(true);
  };

  const handleLogoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file (PNG, JPG, WEBP, SVG)');
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size exceeds 5MB limit');
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setLogoPreview(base64);

      // Upload automatically to backend
      setIsUploadingLogo(true);
      const loadingToast = toast.loading('Uploading logo asset...');

      fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          fileName: file.name
        })
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setSponsorLogo(result.url);
            toast.success('Logo uploaded successfully', { id: loadingToast });
          } else {
            toast.error(result.message || 'Upload failed', { id: loadingToast });
          }
        })
        .catch(() => {
          toast.error('Network error uploading logo', { id: loadingToast });
        })
        .finally(() => setIsUploadingLogo(false));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitSponsor = (e) => {
    e.preventDefault();
    if (!sponsorName.trim()) {
      return toast.error('Sponsor name is required');
    }

    if (sponsorContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sponsorContactEmail.trim())) {
      return toast.error('Please enter a valid contact email');
    }

    const payload = {
      name: sponsorName.trim(),
      companyName: companyName.trim(),
      logo: sponsorLogo.trim(),
      description: sponsorDesc.trim(),
      website: sponsorWebsite.trim(),
      contactName: sponsorContactName.trim(),
      contactEmail: sponsorContactEmail.trim(),
      contactPhone: sponsorContactPhone.trim(),
      category: sponsorCategory,
      displayOrder: Number(sponsorDisplayOrder) || 1,
      isActive: sponsorIsActive
    };

    const loadingToast = toast.loading(editingSponsorId ? 'Updating sponsor...' : 'Creating sponsor...');
    const method = editingSponsorId ? 'PUT' : 'POST';
    const url = editingSponsorId ? `/api/admin/sponsors/${editingSponsorId}` : '/api/admin/sponsors';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success(`Sponsor ${editingSponsorId ? 'updated' : 'created'} successfully!`, { id: loadingToast });
          fetchSponsors();
          fetchDashboardData();
          resetSponsorForm();
        } else {
          toast.error(result.message || 'Operation failed', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error saving sponsor', { id: loadingToast }));
  };

  const handleToggleSponsor = (sponsor) => {
    const loadingToast = toast.loading(`Toggling status for ${sponsor.name}...`);
    fetch(`/api/admin/sponsors/${sponsor.id}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success(result.message, { id: loadingToast });
          setSponsors(sponsors.map(s => s.id === sponsor.id ? result.data : s));
          fetchDashboardData();
        } else {
          toast.error(result.message || 'Toggle failed', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  const handleDeleteSponsor = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete sponsor "${name}"? This action cannot be undone.`)) return;
    const loadingToast = toast.loading('Deleting sponsor...');

    fetch(`/api/admin/sponsors/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Sponsor deleted successfully', { id: loadingToast });
          setSponsors(sponsors.filter(s => s.id !== id));
          fetchDashboardData();
          if (editingSponsorId === id) resetSponsorForm();
        } else {
          toast.error(result.message || 'Failed to delete sponsor', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  // ==================== COORDINATOR HANDLERS ====================
  const resetCoordForm = () => {
    setCoordName('');
    setCoordPhone('');
    setCoordWhatsapp('');
    setCoordEmail('');
    setCoordDept('CSE');
    setCoordYear('3rd Year');
    setCoordRole('Lead Coordinator');
    setCoordEvents([]);
    setCoordDisplayOrder(String(coordinators.length + 1));
    setCoordIsActive(true);
    setEditingCoordId(null);
    setIsCoordFormVisible(false);
  };

  const handleOpenCreateCoordForm = () => {
    resetCoordForm();
    setIsCoordFormVisible(true);
  };

  const handleOpenEditCoordForm = (coord) => {
    setCoordName(coord.name || '');
    setCoordPhone(coord.phone || '');
    setCoordWhatsapp(coord.whatsapp || '');
    setCoordEmail(coord.email || '');
    setCoordDept(coord.department || 'CSE');
    setCoordYear(coord.year || '3rd Year');
    setCoordRole(coord.role || 'Lead Coordinator');
    setCoordEvents(Array.isArray(coord.assignedEvents) ? [...coord.assignedEvents] : []);
    setCoordDisplayOrder(String(coord.displayOrder !== undefined ? coord.displayOrder : 1));
    setCoordIsActive(coord.isActive !== false);
    setEditingCoordId(coord.id);
    setIsCoordFormVisible(true);
  };

  const toggleEventSelection = (eventId) => {
    if (coordEvents.includes(eventId)) {
      setCoordEvents(coordEvents.filter(e => e !== eventId));
    } else {
      setCoordEvents([...coordEvents, eventId]);
    }
  };

  const handleSubmitCoord = (e) => {
    e.preventDefault();
    if (!coordName.trim()) return toast.error('Full name is required');
    if (!coordPhone.trim() || !/^[6-9]\d{9}$/.test(coordPhone.trim().replace(/\s+/g, ''))) {
      return toast.error('Please enter a valid 10-digit Indian phone number (e.g. 9876543210)');
    }
    if (coordEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coordEmail.trim())) {
      return toast.error('Please enter a valid email address');
    }
    if (coordEvents.length === 0) {
      return toast.error('Please assign this coordinator to at least one event');
    }

    const payload = {
      name: coordName.trim(),
      phone: coordPhone.trim().replace(/\s+/g, ''),
      whatsapp: coordWhatsapp ? coordWhatsapp.trim().replace(/\s+/g, '') : coordPhone.trim().replace(/\s+/g, ''),
      email: coordEmail.trim(),
      department: coordDept.trim(),
      year: coordYear.trim(),
      role: coordRole,
      assignedEvents: coordEvents,
      displayOrder: Number(coordDisplayOrder) || 1,
      isActive: coordIsActive
    };

    const loadingToast = toast.loading(editingCoordId ? 'Updating coordinator...' : 'Creating coordinator...');
    const method = editingCoordId ? 'PUT' : 'POST';
    const url = editingCoordId ? `/api/admin/coordinators/${editingCoordId}` : '/api/admin/coordinators';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success(`Coordinator ${editingCoordId ? 'updated' : 'created'} successfully!`, { id: loadingToast });
          fetchCoordinators();
          fetchDashboardData();
          resetCoordForm();
        } else {
          toast.error(result.message || 'Operation failed', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error saving coordinator', { id: loadingToast }));
  };

  const handleToggleCoord = (coord) => {
    const loadingToast = toast.loading(`Toggling status for ${coord.name}...`);
    fetch(`/api/admin/coordinators/${coord.id}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success(result.message, { id: loadingToast });
          setCoordinators(coordinators.map(c => c.id === coord.id ? result.data : c));
          fetchDashboardData();
        } else {
          toast.error(result.message || 'Toggle failed', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  const handleDeleteCoord = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete coordinator "${name}"?`)) return;
    const loadingToast = toast.loading('Deleting coordinator...');

    fetch(`/api/admin/coordinators/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Coordinator deleted successfully', { id: loadingToast });
          setCoordinators(coordinators.filter(c => c.id !== id));
          fetchDashboardData();
          if (editingCoordId === id) resetCoordForm();
        } else {
          toast.error(result.message || 'Failed to delete coordinator', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error', { id: loadingToast }));
  };

  // Helper for counting users in a role
  const getUserCountForRole = (rName) => {
    return users.filter(u => u.role?.toLowerCase() === rName.toLowerCase()).length;
  };

  // Filtered lists
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredSponsors = sponsors.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      (s.companyName && s.companyName.toLowerCase().includes(sponsorSearch.toLowerCase())) ||
      (s.contactName && s.contactName.toLowerCase().includes(sponsorSearch.toLowerCase())) ||
      (s.category && s.category.toLowerCase().includes(sponsorSearch.toLowerCase()));
    const matchesCategory = sponsorCategoryFilter === 'all' || s.category === sponsorCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCoordinators = coordinators.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(coordSearch.toLowerCase()) ||
      c.phone.includes(coordSearch) ||
      (c.email && c.email.toLowerCase().includes(coordSearch.toLowerCase())) ||
      (c.department && c.department.toLowerCase().includes(coordSearch.toLowerCase())) ||
      (c.role && c.role.toLowerCase().includes(coordSearch.toLowerCase()));
    
    const matchesEvent = coordEventFilter === 'all' || 
      (Array.isArray(c.assignedEvents) && c.assignedEvents.includes(coordEventFilter));

    return matchesSearch && matchesEvent;
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
      {/* ======================================================== */}
      {/* SIDEBAR                                                  */}
      {/* ======================================================== */}
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
                  <FaUserCheck style={styles.subnavIcon} />
                  <span>Manage Users</span>
                  <span style={styles.badgeCount}>{users.length}</span>
                </button>

                <button 
                  style={activeTab === 'manage-roles' ? { ...styles.subnavItem, ...styles.subnavItemActive } : styles.subnavItem}
                  onClick={() => setActiveTab('manage-roles')}
                >
                  <FaShieldAlt style={styles.subnavIcon} />
                  <span>Manage Roles</span>
                  <span style={styles.badgeCount}>{roles.length}</span>
                </button>
              </div>
            )}
          </div>

          {/* Sponsors Tab */}
          <button 
            style={activeTab === 'manage-sponsors' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem} 
            onClick={() => setActiveTab('manage-sponsors')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaHandshake style={styles.navIcon} />
                <span>Sponsors</span>
              </div>
              <span style={styles.badgeCount}>{sponsors.length}</span>
            </div>
          </button>

          {/* Student Coordinators Tab */}
          <button 
            style={activeTab === 'manage-coordinators' ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem} 
            onClick={() => setActiveTab('manage-coordinators')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaUserTie style={styles.navIcon} />
                <span>Student Coordinators</span>
              </div>
              <span style={styles.badgeCount}>{coordinators.length}</span>
            </div>
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={onLogout} style={styles.logoutBtn}>
            <FaSignOutAlt style={styles.navIcon} /> Log Out
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT                                             */}
      {/* ======================================================== */}
      <main style={styles.mainContent}>
        <header style={styles.topHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              {activeTab === 'dashboard' && 'Overview Dashboard'}
              {activeTab === 'manage-users' && 'User Management'}
              {activeTab === 'manage-roles' && 'Role Management'}
              {activeTab === 'manage-sponsors' && 'Sponsor Management'}
              {activeTab === 'manage-coordinators' && 'Student Coordinator Management'}
            </h1>
            <p style={styles.pageSubtitle}>
              {activeTab === 'dashboard' && 'Live event analytics, registrations, and entity metrics.'}
              {activeTab === 'manage-users' && 'Create, edit, assign roles, and remove system user accounts.'}
              {activeTab === 'manage-roles' && 'Configure custom access roles, permissions, and security hierarchy.'}
              {activeTab === 'manage-sponsors' && 'Manage event partners, categories, logos, contact info, and public visibility.'}
              {activeTab === 'manage-coordinators' && 'Assign student leads and coordinators dynamically to symposium events.'}
            </p>
          </div>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>A</div>
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
                  <div style={styles.statValue}>{data?.stats?.eventsActive || 12}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Sponsors</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={styles.statValue}>{data?.stats?.totalSponsors || sponsors.length}</span>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700' }}>
                      ({data?.stats?.activeSponsors || sponsors.filter(s => s.isActive !== false).length} Active)
                    </span>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Student Coordinators</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={styles.statValue}>{data?.stats?.totalCoordinators || coordinators.length}</span>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700' }}>
                      ({data?.stats?.activeCoordinators || coordinators.filter(c => c.isActive !== false).length} Active)
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ ...styles.cardTitle, padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  Recent Registrations
                </h3>
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
                              ...(user.role === 'superadmin' ? styles.roleBadgeSuper : user.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeDefault)
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={styles.td}><span style={styles.statusActive}>● Active</span></td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button onClick={() => handleOpenEditUserForm(user)} style={styles.actionBtnEdit} title="Edit User">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteUser(user.id, user.username)} style={styles.actionBtnDelete} title="Delete User">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredUsers.length && (
                        <tr><td colSpan="4" style={styles.emptyState}>No users found.</td></tr>
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
                  Manage platform security levels. Roles determine access permissions and capabilities across the administrative surface.
                </p>
                <button onClick={handleOpenCreateRoleForm} style={styles.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Create New Role
                </button>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeaderFlex}>
                  <h3 style={styles.cardTitle}>System Roles ({roles.length})</h3>
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
                      {roles.map(r => {
                        const count = getUserCountForRole(r.name);
                        const isSystem = r.name === 'superadmin' || r.name === 'admin';
                        return (
                          <tr key={r.id} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={styles.userCell}>
                                <div style={{ ...styles.userAvatarSm, background: '#ecfdf5', color: '#059669' }}>
                                  <FaShieldAlt size={14} />
                                </div>
                                <span style={styles.strongText}>{r.name}</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.userCountBadge}>{count} user{count !== 1 ? 's' : ''}</span>
                            </td>
                            <td style={styles.td}>
                              <span style={isSystem ? styles.systemBadge : styles.customBadge}>
                                {isSystem ? 'System Default' : 'Custom Role'}
                              </span>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                              {!isSystem && (
                                <>
                                  <button onClick={() => handleOpenEditRoleForm(r)} style={styles.actionBtnEdit} title="Edit Role">
                                    <FaEdit />
                                  </button>
                                  <button onClick={() => handleDeleteRole(r.id, r.name)} style={styles.actionBtnDelete} title="Delete Role">
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                              {isSystem && (
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Protected</span>
                              )}
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
          {/* 4. MANAGE SPONSORS VIEW                                  */}
          {/* ======================================================== */}
          {activeTab === 'manage-sponsors' && (
            <div style={styles.viewContainer}>
              <div style={styles.viewHeader}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '600px', flexWrap: 'wrap' }}>
                  <div style={styles.searchBox}>
                    <input 
                      type="text" 
                      placeholder="Search sponsors by name, company, contact..." 
                      value={sponsorSearch}
                      onChange={(e) => setSponsorSearch(e.target.value)}
                      style={styles.searchInput}
                    />
                  </div>
                  <select 
                    value={sponsorCategoryFilter} 
                    onChange={(e) => setSponsorCategoryFilter(e.target.value)}
                    style={{ ...styles.select, width: 'auto', padding: '0.65rem 1rem' }}
                  >
                    <option value="all">All Levels</option>
                    <option value="Title Sponsor">Title Sponsor</option>
                    <option value="Gold Sponsor">Gold Sponsor</option>
                    <option value="Silver Sponsor">Silver Sponsor</option>
                    <option value="Bronze Sponsor">Bronze Sponsor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button onClick={handleOpenCreateSponsorForm} style={styles.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Add New Sponsor
                </button>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeaderFlex}>
                  <h3 style={styles.cardTitle}>Event Sponsors ({filteredSponsors.length})</h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Active sponsors appear on the public website marquee sorted by display order.
                  </span>
                </div>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Sponsor</th>
                        <th style={styles.th}>Level</th>
                        <th style={styles.th}>Contact</th>
                        <th style={styles.th}>Status</th>
                        <th style={{ ...styles.th, textAlign: 'center' }}>Display Order</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSponsors.map(sponsor => (
                        <tr key={sponsor.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                flexShrink: 0
                              }}>
                                {sponsor.logo ? (
                                  <img src={sponsor.logo} alt={sponsor.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                  <span style={{ fontWeight: '800', color: '#2563eb', fontSize: '0.85rem' }}>
                                    {sponsor.name.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div style={styles.strongText}>{sponsor.name}</div>
                                {sponsor.companyName && (
                                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{sponsor.companyName}</div>
                                )}
                                {sponsor.website && (
                                  <a 
                                    href={sponsor.website} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                                  >
                                    <FaGlobe size={10} /> {sponsor.website.replace(/^https?:\/\//, '')}
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: 
                                sponsor.category === 'Title Sponsor' ? '#fef3c7' :
                                sponsor.category === 'Gold Sponsor' ? '#fef9c3' :
                                sponsor.category === 'Silver Sponsor' ? '#f1f5f9' :
                                sponsor.category === 'Bronze Sponsor' ? '#ffedd5' : '#f3f4f6',
                              color: 
                                sponsor.category === 'Title Sponsor' ? '#92400e' :
                                sponsor.category === 'Gold Sponsor' ? '#854d0e' :
                                sponsor.category === 'Silver Sponsor' ? '#334155' :
                                sponsor.category === 'Bronze Sponsor' ? '#9a3412' : '#374151',
                              border: '1px solid rgba(0,0,0,0.06)'
                            }}>
                              {sponsor.category}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: '0.85rem' }}>
                              {sponsor.contactName && <div style={{ fontWeight: '600', color: '#0f172a' }}>{sponsor.contactName}</div>}
                              {sponsor.contactPhone && (
                                <div style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaPhone size={10} /> {sponsor.contactPhone}
                                </div>
                              )}
                              {sponsor.contactEmail && (
                                <div style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaEnvelope size={10} /> {sponsor.contactEmail}
                                </div>
                              )}
                              {!sponsor.contactName && !sponsor.contactPhone && !sponsor.contactEmail && (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>None provided</span>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              color: sponsor.isActive !== false ? '#059669' : '#dc2626'
                            }}>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: sponsor.isActive !== false ? '#10b981' : '#ef4444'
                              }}></span>
                              {sponsor.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <span style={styles.idBadge}>{sponsor.displayOrder || 1}</span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button 
                              onClick={() => handleToggleSponsor(sponsor)} 
                              style={{ 
                                background: sponsor.isActive !== false ? '#ecfdf5' : '#fef2f2',
                                border: '1px solid ' + (sponsor.isActive !== false ? '#a7f3d0' : '#fecaca'),
                                color: sponsor.isActive !== false ? '#059669' : '#dc2626',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '6px',
                                marginRight: '0.5rem'
                              }}
                              title={sponsor.isActive !== false ? 'Deactivate Sponsor' : 'Activate Sponsor'}
                            >
                              {sponsor.isActive !== false ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                            </button>
                            <button onClick={() => handleOpenEditSponsorForm(sponsor)} style={styles.actionBtnEdit} title="Edit Sponsor">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteSponsor(sponsor.id, sponsor.name)} style={styles.actionBtnDelete} title="Delete Sponsor">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredSponsors.length && (
                        <tr><td colSpan="6" style={styles.emptyState}>No sponsors found matching your criteria.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. MANAGE STUDENT COORDINATORS VIEW                      */}
          {/* ======================================================== */}
          {activeTab === 'manage-coordinators' && (
            <div style={styles.viewContainer}>
              <div style={styles.viewHeader}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '650px', flexWrap: 'wrap' }}>
                  <div style={styles.searchBox}>
                    <input 
                      type="text" 
                      placeholder="Search by name, phone, dept, event, role..." 
                      value={coordSearch}
                      onChange={(e) => setCoordSearch(e.target.value)}
                      style={styles.searchInput}
                    />
                  </div>
                  <select 
                    value={coordEventFilter} 
                    onChange={(e) => setCoordEventFilter(e.target.value)}
                    style={{ ...styles.select, width: 'auto', padding: '0.65rem 1rem' }}
                  >
                    <option value="all">All Events ({events.length})</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.category === 'technical' ? '[TECH]' : '[NON-TECH]'} {ev.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={handleOpenCreateCoordForm} style={styles.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Add Coordinator
                </button>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeaderFlex}>
                  <h3 style={styles.cardTitle}>Student Coordinators ({filteredCoordinators.length})</h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Coordinators assigned here will dynamically appear on the Registration page for their respective events.
                  </span>
                </div>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Coordinator</th>
                        <th style={styles.th}>Contact Info</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Assigned Events</th>
                        <th style={styles.th}>Status</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoordinators.map(coord => (
                        <tr key={coord.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.userCell}>
                              <div style={{ ...styles.userAvatarSm, background: '#eff6ff', color: '#2563eb' }}>
                                {coord.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span style={styles.strongText}>{coord.name}</span>
                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  {coord.department || 'CSE'} • {coord.year || '3rd Year'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: '0.85rem' }}>
                              <div style={{ fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaPhone size={11} color="#2563eb" /> {coord.phone}
                              </div>
                              {coord.email && (
                                <div style={{ color: '#64748b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                  <FaEnvelope size={10} /> {coord.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: coord.role === 'Lead Coordinator' ? '#dbeafe' : '#f0fdf4',
                              color: coord.role === 'Lead Coordinator' ? '#1e40af' : '#166534',
                              border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                              {coord.role || 'Coordinator'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                              {Array.isArray(coord.assignedEvents) && coord.assignedEvents.map(eventId => {
                                const ev = events.find(e => e.id.toLowerCase() === eventId.toLowerCase());
                                return (
                                  <span key={eventId} style={{
                                    background: ev?.category === 'technical' ? '#eff6ff' : '#fdf2f8',
                                    color: ev?.category === 'technical' ? '#1d4ed8' : '#be185d',
                                    border: '1px solid ' + (ev?.category === 'technical' ? '#bfdbfe' : '#fbcfe8'),
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: '600'
                                  }}>
                                    {ev ? ev.name : eventId}
                                  </span>
                                );
                              })}
                              {(!coord.assignedEvents || coord.assignedEvents.length === 0) && (
                                <span style={{ color: '#ef4444', fontSize: '0.78rem', fontStyle: 'italic' }}>No event assigned</span>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              color: coord.isActive !== false ? '#059669' : '#dc2626'
                            }}>
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: coord.isActive !== false ? '#10b981' : '#ef4444'
                              }}></span>
                              {coord.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button 
                              onClick={() => handleToggleCoord(coord)} 
                              style={{ 
                                background: coord.isActive !== false ? '#ecfdf5' : '#fef2f2',
                                border: '1px solid ' + (coord.isActive !== false ? '#a7f3d0' : '#fecaca'),
                                color: coord.isActive !== false ? '#059669' : '#dc2626',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '6px',
                                marginRight: '0.5rem'
                              }}
                              title={coord.isActive !== false ? 'Deactivate Coordinator' : 'Activate Coordinator'}
                            >
                              {coord.isActive !== false ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                            </button>
                            <button onClick={() => handleOpenEditCoordForm(coord)} style={styles.actionBtnEdit} title="Edit Coordinator">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteCoord(coord.id, coord.name)} style={styles.actionBtnDelete} title="Delete Coordinator">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredCoordinators.length && (
                        <tr><td colSpan="6" style={styles.emptyState}>No coordinators found.</td></tr>
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
      {/* MODAL 1: USER CREATE / EDIT                              */}
      {/* ======================================================== */}
      {isUserFormVisible && (
        <div style={styles.modalBackdrop} onClick={resetUserForm}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconBox}><FaUserCheck size={20} /></div>
                <div>
                  <h3 style={styles.modalTitle}>{editingUserId ? 'Edit System User' : 'Create New User'}</h3>
                  <p style={styles.modalSubtitle}>{editingUserId ? 'Modify user credentials or permission level' : 'Grant administrative access to a new user account'}</p>
                </div>
              </div>
              <button onClick={resetUserForm} style={styles.modalCloseBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitUser} style={styles.modalForm}>
              <div style={styles.modalFormBody}>
                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Username *</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="e.g. jdoe_admin"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Password {editingUserId ? '(Leave blank to retain current)' : '*'}</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={editingUserId ? '••••••••' : 'Enter strong password'}
                    style={styles.input}
                    required={!editingUserId}
                  />
                </div>

                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Assigned Role *</label>
                  <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value)}
                    style={styles.select}
                    required
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={resetUserForm} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.primaryBtn}>
                  {editingUserId ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ROLE CREATE / EDIT                              */}
      {/* ======================================================== */}
      {isRoleFormVisible && (
        <div style={styles.modalBackdrop} onClick={resetRoleForm}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={styles.modalIconBoxRole}><FaShieldAlt size={20} /></div>
                <div>
                  <h3 style={styles.modalTitle}>{editingRoleId ? 'Edit Role' : 'Create New Role'}</h3>
                  <p style={styles.modalSubtitle}>{editingRoleId ? 'Modify custom role label' : 'Define an access level identifier for user grouping'}</p>
                </div>
              </div>
              <button onClick={resetRoleForm} style={styles.modalCloseBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitRole} style={styles.modalForm}>
              <div style={styles.modalFormBody}>
                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Role Identifier Name *</label>
                  <input 
                    type="text" 
                    value={roleNameInput} 
                    onChange={(e) => setRoleNameInput(e.target.value)} 
                    placeholder="e.g. coordinator, validator, reviewer"
                    style={styles.input}
                    required
                  />
                  <span style={styles.inputHelper}>Lowercase identifier without spaces recommended.</span>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={resetRoleForm} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={{ ...styles.primaryBtn, background: '#059669' }}>
                  {editingRoleId ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SPONSOR CREATE / EDIT                           */}
      {/* ======================================================== */}
      {isSponsorFormVisible && (
        <div style={styles.modalBackdrop} onClick={resetSponsorForm}>
          <div style={{ ...styles.modalCard, maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={{ ...styles.modalIconBox, background: '#fef3c7', color: '#b45309' }}>
                  <FaHandshake size={20} />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>{editingSponsorId ? 'Edit Sponsor' : 'Add New Sponsor'}</h3>
                  <p style={styles.modalSubtitle}>Configure branding, category, contact info, and website link</p>
                </div>
              </div>
              <button onClick={resetSponsorForm} style={styles.modalCloseBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitSponsor} style={styles.modalForm}>
              <div style={styles.modalFormBody}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Sponsor Name *</label>
                    <input 
                      type="text" 
                      value={sponsorName} 
                      onChange={(e) => setSponsorName(e.target.value)} 
                      placeholder="e.g. APEX DYNAMICS"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Company / Organization</label>
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      placeholder="e.g. Apex Dynamics Pvt Ltd"
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Logo Upload Section */}
                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Sponsor Logo</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '2px dashed #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {logoPreview ? (
                        <img src={logoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <FaImage color="#94a3b8" size={24} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoFileSelect} 
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        style={{ display: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.5rem 0.9rem',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          disabled={isUploadingLogo}
                        >
                          <FaUpload size={12} /> {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        </button>
                        {logoPreview && (
                          <button 
                            type="button" 
                            onClick={() => { setSponsorLogo(''); setLogoPreview(''); }}
                            style={{
                              padding: '0.5rem 0.8rem',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#64748b',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span style={styles.inputHelper}>Supported formats: PNG, JPG, WEBP, SVG (Max 5MB)</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Sponsorship Level *</label>
                    <select 
                      value={sponsorCategory} 
                      onChange={(e) => setSponsorCategory(e.target.value)}
                      style={styles.select}
                      required
                    >
                      <option value="Title Sponsor">Title Sponsor</option>
                      <option value="Gold Sponsor">Gold Sponsor</option>
                      <option value="Silver Sponsor">Silver Sponsor</option>
                      <option value="Bronze Sponsor">Bronze Sponsor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Display Order (Priority)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={sponsorDisplayOrder} 
                      onChange={(e) => setSponsorDisplayOrder(e.target.value)} 
                      placeholder="1"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Website URL</label>
                  <input 
                    type="url" 
                    value={sponsorWebsite} 
                    onChange={(e) => setSponsorWebsite(e.target.value)} 
                    placeholder="https://example.com/partner"
                    style={styles.input}
                  />
                </div>

                <div style={styles.modalInputGroup}>
                  <label style={styles.label}>Sponsor Description</label>
                  <textarea 
                    value={sponsorDesc} 
                    onChange={(e) => setSponsorDesc(e.target.value)} 
                    placeholder="Short description displayed on the flip card on the public website..."
                    rows={3}
                    style={{ ...styles.input, resize: 'vertical' }}
                  />
                </div>

                {/* Contact Information */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Contact Person (Internal Admin Record)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#64748b' }}>Contact Name</label>
                      <input 
                        type="text" 
                        value={sponsorContactName} 
                        onChange={(e) => setSponsorContactName(e.target.value)} 
                        placeholder="e.g. John Doe"
                        style={{ ...styles.input, marginTop: '2px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#64748b' }}>Phone Number</label>
                      <input 
                        type="text" 
                        value={sponsorContactPhone} 
                        onChange={(e) => setSponsorContactPhone(e.target.value)} 
                        placeholder="e.g. 9876543210"
                        style={{ ...styles.input, marginTop: '2px' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '0.6rem' }}>
                    <label style={{ fontSize: '0.78rem', color: '#64748b' }}>Contact Email</label>
                    <input 
                      type="email" 
                      value={sponsorContactEmail} 
                      onChange={(e) => setSponsorContactEmail(e.target.value)} 
                      placeholder="e.g. partner@company.com"
                      style={{ ...styles.input, marginTop: '2px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.2rem' }}>
                  <input 
                    type="checkbox" 
                    id="sponsorActive"
                    checked={sponsorIsActive} 
                    onChange={(e) => setSponsorIsActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="sponsorActive" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>
                    Active Sponsor (Visible publicly on website marquee)
                  </label>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={resetSponsorForm} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={{ ...styles.primaryBtn, background: '#2563eb' }}>
                  {editingSponsorId ? 'Save Changes' : 'Create Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: COORDINATOR CREATE / EDIT                       */}
      {/* ======================================================== */}
      {isCoordFormVisible && (
        <div style={styles.modalBackdrop} onClick={resetCoordForm}>
          <div style={{ ...styles.modalCard, maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderLeft}>
                <div style={{ ...styles.modalIconBox, background: '#eff6ff', color: '#2563eb' }}>
                  <FaUserTie size={20} />
                </div>
                <div>
                  <h3 style={styles.modalTitle}>{editingCoordId ? 'Edit Student Coordinator' : 'Add Student Coordinator'}</h3>
                  <p style={styles.modalSubtitle}>Assign lead student coordinators to one or multiple symposium events</p>
                </div>
              </div>
              <button onClick={resetCoordForm} style={styles.modalCloseBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitCoord} style={styles.modalForm}>
              <div style={styles.modalFormBody}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input 
                      type="text" 
                      value={coordName} 
                      onChange={(e) => setCoordName(e.target.value)} 
                      placeholder="e.g. Mohammed Nabeel"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Phone Number (10 Digits) *</label>
                    <input 
                      type="tel" 
                      value={coordPhone} 
                      onChange={(e) => setCoordPhone(e.target.value)} 
                      placeholder="e.g. 9994023366"
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>WhatsApp Number</label>
                    <input 
                      type="tel" 
                      value={coordWhatsapp} 
                      onChange={(e) => setCoordWhatsapp(e.target.value)} 
                      placeholder="e.g. 9994023366"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input 
                      type="email" 
                      value={coordEmail} 
                      onChange={(e) => setCoordEmail(e.target.value)} 
                      placeholder="e.g. nabeel@cahcet.edu.in"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Department</label>
                    <input 
                      type="text" 
                      value={coordDept} 
                      onChange={(e) => setCoordDept(e.target.value)} 
                      placeholder="CSE / IT / ECE"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Year of Study</label>
                    <select 
                      value={coordYear} 
                      onChange={(e) => setCoordYear(e.target.value)}
                      style={styles.select}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Role *</label>
                    <select 
                      value={coordRole} 
                      onChange={(e) => setCoordRole(e.target.value)}
                      style={styles.select}
                      required
                    >
                      <option value="Lead Coordinator">Lead Coordinator</option>
                      <option value="Coordinator">Coordinator</option>
                    </select>
                  </div>
                </div>

                {/* Event Assignment Checklist */}
                <div style={styles.modalInputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={styles.label}>Assigned Events * ({coordEvents.length} selected)</label>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Select one or more events</span>
                  </div>

                  <div style={{ 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '10px', 
                    padding: '0.85rem', 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}>
                    {/* Technical Events */}
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e40af', letterSpacing: '0.04em' }}>
                      TECHNICAL EVENTS
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {events.filter(e => e.category === 'technical').map(ev => {
                        const isChecked = coordEvents.includes(ev.id);
                        return (
                          <label 
                            key={ev.id} 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '6px',
                              background: isChecked ? '#eff6ff' : '#ffffff',
                              border: isChecked ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: isChecked ? '700' : '500',
                              color: isChecked ? '#1e40af' : '#334155'
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleEventSelection(ev.id)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span>{ev.name}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Non-Technical Events */}
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#9d174d', letterSpacing: '0.04em', marginTop: '6px' }}>
                      NON-TECHNICAL EVENTS
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {events.filter(e => e.category === 'non-technical').map(ev => {
                        const isChecked = coordEvents.includes(ev.id);
                        return (
                          <label 
                            key={ev.id} 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '6px',
                              background: isChecked ? '#fdf2f8' : '#ffffff',
                              border: isChecked ? '1px solid #fbcfe8' : '1px solid #e2e8f0',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: isChecked ? '700' : '500',
                              color: isChecked ? '#be185d' : '#334155'
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleEventSelection(ev.id)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span>{ev.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.label}>Display Order</label>
                    <input 
                      type="number" 
                      min="1"
                      value={coordDisplayOrder} 
                      onChange={(e) => setCoordDisplayOrder(e.target.value)} 
                      placeholder="1"
                      style={styles.input}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '1.2rem' }}>
                    <input 
                      type="checkbox" 
                      id="coordActive"
                      checked={coordIsActive} 
                      onChange={(e) => setCoordIsActive(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="coordActive" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>
                      Active Status
                    </label>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={resetCoordForm} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={{ ...styles.primaryBtn, background: '#2563eb' }}>
                  {editingCoordId ? 'Save Changes' : 'Add Coordinator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// STYLES
// ========================================================
const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' },
  loadingContainer: { display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  
  // Sidebar
  sidebar: { width: '280px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader: { padding: '1.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' },
  logoCircle: { width: '42px', height: '42px', borderRadius: '12px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sidebarTitle: { margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' },
  sidebarSubtitle: { fontSize: '0.75rem', color: '#64748b', fontWeight: '600', letterSpacing: '0.04em' },
  
  // Nav
  navMenu: { flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' },
  navItem: { display: 'flex', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '10px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', width: '100%' },
  navItemActive: { background: '#eff6ff', color: '#2563eb' },
  navIcon: { marginRight: '12px', fontSize: '1.1rem', flexShrink: 0 },
  
  // Dropdown
  dropdownGroup: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  dropdownToggle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '10px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'all 0.2s ease' },
  dropdownToggleActive: { color: '#0f172a', background: '#f8fafc' },
  dropdownToggleLeft: { display: 'flex', alignItems: 'center' },
  dropdownChevron: { color: '#94a3b8', display: 'flex', alignItems: 'center' },
  submenu: { display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.5rem', marginTop: '0.2rem', marginBottom: '0.4rem' },
  subnavItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.86rem', fontWeight: '500', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' },
  subnavItemActive: { background: '#dbeafe', color: '#1d4ed8', fontWeight: '700' },
  subnavIcon: { marginRight: '10px', fontSize: '0.95rem' },
  badgeCount: { background: '#e2e8f0', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700' },

  sidebarFooter: { padding: '1.25rem 1rem', borderTop: '1px solid #f1f5f9' },
  logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.8rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s ease' },
  
  // Main Layout
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' },
  topHeader: { background: '#ffffff', minHeight: '85px', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(8px)' },
  pageTitle: { margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' },
  pageSubtitle: { margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '400' },
  userProfile: { display: 'flex', alignItems: 'center' },
  avatar: { width: '42px', height: '42px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
  contentWrapper: { padding: '2.5rem', flex: 1, overflowY: 'auto' },

  // Views & Headers
  viewContainer: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  viewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  viewDescription: { margin: 0, fontSize: '0.9rem', color: '#64748b', maxWidth: '650px' },
  searchBox: { flex: 1, minWidth: '260px' },
  searchInput: { width: '100%', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.9rem', outline: 'none', color: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  createBtn: { display: 'flex', alignItems: 'center', background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '10px', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37,99,235,0.25)', transition: 'background 0.2s', whiteSpace: 'nowrap' },

  // Cards & Tables
  card: { background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', overflow: 'hidden' },
  cardHeaderFlex: { padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' },
  cardTitle: { margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#ffffff', padding: '1rem 1.75rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '1.1rem 1.75rem', color: '#334155', fontSize: '0.9rem' },
  
  userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatarSm: { width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 },
  strongText: { fontWeight: '600', color: '#0f172a' },
  idBadge: { background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' },
  
  roleBadge: { display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.03em' },
  roleBadgeSuper: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
  roleBadgeAdmin: { background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' },
  roleBadgeDefault: { background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' },
  
  userCountBadge: { background: '#ecfdf5', color: '#065f46', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' },
  systemBadge: { background: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' },
  customBadge: { background: '#f0fdf4', color: '#166534', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' },
  
  statusActive: { color: '#10b981', fontWeight: '600', fontSize: '0.85rem' },
  actionBtnEdit: { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer', fontSize: '0.9rem', padding: '0.45rem 0.65rem', borderRadius: '6px', marginRight: '0.5rem', transition: 'all 0.15s' },
  actionBtnDelete: { background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', padding: '0.45rem 0.65rem', borderRadius: '6px', transition: 'all 0.15s' },
  emptyState: { padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' },

  // Stats Grid for Dashboard
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { background: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  statLabel: { color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statValue: { color: '#0f172a', fontSize: '2.2rem', fontWeight: '800' },
  dashboardView: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },

  // ==================== OVERLAY MODALS ====================
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1.5rem'
  },
  modalCard: {
    background: '#ffffff',
    width: '100%',
    maxWidth: '520px',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    padding: '1.5rem 1.75rem',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f1f5f9',
    background: '#ffffff'
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
    background: '#eff6ff',
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
    background: '#ecfdf5',
    color: '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  modalSubtitle: {
    margin: '0.2rem 0 0 0',
    fontSize: '0.8rem',
    color: '#64748b'
  },
  modalCloseBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
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
    gap: '1.25rem',
    background: '#ffffff'
  },
  modalInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: { 
    fontSize: '0.85rem', 
    fontWeight: '600', 
    color: '#334155' 
  },
  input: { 
    padding: '0.75rem 1rem', 
    border: '1px solid #cbd5e1', 
    borderRadius: '8px', 
    fontSize: '0.92rem', 
    outline: 'none', 
    background: '#ffffff', 
    color: '#0f172a',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box'
  },
  inputHelper: { 
    fontSize: '0.75rem', 
    color: '#94a3b8', 
    marginTop: '0.2rem' 
  },
  select: { 
    padding: '0.75rem 1rem', 
    border: '1px solid #cbd5e1', 
    borderRadius: '8px', 
    fontSize: '0.92rem', 
    outline: 'none', 
    background: '#ffffff', 
    color: '#0f172a',
    width: '100%',
    boxSizing: 'border-box'
  },
  modalFooter: {
    padding: '1.25rem 1.75rem',
    borderTop: '1px solid #f1f5f9',
    background: '#f8fafc',
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
    background: '#ffffff', 
    color: '#475569', 
    border: '1px solid #cbd5e1', 
    borderRadius: '8px', 
    fontSize: '0.92rem', 
    fontWeight: '600', 
    cursor: 'pointer' 
  }
};
