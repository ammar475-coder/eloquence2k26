import { useState, useEffect } from 'react';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

function validate(fields, event) {
  const errors = {};
  if (!fields.fullName.trim()) errors.fullName = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Please enter a valid email address.';
  if (!/^[6-9]\d{9}$/.test(fields.phone))
    errors.phone = 'Please enter a valid 10-digit mobile number.';
  if (!fields.college.trim()) errors.college = 'Please enter your college name.';
  if (!fields.department.trim()) errors.department = 'Please enter your department.';
  if (!fields.year) errors.year = 'Please select your year.';

  if (event.isTeam) {
    if (event.maxMembers > 1 && fields.teamMembers.length > 0) {
      if (!fields.teamName.trim()) errors.teamName = 'Please enter your team/squad name.';
    } else if (event.feeType === 'per_squad') {
      if (!fields.teamName.trim()) errors.teamName = 'Please enter your squad name.';
    }

    fields.teamMembers.forEach((m, i) => {
      if (!m.trim()) {
        errors[`teamMember_${i}`] = `Please enter Team Member ${i + 2}'s full name.`;
      }
    });
  }
  return errors;
}

export default function RegistrationModal({ event, isOpen, onClose }) {
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
  const [success, setSuccess] = useState(false);
  const [regCode, setRegCode] = useState('');

  useEffect(() => {
    if (isOpen && event) {
      // Default team members setup
      let defaultMembers = [];
      if (event.feeType === 'per_squad' && event.maxMembers > 1) {
        // Squad requires full team (e.g. 4 members total = 3 extra members)
        defaultMembers = Array(event.maxMembers - 1).fill('');
      }
      setFields({ ...initialFields, teamMembers: defaultMembers });
      setErrors({});
      setSuccess(false);
      setRegCode(`ELQ26-${event.category === 'technical' ? 'TCH' : 'NT'}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [isOpen, event]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const handleChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleTeamMember = (index, value) => {
    setFields((prev) => {
      const updated = [...prev.teamMembers];
      updated[index] = value;
      return { ...prev, teamMembers: updated };
    });
    setErrors((prev) => ({ ...prev, [`teamMember_${index}`]: undefined }));
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

  // Calculate total fee dynamically
  const totalParticipants = 1 + fields.teamMembers.length;
  const calculatedFee = event.feeType === 'per_squad'
    ? '₹200 (Squad Flat)'
    : `₹${totalParticipants * (event.feePerHead || 50)} (${totalParticipants} participant${totalParticipants > 1 ? 's' : ''} × ₹${event.feePerHead || 50})`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(fields, event);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {success ? (
          <div className="modal-success">
            <div className="success-icon">
              <svg viewBox="0 0 52 52" className="success-svg">
                <circle cx="26" cy="26" r="25" fill="none" stroke="#39FF88" strokeWidth="2" />
                <path fill="none" stroke="#39FF88" strokeWidth="3" d="M14 27l7 7 16-16" />
              </svg>
            </div>
            <h3 className="success-heading">REGISTRATION CONFIRMED</h3>
            <p className="success-sub">
              You are registered for <strong>{event.name}</strong>.
            </p>

            <div className="success-ticket">
              <div className="ticket-item">
                <span className="ticket-label">PASS ID</span>
                <span className="ticket-val ticket-code">{regCode}</span>
              </div>
              <div className="ticket-item">
                <span className="ticket-label">LEAD PARTICIPANT</span>
                <span className="ticket-val">{fields.fullName}</span>
              </div>
              <div className="ticket-item">
                <span className="ticket-label">COLLEGE</span>
                <span className="ticket-val">{fields.college} ({fields.department})</span>
              </div>
              {fields.teamName && (
                <div className="ticket-item">
                  <span className="ticket-label">TEAM / SQUAD</span>
                  <span className="ticket-val">{fields.teamName} ({totalParticipants} Members)</span>
                </div>
              )}
              <div className="ticket-item">
                <span className="ticket-label">ENTRY FEE PAYABLE</span>
                <span className="ticket-val ticket-fee">{calculatedFee}</span>
              </div>
            </div>

            <p className="ticket-instructions">
              Please present this Pass ID / screenshot at the registration desk on the event day.
            </p>

            <button className="btn btn-primary btn-block" onClick={onClose}>
              DONE & BACK TO ARENA
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header-tag">
              <span className={`modal-badge ${event.category === 'technical' ? 'badge-tech' : 'badge-nontech'}`}>
                {event.category === 'technical' ? 'TECHNICAL' : 'NON-TECHNICAL'}
              </span>
              <span className="modal-num-tag">EVENT #{event.number}</span>
            </div>

            <h3 className="modal-title">{event.name}</h3>
            {event.subtitle && <p className="modal-subtitle">{event.subtitle}</p>}

            <div className="modal-meta-bar">
              <div className="meta-box">
                <span className="m-label">TEAM SIZE</span>
                <span className="m-val">{event.teamSize}</span>
              </div>
              <div className="meta-box">
                <span className="m-label">ENTRY FEE</span>
                <span className="m-val highlight">{event.fee}</span>
              </div>
            </div>

            <form className="reg-form" onSubmit={handleSubmit}>
              <div className="form-section-title">// PRIMARY PARTICIPANT (LEAD)</div>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={fields.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={fields.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>WhatsApp / Mobile No *</label>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={fields.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>College / University Name *</label>
                <input
                  type="text"
                  placeholder="Your College Name"
                  value={fields.college}
                  onChange={(e) => handleChange('college', e.target.value)}
                />
                {errors.college && <span className="field-error">{errors.college}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department / Branch *</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE, IT, ECE, Mech"
                    value={fields.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                  />
                  {errors.department && (
                    <span className="field-error">{errors.department}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Year of Study *</label>
                  <select
                    value={fields.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                  >
                    <option value="">Select Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {errors.year && <span className="field-error">{errors.year}</span>}
                </div>
              </div>

              {/* Team Section for Team Events */}
              {event.isTeam && event.maxMembers > 1 && (
                <div className="team-form-section">
                  <div className="form-section-title">// SQUAD / TEAM MEMBERS ({totalParticipants} of max {event.maxMembers})</div>

                  <div className="form-group">
                    <label>Team / Squad Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. CyberKnights / ByteBandits"
                      value={fields.teamName}
                      onChange={(e) => handleChange('teamName', e.target.value)}
                    />
                    {errors.teamName && (
                      <span className="field-error">{errors.teamName}</span>
                    )}
                  </div>

                  {fields.teamMembers.map((m, i) => (
                    <div className="form-group team-member-row" key={i}>
                      <div className="team-member-header">
                        <label>Teammate #{i + 2} Full Name *</label>
                        {event.feeType !== 'per_squad' && (
                          <button
                            type="button"
                            className="btn-remove-member"
                            onClick={() => removeTeamMember(i)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={`Member ${i + 2} Full Name`}
                        value={m}
                        onChange={(e) => handleTeamMember(i, e.target.value)}
                      />
                      {errors[`teamMember_${i}`] && (
                        <span className="field-error">{errors[`teamMember_${i}`]}</span>
                      )}
                    </div>
                  ))}

                  {event.feeType !== 'per_squad' && fields.teamMembers.length + 1 < event.maxMembers && (
                    <button
                      type="button"
                      className="btn-add-member"
                      onClick={addTeamMember}
                    >
                      + ADD TEAM MEMBER ({fields.teamMembers.length + 2} of {event.maxMembers})
                    </button>
                  )}
                </div>
              )}

              {/* Fee Summary Box */}
              <div className="fee-summary-box">
                <div className="fee-calc-line">
                  <span>Calculated Registration Fee:</span>
                  <span className="total-fee-val">{calculatedFee}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-submit">
                SUBMIT REGISTRATION
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
