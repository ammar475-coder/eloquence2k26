import { useState } from 'react';
import OpeningVideo from './OpeningVideo.jsx';
import Hero from './Hero.jsx';
import Intro from './Intro.jsx';
import WhyEloquence from './WhyEloquence.jsx';
import FinalCTA from './FinalCTA.jsx';

export default function Home({ onNavigate, hasPlayedIntro = false, onIntroComplete }) {

  const handleIntroComplete = () => {
    if (onIntroComplete) {
      onIntroComplete();
    }
  };

  const handleExploreEvents = () => {
    if (onNavigate) {
      onNavigate('events');
    }
  };

  return (
    <main className="home-page">
      {!hasPlayedIntro && (
        <OpeningVideo onComplete={handleIntroComplete} />
      )}
      <Hero
        onExplore={handleExploreEvents}
        onRegister={handleExploreEvents}
      />
      <Intro />
      <WhyEloquence />
      <FinalCTA onRegister={handleExploreEvents} />
    </main>
  );
}
