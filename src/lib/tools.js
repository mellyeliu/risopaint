import { stamps, getStampImage, getStampImageAlt } from './stamps.js';
import { getDitheredStamp } from './dither.js';
import { applyGrain } from './grain.js';

const GRID_SIZE = 12;

// Grid edge helpers
function getClosestEdge(px, py, prevEdge) {
  const cellX = Math.floor(px / GRID_SIZE) * GRID_SIZE;
  const cellY = Math.floor(py / GRID_SIZE) * GRID_SIZE;
  const dx = px - cellX;
  const dy = py - cellY;
  const candidates = [
    { edge: `h:${cellX},${cellY}`, dist: dy },
    { edge: `h:${cellX},${cellY + GRID_SIZE}`, dist: GRID_SIZE - dy },
    { edge: `v:${cellX},${cellY}`, dist: dx },
    { edge: `v:${cellX + GRID_SIZE},${cellY}`, dist: GRID_SIZE - dx },
  ];
  if (prevEdge) {
    const prevEnds = getEdgeEndpoints(prevEdge);
    for (const c of candidates) {
      const cEnds = getEdgeEndpoints(c.edge);
      const connects = prevEnds.some(p => cEnds.some(q => p[0] === q[0] && p[1] === q[1]));
      if (connects) c.dist -= GRID_SIZE * 0.4;
    }
  }
  candidates.sort((a, b) => a.dist - b.dist);
  return candidates[0].edge;
}

function getEdgeEndpoints(edge) {
  const [dir, coords] = edge.split(':');
  const [ex, ey] = coords.split(',').map(Number);
  if (dir === 'h') return [[ex, ey], [ex + GRID_SIZE, ey]];
  return [[ex, ey], [ex, ey + GRID_SIZE]];
}

export function drawStroke(ctx, stroke, state) {
  if (stroke.type === 'fill') {
    const canvas = ctx.canvas;
    const pw = canvas.width;
    const ph = canvas.height;
    const dpr = window.devicePixelRatio;

    if (stroke.x == null || stroke.y == null) {
      // Legacy fill — solid background
      const w = pw / dpr;
      const h = ph / dpr;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = stroke.color;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      return;
    }

    // Flood fill at click position
    const sx = Math.floor(stroke.x * dpr);
    const sy = Math.floor(stroke.y * dpr);
    if (sx < 0 || sx >= pw || sy < 0 || sy >= ph) return;

    const imageData = ctx.getImageData(0, 0, pw, ph);
    const data = imageData.data;
    const idx = (sy * pw + sx) * 4;
    const targetR = data[idx], targetG = data[idx + 1], targetB = data[idx + 2], targetA = data[idx + 3];

    // Parse fill color
    const tmp = document.createElement('canvas');
    tmp.width = 1; tmp.height = 1;
    const tmpCtx = tmp.getContext('2d');
    tmpCtx.fillStyle = stroke.color;
    tmpCtx.fillRect(0, 0, 1, 1);
    const fillData = tmpCtx.getImageData(0, 0, 1, 1).data;
    const fillR = fillData[0], fillG = fillData[1], fillB = fillData[2], fillA = fillData[3];

    // Don't fill if target is already the fill color
    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) return;

    const tolerance = 30;
    const match = (i) => {
      return Math.abs(data[i] - targetR) <= tolerance &&
             Math.abs(data[i + 1] - targetG) <= tolerance &&
             Math.abs(data[i + 2] - targetB) <= tolerance &&
             Math.abs(data[i + 3] - targetA) <= tolerance;
    };

    const stack = [sx, sy];
    const visited = new Uint8Array(pw * ph);

    while (stack.length > 0) {
      const cy = stack.pop();
      const cx = stack.pop();
      const pos = cy * pw + cx;
      if (cx < 0 || cx >= pw || cy < 0 || cy >= ph) continue;
      if (visited[pos]) continue;
      const pi = pos * 4;
      if (!match(pi)) continue;
      visited[pos] = 1;
      data[pi] = fillR;
      data[pi + 1] = fillG;
      data[pi + 2] = fillB;
      data[pi + 3] = fillA;
      stack.push(cx + 1, cy);
      stack.push(cx - 1, cy);
      stack.push(cx, cy + 1);
      stack.push(cx, cy - 1);
    }

    ctx.putImageData(imageData, 0, 0);
  } else if (stroke.type === 'brush' || stroke.type === 'erase') {
    if (!stroke.cells || stroke.cells.length < 1) return;
    ctx.save();
    if (stroke.type === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.fillStyle = stroke.color;
      ctx.globalAlpha = 1;
    }
    const brushCells = Math.max(1, Math.round(stroke.size / GRID_SIZE));
    for (const key of stroke.cells) {
      const [gx, gy] = key.split(',').map(Number);
      for (let dx = 0; dx < brushCells; dx++) {
        for (let dy = 0; dy < brushCells; dy++) {
          ctx.fillRect(gx + dx * GRID_SIZE, gy + dy * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
      }
    }
    ctx.restore();
  } else if (stroke.type === 'stamp') {
    const stamp = stamps[stroke.stampIndex];
    if (!stamp) return;
    const img = getStampImage(stamp);
    const s = stroke.size;
    if (img.complete && img.naturalWidth > 0) {
      const dithered = getDitheredStamp(stamp, img, Math.round(s * window.devicePixelRatio), {
        pixelScale: 3,
        mode: 'riso',
      });

      ctx.save();
      if (state?.liveMode) {
        const time = performance.now() * 0.001;
        const id = stroke.x * 31 + stroke.y * 17;
        const drawImg = dithered || img;

        if (stamp.name === 'butterfly') {
          const flutter = 0.7 + Math.sin(time * 3 + id) * 0.3;
          ctx.translate(stroke.x, stroke.y);
          ctx.scale(flutter, 1);
          ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
        } else if (stamp.name === 'cloud') {
          const drift = Math.sin(time * 0.15 + id * 0.1) * 5;
          ctx.translate(stroke.x + drift, stroke.y);
          ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
        } else if (stamp.name === 'ladybug') {
          const wingPhase = Math.sin(time * 2 + id);
          const isOpen = wingPhase > 0.3;
          ctx.translate(stroke.x, stroke.y);
          if (isOpen && stamp.svgOpen) {
            const altImg = getStampImageAlt(stamp);
            if (altImg && altImg.complete) {
              const altDithered = getDitheredStamp({ name: stamp.name + '-open', svg: stamp.svgOpen }, altImg, Math.round(s * window.devicePixelRatio), { pixelScale: 3, mode: 'riso' });
              ctx.drawImage(altDithered || altImg, -s / 2, -s / 2, s, s);
            } else {
              ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
            }
          } else {
            ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
          }
        } else if (stamp.name === 'rainbow') {
          const shimmer = Math.sin(time * 1.5 + id) * 0.01;
          ctx.translate(stroke.x, stroke.y);
          ctx.transform(1, 0, shimmer, 1, 0, 0);
          ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
        } else if (stamp.name === 'sparkle' || stamp.name === 'four-star') {
          const pulse = 1 + Math.sin(time * 1.2 + id) * 0.03;
          ctx.translate(stroke.x, stroke.y);
          ctx.scale(pulse, pulse);
          ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
        } else if (stamp.name === 'flower' || stamp.name === 'lotus') {
          const sway = Math.sin(time * 0.6 + id) * 0.02;
          ctx.translate(stroke.x, stroke.y + s / 2);
          ctx.rotate(sway);
          ctx.drawImage(drawImg, -s / 2, -s, s, s);
        } else {
          const wobble = Math.sin(time * 0.7 + id) * 0.6;
          const pulse = 1 + Math.sin(time * 1 + id * 0.7) * 0.008;
          const rotate = Math.sin(time * 0.4 + id * 0.5) * 0.015;
          ctx.translate(stroke.x, stroke.y);
          ctx.rotate(rotate);
          ctx.scale(pulse, pulse);
          ctx.drawImage(drawImg, -s / 2, -s / 2 + wobble, s, s);
        }
      } else {
        if (dithered) {
          ctx.drawImage(dithered, stroke.x - s / 2, stroke.y - s / 2, s, s);
        } else {
          ctx.drawImage(img, stroke.x - s / 2, stroke.y - s / 2, s, s);
        }
      }
      ctx.restore();
    }
  } else if (stroke.type === 'splatter' || stroke.type === 'confetti') {
    if (stroke.cells) {
      stroke.cells.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.fillRect(c.gx, c.gy, GRID_SIZE, GRID_SIZE);
      });
    }
  } else if (stroke.type === 'text') {
    ctx.save();
    ctx.font = `400 ${stroke.size}px Helvetica, Arial, sans-serif`;
    ctx.fillStyle = stroke.color;
    const lines = stroke.text.split('\n');
    for (let l = 0; l < lines.length; l++) {
      ctx.fillText(lines[l], stroke.x, stroke.y + l * stroke.size * 1.2);
    }
    ctx.restore();
  } else if (stroke.type === 'gridline') {
    if (!stroke.cells || stroke.cells.length < 1) return;
    ctx.save();
    ctx.strokeStyle = stroke.color || '#000';
    ctx.lineWidth = Math.max(0.5, (stroke.size || 6) / 6);
    const cellSet = new Set(stroke.cells);
    for (const key of stroke.cells) {
      const [gx, gy] = key.split(',').map(Number);
      if (!cellSet.has(`${gx},${gy - GRID_SIZE}`)) {
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + GRID_SIZE, gy); ctx.stroke();
      }
      if (!cellSet.has(`${gx},${gy + GRID_SIZE}`)) {
        ctx.beginPath(); ctx.moveTo(gx, gy + GRID_SIZE); ctx.lineTo(gx + GRID_SIZE, gy + GRID_SIZE); ctx.stroke();
      }
      if (!cellSet.has(`${gx - GRID_SIZE},${gy}`)) {
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + GRID_SIZE); ctx.stroke();
      }
      if (!cellSet.has(`${gx + GRID_SIZE},${gy}`)) {
        ctx.beginPath(); ctx.moveTo(gx + GRID_SIZE, gy); ctx.lineTo(gx + GRID_SIZE, gy + GRID_SIZE); ctx.stroke();
      }
    }
    ctx.restore();
  } else if (stroke.type === 'crayon') {
    if (!stroke.points || stroke.points.length < 1) return;
    ctx.save();
    const size = Math.max(stroke.size, 2);
    ctx.fillStyle = stroke.color;
    for (let i = 0; i < stroke.points.length; i++) {
      const p = stroke.points[i];
      const count = Math.max(5, Math.floor(size));
      for (let j = 0; j < count; j++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random());
        const spread = size * dist * 1.5;
        const ox = Math.cos(angle) * spread;
        const oy = Math.sin(angle) * spread;
        const r = Math.random() * Math.max(1, size * 0.2) + 0.5;
        const falloff = 1 - dist;
        ctx.globalAlpha = falloff * falloff * (0.35 + Math.random() * 0.35);
        ctx.beginPath();
        ctx.ellipse(p.x + ox, p.y + oy, r, r * (0.5 + Math.random() * 1), Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  } else if (stroke.type === 'marker') {
    if (!stroke.points || stroke.points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const size = Math.max(stroke.size, 2);
    ctx.lineWidth = size * 0.6;

    // Draw multiple wobbly passes for a doodled pen look
    const passes = 2;
    for (let pass = 0; pass < passes; pass++) {
      ctx.beginPath();
      const pts = stroke.points;
      ctx.moveTo(
        pts[0].x + Math.sin(pass * 4.1) * 0.3,
        pts[0].y + Math.cos(pass * 3.7) * 0.3
      );
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const p = pts[i];
        const wobble = Math.sin(i * 3.7 + pass * 2.1) * (size * 0.06);
        const mx = (prev.x + p.x) / 2 + wobble;
        const my = (prev.y + p.y) / 2 + Math.cos(i * 2.3 + pass * 1.3) * (size * 0.05);
        ctx.quadraticCurveTo(
          prev.x + Math.sin(i * 5.3 + pass) * 0.2,
          prev.y + Math.cos(i * 4.1 + pass) * 0.2,
          mx, my
        );
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }

    ctx.restore();
  } else if (stroke.type === 'start' || stroke.type === 'finish') {
    ctx.save();
    const fw = stroke.width || 50;
    const fh = stroke.height || 60;
    const fx = stroke.x - fw / 2;
    const fy = stroke.y - fh;
    const color = stroke.type === 'start' ? '#2ecc71' : '#e74c3c';
    const label = stroke.type === 'start' ? 'start' : 'finish';
    // Dotted rectangle
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(fx, fy, fw, fh);
    ctx.setLineDash([]);
    // Platform bottom — solid black line
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(fx - 5, stroke.y);
    ctx.lineTo(fx + fw + 5, stroke.y);
    ctx.stroke();
    // Flag
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(fx + fw / 2, fy);
    ctx.lineTo(fx + fw / 2 + 15, fy + 8);
    ctx.lineTo(fx + fw / 2, fy + 16);
    ctx.fill();
    // Pole
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx + fw / 2, fy);
    ctx.lineTo(fx + fw / 2, fy + fh);
    ctx.stroke();
    // Label
    ctx.fillStyle = color;
    ctx.font = "bold 10px 'Velvelyne', serif";
    ctx.textAlign = 'center';
    ctx.fillText(label, stroke.x, fy - 4);
    ctx.restore();
  }
}

// Cached grid pattern
let gridCache = null;
let gridCacheW = 0;
let gridCacheH = 0;

function getGridPattern(w, h) {
  if (gridCache && gridCacheW === w && gridCacheH === h) return gridCache;
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext('2d');
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = 0; x <= w; x += GRID_SIZE) {
    ctx.moveTo(x, 0); ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += GRID_SIZE) {
    ctx.moveTo(0, y); ctx.lineTo(w, y);
  }
  ctx.stroke();
  gridCache = offscreen;
  gridCacheW = w;
  gridCacheH = h;
  return offscreen;
}

// Reusable pixelation canvas
let pixelCanvas = null;

export function redrawCanvas(canvas, strokes, currentStroke, state, previewPos) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;

  if (!state.smearMode || !canvas._hasDrawn || strokes.length === 0) {
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(getGridPattern(w, h), 0, 0);
    canvas._hasDrawn = true;
  }

  // Draw all strokes
  for (let i = 0; i < strokes.length; i++) {
    drawStroke(ctx, strokes[i], state);
  }
  if (currentStroke) drawStroke(ctx, currentStroke, state);

  // Pixelation
  if (state.pixelation > 1) {
    const scale = 1 / state.pixelation;
    const tw = Math.floor(w * scale);
    const th = Math.floor(h * scale);
    if (!pixelCanvas) pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = tw;
    pixelCanvas.height = th;
    const tempCtx = pixelCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(canvas, 0, 0, tw, th);
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pixelCanvas, 0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
  }

  applyGrain(ctx, w, h, 25);
}

export function interpolateCells(lastKey, gx, gy, cellSet, cells) {
  const [lx, ly] = lastKey.split(',').map(Number);
  const dx = gx - lx;
  const dy = gy - ly;
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) / GRID_SIZE;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ix = Math.floor((lx + dx * t) / GRID_SIZE) * GRID_SIZE;
    const iy = Math.floor((ly + dy * t) / GRID_SIZE) * GRID_SIZE;
    const key = `${ix},${iy}`;
    if (!cellSet.has(key)) {
      cellSet.add(key);
      cells.push(key);
    }
  }
}

export { GRID_SIZE, getClosestEdge };
