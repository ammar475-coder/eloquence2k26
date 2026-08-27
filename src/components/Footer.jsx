import logoImg from '../assets/logo.png';

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

  return (
    <footer className="footer">
      <div className="footer-inner">
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
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a
            href="#events"
            onClick={(e) => {
              e.preventDefault();
              handleNav('events');
            }}
          >
            Events
          </a>
          <a
            href="#final-cta"
            onClick={(e) => {
              e.preventDefault();
              handleNav('home', 'final-cta');
            }}
          >
            Register
          </a>
          <a
            href="#why"
            onClick={(e) => {
              e.preventDefault();
              handleNav('home', 'why');
            }}
          >
            About
          </a>
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNav('home', 'hero');
            }}
          >
            Home
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>© 2026 ELOQUENCE26. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
