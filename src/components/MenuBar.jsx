import { useState, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useStore } from '../state/store.jsx';
import { breakpoints, grain } from '../tokens.stylex.js';

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
};

const s = stylex.create({
  menuBar: {
    display: 'flex',
    alignItems: 'center',
    background: '#ddd',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000',
    height: {
      default: 44,
      [breakpoints.mobile]: 38,
    },
    flexShrink: 0,
    position: 'relative',
    padding: '0 4px',
    overflowX: {
      default: null,
      [breakpoints.mobile]: 'auto',
    },
    gap: {
      default: null,
      [breakpoints.mobile]: 0,
    },
  },
  menuBarDark: {
    background: '#2a2a2a',
    borderBottomColor: '#444',
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: grain.bg,
    backgroundSize: '200px 200px',
    opacity: 0.2,
    mixBlendMode: 'multiply',
    pointerEvents: 'none',
  },
  menuTitle: {
    fontSize: {
      default: 16,
      [breakpoints.mobile]: 14,
    },
    fontWeight: 700,
    color: '#000',
    padding: {
      default: '0 14px 0 10px',
      [breakpoints.mobile]: '0 8px 0 4px',
    },
    cursor: 'default',
  },
  menuTitleDark: {
    color: '#ccc',
  },
  menuItem: {
    padding: {
      default: '0 12px',
      [breakpoints.mobile]: '0 8px',
    },
    fontSize: {
      default: 15,
      [breakpoints.mobile]: 13,
    },
    color: {
      default: '#000',
      ':hover': '#000',
    },
    cursor: 'default',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
    zIndex: 31,
  },
  menuItemDark: {
    color: {
      default: '#ccc',
      ':hover': '#fff',
    },
  },
  menuItemPointer: {
    cursor: 'pointer',
  },
  hideOnSmall: {
    display: {
      default: 'flex',
      [breakpoints.small]: 'none',
    },
  },
  menuSpacer: {
    flex: 1,
  },
  menuByline: {
    fontSize: 12,
    color: '#000',
    padding: '0 8px',
    display: {
      default: null,
      [breakpoints.mobile]: 'none',
    },
  },
  menuBylineDark: {
    color: '#888',
  },
  bylineLink: {
    color: '#000',
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
  },
  bylineLinkDark: {
    color: '#888',
  },
  fontToggle: {
    padding: {
      default: '0 10px',
      [breakpoints.mobile]: '0 6px',
    },
    fontSize: {
      default: 15,
      [breakpoints.mobile]: 14,
    },
    color: {
      default: '#000',
      ':hover': '#000',
    },
    height: '100%',
  },
  fontToggleDark: {
    color: {
      default: '#ccc',
      ':hover': '#fff',
    },
  },
  darkToggle: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#bbb',
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
    margin: '0 8px',
    transitionProperty: 'background-color',
    transitionDuration: '0.2s',
  },
  darkToggleOn: {
    backgroundColor: '#555',
  },
  darkToggleKnob: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    transitionProperty: 'left, background-color',
    transitionDuration: '0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    lineHeight: 1,
  },
  darkToggleKnobOn: {
    left: 22,
    backgroundColor: '#222',
    color: '#ccc',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 29,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: '#fff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    zIndex: 30,
    minWidth: 160,
    padding: '2px 0',
    fontWeight: 400,
  },
  dropdownDark: {
    background: '#2a2a2a',
    borderColor: '#444',
  },
  dropdownItem: {
    padding: '5px 16px',
    fontSize: 14,
    color: {
      default: '#333',
      ':hover': '#fff',
    },
    cursor: 'default',
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 20,
    background: {
      default: 'transparent',
      ':hover': '#000',
    },
  },
  dropdownItemDark: {
    color: {
      default: '#ccc',
      ':hover': '#fff',
    },
    background: {
      default: 'transparent',
      ':hover': '#444',
    },
  },
  menuShortcut: {
    color: '#999',
    fontSize: 11,
  },
  menuShortcutDark: {
    color: '#666',
  },
  menuSep: {
    height: 1,
    background: '#000',
    margin: '2px 6px',
  },
  menuSepDark: {
    background: '#444',
  },
});

export default function MenuBar({ onAction }) {
  const { state, dispatch } = useStore();
  const [openMenu, setOpenMenu] = useState(null);
  const darkMode = state.darkMode;

  const handleAction = (action) => {
    setOpenMenu(null);
    const canvasActions = ['new', 'undo', 'clear', 'zoomIn', 'zoomOut', 'zoomReset', 'export', 'submit'];
    if (canvasActions.includes(action) && state.showGallery) {
      dispatch({ type: 'SET_SHOW_GALLERY', value: false });
    }
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
      default: onAction?.(action); break;
    }
  };

  return (
    <div {...stylex.props(s.menuBar, darkMode && s.menuBarDark)}>
      <div {...stylex.props(s.grain)} />

      <span {...stylex.props(s.menuTitle, darkMode && s.menuTitleDark)}>
        ❀ risopaint
      </span>

      {Object.keys(menuItems).map(menu => {
        const hideOnSmall = menu === 'view';
        return (
          <span
            key={menu}
            {...stylex.props(
              s.menuItem,
              darkMode && s.menuItemDark,
              hideOnSmall && s.hideOnSmall,
            )}
            onClick={() => setOpenMenu(openMenu === menu ? null : menu)}
            onMouseEnter={() => { if (openMenu) setOpenMenu(menu); }}
          >
            {menu}
            {openMenu === menu && (
              <Dropdown
                items={menuItems[menu]}
                darkMode={darkMode}
                onAction={handleAction}
                onClose={() => setOpenMenu(null)}
              />
            )}
          </span>
        );
      })}

      <span
        {...stylex.props(s.menuItem, s.menuItemPointer, darkMode && s.menuItemDark)}
        onClick={() => dispatch({ type: 'SET_SHOW_GALLERY', value: !state.showGallery })}
      >
        gallery
      </span>

      <span
        {...stylex.props(s.menuItem, s.menuItemPointer, darkMode && s.menuItemDark)}
        onClick={() => {
          sessionStorage.removeItem('risopaint-route');
          history.pushState(null, '', '/game');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      >
        game
      </span>

      <div {...stylex.props(s.menuSpacer)} />

      <span {...stylex.props(s.menuByline, darkMode && s.menuBylineDark)}>
        by{' '}
        <a
          href="https://mellyeliu.online"
          target="_blank"
          rel="noreferrer"
          {...stylex.props(s.bylineLink, darkMode && s.bylineLinkDark)}
        >
          mellyeliu
        </a>
      </span>

      <div
        {...stylex.props(s.darkToggle, darkMode && s.darkToggleOn)}
        onClick={() => {
          dispatch({ type: 'SET_DARK_MODE', value: !state.darkMode });
          document.body.style.background = !state.darkMode ? '#202020' : '#d8d8d8';
        }}
      >
        <div {...stylex.props(s.darkToggleKnob, darkMode && s.darkToggleKnobOn)}>
          {darkMode
            ? <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" style={{ transform: 'rotate(-10deg)' }}><circle cx="8" cy="8" r="6"/><circle cx="10" cy="6" r="5" fill="#222"/></svg>
            : <span style={{ fontSize: 11 }}>☀</span>}
        </div>
      </div>

      {openMenu && (
        <div {...stylex.props(s.backdrop)} onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}

function Dropdown({ items, darkMode, onAction, onClose }) {
  const ref = useRef(null);

  return (
    <div {...stylex.props(s.dropdown, darkMode && s.dropdownDark)} ref={ref}>
      {items.map((item, i) =>
        item === '—' ? (
          <div key={i} {...stylex.props(s.menuSep, darkMode && s.menuSepDark)} />
        ) : (
          <div
            key={i}
            {...stylex.props(s.dropdownItem, darkMode && s.dropdownItemDark)}
            onClick={() => onAction(item.action)}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span {...stylex.props(s.menuShortcut, darkMode && s.menuShortcutDark)}>
                {item.shortcut}
              </span>
            )}
          </div>
        )
      )}
    </div>
  );
}
