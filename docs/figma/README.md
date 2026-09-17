# Figma

- File: **Petrock Main**, key `3UXEOzU9ORGm5mInQqhiUW`
  https://www.figma.com/design/3UXEOzU9ORGm5mInQqhiUW/Petrock-Main
- Design page for the app: **new(justin + Mark)**, page id `404:14656`
  https://www.figma.com/design/3UXEOzU9ORGm5mInQqhiUW/Petrock-Main?node-id=404-14656
  (Justin wrote "new(justin = Mark)"; the page name uses "+". The linked node is the page itself, not a frame.)
- API access confirmed 2026-09-17 (HTTP 200 on files, nodes and images endpoints; role returned: editor). **Quota:** the key is on Figma's Starter tier; the plan quota was exhausted 2026-09-17 after ~40 reads (429, `Retry-After` ~4.6 days, so ~2026-09-22). See D-012. Nothing is published to a team library; all components and styles are local to the page.

## Pages in the file

| id | name | inventoried |
|---|---|---|
| `404:14656` | new(justin + Mark) | yes, see `analysis.md` |
| `0:1` | Wireframe | no |
| `203:1960` | Final UI | no |
| `58:118` | Design System | no (candidate home of the "new design system") |
| `156:1853` | ui design | no |
| `157:4274` | front desk | no |
| `162:1853` | user flow | no |
| `6:2` | Moodboard | no |
| `175:3419` | Old Files | no |
| `536:5005` | Meow Paws - Pet UI Kit for Adobe XD [XD Import] (01-Jun-2024-3.15pm) | no |

## Canonical sections on the design page

- **Section 22** `1841:50551` - customer mobile app, 9 nested flow sections, 48 frames (newest)
- **Section 14** `1813:146926` - front desk web, 7 nested sections, 31 frames + 4 timeline variants (newest)

## Files here

- `analysis.md` - full inventory, spatial regions, journey grouping, confident vs ambiguous, decisions needed from Justin (annotated with D-00x), appendices of every node
- `deep-dive.md` - second pass (2026-09-17, derived, partial): gap check against older sections, timeline/table views, vaccines and hotel coverage, spa vs grooming, Design System page, draft tokens, open verifications. Figma API quota (Starter tier) ran out mid-pass; retry ~2026-09-22.
- `../design/tokens-draft.md` - draft color/typography/spacing/icon tokens extracted from the page (derived; input to the rebuilt design system, D-007)
- `renders/` - PNG exports: `overview-onboarding-flow-section16.png`, `overview-boarding-flow-section20.png` (mobile), `overview-boarding-table-view-section1.png` (desktop); zoom crops `render-zoom-addpetdetails.png`, `render-zoom-choose-room-pets.png`, `render-zoom-estimate-checkout.png`, `render-zoom-table.png`
