import logoImg from '../assets/logo.png';
import events from '../data/events.js';

export default function Footer({ onSelectEvent }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEventClick = (event) => {
    scrollTo('events');
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };

  const techEvents = events.filter((e) => e.category === 'technical');
  const nonTechEvents = events.filter((e) => e.category === 'non-technical');

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
          <p className="footer-desc">
            Where Ideas Collide. Skills Survive. Legends Emerge.
          </p>
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
