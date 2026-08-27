import { useState } from 'react';
import OpeningVideo from './OpeningVideo.jsx';
import Hero from './Hero.jsx';
import Intro from './Intro.jsx';
import WhyEloquence from './WhyEloquence.jsx';
import FinalCTA from './FinalCTA.jsx';

export default function Home({ onNavigate }) {
  const [showHeroVideo, setShowHeroVideo] = useState(false);

  const handleExploreEvents = () => {
    if (onNavigate) {
      onNavigate('events');
    }
  };

  const scrollToRegister = () => {
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="home-page">
      <OpeningVideo onComplete={() => setShowHeroVideo(true)} />
      <Hero
        onExplore={handleExploreEvents}
        onRegister={scrollToRegister}
        showBackgroundVideo={showHeroVideo}
      />
      <Intro />
      <WhyEloquence />
      <FinalCTA onRegister={handleExploreEvents} />
    </main>
  );
}
