# Business operations manual (Petrock)

How Petrock runs, per role, in person and in the software. Rendered in the app at `/#/manual` (M-01 cover with reading paths per role, one route per chapter, `/#/manual/pending` for decisions, captures and drafts). Source of truth: `docs/ops-manual/en/NN-slug.md` (English first; other languages would mirror the file names in `docs/ops-manual/<lang>/`).

## Writing a chapter

Adding a chapter needs no code: drop `NN-slug.md` in `en/` and it gets a route, a spec (from the front matter) and a card on the cover.

Front matter (all required):

```
---
title: Front desk daily operations
code: M-11
roles: front desk
part: II
version: 0.2.0
updated: 2026-09-18
summary: One line for the card and the search.
rules: R-I05, R-I06
---
```

- `code` is the page code (M-10..M-30 are chapters; M-01 cover, M-02 fallback, M-03 pending are reserved).
- `roles` is a comma list of audiences: `all staff`, `front desk`, `groomer`, `manager`, `owner`. The cover's "reading path" filters on it.
- `part` groups chapters: I Start here · II Front desk · III Grooming, daycare & walks · IV Money & approvals · V Managers & owners · VI System & reference.
- `rules` are the `R-xxx` ids the chapter teaches; they appear in the chapter header and the page spec.

Every chapter has a `## In-person lesson` and a `## Online lesson` section; the reader records both with the buttons in the header (writes `training_completions`, R-X44).

## Inside a chapter

| You write | You get |
| --- | --- |
| `[screenshot: F-01 — Today at the desk]` (own line) | framed `Figure` with the capture `docs/screenshots/F-01/1280.jpg` (390 for `C-` codes) and a chip linking to the live page; dashed placeholder until the capture exists |
| `![caption](../../screenshots/F-01/1280.jpg)` | the same image inline through the markdown renderer |
| `{{pricing:rooms}}` `{{pricing:grooming}}` `{{pricing:addons}}` `{{pricing:daycare}}` `{{pricing:discounts}}` `{{pricing:fees}}` | price tables read from `rates`, `packages`, `addons`, `daycare_pricing`, `discounts`, `fees` + `taxes` |
| `{{locations}}` `{{capacities}}` | hours, addresses, phones; max simultaneous per kind per location |
| `{{statuses}}` | the one booking lifecycle with transitions and PIN-gated moves |
| `{{vaccines}}` | vaccine types with required / recommended |
| `{{table:room_types}}` `{{tables}}` | first rows of any table; the whole schema grouped |
| `{{rules:vaccines}}` `{{rule:R-I06}}` | rules by category; one rule with status |
| `{{roles}}` `{{permissions:manager}}` `{{routes:frontdesk}}` `{{demo-users}}` `{{stats}}` | roles, permissions, screens of a surface, demo people, row counts |
| `> NOTE:` `> TIP:` `> WARNING:` `> DECISION NEEDED:` `> IN PERSON:` `> ONLINE:` | callouts; `DECISION NEEDED` also lists on `/#/manual/pending` |

A `{{…}}` directive sits alone on its line. **No price, hour, capacity, status name or rule is ever typed into a chapter**: the block reads the system (R-X43). Unknown directives explain themselves instead of breaking the page.

## Drafts from other modules

Staff-facing modules drop a draft at `docs/ops-manual/en/_pending/<module>.md`; the integrator merges it into a numbered chapter. Drafts render on `/#/manual/pending` but not as chapters.
