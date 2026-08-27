import { useEffect, useRef, useState } from 'react';
import logoImg from '../assets/logo.png';
import videoSrc from '../assets/landingvideo.mp4';

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

export default function Hero({ onExplore, onRegister, showBackgroundVideo = false }) {
  const canvasRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeRemaining(getTimeRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.1;
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
    for (let i = 0; i < 80; i++) particles.push(new Particle());

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

  return (
    <section id="hero" className="hero">
      {showBackgroundVideo && (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="hero-bg-video"
        />
      )}
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-fog" />
      <div className="hero-hud-lines" />
      <div className="hero-content">
        <div className="hero-college-intro">
          <p className="hero-college-name">C. Abdul Hakeem College of Engineering and Technology</p>
          <p className="hero-department">Department of Computer Science and Engineering</p>
          <p className="hero-presents"><span>cordially presents</span></p>
        </div>
        <div className="hero-logo-wrapper">
          <h1 className="hero-logo-title">
            <img
              src={logoImg}
              alt="ELOQUENCE 26"
              className="hero-logo-img"
            />
          </h1>
        </div>
        <p className="hero-tagline">National Level Technical Symposium</p>
        <div className="countdown countdown-days" aria-label={`Countdown: ${timeRemaining.days} days, ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes, ${timeRemaining.seconds} seconds`}>
          <div className="countdown-value">
            <span>{timeRemaining.days}</span><b>:</b><span>{timeRemaining.hours}</span><b>:</b><span>{timeRemaining.minutes}</span><b>:</b><span>{timeRemaining.seconds}</span>
          </div>
          <div className="countdown-labels"><span>Days</span><span>Hours</span><span>Minutes</span><span>Seconds</span></div>
        </div>
        <p className="hero-date">September 29, 2026</p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={onRegister}>
            REGISTER NOW <span aria-hidden="true">→</span>
          </button>
          <button className="btn btn-secondary" onClick={onExplore}>
            EXPLORE EVENTS <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>


    </section>
  );
}
