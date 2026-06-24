import { useState, useRef } from 'react';
import { useStore } from '../state/store.jsx';

const menuItems = {
  file: [
    { label: 'New', action: 'new' },
    '—',
    { label: 'Export PNG', action: 'export' },
    '—',
    { label: 'Submit to gallery', action: 'submit' },
  ],
  edit: [
    { label: 'Undo', shortcut: '⌘Z', action: 'undo' },
    '—',
    { label: 'Clear canvas', action: 'clear' },
  ],
  view: [
    { label: 'Zoom in', shortcut: '⌘+', action: 'zoomIn' },
    { label: 'Zoom out', shortcut: '⌘−', action: 'zoomOut' },
    { label: 'Reset zoom', action: 'zoomReset' },
    '—',
    { label: 'Toggle fullscreen', action: 'fullscreen' },
    { label: 'Toggle dark mode', action: 'darkMode' },
  ],
  help: [
    { label: 'About risopaint', action: 'about' },
    '—',
    { label: 'Keyboard shortcuts', action: 'shortcuts' },
  ],
};

export default function MenuBar({ onAction }) {
  const { state, dispatch } = useStore();
  const [openMenu, setOpenMenu] = useState(null);

  const handleAction = (action) => {
    setOpenMenu(null);
    switch (action) {
      case 'new': dispatch({ type: 'NEW_PROJECT' }); break;
      case 'undo': dispatch({ type: 'UNDO' }); break;
      case 'clear': dispatch({ type: 'CLEAR' }); break;
      case 'zoomIn': dispatch({ type: 'SET_ZOOM', value: state.zoom + 0.25 }); break;
      case 'zoomOut': dispatch({ type: 'SET_ZOOM', value: state.zoom - 0.25 }); break;
      case 'zoomReset': dispatch({ type: 'SET_ZOOM', value: 1 }); break;
      case 'fullscreen': dispatch({ type: 'SET_FULLSCREEN', value: state.fullscreen === 0 ? 1 : 0 }); break;
      case 'darkMode':
        dispatch({ type: 'SET_DARK_MODE', value: !state.darkMode });
        document.body.style.background = !state.darkMode ? '#202020' : '#d8d8d8';
        break;
      case 'about': alert('❀ risopaint\n\nA riso-textured paint tool.\nDraw, stamp, drop, share.'); break;
      case 'shortcuts': alert('⌘Z — Undo\n⌘+/− — Zoom\nArrow keys — Navigate scenes\nEsc — Close'); break;
      default: onAction?.(action); break;
    }
  };

  return (
    <div className="menu-bar">
      <span
        className="menu-title"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (state.showGallery) dispatch({ type: 'SET_SHOW_GALLERY', value: false });
        }}
      >
        ❀ risopaint
      </span>

      {Object.keys(menuItems).map(menu => (
        <span
          key={menu}
          className="menu-item"
          data-menu={menu}
          onClick={() => setOpenMenu(openMenu === menu ? null : menu)}
          onMouseEnter={() => { if (openMenu) setOpenMenu(menu); }}
        >
          {menu}
        </span>
      ))}

      <span
        className="menu-item"
        style={{ cursor: 'pointer' }}
        onClick={() => dispatch({ type: 'SET_SHOW_GALLERY', value: !state.showGallery })}
      >
        gallery
      </span>

      <div className="menu-spacer" />
      <span className="menu-byline">by <a href="https://mellyeliu.online" target="_blank" rel="noreferrer">mellyeliu</a></span>
      <button className="font-toggle" onClick={() => {
        dispatch({ type: 'SET_DARK_MODE', value: !state.darkMode });
        document.body.style.background = !state.darkMode ? '#202020' : '#d8d8d8';
      }}>{state.darkMode ? '☀' : '☾'}</button>
      <button className="font-toggle" onClick={() => {
        dispatch({ type: 'SET_FULLSCREEN', value: state.fullscreen === 0 ? 1 : 0 });
      }}>⛶</button>

      {openMenu && (
        <Dropdown
          menu={openMenu}
          items={menuItems[openMenu]}
          onAction={handleAction}
          onClose={() => setOpenMenu(null)}
        />
      )}
    </div>
  );
}

function Dropdown({ menu, items, onAction, onClose }) {
  const ref = useRef(null);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 29 }} onClick={onClose} />
      <div className="menu-dropdown" ref={ref}>
        {items.map((item, i) =>
          item === '—' ? (
            <div key={i} className="menu-sep" />
          ) : (
            <div
              key={i}
              className="menu-dropdown-item"
              onClick={() => onAction(item.action)}
            >
              <span>{item.label}</span>
              {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
            </div>
          )
        )}
      </div>
    </>
  );
}
