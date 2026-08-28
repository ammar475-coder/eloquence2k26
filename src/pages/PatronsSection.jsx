import { useEffect, useRef, useState } from 'react';
import patrons from '../data/patrons.js';

function PatronLeadCard({ patron, index }) {
  return (
    <div className="patron-lead-card" style={{ transitionDelay: `${index * 0.1}s` }}>
      <span className="patron-lead-role">{patron.role}</span>
      <div className="patron-lead-divider" />
      <div className="patron-lead-names">
        {patron.names.map((name) => (
          <p className="patron-lead-name" key={name}>
            {name}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function PatronsSection() {
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
      id="patrons"
      ref={sectionRef}
      className={`patrons-lead-section ${visible ? 'patrons-lead-visible' : ''}`}
    >
      <h2 className="section-heading">OUR PATRONS</h2>
      <p className="section-sub">With guidance and support from our leadership.</p>

      <div className="patrons-lead-grid">
        {patrons.map((patron, i) => (
          <PatronLeadCard patron={patron} index={i} key={patron.id} />
        ))}
      </div>
    </section>
  );
}
