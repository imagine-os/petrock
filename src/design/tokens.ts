/**
 * D-01 - the single source of truth for every design value in Petrock.
 * src/styles/tokens.css is GENERATED from this file (npm run tokens) and imported once in main.tsx.
 * Nothing invents a value off this file. Values come from the Figma customer app + front desk artwork as read in
 * docs/design/fidelity-audit.md (2026-09-18: brand purple #552583, Open Sans + Be Vietnam Pro display, 8/10/4 radii,
 * 4-pt grid, white home / #F4F6FA lists / #EEF2F5 forms, #F4F0FF desk canvas) - see docs/design/tokens-draft.md.
 *
 * Theming = two axes on <html>: data-theme (light|dark) and data-brand (petrock|sunset). A brand supplies its
 * palette; a theme picks the semantic roles. Adding a brand = one more entry in `brands`. Figma has no dark screens:
 * the dark theme is derived from the same palette (bg #14131A, surface #1C1C24, text #F4F6FA, primary lifted to #B18AE0).
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
    // #F4F0FF desk canvas, #E8DFF5 avatar disc, #DED0E9 grooming band, #9D67EF icon purple / selected border, #552583 primary
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

/**
 * Neutral ramp shared by every brand (Figma: text #181818, titles #000000, navy #11104A, labels #808080, body muted
 * #7C7E93, hints #A1A1A1, borders #DFDFDF / #D8DADE / #D4D4D4 / #B6B6B6, inputs #F1F1F1, bars #EDEDED, list bg #F4F6FA,
 * form bg #EEF2F5, card stroke #F3F3F3).
 */
export const neutrals = {
  'n-0': '#FFFFFF', 'n-25': '#FBFBFC', 'n-50': '#F7F7F7', 'n-60': '#F3F3F3', 'n-75': '#F4F6FA', 'n-100': '#EEF2F5', 'n-125': '#F1F1F1',
  'n-150': '#EDEDED', 'n-175': '#DFDFDF', 'n-200': '#E0E0E0', 'n-300': '#D8DADE', 'n-350': '#D4D4D4', 'n-375': '#D0D5DD',
  'n-400': '#B6B6B6', 'n-450': '#A1A1A1', 'n-500': '#93939C', 'n-550': '#808080', 'n-600': '#7C7E93',
  'n-650': '#5E6A6C', 'n-700': '#4B4D5E', 'n-750': '#33363F', 'n-800': '#2A2933', 'n-850': '#1C1C24', 'n-900': '#14131A',
  'n-925': '#181818', 'n-950': '#0E0C11', 'n-1000': '#000000',
  'navy': '#11104A', 'slate': '#304050', 'slate-2': '#3B4256',
} as const;

/**
 * Status colours. Figma: success #27B14E (status pill) / #039B00 (fine print) / #148F00 (desk detail) / #62BA20 (home
 * "Upcoming"); pending #FF7A00; needs-details #FF6868; coral icons #FD866E; danger #F04336; nav badge dot #BF0000;
 * info #1456F5; desk "Completed" badge #E9FBF7 / #25D9AB.
 */
export const status = {
  light: {
    success: '#27B14E', successBg: '#E6F6E5', successText: '#039B00', successStrong: '#148F00',
    warn: '#FF7A00', warnBg: '#FFF3E0', danger: '#F04336', dangerBg: '#FDECEA', dangerSoft: '#FF6868',
    info: '#1456F5', infoBg: '#E8EEFE', coral: '#FD866E', coralSoft: '#FFE9E3', badge: '#BF0000',
    completed: '#25D9AB', completedBg: '#E9FBF7',
  },
  dark: {
    success: '#5FD65B', successBg: '#173A16', successText: '#7BE077', successStrong: '#5FD65B',
    warn: '#FFA03D', warnBg: '#3D2A0A', danger: '#FF7B70', dangerBg: '#4A1B17', dangerSoft: '#FF8C8C',
    info: '#7DA0FF', infoBg: '#17245A', coral: '#FF9A85', coralSoft: 'rgba(253,134,110,.18)', badge: '#FF5C5C',
    completed: '#4EE3BC', completedBg: 'rgba(37,217,171,.16)',
  },
} as const;

/** Booking lifecycle hues (R-I01 vocabulary; Figma flat fills: confirmed #27B14E, pending #FF7A00, needs details #FF6868, completed #25D9AB / #E9FBF7). */
export const bookingHues = {
  requested: { fg: '#7C7E93', bg: '#EEF2F5' },
  pending_vaccines: { fg: '#FF7A00', bg: '#FFF3E0' },
  confirmed: { fg: '#27B14E', bg: '#E6F6E5' },
  checked_in: { fg: '#B8337A', bg: '#FBE4F1' },
  checked_out: { fg: '#25D9AB', bg: '#E9FBF7' },
  cancelled: { fg: '#F04336', bg: '#FDECEA' },
  no_show: { fg: '#8A1C1C', bg: '#F5D5D5' },
} as const;

/** Semantic roles per theme. `{p}` placeholders are replaced with the brand palette / neutrals at generation time. */
export const semantic: Record<ThemeName, Record<string, string>> = {
  light: {
    'color-bg': '{primary50}',            // desk canvas #F4F0FF (front desk frames)
    'color-bg-phone': '{n-0}',            // customer home / auth screens are white
    'color-bg-phone-list': '{n-75}',      // #F4F6FA: My pets, profile, settings, notifications, grooming, checkout
    'color-bg-phone-form': '{n-100}',     // #EEF2F5: booking / pet edit / payment forms
    'color-band': '{n-100}',              // grey band behind the home Services tiles
    'color-surface': '{n-0}',             // cards, panels
    'color-surface-2': '{n-50}',          // subtle blocks, code, secondary tab pill
    'color-surface-3': '{n-100}',         // pressed, segmented track
    'color-surface-tint': '{primary50}',  // selected row, hover, tinted cards
    'color-surface-tint-2': '{primary25}',
    'color-surface-tint-band': '{primary200}', // #DED0E9 grooming upsell band
    'color-sidebar': '{n-0}',
    'color-sidebar-active': 'transparent', // Figma: purple text + icon, no fill
    'color-text': '{n-925}',              // #181818 body / card titles / input values
    'color-title': '{n-1000}',            // #000000 mobile page titles
    'color-heading': '{navy}',            // #11104A display headings, profile name, desk detail cards
    'color-text-secondary': '{slate}',    // #304050 card descriptions
    'color-text-option': '{slate-2}',     // #3B4256 checkbox / option labels
    'color-text-muted': '{n-600}',        // #7C7E93
    'color-label': '{n-550}',             // #808080 field labels / captions / home section labels
    'color-text-faint': '{n-450}',        // #A1A1A1 hints / placeholders
    'color-text-on-primary': '{n-0}',
    'color-primary': '{primary600}',
    'color-primary-hover': '{primary700}',
    'color-primary-soft': '{primary100}',
    'color-primary-text': '{primary600}',
    'color-icon-primary': '{primary400}', // #9D67EF settings-row / notification icons
    'color-icon-header': '{n-750}',       // #33363F back chevron
    'color-icon-muted': '#C0C2D4',        // row chevron (Arrow-Right.svg)
    'color-accent': '{accent}',
    'color-accent-soft': '{accentSoft}',
    'color-border': '{n-175}',            // #DFDFDF inputs, selects, list rules
    'color-border-card': '{n-300}',       // #D8DADE card outline
    'color-border-input': '{n-125}',      // #F1F1F1 mobile text input
    'color-border-bar': '{n-150}',        // #EDEDED desk top bar / search
    'color-border-row': '{n-350}',        // #D4D4D4 table row rule
    'color-border-track': '{n-375}',      // #D0D5DD stepper remaining track
    'color-border-strong': '{n-400}',     // #B6B6B6 mobile header rule
    'color-border-subtle': '{n-60}',      // #F3F3F3 desk card stroke
    'color-border-primary': '{primary400}', // #9D67EF 2 px selected card
    'color-table-head': '{primary600}',
    'color-table-head-text': '{n-0}',
    'color-table-zebra': 'rgba(0,0,0,.06)',
    'color-focus': '{primary400}',
    'color-scrim': 'rgba(50,50,50,.80)',
    'color-placeholder': '{n-200}',
    'shadow-color': '0,0,0',
  },
  dark: {
    'color-bg': '{n-900}',
    'color-bg-phone': '{n-900}',
    'color-bg-phone-list': '{n-950}',
    'color-bg-phone-form': '{n-950}',
    'color-band': '{n-850}',
    'color-surface': '{n-850}',
    'color-surface-2': '{n-800}',
    'color-surface-3': '{n-700}',
    'color-surface-tint': 'rgba(177,138,224,.14)',
    'color-surface-tint-2': 'rgba(177,138,224,.08)',
    'color-surface-tint-band': 'rgba(177,138,224,.22)',
    'color-sidebar': '{n-900}',
    'color-sidebar-active': 'transparent',
    'color-text': '{n-75}',
    'color-title': '{n-0}',
    'color-heading': '{n-0}',
    'color-text-secondary': '#C3C8D1',
    'color-text-option': '#D5D8E0',
    'color-text-muted': '#A9ABBD',
    'color-label': '#9A9CAF',
    'color-text-faint': '{n-500}',
    'color-text-on-primary': '{n-0}',
    'color-primary': '{primaryOnDark}',
    'color-primary-hover': '{primaryOnDarkHover}',
    'color-primary-soft': 'rgba(177,138,224,.20)',
    'color-primary-text': '{primaryOnDark}',
    'color-icon-primary': '{primaryOnDark}',
    'color-icon-header': '{n-75}',
    'color-icon-muted': 'rgba(255,255,255,.40)',
    'color-accent': '{accent}',
    'color-accent-soft': 'rgba(231,157,209,.18)',
    'color-border': 'rgba(255,255,255,.12)',
    'color-border-card': 'rgba(255,255,255,.12)',
    'color-border-input': 'rgba(255,255,255,.14)',
    'color-border-bar': 'rgba(255,255,255,.10)',
    'color-border-row': 'rgba(255,255,255,.12)',
    'color-border-track': 'rgba(255,255,255,.18)',
    'color-border-strong': 'rgba(255,255,255,.28)',
    'color-border-subtle': 'rgba(255,255,255,.08)',
    'color-border-primary': '{primaryOnDark}',
    'color-table-head': '{primary700}',
    'color-table-head-text': '{n-0}',
    'color-table-zebra': 'rgba(255,255,255,.05)',
    'color-focus': '{primaryOnDark}',
    'color-scrim': 'rgba(0,0,0,.72)',
    'color-placeholder': '{n-700}',
    'shadow-color': '0,0,0',
  },
};

/**
 * Typography (D-188 proposed). Open Sans 400/600/700 carries the mobile app and the front desk; Be Vietnam Pro
 * 400/500/600 is the display face (auth titles, profile name, desk detail headings). Both load from @fontsource
 * (main.tsx); the metric fallbacks live in global.css. Scale 12/14/16/18/20/22/24/32 - the Figma 8 px and 10 px roles
 * render at the 12 px floor (D-175) with the Figma colour and weight.
 */
export const type = {
  'font-sans': "'Open Sans', 'Open Sans Fallback', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  'font-display': "'Be Vietnam Pro', 'Open Sans', 'Open Sans Fallback', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  'font-mono': "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  'fs-2xs': '12px', 'fs-xs': '12px', 'fs-sm': '14px', 'fs-md': '16px', 'fs-lg-2': '18px', 'fs-lg': '20px', 'fs-xl-2': '22px', 'fs-xl': '24px', 'fs-2xl': '32px', 'fs-3xl': '40px',
  'lh-xs': '16px', 'lh-sm': '20px', 'lh-md': '24px', 'lh-lg': '28px', 'lh-xl': '32px', 'lh-2xl': '40px',
  'lh-tight': '1.2', 'lh-title': '1.35', 'lh-base': '1.5',
  'fw-regular': '400', 'fw-medium': '500', 'fw-semibold': '600', 'fw-bold': '700',
  'ls-eyebrow': '0.08em', 'ls-body': '0.01em', 'ls-button': '0.04em',
} as const;

/** 4-pt grid (Figma gutters: 20 booking / form screens, 10 hotel cards, 24 profile lists, 15 notification list). */
export const spacing = {
  'sp-0': '0', 'sp-1': '4px', 'sp-2': '8px', 'sp-3': '12px', 'sp-4': '16px', 'sp-5': '20px', 'sp-6': '24px',
  'sp-8': '32px', 'sp-10': '40px', 'sp-12': '48px', 'sp-16': '64px', 'sp-20': '80px',
} as const;

/** Figma radii: 8 buttons / rows / tiles / payment cards, 10 pet + room cards, 4 mobile text input + desk badge, 3 table checkbox, 24 pills. */
export const radii = {
  'r-xs': '2px', 'r-cb': '3px', 'r-sm': '4px', 'r-input': '4px', 'r-md': '8px', 'r-card': '10px', 'r-lg': '12px', 'r-xl': '16px', 'r-pill': '24px', 'r-full': '999px', 'r-round': '50%',
} as const;

/** Figma effects: mobile cards carry no shadow (borders do the edge), unselected pet cards `0 0 5 #441D67`, desk cards the two-layer black pair. */
export const shadows = {
  'shadow-sm': '0 1px 2px rgba(var(--shadow-color),.06)',
  'shadow-md': '0 2px 4px -2px rgba(var(--shadow-color),.06), 0 5px 8px -2px rgba(var(--shadow-color),.08)',
  'shadow-desk': '0 2px 4px -2px rgba(var(--shadow-color),.06), 0 5px 8px -2px rgba(var(--shadow-color),.08)',
  'shadow-pet': '0 0 5px rgba(68,29,103,.35)',
  'shadow-lg': '0 12px 32px -12px rgba(var(--shadow-color),.22), 0 2px 6px rgba(var(--shadow-color),.08)',
  'shadow-xl': '0 24px 64px -20px rgba(var(--shadow-color),.35), 0 4px 12px rgba(var(--shadow-color),.10)',
  'shadow-focus': '0 0 0 3px color-mix(in srgb, var(--color-focus) 35%, transparent)',
} as const;

export const motion = {
  'dur-fast': '120ms', 'dur-base': '200ms', 'dur-slow': '320ms',
  'ease-out': 'cubic-bezier(.2,.7,.2,1)', 'ease-in-out': 'cubic-bezier(.65,0,.35,1)',
} as const;

/** Layout sizes from the designs: sidebar 243, top bar 80, bottom nav 71, table row 44 / head 49, controls 48 / 40 / 28, phone 390. */
export const layoutTokens = {
  'w-phone': '390px', 'w-phone-max': '430px', 'w-content': '1280px', 'w-sidebar': '243px', 'w-rail': '72px',
  'h-topbar': '80px', 'h-bottomnav': '71px', 'h-row': '44px', 'h-thead': '49px', 'h-control': '48px', 'h-control-sm': '40px', 'h-control-xs': '28px',
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
  const stVars = {
    'color-success': st.success, 'color-success-bg': st.successBg, 'color-success-text': st.successText, 'color-success-strong': st.successStrong,
    'color-warn': st.warn, 'color-warn-bg': st.warnBg, 'color-danger': st.danger, 'color-danger-bg': st.dangerBg, 'color-danger-soft': st.dangerSoft,
    'color-info': st.info, 'color-info-bg': st.infoBg, 'color-accent-coral': st.coral, 'color-accent-coral-soft': st.coralSoft, 'color-badge': st.badge,
    'color-completed': st.completed, 'color-completed-bg': st.completedBg,
  };
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
  css += `:root[data-skin="wireframe"] { --color-primary: #3A3A3A; --color-primary-hover: #232323; --color-primary-text: #3A3A3A; --color-surface-tint: #F2F1ED; --color-sidebar-active: #F2F1ED; --shadow-md: none; --shadow-desk: none; --shadow-lg: none; --shadow-xl: none; }\n`;
  return css;
}
