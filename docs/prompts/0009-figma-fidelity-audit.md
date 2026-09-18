# 0009 - Figma fidelity audit

date: 2026-09-18 · from: Justin Massion (Slack thread 1789669007.022039) via the workflow orchestrator · surface: design system

## Prompt

Justin: "I need you to get the design to actually look closer to the artwork. From figma, the icons, the colors, especially the homepage on mobile, everything needs to match the exact styling from before. Please fix this at the design system level."

Orchestrator task (summary): produce the design-fidelity audit the implementation agents will follow, `docs/design/fidelity-audit.md`, with (1) exact tokens from the node JSON with node ids and a delta table against `src/design/tokens.ts`, (2) icon inventory mapped to the exported SVGs, (3) component specs vs current CSS, (4) screen layout deltas (C-10 first) between exports and `docs/screenshots/<CODE>/390.jpg`, (5) a numbered plan split into (a) shared tokens / fonts / icons / core components, (b) customer screens, (c) front desk shell, with acceptance criteria and the export to compare against. Figma API not to be called (quota until ~Sep 22); sources are the offline node JSON and `docs/figma/exports/petrock-main`.

## Response

Numbering: prompt 0008 and decisions D-183 / D-184 were taken by the parallel open-questions Q&A (`docs/prompts/0008-open-questions-qa.md`, changelog 0021) while this audit was written, so this log is 0009 and the audit's proposed decisions are D-185..D-188.

Written to `docs/design/fidelity-audit.md` (≈9,000 words). Key findings:

- The mobile screens are Open Sans (≈70 of ≈85 deep text nodes), Be Vietnam Pro in auth / profile / front-desk detail cards, Lexend 300 only for hints; the build uses Inter everywhere. Fonts to load via `@fontsource/open-sans` + `@fontsource/be-vietnam-pro` (both 5.3.0 reachable through the proxy).
- Screen backgrounds are three tones (`#FFFFFF` home, `#F4F6FA` lists, `#EEF2F5` forms); desktop canvas is `#F4F0FF`, not `#F4F6FA`. Text is `#181818` / `#808080` / `#A1A1A1`, borders `#DFDFDF` / `#D8DADE` / `#F1F1F1`, selected cards `#9D67EF` 2 px, statuses `#27B14E` / `#FF7A00` / `#FF6868`, icon pair `#9D67EF` / `#FD866E`.
- Bottom nav is a 71 px purple bar with four unlabelled white icons (MingCute `Home_light`, custom ticket, paw-in-disc with a `#BF0000` dot, `Setting_line_light`); headers are Open Sans 600 20 black with a 1 px `#B6B6B6` rule; buttons 48 tall r8; mobile text inputs r4 with 10 px grey labels.
- Front desk: 243 px white sidebar without border, 80 px top bar with the search on the left, purple 49 px table head with white labels, 44 px rows, mint `#E9FBF7` / `#25D9AB` badge, two-layer black shadows on cards.
- Icons: 29 exported SVGs mapped; the four service-tile glyphs and the sidebar icons are not exported (marked "missing, needs Design System export", interim vectorisation from `Services.png`).
- Plan: (a) 6 shared items, (b) 5 customer-screen items, (c) 4 front-desk items, each with acceptance criteria and the export to compare against; four proposed decisions (D-187..D-188) for Justin.
