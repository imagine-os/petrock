# Surfaces: routes, data, scripts, MCP / CLI / API

Every surface a machine (script, agent, voice controller, MCP client) can drive, recorded every pass (principle P-10, D-203). Update this file in the same turn as any change to a route, `DataProvider` method, npm script, action or API. Last full pass: 2026-09-20 (prompt 0016).

## 1. What exists today

### 1.1 Route manifest (in the running app)

`src/app/manifest.ts` publishes `window.__petrock = { routes, version }` on load. Each entry: `{ path, code, surface, status: 'built' | 'stub', roles, spec }` where `spec` is the full `PageSpec` (`src/specs/types.ts`: code, name, purpose, layout, data, roles, logic, integrations, components, rules, states, notes, figma, checkedAt, tone). Consumers: `scripts/screenshots.mjs`, `scripts/qa-responsive.mjs`, `scripts/gen-specs.mjs`, the D-19 route manifest page (download as JSON), D-03 / D-09 spec pages. Routing is `react-router-dom` HashRouter, so every page is `/#/<path>`; parameterised routes use `:id`, `:table`, `:code`. `spec.actions?: ActionDef[]` now exists (D-221, shape in section 2.1) and is published with the rest of the spec; HUB-01 is the first page to declare actions (7): `hub.enterAs`, `hub.openTool`, `hub.setLang`, `hub.toggleTheme`, `hub.setBrand`, `hub.toggleDevMode` (permission `dev.tools`), `hub.switchLocation`. Every other page's `actions` is still empty and the bus that runs them is not built (section 2.1).

### 1.2 Data: `DataProvider` (`src/data/provider.ts`)

The only way pages read and write data. Runtime implementation: `MockProvider` (localStorage `petrock.db.v1`, seeded from `src/data/seed/*`). Adapter seam: `CompanyOsProvider` (empty by decision D-183, Company-OS is reference only until Justin says otherwise).

| Method | Signature | Notes |
| --- | --- | --- |
| `list` | `list<T>(table, query?) => Promise<T[]>` | `Query = { where?, orderBy?: { column, dir }, limit?, offset? }`; `where` values may be arrays (IN) |
| `get` | `get<T>(table, id) => Promise<T \| null>` | |
| `insert` | `insert<T>(table, row: Partial<T>) => Promise<T>` | base columns `id`, `created_at`, `updated_at` (+ `location_id` for location-scoped tables) added by the provider |
| `update` | `update<T>(table, id, patch) => Promise<T>` | replaces the table array so subscribers get a new reference (D-180) |
| `remove` | `remove(table, id) => Promise<void>` | PIN-gated in UI for records (R-P01) |
| `subscribe` | `subscribe(table \| '*', cb: (e: ChangeEvent) => void) => unsubscribe` | `ChangeEvent = { table, type: insert \| update \| remove \| reset, row?, id? }`; the realtime seam (P-14) |
| `peek?` | `peek<T>(table, query?) => T[] \| undefined` | synchronous read of cached rows |
| `reset?` | `reset() => Promise<void>` | reseed (D-14 seed inspector) |

React access: `useData()`, `useTable(table, query)`, `useRow(table, id)` in `src/data/DataContext.tsx`. Schema registry: `src/data/schema/*.ts` (74 tables, `npm run sql` generates `supabase/schema.sql` and `docs/data-model.md`). Generic UI over the same interface: D-04 table manager, D-10 data workbench (CSV import / export).

Other seams: `PaymentProvider` (`src/payments/`, `MockPaymentProvider` now, `StripePaymentProvider` stub, no keys); `pricing/engine.ts` (`quoteHotel`, `quoteGrooming`, `quoteDaycare`) is pure and scriptable (`npm run test:pricing`).

### 1.3 npm scripts (the CLI today)

| Script | What | Flags |
| --- | --- | --- |
| `npm run dev` | Vite dev server, hub at `http://localhost:5173/#/` | |
| `npm run build` | `tokens` + `tsc --noEmit` + `vite build`; must be green before every push | |
| `npm run preview` | serve `dist` on :4173 | |
| `npm run typecheck` | `tsc --noEmit` | |
| `npm run tokens` | `src/design/tokens.ts` -> `src/styles/tokens.css` | |
| `npm run sql` | schema -> `supabase/schema.sql` + `docs/data-model.md` | |
| `npm run specs` | manifest -> `docs/specs.md` | |
| `npm run screenshots` | Playwright captures into `docs/screenshots/<CODE>/`; full-page shots call `settleImages` (qa-lib) first so off-screen images are painted (D-223) | `-- --codes=C-10,F-01 --dark --widths=390,1280,3840 --label=before --quality=72 --port=4173 --only=/dev --smoke`; env `QA_PORT`, `QA_NO_SERVER=1` |
| `npm run thumbs` | `node scripts/hub-thumbs.mjs`: hub-card thumbnails into `docs/screenshots/<CODE>/thumb[-dark][-<label>].jpg`, dev mode off, as each card's demo person and location (D-218) | `-- --codes=C-10,P-01 --theme=light\|dark\|both --quality=68 --port=4173`; env `QA_PORT`, `QA_NO_SERVER=1` |
| `npm run test:pricing` | pricing engine assertions | |
| `npm run qa:responsive` | D-016 matrix, writes `docs/qa/responsive-report.*` | `-- --only=/dev --codes=D-08 --widths=360,1280 --themes=light --port=4174`; env `QA_PORT`, `QA_NO_SERVER=1` (D-172) |
| `npm run qa:bundle` | bundle sizes vs `perf_budgets` -> `docs/qa/bundle-report.*` | |
| `npm run qa` | bundle + responsive | |
| `node scripts/qa-fixes-e2e.mjs` | re-runs the fixed e2e journeys (changelog 0019) | |

Chromium is preinstalled at `/opt/pw-browsers`; never run `playwright install`.

### 1.4 HTTP API

**None.** The app is static (GitHub Pages) with a mock database in the browser. There is no server, no REST endpoint and no webhook. Company-OS's REST (`/t/petrock/api/:entity`, digest in `docs/reference/company-os.md`) is the intended backend behind `CompanyOsProvider`, parked by D-183.

### 1.5 MCP / WebMCP

**None yet.** See section 2.

## 2. Planned

### 2.1 Actions manifest -> WebMCP tools (P-05, D-197; the type has landed, the bus has not)

**Landed (D-221):** `PageSpec.actions?: ActionDef[]` is in `src/specs/types.ts` and HUB-01 declares its 7 actions (section 1.1), so the manifest already carries them. **Still planned:** the bus, the D-20 page and the `specCompleteness` check below.

Each `PageSpec` gains `actions: ActionDef[]` with `{ id: '<module>.<verb>', label, intent, permission?, params?: Record<string, 'string' | 'number' | 'id' | 'date' | 'enum:...'> }`. While mounted, a page registers `run(id, params)` handlers on an actions bus (`src/actions/`); `/#/dev/actions` (D-20) lists every action across routes with its page, permission and whether a handler is live. The WebMCP surface is generated from this registry: one tool per action (`name = id`, `description = intent`, `inputSchema` from `params`), permission checked through the session's `can()`. Voice control (P-06) speaks the same intents. Recorded here when it lands: the tool list, the bus API, how a page registers handlers.

### 2.2 CLI

A `petrock` CLI (thin wrapper over the scripts and, later, the actions bus through Playwright) so an agent can run `petrock qa --codes=F-10`, `petrock screenshots`, `petrock seed reset`, `petrock actions list`. Not started; the npm scripts are the CLI until then.

### 2.3 Realtime / presence (P-14)

`DataProvider.subscribe` becomes a Company-OS realtime channel; a `presence` table (user, page_code, row ref, last_seen) and a `version` base column for optimistic concurrency. Plan doc: `docs/reference/realtime-plan.md` (kanban).

### 2.4 Annotations API (P-08)

The `feedback` table extended with `kind`, `element_path`, `component`, `viewport`, `theme`, `screenshot_url`, `triage`, `triage_note`, `decision_ref`; agents read it through the same `DataProvider` (and later the Company-OS REST) as the triage store.

## 3. Change log of this file

- 2026-09-18 (prompt 0014): initial version.
- 2026-09-20 (prompt 0016): `spec.actions` landed as a type with HUB-01's 7 actions (D-221); new `npm run thumbs` script (D-218); `settleImages` noted on `npm run screenshots` (D-223); section 2.1 split into landed vs planned.
