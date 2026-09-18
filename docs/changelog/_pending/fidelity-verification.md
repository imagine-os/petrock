# pending - Figma fidelity part (d): merge, tokens asked by part (c), side-by-side composites, two fix rounds

version: 0.2.0
date: 2026-09-18
prompt: 0013 (workflow: merge `fidelity/customer-screens` + `fidelity/frontdesk-shell`, verify against the exports)
intent: Land parts (b) and (c) on main, give them the tokens they asked for, and measure the result against the Figma exports with reproducible composites so the remaining deltas are visible instead of argued.
decision: Similarity is a rough index (block SSIM + global SSIM + colour histogram) documented in `docs/design/fidelity/README.md`; it guides, it does not gate. Alert modals use a 0.20 scrim (`--color-scrim-soft`) while desk modals keep 0.80 (front desk-3.jpg). Timeline alternating columns are the export's `#CDD2D8` / `#B1B8C2`, not `--color-surface-3`.
rejected: embedding the hero / pet photos cropped out of the exports (no licence, 1x only); rebuilding C-33 to the two-up component export inside this pass (structural, needs Justin on the flow); removing the location switcher / view switch from the desk toolbars (binding rules).
files: src/design/tokens.ts (+ tokens.css), src/components/organism/{Modal,RoomTimeline,Sidebar}, molecule/StayDatesCard, template/DesktopShell, src/modules/admin-control-panel/DashboardPage.tsx, scripts/fidelity-shots.mjs (new), scripts/fidelity-composite.py (new), docs/design/fidelity/ (new)
codes: C-10, C-13, C-14, C-30, C-33, C-70, F-01, F-10, F-13, A-01

## What changed

- **Merged** `fidelity/customer-screens` (b71c534) and `fidelity/frontdesk-shell` (a5f7a2e) with `--no-ff`; only `docs/kanban.md` conflicted. Worktrees and branches removed.
- **Tokens** requested by part (c): `--timeline-<status>-fill` (confirmed `#B4F0A0`, checked_in `#7A7CE3`, checked_out `#FFF0B3`, pending_vaccines `#C9A6E9`, requested `#D18ACF`, daycare `#00D8D8`, plus cancelled / no_show) with dark derivations, `--color-border-grid #D9D9D9` (timeline hairlines, sidebar group dividers), `h-control-field` 40 (DesktopShell `--h-field`).
- **Round 1**: `--color-scrim-soft` for `Modal size="alert"`; `--color-grid-alt` / `--color-grid-alt-head` on RoomTimeline; `--color-field-fill` on StayDatesCard fields; RoomTimeline group rows on `--color-border-grid`; A-01 "Revenue today" KPI no longer filled (front desk-4.jpg cards are all white).
- **Round 2**: alert `Back` button in primary text; StayDatesCard calendar chromeless (Hotel Reservation.png); capture script grows the viewport to the content so fixed footers do not overlap.
- **Tooling**: `node scripts/fidelity-shots.mjs` (12 captures incl. C-10 with pets / no pets / gate alert) and `python3 scripts/fidelity-composite.py --label=<label>` (composites + `scores.json`). Results and per-pair deltas: `docs/design/fidelity/README.md`.

## Similarity before -> after

See the table in `docs/design/fidelity/README.md` (C-10-gate 0.38 -> 0.70, C-13 0.44 -> 0.58, C-30 0.41 -> 0.60, F-13 0.47 -> 0.59, A-01 0.50 -> 0.54; others unchanged within noise).

## Remaining known deltas

Hero and pet photos (no licensed assets); C-33 layout vs the two-up component export; C-14 5-step stepper vs the 2-step Add Pet frame; desk toolbars keep the view switch, location pill and week chips; F-01 / A-01 layouts differ from the single owner dashboard export by design; seed data is sparser than the mock rows in the exports.

- **QA**: `qa:responsive` 1810 cells, 0 failing (a11y findings 8356 -> 8216); `scripts/qa-fixes-e2e.mjs` 11/11 after updating its manager-menu step (code pills are dev-mode only and the brand is the logo image since part (c)); screenshots C-10 / C-30 / F-13 / A-01 / F-01 regenerated, no console errors.
