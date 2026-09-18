---
title: Payments, invoices and refunds
code: M-18
roles: front desk, manager
part: IV
version: 0.2.0
updated: 2026-09-18
summary: Deposits and balances, card vs cash and the card fee, prepay discounts, invoices, refunds with a manager PIN.
rules: R-H03, R-H04, R-H05, R-P01
---

# Payments, invoices and refunds

Every booking produces an **invoice** with lines (room nights, packages, add-ons, discounts, fee, tax) and **payments** against it. The balance is total minus deposits and payments. Prices come from the tables below through the pricing engine; the desk never types an amount that the engine can compute.

{{pricing:fees}}

## 1. Deposits

1. A hotel reservation takes a deposit at booking; the rest at check-out.
2. Paying the whole stay upfront unlocks the prepay discount (when the discount rules allow it; holidays may be excluded).

{{pricing:discounts}}

## 2. Card vs cash

Card payments carry the non-cash fee shown in the fee table. Say it before you charge: "That is the total with the card fee; cash avoids it." Cash opens the drawer (permission `cash_drawer.open`).

## 3. Taking a payment at the desk

1. Open the booking › **Payments** (F-20).
2. Choose card or cash and the amount (balance is suggested).
3. Card: the terminal or Stripe form (Stripe is wired later; today the demo records the payment). Cash: count back.
4. The invoice shows the new balance; print or send it from the same screen.

[screenshot: F-20 — Invoices and payments at the desk]

## 4. Refunds and discounts

A refund or an ad-hoc discount needs a manager PIN (chapter 17). Refunds go back the way they came (card to card, cash to cash) and are written as a negative payment.

> WARNING: Never "fix" a total by editing the invoice lines. Fix the booking (dates, dogs, room) and the engine recomputes.

## In-person lesson

1. Take a card payment and a cash payment with the manager; count the cash back.
2. Explain the card fee and the prepay discount to a parent in plain words.

## Online lesson

1. Open a checked-out booking, read the invoice lines, take the balance.
2. As the manager, approve a small refund and find it in **Approvals audit (A-37)**.

{{rules:fees_tax}}
