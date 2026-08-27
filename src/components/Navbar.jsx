import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

export default function Navbar({ currentPage = 'home', onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page, extra = null) => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(page, extra);
    } else {
      if (typeof extra === 'string') {
        document.getElementById(extra)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isEventsActive = currentPage === 'events' || currentPage === 'event-rules';

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <div
          className="nav-logo"
          onClick={() => handleNav('home', 'hero')}
          role="button"
          tabIndex={0}
          aria-label="ELOQUENCE 26 Home"
        >
          <img src={logo} alt="ELOQUENCE 26" className="nav-logo-img" />
        </div>

        <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <a
            className={currentPage === 'home' ? 'nav-link-active' : ''}
            onClick={() => handleNav('home', 'hero')}
          >
            HOME
          </a>
          <a
            className={isEventsActive ? 'nav-link-active' : ''}
            onClick={() => handleNav('events')}
          >
            EVENTS
          </a>
          <a onClick={() => handleNav('home', 'why')}>
            ABOUT
          </a>
        </div>

        <button
          className={`nav-burger ${menuOpen ? 'nav-burger-open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
