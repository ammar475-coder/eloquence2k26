import ShaderCard from '../components/ShaderCard.jsx';

export default function EventCard({ event, onViewRules, onRegister }) {
  const handleViewRules = (e) => {
    if (e) e.stopPropagation();
    if (onViewRules) {
      onViewRules(event.id);
    }
  };

  const handleRegister = (e) => {
    if (e) e.stopPropagation();
    if (onRegister) {
      onRegister(event.id);
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
      onClick={handleViewRules}
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

        {event.highlights && event.highlights.length > 0 && (
          <div className="event-card-highlights">
            {event.highlights.slice(0, 2).map((h, i) => (
              <span key={i} className="card-highlight-tag">
                • {h}
              </span>
            ))}
          </div>
        )}

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

        <div className="event-card-actions-row">
          <button
            type="button"
            className="btn btn-secondary btn-card-rules"
            onClick={handleViewRules}
          >
            VIEW RULES
          </button>
          <button
            type="button"
            className="btn btn-primary btn-card-register"
            onClick={handleRegister}
          >
            REGISTER →
          </button>
        </div>
      </div>
    </ShaderCard>
  );
}
