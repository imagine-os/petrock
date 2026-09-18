---
title: Vaccine verification
code: M-13
roles: front desk, manager
part: II
version: 0.2.0
updated: 2026-09-18
summary: Which vaccines we require, how a proof arrives from the app, how to verify or reject it, why bookings wait on it.
rules: R-A05, R-X48
---

# Vaccine verification

Every pet has a vaccine record per vaccine type with a date, an expiry, a proof (a photo or PDF from the vet) and a status. A hotel, daycare or grooming booking stays **pending vaccines** until every *required* record is verified by staff. That is rule R-A05 and it is the same on every surface.

{{vaccines}}

## 1. How a proof arrives

1. The parent uploads it in the app (pet › vaccines). The record goes to **submitted**.
2. You get a notification (bell, F-60: "Vaccine proof submitted").
3. The **vaccine verification queue** (F-52) lists every submitted record at your location, oldest first.

[screenshot: F-52 — Vaccine verification queue]

## 2. Verify or reject

1. Open the record; open the proof.
2. Check: pet name matches, vaccine name matches, the date is a real date, the expiry is in the future, the vet is identifiable.
3. **Verify** if all five hold. **Reject** with a reason if not (blurry, wrong pet, expired). The parent gets a notification either way.
4. When the last required record is verified, the pet's bookings move from *pending vaccines* to *confirmed* automatically.

> WARNING: Never verify a record you cannot read. A blurry photo is a rejection with the reason "please upload a readable copy".

> TIP: Expiring records: the system warns the parent before the expiry. If a guest's vaccine expires during a stay, tell the manager the day you notice.

## 3. Confirming without vaccines

Sometimes the vet's office confirms by phone and the paperwork follows. Only a manager can confirm a booking with missing verification, with their PIN (chapter 17). The approval is written to the audit table with both names.

{{rule:R-A05}}

## In-person lesson

1. Verify three real proofs with the manager: one clean, one blurry, one with the wrong pet.
2. Make the phone call to a vet for a missing record, using the script in chapter 19.

## Online lesson

1. Open **Notifications (F-60)** and click a "Vaccine proof submitted" item; it opens the queue.
2. Verify one record; watch the booking status badge change in **Today**.
3. Open a pet profile (F-51) and read its vaccine list.

[screenshot: C-20 — What the parent sees: the pet's vaccine list in the app]

{{rules:vaccines}}
