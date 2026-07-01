// Level data for story mode chapters
// Each level is an array of strokes that get loaded into the canvas
//
// Stamp indices: 0=flower, 1=ladybug, 2=cloud, 3=leaf, 4=butterfly,
// 5=shell, 6=mushroom, 7=sparkle, 8=lotus, 9=wave, 10=rainbow,
// 11=four-star, 12=vine, 13=bow, 14=smoke, 15=grass
//
// To design a level: draw in the editor, then run window._exportLevel()
// in the console to copy the stroke JSON.

const STAMP = {
  flower: 0, ladybug: 1, cloud: 2, leaf: 3, butterfly: 4,
  shell: 5, mushroom: 6, sparkle: 7, lotus: 8, wave: 9,
  rainbow: 10, fourStar: 11, vine: 12, bow: 13, smoke: 14, grass: 15,
};

function brush(cells, color = '#000', size = 6) {
  return { type: 'brush', cells, color, size };
}

function stamp(name, x, y, size = 40) {
  return { type: 'stamp', stampIndex: STAMP[name], x, y, size };
}

function startFlag(x, y) {
  return { type: 'start', x, y, width: 80, height: 90 };
}

function finishFlag(x, y) {
  return { type: 'finish', x, y, width: 80, height: 90 };
}

function platform(x, y, width) {
  const cells = [];
  const GRID = 12;
  const gx = Math.floor(x / GRID) * GRID;
  const gy = Math.floor(y / GRID) * GRID;
  const count = Math.ceil(width / GRID);
  for (let i = 0; i < count; i++) {
    cells.push(`${gx + i * GRID},${gy}`);
  }
  return brush(cells, '#000', 6);
}

// ─── NARRATIVE DATA ────────────────────────────────────────────────

export const chapters = [
  // ── Chapter 1: the door ──
  {
    title: 'the door',
    preText: [
      'ms. chen is drawing fractions on the board.',
      'you are drawing a door.',
      'it has wobbly edges and a round knob.',
      'you add a path and some flowers',
      'because every door needs somewhere nice to go.',
    ],
    postText: [
      'ms. chen asks you to pay attention.',
      'you close your notebook.',
    ],
    marginDoodles: 'door',
  },

  // ── Chapter 2: the yard ──
  {
    title: 'the yard',
    preText: [
      "they're playing that game again.",
      'the one where someone is it and everyone screams.',
      'you tried playing once. you were always it.',
      'you draw a cloud in the margin.',
      "it drifts off the edge of the page.",
      "it doesn't have to stay anywhere.",
    ],
    postText: [
      "the bell. you didn't hear it.",
      'you never hear it.',
    ],
    marginDoodles: 'cloud',
  },

  // ── Chapter 3: the substitute ──
  {
    title: 'the substitute',
    preText: [
      "there's a substitute today.",
      'she calls on you and you freeze.',
      'your mouth does the thing',
      "where it moves after you've already spoken.",
      'someone laughs.',
      'you draw a vine crawling up the margin',
      'so you have somewhere to climb.',
    ],
    postText: [
      'you spelled your name wrong on the worksheet.',
      "you don't know how that happened.",
    ],
    marginDoodles: 'vine',
  },

  // ── Chapter 4: the lunchroom ──
  {
    title: 'the lunchroom',
    preText: [
      'the cafeteria is the loudest place in the world.',
      'everything is orange and fluorescent.',
      'the trays. someone screaming. someone always screaming.',
      'you draw a wave in the margin of your planner.',
      "it's a big wave.",
      'it swallows the whole page.',
    ],
    postText: [
      "you eat in the bathroom stall.",
      "it's quieter there.",
    ],
    marginDoodles: 'wave',
  },

  // ── Chapter 5: the library ──
  {
    title: 'the library',
    preText: [
      'mrs. okafor lets you sit behind the desk.',
      "she doesn't make you talk.",
      'she puts a stack of books beside you',
      'and you read three before lunch is over.',
      'you draw a mushroom in the back of your science textbook.',
      "the kind that bounces you somewhere good.",
    ],
    postText: [
      'she says you can come back whenever you want.',
      'you come back every day.',
    ],
    marginDoodles: 'mushroom',
  },

  // ── Chapter 6: the game ──
  {
    title: 'the game',
    preText: [
      'they invented a new game.',
      "you don't know all the rules",
      'but you know it involves points',
      'and the points have something to do with you.',
      'you draw a row of ladybugs on your arm in red pen.',
      'they look friendly.',
      'they are not.',
    ],
    postText: [
      'you wash the ink off in the bathroom sink.',
      "it doesn't all come off.",
    ],
    marginDoodles: 'ladybug',
  },

  // ── Chapter 7: the birthday ──
  {
    title: 'the birthday',
    preText: [
      'she invited you. you practiced all week.',
      'you wore the shirt without tags',
      'because tags make your skin feel like static.',
      'you brought the right present. you arrived on time.',
      "it was wrong immediately.",
      "you couldn't tell how.",
    ],
    postText: [
      'your mom picks you up early.',
      'she asks if you had fun. you say yes.',
    ],
    marginDoodles: 'smoke',
  },

  // ── Chapter 8: the notebook ──
  {
    title: 'the notebook',
    preText: [
      'you start keeping a separate notebook.',
      'not for class.',
      'you write down what the other girls do',
      'when they talk to each other.',
      'how long they look at someone.',
      'what they do with their hands.',
      "you don't know why you need to study this.",
      'everyone else just knows.',
    ],
    postText: [
      'you hide it inside your textbook.',
      'nobody can see the code.',
    ],
    marginDoodles: 'sparkle',
  },

  // ── Chapter 9: the shoes ──
  {
    title: 'the shoes',
    preText: [
      'he threw them on the roof.',
      'you could see them from the yard.',
      'you thought about asking the custodian',
      'but the thought of explaining made your chest tight.',
      'you walked home in socks.',
      'your mom asked what happened.',
      'you said you lost them.',
    ],
    postText: [
      'you draw a pair of shoes with wings.',
      'they fly wherever they want.',
    ],
    marginDoodles: 'shoes',
  },

  // ── Chapter 10: the sketchbook ──
  {
    title: 'the sketchbook',
    preText: [
      'you open it to the first page.',
      'there is the door. the path. the flowers.',
      'it looks different now. fuller.',
      'every margin doodle you drew instead of listening.',
      'every vine and wave and cloud.',
      'it all goes somewhere.',
      '',
      'you step through.',
    ],
    postText: [
      'she is there on the other side.',
      'smaller than you remember.',
      'she reaches for your hand.',
      'you let her take it.',
    ],
    marginDoodles: 'door',
  },
];

// ─── LEVEL GEOMETRY ────────────────────────────────────────────────
// Starter scaffolds — design real levels in the editor and export

const chapter1Level = [
  startFlag(60, 350),
  platform(0, 360, 200),
  stamp('flower', 200, 330, 25),
  platform(220, 310, 100),
  stamp('flower', 370, 280, 25),
  platform(350, 290, 120),
  platform(500, 320, 140),
  stamp('flower', 600, 290, 25),
  platform(660, 300, 120),
  finishFlag(740, 300),
];

const chapter2Level = [
  startFlag(60, 350),
  platform(0, 360, 150),
  stamp('cloud', 250, 290, 50),
  stamp('cloud', 420, 250, 50),
  platform(560, 300, 100),
  stamp('cloud', 700, 260, 50),
  platform(820, 290, 120),
  finishFlag(880, 290),
];

const chapter3Level = [
  startFlag(60, 350),
  platform(0, 360, 120),
  platform(180, 310, 80),
  stamp('vine', 320, 280, 60),
  platform(320, 210, 100),
  platform(460, 270, 80),
  stamp('vine', 580, 250, 60),
  platform(580, 180, 100),
  platform(720, 250, 120),
  finishFlag(800, 250),
];

const chapter4Level = [
  startFlag(60, 350),
  platform(0, 360, 100),
  stamp('wave', 180, 350, 40),
  platform(260, 320, 80),
  stamp('wave', 380, 350, 40),
  platform(440, 280, 80),
  stamp('sparkle', 480, 250, 30),
  platform(580, 310, 100),
  stamp('wave', 720, 350, 40),
  platform(780, 280, 100),
  finishFlag(840, 280),
];

const chapter5Level = [
  startFlag(60, 350),
  platform(0, 360, 120),
  stamp('mushroom', 200, 320, 35),
  platform(280, 280, 100),
  stamp('flower', 340, 250, 25),
  platform(420, 310, 80),
  stamp('mushroom', 540, 280, 35),
  platform(600, 250, 120),
  stamp('sparkle', 660, 220, 30),
  finishFlag(700, 250),
];

const chapter6Level = [
  startFlag(60, 350),
  platform(0, 360, 120),
  stamp('ladybug', 200, 330, 30),
  platform(250, 310, 80),
  stamp('ladybug', 380, 290, 30),
  platform(420, 280, 80),
  stamp('butterfly', 540, 240, 35),
  platform(580, 300, 80),
  stamp('ladybug', 680, 280, 30),
  platform(720, 270, 120),
  finishFlag(800, 270),
];

const chapter7Level = [
  startFlag(60, 350),
  platform(0, 360, 100),
  stamp('smoke', 180, 310, 50),
  stamp('smoke', 320, 270, 50),
  platform(440, 300, 60),
  stamp('smoke', 540, 260, 50),
  stamp('butterfly', 640, 220, 35),
  platform(700, 280, 80),
  stamp('smoke', 800, 250, 50),
  platform(880, 290, 100),
  finishFlag(940, 290),
];

const chapter8Level = [
  startFlag(60, 350),
  platform(0, 360, 100),
  stamp('sparkle', 160, 320, 30),
  platform(200, 300, 60),
  stamp('butterfly', 320, 260, 35),
  stamp('butterfly', 400, 230, 35),
  platform(460, 280, 60),
  stamp('sparkle', 520, 250, 30),
  platform(580, 260, 80),
  stamp('bow', 660, 230, 30),
  platform(720, 280, 100),
  finishFlag(780, 280),
];

const chapter9Level = [
  startFlag(60, 350),
  platform(0, 360, 80),
  stamp('butterfly', 160, 300, 35),
  platform(220, 310, 60),
  stamp('wave', 330, 340, 40),
  stamp('mushroom', 400, 290, 35),
  platform(460, 260, 60),
  stamp('butterfly', 540, 220, 35),
  stamp('vine', 620, 260, 60),
  platform(620, 190, 80),
  stamp('wave', 740, 340, 40),
  platform(800, 280, 100),
  finishFlag(860, 280),
];

const chapter10Level = [
  startFlag(60, 350),
  platform(0, 360, 80),
  stamp('flower', 150, 330, 25),
  stamp('mushroom', 240, 310, 35),
  stamp('cloud', 360, 260, 50),
  stamp('vine', 480, 260, 60),
  platform(480, 190, 60),
  stamp('rainbow', 580, 230, 50),
  stamp('sparkle', 700, 200, 30),
  stamp('bow', 780, 240, 30),
  platform(820, 260, 120),
  stamp('flower', 880, 230, 25),
  finishFlag(920, 260),
];

export const levels = [
  chapter1Level, chapter2Level, chapter3Level, chapter4Level, chapter5Level,
  chapter6Level, chapter7Level, chapter8Level, chapter9Level, chapter10Level,
];

export function getLevel(chapterIndex) {
  return levels[chapterIndex] || null;
}

export function getChapter(chapterIndex) {
  return chapters[chapterIndex] || null;
}

export function exportCurrentLevel() {
  try {
    const saved = localStorage.getItem('risopaint-state');
    if (!saved) return null;
    const data = JSON.parse(saved);
    const scene = data.scenes?.[data.currentSceneIndex];
    if (!scene) return null;
    const json = JSON.stringify(scene.strokes, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json);
      console.log('Level JSON copied to clipboard! Paste it into levels.js.');
    }
    console.log(json);
    return scene.strokes;
  } catch (e) {
    console.error('Failed to export level:', e);
    return null;
  }
}
