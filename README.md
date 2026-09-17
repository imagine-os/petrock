# Petrock

Software for **Petrock Hotel** (dog hotel and spa, two locations, [petrockhotel.com](https://petrockhotel.com)).

## Purpose

One system that runs the whole business: customers book boarding, daycare, grooming and spa from a mobile app; front-desk staff run the day from a desktop web app (check-ins, check-outs, timelines, grooming agenda, messages); owners and admins manage locations, staff, roles, pricing and settings from an admin web app. Everything shares one design system, one component library, one table library and one role/permission model, with a super-admin **builder tool** on every page that exposes the tables, roles, components, rules and integrations behind it.

## Planned surfaces

| Surface | Platform | Users |
|---|---|---|
| Customer app | iOS + Android (390 wide mobile design, locked from Figma) | Pet owners |
| Front desk | Desktop web (1440) | On-location staff, scoped to their own location |
| Admin / owner | Desktop web | Owners and admins, see all locations |
| Builder tool | Overlay on every page | Super admins |

All in one codebase. Stripe from the start; push notifications, automated emails and Supabase later (data layer via [Playset-LLC/Company-OS](https://github.com/Playset-LLC/Company-OS)).

## Status

**Analysis phase, no app code yet.** The Figma file has been inventoried and the project brief written; the stack and the Figma scope still need to be decided (see `docs/kanban.md` and `docs/figma/analysis.md`).

The intended stack is not yet decided. The reference architecture is [imagine-os/hoy](https://github.com/imagine-os/hoy) (Vite + React + TypeScript, HashRouter, plain CSS tokens, GitHub Pages via Actions); see `docs/reference/hoy-patterns.md`.

## Documentation

Everything lives in [`docs/`](docs/README.md):

- `docs/project-brief.md` - what Justin asked for, organized
- `docs/figma/` - Figma inventory, renders, decisions needed
- `docs/reference/` - digests of reference repos (hoy, Company-OS, Santa Maria os)
- `docs/prompts/` - every prompt and reply, numbered, append-only
- `docs/changelog/` - every change, numbered, append-only
- `docs/kanban.md` - Backlog / Doing / Done

Rules: every prompt, reply and change is documented in the repo in the same turn as the work. Projects are published with GitHub repos + GitHub Pages.
