import { useState, useEffect, useRef } from 'react';
import events from '../data/events.js';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

export default function RegistrationPage({ eventId, onNavigate }) {
  const currentEvent = events.find((e) => e.id === eventId) || events[0];
  const formRef = useRef(null);

  const initialFields = {
    fullName: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    teamName: '',
    teamMembers: [],
  };

  const [fields, setFields] = useState(initialFields);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let defaultMembers = [];
    if (currentEvent.feeType === 'per_squad' && currentEvent.maxMembers > 1) {
      defaultMembers = Array(currentEvent.maxMembers - 1).fill('');
    }
    setFields({ ...initialFields, teamMembers: defaultMembers });
    setErrors({});
    setIsSuccess(false);
    setTicketData(null);
  }, [eventId, currentEvent.id]);

  const calculateTotalFee = () => {
    if (currentEvent.feeType === 'per_squad') {
      return { total: 200, formula: 'Flat ₹200 for 4-Player Squad' };
    }
    const count = 1 + (fields.teamMembers ? fields.teamMembers.length : 0);
    const total = count * currentEvent.feePerHead;
    return {
      total,
      formula: `₹${currentEvent.feePerHead} × ${count} participant${count > 1 ? 's' : ''}`,
    };
  };

  const validateForm = () => {
    const errs = {};

    if (!fields.fullName.trim()) {
      errs.fullName = 'Please enter your full name.';
    } else if (fields.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.';
    }

    if (!fields.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!fields.phone.trim()) {
      errs.phone = 'Please enter your mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(fields.phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit mobile number (starts with 6-9).';
    }

    if (!fields.college.trim()) {
      errs.college = 'Please enter your college/institution name.';
    }

    if (!fields.department.trim()) {
      errs.department = 'Please enter your department/branch.';
    }

    if (!fields.year) {
      errs.year = 'Please select your year of study.';
    }

    if (currentEvent.isTeam) {
      if (currentEvent.feeType === 'per_squad' || fields.teamMembers.length > 0) {
        if (!fields.teamName.trim()) {
          errs.teamName = 'Please enter your squad/team name.';
        }
      }

      fields.teamMembers.forEach((member, idx) => {
        if (!member.trim()) {
          errs[`teamMember_${idx}`] = `Please enter Member ${idx + 2}'s full name.`;
        }
      });
    }

    return errs;
  };

  const handleChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTeamMemberChange = (index, value) => {
    setFields((prev) => {
      const updated = [...prev.teamMembers];
      updated[index] = value;
      return { ...prev, teamMembers: updated };
    });
    if (errors[`teamMember_${index}`]) {
      setErrors((prev) => ({ ...prev, [`teamMember_${index}`]: undefined }));
    }
  };

  const addTeamMember = () => {
    if (fields.teamMembers.length + 1 < currentEvent.maxMembers) {
      setFields((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, ''],
      }));
    }
  };

  const removeTeamMember = (index) => {
    setFields((prev) => {
      const updated = prev.teamMembers.filter((_, i) => i !== index);
      return { ...prev, teamMembers: updated };
    });
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`teamMember_${index}`];
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(`reg-field-${firstKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const { total } = calculateTotalFee();
      const code = `ELQ26-${currentEvent.category === 'technical' ? 'TCH' : 'NT'}-${Math.floor(10000 + Math.random() * 90000)}`;
      setTicketData({
        ticketCode: code,
        eventName: currentEvent.name,
        category: currentEvent.category,
        leadName: fields.fullName,
        college: fields.college,
        department: fields.department,
        email: fields.email,
        phone: fields.phone,
        year: fields.year,
        teamName: fields.teamName || null,
        membersCount: 1 + fields.teamMembers.length,
        teamMembersList: fields.teamMembers,
        totalFee: total,
        venue: currentEvent.venue,
        timing: currentEvent.timing,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  const handleCopyCode = () => {
    if (ticketData?.ticketCode) {
      navigator.clipboard.writeText(ticketData.ticketCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const resetForm = () => {
    let defaultMembers = [];
    if (currentEvent.feeType === 'per_squad' && currentEvent.maxMembers > 1) {
      defaultMembers = Array(currentEvent.maxMembers - 1).fill('');
    }
    setFields({ ...initialFields, teamMembers: defaultMembers });
    setErrors({});
    setIsSuccess(false);
    setTicketData(null);
  };

  const feeInfo = calculateTotalFee();

  return (
    <div className="registration-page">
      <div className="registration-page-container">
        {/* Breadcrumb Navigation */}
        <div className="registration-breadcrumb">
          <button
            className="rules-back-link"
            onClick={() => onNavigate && onNavigate('event-rules', currentEvent.id)}
          >
            ← Back to {currentEvent.name} Rules
          </button>
          <span className="breadcrumb-sep">/</span>
          <button
            className="rules-back-link"
            onClick={() => onNavigate && onNavigate('events')}
          >
            All Events
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-active">Registration Desk</span>
        </div>

        {/* Focused Event Banner */}
        <div className="direct-event-banner">
          <div className="direct-banner-left">
            <span className="direct-banner-badge">
              {currentEvent.category === 'technical' ? '⚡ TECHNICAL EVENT' : '🎮 NON-TECHNICAL EVENT'}
            </span>
            <h1 className="direct-banner-title">{currentEvent.name}</h1>
            <p className="direct-banner-desc">{currentEvent.description}</p>
          </div>
          <div className="direct-banner-right">
            <div className="direct-banner-stat">
              <span className="dstat-label">ENTRY FEE</span>
              <span className="dstat-val fee-highlight">{currentEvent.fee}</span>
            </div>
            <div className="direct-banner-stat">
              <span className="dstat-label">TEAM STRUCTURE</span>
              <span className="dstat-val">{currentEvent.teamSize}</span>
            </div>
            <button
              type="button"
              className="btn-view-rules-link"
              onClick={() => onNavigate && onNavigate('event-rules', currentEvent.id)}
            >
              📖 View Full Rules & Guidelines →
            </button>
          </div>
        </div>

        {!isSuccess ? (
          <div className="registration-card-wrapper" ref={formRef}>
            <form onSubmit={handleSubmit} noValidate className="registration-main-form">
              <div className="form-legend">
                <span>ENTER PARTICIPANT DETAILS</span>
                <span className="required-notice">* Required fields</span>
              </div>

              <div className="form-grid-2col">
                {/* Full Name */}
                <div className={`form-group ${errors.fullName ? 'form-group-error' : ''}`} id="reg-field-fullName">
                  <label className="form-label">
                    Full Name {currentEvent.isTeam ? '(Team Leader)' : ''} <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Syed Subhan"
                    value={fields.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    required
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                {/* Email */}
                <div className={`form-group ${errors.email ? 'form-group-error' : ''}`} id="reg-field-email">
                  <label className="form-label">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. subhan@example.com"
                    value={fields.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className={`form-group ${errors.phone ? 'form-group-error' : ''}`} id="reg-field-phone">
                  <label className="form-label">
                    10-Digit Mobile Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={fields.phone}
                    onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                {/* College */}
                <div className={`form-group ${errors.college ? 'form-group-error' : ''}`} id="reg-field-college">
                  <label className="form-label">
                    College / Institution <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. C. Abdul Hakeem College of Engg"
                    value={fields.college}
                    onChange={(e) => handleChange('college', e.target.value)}
                    required
                  />
                  {errors.college && <span className="error-message">{errors.college}</span>}
                </div>

                {/* Department */}
                <div className={`form-group ${errors.department ? 'form-group-error' : ''}`} id="reg-field-department">
                  <label className="form-label">
                    Department / Branch <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Science & Engineering"
                    value={fields.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    required
                  />
                  {errors.department && <span className="error-message">{errors.department}</span>}
                </div>

                {/* Year */}
                <div className={`form-group ${errors.year ? 'form-group-error' : ''}`} id="reg-field-year">
                  <label className="form-label">
                    Year of Study <span className="required-star">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={fields.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    required
                  >
                    <option value="">Select Year of Study</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {errors.year && <span className="error-message">{errors.year}</span>}
                </div>
              </div>

              {/* Team Section for Team Events */}
              {currentEvent.isTeam && (
                <div className="team-section-box">
                  <div className="team-section-header">
                    <h4 className="team-section-title">
                      👥 SQUAD / TEAM CONFIGURATION ({currentEvent.teamSize})
                    </h4>
                    <span className="team-section-note">
                      Leader is Member 1. Maximum capacity: {currentEvent.maxMembers} members.
                    </span>
                  </div>

                  {/* Team Name */}
                  <div className={`form-group ${errors.teamName ? 'form-group-error' : ''}`} id="reg-field-teamName">
                    <label className="form-label">
                      Team / Squad Name <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cyber Knights / Byte Force"
                      value={fields.teamName}
                      onChange={(e) => handleChange('teamName', e.target.value)}
                    />
                    {errors.teamName && <span className="error-message">{errors.teamName}</span>}
                  </div>

                  {/* Additional Team Members */}
                  <div className="team-members-list">
                    {fields.teamMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className={`form-group ${errors[`teamMember_${idx}`] ? 'form-group-error' : ''}`}
                        id={`reg-field-teamMember_${idx}`}
                      >
                        <div className="team-member-row-label">
                          <label className="form-label">
                            Member {idx + 2} Full Name <span className="required-star">*</span>
                          </label>
                          {currentEvent.feeType !== 'per_squad' && (
                            <button
                              type="button"
                              className="remove-member-btn"
                              onClick={() => removeTeamMember(idx)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={`Enter Team Member ${idx + 2} Full Name`}
                          value={member}
                          onChange={(e) => handleTeamMemberChange(idx, e.target.value)}
                        />
                        {errors[`teamMember_${idx}`] && (
                          <span className="error-message">{errors[`teamMember_${idx}`]}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Member button if within limits */}
                  {currentEvent.feeType !== 'per_squad' && fields.teamMembers.length + 1 < currentEvent.maxMembers && (
                    <button
                      type="button"
                      className="add-member-btn"
                      onClick={addTeamMember}
                    >
                      + ADD TEAM MEMBER (UP TO {currentEvent.maxMembers} TOTAL)
                    </button>
                  )}
                </div>
              )}

              {/* Summary Box */}
              <div className="registration-summary-box">
                <div className="summary-row">
                  <span className="summary-label">Competition:</span>
                  <span className="summary-value font-bold">{currentEvent.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Calculation:</span>
                  <span className="summary-value">{feeInfo.formula}</span>
                </div>
                <div className="summary-row summary-total-row">
                  <span className="summary-label">Total Registration Fee:</span>
                  <span className="summary-total-fee">₹{feeInfo.total}</span>
                </div>
                <p className="summary-payment-note">
                  💳 Payment can be completed at the on-site registration helpdesk via UPI / Cash upon arrival.
                </p>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-submit-registration"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'GENERATING PASS...' : `CONFIRM REGISTRATION FOR ${currentEvent.name} →`}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="registration-success-card">
            <div className="success-badge-icon">✓</div>
            <h3 className="success-card-title">REGISTRATION CONFIRMED!</h3>
            <p className="success-card-sub">
              You are officially enrolled for <strong>{ticketData.eventName}</strong> at ELOQUENCE 26.
            </p>

            <div className="ticket-pass">
              <div className="ticket-pass-header">
                <div>
                  <span className="ticket-fest-tag">ELOQUENCE 26 SYMPOSIUM PASS</span>
                  <h4 className="ticket-event-name">{ticketData.eventName}</h4>
                </div>
                <div className="ticket-code-block">
                  <span className="ticket-code-label">REGISTRATION ID</span>
                  <div className="ticket-code-value">{ticketData.ticketCode}</div>
                  <button
                    type="button"
                    className="btn-copy-code"
                    onClick={handleCopyCode}
                  >
                    {copied ? '✓ COPIED' : '📋 COPY ID'}
                  </button>
                </div>
              </div>

              <div className="ticket-pass-grid">
                <div className="ticket-info-item">
                  <span className="ticket-label">LEAD PARTICIPANT</span>
                  <span className="ticket-val">{ticketData.leadName}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="ticket-label">COLLEGE</span>
                  <span className="ticket-val">{ticketData.college}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="ticket-label">DEPARTMENT & YEAR</span>
                  <span className="ticket-val">{ticketData.department} ({ticketData.year})</span>
                </div>
                <div className="ticket-info-item">
                  <span className="ticket-label">CONTACT EMAIL & PHONE</span>
                  <span className="ticket-val">{ticketData.email} • {ticketData.phone}</span>
                </div>
                {ticketData.teamName && (
                  <div className="ticket-info-item">
                    <span className="ticket-label">TEAM / SQUAD</span>
                    <span className="ticket-val">{ticketData.teamName} ({ticketData.membersCount} Members)</span>
                  </div>
                )}
                <div className="ticket-info-item">
                  <span className="ticket-label">TOTAL PAYABLE AMOUNT</span>
                  <span className="ticket-val fee-highlight">₹{ticketData.totalFee} (On-Site Desk)</span>
                </div>
              </div>

              <div className="ticket-pass-footer">
                <span>📅 Date: September 29, 2026</span>
                <span>📍 Venue: CAHCET Campus, Melvisharam</span>
                <span>⏰ Registered: {ticketData.timestamp}</span>
              </div>
            </div>

            <div className="success-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                🖨️ PRINT / SAVE PASS
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                + REGISTER ANOTHER PARTICIPANT
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate && onNavigate('events')}
              >
                EXPLORE OTHER EVENTS →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
