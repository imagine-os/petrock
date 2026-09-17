# 0003 - Side menu categories, Figma export / plan question

- Source: Slack #petrock-hotel thread https://playsetllc.slack.com/archives/C0C2PP1NRPE/p1789669007022039 (message 2026-09-17 19:17 UTC)
- Date: 2026-09-17
- Requester: Justin Massion (owner)
- Follows: `docs/prompts/0002-scope-decisions.md` (response asked about Santa Maria access and a paid Figma seat)
- Changelog: `docs/changelog/0004-side-menu-and-figma-access.md`

## Prompt (verbatim)

i think santa maria is connected now
As a small note, the side menu bar should have a toggle for categories, with option to toggle and expand all. Done in a way that matches the design style.


Figma key is not paid. i dont really want a paid account, but i can. Can i just export the figma file? if its worse to export it, its totally fine to pay for the upgrade. just tell me what to buy, and tell me if there's a discount code anywhere.  Also in the figma file there is a page with design system. Not sure if its as good as you making it proper but you can reference it https://www.figma.com/design/3UXEOzU9ORGm5mInQqhiUW/Petrock-Main?node-id=58-118

## Response

Export, don't pay. Figma caps API reads on Starter-plan files no matter whose key is used, and a manual export gives me what I still need: the visuals. I already have the colors, fonts, and structure, and the API resets around Sep 22 for anything left.

What to export from Petrock-Main:
1. On the new(justin + Mark) page, select Section 22 and Section 14 and export as PNG at 2x. Do the same for the Design System page.
2. File menu, then Save local copy, for the .fig file.
3. Upload the zip and the .fig here, or put them in the petrock repo under docs/figma/exports.

If you'd rather upgrade anyway, the team that owns the file needs a Professional plan with one Dev seat (roughly $12 a month on annual billing, $15 monthly). Annual billing is the only discount, and Figma has no promo codes for regular businesses. Confirm prices on figma.com/pricing, since I couldn't load that page from here.

Santa Maria still isn't visible to Claude as of 2:18 PM your time. Company-OS and the imagine-os repos show up, so the GitHub App is installed on those organizations but not on Santa-Maria-Tenis-Club. A Claude organization owner needs to add that GitHub organization and enable the os repo under Claude Tag settings (https://claude.ai/admin-settings/claude-tag).
