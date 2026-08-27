import logoImg from '../assets/logo.png';
import events from '../data/events.js';

export default function Footer({ onNavigate }) {
  const handleNav = (page, sectionId = null) => {
    if (onNavigate) {
      onNavigate(page, sectionId);
    } else {
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const techEvents = events.filter((e) => e.category === 'technical');
  const nonTechEvents = events.filter((e) => e.category === 'non-technical');

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand Column */}
        <div className="footer-brand">
          <a
            className="footer-logo-container"
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNav('home', 'hero');
            }}
            aria-label="Return to ELOQUENCE 26 home"
          >
            <img src={logoImg} alt="ELOQUENCE 26" className="footer-logo-img" />
          </a>
          <p className="footer-tagline">THE COUNTDOWN BEGINS.</p>
          <p className="footer-desc">
            Where Ideas Collide. Skills Survive. Legends Emerge.
          </p>
        </div>

        {/* Technical Events Column */}
        <div className="footer-col">
          <h4 className="footer-heading">// TECHNICAL</h4>
          <ul className="footer-event-list">
            {techEvents.map((ev) => (
              <li key={ev.id}>
                <a
                  href="#/events"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('events');
                  }}
                >
                  {ev.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Non-Technical Events Column */}
        <div className="footer-col">
          <h4 className="footer-heading">// NON-TECHNICAL</h4>
          <ul className="footer-event-list">
            {nonTechEvents.map((ev) => (
              <li key={ev.id}>
                <a
                  href="#/events"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('events');
                  }}
                >
                  {ev.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Navigation Column */}
        <div className="footer-col">
          <h4 className="footer-heading">// NAVIGATION</h4>
          <ul className="footer-nav-list">
            <li>
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('home', 'hero');
                }}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#/events"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('events');
                }}
              >
                Events
              </a>
            </li>
            <li>
              <a
                href="#why"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('home', 'why');
                }}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#final-cta"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('home', 'final-cta');
                }}
              >
                Register
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 ELOQUENCE26. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
