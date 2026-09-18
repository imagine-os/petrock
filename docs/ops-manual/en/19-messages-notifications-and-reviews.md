---
title: Messages, notifications and reviews
code: M-19
roles: front desk, manager
part: II
version: 0.2.0
updated: 2026-09-18
summary: The one chat thread per customer, the inbox, tone and scripts, staff notifications, moderating reviews, website inquiries.
rules: R-M09, R-M08, R-M07, R-X70, R-X72, R-X78
---

# Messages, notifications and reviews

Parents write to **Front Desk** from the app; one thread per customer, forever. Staff answer from the **Messages inbox (F-57)**. Notifications (F-60) tell you what needs a hand. Website contact-form inquiries land in **Website inquiries (F-61)**. Reviews arrive from the app and are moderated before they appear on the website (F-65).

## 1. The inbox

1. Open **Messages (F-57)**. Conversations at your location sort by last message; unread counts on the left.
2. Open a thread; read the whole thing before answering.
3. Answer in the composer; Enter sends. The parent gets a push notification in the app (later a real one).
4. Quote prices only from the live tables or the app estimate, never from memory.

[screenshot: F-57 — Messages inbox with thread and composer]

### Scripts

| Situation | Say |
| --- | --- |
| Price question | "Gold for a medium dog is on the price list in the app under Grooming & Spa; want me to book it?" |
| Vaccine missing | "We need a readable copy of the Rabies certificate before Friday; upload it under Mochi › Vaccines and I will verify it right away." |
| In-home request | "In-home care is by inquiry: tell me the dates and I will check with the manager." |
| Complaint | "I am sorry. Tell me what happened and I will make sure the manager calls you today." |

> TIP: Timestamps are relative ("25 min ago", "Yesterday") so you see at a glance who has waited longest.

## 2. Notifications

Kinds are a fixed vocabulary (booking confirmed, new booking, payment, vaccine expiring, vaccine proof, pet added, message, review, system). Opening the list marks what you saw as read; the bell shows the unread count.

[screenshot: F-60 — Staff notifications]

## 3. Reviews

A review has a rating, a title, a body and sentiment tags. It starts **pending**. Only a manager, the owner or the super admin moderates: **Approve** publishes it to the website, **Archive** hides it. Only published reviews appear on the public site (R-X70).

[screenshot: F-65 — Reviews moderation queue]

## 4. Website inquiries

The contact form on the website writes a row to `site_inquiries` at the location the visitor chose. They show up as *new*; mark *seen* when read and *replied* when answered. Target: within one business day.

> DECISION NEEDED: Reply target for website inquiries: one business day (proposed) or same day? Needs Justin.

## In-person lesson

1. Answer three real threads with the manager reading over the wording.
2. Moderate two reviews with the manager: one to publish, one to archive, and say why.

## Online lesson

1. Open **Messages (F-57)**, open a thread, send a reply as the desk demo user.
2. Open **Notifications (F-60)**, filter by "Vaccine proof".
3. As the manager, open **Reviews (F-65)**, approve one, archive one; open the public reviews page (P-07) and find the published one.

{{table:site_inquiries}}
