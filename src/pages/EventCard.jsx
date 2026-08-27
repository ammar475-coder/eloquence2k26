import { useState } from 'react';

export default function EventCard({ event, onRegister }) {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="event-card">
      <div className="event-card-inner">
        <div className="event-card-top">
          <span className="event-number">{event.number}</span>
          <div className="event-badges-row">
            {event.tag && <span className="event-tag-badge">{event.tag}</span>}
            <div className={`event-category-badge ${event.category === 'technical' ? 'badge-tech' : 'badge-nontech'}`}>
              {event.category === 'technical' ? 'TECH' : 'NON-TECH'}
            </div>
          </div>
        </div>

        <h3 className="event-name">{event.name}</h3>
        {event.subtitle && <p className="event-subtitle">{event.subtitle}</p>}
        <p className="event-desc">{event.description}</p>

        <div className="event-meta">
          <div className="meta-item">
            <span className="meta-label">TEAM STRUCTURE</span>
            <span className="meta-value">{event.teamSize}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">ENTRY FEE</span>
            <span className="meta-value fee-highlight">{event.fee}</span>
          </div>
        </div>

        {event.rules && event.rules.length > 0 && (
          <div className="event-rules-container">
            <button
              type="button"
              className="event-rules-toggle"
              onClick={() => setShowRules(!showRules)}
            >
              <span>{showRules ? '▾ HIDE GUIDELINES' : '▸ VIEW GUIDELINES & RULES'}</span>
            </button>
            {showRules && (
              <ul className="event-rules-list">
                {event.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button
          className="btn btn-register"
          onClick={() => onRegister(event)}
        >
          REGISTER NOW
        </button>
      </div>
    </div>
  );
}
