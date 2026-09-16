import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaCopy,
  FaTrash,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSyncAlt,
  FaUserCheck,
  FaTimes,
  FaExternalLinkAlt,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaBuilding,
  FaRupeeSign,
  FaIdCard,
  FaBolt,
  FaGamepad,
  FaEye,
  FaBan
} from 'react-icons/fa';
import { getApiUrl } from '../config/api';

export default function RegistrationVerification({
  registrationsList = [],
  token,
  user,
  isDark = false,
  onRefresh,
  eventsList = []
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'verified' | 'flagged'
  const [eventFilter, setEventFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyUtrFilter, setOnlyUtrFilter] = useState(false);
  const [isProcessingId, setIsProcessingId] = useState(null);

  // Flag Modal State
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [targetRegForFlag, setTargetRegForFlag] = useState(null);
  const [customFlagReason, setCustomFlagReason] = useState('Payment amount not credited');

  // Details Modal State
  const [selectedReg, setSelectedReg] = useState(null);

  // View Flag Reason Modal State
  const [viewFlagModalReg, setViewFlagModalReg] = useState(null);

  // Helper to extract detailed team members from any record format
  const extractTeamMembers = (r) => {
    if (!r) return [];
    const sanitizeMember = (m, idx) => {
      if (typeof m === 'string') {
        return {
          memberNumber: idx + 2,
          fullName: m,
          name: m,
          phone: '',
          whatsapp: '',
          email: '',
          college: r.college || '',
          department: r.department || '',
          year: r.year || ''
        };
      }
      const memberName = m.fullName || m.name || m.member_name || `Member ${idx + 2}`;
      return {
        memberNumber: m.member_number || m.memberNumber || idx + 2,
        fullName: memberName,
        name: memberName,
        phone: m.phone || m.whatsapp || '',
        whatsapp: m.whatsapp || m.phone || '',
        email: m.email || '',
        college: m.college || r.college || '',
        department: m.department || r.department || '',
        year: m.year || r.year || ''
      };
    };

    if (Array.isArray(r.teamMembers) && r.teamMembers.length > 0) {
      return r.teamMembers.map(sanitizeMember);
    }
    if (Array.isArray(r.team_members) && r.team_members.length > 0) {
      return r.team_members.map(sanitizeMember);
    }
    if (typeof r.team_members === 'string' && r.team_members.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(r.team_members);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeMember);
        }
      } catch (e) {}
    }
    if (Array.isArray(r.teamMembersList) && r.teamMembersList.length > 0) {
      return r.teamMembersList.map(sanitizeMember);
    }
    if (Array.isArray(r.registration_members) && r.registration_members.length > 0) {
      return r.registration_members.map(sanitizeMember);
    }
    if (r.venue_snapshot && typeof r.venue_snapshot === 'string' && r.venue_snapshot.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(r.venue_snapshot);
        if (Array.isArray(parsed.team_members) && parsed.team_members.length > 0) {
          return parsed.team_members.map(sanitizeMember);
        }
      } catch (e) {}
    }
    return [];
  };

  // Helper to extract UTR from a registration record
  const getRegUtr = (r) => {
    return (
      r.upiUtr ||
      r.upi_utr ||
      r.transactionId ||
      r.transaction_id ||
      r.razorpayPaymentId ||
      r.razorpay_payment_id ||
      ''
    ).toString().trim();
  };

  // Helper to resolve verification status: 'verified' | 'flagged' | 'pending'
  const getVerificationStatus = (r) => {
    if (r.is_flagged || r.isFlagged || r.verification_status === 'flagged' || r.verificationStatus === 'flagged') {
      return 'flagged';
    }
    if (r.is_verified || r.isVerified || r.verification_status === 'verified' || r.verificationStatus === 'verified' || r.attendance_status === 'verified') {
      return 'verified';
    }
    return 'pending';
  };

  // Filter registrations that have UTR or are online payments
  const allUtrRegistrations = useMemo(() => {
    return registrationsList.filter((r) => {
      const utr = getRegUtr(r);
      const isOnline = (r.paymentMethod || r.payment_method || '').toUpperCase().includes('UPI') ||
        (r.paymentMethod || r.payment_method || '').toUpperCase().includes('ONLINE') ||
        (r.paymentMethod || r.payment_method || '').toUpperCase().includes('RAZORPAY');

      if (onlyUtrFilter) {
        return Boolean(utr);
      }
      return Boolean(utr) || isOnline;
    });
  }, [registrationsList, onlyUtrFilter]);

  // Compute Metrics
  const metrics = useMemo(() => {
    let total = allUtrRegistrations.length;
    let pending = 0;
    let verified = 0;
    let flagged = 0;
    let verifiedAmount = 0;
    let duplicateUtrCount = 0;

    const utrCounts = {};
    allUtrRegistrations.forEach((r) => {
      const utr = getRegUtr(r).toUpperCase();
      if (utr) {
        utrCounts[utr] = (utrCounts[utr] || 0) + 1;
      }

      const st = getVerificationStatus(r);
      if (st === 'verified') {
        verified++;
        verifiedAmount += Number(r.totalAmount || r.totalFee || r.total_fee || 0);
      } else if (st === 'flagged') {
        flagged++;
      } else {
        pending++;
      }
    });

    Object.values(utrCounts).forEach((c) => {
      if (c > 1) duplicateUtrCount += c;
    });

    return { total, pending, verified, flagged, verifiedAmount, duplicateUtrCount };
  }, [allUtrRegistrations]);

  // Apply User Filters & Search
  const filteredRegistrations = useMemo(() => {
    return allUtrRegistrations.filter((r) => {
      // 1. Status Filter
      const st = getVerificationStatus(r);
      if (statusFilter !== 'all' && st !== statusFilter) return false;

      // 2. Event Filter
      const rEventId = r.eventId || r.event_id || '';
      if (eventFilter !== 'all' && rEventId !== eventFilter) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const utr = getRegUtr(r).toLowerCase();
        const name = (r.fullName || r.full_name || r.leadName || '').toLowerCase();
        const ticket = (r.ticketCode || r.ticket_code || r.registrationId || '').toLowerCase();
        const phone = (r.phone || r.whatsapp || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        const college = (r.college || '').toLowerCase();
        const eventName = (r.eventName || '').toLowerCase();

        const match =
          utr.includes(q) ||
          name.includes(q) ||
          ticket.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          college.includes(q) ||
          eventName.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [allUtrRegistrations, statusFilter, eventFilter, searchQuery]);

  // 1-Click Copy UTR Helper
  const handleCopyUtr = (utr) => {
    if (!utr) return;
    try {
      navigator.clipboard.writeText(utr);
      toast.success(`Copied UTR: ${utr}`, { id: 'copy-utr-toast' });
    } catch (e) {
      toast.success(`UTR: ${utr}`);
    }
  };

  // Verify / Unverify Handler
  const handleVerify = async (reg, targetStatus = 'verified') => {
    const id = reg.id || reg.registrationId || reg.ticket_code || reg.ticketCode;
    setIsProcessingId(id);

    try {
      const res = await fetch(getApiUrl(`/api/admin/registrations/${encodeURIComponent(id)}/verification`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: targetStatus,
          action: targetStatus === 'verified' ? 'verify' : 'unverify',
          isVerified: targetStatus === 'verified'
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          targetStatus === 'verified'
            ? 'Registration verified & payment confirmed!'
            : 'Verification status reverted to pending.'
        );
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.message || 'Failed to update verification status');
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error('Network error updating verification status');
    } finally {
      setIsProcessingId(null);
    }
  };

  // Open Flag Modal
  const handleOpenFlagModal = (reg) => {
    setTargetRegForFlag(reg);
    setCustomFlagReason(reg.flagReason || reg.flag_reason || 'Payment amount not credited');
    setFlagModalOpen(true);
  };

  // Submit Flag
  const handleSubmitFlag = async () => {
    if (!targetRegForFlag) return;
    const id = targetRegForFlag.id || targetRegForFlag.registrationId || targetRegForFlag.ticket_code || targetRegForFlag.ticketCode;
    setIsProcessingId(id);

    try {
      const res = await fetch(getApiUrl(`/api/admin/registrations/${encodeURIComponent(id)}/verification`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'flagged',
          action: 'flag',
          flagReason: customFlagReason || 'Flagged for UTR investigation'
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Registration flagged for investigation');
        setFlagModalOpen(false);
        setTargetRegForFlag(null);
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.message || 'Failed to flag registration');
      }
    } catch (err) {
      console.error('Flagging error:', err);
      toast.error('Network error flagging registration');
    } finally {
      setIsProcessingId(null);
    }
  };

  // Unflag Handler
  const handleUnflag = async (reg) => {
    const id = reg.id || reg.registrationId || reg.ticket_code || reg.ticketCode;
    setIsProcessingId(id);

    try {
      const res = await fetch(getApiUrl(`/api/admin/registrations/${encodeURIComponent(id)}/verification`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'pending',
          action: 'unflag'
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Flag removed — status reset to pending');
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.message || 'Failed to remove flag');
      }
    } catch (err) {
      console.error('Unflag error:', err);
      toast.error('Network error removing flag');
    } finally {
      setIsProcessingId(null);
    }
  };

  // Delete Handler
  const handleDelete = async (reg) => {
    const id = reg.id || reg.registrationId || reg.ticket_code || reg.ticketCode;
    const name = reg.fullName || reg.full_name || 'this participant';
    const utr = getRegUtr(reg) || 'N/A';

    if (
      !window.confirm(
        `Are you sure you want to PERMANENTLY DELETE the registration for "${name}" (Ticket: ${reg.ticketCode || id}, UTR: ${utr})?\n\nThis will remove the record and free up the UTR number.`
      )
    ) {
      return;
    }

    setIsProcessingId(id);
    const toastId = toast.loading('Deleting registration...');

    try {
      const res = await fetch(getApiUrl(`/api/admin/registrations/${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Registration and UTR entry deleted successfully', { id: toastId });
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.message || 'Failed to delete registration', { id: toastId });
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Network error deleting registration', { id: toastId });
    } finally {
      setIsProcessingId(null);
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      toast.error('No registration records to export');
      return;
    }

    const headers = [
      'Ticket Code',
      'UTR / Ref Number',
      'Verification Status',
      'Participant Name',
      'Phone',
      'Email',
      'College',
      'Department',
      'Year',
      'Event Name',
      'Category',
      'Fee Amount (INR)',
      'Payment Method',
      'Verified At',
      'Verified By',
      'Flag Reason',
      'Submitted At'
    ];

    const rows = filteredRegistrations.map((r) => [
      `"${r.ticketCode || r.ticket_code || r.id || ''}"`,
      `"${getRegUtr(r)}"`,
      `"${getVerificationStatus(r).toUpperCase()}"`,
      `"${r.fullName || r.full_name || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.email || ''}"`,
      `"${r.college || ''}"`,
      `"${r.department || ''}"`,
      `"${r.year || ''}"`,
      `"${r.eventName || ''}"`,
      `"${r.category || r.eventCategory || ''}"`,
      Number(r.totalAmount || r.totalFee || r.total_fee || 0),
      `"${r.paymentMethod || r.payment_method || ''}"`,
      `"${r.verifiedAt || r.verified_at || ''}"`,
      `"${r.verifiedBy || r.verified_by || ''}"`,
      `"${r.flagReason || r.flag_reason || ''}"`,
      `"${r.timestamp || r.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ELOQUENCE26_UTR_Verification_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('UTR Verification CSV downloaded successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── KPI METRIC CARDS ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Total UTRs */}
        <div
          style={{
            background: isDark ? '#111827' : '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderLeft: '4px solid #3b82f6',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total UTR Entries
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a', marginTop: '0.35rem' }}>
            {metrics.total}
          </div>
          <div style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '0.2rem' }}>
            Online & UPI Registrations
          </div>
        </div>

        {/* Pending Verification */}
        <div
          style={{
            background: isDark ? '#111827' : '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderLeft: '4px solid #f59e0b',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Verification
            </span>
            <FaClock size={14} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', marginTop: '0.35rem' }}>
            {metrics.pending}
          </div>
          <div style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '0.2rem' }}>
            Awaiting bank/UTR audit
          </div>
        </div>

        {/* Verified UTRs */}
        <div
          style={{
            background: isDark ? '#111827' : '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verified UTRs
            </span>
            <FaCheckCircle size={14} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', marginTop: '0.35rem' }}>
            {metrics.verified}
          </div>
          <div style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '0.2rem' }}>
            Payment confirmed: ₹{metrics.verifiedAmount}
          </div>
        </div>

        {/* Flagged UTRs */}
        <div
          style={{
            background: isDark ? '#111827' : '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderLeft: '4px solid #ef4444',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Flagged UTRs
            </span>
            <FaExclamationTriangle size={14} style={{ color: '#ef4444' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444', marginTop: '0.35rem' }}>
            {metrics.flagged}
          </div>
          <div style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '0.2rem' }}>
            Disputed / suspicious entries
          </div>
        </div>
      </div>

      {/* ── CONTROLS & FILTER BAR ─────────────────────────────────────── */}
      <div
        style={{
          background: isDark ? '#111827' : '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                background: statusFilter === 'all' ? '#2563eb' : isDark ? '#1f2937' : '#ffffff',
                color: statusFilter === 'all' ? '#ffffff' : isDark ? '#9ca3af' : '#64748b',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              All UTRs ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                background: statusFilter === 'pending' ? '#d97706' : isDark ? '#1f2937' : '#ffffff',
                color: statusFilter === 'pending' ? '#ffffff' : isDark ? '#9ca3af' : '#64748b',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaClock size={12} />
              <span>Pending ({metrics.pending})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('verified')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                background: statusFilter === 'verified' ? '#059669' : isDark ? '#1f2937' : '#ffffff',
                color: statusFilter === 'verified' ? '#ffffff' : isDark ? '#9ca3af' : '#64748b',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaCheckCircle size={12} />
              <span>Verified ({metrics.verified})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('flagged')}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                background: statusFilter === 'flagged' ? '#dc2626' : isDark ? '#1f2937' : '#ffffff',
                color: statusFilter === 'flagged' ? '#ffffff' : isDark ? '#9ca3af' : '#64748b',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaExclamationTriangle size={12} />
              <span>Flagged ({metrics.flagged})</span>
            </button>
          </div>

          {/* Action Buttons: Export & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: isDark ? '1px solid #1e40af' : '1px solid #bfdbfe',
                background: isDark ? '#1e293b' : '#f0fdf4',
                color: '#16a34a',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Download CSV report of UTR verification list"
            >
              <FaDownload size={11} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onRefresh) onRefresh();
                toast.success('UTR records refreshed');
              }}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                background: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#9ca3af' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Refresh records"
            >
              <FaSyncAlt size={12} />
            </button>
          </div>
        </div>

        {/* Search Bar and Event Filter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Live Search */}
          <div style={{ gridColumn: 'span 2', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '14px', color: isDark ? '#6b7280' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by 12-digit UTR, participant name, ticket code (#ELQ...), phone, college, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem 0.75rem 2.5rem',
                borderRadius: '10px',
                border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                background: isDark ? '#1f2937' : '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                color: isDark ? '#f9fafb' : '#0f172a'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? '#9ca3af' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Event Filter */}
          <div>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                background: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#f9fafb' : '#0f172a',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="all">-- Filter by Event (All) --</option>
              {eventsList.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  [{evt.category?.toUpperCase()}] {evt.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── UTR TABLE CARD ─────────────────────────────────────────────── */}
      <div
        style={{
          background: isDark ? '#111827' : '#ffffff',
          borderRadius: '16px',
          border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
            background: isDark ? '#1a2234' : '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUserCheck style={{ color: '#2563eb', fontSize: '1.2rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: isDark ? '#f9fafb' : '#0f172a' }}>
              Registration UTR Verification Records
            </h3>
            <span
              style={{
                background: isDark ? '#374151' : '#e2e8f0',
                color: isDark ? '#e5e7eb' : '#475569',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: '700'
              }}
            >
              {filteredRegistrations.length} Records
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b' }}>
            Showing {filteredRegistrations.length} of {allUtrRegistrations.length} entries
          </div>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: isDark ? '#9ca3af' : '#64748b' }}>
            <FaSearch size={32} style={{ opacity: 0.35, marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0', color: isDark ? '#f9fafb' : '#0f172a' }}>No UTR records match your filter</h4>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              Try adjusting your search query, event filter, or status tab.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0' }}>
                  <th style={{ background: isDark ? '#111827' : '#ffffff', padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: isDark ? '#9ca3af' : '#64748b', letterSpacing: '0.05em' }}>
                    PARTICIPANT / CONTACT
                  </th>
                  <th style={{ background: isDark ? '#111827' : '#ffffff', padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: isDark ? '#9ca3af' : '#64748b', letterSpacing: '0.05em' }}>
                    EVENT
                  </th>
                  <th style={{ background: isDark ? '#111827' : '#ffffff', padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: isDark ? '#9ca3af' : '#64748b', letterSpacing: '0.05em' }}>
                    AMOUNT
                  </th>
                  <th style={{ background: isDark ? '#111827' : '#ffffff', padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: isDark ? '#9ca3af' : '#64748b', letterSpacing: '0.05em' }}>
                    UTR NO
                  </th>
                  <th style={{ background: isDark ? '#111827' : '#ffffff', padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: isDark ? '#9ca3af' : '#64748b', letterSpacing: '0.05em' }}>
                    STATUS
                  </th>
                  <th style={{ background: isDark ? '#111827' : '#ffffff', padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: isDark ? '#9ca3af' : '#64748b', letterSpacing: '0.05em' }}>
                    SUBMITTED AT
                  </th>
                  <th style={{ background: isDark ? '#111827' : '#ffffff', padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: isDark ? '#9ca3af' : '#64748b', letterSpacing: '0.05em', textAlign: 'center' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((r, idx) => {
                  const utr = getRegUtr(r);
                  const status = getVerificationStatus(r);
                  const isVerified = status === 'verified';
                  const isFlagged = status === 'flagged';
                  const isPending = status === 'pending';
                  const regId = r.id || r.registrationId || r.ticket_code;
                  const isBusy = isProcessingId === regId;

                  return (
                    <tr
                      key={regId || idx}
                      style={{
                        borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9',
                        background: isFlagged
                          ? isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)'
                          : isVerified
                          ? isDark ? 'rgba(16, 185, 129, 0.04)' : 'rgba(16, 185, 129, 0.02)'
                          : 'transparent'
                      }}
                    >
                      {/* 1. PARTICIPANT / CONTACT CELL */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: '700', color: isDark ? '#f9fafb' : '#0f172a', fontSize: '0.92rem' }}>
                          {r.fullName || r.full_name || r.leadName || 'Anonymous'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                          {r.phone && (
                            <a
                              href={`https://wa.me/91${r.phone.replace(/\D/g, '').slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                color: '#22c55e',
                                fontSize: '0.78rem',
                                textDecoration: 'none'
                              }}
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp size={11} /> {r.phone}
                            </a>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '2px' }}>
                          {r.college || 'CAHCET'} • {r.department || 'CSE'}
                        </div>
                      </td>

                      {/* 2. EVENT CELL */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#0f172a', fontSize: '0.88rem' }}>
                          {r.eventName || 'Symposium Event'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              color: isDark ? '#93c5fd' : '#1d4ed8',
                              background: isDark ? '#1e293b' : '#eff6ff',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              fontWeight: '700'
                            }}
                          >
                            {r.ticketCode || r.ticket_code || r.registrationId || 'TICKET'}
                          </span>
                          {(r.teamName || r.team_name || (r.membersCount && r.membersCount > 1) || (r.members_count && r.members_count > 1)) && (
                            <span style={{ fontSize: '0.72rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                              Team: {r.teamName || r.team_name || `${r.membersCount || r.members_count} Members`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. AMOUNT CELL */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981' }}>
                          ₹{Number(r.totalAmount || r.totalFee || r.total_fee || 0)}
                        </span>
                      </td>

                      {/* 4. UTR NO CELL */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {utr ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: '800',
                                fontSize: '0.92rem',
                                color: isDark ? '#fde047' : '#b45309',
                                background: isDark ? '#422006' : '#fef3c7',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                border: isDark ? '1px solid #854d0e' : '1px solid #fde68a',
                                letterSpacing: '0.04em'
                              }}
                            >
                              {utr}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyUtr(utr)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: isDark ? '#9ca3af' : '#64748b',
                                cursor: 'pointer',
                                padding: '3px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Copy UTR number"
                            >
                              <FaCopy size={12} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: isDark ? '#6b7280' : '#94a3b8', fontStyle: 'italic' }}>
                            No UTR recorded
                          </span>
                        )}
                        <div style={{ fontSize: '0.72rem', color: isDark ? '#6b7280' : '#94a3b8', marginTop: '3px' }}>
                          Method: {r.paymentMethod || r.payment_method || 'UPI_QR'}
                        </div>
                      </td>

                      {/* 5. STATUS CELL */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {isVerified && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              background: isDark ? '#064e3b' : '#ecfdf5',
                              color: isDark ? '#6ee7b7' : '#047857',
                              border: isDark ? '1px solid #047857' : '1px solid #a7f3d0'
                            }}
                          >
                            <FaCheckCircle size={11} /> VERIFIED
                          </span>
                        )}

                        {isFlagged && (
                          <div>
                            <button
                              type="button"
                              onClick={() => setViewFlagModalReg(r)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '0.28rem 0.7rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                background: isDark ? '#451a1a' : '#fef2f2',
                                color: '#ef4444',
                                border: isDark ? '1px solid #991b1b' : '1px solid #fecaca',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title="Click to view reason"
                            >
                              <FaExclamationTriangle size={11} /> FLAGGED
                            </button>
                            {(r.flagReason || r.flag_reason) && (
                              <div
                                onClick={() => setViewFlagModalReg(r)}
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#ef4444',
                                  marginTop: '4px',
                                  maxWidth: '160px',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  fontWeight: '600'
                                }}
                                title="Click to view reason"
                              >
                                Reason: {r.flagReason || r.flag_reason}
                              </div>
                            )}
                          </div>
                        )}

                        {isPending && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              background: isDark ? '#78350f' : '#fef3c7',
                              color: isDark ? '#fde68a' : '#92400e',
                              border: isDark ? '1px solid #92400e' : '1px solid #fde68a'
                            }}
                          >
                            <FaClock size={11} /> PENDING
                          </span>
                        )}
                      </td>

                      {/* 6. SUBMITTED AT CELL */}
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: isDark ? '#9ca3af' : '#64748b' }}>
                        <div>{r.timestamp || (r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : 'N/A')}</div>
                        {isVerified && (r.verifiedAt || r.verified_at) && (
                          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>
                            ✓ Verified by {r.verifiedBy || r.verified_by || 'Admin'}
                          </div>
                        )}
                        {isFlagged && (r.flaggedAt || r.flagged_at) && (
                          <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>
                            ⚠ Flagged by {r.flaggedBy || r.flagged_by || 'Admin'}
                          </div>
                        )}
                      </td>

                      {/* 7. ACTIONS CELL */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                          {/* 1. VERIFY BUTTON */}
                          {!isVerified ? (
                            <button
                              type="button"
                              onClick={() => handleVerify(r, 'verified')}
                              disabled={isBusy}
                              style={{
                                background: '#10b981',
                                border: 'none',
                                color: '#ffffff',
                                borderRadius: '6px',
                                padding: '0.42rem 0.75rem',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'background 0.2s',
                                opacity: isBusy ? 0.6 : 1
                              }}
                              title="Confirm payment & mark verified"
                            >
                              <FaCheckCircle size={11} />
                              <span>Verify</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleVerify(r, 'pending')}
                              disabled={isBusy}
                              style={{
                                background: isDark ? '#1f2937' : '#f1f5f9',
                                border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                                color: isDark ? '#9ca3af' : '#64748b',
                                borderRadius: '6px',
                                padding: '0.42rem 0.65rem',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                opacity: isBusy ? 0.6 : 1
                              }}
                              title="Reset status back to Pending"
                            >
                              <span>Unverify</span>
                            </button>
                          )}

                          {/* 2. FLAG BUTTON */}
                          {!isFlagged ? (
                            <button
                              type="button"
                              onClick={() => handleOpenFlagModal(r)}
                              disabled={isBusy}
                              style={{
                                background: isDark ? '#451a1a' : '#fef2f2',
                                border: isDark ? '1px solid #7f1d1d' : '1px solid #fecaca',
                                color: '#ef4444',
                                borderRadius: '6px',
                                padding: '0.42rem 0.75rem',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: isBusy ? 0.6 : 1
                              }}
                              title="Flag this UTR for investigation"
                            >
                              <FaExclamationTriangle size={11} />
                              <span>Flag</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUnflag(r)}
                              disabled={isBusy}
                              style={{
                                background: isDark ? '#1f2937' : '#f1f5f9',
                                border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                                color: isDark ? '#9ca3af' : '#64748b',
                                borderRadius: '6px',
                                padding: '0.42rem 0.65rem',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                opacity: isBusy ? 0.6 : 1
                              }}
                              title="Remove flag & reset to pending"
                            >
                              <span>Unflag</span>
                            </button>
                          )}

                          {/* 3. DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            disabled={isBusy}
                            style={{
                              background: 'transparent',
                              border: isDark ? '1px solid #7f1d1d' : '1px solid #fee2e2',
                              color: '#ef4444',
                              borderRadius: '6px',
                              padding: '0.42rem 0.6rem',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: isBusy ? 0.6 : 1
                            }}
                            title="Delete this registration & release UTR"
                          >
                            <FaTrash size={11} />
                          </button>

                          {/* 4. VIEW DETAILS BUTTON */}
                          <button
                            type="button"
                            onClick={() => setSelectedReg(r)}
                            style={{
                              background: 'transparent',
                              border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                              color: isDark ? '#93c5fd' : '#2563eb',
                              borderRadius: '6px',
                              padding: '0.42rem 0.6rem',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="View complete participant details"
                          >
                            <FaEye size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: FLAG REASON PROMPT ──────────────────────────────────── */}
      {flagModalOpen && targetRegForFlag && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setFlagModalOpen(false)}
        >
          <div
            style={{
              background: isDark ? '#111827' : '#ffffff',
              border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                <FaExclamationTriangle size={18} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>Flag Registration UTR</h3>
              </div>
              <button
                type="button"
                onClick={() => setFlagModalOpen(false)}
                style={{ background: 'none', border: 'none', color: isDark ? '#9ca3af' : '#64748b', cursor: 'pointer', fontSize: '1rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '0.75rem', marginBottom: '1.25rem' }}>
              Flagging <strong>{targetRegForFlag.fullName || 'Participant'}</strong> (UTR:{' '}
              <code>{getRegUtr(targetRegForFlag) || 'N/A'}</code>). Please select or specify the reason for flagging:
            </p>

            {/* Quick Reason Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
              {[
                'Payment amount not credited',
                'Invalid 12-digit UTR number',
                'Amount mismatch with entry fee',
                'Duplicate UTR submitted',
                'Fake or unreadable payment proof'
              ].map((reasonChip) => (
                <button
                  key={reasonChip}
                  type="button"
                  onClick={() => setCustomFlagReason(reasonChip)}
                  style={{
                    background: customFlagReason === reasonChip ? '#ef4444' : isDark ? '#1f2937' : '#f1f5f9',
                    color: customFlagReason === reasonChip ? '#ffffff' : isDark ? '#e5e7eb' : '#334155',
                    border: 'none',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {reasonChip}
                </button>
              ))}
            </div>

            {/* Custom Reason Textarea */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: isDark ? '#e5e7eb' : '#334155', marginBottom: '6px' }}>
                Reason Note:
              </label>
              <textarea
                value={customFlagReason}
                onChange={(e) => setCustomFlagReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                  background: isDark ? '#1f2937' : '#ffffff',
                  color: isDark ? '#f9fafb' : '#0f172a',
                  fontSize: '0.88rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setFlagModalOpen(false)}
                style={{
                  background: isDark ? '#1f2937' : '#f1f5f9',
                  border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                  color: isDark ? '#e5e7eb' : '#334155',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitFlag}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Confirm Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTRATION DETAILS ─────────────────────────────────── */}
      {selectedReg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setSelectedReg(null)}
        >
          <div
            style={{
              background: isDark ? '#111827' : '#ffffff',
              border: isDark ? '1px solid #374151' : '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a' }}>
                  Participant Details
                </h3>
                <div style={{ fontSize: '0.82rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '2px' }}>
                  Ticket: <strong>{selectedReg.ticketCode || selectedReg.ticket_code || selectedReg.id}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                style={{ background: 'none', border: 'none', color: isDark ? '#9ca3af' : '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>Full Name</div>
                  <div style={{ fontWeight: '700', color: isDark ? '#f9fafb' : '#0f172a' }}>{selectedReg.fullName || selectedReg.full_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>Event</div>
                  <div style={{ fontWeight: '700', color: isDark ? '#f9fafb' : '#0f172a' }}>{selectedReg.eventName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>Phone</div>
                  <div style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#0f172a' }}>{selectedReg.phone || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>Email</div>
                  <div style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#0f172a' }}>{selectedReg.email || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>College</div>
                  <div style={{ color: isDark ? '#f9fafb' : '#0f172a' }}>{selectedReg.college || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>Department / Year</div>
                  <div style={{ color: isDark ? '#f9fafb' : '#0f172a' }}>{selectedReg.department || 'N/A'} ({selectedReg.year || 'N/A'})</div>
                </div>
              </div>

              {/* UTR Information Highlight */}
              <div
                style={{
                  background: isDark ? '#1e293b' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                    Entered UPI UTR / Reference
                  </div>
                  <div style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '1.1rem', color: isDark ? '#fde047' : '#b45309', marginTop: '2px' }}>
                    {getRegUtr(selectedReg) || 'No UTR specified'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                    Fee Amount
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '1.25rem', color: '#10b981' }}>
                    ₹{Number(selectedReg.totalAmount || selectedReg.totalFee || selectedReg.total_fee || 0)}
                  </div>
                </div>
              </div>

              {/* Team Details (Full squad roster) */}
              {(() => {
                const members = extractTeamMembers(selectedReg);
                const hasTeam = members.length > 0 || Boolean(selectedReg.teamName || selectedReg.team_name);
                if (!hasTeam) return null;

                return (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '800', color: isDark ? '#93c5fd' : '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Squad Details: {selectedReg.teamName || selectedReg.team_name || 'Team'} ({1 + members.length} Total)
                      </div>
                      <span style={{ fontSize: '0.72rem', background: isDark ? '#1e3a8a' : '#dbeafe', color: isDark ? '#93c5fd' : '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: '700' }}>
                        {1 + members.length} Members
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* 1. Team Lead Card */}
                      <div
                        style={{
                          background: isDark ? '#1a2234' : '#f1f5f9',
                          border: isDark ? '1px solid #2563eb' : '1px solid #bfdbfe',
                          borderRadius: '10px',
                          padding: '0.75rem 1rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '800', color: isDark ? '#93c5fd' : '#2563eb', fontSize: '0.85rem' }}>1.</span>
                            <span style={{ fontWeight: '700', color: isDark ? '#f9fafb' : '#0f172a', fontSize: '0.9rem' }}>
                              {selectedReg.fullName || selectedReg.full_name}
                            </span>
                            <span style={{ fontSize: '0.68rem', background: '#2563eb', color: '#ffffff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                              Team Lead
                            </span>
                          </div>
                          {selectedReg.phone && (
                            <a
                              href={`https://wa.me/91${selectedReg.phone.replace(/\D/g, '').slice(-10)}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.78rem', textDecoration: 'none', fontWeight: '600' }}
                            >
                              <FaWhatsapp size={12} /> {selectedReg.phone}
                            </a>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          {selectedReg.email && <span>Email: {selectedReg.email}</span>}
                          {selectedReg.college && <span>College: {selectedReg.college}</span>}
                          {selectedReg.department && <span>Dept: {selectedReg.department} ({selectedReg.year || 'N/A'})</span>}
                        </div>
                      </div>

                      {/* Other Team Members */}
                      {members.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: isDark ? '#161e2e' : '#f8fafc',
                            border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '0.75rem 1rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: '800', color: isDark ? '#9ca3af' : '#64748b', fontSize: '0.85rem' }}>{idx + 2}.</span>
                              <span style={{ fontWeight: '700', color: isDark ? '#f9fafb' : '#0f172a', fontSize: '0.9rem' }}>
                                {m.fullName || m.name}
                              </span>
                              <span style={{ fontSize: '0.68rem', background: isDark ? '#374151' : '#e2e8f0', color: isDark ? '#cbd5e1' : '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                                Member
                              </span>
                            </div>
                            {m.phone && (
                              <a
                                href={`https://wa.me/91${m.phone.replace(/\D/g, '').slice(-10)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.78rem', textDecoration: 'none', fontWeight: '600' }}
                              >
                                <FaWhatsapp size={12} /> {m.phone}
                              </a>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#64748b', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {m.email && <span>Email: {m.email}</span>}
                            {m.college && <span>College: {m.college}</span>}
                            {(m.department || m.year) && (
                              <span>
                                Dept: {m.department || 'CSE'} {m.year ? `(${m.year})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: FLAGGED REGISTRATION REASON & DETAILS ───────────────── */}
      {viewFlagModalReg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setViewFlagModalReg(null)}
        >
          <div
            style={{
              background: isDark ? '#111827' : '#ffffff',
              border: isDark ? '1px solid #7f1d1d' : '1px solid #fecaca',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                <FaExclamationTriangle size={20} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Flagged Registration Reason</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewFlagModalReg(null)}
                style={{ background: 'none', border: 'none', color: isDark ? '#9ca3af' : '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              {/* Reason Highlight Card */}
              <div
                style={{
                  background: isDark ? '#451a1a' : '#fef2f2',
                  border: isDark ? '1px solid #991b1b' : '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '1.1rem'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recorded Flag Reason
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: isDark ? '#fca5a5' : '#b91c1c', marginTop: '4px' }}>
                  {viewFlagModalReg.flagReason || viewFlagModalReg.flag_reason || 'Payment amount not credited / UTR mismatch'}
                </div>
                <div style={{ fontSize: '0.78rem', color: isDark ? '#f87171' : '#dc2626', marginTop: '6px' }}>
                  {viewFlagModalReg.flaggedBy || viewFlagModalReg.flagged_by ? `Flagged by: ${viewFlagModalReg.flaggedBy || viewFlagModalReg.flagged_by}` : 'Flagged by: Admin'}
                  {viewFlagModalReg.flaggedAt || viewFlagModalReg.flagged_at ? ` • ${new Date(viewFlagModalReg.flaggedAt || viewFlagModalReg.flagged_at).toLocaleString('en-IN')}` : ''}
                </div>
              </div>

              {/* Registration Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: isDark ? '#1f2937' : '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>Participant</div>
                  <div style={{ fontWeight: '700', color: isDark ? '#f9fafb' : '#0f172a' }}>{viewFlagModalReg.fullName || viewFlagModalReg.full_name}</div>
                  {viewFlagModalReg.phone && <div style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b' }}>{viewFlagModalReg.phone}</div>}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>Ticket / Event</div>
                  <div style={{ fontWeight: '700', color: isDark ? '#93c5fd' : '#2563eb' }}>{viewFlagModalReg.ticketCode || viewFlagModalReg.ticket_code}</div>
                  <div style={{ fontSize: '0.78rem', color: isDark ? '#9ca3af' : '#64748b' }}>{viewFlagModalReg.eventName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>UTR / Reference</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: '800', color: isDark ? '#fde047' : '#b45309' }}>
                    {getRegUtr(viewFlagModalReg) || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: isDark ? '#9ca3af' : '#64748b', textTransform: 'uppercase' }}>Fee Amount</div>
                  <div style={{ fontWeight: '800', color: '#10b981' }}>
                    ₹{Number(viewFlagModalReg.totalAmount || viewFlagModalReg.totalFee || viewFlagModalReg.total_fee || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  handleUnflag(viewFlagModalReg);
                  setViewFlagModalReg(null);
                }}
                style={{
                  background: isDark ? '#1f2937' : '#f1f5f9',
                  border: isDark ? '1px solid #374151' : '1px solid #cbd5e1',
                  color: isDark ? '#e5e7eb' : '#334155',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Resolve & Reset to Pending
              </button>
              <button
                type="button"
                onClick={() => setViewFlagModalReg(null)}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
