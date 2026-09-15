import { useState } from 'react';
import { FaArrowRight, FaChevronDown, FaChevronUp, FaCamera } from 'react-icons/fa';
import { getEventBanner } from '../data/eventImages.js';
import rulesData from '../data/rules.js';
import { getEventSticker } from '../data/eventStickers.js';
import VenueImageModal from '../components/VenueImageModal.jsx';

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
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);

  const handleToggleRules = (e) => {
    if (e) e.stopPropagation();
    setIsRulesOpen((prev) => !prev);
  };

  const handleFullRulesClick = (e) => {
    if (e) e.stopPropagation();
    if (onViewRules) {
      onViewRules(event.id || event);
    } else if (onRegister) {
      onRegister(event.id || event);
    }
  };

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

  const eventRules = (Array.isArray(event.rules) && event.rules.length > 0)
    ? event.rules
    : (rulesData[event.id]?.rules || [
        'Participants must report 15 minutes before scheduled time with college ID.',
        'Decision of the judging panel and event coordinators is final and binding.'
      ]);

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

        <div className="event-card-meta-list">
          <div className="meta-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
              <span className="meta-key">Venue:</span>
              <span className="meta-val" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {event.venue || 'CSE Department Labs'}
              </span>
            </div>
            <button
              type="button"
              className="event-card-venue-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowVenueModal(true);
              }}
              title={`View Venue Photo for ${event.name}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                background: (event.venueImage || event.venue_image) ? 'rgba(57, 255, 136, 0.14)' : 'rgba(255, 255, 255, 0.07)',
                color: (event.venueImage || event.venue_image) ? '#39FF88' : '#94a3b8',
                border: (event.venueImage || event.venue_image) ? '1px solid rgba(57, 255, 136, 0.35)' : '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                marginLeft: '0.5rem'
              }}
            >
              <FaCamera size={10} />
              <span>{(event.venueImage || event.venue_image) ? 'Photo' : 'Venue'}</span>
            </button>
          </div>
          <div className="meta-line">
            <span className="meta-key">Time:</span>
            <span className="meta-val">{event.timing || '10:00 AM – 1:00 PM'}</span>
          </div>
          <div className="meta-line meta-fee-row">
            <div className="meta-fee-left">
              <span className="meta-key">Fee:</span>
              <span className="meta-val fee-val-highlight">{event.fee}</span>
            </div>
            <button
              type="button"
              className={`view-rules-dropdown-trigger ${isRulesOpen ? 'active' : ''}`}
              onClick={handleToggleRules}
              aria-expanded={isRulesOpen}
              title={isRulesOpen ? 'Collapse rules' : 'Expand quick rules preview'}
            >
              {isRulesOpen ? (
                <>Rules <FaChevronUp style={{ fontSize: '0.62rem' }} /></>
              ) : (
                <>View Rules <FaChevronDown style={{ fontSize: '0.62rem' }} /></>
              )}
            </button>
          </div>

          {/* Expandable Small Rules Dropdown Drawer */}
          {isRulesOpen && (
            <div className="event-rules-dropdown-drawer">
              <div className="rules-dropdown-header">
                <span>Rules & Guidelines</span>
                <button
                  type="button"
                  className="rules-dropdown-full-link"
                  onClick={handleFullRulesClick}
                  title="Open Full Rules Page"
                >
                  Full Page →
                </button>
              </div>
              <ul className="rules-dropdown-list">
                {eventRules.slice(0, 4).map((rule, idx) => (
                  <li key={idx} className="rules-dropdown-item">
                    <span className="rules-dropdown-num">{idx + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              {eventRules.length > 4 && (
                <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    className="rules-dropdown-full-link"
                    onClick={handleFullRulesClick}
                  >
                    + {eventRules.length - 4} more rules...
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Single Primary Register Action Button (leads to rules page) */}
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

      {/* Venue Photo Modal */}
      <VenueImageModal
        isOpen={showVenueModal}
        onClose={() => setShowVenueModal(false)}
        event={event}
      />
    </div>
  );
}
