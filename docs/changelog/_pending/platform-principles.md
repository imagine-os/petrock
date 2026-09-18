# pending - Platform principles: quality bar, input modalities, control abilities, annotations, placeholders, surfaces

version: 0.2.0
date: 2026-09-18
prompt: 0014
intent: Record Justin's standing principles (works on 4K TVs; keyboard / mouse / trackpad / touch / pen now, TV remote / gamepad / voice soon; every change updates control and voice abilities; tables, design system and component library managed in the product; in-product annotations and submissions with agent triage; placeholder UI must announce itself; MCP / CLI / API surfaces recorded every pass; memory system always current; Hub deliverable batch and view-as until real auth; en / es toggle; multiplayer / realtime expectations; Company-OS at 2027+ strength) as rules an agent can apply, and queue the code work.
decision: D-193..D-209 (binding for Justin's statements; D-194 TV widths and 10-foot rules, D-197 `actions` manifest shape + D-20, D-200 annotation columns and pins, D-202 `Placeholder` design proposed)
rejected: changing src in this turn (docs only; kanban cards carry the code work); adding 2560 / 3840 to the full QA matrix immediately (key pages first, D-194); a separate annotations table (the `feedback` table is extended so A-36 stays the one inbox)
files: docs/platform-principles.md (new), docs/reference/surfaces.md (new), CLAUDE.md, docs/decisions.md, docs/kanban.md, docs/README.md, docs/prompts/0014-quality-bar-and-platform-principles.md, docs/changelog/_pending/platform-principles.md
codes: HUB-01, A-36, D-20 (reserved: actions registry), D-016 matrix

## What changed

- **`docs/platform-principles.md`**: P-01..P-15 in twelve groups (quality bar, input modalities, control and voice, tables / design system / library, annotations, placeholders, surfaces, memory, hub, multilingual, multiplayer, Company-OS), each with the rule, today's state and the queued work; a per-change checklist at the end.
- **`CLAUDE.md`**: "Quality bar & platform principles" section; Responsive rule now 360, 390, 768, 1280, 1920, 2560, 3840; rules for `Placeholder` marking, the `spec.actions` manifest, en / es strings and `docs/reference/surfaces.md`.
- **`docs/reference/surfaces.md`**: route manifest (`window.__petrock.routes`), `DataProvider` methods, npm scripts and flags, no HTTP API, no MCP yet; planned WebMCP tools from the actions registry, CLI, realtime, annotations API.
- **`docs/decisions.md`**: D-193..D-209 appended.
- **`docs/kanban.md`**: seven backlog cards (4K / TV QA pass; `Placeholder` atom + dev-mode wiring into PageStub and toast-only actions; `actions` manifest + `/#/dev/actions` D-20; Annotations module with A-36 extension and triage doc; Spanish fill pass; d-pad spatial-navigation spike; presence / realtime plan doc) and a Done card.
- **`docs/README.md`**: start-here line, rows for `platform-principles.md` and `reference/surfaces.md`.
- No source changes; `npm run build` green.
