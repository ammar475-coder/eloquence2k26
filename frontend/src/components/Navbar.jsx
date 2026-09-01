import { useState, useEffect } from 'react';
import navbarLogo from '../assets/navbarlogo.png';

export default function Navbar({ currentPage = 'home', onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 25);
    window.addEventListener('scroll', handleScroll, { passive: true });
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
  const isRegisterActive = currentPage === 'register';

  return (
    <header className="navbar-fixed-wrapper">
      <nav className={`navbar-pill ${scrolled ? 'navbar-pill-scrolled' : ''}`}>
        {/* Left: Brand Logo */}
        <div className="nav-pill-logo" onClick={() => handleNav('home', 'hero')}>
          <img src={navbarLogo} alt="ELOQUENCE 26" className="nav-pill-logo-img" />
          <span className="nav-pill-logo-text">ELOQUENCE'26</span>
        </div>

        {/* Center: Simplified Nav Links */}
        <div className="nav-pill-links">
          <a
            className={`nav-pill-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home', 'hero')}
          >
            Home
          </a>
          <a
            className={`nav-pill-link ${isEventsActive ? 'active' : ''}`}
            onClick={() => handleNav('events')}
          >
            Events
          </a>
          <a
            className="nav-pill-link"
            onClick={() => handleNav('home', 'intro')}
          >
            About
          </a>
        </div>

        {/* Right: Pill Register Button */}
        <div className="nav-pill-actions">
          <button
            className={`nav-pill-register-btn ${isRegisterActive ? 'active' : ''}`}
            onClick={() => handleNav('register')}
          >
            Register Now
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className={`nav-pill-burger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      <div className={`nav-mobile-dropdown ${menuOpen ? 'open' : ''}`}>
        <a
          className={currentPage === 'home' ? 'active' : ''}
          onClick={() => handleNav('home', 'hero')}
        >
          Home
        </a>
        <a
          className={isEventsActive ? 'active' : ''}
          onClick={() => handleNav('events')}
        >
          Events
        </a>
        <a
          onClick={() => handleNav('home', 'intro')}
        >
          About
        </a>
        <button
          className="nav-pill-register-btn mobile-reg-btn"
          onClick={() => handleNav('register')}
        >
          Register Now
        </button>
      </div>
    </header>
  );
}

