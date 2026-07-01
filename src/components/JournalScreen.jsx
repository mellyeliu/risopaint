import { useRef, useEffect, useState } from 'react';
import * as stylex from '@stylexjs/stylex';

const s = stylex.create({
  outer: {
    flex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'block',
  },
});

function drawMarginDoodle(ctx, type, x, y, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const wobble = (i) => Math.sin(i * 3.7 + time * 0.0005) * 0.6;

  if (type === 'door') {
    ctx.beginPath();
    ctx.moveTo(-12 + wobble(0), 18);
    ctx.quadraticCurveTo(-13 + wobble(1), 0, -11 + wobble(2), -16);
    ctx.quadraticCurveTo(0 + wobble(3), -19, 11 + wobble(4), -16);
    ctx.quadraticCurveTo(13 + wobble(5), 0, 12 + wobble(6), 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(6, 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (type === 'cloud') {
    ctx.beginPath();
    ctx.moveTo(-14, 4);
    ctx.quadraticCurveTo(-16 + wobble(0), -4, -8 + wobble(1), -8);
    ctx.quadraticCurveTo(-4 + wobble(2), -14, 4 + wobble(3), -8);
    ctx.quadraticCurveTo(12 + wobble(4), -10, 14 + wobble(5), -2);
    ctx.quadraticCurveTo(16 + wobble(6), 4, 10, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === 'vine') {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    for (let i = 0; i < 8; i++) {
      const vx = Math.sin(i * 1.3 + 0.5) * 6 + wobble(i);
      ctx.quadraticCurveTo(vx, 20 - i * 5 - 2, vx * 0.5, 20 - (i + 1) * 5);
    }
    ctx.stroke();
    for (let i = 1; i < 7; i += 2) {
      const lx = Math.sin(i * 1.3 + 0.5) * 6;
      const ly = 20 - i * 5;
      ctx.beginPath();
      ctx.ellipse(lx + 3, ly, 3, 2, 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === 'wave') {
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    for (let i = 0; i < 4; i++) {
      const bx = -18 + i * 10;
      ctx.quadraticCurveTo(bx + 3, -8 + wobble(i), bx + 5, 0);
      ctx.quadraticCurveTo(bx + 7, 6 + wobble(i + 4), bx + 10, 0);
    }
    ctx.stroke();
  } else if (type === 'mushroom') {
    ctx.beginPath();
    ctx.moveTo(-3, 8);
    ctx.quadraticCurveTo(-2 + wobble(0), 0, 0, 0);
    ctx.quadraticCurveTo(2 + wobble(1), 0, 3, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, 2 + wobble(2));
    ctx.quadraticCurveTo(-8, -8, 0, -10 + wobble(3));
    ctx.quadraticCurveTo(8, -8, 10, 2 + wobble(4));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-3, -4, 1.5, 0, Math.PI * 2);
    ctx.arc(3, -2, 1, 0, Math.PI * 2);
    ctx.stroke();
  } else if (type === 'ladybug') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-3, -1, 1.5, 0, Math.PI * 2);
    ctx.arc(3, 2, 1.2, 0, Math.PI * 2);
    ctx.stroke();
  } else if (type === 'smoke') {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const sy = -i * 8;
      ctx.moveTo(-4 + wobble(i), sy);
      ctx.quadraticCurveTo(wobble(i + 3), sy - 5, 4 + wobble(i + 1), sy - 3);
      ctx.quadraticCurveTo(6 + wobble(i + 2), sy - 8, 2, sy - 10);
      ctx.stroke();
    }
  } else if (type === 'sparkle') {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
      const len = 8 + wobble(i) * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'shoes') {
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.quadraticCurveTo(-10 + wobble(0), -2, -6, -3);
    ctx.quadraticCurveTo(-2, -4 + wobble(1), 0, -2);
    ctx.quadraticCurveTo(2, 0, 0, 2);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.quadraticCurveTo(2 + wobble(2), -4, 6, -5);
    ctx.quadraticCurveTo(10, -6 + wobble(3), 12, -4);
    ctx.quadraticCurveTo(14, -2, 12, 0);
    ctx.closePath();
    ctx.stroke();
    // Wings
    ctx.beginPath();
    ctx.moveTo(-4, -3);
    ctx.quadraticCurveTo(-6, -10 + wobble(4), -2, -8);
    ctx.quadraticCurveTo(0, -12, 2, -6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -5);
    ctx.quadraticCurveTo(6, -12 + wobble(5), 10, -10);
    ctx.quadraticCurveTo(12, -14, 14, -8);
    ctx.stroke();
  }

  ctx.restore();
}

export default function JournalScreen({ chapter, chapterIndex, phase, darkMode, onContinue }) {
  const canvasRef = useRef(null);
  const outerRef = useRef(null);
  const animRef = useRef(null);
  const [revealedLines, setRevealedLines] = useState(0);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState(0);
  const startTimeRef = useRef(null);

  const lines = phase === 'pre' ? chapter.preText : chapter.postText;
  const totalLines = lines.length;

  useEffect(() => {
    setRevealedLines(0);
    setReady(false);
    startTimeRef.current = performance.now();
  }, [chapter, phase]);

  useEffect(() => {
    const onResize = () => setSize(s => s + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Reveal lines with timing
  useEffect(() => {
    if (revealedLines >= totalLines) {
      const t = setTimeout(() => setReady(true), 400);
      return () => clearTimeout(t);
    }
    const delay = revealedLines === 0 ? 600 : 900;
    const t = setTimeout(() => setRevealedLines(r => r + 1), delay);
    return () => clearTimeout(t);
  }, [revealedLines, totalLines]);

  // Space/click to continue
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (ready) {
          onContinue();
        } else {
          setRevealedLines(totalLines);
        }
      }
    };
    const onClick = () => {
      if (ready) onContinue();
      else setRevealedLines(totalLines);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
    };
  }, [ready, onContinue, totalLines]);

  // Canvas rendering
  useEffect(() => {
    const outer = outerRef.current;
    const canvas = canvasRef.current;
    if (!outer || !canvas) return;

    const dpr = window.devicePixelRatio;
    const outerW = outer.clientWidth;
    const outerH = outer.clientHeight;
    canvas.width = outerW * dpr;
    canvas.height = outerH * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pageW = Math.min(420, outerW - 60);
    const pageH = Math.min(500, outerH - 60);
    const pageX = (outerW - pageW) / 2;
    const pageY = (outerH - pageH) / 2;

    const marginLeft = 40;
    const lineHeight = 24;
    const textStartY = pageY + 70;

    function frame() {
      const now = performance.now();
      ctx.clearRect(0, 0, outerW, outerH);

      // Background
      ctx.fillStyle = darkMode ? '#333' : '#d8d8d8';
      ctx.fillRect(0, 0, outerW, outerH);

      // Page
      ctx.fillStyle = darkMode ? '#2a2a2a' : '#faf8f5';
      ctx.fillRect(pageX, pageY, pageW, pageH);

      // Ruled lines
      ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 0.5;
      for (let ly = textStartY; ly < pageY + pageH - 20; ly += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(pageX + 10, ly);
        ctx.lineTo(pageX + pageW - 10, ly);
        ctx.stroke();
      }

      // Margin line
      ctx.strokeStyle = darkMode ? 'rgba(200,100,100,0.15)' : 'rgba(200,100,100,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pageX + marginLeft, pageY + 10);
      ctx.lineTo(pageX + marginLeft, pageY + pageH - 10);
      ctx.stroke();

      // Chapter title — small, at top
      ctx.save();
      ctx.font = "11px 'Velvelyne', serif";
      ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
      ctx.textAlign = 'left';
      ctx.fillText('ch. ' + (chapterIndex + 1), pageX + marginLeft + 8, pageY + 30);
      ctx.restore();

      // Title
      ctx.save();
      ctx.font = "bold 18px 'Velvelyne', serif";
      ctx.fillStyle = darkMode ? '#ccc' : '#222';
      ctx.textAlign = 'left';
      ctx.fillText(chapter.title, pageX + marginLeft + 8, pageY + 52);
      ctx.restore();

      // Journal text — revealed line by line
      ctx.save();
      ctx.font = "15px 'Velvelyne', serif";
      ctx.textAlign = 'left';
      for (let i = 0; i < revealedLines && i < totalLines; i++) {
        const lineText = lines[i];
        const ly = textStartY + i * lineHeight;
        if (ly > pageY + pageH - 40) break;

        // Fade in animation for the most recent line
        const isNewest = i === revealedLines - 1;
        const elapsed = now - (startTimeRef.current || 0);
        const lineAge = elapsed - (i * 900 + 600);
        const alpha = isNewest ? Math.min(1, lineAge / 300) : 1;

        ctx.fillStyle = darkMode
          ? `rgba(200,200,200,${alpha})`
          : `rgba(30,30,30,${alpha})`;
        ctx.fillText(lineText, pageX + marginLeft + 8, ly);
      }
      ctx.restore();

      // Margin doodles — scattered down the left margin
      const doodleCount = 3;
      for (let d = 0; d < doodleCount; d++) {
        const dx = pageX + marginLeft / 2;
        const dy = pageY + 80 + d * (pageH / (doodleCount + 1));
        const vis = revealedLines > d * (totalLines / doodleCount);
        if (vis) {
          drawMarginDoodle(ctx, chapter.marginDoodles, dx, dy, now + d * 1000);
        }
      }

      // Page border — wobbly
      ctx.save();
      ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      const w = (n) => Math.sin(n * 3.7 + now * 0.0003) * 0.8;
      ctx.beginPath();
      ctx.moveTo(pageX + w(0), pageY + w(1));
      ctx.lineTo(pageX + pageW + w(2), pageY + w(3));
      ctx.lineTo(pageX + pageW + w(4), pageY + pageH + w(5));
      ctx.lineTo(pageX + w(6), pageY + pageH + w(7));
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Prompt
      if (ready) {
        ctx.save();
        const promptAlpha = 0.3 + Math.sin(now * 0.003) * 0.15;
        ctx.font = "11px 'Velvelyne', serif";
        ctx.fillStyle = darkMode
          ? `rgba(200,200,200,${promptAlpha})`
          : `rgba(0,0,0,${promptAlpha})`;
        ctx.textAlign = 'center';
        const promptText = phase === 'pre' ? 'press space to enter' : 'press space to continue';
        ctx.fillText(promptText, outerW / 2, pageY + pageH + 24);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [chapter, phase, darkMode, revealedLines, ready, size]);

  return (
    <div ref={outerRef} {...stylex.props(s.outer)}>
      <canvas ref={canvasRef} {...stylex.props(s.canvas)} />
    </div>
  );
}
