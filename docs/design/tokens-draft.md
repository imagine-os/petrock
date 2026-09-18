# Design tokens (DRAFT, derived)

> **Status: derived, not designer-authored.** Extracted 2026-09-17 from 1,458 scanned nodes on the Figma page `new(justin + Mark)` (see `docs/figma/deep-dive.md`, section 6). Figma has no authored token set; per D-007 the design system is rebuilt fresh, with light/dark mode and easy new themes. Values here are the observed starting point and are expected to change when the real token set is authored. Coverage is partial (Figma API quota exhausted mid-pass; second pass after ~2026-09-22).

> **Superseded (2026-09-18, D-217).** The values below were the 2026-09-17 extraction. The design system now lives in `src/design/tokens.ts` (the only source; `npm run tokens` writes `src/styles/tokens.css`) and the Figma-derived values with node ids are in [`fidelity-audit.md`](fidelity-audit.md); the measured result per screen is in [`fidelity/README.md`](fidelity/README.md). Keep this file for history; do not add tokens here.


## 6. Draft tokens (DERIVED - from 1,458 scanned nodes, not from a designer-authored system)

### Colors observed (solid fills, top 30, with usage counts)

| Hex | Count | Used on | Reading |
|---|---|---|---|
| #FFFFFF | 234 | frames, instances, text-on-purple | surface / on-primary |
| **#552583** | 153 | buttons, sidebar active, banners, headings | **brand primary (purple)** |
| #000000 | 86 | text | text default (old screens) |
| #F4F0FF | 57 | frames | primary tint / hover / selected row |
| #F4F6FA | 41 | frames | app background (desktop) |
| #D9D9D9 | 33 | rectangles, sections | placeholder grey |
| #EEF2F5 | 22 | frames | table header / card bg |
| #EBF1FE | 17 | text | text on dark? (light blue tint) |
| #F2F2F2 | 17 | rectangles | divider / disabled |
| #0E0C11 | 15 | vectors, text | ink (near-black) |
| #E6E6E6 | 12 | sections | canvas |
| #11104A | 9 | text, frames | heading navy |
| #E8DFF5 | 8 | ellipses | avatar bg (lavender) |
| #039B00 | 5 | text | success / "Active", "Completed" |
| #F7F7F7 | 5 | frames | subtle bg |
| #93939C | 4 | text | muted text |
| #FBF8FF | 4 | frames | primary tint 2 |
| #323232 @80% | 4 | rectangles | modal scrim |
| #7C7E93 | 4 | text | secondary text |
| #DED0E9 @50% | 3 | frames | primary tint border |
| #808080 / #757575 / #A1A1A1 | 2 each | text | placeholder text |
| #E79DD1 | 2 | ellipse | pink accent (avatar) |
| #AEDDE6 | 2 | rectangle | teal tag |
| #F04336 | 2 | rectangle | error / danger |
| #1456F5 | 1 | text | link blue |
| #4552CB @10% | 1 | rectangle | info tint |
| #1C1C24 | 1 | rectangle | dark surface |
| Strokes: #EDEDED 43, #B6B6B6 31, #552583 15, #D8DADE 5, #E0E0E0 4, #222222 5 | | | border-light, border-strong, border-primary |

Text styles named in the file point to a `Colors/Theme colors/secondary`, `Colors/Text colors/heading|body`, `Colors/BG, Icon, Boarder colors/background|border-light|white`, `Foundation/Blue/B0`, `Lazy Violet-300`, `Shy Black-100` taxonomy - use these as the seed names.

### Proposed color tokens

```
--color-primary-600: #552583   (brand purple, buttons, active nav, banners)
--color-primary-700: #43196A   (derived hover, not observed)
--color-primary-100: #E8DFF5   (avatar / chip bg)
--color-primary-50:  #F4F0FF   (selected row, hover, tinted cards)
--color-primary-25:  #FBF8FF
--color-secondary-500: #E79DD1 (pink accent - observed once, confirm)
--color-ink-900: #0E0C11       (primary text)
--color-ink-800: #11104A       (headings, navy)
--color-ink-600: #7C7E93       (secondary text)
--color-ink-500: #93939C       (muted / placeholder)
--color-border-strong: #B6B6B6
--color-border: #EDEDED
--color-border-subtle: #D8DADE
--color-bg-app: #F4F6FA
--color-bg-surface: #FFFFFF
--color-bg-table-head: #EEF2F5
--color-bg-subtle: #F7F7F7
--color-success: #039B00
--color-danger:  #F04336
--color-info:    #1456F5
--color-info-tint: rgba(69,82,203,.10)
--color-scrim: rgba(50,50,50,.80)
```
Dark mode: invert the ink/bg ramps (bg-app #0E0C11 / surface #1C1C24, ink-900 -> #F4F6FA), keep primary-600 but lift it to ~#7B4FB0 for contrast on dark; expose everything via CSS variables so theming is a token swap.

### Typography observed (screen-level; banner labels at 36-128 px excluded)

Families: **Open Sans** (dominant in screens; 600 @ 20 px is the page/screen title), **Inter** (14 px 500/400 body in newer components, styles `Inter/14/Regular`, `Inter/20/Semi Bold`), **Be Vietnam Pro** (14/16 px 400/500 in the auth screens), Lexend (banners only), Epilogue (1 stray). Sizes seen: 8, 10, 12, 14, 15, 16, 20, 22 px; line-heights ~1.2-1.7.

Proposed scale (pick **one** family - recommend Inter for product UI; Open Sans if brand insists):
```
--font-sans: "Inter", system-ui, sans-serif
--text-xs: 12px / 16px   (table meta, badges)          [observed OS 400 12/17, style Text xs]
--text-sm: 14px / 20px   (body, inputs, table cells)   [observed Inter 500 14/24, OS 600 14/24]
--text-md: 16px / 24px   (body large, card titles)     [observed OS 400 16/24, BVP 500 16/26]
--text-lg: 20px / 28px   (screen/page titles)          [observed OS 600 20/35 x34]
--text-xl: 24px / 32px   (dashboard headings h4)       [style Dashboard Typography/Heading/h4]
--text-2xl: 32px / 40px  (hero / KPI numbers)
weights: 400 regular, 500 medium, 600 semibold (700 only for KPI numbers)
```

### Spacing & radii

Radii observed: 0 (50, mostly rectangles), **8 px (38 - inputs, cards, buttons)**, 10 px (18 - mobile cards/pet cards), 24 px (6 - pills/badges), 12 px (3), 16 px (2), 50 px (2 - avatars/circles), 2-4 px (small chips/checkboxes).
```
--radius-xs: 2px   --radius-sm: 4px   --radius-md: 8px (default)   --radius-lg: 12px   --radius-xl: 16px   --radius-pill: 24px/999px   --radius-round: 50%
--space: 4-pt grid: 4, 8, 12, 16, 20, 24, 32, 40, 48 (mobile screen gutter 20 px = (390-350)/2 from Text Input 350 wide; desktop sidebar 243 expanded / 84 collapsed; top bar 80 high; table row ~48)
--shadow-md / --shadow-xl : reuse the two EFFECT styles
```

### Icons

Two sources in use: (1) **Hugeicons outline** (`Huge-icon/<category>/outline/<name>`: notification, chat-notification, user, direction-right, information-circle), (2) a custom `_light` / `_line_light` set on the Design System page (`Home_light`, `Setting_line_light`, `Question_light`, `pie_chart_light`, `Chart_light`), plus one-offs `Expand_left` (back chevron, 32 uses), `Ellipsis horizontal 1 - 16px`, `Arrow-Left`, `Message`, `logo_icon 1` (42x40 brand mark), iOS status-bar glyphs (Wifi, Mobile Signal). Recommendation: standardise on one outline set (Hugeicons or Lucide) at 16/20/24 px, keep `logo_icon` as the only custom asset.

---

## 7. Implemented tokens (2026-09-18, Figma fidelity part a)

`src/design/tokens.ts` now carries the values read from the Figma node JSON in `docs/design/fidelity-audit.md` (section 1, every value with its node id). Generated into `src/styles/tokens.css` by `npm run tokens`. What moved off the draft above:

| Token | Value (light) | Figma role |
|---|---|---|
| `--font-sans` | Open Sans 400/600/700 (`@fontsource/open-sans`) | every mobile + front desk text (D-188) |
| `--font-display` | Be Vietnam Pro 400/500/600 (`@fontsource/be-vietnam-pro`) | auth titles, profile / pet names, settings rows, desk detail headings, StatTile values |
| `--fs-lg-2` / `--fs-xl-2` | 18 / 22 px | calendar month, auth title |
| `--lh-title` / `--ls-body` / `--ls-button` | 1.35 / .01em / .04em | mobile titles, 16 px body, desk buttons |
| `--color-bg` | `#F4F0FF` | desk canvas (was `#F4F6FA`) |
| `--color-bg-phone` / `-list` / `-form` | `#FFFFFF` / `#F4F6FA` / `#EEF2F5` | home & auth / list screens / booking + pet forms (`spec.tone`, PhoneShell) |
| `--color-band` | `#EEF2F5` | grey band behind the Services tiles |
| `--color-title` / `--color-text` | `#000000` / `#181818` | mobile page titles / body, card titles, input values |
| `--color-label` / `--color-text-faint` | `#808080` / `#A1A1A1` | field labels, home section labels / hints |
| `--color-text-secondary` / `--color-text-option` | `#304050` / `#3B4256` | card descriptions / checkbox labels |
| `--color-border` / `-card` / `-input` / `-bar` / `-row` / `-track` / `-strong` / `-subtle` | `#DFDFDF` / `#D8DADE` / `#F1F1F1` / `#EDEDED` / `#D4D4D4` / `#D0D5DD` / `#B6B6B6` / `#F3F3F3` | selects + list rules / cards / mobile text input / desk bar + search / table rows / stepper track / header rule / desk card stroke |
| `--color-border-primary` | `#9D67EF` (2 px) | selected pet / booking card |
| `--color-surface-tint-band` | `#DED0E9` | grooming upsell band |
| `--color-icon-primary` / `--color-accent-coral` / `--color-icon-header` / `--color-icon-muted` | `#9D67EF` / `#FD866E` / `#33363F` / `#C0C2D4` | settings-row icon pair / back chevron / row chevron |
| `--color-success` / `-text` / `-strong` | `#27B14E` / `#039B00` / `#148F00` | status pill / fine print / desk detail |
| `--color-warn` / `--color-danger-soft` / `--color-badge` | `#FF7A00` / `#FF6868` / `#BF0000` | pending / needs details / nav badge dot |
| `--color-completed` / `-bg` | `#25D9AB` / `#E9FBF7` | desk "Completed" badge, `checked_out` hue |
| `--color-table-head` / `-text` / `--color-table-zebra` | `#552583` / `#FFFFFF` / `rgba(0,0,0,.06)` | table head, form-table zebra |
| `--r-input` / `--r-cb` | 4 / 3 px | mobile text input / table checkbox |
| `--shadow-md` = `--shadow-desk` / `--shadow-pet` | `0 2 4 -2 .06 + 0 5 8 -2 .08` black / `0 0 5 rgba(68,29,103,.35)` | desk cards / unselected pet card; mobile cards carry no shadow |
| `--h-bottomnav` / `--h-topbar` / `--w-sidebar` | 71 / 80 / 243 px | Navbar / top bar / sidebar |
| `--h-control` / `-sm` / `-xs` / `--h-row` / `--h-thead` | 48 / 40 / 28 / 44 / 49 px | buttons + inputs / compact / mobile select / table row / head |

Dark theme (no Figma dark screens) is derived from the same palette: bg `#14131A`, surface `#1C1C24`, text `#F4F6FA`, muted `#A9ABBD`, borders `rgba(255,255,255,.12)`, primary lifted to `#B18AE0`, table head `{primary700}`, coral / purple icon pair kept. The `sunset` brand still resolves every placeholder. The 12 px floor (D-175) stays: Figma 8 / 10 px roles render at `--fs-xs` with the Figma colour and weight.

Shell skins: `PhoneShell` sets `--r-field: var(--r-input)`, `--color-border-field: var(--color-border-input)`, `--fs-field: 16px`, `--fw-field: 600`, `--section-title-*` (grey 400 labels), `--shadow-card: none`; `DesktopShell` sets `--r-field: var(--r-md)`, `--color-border-field: var(--color-border-bar)`, `--fs-field: 14px`, `--shadow-card: var(--shadow-desk)`, `--color-border-card-skin: var(--color-border-subtle)`. Components read these so one CSS serves both surfaces.
