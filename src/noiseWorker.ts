/// <reference lib="WebWorker" />
export {};

type WorkerConfig = {
  cols: number;
  rows: number;
  scale: number;
  secondaryScale: number;
  drift: number;
  driftWaveAmp: number;
  driftWaveFreq: number;
  bandCount: number;
  style: 'perlin' | 'ridged' | 'stripe' | 'worley' | 'curl' | 'cyber';
  seed: number;
};

type InitMessage = { type: 'init'; config: WorkerConfig };
type FrameMessage = { type: 'frame'; time: number };
type MessageIn = InitMessage | FrameMessage;

type FrameDataMessage = {
  type: 'frameData';
  bands: Uint16Array;
  shaped: Float32Array;
  jitters: Float32Array;
  cols: number;
  rows: number;
};
type ReadyMessage = { type: 'ready' };
type MessageOut = FrameDataMessage | ReadyMessage;

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

const POW_LUT_SIZE = 2048;
const powLut = new Float32Array(POW_LUT_SIZE + 1);
for (let i = 0; i <= POW_LUT_SIZE; i += 1) {
  powLut[i] = Math.pow(i / POW_LUT_SIZE, 1.18);
}

function shapeValue(v: number): number {
  const idx = Math.max(0, Math.min(POW_LUT_SIZE, Math.floor(v * POW_LUT_SIZE)));
  return powLut[idx];
}

function hash2(x: number, y: number, seed: number): number {
  let h = x * 374761393 + y * 668265263 + seed * 362437;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h >>> 0) / 4294967296;
}

function worley(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let minDist = 10;
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      const px = xi + ox;
      const py = yi + oy;
      const jx = hash2(px, py, seed);
      const jy = hash2(px + 17, py - 13, seed);
      const fx = px + jx;
      const fy = py + jy;
      const dx = fx - x;
      const dy = fy - y;
      const d = Math.hypot(dx, dy);
      if (d < minDist) minDist = d;
    }
  }
  return minDist;
}

let config: WorkerConfig | null = null;
let noise: Perlin2D | null = null;
let noiseBaseX = new Float32Array(0);
let noiseBaseY = new Float32Array(0);
let bands = new Uint16Array(0);
let shaped = new Float32Array(0);
let jitters = new Float32Array(0);

function applyConfig(next: WorkerConfig) {
  config = next;
  noise = new Perlin2D(next.seed);
  noiseBaseX = new Float32Array(next.cols);
  noiseBaseY = new Float32Array(next.rows);
  for (let x = 0; x < next.cols; x += 1) {
    noiseBaseX[x] = x * next.scale;
  }
  for (let y = 0; y < next.rows; y += 1) {
    noiseBaseY[y] = y * next.scale;
  }
  const cells = next.cols * next.rows;
  bands = new Uint16Array(cells);
  shaped = new Float32Array(cells);
  jitters = new Float32Array(cells);
  postMessage({ type: 'ready' } satisfies ReadyMessage);
}

function computeFrame(timeMs: number) {
  if (!config || !noise) return;
  const { cols, rows, drift, bandCount, driftWaveAmp, driftWaveFreq, secondaryScale, style, seed } = config;
  const bandMax = bandCount - 1;
  const t = timeMs * 0.001;
  const driftWave = 1 + driftWaveAmp * Math.sin(t * driftWaveFreq);
  const driftNow = drift * driftWave;
  const eps = 0.35;
  const curlStrength = 1.2;
  let idx = 0;
  for (let y = 0; y < rows; y += 1) {
    const ny = noiseBaseY[y] + t * driftNow * 0.35;
    for (let x = 0; x < cols; x += 1) {
      const nx = noiseBaseX[x] + t * driftNow;
      let n: number;
      switch (style) {
        case 'ridged': {
          const n1 = noise.noise(nx, ny);
          const n2 = noise.noise(nx * secondaryScale, ny * secondaryScale);
          const combined = n1 * 0.7 + n2 * 0.3;
          n = 1 - Math.abs(combined);
          break;
        }
        case 'stripe': {
          n = Math.sin(nx * 2.2 + ny * 0.4 + t * driftNow * 2.4);
          break;
        }
        case 'worley': {
          const wx = nx * secondaryScale;
          const wy = ny * secondaryScale;
          const d = worley(wx, wy, seed);
          n = 1 - Math.min(1, d * 1.4);
          break;
        }
        case 'curl': {
          const n0 = noise.noise(nx, ny);
          const nx1 = noise.noise(nx, ny + eps) - noise.noise(nx, ny - eps);
          const ny1 = noise.noise(nx - eps, ny) - noise.noise(nx + eps, ny);
          const advX = nx + nx1 * curlStrength;
          const advY = ny + ny1 * curlStrength;
          const nAdv = noise.noise(advX, advY);
          n = (n0 * 0.35 + nAdv * 0.65);
          break;
        }
        case 'cyber': {
          const stripe = Math.sin(nx * 3.2 + t * driftNow * 3) * 0.6;
          const base = noise.noise(nx * 1.3, ny * 1.1) * 0.4;
          const ridged = 1 - Math.abs(noise.noise(nx * secondaryScale, ny * secondaryScale));
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
      const shapedVal = shapeValue(normalized);
      let band = (shapedVal * bandCount) | 0;
      if (band > bandMax) band = bandMax;
      bands[idx] = band;
      shaped[idx] = shapedVal;
      jitters[idx] = noise.noise(nx * 2.4 - 3.1, ny * 2.4 + 7.7);
      idx += 1;
    }
  }
  postMessage(
    {
      type: 'frameData',
      bands,
      shaped,
      jitters,
      cols,
      rows
    } satisfies FrameDataMessage
  );
}

self.onmessage = (event: MessageEvent<MessageIn>) => {
  const msg = event.data;
  if (msg.type === 'init') {
    applyConfig(msg.config);
    return;
  }
  if (msg.type === 'frame') {
    computeFrame(msg.time);
  }
};
