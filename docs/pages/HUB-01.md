---
title: Testing hub
code: HUB-01
route: /
roles: everyone
status: built
module: hub
---

# HUB-01 · Testing hub

## Purpose

First screen for the team: open any surface (customer app in a live phone frame, front desk per location, owner/admin, ops manual, docs, dev), switch the demo user by role, view as another role, switch location, theme (light/dark), brand (petrock/sunset) and the builder tool. Nothing here is customer-facing.

## Screenshots

| 390 | 1280 |
| --- | --- |
| ![390](../screenshots/HUB-01/390.jpg) | ![1280](../screenshots/HUB-01/1280.jpg) |

Dark: `../screenshots/HUB-01/390-dark.jpg`, `../screenshots/HUB-01/1280-dark.jpg`.

## Sections (layout order)

1. HubHeader - brand, language, brand theme, dark mode, builder tool toggle (super admin)
2. SessionStrip - RoleSwitcher (demo user + view as) and LocationSwitcher
3. SurfaceGrid - customer app card with PhoneFrame iframe of #/app, front desk per location, owner/admin, manual, docs
4. Staff roles - one button per staff role + PIN login
5. Dev - links to D-01..D-07 and P-00
6. Footer - counts: routes, built, stubs, tables, rules, components

## Data

| Table | Read / write | Notes |
| --- | --- | --- |
| `users` | read | demo users are also seed rows |
| `locations` | read | front desk buttons |
| `notifications` | read | unread count in TopBar |

## Rules

- R-K01 - location is always known; front desk buttons pin it
- R-M04 - dark mode toggle

## Logic

- switchUser(role) before navigating to ROLE_HOME[role]
- Front desk buttons pick the demo front-desk user of that location and set the location

## Components

Card, Button, Toggle, Badge, Icon, IconButton, RoleSwitcher, LocationSwitcher, SegmentedControl, PhoneFrame

## Real vs mock

All real against the mock provider. Version comes from package.json.

## Responsive check (D-016)

Checked at 360, 390, 768, 1280, 1920 on 2026-09-18 (Playwright): no horizontal scroll; DesktopShell sidebar becomes an overlay drawer under 900 px; DataTable rows become cards under 768 px.

## Changelog

- `docs/changelog/0007-foundation.md`
