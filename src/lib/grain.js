// Cached grain overlay — generate once, reuse
let grainCache = null;
let grainCacheW = 0;
let grainCacheH = 0;

function getGrainOverlay(w, h) {
  const pw = Math.floor(w * window.devicePixelRatio);
  const ph = Math.floor(h * window.devicePixelRatio);
  if (pw <= 0 || ph <= 0) return null;

  // Reuse if size matches
  if (grainCache && grainCacheW === pw && grainCacheH === ph) return grainCache;

  const offscreen = document.createElement('canvas');
  offscreen.width = pw;
  offscreen.height = ph;
  const ctx = offscreen.getContext('2d');
  const imageData = ctx.createImageData(pw, ph);
  const pixels = new Uint32Array(imageData.data.buffer);
  const len = pixels.length;
  for (let i = 0; i < len; i++) {
    const v = Math.floor(Math.random() * 50) - 25;
    // Store as semi-transparent noise: alpha controls blend strength
    const clamped = 128 + v;
    pixels[i] = (18 << 24) | (clamped << 16) | (clamped << 8) | clamped;
  }
  ctx.putImageData(imageData, 0, 0);

  grainCache = offscreen;
  grainCacheW = pw;
  grainCacheH = ph;
  return offscreen;
}

export function applyGrain(ctx, w, h, amount = 25) {
  const overlay = getGrainOverlay(w, h);
  if (!overlay) return;
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.drawImage(overlay, 0, 0, w, h);
  ctx.restore();
}

// For gallery export — full quality per-pixel grain
export function applyGrainExport(ctx, w, h, amount = 25) {
  const pw = Math.floor(w * window.devicePixelRatio);
  const ph = Math.floor(h * window.devicePixelRatio);
  if (pw <= 0 || ph <= 0) return;
  const imageData = ctx.getImageData(0, 0, pw, ph);
  const pixels = new Uint32Array(imageData.data.buffer);
  const len = pixels.length;
  for (let i = 0; i < len; i++) {
    const px = pixels[i];
    const a = (px >>> 24) & 0xff;
    if (a === 0) continue;
    const offset = Math.floor(Math.random() * (amount * 2 + 1)) - amount;
    const r = Math.max(0, Math.min(255, (px & 0xff) + offset));
    const g = Math.max(0, Math.min(255, ((px >> 8) & 0xff) + offset));
    const b = Math.max(0, Math.min(255, ((px >> 16) & 0xff) + offset));
    pixels[i] = (a << 24) | (b << 16) | (g << 8) | r;
  }
  ctx.putImageData(imageData, 0, 0);
}
