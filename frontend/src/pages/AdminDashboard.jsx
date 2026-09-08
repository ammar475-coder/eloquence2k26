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
  FaImage,
  FaClock,
  FaMapMarkerAlt,
  FaBolt,
  FaGamepad,
  FaSun,
  FaMoon,
  FaFilePdf,
  FaPaperPlane,
  FaThLarge,
  FaTable,
  FaBars
} from 'react-icons/fa';
import defaultEvents from '../data/events.js';
import { getEventBanner, defaultEventImages } from '../data/eventImages.js';
import { getApiUrl } from '../config/api';

const EXISTING_POSTER_PRESETS = [
  { id: 'tech-01', label: 'Slide Craft (PPT)', img: defaultEventImages['tech-01'] },
  { id: 'tech-02', label: 'Crack the Code (Coding)', img: defaultEventImages['tech-02'] },
  { id: 'tech-03', label: 'Tech Battle (Quiz)', img: defaultEventImages['tech-03'] },
  { id: 'tech-04', label: 'Web / Prompt Design', img: defaultEventImages['tech-04'] },
  { id: 'tech-05', label: 'Chart Canvas (Poster)', img: defaultEventImages['tech-05'] },
  { id: 'tech-06', label: 'UI / UX Design', img: defaultEventImages['tech-06'] },
  { id: 'nontech-01', label: 'Snap & Reel (Media)', img: defaultEventImages['nontech-01'] },
  { id: 'nontech-02', label: 'Link Up (Connections)', img: defaultEventImages['nontech-02'] },
  { id: 'nontech-03', label: 'Hunt Zone (Treasure)', img: defaultEventImages['nontech-03'] },
  { id: 'nontech-04', label: 'Henna Heist (Mehandi)', img: defaultEventImages['nontech-04'] },
  { id: 'nontech-05', label: 'Battle of Champions (Gaming)', img: defaultEventImages['nontech-05'] },
  { id: 'nontech-06', label: '64 Squares (Chess)', img: defaultEventImages['nontech-06'] },
];

export default function AdminDashboard({ token, user, onLogout }) {
  const loggedRole = String(user?.role || 'admin').toLowerCase();
  const isAdminOrSuper = loggedRole === 'admin' || loggedRole === 'superadmin';
  const isRegCoordinator = loggedRole.includes('registration') || loggedRole.includes('reg_coord') || loggedRole === 'registration coordinator';

  const [activeTab, setActiveTab] = useState(() => {
    if (isRegCoordinator) return 'registration';
    return 'dashboard';
  });

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('admin_theme') || 'light');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('admin_theme', next);
  };

  // Redirect if non-admin user accesses restricted tabs
  useEffect(() => {
    if (!isAdminOrSuper && (activeTab === 'manage-users' || activeTab === 'manage-roles')) {
      setActiveTab(isRegCoordinator ? 'registration' : 'dashboard');
    }
  }, [activeTab, isAdminOrSuper, isRegCoordinator]);

  // ==================== EVENTS STATE ====================
  const [eventsList, setEventsList] = useState(defaultEvents);
  const [eventFilter, setEventFilter] = useState('all');
  const [eventSearch, setEventSearch] = useState('');
  const [isEventEditModalOpen, setIsEventEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Event Edit Form Fields
  const [eventName, setEventName] = useState('');
  const [eventAlias, setEventAlias] = useState('');
  const [eventSubtitle, setEventSubtitle] = useState('');
  const [eventCategory, setEventCategory] = useState('technical');
  const [eventVenue, setEventVenue] = useState('');
  const [eventTiming, setEventTiming] = useState('');
  const [eventFee, setEventFee] = useState('');
  const [eventTeamSize, setEventTeamSize] = useState('');
  const [eventTag, setEventTag] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [eventImagePreview, setEventImagePreview] = useState('');
  const [isUploadingEventImage, setIsUploadingEventImage] = useState(false);

  const eventFileInputRef = useRef(null);

  // ==================== REGISTRATIONS STATE ====================
  const [registrationsList, setRegistrationsList] = useState([]);
  const [regSearch, setRegSearch] = useState('');
  const [regCategoryFilter, setRegCategoryFilter] = useState('all');
  const [onlineRegSearch, setOnlineRegSearch] = useState('');
  const [onlineRegCategoryFilter, setOnlineRegCategoryFilter] = useState('all');

  // ==================== PARTICIPANT LIST STATE & HELPERS ====================
  const [partEventFilter, setPartEventFilter] = useState('all');
  const [partCategoryFilter, setPartCategoryFilter] = useState('all');
  const [partSearch, setPartSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Send Modal States
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendTargetEvent, setSendTargetEvent] = useState(null);
  const [selectedCoordName, setSelectedCoordName] = useState('');
  const [isSendingList, setIsSendingList] = useState(false);

  const getTeamMembers = (r) => {
    if (Array.isArray(r.registration_members) && r.registration_members.length > 0) {
      return r.registration_members.map(m => m.member_name || m.name || m);
    }
    if (Array.isArray(r.teamMembersList) && r.teamMembersList.length > 0) {
      return r.teamMembersList;
    }
    if (Array.isArray(r.teamMembers) && r.teamMembers.length > 0) {
      return r.teamMembers;
    }
    if (typeof r.team_members === 'string') {
      try {
        const parsed = JSON.parse(r.team_members);
        if (Array.isArray(parsed)) return parsed.map(m => typeof m === 'string' ? m : (m.name || m));
      } catch (e) {
        if (r.team_members.trim()) return [r.team_members.trim()];
      }
    }
    return [];
  };

  const getEventCategory = (r) => {
    if (!r) return 'non-technical';
    const evtId = r.event_id || r.eventId;
    if (eventsList && Array.isArray(eventsList)) {
      const evt = eventsList.find(e => e.id === evtId);
      if (evt && evt.category) return evt.category;
    }
    const id = String(evtId || '').toLowerCase();
    return id.startsWith('tech') ? 'technical' : 'non-technical';
  };

  const getFee = (r) => Number(r.total_fee || r.totalAmount || r.total_amount || 0);

  const participantFilteredRegs = registrationsList.filter(r => {
    if (partEventFilter !== 'all' && (r.event_id || r.eventId) !== partEventFilter) return false;
    if (partCategoryFilter !== 'all' && getEventCategory(r) !== partCategoryFilter) return false;

    const q = partSearch.toLowerCase().trim();
    if (!q) return true;
    const name = (r.full_name || r.fullName || '').toLowerCase();
    const teamName = (r.team_name || r.teamName || '').toLowerCase();
    const ticket = (r.ticket_code || r.registrationId || r.id || '').toString().toLowerCase();
    const phone = (r.phone || '').toLowerCase();
    const college = (r.college || '').toLowerCase();
    const members = getTeamMembers(r).join(' ').toLowerCase();

    return name.includes(q) || teamName.includes(q) || ticket.includes(q) || phone.includes(q) || college.includes(q) || members.includes(q);
  });

  const handleExportPDF = (targetEvt) => {
    const evtRegs = registrationsList.filter(r => (r.event_id || r.eventId) === targetEvt.id);
    const win = window.open('', '_blank');
    if (!win) return toast.error('Please allow popups to export PDF');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${targetEvt.name} - Official Participant Sheet</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #2563eb; padding-bottom: 12px; }
          .header h1 { margin: 0; color: #1e3a8a; font-size: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0 0; color: #64748b; font-size: 14px; font-weight: 600; }
          .info-bar { display: flex; justify-content: space-between; background: #f8fafc; padding: 10px 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; vertical-align: top; }
          th { background: #1e293b; color: #ffffff; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge { display: inline-block; background: #059669; color: #ffffff; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .members-box { background: #f1f5f9; padding: 6px 8px; border-radius: 6px; font-size: 11px; margin-top: 3px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ELOQUENCE 2026 — OFFICIAL PARTICIPANT SHEET</h1>
          <p>DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</p>
        </div>

        <div class="info-bar">
          <div><strong>EVENT:</strong> ${targetEvt.name} (${targetEvt.category.toUpperCase()})</div>
          <div><strong>TOTAL REGISTRATIONS:</strong> ${evtRegs.length}</div>
          <div><strong>DATE:</strong> ${new Date().toLocaleDateString()}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th style="width: 100px;">Ticket Code</th>
              <th style="width: 110px;">Team Name</th>
              <th>Lead Participant</th>
              <th>Phone & Email</th>
              <th>Team Members</th>
              <th>College & Dept</th>
            </tr>
          </thead>
          <tbody>
            ${evtRegs.map((r, i) => {
              const members = getTeamMembers(r);
              return `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${r.ticket_code || r.registrationId || r.id || '-'}</strong></td>
                  <td>${r.team_name || r.teamName ? `<span class="badge">${r.team_name || r.teamName}</span>` : 'Individual'}</td>
                  <td><strong>${r.full_name || r.fullName || 'Anonymous'}</strong></td>
                  <td>${r.phone || '-'}<br/><span style="color:#64748b;font-size:11px;">${r.email || '-'}</span></td>
                  <td>
                    ${members.length > 0 ? `<strong>${members.length + 1} Members:</strong><div class="members-box">1. ${r.full_name || r.fullName} (Lead)<br/>${members.map((m, idx) => `${idx + 2}. ${m}`).join('<br/>')}</div>` : 'Individual Entry'}
                  </td>
                  <td>${r.college || 'CAHCET'}<br/><span style="color:#64748b;font-size:11px;">${r.department || ''} (${r.year || ''})</span></td>
                </tr>
              `;
            }).join('')}
            ${evtRegs.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:20px;">No registered participants for this event.</td></tr>' : ''}
          </tbody>
        </table>

        <div class="footer">
          <div>Generated on: ${new Date().toLocaleString()}</div>
          <div>Authorized Signature: _______________________</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;
    win.document.write(htmlContent);
    win.document.close();
  };

  const handleOpenSendModal = (evt) => {
    setSendTargetEvent(evt);
    const assigned = coordinators.find(c => Array.isArray(c.assignedEvents) && c.assignedEvents.map(e => e.toLowerCase()).includes(evt.id.toLowerCase()));
    if (assigned) {
      setSelectedCoordName(assigned.name);
    } else if (coordinators.length > 0) {
      setSelectedCoordName(coordinators[0].name);
    } else {
      setSelectedCoordName('');
    }
    setIsSendModalOpen(true);
  };

  const handleConfirmSendList = () => {
    if (!sendTargetEvent || !selectedCoordName.trim()) {
      return toast.error('Please select an Event Coordinator');
    }

    setIsSendingList(true);
    const toastId = toast.loading(`Dispatching list for "${sendTargetEvent.name}"...`);

    fetch(getApiUrl('/api/send-participant-list'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: sendTargetEvent.id,
        eventName: sendTargetEvent.name,
        coordinatorName: selectedCoordName.trim()
      })
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          toast.success(resData.message || 'Participant list sent successfully!', { id: toastId, duration: 5000 });
          setIsSendModalOpen(false);
          fetchDispatches();
        } else {
          toast.error(resData.message || 'Failed to send list', { id: toastId });
        }
      })
      .catch(err => {
        console.error('Send list error:', err);
        toast.error('Network error while dispatching list', { id: toastId });
      })
      .finally(() => setIsSendingList(false));
  };

  // Dispatches State & Handlers
  const [dispatchesList, setDispatchesList] = useState([]);
  const [editingDispatchId, setEditingDispatchId] = useState(null);
  const [editCoordNameInput, setEditCoordNameInput] = useState('');
  const [isEditDispatchModalOpen, setIsEditDispatchModalOpen] = useState(false);

  const fetchDispatches = () => {
    fetch(getApiUrl('/api/dispatches'))
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data)) {
          setDispatchesList(result.data);
        }
      })
      .catch(err => console.warn('Error fetching dispatches list:', err));
  };

  const handleDeleteDispatch = (id, eventName, coordinatorName) => {
    if (!window.confirm(`Are you sure you want to delete and revoke the dispatched list for "${eventName}" sent to ${coordinatorName}?`)) return;

    const toastId = toast.loading(`Revoking dispatched list for ${eventName}...`);
    fetch(getApiUrl(`/api/dispatches/${id}`), { method: 'DELETE' })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success(result.message || 'Dispatch deleted & revoked successfully!', { id: toastId });
          fetchDispatches();
        } else {
          toast.error(result.message || 'Failed to delete dispatch', { id: toastId });
        }
      })
      .catch(err => {
        console.error('Delete dispatch error:', err);
        toast.error('Network error while deleting dispatch', { id: toastId });
      });
  };

  const handleOpenEditDispatchModal = (dispatch) => {
    setEditingDispatchId(dispatch.id);
    setEditCoordNameInput(dispatch.coordinatorName);
    setIsEditDispatchModalOpen(true);
  };

  const handleSaveDispatchEdit = (e) => {
    e.preventDefault();
    if (!editingDispatchId || !editCoordNameInput.trim()) return toast.error('Please enter a coordinator name');

    const toastId = toast.loading('Updating dispatched list...');
    fetch(getApiUrl(`/api/dispatches/${editingDispatchId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinatorName: editCoordNameInput.trim() })
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Dispatch re-assigned successfully!', { id: toastId });
          setIsEditDispatchModalOpen(false);
          fetchDispatches();
        } else {
          toast.error(result.message || 'Failed to update dispatch', { id: toastId });
        }
      })
      .catch(err => {
        console.error('Update dispatch error:', err);
        toast.error('Network error while updating dispatch', { id: toastId });
      });
  };

  // Form State for On-Site Registration Tab
  const [onSiteEventId, setOnSiteEventId] = useState('');
  const [onSiteFullName, setOnSiteFullName] = useState('');
  const [onSiteEmail, setOnSiteEmail] = useState('');
  const [onSitePhone, setOnSitePhone] = useState('');
  const [onSiteCollege, setOnSiteCollege] = useState('C. Abdul Hakeem College of Engineering & Technology');
  const [onSiteDept, setOnSiteDept] = useState('CSE');
  const [onSiteYear, setOnSiteYear] = useState('3rd Year');
  const [onSiteTeamName, setOnSiteTeamName] = useState('');
  const [onSiteTeamMembers, setOnSiteTeamMembers] = useState(['']);
  const [isRegisteringOnSite, setIsRegisteringOnSite] = useState(false);

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
  const [sponsorCategory, setSponsorCategory] = useState('Elite');
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

  const fetchRegistrations = () => {
    fetch(getApiUrl('/api/registrations'))
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.registrations)) {
          setRegistrationsList(result.registrations);
        } else if (Array.isArray(result)) {
          setRegistrationsList(result);
        }
      })
      .catch(err => console.warn('Error fetching registrations list:', err));
  };

  // ==================== INITIAL DATA FETCH ====================
  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchRoles();
    fetchEvents();
    fetchSponsors();
    fetchCoordinators();
    fetchRegistrations();
  }, [token]);

  // Handle ESC key to close modal overlays
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isUserFormVisible) resetUserForm();
        if (isRoleFormVisible) resetRoleForm();
        if (isEventEditModalOpen) resetEventEditModal();
        if (isSponsorFormVisible) resetSponsorForm();
        if (isCoordFormVisible) resetCoordForm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUserFormVisible, isRoleFormVisible, isEventEditModalOpen, isSponsorFormVisible, isCoordFormVisible]);

  const handleAuthError = () => {
    toast.error('Session expired or unauthorized');
    onLogout();
  };

  const handleOnSiteRegisterSubmit = (e) => {
    e.preventDefault();
    if (!onSiteEventId) return toast.error('Please select an event');
    if (!onSiteFullName.trim()) return toast.error('Participant name is required');
    if (!onSitePhone.trim() || !/^[6-9]\d{9}$/.test(onSitePhone.trim().replace(/\s+/g, ''))) {
      return toast.error('Valid 10-digit phone number is required');
    }
    if (!onSiteEmail.trim()) return toast.error('Email address is required');

    const selectedEvt = eventsList.find(evt => evt.id === onSiteEventId);
    if (!selectedEvt) return toast.error('Event not found');

    const validMembers = onSiteTeamMembers.filter(m => m.trim().length > 0);
    const memberCount = 1 + validMembers.length;
    const feePerHead = selectedEvt.feePerHead || 50;
    const totalFee = selectedEvt.isTeam && selectedEvt.feeType === 'fixed' ? feePerHead : (feePerHead * memberCount);

    const payload = {
      currentEvent: selectedEvt,
      fields: {
        fullName: onSiteFullName.trim(),
        email: onSiteEmail.trim(),
        phone: onSitePhone.trim(),
        college: onSiteCollege.trim(),
        department: onSiteDept.trim(),
        year: onSiteYear,
        teamName: selectedEvt.isTeam ? onSiteTeamName.trim() : null,
        teamMembers: validMembers
      },
      totalFee
    };

    setIsRegisteringOnSite(true);
    const toastId = toast.loading('Processing on-site registration...');

    fetch(getApiUrl('/api/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          const ticketCode = resData.ticketData?.ticketCode || 'ELQ26-REG';
          toast.success(`Registration successful! Ticket Code: ${ticketCode}`, { id: toastId, duration: 6000 });
          setOnSiteFullName('');
          setOnSiteEmail('');
          setOnSitePhone('');
          setOnSiteTeamName('');
          setOnSiteTeamMembers(['']);
          fetchRegistrations();
          fetchDashboardData();
        } else {
          toast.error(resData.message || 'Registration failed', { id: toastId });
        }
      })
      .catch(err => {
        console.error('Registration API error:', err);
        toast.error('Network error during registration', { id: toastId });
      })
      .finally(() => setIsRegisteringOnSite(false));
  };

  const fetchDashboardData = () => {
    fetch(getApiUrl('/api/admin/dashboard'), { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
        else handleAuthError();
      })
      .catch(handleAuthError)
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    fetch(getApiUrl('/api/admin/users'), { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => { 
        if (result.success) setUsers(result.data); 
      })
      .catch(console.error);
  };

  const fetchRoles = () => {
    fetch(getApiUrl('/api/admin/roles'), { headers: { 'Authorization': `Bearer ${token}` } })
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
    fetch(getApiUrl('/api/admin/events'), { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setEventsList(result.data);
        }
      })
      .catch(() => {
        // Fallback to defaultEvents if API is unreachable
        setEventsList(defaultEvents);
      });
  };

  const fetchSponsors = () => {
    fetch(getApiUrl('/api/admin/sponsors'), { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(result => {
        if (result.success) setSponsors(result.data);
      })
      .catch(console.error);
  };

  const fetchCoordinators = () => {
    fetch(getApiUrl('/api/admin/coordinators'), { headers: { 'Authorization': `Bearer ${token}` } })
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
    const url = editingUserId ? getApiUrl(`/api/admin/users/${editingUserId}`) : getApiUrl('/api/admin/users');

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

    fetch(getApiUrl(`/api/admin/users/${id}`), {
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
    const url = editingRoleId ? getApiUrl(`/api/admin/roles/${editingRoleId}`) : getApiUrl('/api/admin/roles');

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

    fetch(getApiUrl(`/api/admin/roles/${id}`), {
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

  // ==================== EVENT HANDLERS ====================
  const resetEventEditModal = () => {
    setEditingEvent(null);
    setEventName('');
    setEventAlias('');
    setEventSubtitle('');
    setEventCategory('technical');
    setEventVenue('');
    setEventTiming('');
    setEventFee('');
    setEventTeamSize('');
    setEventTag('');
    setEventDesc('');
    setEventImage('');
    setEventImagePreview('');
    setIsEventEditModalOpen(false);
    if (eventFileInputRef.current) eventFileInputRef.current.value = '';
  };

  const handleOpenCreateEventModal = () => {
    resetEventEditModal();
    setEventFee('₹50 per head');
    setEventTiming('10:00 AM – 01:00 PM');
    setEventVenue('CSE Seminar Hall');
    setEventTeamSize('Individual');
    setIsEventEditModalOpen(true);
  };

  const handleOpenEditEventModal = (eventItem) => {
    setEditingEvent(eventItem);
    setEventName(eventItem.name || '');
    setEventAlias(eventItem.alias || eventItem.name || '');
    setEventSubtitle(eventItem.subtitle || '');
    setEventCategory(eventItem.category || 'technical');
    setEventVenue(eventItem.venue || '');
    setEventTiming(eventItem.timing || '');
    setEventFee(eventItem.fee || '');
    setEventTeamSize(eventItem.teamSize || '');
    setEventTag(eventItem.tag || '');
    setEventDesc(eventItem.description || '');
    setEventImage(eventItem.image || '');
    setEventImagePreview(getEventBanner(eventItem) || '');
    setIsEventEditModalOpen(true);
  };

  const handleEventImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size exceeds 5MB limit');
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setEventImagePreview(base64);
      setEventImage(base64);

      setIsUploadingEventImage(true);
      const loadingToast = toast.loading('Uploading event picture...');

      fetch(getApiUrl('/api/admin/upload'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          fileName: file.name,
          type: 'event'
        })
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setEventImage(result.url);
            toast.success('Event picture uploaded successfully', { id: loadingToast });
          } else {
            toast.error(result.message || 'Upload failed', { id: loadingToast });
          }
        })
        .catch(() => {
          toast.error('Network error uploading picture', { id: loadingToast });
        })
        .finally(() => setIsUploadingEventImage(false));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitEventEdit = (e) => {
    e.preventDefault();
    if (!eventName.trim() || !eventVenue.trim() || !eventTiming.trim() || !eventFee.trim()) {
      return toast.error('Please fill in all required event details');
    }

    const loadingToast = toast.loading(editingEvent ? 'Saving event changes...' : 'Creating new event...');
    const url = editingEvent ? getApiUrl(`/api/admin/events/${editingEvent.id}`) : getApiUrl('/api/admin/events');
    const method = editingEvent ? 'PUT' : 'POST';

    const payload = {
      name: eventName.trim(),
      alias: eventAlias.trim() || eventName.trim(),
      subtitle: eventSubtitle.trim(),
      category: eventCategory,
      venue: eventVenue.trim(),
      timing: eventTiming.trim(),
      fee: eventFee.trim(),
      teamSize: eventTeamSize.trim(),
      tag: eventTag.trim() || (eventCategory === 'technical' ? 'Technical Presentation' : 'Non-Technical Event'),
      description: eventDesc.trim(),
      image: eventImage.trim()
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success(editingEvent ? 'Event updated! Changes live on main events page.' : 'Event created successfully!', { id: loadingToast });
          if (editingEvent) {
            setEventsList(eventsList.map(item => item.id === editingEvent.id ? result.data : item));
          } else {
            setEventsList([...eventsList, result.data]);
          }
          resetEventEditModal();
        } else {
          toast.error(result.message || 'Failed to save event', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server connection error', { id: loadingToast }));
  };

  const handleDeleteEvent = (eventId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete event "${name}"?`)) {
      return;
    }
    const loadingToast = toast.loading(`Deleting event ${name}...`);
    fetch(getApiUrl(`/api/admin/events/${eventId}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          toast.success('Event deleted successfully', { id: loadingToast });
          setEventsList(eventsList.filter(e => e.id !== eventId));
        } else {
          toast.error(result.message || 'Failed to delete event', { id: loadingToast });
        }
      })
      .catch(() => toast.error('Server error deleting event', { id: loadingToast }));
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
    setSponsorCategory('Elite');
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
    setSponsorCategory(sponsor.category || 'Elite');
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
      setSponsorLogo(base64);

      // Upload automatically to backend
      setIsUploadingLogo(true);
      const loadingToast = toast.loading('Uploading logo asset...');

      fetch(getApiUrl('/api/admin/upload'), {
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
    const url = editingSponsorId ? getApiUrl(`/api/admin/sponsors/${editingSponsorId}`) : getApiUrl('/api/admin/sponsors');

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
    fetch(getApiUrl(`/api/admin/sponsors/${sponsor.id}/toggle`), {
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

    fetch(getApiUrl(`/api/admin/sponsors/${id}`), {
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
    const url = editingCoordId ? getApiUrl(`/api/admin/coordinators/${editingCoordId}`) : getApiUrl('/api/admin/coordinators');

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
    fetch(getApiUrl(`/api/admin/coordinators/${coord.id}/toggle`), {
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

    fetch(getApiUrl(`/api/admin/coordinators/${id}`), {
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

  const filteredEventsList = eventsList.filter(evt => {
    const matchesCategory = eventFilter === 'all' || evt.category === eventFilter;
    const q = eventSearch.toLowerCase().trim();
    const matchesSearch = !q || 
      evt.name.toLowerCase().includes(q) ||
      (evt.venue && evt.venue.toLowerCase().includes(q)) ||
      (evt.timing && evt.timing.toLowerCase().includes(q)) ||
      (evt.fee && evt.fee.toLowerCase().includes(q)) ||
      (evt.id && evt.id.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

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

  const isUserManagementActive = activeTab === 'manage-users' || activeTab === 'manage-roles';

  // Dynamic Theme-Aware Styles
  const S = {
    container: { display: 'flex', height: '100vh', maxHeight: '100vh', overflow: 'hidden', background: isDark ? '#0b0f19' : '#f8fafc', color: isDark ? '#e2e8f0' : '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', transition: 'background 0.2s ease, color 0.2s ease' },
    loadingContainer: { display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0b0f19' : '#f8fafc' },
    spinner: { width: '40px', height: '40px', border: isDark ? '3px solid #1e293b' : '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    
    // Sidebar - Fixed & Sticky
    sidebar: { width: '280px', height: '100vh', position: 'sticky', top: 0, background: isDark ? '#111827' : '#ffffff', borderRight: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 20, transition: 'background 0.2s ease' },
    sidebarHeader: { padding: '1.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9' },
    logoCircle: { width: '42px', height: '42px', borderRadius: '12px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    sidebarTitle: { margin: 0, fontSize: '1.15rem', fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a', letterSpacing: '-0.02em' },
    sidebarSubtitle: { fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#64748b', fontWeight: '600', letterSpacing: '0.04em' },
    
    // Nav
    navMenu: { flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' },
    navItem: { display: 'flex', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '10px', border: 'none', background: 'transparent', color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', width: '100%' },
    navItemActive: { background: isDark ? '#1e3a8a' : '#eff6ff', color: isDark ? '#93c5fd' : '#2563eb' },
    navIcon: { marginRight: '12px', fontSize: '1.1rem', flexShrink: 0 },
    
    // Dropdown
    dropdownGroup: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
    dropdownToggle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '10px', border: 'none', background: 'transparent', color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'all 0.2s ease' },
    dropdownToggleActive: { color: isDark ? '#f9fafb' : '#0f172a', background: isDark ? '#1f2937' : '#f8fafc' },
    dropdownToggleLeft: { display: 'flex', alignItems: 'center' },
    dropdownChevron: { color: isDark ? '#6b7280' : '#94a3b8', display: 'flex', alignItems: 'center' },
    submenu: { display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.5rem', marginTop: '0.2rem', marginBottom: '0.4rem' },
    subnavItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '8px', border: 'none', background: 'transparent', color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.86rem', fontWeight: '500', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' },
    subnavItemActive: { background: isDark ? '#1e3a8a' : '#dbeafe', color: isDark ? '#93c5fd' : '#1d4ed8', fontWeight: '700' },
    subnavIcon: { marginRight: '10px', fontSize: '0.95rem' },
    badgeCount: { background: isDark ? '#374151' : '#e2e8f0', color: isDark ? '#e5e7eb' : '#475569', padding: '0.15rem 0.45rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700' },

    sidebarFooter: { padding: '1.25rem 1rem', flexShrink: 0, borderTop: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9' },
    logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.8rem', background: isDark ? '#451a1a' : '#fef2f2', color: '#ef4444', border: isDark ? '1px solid #7f1d1d' : '1px solid #fee2e2', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s ease' },
    
    // Main Layout - Constrained with Independent Content Scroll
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowX: 'hidden', overflowY: 'hidden' },
    topHeader: { background: isDark ? '#111827' : '#ffffff', minHeight: '85px', padding: '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0, backdropFilter: 'blur(8px)' },
    pageTitle: { margin: 0, fontSize: '1.5rem', fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a', letterSpacing: '-0.02em' },
    pageSubtitle: { margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: isDark ? '#9ca3af' : '#64748b', fontWeight: '400' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
    themeToggleBtn: { background: isDark ? '#1f2937' : '#f1f5f9', border: isDark ? '1px solid #374151' : '1px solid #e2e8f0', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
    userProfile: { display: 'flex', alignItems: 'center' },
    avatar: { width: '42px', height: '42px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', border: '2px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
    contentWrapper: { padding: '2.5rem', flex: 1, overflowY: 'auto' },

    // Views & Headers
    viewContainer: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    viewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
    viewDescription: { margin: 0, fontSize: '0.9rem', color: isDark ? '#9ca3af' : '#64748b', maxWidth: '650px' },
    searchBox: { flex: 1, minWidth: '260px' },
    searchInput: { width: '100%', padding: '0.75rem 1.25rem', borderRadius: '10px', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', background: isDark ? '#1f2937' : '#ffffff', fontSize: '0.9rem', outline: 'none', color: isDark ? '#f9fafb' : '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
    createBtn: { display: 'flex', alignItems: 'center', background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '10px', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37,99,235,0.25)', transition: 'background 0.2s', whiteSpace: 'nowrap' },

    // Filter Buttons
    filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    filterBtn: { padding: '0.55rem 1rem', borderRadius: '8px', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', background: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' },
    filterBtnActive: { background: '#2563eb', color: '#ffffff', borderColor: '#2563eb' },

    // Cards & Tables
    card: { background: isDark ? '#111827' : '#ffffff', borderRadius: '16px', border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', overflow: 'hidden' },
    cardHeaderFlex: { padding: '1.25rem 1.75rem', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', background: isDark ? '#1a2234' : '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' },
    cardTitle: { margin: 0, fontSize: '1.05rem', fontWeight: '700', color: isDark ? '#f9fafb' : '#0f172a' },
    tableResponsive: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: isDark ? '#111827' : '#ffffff', padding: '1rem 1.75rem', textAlign: 'left', color: isDark ? '#9ca3af' : '#64748b', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0' },
    tr: { borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9' },
    td: { padding: '1.1rem 1.75rem', color: isDark ? '#cbd5e1' : '#334155', fontSize: '0.9rem' },
    
    userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
    userAvatarSm: { width: '32px', height: '32px', borderRadius: '8px', background: isDark ? '#312e81' : '#e0e7ff', color: isDark ? '#c7d2fe' : '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 },
    strongText: { fontWeight: '600', color: isDark ? '#f9fafb' : '#0f172a' },
    idBadge: { background: isDark ? '#1f2937' : '#f1f5f9', color: isDark ? '#9ca3af' : '#475569', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' },
    idBadgeMini: { background: isDark ? '#1e293b' : '#e2e8f0', color: isDark ? '#93c5fd' : '#1e40af', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', marginRight: '6px' },
    tableSubText: { fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '3px' },
    venueText: { display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: isDark ? '#e2e8f0' : '#334155' },
    timeText: { display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: isDark ? '#e2e8f0' : '#334155' },
    feeHighlight: { fontWeight: '700', color: '#10b981', fontSize: '0.95rem' },

    badgeTech: { display: 'inline-flex', alignItems: 'center', background: isDark ? '#1e3a8a' : '#eff6ff', color: isDark ? '#93c5fd' : '#1d4ed8', border: isDark ? '1px solid #1e40af' : '1px solid #bfdbfe', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' },
    badgeNonTech: { display: 'inline-flex', alignItems: 'center', background: isDark ? '#831843' : '#fdf2f8', color: isDark ? '#fbcfe8' : '#be185d', border: isDark ? '1px solid #9d174d' : '1px solid #fbcfe8', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' },
    
    roleBadge: { display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.03em' },
    roleBadgeSuper: { background: isDark ? '#78350f' : '#fef3c7', color: isDark ? '#fde68a' : '#92400e', border: isDark ? '1px solid #92400e' : '1px solid #fde68a' },
    roleBadgeAdmin: { background: isDark ? '#312e81' : '#e0e7ff', color: isDark ? '#c7d2fe' : '#3730a3', border: isDark ? '1px solid #4338ca' : '1px solid #c7d2fe' },
    roleBadgeDefault: { background: isDark ? '#1f2937' : '#f1f5f9', color: isDark ? '#9ca3af' : '#334155', border: isDark ? '1px solid #374151' : '1px solid #e2e8f0' },
    
    userCountBadge: { background: isDark ? '#064e3b' : '#ecfdf5', color: isDark ? '#a7f3d0' : '#065f46', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' },
    systemBadge: { background: isDark ? '#1f2937' : '#f1f5f9', color: isDark ? '#9ca3af' : '#64748b', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' },
    customBadge: { background: isDark ? '#064e3b' : '#f0fdf4', color: isDark ? '#6ee7b7' : '#166534', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' },
    
    statusActive: { color: '#10b981', fontWeight: '600', fontSize: '0.85rem' },
    actionBtnEdit: { background: isDark ? '#1e3a8a' : '#eff6ff', border: isDark ? '1px solid #2563eb' : '1px solid #bfdbfe', color: isDark ? '#93c5fd' : '#2563eb', cursor: 'pointer', fontSize: '0.88rem', padding: '0.45rem 0.65rem', borderRadius: '6px', marginRight: '0.5rem', transition: 'all 0.15s' },
    actionBtnDelete: { background: isDark ? '#451a1a' : '#fef2f2', border: isDark ? '1px solid #7f1d1d' : '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', fontSize: '0.88rem', padding: '0.45rem 0.65rem', borderRadius: '6px', transition: 'all 0.15s' },
    emptyState: { padding: '3rem', textAlign: 'center', color: isDark ? '#6b7280' : '#94a3b8', fontSize: '0.9rem' },

    // Stats Grid for Dashboard
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    statCard: { background: isDark ? '#111827' : '#ffffff', padding: '1.75rem', borderRadius: '16px', border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    statLabel: { color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
    statValue: { color: isDark ? '#f9fafb' : '#0f172a', fontSize: '2.2rem', fontWeight: '800' },
    dashboardView: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },

    // Overlay Modals
    modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' },
    modalCard: { background: isDark ? '#111827' : '#ffffff', width: '100%', maxWidth: '540px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0' },
    modalHeader: { padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9', background: isDark ? '#111827' : '#ffffff' },
    modalHeaderLeft: { display: 'flex', gap: '14px', alignItems: 'center' },
    modalIconBox: { width: '42px', height: '42px', borderRadius: '10px', background: isDark ? '#1e3a8a' : '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    modalIconBoxRole: { width: '42px', height: '42px', borderRadius: '10px', background: isDark ? '#064e3b' : '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    modalIconBoxEvent: { width: '42px', height: '42px', borderRadius: '10px', background: isDark ? '#312e81' : '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f9fafb' : '#0f172a' },
    modalSubtitle: { margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b' },
    modalCloseBtn: { background: isDark ? '#1f2937' : '#f8fafc', border: isDark ? '1px solid #374151' : '1px solid #e2e8f0', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s' },
    modalForm: { display: 'flex', flexDirection: 'column' },
    modalFormBody: { padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: isDark ? '#111827' : '#ffffff' },
    modalInputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    label: { fontSize: '0.85rem', fontWeight: '600', color: isDark ? '#cbd5e1' : '#334155' },
    input: { padding: '0.75rem 1rem', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', background: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#f9fafb' : '#0f172a', width: '100%', boxSizing: 'border-box' },
    inputHelper: { fontSize: '0.75rem', color: isDark ? '#6b7280' : '#94a3b8', marginTop: '0.2rem' },
    select: { padding: '0.75rem 1rem', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', background: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#f9fafb' : '#0f172a', width: '100%', boxSizing: 'border-box' },
    modalFooter: { padding: '1.25rem 1.75rem', borderTop: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9', background: isDark ? '#1a2234' : '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' },
    primaryBtn: { padding: '0.75rem 1.5rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 5px rgba(37,99,235,0.25)' },
    cancelBtn: { padding: '0.75rem 1.2rem', background: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#cbd5e1' : '#475569', border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer' }
  };

  if (loading) {
    return (
      <div style={S.loadingContainer}>
        <div style={S.spinner}></div>
      </div>
    );
  }

  return (
    <div style={S.container} className="admin-layout-container">
      {/* ======================================================== */}
      {/* SIDEBAR                                                  */}
      {/* ======================================================== */}
      <aside style={S.sidebar} className={`admin-sidebar ${mobileSidebarOpen ? 'admin-sidebar-open' : ''}`}>
        <div style={S.sidebarHeader} className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={S.logoCircle}>
              <FaUserShield size={22} />
            </div>
            <div>
              <h2 style={S.sidebarTitle}>Admin Panel</h2>
              <span style={S.sidebarSubtitle}>Eloquence 2026</span>
            </div>
          </div>
          <button 
            type="button"
            className="admin-mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
        
        <nav style={S.navMenu} className={`admin-sidebar-nav ${mobileSidebarOpen ? 'open' : ''}`}>
          {/* Dashboard Tab */}
          <button 
            type="button"
            style={activeTab === 'dashboard' ? { ...S.navItem, ...S.navItemActive } : S.navItem} 
            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
          >
            <FaChartBar style={S.navIcon} /> Dashboard
          </button>

          {/* Events Tab */}
          <button 
            type="button"
            style={activeTab === 'events' ? { ...S.navItem, ...S.navItemActive } : S.navItem} 
            onClick={(e) => { e.preventDefault(); setActiveTab('events'); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaCalendarAlt style={S.navIcon} />
                <span>Events</span>
              </div>
              <span style={S.badgeCount}>{eventsList.length}</span>
            </div>
          </button>

          {/* User Management Dropdown Group (Superadmin & Admin only) */}
          {isAdminOrSuper && (
            <div style={S.dropdownGroup}>
              <button 
                style={isUserManagementActive ? { ...S.dropdownToggle, ...S.dropdownToggleActive } : S.dropdownToggle}
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div style={S.dropdownToggleLeft}>
                  <FaUsers style={S.navIcon} />
                  <span>User Management</span>
                </div>
                <span style={S.dropdownChevron}>
                  {isUserDropdownOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                </span>
              </button>

              {/* Dropdown Submenu */}
              {isUserDropdownOpen && (
                <div style={S.submenu}>
                  <button 
                    style={activeTab === 'manage-users' ? { ...S.subnavItem, ...S.subnavItemActive } : S.subnavItem}
                    onClick={() => setActiveTab('manage-users')}
                  >
                    <FaUserCheck style={S.subnavIcon} />
                    <span>Manage Users</span>
                    <span style={S.badgeCount}>{users.length}</span>
                  </button>

                  <button 
                    style={activeTab === 'manage-roles' ? { ...S.subnavItem, ...S.subnavItemActive } : S.subnavItem}
                    onClick={() => setActiveTab('manage-roles')}
                  >
                    <FaShieldAlt style={S.subnavIcon} />
                    <span>Manage Roles</span>
                    <span style={S.badgeCount}>{roles.length}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sponsors Tab */}
          <button 
            type="button"
            style={activeTab === 'manage-sponsors' ? { ...S.navItem, ...S.navItemActive } : S.navItem} 
            onClick={(e) => { e.preventDefault(); setActiveTab('manage-sponsors'); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaHandshake style={S.navIcon} />
                <span>Sponsors</span>
              </div>
              <span style={S.badgeCount}>{sponsors.length}</span>
            </div>
          </button>

          {/* Student Coordinators Tab */}
          <button 
            type="button"
            style={activeTab === 'manage-coordinators' ? { ...S.navItem, ...S.navItemActive } : S.navItem} 
            onClick={(e) => { e.preventDefault(); setActiveTab('manage-coordinators'); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaUserTie style={S.navIcon} />
                <span>Student Coordinators</span>
              </div>
              <span style={S.badgeCount}>{coordinators.length}</span>
            </div>
          </button>

          {/* Participant List Tab */}
          <button 
            type="button"
            style={activeTab === 'participant-list' ? { ...S.navItem, ...S.navItemActive } : S.navItem} 
            onClick={(e) => { e.preventDefault(); setActiveTab('participant-list'); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaUsers style={S.navIcon} />
                <span>Participant List</span>
              </div>
              <span style={S.badgeCount}>{registrationsList.length}</span>
            </div>
          </button>
        </nav>

        <div style={S.sidebarFooter} className="admin-sidebar-footer">
          <button onClick={onLogout} style={S.logoutBtn}>
            <FaSignOutAlt style={S.navIcon} /> Log Out
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT                                             */}
      {/* ======================================================== */}
      <main style={S.mainContent} className="admin-main-content">
        <header style={S.topHeader} className="admin-top-header">
          <div>
            <h1 style={S.pageTitle} className="admin-page-title">
              {activeTab === 'dashboard' && 'Overview Dashboard'}
              {activeTab === 'events' && 'Events Management'}
              {activeTab === 'manage-users' && 'User Management'}
              {activeTab === 'manage-roles' && 'Role Management'}
              {activeTab === 'manage-sponsors' && 'Sponsor Management'}
              {activeTab === 'manage-coordinators' && 'Student Coordinator Management'}
              {activeTab === 'participant-list' && 'Event-Wise Participant & Team List'}
            </h1>
            <p style={S.pageSubtitle}>
              {activeTab === 'dashboard' && 'Live event analytics, registrations, and entity metrics.'}
              {activeTab === 'events' && 'Edit event details, venues, schedules, and entry fees in real-time.'}
              {activeTab === 'manage-users' && 'Create, edit, assign roles, and remove system user accounts.'}
              {activeTab === 'manage-roles' && 'Configure custom access roles, permissions, and security hierarchy.'}
              {activeTab === 'manage-sponsors' && 'Manage event partners, categories, logos, contact info, and public visibility.'}
              {activeTab === 'manage-coordinators' && 'Assign student leads and coordinators dynamically to symposium events.'}
              {activeTab === 'participant-list' && 'Filter participants by event, view team names, export PDF sheets, and dispatch lists to Event Coordinators.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={toggleTheme}
              style={S.themeToggleBtn}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <FaSun size={17} style={{ color: '#fbbf24' }} /> : <FaMoon size={16} style={{ color: '#6366f1' }} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.15rem',
                border: '2px solid #ffffff',
                boxShadow: '0 3px 10px rgba(37, 99, 235, 0.35)',
                userSelect: 'none',
                flexShrink: 0
              }}>
                {(user?.username || 'Admin').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '700', fontSize: '0.88rem', color: isDark ? '#f8fafc' : '#0f172a', lineHeight: '1.2' }}>
                  {user?.username || 'Admin'}
                </span>
                <span style={{ fontSize: '0.7rem', color: isDark ? '#93c5fd' : '#2563eb', fontWeight: '700', marginTop: '1px', textTransform: 'uppercase' }}>
                  {user?.role || 'Admin'}
                </span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="admin-mobile-logout"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.75rem',
                background: isDark ? '#451a1a' : '#fef2f2',
                color: '#ef4444',
                border: isDark ? '1px solid #7f1d1d' : '1px solid #fee2e2',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Log Out"
            >
              <FaSignOutAlt />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        <div style={S.contentWrapper} className="admin-content-wrapper">
          {/* ======================================================== */}
          {/* 1. DASHBOARD VIEW                                        */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div style={S.dashboardView}>
              <div style={S.statsGrid} className="admin-stats-grid">
                <div style={S.statCard}>
                  <div style={S.statLabel}>Total Registrations</div>
                  <div style={S.statValue}>{data?.stats?.totalRegistrations || 0}</div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Total Revenue Collected</div>
                  <div style={S.statValue}>₹{data?.stats?.revenue || 0}</div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Active Events</div>
                  <div style={S.statValue}>{eventsList.length}</div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Sponsors</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={S.statValue}>{data?.stats?.totalSponsors || sponsors.length}</span>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700' }}>
                      ({data?.stats?.activeSponsors || sponsors.filter(s => s.isActive !== false).length} Active)
                    </span>
                  </div>
                </div>
                <div style={S.statCard}>
                  <div style={S.statLabel}>Student Coordinators</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={S.statValue}>{data?.stats?.totalCoordinators || coordinators.length}</span>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700' }}>
                      ({data?.stats?.activeCoordinators || coordinators.filter(c => c.isActive !== false).length} Active)
                    </span>
                  </div>
                </div>
              </div>

              <div style={S.card}>
                <h3 style={{ ...S.cardTitle, padding: '1.25rem 1.75rem', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', background: isDark ? '#1a2234' : '#f8fafc' }}>
                  Recent Registrations
                </h3>
                <div style={S.tableResponsive}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>ID</th>
                        <th style={S.th}>Participant Name</th>
                        <th style={S.th}>Event Enrolled</th>
                        <th style={S.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.recentRegistrations?.map(reg => (
                        <tr key={reg.id} style={S.tr}>
                          <td style={S.td}><span style={S.idBadge}>#{reg.id}</span></td>
                          <td style={S.td}><span style={S.strongText}>{reg.name}</span></td>
                          <td style={S.td}>{reg.event}</td>
                          <td style={S.td}>{reg.date}</td>
                        </tr>
                      ))}
                      {!data?.recentRegistrations?.length && (
                        <tr><td colSpan="4" style={S.emptyState}>No recent registrations found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. EVENTS MANAGEMENT VIEW                                */}
          {/* ======================================================== */}
          {activeTab === 'events' && (
            <div style={S.viewContainer}>
              <div style={S.viewHeader}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '650px', flexWrap: 'wrap' }}>
                  <div style={S.searchBox}>
                    <input 
                      type="text" 
                      placeholder="Search events by name, venue, timing, or fee..." 
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      style={S.searchInput}
                    />
                  </div>
                  <div style={S.filterGroup}>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setEventFilter('all'); }}
                      style={eventFilter === 'all' ? { ...S.filterBtn, ...S.filterBtnActive } : S.filterBtn}
                    >
                      All ({eventsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setEventFilter('technical'); }}
                      style={eventFilter === 'technical' ? { ...S.filterBtn, ...S.filterBtnActive } : S.filterBtn}
                    >
                      <FaBolt size={11} /> Technical ({eventsList.filter(e => e.category === 'technical').length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setEventFilter('non-technical'); }}
                      style={eventFilter === 'non-technical' ? { ...S.filterBtn, ...S.filterBtnActive } : S.filterBtn}
                    >
                      <FaGamepad size={12} /> Non-Tech ({eventsList.filter(e => e.category === 'non-technical').length})
                    </button>
                  </div>
                </div>
                <button onClick={handleOpenCreateEventModal} style={S.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Add New Event
                </button>
              </div>

              <div style={S.card}>
                <div style={S.cardHeaderFlex}>
                  <h3 style={S.cardTitle}>Symposium Events ({filteredEventsList.length})</h3>
                  <span style={{ fontSize: '0.85rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Edits made here synchronize directly with the live events and registration pages.
                  </span>
                </div>
                <div style={S.tableResponsive}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Poster</th>
                        <th style={S.th}>Event Name</th>
                        <th style={S.th}>Category</th>
                        <th style={S.th}>Venue</th>
                        <th style={S.th}>Schedule</th>
                        <th style={S.th}>Fee & Size</th>
                        <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEventsList.map(evt => {
                        const eventBannerSrc = getEventBanner(evt);
                        return (
                        <tr key={evt.id} style={S.tr}>
                          <td style={S.td}>
                            <div style={{
                              width: '56px',
                              height: '42px',
                              borderRadius: '8px',
                              background: isDark ? '#1f2937' : '#f1f5f9',
                              border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {eventBannerSrc ? (
                                <img src={eventBannerSrc} alt={evt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <FaImage color="#94a3b8" size={18} />
                              )}
                            </div>
                          </td>
                          <td style={S.td}>
                            <div>
                              <span style={S.strongText}>{evt.name}</span>
                              <div style={S.tableSubText}>
                                <span style={S.idBadgeMini}>{evt.id.toUpperCase()}</span> {evt.subtitle || evt.alias}
                              </div>
                            </div>
                          </td>
                          <td style={S.td}>
                            <span style={evt.category === 'technical' ? S.badgeTech : S.badgeNonTech}>
                              {evt.category === 'technical' ? (
                                <><FaBolt style={{ marginRight: '4px' }} /> Technical</>
                              ) : (
                                <><FaGamepad style={{ marginRight: '4px' }} /> Non-Tech</>
                              )}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span style={S.venueText}>
                              <FaMapMarkerAlt style={{ color: '#64748b', marginRight: '6px', fontSize: '0.85rem' }} />
                              {evt.venue}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span style={S.timeText}>
                              <FaClock style={{ color: '#64748b', marginRight: '6px', fontSize: '0.85rem' }} />
                              {evt.timing}
                            </span>
                          </td>
                          <td style={S.td}>
                            <div>
                              <span style={S.feeHighlight}>{evt.fee}</span>
                              {evt.teamSize && <div style={S.tableSubText}>{evt.teamSize}</div>}
                            </div>
                          </td>
                          <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => handleOpenEditEventModal(evt)}
                              style={S.actionBtnEdit}
                              title="Edit Event Details & Poster"
                            >
                              <FaEdit style={{ marginRight: '4px' }} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(evt.id, evt.name)}
                              style={S.actionBtnDelete}
                              title="Delete Event"
                            >
                              <FaTrash style={{ marginRight: '4px' }} /> Delete
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                      {!filteredEventsList.length && (
                        <tr>
                          <td colSpan="7" style={S.emptyState}>
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

          {/* ======================================================== */}
          {/* 3. MANAGE USERS VIEW                                     */}
          {/* ======================================================== */}
          {activeTab === 'manage-users' && (
            <div style={S.viewContainer}>
              <div style={S.viewHeader}>
                <div style={S.searchBox}>
                  <input 
                    type="text" 
                    placeholder="Search users by username or role..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={S.searchInput}
                  />
                </div>
                <button onClick={handleOpenCreateUserForm} style={S.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Create New User
                </button>
              </div>

              <div style={S.card}>
                <div style={S.cardHeaderFlex}>
                  <h3 style={S.cardTitle}>System Users ({filteredUsers.length})</h3>
                </div>
                <div style={S.tableResponsive}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Username</th>
                        <th style={S.th}>Role</th>
                        <th style={S.th}>Status</th>
                        <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} style={S.tr}>
                          <td style={S.td}>
                            <div style={S.userCell}>
                              <div style={S.userAvatarSm}>{user.username.charAt(0).toUpperCase()}</div>
                              <span style={S.strongText}>{user.username}</span>
                            </div>
                          </td>
                          <td style={S.td}>
                            <span style={{
                              ...S.roleBadge,
                              ...(user.role === 'superadmin' ? S.roleBadgeSuper : user.role === 'admin' ? S.roleBadgeAdmin : S.roleBadgeDefault)
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={S.td}><span style={S.statusActive}>● Active</span></td>
                          <td style={{ ...S.td, textAlign: 'right' }}>
                            <button onClick={() => handleOpenEditUserForm(user)} style={S.actionBtnEdit} title="Edit User">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteUser(user.id, user.username)} style={S.actionBtnDelete} title="Delete User">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredUsers.length && (
                        <tr><td colSpan="4" style={S.emptyState}>No users found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. MANAGE ROLES VIEW                                     */}
          {/* ======================================================== */}
          {activeTab === 'manage-roles' && (
            <div style={S.viewContainer}>
              <div style={S.viewHeader}>
                <p style={S.viewDescription}>
                  Manage platform security levels. Roles determine access permissions and capabilities across the administrative surface.
                </p>
                <button onClick={handleOpenCreateRoleForm} style={S.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Create New Role
                </button>
              </div>

              <div style={S.card}>
                <div style={S.cardHeaderFlex}>
                  <h3 style={S.cardTitle}>System Roles ({roles.length})</h3>
                </div>
                <div style={S.tableResponsive}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Role Name</th>
                        <th style={S.th}>Assigned Users</th>
                        <th style={S.th}>Type</th>
                        <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(r => {
                        const count = getUserCountForRole(r.name);
                        const isSystem = r.name === 'superadmin' || r.name === 'admin';
                        return (
                          <tr key={r.id} style={S.tr}>
                            <td style={S.td}>
                              <div style={S.userCell}>
                                <div style={{ ...S.userAvatarSm, background: isDark ? '#064e3b' : '#ecfdf5', color: '#059669' }}>
                                  <FaShieldAlt size={14} />
                                </div>
                                <span style={S.strongText}>{r.name}</span>
                              </div>
                            </td>
                            <td style={S.td}>
                              <span style={S.userCountBadge}>{count} user{count !== 1 ? 's' : ''}</span>
                            </td>
                            <td style={S.td}>
                              <span style={isSystem ? S.systemBadge : S.customBadge}>
                                {isSystem ? 'System Default' : 'Custom Role'}
                              </span>
                            </td>
                            <td style={{ ...S.td, textAlign: 'right' }}>
                              {!isSystem && (
                                <>
                                  <button onClick={() => handleOpenEditRoleForm(r)} style={S.actionBtnEdit} title="Edit Role">
                                    <FaEdit />
                                  </button>
                                  <button onClick={() => handleDeleteRole(r.id, r.name)} style={S.actionBtnDelete} title="Delete Role">
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                              {isSystem && (
                                <span style={{ fontSize: '0.8rem', color: isDark ? '#6b7280' : '#94a3b8', fontStyle: 'italic' }}>Protected</span>
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
          {/* 5. MANAGE SPONSORS VIEW                                  */}
          {/* ======================================================== */}
          {activeTab === 'manage-sponsors' && (
            <div style={S.viewContainer}>
              <div style={S.viewHeader}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '600px', flexWrap: 'wrap' }}>
                  <div style={S.searchBox}>
                    <input 
                      type="text" 
                      placeholder="Search sponsors by name, company, contact..." 
                      value={sponsorSearch}
                      onChange={(e) => setSponsorSearch(e.target.value)}
                      style={S.searchInput}
                    />
                  </div>
                  <select 
                    value={sponsorCategoryFilter} 
                    onChange={(e) => setSponsorCategoryFilter(e.target.value)}
                    style={{ ...S.select, width: 'auto', padding: '0.65rem 1rem' }}
                  >
                    <option value="all">All Levels</option>
                    <option value="Elite">Elite</option>
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                <button onClick={handleOpenCreateSponsorForm} style={S.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Add New Sponsor
                </button>
              </div>

              <div style={S.card}>
                <div style={S.cardHeaderFlex}>
                  <h3 style={S.cardTitle}>Event Sponsors ({filteredSponsors.length})</h3>
                  <span style={{ fontSize: '0.85rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Active sponsors appear on the public website marquee sorted by display order.
                  </span>
                </div>
                <div style={S.tableResponsive}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Sponsor</th>
                        <th style={S.th}>Level</th>
                        <th style={S.th}>Contact</th>
                        <th style={S.th}>Status</th>
                        <th style={{ ...S.th, textAlign: 'center' }}>Display Order</th>
                        <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSponsors.map(sponsor => (
                        <tr key={sponsor.id} style={S.tr}>
                          <td style={S.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: isDark ? '#1f2937' : '#f8fafc',
                                border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
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
                                <div style={S.strongText}>{sponsor.name}</div>
                                {sponsor.companyName && (
                                  <div style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b' }}>{sponsor.companyName}</div>
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
                          <td style={S.td}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: 
                                sponsor.category === 'Elite' || sponsor.category === 'Title Sponsor' ? (isDark ? '#78350f' : '#fef3c7') :
                                sponsor.category === 'Premium' || sponsor.category === 'Gold Sponsor' || sponsor.category === 'Silver Sponsor' ? (isDark ? '#1e293b' : '#f1f5f9') :
                                (isDark ? '#064e3b' : '#ecfdf5'),
                              color: 
                                sponsor.category === 'Elite' || sponsor.category === 'Title Sponsor' ? (isDark ? '#fde68a' : '#92400e') :
                                sponsor.category === 'Premium' || sponsor.category === 'Gold Sponsor' || sponsor.category === 'Silver Sponsor' ? (isDark ? '#cbd5e1' : '#334155') :
                                (isDark ? '#a7f3d0' : '#065f46'),
                              border: '1px solid rgba(0,0,0,0.06)'
                            }}>
                              {sponsor.category}
                            </span>
                          </td>
                          <td style={S.td}>
                            <div style={{ fontSize: '0.85rem' }}>
                              {sponsor.contactName && <div style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#0f172a' }}>{sponsor.contactName}</div>}
                              {sponsor.contactPhone && (
                                <div style={{ color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaPhone size={10} /> {sponsor.contactPhone}
                                </div>
                              )}
                              {sponsor.contactEmail && (
                                <div style={{ color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FaEnvelope size={10} /> {sponsor.contactEmail}
                                </div>
                              )}
                              {!sponsor.contactName && !sponsor.contactPhone && !sponsor.contactEmail && (
                                <span style={{ color: isDark ? '#6b7280' : '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>None provided</span>
                              )}
                            </div>
                          </td>
                          <td style={S.td}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              color: sponsor.isActive !== false ? '#10b981' : '#dc2626'
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
                          <td style={{ ...S.td, textAlign: 'center' }}>
                            <span style={S.idBadge}>{sponsor.displayOrder || 1}</span>
                          </td>
                          <td style={{ ...S.td, textAlign: 'right' }}>
                            <button 
                              onClick={() => handleToggleSponsor(sponsor)} 
                              style={{ 
                                background: sponsor.isActive !== false ? (isDark ? '#064e3b' : '#ecfdf5') : (isDark ? '#451a1a' : '#fef2f2'),
                                border: '1px solid ' + (sponsor.isActive !== false ? (isDark ? '#047857' : '#a7f3d0') : (isDark ? '#991b1b' : '#fecaca')),
                                color: sponsor.isActive !== false ? '#10b981' : '#dc2626',
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
                            <button onClick={() => handleOpenEditSponsorForm(sponsor)} style={S.actionBtnEdit} title="Edit Sponsor">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteSponsor(sponsor.id, sponsor.name)} style={S.actionBtnDelete} title="Delete Sponsor">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredSponsors.length && (
                        <tr><td colSpan="6" style={S.emptyState}>No sponsors found matching your criteria.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. MANAGE STUDENT COORDINATORS VIEW                      */}
          {/* ======================================================== */}
          {activeTab === 'manage-coordinators' && (
            <div style={S.viewContainer}>
              <div style={S.viewHeader}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '650px', flexWrap: 'wrap' }}>
                  <div style={S.searchBox}>
                    <input 
                      type="text" 
                      placeholder="Search by name, phone, dept, event, role..." 
                      value={coordSearch}
                      onChange={(e) => setCoordSearch(e.target.value)}
                      style={S.searchInput}
                    />
                  </div>
                  <select 
                    value={coordEventFilter} 
                    onChange={(e) => setCoordEventFilter(e.target.value)}
                    style={{ ...S.select, width: 'auto', padding: '0.65rem 1rem' }}
                  >
                    <option value="all">All Events ({eventsList.length})</option>
                    {eventsList.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.category === 'technical' ? '[TECH]' : '[NON-TECH]'} {ev.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={handleOpenCreateCoordForm} style={S.createBtn}>
                  <FaPlus style={{ marginRight: '8px' }} /> Add Coordinator
                </button>
              </div>

              <div style={S.card}>
                <div style={S.cardHeaderFlex}>
                  <h3 style={S.cardTitle}>Student Coordinators ({filteredCoordinators.length})</h3>
                  <span style={{ fontSize: '0.85rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                    Coordinators assigned here dynamically appear on the Registration page for their respective events.
                  </span>
                </div>
                <div style={S.tableResponsive}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Coordinator</th>
                        <th style={S.th}>Contact Info</th>
                        <th style={S.th}>Role</th>
                        <th style={S.th}>Assigned Events</th>
                        <th style={S.th}>Status</th>
                        <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoordinators.map(coord => (
                        <tr key={coord.id} style={S.tr}>
                          <td style={S.td}>
                            <div style={S.userCell}>
                              <div style={{ ...S.userAvatarSm, background: isDark ? '#1e3a8a' : '#eff6ff', color: '#2563eb' }}>
                                {coord.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span style={S.strongText}>{coord.name}</span>
                                <div style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                                  {coord.department || 'CSE'} • {coord.year || '3rd Year'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={S.td}>
                            <div style={{ fontSize: '0.85rem' }}>
                              <div style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaPhone size={11} color="#2563eb" /> {coord.phone}
                              </div>
                              {coord.email && (
                                <div style={{ color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                  <FaEnvelope size={10} /> {coord.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={S.td}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: coord.role === 'Lead Coordinator' ? (isDark ? '#1e3a8a' : '#dbeafe') : (isDark ? '#064e3b' : '#f0fdf4'),
                              color: coord.role === 'Lead Coordinator' ? (isDark ? '#bfdbfe' : '#1e40af') : (isDark ? '#a7f3d0' : '#166534'),
                              border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                              {coord.role || 'Coordinator'}
                            </span>
                          </td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                              {Array.isArray(coord.assignedEvents) && coord.assignedEvents.map(eventId => {
                                const ev = eventsList.find(e => e.id.toLowerCase() === eventId.toLowerCase());
                                return (
                                  <span key={eventId} style={{
                                    background: ev?.category === 'technical' ? (isDark ? '#1e3a8a' : '#eff6ff') : (isDark ? '#831843' : '#fdf2f8'),
                                    color: ev?.category === 'technical' ? (isDark ? '#bfdbfe' : '#1d4ed8') : (isDark ? '#fbcfe8' : '#be185d'),
                                    border: '1px solid ' + (ev?.category === 'technical' ? (isDark ? '#1e40af' : '#bfdbfe') : (isDark ? '#9d174d' : '#fbcfe8')),
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
                          <td style={S.td}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              color: coord.isActive !== false ? '#10b981' : '#dc2626'
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
                          <td style={{ ...S.td, textAlign: 'right' }}>
                            <button 
                              onClick={() => handleToggleCoord(coord)} 
                              style={{ 
                                background: coord.isActive !== false ? (isDark ? '#064e3b' : '#ecfdf5') : (isDark ? '#451a1a' : '#fef2f2'),
                                border: '1px solid ' + (coord.isActive !== false ? (isDark ? '#047857' : '#a7f3d0') : (isDark ? '#991b1b' : '#fecaca')),
                                color: coord.isActive !== false ? '#10b981' : '#dc2626',
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
                            <button onClick={() => handleOpenEditCoordForm(coord)} style={S.actionBtnEdit} title="Edit Coordinator">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteCoord(coord.id, coord.name)} style={S.actionBtnDelete} title="Delete Coordinator">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!filteredCoordinators.length && (
                        <tr><td colSpan="6" style={S.emptyState}>No coordinators found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PARTICIPANT LIST VIEW & EVENT CARDS                       */}
          {/* ======================================================== */}
          {activeTab === 'participant-list' && (
            <div style={S.viewContainer}>
              {/* Event Filter & View Mode Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: isDark ? '#111827' : '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '16px', border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setViewMode('cards'); }}
                      style={viewMode === 'cards' ? { ...S.filterBtn, ...S.filterBtnActive } : S.filterBtn}
                    >
                      <FaThLarge size={12} /> Event Cards View
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setViewMode('table'); }}
                      style={viewMode === 'table' ? { ...S.filterBtn, ...S.filterBtnActive } : S.filterBtn}
                    >
                      <FaTable size={12} /> Detailed Table View
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setPartCategoryFilter('all'); }}
                      style={partCategoryFilter === 'all' ? { ...S.filterBtn, ...S.filterBtnActive } : S.filterBtn}
                    >
                      All ({eventsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setPartCategoryFilter('technical'); }}
                      style={partCategoryFilter === 'technical' ? { ...S.filterBtn, ...S.filterBtnActive } : S.filterBtn}
                    >
                      <FaBolt size={11} /> Tech ({eventsList.filter(e => e.category === 'technical').length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setPartCategoryFilter('non-technical'); }}
                      style={partCategoryFilter === 'non-technical' ? { ...S.filterBtn, ...S.filterBtnActive } : S.filterBtn}
                    >
                      <FaGamepad size={11} /> Non-Tech ({eventsList.filter(e => e.category === 'non-technical').length})
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Select Event</label>
                    <select
                      value={partEventFilter}
                      onChange={(e) => setPartEventFilter(e.target.value)}
                      style={S.select}
                    >
                      <option value="all">-- All Symposium Events ({eventsList.length}) --</option>
                      {eventsList.map(evt => (
                        <option key={evt.id} value={evt.id}>
                          [{evt.category.toUpperCase()}] {evt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ ...S.modalInputGroup, gridColumn: 'span 2' }}>
                    <label style={S.label}>Search Participants / Teams</label>
                    <input
                      type="text"
                      placeholder="Search participant name, team name, team member, phone, ticket..."
                      value={partSearch}
                      onChange={(e) => setPartSearch(e.target.value)}
                      style={S.searchInput}
                    />
                  </div>
                </div>
              </div>

              {/* ================= EVENT CARDS VIEW ================= */}
              {viewMode === 'cards' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                  {eventsList
                    .filter(evt => partEventFilter === 'all' || evt.id === partEventFilter)
                    .filter(evt => partCategoryFilter === 'all' || evt.category === partCategoryFilter)
                    .map(evt => {
                      const evtRegs = registrationsList.filter(r => (r.event_id || r.eventId) === evt.id);
                      const isTech = evt.category === 'technical';
                      const teamsCount = evtRegs.filter(r => getTeamMembers(r).length > 0 || r.team_name || r.teamName).length;

                      return (
                        <div key={evt.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={S.cardHeaderFlex}>
                              <div>
                                <h3 style={S.cardTitle}>{evt.name}</h3>
                                <span style={isTech ? S.badgeTech : S.badgeNonTech}>
                                  {isTech ? 'Technical Event' : 'Non-Technical Event'}
                                </span>
                              </div>
                              <span style={S.idBadge}>
                                {evt.fee || `₹${evt.feePerHead || 50}`}
                              </span>
                            </div>

                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {/* Event Stats Summary Bar */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', background: isDark ? '#1f2937' : '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: isDark ? '1px solid #374151' : '1px solid #e2e8f0' }}>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#64748b', fontWeight: '600' }}>Registrations</span>
                                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a' }}>{evtRegs.length}</div>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#64748b', fontWeight: '600' }}>Teams Count</span>
                                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>{teamsCount}</div>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#64748b', fontWeight: '600' }}>Venue</span>
                                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: isDark ? '#93c5fd' : '#2563eb', marginTop: '4px' }}>{evt.venue || 'Main Lab'}</div>
                                </div>
                              </div>

                              {/* Participant & Team Member Preview */}
                              <div>
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isDark ? '#cbd5e1' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Participants & Team Members ({evtRegs.length})
                                </span>
                                <div style={{ maxHeight: '180px', overflowY: 'auto', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  {evtRegs.map((reg, idx) => {
                                    const members = getTeamMembers(reg);
                                    const teamName = reg.team_name || reg.teamName;

                                    return (
                                      <div key={idx} style={{ background: isDark ? '#1f2937' : '#f1f5f9', padding: '0.65rem 0.85rem', borderRadius: '8px', border: isDark ? '1px solid #374151' : '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: isDark ? '#f9fafb' : '#0f172a' }}>
                                            {reg.full_name || reg.fullName || 'Participant'}
                                          </span>
                                          {teamName && (
                                            <span style={{ background: isDark ? '#064e3b' : '#ecfdf5', color: isDark ? '#6ee7b7' : '#047857', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                                              {teamName}
                                            </span>
                                          )}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '2px' }}>
                                          {reg.college} • {reg.department}
                                        </div>
                                        {members.length > 0 && (
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                            <span style={{ fontSize: '0.72rem', color: isDark ? '#93c5fd' : '#1d4ed8', fontWeight: '700' }}>
                                              Members ({members.length + 1}):
                                            </span>
                                            {members.map((m, i) => (
                                              <span key={i} style={{ background: isDark ? '#374151' : '#cbd5e1', color: isDark ? '#f9fafb' : '#0f172a', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                                                {m}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {evtRegs.length === 0 && (
                                    <div style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: '0.82rem', padding: '0.75rem', textAlign: 'center' }}>
                                      No participants registered yet for this event.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Export PDF & Send to Event Coordinator */}
                          <div style={{ padding: '1rem 1.25rem', borderTop: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', background: isDark ? '#1a2234' : '#f8fafc', display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleExportPDF(evt)}
                              style={{ ...S.filterBtn, flex: 1, justifyContent: 'center', background: isDark ? '#1e3a8a' : '#eff6ff', color: isDark ? '#93c5fd' : '#1d4ed8', borderColor: isDark ? '#1e40af' : '#bfdbfe' }}
                            >
                              <FaFilePdf size={13} /> Export PDF
                            </button>
                            <button
                              onClick={() => handleOpenSendModal(evt)}
                              style={{ ...S.primaryBtn, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
                            >
                              <FaPaperPlane size={12} /> Send
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* ================= DETAILED TABLE VIEW ================= */}
              {viewMode === 'table' && (
                <div style={S.card}>
                  <div style={S.cardHeaderFlex}>
                    <h3 style={S.cardTitle}>
                      Participant & Team List ({participantFilteredRegs.length})
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                      Showing participants for {partEventFilter === 'all' ? 'All Events' : (eventsList.find(e => e.id === partEventFilter)?.name || partEventFilter)}.
                    </span>
                  </div>

                  <div style={S.tableResponsive}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          <th style={S.th}>Ticket</th>
                          <th style={S.th}>Event</th>
                          <th style={S.th}>Team Name</th>
                          <th style={S.th}>Lead Participant</th>
                          <th style={S.th}>Team Members</th>
                          <th style={S.th}>College & Dept</th>
                          <th style={S.th}>Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participantFilteredRegs.map((reg, i) => {
                          const ticketCode = reg.ticket_code || reg.registrationId || reg.id || `#${i + 1}`;
                          const name = reg.full_name || reg.fullName || 'Anonymous';
                          const evt = eventsList.find(e => e.id === (reg.event_id || reg.eventId));
                          const evtName = reg.eventName || evt?.name || reg.event_id || 'Event';
                          const members = getTeamMembers(reg);
                          const teamName = reg.team_name || reg.teamName || (members.length > 0 ? 'Team' : '-');
                          const isTech = getEventCategory(reg) === 'technical';

                          return (
                            <tr key={i} style={S.tr}>
                              <td style={S.td}><span style={S.idBadge}>{ticketCode}</span></td>
                              <td style={S.td}>
                                <div>
                                  <span style={S.strongText}>{evtName}</span>
                                  <div>
                                    <span style={isTech ? S.badgeTech : S.badgeNonTech}>
                                      {isTech ? 'Tech' : 'Non-Tech'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td style={S.td}>
                                {teamName !== '-' ? (
                                  <span style={{
                                    background: isDark ? '#064e3b' : '#ecfdf5',
                                    color: isDark ? '#6ee7b7' : '#047857',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '0.85rem'
                                  }}>
                                    {teamName}
                                  </span>
                                ) : (
                                  <span style={{ color: isDark ? '#6b7280' : '#94a3b8', fontSize: '0.85rem' }}>Individual</span>
                                )}
                              </td>
                              <td style={S.td}>
                                <div>
                                  <span style={S.strongText}>{name}</span>
                                  <div style={S.tableSubText}>{reg.phone} • {reg.email}</div>
                                </div>
                              </td>
                              <td style={S.td}>
                                {members.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.78rem', color: isDark ? '#93c5fd' : '#1d4ed8', fontWeight: '700' }}>
                                      {members.length + 1} Members Total
                                    </span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                      <span style={{ background: isDark ? '#1f2937' : '#f1f5f9', color: isDark ? '#e2e8f0' : '#334155', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                                        1. {name} (Lead)
                                      </span>
                                      {members.map((m, idx) => (
                                        <span key={idx} style={{ background: isDark ? '#374151' : '#e2e8f0', color: isDark ? '#f9fafb' : '#0f172a', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                                          {idx + 2}. {m}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: isDark ? '#6b7280' : '#94a3b8' }}>N/A (Individual)</span>
                                )}
                              </td>
                              <td style={S.td}>
                                <div>
                                  {reg.college || 'CAHCET'}
                                  <div style={S.tableSubText}>{reg.department} ({reg.year})</div>
                                </div>
                              </td>
                              <td style={S.td}><span style={S.feeHighlight}>₹{getFee(reg)}</span></td>
                            </tr>
                          );
                        })}
                        {participantFilteredRegs.length === 0 && (
                          <tr><td colSpan="7" style={S.emptyState}>No participant records match the selected event and search query.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= SENT DETAILS / DISPATCHED LISTS HISTORY (ADMIN ONLY) ================= */}
              <div style={{ ...S.card, marginTop: '2rem' }}>
                <div style={S.cardHeaderFlex}>
                  <div>
                    <h3 style={S.cardTitle}>
                      Sent Details & Dispatched Participant Lists ({dispatchesList.length})
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                      History of event participant lists dispatched to Event Coordinators. Admin can edit assignments or delete/revoke lists.
                    </span>
                  </div>
                  <span style={S.idBadge}>
                    Admin Control
                  </span>
                </div>

                <div style={S.tableResponsive}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>#</th>
                        <th style={S.th}>Event Name</th>
                        <th style={S.th}>Assigned Event Coordinator</th>
                        <th style={S.th}>Participants Count</th>
                        <th style={S.th}>Dispatched Date & Time</th>
                        <th style={S.th}>Status</th>
                        <th style={{ ...S.th, textAlign: 'right' }}>Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dispatchesList.map((d, index) => {
                        const evtRegs = registrationsList.filter(r => (r.event_id || r.eventId) === d.eventId);
                        const formattedDate = new Date(d.sentAt || Date.now()).toLocaleString();

                        return (
                          <tr key={d.id || index} style={S.tr}>
                            <td style={S.td}><span style={S.idBadge}>#{index + 1}</span></td>
                            <td style={S.td}>
                              <span style={S.strongText}>{d.eventName}</span>
                              <div style={S.tableSubText}>ID: {d.eventId}</div>
                            </td>
                            <td style={S.td}>
                              <span style={{
                                background: isDark ? '#1e3a8a' : '#eff6ff',
                                color: isDark ? '#93c5fd' : '#1d4ed8',
                                border: isDark ? '1px solid #1e40af' : '1px solid #bfdbfe',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '0.85rem'
                              }}>
                                {d.coordinatorName}
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={{ fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a' }}>
                                {evtRegs.length} Participants
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={{ fontSize: '0.82rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                                {formattedDate}
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
                                Dispatched
                              </span>
                            </td>
                            <td style={{ ...S.td, textAlign: 'right' }}>
                              <button
                                onClick={() => handleOpenEditDispatchModal(d)}
                                style={S.actionBtnEdit}
                                title="Edit / Re-assign Coordinator"
                              >
                                <FaEdit size={13} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDispatch(d.id, d.eventName, d.coordinatorName)}
                                style={S.actionBtnDelete}
                                title="Delete & Revoke List"
                              >
                                <FaTrash size={13} /> Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {dispatchesList.length === 0 && (
                        <tr>
                          <td colSpan="7" style={S.emptyState}>
                            No dispatched participant lists found yet. Click "Send" on any Event Card above to dispatch a list.
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

      {/* ==================== EDIT DISPATCH MODAL ==================== */}
      {isEditDispatchModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: isDark ? '#111827' : '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a' }}>
                  Re-assign Dispatched List
                </h3>
                <span style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                  Update assigned Event Coordinator
                </span>
              </div>
              <button
                onClick={() => setIsEditDispatchModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: isDark ? '#9ca3af' : '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveDispatchEdit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={S.modalInputGroup}>
                <label style={S.label}>Assigned Event Coordinator Name *</label>
                {coordinators.length > 0 ? (
                  <select
                    value={editCoordNameInput}
                    onChange={(e) => setEditCoordNameInput(e.target.value)}
                    style={S.select}
                  >
                    {coordinators.map((c, i) => (
                      <option key={c.id || i} value={c.name}>
                        {c.name} {c.assignedEvents?.length ? `(${c.assignedEvents.join(', ')})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editCoordNameInput}
                    onChange={(e) => setEditCoordNameInput(e.target.value)}
                    style={S.input}
                    required
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditDispatchModalOpen(false)}
                  style={{ ...S.filterBtn, flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...S.primaryBtn, flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== SEND TO EVENT COORDINATOR MODAL ==================== */}
      {isSendModalOpen && sendTargetEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: isDark ? '#111827' : '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem 1.75rem', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a' }}>
                  Send Participant List
                </h3>
                <span style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                  Event: <strong>{sendTargetEvent.name}</strong>
                </span>
              </div>
              <button
                onClick={() => setIsSendModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: isDark ? '#9ca3af' : '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={S.modalInputGroup}>
                <label style={S.label}>Select Event Coordinator Account / Name *</label>
                {coordinators.length > 0 ? (
                  <select
                    value={selectedCoordName}
                    onChange={(e) => setSelectedCoordName(e.target.value)}
                    style={S.select}
                  >
                    {coordinators.map((c, i) => (
                      <option key={c.id || i} value={c.name}>
                        {c.name} {c.assignedEvents?.length ? `(${c.assignedEvents.join(', ')})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter Event Coordinator Username / Name"
                    value={selectedCoordName}
                    onChange={(e) => setSelectedCoordName(e.target.value)}
                    style={S.input}
                    required
                  />
                )}
              </div>

              <div style={{ background: isDark ? '#1f2937' : '#f8fafc', padding: '1rem', borderRadius: '10px', border: isDark ? '1px solid #374151' : '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569', fontWeight: '600' }}>
                  Summary to Dispatch:
                </span>
                <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0, fontSize: '0.82rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                  <li>Event: {sendTargetEvent.name} ({sendTargetEvent.category.toUpperCase()})</li>
                  <li>Total Registered Participants: {registrationsList.filter(r => (r.event_id || r.eventId) === sendTargetEvent.id).length}</li>
                  <li>Includes complete team member rosters & ticket codes.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  style={{ ...S.filterBtn, flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSendingList}
                  onClick={handleConfirmSendList}
                  style={{ ...S.primaryBtn, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem' }}
                >
                  <FaPaperPlane size={12} /> {isSendingList ? 'Sending...' : 'Confirm & Send List'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT EVENT                               */}
      {/* ======================================================== */}
      {isEventEditModalOpen && (
        <div style={S.modalBackdrop} onClick={resetEventEditModal}>
          <div style={{ ...S.modalCard, maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div style={S.modalHeaderLeft}>
                <div style={S.modalIconBoxEvent}>
                  <FaCalendarAlt size={18} />
                </div>
                <div>
                  <h3 style={S.modalTitle}>{editingEvent ? `Edit Event: ${editingEvent.name || editingEvent.id.toUpperCase()}` : 'Add New Symposium Event'}</h3>
                  <p style={S.modalSubtitle}>Updates made here synchronize directly with the live events and registration pages.</p>
                </div>
              </div>
              <button onClick={resetEventEditModal} style={S.modalCloseBtn} title="Close (Esc)">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitEventEdit} style={S.modalForm}>
              <div style={S.modalFormBody}>
                {/* Event Poster / Picture Upload & Presets */}
                <div style={S.modalInputGroup}>
                  <label style={S.label}>Event Poster / Picture</label>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{
                      width: '100px',
                      height: '75px',
                      borderRadius: '10px',
                      background: isDark ? '#1f2937' : '#f8fafc',
                      border: isDark ? '2px dashed #4b5563' : '2px dashed #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {(eventImagePreview || (editingEvent && getEventBanner(editingEvent))) ? (
                        <img 
                          src={eventImagePreview || getEventBanner(editingEvent)} 
                          alt="Event Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <FaImage color="#94a3b8" size={26} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input 
                        type="file" 
                        ref={eventFileInputRef} 
                        onChange={handleEventImageFileSelect} 
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        style={{ display: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                          type="button" 
                          onClick={() => eventFileInputRef.current?.click()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.55rem 1rem',
                            background: isDark ? '#312e81' : '#eff6ff',
                            border: isDark ? '1px solid #4338ca' : '1px solid #bfdbfe',
                            color: isDark ? '#c7d2fe' : '#2563eb',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          disabled={isUploadingEventImage}
                        >
                          <FaUpload size={12} /> {isUploadingEventImage ? 'Uploading Picture...' : 'Upload Custom Picture'}
                        </button>
                        {eventImagePreview && (
                          <button 
                            type="button" 
                            onClick={() => { setEventImage(''); setEventImagePreview(''); }}
                            style={{
                              padding: '0.55rem 0.85rem',
                              background: isDark ? '#1f2937' : '#f8fafc',
                              border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
                              color: isDark ? '#9ca3af' : '#64748b',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            Reset to Default
                          </button>
                        )}
                      </div>
                      
                      {/* Quick preset selector for existing artwork */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b', fontWeight: '500' }}>
                          Or pick existing poster:
                        </span>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && defaultEventImages[val]) {
                              setEventImage(defaultEventImages[val]);
                              setEventImagePreview(defaultEventImages[val]);
                            }
                          }}
                          defaultValue=""
                          style={{
                            ...S.select,
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.8rem',
                            width: 'auto',
                            maxWidth: '240px'
                          }}
                        >
                          <option value="" disabled>Choose existing artwork...</option>
                          {EXISTING_POSTER_PRESETS.map((p) => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                          ))}
                        </select>
                      </div>

                      <span style={S.inputHelper}>Upload new artwork (PNG, JPG, WEBP max 5MB) or select from existing event posters.</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Event Name *</label>
                    <input 
                      type="text" 
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      style={S.input}
                      placeholder="e.g. PPT PRESENTATION"
                      required 
                      autoFocus
                    />
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Category *</label>
                    <select 
                      value={eventCategory} 
                      onChange={(e) => setEventCategory(e.target.value)}
                      style={S.select}
                      required
                    >
                      <option value="technical">Technical</option>
                      <option value="non-technical">Non-Technical</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Tagline / Subtitle</label>
                    <input 
                      type="text" 
                      value={eventSubtitle}
                      onChange={(e) => setEventSubtitle(e.target.value)}
                      style={S.input}
                      placeholder="e.g. PowerPoint & Idea Pitch Deck"
                    />
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Event Tag / Badge</label>
                    <input 
                      type="text" 
                      value={eventTag}
                      onChange={(e) => setEventTag(e.target.value)}
                      style={S.input}
                      placeholder="e.g. Technical Presentation"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Venue *</label>
                    <input 
                      type="text" 
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      style={S.input}
                      placeholder="e.g. CSE Seminar Hall / Drawing Hall"
                      required 
                    />
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Time / Schedule *</label>
                    <input 
                      type="text" 
                      value={eventTiming}
                      onChange={(e) => setEventTiming(e.target.value)}
                      style={S.input}
                      placeholder="e.g. 10:00 AM – 01:00 PM"
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Registration Fee *</label>
                    <input 
                      type="text" 
                      value={eventFee}
                      onChange={(e) => setEventFee(e.target.value)}
                      style={S.input}
                      placeholder="e.g. ₹100 per head"
                      required 
                    />
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Team Size / Format</label>
                    <input 
                      type="text" 
                      value={eventTeamSize}
                      onChange={(e) => setEventTeamSize(e.target.value)}
                      style={S.input}
                      placeholder="e.g. Max of 3 members"
                    />
                  </div>
                </div>

                <div style={S.modalInputGroup}>
                  <label style={S.label}>Description</label>
                  <textarea 
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    style={{ ...S.input, resize: 'vertical' }}
                    rows={3}
                    placeholder="Brief description of the event, objective, and format..."
                  />
                </div>
              </div>

              <div style={S.modalFooter}>
                <button type="button" onClick={resetEventEditModal} style={S.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={S.primaryBtn}>
                  {editingEvent ? 'Save Event Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: USER CREATE / EDIT                                */}
      {/* ======================================================== */}
      {isUserFormVisible && (
        <div style={S.modalBackdrop} onClick={resetUserForm}>
          <div style={S.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div style={S.modalHeaderLeft}>
                <div style={S.modalIconBox}><FaUserCheck size={20} /></div>
                <div>
                  <h3 style={S.modalTitle}>{editingUserId ? 'Edit System User' : 'Create New User'}</h3>
                  <p style={S.modalSubtitle}>{editingUserId ? 'Modify user credentials or permission level' : 'Grant administrative access to a new user account'}</p>
                </div>
              </div>
              <button onClick={resetUserForm} style={S.modalCloseBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitUser} style={S.modalForm}>
              <div style={S.modalFormBody}>
                <div style={S.modalInputGroup}>
                  <label style={S.label}>Username *</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="e.g. jdoe_admin"
                    style={S.input}
                    required
                  />
                </div>

                <div style={S.modalInputGroup}>
                  <label style={S.label}>Password {editingUserId ? '(Leave blank to retain current)' : '*'}</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={editingUserId ? '••••••••' : 'Enter strong password'}
                    style={S.input}
                    required={!editingUserId}
                  />
                </div>

                <div style={S.modalInputGroup}>
                  <label style={S.label}>Assigned Role *</label>
                  <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value)}
                    style={S.select}
                    required
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={S.modalFooter}>
                <button type="button" onClick={resetUserForm} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.primaryBtn}>
                  {editingUserId ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ROLE CREATE / EDIT                                */}
      {/* ======================================================== */}
      {isRoleFormVisible && (
        <div style={S.modalBackdrop} onClick={resetRoleForm}>
          <div style={S.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div style={S.modalHeaderLeft}>
                <div style={S.modalIconBoxRole}><FaShieldAlt size={20} /></div>
                <div>
                  <h3 style={S.modalTitle}>{editingRoleId ? 'Edit Role' : 'Create New Role'}</h3>
                  <p style={S.modalSubtitle}>{editingRoleId ? 'Modify custom role label' : 'Define an access level identifier for user grouping'}</p>
                </div>
              </div>
              <button onClick={resetRoleForm} style={S.modalCloseBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitRole} style={S.modalForm}>
              <div style={S.modalFormBody}>
                <div style={S.modalInputGroup}>
                  <label style={S.label}>Role Identifier Name *</label>
                  <input 
                    type="text" 
                    value={roleNameInput} 
                    onChange={(e) => setRoleNameInput(e.target.value)} 
                    placeholder="e.g. coordinator, validator, reviewer"
                    style={S.input}
                    required
                  />
                  <span style={S.inputHelper}>Lowercase identifier without spaces recommended.</span>
                </div>
              </div>

              <div style={S.modalFooter}>
                <button type="button" onClick={resetRoleForm} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={{ ...S.primaryBtn, background: '#059669' }}>
                  {editingRoleId ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SPONSOR CREATE / EDIT                             */}
      {/* ======================================================== */}
      {isSponsorFormVisible && (
        <div style={S.modalBackdrop} onClick={resetSponsorForm}>
          <div style={{ ...S.modalCard, maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div style={S.modalHeaderLeft}>
                <div style={{ ...S.modalIconBox, background: isDark ? '#78350f' : '#fef3c7', color: '#b45309' }}>
                  <FaHandshake size={20} />
                </div>
                <div>
                  <h3 style={S.modalTitle}>{editingSponsorId ? 'Edit Sponsor' : 'Add New Sponsor'}</h3>
                  <p style={S.modalSubtitle}>Configure branding, category, contact info, and website link</p>
                </div>
              </div>
              <button onClick={resetSponsorForm} style={S.modalCloseBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitSponsor} style={S.modalForm}>
              <div style={S.modalFormBody}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Sponsor Name *</label>
                    <input 
                      type="text" 
                      value={sponsorName} 
                      onChange={(e) => setSponsorName(e.target.value)} 
                      placeholder="e.g. APEX DYNAMICS"
                      style={S.input}
                      required
                    />
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Company / Organization</label>
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      placeholder="e.g. Apex Dynamics Pvt Ltd"
                      style={S.input}
                    />
                  </div>
                </div>

                {/* Logo Upload Section */}
                <div style={S.modalInputGroup}>
                  <label style={S.label}>Sponsor Logo</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      background: isDark ? '#1f2937' : '#f8fafc',
                      border: isDark ? '2px dashed #4b5563' : '2px dashed #cbd5e1',
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
                            background: isDark ? '#1e3a8a' : '#eff6ff',
                            border: isDark ? '1px solid #1e40af' : '1px solid #bfdbfe',
                            color: isDark ? '#93c5fd' : '#2563eb',
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
                              background: isDark ? '#1f2937' : '#f8fafc',
                              border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
                              color: isDark ? '#9ca3af' : '#64748b',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span style={S.inputHelper}>Supported formats: PNG, JPG, WEBP, SVG (Max 5MB)</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Sponsorship Level *</label>
                    <select 
                      value={sponsorCategory} 
                      onChange={(e) => setSponsorCategory(e.target.value)}
                      style={S.select}
                      required
                    >
                      <option value="Elite">Elite</option>
                      <option value="Premium">Premium</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Display Order (Priority)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={sponsorDisplayOrder} 
                      onChange={(e) => setSponsorDisplayOrder(e.target.value)} 
                      placeholder="1"
                      style={S.input}
                    />
                  </div>
                </div>

                <div style={S.modalInputGroup}>
                  <label style={S.label}>Website URL</label>
                  <input 
                    type="url" 
                    value={sponsorWebsite} 
                    onChange={(e) => setSponsorWebsite(e.target.value)} 
                    placeholder="https://example.com/partner"
                    style={S.input}
                  />
                </div>

                <div style={S.modalInputGroup}>
                  <label style={S.label}>Sponsor Description</label>
                  <textarea 
                    value={sponsorDesc} 
                    onChange={(e) => setSponsorDesc(e.target.value)} 
                    placeholder="Short description displayed on the flip card on the public website..."
                    rows={3}
                    style={{ ...S.input, resize: 'vertical' }}
                  />
                </div>

                {/* Contact Information */}
                <div style={{ background: isDark ? '#1a2234' : '#f8fafc', padding: '1rem', borderRadius: '10px', border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isDark ? '#cbd5e1' : '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Contact Person (Internal Admin Record - Optional)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b' }}>Contact Name</label>
                      <input 
                        type="text" 
                        value={sponsorContactName} 
                        onChange={(e) => setSponsorContactName(e.target.value)} 
                        placeholder="e.g. John Doe"
                        style={{ ...S.input, marginTop: '2px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b' }}>Phone Number</label>
                      <input 
                        type="text" 
                        value={sponsorContactPhone} 
                        onChange={(e) => setSponsorContactPhone(e.target.value)} 
                        placeholder="e.g. 9876543210"
                        style={{ ...S.input, marginTop: '2px' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '0.6rem' }}>
                    <label style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b' }}>Contact Email</label>
                    <input 
                      type="email" 
                      value={sponsorContactEmail} 
                      onChange={(e) => setSponsorContactEmail(e.target.value)} 
                      placeholder="e.g. partner@company.com"
                      style={{ ...S.input, marginTop: '2px' }}
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
                  <label htmlFor="sponsorActive" style={{ fontSize: '0.9rem', fontWeight: '600', color: isDark ? '#f9fafb' : '#0f172a', cursor: 'pointer' }}>
                    Active Sponsor (Visible publicly on website marquee)
                  </label>
                </div>
              </div>

              <div style={S.modalFooter}>
                <button type="button" onClick={resetSponsorForm} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.primaryBtn}>
                  {editingSponsorId ? 'Save Changes' : 'Create Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: COORDINATOR CREATE / EDIT                         */}
      {/* ======================================================== */}
      {isCoordFormVisible && (
        <div style={S.modalBackdrop} onClick={resetCoordForm}>
          <div style={{ ...S.modalCard, maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div style={S.modalHeaderLeft}>
                <div style={{ ...S.modalIconBox, background: isDark ? '#1e3a8a' : '#eff6ff', color: '#2563eb' }}>
                  <FaUserTie size={20} />
                </div>
                <div>
                  <h3 style={S.modalTitle}>{editingCoordId ? 'Edit Student Coordinator' : 'Add Student Coordinator'}</h3>
                  <p style={S.modalSubtitle}>Assign lead student coordinators to one or multiple symposium events</p>
                </div>
              </div>
              <button onClick={resetCoordForm} style={S.modalCloseBtn}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitCoord} style={S.modalForm}>
              <div style={S.modalFormBody}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Full Name *</label>
                    <input 
                      type="text" 
                      value={coordName} 
                      onChange={(e) => setCoordName(e.target.value)} 
                      placeholder="e.g. Mohammed Nabeel"
                      style={S.input}
                      required
                    />
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Phone Number (10 Digits) *</label>
                    <input 
                      type="tel" 
                      value={coordPhone} 
                      onChange={(e) => setCoordPhone(e.target.value)} 
                      placeholder="e.g. 9994023366"
                      style={S.input}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>WhatsApp Number</label>
                    <input 
                      type="tel" 
                      value={coordWhatsapp} 
                      onChange={(e) => setCoordWhatsapp(e.target.value)} 
                      placeholder="e.g. 9994023366"
                      style={S.input}
                    />
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Email Address</label>
                    <input 
                      type="email" 
                      value={coordEmail} 
                      onChange={(e) => setCoordEmail(e.target.value)} 
                      placeholder="e.g. nabeel@cahcet.edu.in"
                      style={S.input}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Department</label>
                    <input 
                      type="text" 
                      value={coordDept} 
                      onChange={(e) => setCoordDept(e.target.value)} 
                      placeholder="CSE / IT / ECE"
                      style={S.input}
                    />
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Year of Study</label>
                    <select 
                      value={coordYear} 
                      onChange={(e) => setCoordYear(e.target.value)}
                      style={S.select}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Role *</label>
                    <select 
                      value={coordRole} 
                      onChange={(e) => setCoordRole(e.target.value)}
                      style={S.select}
                      required
                    >
                      <option value="Lead Coordinator">Lead Coordinator</option>
                      <option value="Coordinator">Coordinator</option>
                    </select>
                  </div>
                </div>

                {/* Event Assignment Checklist */}
                <div style={S.modalInputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={S.label}>Assigned Events * ({coordEvents.length} selected)</label>
                    <span style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#64748b' }}>Select one or more events</span>
                  </div>

                  <div style={{ 
                    border: isDark ? '1px solid #374151' : '1px solid #cbd5e1', 
                    borderRadius: '10px', 
                    padding: '0.85rem', 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    background: isDark ? '#1f2937' : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}>
                    {/* Technical Events */}
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isDark ? '#93c5fd' : '#1e40af', letterSpacing: '0.04em' }}>
                      TECHNICAL EVENTS
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {eventsList.filter(e => e.category === 'technical').map(ev => {
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
                              background: isChecked ? (isDark ? '#1e3a8a' : '#eff6ff') : (isDark ? '#111827' : '#ffffff'),
                              border: isChecked ? (isDark ? '1px solid #2563eb' : '1px solid #bfdbfe') : (isDark ? '1px solid #374151' : '1px solid #e2e8f0'),
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: isChecked ? '700' : '500',
                              color: isChecked ? (isDark ? '#bfdbfe' : '#1e40af') : (isDark ? '#e5e7eb' : '#334155')
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
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isDark ? '#f472b6' : '#9d174d', letterSpacing: '0.04em', marginTop: '6px' }}>
                      NON-TECHNICAL EVENTS
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {eventsList.filter(e => e.category === 'non-technical').map(ev => {
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
                              background: isChecked ? (isDark ? '#831843' : '#fdf2f8') : (isDark ? '#111827' : '#ffffff'),
                              border: isChecked ? (isDark ? '1px solid #db2777' : '1px solid #fbcfe8') : (isDark ? '1px solid #374151' : '1px solid #e2e8f0'),
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: isChecked ? '700' : '500',
                              color: isChecked ? (isDark ? '#fbcfe8' : '#be185d') : (isDark ? '#e5e7eb' : '#334155')
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
                  <div style={S.modalInputGroup}>
                    <label style={S.label}>Display Order</label>
                    <input 
                      type="number" 
                      min="1"
                      value={coordDisplayOrder} 
                      onChange={(e) => setCoordDisplayOrder(e.target.value)} 
                      placeholder="1"
                      style={S.input}
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
                    <label htmlFor="coordActive" style={{ fontSize: '0.9rem', fontWeight: '600', color: isDark ? '#f9fafb' : '#0f172a', cursor: 'pointer' }}>
                      Active Status
                    </label>
                  </div>
                </div>
              </div>

              <div style={S.modalFooter}>
                <button type="button" onClick={resetCoordForm} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.primaryBtn}>
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
