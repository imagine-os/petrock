# docs/

How the Petrock documentation is organized. Conventions follow imagine-os/hoy (`docs/reference/hoy-patterns.md`, section 5): numbered files are **append-only** and never renumbered; documentation is written in the **same turn** as the work.

| Path | What goes there |
|---|---|
| `project-brief.md` | The brief: client, locations, scope, features, data layer, reference repos, org rules. Updated as Justin decides things. |
| `kanban.md` | `## Backlog` / `## Doing` / `## Done` lanes, one `- ` card per line. |
| `prompts/NNNN-slug.md` | Prompt log. Header (source, date, requester), `## Prompt (verbatim)`, then the exact heading `## Response` with the reply. One file per prompt. |
| `changelog/NNNN-slug.md` | Changelog. Header lines `version:`, `date:`, `prompt:`, `intent:`, `decision:`, `rejected:`, `files:`, `codes:`, then a markdown body. One file per change set. |
| `figma/` | `README.md` (file key, pages, page id), `analysis.md` (full inventory + decisions needed), `renders/` (PNG exports of key sections). |
| `reference/` | Digests of reference repos: `hoy-patterns.md`, `company-os.md`, `santa-maria-os.md`. |

Numbering: prompts and changelogs share a counter per folder (`0001`, `0002`, ...). A changelog's `prompt:` line points at the prompt number that caused it.

Planned later (when app code exists, mirroring hoy): `pages/<CODE>.md` per page, `screenshots/<CODE>/`, `ops-manual/`, `data-model.md`, `design-system.md`, `roles.md`.
