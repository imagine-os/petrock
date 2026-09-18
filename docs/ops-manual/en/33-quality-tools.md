---
title: Quality tools (super admin)
code: M-33
roles: owner
part: VI
version: 0.2.0
updated: 2026-09-18
summary: Who: super admin (Sam Rivera in the demo). Where: Developer menu, "Quality" category, and the Docs menu.
rules: R-E09
---

# Quality tools (super admin)

> NOTE: Folded from the module draft `dev-quality` at integration (2026-09-18).

Who: super admin (Sam Rivera in the demo). Where: Developer menu, "Quality" category, and the Docs menu.

## Check a page at every screen size

1. Open **Developer › Quality › Responsive preview** (D-13). Pick the page. You see it at 360, 390, 768, 1280 and 1920 px at once; click a width chip to see one size full-scale.
2. For the last measured pass open **Responsive report** (D-12): green = fine, yellow = accessibility notes, red = the page scrolls sideways or crashed. Click a red cell to see which element sticks out, then "Preview at …".
3. To refresh the numbers ask a developer to run `npm run build && npm run qa:responsive` and rebuild.

## Fix data quickly

1. **Developer › Data workbench** (D-10). Pick the table (or start from the card index). Click any cell to edit it; Enter saves, Escape cancels.
2. "relations" shows what the table links to; "show rows" jumps to the linked rows.
3. **Export CSV** downloads what you see (search and filters applied). **Import CSV** takes a file or pasted text; match the columns, check the preview, choose insert or upsert. Importing more than one row asks for a manager PIN, like deleting.
4. Every change is written to the audit log.

## Rearrange a page

**Developer › Layout editor** (D-11): pick the page, drag sections or use the arrows, switch a section off to hide it, Save. "Reset to spec" puts the original order back. Only pages that have adopted the layout hook change; the editor tells you.

## Find anything in the documentation

**Docs › Docs search** (D-18) or type in the filter box at the top of the docs sidebar. Rule ids (R-E09), page codes (F-01) and plain words all work.

## Other tools

- **Component matrix** (D-08): is every building block documented and accessible?
- **Spec report** (D-09): is every page fully specified? Download the markdown for the changelog.
- **Seed inspector** (D-14): what demo data exists; "Reseed" rebuilds it.
- **Accessibility scan** (D-15), **Performance budget** (D-16), **Screenshot diff** (D-17), **Route manifest** (D-19).

## In-person lesson

Walk through the screens above with a colleague on a demo account: open each page named in this chapter, perform one real action (create, change a status, verify, record) and show where the result appears for the customer or the next shift. Record the completion with the button in the chapter header.

## Online lesson

Read the chapter, then open the linked pages yourself (the code chips open the live page) and repeat the steps on the demo data. Check the rules listed in the header in Settings > Rules and tell your manager if a rule is not doing what the chapter says. Record the completion with the button in the chapter header.
