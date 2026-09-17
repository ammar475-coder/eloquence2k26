export const defaultEventImages = {
  'tech-01': '/events/card_ppt_presentation-BHzUng4c.png',
  'tech-02': '/events/event-1789617913099-6240.png',
  'tech-03': '/events/event-1789617928386-8030.png',
  'tech-04': '/events/event-1789617939462-850.png',
  'tech-06': '/events/event-tech-06-1789621679528-2221.png',
  'nontech-01': '/events/event-1789617780279-2457.png',
  'nontech-02': '/events/event-1789617806355-7221.png',
  'nontech-03': '/events/event-1789617826039-8458.png',
  'nontech-04': '/events/event-1789617843336-809.png',
  'nontech-05': '/events/event-nontech-05-1789621679544-5090.png',
  'nontech-06': '/events/event-1789617856983-8484.png',
  'nontech-07': '/events/event-1789617873087-3103.png',
};

const DEFAULT_BANNER = '/events/card_ppt_presentation-BHzUng4c.png';

/**
 * Returns the resolved event banner picture URL or imported asset.
 * Priority:
 * 1. Custom admin-uploaded image (event.image, event.img, event.poster)
 * 2. Exact event ID match in defaultEventImages (high-res bundled card)
 * 3. Smart keyword matching on name/alias/subtitle/tag
 * 4. Categorical fallback banner
 */
export function getEventBanner(eventOrId) {
  if (!eventOrId) return DEFAULT_BANNER;

  let rawImage = '';
  let eventId = '';

  if (typeof eventOrId === 'object') {
    rawImage = (eventOrId.image || eventOrId.img || eventOrId.poster || '').trim();
    eventId = (eventOrId.id || '').toLowerCase().trim();
  } else if (typeof eventOrId === 'string') {
    const trimmed = eventOrId.trim();
    if (trimmed.startsWith('data:') || trimmed.startsWith('http') || trimmed.startsWith('/')) {
      rawImage = trimmed;
    } else {
      eventId = trimmed.toLowerCase();
    }
  }

  // 1. Custom admin-uploaded image (filter out empty or known bad placeholders)
  const isBadPlaceholder = !rawImage || rawImage.includes('event-1789617736258-2581.png') || rawImage.includes('img-1788936483698-9262.jpg');
  if (!isBadPlaceholder) {
    if (rawImage.startsWith('data:image/') || rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('/')) {
      return rawImage;
    }
  }

  // 2. Exact ID match from high-resolution bundled poster assets
  if (eventId && defaultEventImages[eventId]) {
    return defaultEventImages[eventId];
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

    if (textPool.includes('auction') || textPool.includes('bid')) return defaultEventImages['nontech-07'];
    if (textPool.includes('botathon') || textPool.includes('roborange') || textPool.includes('robot') || textPool.includes('line-follower')) return defaultEventImages['tech-07'];
    if (textPool.includes('chess') || textPool.includes('64 square')) return defaultEventImages['nontech-06'];
    if (textPool.includes('battle of champion') || textPool.includes('esport') || textPool.includes('e-sport') || textPool.includes('bgmi') || textPool.includes('free fire') || textPool.includes('gaming')) return defaultEventImages['nontech-05'];
    if (textPool.includes('henna') || textPool.includes('mehandi')) return defaultEventImages['nontech-04'];
    if (textPool.includes('hunt') || textPool.includes('treasure')) return defaultEventImages['nontech-03'];
    if (textPool.includes('link') || textPool.includes('connection')) return defaultEventImages['nontech-02'];
    if (textPool.includes('snap') || textPool.includes('reel') || textPool.includes('cinematic') || textPool.includes('photography')) return defaultEventImages['nontech-01'];
    if (textPool.includes('ui') || textPool.includes('ux') || textPool.includes('figma') || textPool.includes('prototype')) return defaultEventImages['tech-06'];
    if (textPool.includes('chart') || textPool.includes('poster') || textPool.includes('canvas')) return defaultEventImages['tech-05'];
    if (textPool.includes('web') || textPool.includes('prompt')) return defaultEventImages['tech-04'];
    if (textPool.includes('quiz') || textPool.includes('tech battle') || textPool.includes('trivia')) return defaultEventImages['tech-03'];
    if (textPool.includes('crack') || textPool.includes('code') || textPool.includes('debugging')) return defaultEventImages['tech-02'];
    if (textPool.includes('ppt') || textPool.includes('slide') || textPool.includes('pitch')) return defaultEventImages['tech-01'];

    // 4. Categorical fallback
    if (eventOrId.category === 'non-technical') {
      return defaultEventImages['nontech-01'];
    }
    return defaultEventImages['tech-02'];
  }

  return DEFAULT_BANNER;
}
