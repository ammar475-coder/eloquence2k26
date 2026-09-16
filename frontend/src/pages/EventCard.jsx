import { FaArrowRight } from 'react-icons/fa';
import { getEventBanner } from '../data/eventImages.js';
import { getEventSticker } from '../data/eventStickers.js';

function getEventIllustration(event) {
  const bannerSrc = getEventBanner(event);
  if (bannerSrc) {
    return (
      <div className="event-banner-img-container">
        <img
          src={bannerSrc}
          alt={event?.alias || event?.name || 'Event'}
          className="event-card-banner-img"
          loading="lazy"
          onError={(e) => {
            const fallback = getEventBanner({ ...event, image: '' });
            if (e.target.src !== fallback) {
              e.target.src = fallback;
            }
          }}
        />
      </div>
    );
  }
  return null;
}

function getEventIcon(id) {
  switch (id) {
    case 'tech-01':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
        </svg>
      );
    case 'tech-02':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      );
    case 'tech-03':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      );
    case 'tech-04':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
}

export default function EventCard({ event, onRegister, onViewRules }) {
  const handleRegister = (e) => {
    if (e) e.stopPropagation();
    if (onRegister) {
      onRegister(event.id || event);
    } else if (onViewRules) {
      onViewRules(event.id || event);
    }
  };

  const isTech = event.category === 'technical';
  const eventSticker = getEventSticker(event);

  return (
    <div className={`event-poster-card ${isTech ? 'poster-tech' : 'poster-nontech'}`}>
      {/* Top Banner Container with Poster Illustration */}
      <div className="event-card-top-banner">
        {getEventIllustration(event)}
      </div>

      {/* Bottom Content Block */}
      <div className={`event-card-bottom-content ${eventSticker ? 'has-event-sticker' : ''}`}>
        <div className="event-card-top-content-row">
          <div className="event-card-info-col">
            <div className="event-header-row">
              <span className="event-header-icon">{getEventIcon(event.id)}</span>
              <h3 className="event-card-title">{event.name}</h3>
            </div>

            <p className="event-card-desc">
              {event.subtitle || event.description}
            </p>
          </div>

          {eventSticker && (
            <div className="event-card-sticker-box" title={eventSticker.title}>
              <img
                src={eventSticker.src}
                alt={eventSticker.alt}
                className="event-name-sticker"
                style={{
                  '--sticker-scale': eventSticker.scale || 1,
                  '--sticker-origin': eventSticker.cropPosition === 'top' ? 'top center' : 'center center'
                }}
              />
            </div>
          )}
        </div>

        {/* Primary Register Action Button */}
        <div className="event-card-buttons-row">
          <button
            type="button"
            className="btn btn-primary btn-card-register btn-full-width"
            onClick={handleRegister}
          >
            REGISTER <FaArrowRight style={{ marginLeft: '0.35rem', verticalAlign: '-1px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
