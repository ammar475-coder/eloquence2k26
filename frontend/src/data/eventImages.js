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
import cardAuctionImg from '../assets/card_auction.jpg';
import cardBotathonImg from '../assets/card_botathon.png';

export const defaultEventImages = {
  'tech-01': cardPptImg,
  'tech-02': cardCodingImg,
  'tech-03': cardQuizImg,
  'tech-04': cardWebImg,
  'tech-05': cardPosterImg,
  'tech-06': cardUiUxImg,
  'tech-07': cardBotathonImg,
  'nontech-01': cardSnapImg,
  'nontech-02': cardLinkUpImg,
  'nontech-03': cardHuntZoneImg,
  'nontech-04': cardHennaImg,
  'nontech-05': cardBattleImg,
  'nontech-06': cardChessImg,
  'nontech-07': cardAuctionImg,
};

/**
 * Returns the resolved event banner picture URL or imported asset.
 * Priority:
 * 1. Custom uploaded/base64 image (event.image)
 * 2. Exact event ID match in defaultEventImages
 * 3. Smart keyword matching on name/alias/subtitle/tag
 * 4. Categorical fallback banner
 */
export function getEventBanner(eventOrId) {
  if (!eventOrId) return cardPptImg;

  // 1. Valid custom data URI, public path, or external full URL
  const rawImage = typeof eventOrId === 'object'
    ? eventOrId.image
    : (typeof eventOrId === 'string' && (eventOrId.startsWith('data:') || eventOrId.startsWith('http') || eventOrId.startsWith('/')) ? eventOrId : null);
  
  if (rawImage && typeof rawImage === 'string') {
    const trimmed = rawImage.trim();
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }
  }

  // 2. Exact ID match from high-resolution bundled poster assets
  const id = typeof eventOrId === 'object' ? eventOrId.id : eventOrId;
  const normalizedId = String(id || '').toLowerCase().trim();
  if (defaultEventImages[normalizedId]) {
    return defaultEventImages[normalizedId];
  }

  // 3. Smart Keyword matching
  if (typeof eventOrId === 'object') {
    const textPool = [
      eventOrId.name || '',
      eventOrId.alias || '',
      eventOrId.subtitle || '',
      eventOrId.tag || '',
      eventOrId.description || '',
      eventOrId.id || ''
    ].join(' ').toLowerCase();

    if (textPool.includes('auction') || textPool.includes('bid')) return cardAuctionImg;
    if (textPool.includes('botathon') || textPool.includes('roborange') || textPool.includes('robot') || textPool.includes('line-follower')) return cardBotathonImg;
    if (textPool.includes('chess') || textPool.includes('64 square')) return cardChessImg;
    if (textPool.includes('battle of champion') || textPool.includes('esport') || textPool.includes('e-sport') || textPool.includes('bgmi') || textPool.includes('free fire') || textPool.includes('gaming')) return cardBattleImg;
    if (textPool.includes('henna') || textPool.includes('mehandi')) return cardHennaImg;
    if (textPool.includes('hunt') || textPool.includes('treasure')) return cardHuntZoneImg;
    if (textPool.includes('link') || textPool.includes('connection')) return cardLinkUpImg;
    if (textPool.includes('snap') || textPool.includes('reel') || textPool.includes('cinematic') || textPool.includes('photography')) return cardSnapImg;
    if (textPool.includes('ui') || textPool.includes('ux') || textPool.includes('figma') || textPool.includes('prototype')) return cardUiUxImg;
    if (textPool.includes('chart') || textPool.includes('poster') || textPool.includes('canvas')) return cardPosterImg;
    if (textPool.includes('web') || textPool.includes('prompt')) return cardWebImg;
    if (textPool.includes('quiz') || textPool.includes('tech battle') || textPool.includes('trivia')) return cardQuizImg;
    if (textPool.includes('crack') || textPool.includes('code') || textPool.includes('debugging')) return cardCodingImg;
    if (textPool.includes('ppt') || textPool.includes('slide') || textPool.includes('pitch')) return cardPptImg;

    // 4. Categorical fallback
    if (eventOrId.category === 'non-technical') {
      return cardSnapImg;
    }
    return cardCodingImg;
  }

  return cardPptImg;
}
