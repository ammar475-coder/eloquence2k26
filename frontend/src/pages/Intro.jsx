import { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
const campusPhoto = '/cahcet_campus.jpg';

export default function Intro() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="intro"
      ref={sectionRef}
      className={`intro ${visible ? 'intro-visible' : ''}`}
      aria-label="About the Event and Campus Venue"
    >
      <div className="intro-container">
        <div className="intro-left">
          <h2 className="intro-heading">About the Event</h2>
          <p className="intro-desc">
            Dive into coding challenges, paper presentations, design, quizzes, gaming and more. Eloquence'26 brings students from across India to learn, build, and have fun.
          </p>
          <p className="intro-desc">
            Experience a vibrant atmosphere where innovation meets inspiration. Participate in hands-on workshops, showcase your skills in competitive events, and connect with industry experts and fellow tech enthusiasts. Whether you are a coder, designer, gamer, or simply passionate about technology, Eloquence'26 offers something for everyone.
          </p>
          <p className="intro-desc">
            Join us for a day filled with knowledge sharing, creativity, and excitement. Unlock new opportunities, win exciting prizes, and make memories that last a lifetime!
          </p>
        </div>
        <div className="intro-right">
          <div className="intro-image-wrapper">
            <div className="intro-image-frame">
              <img 
                src={campusPhoto} 
                alt="C. Abdul Hakeem College of Engineering and Technology Campus" 
                className="intro-image" 
                loading="lazy" 
                decoding="async" 
                onError={(e) => { e.currentTarget.src = '/cahcet_campus.jpg'; }}
              />
              <div className="intro-venue-pill">
                <FaMapMarkerAlt className="intro-venue-pill-icon" />
                <span>OFFICIAL VENUE</span>
              </div>
            </div>
            <div className="intro-venue-details">
              <h3 className="intro-venue-name">
                C. Abdul Hakeem College of Engineering &amp; Technology
              </h3>
              <p className="intro-venue-address">
                Hakeem Nagar, Melvisharam, Ranipet District, Tamil Nadu &ndash; 632509
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=C.+Abdul+Hakeem+College+of+Engineering+and+Technology+Melvisharam"
                target="_blank"
                rel="noopener noreferrer"
                className="intro-map-link"
                title="Open location in Google Maps"
              >
                <span>View on Google Maps</span>
                <FaExternalLinkAlt size={10} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
