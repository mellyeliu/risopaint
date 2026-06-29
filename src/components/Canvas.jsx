import { useRef, useEffect, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useStore, GRID_SIZE } from '../state/store.jsx';
import { redrawCanvas, interpolateCells, drawStroke } from '../lib/tools.js';
import { PhysicsEngine } from '../lib/physics.js';
import { stamps, getStampImage } from '../lib/stamps.js';
import { getDitheredStamp } from '../lib/dither.js';
import { breakpoints } from '../tokens.stylex.js';

const s = stylex.create({
  canvasArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    minWidth: 0,
    minHeight: {
      default: null,
      [breakpoints.mobile]: 0,
    },
  },
  canvasContainer: {
    position: 'relative',
    overflow: 'auto',
    width: '100%',
    height: '100%',
    padding: {
      default: 12,
      [breakpoints.mobile]: 4,
    },
  },
  canvasContainerLight: {
    background: '#919191',
  },
  canvasContainerDark: {
    background: '#333',
  },
  canvasInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: '#fff',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  drawingCanvas: {
    zIndex: 2,
    cursor: 'crosshair',
  },
  physicsCanvas: {
    zIndex: 1,
  },
});

export default function Canvas() {
  const { state, dispatch } = useStore();
  const drawRef = useRef(null);
  const physRef = useRef(null);
  const innerRef = useRef(null);
  const strokeRef = useRef(null);
  const animRef = useRef(null);
  const isDrawingRef = useRef(false);
  const physicsEngineRef = useRef(null);
  const physicsAnimRef = useRef(null);
  const mousePosRef = useRef(null);
  const previewRafRef = useRef(null);

  const currentScene = state.scenes[state.currentSceneIndex];

  // Resize canvases
  useEffect(() => {
    const resize = () => {
      const inner = innerRef.current;
      if (!inner) return;
      const w = inner.clientWidth;
      const h = inner.clientHeight;
      if (w === 0 || h === 0) return;
      [drawRef, physRef].forEach(ref => {
        const c = ref.current;
        if (!c) return;
        c.width = w * window.devicePixelRatio;
        c.height = h * window.devicePixelRatio;
        c.style.width = w + 'px';
        c.style.height = h + 'px';
        c.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);
      });
      redrawCanvas(drawRef.current, currentScene.strokes, strokeRef.current, state, mousePosRef.current);
    };
    // Run on next frame to ensure layout is settled
    requestAnimationFrame(resize);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [state.fullscreen, state.showGallery, state.currentSceneIndex]);

  // Redraw on any relevant change
  useEffect(() => {
    const canvas = drawRef.current;
    if (!canvas || state.showGallery) return;
    redrawCanvas(canvas, currentScene.strokes, strokeRef.current, state, mousePosRef.current);
  }, [currentScene.strokes, state.pixelation, state.showGallery, state.currentSceneIndex, state.selectedStamp, state.tool, state.brushSize, state.color]);

  // Live animation loop
  useEffect(() => {
    if (!state.liveMode || state.physicsOn || state.showGallery) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      return;
    }
    let frameCount = 0;
    function animate() {
      frameCount++;
      // Redraw every 3rd frame (~20fps) for subtler crayon animation
      if (frameCount % 3 === 0) {
        const canvas = drawRef.current;
        if (canvas) {
          redrawCanvas(canvas, currentScene.strokes, strokeRef.current, state, mousePosRef.current);
        }
      }
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [state.liveMode, state.physicsOn, state.showGallery, currentScene.strokes, state.pixelation]);

  // Physics engine
  useEffect(() => {
    if (!state.physicsOn) {
      // Stop physics
      if (physicsEngineRef.current) {
        physicsEngineRef.current.stop();
        physicsEngineRef.current.clear();
      }
      if (physicsAnimRef.current) {
        cancelAnimationFrame(physicsAnimRef.current);
        physicsAnimRef.current = null;
      }
      // Clear physics canvas and show drawing canvas
      const physCanvas = physRef.current;
      if (physCanvas) {
        const ctx = physCanvas.getContext('2d');
        ctx.clearRect(0, 0, physCanvas.width / window.devicePixelRatio, physCanvas.height / window.devicePixelRatio);
      }
      if (drawRef.current) {
        drawRef.current.style.opacity = '1';
        drawRef.current.style.pointerEvents = 'auto';
      }
      return;
    }

    // Start physics — always create fresh to pick up code changes
    physicsEngineRef.current = new PhysicsEngine();
    const physics = physicsEngineRef.current;

    const inner = innerRef.current;
    if (!inner) return;
    physics.setCanvasSize(inner.clientWidth, inner.clientHeight);
    physics.addStrokes(currentScene.strokes, stamps);
    physics.start();

    // Always spawn the stick figure player
    const sp = physics.startPos || { x: 30, y: 20 };
    physics.spawnPlayer(sp.x, sp.y, stamps);

    // Key handlers for player control
    const onKeyDown = (e) => {
      if (physics.keys) physics.keys[e.key] = true;
    };
    const onKeyUp = (e) => {
      if (physics.keys) physics.keys[e.key] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Expose shake for external callers
    window._physicsShake = () => physics.shake();

    // Hide drawing canvas, show physics
    if (drawRef.current) {
      drawRef.current.style.opacity = '0';
      drawRef.current.style.pointerEvents = 'none';
    }

    const physCanvas = physRef.current;
    if (!physCanvas) return;
    const ctx = physCanvas.getContext('2d');
    const w = physCanvas.width / window.devicePixelRatio;
    const h = physCanvas.height / window.devicePixelRatio;

    function frame() {
      ctx.clearRect(0, 0, w, h);

      // Draw white background + grid
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.07)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let gx = 0; gx <= w; gx += GRID_SIZE) { ctx.moveTo(gx, 0); ctx.lineTo(gx, h); }
      for (let gy = 0; gy <= h; gy += GRID_SIZE) { ctx.moveTo(0, gy); ctx.lineTo(w, gy); }
      ctx.stroke();
      ctx.restore();

      // Draw crayon/marker strokes at original positions (they're static in game)
      for (const stroke of currentScene.strokes) {
        if (stroke.type === 'crayon' || stroke.type === 'marker') {
          drawStroke(ctx, stroke, state);
        }
      }

      const bodies = physics.getState();
      bodies.forEach(({ body, stroke, position, angle }) => {
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);

        if (stroke.type === 'stamp') {
          const stamp = stamps[stroke.stampIndex];
          if (stamp) {
            const img = getStampImage(stamp);
            const sz = stroke.size;
            if (img.complete) {
              const playerState = physics.getPlayerState();
              // Butterfly — flutter + gray when invincible
              if (stamp.name === 'butterfly') {
                if (playerState?.invincible) {
                  ctx.globalAlpha = 0.3;
                  ctx.filter = 'grayscale(1)';
                }
                const flutter = 0.7 + Math.sin(performance.now() * 0.006 + position.x * 0.1) * 0.3;
                ctx.scale(flutter, 1);
              }
              // Mushroom — horizontal stretch only, rooted at bottom
              if (stamp.name === 'mushroom') {
                const stretch = 1 + Math.sin(performance.now() * 0.004) * 0.06;
                const squash = 1 / stretch; // conserve volume
                ctx.translate(0, sz / 2 * (1 - squash)); // keep bottom rooted
                ctx.scale(stretch, squash);
              }
              // Smoke — fade when crumbling
              if (stamp.name === 'smoke' && !body.isStatic) {
                ctx.globalAlpha = 0.4;
              }
              const dithered = getDitheredStamp(stamp, img, Math.round(sz * window.devicePixelRatio), {
                pixelScale: 3,
                mode: 'riso',
              });
              if (dithered) {
                ctx.drawImage(dithered, -sz / 2, -sz / 2, sz, sz);
              } else {
                ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
              }
              ctx.globalAlpha = 1;
              ctx.filter = 'none';
            }
          }
        } else if (stroke.type === 'brush') {
          ctx.fillStyle = stroke.color;
          if (stroke.cells) {
            const allCoords = stroke.cells.map(k => k.split(',').map(Number));
            const xs = allCoords.map(c => c[0]), ys = allCoords.map(c => c[1]);
            const cx = (Math.min(...xs) + Math.max(...xs) + GRID_SIZE) / 2;
            const cy = (Math.min(...ys) + Math.max(...ys) + GRID_SIZE) / 2;
            for (const [gx, gy] of allCoords) {
              ctx.fillRect(gx - cx, gy - cy, GRID_SIZE, GRID_SIZE);
            }
          }
        }

        ctx.restore();
      });

      // Easter egg: update and draw stick figure player
      physics.updatePlayer();
      const playerState = physics.getPlayerState();
      if (playerState) {
        const px = playerState.position.x;
        const py = playerState.position.y;
        const vx = playerState.velocity?.x || 0;
        const facing = playerState.facingRight ? 1 : -1;
        const time = performance.now() * 0.008;
        const running = Math.abs(vx) > 0.5;
        const legCycle = running ? Math.sin(time * 2) : 0;

        if (playerState.dead) {
          // Dead sprite — lying sideways at ground level
          ctx.save();
          ctx.translate(px, py + 12);
          ctx.scale(1.5, 1.5);
          ctx.rotate(Math.PI / 2);
          ctx.strokeStyle = '#000';
          ctx.fillStyle = '#000';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          // Braids
          ctx.beginPath();
          ctx.moveTo(-5, -12); ctx.lineTo(-6, -9); ctx.lineTo(-4, -7);
          ctx.stroke();
          ctx.beginPath(); ctx.arc(-4, -6.5, 1, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(5, -12); ctx.lineTo(6, -9); ctx.lineTo(4, -7);
          ctx.stroke();
          ctx.beginPath(); ctx.arc(4, -6.5, 1, 0, Math.PI * 2); ctx.fill();
          // Head
          ctx.beginPath();
          ctx.arc(0, -14, 5, 0, Math.PI * 2);
          ctx.stroke();
          // Bangs
          ctx.lineWidth = 1.5;
          for (let bx = -3; bx <= 3; bx += 2) {
            const topY = -14 - Math.sqrt(Math.max(0, 25 - bx * bx));
            ctx.beginPath(); ctx.moveTo(bx, topY); ctx.lineTo(bx, topY + 3); ctx.stroke();
          }
          // X eyes
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-3, -16); ctx.lineTo(-1, -14);
          ctx.moveTo(-1, -16); ctx.lineTo(-3, -14);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(1, -16); ctx.lineTo(3, -14);
          ctx.moveTo(3, -16); ctx.lineTo(1, -14);
          ctx.stroke();
          // Blood
          ctx.fillStyle = '#c0392b';
          ctx.beginPath(); ctx.arc(1, -11, 1, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(1, -11); ctx.lineTo(2, -9); ctx.stroke();
          // Body
          ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, 1); ctx.stroke();
          // Limp arms
          ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(5, -2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-5, -2); ctx.stroke();
          // Skirt
          ctx.beginPath();
          ctx.moveTo(-7, 6); ctx.lineTo(0, 0); ctx.lineTo(7, 6); ctx.lineTo(-7, 6);
          ctx.stroke();
          // Legs
          ctx.beginPath(); ctx.moveTo(-2, 6); ctx.lineTo(-3, 12); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(2, 6); ctx.lineTo(3, 12); ctx.stroke();
          // Shoes
          ctx.beginPath(); ctx.ellipse(-3, 13, 3.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(3, 13, 3.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        } else {
          // Alive sprite
          ctx.save();
          ctx.translate(px, py - 4);
          ctx.scale(1.5 * facing, 1.5);
          ctx.strokeStyle = '#000';
          ctx.fillStyle = '#000';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const bounce = running ? Math.sin(time * 3) * 1 : 0;
          // Back braid
          ctx.beginPath();
          ctx.moveTo(-5, -12); ctx.lineTo(-6, -9 + bounce); ctx.lineTo(-4, -7 + bounce);
          ctx.stroke();
          ctx.beginPath(); ctx.arc(-4, -6.5 + bounce, 1, 0, Math.PI * 2); ctx.fill();
          // Back arm
          const armSwing = running ? legCycle * 0.5 : 0;
          ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-6, -3 - armSwing * 3); ctx.stroke();
          // Head
          ctx.beginPath(); ctx.arc(0, -14, 5, 0, Math.PI * 2); ctx.stroke();
          // Bangs
          ctx.lineWidth = 1.5;
          for (let bx = -3; bx <= 3; bx += 2) {
            const topY = -14 - Math.sqrt(Math.max(0, 25 - bx * bx));
            ctx.beginPath(); ctx.moveTo(bx, topY); ctx.lineTo(bx, topY + 3); ctx.stroke();
          }
          ctx.lineWidth = 2;
          // Front braid
          ctx.beginPath();
          ctx.moveTo(5, -12); ctx.lineTo(6, -9 + bounce); ctx.lineTo(4, -7 + bounce);
          ctx.stroke();
          ctx.beginPath(); ctx.arc(4, -6.5 + bounce, 1, 0, Math.PI * 2); ctx.fill();
          // Body
          ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, 1); ctx.stroke();
          // Front arm
          ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(6, -3 + armSwing * 3); ctx.stroke();
          // Skirt
          ctx.beginPath();
          ctx.moveTo(-7, 6); ctx.lineTo(0, 0); ctx.lineTo(7, 6); ctx.lineTo(-7, 6);
          ctx.stroke();
          // Back leg + shoe
          ctx.beginPath(); ctx.moveTo(-2, 6); ctx.lineTo(-3 + legCycle * 4, 14); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(-3 + legCycle * 4, 15, 3.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
          // Front leg + shoe
          ctx.beginPath(); ctx.moveTo(2, 6); ctx.lineTo(3 - legCycle * 4, 14); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(3 - legCycle * 4, 15, 3.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
          // Invincibility glow
          if (playerState.invincible) {
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = 'gold';
            ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
          }
          ctx.restore();
        }

        // Status text — top center only
        if (playerState.dead) {
          ctx.save();
          ctx.fillStyle = '#c0392b';
          ctx.font = "bold 20px 'Velvelyne', serif";
          ctx.textAlign = 'center';
          ctx.fillText('☠ game over — press R to respawn', w / 2, 30);
          ctx.restore();
        } else if (playerState.won) {
          ctx.save();
          ctx.fillStyle = '#2ecc71';
          ctx.font = "bold 22px 'Velvelyne', serif";
          ctx.textAlign = 'center';
          ctx.fillText('✿ you made it! ✿', w / 2, 30);
          ctx.restore();
        } else if (playerState.invincible) {
          ctx.save();
          ctx.fillStyle = 'gold';
          ctx.font = "bold 14px 'Velvelyne', serif";
          ctx.textAlign = 'center';
          const secs = Math.ceil((playerState.invincibleUntil - performance.now()) / 1000);
          ctx.fillText('⭐ invincible — ' + secs + 's', w / 2, 30);
          ctx.restore();
        }

        // Draw start zone in game mode
        if (playerState.startZone) {
          const sz = playerState.startZone;
          ctx.save();
          ctx.strokeStyle = '#2ecc71';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(sz.x, sz.y, sz.w, sz.h);
          ctx.setLineDash([]);
          // Platform line
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(sz.x - 5, sz.y + sz.h);
          ctx.lineTo(sz.x + sz.w + 5, sz.y + sz.h);
          ctx.stroke();
          // Flag
          ctx.fillStyle = '#2ecc71';
          ctx.beginPath();
          ctx.moveTo(sz.x + sz.w / 2, sz.y);
          ctx.lineTo(sz.x + sz.w / 2 + 15, sz.y + 8);
          ctx.lineTo(sz.x + sz.w / 2, sz.y + 16);
          ctx.fill();
          // Pole
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sz.x + sz.w / 2, sz.y);
          ctx.lineTo(sz.x + sz.w / 2, sz.y + sz.h);
          ctx.stroke();
          // Label
          ctx.fillStyle = '#2ecc71';
          ctx.font = "bold 11px 'Velvelyne', serif";
          ctx.textAlign = 'center';
          ctx.fillText('start', sz.x + sz.w / 2, sz.y - 4);
          ctx.restore();
        }

        // Draw finish zone in game mode
        if (playerState.finishLine) {
          const fl = playerState.finishLine;
          ctx.save();
          ctx.strokeStyle = '#e74c3c';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(fl.x, fl.y, fl.w, fl.h);
          ctx.setLineDash([]);
          // Platform line
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(fl.x - 5, fl.y + fl.h);
          ctx.lineTo(fl.x + fl.w + 5, fl.y + fl.h);
          ctx.stroke();
          // Flag
          ctx.fillStyle = '#e74c3c';
          ctx.beginPath();
          ctx.moveTo(fl.x + fl.w / 2, fl.y);
          ctx.lineTo(fl.x + fl.w / 2 + 15, fl.y + 8);
          ctx.lineTo(fl.x + fl.w / 2, fl.y + 16);
          ctx.fill();
          // Pole
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fl.x + fl.w / 2, fl.y);
          ctx.lineTo(fl.x + fl.w / 2, fl.y + fl.h);
          ctx.stroke();
          // Label
          ctx.fillStyle = '#e74c3c';
          ctx.font = "bold 11px 'Velvelyne', serif";
          ctx.textAlign = 'center';
          ctx.fillText('finish', fl.x + fl.w / 2, fl.y - 4);
          ctx.restore();
        }
      }

      physicsAnimRef.current = requestAnimationFrame(frame);
    }

    frame();

    return () => {
      if (physicsAnimRef.current) {
        cancelAnimationFrame(physicsAnimRef.current);
        physicsAnimRef.current = null;
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [state.physicsOn]);

  const getPos = useCallback((e) => {
    if (e.touches) {
      const rect = drawRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  }, []);

  const onDown = useCallback((e) => {
    e.preventDefault?.();
    const { x, y } = e.touches ? (() => {
      const rect = drawRef.current.getBoundingClientRect();
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    })() : { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    if (state.tool === 'stamp' && state.selectedStamp !== null) {
      const stampSize = 24 + state.brushSize * 5;
      dispatch({ type: 'ADD_STROKE', stroke: {
        type: 'stamp', stampIndex: state.selectedStamp, x, y, size: stampSize,
      }});
      return;
    }

    if (state.tool === 'start') {
      dispatch({ type: 'ADD_STROKE', stroke: {
        type: 'start', x, y, width: 50, height: 60,
      }});
      return;
    }

    if (state.tool === 'finish') {
      dispatch({ type: 'ADD_STROKE', stroke: {
        type: 'finish', x, y, width: 50, height: 60,
      }});
      return;
    }

    if (state.physicsOn) return;

    if (state.tool === 'text') {
      const inner = innerRef.current;
      if (!inner) return;
      inner.querySelector('.canvas-text-input')?.remove();
      const input = document.createElement('textarea');
      input.className = 'canvas-text-input';
      input.style.left = x + 'px';
      input.style.top = y + 'px';
      input.style.color = state.color;
      input.style.fontSize = Math.max(state.brushSize, 12) + 'px';
      inner.appendChild(input);
      input.focus();
      const commitText = () => {
        const text = input.value.trim();
        if (text) {
          dispatch({ type: 'ADD_STROKE', stroke: {
            type: 'text', text, x, y: y + Math.max(state.brushSize, 12),
            color: state.color, size: Math.max(state.brushSize, 12),
          }});
        }
        input.remove();
      };
      input.addEventListener('blur', commitText);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); commitText(); }
        if (ev.key === 'Escape') input.remove();
      });
      return;
    }

    if (state.tool === 'fill') {
      dispatch({ type: 'ADD_STROKE', stroke: { type: 'fill', color: state.color, x, y } });
      return;
    }

    if (state.tool === 'confetti') {
      const confettiColors = ['#e8507a', '#3255a4', '#5cb85c', '#e8c840', '#7b68ae', '#d4622b', '#3a9e95'];
      const cells = [];
      const radius = 5 + Math.floor(state.brushSize / 4);
      for (let i = 0; i < 30 + state.brushSize * 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius;
        const gx = Math.floor((x + Math.cos(angle) * dist * GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
        const gy = Math.floor((y + Math.sin(angle) * dist * GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
        cells.push({ gx, gy, color: confettiColors[Math.floor(Math.random() * confettiColors.length)] });
      }
      dispatch({ type: 'ADD_STROKE', stroke: { type: 'splatter', cells } });
      return;
    }

    if (state.tool === 'line') {
      isDrawingRef.current = true;
      const gx = Math.floor(x / GRID_SIZE) * GRID_SIZE;
      const gy = Math.floor(y / GRID_SIZE) * GRID_SIZE;
      strokeRef.current = {
        type: 'gridline', color: state.color, size: state.brushSize,
        cells: [`${gx},${gy}`], cellSet: new Set([`${gx},${gy}`]),
      };
      return;
    }

    if (state.tool === 'crayon' || state.tool === 'marker') {
      isDrawingRef.current = true;
      strokeRef.current = {
        type: state.tool,
        color: state.color,
        size: state.brushSize, points: [{ x, y }],
      };
      return;
    }

    // Brush or eraser
    isDrawingRef.current = true;
    const gx = Math.floor(x / GRID_SIZE) * GRID_SIZE;
    const gy = Math.floor(y / GRID_SIZE) * GRID_SIZE;
    strokeRef.current = {
      type: state.tool === 'erase' ? 'erase' : 'brush',
      color: state.color, size: state.brushSize,
      cells: [`${gx},${gy}`], cellSet: new Set([`${gx},${gy}`]),
    };
    redrawCanvas(drawRef.current, currentScene.strokes, strokeRef.current, state, mousePosRef.current);
  }, [state, currentScene, dispatch]);

  const onMove = useCallback((e) => {
    const { x, y } = e.touches ? (() => {
      const rect = drawRef.current.getBoundingClientRect();
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    })() : { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    mousePosRef.current = { x, y };

    if (!isDrawingRef.current || !strokeRef.current) {
      return;
    }
    e.preventDefault?.();

    const s = strokeRef.current;

    if (s.type === 'crayon' || s.type === 'marker') {
      const pts = s.points;
      const last = pts[pts.length - 1];
      const dist = Math.sqrt((x - last.x) ** 2 + (y - last.y) ** 2);
      const step = Math.max(2, state.brushSize * 0.3);
      if (dist > step) {
        const steps = Math.ceil(dist / step);
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          pts.push({ x: last.x + (x - last.x) * t, y: last.y + (y - last.y) * t });
        }
      } else {
        pts.push({ x, y });
      }
    } else if (s.type === 'gridline' || s.type === 'brush' || s.type === 'erase') {
      const gx = Math.floor(x / GRID_SIZE) * GRID_SIZE;
      const gy = Math.floor(y / GRID_SIZE) * GRID_SIZE;
      const lastKey = s.cells[s.cells.length - 1];
      interpolateCells(lastKey, gx, gy, s.cellSet, s.cells);
      const key = `${gx},${gy}`;
      if (!s.cellSet.has(key)) { s.cellSet.add(key); s.cells.push(key); }
    }

    redrawCanvas(drawRef.current, currentScene.strokes, strokeRef.current, state, mousePosRef.current);
  }, [state, currentScene]);

  const onUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (strokeRef.current) {
      const { cellSet, edgeSet, ...stroke } = strokeRef.current;
      if (stroke.cells?.length > 0 || stroke.edges?.length > 0 || stroke.points?.length > 0) {
        dispatch({ type: 'ADD_STROKE', stroke });
      }
    }
    strokeRef.current = null;
  }, [dispatch]);

  const onLeave = useCallback(() => {
    onUp();
  }, [onUp]);

  // Attach touch listeners with { passive: false } to allow preventDefault
  useEffect(() => {
    const canvas = drawRef.current;
    if (!canvas) return;
    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onUp, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
    };
  }, [onDown, onMove, onUp]);

  useEffect(() => {
    let debounce = false;
    const onKey = (e) => {
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        if (!debounce) {
          debounce = true;
          dispatch({ type: 'REDO' });
          setTimeout(() => { debounce = false; }, 150);
        }
      } else if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!debounce) {
          debounce = true;
          dispatch({ type: 'UNDO' });
          setTimeout(() => { debounce = false; }, 150);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  // Zoom
  const onWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.02 : 0.02;
      dispatch({ type: 'SET_ZOOM', value: state.zoom + delta });
    }
  }, [state.zoom, dispatch]);

  // Prevent browser zoom on the whole page
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    document.addEventListener('wheel', preventZoom, { passive: false });
    return () => document.removeEventListener('wheel', preventZoom);
  }, []);

  if (state.showGallery) return null;

  return (
    <div {...stylex.props(s.canvasArea)}>
      <div
        {...stylex.props(
          s.canvasContainer,
          state.darkMode ? s.canvasContainerDark : s.canvasContainerLight,
        )}
        onWheel={onWheel}
      >
        <div
          {...stylex.props(s.canvasInner)}
          ref={innerRef}
          style={state.zoom !== 1 ? { transform: `scale(${state.zoom})`, transformOrigin: 'top left' } : undefined}
        >
          <canvas
            ref={physRef}
            id="physics-canvas"
            {...stylex.props(s.canvas, s.physicsCanvas)}
          />
          <canvas
            ref={drawRef}
            id="drawing-canvas"
            {...stylex.props(s.canvas, s.drawingCanvas)}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onLeave}
          />
        </div>
      </div>
    </div>
  );
}
