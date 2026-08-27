import { useState, useEffect } from 'react';
import videoSrc from '../assets/portraitvideo.mp4';
import logoImg from '../assets/logo.png';

export default function OpeningVideo({ onComplete }) {
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(false);

  const handleFinish = () => {
    if (fading || removed) return;
    setFading(true);
    setTimeout(() => {
      setRemoved(true);
      if (onComplete) onComplete();
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (removed) return null;

  return (
    <div className={`opening-video-overlay ${fading ? 'opening-video-fade-out' : ''}`}>
      <video
        src={videoSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleFinish}
        className="opening-video-element"
      />
      <div className="opening-video-vignette" />
      <div className="opening-hud-top">
        <img src={logoImg} alt="ELOQUENCE 26" className="opening-hud-logo" />
        <span className="opening-hud-status">// INITIALIZING ELOQUENCE'26</span>
      </div>
      <div className="opening-hud-bottom">
        <button className="btn btn-primary opening-skip-btn" onClick={handleFinish}>
          ENTER SITE <span className="skip-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
