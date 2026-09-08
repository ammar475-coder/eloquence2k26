import { useEffect, useRef, useState } from 'react';
import { FaGlobe, FaMapMarkerAlt, FaPhoneAlt, FaUser } from 'react-icons/fa';
import sponsors from '../data/sponsors.js';
import { getApiUrl } from '../config/api';

function SponsorCard({ sponsor, tier }) {
  const [flipped, setFlipped] = useState(false);

  const handleCardClick = (e) => {
    // If the click is inside a link or button, don't toggle flip
    if (e.target.closest('a') || e.target.closest('button')) {
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
  const hasDetails = Boolean(sponsor.contactName || sponsor.contactPhone || locationLink);
  const hasActions = Boolean(cleanPhone || locationLink || websiteLink);

  return (
    <div
      className={`sponsor-card sponsor-card-${tier}`}
      onClick={handleCardClick}
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
        <div className="sponsor-face sponsor-front">
          <span className="sponsor-tag">{tag}</span>
          <div className="sponsor-mark">
            {sponsor.logo && sponsor.logo.trim() && !sponsor.logo.trim().startsWith('/uploads/') ? (
              <img 
                src={sponsor.logo} 
                alt={sponsor.name} 
                className="sponsor-logo-img"
              />
            ) : (
              <div className="sponsor-initials-badge">
                <span className="sponsor-initials-text">
                  {sponsor.initials || (sponsor.name ? sponsor.name.slice(0, 2).toUpperCase() : 'SP')}
                </span>
              </div>
            )}
          </div>
          <h4 className="sponsor-name">{sponsor.name}</h4>
          <span className="sponsor-flip-hint">CLICK FOR DETAILS</span>
        </div>
        <div className="sponsor-face sponsor-back">
          <div className="sponsor-back-header">
            <span className="sponsor-back-tier-tag">{tag}</span>
            <h4 className="sponsor-back-name">{sponsor.name}</h4>
            {(sponsor.description || sponsor.companyName) && (
              <p className="sponsor-desc">
                {sponsor.description || sponsor.companyName}
              </p>
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
                    View on Map ↗
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
                  className="sponsor-action-icon-btn sponsor-icon-call"
                  onClick={(e) => e.stopPropagation()}
                  title={`Call ${sponsor.contactName || sponsor.name} (${sponsor.contactPhone})`}
                  aria-label={`Call ${sponsor.contactName || sponsor.name}`}
                >
                  <FaPhoneAlt />
                </a>
              )}
              {locationLink && (
                <a
                  href={locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-action-icon-btn sponsor-icon-location"
                  onClick={(e) => e.stopPropagation()}
                  title={`View ${sponsor.name} on Map`}
                  aria-label={`Location of ${sponsor.name}`}
                >
                  <FaMapMarkerAlt />
                </a>
              )}
              {websiteLink && (
                <a
                  href={websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-action-icon-btn sponsor-icon-website"
                  onClick={(e) => e.stopPropagation()}
                  title={`Visit ${sponsor.name} Website`}
                  aria-label={`Website of ${sponsor.name}`}
                >
                  <FaGlobe />
                </a>
              )}
            </div>
          )}

          <span className="sponsor-flip-hint sponsor-flip-back-hint">CLICK TO FLIP BACK</span>
        </div>
      </div>
    </div>
  );
}

function SponsorRow({ tier, label, items, direction }) {
  if (!items || items.length === 0) return null;

  // Build a base list that contains at least 8 items so the track easily spans across any screen
  const targetMin = 8;
  const repeatCount = Math.max(1, Math.ceil(targetMin / items.length));
  const baseItems = Array.from({ length: repeatCount }, () => items).flat();

  // Clone baseItems once for the seamless 50% translateX marquee loop
  const loopItems = [...baseItems, ...baseItems];

  return (
    <div className="sponsor-tier">
      <div className="sponsor-tier-label">
        <span className={`sponsor-tier-badge sponsor-tier-${tier}`}>{label}</span>
      </div>
      <div className="sponsor-marquee">
        <div className="sponsor-marquee-fade sponsor-marquee-fade-left" />
        <div className="sponsor-marquee-fade sponsor-marquee-fade-right" />
        <div
          className={`sponsor-track ${direction === 'right' ? 'sponsor-track-reverse' : ''}`}
        >
          {loopItems.map((sponsor, i) => (
            <SponsorCard key={`${sponsor.id}-${tier}-${i}`} sponsor={sponsor} tier={tier} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sponsors() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [liveTiers, setLiveTiers] = useState(null);

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
    fetch(getApiUrl('/api/sponsors'))
      .then((res) => res.json())
      .then((result) => {
        if (!isMounted) return;
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const list = result.data;
          const elite = list.filter((s) => s.category?.toLowerCase() === 'elite' || s.category === 'Title Sponsor');
          const premium = list.filter((s) => s.category?.toLowerCase() === 'premium' || s.category === 'Gold Sponsor' || s.category === 'Silver Sponsor');
          const standard = list.filter((s) => s.category?.toLowerCase() === 'standard' || s.category === 'Bronze Sponsor' || s.category === 'Other');

          setLiveTiers({
            elite: elite,
            premium: premium,
            standard: standard,
          });
        }
      })
      .catch((err) => {
        console.warn('Using static sponsors fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const tiers = liveTiers || sponsors;

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

      {tiers.elite && tiers.elite.length > 0 && (
        <SponsorRow tier="elite" label="ELITE" items={tiers.elite} direction="left" />
      )}
      {tiers.premium && tiers.premium.length > 0 && (
        <SponsorRow tier="premium" label="PREMIUM" items={tiers.premium} direction="right" />
      )}
      {tiers.standard && tiers.standard.length > 0 && (
        <SponsorRow tier="standard" label="STANDARD" items={tiers.standard} direction="left" />
      )}
    </section>
  );
}
