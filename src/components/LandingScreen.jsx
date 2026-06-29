import { useRef, useEffect, useCallback, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import Matter from 'matter-js';

const { Engine, Bodies, Body, Composite, Runner } = Matter;

const s = stylex.create({
  outer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    display: 'block',
  },
});

function drawGirl(ctx, px, py, facing, running, time, sleeping, dark, hasFlower) {
  const legCycle = running ? Math.sin(time * 0.016) : 0;
  const bounce = running ? Math.sin(time * 0.024) * 1 : 0;
  const armSwing = running ? legCycle * 0.5 : 0;
  const idleArm = running ? 0 : Math.sin(time * 0.0048) * 1;
  const lc = '#000'; // line color — always black
  const fc = '#fff'; // fill color — always white
  ctx.save();
  ctx.translate(px, py - 4);
  ctx.scale(1.8 * facing, 1.8);
  ctx.strokeStyle = lc; ctx.fillStyle = lc;
  ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // Back braid
  ctx.beginPath(); ctx.moveTo(-5,-13);
  ctx.quadraticCurveTo(-9,-10+bounce,-7,-7+bounce);
  ctx.quadraticCurveTo(-3,-4+bounce,-9,-2+bounce); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-5,-13);
  ctx.quadraticCurveTo(-2,-10+bounce,-7,-7+bounce);
  ctx.quadraticCurveTo(-10,-4+bounce,-5,-2+bounce); ctx.stroke();
  // Back arm
  ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(-5,-1-armSwing*3+idleArm); ctx.stroke();
  // Head
  ctx.fillStyle = fc;
  ctx.beginPath(); ctx.arc(0,-14,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(0,-14,5,0,Math.PI*2); ctx.stroke();
  // Ties
  ctx.fillStyle=fc;
  ctx.beginPath(); ctx.arc(-5,-14,1.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(5,-14,1.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=lc;
  ctx.beginPath(); ctx.arc(-5,-14,1.5,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(5,-14,1.5,0,Math.PI*2); ctx.stroke();
  // Eyes
  if (sleeping) {
    ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(-2.5,-13); ctx.lineTo(-1.5,-13); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1.5,-13); ctx.lineTo(2.5,-13); ctx.stroke();
    ctx.lineWidth=1.6;
    ctx.save(); ctx.scale(facing, 1);
    ctx.font="6px 'Velvelyne',serif"; ctx.fillText('z',6,-18+Math.sin(time*0.0004));
    ctx.font="8px 'Velvelyne',serif"; ctx.fillText('z',9,-22+Math.sin(time*0.0004+1));
    ctx.restore();
  } else {
    const blink=Math.sin(time*0.002)>0.98;
    if(blink){ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(-2.5,-13);ctx.lineTo(-1.5,-13);ctx.stroke();
      ctx.beginPath();ctx.moveTo(1.5,-13);ctx.lineTo(2.5,-13);ctx.stroke();ctx.lineWidth=1.6;
    }else{
      ctx.beginPath();ctx.arc(-2,-13,0.7,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(2,-13,0.7,0,Math.PI*2);ctx.fill();
    }
  }
  // Bangs
  ctx.lineWidth=1.5;
  for(let bx=-3;bx<=3;bx+=2){const topY=-14-Math.sqrt(Math.max(0,25-bx*bx));
    ctx.beginPath();ctx.moveTo(bx,topY);ctx.lineTo(bx,topY+3);ctx.stroke();}
  ctx.lineWidth=1.6;
  // Front braid
  ctx.beginPath();ctx.moveTo(5,-13);
  ctx.quadraticCurveTo(9,-10+bounce,7,-7+bounce);
  ctx.quadraticCurveTo(3,-4+bounce,9,-2+bounce);ctx.stroke();
  ctx.beginPath();ctx.moveTo(5,-13);
  ctx.quadraticCurveTo(2,-10+bounce,7,-7+bounce);
  ctx.quadraticCurveTo(10,-4+bounce,5,-2+bounce);ctx.stroke();
  // Body+dress
  ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(0,-6);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(5,-1+armSwing*3-idleArm);ctx.stroke();
  ctx.fillStyle=fc;
  ctx.beginPath();ctx.moveTo(0,-6);ctx.quadraticCurveTo(-2,0,-6,6);
  ctx.lineTo(6,6);ctx.quadraticCurveTo(2,0,0,-6);ctx.fill();
  ctx.beginPath();ctx.moveTo(0,-6);ctx.quadraticCurveTo(-2,0,-6,6);
  ctx.lineTo(6,6);ctx.quadraticCurveTo(2,0,0,-6);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-6,6);ctx.lineTo(6,6);ctx.stroke();
  const bL=-2+legCycle*3,fL=2-legCycle*3;
  ctx.beginPath();ctx.moveTo(-1,6);ctx.lineTo(bL,14);ctx.stroke();
  ctx.fillStyle=lc;ctx.beginPath();ctx.ellipse(bL-1.5,14.5,2.8,1.4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=fc;ctx.beginPath();ctx.ellipse(bL-1.5,14.5,1,0.5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=lc;ctx.beginPath();ctx.moveTo(1,6);ctx.lineTo(fL,14);ctx.stroke();
  ctx.beginPath();ctx.ellipse(fL+1.5,14.5,2.8,1.4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=fc;ctx.beginPath();ctx.ellipse(fL+1.5,14.5,1,0.5,0,0,Math.PI*2);ctx.fill();
  // Flower accessory — doodled flower on a stem from top of head
  if (hasFlower) {
    const fx = 0, stemBase = -19, stemTop = -25;
    ctx.strokeStyle = lc;
    ctx.fillStyle = fc;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    // Stem
    ctx.beginPath();
    ctx.moveTo(fx, stemBase);
    ctx.quadraticCurveTo(fx + 0.8, stemBase - 3, fx, stemTop + 2);
    ctx.stroke();
    // Petals
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const px = fx + Math.cos(a) * 2.2;
      const py = stemTop + Math.sin(a) * 2.2;
      ctx.beginPath();
      ctx.arc(px, py, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // Center dot
    ctx.fillStyle = lc;
    ctx.beginPath();
    ctx.arc(fx, stemTop, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDoor(ctx, x, groundY, dw, dh, label, color, locked, dark) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if(locked) ctx.globalAlpha=0.3;

  const wx = (n) => Math.sin(n * 3.7 + x * 0.1) * 0.8;
  const wy = (n) => Math.cos(n * 2.3 + x * 0.2) * 0.8;
  const lineColor = '#000';
  const fillColor = locked ? (dark ? '#555' : '#e0e0e0') : (dark ? '#666' : '#d5d5d5');

  // Fill — no bottom edge, just fill the interior
  ctx.fillStyle = fillColor;
  ctx.fillRect(x - dw/2, groundY - dh, dw, dh + 2);

  // Wobbly outline — rectangular
  ctx.strokeStyle = lineColor; ctx.lineWidth = 2.5;
  // Left
  ctx.beginPath();
  ctx.moveTo(x-dw/2+wx(0), groundY);
  ctx.quadraticCurveTo(x-dw/2+wx(4)-0.5, groundY-dh*0.5+wy(4), x-dw/2+wx(1), groundY-dh+6);
  ctx.stroke();
  // Top
  ctx.beginPath();
  ctx.moveTo(x-dw/2+wx(1), groundY-dh+6);
  ctx.quadraticCurveTo(x-dw/2+wx(5), groundY-dh+wy(5), x-dw/2+6, groundY-dh+wy(5));
  ctx.quadraticCurveTo(x+wy(6)*0.5, groundY-dh+wy(6)-0.5, x+dw/2-6, groundY-dh+wy(7));
  ctx.quadraticCurveTo(x+dw/2+wx(8), groundY-dh+wy(8), x+dw/2+wx(3), groundY-dh+6);
  ctx.stroke();
  // Right
  ctx.beginPath();
  ctx.moveTo(x+dw/2+wx(3), groundY-dh+6);
  ctx.quadraticCurveTo(x+dw/2+wx(7)+0.5, groundY-dh*0.5+wy(7), x+dw/2+wx(2), groundY);
  ctx.stroke();

  // Knob
  ctx.fillStyle = lineColor;
  ctx.beginPath(); ctx.arc(x+dw/4+wx(8)*0.3, groundY-dh/2+8, 2.5, 0, Math.PI*2); ctx.fill();

  ctx.globalAlpha=1;
  ctx.fillStyle=locked?'#aaa':(color||lineColor);
  ctx.font="bold 11px 'Velvelyne',serif"; ctx.textAlign='center';
  ctx.fillText(label, x, groundY-dh-10);
  ctx.restore();
}

// Wobbly box outline
function drawWobblyRect(ctx, x, y, w, h, dark) {
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  // Top
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + w * 0.3, y - 1.5, x + w * 0.5, y + 0.5);
  ctx.quadraticCurveTo(x + w * 0.7, y - 1, x + w, y + 0.5);
  ctx.stroke();
  // Right
  ctx.beginPath(); ctx.moveTo(x + w, y);
  ctx.quadraticCurveTo(x + w + 1.5, y + h * 0.3, x + w - 0.5, y + h * 0.5);
  ctx.quadraticCurveTo(x + w + 1, y + h * 0.7, x + w - 0.5, y + h);
  ctx.stroke();
  // Bottom
  ctx.beginPath(); ctx.moveTo(x + w, y + h);
  ctx.quadraticCurveTo(x + w * 0.7, y + h + 1.5, x + w * 0.5, y + h - 0.5);
  ctx.quadraticCurveTo(x + w * 0.3, y + h + 1, x, y + h - 0.5);
  ctx.stroke();
  // Left
  ctx.beginPath(); ctx.moveTo(x, y + h);
  ctx.quadraticCurveTo(x - 1.5, y + h * 0.7, x + 0.5, y + h * 0.5);
  ctx.quadraticCurveTo(x - 1, y + h * 0.3, x + 0.5, y);
  ctx.stroke();
  ctx.restore();
}

export default function LandingScreen({ darkMode, onSelect, onToggleDark }) {
  const canvasRef = useRef(null);
  const outerRef = useRef(null);
  const animRef = useRef(null);
  const [tool, setTool] = useState('marker');
  const [size, setSize] = useState(0);
  const stRef = useRef({
    engine:null,runner:null,player:null,
    keys:{},jumpCount:0,wasJump:false,facing:1,
    lastActive:performance.now(),lastVy:0,
    flowerCollected: !!sessionStorage.getItem('risopaint-flower'),
    selected:null,mode:'main',fadeAlpha:0,fadeDir:0,fadeCallback:null,
    strokes:[], currentStroke:null, drawing:false,
    strokeBodies:[], // physics bodies for drawn strokes
  });

  useEffect(() => {
    const onResize = () => setSize(s => s + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const canvas = canvasRef.current;
    if(!outer||!canvas) return;

    const st = stRef.current;
    st.strokes = [];
    st.currentStroke = null;
    st.strokeBodies = [];
    st.drawing = false;

    const outerW = outer.clientWidth;
    const outerH = outer.clientHeight;
    const dpr = window.devicePixelRatio;

    // Box size — centered medium rectangle
    const boxW = Math.min(500, outerW - 40);
    const boxH = Math.min(320, outerH - 40);
    const boxX = (outerW - boxW) / 2;
    const boxY = (outerH - boxH) / 2;

    canvas.width = outerW * dpr;
    canvas.height = outerH * dpr;
    canvas.style.width = outerW + 'px';
    canvas.style.height = outerH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 } });
    st.engine = engine;
    const runner = Runner.create();
    st.runner = runner;
    Runner.run(runner, engine);

    // Ground flush with box bottom
    const groundY = boxY + boxH;
    const floor = Bodies.rectangle(outerW / 2, groundY + 3, boxW - 20, 6, { isStatic: true, friction: 0.8 });
    // Walls inside box
    const leftWall = Bodies.rectangle(boxX + 8, boxY + boxH / 2, 6, boxH, { isStatic: true });
    const rightWall = Bodies.rectangle(boxX + boxW - 8, boxY + boxH / 2, 6, boxH, { isStatic: true });
    Composite.add(engine.world, [floor, leftWall, rightWall]);

    // Player
    const player = Bodies.rectangle(outerW / 2, groundY - 30, 15, 36, {
      restitution: 0.1, friction: 0.8, density: 0.05,
      inertia: Infinity, inverseInertia: 0,
    });
    st.player = player;
    Composite.add(engine.world, player);

    const doorW = 45, doorH = 70;
    const mainDoors = [
      { x: outerW / 2 - 70, label: '𖦹 story mode', color: '#e74c3c', action: 'story' },
      { x: outerW / 2 + 70, label: 'freestyle', color: '#2ecc71', action: 'freeform' },
    ];

    const chapterDoors = [];
    const chapterCount = 5;
    const chapterSpacing = 55;
    const chaptersWidth = (chapterCount - 1) * chapterSpacing;
    const chaptersStartX = outerW / 2 - chaptersWidth / 2;
    const ledgeY = groundY - 70;
    for (let i = 0; i < chapterCount; i++) {
      chapterDoors.push({
        x: chaptersStartX + i * chapterSpacing,
        y: ledgeY, // doors sit on the ledge
        label: `ch. ${i + 1}`,
        color: '#999',
        action: `chapter-${i + 1}`,
        locked: true,
      });
    }
    // Back door on the ground floor
    chapterDoors.push({
      x: boxX + 40,
      label: '← back',
      color: '#666',
      action: 'back',
      locked: false,
    });
    // Ledge platform for chapter select
    const ledgeWidth = chaptersWidth + 70;
    const chapterLedge = Bodies.rectangle(outerW / 2, ledgeY, ledgeWidth, 10, { isStatic: true, friction: 0.8 });

    // Tool toggle + dark mode — bottom right inside box
    const iconY = boxY + boxH - 18;
    const darkX = boxX + boxW - 18;
    const toolX = darkX - 30;
    const icons = [
      { id: 'darkToggle', x: darkX, y: iconY },
      { id: 'toolToggle', x: toolX, y: iconY },
    ];

    function drawDoodleIcons(ctx, activeTool, dark) {
      const col = '#000';
      ctx.save();

      // Tool toggle — single icon that shows current tool
      ctx.font = "bold 16px 'Velvelyne', serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = col;
      if (activeTool === 'eraser') {
        // Doodled eraser
        ctx.strokeStyle = col;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 1.8;
        const ex = toolX, ey = iconY;
        ctx.beginPath();
        ctx.moveTo(ex - 6, ey + 4);
        ctx.quadraticCurveTo(ex - 7, ey + 3, ex - 3, ey - 5);
        ctx.lineTo(ex + 4, ey - 5);
        ctx.quadraticCurveTo(ex + 7, ey - 4, ex + 6, ey + 4);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex, ey + 4);
        ctx.lineTo(ex + 1, ey - 5);
        ctx.stroke();
      } else {
        // Hand-doodled squiggle (mimics ᝰ looping wave)
        ctx.strokeStyle = col;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 1.8;
        const px = toolX, py = iconY;
        ctx.beginPath();
        ctx.moveTo(px - 8, py + 1);
        ctx.bezierCurveTo(px - 6, py - 9, px - 1, py - 9, px - 2, py);
        ctx.bezierCurveTo(px - 3, py + 7, px + 1, py + 8, px + 2, py + 1);
        ctx.bezierCurveTo(px + 3, py - 5, px + 6, py - 5, px + 5, py);
        ctx.bezierCurveTo(px + 4, py + 4, px + 7, py + 3, px + 9, py - 1);
        ctx.stroke();
      }

      // Dark mode toggle — doodled sun or doodled moon
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      const sx = darkX, sy = iconY;
      if (dark) {
        // Hand-doodled crescent moon
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const r = 5 + Math.sin(a * 3 + 0.8) * 0.4;
          const px = sx + Math.cos(a) * r;
          const py = sy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // Cut-out circle to make crescent
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const r = 4.5 + Math.sin(a * 3 + 2.1) * 0.3;
          const px = sx + 3 + Math.cos(a) * r;
          const py = sy - 1 + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.fill();
        // Inner crescent outline
        ctx.strokeStyle = col;
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const r = 4.5 + Math.sin(a * 3 + 2.1) * 0.3;
          const px = sx + 3 + Math.cos(a) * r;
          const py = sy - 1 + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else {
        // Hand-doodled sun
        ctx.beginPath();
        for (let i = 0; i <= 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const r = 3.5 + Math.sin(a * 3 + 1.2) * 0.4;
          const px = sx + Math.cos(a) * r;
          const py = sy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // Rays
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + 0.2;
          const wobble = Math.sin(i * 2.7) * 0.5;
          ctx.beginPath();
          ctx.moveTo(sx + Math.cos(a) * 5, sy + Math.sin(a) * 5);
          ctx.quadraticCurveTo(
            sx + Math.cos(a) * 6.5 + wobble, sy + Math.sin(a) * 6.5 + wobble,
            sx + Math.cos(a) * 8, sy + Math.sin(a) * 8
          );
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // Click handler for doodled icons
    const onCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      // Dark toggle
      if (Math.abs(cx - darkX) < 14 && Math.abs(cy - iconY) < 14) {
        onToggleDark();
        e.stopPropagation();
        return;
      }
      // Tool toggle
      if (Math.abs(cx - toolX) < 14 && Math.abs(cy - iconY) < 14) {
        const newTool = st.tool === 'marker' ? 'eraser' : 'marker';
        st.tool = newTool;
        if (window._landingSetTool) window._landingSetTool(newTool);
        e.stopPropagation();
        return;
      }
    };
    canvas.addEventListener('click', onCanvasClick);
    function addStrokeBodies(stroke) {
      const pts = stroke.points;
      if (pts.length < 2) return;
      const thickness = 6;
      const step = Math.max(1, Math.floor(pts.length / 30));
      const bodies = [];
      for (let i = 0; i < pts.length - step; i += step) {
        const p1 = pts[i];
        const p2 = pts[Math.min(i + step, pts.length - 1)];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 2) continue;
        const angle = Math.atan2(dy, dx);
        const cx = (p1.x + p2.x) / 2;
        const cy = (p1.y + p2.y) / 2;
        const body = Bodies.rectangle(cx, cy, len, thickness, {
          isStatic: true, friction: 0.8, angle,
        });
        bodies.push(body);
        Composite.add(engine.world, body);
      }
      st.strokeBodies.push({ stroke, bodies });
    }

    function eraseAt(x, y) {
      const eraseR = 15;
      const toRemove = [];
      st.strokeBodies = st.strokeBodies.filter(sb => {
        const hit = sb.stroke.points.some(p =>
          Math.abs(p.x - x) < eraseR && Math.abs(p.y - y) < eraseR
        );
        if (hit) {
          sb.bodies.forEach(b => Composite.remove(engine.world, b));
          toRemove.push(sb.stroke);
        }
        return !hit;
      });
      st.strokes = st.strokes.filter(s => !toRemove.includes(s));
    }

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    };

    const onPointerDown = (e) => {
      if (e.button && e.button !== 0) return;
      const pos = getPos(e);
      // Skip if clicking on a doodled icon area
      if (Math.abs(pos.x - darkX) < 14 && Math.abs(pos.y - iconY) < 14) return;
      if (Math.abs(pos.x - toolX) < 14 && Math.abs(pos.y - iconY) < 14) return;
      // Only draw inside the box
      if (pos.x < boxX || pos.x > boxX + boxW || pos.y < boxY || pos.y > boxY + boxH) return;
      st.drawing = true;
      if (st.tool === 'eraser') {
        eraseAt(pos.x, pos.y);
      } else {
        st.currentStroke = { points: [pos], color: '#000' };
      }
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!st.drawing) return;
      const pos = getPos(e);
      if (st.tool === 'eraser') {
        eraseAt(pos.x, pos.y);
      } else if (st.currentStroke) {
        st.currentStroke.points.push(pos);
      }
      e.preventDefault();
    };

    const onPointerUp = (e) => {
      if (!st.drawing) return;
      st.drawing = false;
      if (st.currentStroke && st.currentStroke.points.length > 1) {
        st.strokes.push(st.currentStroke);
        addStrokeBodies(st.currentStroke);
      }
      st.currentStroke = null;
    };

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    canvas.addEventListener('touchend', onPointerUp);

    const onKeyDown = (e) => { st.keys[e.key] = true; };
    const onKeyUp = (e) => { st.keys[e.key] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    function drawStroke(stroke) {
      const pts = stroke.points;
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        ctx.moveTo(
          pts[0].x + Math.sin(pass * 4.1) * 0.3,
          pts[0].y + Math.cos(pass * 3.7) * 0.3
        );
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1];
          const p = pts[i];
          const wobble = Math.sin(i * 3.7 + pass * 2.1) * 0.4;
          const mx = (prev.x + p.x) / 2 + wobble;
          const my = (prev.y + p.y) / 2 + Math.cos(i * 2.3 + pass * 1.3) * 0.3;
          ctx.quadraticCurveTo(
            prev.x + Math.sin(i * 5.3 + pass) * 0.2,
            prev.y + Math.cos(i * 4.1 + pass) * 0.2,
            mx, my
          );
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
      ctx.restore();
    }

    function frame() {
      const now = performance.now();
      const keys = st.keys;
      if (keys.ArrowLeft||keys.a||keys.ArrowRight||keys.d||keys.ArrowUp||keys.w||keys[' ']) st.lastActive = now;
      const sleeping = (now - st.lastActive) > 10000;

      // Movement
      const speed = 5;
      const jumpVel = -9;
      let vx = player.velocity.x;
      if(keys.ArrowLeft||keys.a){vx=-speed;st.facing=-1;}
      else if(keys.ArrowRight||keys.d){vx=speed;st.facing=1;}
      else{vx*=0.7;}
      if(keys.ArrowDown||keys.s) Body.setVelocity(player,{x:player.velocity.x,y:Math.max(player.velocity.y,8)});

      const vy=player.velocity.y;
      const onGround=Math.abs(vy)<0.5&&st.lastVy>=0;
      if(onGround) st.jumpCount=0;
      st.lastVy=vy;

      // Check door proximity before jump — entering a door skips the jump
      const doors = st.mode === 'main' ? mainDoors : chapterDoors;
      let enteringDoor = false;
      if(!st.selected){
        for(const door of doors){
          if(door.locked) continue;
          const doorGround = door.y || groundY;
          const dx=Math.abs(player.position.x-door.x);
          const dy=doorGround-player.position.y;
          if(dx<doorW/2+8&&dy>10&&dy<doorH+20&&(keys.ArrowUp||keys.w||keys[' '])){
            enteringDoor = true;
            st.selected=door.action;
            st.fadeDir = 1;
            st.fadeAlpha = 0;
            st.fadeCallback = () => {
              if(door.action==='story'){
                st.mode='chapters';st.selected=null;
                // Clear drawn strokes and their physics bodies
                st.strokeBodies.forEach(sb => sb.bodies.forEach(b => Composite.remove(engine.world, b)));
                st.strokeBodies = [];
                st.strokes = [];
                Composite.add(engine.world, chapterLedge);
                Body.setPosition(player,{x:boxX+40,y:groundY-30});
                Body.setVelocity(player,{x:0,y:0});
              }else if(door.action==='back'){
                st.mode='main';st.selected=null;
                // Clear drawn strokes and their physics bodies
                st.strokeBodies.forEach(sb => sb.bodies.forEach(b => Composite.remove(engine.world, b)));
                st.strokeBodies = [];
                st.strokes = [];
                Composite.remove(engine.world, chapterLedge);
                Body.setPosition(player,{x:outerW/2,y:groundY-30});
                Body.setVelocity(player,{x:0,y:0});
              }else if(door.action==='freeform'){
                onSelect('freeform');
                return;
              }else if(door.action.startsWith('chapter-')){
                onSelect(door.action);
                return;
              }
              st.fadeDir = -1;
            };
            break;
          }
        }
      }

      const jp=keys.ArrowUp||keys.w;
      if(jp&&!st.wasJump&&st.jumpCount<1&&!enteringDoor){Body.setVelocity(player,{x:vx,y:jumpVel});st.jumpCount++;}
      else{Body.setVelocity(player,{x:vx,y:player.velocity.y});}
      st.wasJump=jp;

      // Esc to go back
      if(st.mode==='chapters'&&(keys.Escape||keys.Backspace)&&!st.fadeDir){
        st.fadeDir = 1;
        st.fadeAlpha = 0;
        st.fadeCallback = () => {
          st.mode='main';st.selected=null;
          Composite.remove(engine.world, chapterLedge);
          Body.setPosition(player,{x:outerW/2,y:groundY-30});
          Body.setVelocity(player,{x:0,y:0});
          st.fadeDir = -1;
        };
        keys.Escape=false;keys.Backspace=false;
      }

      // Render
      ctx.clearRect(0,0,outerW,outerH);

      // Grey background outside
      ctx.fillStyle = darkMode ? '#444' : '#d8d8d8';
      ctx.fillRect(0, 0, outerW, outerH);

      // Box fill — always white
      ctx.fillStyle = '#fff';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      // Grid inside box only
      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let gx = boxX; gx <= boxX + boxW; gx += 12) { ctx.moveTo(gx, boxY); ctx.lineTo(gx, boxY + boxH); }
      for (let gy = boxY; gy <= boxY + boxH; gy += 12) { ctx.moveTo(boxX, gy); ctx.lineTo(boxX + boxW, gy); }
      ctx.stroke();
      ctx.restore();

      // Draw strokes (clipped to box)
      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();
      for (const stroke of st.strokes) drawStroke(stroke);
      if (st.currentStroke) drawStroke(st.currentStroke);
      ctx.restore();

      // Wobbly outline
      drawWobblyRect(ctx, boxX, boxY, boxW, boxH, darkMode);

      // Title inside box — only on main menu
      let flowerX, flowerY;
      if (st.mode === 'main') {
        ctx.save();
        ctx.font = "bold 22px 'Velvelyne', serif";
        ctx.textAlign = 'center';
        // Measure to position flower separately
        const titleText = st.flowerCollected ? 'risopaint' : '❀ risopaint';
        const textW = ctx.measureText(titleText).width;
        ctx.fillStyle = '#222';
        ctx.fillText(titleText, outerW / 2, boxY + 60);
        if (!st.flowerCollected) {
          // Flower position — left edge of the title text
          flowerX = outerW / 2 - textW / 2 + 8;
          flowerY = boxY + 55;
        }
        ctx.font = "11px 'Velvelyne', serif";
        ctx.fillStyle = '#aaa';
        ctx.fillText('arrow keys to move · jump or space to enter', outerW / 2, boxY + 77);
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.font = "bold 22px 'Velvelyne', serif";
        ctx.textAlign = 'center';
        ctx.fillText('𖦹 story mode', outerW / 2, boxY + 48);
        ctx.font = "11px 'Velvelyne', serif";
        ctx.fillStyle = '#aaa';
        ctx.fillText('select a chapter · esc to go back', outerW / 2, boxY + 63);
        ctx.restore();
      }

      // Doors
      for (const door of doors) {
        const doorGround = door.y || groundY;
        drawDoor(ctx, door.x, doorGround, doorW, doorH, door.label, door.color, door.locked || false, darkMode);
      }

      // Draw ledge line in chapter mode
      if (st.mode === 'chapters') {
        ctx.save();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        const ledgeLeft = outerW / 2 - ledgeWidth / 2;
        const ledgeRight = outerW / 2 + ledgeWidth / 2;
        ctx.beginPath();
        ctx.moveTo(ledgeLeft, ledgeY);
        ctx.quadraticCurveTo(outerW / 2, ledgeY - 1, ledgeRight, ledgeY + 0.5);
        ctx.stroke();
        ctx.restore();
      }

      // Flower collection
      if (flowerX && !st.flowerCollected) {
        const dx = Math.abs(player.position.x - flowerX);
        const dy = Math.abs(player.position.y - flowerY);
        if (dx < 20 && dy < 20) {
          st.flowerCollected = true;
          sessionStorage.setItem('risopaint-flower', '1');
        }
      }

      // Girl
      const running = Math.abs(player.velocity.x) > 0.5;
      drawGirl(ctx, player.position.x, player.position.y, st.facing, running, now, sleeping, darkMode, st.flowerCollected);

      // Doodled tool icons
      drawDoodleIcons(ctx, st.tool, darkMode);

      // Fade transition overlay
      if (st.fadeDir !== 0) {
        st.fadeAlpha += st.fadeDir * 0.05;
        if (st.fadeAlpha >= 1) {
          st.fadeAlpha = 1;
          st.fadeDir = 0;
          if (st.fadeCallback) { st.fadeCallback(); st.fadeCallback = null; }
        } else if (st.fadeAlpha <= 0) {
          st.fadeAlpha = 0;
          st.fadeDir = 0;
          st.selected = null;
        }
      }
      if (st.fadeAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = st.fadeAlpha;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, outerW, outerH);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      Runner.stop(runner);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousedown', onPointerDown);
      canvas.removeEventListener('mousemove', onPointerMove);
      canvas.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('touchstart', onPointerDown);
      canvas.removeEventListener('touchmove', onPointerMove);
      canvas.removeEventListener('touchend', onPointerUp);
      canvas.removeEventListener('click', onCanvasClick);
    };
  }, [darkMode, onSelect, size]);

  // Sync tool into ref so the frame loop / handlers can see it
  useEffect(() => { stRef.current.tool = tool; }, [tool]);
  // Allow canvas click handler to update React state
  useEffect(() => {
    window._landingSetTool = setTool;
    return () => { delete window._landingSetTool; };
  }, []);

  return (
    <div ref={outerRef} {...stylex.props(s.outer)}>
      <canvas ref={canvasRef} {...stylex.props(s.canvas)} />
    </div>
  );
}
