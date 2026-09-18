---
title: PIN approvals
code: M-17
roles: manager
part: IV
version: 0.2.0
updated: 2026-09-18
summary: What a manager PIN gates, how the approval modal works, what is written to the audit, how to handle a PIN you are asked for.
rules: R-I06, R-P01, R-P02, R-X77
---

# PIN approvals

Staff sign in with a 4–6 digit PIN (A-00). Managers, the owner and the super admin also use their PIN to **approve** an action a desk user cannot do alone: the desk clicks, the modal opens, the manager types their PIN in place, the action runs, and an approval row is written with both names.

[screenshot: A-00 — Staff PIN login]

## 1. What asks for a PIN

{{rules:pin_approvals}}

Booking status moves that are gated:

{{statuses}}

## 2. How the modal works

1. The desk user starts the action (cancel, refund, discount, delete).
2. The **PIN approval** modal shows the action, the subject (booking code, amount) and a PIN pad.
3. You type your PIN. Wrong PIN: the action does not run and nothing is written.
4. Right PIN: an `approvals` row is written (who asked, who approved, what, when) and the action runs.

> WARNING: Never give your PIN to a desk user "to save time". The approval is your signature. Change it with the owner if you suspect it is known.

## 3. Reading the audit

The owner sees every approval in **Approvals audit (A-37)** and can filter by location, action and approver. If a refund or cancellation is questioned, that row is the answer.

[screenshot: A-37 — Approvals audit]

## 4. Saying no

Refusing is normal: "I cannot approve a full refund after check-in; the policy is a credit. Let me talk to the parent." Refusal writes nothing; the desk user closes the modal.

## In-person lesson

1. Approve a cancellation and a discount with the trainer watching where you stand (not over the desk user's shoulder).
2. Refuse one request and explain why to the desk user.

## Online lesson

1. As the front desk demo user, try to cancel a confirmed booking: the PIN modal opens.
2. Switch to the manager demo user and approve it; then open **Approvals audit (A-37)** and find the row.

{{table:approvals}}
