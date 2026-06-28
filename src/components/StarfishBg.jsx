import { useEffect, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { breakpoints, grain } from '../tokens.stylex.js';

/*
 * Global CSS still required for innerHTML-generated elements:
 *
 *   .starfish-grid {
 *     display: grid;
 *     grid-template-columns: repeat(100, 1fr);
 *     gap: 0;
 *     width: 200%;
 *     height: 200%;
 *     animation: starfish-drift 120s linear infinite;
 *   }
 *   @keyframes starfish-drift {
 *     0%   { transform: translate(0, 0); }
 *     100% { transform: translate(-50%, -50%); }
 *   }
 *   .starfish-char {
 *     font-size: 26px;
 *     color: #ccc;
 *     display: flex;
 *     align-items: center;
 *     justify-content: center;
 *     line-height: 1;
 *     padding: 2px 0;
 *   }
 *   .dark-stars .starfish-char { color: #252525; }
 */

const styles = stylex.create({
  bg: {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    zIndex: 0,
    pointerEvents: 'none',
    display: {
      default: 'block',
      [breakpoints.mobile]: 'none',
    },
  },
  grain: {
    position: 'absolute',
    inset: 0,
    backgroundImage: grain.bg,
    backgroundSize: '200px 200px',
    opacity: 0.12,
    pointerEvents: 'none',
  },
  grainHidden: {
    display: 'none',
  },
});

export default function StarfishBg({ darkMode }) {
  const ref = useRef(null);

  useEffect(() => {
    const bg = ref.current;
    if (!bg) return;
    const cols = 100;
    const rows = 60;
    const total = cols * rows;
    let html = '<div class="starfish-grid">';
    for (let i = 0; i < total; i++) {
      html += '<span class="starfish-char">✿</span>';
    }
    html += '</div>';
    bg.innerHTML = html;
  }, []);

  return (
    <div
      className={darkMode ? 'dark-stars' : undefined}
      {...stylex.props(styles.bg)}
    >
      <div {...stylex.props(styles.grain, darkMode && styles.grainHidden)} />
      <div ref={ref} />
    </div>
  );
}
