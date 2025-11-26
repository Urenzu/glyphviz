/// <reference lib="WebWorker" />
export {};

type WorkerConfig = {
  cols: number;
  rows: number;
  scale: number;
  secondaryScale: number;
  quantizeSteps: number;
  snapStrength: number;
  anisotropy: number;
  spikeChance: number;
  spikeIntensity: number;
  drift: number;
  driftWaveAmp: number;
  driftWaveFreq: number;
  bandCount: number;
  style:
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
    | 'anomaly'
    | 'checker'
    | 'hex_tiling'
    | 'burst'
    | 'isogrid'
    | 'constellation'
    | 'spiral'
    | 'circuit'
    | 'menger'
    | 'stepper'
    | 'quilt'
    | 'mosaic'
    | 'interference'
    | 'voronoi_outline'
    | 'scribe'
    | 'spiral_net'
    | 'herringbone'
    | 'ripple'
    | 'orbits'
    | 'flecktarn'
    | 'multicam'
    | 'digital'
    | 'tiger'
    | 'kryptek'
    | 'hex_camo'
    | 'woodland'
    | 'akira'
    | 'lcl_hud'
    | 'ghost_hud'
    | 'bebop'
    | 'moire'
    | 'halftone'
    | 'topo'
    | 'storm_radar'
    | 'matrix_rain'
    | 'blueprint'
    | 'carbon'
    | 'paisley'
    | 'starburst'
    | 'radar_hud'
    | 'lv_monogram'
    | 'burberry'
    | 'gucci'
    | 'plaid'
    | 'lace'
    | 'ps2_bios'
    | 'devils_heel'
    | 'cheetah'
    | 'floral'
    | 'hemp'
    | 'berserk';
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

const TAU = Math.PI * 2;
const INV_TAU = 1 / TAU;
const SIN_LUT_SIZE = 8192;
const SIN_LUT_MASK = SIN_LUT_SIZE - 1;
const SIN_LUT = new Float32Array(SIN_LUT_SIZE);
for (let i = 0; i < SIN_LUT_SIZE; i += 1) {
  SIN_LUT[i] = Math.sin((i / SIN_LUT_SIZE) * TAU);
}

function fastSin(angle: number): number {
  let normalized = angle * INV_TAU;
  normalized -= Math.floor(normalized);
  return SIN_LUT[(normalized * SIN_LUT_SIZE) & SIN_LUT_MASK];
}

function fastCos(angle: number): number {
  return fastSin(angle + Math.PI * 0.5);
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

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function fract(v: number): number {
  return v - Math.floor(v);
}

function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax;
  const vy = by - ay;
  const lenSq = vx * vx + vy * vy + 1e-6;
  let t = ((px - ax) * vx + (py - ay) * vy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + vx * t;
  const cy = ay + vy * t;
  return Math.hypot(px - cx, py - cy);
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
  const {
    cols,
    rows,
    drift,
    bandCount,
    driftWaveAmp,
    driftWaveFreq,
    secondaryScale,
    style,
    seed,
    quantizeSteps,
    snapStrength,
    anisotropy,
    spikeChance,
    spikeIntensity
  } = config;
  const bandMax = bandCount - 1;
  const t = timeMs * 0.001;
  const driftWave = 1 + driftWaveAmp * fastSin(t * driftWaveFreq);
  const driftNow = drift * driftWave;
  const eps = 0.35;
  const curlStrength = 1.2;
  const invCols = 1 / cols;
  const invRows = 1 / rows;
  let idx = 0;
  for (let y = 0; y < rows; y += 1) {
    const nyBase = noiseBaseY[y] + t * driftNow * 0.35;
    for (let x = 0; x < cols; x += 1) {
      const nxBase = noiseBaseX[x] + t * driftNow;
      const nx = nxBase * anisotropy;
      const ny = nyBase / Math.max(0.0001, anisotropy);
      const normX = x * invCols;
      const normY = y * invRows;
      let n: number;
      switch (style) {
        case 'height': {
          const nBase = noise.noise(nx, ny);
          const gx = noise.noise(nx + eps, ny) - noise.noise(nx - eps, ny);
          const gy = noise.noise(nx, ny + eps) - noise.noise(nx, ny - eps);
          const lightX = 0.6;
          const lightY = -0.8;
          const shade = (gx * lightX + gy * lightY) * 0.7;
          const combined = nBase * 0.7 + shade * 0.6;
          n = Math.max(-1, Math.min(1, combined));
          break;
        }
        case 'perspective': {
          const h = noise.noise(nx * secondaryScale, ny * secondaryScale);
          const factor = 1 / (1 + Math.max(-0.9, Math.min(0.9, h * 0.6)));
          const n1 = noise.noise(nx * factor, ny * factor);
          const n2 = noise.noise(nx * factor * 1.8, ny * factor * 1.8) * 0.35;
          n = (n1 * 0.75 + n2 * 0.25);
          break;
        }
        case 'flight': {
          const z = y / rows;
          const perspective = 1 / (1 + z * 1.6);
          const sx = nx * perspective;
          const sy = ny * perspective + t * driftNow * 0.5;
          const h = noise.noise(sx, sy);
          n = h * (1 + (1 - z) * 0.5);
          break;
        }
          case 'tunnel': {
            const cx = x / cols - 0.5 + fastSin(t * 0.35) * 0.05;
            const cy = y / rows - 0.5 + fastCos(t * 0.25) * 0.05;
            const angle = Math.atan2(cy, cx) + t * 0.4;
            const radius = Math.hypot(cx, cy);
            const radial = Math.log1p(radius * 6);
            const twist = noise.noise(angle * 1.6 + t * 0.6, radial * 3 + t * 0.4);
            const depth = 1 / Math.max(0.12, radial + 0.08 + twist * 0.04);
            const stripe = fastSin(angle * 10 + t * 3 + radial * 18 + twist * 2);
            const jitter = noise.noise(angle * 4 - t * 0.5, radial * 5 + t * 0.7);
            n = depth * 0.6 + stripe * 0.25 + jitter * 0.15;
            break;
          }
          case 'ridged': {
          const n1 = noise.noise(nx, ny);
          const n2 = noise.noise(nx * secondaryScale, ny * secondaryScale);
          const combined = n1 * 0.7 + n2 * 0.3;
          n = 1 - Math.abs(combined);
          break;
        }
          case 'stripe': {
            n = fastSin(nx * 2.2 + ny * 0.4 + t * driftNow * 2.4);
            break;
          }
        case 'worley': {
          const wx = nx * secondaryScale;
          const wy = ny * secondaryScale;
          const d = worley(wx, wy, seed);
          n = 1 - Math.min(1, d * 1.4);
          break;
        }
        case 'voronoi': {
          const wx = nx * secondaryScale;
          const wy = ny * secondaryScale;
          const d1 = worley(wx, wy, seed);
          const d2 = worley(wx + 0.73, wy - 0.41, seed + 11);
          const edge = 1 - Math.abs(d1 - d2) * 2;
          n = Math.max(-1, Math.min(1, edge));
          break;
        }
        case 'brick': {
          const snap = snapStrength > 0 ? snapStrength : 0.5;
          const gx = Math.floor(nx / snap);
          const gy = Math.floor(ny / snap);
          const offset = (gy & 1) * 0.5 * snap;
          n = noise.noise(gx * snap + offset, gy * snap);
          break;
        }
        case 'step': {
          n = noise.noise(nx, ny);
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
          const stripe = fastSin(nx * 3.2 + t * driftNow * 3) * 0.6;
          const base = noise.noise(nx * 1.3, ny * 1.1) * 0.4;
          const ridged = 1 - Math.abs(noise.noise(nx * secondaryScale, ny * secondaryScale));
          n = stripe + base + ridged * 0.6;
          break;
        }
        case 'glitch': {
          const base = noise.noise(nx * 1.6, ny * 0.9 + fastSin(t * 5) * 0.5);
          const stripe = fastSin(nx * 4.2 + t * 6.3) * 0.5;
          n = base * 0.5 + stripe * 0.5;
          break;
        }
        case 'kaleido': {
          const cxNorm = x / cols - 0.5;
          const cyNorm = y / rows - 0.5;
          const radius = Math.hypot(cxNorm, cyNorm);
          const angle = Math.atan2(cyNorm, cxNorm);
          const slices = 8;
          const sliceAngle = (Math.PI * 2) / slices;
          const normalizedAngle = Math.abs(
            (((angle % sliceAngle) + sliceAngle) % sliceAngle) - sliceAngle * 0.5
          );
          const sampleX = fastCos(normalizedAngle) * radius * 10 + t * 0.3;
          const sampleY = fastSin(normalizedAngle) * radius * 10 - t * 0.3;
          const blot = noise.noise(sampleX, sampleY);
          const ripple = fastSin(radius * 24 - t * 2 + normalizedAngle * 6);
          n = blot * 0.7 + ripple * 0.3;
          break;
        }
        case 'flow': {
          let fx = nx;
          let fy = ny;
          for (let i = 0; i < 3; i += 1) {
            const dvx = noise.noise(fx, fy + eps) - noise.noise(fx, fy - eps);
            const dvy = noise.noise(fx - eps, fy) - noise.noise(fx + eps, fy);
            fx += dvx * 0.7;
            fy += dvy * 0.7;
          }
          n = noise.noise(fx, fy);
          break;
        }
        case 'orbital': {
          const cxNorm = x / cols - 0.5;
          const cyNorm = y / rows - 0.5;
          const orb1x = fastSin(t * 0.2) * 0.35;
          const orb1y = fastCos(t * 0.25) * 0.35;
          const orb2x = fastSin(t * 0.33 + 1.2) * 0.55;
          const orb2y = fastCos(t * 0.29 + 0.8) * 0.55;
          const d1 = Math.hypot(cxNorm - orb1x, cyNorm - orb1y);
          const d2 = Math.hypot(cxNorm - orb2x, cyNorm - orb2y);
          const caustic = Math.exp(-d1 * 8) + Math.exp(-d2 * 8);
          const shimmer = fastSin(d1 * 40 - t * 2) + fastSin(d2 * 36 + t * 1.6);
          const carrier = noise.noise(nx * 0.6 + t * 0.08, ny * 0.6 - t * 0.08);
          n = caustic * 0.5 + shimmer * 0.25 + carrier * 0.25;
          break;
        }
        case 'cellular': {
          const wx = nx * secondaryScale;
          const wy = ny * secondaryScale;
          const d1 = worley(wx, wy, seed);
          const d2 = worley(wx + 0.31, wy - 0.17, seed + 7);
          const membrane = 1 - Math.min(1, Math.abs(d1 - d2) * 4);
          const pocket = Math.min(d1, d2);
          const nucleus = Math.exp(-pocket * 4);
          n = membrane * 0.7 + nucleus * 0.3;
          break;
        }
        case 'hearts': {
          const tiles = 6;
          const localX = ((x / cols) * tiles) % 1;
          const localY = ((y / rows) * tiles) % 1;
          const hx = (localX - 0.5) * 2;
          const hy = (localY - 0.5) * -2;
          const shape =
            Math.pow(hx * hx + hy * hy - 1, 3) - hx * hx * hy * hy * hy;
          const beat = fastSin(t * 3 + (hx + hy) * 6) * 0.2;
          const fill = Math.tanh(-shape * 3);
          const shimmer = noise.noise(nx * 0.6 + beat, ny * 0.6 - beat) * 0.35;
          n = Math.max(-1, Math.min(1, fill + beat + shimmer));
          break;
        }
        case 'anomaly': {
          let sx = nx;
          let sy = ny;
          let accum = 0;
          for (let i = 0; i < 4; i += 1) {
            const r = Math.hypot(sx, sy) + 0.0001;
            const angle = Math.atan2(sy, sx);
            sx = fastSin(angle * 3 + t * 0.7 + i) / r + fastCos(sy * 0.5 + t * 0.3);
            sy = fastCos(angle * 2 - t * 0.5 - i) / r + fastSin(sx * 0.5 - t * 0.2);
            accum += noise.noise(sx * 1.6, sy * 1.6);
          }
          const vortex = fastSin(accum * 2 + t * 0.8);
          const spiral =
            fastSin((Math.atan2(ny, nx) + t) * 10) / Math.max(0.35, Math.hypot(nx, ny));
          n = Math.max(-1, Math.min(1, vortex * 0.7 + spiral * 0.3));
          break;
        }
        case 'checker': {
          const tiles = 14;
          const gx = Math.floor(normX * tiles);
          const gy = Math.floor(normY * tiles);
          const parity = (gx + gy) & 1 ? -1 : 1;
          const weave = fastSin(normX * tiles * TAU) * fastSin(normY * tiles * TAU);
          const texture = noise.noise(nx * 1.4, ny * 1.4) * 0.3;
          n = parity * 0.65 + weave * 0.2 + texture;
          break;
        }
        case 'hex_tiling': {
          const scaleHex = 10;
          const px = normX * scaleHex;
          const py = normY * scaleHex;
          const a = Math.abs(fract(px) - 0.5);
          const b = Math.abs(fract(py) - 0.5);
          const c = Math.abs(fract(px + py) - 0.5);
          const edge = Math.min(a, Math.min(b, c));
          const cellNoise = noise.noise(Math.floor(px) * 0.7, Math.floor(py) * 0.7);
          n = (1 - Math.min(1, edge * 3.5)) * 0.8 + cellNoise * 0.2 - 0.2;
          break;
        }
        case 'burst': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const spokes = fastSin(angle * 18 + t * 0.8);
          const rings = fastSin(radius * 60 - t * 1.4);
          const glow = 1 / (1 + radius * 8);
          n = spokes * (1 - radius) * 0.7 + rings * 0.25 + glow * 0.35 - 0.25;
          break;
        }
        case 'isogrid': {
          const skewX = (normX - normY) * 0.5;
          const skewY = (normX + normY) * 0.5;
          const diagA = Math.abs(fract(skewX * 20) - 0.5);
          const diagB = Math.abs(fract(skewY * 20) - 0.5);
          const rib = 1 - Math.min(1, Math.min(diagA, diagB) * 12);
          const depth = noise.noise(nx * 1.2, ny * 1.2) * 0.2;
          n = rib * 0.85 + depth - 0.15;
          break;
        }
        case 'constellation': {
          const tiles = 10;
          const cellX = Math.floor(normX * tiles);
          const cellY = Math.floor(normY * tiles);
          const starOffsetX = hash2(cellX, cellY, seed + 11);
          const starOffsetY = hash2(cellX, cellY, seed + 17);
          const starX = (cellX + starOffsetX) / tiles;
          const starY = (cellY + starOffsetY) / tiles;
          const starDist = Math.hypot(normX - starX, normY - starY);
          const starGlow = Math.exp(-starDist * tiles * 3);
          let trace = 0;
          for (let i = 0; i < 2; i += 1) {
            const theta = hash2(cellX + i * 13, cellY - i * 7, seed + 23) * TAU;
            const len = 0.08 + hash2(cellX - i * 5, cellY + i * 3, seed + 31) * 0.12;
            const ax = starX;
            const ay = starY;
            const bx = ax + fastCos(theta) * len;
            const by = ay + fastSin(theta) * len;
            const dLine = segmentDistance(normX, normY, ax, ay, bx, by);
            trace = Math.max(trace, Math.exp(-dLine * tiles * 6));
          }
          const dust = noise.noise(nx * 0.4, ny * 0.4) * 0.2;
          n = starGlow * 0.65 + trace * 0.3 + dust - 0.15;
          break;
        }
        case 'spiral': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const swirl = fastSin(angle * 10 + radius * 40 - t * 1.1);
          const ripple = fastSin((1 - radius) * 25 + t * 0.6);
          n = swirl * 0.7 + ripple * 0.3;
          break;
        }
        case 'circuit': {
          const freq = 16;
          const fx = Math.abs(fract(normX * freq) - 0.5);
          const fy = Math.abs(fract(normY * freq) - 0.5);
          const line = 1 - Math.min(1, Math.min(fx, fy) * 18);
          const pulses = fastSin(normX * freq * 1.5 + t * 5) * 0.25;
          const junction = (((Math.floor(normX * freq) ^ Math.floor(normY * freq)) & 3) / 3) * 0.3;
          n = line * 0.8 + pulses + junction - 0.25;
          break;
        }
        case 'menger': {
          let xi = Math.floor(normX * 243);
          let yi = Math.floor(normY * 243);
          let carve = 1;
          for (let i = 0; i < 4; i += 1) {
            if (xi % 3 === 1 && yi % 3 === 1) {
              carve = -1;
              break;
            }
            xi = Math.floor(xi / 3);
            yi = Math.floor(yi / 3);
          }
          const rough = noise.noise(nx * 0.8, ny * 0.8) * 0.3;
          n = carve * 0.8 + rough - 0.2;
          break;
        }
        case 'stepper': {
          const qx = Math.round(normX * 18) / 18;
          const qy = Math.round(normY * 10) / 10;
          const stairs = fastSin(qx * 60 + t * 2) * 0.6 + fastSin(qy * 40 - t * 1.5) * 0.4;
          n = stairs;
          break;
        }
        case 'quilt': {
          const tiles = 6;
          const tx = Math.floor(normX * tiles);
          const ty = Math.floor(normY * tiles);
          const lx = fract(normX * tiles);
          const ly = fract(normY * tiles);
          const choice = Math.floor(hash2(tx, ty, seed + 101) * 4);
          let patch = 0;
          if (choice === 0) {
            patch = 1 - Math.min(1, Math.abs(lx - ly) * 4);
          } else if (choice === 1) {
            patch = 1 - Math.min(1, Math.min(Math.abs(lx - 0.5), Math.abs(ly - 0.5)) * 8);
          } else if (choice === 2) {
            const tri = ly < lx ? ly : 1 - ly;
            patch = 1 - Math.min(1, Math.abs(tri - 0.5) * 6);
          } else {
            const circle = Math.hypot(lx - 0.5, ly - 0.5);
            patch = 1 - Math.min(1, circle * 4);
          }
          const stitch = fastSin((lx + ly) * 30) * 0.2;
          n = patch * 0.85 + stitch - 0.2;
          break;
        }
        case 'mosaic': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx) + Math.PI;
          const wedges = 12;
          const wedgePos = (angle / TAU) * wedges;
          const wedgeFrac = wedgePos - Math.floor(wedgePos);
          const wedgeEdge = Math.min(wedgeFrac, 1 - wedgeFrac);
          const ringFrac = fract(radius * 6);
          const edge = Math.min(wedgeEdge * 3, Math.abs(ringFrac - 0.5) * 4);
          const tile = 1 - Math.min(1, edge * 3);
          const tint = noise.noise(Math.floor(wedgePos) * 0.8, radius * 4 + t * 0.3) * 0.3;
          n = tile * 0.85 + tint - 0.2;
          break;
        }
        case 'interference': {
          const wave1 = fastSin(nx * 1.2 + ny * 0.4 + t * 1.1);
          const wave2 = fastSin(nx * 0.35 - ny * 1.4 - t * 1.4);
          const beat = fastSin((wave1 - wave2) * 6);
          n = beat * 0.7 + (wave1 + wave2) * 0.15;
          break;
        }
        case 'voronoi_outline': {
          const wx = nx * secondaryScale;
          const wy = ny * secondaryScale;
          const d1 = worley(wx, wy, seed);
          const d2 = worley(wx + 0.53, wy - 0.37, seed + 9);
          const edge = Math.abs(d1 - d2);
          const border = Math.exp(-edge * 35);
          const cavity = Math.exp(-Math.min(d1, d2) * 8);
          n = border * 0.75 + cavity * 0.25 - 0.2;
          break;
        }
        case 'scribe': {
          const lanes = 24;
          const laneX = Math.floor(normX * lanes);
          const laneY = Math.floor(normY * lanes);
          const orient = (laneX + laneY) & 1;
          const fracX = Math.abs(fract(normX * lanes) - 0.5);
          const fracY = Math.abs(fract(normY * lanes) - 0.5);
          const trace = orient === 0 ? fracY : fracX;
          const groove = 1 - Math.min(1, trace * 20);
          const jitter = hash2(laneX, laneY, seed + 41);
          const pulse = fastSin(t * 5 + jitter * TAU) * 0.25;
          n = groove * 0.85 + pulse - 0.25;
          break;
        }
        case 'spiral_net': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.max(0.0001, Math.hypot(dx, dy));
          const angle = Math.atan2(dy, dx);
          const spiralA = fastSin(angle * 10 + Math.log1p(radius) * 40 + t * 0.5);
          const spiralB = fastSin(-angle * 10 + Math.log1p(radius) * 36 - t * 0.7);
          const mesh = 1 - Math.min(Math.abs(spiralA), Math.abs(spiralB));
          n = mesh * 0.85 - 0.2;
          break;
        }
        case 'herringbone': {
          const freq = 18;
          const u = normX * freq;
          const v = normY * freq;
          const hx = Math.floor(u);
          const hy = Math.floor(v);
          const parity = (hx + hy) & 1;
          const lx = fract(u);
          const ly = fract(v);
          const diag = parity === 0 ? Math.abs(lx - ly) : Math.abs(lx + ly - 1);
          const mortar = 1 - Math.min(1, diag * 6);
          const groove = Math.min(Math.abs(lx - 0.5), Math.abs(ly - 0.5));
          const depth = 1 - Math.min(1, groove * 8);
          n = mortar * 0.6 + depth * 0.25 - 0.2;
          break;
        }
        case 'ripple': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.hypot(dx, dy);
          const rings = fastSin(radius * 90 - t * 1.2);
          const wobble = noise.noise(nx * 0.7, ny * 0.7) * 0.3;
          n = rings * 0.8 + wobble;
          break;
        }
        case 'orbits': {
          let field = 0;
          for (let i = 0; i < 3; i += 1) {
            const speed = 0.15 + i * 0.12;
            const radius = 0.15 + i * 0.12;
            const angle = t * speed + seed * 0.1 * (i + 1);
            const ox = 0.5 + fastCos(angle) * radius;
            const oy = 0.5 + fastSin(angle * 1.2) * radius * (0.8 + i * 0.1);
            const dist = Math.hypot(normX - ox, normY - oy);
            field = Math.max(field, Math.exp(-dist * 30));
          }
          const wake = fastSin(normX * 20 + t * 2) * 0.2;
          n = field * 0.85 + wake - 0.1;
          break;
        }
        case 'flecktarn': {
          const macro = noise.noise(nx * 0.45, ny * 0.45);
          const mid = noise.noise(nx * 1.1 + 8.3, ny * 1.1 - 4.2);
          const speckleSource = noise.noise(nx * 4.2 - 3.1, ny * 4.2 + 5.7);
          const blot = Math.tanh((macro * 0.6 + mid * 0.4) * 1.6);
          const specks = speckleSource > 0.35 ? 0.6 : -0.6;
          const jitter = noise.noise(nx * 2.3 + 7.9, ny * 2.3 - 1.3) * 0.2;
          n = Math.max(-1, Math.min(1, blot * 0.8 + specks * 0.3 + jitter));
          break;
        }
        case 'multicam': {
          const macro = noise.noise(nx * 0.35, ny * 0.35);
          const detail = noise.noise(nx * 1.2, ny * 1.2);
          const vines = fastSin(nx * 0.4 + t * 0.4 + detail * 2) * 0.4;
          const blend = Math.tanh((macro + detail * 0.5) * 1.4);
          n = blend * 0.7 + vines * 0.3;
          break;
        }
        case 'digital': {
          const stepLarge = 0.05;
          const stepSmall = 0.02;
          const qx = Math.floor(normX / stepLarge);
          const qy = Math.floor(normY / stepLarge);
          const block = noise.noise(qx * 0.7, qy * 0.7);
          const micro = noise.noise(Math.floor(normX / stepSmall), Math.floor(normY / stepSmall));
          n = block * 0.7 + micro * 0.3;
          break;
        }
        case 'tiger': {
          const diag = normX * 1.6 - normY * 1.2;
          const stripe = fastSin(diag * 18 + t * 0.8);
          const breakup = noise.noise(nx * 0.9, ny * 0.7);
          n = stripe * 0.75 + breakup * 0.25;
          break;
        }
        case 'kryptek': {
          const wx = nx * secondaryScale * 1.4 + fastSin(t * 0.3) * 0.1;
          const wy = ny * secondaryScale * 1.4 + fastCos(t * 0.25) * 0.1;
          const d1 = worley(wx, wy, seed);
          const d2 = worley(wx + 0.22, wy - 0.18, seed + 5);
          const shell = 1 - Math.abs(d1 - d2) * 3;
          const outline = Math.exp(-Math.min(d1, d2) * 14);
          n = shell * 0.6 + outline * 0.4 - 0.2;
          break;
        }
        case 'hex_camo': {
          const freq = 9;
          const px = normX * freq;
          const py = normY * freq;
          const a = Math.abs(fract(px) - 0.5);
          const b = Math.abs(fract(py) - 0.5);
          const c = Math.abs(fract(px + py) - 0.5);
          const edge = Math.min(a, Math.min(b, c));
          const outline = 1 - Math.min(1, edge * 10);
          const fillNoise = noise.noise(Math.floor(px) * 0.9, Math.floor(py) * 0.9);
          n = outline * 0.75 + fillNoise * 0.25 - 0.2;
          break;
        }
        case 'woodland': {
          const macro = noise.noise(nx * 0.25, ny * 0.25);
          const mid = noise.noise(nx * 0.7 + 5.1, ny * 0.7 - 3.3);
          const micro = noise.noise(nx * 2.2 - 1.7, ny * 2.2 + 4.6) * 0.2;
          const combined = Math.tanh((macro * 0.6 + mid * 0.4) * 1.5);
          n = combined * 0.8 + micro - 0.1;
          break;
        }
        case 'akira': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const streaks = fastSin(angle * 14 + t * 2.4 + radius * 40);
          const rings = fastSin(radius * 120 - t * 3.6);
          const gridX = Math.abs(fract(normX * 24) - 0.5);
          const gridY = Math.abs(fract(normY * 12) - 0.5);
          const grid = 1 - Math.min(1, Math.min(gridX, gridY) * 20);
          const shock = Math.exp(-Math.abs(radius - 0.32) * 80);
          n = streaks * 0.55 + rings * 0.35 + grid * 0.2 + shock * 0.5 - 0.25;
          break;
        }
        case 'lcl_hud': {
          const hexScale = 9;
          const px = normX * hexScale;
          const py = normY * hexScale;
          const a = Math.abs(fract(px) - 0.5);
          const b = Math.abs(fract(py) - 0.5);
          const c = Math.abs(fract(px + py) - 0.5);
          const edge = 1 - Math.min(1, Math.min(a, Math.min(b, c)) * 22);
          const panel = fastSin(normY * 30 + t * 4) * 0.25 + fastSin(normX * 10 + t * 2) * 0.25;
          const alert = fastSin(t * 6 + normX * 40) > 0.7 ? 0.7 : 0;
          n = edge * 0.7 + panel * 0.3 + alert - 0.2;
          break;
        }
        case 'ghost_hud': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const rings = Math.exp(-Math.abs(fract(radius * 6 - t * 0.5) - 0.5) * 50);
          const wireX = 1 - Math.min(1, Math.abs(fract(normX * 20) - 0.5) * 30);
          const wireY = 1 - Math.min(1, Math.abs(fract(normY * 12) - 0.5) * 30);
          const matrix = fastSin((angle + fastSin(radius * 30)) * 20 + t * 1.8);
          n = rings * 0.45 + (wireX + wireY) * 0.2 + matrix * 0.35;
          break;
        }
        case 'bebop': {
          const block = Math.floor(normX * 3);
          const stripe = fastSin(normY * 18 + block * 0.4);
          const wave = fastSin(normX * 14 + fastSin(normY * 6) * 2 + t * 2);
          n = block === 0 ? stripe * 0.7 + wave * 0.3 : block === 1 ? wave : -stripe;
          break;
        }
        case 'moire': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const r = Math.hypot(dx, dy);
          const base = fastSin(r * 120 - t * 1.5);
          const offset = fastSin((r + 0.01) * 118 - t * 1.1);
          n = (base - offset) * 0.7;
          break;
        }
        case 'halftone': {
          const dots = 18;
          const lx = fract(normX * dots) - 0.5;
          const ly = fract(normY * dots * 1.4) - 0.5;
          const dist = Math.hypot(normX - 0.25, normY - 0.25);
          const size = clamp01(1 - dist * 1.8);
          const radius = Math.hypot(lx, ly);
          const dot = size - radius * dots * 0.8;
          n = dot;
          break;
        }
        case 'topo': {
          const height = noise.noise(nx * 0.35, ny * 0.35);
          const contour = Math.abs(fract(height * 8 + t * 0.02) - 0.5);
          const ridge = 1 - Math.min(1, contour * 10);
          n = ridge * 0.85 + height * 0.15 - 0.1;
          break;
        }
        case 'storm_radar': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const sweepAngle = (t * 0.6) % TAU;
          const diff = Math.atan2(Math.sin(angle - sweepAngle), Math.cos(angle - sweepAngle));
          const beam = Math.exp(-Math.abs(diff) * 10);
          const echo = Math.exp(-Math.abs(fract(radius * 5 - t * 0.4) - 0.5) * 20);
          const rings = fastSin(radius * 30 - t * 2) * 0.3;
          n = beam * (1 - radius) * 0.8 + echo * 0.4 + rings;
          break;
        }
        case 'matrix_rain': {
          const colsRain = 80;
          const col = Math.floor(normX * colsRain);
          const seedCol = hash2(col, 0, seed);
          const speed = 0.15 + seedCol * 0.4;
          const head = (seedCol * 10 + t * speed) % 1;
          const trail = 0.2 + seedCol * 0.3;
          const distHead = head - normY;
          const brightness =
            distHead >= -trail && distHead <= 0
              ? Math.exp(distHead * 14)
              : Math.exp(-Math.abs(normY - head) * 50) * 0.3;
          const drizzle = noise.noise(col * 0.7, normY * 25 - t * 5) * 0.2;
          n = brightness * 0.9 + drizzle - 0.2;
          break;
        }
        case 'blueprint': {
          const isoA = Math.abs(fract((normX + normY) * 12) - 0.5);
          const isoB = Math.abs(fract((normX - normY) * 12) - 0.5);
          const grid = 1 - Math.min(1, Math.min(isoA, isoB) * 20);
          const ticksX = 1 - Math.min(1, Math.abs(fract(normX * 24) - 0.5) * 40);
          const ticksY = 1 - Math.min(1, Math.abs(fract(normY * 24) - 0.5) * 40);
          const notes = fastSin(normX * 40 + fastSin(normY * 40)) * 0.1;
          n = grid * 0.6 + (ticksX + ticksY) * 0.15 + notes - 0.2;
          break;
        }
        case 'carbon': {
          const warp = normY + fastSin(normX * 20 + t * 0.5) * 0.01;
          const u = fract((normX + warp) * 24);
          const v = fract((normX - warp) * 24);
          const threadA = Math.abs(u - 0.5);
          const threadB = Math.abs(v - 0.5);
          const weave = 1 - Math.min(1, Math.min(threadA, threadB) * 20);
          const highlight = fastSin(normX * 80 + normY * 30) * 0.1;
          n = weave * 0.85 + highlight - 0.2;
          break;
        }
        case 'paisley': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const angle = Math.atan2(dy, dx);
          const radius = Math.hypot(dx, dy);
          const teardrop = radius - 0.35 - 0.15 * fastSin(angle * 2);
          const ring = Math.abs(fract(radius * 6) - 0.5);
          const outline = Math.exp(-Math.abs(teardrop) * 40);
          n = outline * 0.8 + (1 - Math.min(1, ring * 12)) * 0.2 - 0.2;
          break;
        }
        case 'starburst': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const slices = 16;
          const wedge = Math.abs(fract((angle / TAU) * slices) - 0.5);
          const arms = 1 - Math.min(1, wedge * 8);
          const core = Math.exp(-radius * 20);
          n = arms * (1 - radius) * 0.9 + core - 0.2;
          break;
        }
        case 'radar_hud': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const radius = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const crossX = 1 - Math.min(1, Math.abs(dx) * 60);
          const crossY = 1 - Math.min(1, Math.abs(dy) * 60);
          const rings = Math.exp(-Math.abs(fract(radius * 5) - 0.5) * 35);
          const sweepAngle = (t * 0.6) % TAU;
          const diff = Math.atan2(Math.sin(angle - sweepAngle), Math.cos(angle - sweepAngle));
          const sweep = Math.exp(-Math.abs(diff) * 12);
          n = rings * 0.6 + (crossX + crossY) * 0.15 + sweep * (1 - radius) * 0.4 - 0.2;
          break;
        }
        case 'lv_monogram': {
          const tiles = 6;
          const tx = Math.floor(normX * tiles);
          const ty = Math.floor(normY * tiles);
          const localX = fract(normX * tiles) - 0.5;
          const localY = fract(normY * tiles) - 0.5;
          const motif = (tx + ty) % 4;
          let mask = 0;
          if (motif === 0) {
            mask = 1 - Math.min(1, Math.hypot(localX, localY) * 6);
          } else if (motif === 1) {
            mask = 1 - Math.min(1, Math.abs(localX * localY * 24));
          } else if (motif === 2) {
            mask = 1 - Math.min(1, Math.abs(localX) * 12);
          } else {
            mask = 1 - Math.min(1, Math.abs(localY) * 12);
          }
          const lattice = Math.abs(localX + localY) < 0.02 ? 0.8 : 0;
          n = mask * 0.8 + lattice - 0.2;
          break;
        }
        case 'burberry': {
          const tan = fastSin(normY * 4);
          const redStripe = Math.exp(-Math.abs(fract(normX * 6 + 0.1) - 0.5) * 40);
          const blackStripe = Math.exp(-Math.abs(fract(normX * 6) - 0.5) * 80);
          const horizontal = Math.exp(-Math.abs(fract(normY * 12) - 0.5) * 40);
          n = tan * 0.2 + redStripe * 0.6 + blackStripe * 0.4 + horizontal * 0.4 - 0.2;
          break;
        }
        case 'gucci': {
          const freq = 8;
          const px = normX * freq;
          const py = normY * freq;
          const hx = Math.abs(fract(px) - 0.5);
          const hy = Math.abs(fract(py) - 0.5);
          const diag = Math.abs(fract(px + py) - 0.5);
          const lattice = 1 - Math.min(1, Math.min(hx, Math.min(hy, diag)) * 18);
          const motif = fastSin(Math.floor(px) + Math.floor(py) * 1.5);
          n = lattice * 0.75 + motif * 0.25 - 0.2;
          break;
        }
        case 'plaid': {
          const baseY = Math.exp(-Math.abs(fract(normY * 8) - 0.5) * 25);
          const baseX = Math.exp(-Math.abs(fract(normX * 8) - 0.5) * 25);
          const accentY = Math.exp(-Math.abs(fract(normY * 16 + 0.2) - 0.5) * 40);
          const accentX = Math.exp(-Math.abs(fract(normX * 16 - 0.15) - 0.5) * 40);
          const hatching = fastSin(normX * 60 + normY * 60) * 0.1;
          n = baseY * 0.4 + baseX * 0.4 + accentY * 0.3 + accentX * 0.3 + hatching - 0.2;
          break;
        }
        case 'lace': {
          const tiles = 6;
          const tx = Math.floor(normX * tiles);
          const ty = Math.floor(normY * tiles);
          const localX = fract(normX * tiles) - 0.5;
          const localY = fract(normY * tiles) - 0.5;
          const radius = Math.hypot(localX, localY);
          const petals = Math.abs(fastSin(Math.atan2(localY, localX) * 6));
          const motif = Math.exp(-radius * 10) * petals;
          const border = Math.abs(fract(radius * 6) - 0.5);
          const holes = 1 - Math.min(1, border * 12);
          const net = Math.abs(fract((normX + normY) * 12) - 0.5);
          const mesh = 1 - Math.min(1, net * 18);
          n = motif * 0.7 + holes * 0.2 + mesh * 0.1 - 0.2;
          break;
        }
        case 'ps2_bios': {
          const horizon = normY;
          const rays = fastSin(normX * 60 + t * 3) * (1 - horizon) * 0.6;
          const cubes = Math.exp(-Math.abs(fract((normX + t * 0.1) * 6) - 0.5) * 30) * (1 - horizon * 1.4);
          const fog = (1 - horizon) * 0.5;
          n = rays * 0.6 + cubes * 0.4 + fog - 0.2;
          break;
        }
        case 'devils_heel': {
          const tiles = 5;
          const lx = fract(normX * tiles) - 0.5;
          const ly = fract(normY * tiles) - 0.5;
          const stem = Math.exp(-Math.abs(lx + 0.1) * 30) * smoothstep(-0.5, 0, ly);
          const heel = Math.exp(-Math.abs(ly + 0.2) * 40) * smoothstep(0, 0.4, -lx + 0.1);
          const spike = Math.exp(-Math.abs(lx - 0.25) * 50) * smoothstep(0.1, 0.4, ly + 0.5);
          n = (stem + heel + spike) * 0.9 - 0.2;
          break;
        }
        case 'cheetah': {
          const wx = nx * 1.4;
          const wy = ny * 1.4;
          const d = worley(wx, wy, seed + 9);
          const spot = d < 0.22 ? 1 - d * 4 : 0;
          const ring = d < 0.32 && d >= 0.22 ? (0.32 - d) * 5 : 0;
          n = spot * 0.8 + ring * 0.4 - 0.2;
          break;
        }
        case 'floral': {
          const dx = normX - 0.5;
          const dy = normY - 0.5;
          const r = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          const petals = Math.abs(fastSin(angle * 8)) * (1 - r);
          const rings = Math.exp(-Math.abs(fract(r * 6) - 0.5) * 18);
          n = petals * 0.7 + rings * 0.3 - 0.1;
          break;
        }
        case 'hemp': {
          const tiles = 4;
          const lx = fract(normX * tiles) - 0.5;
          const ly = fract(normY * tiles) - 0.5;
          const r = Math.hypot(lx, ly);
          const angle = Math.atan2(ly, lx);
          const lobes = Math.abs(fastSin(angle * 5));
          const leaf = Math.exp(-Math.abs(r - 0.25) * 18) * lobes;
          const stem = Math.exp(-Math.abs(lx) * 40) * smoothstep(0, 0.3, -ly + 0.2);
          n = (leaf + stem) * 0.9 - 0.2;
          break;
        }
        case 'berserk': {
          const stroke = (ax: number, ay: number, bx: number, by: number, width: number) => {
            const d = segmentDistance(normX, normY, ax, ay, bx, by);
            return Math.exp(-d * width);
          };
          const v = stroke(0.5, 0.18, 0.5, 0.82, 140);
          const diag1 = stroke(0.32, 0.32, 0.68, 0.68, 120);
          const diag2 = stroke(0.68, 0.32, 0.32, 0.68, 120);
          const hornL = stroke(0.5, 0.18, 0.42, 0.1, 140);
          const hornR = stroke(0.5, 0.18, 0.58, 0.1, 140);
          const mask = Math.max(v, diag1, diag2, hornL, hornR);
          n = mask * 1.3 - 0.3;
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
      if (style === 'step' && quantizeSteps > 0) {
        normalized = Math.round(normalized * quantizeSteps) / quantizeSteps;
      }
      if (spikeChance > 0) {
        const spikeHash = hash2(x + Math.floor(t * 30), y + seed * 3, seed);
        if (spikeHash < spikeChance) {
          normalized = Math.min(1, normalized + spikeIntensity);
        }
      }
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
    } satisfies FrameDataMessage,
    [bands.buffer, shaped.buffer, jitters.buffer]
  );
  const cells = cols * rows;
  bands = new Uint16Array(cells);
  shaped = new Float32Array(cells);
  jitters = new Float32Array(cells);
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
