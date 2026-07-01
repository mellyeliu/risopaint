import { useState, useEffect, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { StoreProvider, useStore } from './state/store.jsx';
import MenuBar from './components/MenuBar.jsx';
import LeftPanel, { RightPanel } from './components/Panels.jsx';
import Canvas from './components/Canvas.jsx';
import BottomBar from './components/BottomBar.jsx';
import Gallery, { SubmitPopup } from './components/Gallery.jsx';
import StarfishBg from './components/StarfishBg.jsx';
import LandingScreen from './components/LandingScreen.jsx';
import JournalScreen from './components/JournalScreen.jsx';
import { initGallery, fixBlackBackgrounds } from './lib/gallery.js';
import { preloadStamps } from './lib/stamps.js';
import { getLevel, getChapter, exportCurrentLevel } from './lib/levels.js';
import { breakpoints, grain } from './tokens.stylex.js';
import './styles.css';
import '@fontsource/syne-mono';

preloadStamps();
initGallery();
window._exportLevel = exportCurrentLevel;
window._fixBlackBackgrounds = fixBlackBackgrounds;

const s = stylex.create({
  editorFrame: {
    width: '100%',
    maxWidth: {
      default: 'min(calc(100% - 140px), 1200px)',
      [breakpoints.mobile]: '100%',
    },
    height: '100%',
    maxHeight: {
      default: 'calc(100% - 140px)',
      [breakpoints.mobile]: '100%',
    },
    background: '#fff',
    borderWidth: {
      default: 1,
      [breakpoints.mobile]: 0,
    },
    borderStyle: {
      default: 'solid',
      [breakpoints.mobile]: 'none',
    },
    borderColor: '#000',
    borderRadius: {
      default: '5px',
      [breakpoints.mobile]: 0,
    },
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
  },
  dark: {
    background: '#222',
    borderColor: '#444',
  },
  fullbleed: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    borderWidth: {
      default: 1,
      [breakpoints.mobile]: 0,
    },
    borderStyle: {
      default: 'solid',
      [breakpoints.mobile]: 'none',
    },
  },
  grainOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: grain.bg,
    backgroundSize: '200px 200px',
    opacity: 0.08,
    mixBlendMode: 'multiply',
    pointerEvents: 'none',
    zIndex: 100,
  },
  workspace: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
    background: '#fff',
    flexDirection: {
      default: 'row',
      [breakpoints.mobile]: 'column',
    },
  },
  workspaceDark: {
    background: '#222',
  },
});

function useRoute() {
  const getRoute = () => {
    const path = window.location.pathname;
    if (path === '/gallery') return 'gallery';
    if (path === '/game') return 'landing';
    if (path === '/journal') return 'journal';
    const saved = sessionStorage.getItem('risopaint-route');
    if (saved === 'gallery') return saved;
    return 'canvas';
  };
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to) => {
    const paths = { gallery: '/gallery', canvas: '/', landing: '/game', journal: '/game' };
    history.pushState(null, '', paths[to] || '/');
    if (to === 'gallery') sessionStorage.setItem('risopaint-route', to);
    else sessionStorage.removeItem('risopaint-route');
    setRoute(to);
  }, []);

  return [route, navigate];
}

function AppInner() {
  const { state, dispatch } = useStore();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [route, navigate] = useRoute();
  const [journalState, setJournalState] = useState(null);

  const showGallery = route === 'gallery';

  // Sync store showGallery with route (for components that read it)
  useEffect(() => {
    if (state.showGallery !== showGallery) {
      dispatch({ type: 'SET_SHOW_GALLERY', value: showGallery });
    }
  }, [showGallery]);

  // When store changes showGallery (e.g. from menu click), sync to route
  useEffect(() => {
    if (state.showGallery && route !== 'gallery') {
      navigate('gallery');
    } else if (!state.showGallery && route === 'gallery') {
      dispatch({ type: 'SET_PHYSICS', value: false });
      navigate('canvas');
    }
  }, [state.showGallery]);

  // Listen for level completion from Canvas
  useEffect(() => {
    const handler = (e) => {
      const chapterIndex = e.detail?.chapterIndex;
      if (chapterIndex != null) {
        const chapter = getChapter(chapterIndex);
        if (chapter) {
          dispatch({ type: 'SET_PHYSICS', value: false });
          setJournalState({ chapterIndex, phase: 'post' });
          navigate('journal');
        }
      }
    };
    window.addEventListener('level-complete', handler);
    return () => window.removeEventListener('level-complete', handler);
  }, [dispatch, navigate]);

  const font = { family: "'Velvelyne', serif", sizeBoost: 9 };

  const isDark = state.darkMode;
  const isFullbleed = state.fullscreen === 1;

  useEffect(() => {
    document.body.style.background = isDark ? '#202020' : '#d8d8d8';
  }, [isDark]);

  useEffect(() => {
    const app = document.getElementById('app');
    if (app) app.style.padding = (isFullbleed || route === 'landing' || route === 'journal') ? '0' : '14px';
  }, [isFullbleed, route]);

  const handleAction = (action) => {
    switch (action) {
      case 'export':
        break;
      case 'submit':
        setSubmitOpen(true);
        break;
      case 'play':
        break;
      case 'shake':
        window._physicsShake?.();
        break;
    }
  };

  const handleLandingSelect = useCallback((action) => {
    if (action === 'freeform') {
      dispatch({ type: 'SET_PHYSICS', value: false });
      navigate('canvas');
    } else if (action.startsWith('chapter-')) {
      const chapterNum = parseInt(action.split('-')[1], 10);
      const chapter = getChapter(chapterNum - 1);
      if (chapter) {
        setJournalState({ chapterIndex: chapterNum - 1, phase: 'pre' });
        navigate('journal');
      }
    }
  }, [navigate, dispatch]);

  const handleJournalContinue = useCallback(() => {
    if (!journalState) return;
    const { chapterIndex, phase } = journalState;

    if (phase === 'pre') {
      const level = getLevel(chapterIndex);
      if (level) {
        dispatch({ type: 'LOAD_LEVEL', strokes: level, name: `Chapter ${chapterIndex + 1}`, chapterIndex });
        dispatch({ type: 'SET_PHYSICS', value: true });
        setJournalState(null);
        navigate('canvas');
      }
    } else {
      setJournalState(null);
      navigate('landing');
    }
  }, [journalState, dispatch, navigate]);

  // Journal screen
  if (route === 'journal' && journalState) {
    const chapter = getChapter(journalState.chapterIndex);
    if (chapter) {
      return (
        <>
          {!isDark && <StarfishBg darkMode={false} />}
          {isDark && <StarfishBg darkMode={true} />}
          <div
            {...stylex.props(s.editorFrame, isDark && s.dark, s.fullbleed)}
            style={{ fontFamily: font.family, fontSize: `${13 + font.sizeBoost}px` }}
          >
            <JournalScreen
              chapter={chapter}
              chapterIndex={journalState.chapterIndex}
              phase={journalState.phase}
              darkMode={isDark}
              onContinue={handleJournalContinue}
            />
            <div {...stylex.props(s.grainOverlay)} />
          </div>
        </>
      );
    }
  }

  // Landing screen
  if (route === 'landing') {
    return (
      <>
        {!isDark && <StarfishBg darkMode={false} />}
        {isDark && <StarfishBg darkMode={true} />}
        <div
          {...stylex.props(s.editorFrame, isDark && s.dark, s.fullbleed)}
          style={{ fontFamily: font.family, fontSize: `${13 + font.sizeBoost}px` }}
        >
          <LandingScreen
            darkMode={isDark}
            onSelect={handleLandingSelect}
            onToggleDark={() => {
              dispatch({ type: 'SET_DARK_MODE', value: !isDark });
              document.body.style.background = !isDark ? '#202020' : '#d8d8d8';
            }}
          />
          <div {...stylex.props(s.grainOverlay)} />
        </div>
      </>
    );
  }

  return (
    <>
      {!isFullbleed && !isDark && <StarfishBg darkMode={false} />}
      {!isFullbleed && isDark && <StarfishBg darkMode={true} />}

      <div
        {...stylex.props(
          s.editorFrame,
          isDark && s.dark,
          isFullbleed && s.fullbleed,
        )}
        style={{ fontFamily: font.family, fontSize: `${13 + font.sizeBoost}px` }}
      >
        <MenuBar onAction={handleAction} />

        <div
          {...stylex.props(
            s.workspace,
            isDark && s.workspaceDark,
          )}
        >
          {!showGallery && <LeftPanel />}
          {!showGallery && <Canvas />}
          {!showGallery && <RightPanel />}
          {showGallery && <Gallery />}
        </div>

        {!showGallery && <BottomBar onAction={handleAction} />}

        <SubmitPopup open={submitOpen} onClose={() => setSubmitOpen(false)} />

        <div {...stylex.props(s.grainOverlay)} />
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
