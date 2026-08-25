import { useEffect, useRef, useState } from 'react';

export default function Intro() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="intro"
      ref={sectionRef}
      className={`intro ${visible ? 'intro-visible' : ''}`}
    >
      <div className="intro-reactor">
        <div className="reactor-ring reactor-ring-1" />
        <div className="reactor-ring reactor-ring-2" />
        <div className="reactor-core" />
      </div>
      <div className="intro-content">
        <h2 className="section-heading">WELCOME TO ELOQUENCE26</h2>
        <p className="intro-sub">
          A symposium built for creators, coders, strategists, designers and
          challengers.
        </p>
        <p className="intro-desc">
          ELOQUENCE26 brings together the brightest minds to compete across
          technical and non-technical challenges. Whether you write code,
          design interfaces, strategize in the arena, or create art —
          this is your battleground. One stage. Many disciplines. Only
          legends survive.
        </p>
      </div>
    </section>
  );
}
