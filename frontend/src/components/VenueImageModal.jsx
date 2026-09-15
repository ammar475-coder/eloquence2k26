import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaCamera, FaMapMarkerAlt, FaExpandAlt, FaBuilding } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function VenueImageModal({ isOpen, onClose, event }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const venueName = event?.venue || 'Designated Campus Venue';
  const venuePhoto = event?.venueImage || event?.venue_image;
  const eventName = event?.name || 'Symposium Event';

  return createPortal(
    <AnimatePresence>
      <div
        className="venue-modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-modal-title"
      >
        <motion.div
          className="venue-modal-card venue-image-modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <button
            type="button"
            className="venue-modal-close-btn"
            onClick={onClose}
            aria-label="Close venue photo"
            title="Close (Esc)"
          >
            <FaTimes />
          </button>

          <div className="venue-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="venue-modal-badge">
                <FaCamera style={{ marginRight: '0.35rem' }} /> VENUE PHOTO
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                background: 'rgba(57, 255, 136, 0.1)',
                color: '#39FF88',
                border: '1px solid rgba(57, 255, 136, 0.25)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {eventName}
              </span>
            </div>
            <h2 id="venue-modal-title" className="venue-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaMapMarkerAlt style={{ color: '#39FF88', fontSize: '1.2rem', flexShrink: 0 }} />
              {venueName}
            </h2>
            <p className="venue-modal-college-name">
              C. Abdul Hakeem College of Engineering & Technology • Melvisharam
            </p>
          </div>

          {venuePhoto ? (
            <div className="venue-single-photo-wrap" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
              <img
                src={venuePhoto}
                alt={venueName}
                className="venue-single-photo-img"
                style={{
                  width: '100%',
                  maxHeight: '440px',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '12px',
                  border: '1px solid rgba(57, 255, 136, 0.25)'
                }}
              />
              <div className="venue-single-photo-caption">
                <span className="venue-photo-badge">OFFICIAL VENUE</span>
                <span className="venue-photo-name">{venueName}</span>
              </div>
            </div>
          ) : (
            <div className="venue-no-photo-box">
              <div className="venue-no-photo-icon-ring">
                <FaCamera className="venue-no-photo-icon" />
              </div>
              <h4 className="venue-no-photo-title">Venue Photo Coming Soon</h4>
              <p className="venue-no-photo-text">
                The event coordinator has not uploaded a photo for <strong>{venueName}</strong> yet. Event coordinators can upload and update hall photos anytime directly in their dashboard.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
