export type PaletteColor = [number, number, number];

export type Config = {
  cols: number;
  rows: number;
  bandCount: number;
  scale: number;
  secondaryScale: number;
  drift: number;
  jitter: number;
  quantizeSteps: number;
  snapStrength: number;
  anisotropy: number;
  spikeChance: number;
  spikeIntensity: number;
  driftWaveAmp: number;
  driftWaveFreq: number;
  waveAmp: number;
  alphaBase: number;
  alphaGain: number;
  warpStrength: number;
  warpFrequency: number;
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
    | 'tunnel';
  glyphs: string[];
  palette: PaletteColor[];
  seed: number;
};

export type ParamDef = {
  key: keyof Config;
  label: string;
  min: number;
  max: number;
  step: number;
  integer?: boolean;
  affectsBand?: boolean;
  affectsGrid?: boolean;
  syncWorker?: boolean;
};
