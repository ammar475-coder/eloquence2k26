import { useState, useEffect, useRef } from 'react';
import { FaBolt, FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import events from '../data/events.js';
import EventCard from './EventCard.jsx';

function AnimatedNumber({ value, prefix = '', suffix = '', padDigits = 2, duration = 1800 }) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const target = typeof value === 'number' ? value : parseInt(value, 10) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);

      setDisplayVal(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayVal(target);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  const formattedStr =
    padDigits > 0 ? String(displayVal).padStart(padDigits, '0') : String(displayVal);

  return (
    <span className="stat-num">
      {prefix}
      {formattedStr}
      {suffix}
    </span>
  );
}

export default function EventsPage({ onNavigate }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const canvasRef = useRef(null);

  // Scroll to top when page opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Ambient canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    const particles = [];

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.color = Math.random() > 0.5 ? '#39FF88' : '#00A83B';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    resize();
    for (let i = 0; i < 60; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleViewRules = (eventId) => {
    if (onNavigate) {
      onNavigate('event-rules', eventId);
    }
  };

  const handleRegister = (eventId) => {
    if (onNavigate) {
      onNavigate('register', eventId);
    }
  };

  // Filter & search events
  const filteredEvents = events.filter((e) => {
    const matchesCategory = filter === 'all' || e.category === filter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.subtitle && e.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.alias && e.alias.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.tag && e.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const techEvents = filteredEvents.filter((e) => e.category === 'technical');
  const nonTechEvents = filteredEvents.filter((e) => e.category === 'non-technical');

  return (
    <div className="events-page">
      {/* Header Banner */}
      <section className="events-page-hero">
        <canvas ref={canvasRef} className="events-page-canvas" />
        <div className="events-hero-glow" />
        <div className="events-hero-inner">
          <div className="events-breadcrumb">
            <button
              className="breadcrumb-back-btn"
              onClick={() => onNavigate && onNavigate('home')}
            >
              <FaArrowLeft style={{ marginRight: '0.4rem', verticalAlign: '-1px' }} />
              BACK TO HOME
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">EVENTS CATALOGUE</span>
          </div>

          <div className="events-hero-tag">
            <FaBolt style={{ marginRight: '0.35rem', color: 'var(--bright-green)', verticalAlign: '-1px' }} />
            CHAMPIONSHIP ARENA 2026
          </div>
          <h1 className="events-page-title">
            THE BATTLEFIELD <span className="text-glow">ROSTER</span>
          </h1>
          <p className="events-page-subtitle">
            12 high-octane competitions across Technical innovation and Non-Technical strategy.
            View official rules or register directly for any competition.
          </p>

          {/* Quick Stats Grid */}
          <div className="events-stats-grid">
            <div className="stat-card">
              <AnimatedNumber value={12} padDigits={2} duration={1800} />
              <span className="stat-label">TOTAL SHOWDOWNS</span>
            </div>
            <div className="stat-card">
              <AnimatedNumber value={6} padDigits={2} duration={1600} />
              <span className="stat-label">TECHNICAL EVENTS</span>
            </div>
            <div className="stat-card">
              <AnimatedNumber value={6} padDigits={2} duration={1600} />
              <span className="stat-label">NON-TECHNICAL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Events Content */}
      <section className="events-catalog-section">
        <div className="events-controls-wrapper">
          {/* Search Bar */}
          <div className="events-search-box">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="events-search-input"
              placeholder="Search event by title, tag, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="filter-bar">
            <button
              className={`filter-btn ${filter === 'all' ? 'filter-btn-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              ALL EVENTS ({events.length})
            </button>
            <button
              className={`filter-btn ${filter === 'technical' ? 'filter-btn-active' : ''}`}
              onClick={() => setFilter('technical')}
            >
              TECHNICAL (6)
            </button>
            <button
              className={`filter-btn ${filter === 'non-technical' ? 'filter-btn-active' : ''}`}
              onClick={() => setFilter('non-technical')}
            >
              NON-TECHNICAL (6)
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="events-results-meta">
          <span>Showing <strong>{filteredEvents.length}</strong> competition{filteredEvents.length !== 1 ? 's' : ''}</span>
          {searchQuery && (
            <span className="search-query-badge">
              Filter: "{searchQuery}"
            </span>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="no-events-found">
            <p className="no-events-title">No Events Match Your Search</p>
            <p className="no-events-desc">Try searching for a different keyword or resetting your filter.</p>
            <button
              className="btn btn-primary"
              onClick={() => { setFilter('all'); setSearchQuery(''); }}
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <>
            {/* Technical Events Grid */}
            {(filter === 'all' || filter === 'technical') && techEvents.length > 0 && (
              <div className="event-group-block">
                <div className="category-header-row">
                  <div className="category-label">// TECHNICAL EVENTS ({techEvents.length})</div>
                  <div className="category-line" />
                </div>
                <div className="events-grid">
                  {techEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onViewRules={handleViewRules}
                      onRegister={handleRegister}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Non-Technical Events Grid */}
            {(filter === 'all' || filter === 'non-technical') && nonTechEvents.length > 0 && (
              <div className="event-group-block">
                <div className="category-header-row">
                  <div className="category-label">// NON-TECHNICAL EVENTS ({nonTechEvents.length})</div>
                  <div className="category-line" />
                </div>
                <div className="events-grid">
                  {nonTechEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onViewRules={handleViewRules}
                      onRegister={handleRegister}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Bottom CTA on Events Page */}
      <section className="events-bottom-cta">
        <div className="events-bottom-cta-inner">
          <h3 className="bottom-cta-heading">READY TO ENTER THE ARENA?</h3>
          <p className="bottom-cta-sub">
            Join hundreds of ambitious students across the country and compete for trophies, cash prizes, and certificates.
          </p>
          <div className="bottom-cta-actions">
            <button
              className="btn btn-primary"
              onClick={() => handleRegister('tech-01')}
            >
              REGISTER FOR PPT PRESENTATION <FaArrowRight style={{ marginLeft: '0.4rem', verticalAlign: '-1px' }} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate && onNavigate('home')}
            >
              RETURN TO HOME STAGE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
