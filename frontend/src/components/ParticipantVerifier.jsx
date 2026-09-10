import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  FaSearch, 
  FaQrcode, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUserCheck, 
  FaCamera, 
  FaCameraRetro, 
  FaTimes, 
  FaPrint, 
  FaUndo, 
  FaPhone, 
  FaEnvelope, 
  FaUniversity, 
  FaCalendarAlt, 
  FaUsers, 
  FaTicketAlt, 
  FaMoneyBillWave, 
  FaSyncAlt,
  FaFileImage,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Html5Qrcode } from 'html5-qrcode';
import { getApiUrl } from '../config/api';

export default function ParticipantVerifier({ 
  token, 
  user, 
  isDark, 
  registrations = [], 
  events = [], 
  onRefreshRegistrations,
  onPrintTicket 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'verified' | 'unverified'
  const [eventFilter, setEventFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all'); // 'all' | 'online' | 'offline'

  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' | 'file'
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState('');

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Helper functions
  const isOnlineRecord = (r) => {
    return Boolean(
      r?.payment_status ||
      r?.paymentMode === 'online' ||
      (r?.ticket_code && r.ticket_code.startsWith('ELQ26-')) ||
      (r?.ticketCode && r.ticketCode.startsWith('ELQ26-')) ||
      (r?.registrationId && r.registrationId.startsWith('ELQ26-'))
    );
  };

  const isVerifiedRecord = (r) => {
    return Boolean(r?.is_verified || r?.isVerified || r?.attendance_status === 'verified' || r?.attendanceStatus === 'verified');
  };

  const getTicketCode = (r) => {
    return r?.ticket_code || r?.ticketCode || r?.registrationId || r?.id || 'N/A';
  };

  const getParticipantName = (r) => {
    return r?.full_name || r?.fullName || r?.name || 'N/A';
  };

  const getEventName = (r) => {
    if (r?.eventName) return r.eventName;
    if (r?.event_name) return r.event_name;
    const evId = r?.event_id || r?.eventId;
    const found = events.find(e => e.id === evId || String(e.id) === String(evId));
    return found ? found.name : (evId || 'Symposium Event');
  };

  const getEventCategory = (r) => {
    if (r?.eventCategory) return r.eventCategory;
    if (r?.category) return r.category;
    const evId = r?.event_id || r?.eventId;
    const found = events.find(e => e.id === evId || String(e.id) === String(evId));
    return found ? found.category : 'technical';
  };

  const getFee = (r) => {
    return Number(r?.total_fee ?? r?.totalAmount ?? r?.fee ?? 0);
  };

  const getTeamMembers = (r) => {
    if (!r) return [];
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

  // Keep selectedParticipant in sync when registrations list updates
  useEffect(() => {
    if (selectedParticipant) {
      const currentCode = getTicketCode(selectedParticipant);
      const updated = registrations.find(r => getTicketCode(r) === currentCode || (r.id && r.id === selectedParticipant.id));
      if (updated) {
        setSelectedParticipant(updated);
      }
    }
  }, [registrations]);

  // Handle scanned ticket or input string
  const handleProcessScanCode = (decodedText) => {
    if (!decodedText) return;
    const cleanText = decodedText.trim();
    
    // Extract ticket code if embedded in URL or json
    let lookupKey = cleanText;
    if (cleanText.includes('code=')) {
      const match = cleanText.match(/code=([^&]+)/);
      if (match) lookupKey = match[1];
    } else if (cleanText.includes('ticket=')) {
      const match = cleanText.match(/ticket=([^&]+)/);
      if (match) lookupKey = match[1];
    } else if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
      try {
        const obj = JSON.parse(cleanText);
        lookupKey = obj.ticketCode || obj.ticket_code || obj.id || cleanText;
      } catch (e) {
        // use raw
      }
    }

    const keyLower = lookupKey.toLowerCase();

    // Look for match
    const matched = registrations.find(r => {
      const ticket = getTicketCode(r).toLowerCase();
      const id = String(r.id || '').toLowerCase();
      const phone = String(r.phone || '').toLowerCase();
      const email = String(r.email || '').toLowerCase();
      const name = getParticipantName(r).toLowerCase();

      return ticket === keyLower || 
             ticket.includes(keyLower) || 
             id === keyLower || 
             phone === keyLower || 
             email === keyLower ||
             name === keyLower;
    });

    if (matched) {
      setSelectedParticipant(matched);
      setSearchTerm(getTicketCode(matched));
      toast.success(`Participant Found: ${getParticipantName(matched)}`, { icon: '🎯' });
      // Play audio chime if possible
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {}

      // Stop camera if scanner was open
      if (isScannerOpen) {
        stopScanner();
        setIsScannerOpen(false);
      }
    } else {
      setSearchTerm(lookupKey);
      toast.error(`No registration matched: "${lookupKey}"`, { icon: '🔍' });
    }
  };

  // Camera Scanner Lifecycle
  useEffect(() => {
    if (isScannerOpen && scannerMode === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isScannerOpen, scannerMode, selectedCameraId]);

  const startScanner = async () => {
    setScannerError('');
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-target');
      }

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        const camId = selectedCameraId || devices[devices.length - 1].id; // default to back camera
        if (!selectedCameraId) setSelectedCameraId(camId);

        if (html5QrCodeRef.current && !scannerActive) {
          await html5QrCodeRef.current.start(
            camId,
            {
              fps: 15,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              handleProcessScanCode(decodedText);
            },
            (errorMessage) => {
              // scanning frames...
            }
          );
          setScannerActive(true);
        }
      } else {
        setScannerError('No cameras found on this device');
      }
    } catch (err) {
      console.warn('QR Scanner Start Error:', err);
      setScannerError('Camera access denied or unavailable. You can use image upload or enter code.');
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && scannerActive) {
        await html5QrCodeRef.current.stop();
        setScannerActive(false);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleFileUploadScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-target');
      const result = await html5QrCode.scanFile(file, true);
      handleProcessScanCode(result);
    } catch (err) {
      toast.error('Could not detect QR code in this image. Try another photo or enter code manually.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Toggle or Confirm Verification API Call
  const handleToggleVerification = async (participant, desiredStatus = true) => {
    if (!participant) return;
    const participantId = participant.id || getTicketCode(participant);
    setIsVerifying(true);

    try {
      const res = await fetch(getApiUrl(`/api/admin/registrations/${participantId}/verify`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          isVerified: desiredStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          desiredStatus 
            ? `🎉 ${getParticipantName(participant)} verified & admitted!`
            : `Verification reset for ${getParticipantName(participant)}`,
          { duration: 4000 }
        );

        // Update local object immediately
        const updatedObj = {
          ...participant,
          is_verified: desiredStatus,
          isVerified: desiredStatus,
          verified_at: desiredStatus ? new Date().toISOString() : null,
          verifiedAt: desiredStatus ? new Date().toISOString() : null,
          verified_by: desiredStatus ? (user?.username || user?.role || 'Coordinator') : null,
          verifiedBy: desiredStatus ? (user?.username || user?.role || 'Coordinator') : null
        };
        setSelectedParticipant(updatedObj);

        // Trigger global dashboard refresh if provided
        if (typeof onRefreshRegistrations === 'function') {
          onRefreshRegistrations();
        }
      } else {
        toast.error(data.message || 'Failed to update verification status');
      }
    } catch (err) {
      console.error('Verification request error:', err);
      toast.error('Server error updating verification');
    } finally {
      setIsVerifying(false);
    }
  };

  // Filter registrations list for table / search
  const filteredList = registrations.filter(r => {
    // Status filter
    const isVer = isVerifiedRecord(r);
    if (statusFilter === 'verified' && !isVer) return false;
    if (statusFilter === 'unverified' && isVer) return false;

    // Mode filter
    const isOnline = isOnlineRecord(r);
    if (modeFilter === 'online' && !isOnline) return false;
    if (modeFilter === 'offline' && isOnline) return false;

    // Event filter
    if (eventFilter !== 'all') {
      const evId = r.event_id || r.eventId;
      if (evId !== eventFilter && String(evId) !== String(eventFilter)) return false;
    }

    // Search query
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;

    const ticket = getTicketCode(r).toLowerCase();
    const name = getParticipantName(r).toLowerCase();
    const phone = String(r.phone || '').toLowerCase();
    const email = String(r.email || '').toLowerCase();
    const college = String(r.college || '').toLowerCase();
    const dept = String(r.department || '').toLowerCase();
    const teamName = String(r.team_name || r.teamName || '').toLowerCase();
    const members = getTeamMembers(r).join(' ').toLowerCase();

    return (
      ticket.includes(q) ||
      name.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      college.includes(q) ||
      dept.includes(q) ||
      teamName.includes(q) ||
      members.includes(q)
    );
  });

  // Calculate statistics
  const totalCount = registrations.length;
  const verifiedCount = registrations.filter(isVerifiedRecord).length;
  const unverifiedCount = totalCount - verifiedCount;
  const totalRevenue = registrations.reduce((sum, r) => sum + getFee(r), 0);
  const verifiedPercent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  // Visual Styles
  const S = {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      width: '100%',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    // Top Banner
    headerCard: {
      background: isDark 
        ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
        : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
      borderRadius: '18px',
      padding: '1.75rem 2rem',
      border: isDark ? '1px solid #334155' : '1px solid #bfdbfe',
      boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.4)' : '0 4px 20px rgba(37,99,235,0.06)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1.5rem'
    },
    headerTitle: {
      fontSize: '1.6rem',
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#1e3a8a',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    headerSubtitle: {
      fontSize: '0.9rem',
      color: isDark ? '#94a3b8' : '#475569',
      margin: '6px 0 0 0',
      fontWeight: '500'
    },
    // Stats Grid
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1.25rem'
    },
    statCard: {
      background: isDark ? '#111827' : '#ffffff',
      borderRadius: '16px',
      padding: '1.35rem 1.5rem',
      border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      transition: 'all 0.2s ease'
    },
    statLabel: {
      fontSize: '0.78rem',
      fontWeight: '700',
      color: isDark ? '#9ca3af' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: '800',
      color: isDark ? '#f9fafb' : '#0f172a'
    },
    statBadge: {
      fontSize: '0.8rem',
      fontWeight: '700',
      padding: '0.25rem 0.6rem',
      borderRadius: '999px',
      alignSelf: 'flex-start',
      marginTop: '4px'
    },

    // Search and Action Bar
    searchSection: {
      background: isDark ? '#111827' : '#ffffff',
      borderRadius: '16px',
      padding: '1.5rem',
      border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    },
    searchRow: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchInputWrapper: {
      position: 'relative',
      flex: 1,
      minWidth: '280px'
    },
    searchInput: {
      width: '100%',
      padding: '0.9rem 1rem 0.9rem 2.85rem',
      borderRadius: '12px',
      border: isDark ? '2px solid #334155' : '2px solid #cbd5e1',
      background: isDark ? '#1e293b' : '#f8fafc',
      color: isDark ? '#f8fafc' : '#0f172a',
      fontSize: '1rem',
      fontWeight: '600',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s ease'
    },
    searchIconInside: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: '1.2rem',
      pointerEvents: 'none'
    },
    clearSearchBtn: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      color: isDark ? '#94a3b8' : '#64748b',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center'
    },
    scanToggleBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0.85rem 1.4rem',
      borderRadius: '12px',
      background: isScannerOpen ? '#dc2626' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: '#ffffff',
      fontWeight: '700',
      fontSize: '0.95rem',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    },
    filterPillRow: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    filterSelect: {
      padding: '0.6rem 1rem',
      borderRadius: '10px',
      border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
      fontSize: '0.88rem',
      fontWeight: '600',
      outline: 'none',
      cursor: 'pointer'
    },

    // QR Scanner Box
    scannerCard: {
      background: isDark ? '#0f172a' : '#000000',
      color: '#ffffff',
      borderRadius: '18px',
      padding: '1.75rem',
      border: '2px solid #3b82f6',
      boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.25rem',
      position: 'relative',
      overflow: 'hidden'
    },
    cameraFrame: {
      width: '100%',
      maxWidth: '380px',
      minHeight: '320px',
      borderRadius: '14px',
      overflow: 'hidden',
      background: '#000000',
      border: '2px dashed #60a5fa',
      position: 'relative'
    },

    // Selected Inspection Card
    detailsHeroCard: {
      background: isDark ? '#111827' : '#ffffff',
      borderRadius: '20px',
      border: isDark ? '2px solid #2563eb' : '2px solid #3b82f6',
      boxShadow: isDark ? '0 12px 35px rgba(37,99,235,0.25)' : '0 10px 30px rgba(37,99,235,0.12)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    detailsHeader: {
      padding: '1.5rem 2rem',
      background: isDark ? '#1a2436' : '#eff6ff',
      borderBottom: isDark ? '1px solid #2b3952' : '1px solid #dbeafe',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    statusBadgeBig: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0.6rem 1.25rem',
      borderRadius: '999px',
      fontWeight: '800',
      fontSize: '0.95rem',
      letterSpacing: '0.03em',
      textTransform: 'uppercase'
    },
    detailsBody: {
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem'
    },
    gridTwoCol: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem'
    },
    infoBlock: {
      background: isDark ? '#1e293b' : '#f8fafc',
      padding: '1.25rem',
      borderRadius: '12px',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem'
    },
    infoBlockLabel: {
      fontSize: '0.78rem',
      fontWeight: '700',
      color: isDark ? '#94a3b8' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    },
    infoBlockValue: {
      fontSize: '1.05rem',
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#0f172a'
    },
    actionButtonsBar: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      paddingTop: '1rem',
      borderTop: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9'
    },
    confirmBtn: {
      flex: 1,
      minWidth: '220px',
      padding: '1rem 1.75rem',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      color: '#ffffff',
      fontWeight: '800',
      fontSize: '1.1rem',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
      transition: 'all 0.2s ease'
    },
    undoBtn: {
      padding: '0.85rem 1.4rem',
      borderRadius: '12px',
      background: isDark ? '#374151' : '#f1f5f9',
      color: isDark ? '#f3f4f6' : '#475569',
      fontWeight: '700',
      fontSize: '0.95rem',
      border: isDark ? '1px solid #4b5563' : '1px solid #cbd5e1',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    printBtn: {
      padding: '0.85rem 1.4rem',
      borderRadius: '12px',
      background: isDark ? '#1e3a8a' : '#eff6ff',
      color: isDark ? '#93c5fd' : '#1d4ed8',
      fontWeight: '700',
      fontSize: '0.95rem',
      border: isDark ? '1px solid #2563eb' : '1px solid #bfdbfe',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },

    // Results Table
    tableCard: {
      background: isDark ? '#111827' : '#ffffff',
      borderRadius: '16px',
      border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
      overflow: 'hidden'
    },
    tableHeader: {
      padding: '1.25rem 1.5rem',
      borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: isDark ? '#1a2234' : '#f8fafc'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      background: isDark ? '#111827' : '#ffffff',
      padding: '1rem 1.25rem',
      textAlign: 'left',
      color: isDark ? '#9ca3af' : '#64748b',
      fontWeight: '700',
      fontSize: '0.78rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0'
    },
    tr: {
      borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9',
      cursor: 'pointer',
      transition: 'background 0.15s ease'
    },
    td: {
      padding: '1rem 1.25rem',
      color: isDark ? '#cbd5e1' : '#334155',
      fontSize: '0.9rem'
    }
  };

  return (
    <div style={S.wrapper}>
      {/* ==================== 1. TOP HEADER & METRICS ==================== */}
      <div style={S.headerCard}>
        <div>
          <h1 style={S.headerTitle}>
            <FaUserCheck style={{ color: '#2563eb' }} />
            Search & Verify Participant
          </h1>
          <p style={S.headerSubtitle}>
            Scan QR code or search by Ticket Code, Name, Phone, Email, College or Roll Number to verify on-site admission.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={() => {
              if (typeof onRefreshRegistrations === 'function') {
                onRefreshRegistrations();
                toast.success('Registration list refreshed');
              }
            }}
            style={{
              padding: '0.75rem 1.2rem',
              borderRadius: '10px',
              background: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaSyncAlt /> Refresh Data
          </button>
        </div>
      </div>

      {/* ==================== 2. STATS CARDS ==================== */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <span style={S.statLabel}>Total Registrations</span>
          <span style={S.statNumber}>{totalCount}</span>
          <span style={{ ...S.statBadge, background: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#94a3b8' : '#475569' }}>
            All Enrolled Students
          </span>
        </div>

        <div style={S.statCard}>
          <span style={S.statLabel}>Verified & Confirmed</span>
          <span style={{ ...S.statNumber, color: '#10b981' }}>{verifiedCount}</span>
          <span style={{ ...S.statBadge, background: isDark ? '#064e3b' : '#ecfdf5', color: isDark ? '#6ee7b7' : '#047857' }}>
            ✓ {verifiedPercent}% Checked-in
          </span>
        </div>

        <div style={S.statCard}>
          <span style={S.statLabel}>Pending Verification</span>
          <span style={{ ...S.statNumber, color: '#f59e0b' }}>{unverifiedCount}</span>
          <span style={{ ...S.statBadge, background: isDark ? '#451a03' : '#fffbeb', color: isDark ? '#fcd34d' : '#b45309' }}>
            ⏳ Awaiting Desk Entry
          </span>
        </div>

        <div style={S.statCard}>
          <span style={S.statLabel}>Total Fees Collected</span>
          <span style={{ ...S.statNumber, color: '#3b82f6' }}>₹{totalRevenue}</span>
          <span style={{ ...S.statBadge, background: isDark ? '#1e3a8a' : '#eff6ff', color: isDark ? '#93c5fd' : '#1d4ed8' }}>
            Online & Offline
          </span>
        </div>
      </div>

      {/* ==================== 3. SEARCH & QR SCANNER BAR ==================== */}
      <div style={S.searchSection}>
        <div style={S.searchRow}>
          <div style={S.searchInputWrapper}>
            <FaSearch style={S.searchIconInside} />
            <input 
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Ticket Code (e.g. ELQ26-TCH-...), Name, Phone, Email, College..."
              style={S.searchInput}
              autoFocus
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => { setSearchTerm(''); searchInputRef.current?.focus(); }}
                style={S.clearSearchBtn}
                title="Clear Search"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>

          <button 
            type="button"
            onClick={() => setIsScannerOpen(!isScannerOpen)}
            style={S.scanToggleBtn}
          >
            <FaQrcode size={18} />
            {isScannerOpen ? 'Close QR Scanner' : 'Scan Ticket QR Code'}
          </button>
        </div>

        {/* Filters */}
        <div style={S.filterPillRow}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b' }}>
            Filters:
          </span>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={S.filterSelect}
          >
            <option value="all">All Verification Statuses</option>
            <option value="verified">Verified & Confirmed Only</option>
            <option value="unverified">Pending Verification Only</option>
          </select>

          <select 
            value={modeFilter} 
            onChange={(e) => setModeFilter(e.target.value)}
            style={S.filterSelect}
          >
            <option value="all">All Registration Modes</option>
            <option value="online">Online Web Portal</option>
            <option value="offline">On-Site Desk Registration</option>
          </select>

          <select 
            value={eventFilter} 
            onChange={(e) => setEventFilter(e.target.value)}
            style={S.filterSelect}
          >
            <option value="all">All Symposium Events</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name} ({ev.category})
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter !== 'all' || modeFilter !== 'all' || eventFilter !== 'all') && (
            <button 
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setModeFilter('all');
                setEventFilter('all');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ==================== 4. LIVE QR CODE SCANNER MODAL / VIEW ==================== */}
      {isScannerOpen && (
        <div style={S.scannerCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaCamera size={20} style={{ color: '#60a5fa' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Live QR Code Verification Scanner</h3>
            </div>
            <button 
              type="button" 
              onClick={() => setIsScannerOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button"
              onClick={() => setScannerMode('camera')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: scannerMode === 'camera' ? '#2563eb' : '#334155',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}
            >
              📹 Use Camera
            </button>
            <button 
              type="button"
              onClick={() => {
                setScannerMode('file');
                fileInputRef.current?.click();
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: scannerMode === 'file' ? '#2563eb' : '#334155',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}
            >
              🖼️ Upload QR Image
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileUploadScan} 
              style={{ display: 'none' }} 
            />
          </div>

          {scannerMode === 'camera' && (
            <>
              {cameras.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Switch Camera:</span>
                  <select 
                    value={selectedCameraId} 
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#1e293b', color: '#ffffff', border: '1px solid #475569', fontSize: '0.85rem' }}
                  >
                    {cameras.map(cam => (
                      <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id}`}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target div for html5-qrcode */}
              <div id="qr-reader-target" style={S.cameraFrame}></div>

              {scannerError ? (
                <div style={{ color: '#f87171', fontSize: '0.88rem', textAlign: 'center', padding: '0.5rem' }}>
                  ⚠️ {scannerError}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Hold participant ticket QR code in front of the camera to verify automatically.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================== 5. SELECTED PARTICIPANT VERIFICATION SHOWCASE ==================== */}
      {selectedParticipant && (
        <div style={S.detailsHeroCard}>
          {/* Header Banner with Live Status */}
          <div style={S.detailsHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: '800', 
                  color: isDark ? '#93c5fd' : '#1d4ed8',
                  background: isDark ? '#1e3a8a' : '#dbeafe',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px'
                }}>
                  #{getTicketCode(selectedParticipant)}
                </span>
                <span style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '600' }}>
                  {isOnlineRecord(selectedParticipant) ? 'Online Registration' : 'Desk On-Site Registration'}
                </span>
              </div>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '1.45rem', fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>
                {getParticipantName(selectedParticipant)}
              </h2>
            </div>

            {/* Verification Status Pill */}
            {isVerifiedRecord(selectedParticipant) ? (
              <span style={{ 
                ...S.statusBadgeBig, 
                background: isDark ? '#064e3b' : '#ecfdf5', 
                color: isDark ? '#34d399' : '#047857',
                border: isDark ? '1px solid #059669' : '1px solid #a7f3d0'
              }}>
                <FaCheckCircle size={18} />
                VERIFIED & CONFIRMED
              </span>
            ) : (
              <span style={{ 
                ...S.statusBadgeBig, 
                background: isDark ? '#451a03' : '#fffbeb', 
                color: isDark ? '#fbbf24' : '#b45309',
                border: isDark ? '1px solid #d97706' : '1px solid #fde68a'
              }}>
                <FaExclamationTriangle size={18} />
                PENDING VERIFICATION
              </span>
            )}
          </div>

          {/* Body Information */}
          <div style={S.detailsBody}>
            {/* Timestamp of verification if present */}
            {isVerifiedRecord(selectedParticipant) && selectedParticipant.verified_at && (
              <div style={{
                background: isDark ? '#064e3b' : '#ecfdf5',
                border: isDark ? '1px solid #059669' : '1px solid #6ee7b7',
                borderRadius: '10px',
                padding: '0.75rem 1.25rem',
                color: isDark ? '#a7f3d0' : '#065f46',
                fontSize: '0.88rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaCheckCircle size={16} />
                Participant checked in on {new Date(selectedParticipant.verified_at).toLocaleDateString()} at {new Date(selectedParticipant.verified_at).toLocaleTimeString()}
                {selectedParticipant.verified_by && ` (Verified by: ${selectedParticipant.verified_by})`}
              </div>
            )}

            <div style={S.gridTwoCol}>
              {/* Event Info */}
              <div style={S.infoBlock}>
                <span style={S.infoBlockLabel}>Event Enrolled</span>
                <span style={{ ...S.infoBlockValue, color: '#2563eb' }}>
                  {getEventName(selectedParticipant)}
                </span>
                <span style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'capitalize' }}>
                  {getEventCategory(selectedParticipant)} Event
                </span>
              </div>

              {/* College & Department */}
              <div style={S.infoBlock}>
                <span style={S.infoBlockLabel}>College & Department</span>
                <span style={S.infoBlockValue}>
                  {selectedParticipant.college || 'C. Abdul Hakeem College of Engg & Tech'}
                </span>
                <span style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  {selectedParticipant.department || 'CSE'} • {selectedParticipant.year || '3rd Year'}
                </span>
              </div>

              {/* Contact Phone */}
              <div style={S.infoBlock}>
                <span style={S.infoBlockLabel}>Contact Phone</span>
                <span style={S.infoBlockValue}>
                  <FaPhone size={14} style={{ marginRight: '6px', color: '#10b981' }} />
                  {selectedParticipant.phone || 'N/A'}
                </span>
                {selectedParticipant.email && (
                  <span style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    <FaEnvelope size={12} style={{ marginRight: '4px' }} /> {selectedParticipant.email}
                  </span>
                )}
              </div>

              {/* Fee & Payment */}
              <div style={S.infoBlock}>
                <span style={S.infoBlockLabel}>Registration Fee</span>
                <span style={{ ...S.infoBlockValue, color: '#10b981', fontSize: '1.25rem' }}>
                  ₹{getFee(selectedParticipant)}
                </span>
                <span style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Status: <strong style={{ color: '#10b981' }}>PAID / CONFIRMED</strong>
                </span>
              </div>
            </div>

            {/* Team Details if team event */}
            {getTeamMembers(selectedParticipant).length > 0 && (
              <div style={S.infoBlock}>
                <span style={S.infoBlockLabel}>
                  Team Details: {selectedParticipant.team_name || selectedParticipant.teamName || 'Team'} ({getTeamMembers(selectedParticipant).length + 1} Members)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  <span style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    background: isDark ? '#1e3a8a' : '#dbeafe',
                    color: isDark ? '#bfdbfe' : '#1e40af',
                    fontSize: '0.85rem',
                    fontWeight: '700'
                  }}>
                    1. {getParticipantName(selectedParticipant)} (Lead)
                  </span>
                  {getTeamMembers(selectedParticipant).map((m, idx) => (
                    <span key={idx} style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      background: isDark ? '#374151' : '#f1f5f9',
                      color: isDark ? '#f3f4f6' : '#334155',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {idx + 2}. {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div style={S.actionButtonsBar}>
              {!isVerifiedRecord(selectedParticipant) ? (
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleToggleVerification(selectedParticipant, true)}
                  style={S.confirmBtn}
                >
                  <FaCheck size={20} />
                  {isVerifying ? 'Confirming Verification...' : 'Confirm Verification & Admit Participant'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleToggleVerification(selectedParticipant, false)}
                  style={S.undoBtn}
                >
                  <FaUndo size={14} />
                  Undo / Reset Verification
                </button>
              )}

              {typeof onPrintTicket === 'function' && (
                <button
                  type="button"
                  onClick={() => onPrintTicket(selectedParticipant)}
                  style={S.printBtn}
                >
                  <FaPrint size={15} />
                  Print Verified Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. SEARCH MATCHES & PARTICIPANT LIST ==================== */}
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>
              Participant Registrations ({filteredList.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              Click on any participant row to inspect details or confirm desk verification.
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Ticket Code</th>
                <th style={S.th}>Participant Name</th>
                <th style={S.th}>Event</th>
                <th style={S.th}>College / Dept</th>
                <th style={S.th}>Phone</th>
                <th style={S.th}>Fee</th>
                <th style={S.th}>Status</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3.5rem', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                    <FaSearch size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>No participants found matching your criteria</p>
                    <span style={{ fontSize: '0.82rem' }}>Try searching by Ticket Code, Name, or Phone number</span>
                  </td>
                </tr>
              ) : (
                filteredList.map((r, idx) => {
                  const isVer = isVerifiedRecord(r);
                  const isSelected = selectedParticipant && (
                    selectedParticipant.id === r.id || 
                    getTicketCode(selectedParticipant) === getTicketCode(r)
                  );

                  return (
                    <tr 
                      key={r.id || idx} 
                      style={{
                        ...S.tr,
                        background: isSelected 
                          ? (isDark ? '#1e293b' : '#eff6ff') 
                          : 'transparent'
                      }}
                      onClick={() => setSelectedParticipant(r)}
                    >
                      <td style={S.td}>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontWeight: '800', 
                          color: '#2563eb',
                          background: isDark ? '#1e293b' : '#eff6ff',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          {getTicketCode(r)}
                        </span>
                      </td>

                      <td style={S.td}>
                        <div style={{ fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>
                          {getParticipantName(r)}
                        </div>
                        {r.email && (
                          <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            {r.email}
                          </div>
                        )}
                      </td>

                      <td style={S.td}>
                        <span style={{ fontWeight: '600' }}>{getEventName(r)}</span>
                        <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'capitalize' }}>
                          {getEventCategory(r)}
                        </div>
                      </td>

                      <td style={S.td}>
                        <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                          {r.college || 'CAHCET'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                          {r.department || 'CSE'}
                        </div>
                      </td>

                      <td style={S.td}>
                        <span style={{ fontWeight: '600' }}>{r.phone || 'N/A'}</span>
                      </td>

                      <td style={S.td}>
                        <span style={{ fontWeight: '700', color: '#10b981' }}>₹{getFee(r)}</span>
                      </td>

                      <td style={S.td}>
                        {isVer ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: isDark ? '#064e3b' : '#ecfdf5',
                            color: isDark ? '#6ee7b7' : '#047857'
                          }}>
                            ✓ VERIFIED
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: isDark ? '#451a03' : '#fffbeb',
                            color: isDark ? '#fcd34d' : '#b45309'
                          }}>
                            ⏳ PENDING
                          </span>
                        )}
                      </td>

                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {!isVer ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVerification(r, true);
                              }}
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                background: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <FaCheck size={12} /> Verify
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedParticipant(r);
                              }}
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                background: isDark ? '#1e293b' : '#f1f5f9',
                                color: isDark ? '#93c5fd' : '#2563eb',
                                border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              View Card
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
