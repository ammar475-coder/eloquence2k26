import { useEffect, useRef, useState } from 'react';

export default function FinalCTA({ onRegister }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

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
        this.size = Math.random() * 1.5 + 0.5;
        this.speedY = -(Math.random() * 0.3 + 0.1);
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.y += this.speedY;
        if (this.y < 0) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#39FF88';
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    resize();
    for (let i = 0; i < 40; i++) particles.push(new Particle());
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener('resize', resize, { passive: true });
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section
      id="final-cta"
      ref={sectionRef}
      className={`final-cta ${visible ? 'final-cta-visible' : ''}`}
    >
      <canvas ref={canvasRef} className="cta-canvas" />
      <div className="cta-glow" />
      <div className="cta-content">
        <h2 className="cta-heading">ARE YOU READY?</h2>
        <p className="cta-sub">Your challenge awaits.</p>
        <button className="btn btn-primary btn-large" onClick={onRegister}>
          REGISTER FOR ELOQUENCE26
        </button>
      </div>
    </section>
  );
}
