import { useEffect, useRef, useState } from 'react';
import {
  FaUniversity,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCalendarCheck,
  FaClock,
  FaDirections
} from 'react-icons/fa';

const VENUE_NAME = 'C. Abdul Hakeem College of Engineering and Technology';
const VENUE_ADDRESS = 'Hakeem Nagar, Melvisharam, Ranipet District, Tamil Nadu - 632509';
const MAP_QUERY = encodeURIComponent(`${VENUE_NAME}, ${VENUE_ADDRESS}`);
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

const infoItems = [
  { icon: <FaUniversity />, label: 'VENUE', value: VENUE_NAME },
  { icon: <FaMapMarkerAlt />, label: 'ADDRESS', value: VENUE_ADDRESS },
  { icon: <FaCalendarAlt />, label: 'DATE', value: '29-09-2026' },
  { icon: <FaCalendarCheck />, label: 'DAY', value: 'Tuesday' },
  { icon: <FaClock />, label: 'TIME', value: '9:30 AM' },
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
              <li className="location-info-item" key={item.label}>
                <span className="location-info-icon" style={{ color: 'var(--bright-green)', display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
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
            <FaDirections style={{ marginRight: '0.4rem', verticalAlign: '-1px' }} />
            GET DIRECTIONS
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
