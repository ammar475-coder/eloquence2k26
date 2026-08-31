import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';



function getEventIllustration(id, alias, name) {
  switch (id) {
    case 'tech-01':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">PAPER PRESENTATION</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <rect x="100" y="30" width="200" height="120" rx="8" fill="#E3F2FD" stroke="#1565C0" strokeWidth="4" />
            <path d="M120 60h160M120 90h160M120 120h100" stroke="#1976D2" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'tech-02':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">CODING & DEBUGGING</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <rect x="80" y="40" width="240" height="110" rx="6" fill="#212121" stroke="#424242" strokeWidth="4" />
            <text x="100" y="80" fill="#00E676" fontFamily="monospace" fontSize="24" fontWeight="bold">&gt; _</text>
            <path d="M100 110h120" stroke="#00E676" strokeWidth="4" />
          </svg>
        </div>
      );
    case 'tech-03':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">TECH QUIZ</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <circle cx="200" cy="90" r="50" fill="#FFF8E1" stroke="#FBC02D" strokeWidth="5" />
            <text x="200" y="105" fill="#F57F17" fontSize="48" fontWeight="bold" textAnchor="middle">?</text>
          </svg>
        </div>
      );
    case 'tech-04':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">WEB / PROMPT DESIGN</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <rect x="80" y="30" width="240" height="130" rx="10" fill="#F3E5F5" stroke="#7B1FA2" strokeWidth="4" />
            <rect x="100" y="50" width="200" height="20" rx="4" fill="#CE93D8" />
            <rect x="100" y="90" width="80" height="50" rx="4" fill="#BA68C8" />
            <rect x="200" y="90" width="100" height="50" rx="4" fill="#AB47BC" />
          </svg>
        </div>
      );
    case 'tech-05':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">CHART CANVAS POSTER DESIGN</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <rect x="110" y="20" width="180" height="135" rx="6" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="3" />
            <circle cx="160" cy="65" r="20" fill="#81C784" />
            <polygon points="200,90 240,140 160,140" fill="#4CAF50" />
            <polygon points="240,100 270,140 210,140" fill="#2E7D32" />
          </svg>
        </div>
      );
    case 'tech-06':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">UI / UX PROTOTYPE SHOWCASE</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <rect x="80" y="25" width="240" height="130" rx="10" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="3" />
            <rect x="100" y="45" width="85" height="90" rx="6" fill="#C8E6C9" />
            <rect x="200" y="45" width="100" height="40" rx="4" fill="#CE93D8" />
            <rect x="200" y="95" width="100" height="40" rx="4" fill="#BA68C8" />
          </svg>
        </div>
      );
    case 'nontech-01':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">SNAP & REEL CINEMATIC SHOTS</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <rect x="120" y="40" width="160" height="95" rx="12" fill="#2E7D32" />
            <circle cx="200" cy="87" r="30" fill="#1B5E20" stroke="#E8F5E9" strokeWidth="4" />
            <circle cx="200" cy="87" r="14" fill="#00E676" />
            <rect x="235" y="52" width="20" height="12" rx="3" fill="#81C784" />
          </svg>
        </div>
      );
    case 'nontech-02':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">LINK UP PUZZLE SHOWDOWN</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <circle cx="140" cy="90" r="32" stroke="#2E7D32" strokeWidth="5" fill="#FFE0B2" />
            <circle cx="260" cy="90" r="32" stroke="#2E7D32" strokeWidth="5" fill="#FFE0B2" />
            <path d="M172 90h56" stroke="#F57C00" strokeWidth="6" strokeDasharray="4 4" />
          </svg>
        </div>
      );
    case 'nontech-03':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">HUNT ZONE TREASURE QUEST</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <rect x="90" y="35" width="220" height="120" rx="8" fill="#FFF3E0" stroke="#8D6E63" strokeWidth="3" />
            <path d="M120 65 Q 200 120 280 75" stroke="#D84315" strokeWidth="4" strokeDasharray="6 6" fill="none" />
            <text x="280" y="80" fill="#D32F2F" fontSize="26" fontWeight="bold">✕</text>
          </svg>
        </div>
      );
    case 'nontech-04':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">HENNA HEIST MEHANDI ART</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <circle cx="200" cy="90" r="45" fill="#FBE9E7" stroke="#D84315" strokeWidth="3" />
            <circle cx="200" cy="90" r="26" fill="#FFCCBC" />
            <path d="M200 52v76M162 90h76M173 63l54 54M173 117l54-54" stroke="#BF360C" strokeWidth="2" />
          </svg>
        </div>
      );
    case 'nontech-05':
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">BATTLE OF CHAMPIONS ESPORTS</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <rect x="90" y="45" width="220" height="95" rx="18" fill="#1A237E" stroke="#3D5AFE" strokeWidth="4" />
            <circle cx="150" cy="92" r="14" fill="#FF1744" />
            <circle cx="250" cy="84" r="8" fill="#00E676" />
            <circle cx="270" cy="102" r="8" fill="#FFEA00" />
          </svg>
        </div>
      );
    case 'nontech-06':
    default:
      return (
        <div className="event-illustration-wrap">
          <div className="banner-top-title">64 SQUARES GRANDMASTER CHESS</div>
          <svg viewBox="0 0 400 200" width="100%" height="150" fill="none">
            <rect x="110" y="25" width="180" height="130" fill="#3E2723" stroke="#D7CCC8" strokeWidth="4" />
            <rect x="110" y="25" width="45" height="32" fill="#D7CCC8" />
            <rect x="200" y="25" width="45" height="32" fill="#D7CCC8" />
            <rect x="155" y="57" width="45" height="32" fill="#D7CCC8" />
            <rect x="245" y="57" width="45" height="32" fill="#D7CCC8" />
            <rect x="110" y="89" width="45" height="32" fill="#D7CCC8" />
            <rect x="200" y="89" width="45" height="32" fill="#D7CCC8" />
          </svg>
        </div>
      );
  }
}

function getEventIcon(id) {
  switch (id) {
    case 'tech-02':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#39FF88" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="event-title-icon-svg">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'tech-01':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#39FF88" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="event-title-icon-svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'tech-04':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#39FF88" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="event-title-icon-svg">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#39FF88" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="event-title-icon-svg">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
  }
}

export default function EventCard({ event, onRegister, onViewRules }) {
  const [showRulesDropdown, setShowRulesDropdown] = useState(false);

  const handleRegister = (e) => {
    if (e) e.stopPropagation();
    if (onRegister) {
      onRegister(event.id || event);
    }
  };

  const handleViewRules = (e) => {
    if (e) e.stopPropagation();
    if (onViewRules) {
      onViewRules(event.id || event);
    }
  };

  const isTech = event.category === 'technical';

  return (
    <div className={`event-poster-card ${isTech ? 'poster-tech' : 'poster-nontech'}`}>
      {/* Top Banner Container with Poster Illustration */}
      <div className="event-card-top-banner">
        {getEventIllustration(event.id, event.alias, event.name)}
      </div>

      {/* Bottom Content Block */}
      <div className="event-card-bottom-content">
        <div className="event-header-row">
          <span className="event-header-icon">{getEventIcon(event.id)}</span>
          <h3 className="event-card-title">{event.name}</h3>
        </div>

        <p className="event-card-desc">
          {event.subtitle || event.description}
        </p>

        <div className="event-card-meta-list">
          <div className="meta-line">
            <span className="meta-key">Venue:</span>
            <span className="meta-val">{event.venue || 'CSE Department Labs'}</span>
          </div>
          <div className="meta-line">
            <span className="meta-key">Time:</span>
            <span className="meta-val">{event.timing || '10:00 AM – 1:00 PM'}</span>
          </div>
          <div className="meta-line meta-fee-row">
            <div className="meta-fee-left">
              <span className="meta-key">Fee:</span>
              <span className="meta-val fee-val-highlight">{event.fee}</span>
            </div>
            <button
              type="button"
              className={`view-rules-dropdown-trigger ${showRulesDropdown ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowRulesDropdown(!showRulesDropdown);
              }}
            >
              View Rules {showRulesDropdown ? '▴' : '▾'}
            </button>
          </div>

          {/* Rules Dropdown Drawer inside Event Card */}
          {showRulesDropdown && event.rules && (
            <div className="event-rules-dropdown-drawer">
              <div className="rules-dropdown-header">
                <span>Key Rules (3-4 Lines):</span>
                <button
                  type="button"
                  className="rules-dropdown-full-link"
                  onClick={handleViewRules}
                >
                  Full Details →
                </button>
              </div>
              <ul className="rules-dropdown-list">
                {event.rules.slice(0, 4).map((rule, idx) => (
                  <li key={idx} className="rules-dropdown-item">
                    <span className="rules-dropdown-num">{idx + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Single Primary Register Action Button */}
        <div className="event-card-buttons-row">
          <button
            type="button"
            className="btn btn-primary btn-card-register btn-full-width"
            onClick={handleRegister}
          >
            REGISTER <FaArrowRight style={{ marginLeft: '0.35rem', verticalAlign: '-1px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
