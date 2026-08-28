import { useEffect, useRef, useState } from 'react';

const VENUE_NAME = 'C. Abdul Hakeem College of Engineering and Technology';
const VENUE_ADDRESS = 'Hakeem Nagar, Melvisharam, Ranipet District, Tamil Nadu - 632509';
const MAP_QUERY = encodeURIComponent(`${VENUE_NAME}, ${VENUE_ADDRESS}`);
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

const infoItems = [
  {
    key: 'venue',
    label: 'VENUE',
    value: VENUE_NAME,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon-svg">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </svg>
    ),
  },
  {
    key: 'address',
    label: 'ADDRESS',
    value: VENUE_ADDRESS,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon-svg">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    key: 'date',
    label: 'DATE',
    value: '29-09-2026',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon-svg">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
  },
  {
    key: 'day',
    label: 'DAY',
    value: 'Tuesday',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon-svg">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
        <path d="M16 18h.01" />
      </svg>
    ),
  },
  {
    key: 'time',
    label: 'TIME',
    value: '9:30 AM',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39FF88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="location-icon-svg">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function LocationMap() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="location"
      ref={sectionRef}
      className={`location-section ${visible ? 'location-visible' : ''}`}
    >
      <h2 className="section-heading">FIND US</h2>
      <p className="section-sub">
        Navigate to the battlefield. Here&apos;s exactly where ELOQUENCE26 unfolds.
      </p>

      <div className="location-grid">
        <div className="location-info-card">
          <ul className="location-info-list">
            {infoItems.map((item) => (
              <li className="location-info-item" key={item.key}>
                <span className="location-info-icon">{item.icon}</span>
                <div>
                  <span className="location-info-label">{item.label}</span>
                  <p className="location-info-value">{item.value}</p>
                </div>
              </li>
            ))}
          </ul>
          <a
            className="btn btn-primary location-directions-btn"
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            GET DIRECTIONS →
          </a>
        </div>

        <div className="location-map-frame">
          <iframe
            title="ELOQUENCE26 venue map"
            src={MAP_EMBED_SRC}
            className="location-map-iframe"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
