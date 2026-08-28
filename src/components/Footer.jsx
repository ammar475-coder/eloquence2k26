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
        {/* Col 1: Brand */}
        <div className="footer-brand">
          <a
            className="footer-logo-container"
            href="#hero"
            onClick={(event) => {
              event.preventDefault();
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

        {/* Col 2: Technical Events */}
        <div className="footer-col">
          <h4 className="footer-heading"> TECHNICAL</h4>
          <ul className="footer-event-list">
            {techEvents.map((event) => (
              <li key={event.id}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('events');
                  }}
                >
                  {event.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Non-Technical Events */}
        <div className="footer-col">
          <h4 className="footer-heading"> NON-TECHNICAL</h4>
          <ul className="footer-event-list">
            {nonTechEvents.map((event) => (
              <li key={event.id}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('events');
                  }}
                >
                  {event.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Quick Navigation */}
        <div className="footer-col">
          <h4 className="footer-heading"> NAVIGATION</h4>
          <ul className="footer-nav-list">
            <li>
              <a
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
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('events');
                }}
              >
                All Events
              </a>
            </li>
            <li>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('home', 'why');
                }}
              >
                About Fest
              </a>
            </li>
            <li>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('home', 'patrons');
                }}
              >
                Patrons
              </a>
            </li>
            <li>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('home', 'location');
                }}
              >
                Location
              </a>
            </li>
            <li>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('events');
                }}
              >
                Register Now
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
