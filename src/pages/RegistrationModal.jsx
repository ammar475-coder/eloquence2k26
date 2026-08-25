import { useState, useEffect } from 'react';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

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
  if (event.isTeam && event.maxMembers > 1) {
    if (!fields.teamName.trim()) errors.teamName = 'Please enter your team name.';
    fields.teamMembers.forEach((m, i) => {
      if (!m.trim()) errors[`teamMember_${i}`] = `Please enter team member ${i + 2}'s name.`;
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

  useEffect(() => {
    if (isOpen && event) {
      const memberCount = event.isTeam && event.maxMembers > 1 ? event.maxMembers - 1 : 0;
      setFields({ ...initialFields, teamMembers: Array(memberCount).fill('') });
      setErrors({});
      setSuccess(false);
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
        <button className="modal-close" onClick={onClose} aria-label="Close">
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
            <h3 className="success-heading">REGISTRATION INITIALIZED</h3>
            <p className="success-sub">
              You have been registered for <strong>{event.name}</strong>.
              Prepare for the battlefield.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              CONFIRM & CLOSE
            </button>
          </div>
        ) : (
          <>
            <h3 className="modal-title">REGISTER // {event.name}</h3>
            <p className="modal-meta">
              {event.category === 'technical' ? 'TECHNICAL' : 'NON-TECHNICAL'} •{' '}
              {event.teamSize} • FEE: {event.fee}
            </p>

            <form className="reg-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={fields.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="name@college.edu"
                  value={fields.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit phone number"
                  value={fields.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label>College / Institution *</label>
                <input
                  type="text"
                  placeholder="College Name"
                  value={fields.college}
                  onChange={(e) => handleChange('college', e.target.value)}
                />
                {errors.college && <span className="field-error">{errors.college}</span>}
              </div>

              <div className="form-group">
                <label>Department / Branch *</label>
                <input
                  type="text"
                  placeholder="e.g. CSE, ECE, Mechanical"
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

              {event.isTeam && event.maxMembers > 1 && (
                <>
                  <div className="form-group">
                    <label>Team Name *</label>
                    <input
                      type="text"
                      placeholder="Enter team name"
                      value={fields.teamName}
                      onChange={(e) => handleChange('teamName', e.target.value)}
                    />
                    {errors.teamName && (
                      <span className="field-error">{errors.teamName}</span>
                    )}
                  </div>

                  {fields.teamMembers.map((m, i) => (
                    <div className="form-group" key={i}>
                      <label>Team Member {i + 2} Name *</label>
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
                </>
              )}

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
