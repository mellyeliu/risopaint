const GRAIN_FRAMES = 6;
const GRAIN_TILE = 512;
let grainCanvases = null;
let grainFrame = 0;
let cachedPattern = null;
let cachedPatternFrame = -1;

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
      const v = 128 + Math.floor(Math.random() * 51) - 25;
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
  const fi = grainFrame % GRAIN_FRAMES;
  grainFrame++;

  if (cachedPatternFrame !== fi || !cachedPattern) {
    cachedPattern = ctx.createPattern(grainCanvases[fi], 'repeat');
    cachedPatternFrame = fi;
  }

  ctx.save();
  ctx.globalAlpha = amount / 50;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = cachedPattern;
  ctx.fillRect(0, 0, pw, ph);
  ctx.restore();
}
