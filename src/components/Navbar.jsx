import { useState, useEffect } from 'react';
import navbarLogo from '../assets/navbarlogo.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo" onClick={() => scrollTo('hero')}>
          <img src={navbarLogo} alt="ELOQUENCE 26" className="nav-logo-img" />
        </div>
        <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <a onClick={() => scrollTo('hero')}>HOME</a>
          <a onClick={() => scrollTo('events')}>EVENTS</a>
          <a onClick={() => scrollTo('why')}>ABOUT</a>
          <a onClick={() => scrollTo('final-cta')}>REGISTER</a>
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
