import './style.css';

type PaletteColor = [number, number, number];

// Glyph sets to try:
// const glyphs = ['.', ':', '-', '+', '=', '*', '%', '#', '@']; // clean ASCII
// const glyphs = ['`', '.', ',', ':', ';', '!', '*', 'o', 'O', '0', '#', '@']; // hazy CRT
// const glyphs = ['·', '˙', '∷', '─', '┼', '╬', '▓', '█']; // blocky grid
// const glyphs = ['.', '⌁', '⌇', '✶', '✸', '✺', '✽', '✦', '✧']; // sparkly
// const glyphs = ['.', '∴', '∆', '◊', '◇', '◆', '▢', '▣', '▦']; // geometric

const glyphs = ['.', ':', '-', '+', '=', '*', '%', '#', '@'];

// [R, G, B]
const palette: PaletteColor[] = [
  [255, 130, 20],   // brighter Traxus orange (strong, punchy)
  [255, 170, 80],   // light/soft orange accent
  [22, 23, 26],     // near-black industrial gray
  [45, 47, 53],     // dark steel gray
  [90, 92, 98],     // mid gray
  [165, 167, 172],  // light gray
  [255, 255, 255]   // white (highlight / contrast)
];


const config = {
  cols: 54,
  rows: 54,
  bandCount: 8,
  scale: 0.045,
  drift: 0.16,
  jitter: 0.35
};

const canvas = document.querySelector<HTMLCanvasElement>('#glyph-canvas');
const ctx = canvas?.getContext('2d');
const frame = canvas?.parentElement as HTMLElement | null;

if (!canvas || !ctx || !frame) {
  throw new Error('Canvas element missing from page.');
}

const hud = {
  bands: document.querySelector<HTMLElement>('[data-band-count]'),
  scale: document.querySelector<HTMLElement>('[data-scale]'),
  speed: document.querySelector<HTMLElement>('[data-speed]')
};

const state = {
  width: 640,
  height: 640,
  cellSize: 12
};

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Perlin2D {
  private perm: Uint8Array;

  constructor(seed = 1) {
    const rand = mulberry32(seed);
    const base = new Uint8Array(256).map((_, i) => i);
    for (let i = base.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i += 1) {
      this.perm[i] = base[i & 255];
    }
  }

  noise(x: number, y: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = this.perm[xi] + yi;
    const ab = this.perm[xi] + yi + 1;
    const ba = this.perm[xi + 1] + yi;
    const bb = this.perm[xi + 1] + yi + 1;

    const x1 = lerp(grad(this.perm[aa], xf, yf), grad(this.perm[ba], xf - 1, yf), u);
    const x2 = lerp(grad(this.perm[ab], xf, yf - 1), grad(this.perm[bb], xf - 1, yf - 1), u);
    return lerp(x1, x2, v);
  }
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixColors(a: PaletteColor, b: PaletteColor, t: number): PaletteColor {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t))
  ];
}

function samplePalette(t: number): string {
  const steps = palette.length - 1;
  const scaled = Math.max(0, Math.min(steps, t * steps));
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  const color = mixColors(palette[idx], palette[Math.min(idx + 1, steps)], frac);
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function withAlpha(rgb: string, alpha: number): string {
  return rgb.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
}

const noise = new Perlin2D(777);

function resizeCanvas() {
  const rect = frame.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const target = Math.min(rect.width, rect.height);
  canvas.width = target * dpr;
  canvas.height = target * dpr;
  canvas.style.width = `${target}px`;
  canvas.style.height = `${target}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  state.width = target;
  state.height = target;
  state.cellSize = target / config.cols;
}

function updateHud() {
  if (hud.bands) hud.bands.textContent = `${config.bandCount}`;
  if (hud.scale) hud.scale.textContent = config.scale.toFixed(3);
  if (hud.speed) hud.speed.textContent = config.drift.toFixed(2);
}

function render(timeMs: number) {
  const t = timeMs * 0.001;
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${state.cellSize * 0.9}px "DM Mono", "Space Grotesk", monospace`;
  ctx.shadowBlur = 10;

  for (let y = 0; y < config.rows; y += 1) {
    const ny = y * config.scale + t * config.drift * 0.35;
    for (let x = 0; x < config.cols; x += 1) {
      const nx = x * config.scale + t * config.drift;
      const n = noise.noise(nx, ny);
      const normalized = Math.max(0, Math.min(1, (n + 1) * 0.5));
      const shaped = Math.pow(normalized, 1.18);
      const band = Math.min(config.bandCount - 1, Math.floor(shaped * config.bandCount));
      const glyph = glyphs[band % glyphs.length];
      const color = samplePalette(band / (config.bandCount - 1));

      const jitter = noise.noise(nx * 2.4 - 3.1, ny * 2.4 + 7.7) * config.jitter;
      const offsetX = jitter * state.cellSize * 0.35;
      const offsetY = Math.sin(t * 0.9 + x * 0.1 + y * 0.07) * state.cellSize * 0.08 + jitter * state.cellSize * 0.2;

      ctx.fillStyle = color;
      ctx.shadowColor = withAlpha(color, 0.35);
      ctx.globalAlpha = 0.7 + shaped * 0.28;
      ctx.fillText(glyph, (x + 0.5) * state.cellSize + offsetX, (y + 0.5) * state.cellSize + offsetY);
    }
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(render);
}

resizeCanvas();
updateHud();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(render);
