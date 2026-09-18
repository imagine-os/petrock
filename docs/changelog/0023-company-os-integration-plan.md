# 0023 - Company-OS integration plan

version: 0.1.0
date: 2026-09-18
prompt: 0011
intent: Justin asked (Slack #petrock-hotel, thread 1789744140.751369, 15:09 UTC) how to connect Petrock to the backend from the Company-OS repo. Wrote the integration plan: architecture options, auth mapping, entity mapping, adapter scope, env vars, migration plan, and phases 0-4, then logged the decision and four questions back to Justin. No runtime change.
decision: D-192 proposed (Company-OS integration architecture: Supabase Auth + Petrock-owned BFF + Company-OS as system of record, phased 0-4, read-only first; D-183 stays until Justin confirms Phase 1)
rejected: starting any write-through against Company-OS now (D-183 is still in force); reusing Company-OS's `dh` or `grooming` seed templates as-is (Petrock's 74-table entity set is richer and the keys differ; a generated template is planned instead); browser -> Supabase Postgres directly (option C), parked until Company-OS ships RLS and its relational "graduation" tables.
files: docs/reference/company-os-integration-plan.md (new), docs/prompts/0011-company-os-integration-plan.md (new), docs/changelog/0023-company-os-integration-plan.md (new), docs/decisions.md (D-192), docs/kanban.md
codes: none

## What changed

- New reference doc `docs/reference/company-os-integration-plan.md`: compares three architectures (direct REST, Petrock BFF (recommended), direct Supabase Postgres), maps Petrock's auth model (customer auth, staff PIN, roles, permissions) onto Supabase Auth + Company-OS memberships, maps all 74 tables to Company-OS entities/fields with a generated-template approach (`npm run companyos:template`, not yet built), scopes what the `CompanyOsProvider` adapter needs (auth header, query translation, read-only mode with a visible toast per the org's "unfinished must say so" rule, polling change feed, LRU peek, error handling), lists `.env.example` vars, plans mock-data migration, lists the changes needed in Company-OS itself (owned by its developer), and lays out phases 0 (this doc) through 4 (cutover).
- `docs/prompts/0011-company-os-integration-plan.md`: prompt log with the verbatim question, the response summary, and an empty "Answers (running log)" table for Justin's replies.
- `docs/decisions.md`: appended D-192 (proposed, needs Justin) recording the recommended architecture.
- `docs/kanban.md`: added a Phase 0 backlog item (generate the entity template, `.env.example`, provider chooser) blocked on Justin's answers to prompt 0011.

## Verification

`npm ci` (155 packages, clean) and `npm run build` (tokens + tsc + vite) both green on this commit; build output unchanged in shape (182 routes' worth of assets, one JS chunk over the 2500 kB warning threshold, pre-existing and unrelated to this docs-only change). Docs-only diff, no `src/` files touched.

## Next

Waiting on Justin's four answers (prompt 0011): (1) start read-only or write-through first; (2) does this lift D-183, and who is the Company-OS dev to coordinate with; (3) is a Petrock-owned BFF acceptable and where would it run; (4) which Supabase project owns Auth. Phase 0 tasks once scope is confirmed: `scripts/gen-companyos-template.mjs` / `npm run companyos:template`, `.env.example`, the `VITE_DATA_PROVIDER` chooser in `src/data/DataContext.tsx`.
