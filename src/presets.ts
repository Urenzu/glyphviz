export type Preset = {
  name: string;
  glyphs: string[];
  palette: [number, number, number][];
  scale: number;
  drift: number;
  bandCount: number;
  jitter: number;
  seed?: number;
};

export const presets: Preset[] = [
  {
    name: 'Traxus_og',
    glyphs: ['.', '+', 'x', '✚', '✖', '◉', '◎', '⊕', '⊗'],
    palette: [
      [18, 18, 18], // near-black
      [46, 50, 55], // dark steel
      [86, 90, 95], // mid gray
      [190, 195, 200], // light gray
      [255, 255, 255], // white
      [255, 132, 24], // caution amber
      [255, 170, 80] // warm accent
    ],
    bandCount: 8,
    scale: 0.045,
    drift: 0.16,
    jitter: 0.32,
    seed: 707
  },
  {
    name: 'Traxus_Alt',
    glyphs: ['▌', '▐', '─', '═', '╫', '╬', '+', 'x', '✖'],
    palette: [
      [10, 10, 10],    // deep black steel
      [32, 35, 40],    // dark gunmetal
      [78, 82, 90],    // mid steel
      [182, 188, 196], // light machinery gray
      [255, 255, 255], // white stencil
      [255, 112, 24],  // Traxus orange (logo bar, brighter)
      [255, 170, 80]   // warm warning accent
    ],
    bandCount: 9,
    scale: 0.04,
    drift: 0.14,
    jitter: 0.28,
    seed: 1707
  },
  {
    name: 'CyberAcme',
    glyphs: ['_', '-', '/', '\\', '|', '#', '%', '≡', '∑'],
    palette: [
      [5, 5, 7],        // near-black background
      [24, 26, 32],     // dark console gray
      [46, 50, 55],     // UI frame gray
      [0, 255, 80],     // primary CyAc neon green
      [120, 255, 160],  // softer matrix green
      [200, 255, 210],  // pale terminal glow
      [255, 255, 255]   // white highlights
    ],
    bandCount: 10,
    scale: 0.038,
    drift: 0.10,
    jitter: 0.18,
    seed: 314
  },
  {
    name: 'Sekiguchi Genetics',
    glyphs: ['.', '•', '○', '◍', '✱', '✶', '✿', '∞', '⚕'], 
    // More soft, biological shapes
    palette: [
      [8, 8, 10],        // deep lab shadow
      [34, 38, 42],      // equipment gray
      [140, 150, 145],   // muted clinical gray
      [215, 230, 220],   // soft sterile off-white
      [188, 255, 220],   // pastel mint highlight
      [170, 255, 210],   // slightly stronger mint
      [150, 240, 195]    // base mint (closest to your image)
    ],
    bandCount: 7,
    scale: 0.048,
    drift: 0.22,
    jitter: 0.26,
    seed: 625
  },
  {
    name: 'MIDA',
    glyphs: ['!', '/', '\\', '|', '▲', '◆', '✖', '✺', '★'],
    palette: [
      [8, 8, 10],       // near-black underground
      [36, 18, 24],     // very dark wine red
      [160, 0, 24],     // deep blood-red
      [255, 13, 26],    // hot propaganda red (#ff0d1a)
      [217, 123, 43],   // Martian ochre / rust
      [216, 184, 88],   // faded revolutionary gold
      [244, 244, 244]   // slogan white
    ],
    bandCount: 11,
    scale: 0.035,
    drift: 0.22,
    jitter: 0.45,       // loud, chaotic
    seed: 1917
  },
  {
    name: 'NuCaloric',
    glyphs: ['✿', '✦', '✧', '+', '~', '▢', '◼', '✚', '✳'],
    // floral + geometric: fits agriculture + synthetic biotech tone
    palette: [
      [0, 0, 0],         // icon black
      [255, 255, 255],   // text white
      [255, 0, 122],     // primary neon pink (#FF007A)
      [255, 20, 140],    // brighter magenta accent (#FF148C)
      [200, 0, 100],     // deep magenta shadow (#C80064)
      [255, 90, 170],    // soft highlight pink
      [255, 150, 200]    // pastel blend for gradients
    ],
    bandCount: 8,
    scale: 0.044,
    drift: 0.18,
    jitter: 0.26,
    seed: 904
  },
  {
    name: 'Purple Web',
    glyphs: ['.', 'x', 'X', '#', '*', '╳', '╂', '╫', '₪'],
    palette: [
      [3, 3, 5],        // pure black net
      [20, 18, 30],     // dim background
      [150, 0, 255],    // primary neon purple sigil
      [200, 120, 255],  // lighter web highlight
      [90, 0, 160],     // deep violet core
      [41, 50, 79],     // cold blue node
      [240, 240, 255]   // ghostly white accent
    ],
    bandCount: 150,
    scale: 0.03,
    drift: 0.30,
    jitter: 0.52,       // glitchy, tangled
    seed: 808
  },
  {
    name: 'UESC Marathon',
    glyphs: ['.', ':', '+', '–', '=', '◯', '⊖', '✦', '✧'],
    palette: [
      [8, 10, 16],       // deep space
      [0, 45, 96],       // dark navy hull
      [0, 93, 170],      // Marathon blue (#005DAA)
      [237, 23, 79],     // Marathon crimson (#ED174F)
      [200, 210, 225],   // desaturated ship gray
      [245, 248, 252],   // hull highlight
      [255, 255, 255]    // stars / UI white
    ],
    bandCount: 9,
    scale: 0.04,
    drift: 0.18,
    jitter: 0.22,
    seed: 2773
  },
  {
    name: 'Arachne',
    glyphs: ['x', 'X', '#', '╳', '╬', '╂', '✦', '✧', '₪'],
    // angular, web-like, cross-hatching glyphs
    palette: [
      [0, 0, 0],          // deep black (primary contrast)
      [18, 18, 20],       // very dark charcoal
      [95, 0, 10],        // deep blood-maroon shadow
      [160, 0, 20],       // mid red (structural elements)
      [200, 0, 30],       // bright aggressive red
      [255, 25, 45],      // hyper-crimson highlight
      [255, 255, 255]     // white for nodes / glints
    ],
    bandCount: 12,
    scale: 0.034,
    drift: 0.28,
    jitter: 0.46,
    seed: 888
  },
  {
    name: 'testing1',
    glyphs: [
    'x', 'X', '#', '╳', '╬', '╂', 
    '✦', '✧', '⋆', '⋇' // starbursts = outward motion
    ],
    palette: [
      [0, 0, 0],          // abyss-black base
      [20, 0, 30],        // dark violet shadow
      [100, 0, 150],      // deep neon purple
      [180, 0, 255],      // bright electric purple
      [255, 0, 160],      // hot neon magenta
      [255, 25, 230],     // hyper-pink highlight
      [255, 255, 255]     // white spikes / shine nodes
    ],
    bandCount: 1000,        // dense, web-like texture
    scale: 0.030,         // small cell size for fine strands
    drift: 0.42,          // aggressive lateral warping
    jitter: 0.68,         // extreme chaos / noise
    seed: 9901
  },
  {
    name: 'JP_RisingSun',
    glyphs: ['日', '本', '丶', '々', '※', '＊', '✦', '✧', '╋'],
    palette: [
      [255, 255, 255],  // white
      [235, 235, 235],  // soft white
      [200, 0, 0],      // deep red
      [255, 30, 30],    // bright red
      [0, 0, 0],        // black ink
      [120, 0, 0],      // maroon shadow
      [255, 120, 120]   // light red highlight
    ],
    bandCount: 10,
    scale: 0.038,
    drift: 0.30,
    jitter: 0.40,
    seed: 1122
  },
  {
    name: 'KR_Taegeuk',
    glyphs: ['ㅎ', 'ㅇ', 'ㅅ', 'ㅁ', '▦', '▩', '៙', '☯', '◈'],
    palette: [
      [255, 255, 255],  // white background
      [0, 0, 0],        // trigram black
      [200, 0, 30],     // red (flag crimson)
      [255, 50, 75],    // bright red
      [0, 40, 160],     // deep blue
      [0, 90, 255],     // neon blue highlight
      [255, 200, 200]   // soft red blending tone
    ],
    bandCount: 12,
    scale: 0.033,
    drift: 0.45,        // swirling dual motion
    jitter: 0.52,       // chaotic interplay of red/blue
    seed: 2024
  },
  {
  name: 'CN_ImperialBurst',
  glyphs: ['中', '国', '星', '＊', '✦', '卍', '丨', '丶', '※'],
  palette: [
    [0, 0, 0],          // black depth
    [160, 0, 0],        // deep red
    [200, 0, 0],        // mid red
    [255, 0, 0],        // bright flag red
    [255, 215, 0],      // gold (flag star)
    [255, 245, 140],    // pale gold
    [255, 255, 255]     // white highlight
  ],
  bandCount: 11,
  scale: 0.036,
  drift: 0.38,         // strong outward force
  jitter: 0.48,        // chaotic explosive edges
  seed: 8888
  }
];
