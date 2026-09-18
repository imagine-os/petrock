# Petrock

Software for **Petrock Hotel** (dog hotel and spa, two locations: Encino and Westwood, Los Angeles; [petrockhotel.com](https://petrockhotel.com)).

**Live:** https://imagine-os.github.io/petrock/ (GitHub Pages, deployed from `main`; enable Pages > Source "GitHub Actions" once). The hub at `/#/` opens every surface with demo users per role.

## Run

```
npm install
npm run dev          # http://localhost:5173/#/
npm run build        # tokens + tsc --noEmit + vite build (must be green before every push)
npm run preview      # serve dist on :4173
npm run test:pricing # pricing engine assertions
npm run sql          # regenerate supabase/schema.sql + docs/data-model.md
npm run screenshots  # Playwright captures into docs/screenshots (needs a build first)
npm run specs        # docs/specs.md from the route manifest
```

## What is inside (v0.2.0, all modules merged)

| Surface | Route | Users |
|---|---|---|
| Testing hub | `/#/` | everyone (HUB-01) |
| Customer app | `/#/app` (PhoneShell, 390 design, Capacitor later): auth `/#/auth`, home, pets, vaccines, hotel, Grooming & Spa, daycare, bookings, chat, settings | pet parents |
| Front desk | `/#/desk` (DesktopShell, pinned to one location): today, reservations, timeline, board, grooming, customers, pets, vaccines, inbox, notifications, reports, extras | front desk, groomer, manager |
| Owner / admin | `/#/admin`: dashboard, reports, company, locations, rooms, pricing, services, employees, roles, menus, reviews, feedback, approvals, audit, backups, settings, rules | owner, super admin (manager: reports, inboxes) |
| Staff PIN login | `/#/staff/pin` (A-00) | staff |
| Public website | `/#/site` (P-01..P-12) | everyone |
| Ops manual | `/#/manual` (M-01, chapters M-10..M-33) | staff |
| Dev | `/#/dev/tokens` `components` `specs` `tables` `rules` `knowledge` + quality tools `/#/dev/qa/*`, `data`, `layout`, `seed`, `routes` | super admin |
| Docs | `/#/docs` | super admin, owner, manager |

Stack: Vite + React 18 + TypeScript strict, HashRouter, CSS tokens (light / dark, brands `petrock` and `sunset`), mock data in localStorage behind a `DataProvider` with a Company-OS REST adapter seam, payments behind a `PaymentProvider` (Stripe stub). 182 routes, 135 library components, 74 tables, 214 business rules, one booking lifecycle, a tested pricing engine, a super-admin builder tool on every page (Ctrl+.).

Demo customers: avery@demo.petrock.test / Biscuit!23 (verified), riley@demo.petrock.test / Biscuit!23 (unverified). Demo PINs: 0000 super admin · 1111 owner · 2222 manager · 3333 Encino desk · 4444 Westwood desk · 5555 groomer. All people and pets are fictional.

## For agents

Read [`CLAUDE.md`](CLAUDE.md) (rulebook + exact module contract) and [`docs/build-plan.md`](docs/build-plan.md) (modules, page-code ranges, definition of done). Documentation lives in [`docs/`](docs/README.md): brief, decisions, Figma catalog, entities, rules, prompts, changelog, page docs, screenshots, data model.
