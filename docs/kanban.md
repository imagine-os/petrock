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
- Rooms: display_name/theme column + themed penthouse names per location (D-186, waiting on owner: questions 1-2 in `docs/reference/petrockhotel-site.md`)
- Verify petrockhotel.com facts on the live site (D-187): Westwood address / hours, phones, Suite copy, $12 sanitation fee, grooming disclaimer; site is network-blocked for the agent until an org owner allows the domain
- Stripe integration
- App-store required settings / legal pages

## Doing
- Figma fidelity fix at the design-system level (Justin 2026-09-18): follow `docs/design/fidelity-audit.md` - **(a) done** (prompt 0010: fonts Open Sans / Be Vietnam Pro, tokens, 32 Figma icons, core components, shells; `docs/changelog/_pending/design-fidelity-a.md`); **(b) customer screens on branch `fidelity/customer-screens`** (prompt 0012: C-10 rebuilt to Home Page.png, C-11/C-12/C-13, hotel flow without stepper, Settings / Notification rows, Chat tab dropped; `docs/changelog/_pending/fidelity-customer-screens.md`, awaiting merge); (c) front desk pages on the new shell (RoomTimeline hues, DataTable `tone` per column); decisions D-188..D-191 proposed (the audit's D-185..D-188 were renumbered), Justin to confirm
- Phase 3 integration: QA pass over every page (D-016 widths, console errors, functional flows), spec completeness to 100 %, StatTile dark-mode hint contrast, ~~PhonePageHeader / CustomerScreenHeader dedupe~~ (done in prompt 0010: PhonePageHeader aliases CustomerScreenHeader), core seed chat times relative to now, SessionProvider remember-me expiry (R-X35), DesktopShell reads roles.menu (R-X40) and permissions table (R-X49)
- Awaiting Justin: **enable GitHub Pages** (Settings > Pages > Source = GitHub Actions, then re-run "Deploy to GitHub Pages"; runs #7 / #8 stopped at configure-pages: "Resource not accessible by integration"); D-179 (PIN at check-in?), review of D-010/D-011, Figma paid seat or wait for Sep 22 (D-012); answers to the pricing conflicts chosen in the build (daycare 6 h, card fee 3.89 %, Diamond prices); owner question list (15 questions, prompt 0008 / `docs/reference/petrockhotel-site.md`) to take to the owner

## Blocked
- Santa Maria digest (D-009, blocked): Justin connected GitHub 2026-09-17 (reported again 19:17 UTC) but Santa-Maria-Tenis-Club/os is still not visible to Claude Tag (19:18 UTC); the Claude GitHub App must be installed on that org and the repo enabled in Claude Tag settings, then run a separate session and digest spec builder + dev/doc tricks into `docs/reference/santa-maria-os.md`

## Done
- Release 0.1.0 (changelog 0020, prompt 0005 response): build green on main, Pages workflow fixed to the last step it can do without Justin (`enablement: true`, v5 actions), 8 release screenshots in `docs/screenshots/release-0.1/`, version 0.1.0, README status, release summary with counts / how to test / gaps / needs-Justin list
- QA fixes (changelog 0019, prompt 0007): 33 of 35 findings from the four QA reports fixed (blocker F-12 white screen, F-56 refresh, /app/chat links, location guards, manager menu, 12 px font floor, FeedbackButton position, StatusBadge atom, rules registry +25 rows, spec gaps, RadioGroup rename, ErrorBoundary, QA scripts per the D-016 brief with full matrix); D-175..D-182; `docs/qa/fix-status.md`
- Integration merge (changelogs 0008..0017, decisions D-020..D-174, manual chapters 28..33, prompt 0006): ten module branches merged into main; rule ids renumbered (customer-hotel R-X50..59, frontdesk-grooming-people R-X60..68, extras R-X70..78, customer-grooming-daycare R-X14..17); duplicate catalog rule ids merged at runtime (pages union); /app/notifications = C-80 (C-15 retired), /desk/notifications = F-60 (F-58 retired), /desk/messages = F-57 and F-61 became Website inquiries at /desk/inquiries, /site = P-01 (P-00 placeholder removed); R-A01, R-E09, R-X01, R-X02, R-M03, R-M05, R-B05, R-B07, R-B11 flipped to implemented; SEED_VERSION 2; 182 routes, 135 components, 74 tables, 214 rules, 172 page docs, 462 screenshots
- customer-auth C-01..C-09 built (changelog 0008): welcome, sign in with lockout, sign up, OTP verify, forgot / reset, locked, account created, sign out; auth_credentials / auth_codes / auth_events
- customer-home-pets C-10..C-14, C-20, C-21 built (changelog 0009): home, pets list, add-pet wizard, pet profile / edit, vaccines hub and per-pet records with mock proof upload
- customer-hotel C-30..C-41 built (changelog 0010): pets & dates, room type with fit rules, per-pet care, grooming during stay, billing details, estimate, pay (deposit / full, card / cash), confirmation, my bookings, detail, invoice, change request
- customer-grooming-daycare C-50..C-56, C-60..C-65 built (changelog 0011): Grooming & Spa package / add-ons / time / checkout / orders; Daycare date / details / checkout / bookings
- customer-settings-chat C-70..C-84 built (changelog 0012): profile hub and edit, settings, language, payment methods, notification prefs, delete account, help, about, legal, notification centre (C-80), chat inbox and thread, rate app, change password
- frontdesk-reservations F-01, F-10..F-15 built (changelog 0013): Today dashboard, reservations table with day buckets, booking form, booking detail with PIN-gated status changes and events trail, room timeline, Grooming & Spa board, availability check
- frontdesk-grooming-people F-30..F-34, F-50..F-57, F-59 built (changelog 0014): grooming day view / board / agenda / form / detail, customers, pets, vaccine verification (F-55, F-56), messages inbox with assignment (F-57), invoice sheet (F-59)
- admin-control-panel A-01, A-10..A-12, A-20..A-28, A-30..A-32, A-35..A-38, A-41..A-44 built (changelog 0015): dashboard, reports, company, locations, rooms, pricing (rates, discounts, fees, daycare, packages, add-ons), services, providers, employees, roles, menus, reviews, feedback inbox, approvals, audit, backups, settings
- extras-manual-website P-01..P-12, M-01..M-03 + chapters M-10..M-27, F-60..F-68 built (changelog 0016): public website, ops manual with live blocks and screenshot figures, staff notifications, website inquiries, reviews moderation, reports, education, walking, tasks
- dev-quality D-08..D-19 built (changelog 0017): component matrix, spec report, data workbench, layout editor, responsive QA, preview, seed inspector, a11y, perf budget, screenshot diff, docs search, routes; full responsive QA pass 0 failing
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
