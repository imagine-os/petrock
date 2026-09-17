# Design tokens (DRAFT, derived)

> **Status: derived, not designer-authored.** Extracted 2026-09-17 from 1,458 scanned nodes on the Figma page `new(justin + Mark)` (see `docs/figma/deep-dive.md`, section 6). Figma has no authored token set; per D-007 the design system is rebuilt fresh, with light/dark mode and easy new themes. Values here are the observed starting point and are expected to change when the real token set is authored. Coverage is partial (Figma API quota exhausted mid-pass; second pass after ~2026-09-22).

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
