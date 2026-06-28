import { useState, useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useStore } from '../state/store.jsx';
import { getGalleryItems, submitToGallery } from '../lib/gallery.js';
import { drawStroke } from '../lib/tools.js';
import { applyGrainExport } from '../lib/grain.js';
import { breakpoints, grain } from '../tokens.stylex.js';

const s = stylex.create({
  galleryPage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  galleryPageDark: {
    background: '#222',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000',
  },
  headerDark: {
    borderBottomColor: '#444',
  },
  title: {
    fontSize: '14px',
    color: '#000',
  },
  titleDark: {
    color: '#ccc',
  },
  backBtn: {
    background: 'none',
    borderWidth: 1,
    borderStyle: {
      default: 'dashed',
      ':hover': 'solid',
    },
    borderColor: '#000',
    padding: '4px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    color: '#000',
  },
  backBtnDark: {
    color: '#ccc',
    borderColor: '#555',
  },
  gridFull: {
    flex: 1,
    overflowY: 'auto',
    padding: {
      default: '16px 20px',
      [breakpoints.mobile]: '8px',
    },
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(4, 1fr)',
      [breakpoints.mobile]: '1fr 1fr',
    },
    gap: {
      default: '12px',
      [breakpoints.mobile]: '8px',
    },
    alignContent: 'start',
  },
  gridFullDark: {
    background: '#222',
  },
  statusText: {
    color: '#999',
    padding: '20px',
  },
  card: {
    borderWidth: 1,
    borderStyle: {
      default: 'dashed',
      ':hover': 'solid',
    },
    borderColor: '#000',
  },
  cardDark: {
    borderColor: '#555',
    background: '#2a2a2a',
  },
  imgWrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  grainOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: grain.bgSm,
    backgroundSize: '100px 100px',
    opacity: 0.25,
    mixBlendMode: 'multiply',
    pointerEvents: 'none',
  },
  cardImg: {
    width: '100%',
    aspectRatio: '4/3',
    objectFit: 'cover',
    display: 'block',
    borderBottom: '1px dashed #000',
    position: 'relative',
  },
  cardInfo: {
    padding: '8px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  cardName: {
    fontSize: '12px',
    color: '#000',
    wordWrap: 'break-word',
  },
  cardNameDark: {
    color: '#ccc',
  },
  cardMsg: {
    fontSize: '10px',
    color: '#999',
    wordWrap: 'break-word',
  },
  cardMsgDark: {
    color: '#666',
  },
  submitPopup: {
    position: 'absolute',
    bottom: {
      default: '40px',
      [breakpoints.mobile]: '36px',
    },
    right: {
      default: '12px',
      [breakpoints.mobile]: '8px',
    },
    left: {
      default: null,
      [breakpoints.mobile]: '8px',
    },
    width: {
      default: '300px',
      [breakpoints.mobile]: 'auto',
    },
    background: '#fff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    zIndex: 50,
  },
  submitPopupDark: {
    background: '#222',
    borderColor: '#444',
  },
  submitPopupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000',
    fontSize: '12px',
  },
  submitPopupHeaderDark: {
    borderBottomColor: '#444',
    color: '#ccc',
  },
  submitPopupClose: {
    fontSize: '16px',
    color: {
      default: '#999',
      ':hover': '#000',
    },
  },
  submitPopupBody: {
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  galleryInput: {
    flex: 1,
    padding: '6px 10px',
    borderWidth: 1,
    borderStyle: {
      default: 'dashed',
      ':focus': 'solid',
    },
    borderColor: '#000',
    background: '#fff',
    fontFamily: 'inherit',
    fontSize: '13px',
    outline: 'none',
  },
  galleryInputDark: {
    background: '#2a2a2a',
    color: '#ccc',
    borderColor: '#555',
  },
  gallerySubmitBtn: {
    padding: '6px 14px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    background: {
      default: '#fff',
      ':hover': '#000',
    },
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '13px',
    color: {
      default: '#000',
      ':hover': '#fff',
    },
    whiteSpace: 'nowrap',
  },
  gallerySubmitBtnDark: {
    background: {
      default: '#2a2a2a',
      ':hover': '#fff',
    },
    color: {
      default: '#ccc',
      ':hover': '#000',
    },
    borderColor: '#555',
  },
});

export default function Gallery() {
  const { state, dispatch } = useStore();
  const darkMode = state.darkMode;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.showGallery) return;
    setLoading(true);
    getGalleryItems(50).then(data => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [state.showGallery]);

  if (!state.showGallery) return null;

  return (
    <div {...stylex.props(s.galleryPage, darkMode && s.galleryPageDark)}>
      <div {...stylex.props(s.header, darkMode && s.headerDark)}>
        <div {...stylex.props(s.title, darkMode && s.titleDark)}>// gallery</div>
        <button
          {...stylex.props(s.backBtn, darkMode && s.backBtnDark)}
          onClick={() => dispatch({ type: 'SET_SHOW_GALLERY', value: false })}
        >
          [← back to canvas]
        </button>
      </div>
      <div {...stylex.props(s.gridFull, darkMode && s.gridFullDark)} id="gallery-grid">
        {loading && <div {...stylex.props(s.statusText)}>loading...</div>}
        {!loading && items.length === 0 && (
          <div {...stylex.props(s.statusText)}>no submissions yet — be the first!</div>
        )}
        {!loading && items.map(item => (
          <div key={item.id} {...stylex.props(s.card, darkMode && s.cardDark)}>
            <div {...stylex.props(s.imgWrap)}>
              <img
                src={item.image}
                alt={item.message || 'untitled'}
                {...stylex.props(s.cardImg)}
              />
              <div {...stylex.props(s.grainOverlay)} />
            </div>
            <div {...stylex.props(s.cardInfo)}>
              <span {...stylex.props(s.cardName, darkMode && s.cardNameDark)}>
                {item.message || 'untitled'}
              </span>
              <span {...stylex.props(s.cardMsg, darkMode && s.cardMsgDark)}>
                {item.name || 'anon'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubmitPopup({ open, onClose }) {
  const { state } = useStore();
  const darkMode = state.darkMode;
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  if (!open) return null;

  const handleSubmit = async () => {
    const currentScene = state.scenes[state.currentSceneIndex];
    const w = 800;
    const h = 600;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w * window.devicePixelRatio;
    tempCanvas.height = h * window.devicePixelRatio;
    const ctx = tempCanvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    currentScene.strokes.forEach(stroke => drawStroke(ctx, stroke, state));
    applyGrainExport(ctx, w, h, 25);

    setStatus('submitting');
    try {
      await submitToGallery(tempCanvas, name, message);
      setName('');
      setMessage('');
      setStatus('done');
      setTimeout(() => { setStatus('idle'); onClose(); }, 1200);
    } catch (e) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1500);
    }
  };

  return (
    <div {...stylex.props(s.submitPopup, darkMode && s.submitPopupDark)}>
      <div {...stylex.props(s.submitPopupHeader, darkMode && s.submitPopupHeaderDark)}>
        <span>// submit to gallery</span>
        <button {...stylex.props(s.submitPopupClose)} onClick={onClose}>×</button>
      </div>
      <div {...stylex.props(s.submitPopupBody)}>
        <input
          type="text"
          placeholder="your name"
          maxLength={30}
          value={name}
          onChange={e => setName(e.target.value)}
          {...stylex.props(s.galleryInput, darkMode && s.galleryInputDark)}
        />
        <input
          type="text"
          placeholder="title or message"
          maxLength={100}
          value={message}
          onChange={e => setMessage(e.target.value)}
          {...stylex.props(s.galleryInput, darkMode && s.galleryInputDark)}
        />
        <button
          {...stylex.props(s.gallerySubmitBtn, darkMode && s.gallerySubmitBtnDark)}
          onClick={handleSubmit}
          disabled={status !== 'idle'}
        >
          {status === 'submitting' ? '[submitting...]' : status === 'done' ? '[submitted ✓]' : status === 'error' ? '[error]' : '[submit work]'}
        </button>
      </div>
    </div>
  );
}
