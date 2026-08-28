import { useState } from 'react';
import ShaderCard from '../components/ShaderCard.jsx';

export default function EventCard({ event, onRegister, onViewRules }) {
  const [showRules, setShowRules] = useState(false);

  const handleRegister = (e) => {
    if (e) e.stopPropagation();
    if (onRegister) {
      onRegister(event);
    }
  };

  const handleViewRules = (e) => {
    if (e) e.stopPropagation();
    if (onViewRules) {
      onViewRules(event);
    } else {
      setShowRules((prev) => !prev);
    }
  };

  const isTech = event.category === 'technical';
  const color1 = isTech ? '#00a83b' : '#0066cc';
  const color2 = isTech ? '#39ff88' : '#00f0ff';
  const color3 = isTech ? '#050a07' : '#040914';

  return (
    <ShaderCard
      color1={color1}
      color2={color2}
      color3={color3}
      className="event-card"
    >
      <div className="event-card-inner">
        <div className="event-card-top">
          <span className="event-number">#{event.number}</span>
          <div className="event-badges-row">
            {event.tag && <span className="event-tag-badge">{event.tag}</span>}
            <div className={`event-category-badge ${isTech ? 'badge-tech' : 'badge-nontech'}`}>
              {isTech ? 'TECH' : 'NON-TECH'}
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
              onClick={handleViewRules}
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
          type="button"
          className="btn btn-register"
          onClick={handleRegister}
        >
          REGISTER NOW →
        </button>
      </div>
    </ShaderCard>
  );
}
