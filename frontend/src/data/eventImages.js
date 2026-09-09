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

export const defaultEventImages = {
  'tech-01': cardPptImg,
  'tech-02': cardCodingImg,
  'tech-03': cardQuizImg,
  'tech-04': cardWebImg,
  'tech-05': cardPosterImg,
  'tech-06': cardUiUxImg,
  'tech-07': '/events/roborange.png',
  'nontech-01': cardSnapImg,
  'nontech-02': cardLinkUpImg,
  'nontech-03': cardHuntZoneImg,
  'nontech-04': cardHennaImg,
  'nontech-05': cardBattleImg,
  'nontech-06': cardChessImg,
  'nontech-07': '/events/auction.png',
};

/**
 * Returns the resolved event banner picture URL or imported asset
 * Priority: 1. Custom uploaded image (event.image) -> 2. Default event image asset -> 3. Fallback
 */
export function getEventBanner(eventOrId) {
  if (!eventOrId) return null;
  const rawImage = typeof eventOrId === 'object' 
    ? eventOrId.image 
    : (typeof eventOrId === 'string' && (eventOrId.startsWith('data:') || eventOrId.startsWith('http') || eventOrId.startsWith('/')) ? eventOrId : null);
  
  if (rawImage && rawImage.trim()) {
    const img = rawImage.trim();
    // Do not return legacy local disk uploads paths
    if (!img.startsWith('/uploads/')) {
      return img;
    }
  }

  const id = typeof eventOrId === 'object' ? eventOrId.id : eventOrId;
  const normalizedId = String(id || '').toLowerCase().trim();
  return defaultEventImages[normalizedId] || null;
}
