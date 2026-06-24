import { useStore } from '../state/store.jsx';
import { stamps, getStampImage } from '../lib/stamps.js';
import { getDitheredStamp } from '../lib/dither.js';
import { useRef, useEffect } from 'react';

const colors = [
  '#e8507a', '#f4a0b5', '#d4622b', '#f0a868',
  '#e8c840', '#f5e6a3', '#5cb85c', '#a8d8a8',
  '#3a9e95', '#89ccc5', '#3255a4', '#92b4e0',
  '#7b68ae', '#b8a4d8', '#9e3a6b',
  '#1a1a2e', '#888888', '#ffffff',
];

export default function LeftPanel() {
  const { state, dispatch } = useStore();

  return (
    <div className="left-panel">
      <div className="panel-section">
        <div className="panel-header">// tools</div>
        <div className="tool-grid">
          {['brush', 'fill', 'erase', 'confetti', 'text', 'line', 'crayon', 'fractal'].map(tool => (
            <button
              key={tool}
              className={`tool-btn ${state.tool === tool ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TOOL', tool })}
              title={tool}
            >
              <ToolIcon tool={tool} />
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-header">// colors</div>
        <div className="color-grid">
          {colors.map(c => (
            <div
              key={c}
              className={`color-swatch ${state.color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => dispatch({ type: 'SET_COLOR', color: c })}
            />
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-header">// size</div>
        <div className="slider-box">
          <input
            type="range" className="slider" min="1" max="80"
            value={state.brushSize}
            onChange={e => dispatch({ type: 'SET_BRUSH_SIZE', size: parseInt(e.target.value) })}
          />
          <span className="slider-val">{state.brushSize}</span>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-header">// pixel</div>
        <div className="slider-box">
          <input
            type="range" className="slider" min="1" max="8"
            value={state.pixelation}
            onChange={e => dispatch({ type: 'SET_PIXELATION', value: parseInt(e.target.value) })}
          />
          <span className="slider-val">{state.pixelation}</span>
        </div>
      </div>

      <div className="panel-section">
        <button
          className={`live-toggle-btn ${state.liveMode ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_LIVE_MODE', value: !state.liveMode })}
        >
          {state.liveMode ? '◉ live' : '○ live'}
        </button>
      </div>
    </div>
  );
}

export function RightPanel() {
  const { state, dispatch } = useStore();

  return (
    <div className="right-panel">
      <div className="panel-section">
        <div className="panel-header">// stamps</div>
        <div className="stamp-grid">
          {stamps.map((s, i) => (
            <StampButton
              key={s.name}
              stamp={s}
              index={i}
              active={state.tool === 'stamp' && state.selectedStamp === i}
              onClick={() => dispatch({ type: 'SET_STAMP', index: i })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StampButton({ stamp, index, active, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const img = getStampImage(stamp);
    const render = () => {
      const size = 52;
      const scale = window.devicePixelRatio;
      const dithered = getDitheredStamp(stamp, img, Math.round(size * scale), {
        pixelScale: 2, mode: 'riso',
      });
      const c = canvasRef.current;
      if (!c || !dithered) return;
      c.width = dithered.width;
      c.height = dithered.height;
      c.style.width = '100%';
      c.style.height = '100%';
      const ctx = c.getContext('2d');
      ctx.drawImage(dithered, 0, 0);
    };
    if (img.complete && img.naturalWidth > 0) render();
    else img._loadPromise?.then(render);
  }, [stamp]);

  return (
    <button className={`stamp-btn ${active ? 'active' : ''}`} onClick={onClick} title={stamp.name}>
      <canvas ref={canvasRef} />
    </button>
  );
}

function ToolIcon({ tool }) {
  const icons = {
    brush: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>,
    fill: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 7 6 2"/><path d="M18.992 12H2.041"/><path d="m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33"/></svg>,
    erase: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/></svg>,
    confetti: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>,
    text: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
    line: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>,
    crayon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 2.5 L21.5 6.5 L8 20 L2 22 L4 16 Z"/><path d="M15 5 L19 9"/></svg>,
    fractal: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 3 Q8 8 12 12 Q16 16 12 21"/><path d="M12 12 Q8 10 6 6"/><path d="M12 12 Q16 10 18 6"/><path d="M12 12 Q8 16 5 19"/><path d="M12 12 Q16 16 19 19"/></svg>,
  };
  return icons[tool] || null;
}
