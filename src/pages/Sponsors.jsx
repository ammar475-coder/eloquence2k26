import { useEffect, useRef, useState } from 'react';
import sponsors from '../data/sponsors.js';

function SponsorCard({ sponsor, tier }) {
  const [flipped, setFlipped] = useState(false);

  const handleVisit = (e) => {
    e.stopPropagation();
    window.open(sponsor.website, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`patron-card patron-card-${tier}`}
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
      <div className={`patron-card-inner ${flipped ? 'patron-flipped' : ''}`}>
        <div className="patron-face patron-front">
          <span className="patron-tag">{sponsor.tag}</span>
          <div className="patron-mark">{sponsor.initials}</div>
          <h4 className="patron-name">{sponsor.name}</h4>
          <span className="patron-flip-hint">HOVER FOR DETAILS</span>
        </div>
        <div className="patron-face patron-back">
          <h4 className="patron-back-name">{sponsor.name}</h4>
          <p className="patron-desc">{sponsor.description}</p>
          <button className="patron-location-btn" onClick={handleVisit}>
            📍 LOCATION
          </button>
        </div>
      </div>
    </div>
  );
}

function SponsorRow({ tier, label, items, direction }) {
  const loopItems = [...items, ...items];

  return (
    <div className="patron-tier">
      <div className="patron-tier-label">
        <span className={`patron-tier-badge patron-tier-${tier}`}>{label}</span>
      </div>
      <div className="patron-marquee">
        <div className="patron-marquee-fade patron-marquee-fade-left" />
        <div className="patron-marquee-fade patron-marquee-fade-right" />
        <div
          className={`patron-track ${direction === 'right' ? 'patron-track-reverse' : ''}`}
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
      className={`patrons-section ${visible ? 'patrons-visible' : ''}`}
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
