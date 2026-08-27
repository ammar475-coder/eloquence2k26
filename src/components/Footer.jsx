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

        <div className="footer-col">
          <h4 className="footer-heading"> TECHNICAL EVENTS</h4>
          <ul className="footer-event-list">
            {techEvents.map((evt) => (
              <li key={evt.id}>
                <a onClick={() => handleEventClick(evt)}>{evt.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading"> NON-TECHNICAL EVENTS</h4>
          <ul className="footer-event-list">
            {nonTechEvents.map((evt) => (
              <li key={evt.id}>
                <a onClick={() => handleEventClick(evt)}>{evt.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading"> QUICK LINKS</h4>
          <ul className="footer-nav-list">
            <li>
              <a onClick={() => scrollTo('hero')}>HOME</a>
            </li>
            <li>
              <a onClick={() => scrollTo('events')}>EVENTS</a>
            </li>
            <li>
              <a onClick={() => scrollTo('why')}>ABOUT</a>
            </li>
            <li>
              <a onClick={() => scrollTo('final-cta')}>REGISTER</a>
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
