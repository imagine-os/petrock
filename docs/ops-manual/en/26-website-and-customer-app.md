---
title: Website and customer app
code: M-26
roles: front desk, owner
part: VI
version: 0.2.0
updated: 2026-09-18
summary: What a pet parent sees on the public website and in the app, how a booking flows from there to the desk, what the desk can say about it.
rules: R-X70, R-X71, R-X72, R-A01
---

# Website and customer app

Parents meet Petrock on the website first, then in the app. Knowing both lets the desk answer "where do I…?" in one sentence.

## 1. The website

The public site (P-01…P-12) shows rooms, Grooming & Spa, daycare, a pricing teaser, both locations with hours, published reviews, vaccines and policies, an FAQ and a contact form. Prices are "from" teasers computed from the same tables the desk uses (R-X71); the binding quote is in the app. Only published reviews appear (R-X70). Contact-form messages land in `site_inquiries` at the chosen location (R-X72).

[screenshot: P-01 — Website home]

[screenshot: P-05 — Pricing teaser]

## 2. The app

1. Sign up, add a pet (the app asks for a pet before any booking, R-A01), upload vaccine proofs.
2. Book the hotel (pets, shared room, room type, dates, medical questionnaire, estimate, deposit or full payment), Grooming & Spa (pet, package by size, add-ons, time) or daycare (date, times, computed price).
3. Chat with Front Desk; receive notifications (booking confirmed, payment, vaccine expiring, pet approved).

[screenshot: C-10 — Customer home]

[screenshot: C-30 — Hotel booking: choose pets]

## 3. What the desk says

| Parent asks | Answer |
| --- | --- |
| "Where do I upload the vaccine?" | Pets › the pet › Vaccines › Upload proof. We verify it within the day. |
| "Why is my booking pending?" | A required vaccine is not verified yet; upload or send the certificate. |
| "How much will it be?" | The estimate in the app is the price; the website shows "from" prices. |
| "Can I pay cash?" | Yes at the desk; the card fee only applies to card. |

## In-person lesson

Book a demo stay in the app on the desk tablet with the manager, from adding a pet to paying the deposit.

## Online lesson

1. Open the website (P-01) and find the hours of your location.
2. Enter the app as the customer demo user, open a pet's vaccines, open My bookings.
3. Send a message from the app and answer it from the desk inbox (F-61).

{{routes:public}}
