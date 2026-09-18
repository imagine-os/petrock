# 0007 - Foundation: app scaffold, design system, component library, data layer, rules, hub and dev pages

version: 0.1.0
date: 2026-09-18
prompt: 0005
intent: Give the ten module builders everything they need: a green Vite + React + TypeScript build with tokens and themes, a 42-component library with metas, the app plumbing (module registry, shells, session with view-as and dev mode, location context, PIN login and approvals, feedback), a 39-table schema with seed data, a 76-rule registry, a tested pricing engine, the payment seam, the testing hub, the dev pages (tokens, components, specs, tables, rules, docs, knowledge), a public placeholder, CI to GitHub Pages, and the module contract in CLAUDE.md.
decision: D-019 (foundation decisions recorded: one booking lifecycle, 7 roles, location provider, PIN-gated transitions, pricing thresholds chosen where the designs conflict). Stack per D-013 (React + TS, mock data with the Company-OS adapter seam, GitHub Pages, Capacitor later).
rejected: Tailwind (plain CSS tokens keep theming a token swap); a shared routes file (import.meta.glob registry so modules never touch shared files); bundling the 69 MB Figma exports into the docs viewer; separate Spa and Grooming services (D-004); storing prices in components (all prices live in tables and flow through src/pricing/engine.ts).
files: package.json, vite.config.ts, tsconfig.json, index.html, CLAUDE.md, README.md, .github/workflows/pages.yml, scripts/*, src/** (see file map in CLAUDE.md), supabase/schema.sql, docs/build-plan.md, docs/data-model.md, docs/specs.md, docs/pages/*.md, docs/screenshots/*, docs/prompts/0005-build-the-whole-thing.md, docs/kanban.md, docs/decisions.md
codes: HUB-01, HUB-02, A-00, A-40, D-01, D-02, D-03, D-04, D-05, D-06, D-07, P-00 (built); C-02, C-10, F-01, F-30, F-60, A-01, M-01 (stubs)

## What exists now

- **Design system (D-01)**: `src/design/tokens.ts` -> `src/styles/tokens.css`. Brand `petrock` (#552583 ramp) and `sunset` prove theming; light and dark; Inter; 8 / 10 / 24 radii; booking status hues.
- **Component library (D-02)**: 12 atoms (Icon, Button, IconButton, Input, Select, Textarea, Checkbox, RadioGroup, Toggle, Chip, Badge/StatusBadge, Avatar), 17 molecules (Card, StatTile, Tabs, EmptyState, Toast, Stepper, SegmentedControl, PageHeader, Section, DatePicker, TimePicker, Figure, SpecChip, RoleSwitcher, LocationSwitcher, BottomNav, PinPad), 10 organisms (Modal, Drawer, DataTable, TopBar, Sidebar, PinApprovalModal, FeedbackButton, MarkdownViewer, InspectorPanel, PhoneFrame), 3 templates (DesktopShell, PhoneShell, PageStub). Each has a `.meta.ts` with usages.
- **App plumbing**: `registry.ts` globs `src/modules/*/index.ts` (built routes win over stubs); `shells.tsx`; `SessionProvider` (switchUser, viewAs, devMode, can, hasRole); `LocationProvider` (pinned roles, all-locations); `RequireRole`; `DevTools` (SpecChip + InspectorPanel with Overview / Layout / Data / Rules / Components / Logic tabs, Ctrl+.); `manifest.ts` (`window.__petrock.routes`).
- **Data**: `DataProvider` interface, `MockProvider` (localStorage, daily reseed, cross-tab), `CompanyOsProvider` stub with the REST shape, `useTable` / `useRow`; 39 tables in `src/data/schema/core.ts`; seed with 2 locations, 8 demo users, 8 employees, 8 customers, 14 pets, 70 vaccine records in mixed states, 90 rooms, rates / seasons / discounts / fees / taxes / packages / add-ons / daycare pricing, 30 hotel bookings, 16 appointments, 10 daycare days, invoices, payments, conversations, messages, notifications, reviews, feedback, approvals, audit rows. `npm run sql` writes `supabase/schema.sql` and `docs/data-model.md`.
- **Domain**: one booking lifecycle with transitions and PIN-gated transitions (`src/domain/booking.ts`); pet size bands.
- **Pricing**: `quoteHotel`, `quoteGrooming`, `quoteDaycare` from table rows; 30 assertions in `scripts/test-pricing.mjs`.
- **Rules registry (D-05 / A-40)**: 76 rules across pricing, discounts, fees & tax, capacity, room fit, vaccines, booking, PIN approvals, daycare, grooming, operations, people, locations, account; statuses implemented / in_dev / requested; runtime rows from the `rules` table merge over the code registry; add-rule form.
- **Pages**: HUB-01 hub, HUB-02 no access, A-00 PIN login, D-01..D-07, P-00 landing, A-40 Settings › Rules, plus stubs for the surface homes.
- **Docs**: CLAUDE.md rulebook with the exact module contract, build plan with module ranges, page template + 12 page docs, screenshots (390 / 1280, dark for key pages), data model, specs index, prompt 0005.

## Verification

- `npm run build` green (tsc strict + vite); `npm run test:pricing` passes.
- Playwright smoke over all 21 routes: no console errors. Screenshots for HUB-01, A-00, D-01..D-05, P-00 (390 + 1280, light + dark).
- Responsive checks at 360 (sidebar overlay drawer, DataTable card layout, PIN pad), 768, 1280, 1920: no horizontal scroll on the checked pages.

## Known gaps

- Stub pages (C-02, C-10, F-01, F-30, F-60, A-01, M-01) are placeholders for the modules.
- Figma export images are not bundled, so `docs/figma/screen-catalog.md` thumbnails do not render in the in-app docs viewer (open the files in the repo).
- PIN hashing is a mock (FNV-1a); Stripe provider is a stub; uploads are mock URLs.
- The `sunset` brand is a proof theme, not a Petrock brand decision.
- Spanish strings exist only for the hub; the app is English-first with the fallback layer in place.
