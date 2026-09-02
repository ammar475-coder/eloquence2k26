import { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaUsers,
  FaListOl,
  FaHeadset
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import events from '../data/events.js';
import rulesData from '../data/rules.js';
import coordinatorsData from '../data/coordinator.js';

export default function EventRulesPage({ eventId, from, categoryFilter, onNavigate }) {
  const [eventsList, setEventsList] = useState(events);
  const event = eventsList.find((e) => e.id === eventId || e.id?.toLowerCase() === eventId?.toLowerCase()) || eventsList[0] || events[0];

  const rulesList = (Array.isArray(event.rules) && event.rules.length > 0)
    ? event.rules
    : (rulesData[event.id]?.rules || []);

  const coordsList = (Array.isArray(event.coordinators) && event.coordinators.length > 0)
    ? event.coordinators
    : (coordinatorsData[event.id]?.coordinators || []);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setEventsList(result.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [eventId]);

  const isEsports = event.id === 'nontech-05';

  const handleRegister = () => {
    if (onNavigate) {
      onNavigate('register', event.id);
    }
  };

  const handleRegisterGame = (game) => {
    if (onNavigate) {
      onNavigate('register', { eventId: event.id, game });
    }
  };

  const handleTopRegisterClick = () => {
    if (isEsports) {
      const el = document.querySelector('.esports-cta-wrap');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    handleRegister();
  };

  const handleBackToEvents = () => {
    if (onNavigate) {
      if (from === 'register') {
        onNavigate('register', null, { categoryFilter });
      } else {
        onNavigate('events');
      }
    }
  };

  return (
    <div className="event-rules-page">
      <div className="event-rules-full-container">
        {/* Top Navigation & Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rules-clean-top-nav"
        >
          <button className="rules-back-btn" onClick={handleBackToEvents}>
            <FaArrowLeft style={{ marginRight: '0.45rem', verticalAlign: '-1px' }} />
            Back to Events
          </button>
          <button className="rules-register-top-btn" onClick={handleTopRegisterClick}>
            Register Now <FaArrowRight style={{ marginLeft: '0.45rem', verticalAlign: '-1px' }} />
          </button>
        </motion.div>

        {/* Main Title & Category Tag Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rules-title-header-wrap"
        >
          <span className="rules-category-tag">
            {event.category === 'technical' ? '⚡ TECHNICAL EVENT' : '🎮 NON-TECHNICAL EVENT'}
          </span>
          <h1 className="rules-clean-main-title">{event.name}</h1>
          {event.alias && event.alias.toLowerCase() !== event.name.toLowerCase() && (
            <p className="rules-alias-sub">// {event.alias}</p>
          )}
        </motion.div>

        {/* 2-Column Split: Overview (Left) & Rules (Right) */}
        <div className="rules-split-grid">
          {/* Left Side: Overview Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rules-card-glass rules-left-overview-card"
          >
            <div className="rules-card-header">
              <h2 className="rules-card-title">
                <FaMapMarkerAlt className="rules-card-icon" /> Overview
              </h2>
            </div>

            <div className="rules-clean-meta-list">
              <div className="rules-meta-row">
                <span className="rules-meta-icon"><FaMapMarkerAlt /></span>
                <div className="rules-meta-content">
                  <strong className="rules-meta-key">Venue:</strong>
                  <span className="rules-meta-val">{event.venue || 'CSE Department Labs'}</span>
                </div>
              </div>

              <div className="rules-meta-row">
                <span className="rules-meta-icon"><FaClock /></span>
                <div className="rules-meta-content">
                  <strong className="rules-meta-key">Timing:</strong>
                  <span className="rules-meta-val">{event.timing || '10:40 AM – 12:40 PM'}</span>
                </div>
              </div>

              <div className="rules-meta-row">
                <span className="rules-meta-icon"><FaMoneyBillWave /></span>
                <div className="rules-meta-content">
                  <strong className="rules-meta-key">Registration Fee:</strong>
                  <span className="rules-meta-val fee-highlight">{event.fee}</span>
                </div>
              </div>

              <div className="rules-meta-row">
                <span className="rules-meta-icon"><FaUsers /></span>
                <div className="rules-meta-content">
                  <strong className="rules-meta-key">Members:</strong>
                  <span className="rules-meta-val">{event.teamSize}</span>
                </div>
              </div>

              <div className="rules-meta-row desc-row">
                <div className="rules-meta-content">
                  <strong className="rules-meta-key">Description:</strong>
                  <p className="rules-meta-desc-text">{event.subtitle || event.description}</p>
                </div>
              </div>
            </div>

            {isEsports ? (
              <div className="overview-card-cta-wrap esports-cta-wrap">
                <div className="esports-cta-heading">
                  REGISTRATION FOR THIS EVENT
                </div>
                <div className="esports-buttons-grid">
                  <button
                    type="button"
                    className="esports-action-btn esports-btn-freefire"
                    onClick={() => handleRegisterGame('FREE FIRE')}
                    id="btn-register-freefire"
                  >
                    <span>FREE FIRE</span>
                    <FaArrowRight className="esports-btn-arrow" />
                  </button>
                  <button
                    type="button"
                    className="esports-action-btn esports-btn-bgmi"
                    onClick={() => handleRegisterGame('BGMI')}
                    id="btn-register-bgmi"
                  >
                    <span>BGMI</span>
                    <FaArrowRight className="esports-btn-arrow" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="overview-card-cta-wrap">
                <button className="btn btn-primary btn-full-width" onClick={handleRegister}>
                  REGISTER FOR THIS EVENT <FaArrowRight style={{ marginLeft: '0.4rem' }} />
                </button>
              </div>
            )}
          </motion.div>

          {/* Right Side: Single Unified Rules Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rules-card-glass rules-right-rules-card"
          >
            <div className="rules-card-header">
              <h2 className="rules-card-title">
                <FaListOl className="rules-card-icon" /> Rules & Guidelines
              </h2>
              {rulesList.length > 0 && (
                <span className="rules-count-badge">{rulesList.length} Rules</span>
              )}
            </div>

            {rulesList.length > 0 ? (
              <ol className="rules-unified-list">
                {rulesList.map((rule, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + idx * 0.04 }}
                    className="rules-unified-item"
                  >
                    <span className="rules-item-index">{idx + 1}.</span>
                    <span className="rules-item-text">{rule}</span>
                  </motion.li>
                ))}
              </ol>
            ) : (
              <p className="rules-empty-text">Standard event guidelines apply. Contact event coordinators for details.</p>
            )}
          </motion.div>
        </div>

        {/* Down / Bottom Section: Compact Coordinator Cards */}
        {coordsList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="rules-card-glass rules-bottom-contact-card"
          >
            <div className="rules-card-header">
              <h2 className="rules-card-title">
                <FaHeadset className="rules-card-icon" /> Student Coordinators & Contact
              </h2>
            </div>

            <div className="rules-contact-grid">
              {coordsList.map((coord, idx) => (
                <div key={idx} className="rules-coord-card">
                  <div className="coord-card-badge">{coord.role || `Coordinator ${idx + 1}`}</div>
                  <h3 className="coord-card-name">{coord.name}</h3>
                  <a href={`tel:${coord.phone}`} className="coord-call-btn">
                    <FaPhoneAlt style={{ marginRight: '0.4rem', verticalAlign: '-1px' }} />
                    {coord.displayPhone || coord.phone}
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="rules-mobile-sticky-bar">
        <button className="rules-mobile-back-btn" onClick={handleBackToEvents}>
          <FaArrowLeft style={{ marginRight: '0.45rem', verticalAlign: '-1px' }} /> Back
        </button>
        <button className="rules-mobile-register-btn" onClick={handleRegister}>
          Register Now <FaArrowRight style={{ marginLeft: '0.45rem', verticalAlign: '-1px' }} />
        </button>
      </div>
    </div>
  );
}
