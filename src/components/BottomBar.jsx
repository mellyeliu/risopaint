import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useStore } from '../state/store.jsx';
import { breakpoints } from '../tokens.stylex.js';

const s = stylex.create({
  bottomBar: {
    background: '#ddd',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#000',
    flexShrink: 0,
  },
  bottomBarDark: {
    background: '#222',
    borderTopColor: '#444',
  },
  actionStrip: {
    display: 'flex',
    alignItems: 'stretch',
    height: {
      default: '34px',
      [breakpoints.mobile]: '32px',
    },
    flexWrap: {
      default: 'initial',
      [breakpoints.mobile]: 'nowrap',
    },
    overflowX: {
      default: 'initial',
      [breakpoints.mobile]: 'auto',
    },
  },
  actionBtn: {
    padding: {
      default: '0 12px',
      [breakpoints.mobile]: '6px 8px',
      [breakpoints.small]: '5px 6px',
    },
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: '#000',
    fontSize: {
      default: '13px',
      [breakpoints.mobile]: '11px',
      [breakpoints.small]: '10px',
    },
    color: {
      default: '#000',
      ':hover': '#000',
    },
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    transitionProperty: 'color',
    transitionDuration: '0.08s',
  },
  actionBtnDark: {
    color: {
      default: '#888',
      ':hover': '#fff',
    },
    borderRightColor: '#333',
  },
  actionActive: {
    color: '#000',
  },
  actionActiveDark: {
    color: '#fff',
  },
  actionDisabled: {
    opacity: 0.3,
    pointerEvents: 'none',
  },
  actionSpacer: {
    flex: {
      default: 1,
      [breakpoints.mobile]: 0,
    },
    width: {
      default: 'auto',
      [breakpoints.mobile]: 0,
    },
  },
  sceneTabs: {
    display: 'flex',
    flexWrap: {
      default: 'initial',
      [breakpoints.mobile]: 'nowrap',
    },
    flexShrink: {
      default: 'initial',
      [breakpoints.mobile]: 0,
    },
  },
  sceneTab: {
    position: 'relative',
    padding: {
      default: '0 10px',
      [breakpoints.mobile]: '6px 8px',
    },
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: '#000',
    fontSize: {
      default: '13px',
      [breakpoints.mobile]: '11px',
    },
    color: {
      default: '#000',
      ':hover': '#666',
    },
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    flexShrink: {
      default: 'initial',
      [breakpoints.mobile]: 0,
    },
  },
  sceneTabDark: {
    color: {
      default: '#666',
      ':hover': '#ccc',
    },
    borderRightColor: '#333',
  },
  sceneTabActive: {
    color: {
      default: '#000',
      ':hover': '#000',
    },
  },
  sceneTabActiveDark: {
    color: {
      default: '#fff',
      ':hover': '#fff',
    },
  },
  deleteScene: {
    position: 'absolute',
    top: '4px',
    right: '2px',
    fontSize: '11px',
    color: '#999',
    opacity: 0.3,
  },
  deleteSceneVisible: {
    opacity: 1,
  },
});

export default function BottomBar({ onAction }) {
  const { state, dispatch } = useStore();
  const darkMode = state.darkMode;
  const [hoveredTab, setHoveredTab] = useState(null);

  return (
    <div {...stylex.props(s.bottomBar, darkMode && s.bottomBarDark)}>
      <div {...stylex.props(s.actionStrip)}>
        <button
          {...stylex.props(s.actionBtn, darkMode && s.actionBtnDark)}
          onClick={() => onAction?.('export')}
        >
          [export]
        </button>
        <button
          {...stylex.props(s.actionBtn, darkMode && s.actionBtnDark)}
          onClick={() => dispatch({ type: 'UNDO' })}
        >
          [undo]
        </button>
        <button
          {...stylex.props(
            s.actionBtn,
            darkMode && s.actionBtnDark,
            state.physicsOn && s.actionActive,
            state.physicsOn && darkMode && s.actionActiveDark,
          )}
          onClick={() => dispatch({ type: 'SET_PHYSICS', value: !state.physicsOn })}
        >
          [{state.physicsOn ? 'stop' : 'drop!'}]
        </button>
        <button
          {...stylex.props(
            s.actionBtn,
            darkMode && s.actionBtnDark,
            !state.physicsOn && s.actionDisabled,
          )}
          onClick={() => onAction?.('shake')}
        >
          [shake]
        </button>
        <button
          {...stylex.props(s.actionBtn, darkMode && s.actionBtnDark)}
          onClick={() => dispatch({ type: 'CLEAR' })}
        >
          [obliterate]
        </button>
        <div {...stylex.props(s.actionSpacer)} />
        <div {...stylex.props(s.sceneTabs)}>
          {state.scenes.map((sc, i) => (
            <button
              key={i}
              {...stylex.props(
                s.sceneTab,
                darkMode && s.sceneTabDark,
                i === state.currentSceneIndex && s.sceneTabActive,
                i === state.currentSceneIndex && darkMode && s.sceneTabActiveDark,
              )}
              onClick={() => dispatch({ type: 'SWITCH_SCENE', index: i })}
              onMouseEnter={() => setHoveredTab(i)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {sc.name}
              {state.scenes.length > 1 && (
                <span
                  {...stylex.props(
                    s.deleteScene,
                    hoveredTab === i && s.deleteSceneVisible,
                  )}
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_SCENE', index: i }); }}
                >
                  ×
                </span>
              )}
            </button>
          ))}
          <button
            {...stylex.props(s.sceneTab, darkMode && s.sceneTabDark)}
            onClick={() => dispatch({ type: 'ADD_SCENE' })}
          >
            +
          </button>
        </div>
        <button
          {...stylex.props(s.actionBtn, darkMode && s.actionBtnDark)}
          onClick={() => onAction?.('play')}
        >
          [▶ play]
        </button>
        <button
          {...stylex.props(s.actionBtn, darkMode && s.actionBtnDark)}
          onClick={() => dispatch({ type: 'SET_SHOW_GALLERY', value: true })}
        >
          [gallery]
        </button>
        <button
          {...stylex.props(s.actionBtn, darkMode && s.actionBtnDark)}
          onClick={() => onAction?.('submit')}
        >
          [submit]
        </button>
      </div>
    </div>
  );
}
