---
title: Staff feedback and the rules registry
code: M-24
roles: all staff
part: VI
version: 0.2.0
updated: 2026-09-18
summary: The Feedback button, what the owner does with it, the rules registry, rule statuses, requesting a rule, how rules show on every page.
rules: R-S01, R-X43
---

# Staff feedback and the rules registry

Two habits keep the software honest: staff say what slows them down, and every rule of the business is written in one place with a status.

## 1. Feedback

The **Feedback** button sits on every staff page. It knows which page you are on. Write what happened or what you want; choose idea / broken / question / praise. The owner reads the inbox (A-36) and replies; you see the reply in the same place.

[screenshot: A-36 — Owner's feedback inbox]

> TIP: "The arrivals list should show the handler" is a good item. "Everything is slow" is not: say which page, when, doing what.

## 2. The rules registry

A business rule is a sentence the system enforces or should enforce: "Dogs over 30 lb only fit the bottom penthouse rooms", "Cancelling a confirmed booking needs a manager PIN". Each has an id, a category, the pages it touches and a **status**:

| Status | Means |
| --- | --- |
| requested | someone asked for it; nothing enforces it yet |
| in dev | being built |
| implemented | enforced in code; the registry says where |
| deprecated | no longer applies |

{{rules:operations}}

## 3. Requesting a rule

1. Open **Settings › Rules** (A-40 / `/#/dev/rules`).
2. **Add rule**: title, description, category, the pages it should apply to. It is saved as *requested* with your name.
3. The owner reviews it; when built, the status changes and the page inspector shows it.

[screenshot: A-40 — Settings › Rules]

## 4. Rules on every page

The super admin's builder tool shows, for any page, the rules it implements (Rules tab). This manual links rule ids in the same way, so a chapter, a page and the registry always agree.

## In-person lesson

Give one piece of feedback about your first week with your manager reading it before you send.

## Online lesson

1. Press **Feedback** on Today; send a test item as the demo user.
2. Open **Settings › Rules**, filter by *requested*, read one.
3. Add a rule request in the demo, then find it in the list.

{{table:feedback}}
