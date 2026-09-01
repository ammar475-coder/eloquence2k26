import { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import sponsors from '../data/sponsors.js';

function SponsorCard({ sponsor, tier }) {
  const [flipped, setFlipped] = useState(false);

  const handleVisit = (e) => {
    e.stopPropagation();
    if (sponsor.website) {
      window.open(sponsor.website, '_blank', 'noopener,noreferrer');
    }
  };

  const initials = sponsor.initials || (sponsor.name ? sponsor.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : 'SP');
  const tag = sponsor.tag || sponsor.category || 'PARTNER';

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
          <span className="sponsor-tag">{tag}</span>
          <div className="sponsor-mark">
            {sponsor.logo ? (
              <img 
                src={sponsor.logo} 
                alt={sponsor.name} 
                style={{ width: '48px', height: '48px', objectFit: 'contain' }} 
              />
            ) : (
              initials
            )}
          </div>
          <h4 className="sponsor-name">{sponsor.name}</h4>
          <span className="sponsor-flip-hint">HOVER FOR DETAILS</span>
        </div>
        <div className="sponsor-face sponsor-back">
          <h4 className="sponsor-back-name">{sponsor.name}</h4>
          <p className="sponsor-desc">
            {sponsor.description || sponsor.companyName || 'Proud partner supporting ELOQUENCE 2026.'}
          </p>
          {sponsor.website && (
            <button className="sponsor-location-btn" onClick={handleVisit}>
              <FaMapMarkerAlt style={{ marginRight: '0.35rem', verticalAlign: '-1px' }} />
              LOCATION
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SponsorRow({ tier, label, items, direction }) {
  if (!items || items.length === 0) return null;
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
    fetch('/api/sponsors')
      .then((res) => res.json())
      .then((result) => {
        if (!isMounted) return;
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const list = result.data;
          const elite = list.filter((s) => s.category === 'Title Sponsor');
          const premium = list.filter((s) => s.category === 'Gold Sponsor' || s.category === 'Silver Sponsor');
          const standard = list.filter((s) => s.category === 'Bronze Sponsor' || s.category === 'Other');

          setLiveTiers({
            elite: elite.length > 0 ? elite : list.slice(0, 4),
            premium: premium.length > 0 ? premium : list.slice(4, 9),
            standard: standard.length > 0 ? standard : list.slice(9),
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
