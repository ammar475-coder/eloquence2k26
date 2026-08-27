import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import cahcet from '../assets/cahcet.png';

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
          <img src={logo} alt="ELOQUENCE 26" className="nav-logo-img" />
        </div>
        {/* <div className="nav-college" aria-label="C. Abdul Hakeem College of Engineering and Technology">
          <img src={cahcet} alt="cahcet" className="nav-logo-img" />
        </div> */}
        <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <a onClick={() => scrollTo('hero')}>HOME</a>
          <a onClick={() => scrollTo('events')}>EVENTS</a>
          <a onClick={() => scrollTo('why')}>ABOUT</a>
          <a className="nav-register" onClick={() => scrollTo('final-cta')}>REGISTER NOW <span aria-hidden="true">→</span></a>
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
