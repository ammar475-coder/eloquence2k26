import { useEffect, useRef, useState } from 'react';

const features = [
  {
    icon: '⚔️',
    title: 'COMPETE',
    description: 'Face off against the best minds in technical and creative arenas.',
  },
  {
    icon: '🔧',
    title: 'CREATE',
    description: 'Build, design, and innovate — bring your boldest ideas to life.',
  },
  {
    icon: '🔗',
    title: 'CONNECT',
    description: 'Network with peers, mentors, and industry minds under one roof.',
  },
  {
    icon: '🏆',
    title: 'CONQUER',
    description: 'Rise through the ranks and etch your name among the legends.',
  },
];

export default function WhyEloquence() {
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
      id="why"
      ref={sectionRef}
      className={`why-section ${visible ? 'why-visible' : ''}`}
    >
      <h2 className="section-heading">WHY ELOQUENCE26</h2>
      <p className="section-sub">Four pillars. One mission. Infinite possibilities.</p>
      <div className="why-grid">
        {features.map((f, i) => (
          <div className="why-card" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="why-icon">{f.icon}</div>
            <h3 className="why-title">{f.title}</h3>
            <p className="why-desc">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
