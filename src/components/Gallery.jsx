import { useState, useEffect } from 'react';
import { useStore } from '../state/store.jsx';
import { getGalleryItems, submitToGallery } from '../lib/gallery.js';
import { drawStroke } from '../lib/tools.js';
import { applyGrain } from '../lib/grain.js';

export default function Gallery() {
  const { state, dispatch } = useStore();
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
    <div className="gallery-page">
      <div className="gallery-page-header">
        <div className="gallery-page-title">// gallery</div>
        <button
          className="gallery-back-btn"
          onClick={() => dispatch({ type: 'SET_SHOW_GALLERY', value: false })}
        >
          [← back to canvas]
        </button>
      </div>
      <div className="gallery-grid-full" id="gallery-grid">
        {loading && <div style={{ color: '#999', padding: 20 }}>loading...</div>}
        {!loading && items.length === 0 && (
          <div style={{ color: '#999', padding: 20 }}>no submissions yet — be the first!</div>
        )}
        {!loading && items.map(item => (
          <div key={item.id} className="gallery-card">
            <div className="gallery-img-wrap">
              <img src={item.image} alt={item.message || 'untitled'} />
            </div>
            <div className="gallery-card-info">
              <span className="gallery-card-name">{item.message || 'untitled'}</span>
              <span className="gallery-card-msg">{item.name || 'anon'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubmitPopup({ open, onClose }) {
  const { state } = useStore();
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
    currentScene.strokes.forEach(s => drawStroke(ctx, s, state));
    applyGrain(ctx, w, h, 25);

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
    <div className="submit-popup">
      <div className="submit-popup-header">
        <span>// submit to gallery</span>
        <button className="submit-popup-close" onClick={onClose}>×</button>
      </div>
      <div className="submit-popup-body">
        <input
          type="text" className="gallery-input" placeholder="your name" maxLength={30}
          value={name} onChange={e => setName(e.target.value)}
        />
        <input
          type="text" className="gallery-input" placeholder="title or message" maxLength={100}
          value={message} onChange={e => setMessage(e.target.value)}
        />
        <button
          className="gallery-submit-btn"
          onClick={handleSubmit}
          disabled={status !== 'idle'}
        >
          {status === 'submitting' ? '[submitting...]' : status === 'done' ? '[submitted ✓]' : status === 'error' ? '[error]' : '[submit work]'}
        </button>
      </div>
    </div>
  );
}
