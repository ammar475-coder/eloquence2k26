import { useState, useEffect } from 'react';
import navbarLogo from '../assets/navbarlogo.png';

export default function Navbar({ currentPage = 'home', onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page, sectionId = null) => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(page, sectionId);
    } else {
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo" onClick={() => handleNav('home', 'hero')}>
          <img src={navbarLogo} alt="ELOQUENCE 26" className="nav-logo-img" />
        </div>
        <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <a
            className={currentPage === 'home' ? 'nav-link-active' : ''}
            onClick={() => handleNav('home', 'hero')}
          >
            HOME
          </a>
          <a
            className={currentPage === 'events' ? 'nav-link-active' : ''}
            onClick={() => handleNav('events')}
          >
            EVENTS
          </a>
          <a onClick={() => handleNav('home', 'why')}>
            ABOUT
          </a>
          <a onClick={() => handleNav(currentPage === 'home' ? 'home' : 'events', currentPage === 'home' ? 'final-cta' : null)}>
            REGISTER
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
