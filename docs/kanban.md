# Kanban

## Backlog
- Second Figma pass: illegible screens + node-id mapping (`docs/figma/screen-catalog.md` section 5: `Frame 1171276424.png`, `Form fields.pdf`, `front desk-3.jpg`, 16 unviewed svg icons; map all 238 files to Figma node ids; confirm which side of each two-up is approved) after the quota resets ~Sep 22 or from the `.fig` (D-012, D-017)
- Answer the open questions with Justin (`docs/figma/open-questions.md`, 118 questions, build-blocking ones first: two-up approved sides, dark mode, Add Pet wizard, vaccine list, hotel step order and estimate maths, daycare scope, status vocabulary, manager PIN)
- Responsive QA checklist per page (D-016): breakpoints, no fixed 390/1440 assumptions, kanban/timeline phone fallback
- Decide Company-OS integration (REST API direct vs thin Petrock BFF); define new entities (customer auth, service catalog, invoices/payments, spa add-ons, vaccination records, audit log, availability)
- Component library growth per module; a11y and visual QA of the 42 foundation components
- Rules: confirm statuses with Justin; wire R-X01 (55 lb Suite) and R-X02 (daycare vs spa duration) into the booking flows
- Vaccine flow design (customer + front desk) (D-003): expiry, proof storage, front-desk verification, booking gating; vaccination records entity
- Reports/analytics design (D-005): Figma reports frame is an empty shell; design fresh
- Second Figma pass after quota reset (~Sep 22) (D-012): text-level read of Sections 22/14, items marked (verify) in `docs/figma/deep-dive.md`, fresh renders
- Capacitor vs native decision (D-013): customer app as Capacitor wrapper of the web codebase, or separate native apps
- Port older-section screens into the build (D-010, awaiting Justin): Choose Vaccine, Invoice detail, employees + add-employee, home stats strip, owner KPI dashboard, OTP modal, collapsible nav + location switcher, form redlines
- Extras category (D-005): report/analytics (in scope), employees (required, user management), education, reviews, walking, management
- Stripe integration
- App-store required settings / legal pages

## Doing
- Phase 2 modules in parallel (see `docs/build-plan.md`): customer-auth C-01..C-09, customer-home-pets C-10..C-29, customer-hotel C-30..C-49, customer-grooming-daycare C-50..C-69, customer-settings-chat C-70..C-89, frontdesk-reservations F-01..F-29, frontdesk-grooming-people F-30..F-59, admin-control-panel A-01..A-49, extras-manual-website P-01..P-19 + M-01..M-30 + F-60..F-79, dev-quality D-08..D-19
- Awaiting Justin: review of D-010/D-011, Figma paid seat or wait for Sep 22 (D-012); answers to the pricing conflicts chosen in the build (daycare 6 h, card fee 3.89 %, Diamond prices)

## Blocked
- Santa Maria digest (D-009, blocked): Justin connected GitHub 2026-09-17 (reported again 19:17 UTC) but Santa-Maria-Tenis-Club/os is still not visible to Claude Tag (19:18 UTC); the Claude GitHub App must be installed on that org and the repo enabled in Claude Tag settings, then run a separate session and digest spec builder + dev/doc tricks into `docs/reference/santa-maria-os.md`

## Done
- Foundation v0.1.0 (changelog 0007, prompt 0005): scaffold, tokens + light/dark + second brand, 42 components with metas, registry/shells/session/location/PIN/feedback, 39 tables + seed, 76 rules, pricing engine + tests, payments seam, HUB-01, A-00, D-01..D-07, P-00, A-40, CI to GitHub Pages, CLAUDE.md module contract
- Decide stack: hoy reference architecture, Vite + React + TS, GitHub Pages (D-013 go-ahead via prompt 0005)
- Seed the rules registry (76 rules in `src/rules/*.ts` with statuses; Settings > Rules at A-40)
- Side menu: collapsible categories + expand/collapse all (D-014) in `Sidebar`
- Builder tool (SpecChip + InspectorPanel on every page, Ctrl+.)
- Role / PIN system (roles, permissions, view-as, PIN login A-00, PinApprovalModal + approvals table)
- Table library (39 tables, table manager, generated `supabase/schema.sql` + `docs/data-model.md`)
- Locations model (LocationProvider, pinned roles, all-locations, capacities per location)
- Staff feedback in-system (FeedbackButton -> feedback table)
- Design system rebuilt from the token draft (D-007)
- Screen catalog from exports (`docs/figma/screen-catalog.md`: 109 distinct screens from 238 files; plus `docs/data/entities-from-designs.md`, `docs/design/components-from-designs.md`, `docs/rules/business-rules-from-designs.md`, `docs/figma/open-questions.md`; D-017, D-018; changelog 0006)
- Figma export drop 1 received (`Petrock Main.zip`, 238 files, inventoried in `docs/figma/exports/petrock-main/INVENTORY.md`; D-017)
- Figma gap check (D-001 -> D-010 proposal; `docs/figma/deep-dive.md` section 1)
- Timeline view analysis (D-008 decided from sitemap: Hotel & Daycare Table + Timeline, Spa Table + Board)
- Design tokens draft (`docs/design/tokens-draft.md`, derived)
- Confirm Figma scope with Justin (answered 2026-09-17, prompt 0002; D-001..D-008 in `docs/decisions.md`)
- Repo bootstrap (README, docs structure, brief, prompt/changelog 0001)
- Figma inventory (page new(justin + Mark): 253 frames, 25 sections)
- hoy digest (`docs/reference/hoy-patterns.md`)
- Company-OS digest (`docs/reference/company-os.md`)
