# 0024 - Figma fidelity audit (design system)

version: 0.2.0 (docs only)
date: 2026-09-18
prompt: 0009
intent: Audit v0.1.0 against the Figma customer-app and front-desk artwork so the design fix lands in tokens, fonts, icons and shared components (not per-page overrides): exact colour / type / radius / spacing / shadow tokens with node ids, icon inventory and mapping to the exported SVGs, component-by-component CSS deltas, screen layout deltas (C-10 first), and a numbered plan (a) shared, (b) customer screens, (c) front desk shell.
decision: D-188 (proposed; numbered D-185 in the audit text before prompt 0011 took D-185..D-187) Open Sans replaces Inter as the app family, Be Vietnam Pro for display roles; D-189..D-191 (proposed) home header without location chip / bell, wizard stepper count, hotel flow without stepper - defaults stated in the audit, Justin to confirm.
rejected: per-page colour overrides (Justin asked for the design-system level); calling the Figma API (quota exhausted until ~Sep 22, the audit uses the offline node JSON and exports and marks pixel-derived values).
files: docs/design/fidelity-audit.md (new), docs/prompts/0009-figma-fidelity-audit.md (new), docs/kanban.md, docs/changelog/_pending/design-fidelity-audit.md
codes: C-10, C-11, C-12, C-13, C-30..C-36, C-50, C-60, C-70, C-72, C-80, F-01, F-10, F-13
