import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import cardPptImg from '../assets/card_ppt_presentation.png';
import cardCodingImg from '../assets/card_coding_debugging.png';
import cardQuizImg from '../assets/card_tech_quiz.png';
import cardWebImg from '../assets/card_web_prompt.png';
import cardPosterImg from '../assets/card_poster_design.png';
import cardUiUxImg from '../assets/card_ui_ux.png';
import cardSnapImg from '../assets/card_snap_reel.png';
import cardLinkUpImg from '../assets/card_link_up.png';
import cardHuntZoneImg from '../assets/card_hunt_zone.png';
import cardHennaImg from '../assets/card_henna_heist.png';
import cardBattleImg from '../assets/card_battle_of_champions.png';
import cardChessImg from '../assets/card_chess.png';

function getEventIllustration(id, alias, name) {
  switch (id) {
    case 'tech-01':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardPptImg}
            alt="PPT Presentation"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'tech-02':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardCodingImg}
            alt="Coding & Debugging"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'tech-03':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardQuizImg}
            alt="Tech Quiz"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'tech-04':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardWebImg}
            alt="Web / Prompt"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'tech-05':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardPosterImg}
            alt="Poster Design"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'tech-06':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardUiUxImg}
            alt="UI / UX Prototype Showcase"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'nontech-01':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardSnapImg}
            alt="Snap & Reel"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'nontech-02':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardLinkUpImg}
            alt="Link Up (Connection)"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'nontech-03':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardHuntZoneImg}
            alt="Hunt Zone (Treasure Hunt)"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'nontech-04':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardHennaImg}
            alt="Henna Heist (Mehandi)"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'nontech-05':
      return (
        <div className="event-banner-img-container">
          <img
            src={cardBattleImg}
            alt="Battle of Champions"
            className="event-card-banner-img"
          />
        </div>
      );
    case 'nontech-06':
    default:
      return (
        <div className="event-banner-img-container">
          <img
            src={cardChessImg}
            alt="64 Squares Grandmaster Chess"
            className="event-card-banner-img"
          />
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
