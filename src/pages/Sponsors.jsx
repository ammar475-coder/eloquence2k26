import { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import sponsors from '../data/sponsors.js';

function SponsorCard({ sponsor, tier }) {
  const [flipped, setFlipped] = useState(false);

  const handleVisit = (e) => {
    e.stopPropagation();
    window.open(sponsor.website, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`sponsor-card sponsor-card-${tier}`}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      aria-label={`${sponsor.name} — hover or tap to view details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div className={`sponsor-card-inner ${flipped ? 'sponsor-flipped' : ''}`}>
        <div className="sponsor-face sponsor-front">
          <span className="sponsor-tag">{sponsor.tag}</span>
          <div className="sponsor-mark">{sponsor.initials}</div>
          <h4 className="sponsor-name">{sponsor.name}</h4>
          <span className="sponsor-flip-hint">HOVER FOR DETAILS</span>
        </div>
        <div className="sponsor-face sponsor-back">
          <h4 className="sponsor-back-name">{sponsor.name}</h4>
          <p className="sponsor-desc">{sponsor.description}</p>
          <button className="sponsor-location-btn" onClick={handleVisit}>
            <FaMapMarkerAlt style={{ marginRight: '0.35rem', verticalAlign: '-1px' }} />
            LOCATION
          </button>
        </div>
      </div>
    </div>
  );
}

function SponsorRow({ tier, label, items, direction }) {
  const loopItems = [...items, ...items];

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
            <SponsorCard key={`${sponsor.id}-${i}`} sponsor={sponsor} tier={tier} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sponsors() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

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

      <SponsorRow tier="elite" label="ELITE" items={sponsors.elite} direction="left" />
      <SponsorRow tier="premium" label="PREMIUM" items={sponsors.premium} direction="right" />
      <SponsorRow tier="standard" label="STANDARD" items={sponsors.standard} direction="left" />
    </section>
  );
}
