import { useState, useRef, useEffect } from 'react';
import desktopVideoSrc from '../assets/landingpagesnew.mp4';
import portraitVideoSrc from '../assets/landingportraitvideo.mp4';
import logoImg from '../assets/logo.png';

export default function OpeningVideo({ onComplete }) {
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches;
  });
  const videoRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFinish = () => {
    if (fading || removed) return;
    setFading(true);
    setTimeout(() => {
      setRemoved(true);
      if (onComplete) onComplete();
    }, 500);
  };

  const currentVideoSrc = isMobile ? portraitVideoSrc : desktopVideoSrc;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1.0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => { });
      });
    }

    const unmuteOnInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => { });
        setIsMuted(false);
      }
    };

    window.addEventListener('click', unmuteOnInteraction, { once: true });
    window.addEventListener('touchstart', unmuteOnInteraction, { once: true });
    window.addEventListener('keydown', unmuteOnInteraction, { once: true });

    return () => {
      window.removeEventListener('click', unmuteOnInteraction);
      window.removeEventListener('touchstart', unmuteOnInteraction);
      window.removeEventListener('keydown', unmuteOnInteraction);
    };
  }, [currentVideoSrc]);

  const toggleSound = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    video.volume = 1.0;
    if (!video.muted) {
      video.play().catch(() => { });
    }
    setIsMuted(video.muted);
  };

  if (removed) return null;

  return (
    <div
      className={`opening-video-overlay ${fading ? 'opening-video-fade-out' : ''}`}
      onClick={() => {
        if (videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.volume = 1.0;
          setIsMuted(false);
        }
      }}
    >
      <video
        key={currentVideoSrc}
        ref={videoRef}
        src={currentVideoSrc}
        autoPlay
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
        <button
          type="button"
          className={`btn ${isMuted ? 'btn-primary' : 'btn-secondary'} opening-sound-btn`}
          onClick={toggleSound}
          title="Toggle Sound"
        >
          {isMuted ? '🔊 TAP FOR SOUND' : '🔊 SOUND ON'}
        </button>
        <button
          type="button"
          className="btn btn-primary opening-skip-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
        >
          ENTER SITE <span className="skip-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
