# docs/

**Start here** (agents and developers): this map, then `platform-principles.md` (binding principles P-01..P-15), `../CLAUDE.md` (rulebook and module contract), `build-plan.md`, `kanban.md` (state of work), `decisions.md` (why). How the Petrock documentation is organized. Conventions follow imagine-os/hoy (`docs/reference/hoy-patterns.md`, section 5): numbered files are **append-only** and never renumbered; documentation is written in the **same turn** as the work.

| Path | What goes there |
|---|---|
| `platform-principles.md` | The binding platform principles (P-01..P-15, D-193..D-209): quality bar incl. 4K TV, input modalities, control / voice abilities, annotations, placeholders, surfaces, memory, hub, en / es, multiplayer, Company-OS. Each with today's state and queued work. |
| `project-brief.md` | The brief: client, locations, scope, features, data layer, reference repos, org rules. Updated as Justin decides things. |
| `decisions.md` | Decision log: one row per decision (`D-001`, ...), with date, source prompt and status. Append-only; reversals add a new row and mark the old one superseded. |
| `kanban.md` | `## Backlog` / `## Doing` / `## Done` lanes, one `- ` card per line. |
| `prompts/NNNN-slug.md` | Prompt log. Header (source, date, requester), `## Prompt (verbatim)`, then the exact heading `## Response` with the reply. One file per prompt. |
| `changelog/NNNN-slug.md` | Changelog. Header lines `version:`, `date:`, `prompt:`, `intent:`, `decision:`, `rejected:`, `files:`, `codes:`, then a markdown body. One file per change set. |
| `figma/` | `README.md` (file key, pages, page id, API quota status), `analysis.md` (full inventory + decisions needed), `deep-dive.md` (second pass: gap check, timeline views, vaccines, spa/grooming, draft tokens; derived, partial), `screen-catalog.md` (**source of truth for building screens**: every export described, duplicates collapsed, second-pass flags), `open-questions.md` (merged questions for Justin / the designer, grouped by flow), `exports/` (manual Figma exports, per drop), `renders/` (PNG exports and zoom crops). |
| `design/` | `tokens-draft.md` (derived color/type/spacing/icon tokens from Figma; input to the rebuilt design system), `components-from-designs.md` (component inventory from the exports: name, where used, variants/states, gaps). Later: `design-system.md`. |
| `data/` | `entities-from-designs.md` (entities and fields implied by the screens, per surface, with contradictions). Later: `data-model.md` generated from the table library. |
| `rules/` | `business-rules-from-designs.md` (every rule, price, threshold and copy seen, with source screen; seed for the rules registry, D-006). Later: the registry export itself. |
| `reference/` | Digests of reference repos: `hoy-patterns.md`, `company-os.md`, `santa-maria-os.md`, `petrockhotel-site.md`, **`petrockhotel-scrape/`** (the 2026-09-20 full crawl of the client site: `INVENTORY.md`, per-page markdown, 50 originals - the content source set for the public website, D-224), `pricing-adoption-2026-09-20.md` (the before / after of the prices adopted from the live site, D-229); **`surfaces.md`**: every machine-drivable surface (route manifest, `DataProvider`, scripts, actions, API, planned WebMCP / CLI), updated every pass (P-10). |

Numbering: prompts and changelogs share a counter per folder (`0001`, `0002`, ...). A changelog's `prompt:` line points at the prompt number that caused it.

Added with the app (v0.1.0, changelog 0007):

| Path | What goes there |
|---|---|
| `build-plan.md` | Phases, module list with page-code ranges and stubs to replace, definition of done. |
| `pages/<CODE>.md` | One doc per page from `pages/_TEMPLATE.md` (purpose, screenshots, sections, data, rules, logic, components, real vs mock, responsive check). |
| `screenshots/<CODE>/<width>[-dark].jpg` | Playwright captures (`npm run screenshots`), plus `routes.json` (route manifest). |
| `changelog/_pending/<module>.md` | Module drafts, merged into the next numbered entry by the integrator. |
| `data-model.md` | GENERATED from `src/data/schema/*.ts` by `npm run sql` (with `supabase/schema.sql`). |
| `specs.md` | GENERATED route / spec index by `npm run specs`. |

The app renders all of this at `/#/docs` (D-06) and `/#/dev/knowledge` (D-07). Planned later: `ops-manual/` chapters (M-xx module), `roles.md`.
