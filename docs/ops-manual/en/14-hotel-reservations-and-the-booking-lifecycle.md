---
title: Hotel reservations and the booking lifecycle
code: M-14
roles: front desk
part: II
version: 0.2.0
updated: 2026-09-18
summary: Creating a reservation at the desk, room types and rates, the estimate, deposits, the timeline view, changing status the right way.
rules: R-D01, R-D05, R-D06, R-D07, R-I08, R-I06
---

# Hotel reservations and the booking lifecycle

Most reservations arrive from the app. The desk creates the rest: phone calls, walk-ins, regulars who prefer the counter. Both paths make the same booking with the same statuses and the same price maths.

## 1. Room types and rates

We sell two room types. Rates depend on the night (Mon–Thu vs Fri–Sun) and the season. The engine prices each night and adds them up: rate × nights × dogs, then discounts, then the card fee if paid by card, then tax.

{{table:room_types}}

{{pricing:rooms}}

{{pricing:discounts}}

> NOTE: You never type a price. If the estimate looks wrong, the rate table is wrong: tell the owner.

## 2. New reservation at the desk

1. **New booking** (top bar) or **+ Hotel reservation** on Today (F-11).
2. Pick the customer (or create them), the pets, whether they share a room, the room type, the dates.
3. Read the estimate with the parent; explain the deposit and the prepay discount if they pay in full.
4. Save. The booking is **requested** if vaccines are missing, otherwise it goes to **pending vaccines** or **confirmed** depending on the records.

[screenshot: F-11 — New booking wizard]

## 3. The timeline

The **timeline** (F-12) shows rooms as rows and days as columns; each stay is a bar. Use it to see gaps, move a stay to another room of the same type, and spot a penthouse row filling up.

[screenshot: F-12 — Rooms x days timeline]

## 4. Changing status

Check-in and check-out are yours. Cancelling, marking no-show, reopening a cancelled booking and confirming without verified vaccines ask for a manager PIN (R-I06). The system opens the PIN modal for you; you do not need to find the manager first, they type in place.

{{statuses}}

## In-person lesson

1. Take a phone reservation with the manager listening: dates, dogs, room, deposit.
2. Explain the prepay discount and the card fee in one sentence each.

## Online lesson

1. Create a booking with the wizard (F-11) for a demo customer with two dogs sharing a suite.
2. Read the estimate lines: room nights, multi-dog discount, tax.
3. Open the timeline (F-12) and find your booking.

{{rules:pricing}}
