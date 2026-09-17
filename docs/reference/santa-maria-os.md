# Santa-Maria-Tenis-Club/os - reference notes

Status 2026-09-17: **no content has been read yet.** This file records why, what was tried, and what to skim once it is readable. Nothing below describes the Santa Maria repo itself.

Role in Petrock: Justin pointed at the **spec builder** and other smart things in the Santa Maria dashboard that make development and documentation better, and that may not be in hoy (and vice versa). Content of the club itself is irrelevant; the tooling is what matters.

## Why it could not be read

Two blockers:
1. The repo is **not visible to the workspace's GitHub connection at all** (`list_repos` returns nothing for it, unlike Company-OS). A Claude.ai org owner must grant access: install/link the GitHub App on the `Santa-Maria-Tenis-Club` org or add the repo to the allowed set.
2. Even once granted, a session can hold repos from only one GitHub owner, so it needs **its own session** (the Petrock session holds `imagine-os/*`).

Until then, the hoy digest (`hoy-patterns.md`) is the only first-hand reference.

## Original attempt log and planned skim (verbatim)

# Santa-Maria-Tenis-Club/os — NOT REACHABLE from this session (2026-09-17)

## What was tried
1. `mcp__claude-code-remote__add_repo owner=Santa-Maria-Tenis-Club repo=os access=read` →
   `add_repo: cross-tier adds are not supported in v1: requested "santa-maria-tenis-club/os" but session already has repos from owner(s) [imagine-os]. Start a new session with the requested repo as the initial source, or add a repo from the same owner as the existing sources`
2. `git clone https://github.com/Santa-Maria-Tenis-Club/os` (via agent proxy) →
   `fatal: could not read Username for 'https://github.com': terminal prompts disabled` (private, no credential).
3. GitHub MCP `get_file_contents` →
   `Access denied: repository "santa-maria-tenis-club/os" is not configured for this session. Allowed repositories: imagine-os/petrock.`
4. `list_repos query=Santa-Maria` → **empty**. Unlike Company-OS, this repo is not visible to the workspace's GitHub connector at all — the Claude GitHub App is likely not installed on the `Santa-Maria-Tenis-Club` org, or the repo is not in the allowed set.

## Remedy
Two things are needed: (a) a Claude.ai org owner grants access to `Santa-Maria-Tenis-Club/os` (install/link the GitHub App for that org, or add the repo to the allowed set); then (b) start a **new session with that repo as the initial source**, since cross-owner adds are refused in a session already holding `imagine-os/*`.

## Planned skim (to run once readable)
Cite file paths for each:
- **Spec builder**: how page specs are authored/edited/rendered — compare with hoy's `PageSpec` contract (`src/specs/types.ts`), `defineSpec()`, `InspectorPanel`, `/dev/specs`, `/dev/layout/:pageCode` dnd-kit layout editor. Is Santa Maria's builder an in-app editor that writes specs back (vs hoy's code-authored specs)? Persisted where?
- **Dev dashboard**: hub cards, dev mode toggle, inspector, completeness badges, route manifest (`window.__hoyos.routes` in hoy).
- **Docs conventions**: prompts (`## Response` split), changelog header lines (`version/date/prompt/intent/decision/rejected/files/codes`), kanban lanes, screenshots naming (`<CODE>/<lang>-<width>[-dark]`), manuals with live-data directives (`{{table:x}}`).
- **Component/table libraries**: `defineMeta()`-style component metas, `tableRegistry` + generic table manager, generated SQL/data-model docs.
- **Role/test-user switching**: demo users per role, `switchUser`, super-admin `viewAs` impersonation, permission strings.
- **Deploy**: GitHub Pages via Actions, HashRouter, `base: './'`.
- **Comparison**: "in Santa Maria but not hoy" / "in hoy but not Santa Maria".

No repo content was read; nothing above describes the Santa Maria repo itself. The hoy digest (`hoy-patterns.md`) stands as the only first-hand reference.
