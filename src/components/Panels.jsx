import * as stylex from '@stylexjs/stylex';
import { useStore } from '../state/store.jsx';
import { stamps, getStampImage } from '../lib/stamps.js';
import { getDitheredStamp } from '../lib/dither.js';
import { useRef, useEffect } from 'react';
import { breakpoints, grain } from '../tokens.stylex.js';

const colors = [
  '#e8507a', '#f4a0b5', '#d4622b', '#f0a868',
  '#e8c840', '#f5e6a3', '#5cb85c', '#a8d8a8',
  '#3a9e95', '#89ccc5', '#3255a4', '#92b4e0',
  '#7b68ae', '#b8a4d8', '#9e3a6b',
  '#1a1a2e', '#888888', '#ffffff',
];

const s = stylex.create({
  // Panel section
  panelSection: {
    padding: {
      default: '8px 14px',
      [breakpoints.mobile]: '6px 8px',
    },
  },
  panelSectionLeftMobile: {
    borderBottom: {
      default: null,
      [breakpoints.mobile]: 'none',
    },
    borderRight: {
      default: null,
      [breakpoints.mobile]: '1px solid #eee',
    },
    flexShrink: {
      default: null,
      [breakpoints.mobile]: 0,
    },
  },
  panelSectionRightMobile: {
    flexShrink: {
      default: null,
      [breakpoints.mobile]: 0,
    },
    width: {
      default: null,
      [breakpoints.mobile]: 'auto',
    },
  },
  panelSectionDark: {
    borderColor: '#333',
  },

  // Panel header
  panelHeader: {
    fontSize: 11,
    color: '#000',
    marginBottom: 6,
    letterSpacing: '0.05em',
    display: {
      default: 'block',
      [breakpoints.mobile]: 'none',
    },
  },
  panelHeaderDark: {
    color: '#888',
  },

  // Left panel
  leftPanel: {
    width: {
      default: 150,
      [breakpoints.mobile]: '100%',
    },
    backgroundColor: '#fff',
    borderRight: {
      default: '1px solid #000',
      [breakpoints.mobile]: 'none',
    },
    borderBottom: {
      default: null,
      [breakpoints.mobile]: '1px solid #000',
    },
    display: 'flex',
    flexDirection: {
      default: 'column',
      [breakpoints.mobile]: 'row',
    },
    flexShrink: 0,
    overflowY: {
      default: 'auto',
      [breakpoints.mobile]: 'hidden',
    },
    overflowX: {
      default: null,
      [breakpoints.mobile]: 'auto',
    },
    height: {
      default: null,
      [breakpoints.mobile]: 'auto',
    },
    maxHeight: {
      default: null,
      [breakpoints.mobile]: 'none',
    },
  },
  leftPanelDark: {
    backgroundColor: '#222',
    borderColor: '#444',
  },

  // Right panel
  rightPanel: {
    width: {
      default: 190,
      [breakpoints.mobile]: '100%',
    },
    backgroundColor: '#fff',
    borderLeft: {
      default: '1px solid #000',
      [breakpoints.mobile]: 'none',
    },
    borderTop: {
      default: null,
      [breakpoints.mobile]: '1px solid #000',
    },
    display: 'flex',
    flexDirection: {
      default: 'column',
      [breakpoints.mobile]: 'row',
    },
    flexShrink: 0,
    overflowY: {
      default: 'auto',
      [breakpoints.mobile]: 'hidden',
    },
    overflowX: {
      default: null,
      [breakpoints.mobile]: 'auto',
    },
    height: {
      default: null,
      [breakpoints.mobile]: 'auto',
    },
    maxHeight: {
      default: null,
      [breakpoints.mobile]: 'none',
    },
  },
  rightPanelDark: {
    backgroundColor: '#222',
    borderColor: '#444',
  },

  // Tool grid
  toolGrid: {
    display: {
      default: 'grid',
      [breakpoints.mobile]: 'flex',
    },
    gridTemplateColumns: {
      default: '1fr 1fr',
      [breakpoints.mobile]: null,
    },
    gap: {
      default: 6,
      [breakpoints.mobile]: 4,
    },
  },

  // Tool button
  toolBtn: {
    aspectRatio: {
      default: '1',
      [breakpoints.mobile]: 'auto',
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#000',
    backgroundColor: {
      default: '#fff',
      ':hover': '#fafafa',
    },
    cursor: 'pointer',
    padding: 6,
    color: '#000',
    transitionProperty: 'all',
    transitionDuration: '0.08s',
    width: {
      default: null,
      [breakpoints.mobile]: 36,
      [breakpoints.small]: 32,
    },
    height: {
      default: null,
      [breakpoints.mobile]: 36,
      [breakpoints.small]: 32,
    },
    flexShrink: {
      default: null,
      [breakpoints.mobile]: 0,
    },
  },
  toolBtnActive: {
    borderStyle: 'solid',
  },
  toolBtnDark: {
    backgroundColor: {
      default: '#2a2a2a',
      ':hover': '#2a2a2a',
    },
    borderColor: '#555',
    color: '#ccc',
  },
  toolBtnDarkActive: {
    borderStyle: 'solid',
    borderColor: '#fff',
    color: '#fff',
  },
  toolBtnSvg: {
    width: {
      default: 16,
      [breakpoints.mobile]: 18,
    },
    height: {
      default: 16,
      [breakpoints.mobile]: 18,
    },
  },

  // Color grid
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, 1fr)',
      [breakpoints.mobile]: null,
    },
    gridTemplateRows: {
      default: null,
      [breakpoints.mobile]: '1fr 1fr',
    },
    gridAutoFlow: {
      default: null,
      [breakpoints.mobile]: 'column',
    },
    gap: {
      default: 5,
      [breakpoints.mobile]: 3,
    },
  },

  // Color swatch
  colorSwatch: {
    aspectRatio: {
      default: '1',
      [breakpoints.mobile]: 'auto',
    },
    cursor: 'pointer',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#000',
    transitionProperty: 'all',
    transitionDuration: '0.08s',
    position: 'relative',
    width: {
      default: null,
      [breakpoints.mobile]: 20,
      [breakpoints.small]: 20,
    },
    height: {
      default: null,
      [breakpoints.mobile]: 20,
      [breakpoints.small]: 20,
    },
    flexShrink: {
      default: null,
      [breakpoints.mobile]: 0,
    },
  },
  colorSwatchActive: {
    borderStyle: 'solid',
  },
  colorSwatchDark: {
    borderColor: '#555',
  },
  colorSwatchDarkActive: {
    borderColor: '#fff',
  },

  // Grain overlay (replacing ::after pseudo-element)
  grainOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: grain.bg,
    backgroundSize: 'cover',
    opacity: 0.18,
    mixBlendMode: 'multiply',
    pointerEvents: 'none',
  },

  // Slider box
  sliderBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#000',
    padding: {
      default: '8px 10px',
      [breakpoints.mobile]: '6px 8px',
    },
    backgroundColor: '#fff',
    overflow: 'hidden',
    minWidth: {
      default: null,
      [breakpoints.mobile]: 100,
    },
  },
  sliderBoxDark: {
    borderColor: '#555',
    backgroundColor: '#2a2a2a',
  },

  // Slider value label
  sliderVal: {
    fontSize: 12,
    color: '#999',
    minWidth: 14,
    textAlign: 'right',
    flexShrink: 0,
  },
  sliderValDark: {
    color: '#888',
  },

  // Slider input - note: vendor pseudo-elements kept in global CSS
  slider: {
    WebkitAppearance: 'none',
    appearance: 'none',
    flex: 1,
    height: 4,
    backgroundColor: '#ddd',
    outline: 'none',
    cursor: 'pointer',
    minWidth: 0,
  },
  sliderDark: {
    backgroundColor: '#444',
  },

  // Live toggle button
  liveToggleBtn: {
    width: '100%',
    padding: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#000',
    backgroundColor: {
      default: '#fff',
      ':hover': '#fafafa',
    },
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },
  liveToggleBtnActive: {
    borderStyle: 'solid',
  },
  liveToggleBtnDark: {
    backgroundColor: {
      default: '#2a2a2a',
      ':hover': '#2a2a2a',
    },
    borderColor: '#555',
    color: '#ccc',
  },
  liveToggleBtnDarkActive: {
    borderColor: '#fff',
    color: '#fff',
  },

  // Stamp grid
  stampGrid: {
    display: {
      default: 'grid',
      [breakpoints.mobile]: 'flex',
    },
    gridTemplateColumns: {
      default: '1fr 1fr',
      [breakpoints.mobile]: null,
    },
    gap: {
      default: 8,
      [breakpoints.mobile]: 4,
    },
  },

  // Stamp button
  stampBtn: {
    aspectRatio: {
      default: '1',
      [breakpoints.mobile]: 'auto',
    },
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#000',
    backgroundColor: {
      default: '#fff',
      ':hover': '#fafafa',
    },
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    transitionProperty: 'all',
    transitionDuration: '0.08s',
    width: {
      default: null,
      [breakpoints.mobile]: 44,
      [breakpoints.small]: 38,
    },
    height: {
      default: null,
      [breakpoints.mobile]: 44,
      [breakpoints.small]: 38,
    },
    flexShrink: {
      default: null,
      [breakpoints.mobile]: 0,
    },
  },
  stampBtnActive: {
    borderStyle: 'solid',
  },
  stampBtnDark: {
    backgroundColor: {
      default: '#2a2a2a',
      ':hover': '#2a2a2a',
    },
    borderColor: '#555',
  },
  stampBtnDarkActive: {
    borderColor: '#fff',
  },
  stampBtnCanvas: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  stampBtnSvg: {
    width: '100%',
    height: '100%',
  },
});

export default function LeftPanel({ darkMode: darkModeProp } = {}) {
  const { state, dispatch } = useStore();
  const darkMode = darkModeProp !== undefined ? darkModeProp : state.darkMode;

  return (
    <div {...stylex.props(s.leftPanel, darkMode && s.leftPanelDark)}>
      <div {...stylex.props(s.panelSection, s.panelSectionLeftMobile, darkMode && s.panelSectionDark)}>
        <div {...stylex.props(s.panelHeader, darkMode && s.panelHeaderDark)}>// tools</div>
        <div {...stylex.props(s.toolGrid)}>
          {['brush', 'fill', 'erase', 'confetti', 'text', 'line', 'crayon', 'marker'].map(tool => (
            <button
              key={tool}
              {...stylex.props(
                s.toolBtn,
                state.tool === tool && s.toolBtnActive,
                darkMode && s.toolBtnDark,
                darkMode && state.tool === tool && s.toolBtnDarkActive,
              )}
              onClick={() => dispatch({ type: 'SET_TOOL', tool })}
              title={tool}
            >
              <ToolIcon tool={tool} darkMode={darkMode} svgStyle={[s.toolBtnSvg]} />
            </button>
          ))}
        </div>
      </div>

      <div {...stylex.props(s.panelSection, s.panelSectionLeftMobile, darkMode && s.panelSectionDark)}>
        <div {...stylex.props(s.panelHeader, darkMode && s.panelHeaderDark)}>// colors</div>
        <div {...stylex.props(s.colorGrid)}>
          {colors.map(c => (
            <div
              key={c}
              {...stylex.props(
                s.colorSwatch,
                state.color === c && s.colorSwatchActive,
                darkMode && s.colorSwatchDark,
                darkMode && state.color === c && s.colorSwatchDarkActive,
              )}
              style={{ background: c }}
              onClick={() => dispatch({ type: 'SET_COLOR', color: c })}
            >
              <div {...stylex.props(s.grainOverlay)} />
            </div>
          ))}
        </div>
      </div>

      <div {...stylex.props(s.panelSection, s.panelSectionLeftMobile, darkMode && s.panelSectionDark)}>
        <div {...stylex.props(s.panelHeader, darkMode && s.panelHeaderDark)}>// size</div>
        <div {...stylex.props(s.sliderBox, darkMode && s.sliderBoxDark)}>
          <input
            type="range"
            {...stylex.props(s.slider, darkMode && s.sliderDark)}
            min="1" max="80"
            value={state.brushSize}
            onChange={e => dispatch({ type: 'SET_BRUSH_SIZE', size: parseInt(e.target.value) })}
          />
          <span {...stylex.props(s.sliderVal, darkMode && s.sliderValDark)}>{state.brushSize}</span>
        </div>
      </div>

      <div {...stylex.props(s.panelSection, s.panelSectionLeftMobile, darkMode && s.panelSectionDark)}>
        <div {...stylex.props(s.panelHeader, darkMode && s.panelHeaderDark)}>// pixel</div>
        <div {...stylex.props(s.sliderBox, darkMode && s.sliderBoxDark)}>
          <input
            type="range"
            {...stylex.props(s.slider, darkMode && s.sliderDark)}
            min="1" max="8"
            value={state.pixelation}
            onChange={e => dispatch({ type: 'SET_PIXELATION', value: parseInt(e.target.value) })}
          />
          <span {...stylex.props(s.sliderVal, darkMode && s.sliderValDark)}>{state.pixelation}</span>
        </div>
      </div>

      <div {...stylex.props(s.panelSection, s.panelSectionLeftMobile, darkMode && s.panelSectionDark)}>
        <button
          {...stylex.props(
            s.liveToggleBtn,
            state.liveMode && s.liveToggleBtnActive,
            darkMode && s.liveToggleBtnDark,
            darkMode && state.liveMode && s.liveToggleBtnDarkActive,
          )}
          onClick={() => dispatch({ type: 'SET_LIVE_MODE', value: !state.liveMode })}
        >
          {state.liveMode ? '◉ live' : '○ live'}
        </button>
      </div>
    </div>
  );
}

export function RightPanel({ darkMode: darkModeProp } = {}) {
  const { state, dispatch } = useStore();
  const darkMode = darkModeProp !== undefined ? darkModeProp : state.darkMode;

  return (
    <div {...stylex.props(s.rightPanel, darkMode && s.rightPanelDark)}>
      <div {...stylex.props(s.panelSection, s.panelSectionRightMobile, darkMode && s.panelSectionDark)}>
        <div {...stylex.props(s.panelHeader, darkMode && s.panelHeaderDark)}>// stamps</div>
        <div {...stylex.props(s.stampGrid)}>
          {stamps.map((stamp, i) => (
            <StampButton
              key={stamp.name}
              stamp={stamp}
              index={i}
              active={state.tool === 'stamp' && state.selectedStamp === i}
              onClick={() => dispatch({ type: 'SET_STAMP', index: i })}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StampButton({ stamp, index, active, onClick, darkMode }) {
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
    <button
      {...stylex.props(
        s.stampBtn,
        active && s.stampBtnActive,
        darkMode && s.stampBtnDark,
        darkMode && active && s.stampBtnDarkActive,
      )}
      onClick={onClick}
      title={stamp.name}
    >
      <canvas ref={canvasRef} {...stylex.props(s.stampBtnCanvas)} />
    </button>
  );
}

function ToolIcon({ tool, darkMode, svgStyle }) {
  const icons = {
    brush: <svg {...stylex.props(...svgStyle)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>,
    fill: <svg {...stylex.props(...svgStyle)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 7 6 2"/><path d="M18.992 12H2.041"/><path d="m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33"/></svg>,
    erase: <svg {...stylex.props(...svgStyle)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/></svg>,
    confetti: <svg {...stylex.props(...svgStyle)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>,
    text: <svg {...stylex.props(...svgStyle)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
    line: <svg {...stylex.props(...svgStyle)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>,
    crayon: <svg {...stylex.props(...svgStyle)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 2.5 L21.5 6.5 L8 20 L2 22 L4 16 Z"/><path d="M15 5 L19 9"/></svg>,
    marker: <svg {...stylex.props(...svgStyle)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 20 Q8 14 12 12 Q16 10 20 4"/><circle cx="6" cy="18" r="1.2" fill="currentColor" stroke="none"/><circle cx="10" cy="14" r="1.2" fill="currentColor" stroke="none"/><circle cx="14" cy="11" r="1.2" fill="currentColor" stroke="none"/><circle cx="18" cy="6" r="1.2" fill="currentColor" stroke="none"/></svg>,
  };
  return icons[tool] || null;
}
