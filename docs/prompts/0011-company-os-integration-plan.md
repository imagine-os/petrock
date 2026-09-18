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

Models: plan written with Fable 5.1; docs/commit by a Sonnet 5 worker.

## Answers (running log)

| when (UTC) | question | Justin's words | outcome | decision |
| --- | --- | --- | --- | --- |
