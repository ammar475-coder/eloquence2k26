import { useEffect, useRef, useState } from 'react';
import logoImg from '../assets/logo.png';
import cahcetLogo from '../assets/cahcet.png';

const EVENT_START = new Date('2026-09-29T00:00:00+05:30').getTime();

function getTimeRemaining() {
  const remainingSeconds = Math.max(0, Math.floor((EVENT_START - Date.now()) / 1000));
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export default function Hero({ onExplore, onRegister, hasPlayedIntro = true }) {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeRemaining(getTimeRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    // Only run canvas if intro video has played/completed
    if (!hasPlayedIntro) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId;
    let particles = [];
    let isVisible = true;
    let mouse = { x: null, y: null, radius: 120 };

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * (canvas ? canvas.width : window.innerWidth);
        this.y = Math.random() * (canvas ? canvas.height : window.innerHeight);
        this.size = Math.random() * 1.8 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.baseAlpha = Math.random() * 0.4 + 0.2;
        this.color = Math.random() > 0.35 ? '#39FF88' : Math.random() > 0.5 ? '#00A83B' : '#85FFB8';
        this.pulse = Math.random() * Math.PI;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.025;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 2;
            this.y -= (dy / dist) * force * 2;
          }
        }
      }
      draw() {
        const currentAlpha = Math.max(0.1, Math.min(0.9, this.baseAlpha + Math.sin(this.pulse) * 0.15));
        
        // Fast dual-pass glow without expensive shadowBlur
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = currentAlpha * 0.2;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const initParticles = () => {
      particles = [];
      const isSmallScreen = window.innerWidth < 768;
      const count = isSmallScreen ? 28 : Math.min(55, Math.floor((canvas.width * canvas.height) / 22000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const drawConnections = () => {
      const isSmall = canvas.width < 768;
      const maxDistance = isSmall ? 75 : 110;
      const len = particles.length;

      for (let a = 0; a < len; a++) {
        for (let b = a + 1; b < len; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = '#39FF88';
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.75;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    };

    resize();

    const animate = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawConnections();
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationId = requestAnimationFrame(animate);
    };

    // Pause animation when Hero is scrolled out of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animationId);
          animationId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(animationId);
        }
      },
      { threshold: 0.05 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    animate();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleTouchMove = (e) => {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasPlayedIntro]);

  return (
    <section id="hero" ref={heroRef} className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-smoke-overlay" />
      <div className="hero-cyber-grid" />
      <div className="hero-ambient-glow" />
      <div className="hero-hud-lines" />
      
      <div className="hero-content">
        {/* Centered College Crest Badge */}
        <div className="hero-college-crest-container">
          <div className="hero-college-crest-card">
            <img src={cahcetLogo} alt="CAHCET College Logo" className="hero-college-crest-img" />
          </div>
        </div>

        {/* College & Department Titles */}
        <div className="hero-college-intro">
          <h2 className="hero-college-name">C. ABDUL HAKEEM COLLEGE OF ENGINEERING AND TECHNOLOGY</h2>
          <p className="hero-department">Department of Computer Science and Engineering</p>
          <div className="hero-presents-flourish">
            <span className="flourish-line" />
            <span className="hero-presents">proudly presents</span>
            <span className="flourish-line" />
          </div>
        </div>

        {/* ELOQUENCE Logo */}
        <div className="hero-logo-wrapper">
          <h1 className="hero-logo-title">
            <img
              src={logoImg}
              alt="ELOQUENCE 26"
              className="hero-logo-img"
            />
          </h1>
        </div>

        {/* Symposium Tagline */}
        <p className="hero-tagline">8TH NATIONAL LEVEL TECHNICAL SYMPOSIUM</p>

        {/* Unified Countdown Timer in Same Hero Section */}
        <div className="countdown countdown-days" aria-label={`Countdown: ${timeRemaining.days} days, ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes, ${timeRemaining.seconds} seconds`}>
          <div className="countdown-value">
            <span>{timeRemaining.days}</span>
            <b className="colon">:</b>
            <span>{timeRemaining.hours}</span>
            <b className="colon">:</b>
            <span>{timeRemaining.minutes}</span>
            <b className="colon">:</b>
            <span>{timeRemaining.seconds}</span>
          </div>
          <div className="countdown-labels">
            <span>DAYS</span>
            <span>HOURS</span>
            <span>MINUTES</span>
            <span>SECONDS</span>
          </div>
        </div>

        {/* Event Date */}
        <p className="hero-date">SEPTEMBER 29, 2026</p>

        {/* Explore / Register Action Button */}
        <div className="hero-buttons">
          <button className="btn btn-primary btn-large hero-explore-btn" onClick={onExplore || onRegister}>
            EXPLORE EVENTS <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

