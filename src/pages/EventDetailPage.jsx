import { useState, useEffect, useRef } from 'react';
import events from '../data/events.js';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

export default function EventDetailPage({ eventId, onNavigate }) {
  const event = events.find((e) => e.id === eventId) || events[0];
  const formRef = useRef(null);

  // Form state
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

  // Reset or initialize form when event changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let defaultMembers = [];
    if (event.feeType === 'per_squad' && event.maxMembers > 1) {
      defaultMembers = Array(event.maxMembers - 1).fill('');
    }
    setFields({ ...initialFields, teamMembers: defaultMembers });
    setErrors({});
    setIsSuccess(false);
    setTicketData(null);
  }, [eventId]);

  const calculateTotalFee = () => {
    if (event.feeType === 'per_squad') {
      return { total: 200, formula: 'Flat ₹200 for 4-Player Squad' };
    }
    const count = 1 + (fields.teamMembers ? fields.teamMembers.length : 0);
    const total = count * event.feePerHead;
    return {
      total,
      formula: `₹${event.feePerHead} × ${count} participant${count > 1 ? 's' : ''}`,
    };
  };

  const validateForm = () => {
    const errs = {};

    if (!fields.fullName.trim()) {
      errs.fullName = 'Full name is required.';
    } else if (fields.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters.';
    }

    if (!fields.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!fields.phone.trim()) {
      errs.phone = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(fields.phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit mobile number starting with 6-9.';
    }

    if (!fields.college.trim()) {
      errs.college = 'College/Institution name is required.';
    }

    if (!fields.department.trim()) {
      errs.department = 'Department/Branch is required.';
    }

    if (!fields.year) {
      errs.year = 'Please select your current year of study.';
    }

    if (event.isTeam) {
      if (event.feeType === 'per_squad' || fields.teamMembers.length > 0) {
        if (!fields.teamName.trim()) {
          errs.teamName = 'Team/Squad name is required.';
        }
      }

      fields.teamMembers.forEach((member, idx) => {
        if (!member.trim()) {
          errs[`teamMember_${idx}`] = `Member ${idx + 2} name is required.`;
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
    if (fields.teamMembers.length + 1 < event.maxMembers) {
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
      const firstErrorField = Object.keys(validationErrors)[0];
      const el = document.getElementById(`field-${firstErrorField}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    // Simulate brief secure submission
    setTimeout(() => {
      const { total } = calculateTotalFee();
      const code = `ELQ26-${event.category === 'technical' ? 'TCH' : 'NT'}-${Math.floor(10000 + Math.random() * 90000)}`;
      setTicketData({
        ticketCode: code,
        eventName: event.name,
        category: event.category,
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
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
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
    if (event.feeType === 'per_squad' && event.maxMembers > 1) {
      defaultMembers = Array(event.maxMembers - 1).fill('');
    }
    setFields({ ...initialFields, teamMembers: defaultMembers });
    setErrors({});
    setIsSuccess(false);
    setTicketData(null);
  };

  const feeInfo = calculateTotalFee();
  const otherEvents = events.filter((e) => e.id !== event.id);

  return (
    <div className="event-detail-page">
      {/* Top Banner Navigation & Breadcrumb */}
      <section className="event-detail-hero">
        <div className="event-detail-glow" />
        <div className="event-detail-hero-inner">
          <div className="events-breadcrumb">
            <button
              className="breadcrumb-back-btn"
              onClick={() => onNavigate && onNavigate('events')}
            >
              ← BACK TO ALL EVENTS
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-category">
              {event.category === 'technical' ? 'TECHNICAL' : 'NON-TECHNICAL'}
            </span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{event.name}</span>
          </div>

          <div className="event-detail-header-meta">
            <span className="event-detail-number">EVENT #{event.number}</span>
            <span className={`event-category-badge ${event.category === 'technical' ? 'badge-tech' : 'badge-nontech'}`}>
              {event.category === 'technical' ? 'TECHNICAL ARENA' : 'NON-TECHNICAL ARENA'}
            </span>
            {event.tag && <span className="event-tag-badge">{event.tag}</span>}
          </div>

          <h1 className="event-detail-title">{event.name}</h1>
          {event.subtitle && <p className="event-detail-subtitle">{event.subtitle}</p>}
          <p className="event-detail-description">{event.description}</p>

          {/* Key highlights pills */}
          {event.highlights && event.highlights.length > 0 && (
            <div className="event-highlights-row">
              {event.highlights.map((highlight, idx) => (
                <div key={idx} className="highlight-pill">
                  <span className="highlight-bullet">⚡</span>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="event-detail-stats">
            <div className="detail-stat-card">
              <span className="stat-label">TEAM STRUCTURE</span>
              <span className="stat-value">{event.teamSize}</span>
            </div>
            <div className="detail-stat-card">
              <span className="stat-label">ENTRY FEE</span>
              <span className="stat-value fee-highlight">{event.fee}</span>
            </div>
            <div className="detail-stat-card">
              <span className="stat-label">DATE & VENUE</span>
              <span className="stat-value">Sept 29, 2026 • CAHCET</span>
            </div>
            <div className="detail-stat-card">
              <span className="stat-label">PERKS & AWARDS</span>
              <span className="stat-value">Cash Prize + Trophy + Certificate</span>
            </div>
          </div>

          <div className="event-detail-cta-bar">
            <a
              href="#registration-section"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('registration-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              REGISTER FOR THIS EVENT ↓
            </a>
            <a
              href="#rules-section"
              className="btn btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('rules-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              VIEW RULES & ROUNDS ↓
            </a>
          </div>
        </div>
      </section>

      {/* Rules & Competition Guidelines Section */}
      <section id="rules-section" className="event-rules-section">
        <div className="rules-section-inner">
          <div className="section-header-row">
            <div>
              <div className="category-label">// OFFICIAL GUIDELINES</div>
              <h2 className="rules-section-heading">RULES & COMPETITION STRUCTURE</h2>
            </div>
            <span className="rules-badge">STRICT ADHERENCE REQUIRED</span>
          </div>

          {/* Rules List */}
          <div className="rules-cards-grid">
            <div className="rules-card-box">
              <h3 className="rules-card-title">
                <span className="icon-shield">🛡️</span> OFFICIAL EVENT RULES
              </h3>
              <ul className="rules-bullets-list">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="rule-item">
                    <span className="rule-num">0{idx + 1}</span>
                    <span className="rule-text">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rounds Breakdown */}
            {event.rounds && event.rounds.length > 0 && (
              <div className="rounds-card-box">
                <h3 className="rules-card-title">
                  <span className="icon-timer">⏱️</span> ROUNDS & TIMELINES
                </h3>
                <div className="rounds-timeline">
                  {event.rounds.map((rnd, idx) => (
                    <div key={idx} className="round-timeline-step">
                      <div className="round-step-header">
                        <span className="round-badge">{rnd.round}</span>
                        <span className="round-duration">{rnd.duration}</span>
                      </div>
                      <h4 className="round-step-title">{rnd.title}</h4>
                      <p className="round-step-desc">{rnd.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guidelines notes */}
          {event.guidelines && event.guidelines.length > 0 && (
            <div className="event-guidelines-callout">
              <h4 className="guidelines-callout-title">⚠️ IMPORTANT INSTRUCTIONS</h4>
              <ul className="guidelines-callout-list">
                {event.guidelines.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* On-Page Integrated Registration Form */}
      <section id="registration-section" ref={formRef} className="event-registration-section">
        <div className="registration-section-inner">
          <div className="section-header-row">
            <div>
              <div className="category-label">// REGISTRATION DESK</div>
              <h2 className="registration-section-heading">
                REGISTER FOR <span className="text-glow">{event.name}</span>
              </h2>
            </div>
            <div className="fee-badge-pill">
              Entry: <strong>{event.fee}</strong>
            </div>
          </div>

          {!isSuccess ? (
            <div className="registration-form-wrapper">
              <form onSubmit={handleSubmit} noValidate className="registration-form">
                <div className="form-legend">
                  <span>ENTER PARTICIPANT DETAILS</span>
                  <span className="required-notice">* Required fields</span>
                </div>

                <div className="form-grid-2col">
                  {/* Full Name */}
                  <div className={`form-group ${errors.fullName ? 'form-group-error' : ''}`} id="field-fullName">
                    <label className="form-label">
                      Full Name (Team Leader / Participant) <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                      value={fields.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      required
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>

                  {/* Email */}
                  <div className={`form-group ${errors.email ? 'form-group-error' : ''}`} id="field-email">
                    <label className="form-label">
                      Email Address <span className="required-star">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. rahul@example.com"
                      value={fields.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div className={`form-group ${errors.phone ? 'form-group-error' : ''}`} id="field-phone">
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
                  <div className={`form-group ${errors.college ? 'form-group-error' : ''}`} id="field-college">
                    <label className="form-label">
                      College / Institution Name <span className="required-star">*</span>
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
                  <div className={`form-group ${errors.department ? 'form-group-error' : ''}`} id="field-department">
                    <label className="form-label">
                      Department / Major <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. B.E. Computer Science & Engg"
                      value={fields.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      required
                    />
                    {errors.department && <span className="error-message">{errors.department}</span>}
                  </div>

                  {/* Year */}
                  <div className={`form-group ${errors.year ? 'form-group-error' : ''}`} id="field-year">
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

                {/* Team Fields for Team Events */}
                {event.isTeam && (
                  <div className="team-section-box">
                    <div className="team-section-header">
                      <h4 className="team-section-title">
                        👥 SQUAD / TEAM CONFIGURATION ({event.teamSize})
                      </h4>
                      <span className="team-section-note">
                        Leader counts as Member 1. Max team size: {event.maxMembers}.
                      </span>
                    </div>

                    {/* Team Name */}
                    <div className={`form-group ${errors.teamName ? 'form-group-error' : ''}`} id="field-teamName">
                      <label className="form-label">
                        Team / Squad Name <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. CyberKnights / ByteForce"
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
                          id={`field-teamMember_${idx}`}
                        >
                          <div className="team-member-row-label">
                            <label className="form-label">
                              Member {idx + 2} Full Name <span className="required-star">*</span>
                            </label>
                            {event.feeType !== 'per_squad' && (
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
                            placeholder={`Enter Team Member ${idx + 2} name`}
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
                    {event.feeType !== 'per_squad' && fields.teamMembers.length + 1 < event.maxMembers && (
                      <button
                        type="button"
                        className="add-member-btn"
                        onClick={addTeamMember}
                      >
                        + ADD TEAM MEMBER (UP TO {event.maxMembers} TOTAL)
                      </button>
                    )}
                  </div>
                )}

                {/* Summary & Fee Calculation */}
                <div className="registration-summary-box">
                  <div className="summary-row">
                    <span className="summary-label">Selected Event:</span>
                    <span className="summary-value font-bold">{event.name} ({event.category.toUpperCase()})</span>
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

                {/* Action Buttons */}
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-submit-registration"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="loading-spinner">CONFIRMING REGISTRATION...</span>
                    ) : (
                      <>CONFIRM & COMPLETE REGISTRATION →</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Success Ticket Screen */
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
                    <span className="ticket-label">PAYABLE AMOUNT</span>
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
      </section>

      {/* Explore Other Events Showcase */}
      <section className="other-events-section">
        <div className="other-events-inner">
          <div className="section-header-row">
            <div>
              <div className="category-label">// MORE CHALLENGES</div>
              <h3 className="other-events-heading">EXPLORE MORE COMPETITIONS</h3>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate && onNavigate('events')}
            >
              VIEW ALL (12) →
            </button>
          </div>

          <div className="other-events-grid">
            {otherEvents.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className="other-event-mini-card"
                onClick={() => onNavigate && onNavigate('event-detail', evt.id)}
              >
                <div className="mini-card-top">
                  <span className="mini-card-num">#{evt.number}</span>
                  <span className={`mini-card-cat ${evt.category === 'technical' ? 'badge-tech' : 'badge-nontech'}`}>
                    {evt.category === 'technical' ? 'TECH' : 'NON-TECH'}
                  </span>
                </div>
                <h4 className="mini-card-title">{evt.name}</h4>
                <p className="mini-card-sub">{evt.subtitle || evt.description}</p>
                <div className="mini-card-footer">
                  <span className="mini-card-fee">{evt.fee}</span>
                  <span className="mini-card-link">VIEW & REGISTER →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
