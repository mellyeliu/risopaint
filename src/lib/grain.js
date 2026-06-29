export function applyGrain(ctx, w, h, amount = 25) {
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
