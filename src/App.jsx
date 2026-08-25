import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Intro from './components/Intro.jsx';
import EventSection from './components/EventSection.jsx';
import RegistrationModal from './components/RegistrationModal.jsx';
import WhyEloquence from './components/WhyEloquence.jsx';
import FinalCTA from './components/FinalCTA.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openModal = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const scrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToRegister = () => {
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />
      <Hero onExplore={scrollToEvents} onRegister={scrollToRegister} />
      <Intro />
      <EventSection onRegister={openModal} />
      <WhyEloquence />
      <FinalCTA onRegister={scrollToEvents} />
      <Footer />
      <RegistrationModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={closeModal}
      />
    </>
  );
}
