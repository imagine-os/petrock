# 0011 - Company-OS integration plan

- Source: Slack #petrock-hotel thread 1789744140.751369 (2026-09-18 15:09 UTC)
- Requester: Justin Massion (owner)
- Follows: prompt 0008 (D-183, D-184)
- Changelog: docs/changelog/0023-company-os-integration-plan.md

## Prompt (verbatim)

I want to connect this system to the backend from Company OS Repo. How will we do it?

## Response

Recommended architecture is option B: Supabase Auth handles customer and staff identity, a thin Petrock-owned BFF hosts the booking engine (quote / book / transition / approve), Stripe, and realtime, and Company-OS stays the system of record for plain rows through its existing REST API (`/t/petrock/query`, `/t/petrock/api/:entity`). Petrock is modeled as one Company-OS tenant (`petrock`) with one `org_unit` per location (Encino, Westwood). The 74 Petrock tables become Company-OS entities via a generated template (`npm run companyos:template`) rather than hand-written one by one. Work is staged in five phases, 0 through 4, starting read-only (Phase 1) before any write-through. D-183 (Company-OS reference only) stays in force until Justin confirms Phase 1 is OK to start.

Full plan, options considered, auth and entity mapping, adapter scope, env vars, and the phase table: docs/reference/company-os-integration-plan.md.

Four questions back to Justin:
1. Start read-only (Phase 1) first, or go straight to write-through?
2. Does this lift D-183 for Phase 1, and who is the Company-OS developer to coordinate with on tenant setup and auth?
3. Is a Petrock-owned BFF server acceptable, and where would it run (Fly / Render / Supabase Edge Functions / elsewhere)?
4. Which Supabase project should own Auth — the Company-OS dev's existing project, or a new one for Petrock?

Update 15:24 UTC: Justin redirected the architecture (see running log). Question 3 is closed (no Petrock-owned server); questions 1, 2 and 4 stand; new question 5: who builds the Company-OS modules, Claude in a separate Company-OS session or the Company-OS developer from specs kept in this repo?

Models: plan written with Fable 5.1; docs/commit by a Sonnet 5 worker.

## Answers (running log)

| when (UTC) | question | Justin's words | outcome | decision |
| --- | --- | --- | --- | --- |
| 2026-09-18 15:23 | 3 (+ architecture) | Some of the things such as booking and pricing and pin approvals, etc. will be a feature from the company OS backend. keep mind, that as we add features for each new tenant, such as dog hotel, yoga studio, tenis club, marketplace app, tv app, etc. its going to make the company OS system as a whole better and better and more feature rich over time. But of course in a modular and smart way. | No Petrock BFF. Booking, pricing, PIN approvals, payments, customer login become Company-OS modules enabled per tenant; Petrock is the first tenant; the front end talks to Company-OS directly; Petrock's pricing engine and booking lifecycle port into the modules. Plan section 2b added. | D-192 revised |
| 2026-09-18 15:27 | multilingual | of note, multilingual is not supported yet in company os backend system. What is your proposal to make sure multilingual abilities are setup right. | i18n as a Company-OS module: localized_text field type, tenant locales + default, users.locale, API fallback resolution; UI strings stay per app (Petrock src/i18n); Petrock columns flagged localized in Phase 0. Plan section 10. | D-192 revised (i18n) |
