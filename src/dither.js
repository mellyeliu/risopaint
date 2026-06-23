// Riso-style dithering effects
// Uses geometric shape patterns (circles, squares, hatching) to simulate
// risograph print texture — not standard Bayer, but shape-based halftoning

// 8x8 Bayer matrix for fallback ordered dithering
const BAYER_8x8 = [
  [ 0/64, 32/64,  8/64, 40/64,  2/64, 34/64, 10/64, 42/64],
  [48/64, 16/64, 56/64, 24/64, 50/64, 18/64, 58/64, 26/64],
  [12/64, 44/64,  4/64, 36/64, 14/64, 46/64,  6/64, 38/64],
  [60/64, 28/64, 52/64, 20/64, 62/64, 30/64, 54/64, 22/64],
  [ 3/64, 35/64, 11/64, 43/64,  1/64, 33/64,  9/64, 41/64],
  [51/64, 19/64, 59/64, 27/64, 49/64, 17/64, 57/64, 25/64],
  [15/64, 47/64,  7/64, 39/64, 13/64, 45/64,  5/64, 37/64],
  [63/64, 31/64, 55/64, 23/64, 61/64, 29/64, 53/64, 21/64],
];

// Riso ink palette — a limited set of spot colors
const RISO_PALETTE = [
  [232, 80, 122],   // fluorescent pink
  [255, 107, 129],  // bright pink
  [50, 85, 164],    // blue
  [58, 123, 213],   // mid blue
  [129, 212, 250],  // light blue
  [92, 184, 92],    // green
  [129, 199, 132],  // light green
  [26, 26, 46],     // near-black
  [232, 200, 64],   // yellow
  [255, 238, 88],   // bright yellow
  [212, 98, 43],    // orange
  [255, 138, 80],   // bright orange
  [123, 104, 174],  // purple
  [158, 62, 107],   // wine
  [58, 158, 149],   // teal
  [196, 149, 106],  // tan
  [255, 255, 255],  // white
  [240, 236, 228],  // paper
  [107, 101, 120],  // warm gray
];

/**
 * Apply riso-style dithering to a stamp image.
 * Renders with geometric shape patterns per-channel for that
 * characteristic overprint / registration-offset look.
 */
export function ditherImage(img, size, opts = {}) {
  const {
    pixelScale = 3,
    mode = 'riso',       // 'riso' | 'halftone' | 'crosshatch' | 'color'
    threshold = 0,
    separation = true,   // color separation into riso channels
  } = opts;

  const renderSize = Math.floor(size / pixelScale);
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = renderSize;
  srcCanvas.height = renderSize;
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.drawImage(img, 0, 0, renderSize, renderSize);
  const imageData = srcCtx.getImageData(0, 0, renderSize, renderSize);
  const data = imageData.data;

  if (mode === 'riso') {
    // Separate into 2-3 riso ink channels and dither each
    applyRisoDither(data, renderSize, threshold);
  } else if (mode === 'halftone') {
    applyHalftoneDither(data, renderSize, threshold);
  } else if (mode === 'crosshatch') {
    applyCrosshatchDither(data, renderSize, threshold);
  } else {
    // Fallback: ordered color dithering
    applyOrderedDither(data, renderSize, threshold);
  }

  srcCtx.putImageData(imageData, 0, 0);

  // Scale up with nearest-neighbor for crispy pixels
  const outCanvas = document.createElement('canvas');
  outCanvas.width = size;
  outCanvas.height = size;
  const outCtx = outCanvas.getContext('2d');
  outCtx.imageSmoothingEnabled = false;
  outCtx.drawImage(srcCanvas, 0, 0, size, size);

  return outCanvas;
}

function applyRisoDither(data, size, threshold) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];

      if (a < 10) continue;

      // Find nearest riso color
      const nearest = findNearestRiso(r, g, b);
      const bayerVal = BAYER_8x8[y % 8][x % 8] + threshold;

      // Mix based on distance — further from pure color = more dithered
      const dist = colorDist(r, g, b, nearest[0], nearest[1], nearest[2]);
      const normalizedDist = Math.min(dist / 300, 1);

      // Dither: if pixel is "between" colors, use bayer to decide
      if (normalizedDist > bayerVal * 0.5) {
        // Show paper (empty) for some pixels to create halftone effect
        const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        if (lum > bayerVal + 0.3) {
          data[i] = 255; data[i+1] = 255; data[i+2] = 255; // white
        } else {
          data[i] = nearest[0]; data[i+1] = nearest[1]; data[i+2] = nearest[2];
        }
      } else {
        data[i] = nearest[0]; data[i+1] = nearest[1]; data[i+2] = nearest[2];
      }

      // Dither alpha for feathered edges
      if (a < 240 && a > 10) {
        data[i+3] = (a / 255) > bayerVal ? 255 : 0;
      }
    }
  }
}

function applyHalftoneDither(data, size, threshold) {
  // Circular halftone dots — vary dot size by luminance
  const dotSize = 4;
  for (let by = 0; by < size; by += dotSize) {
    for (let bx = 0; bx < size; bx += dotSize) {
      // Average luminance in this cell
      let totalR = 0, totalG = 0, totalB = 0, count = 0;
      for (let dy = 0; dy < dotSize && by + dy < size; dy++) {
        for (let dx = 0; dx < dotSize && bx + dx < size; dx++) {
          const i = ((by + dy) * size + (bx + dx)) * 4;
          if (data[i + 3] < 10) continue;
          totalR += data[i]; totalG += data[i+1]; totalB += data[i+2];
          count++;
        }
      }
      if (count === 0) continue;

      const avgR = totalR / count, avgG = totalG / count, avgB = totalB / count;
      const lum = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114) / 255;
      const nearest = findNearestRiso(avgR, avgG, avgB);
      const radius = (1 - lum) * (dotSize / 2);

      // Draw: pixels within radius get ink color, outside get paper
      const cx = dotSize / 2, cy = dotSize / 2;
      for (let dy = 0; dy < dotSize && by + dy < size; dy++) {
        for (let dx = 0; dx < dotSize && bx + dx < size; dx++) {
          const i = ((by + dy) * size + (bx + dx)) * 4;
          if (data[i + 3] < 10) continue;
          const dist = Math.sqrt((dx - cx) ** 2 + (dy - cy) ** 2);
          if (dist <= radius + threshold) {
            data[i] = nearest[0]; data[i+1] = nearest[1]; data[i+2] = nearest[2];
          } else {
            data[i] = 255; data[i+1] = 255; data[i+2] = 255;
          }
        }
      }
    }
  }
}

function applyCrosshatchDither(data, size, threshold) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const a = data[i + 3];
      if (a < 10) continue;

      const r = data[i], g = data[i+1], b = data[i+2];
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const nearest = findNearestRiso(r, g, b);

      // Hatching: diagonal lines at different densities
      const hatch1 = ((x + y) % 4 === 0); // sparse diagonal
      const hatch2 = ((x + y) % 3 === 0); // medium diagonal
      const hatch3 = ((x - y + size) % 4 === 0); // cross diagonal
      const hatch4 = ((x - y + size) % 3 === 0); // dense cross

      let showInk;
      if (lum < 0.2) {
        showInk = true; // very dark: solid
      } else if (lum < 0.4) {
        showInk = hatch2 || hatch4; // dark: cross hatch
      } else if (lum < 0.6) {
        showInk = hatch1 || hatch3; // mid: sparse cross
      } else if (lum < 0.8) {
        showInk = hatch1; // light: sparse single
      } else {
        showInk = false; // very light: paper
      }

      if (showInk) {
        data[i] = nearest[0]; data[i+1] = nearest[1]; data[i+2] = nearest[2];
      } else {
        data[i] = 255; data[i+1] = 255; data[i+2] = 255;
      }

      if (a < 240 && a > 10) {
        const bayerVal = BAYER_8x8[y % 8][x % 8];
        data[i+3] = (a / 255) > bayerVal ? 255 : 0;
      }
    }
  }
}

function applyOrderedDither(data, size, threshold) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (data[i+3] < 10) continue;
      const r = data[i], g = data[i+1], b = data[i+2];
      const bayerVal = BAYER_8x8[y % 8][x % 8] + threshold;
      const levels = 3;
      data[i] = ditherChannel(r, bayerVal, levels);
      data[i+1] = ditherChannel(g, bayerVal, levels);
      data[i+2] = ditherChannel(b, bayerVal, levels);
    }
  }
}

function ditherChannel(value, bayerValue, levels) {
  const normalized = value / 255;
  const step = 1 / (levels - 1);
  const lower = Math.floor(normalized / step) * step;
  const upper = Math.min(lower + step, 1);
  const localThreshold = (normalized - lower) / step;
  const quantized = localThreshold > bayerValue ? upper : lower;
  return Math.round(quantized * 255);
}

function findNearestRiso(r, g, b) {
  let best = RISO_PALETTE[0];
  let bestDist = Infinity;
  for (const color of RISO_PALETTE) {
    const d = colorDist(r, g, b, color[0], color[1], color[2]);
    if (d < bestDist) { bestDist = d; best = color; }
  }
  return best;
}

function colorDist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}

// ── Cache ──
const ditherCache = new Map();

export function getDitheredStamp(stamp, img, size, opts = {}) {
  const key = `${stamp.name}-${size}-${opts.pixelScale || 3}-${opts.mode || 'riso'}`;
  if (ditherCache.has(key)) return ditherCache.get(key);
  if (!img.complete || img.naturalWidth === 0) return null;

  const canvas = ditherImage(img, size, opts);
  ditherCache.set(key, canvas);
  return canvas;
}

export function clearDitherCache() {
  ditherCache.clear();
}
