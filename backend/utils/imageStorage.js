const fs = require('fs');
const path = require('path');

/**
 * Saves base64 image data to local assets and public folders on disk,
 * and returns the relative asset URL to be stored in DB.
 *
 * @param {string} imageStr - Base64 data URI or existing URL/path
 * @param {string} prefix - 'event', 'venue', 'sponsor', or custom prefix
 * @returns {string} - Clean URL path (e.g. '/events/event-xxx.png' or '/sponsors/sponsor-xxx.png')
 */
const saveBase64ImageIfPresent = (imageStr, prefix = 'event') => {
  if (!imageStr || typeof imageStr !== 'string') return imageStr || '';
  const trimmed = imageStr.trim();
  if (!trimmed.startsWith('data:image/')) return trimmed;

  try {
    const matches = trimmed.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return trimmed;
    const mimeType = matches[1].toLowerCase();
    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') 
      ? 'jpg' 
      : (mimeType.includes('webp') ? 'webp' : (mimeType.includes('svg') ? 'svg' : 'png'));
    
    const safeName = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const imageBuffer = Buffer.from(matches[2], 'base64');

    // Target storage directories
    const frontendPublicEventsDir = path.join(__dirname, '../../frontend/public/events');
    const frontendPublicSponsorsDir = path.join(__dirname, '../../frontend/public/sponsors');
    const frontendAssetsDir = path.join(__dirname, '../../frontend/src/assets');
    const localUploadsDir = path.join(__dirname, '../uploads');

    const allDirs = [
      frontendPublicEventsDir, 
      frontendPublicSponsorsDir, 
      frontendAssetsDir, 
      localUploadsDir
    ];

    allDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
      }
    });

    // Write copy to frontend/src/assets
    try {
      if (fs.existsSync(frontendAssetsDir)) {
        fs.writeFileSync(path.join(frontendAssetsDir, safeName), imageBuffer);
      }
    } catch (e) {
      console.warn('[imageStorage] Error writing to frontend/src/assets:', e.message);
    }

    // Write copy to backend/uploads
    try {
      if (fs.existsSync(localUploadsDir)) {
        fs.writeFileSync(path.join(localUploadsDir, safeName), imageBuffer);
      }
    } catch (e) {
      console.warn('[imageStorage] Error writing to backend/uploads:', e.message);
    }

    // Determine target public folder and URL
    const isSponsor = prefix.toLowerCase().includes('sponsor');
    if (isSponsor) {
      try {
        if (fs.existsSync(frontendPublicSponsorsDir)) {
          fs.writeFileSync(path.join(frontendPublicSponsorsDir, safeName), imageBuffer);
        }
      } catch (e) {
        console.warn('[imageStorage] Error writing to frontend/public/sponsors:', e.message);
      }
      return `/sponsors/${safeName}`;
    } else {
      try {
        if (fs.existsSync(frontendPublicEventsDir)) {
          fs.writeFileSync(path.join(frontendPublicEventsDir, safeName), imageBuffer);
        }
      } catch (e) {
        console.warn('[imageStorage] Error writing to frontend/public/events:', e.message);
      }
      return `/events/${safeName}`;
    }
  } catch (e) {
    console.error('[imageStorage] Error saving base64 image to assets:', e);
    return trimmed;
  }
};

module.exports = {
  saveBase64ImageIfPresent
};
