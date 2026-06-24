import { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './state/store.jsx';
import MenuBar from './components/MenuBar.jsx';
import LeftPanel, { RightPanel } from './components/Panels.jsx';
import Canvas from './components/Canvas.jsx';
import BottomBar from './components/BottomBar.jsx';
import Gallery, { SubmitPopup } from './components/Gallery.jsx';
import StarfishBg from './components/StarfishBg.jsx';
import { initGallery } from './lib/gallery.js';
import { preloadStamps } from './lib/stamps.js';
import './styles.css';
import '@fontsource/syne-mono';

preloadStamps();
initGallery();

function AppInner() {
  const { state, dispatch } = useStore();
  const [submitOpen, setSubmitOpen] = useState(false);

  const font = { family: "'Velvelyne', serif", sizeBoost: 9 };
  const sizeStyle = font.sizeBoost ? `font-size: ${13 + font.sizeBoost}px` : '';

  useEffect(() => {
    document.body.style.background = state.darkMode ? '#202020' : '#d8d8d8';
  }, [state.darkMode]);

  useEffect(() => {
    const app = document.getElementById('app');
    if (app) app.style.padding = state.fullscreen === 1 ? '0' : '14px';
  }, [state.fullscreen]);

  const handleAction = (action) => {
    switch (action) {
      case 'export':
        // TODO: save canvas as PNG
        break;
      case 'submit':
        setSubmitOpen(true);
        break;
      case 'play':
        // TODO: play story
        break;
      case 'shake':
        // TODO: shake physics
        break;
    }
  };

  return (
    <>
      {state.fullscreen !== 1 && !state.darkMode && <StarfishBg darkMode={false} />}
      {state.fullscreen !== 1 && state.darkMode && <StarfishBg darkMode={true} />}

      <div
        className={`editor-frame ${state.darkMode ? 'dark' : ''} ${state.fullscreen === 1 ? 'fullbleed' : ''}`}
        style={{ fontFamily: font.family, fontSize: `${13 + font.sizeBoost}px` }}
      >
        <MenuBar onAction={handleAction} />

        <div className="workspace">
          {!state.showGallery && <LeftPanel />}
          {!state.showGallery && <Canvas />}
          {!state.showGallery && <RightPanel />}
          {state.showGallery && <Gallery />}
        </div>

        {!state.showGallery && <BottomBar onAction={handleAction} />}

        <SubmitPopup open={submitOpen} onClose={() => setSubmitOpen(false)} />
      </div>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
