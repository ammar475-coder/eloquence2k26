import { useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaUsers,
  FaBolt,
  FaGamepad,
  FaPhoneAlt,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
import events from '../data/events.js';

export default function EventRulesPage({ eventId, onNavigate }) {
  const event = events.find((e) => e.id === eventId) || events[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [eventId]);

  const handleRegister = () => {
    if (onNavigate) {
      onNavigate('register', event.id);
    }
  };

  const handleBackToEvents = () => {
    if (onNavigate) {
      onNavigate('events');
    }
  };

  return (
    <div className="event-rules-page">
      <div className="event-rules-container">
        {/* Breadcrumb Navigation */}
        <div className="event-rules-breadcrumb">
          <button className="rules-back-link" onClick={handleBackToEvents}>
            <FaArrowLeft style={{ marginRight: '0.4rem', verticalAlign: '-1px' }} />
            Back to Events
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-cat">{event.category.toUpperCase()}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-active">{event.name}</span>
        </div>

        {/* 2-Column Rules Layout with In-Flow Cards */}
        <div className="event-rules-layout">
          {/* Left Column: Simple Cards for Overview, Rules, Rounds, and Coordinators */}
          <div className="event-rules-content">
            {/* Header Title Card */}
            <div className="rules-header-card">
              <div className="rules-header-top">
                <span className="rules-event-number">#{event.number}</span>
                <span className={`event-category-badge ${event.category === 'technical' ? 'badge-tech' : 'badge-nontech'}`}>
                  {event.category === 'technical' ? (
                    <>
                      <FaBolt style={{ marginRight: '0.35rem', verticalAlign: '-1px' }} />
                      TECHNICAL EVENT
                    </>
                  ) : (
                    <>
                      <FaGamepad style={{ marginRight: '0.35rem', verticalAlign: '-1px' }} />
                      NON-TECHNICAL EVENT
                    </>
                  )}
                </span>
              </div>
              <h1 className="event-rules-heading">{event.name}</h1>
              {event.alias && <p className="event-rules-alias">// {event.alias}</p>}
              <p className="event-rules-description-text">{event.description}</p>

              {/* Overview Metrics Mini-Cards */}
              <div className="overview-mini-cards-grid">
                {event.venue && (
                  <div className="overview-mini-card">
                    <span className="omc-icon">
                      <FaMapMarkerAlt style={{ color: 'var(--bright-green)' }} />
                    </span>
                    <div className="omc-body">
                      <span className="omc-label">VENUE</span>
                      <span className="omc-val">{event.venue}</span>
                    </div>
                  </div>
                )}
                {event.timing && (
                  <div className="overview-mini-card">
                    <span className="omc-icon">
                      <FaClock style={{ color: 'var(--bright-green)' }} />
                    </span>
                    <div className="omc-body">
                      <span className="omc-label">TIMING</span>
                      <span className="omc-val">{event.timing}</span>
                    </div>
                  </div>
                )}
                <div className="overview-mini-card">
                  <span className="omc-icon">
                    <FaMoneyBillWave style={{ color: 'var(--bright-green)' }} />
                  </span>
                  <div className="omc-body">
                    <span className="omc-label">REGISTRATION FEE</span>
                    <span className="omc-val fee-highlight">{event.fee}</span>
                  </div>
                </div>
                <div className="overview-mini-card">
                  <span className="omc-icon">
                    <FaUsers style={{ color: 'var(--bright-green)' }} />
                  </span>
                  <div className="omc-body">
                    <span className="omc-label">TEAM STRUCTURE</span>
                    <span className="omc-val">{event.teamSize}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Competition Rules Section - Simple Cards */}
            <div className="rules-section-block">
              <div className="rules-block-header">
                <span className="rules-section-tag">// COMPETITION GUIDELINES</span>
                <h2 className="rules-block-title">Official Event Rules</h2>
              </div>
              <div className="rules-simple-cards-grid">
                {event.rules.map((rule, idx) => (
                  <div key={idx} className="rule-simple-card">
                    <div className="rule-card-num-badge">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <p className="rule-card-text">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rounds & Progression Section - Simple Cards */}
            {event.rounds && event.rounds.length > 0 && (
              <div className="rules-section-block">
                <div className="rules-block-header">
                  <span className="rules-section-tag">// TIMELINE & FORMAT</span>
                  <h2 className="rules-block-title">Rounds & Evaluation</h2>
                </div>
                <div className="rounds-simple-cards-grid">
                  {event.rounds.map((rnd, idx) => (
                    <div key={idx} className="round-simple-card">
                      <div className="round-card-header">
                        <span className="round-card-badge">{rnd.round}</span>
                        <h3 className="round-card-title">{rnd.title}</h3>
                        <span className="round-card-duration">
                          <FaClock style={{ marginRight: '0.3rem', verticalAlign: '-1px' }} />
                          {rnd.duration}
                        </span>
                      </div>
                      <p className="round-card-desc">{rnd.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student Coordinators Contact Section - Simple Cards */}
            {event.coordinators && event.coordinators.length > 0 && (
              <div className="rules-section-block">
                <div className="rules-block-header">
                  <span className="rules-section-tag">// EVENT DESK CONTACTS</span>
                  <h2 className="rules-block-title">Student Coordinators</h2>
                </div>
                <div className="coordinators-simple-cards-grid">
                  {event.coordinators.map((c, idx) => (
                    <div key={idx} className="coord-simple-card">
                      <div className="coord-card-top">
                        <span className="coord-slot-badge">{c.slot || String(idx + 1)}</span>
                        <span className="coord-role-label">{c.role || 'Coordinator'}</span>
                      </div>
                      <h4 className="coord-card-name">{c.name}</h4>
                      <a href={`tel:${c.phone}`} className="btn-coord-call">
                        <FaPhoneAlt style={{ marginRight: '0.35rem', verticalAlign: '-1px' }} />
                        {c.displayPhone || c.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Banner */}
            <div className="rules-bottom-actions-card">
              <div className="bac-info">
                <h3 className="bac-title">Ready to Compete in {event.name}?</h3>
                <p className="bac-desc">Lock in your slot and generate your symposium entry pass.</p>
              </div>
              <div className="bac-buttons">
                <button
                  className="btn btn-primary btn-large"
                  onClick={handleRegister}
                >
                  PROCEED TO REGISTER <FaArrowRight style={{ marginLeft: '0.4rem', verticalAlign: '-1px' }} />
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleBackToEvents}
                >
                  <FaArrowLeft style={{ marginRight: '0.4rem', verticalAlign: '-1px' }} />
                  ALL EVENTS
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Static In-Flow Action Card */}
          <aside className="event-rules-sidebar">
            <div className="static-sidebar-card">
              <button
                className="btn btn-primary btn-register-cta"
                onClick={handleRegister}
              >
                REGISTER FOR {event.name} <FaArrowRight style={{ marginLeft: '0.4rem', verticalAlign: '-1px' }} />
              </button>

              <button
                className="btn btn-secondary btn-back-events"
                onClick={handleBackToEvents}
              >
                <FaArrowLeft style={{ marginRight: '0.4rem', verticalAlign: '-1px' }} />
                Back to Events
              </button>

              <div className="sidebar-quick-card">
                <div className="quick-card-badge">
                  {event.category === 'technical' ? 'TECHNICAL SHOWDOWN' : 'NON-TECHNICAL ARENA'}
                </div>
                <div className="quick-card-row">
                  <span className="qc-label">Entry Fee</span>
                  <span className="qc-val fee-highlight">{event.fee}</span>
                </div>
                <div className="quick-card-row">
                  <span className="qc-label">Format</span>
                  <span className="qc-val">{event.teamSize}</span>
                </div>
                <div className="quick-card-row">
                  <span className="qc-label">Date</span>
                  <span className="qc-val">Sept 29, 2026</span>
                </div>
                <div className="quick-card-row">
                  <span className="qc-label">Institution</span>
                  <span className="qc-val">CAHCET</span>
                </div>
                <div className="quick-card-row">
                  <span className="qc-label">Total Rounds</span>
                  <span className="qc-val">{event.rounds ? event.rounds.length : 1} Rounds</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
