---
title: Welcome and how to use this manual
code: M-10
roles: all staff
part: I
version: 0.2.0
updated: 2026-09-18
summary: What Petrock is, how a lesson works (in person, then online), where the live numbers come from, how to practise safely as a demo user.
rules: R-X43, R-X44, R-K01
---

# Welcome and how to use this manual

Petrock Hotel is a dog hotel and spa with two locations in Los Angeles. One piece of software runs everything: the customer app pet parents book from, the front desk web the desk works on, the owner's control panel and this manual. You are reading the manual inside that software, which is why the blue **live** blocks below show today's real values instead of numbers somebody typed months ago.

{{locations}}

## How a chapter is taught

Every chapter is one lesson in two halves:

1. **In-person lesson.** What you physically do and say, with the manager or a senior colleague next to you. It ends when they have watched you do it once.
2. **Online lesson.** The same task on the screens: which page, which button, what the system does behind it, which rule applies. You can read it alone, and the screenshots link to the real page so you can practise.

When you finish a half, press the matching button in the chapter header. That writes a row in `training_completions`; your manager sees it in **Education (F-66)** and signs off the in-person part.

> IN PERSON: Nothing here replaces watching a colleague do the job well. Read first, shadow second, do third.

> ONLINE: Practise as a demo user from the testing hub: nothing you do in the demo reaches a real customer.

[screenshot: HUB-01 — The testing hub: pick a role, a location and enter the surface]

## The people you can practise as

{{demo-users}}

Front desk, groomers and managers are **pinned to one location**; the owner sees both and can switch. The top bar always shows the location you are working in. If a screen looks wrong, check the location first.

## Where numbers come from

Prices, hours, capacities, vaccine names, statuses and rules are never typed in this manual. A block like the one below is rendered from the tables the owner edits in Settings. When the owner changes a rate, the manual changes with it.

{{statuses}}

> NOTE: If a live block says "unknown directive", the chapter asked for something the system does not know yet. Tell the owner through the Feedback button.

## Reading paths

The cover (`/#/manual`) shows the chapters for your role first. Rough order:

| Role | Read |
| --- | --- |
| Front desk | 11 daily operations · 12 check-in and check-out · 13 vaccine verification · 14 reservations · 16 daycare · 18 payments · 19 messages · 27 walks and tasks |
| Groomer | 15 grooming agenda · 13 vaccines (what "pending" means) · 27 walks and tasks |
| Manager | everything the desk reads, plus 17 PIN approvals · 20 manager duties · 23 reports |
| Owner | 21 settings and pricing · 22 roles and locations · 23 reports · 24 feedback and rules · 26 website and app |

## In-person lesson

1. Walk both buildings with the manager: reception, penthouse and suite rows, daycare yard, grooming room, storage.
2. Meet the team; learn who is a manager (they hold the PIN for approvals).
3. Get your own login and PIN from the manager; never share it.

## Online lesson

1. Open the testing hub, pick your role and location, enter the surface.
2. Open this manual from the side menu ("Ops manual") and find your reading path.
3. Open **Settings › Rules** (`/#/dev/rules`) and skim the list once: every rule you meet in a chapter links back there.

{{rule:R-K01}}
