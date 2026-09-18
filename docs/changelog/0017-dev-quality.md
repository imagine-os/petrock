# 0017 - developer tooling depth (D-08..D-19)

version: 0.2.0 (proposed)
date: 2026-09-18
prompt: 0005
module: dev-quality
intent: Give builders and the integrator the quality tools the definition of done needs: a component states matrix with a11y coverage, a spec completeness report with every unresolved reference, a data workbench (inline edit, relations, CSV import / export), a layout editor persisted to page_layouts, a responsive + a11y QA script over every route at five widths in both themes with an in-app matrix and live preview, a seed inspector over a year of demo history, performance budgets from a table, a screenshot diff, docs search and a hardened route manifest.
decision: docs/decisions/_pending/dev-quality.md (D-167..D-174: R-X80..R-X87 id band, budgets as rows, history seed shape, layout adoption via useLayout, a11y heuristics, preview ports, docs viewer edit, CSV PIN threshold).
rejected: @dnd-kit for the layout editor (HTML5 drag + arrow buttons need no dependency and keep keyboards first-class); a second table manager route at /dev/tables/:table (the registry keeps the first built module alphabetically, so the workbench lives at /dev/data and D-04 links to it); writing qa_runs rows from Node (scripts cannot reach the browser's localStorage; the page reads the bundled JSON instead); bundling a screenshot pixel-diff library (visual compare with split / blend covers the review need without adding 300 kB).
files: src/modules/dev-quality/** (12 pages, specs, specReport.ts, a11yScan.ts, qaReports.ts, docsSearch.ts, screenshots.ts, dev-quality.css), src/components/molecule/{ViewportFrame,ImageCompare,BudgetBar,MiniBarChart,InlineCell,SearchHitList}, src/components/organism/{QaMatrix,LayoutSectionList,TableRelationsPanel,CsvImportModal}, src/layout/useLayout.ts, src/data/schema/dev-quality.ts (qa_runs, perf_budgets), src/data/seed/dev-quality.ts (a year of history, budgets), src/rules/dev-quality.ts (R-X80..R-X87), scripts/{qa-lib,qa-responsive,qa-bundle}.mjs, scripts/screenshots.mjs (hardened), package.json (qa scripts), src/modules/docs/DocsBrowser.tsx (sidebar filter + search link), src/modules/dev/TablesPage.tsx (link to the workbench), supabase/schema.sql + docs/data-model.md (regenerated), docs/qa/{responsive-report,bundle-report}.{md,json}, docs/pages/D-08..D-19.md, docs/screenshots/D-08..D-19/, docs/ops-manual/en/_pending/dev-quality.md, docs/decisions/_pending/dev-quality.md
codes: D-08, D-09, D-10, D-11, D-12, D-13, D-14, D-15, D-16, D-17, D-18, D-19

## What exists now

- **D-08 Component states matrix** (`/dev/components/matrix`): every component x states / usages / props / a11y notes / pages / Figma, with gap badges. All 52 components have usages and a11y notes after this pass.
- **D-09 Spec completeness report** (`/dev/specs/report`): missing fields, unknown tables / components / rules, unchecked widths, stubs, duplicate and out-of-range codes, missing menu entries; markdown export. `CODE_RANGES` mirrors `docs/build-plan.md`.
- **D-10 Data workbench** (`/dev/data`, `/dev/data/:table`): `InlineCell` per column, `TableRelationsPanel` (outgoing / incoming refs with row filters via `?ref=column:id`), CSV export of the filtered view, `CsvImportModal` (file or paste, header mapping, coercion, insert / upsert). Deletes and imports > 1 row go through `PinApprovalModal`; every write audits.
- **D-11 Layout editor** (`/dev/layout`, `/dev/layout/:code`): `LayoutSectionList` (drag, arrows, show / hide) saved to `page_layouts`; `src/layout/useLayout.ts` is the hook pages adopt (`applyLayout` keeps new spec sections).
- **D-12 Responsive QA report** (`/dev/qa/responsive`): `QaMatrix` over `docs/qa/responsive-report.json`, cell drawer with offenders / errors / a11y, `qa_runs` table.
- **D-13 Responsive preview** (`/dev/qa/preview`): `ViewportFrame` x 360 / 390 / 768 / 1280 / 1920 or one width full size.
- **D-14 Seed inspector** (`/dev/seed`): counts, `MiniBarChart` x4 for the last twelve months, coverage per table, storage, reseed, JSON export.
- **D-15 Accessibility scan** (`/dev/qa/a11y`): `scanA11y()` live in an iframe; same module compiled by esbuild for the script.
- **D-16 Performance budget** (`/dev/qa/perf`): `BudgetBar` per `perf_budgets` row against `bundle-report.json` and runtime numbers.
- **D-17 Screenshot diff** (`/dev/qa/screenshots`): coverage per code and `ImageCompare` (split / side / blend) between a `--label=before` baseline and the current capture.
- **D-18 Docs search** (`/dev/docs-search`): full text over the bundled docs with folder filter and highlighted snippets; the docs sidebar filters titles and links here.
- **D-19 Route manifest** (`/dev/routes`): the registry as tooling sees it, collisions, code ranges, `routes.json` download.
- **Scripts**: `npm run qa:responsive` (every manifest route x 5 widths x 2 themes -> `docs/qa/responsive-report.{md,json}`, exit 1 on any horizontal scroll or console error), `npm run qa:bundle` (dist sizes -> `docs/qa/bundle-report.{md,json}`), `npm run qa` (both). `scripts/screenshots.mjs` now waits for the preview server, refuses a busy port, retries the manifest, fills every known param, supports `--widths` and `--port`.
- **Seed**: `src/data/seed/dev-quality.ts` adds ~250 checked-out stays, ~400 grooming appointments, ~230 daycare days with ~800 paid invoices / payments over the past year (priced by the engine), monthly reviews, 9 `perf_budgets`, 1 `qa_runs`. The database snapshot is ~1.5 MB.
- **Rules**: R-X80..R-X87 in `src/rules/dev-quality.ts` (all `implemented`).

## Findings from the first full QA pass

See `docs/qa/responsive-report.md` (regenerated each run). The pass over this branch found no horizontal scroll on the dev-quality pages; remaining a11y warnings are `target-size` on the foundation `PageHeader` back link (18 px tall) and `heading-skip` where `EmptyState` renders an h3 directly under a page h1.
