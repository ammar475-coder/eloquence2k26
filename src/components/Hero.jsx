import { useEffect, useRef } from 'react';

export default function Hero({ onExplore, onRegister }) {
  const canvasRef = useRef(null);

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
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-fog" />
      <div className="hero-hud-lines" />
      <div className="hero-content">
        <div className="hero-logo-wrapper">
          <h1 className="hero-logo-text">
            ELOQUENCE<span className="hero-logo-accent">26</span>
          </h1>
        </div>
        <p className="hero-countdown">THE COUNTDOWN BEGINS.</p>
        <p className="hero-tagline">
          Where Ideas Collide. Skills Survive. Legends Emerge.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={onExplore}>
            EXPLORE EVENTS
          </button>
          <button className="btn btn-secondary" onClick={onRegister}>
            REGISTER NOW
          </button>
        </div>
      </div>
      <div className="hero-scroll">
        <span>SCROLL TO ENTER</span>
        <div className="scroll-arrow">
          <span />
        </div>
      </div>
    </section>
  );
}
