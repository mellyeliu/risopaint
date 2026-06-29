let seed = 1;
function fastRandom() {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 16) & 0xff;
}

export function applyGrain(ctx, w, h, amount = 25) {
  const pw = Math.floor(w * window.devicePixelRatio);
  const ph = Math.floor(h * window.devicePixelRatio);
  if (pw <= 0 || ph <= 0) return;
  const imageData = ctx.getImageData(0, 0, pw, ph);
  const pixels = new Uint32Array(imageData.data.buffer);
  const len = pixels.length;
  const range = amount * 2 + 1;
  seed = (seed + 1) | 1;
  for (let i = 0; i < len; i++) {
    const px = pixels[i];
    const a = (px >>> 24) & 0xff;
    if (a === 0) continue;
    const offset = (fastRandom() % range) - amount;
    const r = Math.max(0, Math.min(255, (px & 0xff) + offset));
    const g = Math.max(0, Math.min(255, ((px >> 8) & 0xff) + offset));
    const b = Math.max(0, Math.min(255, ((px >> 16) & 0xff) + offset));
    pixels[i] = (a << 24) | (b << 16) | (g << 8) | r;
  }
  ctx.putImageData(imageData, 0, 0);
}
