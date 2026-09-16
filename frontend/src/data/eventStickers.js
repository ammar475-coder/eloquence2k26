import doctorStrangeSticker from '../assets/sticker_ppt_doctorstrange.png';
import beastSticker from '../assets/sticker_crackcode_beast.png';
import blackPantherSticker from '../assets/sticker_techquiz_blackpanther.png';
import mrFantasticSticker from '../assets/sticker_webprompt_mrfantastic.png';
import invisibleWomanSticker from '../assets/sticker_uiux_invisiblewoman.png';
import antManSticker from '../assets/sticker_snapreel_antman.png';
import lokiSticker from '../assets/sticker_linkup_loki.png';
import captainAmericaSticker from '../assets/sticker_huntzone_captainamerica.png';
import yelenaBelovaSticker from '../assets/sticker_henna_yelenabelova.png';
import thorSticker from '../assets/sticker_esports_thor.png';
import magnetoSticker from '../assets/sticker_chess_magneto.png';
import doctorDoomSticker from '../assets/sticker_bidding_doctordoom.png';

/**
 * Marvel Character Stickers Mapping for ELOQUENCE'26 Events
 * With optical scale balancing so full-body slender characters
 * match the visual weight of wide/half-body characters.
 */

export const EVENT_STICKERS = {
  // 1. PPT PRESENTATION : Doctor Strange
  'tech-01': {
    character: 'Doctor Strange',
    src: doctorStrangeSticker,
    alt: 'Doctor Strange Mascot Sticker',
    title: 'Doctor Strange — PPT Presentation',
    scale: 1.08,
    cropPosition: 'center'
  },

  // 2. CRACK THE CODE : X-Men Beast
  'tech-02': {
    character: 'Beast',
    src: beastSticker,
    alt: 'X-Men Beast Mascot Sticker',
    title: 'X-Men Beast — Crack The Code',
    scale: 1.02,
    cropPosition: 'center'
  },

  // 3. TECH QUIZ – ONLINE : Black Panther
  'tech-03': {
    character: 'Black Panther',
    src: blackPantherSticker,
    alt: 'Black Panther Mascot Sticker',
    title: 'Black Panther — Tech Quiz Online',
    scale: 1.15,
    cropPosition: 'center'
  },

  // 4. WEB / PROMPT : Mister Fantastic
  'tech-04': {
    character: 'Mister Fantastic',
    src: mrFantasticSticker,
    alt: 'Mister Fantastic Mascot Sticker',
    title: 'Mister Fantastic — Web / Prompt Design',
    scale: 1.12,
    cropPosition: 'center'
  },

  // 5. UI/UX : Invisible Woman
  'tech-06': {
    character: 'Invisible Woman',
    src: invisibleWomanSticker,
    alt: 'Invisible Woman Mascot Sticker',
    title: 'Invisible Woman — UI/UX Design',
    scale: 1.15,
    cropPosition: 'center'
  },

  // 6. SNAP & REEL : Ant Man
  'nontech-01': {
    character: 'Ant-Man',
    src: antManSticker,
    alt: 'Ant-Man Mascot Sticker',
    title: 'Ant-Man — Snap & Reel',
    scale: 1.05,
    cropPosition: 'center'
  },

  // 7. LINK UP – CONNECTION : Loki
  'nontech-02': {
    character: 'Loki',
    src: lokiSticker,
    alt: 'Loki Mascot Sticker',
    title: 'Loki — Link Up (Connection)',
    scale: 1.1,
    cropPosition: 'center'
  },

  // 8. HUNT ZONE – TREASURE HUNT : Captain America
  'nontech-03': {
    character: 'Captain America',
    src: captainAmericaSticker,
    alt: 'Captain America Mascot Sticker',
    title: 'Captain America — Hunt Zone (Treasure Hunt)',
    scale: 1.02,
    cropPosition: 'center'
  },

  // 9. HENNA HEIST – MEHANDI : Yelena Belova
  'nontech-04': {
    character: 'Yelena Belova',
    src: yelenaBelovaSticker,
    alt: 'Yelena Belova Mascot Sticker',
    title: 'Yelena Belova — Henna Heist (Mehandi)',
    scale: 1.12,
    cropPosition: 'center'
  },

  // 10. BATTLE OF CHAMPIONS – E-SPORTS : Thor
  'nontech-05': {
    character: 'Thor',
    src: thorSticker,
    alt: 'Thor Mascot Sticker',
    title: 'Thor — Battle of Champions (E-Sports)',
    scale: 1.05,
    cropPosition: 'center'
  },

  // 11. 64 SQUARES – CHESS : Magneto
  'nontech-06': {
    character: 'Magneto',
    src: magnetoSticker,
    alt: 'Magneto Mascot Sticker',
    title: 'Magneto — 64 Squares (Chess)',
    scale: 1.1,
    cropPosition: 'center'
  },

  // 12. BATTLEWORLD BIDDING : Doctor Doom
  'nontech-07': {
    character: 'Doctor Doom',
    src: doctorDoomSticker,
    alt: 'Doctor Doom Mascot Sticker',
    title: 'Doctor Doom — Battleworld Bidding',
    scale: 1.12,
    cropPosition: 'center'
  }
};

/**
 * Helper to retrieve sticker metadata by event object or event ID.
 * Matches by ID, normalized name, or alias.
 */
export function getEventSticker(eventOrId) {
  if (!eventOrId) return null;
  const isObj = typeof eventOrId === 'object';
  const id = isObj ? (eventOrId.id || eventOrId.eventId || eventOrId.event_id) : eventOrId;
  const rawStr = isObj ? '' : String(eventOrId).toUpperCase();
  const name = isObj ? ((eventOrId.name || eventOrId.eventName || '').toUpperCase()) : rawStr;
  const alias = isObj ? ((eventOrId.alias || '').toUpperCase()) : rawStr;

  // 1. Direct ID match
  if (id && EVENT_STICKERS[id]) {
    return EVENT_STICKERS[id];
  }

  // 2. Name / Alias fallback matches
  if (name.includes('PPT') || alias.includes('SLIDE CRAFT') || name.includes('SLIDE') || name.includes('PRESENTATION')) {
    return EVENT_STICKERS['tech-01'];
  }
  if (name.includes('CRACK') || name.includes('CODE') || alias.includes('CRACK') || alias.includes('CODE') || alias.includes('DEBUG')) {
    return EVENT_STICKERS['tech-02'];
  }
  if (name.includes('TECH QUIZ') || alias.includes('TECH QUIZ') || alias.includes('TECH BATTLE') || name.includes('QUIZ') || name.includes('BATTLE')) {
    return EVENT_STICKERS['tech-03'];
  }
  if (name.includes('WEB') || name.includes('PROMPT') || alias.includes('PROMPT') || alias.includes('WEB')) {
    return EVENT_STICKERS['tech-04'];
  }
  if (name.includes('UI/UX') || alias.includes('UI/UX') || name.includes('UI') || alias.includes('DESIGN') || name.includes('PROTOTYPE')) {
    return EVENT_STICKERS['tech-06'];
  }
  if (name.includes('SNAP') || alias.includes('SNAP') || name.includes('REEL') || alias.includes('REEL') || name.includes('MEDIA')) {
    return EVENT_STICKERS['nontech-01'];
  }
  if (name.includes('LINK UP') || alias.includes('LINK UP') || name.includes('CONNECTION') || alias.includes('CONNECTION') || name.includes('LINK')) {
    return EVENT_STICKERS['nontech-02'];
  }
  if (name.includes('HUNT ZONE') || alias.includes('HUNT ZONE') || name.includes('TREASURE HUNT') || alias.includes('TREASURE') || name.includes('HUNT')) {
    return EVENT_STICKERS['nontech-03'];
  }
  if (name.includes('HENNA') || name.includes('MEHANDI') || alias.includes('HENNA') || alias.includes('MEHANDI') || name.includes('HEIST')) {
    return EVENT_STICKERS['nontech-04'];
  }
  if (name.includes('BATTLE OF CHAMPIONS') || name.includes('ESPORTS') || name.includes('E-SPORTS') || name.includes('GAMING') || alias.includes('BATTLE OF CHAMPIONS') || alias.includes('ESPORTS')) {
    return EVENT_STICKERS['nontech-05'];
  }
  if (name.includes('64 SQUARES') || name.includes('CHESS') || alias.includes('CHESS') || alias.includes('64 SQUARES')) {
    return EVENT_STICKERS['nontech-06'];
  }
  if (name.includes('BIDDING') || alias.includes('BIDDING') || name.includes('AUCTION') || alias.includes('AUCTION') || name.includes('BATTLEWORLD')) {
    return EVENT_STICKERS['nontech-07'];
  }

  return null;
}
