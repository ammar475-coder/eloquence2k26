import logoImg from '../assets/logo.png';

export default function Footer() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo-container" onClick={() => scrollTo('hero')}>
            <img src={logoImg} alt="ELOQUENCE 26" className="footer-logo-img" />
          </div>
          <p className="footer-tagline">THE COUNTDOWN BEGINS.</p>
        </div>
        <div className="footer-links">
          <a onClick={() => scrollTo('events')}>Events</a>
          <a onClick={() => scrollTo('final-cta')}>Register</a>
          <a onClick={() => scrollTo('why')}>About</a>
          <a onClick={() => scrollTo('hero')}>Contact</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 ELOQUENCE26. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
