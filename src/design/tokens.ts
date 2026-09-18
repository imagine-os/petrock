/**
 * D-01 - the single source of truth for every design value in Petrock.
 * src/styles/tokens.css is GENERATED from this file (npm run tokens) and imported once in main.tsx.
 * Nothing invents a value off this file. Values start from docs/design/tokens-draft.md (derived from the
 * Figma main page: brand purple #552583, Inter, 8/10/24 radii, 4-pt grid) and are rebuilt fresh per D-007.
 *
 * Theming = two axes on <html>: data-theme (light|dark) and data-brand (petrock|sunset). A brand supplies its
 * palette; a theme picks the semantic roles. Adding a brand = one more entry in `brands`.
 */

export type ThemeName = 'light' | 'dark';
export type BrandName = 'petrock' | 'sunset';

/** Brand palette: primary ramp + accent. Everything semantic derives from these. */
export interface BrandPalette {
  label: string;
  primary25: string; primary50: string; primary100: string; primary200: string; primary400: string;
  primary600: string; primary700: string; primary800: string;
  accent: string; accentSoft: string;
  /** Primary lifted for contrast on dark surfaces. */
  primaryOnDark: string; primaryOnDarkHover: string;
}

export const brands: Record<BrandName, BrandPalette> = {
  petrock: {
    label: 'Petrock purple',
    primary25: '#FBF8FF', primary50: '#F4F0FF', primary100: '#E8DFF5', primary200: '#DED0E9', primary400: '#9D67EF',
    primary600: '#552583', primary700: '#43196A', primary800: '#2F1149',
    accent: '#E79DD1', accentSoft: '#F7E3F1',
    primaryOnDark: '#B18AE0', primaryOnDarkHover: '#C6A6EC',
  },
  sunset: {
    label: 'Sunset (proof theme)',
    primary25: '#FFF9F5', primary50: '#FFF1E8', primary100: '#FFE0CC', primary200: '#FFC7A3', primary400: '#FF9556',
    primary600: '#D9531E', primary700: '#B33F12', primary800: '#7A2A0A',
    accent: '#2A9D8F', accentSoft: '#D8F1EE',
    primaryOnDark: '#FF9F66', primaryOnDarkHover: '#FFB786',
  },
};

/** Neutral ramp shared by every brand (from the draft: ink #0E0C11, navy #11104A, greys, app bg #F4F6FA). */
export const neutrals = {
  'n-0': '#FFFFFF', 'n-25': '#FBFBFC', 'n-50': '#F7F7F7', 'n-75': '#F4F6FA', 'n-100': '#EEF2F5', 'n-150': '#EDEDED',
  'n-200': '#E0E0E0', 'n-300': '#D8DADE', 'n-400': '#B6B6B6', 'n-500': '#93939C', 'n-600': '#7C7E93',
  'n-700': '#4B4D5E', 'n-800': '#2A2933', 'n-850': '#1C1C24', 'n-900': '#14131A', 'n-950': '#0E0C11',
  'navy': '#11104A',
} as const;

/** Status colours (draft: success #039B00, danger #F04336, info #1456F5) + warning + the booking status hues. */
export const status = {
  light: { success: '#039B00', successBg: '#E6F6E5', warn: '#C77700', warnBg: '#FFF3E0', danger: '#F04336', dangerBg: '#FDECEA', info: '#1456F5', infoBg: '#E8EEFE' },
  dark: { success: '#5FD65B', successBg: '#173A16', warn: '#FFB454', warnBg: '#3D2A0A', danger: '#FF7B70', dangerBg: '#4A1B17', info: '#7DA0FF', infoBg: '#17245A' },
} as const;

/** Booking lifecycle hues (R-I01: future green, checked-in pink, checked-out yellow, cancelled red, no-show dark red). */
export const bookingHues = {
  requested: { fg: '#7C7E93', bg: '#EEF2F5' },
  pending_vaccines: { fg: '#C77700', bg: '#FFF3E0' },
  confirmed: { fg: '#039B00', bg: '#E6F6E5' },
  checked_in: { fg: '#B8337A', bg: '#FBE4F1' },
  checked_out: { fg: '#8A6A00', bg: '#FFF6C7' },
  cancelled: { fg: '#F04336', bg: '#FDECEA' },
  no_show: { fg: '#8A1C1C', bg: '#F5D5D5' },
} as const;

/** Semantic roles per theme. `{p}` placeholders are replaced with the brand palette at generation time. */
export const semantic: Record<ThemeName, Record<string, string>> = {
  light: {
    'color-bg': '{n-75}',                 // app background (desktop #F4F6FA)
    'color-bg-phone': '{n-0}',            // customer app screens are white
    'color-surface': '{n-0}',             // cards, panels
    'color-surface-2': '{n-50}',          // subtle blocks, code
    'color-surface-3': '{n-100}',         // table head, pressed
    'color-surface-tint': '{primary50}',  // selected row, hover, tinted cards
    'color-surface-tint-2': '{primary25}',
    'color-sidebar': '{n-0}',
    'color-sidebar-active': '{primary50}',
    'color-text': '{n-950}',
    'color-heading': '{navy}',
    'color-text-muted': '{n-600}',
    'color-text-faint': '{n-500}',
    'color-text-on-primary': '{n-0}',
    'color-primary': '{primary600}',
    'color-primary-hover': '{primary700}',
    'color-primary-soft': '{primary100}',
    'color-primary-text': '{primary600}',
    'color-accent': '{accent}',
    'color-accent-soft': '{accentSoft}',
    'color-border': '{n-150}',
    'color-border-strong': '{n-400}',
    'color-border-subtle': '{n-300}',
    'color-border-primary': '{primary200}',
    'color-focus': '{primary400}',
    'color-scrim': 'rgba(50,50,50,.80)',
    'color-placeholder': '{n-200}',
    'shadow-color': '17,16,74',
  },
  dark: {
    'color-bg': '{n-950}',
    'color-bg-phone': '{n-900}',
    'color-surface': '{n-850}',
    'color-surface-2': '{n-800}',
    'color-surface-3': '{n-700}',
    'color-surface-tint': 'rgba(177,138,224,.14)',
    'color-surface-tint-2': 'rgba(177,138,224,.08)',
    'color-sidebar': '{n-900}',
    'color-sidebar-active': 'rgba(177,138,224,.16)',
    'color-text': '{n-75}',
    'color-heading': '{n-0}',
    'color-text-muted': '#A9ABBD',
    'color-text-faint': '{n-500}',
    'color-text-on-primary': '{n-0}',
    'color-primary': '{primaryOnDark}',
    'color-primary-hover': '{primaryOnDarkHover}',
    'color-primary-soft': 'rgba(177,138,224,.20)',
    'color-primary-text': '{primaryOnDark}',
    'color-accent': '{accent}',
    'color-accent-soft': 'rgba(231,157,209,.18)',
    'color-border': 'rgba(255,255,255,.10)',
    'color-border-strong': 'rgba(255,255,255,.28)',
    'color-border-subtle': 'rgba(255,255,255,.16)',
    'color-border-primary': 'rgba(177,138,224,.45)',
    'color-focus': '{primaryOnDark}',
    'color-scrim': 'rgba(0,0,0,.72)',
    'color-placeholder': '{n-700}',
    'shadow-color': '0,0,0',
  },
};

/** Inter only (D-007 / tokens-draft: one family). Scale 12/14/16/20/24/32. */
export const type = {
  'font-sans': "'Inter', 'Inter Fallback', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  'font-mono': "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  'fs-2xs': '12px', 'fs-xs': '12px', 'fs-sm': '14px', 'fs-md': '16px', 'fs-lg': '20px', 'fs-xl': '24px', 'fs-2xl': '32px', 'fs-3xl': '40px',
  'lh-xs': '16px', 'lh-sm': '20px', 'lh-md': '24px', 'lh-lg': '28px', 'lh-xl': '32px', 'lh-2xl': '40px',
  'lh-tight': '1.2', 'lh-base': '1.5',
  'fw-regular': '400', 'fw-medium': '500', 'fw-semibold': '600', 'fw-bold': '700',
  'ls-eyebrow': '0.08em',
} as const;

/** 4-pt grid (draft: 4, 8, 12, 16, 20, 24, 32, 40, 48; mobile gutter 20). */
export const spacing = {
  'sp-0': '0', 'sp-1': '4px', 'sp-2': '8px', 'sp-3': '12px', 'sp-4': '16px', 'sp-5': '20px', 'sp-6': '24px',
  'sp-8': '32px', 'sp-10': '40px', 'sp-12': '48px', 'sp-16': '64px', 'sp-20': '80px',
} as const;

/** Draft radii: 8 default (inputs, buttons), 10 cards, 24 pills, 4 small chips. */
export const radii = {
  'r-xs': '2px', 'r-sm': '4px', 'r-md': '8px', 'r-card': '10px', 'r-lg': '12px', 'r-xl': '16px', 'r-pill': '24px', 'r-full': '999px', 'r-round': '50%',
} as const;

export const shadows = {
  'shadow-sm': '0 1px 2px rgba(var(--shadow-color),.06)',
  'shadow-md': '0 2px 8px -2px rgba(var(--shadow-color),.10), 0 1px 2px rgba(var(--shadow-color),.06)',
  'shadow-lg': '0 12px 32px -12px rgba(var(--shadow-color),.22), 0 2px 6px rgba(var(--shadow-color),.08)',
  'shadow-xl': '0 24px 64px -20px rgba(var(--shadow-color),.35), 0 4px 12px rgba(var(--shadow-color),.10)',
  'shadow-focus': '0 0 0 3px color-mix(in srgb, var(--color-focus) 35%, transparent)',
} as const;

export const motion = {
  'dur-fast': '120ms', 'dur-base': '200ms', 'dur-slow': '320ms',
  'ease-out': 'cubic-bezier(.2,.7,.2,1)', 'ease-in-out': 'cubic-bezier(.65,0,.35,1)',
} as const;

/** Layout sizes seen in the designs: sidebar 243/84, top bar 80 (we use 64), table row 48, phone 390. */
export const layoutTokens = {
  'w-phone': '390px', 'w-phone-max': '430px', 'w-content': '1280px', 'w-sidebar': '244px', 'w-rail': '72px',
  'h-topbar': '64px', 'h-bottomnav': '64px', 'h-row': '48px', 'h-control': '44px', 'h-control-sm': '36px',
  'bp-phone': '600px', 'bp-tablet': '900px', 'bp-desktop': '1280px',
} as const;

export const tokens = { brands, neutrals, status, bookingHues, semantic, type, spacing, radii, shadows, motion, layout: layoutTokens };

function vars(obj: Record<string, string>): string {
  return Object.entries(obj).map(([k, v]) => `  --${k}: ${v};`).join('\n');
}

function resolve(value: string, brand: BrandPalette): string {
  return value.replace(/\{(\w[\w-]*)\}/g, (_, key: string) => {
    if (key in brand) return (brand as unknown as Record<string, string>)[key];
    if (key in neutrals) return (neutrals as Record<string, string>)[key];
    throw new Error(`unknown token placeholder {${key}}`);
  });
}

function themeBlock(theme: ThemeName, brand: BrandPalette): string {
  const sem = Object.fromEntries(Object.entries(semantic[theme]).map(([k, v]) => [k, resolve(v, brand)]));
  const st = status[theme];
  const stVars = { 'color-success': st.success, 'color-success-bg': st.successBg, 'color-warn': st.warn, 'color-warn-bg': st.warnBg, 'color-danger': st.danger, 'color-danger-bg': st.dangerBg, 'color-info': st.info, 'color-info-bg': st.infoBg };
  return `${vars(sem)}\n${vars(stVars)}\n  color-scheme: ${theme};`;
}

/** Builds the full tokens stylesheet: static scales on :root, then one block per brand x theme. */
export function buildTokensCss(): string {
  const brandRamp = (b: BrandPalette) => vars({
    'primary-25': b.primary25, 'primary-50': b.primary50, 'primary-100': b.primary100, 'primary-200': b.primary200, 'primary-400': b.primary400,
    'primary-600': b.primary600, 'primary-700': b.primary700, 'primary-800': b.primary800, 'accent-500': b.accent, 'accent-100': b.accentSoft,
  });
  const hues = Object.entries(bookingHues).flatMap(([k, h]) => [[`status-${k}-fg`, h.fg], [`status-${k}-bg`, h.bg]]);
  let css = `/* GENERATED from src/design/tokens.ts by scripts/gen-tokens.mjs - do not edit by hand */\n:root {\n${vars(neutrals)}\n${vars(type)}\n${vars(spacing)}\n${vars(radii)}\n${vars(motion)}\n${vars(layoutTokens)}\n${vars(Object.fromEntries(hues))}\n${vars(shadows)}\n}\n`;
  for (const [name, b] of Object.entries(brands) as [BrandName, BrandPalette][]) {
    const sel = name === 'petrock' ? `:root, :root[data-brand="${name}"]` : `:root[data-brand="${name}"]`;
    css += `${sel} {\n${brandRamp(b)}\n${themeBlock('light', b)}\n}\n`;
    css += `${sel.split(', ').map((s) => `${s}[data-theme="dark"]`).join(', ')} {\n${themeBlock('dark', b)}\n}\n`;
  }
  css += `:root[data-skin="wireframe"] { --color-primary: #3A3A3A; --color-primary-hover: #232323; --color-primary-text: #3A3A3A; --color-surface-tint: #F2F1ED; --color-sidebar-active: #F2F1ED; --shadow-md: none; --shadow-lg: none; --shadow-xl: none; }\n`;
  return css;
}
