---
title: Daycare day
code: M-16
roles: front desk
part: III
version: 0.2.0
updated: 2026-09-18
summary: Half day vs full day, hours and play hours, drop-off and pick-up, the daycare day screen, capacity.
rules: R-F01, R-F02, R-E13, R-X02
---

# Daycare day

Daycare is booked per day with a drop-off and a pick-up time. The price item is computed from the hours: a visit longer than the threshold is a full day, shorter is a half day; play hours and walks are add-ons. The daycare day screen (F-40) lists today's dogs with their times and status.

{{pricing:daycare}}

> DECISION NEEDED: The app design says a full day starts at 5 hours, the settings design says 6 hours. The build uses the settings value (6 h) until Justin confirms.

## 1. Drop-off

1. Open **Daycare › Day** (F-40). Find the dog; check status is *confirmed* (vaccines verified).
2. Confirm pick-up time and who picks up; note meds or feeding.
3. Press **Check in**. The dog appears in the yard list for the handlers.

[screenshot: F-40 — Daycare day view]

## 2. During the day

1. Walks are logged in **Walking (F-67)** with handler and minutes (chapter 27).
2. A groom on a daycare day needs the day to be long enough (rule R-X02); the system flags short days.

## 3. Pick-up

1. Press **Check out**; the price is recomputed from the real hours if the parent stays longer.
2. Collect the balance (chapter 18).

## 4. Capacity

{{capacities}}

## In-person lesson

1. Run a morning of drop-offs with the manager: five dogs, one with meds.
2. Do one pick-up where the parent is an hour late and explain the price change.

## Online lesson

1. Open **Daycare › Day (F-40)**; check a dog in and out.
2. Compare the computed item against the live price list above.

{{rules:daycare}}
