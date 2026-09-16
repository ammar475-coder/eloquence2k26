import { useEffect, useRef, useState } from 'react';
import { FaGlobe, FaMapMarkerAlt, FaPhoneAlt, FaUser, FaExternalLinkAlt, FaRedoAlt } from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import { getCachedSponsors, fetchSponsorsData, groupSponsorsByTier } from '../services/api.js';
import ScrollableMarquee from '../components/ScrollableMarquee.jsx';

function SponsorCard({ sponsor, tier }) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const lastTouchTime = useRef(0);

  // Auto flip back to front when user clicks anywhere outside this card
  useEffect(() => {
    if (!flipped) return;

    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setFlipped(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [flipped]);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length !== 1) return;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartPos.current.x);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartPos.current.y);

    // If moved less than 12px, this is a clean tap
    if (dx < 12 && dy < 12) {
      if (e.target.closest('a') || e.target.closest('button.sponsor-action-pill-btn')) {
        return;
      }
      lastTouchTime.current = Date.now();
      setFlipped((f) => !f);
    }
  };

  const handleCardClick = (e) => {
    // If touched recently (within 500ms), ignore synthesized click to prevent double-toggling
    if (Date.now() - lastTouchTime.current < 500) {
      return;
    }
    // If the click is inside an interactive action button, don't toggle flip
    if (e.target.closest('a') || e.target.closest('button.sponsor-action-pill-btn')) {
      return;
    }
    setFlipped((f) => !f);
  };

  const tag = sponsor.tag || sponsor.category || 'PARTNER';
  const hasContact = Boolean(sponsor.contactName || sponsor.contactPhone);
  const cleanPhone = sponsor.contactPhone ? String(sponsor.contactPhone).replace(/[^0-9+]/g, '') : '';

  const rawLocation = sponsor.locationUrl || sponsor.location_url || (sponsor.website && /maps|goo\.gl/i.test(sponsor.website) ? sponsor.website : '');
  const locationLink = rawLocation
    ? (rawLocation.startsWith('http') ? rawLocation : `https://${rawLocation}`)
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sponsor.name + ' ' + (sponsor.companyName || 'Vellore'))}`;

  const rawWebsite = sponsor.website && (!rawLocation || sponsor.website !== rawLocation) && !/maps|goo\.gl/i.test(sponsor.website) ? sponsor.website : '';
  const websiteLink = rawWebsite ? (rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`) : '';
  const hasDetails = Boolean(sponsor.contactName || sponsor.contactPhone || locationLink || websiteLink);
  const hasActions = Boolean(cleanPhone || locationLink || websiteLink);

  const resolveLogo = (logo) => {
    if (!logo || typeof logo !== 'string' || !logo.trim()) return null;
    const trimmed = logo.trim();
    if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/sponsors/')) {
      return trimmed;
    }
    if (trimmed.startsWith('/uploads/')) {
      return getApiUrl(trimmed);
    }
    return trimmed;
  };
  const logoSrc = resolveLogo(sponsor.logo);
  const hasLogo = Boolean(logoSrc);

  const websiteDisplay = websiteLink ? websiteLink.replace(/^https?:\/\//i, '').replace(/\/$/, '') : '';

  return (
    <div
      ref={cardRef}
      className={`sponsor-card sponsor-card-${tier} ${flipped ? 'card-is-flipped' : ''}`}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label={`${sponsor.name} — click or tap to view contact details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div className={`sponsor-card-inner ${flipped ? 'sponsor-flipped' : ''}`}>
        {/* Front Face: Premium Photo + Identity */}
        <div className={`sponsor-face sponsor-front ${hasLogo ? 'has-sponsor-photo' : 'no-sponsor-photo'}`}>
          <span className="sponsor-tag">{tag}</span>
          <div className="sponsor-mark">
            {hasLogo ? (
              <img 
                src={logoSrc} 
                alt={sponsor.name} 
                className="sponsor-logo-img"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.parentElement) {
                    e.target.parentElement.classList.add('sponsor-mark-fallback');
                  }
                }}
              />
            ) : (
              <div className="sponsor-initials-badge">
                <span className="sponsor-initials-text">
                  {sponsor.initials || (sponsor.name ? sponsor.name.slice(0, 2).toUpperCase() : 'SP')}
                </span>
              </div>
            )}
          </div>
          <div className="sponsor-front-bottom">
            <h4 className="sponsor-name">{sponsor.name}</h4>
            {(sponsor.description || (sponsor.companyName && sponsor.companyName !== sponsor.name ? sponsor.companyName : null)) && (
              <p
                className="sponsor-front-desc"
                title={sponsor.description || sponsor.companyName}
              >
                {sponsor.description || sponsor.companyName}
              </p>
            )}
            <span className="sponsor-flip-hint">
              CLICK / TAP FOR DETAILS <FaRedoAlt size={9} style={{ marginLeft: '0.25rem' }} />
            </span>
          </div>
        </div>

        {/* Back Face: Contact Details Box + Action Buttons (Description moved to front) */}
        <div className="sponsor-face sponsor-back">
          <div className="sponsor-back-header">
            <span className="sponsor-back-tier-tag">{tag}</span>
            <h4 className="sponsor-back-name">{sponsor.name}</h4>
            {sponsor.companyName && sponsor.companyName !== sponsor.name && (
              <span className="sponsor-back-company">{sponsor.companyName}</span>
            )}
          </div>

          {hasDetails && (
            <div className="sponsor-contact-box">
              {sponsor.contactName && (
                <div className="sponsor-contact-row">
                  <span className="sponsor-contact-label">
                    <FaUser className="sponsor-contact-icon" /> CONTACT
                  </span>
                  <span className="sponsor-contact-val">{sponsor.contactName}</span>
                </div>
              )}
              {sponsor.contactPhone && (
                <div className="sponsor-contact-row">
                  <span className="sponsor-contact-label">
                    <FaPhoneAlt className="sponsor-contact-icon" /> MOBILE
                  </span>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="sponsor-contact-phone-link"
                    onClick={(e) => e.stopPropagation()}
                    title={`Call ${sponsor.contactName || sponsor.name} (${sponsor.contactPhone})`}
                  >
                    {sponsor.contactPhone}
                  </a>
                </div>
              )}
              {websiteLink && (
                <div className="sponsor-contact-row">
                  <span className="sponsor-contact-label">
                    <FaGlobe className="sponsor-contact-icon" /> WEBSITE
                  </span>
                  <a
                    href={websiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sponsor-contact-location-link sponsor-contact-web-link"
                    onClick={(e) => e.stopPropagation()}
                    title={`Visit ${sponsor.name} official website (${websiteLink})`}
                  >
                    {websiteDisplay} <FaExternalLinkAlt size={9} style={{ marginLeft: '0.2rem' }} />
                  </a>
                </div>
              )}
              {locationLink && (
                <div className="sponsor-contact-row">
                  <span className="sponsor-contact-label">
                    <FaMapMarkerAlt className="sponsor-contact-icon" /> LOCATION
                  </span>
                  <a
                    href={locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sponsor-contact-location-link"
                    onClick={(e) => e.stopPropagation()}
                    title={`Open ${sponsor.name} in Google Maps`}
                  >
                    View on Map <FaExternalLinkAlt size={9} style={{ marginLeft: '0.2rem' }} />
                  </a>
                </div>
              )}
            </div>
          )}

          {hasActions && (
            <div className="sponsor-back-actions">
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="sponsor-action-pill-btn sponsor-btn-call"
                  onClick={(e) => e.stopPropagation()}
                  title={`Call ${sponsor.contactName || sponsor.name} (${sponsor.contactPhone})`}
                  aria-label={`Call ${sponsor.contactName || sponsor.name}`}
                >
                  <FaPhoneAlt size={12} />
                  <span>Call</span>
                </a>
              )}
              {websiteLink && (
                <a
                  href={websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-action-pill-btn sponsor-btn-website"
                  onClick={(e) => e.stopPropagation()}
                  title={`Visit ${sponsor.name} Website (${websiteLink})`}
                  aria-label={`Website of ${sponsor.name}`}
                >
                  <FaGlobe size={12} />
                  <span>Website <FaExternalLinkAlt size={8} style={{ marginLeft: '0.2rem' }} /></span>
                </a>
              )}
              {locationLink && (
                <a
                  href={locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-action-pill-btn sponsor-btn-map"
                  onClick={(e) => e.stopPropagation()}
                  title={`View ${sponsor.name} on Map`}
                  aria-label={`Location of ${sponsor.name}`}
                >
                  <FaMapMarkerAlt size={12} />
                  <span>Map <FaExternalLinkAlt size={8} style={{ marginLeft: '0.2rem' }} /></span>
                </a>
              )}
            </div>
          )}

          <button
            type="button"
            className="sponsor-flip-hint sponsor-flip-back-hint"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            title="Return to front view"
          >
            CLICK TO FLIP BACK <FaRedoAlt size={9} style={{ marginLeft: '0.25rem' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SponsorRow({ tier, label, items, direction }) {
  if (!items || items.length === 0) return null;

  // Build 3 sets of items for seamless infinite bidirectional scrolling and wrapping
  const targetMin = 6;
  const repeatCount = Math.max(1, Math.ceil(targetMin / items.length));
  const baseItems = Array.from({ length: repeatCount }, () => items).flat();
  const loopItems = [...baseItems, ...baseItems, ...baseItems];

  return (
    <div className="sponsor-tier">
      <div className="sponsor-tier-label">
        <span className={`sponsor-tier-badge sponsor-tier-${tier}`}>{label}</span>
      </div>
      <div className="sponsor-marquee">
        <div className="sponsor-marquee-fade sponsor-marquee-fade-left" />
        <div className="sponsor-marquee-fade sponsor-marquee-fade-right" />
        <ScrollableMarquee speed={62} direction={direction} baseCount={baseItems.length}>
          <div
            className={`sponsor-track ${direction === 'right' ? 'sponsor-track-reverse' : ''}`}
          >
            {loopItems.map((sponsor, i) => (
              <SponsorCard key={`${sponsor.id}-${tier}-${i}`} sponsor={sponsor} tier={tier} />
            ))}
          </div>
        </ScrollableMarquee>
      </div>
    </div>
  );
}

export default function Sponsors() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  
  const initialCached = getCachedSponsors();
  const [tiers, setTiers] = useState(() => initialCached ? groupSponsorsByTier(initialCached) : null);
  const [loading, setLoading] = useState(() => !initialCached);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchSponsorsData()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) {
          setTiers(groupSponsorsByTier(data));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load sponsors:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hasSponsors = tiers && (
    (tiers.elite && tiers.elite.length > 0) ||
    (tiers.premium && tiers.premium.length > 0) ||
    (tiers.standard && tiers.standard.length > 0)
  );

  return (
    <section
      id="sponsors"
      ref={sectionRef}
      className={`sponsors-section ${visible ? 'sponsors-visible' : ''}`}
    >
      <h2 className="section-heading">SPONSORS</h2>
      <p className="section-sub">
        The powerhouses fueling ELOQUENCE26 — hover over any card to know them better.
      </p>

      {loading && !hasSponsors ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '160px' }}>
          <div className="radar-loader-spinner" style={{ width: '38px', height: '38px', border: '3px solid rgba(57, 255, 136, 0.15)', borderTopColor: '#39FF88', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : hasSponsors ? (
        <>
          {tiers.elite && tiers.elite.length > 0 && (
            <SponsorRow tier="elite" label="ELITE" items={tiers.elite} direction="left" />
          )}
          {tiers.premium && tiers.premium.length > 0 && (
            <SponsorRow tier="premium" label="PREMIUM" items={tiers.premium} direction="right" />
          )}
          {tiers.standard && tiers.standard.length > 0 && (
            <SponsorRow tier="standard" label="STANDARD" items={tiers.standard} direction="left" />
          )}
        </>
      ) : null}
    </section>
  );
}
