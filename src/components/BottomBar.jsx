import { useStore } from '../state/store.jsx';

export default function BottomBar({ onAction }) {
  const { state, dispatch } = useStore();
  const currentScene = state.scenes[state.currentSceneIndex];

  return (
    <div className="bottom-bar">
      <div className="action-strip">
        <button className="action-btn" onClick={() => onAction?.('export')}>[export]</button>
        <button className="action-btn" onClick={() => dispatch({ type: 'UNDO' })}>[undo]</button>
        <button
          className={`action-btn ${state.physicsOn ? 'action-active' : ''}`}
          onClick={() => dispatch({ type: 'SET_PHYSICS', value: !state.physicsOn })}
        >
          [{state.physicsOn ? 'stop' : 'drop!'}]
        </button>
        <button
          className="action-btn"
          style={!state.physicsOn ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
          onClick={() => onAction?.('shake')}
        >
          [shake]
        </button>
        <button className="action-btn" onClick={() => dispatch({ type: 'CLEAR' })}>[obliterate]</button>
        <div className="action-spacer" />
        <div className="scene-tabs">
          {state.scenes.map((s, i) => (
            <button
              key={i}
              className={`scene-tab ${i === state.currentSceneIndex ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SWITCH_SCENE', index: i })}
            >
              {s.name}
              {state.scenes.length > 1 && (
                <span
                  className="delete-scene"
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_SCENE', index: i }); }}
                >
                  ×
                </span>
              )}
            </button>
          ))}
          <button className="scene-tab" onClick={() => dispatch({ type: 'ADD_SCENE' })}>+</button>
        </div>
        <button className="action-btn" onClick={() => onAction?.('play')}>[▶ play]</button>
        <button className="action-btn" onClick={() => dispatch({ type: 'SET_SHOW_GALLERY', value: true })}>[gallery]</button>
        <button className="action-btn" onClick={() => onAction?.('submit')}>[submit]</button>
      </div>
    </div>
  );
}
