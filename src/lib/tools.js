import { stamps, getStampImage, getStampImageAlt } from './stamps.js';
import { getDitheredStamp } from './dither.js';
import { applyGrain } from './grain.js';

const GRID_SIZE = 16;

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
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = stroke.color;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else if (stroke.type === 'brush' || stroke.type === 'erase') {
    if (!stroke.cells || stroke.cells.length < 1) return;
    ctx.save();
    if (stroke.type === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.fillStyle = stroke.color;
      ctx.globalAlpha = 0.9;
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
          const flutter = 0.85 + Math.sin(time * 6 + id) * 0.15;
          ctx.translate(stroke.x, stroke.y);
          ctx.scale(flutter, 1);
          ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
        } else if (stamp.name === 'cloud') {
          const drift = Math.sin(time * 0.3 + id * 0.1) * 8;
          ctx.translate(stroke.x + drift, stroke.y);
          ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
        } else if (stamp.name === 'ladybug') {
          const wingPhase = Math.sin(time * 1.5 + id);
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
          const shimmer = Math.sin(time * 3 + id) * 0.02;
          ctx.translate(stroke.x, stroke.y);
          ctx.transform(1, 0, shimmer, 1, 0, 0);
          ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
        } else if (stamp.name === 'sparkle' || stamp.name === 'four-star') {
          const pulse = 1 + Math.sin(time * 2.5 + id) * 0.06;
          ctx.translate(stroke.x, stroke.y);
          ctx.scale(pulse, pulse);
          ctx.drawImage(drawImg, -s / 2, -s / 2, s, s);
        } else if (stamp.name === 'flower' || stamp.name === 'lotus') {
          const sway = Math.sin(time * 1.2 + id) * 0.04;
          ctx.translate(stroke.x, stroke.y + s / 2);
          ctx.rotate(sway);
          ctx.drawImage(drawImg, -s / 2, -s, s, s);
        } else {
          const wobble = Math.sin(time * 1.5 + id) * 1.2;
          const pulse = 1 + Math.sin(time * 2 + id * 0.7) * 0.015;
          const rotate = Math.sin(time * 0.8 + id * 0.5) * 0.03;
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
    ctx.font = `${stroke.size}px 'Syne Mono', monospace`;
    ctx.fillStyle = stroke.color;
    ctx.fillText(stroke.text, stroke.x, stroke.y);
    ctx.restore();
  } else if (stroke.type === 'gridline') {
    if (!stroke.cells || stroke.cells.length < 1) return;
    ctx.save();
    ctx.strokeStyle = stroke.color || '#000';
    ctx.lineWidth = 1;
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
        const dist = (Math.random() + Math.random() + Math.random()) / 3;
        const spread = size * (0.3 + dist * 1.5);
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
  } else if (stroke.type === 'fractal') {
    if (!stroke.points || stroke.points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.6;
    const size = Math.max(stroke.size, 4);
    for (let i = 1; i < stroke.points.length; i++) {
      const p = stroke.points[i];
      const prev = stroke.points[i - 1];
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      if (i % 4 === 0) {
        const dx = p.x - prev.x;
        const dy = p.y - prev.y;
        const angle = Math.atan2(dy, dx);
        const len = size * (0.3 + Math.random() * 0.8);
        const spread = 0.5 + Math.random() * 0.7;
        for (const sign of [-1, 1]) {
          const branchAngle = angle + sign * spread;
          let bx = p.x, by = p.y, bLen = len, depth = 0, curAngle = branchAngle;
          while (depth < 2 && bLen > 2) {
            const ex = bx + Math.cos(curAngle) * bLen;
            const ey = by + Math.sin(curAngle) * bLen;
            ctx.globalAlpha = 0.4 - depth * 0.12;
            ctx.lineWidth = Math.max(0.3, 0.7 - depth * 0.2);
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
            if (Math.random() > 0.4) {
              const subAngle = curAngle + (Math.random() - 0.5) * 1.2;
              const subLen = bLen * 0.6;
              const sx = ex + Math.cos(subAngle) * subLen;
              const sy = ey + Math.sin(subAngle) * subLen;
              ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(sx, sy); ctx.stroke();
            }
            bx = ex; by = ey; bLen *= 0.6;
            curAngle += (Math.random() - 0.5) * 0.6;
            depth++;
          }
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.restore();
  }
}

export function redrawCanvas(canvas, strokes, currentStroke, state) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;

  ctx.clearRect(0, 0, w, h);

  // Draw grid
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= w; x += GRID_SIZE) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += GRID_SIZE) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();

  // Draw all strokes
  const allStrokes = [...strokes];
  if (currentStroke) allStrokes.push(currentStroke);
  allStrokes.forEach(s => drawStroke(ctx, s, state));

  // Pixelation
  if (state.pixelation > 1) {
    const scale = 1 / state.pixelation;
    const tempCanvas = document.createElement('canvas');
    const tw = Math.floor(w * scale);
    const th = Math.floor(h * scale);
    tempCanvas.width = tw;
    tempCanvas.height = th;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(canvas, 0, 0, tw, th);
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, w, h);
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
