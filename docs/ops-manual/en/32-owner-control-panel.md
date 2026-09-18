---
title: Owner Control Panel
code: M-32
roles: owner, manager
part: V
version: 0.2.0
updated: 2026-09-18
summary: For: owner, super admin (and managers for reports, reviews, feedback, logs). Pages A-01..A-44. Screenshots live in docs/screenshots/<CODE>/.
rules: 
---

# Owner Control Panel

> NOTE: Folded from the module draft `admin-control-panel` at integration (2026-09-18).

For: owner, super admin (and managers for reports, reviews, feedback, logs). Pages A-01..A-44. Screenshots live in `docs/screenshots/<CODE>/`.

## Your morning (A-01 Dashboard)

Open **Dashboard**. The top row shows revenue today (and this month), dogs in house with arrivals and departures, grooms and daycare today, and how many things need attention. Switch the revenue chart between 7 days, 30 days and 12 months; hover a bar for card vs cash. Occupancy meters show rooms in use tonight per room type. Today's schedule lists every arrival, departure, groom and daycare drop-off in time order; click one to go to the front desk. Use the location switcher in the top bar to see one store or **All locations**.

## Company & locations (A-10, A-11, A-41)

- **Edit company** changes the name, address and tagline printed on invoices.
- Each location card shows hours and capacities. **Open** a location to edit its opening hours (tick a day, set open / close, "Copy Monday to weekdays"), capacities (max simultaneous penthouses, suites, daycare dogs, groomers) and holidays (holidays exclude long-stay discounts; "boarding closed" blocks check-ins).
- **Add location** walks through details, hours, capacities and a review step. The new store appears in the location switcher at once; add its rooms on **Rooms & room types** and its staff on **Employees**.
- Deleting a location asks for a manager PIN. Prefer marking it inactive.

## Rooms (A-12)

Rooms have a code (as on the timeline), a type and, for penthouses, a bottom / top position - bottom rooms fit dogs over 30 lb. The list shows which rooms are occupied tonight. Room types carry the inclusions text customers see.

## Pricing (A-27 and sub-pages)

**Pricing** shows the base rates, card fee and tax at a glance and a **quote calculator**: pick a room type, dates, dogs and payment options and the exact price a customer would see appears, computed from the tables - so any change you make below is what customers pay.

- **Room rates & seasons**: one row per room type x Mon-Thu / Fri-Sun x season. Add a season with dates; tick "holiday" to exclude long-stay discounts.
- **Discounts**: multi-dog (per dog per night), long stay (percent, paid in full, not on holidays), daycare extra pet.
- **Fees & taxes**: the card service fee (applies to card payments through the app) and the tax rates for service / product / boarding.
- **Daycare**: full day, half day and the hour threshold, play hour, walk.
- **Grooming packages**: Gold / Platinum / Diamond prices and calendar minutes per size.
- **Add-ons**: price, "starting at", minutes added, employee restriction.
- **Services**: the catalog and tax class of each service.

Every change is written to the **Audit log**. Deleting a row asks for a manager PIN.

## Employees (A-30)

Add staff with job, department, location and status; link a login user to give them a role. **Set PIN** / **Reset**: type a 4-6 digit PIN, then a manager or owner enters their own PIN to approve. Staff use the PIN on the front desk PIN login.

## Roles & permissions (A-31) and Side menus (A-32)

The matrix shows what each role may do; click a cell to toggle. Super admin is locked; the owner cannot remove its own settings right. **Reset to code defaults** restores the shipped set. On **Side menus**, pick a role and hide whole menu categories it should not see; the preview shows the resulting sidebar.

## Reviews, feedback, approvals, audit (A-35..A-38)

- **Reviews**: publish, archive, or send a review back to pending.
- **Feedback inbox**: what staff typed into the Feedback button, with the page it came from. Opening marks it seen; reply and mark done.
- **Approvals log**: every manager-PIN approval with who asked and who approved. **Audit log**: every change with before -> after. Both export to CSV.

## Reports & analytics (A-42)

Tabs for revenue (by week, service, location), occupancy (per night, RevPAR), bookings funnel (by status and source), groomer utilization and package mix, customers and balances. Choose 30 days, 90 days or all; **CSV** downloads exactly what the tab shows, for the current location or all locations.

## Backups, providers, general settings (A-43, A-28, A-44)

- **Backups & export**: download the whole database as JSON (or one table). **Reset to seed** wipes local changes and needs a manager PIN.
- **Providers**: choose and enable email / SMS / push providers and send a test (stubs until integrations are connected). Payments run through the payment provider seam.
- **General settings**: boarding rules, invoice numbering and footer, time format and slot size, brand colours, security prompts.

## In-person lesson

Walk through the screens above with a colleague on a demo account: open each page named in this chapter, perform one real action (create, change a status, verify, record) and show where the result appears for the customer or the next shift. Record the completion with the button in the chapter header.

## Online lesson

Read the chapter, then open the linked pages yourself (the code chips open the live page) and repeat the steps on the demo data. Check the rules listed in the header in Settings > Rules and tell your manager if a rule is not doing what the chapter says. Record the completion with the button in the chapter header.
