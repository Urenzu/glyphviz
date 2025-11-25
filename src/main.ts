import './style.css';
import { presets, type Preset } from './presets';

type PaletteColor = [number, number, number];

type Config = {
  cols: number;
  rows: number;
  bandCount: number;
  scale: number;
  secondaryScale: number;
  drift: number;
  jitter: number;
  driftWaveAmp: number;
  driftWaveFreq: number;
  waveAmp: number;
  alphaBase: number;
  alphaGain: number;
  warpStrength: number;
  warpFrequency: number;
  style: 'perlin' | 'ridged' | 'stripe' | 'worley' | 'curl' | 'cyber';
  glyphs: string[];
  palette: PaletteColor[];
  seed: number;
};

const startPresetName: string = 'Cyber_Shard'; // set to 'custom' or any preset name from presets.ts
const GRID_SIZE = 80;

const customConfig: Config = {
  cols: GRID_SIZE,
  rows: GRID_SIZE,
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
  secondaryScale: 0.08,
  drift: 0.16,
  driftWaveAmp: 0,
  driftWaveFreq: 1,
  jitter: 0.32,
  waveAmp: 0.08,
  alphaBase: 0.7,
  alphaGain: 0.28,
  warpStrength: 0,
  warpFrequency: 0.4,
  style: 'perlin',
  seed: 707
};

const canvas = document.querySelector<HTMLCanvasElement>('#glyph-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const frame = canvas.parentElement as HTMLElement;

const hud = {
  bands: document.querySelector<HTMLElement>('[data-band-count]'),
  scale: document.querySelector<HTMLElement>('[data-scale]'),
  speed: document.querySelector<HTMLElement>('[data-speed]'),
  preset: document.querySelector<HTMLElement>('[data-preset]'),
  fps: document.querySelector<HTMLElement>('[data-fps]')
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

function samplePalette(pal: PaletteColor[], t: number): string {
  const steps = pal.length - 1;
  const scaled = Math.max(0, Math.min(steps, t * steps));
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  const color = mixColors(pal[idx], pal[Math.min(idx + 1, steps)], frac);
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function withAlpha(rgb: string, alpha: number): string {
  return rgb.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
}

const POW_LUT_SIZE = 2048;
const powLut = new Float32Array(POW_LUT_SIZE + 1);
for (let i = 0; i <= POW_LUT_SIZE; i += 1) {
  powLut[i] = Math.pow(i / POW_LUT_SIZE, 1.18);
}

function shapeValue(v: number): number {
  const idx = Math.max(0, Math.min(POW_LUT_SIZE, Math.floor(v * POW_LUT_SIZE)));
  return powLut[idx];
}

type WorkerFrameData = {
  type: 'frameData';
  bands: Uint16Array;
  shaped: Float32Array;
  jitters: Float32Array;
  cols: number;
  rows: number;
};

type WorkerReady = { type: 'ready' };

let noiseWorker: Worker | null = null;
let workerReady = false;
let workerPendingFrame = false;
let workerBands: Uint16Array | null = null;
let workerShaped: Float32Array | null = null;
let workerJitters: Float32Array | null = null;

class FrameMeter {
  private last = 0;
  private accum = 0;
  private count = 0;
  private readonly windowMs = 250;

  tick(now: number): number | null {
    if (this.last === 0) {
      this.last = now;
      return null;
    }
    const dt = now - this.last;
    this.last = now;
    this.accum += dt;
    this.count += 1;
    if (this.accum >= this.windowMs) {
      const fps = (this.count * 1000) / this.accum;
      this.accum = 0;
      this.count = 0;
      return fps;
    }
    return null;
  }
}

class GlyphAtlas {
  private images: (CanvasImageSource | null)[] = [];
  private glyphCount = 0;
  private bandCount = 0;
  private size = 0;
  private readonly useOffscreen = typeof OffscreenCanvas !== 'undefined';

  rebuild(cellSize: number, glyphSet: string[], bandColors: string[]) {
    this.glyphCount = glyphSet.length;
    this.bandCount = bandColors.length;
    this.size = Math.max(1, Math.ceil(cellSize * 1.4));
    this.images = new Array(this.glyphCount * this.bandCount).fill(null);
    if (this.glyphCount === 0 || this.bandCount === 0) return;

    const font = `${cellSize * 0.9}px "DM Mono", "Space Grotesk", monospace`;
    const half = this.size * 0.5;
    for (let band = 0; band < this.bandCount; band += 1) {
      const color = bandColors[band];
      for (let i = 0; i < this.glyphCount; i += 1) {
        const canvas = this.useOffscreen
          ? new OffscreenCanvas(this.size, this.size)
          : (document.createElement('canvas') as HTMLCanvasElement | OffscreenCanvas);
        canvas.width = this.size;
        canvas.height = this.size;
        const context = (canvas as OffscreenCanvas | HTMLCanvasElement).getContext('2d') as
          | CanvasRenderingContext2D
          | OffscreenCanvasRenderingContext2D
          | null;
        if (!context) continue;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = font;
        context.fillStyle = color;
        context.shadowColor = withAlpha(color, 0.35);
        context.shadowBlur = Math.max(6, cellSize * 0.6);
        context.fillText(glyphSet[i], half, half);
        const image =
          this.useOffscreen && 'transferToImageBitmap' in canvas
            ? (canvas as OffscreenCanvas).transferToImageBitmap()
            : (canvas as HTMLCanvasElement);
        this.images[band * this.glyphCount + i] = image;
      }
    }
  }

  get sizePx(): number {
    return this.size;
  }

  get(band: number, glyphIndex: number): CanvasImageSource | null {
    const idx = band * this.glyphCount + glyphIndex;
    return this.images[idx] ?? null;
  }
}

function startNoiseWorker() {
  if (typeof Worker === 'undefined' || noiseWorker) return;
  noiseWorker = new Worker(new URL('./noiseWorker.ts', import.meta.url), { type: 'module' });
  noiseWorker.onmessage = (event: MessageEvent<WorkerReady | WorkerFrameData>) => {
    const data = event.data;
    if (data.type === 'ready') {
      workerReady = true;
      workerPendingFrame = false;
      return;
    }
    if (data.type === 'frameData') {
      workerPendingFrame = false;
      if (data.cols !== config.cols || data.rows !== config.rows) {
        return;
      }
      workerBands = data.bands;
      workerShaped = data.shaped;
      workerJitters = data.jitters;
    }
  };
  noiseWorker.onerror = () => {
    noiseWorker?.terminate();
    noiseWorker = null;
    workerReady = false;
    workerPendingFrame = false;
    workerBands = null;
    workerShaped = null;
    workerJitters = null;
  };
}

function syncWorkerConfig() {
  if (!noiseWorker) return;
  workerReady = false;
  workerPendingFrame = false;
  workerBands = null;
  workerShaped = null;
  workerJitters = null;
  noiseWorker.postMessage({
    type: 'init',
    config: {
      cols: config.cols,
      rows: config.rows,
      scale: config.scale,
      secondaryScale: config.secondaryScale,
      drift: config.drift,
      driftWaveAmp: config.driftWaveAmp,
      driftWaveFreq: config.driftWaveFreq,
      style: config.style,
      bandCount: config.bandCount,
      seed: config.seed
    }
  });
}

function buildConfig(preset: Preset): Config {
  return {
    cols: GRID_SIZE,
    rows: GRID_SIZE,
    glyphs: preset.glyphs,
    palette: preset.palette,
    bandCount: preset.bandCount,
    scale: preset.scale,
    secondaryScale: preset.secondaryScale ?? preset.scale * 1.6,
    drift: preset.drift,
    driftWaveAmp: preset.driftWaveAmp ?? 0,
    driftWaveFreq: preset.driftWaveFreq ?? 1,
    jitter: preset.jitter,
    waveAmp: preset.waveAmp ?? 0.08,
    alphaBase: preset.alphaBase ?? 0.7,
    alphaGain: preset.alphaGain ?? 0.28,
    warpStrength: preset.warpStrength ?? 0,
    warpFrequency: preset.warpFrequency ?? 0.4,
    style: preset.style ?? 'perlin',
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
const glyphAtlas = new GlyphAtlas();
const fpsMeter = new FrameMeter();

let bandColors: string[] = [];
let bandGlyphIndex = new Uint16Array(0);
let baseX = new Float32Array(0);
let baseY = new Float32Array(0);
let noiseBaseX = new Float32Array(0);
let noiseBaseY = new Float32Array(0);
let sinPhase = new Float32Array(0);
let cachedFontSize = 0;

function rebuildBandCache() {
  const bands = Math.max(1, config.bandCount);
  bandColors = new Array(bands);
  bandGlyphIndex = new Uint16Array(bands);
  const denom = Math.max(1, bands - 1);
  for (let i = 0; i < bands; i += 1) {
    bandColors[i] = samplePalette(palette, i / denom);
    bandGlyphIndex[i] = i % glyphs.length;
  }
}

function rebuildGridCache() {
  const { cols, rows } = config;
  baseX = new Float32Array(cols);
  baseY = new Float32Array(rows);
  noiseBaseX = new Float32Array(cols);
  noiseBaseY = new Float32Array(rows);
  sinPhase = new Float32Array(cols * rows);

  for (let x = 0; x < cols; x += 1) {
    baseX[x] = (x + 0.5) * state.cellSize;
    noiseBaseX[x] = x * config.scale;
  }

  for (let y = 0; y < rows; y += 1) {
    baseY[y] = (y + 0.5) * state.cellSize;
    noiseBaseY[y] = y * config.scale;
    const rowBase = y * cols;
    const yPhase = y * 0.07;
    for (let x = 0; x < cols; x += 1) {
      sinPhase[rowBase + x] = x * 0.1 + yPhase;
    }
  }
}

function refreshGlyphAtlas() {
  if (!glyphs.length || !bandColors.length) return;
  glyphAtlas.rebuild(state.cellSize, glyphs, bandColors);
}

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
  cachedFontSize = 0;
  rebuildGridCache();
  refreshGlyphAtlas();
}

function updateHud() {
  if (hud.bands) hud.bands.textContent = `${config.bandCount}`;
  if (hud.scale) hud.scale.textContent = config.scale.toFixed(3);
  if (hud.speed) hud.speed.textContent = config.drift.toFixed(2);
  if (hud.preset) hud.preset.textContent = currentPresetName;
  if (hud.fps && !hud.fps.textContent) hud.fps.textContent = '---';
}

function render(timeMs: number) {
  const t = timeMs * 0.001;
  if (noiseWorker && workerReady && !workerPendingFrame) {
    workerPendingFrame = true;
    noiseWorker.postMessage({ type: 'frame', time: timeMs });
  }
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, state.width, state.height);

  const fontSize = state.cellSize * 0.9;
  if (fontSize !== cachedFontSize) {
    ctx.font = `${fontSize}px "DM Mono", "Space Grotesk", monospace`;
    cachedFontSize = fontSize;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  const { cols, rows, drift, jitter, bandCount, waveAmp, alphaBase, alphaGain, warpStrength, warpFrequency } = config;
  const driftWave = 1 + config.driftWaveAmp * Math.sin(t * config.driftWaveFreq);
  const driftNow = drift * driftWave;
  const jitterStrength = jitter * state.cellSize;
  const jitterXScale = jitterStrength * 0.35;
  const jitterYScale = jitterStrength * 0.2;
  const sinAmp = state.cellSize * waveAmp;
  const atlasSize = glyphAtlas.sizePx;
  const atlasHalf = atlasSize * 0.5;
  const bandMax = bandCount - 1;
  const timeWave = t * 0.9;
  const centerX = state.width * 0.5;
  const centerY = state.height * 0.5;
  const expectedCells = cols * rows;
  const useWorker =
    workerBands &&
    workerShaped &&
    workerJitters &&
    workerBands.length === expectedCells &&
    workerShaped.length === expectedCells &&
    workerJitters.length === expectedCells;

  for (let y = 0; y < rows; y += 1) {
    const ny = useWorker ? 0 : noiseBaseY[y] + t * driftNow * 0.35;
    const py = baseY[y];
    const rowBase = y * cols;
    for (let x = 0; x < cols; x += 1) {
      const idx = rowBase + x;
      let band: number;
      let shapedVal: number;
      let jitterNoise: number;
      if (useWorker) {
        band = workerBands![idx];
        shapedVal = workerShaped![idx];
        jitterNoise = workerJitters![idx];
      } else {
        const nx = noiseBaseX[x] + t * driftNow;
        let n: number;
        switch (config.style) {
          case 'ridged': {
            const n1 = noise.noise(nx, ny);
            const n2 = noise.noise(nx * config.secondaryScale, ny * config.secondaryScale);
            n = 1 - Math.abs(n1 * 0.7 + n2 * 0.3);
            break;
          }
          case 'stripe': {
            n = Math.sin(nx * 2.2 + ny * 0.4 + t * driftNow * 2.4);
            break;
          }
          case 'worley': {
            const d = 1 - Math.min(1, Math.abs(noise.noise(nx * config.secondaryScale, ny * config.secondaryScale)) * 1.4);
            n = d;
            break;
          }
          case 'curl': {
            const eps = 0.35;
            const curlStrength = 1.2;
            const n0 = noise.noise(nx, ny);
            const nx1 = noise.noise(nx, ny + eps) - noise.noise(nx, ny - eps);
            const ny1 = noise.noise(nx - eps, ny) - noise.noise(nx + eps, ny);
            const advX = nx + nx1 * curlStrength;
            const advY = ny + ny1 * curlStrength;
            const nAdv = noise.noise(advX, advY);
            n = n0 * 0.35 + nAdv * 0.65;
            break;
          }
          case 'cyber': {
            const stripe = Math.sin(nx * 3.2 + t * driftNow * 3) * 0.6;
            const base = noise.noise(nx * 1.3, ny * 1.1) * 0.4;
            const ridged = 1 - Math.abs(noise.noise(nx * config.secondaryScale, ny * config.secondaryScale));
            n = stripe + base + ridged * 0.6;
            break;
          }
          case 'perlin':
          default: {
            n = noise.noise(nx, ny);
          }
        }
        let normalized = (n + 1) * 0.5;
        if (normalized < 0) normalized = 0;
        else if (normalized > 1) normalized = 1;
        shapedVal = shapeValue(normalized);
        band = (shapedVal * bandCount) | 0;
        if (band > bandMax) band = bandMax;
        jitterNoise = noise.noise(nx * 2.4 - 3.1, ny * 2.4 + 7.7);
      }
      const glyphIndex = bandGlyphIndex[band];

      let px = baseX[x] + jitterNoise * jitterXScale;
      let pyOffset = Math.sin(timeWave + sinPhase[idx]) * sinAmp + jitterNoise * jitterYScale;

      if (warpStrength !== 0) {
        const cy = py;
        const cx = px;
        const dx = cx - centerX;
        const dy = cy - centerY;
        const dist = Math.hypot(dx, dy);
        const twist = warpStrength * Math.sin(dist * warpFrequency - t * 0.7);
        px += -dy * twist;
        pyOffset += dx * twist;
      }

      const alpha = alphaBase + shapedVal * alphaGain;

      ctx.globalAlpha = alpha;
      const image = glyphAtlas.get(band, glyphIndex);
      if (image) {
        ctx.drawImage(image, px - atlasHalf, py + pyOffset - atlasHalf, atlasSize, atlasSize);
      } else {
        const color = bandColors[band];
        ctx.fillStyle = color;
        ctx.shadowColor = withAlpha(color, 0.35);
        ctx.shadowBlur = Math.max(6, state.cellSize * 0.6);
        ctx.fillText(glyphs[glyphIndex], px, py + pyOffset);
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }
    }
  }

  ctx.globalAlpha = 1;

  const fps = fpsMeter.tick(timeMs);
  if (fps && hud.fps) hud.fps.textContent = fps.toFixed(0);
  requestAnimationFrame(render);
}

function setConfig(next: Config, name: string) {
  config.bandCount = next.bandCount;
  config.scale = next.scale;
  config.secondaryScale = next.secondaryScale;
  config.drift = next.drift;
  config.driftWaveAmp = next.driftWaveAmp;
  config.driftWaveFreq = next.driftWaveFreq;
  config.jitter = next.jitter;
  config.cols = next.cols;
  config.rows = next.rows;
  config.waveAmp = next.waveAmp;
  config.alphaBase = next.alphaBase;
  config.alphaGain = next.alphaGain;
  config.warpStrength = next.warpStrength;
  config.warpFrequency = next.warpFrequency;
  config.style = next.style;
  config.seed = next.seed;
  palette = next.palette;
  glyphs = next.glyphs;
  noise = new Perlin2D(next.seed);
  currentPresetName = name;
  rebuildBandCache();
  resizeCanvas();
  updateHud();
  syncWorkerConfig();
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
startNoiseWorker();
syncWorkerConfig();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(render);

function handleKey(e: KeyboardEvent) {
  if (e.key.toLowerCase() === 'p') {
    applyPreset(presetIndex + 1);
  }
}

window.addEventListener('keydown', handleKey);
