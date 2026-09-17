# imagine-os/hoy (HoyOS) — reusable patterns

Skimmed 2026-09-17 at commit `ee83bcc` (v0.6.1). Clone: `/home/claude/imagine-os/hoy` (read-only, public repo, not attached). Live: https://imagine-os.github.io/hoy/

## 1. Tech stack
- **Vite 5 + React 18 + TypeScript strict**, `react-router-dom` v6 with **HashRouter** (so GitHub Pages needs no 404 fallback), plain CSS with design tokens as CSS custom properties (no Tailwind), `@dnd-kit` (layout editor), `react-markdown` (in-app docs). `package.json` name `hoyos`, version 0.6.1.
- `vite.config.ts`: `base: './'` so assets resolve at `https://<org>.github.io/<repo>/`. App at repo root, `index.html` sets `data-theme` / `data-skin` on `<html>`.
- Scripts (`package.json`): `dev`, `build` = `npm run tokens && tsc --noEmit && vite build`, `screenshots` (Playwright), `tokens` (`scripts/gen-tokens.mjs`), `specs` (`scripts/gen-specs.mjs`), `sql` (`scripts/gen-sql.mjs`). Node 22 `--experimental-strip-types` lets .mjs scripts import .ts sources directly.
- Folder map (`CLAUDE.md`): `src/app` (App, registry, shells, manifest), `src/auth`, `src/components/<tier>/<Name>/`, `src/data`, `src/design`, `src/dev`, `src/i18n`, `src/layout`, `src/modules/<module>/`, `src/specs`, `src/tenant`, `src/styles`; `docs/`, `reference/` (frozen source material), `public/brand/`, `supabase/`, `scripts/`.
- `CLAUDE.md` is the rulebook for agents: component-library-must-stay-current, same-turn documentation, bilingual strings (ES required, EN falls back), multi-tenant `tenant_id` everywhere, Conventional Commits naming page codes.

## 2. Hub / surfaces / manual / docs organisation
- **Module registry** (`src/app/registry.ts`): every `src/modules/<name>/index.ts` exports `{ routes: RouteDef[], strings }`; the registry collects them with `import.meta.glob` and exposes lazy `getRoutes()/getStrings()`. Adding a page never touches a central file. Modules: `hub`, `website`, `customer`, `teacher`, `staff`, `admin`, `ops-manual`, `docs`, `dev`.
- **RouteDef** (`src/specs/types.ts`): `path, element, spec: PageSpec, roles, surface ('public'|'customer'|'teacher'|'staff'|'admin'|'dev'|'docs'), layout, nav?`. `App.tsx` maps every route through `<RequireRole>` and `withShell()`.
- **Shells** (`src/app/shells.tsx`): `PhoneShell` (mobile-first, customer/teacher) and `DesktopShell` (sidebar, staff/admin/dev/docs) chosen by `route.surface`; the dev surface shows the admin nav beside the design-system group.
- **Testing hub** at `/#/` (`src/modules/hub/HubPage.tsx`): one card per perspective (website, customer, teacher, manual, docs), a staff card with one button per staff role that calls `switchUser(role)` then navigates to `ROLE_HOME[role]`, a dev card linking tokens/components/specs/tables/layout/knowledgebase, plus header toggles for ES/EN, light/dark, wireframe skin and dev mode (super admin only).
- **Page codes** are the shared vocabulary: `C-xx` customer, `S-xx` staff, `M-xx` admin, `D-xx` dev, `P-xx`/`W-xx` public, `E-xx` edge states, `K-xx` knowledge, `A-xx` auth, `HUB-01`. Used in specs, screenshots folder names, docs/pages files, changelog `codes:` line and commit bodies.
- **User manual (ops manual)** at `/#/manual` (`src/modules/ops-manual/`): markdown in `docs/ops-manual/{es,en}/NN-slug.md` loaded at build time via `import.meta.glob(... '?raw')` in `manualIndex.ts`; adding a chapter needs no code. Cover grid grouped by `part` (I–VII), per-chapter TOC, `/#/manual/decisions` auto-extracts `> DECISIÓN PENDIENTE:` lines.
- **Docs viewer** at `/#/docs` (`src/modules/docs/docsIndex.ts`): globs every `docs/**/*.md` and image; sidebar tree = folder tree; prompt files split on the exact heading `## Response` to show prompt | response side by side.

## 3. Role-based login testing
- Roles (`src/auth/roles.ts`): `super_admin, admin, coordinator, front_desk, finance, teacher, maintenance, customer, public`, with `ROLE_LABEL` (bilingual), `STAFF_ROLES`, `EVERYONE`, `ROLE_HOME` (landing route per role).
- **Demo users** (`src/auth/demoUsers.ts`): one fictional person per role (`usr_super`, `usr_admin`, …) with name, initials, email, bilingual blurb; ids match seed `users` rows.
- **SessionProvider** (`src/auth/SessionProvider.tsx`): state `{ userId, devMode, viewAs }` persisted in `localStorage['hoyos.session']`. `switchUser(idOrRole)` accepts a demo id, a role, or any `users` row id (accounts created in-app resolve via `users`+`profiles`+`user_roles`). **Impersonation**: `viewAs` lets a super admin see the app as another role; effective `role = isSuperAdmin && viewAs ? viewAs : user.role`; `devMode` is only honoured for super admin. `can(permission)` and `hasRole(roles)` helpers.
- **Permissions** (`src/auth/permissions.ts`): string permissions (`bookings.write`, `expenses.read`, `dev.tools`…) mapped per role in `ROLE_PERMISSIONS`; `roleCan()`.
- **RequireRole** (`src/auth/RequireRole.tsx`): route guard; redirects to `/no-access?from=…` with a friendly page.
- **RoleSwitcher** molecule (`src/components/molecule/RoleSwitcher/`): select of demo users + (super admin only) a "View as" select. Lives in hub and shells.
- Documented in `docs/roles.md` (role matrix, demo users, dev mode, per-table RLS intent tables).

## 4. Dev dashboard tricks
- **Dev mode toggle** (super admin only) reveals a floating **spec chip** and the **InspectorPanel** drawer (`Ctrl+.` / `Cmd+.`) on every page (`src/dev/DevTools.tsx`). The panel shows the route's `PageSpec`: purpose, route, layout order (link to layout editor), data tables (blue chips link to `/admin/tables/<table>` when the table exists in `schema.ts`), roles, logic, integrations, API sketches, and a completeness % badge (`specCompleteness()` in `src/specs/types.ts`).
- `src/dev/inspectorBus.ts`: tiny window CustomEvent bus so any component (e.g. `PageStub`) can open the inspector without prop drilling.
- **PageSpec contract** (`src/specs/types.ts`): `code, name, purpose, layout[], data[], roles[], logic[], integrations[], states?, toggles?, notes?, canvasRef?, story?, api?, layerTree?`. Rule: no route without a spec. Canvas-derived specs generated into `src/specs/canvasSpecs.ts`; hand-written ones use `defineSpec()` in each module's `specs.ts`.
- **Dev pages** (`src/modules/dev/index.ts`): `/dev/specs` (index with built/stub badges), `/dev/tokens` (D-01), `/dev/components` (D-02), `/dev/layout/:pageCode` (dnd-kit **layout editor** that reorders/hides page sections, persisted to a `page_layouts` table via `useLayout(spec)` in `src/layout/useLayout.ts`), `/dev/knowledgebase` (K-01: kanban + changelog + prompts tabs).
- **Route manifest** (`src/app/manifest.ts`): publishes `window.__hoyos.routes` (path, code, surface, built/stub, spec) so Playwright/tooling reads real routes without parsing TS. `PageStub` template renders a spec'd-but-unbuilt page.
- **ThemeProvider** (`src/design/ThemeProvider.tsx`): `data-theme=light|dark` and `data-skin=styled|wireframe` on `<html>`, persisted in `localStorage['hoyos.theme']`.
- Table manager at `/admin/tables/:table` driven by `tableRegistry` (generic CRUD over any schema table).

## 5. Changelog / revision history documentation
- Rules in `docs/rules/documentation.md`; all "same turn as the work". Numbered files `NNNN-slug.md` are append-only, never renumbered.
- **Prompt log** `docs/prompts/NNNN-slug.md`: Source (Slack link or "direct"), date, requester role, `## Prompt (verbatim)` with Slack `<@U…>` tokens stripped, then `## Response` (exact heading; viewer splits on it). Example: `docs/prompts/0016-expenses-ledger.md`.
- **Changelog** `docs/changelog/NNNN-slug.md` (K-01 format): header lines `version:`, `date:`, `prompt:`, `intent:`, `decision:`, `rejected:` (alternatives considered), `files:`, `codes:`, then markdown body with "New and changed contracts" and "Verification" sections and before/after screenshot links. Example: `docs/changelog/0016-expenses-ledger.md`. Parsed by `headerMeta()` in `docsIndex.ts`.
- **Kanban** `docs/kanban.md`: `## <Lane>` per team with `### Backlog / Doing / Done`; top-level `## Backlog|Doing|Done|Blocked` = General lane; one `- ` card per line with page codes.
- **Page docs** `docs/pages/<CODE>.md` from `docs/pages/_TEMPLATE.md` or `node scripts/gen-page-doc.mjs <code>` (front matter: title, code, route, roles, status; sections: Purpose, Screenshots grid, Sections in layout order, Data table, Logic, Real vs mock, Changelog links, Resumen ES).
- **Screenshots** `docs/screenshots/<CODE>/<lang>-<width>[-dark][-label].jpg` (ES/EN × 390/1280; dark for `KEY_PAGES`), generated by `scripts/screenshots.mjs` (`--smoke`, `--only=`, `--label=before`), which also writes `docs/screenshots/routes.json`. `_before/NNNN/` keeps before/after pairs.
- `ROADMAP.md` §A "where we are", §B phases, §E owner decisions (auto-listed), §F what is still mocked. `README.md` carries a version line with counts (routes, codes, stubs, tables, captures, components).

## 6. Business operations manual structure
- `docs/ops-manual/README.md` defines conventions. `es/` is source, `en/` mirror with identical file names; missing EN falls back to ES with a notice.
- 28 chapters in **seven parts**: I HOY (who we are, classes, value model) · II Daily operations (front desk, schedule, teachers, room/heat, incidents, training checklists) · III Customers & plans · IV Money (payments, invoicing/DIAN, payroll) · V Content & brand · VI Legal & policies · VII System (roles, data tables, integrations, glossary).
- Mandatory front matter: `title, role, part (I–VII), version, updated, summary`. `00-index.md` has a "who reads what" role × chapter matrix.
- **Live data directives** on their own line, rendered by `LiveBlock` organism: `{{pricing[:family]}}`, `{{tenant:hours|contact|capacity}}`, `{{policy[:field]}}`, `{{tables}}`, `{{table:<name>}}`, `{{roles}}`, `{{routes:<surface>}}`, `{{stats}}`, `{{kpi:<name>}}`. Rule: a number the system owns is never typed into a chapter.
- Figures: markdown image with title `![caption](../../screenshots/S-02/es-1280.jpg "S-02 · /staff/checkin")` renders as framed `Figure` with code chip linking to the live screen; `[screenshot: CODE — caption]` = dashed placeholder. `> DECISIÓN PENDIENTE:` / `> NOTA:` / `> ADVERTENCIA:` callouts.

## 7. Design system / component library
- **D-01 tokens** `src/design/tokens.ts` is the single source (brand palette, semantic light/dark roles, movements, shadows, textures, materials, type scale, spacing, radii, motion); `tokens.css` generated by `scripts/gen-tokens.mjs`; mapping documented in `docs/design-system.md`.
- **D-02 components**: `src/components/<atom|molecule|organism|template>/<Name>/<Name>.tsx` + `<Name>.meta.ts` (+ optional CSS). `defineMeta()` (`src/design/meta.ts`): tier, name, bilingual description, props docs, states, usages (render fns), a11y notes, `usedBy` page codes. `src/design/library.ts` globs all metas; `/dev/components` renders them. Rule: no component without a meta, no meta without a usage. 55 components (e.g. Button, Badge, Chip, Card, StatTile, DataTable, Drawer, InspectorPanel, LiveBlock, Figure, MarkdownViewer, PhoneShell, DesktopShell, PageStub).

## 8. Table / schema documentation
- `src/data/schema.ts`: `TableDef { name, label (Bi), description (Bi), group, columns: ColumnDef[], titleColumn?, rls?: string[] }`; `BASE_COLUMNS` = `id, tenant_id, created_at, updated_at` on every table; `tableRegistry` powers the table manager and inspector links.
- `npm run sql` (`scripts/gen-sql.mjs`) generates **both** `supabase/schema.sql` (tables, indexes, `touch_updated_at` trigger, RLS enabled, tenant read + staff write policies, `rls` intent as comments) and `docs/data-model.md` (human view with Mock→Supabase mapping and per-table column tables). 44 tables.
- Data access via `DataProvider` interface (`list/get/insert/update/remove/subscribe`), `MockProvider` (localStorage + change events) today, `SupabaseProvider` stub; pages use `useData()/useTable()/useRow()` (`src/data/DataContext.tsx`). Seeds in `src/data/seed/*`.
- `src/tenant/tenant.ts` and `pricing.ts` are the only places studio facts/prices live (placeholders flagged `pending: true`).

## 9. Deploy (GitHub Pages)
- `.github/workflows/pages.yml`: on push to `main` (+ `workflow_dispatch`); permissions `contents: read, pages: write, id-token: write`; concurrency group `pages`; job `build` = checkout@v4, setup-node@v4 (node 22, npm cache), `npm ci`, `npm run build`, configure-pages@v5, upload-pages-artifact@v3 (`path: dist`); job `deploy` = deploy-pages@v4 with `github-pages` environment. One manual step: repo Settings → Pages → Source "GitHub Actions".
- `.gitignore`: `node_modules, dist, .DS_Store, *.log, .vite`.
