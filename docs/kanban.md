# Kanban

## Backlog
- Screen catalog from exports (`docs/figma/exports/petrock-main/`, D-017): map each file to a Figma node / flow, fill the unlabeled PDFs, answer prompt 0004
- Responsive QA checklist per page (D-016): breakpoints, no fixed 390/1440 assumptions, kanban/timeline phone fallback
- Side menu: collapsible categories + expand/collapse all (D-014)
- Decide stack (default: hoy reference architecture, Vite + React + TS, GitHub Pages)
- Decide Company-OS integration (REST API direct vs thin Petrock BFF); define new entities (customer auth, service catalog, invoices/payments, spa add-ons, vaccination records, audit log, availability)
- Rebuild design system from the token draft (D-007, `docs/design/tokens-draft.md`): one font family, light/dark token set, theme switching; 45 local components -> component library
- Business rules registry (D-006): rules on each page's spec builder + Settings > Rules with per-rule status (requested / in dev / implemented); seed with the 55lb Suite rule, daycare-vs-spa duration, pricing rules
- Vaccine flow design (customer + front desk) (D-003): expiry, proof storage, front-desk verification, booking gating; vaccination records entity
- Reports/analytics design (D-005): Figma reports frame is an empty shell; design fresh
- Second Figma pass after quota reset (~Sep 22) (D-012): text-level read of Sections 22/14, items marked (verify) in `docs/figma/deep-dive.md`, fresh renders
- Capacitor vs native decision (D-013): customer app as Capacitor wrapper of the web codebase, or separate native apps
- Port older-section screens into the build (D-010, awaiting Justin): Choose Vaccine, Invoice detail, employees + add-employee, home stats strip, owner KPI dashboard, OTP modal, collapsible nav + location switcher, form redlines
- Extras category (D-005): report/analytics (in scope), employees (required, user management), education, reviews, walking, management
- Builder tool (super-admin page inspector: tables, roles, components/layout, rules, integrations)
- Role / PIN system (per-role visibility + edit, individualized side menus, staff PIN login, manager PIN approval popup)
- Stripe integration
- Table library (schema registry, table manager, generated data-model docs)
- Locations model (2 now, easy add-location flow, front desk scoped / owners see all)
- Staff feedback in-system
- App-store required settings / legal pages

## Doing
- Awaiting Justin: go-ahead on the build plan (D-013), review of D-010/D-011, Figma paid seat or wait for Sep 22 (D-012)

## Blocked
- Santa Maria digest (D-009, blocked): Justin connected GitHub 2026-09-17 (reported again 19:17 UTC) but Santa-Maria-Tenis-Club/os is still not visible to Claude Tag (19:18 UTC); the Claude GitHub App must be installed on that org and the repo enabled in Claude Tag settings, then run a separate session and digest spec builder + dev/doc tricks into `docs/reference/santa-maria-os.md`

## Done
- Figma export drop 1 received (`Petrock Main.zip`, 238 files, inventoried in `docs/figma/exports/petrock-main/INVENTORY.md`; D-017)
- Figma gap check (D-001 -> D-010 proposal; `docs/figma/deep-dive.md` section 1)
- Timeline view analysis (D-008 decided from sitemap: Hotel & Daycare Table + Timeline, Spa Table + Board)
- Design tokens draft (`docs/design/tokens-draft.md`, derived)
- Confirm Figma scope with Justin (answered 2026-09-17, prompt 0002; D-001..D-008 in `docs/decisions.md`)
- Repo bootstrap (README, docs structure, brief, prompt/changelog 0001)
- Figma inventory (page new(justin + Mark): 253 frames, 25 sections)
- hoy digest (`docs/reference/hoy-patterns.md`)
- Company-OS digest (`docs/reference/company-os.md`)
