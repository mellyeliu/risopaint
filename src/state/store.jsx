import { createContext, useContext, useReducer, useCallback } from 'react';

const GRID_SIZE = 16;

function createScene(name) {
  return { name, strokes: [], narrative: '', snapshot: null };
}

const initialState = {
  tool: 'brush',
  color: '#e8507a',
  brushSize: 6,
  selectedStamp: null,
  scenes: [createScene('Scene 1')],
  currentSceneIndex: 0,
  physicsOn: false,
  isDrawing: false,
  currentStroke: null,
  pixelation: 1,
  darkMode: window.matchMedia?.('(prefers-color-scheme: dark)').matches || false,
  fullscreen: 1,
  zoom: 1,
  showGallery: false,
  liveMode: true,
};

// Load from localStorage
function loadSavedState() {
  try {
    const saved = localStorage.getItem('risopaint-state');
    if (!saved) return initialState;
    const data = JSON.parse(saved);
    return {
      ...initialState,
      scenes: data.scenes || initialState.scenes,
      currentSceneIndex: data.currentSceneIndex ?? 0,
      color: data.color || initialState.color,
      brushSize: data.brushSize || initialState.brushSize,
      pixelation: data.pixelation ?? 1,
      darkMode: data.darkMode ?? initialState.darkMode,
      fullscreen: data.fullscreen ?? 1,
      physicsOn: data.physicsOn ?? false,
      tool: data.tool || 'brush',
    };
  } catch (e) {
    return initialState;
  }
}

function saveState(state) {
  try {
    localStorage.setItem('risopaint-state', JSON.stringify({
      scenes: state.scenes,
      currentSceneIndex: state.currentSceneIndex,
      color: state.color,
      brushSize: state.brushSize,
      pixelation: state.pixelation,
      darkMode: state.darkMode,
      fullscreen: state.fullscreen,
      physicsOn: state.physicsOn,
      tool: state.tool,
    }));
  } catch (e) {}
}

function reducer(state, action) {
  let newState;
  switch (action.type) {
    case 'SET_TOOL':
      newState = { ...state, tool: action.tool, selectedStamp: null };
      break;
    case 'SET_COLOR':
      newState = {
        ...state,
        color: action.color,
        // Only reset to brush if stamp was selected
        tool: state.tool === 'stamp' ? 'brush' : state.tool,
        selectedStamp: state.tool === 'stamp' ? null : state.selectedStamp,
      };
      break;
    case 'SET_STAMP':
      if (state.tool === 'stamp' && state.selectedStamp === action.index) {
        newState = { ...state, tool: 'brush', selectedStamp: null };
      } else {
        newState = { ...state, tool: 'stamp', selectedStamp: action.index };
      }
      break;
    case 'SET_BRUSH_SIZE':
      newState = { ...state, brushSize: action.size };
      break;
    case 'SET_PIXELATION':
      newState = { ...state, pixelation: action.value };
      break;
    case 'SET_DARK_MODE':
      newState = { ...state, darkMode: action.value };
      break;
    case 'SET_FULLSCREEN':
      newState = { ...state, fullscreen: action.value };
      break;
    case 'SET_LIVE_MODE':
      newState = { ...state, liveMode: action.value };
      break;
    case 'SET_PHYSICS':
      newState = { ...state, physicsOn: action.value };
      break;
    case 'SET_SHOW_GALLERY':
      newState = { ...state, showGallery: action.value };
      break;
    case 'SET_ZOOM':
      newState = { ...state, zoom: Math.max(0.25, Math.min(4, action.value)) };
      break;
    case 'ADD_STROKE':
      newState = {
        ...state,
        scenes: state.scenes.map((s, i) =>
          i === state.currentSceneIndex
            ? { ...s, strokes: [...s.strokes, action.stroke] }
            : s
        ),
      };
      break;
    case 'UNDO':
      newState = {
        ...state,
        scenes: state.scenes.map((s, i) =>
          i === state.currentSceneIndex
            ? { ...s, strokes: s.strokes.slice(0, -1) }
            : s
        ),
      };
      break;
    case 'CLEAR':
      newState = {
        ...state,
        scenes: state.scenes.map((s, i) =>
          i === state.currentSceneIndex ? { ...s, strokes: [] } : s
        ),
      };
      break;
    case 'ADD_SCENE':
      newState = {
        ...state,
        scenes: [...state.scenes, createScene(`Scene ${state.scenes.length + 1}`)],
        currentSceneIndex: state.scenes.length,
      };
      break;
    case 'SWITCH_SCENE':
      newState = { ...state, currentSceneIndex: action.index };
      break;
    case 'DELETE_SCENE':
      if (state.scenes.length <= 1) return state;
      const newScenes = state.scenes.filter((_, i) => i !== action.index);
      newState = {
        ...state,
        scenes: newScenes,
        currentSceneIndex: Math.min(state.currentSceneIndex, newScenes.length - 1),
      };
      break;
    case 'NEW_PROJECT':
      newState = {
        ...state,
        scenes: [createScene('Scene 1')],
        currentSceneIndex: 0,
      };
      break;
    case 'SET_DRAWING':
      return { ...state, isDrawing: action.value };
    case 'SET_CURRENT_STROKE':
      return { ...state, currentStroke: action.stroke };
    default:
      return state;
  }
  saveState(newState);
  return newState;
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadSavedState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

export { GRID_SIZE, createScene };
