import { useState, useRef } from 'react';

export default function ShaderCard({
  children,
  color1 = '#00a83b',
  color2 = '#39ff88',
  color3 = '#050a07',
  className = '',
  onClick,
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={`shader-card-wrapper ${isHovered ? 'shader-card-hovered' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 50, y: 50 });
      }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      style={{
        '--card-c1': color1,
        '--card-c2': color2,
        '--card-c3': color3,
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
      }}
    >
      <div className="shader-card-cyber-bg" />
      <div className="shader-card-glass-glow" />
      <div className="shader-card-content">{children}</div>
    </div>
  );
}
