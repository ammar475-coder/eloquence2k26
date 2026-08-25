export default function EventCard({ event, onRegister }) {
  return (
    <div className="event-card">
      <div className="event-card-inner">
        <span className="event-number">{event.number}</span>
        <div className="event-category-badge">
          {event.category === 'technical' ? 'TECH' : 'NON-TECH'}
        </div>
        <h3 className="event-name">{event.name}</h3>
        <p className="event-desc">{event.description}</p>
        <div className="event-meta">
          <div className="meta-item">
            <span className="meta-label">TEAM</span>
            <span className="meta-value">{event.teamSize}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">FEE</span>
            <span className="meta-value">{event.fee}</span>
          </div>
        </div>
        <button
          className="btn btn-register"
          onClick={() => onRegister(event)}
        >
          REGISTER
        </button>
      </div>
    </div>
  );
}
