<<<<<<< HEAD
import AppRouter from './routes/AppRouter.jsx';

export default function App() {
  return <AppRouter />;
=======
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import EventsPage from './pages/EventsPage.jsx';
import EventRulesPage from './pages/EventRulesPage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import events from './data/events.js';

function parseHash(hash) {
  if (!hash || hash === '#' || hash === '#/') {
    return { page: 'home', eventId: null, sectionId: null };
  }
  // Register route for specific event
  if (hash.startsWith('#/register/') || hash === '#/register' || hash.startsWith('#register')) {
    const parts = hash.split('/');
    const id = parts[2];
    const found = events.find((e) => e.id === id || e.id.toLowerCase() === id?.toLowerCase());
    return { page: 'register', eventId: found ? found.id : events[0].id, sectionId: null };
  }
  // Event rules & overview route
  if (hash.startsWith('#/events/') || hash.startsWith('#/event/')) {
    const parts = hash.split('/');
    const id = parts[2];
    const found = events.find((e) => e.id === id || e.id.toLowerCase() === id?.toLowerCase());
    return { page: 'event-rules', eventId: found ? found.id : events[0].id, sectionId: null };
  }
  // Events catalogue route
  if (hash === '#/events' || hash === '#events') {
    return { page: 'events', eventId: null, sectionId: null };
  }
  // Home section route
  if (hash.startsWith('#')) {
    const section = hash.replace(/^#\/?/, '');
    return { page: 'home', eventId: null, sectionId: section };
  }
  return { page: 'home', eventId: null, sectionId: null };
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page, extra = null) => {
    if (page === 'event-rules') {
      const eventId = extra || 'tech-01';
      setRoute({ page: 'event-rules', eventId, sectionId: null });
      window.location.hash = `/events/${eventId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'register') {
      const eventId = extra || 'tech-01';
      setRoute({ page: 'register', eventId, sectionId: null });
      window.location.hash = `/register/${eventId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'events') {
      setRoute({ page: 'events', eventId: null, sectionId: null });
      window.location.hash = '/events';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const sectionId = typeof extra === 'string' ? extra : null;
      setRoute({ page: 'home', eventId: null, sectionId });
      window.location.hash = sectionId ? `#${sectionId}` : '/';
      if (sectionId) {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="app-container">
      <Navbar currentPage={route.page} onNavigate={navigateTo} />
      {route.page === 'event-rules' ? (
        <EventRulesPage eventId={route.eventId} onNavigate={navigateTo} />
      ) : route.page === 'register' ? (
        <RegistrationPage eventId={route.eventId} onNavigate={navigateTo} />
      ) : route.page === 'events' ? (
        <EventsPage onNavigate={navigateTo} />
      ) : (
        <Home
          onNavigate={navigateTo}
          hasPlayedIntro={hasPlayedIntro}
          onIntroComplete={() => setHasPlayedIntro(true)}
        />
      )}
      <Footer onNavigate={navigateTo} />
    </div>
  );
>>>>>>> d468dbf1af326be9567cdb4484aa3123f8ffb8a3
}
