import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import EventsPage from './pages/EventsPage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return window.location.hash === '#/events' ? 'events' : 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/events' || window.location.hash === '#events') {
        setCurrentPage('events');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page, sectionId = null) => {
    setCurrentPage(page);
    if (page === 'events') {
      window.location.hash = '/events';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
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
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />
      {currentPage === 'events' ? (
        <EventsPage onNavigate={navigateTo} />
      ) : (
        <Home onNavigate={navigateTo} />
      )}
      <Footer currentPage={currentPage} onNavigate={navigateTo} />
    </div>
  );
}
