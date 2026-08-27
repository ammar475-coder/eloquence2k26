import { useEffect } from 'react';
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
        {/* Breadcrumb / Back Link */}
        <div className="event-rules-breadcrumb">
          <button className="rules-back-link" onClick={handleBackToEvents}>
            ← Back to Events
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-cat">{event.category.toUpperCase()}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-active">{event.name}</span>
        </div>

        {/* 2-Column Content Layout matching reference screenshot */}
        <div className="event-rules-layout">
          {/* Left Column: Details, Overview, Rules, Contact */}
          <div className="event-rules-content">
            <h1 className="event-rules-heading">{event.name}</h1>

            {/* Overview Section */}
            <div className="rules-section-block">
              <h2 className="rules-block-title">Overview</h2>
              <div className="overview-details-list">
                {event.venue && (
                  <div className="overview-item">
                    <span className="overview-label">Venue:</span>
                    <span className="overview-value">{event.venue}</span>
                  </div>
                )}
                {event.timing && (
                  <div className="overview-item">
                    <span className="overview-label">Timing:</span>
                    <span className="overview-value">{event.timing}</span>
                  </div>
                )}
                <div className="overview-item">
                  <span className="overview-label">Registration Fee:</span>
                  <span className="overview-value fee-text">{event.fee}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Members:</span>
                  <span className="overview-value">{event.teamSize}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Description:</span>
                  <span className="overview-value">{event.description}</span>
                </div>
              </div>
            </div>

            {/* Rules Section */}
            <div className="rules-section-block">
              <h2 className="rules-block-title">Rules</h2>
              <ol className="rules-numbered-list">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="rule-numbered-item">
                    {rule}
                  </li>
                ))}
              </ol>
            </div>

            {/* Rounds Section */}
            {event.rounds && event.rounds.length > 0 && (
              <div className="rules-section-block">
                <h2 className="rules-block-title">Rounds & Timeline</h2>
                <div className="rounds-timeline-compact">
                  {event.rounds.map((rnd, idx) => (
                    <div key={idx} className="round-compact-item">
                      <div className="round-compact-header">
                        <span className="round-compact-badge">{rnd.round}</span>
                        <span className="round-compact-title">{rnd.title}</span>
                        <span className="round-compact-duration">({rnd.duration})</span>
                      </div>
                      <p className="round-compact-desc">{rnd.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Coordinators Section */}
            {event.coordinators && event.coordinators.length > 0 && (
              <div className="rules-section-block">
                <h2 className="rules-block-title">Contact</h2>
                <div className="coordinators-list">
                  {event.coordinators.map((c, idx) => (
                    <div key={idx} className="coordinator-item">
                      <div className="coord-row">
                        <span className="coord-label">Coordinator:</span>
                        <span className="coord-value">{c.name}</span>
                      </div>
                      <div className="coord-row">
                        <span className="coord-label">Phone:</span>
                        <a href={`tel:${c.phone}`} className="coord-phone-link">
                          {c.phone}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar with Register CTA */}
          <aside className="event-rules-sidebar">
            <div className="sticky-sidebar-inner">
              <button
                className="btn btn-primary btn-register-cta"
                onClick={handleRegister}
              >
                Register for {event.name} →
              </button>

              <button
                className="btn btn-secondary btn-back-events"
                onClick={handleBackToEvents}
              >
                Back to Events
              </button>

              <div className="sidebar-quick-card">
                <div className="quick-card-badge">
                  {event.category === 'technical' ? 'TECHNICAL' : 'NON-TECHNICAL'}
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
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
