import { useState } from 'react';
import OpeningVideo from './OpeningVideo.jsx';
import Hero from './Hero.jsx';
import Intro from './Intro.jsx';
import EventSection from './EventSection.jsx';
import RegistrationModal from './RegistrationModal.jsx';
import WhyEloquence from './WhyEloquence.jsx';
import FinalCTA from './FinalCTA.jsx';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showHeroVideo, setShowHeroVideo] = useState(false);

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
    <main className="home-page">
      <OpeningVideo onComplete={() => setShowHeroVideo(true)} />
      <Hero
        onExplore={scrollToEvents}
        onRegister={scrollToRegister}
        showBackgroundVideo={showHeroVideo}
      />
      <Intro />
      <EventSection onRegister={openModal} />
      <WhyEloquence />
      <FinalCTA onRegister={scrollToEvents} />
      <RegistrationModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={closeModal}
      />
    </main>
  );
}
