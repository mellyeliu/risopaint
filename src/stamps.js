// Stamps — original icon set with riso-style SVG gradient fills
// Each stamp uses linearGradient / radialGradient defs for soft color transitions

export const stamps = [
  {
    name: 'mushroom',
    svg: `<svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mush-cap" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#ff6b81"/>
          <stop offset="50%" stop-color="#e8507a"/>
          <stop offset="100%" stop-color="#b8255f"/>
        </radialGradient>
        <linearGradient id="mush-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff5e6"/>
          <stop offset="100%" stop-color="#f0d9b5"/>
        </linearGradient>
      </defs>
      <rect x="22" y="38" width="20" height="28" rx="6" fill="url(#mush-stem)"/>
      <ellipse cx="32" cy="36" rx="28" ry="22" fill="url(#mush-cap)"/>
      <circle cx="22" cy="28" r="5" fill="white" opacity="0.7"/>
      <circle cx="38" cy="22" r="6" fill="white" opacity="0.7"/>
      <circle cx="30" cy="38" r="3.5" fill="white" opacity="0.5"/>
      <circle cx="44" cy="32" r="4" fill="white" opacity="0.6"/>
    </svg>`,
  },
  {
    name: 'flower',
    svg: `<svg viewBox="0 0 64 74" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fl-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#66bb6a"/>
          <stop offset="100%" stop-color="#2e7d32"/>
        </linearGradient>
        <radialGradient id="fl-petal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f8bbd0"/>
          <stop offset="60%" stop-color="#f06292"/>
          <stop offset="100%" stop-color="#c2185b"/>
        </radialGradient>
        <radialGradient id="fl-center" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stop-color="#fff9c4"/>
          <stop offset="100%" stop-color="#f9a825"/>
        </radialGradient>
      </defs>
      <rect x="29" y="42" width="6" height="28" rx="3" fill="url(#fl-stem)"/>
      <ellipse cx="32" cy="24" rx="14" ry="16" fill="url(#fl-petal)"/>
      <ellipse cx="20" cy="28" rx="12" ry="14" fill="url(#fl-petal)" opacity="0.8"/>
      <ellipse cx="44" cy="28" rx="12" ry="14" fill="url(#fl-petal)" opacity="0.8"/>
      <ellipse cx="24" cy="16" rx="11" ry="13" fill="url(#fl-petal)" opacity="0.65"/>
      <ellipse cx="40" cy="16" rx="11" ry="13" fill="url(#fl-petal)" opacity="0.65"/>
      <circle cx="32" cy="24" r="7" fill="url(#fl-center)"/>
    </svg>`,
  },
  {
    name: 'cloud',
    svg: `<svg viewBox="0 0 80 52" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cloud-g1" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stop-color="#fff"/>
          <stop offset="100%" stop-color="#bbdefb"/>
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="34" rx="34" ry="14" fill="url(#cloud-g1)"/>
      <ellipse cx="26" cy="26" rx="16" ry="14" fill="#fff"/>
      <ellipse cx="44" cy="22" rx="18" ry="16" fill="#fff"/>
      <ellipse cx="34" cy="16" rx="13" ry="12" fill="#fff"/>
      <ellipse cx="54" cy="28" rx="12" ry="10" fill="#f0f6ff"/>
    </svg>`,
  },
  {
    name: 'butterfly',
    svg: `<svg viewBox="0 0 72 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bfly-left" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#f8bbd0"/>
          <stop offset="50%" stop-color="#e040fb"/>
          <stop offset="100%" stop-color="#7b1fa2"/>
        </radialGradient>
        <radialGradient id="bfly-right" cx="60%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#b3e5fc"/>
          <stop offset="50%" stop-color="#29b6f6"/>
          <stop offset="100%" stop-color="#0277bd"/>
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="22" rx="18" ry="16" fill="url(#bfly-left)" transform="rotate(-15 24 22)"/>
      <ellipse cx="48" cy="22" rx="18" ry="16" fill="url(#bfly-right)" transform="rotate(15 48 22)"/>
      <ellipse cx="22" cy="42" rx="14" ry="12" fill="url(#bfly-left)" opacity="0.75" transform="rotate(-10 22 42)"/>
      <ellipse cx="50" cy="42" rx="14" ry="12" fill="url(#bfly-right)" opacity="0.75" transform="rotate(10 50 42)"/>
      <ellipse cx="36" cy="32" rx="3" ry="18" fill="#4a148c"/>
      <path d="M36 14 Q30 4 26 2" fill="none" stroke="#4a148c" stroke-width="2" stroke-linecap="round"/>
      <path d="M36 14 Q42 4 46 2" fill="none" stroke="#4a148c" stroke-width="2" stroke-linecap="round"/>
      <circle cx="26" cy="2" r="2" fill="#e040fb"/>
      <circle cx="46" cy="2" r="2" fill="#29b6f6"/>
    </svg>`,
  },
  {
    name: 'rainbow',
    svg: `<svg viewBox="0 0 80 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rb-1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ef5350"/><stop offset="100%" stop-color="#ff7043"/></linearGradient>
        <linearGradient id="rb-2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ff7043"/><stop offset="100%" stop-color="#ffca28"/></linearGradient>
        <linearGradient id="rb-3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffca28"/><stop offset="100%" stop-color="#66bb6a"/></linearGradient>
        <linearGradient id="rb-4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#42a5f5"/><stop offset="100%" stop-color="#7e57c2"/></linearGradient>
        <linearGradient id="rb-5" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#7e57c2"/><stop offset="100%" stop-color="#ec407a"/></linearGradient>
      </defs>
      <path d="M4 46 A36 36 0 0 1 76 46" fill="none" stroke="url(#rb-1)" stroke-width="5"/>
      <path d="M9 46 A31 31 0 0 1 71 46" fill="none" stroke="url(#rb-2)" stroke-width="5"/>
      <path d="M14 46 A26 26 0 0 1 66 46" fill="none" stroke="url(#rb-3)" stroke-width="5"/>
      <path d="M19 46 A21 21 0 0 1 61 46" fill="none" stroke="url(#rb-4)" stroke-width="5"/>
      <path d="M24 46 A16 16 0 0 1 56 46" fill="none" stroke="url(#rb-5)" stroke-width="5"/>
    </svg>`,
  },
  {
    name: 'sparkle',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sparkle-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff9c4"/>
          <stop offset="40%" stop-color="#ffee58"/>
          <stop offset="100%" stop-color="#f48fb1"/>
        </linearGradient>
      </defs>
      <path d="M32 2 L36 24 L58 20 L40 32 L58 44 L36 40 L32 62 L28 40 L6 44 L24 32 L6 20 L28 24 Z" fill="url(#sparkle-grad)"/>
    </svg>`,
  },
  {
    name: 'shell',
    svg: `<svg viewBox="0 0 64 56" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shell-g" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stop-color="#f8bbd0"/>
          <stop offset="50%" stop-color="#f06292"/>
          <stop offset="100%" stop-color="#e8507a"/>
        </radialGradient>
      </defs>
      <path d="M32 4 Q8 4 4 48 L60 48 Q56 4 32 4Z" fill="url(#shell-g)"/>
      <path d="M32 4 Q32 48 12 48" fill="none" stroke="white" stroke-width="1" opacity="0.3"/>
      <path d="M32 4 Q32 48 22 48" fill="none" stroke="white" stroke-width="1" opacity="0.25"/>
      <path d="M32 4 Q32 48 42 48" fill="none" stroke="white" stroke-width="1" opacity="0.25"/>
      <path d="M32 4 Q32 48 52 48" fill="none" stroke="white" stroke-width="1" opacity="0.3"/>
      <ellipse cx="32" cy="48" rx="28" ry="6" fill="#e8507a" opacity="0.4"/>
    </svg>`,
  },
  {
    name: 'four-star',
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="4star-g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff9c4"/>
          <stop offset="40%" stop-color="#ffe082"/>
          <stop offset="100%" stop-color="#e8507a"/>
        </radialGradient>
      </defs>
      <path d="M32 0 C34 20 44 30 64 32 C44 34 34 44 32 64 C30 44 20 34 0 32 C20 30 30 20 32 0Z" fill="url(#4star-g)"/>
    </svg>`,
  },
  {
    name: 'lotus',
    svg: `<svg viewBox="0 0 72 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lotus-g" cx="50%" cy="70%" r="60%">
          <stop offset="0%" stop-color="#f8bbd0"/>
          <stop offset="60%" stop-color="#f06292"/>
          <stop offset="100%" stop-color="#9e3a6b"/>
        </radialGradient>
        <radialGradient id="lotus-g2" cx="50%" cy="70%" r="60%">
          <stop offset="0%" stop-color="#c5cae9"/>
          <stop offset="100%" stop-color="#7b68ae"/>
        </radialGradient>
      </defs>
      <ellipse cx="36" cy="50" rx="20" ry="6" fill="#3a9e95" opacity="0.3"/>
      <path d="M36 48 Q16 30 8 12 Q24 22 36 18 Q48 22 64 12 Q56 30 36 48Z" fill="url(#lotus-g2)" opacity="0.5"/>
      <path d="M36 48 Q22 34 18 18 Q30 26 36 22 Q42 26 54 18 Q50 34 36 48Z" fill="url(#lotus-g)"/>
      <path d="M36 48 Q30 38 28 26 Q34 32 36 28 Q38 32 44 26 Q42 38 36 48Z" fill="#f8bbd0"/>
    </svg>`,
  },
  {
    name: 'vine',
    svg: `<svg viewBox="0 0 48 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vine-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3a9e95"/>
          <stop offset="100%" stop-color="#2e7d32"/>
        </linearGradient>
      </defs>
      <path d="M24 4 Q8 20 24 36 Q40 52 24 72" fill="none" stroke="url(#vine-g)" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="14" cy="18" rx="8" ry="5" fill="#3a9e95" opacity="0.7" transform="rotate(-30 14 18)"/>
      <ellipse cx="34" cy="36" rx="8" ry="5" fill="#5cb85c" opacity="0.7" transform="rotate(20 34 36)"/>
      <ellipse cx="16" cy="54" rx="7" ry="4.5" fill="#3a9e95" opacity="0.6" transform="rotate(-25 16 54)"/>
    </svg>`,
  },
  {
    name: 'bow',
    svg: `<svg viewBox="0 0 72 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bow-g" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#f8bbd0"/>
          <stop offset="100%" stop-color="#e8507a"/>
        </radialGradient>
      </defs>
      <path d="M36 24 Q20 4 4 8 Q8 24 36 24" fill="url(#bow-g)"/>
      <path d="M36 24 Q52 4 68 8 Q64 24 36 24" fill="url(#bow-g)"/>
      <path d="M36 24 Q20 44 4 40 Q8 24 36 24" fill="url(#bow-g)" opacity="0.8"/>
      <path d="M36 24 Q52 44 68 40 Q64 24 36 24" fill="url(#bow-g)" opacity="0.8"/>
      <circle cx="36" cy="24" r="5" fill="#9e3a6b"/>
    </svg>`,
  },
  {
    name: 'smoke',
    svg: `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="smk-g1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#e8e4e0"/>
          <stop offset="70%" stop-color="#d0ccc8" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <radialGradient id="smk-g2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f0ece8"/>
          <stop offset="60%" stop-color="#ddd8d4" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="34" rx="22" ry="18" fill="url(#smk-g1)"/>
      <ellipse cx="44" cy="28" rx="26" ry="20" fill="url(#smk-g2)"/>
      <ellipse cx="58" cy="36" rx="18" ry="14" fill="url(#smk-g1)"/>
      <ellipse cx="36" cy="20" rx="16" ry="12" fill="url(#smk-g2)"/>
    </svg>`,
  },
  {
    name: 'petal',
    svg: `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pet-g" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#fff"/>
          <stop offset="30%" stop-color="#f4a0b5"/>
          <stop offset="70%" stop-color="#e8507a"/>
          <stop offset="100%" stop-color="#9e3a6b"/>
        </radialGradient>
      </defs>
      <path d="M24 4 Q4 20 8 44 Q14 62 24 60 Q34 62 40 44 Q44 20 24 4Z" fill="url(#pet-g)"/>
      <path d="M24 8 Q18 28 20 44" fill="none" stroke="white" stroke-width="0.8" opacity="0.3"/>
    </svg>`,
  },
  {
    name: 'wave',
    svg: `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wave-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3255a4"/>
          <stop offset="50%" stop-color="#3a9e95"/>
          <stop offset="100%" stop-color="#7b68ae"/>
        </linearGradient>
      </defs>
      <path d="M0 20 Q10 4 20 20 Q30 36 40 20 Q50 4 60 20 Q70 36 80 20" fill="none" stroke="url(#wave-g)" stroke-width="4" stroke-linecap="round"/>
      <path d="M0 28 Q10 16 20 28 Q30 40 40 28 Q50 16 60 28 Q70 40 80 28" fill="none" stroke="url(#wave-g)" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
    </svg>`,
  },
];

// Render an SVG stamp string to an Image for canvas drawing
const stampImageCache = new Map();

// Make gradient IDs unique per stamp to avoid collisions when multiple stamps
// are inlined into the same document or when the browser de-dupes ids.
let _stampIdCounter = 0;
function uniquifyGradientIds(svgStr) {
  const suffix = `_s${_stampIdCounter++}`;
  // Find all id="..." declarations and their url(#...) references
  const idRe = /id="([^"]+)"/g;
  const ids = new Set();
  let m;
  while ((m = idRe.exec(svgStr)) !== null) ids.add(m[1]);
  let result = svgStr;
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`id="${escaped}"`, 'g'), `id="${id}${suffix}"`);
    result = result.replace(new RegExp(`url\\(#${escaped}\\)`, 'g'), `url(#${id}${suffix})`);
  }
  return result;
}

export function getStampImage(stamp, color = null) {
  const key = `${stamp.name}-${color || 'default'}`;
  if (stampImageCache.has(key)) return stampImageCache.get(key);

  let svgStr = uniquifyGradientIds(stamp.svg);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;

  const promise = new Promise((resolve) => {
    img.onload = () => {
      stampImageCache.set(key, img);
      resolve(img);
    };
  });

  stampImageCache.set(key, img);
  img._loadPromise = promise;
  return img;
}

export function preloadStamps() {
  stamps.forEach((s) => getStampImage(s));
}
