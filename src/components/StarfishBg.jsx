import { useEffect, useRef } from 'react';

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

  return <div className={`starfish-bg ${darkMode ? 'dark-stars' : ''}`} ref={ref} />;
}
