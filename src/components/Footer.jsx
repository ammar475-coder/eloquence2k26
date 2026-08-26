import logoImg from '../assets/logo.png';

export default function Footer() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a className="footer-logo-container" href="#hero" onClick={(event) => {
            event.preventDefault();
            scrollTo('hero');
          }} aria-label="Return to ELOQUENCE 26 home">
            <img src={logoImg} alt="ELOQUENCE 26" className="footer-logo-img" />
          </a>
          <p className="footer-tagline">THE COUNTDOWN BEGINS.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#events">Events</a>
          <a href="#final-cta">Register</a>
          <a href="#why">About</a>
          <a href="#hero">Home</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>© 2026 ELOQUENCE26. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
