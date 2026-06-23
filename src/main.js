import './styles.css';
import '@fontsource/syne-mono';
import { stamps, getStampImage, preloadStamps } from './stamps.js';
import { PhysicsEngine } from './physics.js';
import { getDitheredStamp } from './dither.js';

// ── State ──
const state = {
  tool: 'brush',           // brush | stamp | fill | erase | text
  color: '#e8507a',
  brushSize: 6,
  selectedStamp: null,
  scenes: [createScene('Scene 1')],
  currentSceneIndex: 0,
  physicsOn: false,
  isDrawing: false,
  currentStroke: null,
  pixelation: 1,            // 1 = smooth, 8 = very chunky
  fontIndex: 0,              // Velvelyne
  bgIndex: 0,                // cycles through bg patterns
  darkMode: false,
  fullscreen: 0,  // 0 = normal, 1 = full bleed
  zoom: 1,
};

const fonts = [
  { name: 'Velvelyne', family: "'Velvelyne', serif", sizeBoost: 7 },
];

const bgPatterns = [
  { name: '✿', char: '✿' },
];

const GRID_SIZE = 16; // px per grid cell

function createScene(name) {
  return {
    name,
    strokes: [],           // array of stroke objects
    narrative: '',          // text for story mode
    snapshot: null,         // cached canvas snapshot for thumbnails
  };
}

function currentScene() {
  return state.scenes[state.currentSceneIndex];
}

// ── Colors (riso ink + pastels) ──
const colors = [
  '#e8507a', // fluorescent pink
  '#f4a0b5', // pastel pink
  '#d4622b', // orange
  '#f0a868', // peach
  '#e8c840', // yellow
  '#f5e6a3', // butter
  '#5cb85c', // green
  '#a8d8a8', // sage
  '#3a9e95', // teal
  '#89ccc5', // mint
  '#3255a4', // blue
  '#92b4e0', // sky
  '#7b68ae', // purple
  '#b8a4d8', // lavender
  '#9e3a6b', // wine
  '#1a1a2e', // near-black
  '#888888', // gray
  '#ffffff', // white
];

// ── Physics ──
const physics = new PhysicsEngine();

// ── DOM ──
function render() {
  const app = document.getElementById('app');
  const font = fonts[state.fontIndex];
  const sizeStyle = font.sizeBoost ? `font-size: ${13 + font.sizeBoost}px` : '';

  app.style.padding = state.fullscreen === 1 ? '0' : '14px';
  app.innerHTML = `
    ${state.fullscreen === 1 ? '' : `<div class="starfish-bg ${state.darkMode ? 'dark-stars' : ''}" id="starfish-bg"></div>`}
    <div class="editor-frame ${state.darkMode ? 'dark' : ''} ${state.fullscreen === 1 ? 'fullbleed' : ''}" style="font-family: ${font.family}; ${sizeStyle}">
    <!-- Menu bar -->
    <div class="menu-bar">
      <span class="menu-title">❀ risopaint</span>
      <span class="menu-item" data-menu="file">file</span>
      <span class="menu-item" data-menu="edit">edit</span>
      <span class="menu-item" data-menu="view">view</span>
      <span class="menu-item" data-menu="help">help</span>
      <div class="menu-spacer"></div>
      <button class="font-toggle" id="dark-toggle" title="Toggle dark mode">${state.darkMode ? '☀' : '☾'}</button>
      <button class="font-toggle" id="fullscreen-toggle" title="Fullscreen">⛶</button>
    </div>

    <!-- Main workspace -->
    <div class="workspace">
      <!-- Left panel: tools + colors -->
      <div class="left-panel">
        <div class="panel-section">
          <div class="panel-header">// tools</div>
          <div class="tool-grid">
            <button class="tool-btn ${state.tool === 'brush' ? 'active' : ''}" data-tool="brush" title="brush">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>
            </button>
            <button class="tool-btn ${state.tool === 'fill' ? 'active' : ''}" data-tool="fill" title="fill">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 7 6 2"/><path d="M18.992 12H2.041"/><path d="M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595"/><path d="m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33"/></svg>
            </button>
            <button class="tool-btn ${state.tool === 'erase' ? 'active' : ''}" data-tool="erase" title="erase">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/></svg>
            </button>
            <button class="tool-btn ${state.tool === 'confetti' ? 'active' : ''}" data-tool="confetti" title="confetti">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
            </button>
            <button class="tool-btn ${state.tool === 'text' ? 'active' : ''}" data-tool="text" title="text">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            </button>
            <button class="tool-btn ${state.tool === 'line' ? 'active' : ''}" data-tool="line" title="grid lines">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
            </button>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-header">// colors</div>
          <div class="color-grid">
            ${colors.map(c => `
              <div class="color-swatch ${state.color === c ? 'active' : ''}" style="background:${c}" data-color="${c}"></div>
            `).join('')}
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-header">// size</div>
          <div class="slider-box">
            <input type="range" class="slider" id="size-slider"
                   min="1" max="80" value="${state.brushSize}" />
            <span class="slider-val">${state.brushSize}</span>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-header">// pixel</div>
          <div class="slider-box">
            <input type="range" class="slider" id="pixel-slider" min="1" max="8" value="${state.pixelation}" />
            <span class="slider-val">${state.pixelation}</span>
          </div>
        </div>
      </div>

      <!-- Canvas area (center) -->
      <div class="canvas-area">
        <div class="canvas-container" id="canvas-container">
          <div class="ruler ruler-top" id="ruler-top"></div>
          <div class="ruler ruler-left" id="ruler-left"></div>
          <div class="canvas-inner" id="canvas-inner" style="transform-origin: top left;">
            <canvas id="physics-canvas"></canvas>
            <canvas id="drawing-canvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Right panel: stamps -->
      <div class="right-panel">
        <div class="panel-section">
          <div class="panel-header">// stamps</div>
          <div class="stamp-grid">
            ${stamps.map((s, i) => `
              <button class="stamp-btn ${state.tool === 'stamp' && state.selectedStamp === i ? 'active' : ''}"
                      data-stamp="${i}" title="${s.name}">
                <span class="stamp-icon-placeholder" data-stamp-icon="${i}"></span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="bottom-bar">
      <div class="action-strip">
        <button class="action-btn" id="save-btn">[export]</button>
        <button class="action-btn" id="undo-btn">[undo]</button>
        <button class="action-btn ${state.physicsOn ? 'action-active' : ''}" id="physics-btn">[${state.physicsOn ? 'stop' : 'drop!'}]</button>
        <button class="action-btn" id="shake-btn" ${!state.physicsOn ? 'style="opacity:0.3;pointer-events:none"' : ''}>[shake]</button>
        <button class="action-btn danger" id="clear-btn">[obliterate]</button>
        <div class="action-spacer"></div>
        <div class="scene-tabs">
          ${state.scenes.map((s, i) => `
            <button class="scene-tab ${i === state.currentSceneIndex ? 'active' : ''}" data-scene="${i}">
              ${s.name}
              ${state.scenes.length > 1 ? `<span class="delete-scene" data-delete="${i}">×</span>` : ''}
            </button>
          `).join('')}
          <button class="scene-tab" id="add-scene-btn">+</button>
        </div>
        <button class="action-btn" id="play-btn">[▶ play]</button>
      </div>
    </div>
    </div>
  `;

  bindEvents();
  resizeCanvases();
  redrawCanvas();
  renderStampIcons();
  renderStarfishBg();
  renderRulers();
}

// ── Rulers ──
function renderRulers() {
  const inner = document.getElementById('canvas-inner');
  const topRuler = document.getElementById('ruler-top');
  const leftRuler = document.getElementById('ruler-left');
  if (!inner || !topRuler || !leftRuler) return;

  const w = inner.clientWidth;
  const h = inner.clientHeight;

  let topHtml = '';
  for (let x = 0; x <= w; x += GRID_SIZE) {
    const isMajor = x % (GRID_SIZE * 4) === 0;
    topHtml += `<div class="ruler-tick ${isMajor ? 'major' : ''}" style="left:${x + 12}px"></div>`;
  }
  topRuler.innerHTML = topHtml;

  let leftHtml = '';
  for (let y = 0; y <= h; y += GRID_SIZE) {
    const isMajor = y % (GRID_SIZE * 4) === 0;
    leftHtml += `<div class="ruler-tick ${isMajor ? 'major' : ''}" style="top:${y + 12}px"></div>`;
  }
  leftRuler.innerHTML = leftHtml;
}

// ── Starfish background ──
function renderStarfishBg() {
  const bg = document.getElementById('starfish-bg');
  if (!bg) return;
  const pattern = bgPatterns[state.bgIndex];
  if (!pattern.char && !pattern.svg) {
    bg.innerHTML = '';
    return;
  }
  const cols = 100;
  const rows = 60;
  const total = cols * rows;
  const content = pattern.svg || pattern.char;
  let html = '<div class="starfish-grid">';
  for (let i = 0; i < total; i++) {
    html += `<span class="starfish-char">${content}</span>`;
  }
  html += '</div>';
  bg.innerHTML = html;
}

// ── Stamp icons in the toolbar ──
function renderStampIcons() {
  document.querySelectorAll('.stamp-icon-placeholder').forEach(el => {
    const idx = parseInt(el.dataset.stampIcon);
    const stamp = stamps[idx];
    if (!stamp) return;

    const img = getStampImage(stamp);
    const renderIcon = () => {
      const size = 52;
      const scale = window.devicePixelRatio;
      const dithered = getDitheredStamp(stamp, img, Math.round(size * scale), {
        pixelScale: 2,
        mode: 'riso',
      });
      if (dithered) {
        const display = document.createElement('canvas');
        display.width = dithered.width;
        display.height = dithered.height;
        display.style.width = size + 'px';
        display.style.height = size + 'px';
        const dCtx = display.getContext('2d');
        dCtx.drawImage(dithered, 0, 0);
        el.replaceWith(display);
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      renderIcon();
    } else if (img._loadPromise) {
      img._loadPromise.then(renderIcon);
    }
  });
}

// ── Canvas event binding (separate so play mode can rebind) ──
function bindCanvasEvents() {
  const canvas = document.getElementById('drawing-canvas');
  if (!canvas) return;
  canvas.addEventListener('mousedown', onCanvasDown);
  canvas.addEventListener('mousemove', onCanvasMove);
  canvas.addEventListener('mouseup', onCanvasUp);
  canvas.addEventListener('mouseleave', onCanvasUp);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onCanvasDown(touchToMouse(e.touches[0], canvas));
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    onCanvasMove(touchToMouse(e.touches[0], canvas));
  });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    onCanvasUp();
  });
}

// ── Event binding ──
function bindEvents() {
  // Dark mode toggle
  const darkBtn = document.getElementById('dark-toggle');
  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      state.darkMode = !state.darkMode;
      document.body.style.background = state.darkMode ? '#202020' : '#d8d8d8';
      render();
    });
  }

  // Fullscreen toggle
  const fsBtn = document.getElementById('fullscreen-toggle');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      state.fullscreen = state.fullscreen === 0 ? 1 : 0;
      render();
    });
  }

  // Menu bar
  document.querySelectorAll('.menu-item').forEach(el => {
    el.addEventListener('click', (e) => {
      // Close any open menu first
      document.querySelectorAll('.menu-dropdown').forEach(d => d.remove());

      const menu = el.dataset.menu;
      const items = {
        file: ['New', 'Open...', '—', 'Save', 'Save as...', '—', 'Export PNG', 'Export story'],
        edit: ['Undo', '—', 'Clear canvas', '—', 'Copy', 'Paste'],
        view: ['Zoom in', 'Zoom out', '—', 'Show grid', 'Show rulers'],
        image: ['Resize canvas...', 'Flip horizontal', 'Flip vertical', '—', 'Invert colors'],
        help: ['About Pretty Paint', '—', 'Keyboard shortcuts'],
      };

      const dropdown = document.createElement('div');
      dropdown.className = 'menu-dropdown';
      dropdown.style.left = el.offsetLeft + 'px';
      dropdown.innerHTML = (items[menu] || []).map(item =>
        item === '—'
          ? '<div class="menu-sep"></div>'
          : `<div class="menu-dropdown-item">${item}</div>`
      ).join('');

      // Wire up the menu actions
      dropdown.querySelectorAll('.menu-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          const action = item.textContent;
          dropdown.remove();
          if (action === 'Undo') undo();
          else if (action === 'Clear canvas') { currentScene().strokes = []; if (state.physicsOn) togglePhysics(); redrawCanvas(); }
          else if (action === 'New') { state.scenes = [createScene('Scene 1')]; state.currentSceneIndex = 0; if (state.physicsOn) togglePhysics(); render(); }
          else if (action === 'Save' || action === 'Export PNG') saveImage();
        });
      });

      el.parentElement.appendChild(dropdown);

      // Close on click outside
      const closeMenu = (ev) => {
        if (!dropdown.contains(ev.target) && ev.target !== el) {
          dropdown.remove();
          document.removeEventListener('click', closeMenu);
        }
      };
      setTimeout(() => document.addEventListener('click', closeMenu), 0);
    });
  });

  // Colors (new row items)
  document.querySelectorAll('.color-row-item').forEach(el => {
    el.addEventListener('click', () => {
      state.color = el.dataset.color;
      render();
    });
  });

  // Also keep old color-swatch selector working
  document.querySelectorAll('.color-swatch').forEach(el => {
    el.addEventListener('click', () => {
      state.color = el.dataset.color;
      render();
    });
  });

  // Stamps
  document.querySelectorAll('.stamp-btn').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.stamp);
      if (state.tool === 'stamp' && state.selectedStamp === idx) {
        state.tool = 'brush';
        state.selectedStamp = null;
      } else {
        state.tool = 'stamp';
        state.selectedStamp = idx;
      }
      render();
    });
  });

  // Tools
  document.querySelectorAll('.tool-btn[data-tool]').forEach(el => {
    el.addEventListener('click', () => {
      state.tool = el.dataset.tool;
      state.selectedStamp = null;
      render();
    });
  });

  // Size slider
  const sizeSlider = document.getElementById('size-slider');
  if (sizeSlider) {
    sizeSlider.addEventListener('input', (e) => {
      state.brushSize = parseInt(e.target.value);
      // update the displayed value
      const valEl = sizeSlider.closest('.slider-box')?.querySelector('.slider-val');
      if (valEl) valEl.textContent = state.brushSize;
    });
  }

  // Size step buttons
  const sizeDown = document.getElementById('size-down');
  const sizeUp = document.getElementById('size-up');
  if (sizeDown) sizeDown.addEventListener('click', () => {
    state.brushSize = Math.max(1, state.brushSize - 2);
    render();
  });
  if (sizeUp) sizeUp.addEventListener('click', () => {
    state.brushSize = Math.min(80, state.brushSize + 2);
    render();
  });

  // Pixel slider
  const pixelSlider = document.getElementById('pixel-slider');
  if (pixelSlider) {
    pixelSlider.addEventListener('input', (e) => {
      state.pixelation = parseInt(e.target.value);
      const valEl = pixelSlider.closest('.slider-box')?.querySelector('.slider-val');
      if (valEl) valEl.textContent = state.pixelation;
      redrawCanvas();
    });
  }

  // Undo
  document.getElementById('undo-btn').addEventListener('click', undo);

  // Clear
  document.getElementById('clear-btn').addEventListener('click', () => {
    currentScene().strokes = [];
    if (state.physicsOn) togglePhysics();
    redrawCanvas();
  });

  // Physics
  document.getElementById('physics-btn').addEventListener('click', togglePhysics);
  document.getElementById('shake-btn').addEventListener('click', () => {
    if (state.physicsOn) physics.shake();
  });

  // Scenes
  document.querySelectorAll('.scene-tab[data-scene]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-scene')) return;
      switchScene(parseInt(el.dataset.scene));
    });
  });

  document.querySelectorAll('.delete-scene').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteScene(parseInt(el.dataset.delete));
    });
  });

  document.getElementById('add-scene-btn').addEventListener('click', addScene);

  // Save
  document.getElementById('save-btn').addEventListener('click', saveImage);

  // Play
  document.getElementById('play-btn').addEventListener('click', playStory);

  // Canvas events
  bindCanvasEvents();

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      undo();
    }
  });

  // Zoom with trackpad/scroll wheel
  const container = document.getElementById('canvas-container');
  if (container) {
    container.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        state.zoom = Math.max(0.25, Math.min(4, state.zoom + delta));
        const inner = document.getElementById('canvas-inner');
        if (inner) {
          inner.style.transform = `scale(${state.zoom})`;
          inner.style.transformOrigin = 'top left';
        }
      }
    }, { passive: false });
  }
}

function touchToMouse(touch, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    offsetX: touch.clientX - rect.left,
    offsetY: touch.clientY - rect.top,
  };
}

// ── Canvas sizing ──
function resizeCanvases() {
  const inner = document.getElementById('canvas-inner');
  if (!inner) return;
  const w = inner.clientWidth;
  const h = inner.clientHeight;

  ['drawing-canvas', 'physics-canvas'].forEach(id => {
    const c = document.getElementById(id);
    c.width = w * window.devicePixelRatio;
    c.height = h * window.devicePixelRatio;
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    c.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);
  });

  physics.setCanvasSize(w, h);
}

// ── Grid edge helper ──
function getClosestEdge(px, py, prevEdge) {
  const cellX = Math.floor(px / GRID_SIZE) * GRID_SIZE;
  const cellY = Math.floor(py / GRID_SIZE) * GRID_SIZE;
  const dx = px - cellX;
  const dy = py - cellY;

  // All 4 candidate edges for this cell
  const candidates = [
    { edge: `h:${cellX},${cellY}`, dist: dy },                        // top
    { edge: `h:${cellX},${cellY + GRID_SIZE}`, dist: GRID_SIZE - dy }, // bottom
    { edge: `v:${cellX},${cellY}`, dist: dx },                        // left
    { edge: `v:${cellX + GRID_SIZE},${cellY}`, dist: GRID_SIZE - dx }, // right
  ];

  // If we have a previous edge, prefer edges that share an endpoint with it
  if (prevEdge) {
    const prevEnds = getEdgeEndpoints(prevEdge);
    for (const c of candidates) {
      const cEnds = getEdgeEndpoints(c.edge);
      // Check if any endpoint matches
      const connects = prevEnds.some(p => cEnds.some(q => p[0] === q[0] && p[1] === q[1]));
      if (connects) c.dist -= GRID_SIZE * 0.4; // strong bias toward connecting
    }
  }

  candidates.sort((a, b) => a.dist - b.dist);
  return candidates[0].edge;
}

function getEdgeEndpoints(edge) {
  const [dir, coords] = edge.split(':');
  const [ex, ey] = coords.split(',').map(Number);
  if (dir === 'h') return [[ex, ey], [ex + GRID_SIZE, ey]];
  return [[ex, ey], [ex, ey + GRID_SIZE]];
}

// ── Drawing ──
function onCanvasDown(e) {
  const x = e.offsetX;
  const y = e.offsetY;

  if (state.tool === 'stamp' && state.selectedStamp !== null) {
    // Place stamp — works even during physics
    const stampSize = 24 + state.brushSize * 5;
    currentScene().strokes.push({
      type: 'stamp',
      stampIndex: state.selectedStamp,
      x, y,
      size: stampSize,
    });
    if (state.physicsOn) {
      // Restart physics with the new stamp included
      physics.clear();
      const container = document.getElementById('canvas-inner');
      physics.setCanvasSize(container.clientWidth, container.clientHeight);
      physics.addStrokes(currentScene().strokes);
      physics.start();
    }
    redrawCanvas();
    return;
  }

  if (state.physicsOn) return;

  if (state.tool === 'text') {
    const text = prompt('Enter text:');
    if (text) {
      currentScene().strokes.push({
        type: 'text',
        text,
        x, y,
        color: state.color,
        size: Math.max(state.brushSize, 12),
      });
      redrawCanvas();
    }
    return;
  }

  if (state.tool === 'fill') {
    currentScene().strokes.push({
      type: 'fill',
      color: state.color,
    });
    redrawCanvas();
    return;
  }

  if (state.tool === 'confetti') {
    // Splatter — fill random grid cells around click point
    const confettiColors = ['#e8507a', '#3255a4', '#5cb85c', '#e8c840', '#7b68ae', '#d4622b', '#3a9e95'];
    const cells = [];
    const radius = 5 + Math.floor(state.brushSize / 4); // radius in grid cells
    for (let i = 0; i < 30 + state.brushSize * 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      const gx = Math.floor((x + Math.cos(angle) * dist * GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
      const gy = Math.floor((y + Math.sin(angle) * dist * GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
      cells.push({ gx, gy, color: confettiColors[Math.floor(Math.random() * confettiColors.length)] });
    }
    currentScene().strokes.push({ type: 'splatter', cells });
    redrawCanvas();
    return;
  }

  if (state.tool === 'line') {
    state.isDrawing = true;
    const edge = getClosestEdge(x, y, null);
    state.currentStroke = {
      type: 'gridline',
      color: state.color,
      edges: [edge],
      edgeSet: new Set([edge]),
    };
    redrawCanvas();
    return;
  }

  // Brush or eraser — snap to grid cells
  state.isDrawing = true;
  const gx = Math.floor(x / GRID_SIZE) * GRID_SIZE;
  const gy = Math.floor(y / GRID_SIZE) * GRID_SIZE;
  state.currentStroke = {
    type: state.tool === 'erase' ? 'erase' : 'brush',
    color: state.color,
    size: state.brushSize,
    cells: [`${gx},${gy}`],
    cellSet: new Set([`${gx},${gy}`]),
  };
  redrawCanvas();
}

function onCanvasMove(e) {
  if (!state.isDrawing || !state.currentStroke) return;
  const x = e.offsetX;
  const y = e.offsetY;

  if (state.currentStroke.type === 'gridline') {
    const prevEdge = state.currentStroke.edges[state.currentStroke.edges.length - 1];
    const edge = getClosestEdge(x, y, prevEdge);
    if (!state.currentStroke.edgeSet.has(edge)) {
      state.currentStroke.edgeSet.add(edge);
      state.currentStroke.edges.push(edge);
    }
    redrawCanvas();
    return;
  }

  const gx = Math.floor(x / GRID_SIZE) * GRID_SIZE;
  const gy = Math.floor(y / GRID_SIZE) * GRID_SIZE;
  const key = `${gx},${gy}`;
  if (!state.currentStroke.cellSet.has(key)) {
    state.currentStroke.cellSet.add(key);
    state.currentStroke.cells.push(key);
  }
  redrawCanvas();
}

function onCanvasUp() {
  if (!state.isDrawing) return;
  state.isDrawing = false;
  if (state.currentStroke && (state.currentStroke.cells?.length > 0 || state.currentStroke.edges?.length > 0)) {
    // Strip Sets before storing
    const { cellSet, edgeSet, ...stroke } = state.currentStroke;
    currentScene().strokes.push(stroke);
  }
  state.currentStroke = null;
  redrawCanvas();
}

// ── Undo ──
function undo() {
  if (state.physicsOn) return;
  currentScene().strokes.pop();
  redrawCanvas();
}

// ── Redraw ──
function redrawCanvas() {
  const canvas = document.getElementById('drawing-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;

  ctx.clearRect(0, 0, w, h);

  // Draw grid
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= w; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();

  // Draw all strokes
  const allStrokes = [...currentScene().strokes];
  if (state.currentStroke) allStrokes.push(state.currentStroke);

  allStrokes.forEach(stroke => drawStroke(ctx, stroke));

  // Pixelation post-process
  if (state.pixelation > 1) {
    const scale = 1 / state.pixelation;
    const tempCanvas = document.createElement('canvas');
    const tw = Math.floor(w * scale);
    const th = Math.floor(h * scale);
    tempCanvas.width = tw;
    tempCanvas.height = th;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(canvas, 0, 0, tw, th);
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
  }

  // Grain post-process — riso texture
  applyGrain(ctx, w, h, 25);
}

// ── Grain (ported from p5.grain) ──
function applyGrain(ctx, w, h, amount) {
  const pw = Math.floor(w * window.devicePixelRatio);
  const ph = Math.floor(h * window.devicePixelRatio);
  if (pw <= 0 || ph <= 0) return;
  const imageData = ctx.getImageData(0, 0, pw, ph);
  const pixels = new Uint32Array(imageData.data.buffer);
  const len = pixels.length;
  for (let i = 0; i < len; i++) {
    const px = pixels[i];
    const a = (px >>> 24) & 0xff;
    if (a === 0) continue; // skip transparent
    const offset = Math.floor(Math.random() * (amount * 2 + 1)) - amount;
    const r = Math.max(0, Math.min(255, (px & 0xff) + offset));
    const g = Math.max(0, Math.min(255, ((px >> 8) & 0xff) + offset));
    const b = Math.max(0, Math.min(255, ((px >> 16) & 0xff) + offset));
    pixels[i] = (a << 24) | (b << 16) | (g << 8) | r;
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawStroke(ctx, stroke) {
  if (stroke.type === 'fill') {
    const canvas = ctx.canvas;
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = stroke.color;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else if (stroke.type === 'brush' || stroke.type === 'erase') {
    if (!stroke.cells || stroke.cells.length < 1) return;
    ctx.save();
    if (stroke.type === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.fillStyle = stroke.color;
    }
    const brushCells = Math.max(1, Math.round(stroke.size / GRID_SIZE));
    for (const key of stroke.cells) {
      const [gx, gy] = key.split(',').map(Number);
      for (let dx = 0; dx < brushCells; dx++) {
        for (let dy = 0; dy < brushCells; dy++) {
          ctx.fillRect(gx + dx * GRID_SIZE, gy + dy * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
      }
    }
    ctx.restore();
  } else if (stroke.type === 'stamp') {
    const stamp = stamps[stroke.stampIndex];
    if (!stamp) return;
    const img = getStampImage(stamp);
    const s = stroke.size;
    if (img.complete && img.naturalWidth > 0) {
      const dithered = getDitheredStamp(stamp, img, Math.round(s * window.devicePixelRatio), {
        pixelScale: 3,
        mode: 'riso',
      });
      if (dithered) {
        ctx.drawImage(dithered, stroke.x - s / 2, stroke.y - s / 2, s, s);
      } else {
        ctx.drawImage(img, stroke.x - s / 2, stroke.y - s / 2, s, s);
      }
    } else {
      img._loadPromise?.then(() => redrawCanvas());
    }
  } else if (stroke.type === 'splatter' || stroke.type === 'confetti') {
    if (stroke.cells) {
      stroke.cells.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.fillRect(c.gx, c.gy, GRID_SIZE, GRID_SIZE);
      });
    } else if (stroke.dots) {
      // legacy confetti support
      stroke.dots.forEach(dot => {
        ctx.fillStyle = dot.color;
        const gx = Math.floor(dot.x / GRID_SIZE) * GRID_SIZE;
        const gy = Math.floor(dot.y / GRID_SIZE) * GRID_SIZE;
        ctx.fillRect(gx, gy, GRID_SIZE, GRID_SIZE);
      });
    }
  } else if (stroke.type === 'text') {
    ctx.save();
    ctx.font = `${stroke.size}px 'Syne Mono', monospace`;
    ctx.fillStyle = stroke.color;
    ctx.fillText(stroke.text, stroke.x, stroke.y);
    ctx.restore();
  } else if (stroke.type === 'gridline') {
    ctx.save();
    ctx.strokeStyle = stroke.color || '#000';
    ctx.lineWidth = 1;
    for (const edge of stroke.edges) {
      const [dir, coords] = edge.split(':');
      const [ex, ey] = coords.split(',').map(Number);
      ctx.beginPath();
      if (dir === 'h') {
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + GRID_SIZE, ey);
      } else {
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex, ey + GRID_SIZE);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ── Physics ──
let physicsAnimFrame = null;

function togglePhysics() {
  state.physicsOn = !state.physicsOn;

  if (state.physicsOn) {
    // Transfer strokes to physics engine
    physics.clear();
    const container = document.getElementById('canvas-inner');
    physics.setCanvasSize(container.clientWidth, container.clientHeight);
    physics.addStrokes(currentScene().strokes);
    physics.start();

    // Hide drawing canvas, show physics canvas
    document.getElementById('drawing-canvas').style.opacity = '0';
    startPhysicsRender();
  } else {
    physics.stop();
    physics.clear();
    document.getElementById('drawing-canvas').style.opacity = '1';
    cancelAnimationFrame(physicsAnimFrame);

    const physCanvas = document.getElementById('physics-canvas');
    if (physCanvas) {
      const ctx = physCanvas.getContext('2d');
      ctx.clearRect(0, 0, physCanvas.width / window.devicePixelRatio, physCanvas.height / window.devicePixelRatio);
    }
  }

  // Re-render just the sidebar buttons
  const physBtn = document.getElementById('physics-btn');
  if (physBtn) {
    physBtn.className = `action-btn ${state.physicsOn ? 'physics-active' : ''}`;
    physBtn.textContent = state.physicsOn ? '⏸ Stop' : '▶ Drop!';
  }
  const shakeBtn = document.getElementById('shake-btn');
  if (shakeBtn) {
    shakeBtn.style.opacity = state.physicsOn ? '1' : '0.4';
    shakeBtn.style.pointerEvents = state.physicsOn ? 'auto' : 'none';
  }
}

function startPhysicsRender() {
  const canvas = document.getElementById('physics-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;

  function frame() {
    ctx.clearRect(0, 0, w, h);

    const bodies = physics.getState();
    bodies.forEach(({ body, stroke, position, angle }) => {
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(angle);

      if (stroke.type === 'stamp') {
        const stamp = stamps[stroke.stampIndex];
        if (stamp) {
          const img = getStampImage(stamp);
          const s = stroke.size;
          if (img.complete) {
            const dithered = getDitheredStamp(stamp, img, Math.round(s * window.devicePixelRatio), {
              pixelScale: 3,
              mode: 'riso',
            });
            if (dithered) {
              ctx.drawImage(dithered, -s / 2, -s / 2, s, s);
            } else {
              ctx.drawImage(img, -s / 2, -s / 2, s, s);
            }
          }
        }
      } else if (stroke.type === 'brush') {
        // Draw grid cells relative to physics body center
        ctx.fillStyle = stroke.color;
        if (stroke.cells) {
          const allCoords = stroke.cells.map(k => k.split(',').map(Number));
          const xs = allCoords.map(c => c[0]), ys = allCoords.map(c => c[1]);
          const cx = (Math.min(...xs) + Math.max(...xs) + GRID_SIZE) / 2;
          const cy = (Math.min(...ys) + Math.max(...ys) + GRID_SIZE) / 2;
          for (const [gx, gy] of allCoords) {
            ctx.fillRect(gx - cx, gy - cy, GRID_SIZE, GRID_SIZE);
          }
        }
      } else if (stroke.type === 'confetti') {
        stroke.dots.forEach(dot => {
          ctx.beginPath();
          ctx.arc(dot.x - position.x, dot.y - position.y, dot.r, 0, Math.PI * 2);
          ctx.fillStyle = dot.color;
          ctx.fill();
        });
      }

      ctx.restore();
    });

    physicsAnimFrame = requestAnimationFrame(frame);
  }

  frame();
}

// ── Scenes ──
function switchScene(idx) {
  if (state.physicsOn) togglePhysics();
  // Snapshot current scene
  snapshotCurrentScene();
  state.currentSceneIndex = idx;
  render();
}

function addScene() {
  snapshotCurrentScene();
  const num = state.scenes.length + 1;
  state.scenes.push(createScene(`Scene ${num}`));
  state.currentSceneIndex = state.scenes.length - 1;
  if (state.physicsOn) togglePhysics();
  render();
}

function deleteScene(idx) {
  if (state.scenes.length <= 1) return;
  state.scenes.splice(idx, 1);
  if (state.currentSceneIndex >= state.scenes.length) {
    state.currentSceneIndex = state.scenes.length - 1;
  }
  render();
}

function snapshotCurrentScene() {
  const canvas = document.getElementById('drawing-canvas');
  if (canvas) {
    currentScene().snapshot = canvas.toDataURL('image/png');
  }
}

// ── Save ──
function saveImage() {
  const canvas = document.getElementById('drawing-canvas');
  const link = document.createElement('a');
  link.download = `pretty-paint-${currentScene().name.replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ── Play Story ──
function playStory() {
  snapshotCurrentScene();

  const inner = document.getElementById('canvas-inner');
  const w = inner.clientWidth;
  const h = inner.clientHeight;

  // Render each scene to an image
  const sceneImages = state.scenes.map((scene) => {
    const c = document.createElement('canvas');
    c.width = w * window.devicePixelRatio;
    c.height = h * window.devicePixelRatio;
    const ctx = c.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    scene.strokes.forEach(s => drawStroke(ctx, s));
    return c.toDataURL('image/png');
  });

  let currentSlide = 0;
  let playing = true;

  function renderSlide() {
    inner.innerHTML = `
      <div style="width:100%;height:100%;position:relative;background:#fff;">
        <img src="${sceneImages[currentSlide]}" style="width:100%;height:100%;object-fit:contain;display:block;" />
        <div style="position:absolute;bottom:12px;left:0;right:0;display:flex;justify-content:center;gap:8px;font-family:inherit;">
          <button class="play-nav-btn" id="play-prev" ${currentSlide === 0 ? 'style="opacity:0.3"' : ''}>←</button>
          <span style="font-size:11px;color:#999;display:flex;align-items:center;">${currentSlide + 1} / ${state.scenes.length}</span>
          <button class="play-nav-btn" id="play-next" ${currentSlide === state.scenes.length - 1 ? 'style="opacity:0.3"' : ''}>→</button>
          <button class="play-nav-btn" id="play-close">✕</button>
        </div>
      </div>
    `;

    inner.querySelector('#play-prev')?.addEventListener('click', () => {
      if (currentSlide > 0) { currentSlide--; renderSlide(); }
    });
    inner.querySelector('#play-next')?.addEventListener('click', () => {
      if (currentSlide < state.scenes.length - 1) { currentSlide++; renderSlide(); }
    });
    inner.querySelector('#play-close')?.addEventListener('click', exitPlay);
  }

  function exitPlay() {
    playing = false;
    window.removeEventListener('keydown', onKey);
    // Restore canvas
    inner.innerHTML = '<canvas id="physics-canvas"></canvas><canvas id="drawing-canvas"></canvas>';
    resizeCanvases();
    redrawCanvas();
    bindCanvasEvents();
  }

  function onKey(e) {
    if (!playing) return;
    if (e.key === 'ArrowRight' && currentSlide < state.scenes.length - 1) {
      currentSlide++; renderSlide();
    } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
      currentSlide--; renderSlide();
    } else if (e.key === 'Escape') {
      exitPlay();
    }
  }

  window.addEventListener('keydown', onKey);
  renderSlide();
}

// ── Resize handling ──
window.addEventListener('resize', () => {
  resizeCanvases();
  redrawCanvas();
});

// ── Persistence ──
function saveState() {
  try {
    const data = {
      scenes: state.scenes,
      currentSceneIndex: state.currentSceneIndex,
      color: state.color,
      brushSize: state.brushSize,
      pixelation: state.pixelation,
      darkMode: state.darkMode,
      fullscreen: state.fullscreen,
      tool: state.tool,
    };
    localStorage.setItem('risopaint-state', JSON.stringify(data));
  } catch (e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('risopaint-state');
    if (!saved) return;
    const data = JSON.parse(saved);
    if (data.scenes) state.scenes = data.scenes;
    if (data.currentSceneIndex != null) state.currentSceneIndex = data.currentSceneIndex;
    if (data.color) state.color = data.color;
    if (data.brushSize) state.brushSize = data.brushSize;
    if (data.pixelation != null) state.pixelation = data.pixelation;
    if (data.darkMode != null) state.darkMode = data.darkMode;
    if (data.fullscreen != null) state.fullscreen = data.fullscreen;
    if (data.tool) state.tool = data.tool;
  } catch (e) {}
}

// ── Init ──
preloadStamps();
loadState();
render();

// Auto-save on every change
const _origRedraw = redrawCanvas;
redrawCanvas = function() {
  _origRedraw();
  saveState();
};
