import { type Config, type PaletteColor, type ParamDef } from './types';

type DropdownOptions = {
  getDisplayMode: () => 'square' | 'theater';
  onToggleDisplayMode: () => void;
  getPalette: () => PaletteColor[];
  onPaletteChange: (next: PaletteColor[]) => void;
  getGlyphs: () => string[];
  onGlyphChange: (next: string[]) => void;
  paramDefs: ParamDef[];
  getParamValue: (key: keyof Config) => number;
  onParamChange: (def: ParamDef, value: number) => void;
  getStyle: () => Config['style'];
  onStyleChange: (style: Config['style']) => void;
};

export type DropdownController = {
  syncAll(): void;
  syncPalette(): void;
  syncGlyphs(): void;
  syncParams(): void;
  syncStyle(): void;
  syncView(): void;
};

export function initDropdown(options: DropdownOptions): DropdownController {
  const viewToggle = document.querySelector<HTMLButtonElement>('#view-toggle');
  const commandToggle = document.querySelector<HTMLButtonElement>('#command-toggle');
  const commandShell = document.querySelector<HTMLElement>('.command-shell');
  const commandPanel = document.querySelector<HTMLElement>('#command-panel');
  const paletteInput = document.querySelector<HTMLInputElement>('#palette-hex');
  const paletteAddButton = document.querySelector<HTMLButtonElement>('#palette-add');
  const paletteSwatches = document.querySelector<HTMLElement>('#palette-swatches');
  const glyphInput = document.querySelector<HTMLTextAreaElement>('#glyph-input');
  const paramList = document.querySelector<HTMLElement>('#param-list');
  const styleOptions = document.querySelector<HTMLElement>('#style-options');

  let hideChromeTimeout: number | null = null;
  let controlsVisible = false;
  let commandOpen = false;
  const paramControls = new Map<keyof Config, { slider: HTMLInputElement; number: HTMLInputElement }>();
  let styleButtons: HTMLButtonElement[] = [];

  const styles: Config['style'][] = [
    'perlin',
    'ridged',
    'stripe',
    'worley',
    'curl',
    'cyber',
    'voronoi',
    'brick',
    'step',
    'glitch',
    'height',
    'perspective',
    'flight',
    'tunnel'
  ];

  function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  function toHex(value: number): string {
    return clamp(Math.round(value), 0, 255)
      .toString(16)
      .padStart(2, '0');
  }

  function rgbToHex(color: PaletteColor): string {
    return `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`;
  }

  function parseHexColor(input: string): PaletteColor | null {
    const cleaned = input.trim().replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return [r, g, b];
  }

  function glyphArrayFromString(input: string): string[] {
    const chars = Array.from(input);
    const seen = new Set<string>();
    const list: string[] = [];
    for (const c of chars) {
      if (!c.trim().length) continue;
      if (seen.has(c)) continue;
      seen.add(c);
      list.push(c);
    }
    return list.length ? list : ['.'];
  }

  function showChromeTemporarily() {
    if (!controlsVisible) {
      document.body.classList.add('controls-visible');
      controlsVisible = true;
    }
    if (hideChromeTimeout !== null) {
      window.clearTimeout(hideChromeTimeout);
    }
    hideChromeTimeout = window.setTimeout(() => {
      if (commandOpen) {
        hideChromeTimeout = null;
        return;
      }
      document.body.classList.remove('controls-visible');
      controlsVisible = false;
      hideChromeTimeout = null;
    }, 2400);
  }

  function updateToggleLabel() {
    if (!viewToggle) return;
    const theater = options.getDisplayMode() === 'theater';
    viewToggle.setAttribute('aria-pressed', theater ? 'true' : 'false');
    const label = viewToggle.querySelector<HTMLElement>('.label');
    if (label) {
      label.textContent = theater ? 'Square Mode' : 'Theater Mode';
    }
  }

  function renderPalette() {
    if (!paletteSwatches) return;
    paletteSwatches.innerHTML = '';
    const palette = options.getPalette();
    palette.forEach((color, idx) => {
      const swatch = document.createElement('div');
      swatch.className = 'swatch';
      const hex = rgbToHex(color);
      swatch.style.setProperty('--swatch-color', `rgb(${color[0]}, ${color[1]}, ${color[2]})`);
      swatch.title = hex;
      swatch.addEventListener('click', () => {
        if (paletteInput) paletteInput.value = hex;
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.addEventListener('click', (event) => {
        event.stopPropagation();
        const next = palette.filter((_, i) => i !== idx);
        options.onPaletteChange(next);
        syncPalette();
      });
      swatch.appendChild(remove);
      paletteSwatches.appendChild(swatch);
    });
    if (paletteInput && palette.length) {
      paletteInput.value = rgbToHex(palette[palette.length - 1]);
    }
  }

  function handlePaletteAdd() {
    if (!paletteInput) return;
    const parsed = parseHexColor(paletteInput.value);
    if (!parsed) return;
    options.onPaletteChange([...options.getPalette(), parsed]);
    paletteInput.value = rgbToHex(parsed);
    syncPalette();
  }

  function syncPalette() {
    renderPalette();
  }

  function syncGlyphs() {
    if (glyphInput) {
      glyphInput.value = options.getGlyphs().join('');
    }
  }

  function buildParamControls() {
    if (!paramList) return;
    paramList.innerHTML = '';
    paramControls.clear();
    options.paramDefs.forEach((def) => {
      const row = document.createElement('div');
      row.className = 'param-row';
      const head = document.createElement('div');
      head.className = 'param-head';
      const label = document.createElement('div');
      label.className = 'param-label';
      label.textContent = def.label;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'param-slider';
      slider.min = String(def.min);
      slider.max = String(def.max);
      slider.step = String(def.step);

      const number = document.createElement('input');
      number.type = 'number';
      number.className = 'param-number';
      number.min = String(def.min);
      number.max = String(def.max);
      number.step = String(def.step);

      slider.addEventListener('input', () => {
        options.onParamChange(def, Number(slider.value));
        syncParams();
      });
      number.addEventListener('input', () => {
        options.onParamChange(def, Number(number.value));
        syncParams();
      });

      head.appendChild(label);
      head.appendChild(number);
      row.appendChild(head);
      row.appendChild(slider);
      paramList.appendChild(row);
      paramControls.set(def.key, { slider, number });
    });
  }

  function syncParams() {
    paramControls.forEach((control, key) => {
      const def = options.paramDefs.find((d) => d.key === key);
      if (!def) return;
      const value = options.getParamValue(key);
      control.slider.value = `${value}`;
      control.number.value = `${value}`;
    });
  }

  function buildStyleOptions() {
    if (!styleOptions) return;
    styleOptions.innerHTML = '';
    styleButtons = [];
    styles.forEach((style) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'style-option';
      button.textContent = style;
      button.addEventListener('click', () => {
        options.onStyleChange(style);
        syncStyle();
      });
      styleButtons.push(button);
      styleOptions.appendChild(button);
    });
  }

  function syncStyle() {
    const current = options.getStyle();
    styleButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.textContent === current);
    });
  }

  function setCommandOpen(open: boolean) {
    commandOpen = open;
    if (commandShell) {
      commandShell.classList.toggle('open', open);
    }
    if (commandPanel) {
      commandPanel.hidden = !open;
    }
    if (commandToggle) {
      commandToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    if (open) {
      document.body.classList.add('controls-visible');
    }
    showChromeTemporarily();
  }

  function toggleCommand() {
    setCommandOpen(!commandOpen);
  }

  function syncAll() {
    updateToggleLabel();
    syncPalette();
    syncGlyphs();
    syncParams();
    syncStyle();
  }

  const wakeChrome = () => showChromeTemporarily();

  viewToggle?.addEventListener('click', () => {
    options.onToggleDisplayMode();
    updateToggleLabel();
    showChromeTemporarily();
  });
  viewToggle?.addEventListener('focus', showChromeTemporarily);
  commandToggle?.addEventListener('click', toggleCommand);
  paletteAddButton?.addEventListener('click', handlePaletteAdd);
  paletteInput?.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handlePaletteAdd();
    }
  });
  glyphInput?.addEventListener('input', () => {
    const parsed = glyphArrayFromString(glyphInput.value);
    options.onGlyphChange(parsed);
    syncGlyphs();
  });
  document.addEventListener('click', (event) => {
    if (!commandOpen) return;
    const target = event.target as Node | null;
    if (target && commandShell && !commandShell.contains(target)) {
      setCommandOpen(false);
    }
  });
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && commandOpen) {
      setCommandOpen(false);
    }
  });
  window.addEventListener('mousemove', wakeChrome);
  window.addEventListener('touchstart', wakeChrome, { passive: true });

  buildParamControls();
  buildStyleOptions();
  syncAll();
  showChromeTemporarily();

  return {
    syncAll,
    syncPalette,
    syncGlyphs,
    syncParams,
    syncStyle,
    syncView: updateToggleLabel
  };
}
