# Kanban

## Backlog
- Decide stack (default: hoy reference architecture, Vite + React + TS, GitHub Pages)
- Decide Company-OS integration (REST API direct vs thin Petrock BFF); define new entities (customer auth, service catalog, invoices/payments, spa add-ons, vaccination records, audit log, availability)
- Santa Maria digest (D-009, blocked): Justin connected GitHub 2026-09-17 but Santa-Maria-Tenis-Club/os is still not visible to Claude Tag; owner must enable it in Claude Tag settings, then run a separate session and digest spec builder + dev/doc tricks into `docs/reference/santa-maria-os.md`
- Design tokens from Figma (D-007): extract icons, fonts, colors from the main page; rebuild design system fresh with light/dark mode and multi-theme support; 45 local components -> component library
- Business rules registry (D-006): rules on each page's spec builder + Settings > Rules with per-rule status (requested / in dev / implemented); seed with the 55lb Suite rule, daycare-vs-spa duration, pricing rules
- Timeline view analysis (D-008): inspect Section 11/14 timeline frames; decide hotel-only vs spa too
- Vaccine flow design (D-003): customer app + front desk; vaccination records entity
- Figma gap check (D-001): mine older sections/rows for useful screens missing from Sections 22/14; confirm day care is not designed
- Extras category (D-005): report/analytics (in scope), employees (required, user management), education, reviews, walking, management
- Builder tool (super-admin page inspector: tables, roles, components/layout, rules, integrations)
- Role / PIN system (per-role visibility + edit, individualized side menus, staff PIN login, manager PIN approval popup)
- Stripe integration
- Table library (schema registry, table manager, generated data-model docs)
- Locations model (2 now, easy add-location flow, front desk scoped / owners see all)
- Staff feedback in-system
- App-store required settings / legal pages

## Doing
- Follow-up analysis on Justin's answers (gap check, timeline views, vaccines, design tokens)

## Done
- Confirm Figma scope with Justin (answered 2026-09-17, prompt 0002; D-001..D-008 in `docs/decisions.md`)
- Repo bootstrap (README, docs structure, brief, prompt/changelog 0001)
- Figma inventory (page new(justin + Mark): 253 frames, 25 sections)
- hoy digest (`docs/reference/hoy-patterns.md`)
- Company-OS digest (`docs/reference/company-os.md`)
