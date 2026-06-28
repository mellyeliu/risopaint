import { useRef, useEffect, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useStore, GRID_SIZE } from '../state/store.jsx';
import { redrawCanvas, interpolateCells } from '../lib/tools.js';
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
      redrawCanvas(drawRef.current, currentScene.strokes, strokeRef.current, state);
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
    redrawCanvas(canvas, currentScene.strokes, strokeRef.current, state);
  }, [currentScene.strokes, state.pixelation, state.showGallery, state.currentSceneIndex]);

  // Live animation loop
  useEffect(() => {
    if (!state.liveMode || state.physicsOn || state.showGallery) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      return;
    }
    function animate() {
      const canvas = drawRef.current;
      if (canvas) {
        redrawCanvas(canvas, currentScene.strokes, strokeRef.current, state);
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
      if (drawRef.current) drawRef.current.style.opacity = '1';
      return;
    }

    // Start physics
    if (!physicsEngineRef.current) {
      physicsEngineRef.current = new PhysicsEngine();
    }
    const physics = physicsEngineRef.current;
    physics.clear();

    const inner = innerRef.current;
    if (!inner) return;
    physics.setCanvasSize(inner.clientWidth, inner.clientHeight);
    physics.addStrokes(currentScene.strokes);
    physics.start();

    // Expose shake for external callers
    window._physicsShake = () => physics.shake();

    // Hide drawing canvas, show physics
    if (drawRef.current) drawRef.current.style.opacity = '0';

    const physCanvas = physRef.current;
    if (!physCanvas) return;
    const ctx = physCanvas.getContext('2d');
    const w = physCanvas.width / window.devicePixelRatio;
    const h = physCanvas.height / window.devicePixelRatio;

    function frame() {
      ctx.clearRect(0, 0, w, h);

      const bodies = physics.getState();
      bodies.forEach(({ body, stroke, position, angle }) => {
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);

        if (stroke.type === 'stamp') {
          const stamp = stamps[stroke.stampIndex];
          if (stamp) {
            const img = getStampImage(stamp);
            const s = stroke.size;
            if (img.complete) {
              const dithered = getDitheredStamp(stamp, img, Math.round(s * window.devicePixelRatio), {
                pixelScale: 3,
                mode: 'riso',
              });
              if (dithered) {
                ctx.drawImage(dithered, -s / 2, -s / 2, s, s);
              } else {
                ctx.drawImage(img, -s / 2, -s / 2, s, s);
              }
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

      physicsAnimRef.current = requestAnimationFrame(frame);
    }

    frame();

    return () => {
      if (physicsAnimRef.current) {
        cancelAnimationFrame(physicsAnimRef.current);
        physicsAnimRef.current = null;
      }
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
      dispatch({ type: 'ADD_STROKE', stroke: { type: 'fill', color: state.color } });
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
    redrawCanvas(drawRef.current, currentScene.strokes, strokeRef.current, state);
  }, [state, currentScene, dispatch]);

  const onMove = useCallback((e) => {
    if (!isDrawingRef.current || !strokeRef.current) return;
    e.preventDefault?.();
    const { x, y } = e.touches ? (() => {
      const rect = drawRef.current.getBoundingClientRect();
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    })() : { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

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

    redrawCanvas(drawRef.current, currentScene.strokes, strokeRef.current, state);
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

  // Keyboard shortcuts
  useEffect(() => {
    let undoDebounce = false;
    const onKey = (e) => {
      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!undoDebounce) {
          undoDebounce = true;
          dispatch({ type: 'UNDO' });
          setTimeout(() => { undoDebounce = false; }, 150);
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
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      dispatch({ type: 'SET_ZOOM', value: state.zoom + delta });
    }
  }, [state.zoom, dispatch]);

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
            onMouseLeave={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
          />
        </div>
      </div>
    </div>
  );
}
