# 0013 - Design fidelity part (d): merge and verify

date: 2026-09-18
from: Justin (Slack, relayed by the workflow harness): "I need you to get the design to actually look closer to the artwork. From figma, the icons, the colors, especially the homepage on mobile, everything needs to match the exact styling from before. Please fix this at the design system level."

## Prompt (computed task)

Merge `fidelity/customer-screens` then `fidelity/frontdesk-shell` (--no-ff), apply the token changes the screen agents requested, build green, remove worktrees and branches. Build side-by-side composites (Figma export left, app right, same width) for C-10 (each state), C-13, C-14, C-30, C-33, C-70, F-01, F-10, F-13, A-01 into `docs/design/fidelity/<CODE>.png`, compute a rough similarity per pair and list the top deltas by eye. Iterate up to two rounds fixing the largest deltas in shared components / tokens first, then pages; keep `qa:responsive` at 0 failing and run `scripts/qa-fixes-e2e.mjs`. Commit and push to main.

## Response

- Merges: `b71c534` (customer screens), `a5f7a2e` (front desk shell; kanban conflict resolved by hand). Tokens: `--timeline-<status>-fill`, `--color-border-grid`, `h-control-field`; RoomTimeline and Sidebar read them.
- Composites and scores: `docs/design/fidelity/README.md` (12 pairs, before / after, deltas). Scripts: `scripts/fidelity-shots.mjs`, `scripts/fidelity-composite.py`.
- Round 1 (tokens / shared): soft alert scrim, timeline alternating-column colours, stay-dates field fill, A-01 KPI cards white. Round 2: alert Back in primary text, chromeless phone calendar, capture viewport fix.
- Largest gains: C-10 gate 0.38 -> 0.70, C-30 0.41 -> 0.60, C-13 0.44 -> 0.58, F-13 0.47 -> 0.59. Flat: C-14, C-70, F-10 (0.82 already), F-01; C-33 stays at 0.38 because its export is a component two-up the page does not follow yet.
- Changelog draft `docs/changelog/_pending/fidelity-verification.md`; kanban updated.
