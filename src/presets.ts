export type Preset = {
  name: string;
  glyphs: string[];
  palette: [number, number, number][];
  scale: number;
  drift: number;
  bandCount: number;
  jitter: number;
  seed?: number;
  style?:
    | 'perlin'
    | 'ridged'
    | 'stripe'
    | 'worley'
    | 'curl'
    | 'cyber'
    | 'voronoi'
    | 'brick'
    | 'step'
    | 'glitch'
    | 'height'
    | 'perspective'
    | 'flight'
    | 'tunnel'
    | 'kaleido'
    | 'flow'
    | 'orbital'
    | 'cellular'
    | 'hearts'
    | 'anomaly';
  secondaryScale?: number;
  quantizeSteps?: number;
  snapStrength?: number;
  anisotropy?: number;
  spikeChance?: number;
  spikeIntensity?: number;
  driftWaveAmp?: number;
  driftWaveFreq?: number;
  waveAmp?: number;
  alphaBase?: number;
  alphaGain?: number;
  warpStrength?: number;
  warpFrequency?: number;
  trailStrength?: number;
  dualLayerStrength?: number;
  axisBlend?: number;
  dynamicGlyphMix?: number;
  chromaticAberration?: number;
  radialBloom?: number;
  blurAmount?: number;
  sharpenAmount?: number;
  colorTwist?: number;
  embossStrength?: number;
  rippleDistortion?: number;
  layerBlend?: number;
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
    bandCount: 1000,
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
  },
  {
    name: 'PETSCII_Grid',
    glyphs: ['░', '▒', '▓', '█', '╱', '╲', '╳', '┼', '┤', '├', '┴', '┬'],
    palette: [
      [8, 10, 16],     // deep navy
      [24, 28, 40],    // console blue
      [54, 90, 140],   // mid blue
      [96, 140, 200],  // sky blue
      [160, 205, 255], // pale cyan
      [230, 240, 255], // highlight
      [255, 255, 255]  // white
    ],
    bandCount: 16,
    scale: 0.033,
    drift: 0.26,
    jitter: 0.32,
    seed: 1982
  },
  {
    name: 'PETSCII_Noir',
    glyphs: ['·', '░', '▒', '▓', '█', '#', '╱', '╲', '╳', '◆', '◈', '✣'],
    palette: [
      [5, 5, 5],        // deep black
      [28, 28, 32],     // charcoal
      [70, 70, 78],     // mid gray
      [130, 130, 135],  // slate
      [210, 210, 210],  // soft light
      [255, 180, 90],   // warm tungsten
      [255, 240, 200]   // warm highlight
    ],
    bandCount: 14,
    scale: 0.036,
    drift: 0.18,
    jitter: 0.22,
    seed: 1977
  },
  {
    name: 'CP437_Rogue',
    glyphs: ['.', ':', '+', '=', '*', '%', '#', '@', '░', '▒', '▓', '█'],
    palette: [
      [6, 8, 6],        // dark terminal
      [16, 40, 12],     // deep green
      [24, 80, 32],     // matrix mid
      [80, 180, 90],    // vivid green
      [160, 240, 170],  // pale green
      [255, 255, 200],  // parchment
      [255, 255, 255]   // bright white
    ],
    bandCount: 12,
    scale: 0.04,
    drift: 0.20,
    jitter: 0.28,
    seed: 1337
  },
  {
    name: 'Accel_Industrial',
    glyphs: ['▞', '▚', '▜', '▛', '╳', '╬', '▦', '▧', '▨', '☢', '☣', '⚙'],
    palette: [
      [4, 6, 8],      // near-black steel
      [18, 22, 28],   // deep gunmetal
      [38, 44, 52],   // mid gunmetal
      [120, 140, 150],// anodized metal
      [255, 180, 40], // hazard amber
      [255, 120, 30], // hot warning orange
      [220, 240, 255] // cold LED blue-white
    ],
    bandCount: 14,
    scale: 0.032,
    drift: 0.24,
    driftWaveAmp: 0.18,   // slow thrust pulsing
    driftWaveFreq: 0.5,
    jitter: 0.34,
    waveAmp: 0.11,        // pronounced bob
    alphaBase: 0.64,      // darker base
    alphaGain: 0.32,      // brighter highlights
    warpStrength: 0.015,  // light radial twist
    warpFrequency: 0.22,
    seed: 4242
  },
  {
    name: 'Curl_Turbine',
    glyphs: ['·', '∙', '•', '◦', '○', '◍', '◎', '◉', '⊚', '⊛', '✦'],
    palette: [
      [4, 6, 10],    // dark chassis
      [24, 28, 36],  // gunmetal
      [48, 56, 70],  // machinery shadow
      [120, 200, 255], // turbine blue
      [200, 240, 255], // highlight blue
      [255, 160, 60],  // hazard amber
      [255, 240, 200]  // warm glint
    ],
    bandCount: 12,
    scale: 0.03,
    secondaryScale: 0.05,
    drift: 0.28,
    driftWaveAmp: 0.16,
    driftWaveFreq: 0.7,
    jitter: 0.26,
    waveAmp: 0.09,
    alphaBase: 0.68,
    alphaGain: 0.30,
    warpStrength: 0.012,
    warpFrequency: 0.18,
    style: 'curl',
    seed: 5521
  },
  {
    name: 'Worley_Forge',
    glyphs: ['▖', '▘', '▝', '▗', '▞', '▚', '▛', '▜', '▙', '▟', '█'],
    palette: [
      [6, 4, 4],     // dark iron
      [20, 12, 8],   // ember shadow
      [80, 40, 20],  // heated metal
      [160, 80, 40], // forge orange
      [255, 120, 40],// molten edge
      [255, 200, 140],// hot highlight
      [255, 240, 220]// white hot
    ],
    bandCount: 16,
    scale: 0.028,
    secondaryScale: 0.12,
    drift: 0.18,
    driftWaveAmp: 0.08,
    driftWaveFreq: 0.5,
    jitter: 0.22,
    waveAmp: 0.06,
    alphaBase: 0.62,
    alphaGain: 0.35,
    warpStrength: 0.006,
    warpFrequency: 0.3,
    style: 'worley',
    seed: 777
  },
  {
    name: 'Stripe_Radar',
    glyphs: ['.', ':', '-', '_', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'],
    palette: [
      [0, 4, 8],      // night
      [12, 18, 26],   // radar bezel
      [32, 52, 80],   // deep blue
      [0, 200, 120],  // radar green
      [120, 255, 200],// glow green
      [255, 255, 255],// highlight
      [255, 120, 80]  // alert
    ],
    bandCount: 18,
    scale: 0.022,
    secondaryScale: 0.04,
    drift: 0.34,
    driftWaveAmp: 0.12,
    driftWaveFreq: 0.9,
    jitter: 0.18,
    waveAmp: 0.04,
    alphaBase: 0.58,
    alphaGain: 0.36,
    warpStrength: 0,
    warpFrequency: 0.25,
    style: 'stripe',
    quantizeSteps: 0,
    seed: 616
  },
  {
    name: 'Voronoi_Web',
    glyphs: ['╱', '╲', '╳', '┼', '▞', '▚', '▛', '▜', '✦', '✧', '◈', '⋇'],
    palette: [
      [2, 2, 4],     // deep void
      [18, 18, 26],  // cold charcoal
      [60, 60, 80],  // steel blue
      [0, 180, 255], // neon cyan
      [140, 220, 255],// pale cyan
      [255, 140, 60], // hazard orange
      [255, 255, 255] // white
    ],
    bandCount: 15,
    scale: 0.026,
    secondaryScale: 0.08,
    drift: 0.22,
    driftWaveAmp: 0.1,
    driftWaveFreq: 0.8,
    jitter: 0.28,
    waveAmp: 0.07,
    alphaBase: 0.6,
    alphaGain: 0.34,
    warpStrength: 0.008,
    warpFrequency: 0.2,
    style: 'voronoi',
    seed: 424242
  },
  {
    name: 'Brick_Scan',
    glyphs: ['█', '▓', '▒', '░', '─', '═', '▌', '▐', '╳', '│', '┼', '╫'],
    palette: [
      [4, 6, 6],     // dark stone
      [14, 18, 18],  // smoke
      [42, 50, 52],  // slate
      [120, 140, 140],// patina
      [200, 210, 210],// light wash
      [255, 220, 80], // signal amber
      [255, 255, 255] // specular
    ],
    bandCount: 100,
    scale: 0.080,
    secondaryScale: 0.10,
    snapStrength: 0.7,
    drift: 0.7,
    driftWaveAmp: 0.50,
    driftWaveFreq: 1,
    jitter: 0.16,
    waveAmp: 0.20,
    alphaBase: 0.65,
    alphaGain: 0.3,
    warpStrength: 0.0,
    warpFrequency: 0.25,
    style: 'brick',
    quantizeSteps: 50,
    seed: 1717
  },
  {
    name: 'Glitch_Runner',
    glyphs: ['╱', '╲', '◢', '◣', '◤', '◥', '╳', '┼', '▚', '▞', '✦', '✧'],
    palette: [
      [0, 0, 0],       // void
      [24, 12, 48],    // dark violet
      [40, 12, 80],    // purple core
      [0, 240, 200],   // neon teal
      [255, 0, 140],   // neon magenta
      [255, 220, 120], // glitch gold
      [255, 255, 255]  // white flash
    ],
    bandCount: 16,
    scale: 0.024,
    secondaryScale: 0.06,
    drift: 0.38,
    driftWaveAmp: 0.22,
    driftWaveFreq: 1.4,
    jitter: 0.36,
    waveAmp: 0.08,
    alphaBase: 0.58,
    alphaGain: 0.36,
    warpStrength: 0.012,
    warpFrequency: 0.26,
    style: 'glitch',
    quantizeSteps: 5,
    spikeChance: 0.08,
    spikeIntensity: 0.6,
    seed: 31337
  },
  {
    name: 'Curl_Turbine',
    glyphs: ['·', '∙', '•', '◦', '○', '◍', '◎', '◉', '⊚', '⊛', '✦'],
    palette: [
      [4, 6, 10],    // dark chassis
      [24, 28, 36],  // gunmetal
      [48, 56, 70],  // machinery shadow
      [120, 200, 255], // turbine blue
      [200, 240, 255], // highlight blue
      [255, 160, 60],  // hazard amber
      [255, 240, 200]  // warm glint
    ],
    bandCount: 12,
    scale: 0.03,
    secondaryScale: 0.05,
    drift: 0.28,
    driftWaveAmp: 0.16,
    driftWaveFreq: 0.7,
    jitter: 0.26,
    waveAmp: 0.09,
    alphaBase: 0.68,
    alphaGain: 0.30,
    warpStrength: 0.012,
    warpFrequency: 0.18,
    style: 'curl',
    seed: 5521
  },
  {
    name: 'Worley_Forge',
    glyphs: ['▖', '▘', '▝', '▗', '▞', '▚', '▛', '▜', '▙', '▟', '█'],
    palette: [
      [6, 4, 4],     // dark iron
      [20, 12, 8],   // ember shadow
      [80, 40, 20],  // heated metal
      [160, 80, 40], // forge orange
      [255, 120, 40],// molten edge
      [255, 200, 140],// hot highlight
      [255, 240, 220]// white hot
    ],
    bandCount: 16,
    scale: 0.028,
    secondaryScale: 0.12,
    drift: 0.18,
    driftWaveAmp: 0.08,
    driftWaveFreq: 0.5,
    jitter: 0.22,
    waveAmp: 0.06,
    alphaBase: 0.62,
    alphaGain: 0.35,
    warpStrength: 0.006,
    warpFrequency: 0.3,
    style: 'worley',
    seed: 777
  },
  {
    name: 'Stripe_Radar',
    glyphs: ['.', ':', '-', '_', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'],
    palette: [
      [0, 4, 8],      // night
      [12, 18, 26],   // radar bezel
      [32, 52, 80],   // deep blue
      [0, 200, 120],  // radar green
      [120, 255, 200],// glow green
      [255, 255, 255],// highlight
      [255, 120, 80]  // alert
    ],
    bandCount: 18,
    scale: 0.022,
    secondaryScale: 0.04,
    drift: 0.34,
    driftWaveAmp: 0.12,
    driftWaveFreq: 0.9,
    jitter: 0.18,
    waveAmp: 0.04,
    alphaBase: 0.58,
    alphaGain: 0.36,
    warpStrength: 0,
    warpFrequency: 0.25,
    style: 'stripe',
    seed: 616
  },
  {
    name: 'Cyber_Shard',
    glyphs: ['╱', '╲', '◢', '◣', '◤', '◥', '╳', '┼', '▚', '▞', '✦', '✧'],
    palette: [
      [2, 2, 4],      // deep void
      [12, 10, 24],   // midnight purple
      [30, 20, 60],   // core purple
      [0, 220, 255],  // neon cyan
      [120, 0, 255],  // neon violet
      [255, 80, 180], // magenta accent
      [240, 240, 255] // icy white
    ],
    bandCount: 15,
    scale: 0.026,
    secondaryScale: 0.06,
    drift: 0.30,
    driftWaveAmp: 0.22,
    driftWaveFreq: 1.1,
    jitter: 0.3,
    waveAmp: 0.1,
    alphaBase: 0.6,
    alphaGain: 0.34,
    warpStrength: 0.01,
    warpFrequency: 0.24,
    style: 'cyber',
    seed: 9090
  },
  {
    name: 'Exile',
    glyphs: ['日', '本', '丶', '々', '※', '＊', '✦', '✧', '╋'],
    palette: [
      [90, 0, 255],    // vivid corporate violet
      [140, 0, 255],   // bright electric purple
      [200, 80, 255],  // neon lavender glow
      [255, 120, 255], // hyper bright magenta-violet
      [60, 0, 140],    // deep brand violet
      [255, 255, 255], // crisp white for contrast
    ],
    bandCount: 15,
    scale: 0.026,
    secondaryScale: 0.06,
    drift: 0.30,
    driftWaveAmp: 0.22,
    driftWaveFreq: 1.1,
    jitter: 0.6,
    waveAmp: 0.1,
    alphaBase: 0.6,
    alphaGain: 0.34,
    warpStrength: 0.20,
    warpFrequency: 0.24,
    style: 'cyber',
    seed: 9090
  },
  {
    name: 'Height_Horizon',
    glyphs: ['.', '∙', '•', '○', '◍', '◎', '◉', '⊕', '⊗', '▣', '▦', '█'],
    palette: [
      [4, 4, 6],      // night base
      [14, 16, 20],   // dark blue
      [40, 46, 60],   // mid steel
      [90, 120, 170], // distant haze
      [160, 200, 240],// sky light
      [255, 200, 120],// sun edge
      [255, 255, 240] // highlight
    ],
    bandCount: 18,
    scale: 0.028,
    secondaryScale: 0.06,
    drift: 0.22,
    driftWaveAmp: 0.08,
    driftWaveFreq: 0.6,
    jitter: 0.18,
    waveAmp: 0.05,
    alphaBase: 0.64,
    alphaGain: 0.34,
    warpStrength: 0.006,
    warpFrequency: 0.14,
    style: 'height',
    spikeChance: 0.02,
    spikeIntensity: 0.25,
    seed: 5151
  },
  {
    name: 'Perspective_Sprawl',
    glyphs: ['▗', '▖', '▝', '▘', '▚', '▞', '▛', '▜', '▙', '▟', '█', '▧', '▨'],
    palette: [
      [2, 2, 6],       // deep void
      [16, 16, 22],    // asphalt
      [40, 48, 60],    // concrete
      [90, 100, 120],  // steel
      [180, 200, 220], // haze
      [0, 210, 255],   // neon cyan
      [255, 120, 60]   // signal orange
    ],
    bandCount: 20,
    scale: 0.024,
    secondaryScale: 0.05,
    drift: 0.3,
    driftWaveAmp: 0.12,
    driftWaveFreq: 0.9,
    jitter: 0.24,
    waveAmp: 0.06,
    alphaBase: 0.6,
    alphaGain: 0.36,
    warpStrength: 0.008,
    warpFrequency: 0.18,
    style: 'flight',
    snapStrength: 0,
    quantizeSteps: 0,
    spikeChance: 0.04,
    spikeIntensity: 0.3,
    seed: 8484
  },
  {
    name: 'Flight_BloodMoon',
    glyphs: ['夢','影','零','雷','刃','剣','鬼','龍','桜','雪','狐','夜','術'],
    palette: [
      [4, 0, 2],
      [16, 0, 6],
      [70, 0, 14],
      [140, 10, 20],
      [220, 60, 60],
      [255, 200, 180],
      [255, 255, 255]
    ],
    bandCount: 18,
    scale: 0.025,
    secondaryScale: 0.05,
    drift: 0.36,
    driftWaveAmp: 0.18,
    driftWaveFreq: 0.9,
    jitter: 0.22,
    waveAmp: 0.08,
    alphaBase: 0.6,
    alphaGain: 0.36,
    warpStrength: 0.012,
    warpFrequency: 0.18,
    style: 'flight',
    spikeChance: 0.03,
    spikeIntensity: 0.35,
    seed: 20205
  },
  {
    name: 'Mono_Blast',
    glyphs: ['.', ':', '-', '+', '#', '░', '▒', '▓', '█'],
    palette: [
      [0, 0, 0],
      [40, 40, 40],
      [180, 180, 180],
      [255, 255, 255]
    ],
    bandCount: 24,
    scale: 0.022,
    secondaryScale: 0.04,
    drift: 0.28,
    driftWaveAmp: 0.1,
    driftWaveFreq: 0.8,
    jitter: 0.12,
    waveAmp: 0.03,
    alphaBase: 0.62,
    alphaGain: 0.34,
    warpStrength: 0,
    warpFrequency: 0,
    style: 'step',
    quantizeSteps: 6,
    spikeChance: 0.01,
    spikeIntensity: 0.2,
    seed: 1111
  },
  {
    name: 'Braille_Spectrum',
    glyphs: ['⠁','⠃','⠇','⠏','⠟','⠿','⡿','⣿'],
    palette: [
      [255, 0, 80],
      [255, 120, 0],
      [255, 200, 0],
      [0, 220, 100],
      [0, 180, 255],
      [120, 0, 255],
      [255, 255, 255]
    ],
    bandCount: 14,
    scale: 0.024,
    secondaryScale: 0.05,
    drift: 0.32,
    driftWaveAmp: 0.14,
    driftWaveFreq: 1.1,
    jitter: 0.2,
    waveAmp: 0.07,
    alphaBase: 0.6,
    alphaGain: 0.36,
    warpStrength: 0.006,
    warpFrequency: 0.2,
    style: 'stripe',
    spikeChance: 0.02,
    spikeIntensity: 0.4,
    seed: 7777
  },
  {
    name: 'Arrow_Jet',
    glyphs: ['←', '↑', '→', '↓', '↖', '↗', '↘', '↙', '⇤', '⇥'],
    palette: [
      [0, 6, 10],
      [12, 18, 28],
      [0, 200, 120],
      [120, 255, 200],
      [255, 180, 40],
      [255, 255, 255]
    ],
    bandCount: 16,
    scale: 0.02,
    secondaryScale: 0.04,
    drift: 0.48,
    driftWaveAmp: 0.18,
    driftWaveFreq: 1.4,
    jitter: 0.2,
    waveAmp: 0.05,
    alphaBase: 0.58,
    alphaGain: 0.36,
    warpStrength: 0.004,
    warpFrequency: 0.16,
    style: 'stripe',
    spikeChance: 0.03,
    spikeIntensity: 0.45,
    seed: 9091
  },
  {
    name: 'Neon_Ouroboros',
    glyphs: ['╱','╲','◢','◣','◤','◥','◎','◉','○','●','✦','✧'],
    palette: [
      [4, 6, 10],
      [12, 20, 36],
      [0, 220, 190],
      [120, 0, 255],
      [255, 80, 180],
      [255, 255, 255]
    ],
    bandCount: 15,
    scale: 0.026,
    secondaryScale: 0.06,
    drift: 0.3,
    driftWaveAmp: 0.16,
    driftWaveFreq: 1,
    jitter: 0.34,
    waveAmp: 0.09,
    alphaBase: 0.6,
    alphaGain: 0.34,
    warpStrength: 0.012,
    warpFrequency: 0.22,
    style: 'curl',
    spikeChance: 0.02,
    spikeIntensity: 0.4,
    seed: 6060
  },
  {
    name: 'Prism_Vortex',
    glyphs: ['.', '⌁', '⌇', '✶', '✸', '✺', '✽', '✦', '✧', '⋆', '⋇'],
    palette: [
      [0, 0, 0],
      [0, 120, 255],
      [120, 0, 255],
      [255, 0, 140],
      [255, 160, 0],
      [255, 240, 120],
      [255, 255, 255]
    ],
    bandCount: 18,
    scale: 0.024,
    secondaryScale: 0.05,
    drift: 0.42,
    driftWaveAmp: 0.2,
    driftWaveFreq: 1.3,
    jitter: 0.36,
    waveAmp: 0.08,
    alphaBase: 0.58,
    alphaGain: 0.38,
    warpStrength: 0.014,
    warpFrequency: 0.26,
    style: 'glitch',
    quantizeSteps: 4,
    spikeChance: 0.05,
    spikeIntensity: 0.6,
    seed: 5050
  },
  {
    name: 'Obsidian_Temple',
    glyphs: ['▖', '▘', '▝', '▗', '▞', '▚', '▛', '▜', '▙', '▟', '█', '╳'],
    palette: [
      [2, 2, 2],
      [16, 12, 8],
      [38, 32, 26],
      [120, 90, 40],
      [200, 150, 70],
      [255, 230, 180],
      [255, 255, 255]
    ],
    bandCount: 16,
    scale: 0.03,
    secondaryScale: 0.08,
    drift: 0.18,
    driftWaveAmp: 0.06,
    driftWaveFreq: 0.8,
    jitter: 0.18,
    waveAmp: 0.05,
    alphaBase: 0.64,
    alphaGain: 0.32,
    warpStrength: 0.008,
    warpFrequency: 0.18,
    style: 'voronoi',
    spikeChance: 0.015,
    spikeIntensity: 0.3,
    seed: 42424
  },
  {
    name: 'Love',
    glyphs: ['♥', '♡', '◆', '◇', '✶', '✸', '✺', '✽', 'A', 'l', 'i', 's', 'o', 'n'],
    palette: [
      [10, 2, 8],     // deep velvet
      [40, 6, 30],    // dark magenta shadow
      [120, 20, 90],  // mid pink
      [200, 60, 150], // bright neon pink
      [255, 120, 190],// hot pink highlight
      [255, 190, 220],// blush
      [255, 240, 250] // soft white
    ],
    bandCount: 16,
    scale: 0.026,
    secondaryScale: 0.05,
    drift: 0.32,
    driftWaveAmp: 0.16,
    driftWaveFreq: 1.1,
    jitter: 0.26,
    waveAmp: 0.08,
    alphaBase: 0.62,
    alphaGain: 0.34,
    warpStrength: 0.01,
    warpFrequency: 0.18,
    style: 'curl',
    quantizeSteps: 0,
    spikeChance: 0.02,
    spikeIntensity: 0.35,
    seed: 1414
  },
  {
    name: 'Love2',
    glyphs: ['A','l','l','i','s','o','n','♥','♡','✺','✽'],
    palette: [
      [8, 4, 10],     // deep plum
      [32, 12, 40],   // dark berry
      [90, 20, 120],  // mid violet
      [170, 40, 170], // neon purple-pink
      [240, 80, 180], // hot pink
      [255, 170, 210],// blush highlight
      [255, 235, 245] // soft white
    ],
    bandCount: 120,
    scale: 0.024,
    secondaryScale: 0.05,
    drift: 0.3,
    driftWaveAmp: 0.18,
    driftWaveFreq: 1.0,
    jitter: 0.2,
    waveAmp: 0.06,
    alphaBase: 0.64,
    alphaGain: 0.32,
    warpStrength: 0.008,
    warpFrequency: 0.16,
    style: 'flight',
    quantizeSteps: 0,
    spikeChance: 0.04,
    spikeIntensity: 0.4,
    seed: 2424
  },
  {
    name: 'Love3',
    glyphs: ['♥', '♡', '❤', '❥', '✺', '✿', 'A', 'l', 'l', 'i', 's', 'o', 'n'],
    palette: [
      [12, 2, 14],     // midnight rose
      [60, 6, 48],     // deep magenta
      [140, 20, 110],  // lush pink
      [210, 60, 160],  // neon orchid
      [255, 110, 190], // candy highlight
      [255, 170, 210], // blush glow
      [255, 235, 245]  // alabaster shimmer
    ],
    bandCount: 34,
    scale: 0.028,
    secondaryScale: 0.07,
    drift: 0.34,
    driftWaveAmp: 0.22,
    driftWaveFreq: 1.25,
    jitter: 0.24,
    waveAmp: 0.12,
    alphaBase: 0.66,
    alphaGain: 0.38,
    warpStrength: 0.015,
    warpFrequency: 0.2,
    trailStrength: 0.22,
    dualLayerStrength: 0.6,
    axisBlend: 0.35,
    dynamicGlyphMix: 0.4,
    style: 'hearts',
    spikeChance: 0.03,
    spikeIntensity: 0.45,
    seed: 2611
  },
  {
    name: 'Singularity_Rift',
    glyphs: ['╱','╲','◢','◣','◤','◥','◎','◉','⊛','✦','✧','⋆'],
    palette: [
      [0, 0, 4],
      [8, 8, 24],
      [40, 0, 80],
      [0, 180, 255],
      [140, 0, 255],
      [255, 80, 200],
      [255, 255, 255]
    ],
    bandCount: 24,
    scale: 0.0002,
    secondaryScale: 0.05,
    drift: 0.5,
    driftWaveAmp: 0.24,
    driftWaveFreq: 1.4,
    jitter: 0.32,
    waveAmp: 0.1,
    alphaBase: 0.56,
    alphaGain: 0.4,
    warpStrength: 0.02,
    warpFrequency: 0.3,
    style: 'tunnel',
    quantizeSteps: 3,
    spikeChance: 0.08,
    spikeIntensity: 0.65,
    seed: 9001
  },
  {
    name: 'Neuromesh_Chromatic',
    glyphs: ['▞','▚','╳','┼','◈','⋇','✶','✸','✺','✽'],
    palette: [
      [4, 6, 10],
      [0, 120, 255],
      [0, 220, 180],
      [120, 0, 255],
      [255, 120, 0],
      [255, 255, 255]
    ],
    bandCount: 20,
    scale: 0.025,
    secondaryScale: 0.07,
    drift: 0.34,
    driftWaveAmp: 0.16,
    driftWaveFreq: 1.2,
    jitter: 0.3,
    waveAmp: 0.07,
    alphaBase: 0.6,
    alphaGain: 0.38,
    warpStrength: 0.014,
    warpFrequency: 0.22,
    style: 'voronoi',
    quantizeSteps: 0,
    spikeChance: 0.05,
    spikeIntensity: 0.55,
    seed: 12345
  },
  {
    name: 'Helix_Biolume',
    glyphs: ['·','∙','•','○','◍','◎','◉','⊙','⊚','✦','✧','∞'],
    palette: [
      [0, 4, 4],
      [0, 18, 32],
      [0, 120, 120],
      [80, 220, 180],
      [180, 255, 200],
      [255, 255, 255]
    ],
    bandCount: 16,
    scale: 0.024,
    secondaryScale: 0.05,
    drift: 0.28,
    driftWaveAmp: 0.14,
    driftWaveFreq: 1.1,
    jitter: 0.24,
    waveAmp: 0.11,
    alphaBase: 0.62,
    alphaGain: 0.36,
    warpStrength: 0.012,
    warpFrequency: 0.2,
    style: 'curl',
    quantizeSteps: 0,
    spikeChance: 0.02,
    spikeIntensity: 0.35,
    seed: 4242
  },
  {
    name: 'Quantum_Circuit',
    glyphs: ['·','•','○','◦','⊕','⊗','⊞','⊠','╱','╲','╳','┼'],
    palette: [
      [2, 2, 4],
      [12, 18, 26],
      [0, 180, 255],
      [0, 255, 180],
      [255, 200, 40],
      [255, 255, 255]
    ],
    bandCount: 18,
    scale: 0.022,
    secondaryScale: 0.06,
    drift: 0.4,
    driftWaveAmp: 0.2,
    driftWaveFreq: 1.3,
    jitter: 0.2,
    waveAmp: 0.05,
    alphaBase: 0.6,
    alphaGain: 0.38,
    warpStrength: 0.01,
    warpFrequency: 0.2,
    style: 'stripe',
    quantizeSteps: 5,
    spikeChance: 0.03,
    spikeIntensity: 0.5,
    seed: 314159
  },
  {
    name: 'Cryo_Obelisk',
    glyphs: ['▖','▘','▝','▗','▞','▚','█','◆','◇','✦','✧'],
    palette: [
      [0, 2, 6],
      [6, 16, 28],
      [20, 60, 90],
      [80, 140, 200],
      [200, 240, 255],
      [255, 255, 255]
    ],
    bandCount: 17,
    scale: 0.023,
    secondaryScale: 0.05,
    drift: 0.26,
    driftWaveAmp: 0.12,
    driftWaveFreq: 0.9,
    jitter: 0.18,
    waveAmp: 0.06,
    alphaBase: 0.64,
    alphaGain: 0.32,
    warpStrength: 0.01,
    warpFrequency: 0.18,
    style: 'height',
    quantizeSteps: 0,
    spikeChance: 0.015,
    spikeIntensity: 0.3,
    seed: 8080
  }
];
