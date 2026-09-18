---
title: Glossary and data tables
code: M-25
roles: all staff
part: VI
version: 0.2.0
updated: 2026-09-18
summary: The words we use and the tables behind them; every table in the system grouped by area with a link to its rows.
rules: R-J03
---

# Glossary and data tables

## Words

| Word | Means |
| --- | --- |
| Booking / reservation | a hotel stay: customer, pets, room type, dates, one status |
| Appointment | a Grooming & Spa slot: pet, package, add-ons, groomer, time |
| Daycare day | one day of daycare for one or more pets with drop-off and pick-up times |
| Requested / pending vaccines / confirmed / checked in / checked out / cancelled / no show | the one lifecycle every booking follows |
| Penthouse / Suite | the two room types; penthouse rows have top and bottom rooms |
| Package | Gold, Platinum or Diamond groom, priced by size band |
| Add-on | an extra on a groom that adds minutes and a price |
| Size band | S / M / L / XL / Giant from the pet's weight in pounds |
| Proof | the vet document behind a vaccine record |
| Approval | a manager PIN entered to allow a gated action; written to `approvals` |
| Live block | a blue block in this manual that reads the system instead of quoting a number |
| Page code | F-01, C-30, A-20…: the id of a screen, used in specs, screenshots and this manual |

## Statuses

{{statuses}}

## The tables

Every entity is a table with `id`, `created_at`, `updated_at` and, where it belongs to a store, `location_id`. Ids and computed totals are system-generated and read-only (R-J03). The super admin can open any table in the table manager.

{{tables}}

## In-person lesson

Not applicable.

## Online lesson

1. Open the table library (`/#/dev/tables`) as the super admin and find `bookings`.
2. Open one row; notice the base columns are read-only.
3. Find `training_completions` and your own rows.

{{table:training_completions}}
