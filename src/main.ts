import './style.css';
import { presets, type Preset } from './presets';

type PaletteColor = [number, number, number];

type Config = {
  cols: number;
  rows: number;
  bandCount: number;
  scale: number;
  drift: number;
  jitter: number;
  glyphs: string[];
  palette: PaletteColor[];
  seed: number;
};

// Glyph sets to try (uncomment or copy into customConfig as desired):
// const glyphs = ['.', ':', '-', '+', '=', '*', '%', '#', '@']; // clean ASCII
// const glyphs = ['`', '.', ',', ':', ';', '!', '*', 'o', 'O', '0', '#', '@']; // hazy CRT
// const glyphs = ['·', '˙', '∷', '─', '┼', '╬', '▓', '█']; // blocky grid
// const glyphs = ['.', '⌁', '⌇', '✶', '✸', '✺', '✽', '✦', '✧']; // sparkly
// const glyphs = ['.', '∴', '∆', '◊', '◇', '◆', '▢', '▣', '▦']; // geometric
// const glyphs = ['.', '+', 'x', '✚', '✖', '◉', '◎', '⊕', '⊗']; // targeting/radar
// const glyphs = ['.', ':', '-', '_', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']; // bars
// const glyphs = ['.', ':', '|', '/', '\\\\', '+', '*', '#', '@']; // utilitarian grid
// const glyphs = ['.', '>', '»', '›', '»', '▷', '▶', '▸', '▹']; // directional

const startPresetName = 'JP_RisingSun'; // set to 'custom' or any preset name from presets.ts

const customConfig: Config = {
  cols: 54,
  rows: 54,
  glyphs: ['.', '+', 'x', '✚', '✖', '◉', '◎', '⊕', '⊗'], // targeting/radar vibe
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
  speed: document.querySelector<HTMLElement>('[data-speed]'),
  preset: document.querySelector<HTMLElement>('[data-preset]')
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

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
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

function buildConfig(preset: Preset): Config {
  return {
    cols: 54,
    rows: 54,
    glyphs: preset.glyphs,
    palette: preset.palette,
    bandCount: preset.bandCount,
    scale: preset.scale,
    drift: preset.drift,
    jitter: preset.jitter,
    seed: preset.seed ?? 1
  };
}

let presetIndex = presets.findIndex((p) => p.name === startPresetName);
if (presetIndex < 0) presetIndex = 0;
const initialConfig =
  startPresetName === 'custom'
    ? customConfig
    : buildConfig(presets[presetIndex] ?? presets[0]);
const config = { ...initialConfig };
let palette = config.palette;
let glyphs = config.glyphs;
let noise = new Perlin2D(config.seed);
let currentPresetName = startPresetName === 'custom' ? 'custom' : presets[presetIndex]?.name ?? 'custom';

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
  if (hud.preset) hud.preset.textContent = currentPresetName;
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
      const normalized = clamp01((n + 1) * 0.5);
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

function setConfig(next: Config, name: string) {
  config.bandCount = next.bandCount;
  config.scale = next.scale;
  config.drift = next.drift;
  config.jitter = next.jitter;
  config.cols = next.cols;
  config.rows = next.rows;
  palette = next.palette;
  glyphs = next.glyphs;
  noise = new Perlin2D(next.seed);
  currentPresetName = name;
  updateHud();
}

function applyPreset(nextIndex: number) {
  presetIndex = (nextIndex + presets.length) % presets.length;
  const preset = presets[presetIndex];
  setConfig(buildConfig(preset), preset.name);
}

function applyPresetByName(name: string) {
  if (name === 'custom') {
    setConfig(customConfig, 'custom');
    return;
  }
  const idx = presets.findIndex((p) => p.name === name);
  if (idx >= 0) {
    presetIndex = idx;
    setConfig(buildConfig(presets[idx]), presets[idx].name);
  }
}

applyPresetByName(startPresetName);

resizeCanvas();
updateHud();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(render);

function handleKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() === 'p') {
    applyPreset(presetIndex + 1);
  }
}

window.addEventListener('keydown', handleKey);
