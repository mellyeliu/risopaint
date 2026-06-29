const GRAIN_FRAMES = 4;
const GRAIN_TILE = 256;
let grainCanvases = null;
let grainFrame = 0;

function initGrainFrames() {
  if (grainCanvases) return;
  grainCanvases = [];
  for (let f = 0; f < GRAIN_FRAMES; f++) {
    const c = document.createElement('canvas');
    c.width = GRAIN_TILE;
    c.height = GRAIN_TILE;
    const ctx = c.getContext('2d');
    const imageData = ctx.createImageData(GRAIN_TILE, GRAIN_TILE);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 50);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    grainCanvases.push(c);
  }
}

export function applyGrain(ctx, w, h, amount = 25) {
  const pw = Math.floor(w);
  const ph = Math.floor(h);
  if (pw <= 0 || ph <= 0) return;

  initGrainFrames();
  const tile = grainCanvases[grainFrame % GRAIN_FRAMES];
  grainFrame++;

  ctx.save();
  ctx.globalAlpha = amount / 100;
  ctx.globalCompositeOperation = 'overlay';
  const pat = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, pw, ph);
  ctx.restore();
}
