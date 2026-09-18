---
title: Owner settings and pricing
code: M-21
roles: owner
part: V
version: 0.2.0
updated: 2026-09-18
summary: Where every price lives, how the engine uses it, seasons and holidays, discounts, fees and taxes, daycare and grooming price lists, what changing a value does.
rules: R-D05, R-D06, R-E01, R-H03, R-H04, R-G02, R-F01, R-X41
---

# Owner settings and pricing

Nothing in Petrock has a price typed into a screen. Every amount is a row in a settings table; the pricing engine reads the rows and computes the estimate the parent sees in the app, the desk sees in the wizard, the invoice shows and the public website teases. Change the row and every surface changes.

## 1. Room rates

{{pricing:rooms}}

Rates are per room type, per day kind (Mon–Thu vs Fri–Sun) and per season. A night inside a season uses the season's rate; other nights use the standard rate. Holidays are marked separately and can exclude a night from long-stay discounts.

[screenshot: A-20 — Pricing setup: rates and seasons]

## 2. Discounts

{{pricing:discounts}}

## 3. Fees and taxes

{{pricing:fees}}

> DECISION NEEDED: The card fee is 3.8 % in the app copy and 3.89 % in the settings design; tax is 2 % on service / product / boarding in the settings design. The build uses 3.89 % and 2 % until Justin confirms.

## 4. Grooming & Spa

{{pricing:grooming}}

{{pricing:addons}}

> DECISION NEEDED: Diamond prices are placeholders (the spa card only prices Gold and Platinum). Needs Justin.

## 5. Daycare

{{pricing:daycare}}

## 6. What a change does

| You change | What moves |
| --- | --- |
| A rate | every new estimate, the website "from" price, the manual's live tables; existing invoices keep their lines |
| A discount's conditions | new estimates; the desk sees the discount line appear or vanish |
| The card fee | every card payment from now on |
| A package price | app, desk wizard, website grooming page |
| Hours | website, manual, the app's location card |

## In-person lesson

Not applicable: settings are the owner's screens. Have the manager watch one change so they can explain it to the desk.

## Online lesson

1. Open **Pricing setup (A-20)** and read the rates table beside the live block above.
2. Change a Suite weekday rate in the demo; open the website hotel page (P-02) and the app estimate to see it move; change it back.
3. Open **Settings › Rules (A-40)** and find the pricing rules.

{{rules:pricing}}
