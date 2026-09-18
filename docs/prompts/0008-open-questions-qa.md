# 0008 - Open questions Q&A: the list for Justin

- Source: Slack #petrock-hotel thread (messages 2026-09-18 ~13:28-13:32 UTC)
- Date: 2026-09-18
- Requester: Justin Massion (owner)
- Follows: `docs/prompts/0005-build-the-whole-thing.md` (release 0.1.0 response listed the rows marked proposed) and `docs/prompts/0007-qa-fixes.md` (D-175..D-182)
- Changelog: `docs/changelog/0021-open-questions-qa.md`

## Prompt (verbatim)

ask what ever questions you want of me here

## Response

Here's the list, from the 35 decisions in the repo still marked "needs Justin" plus the blockers. Answer in any order, one word is fine. Anything you skip stays as built (current default in brackets).

**Pricing & money**
1. Hotel deposit: what % of the total, and how long is free cancellation? [30%, 48 h]
2. Card fee 3.89% and 2% tax: right numbers, and does the fee also hit deposits? [yes to both]
3. Diamond groom: prices per size S/M/L/XL/Giant and what's included? [placeholders with a "pending" note]
4. Dog size bands in lbs: S <20, M <40, L <70, XL <100, Giant 100+? [as listed]
5. First and last day of a stay: full nights, or half-day multipliers like old PetLinx? [nights only]
6. Walk $12: daycare add-on or separate walking service? [separate walk log]

**Daycare (next build)**
7. Half vs full day cutoff: 5 h (mobile design) or 6 h (settings screen)? [6 h]
8. Do hotel guests count against daycare capacity? [no]
9. Minimum gap between a daycare day and a groom: 60 min ok? [60]
10. Grooming capacity: fixed 2 dogs per location, or equal to groomers on shift? [2]

**Product / rules**
11. Desk check-in and check-out: one click, or manager PIN? [no PIN]
12. When staff verify the last vaccine, auto-confirm the pending booking? [auto]
13. Room fit: 55 lb+ must be a Suite, 30 lb+ can't take a top penthouse. Hard block in the app? [yes]
14. Auth: 8-char password with a letter and number, 5 failed logins locks 15 min, 30-day grace on account deletion, English + Spanish only. Fine? [yes]

**Access / blockers**
15. GitHub Pages: on imagine-os/petrock, Settings > Pages > Source = GitHub Actions, then run the Deploy workflow. Live URL will be https://imagine-os.github.io/petrock/. Done, or want a hand?
16. Figma: the Starter key is out of quota until about Sep 22. Got a paid-seat token, or we wait?
17. Santa-Maria-Tenis-Club/os still isn't enabled for Claude (an org owner does it at https://claude.ai/admin-settings/claude-tag). Still want that digest?
18. Company-OS: ok to integrate over its REST API, Petrock as one tenant with two org units, or does the Company-OS dev want something else?

Model note per your standing rule: this is Claude Fable 5.1.

## Question to decision map

Each question resolves the decision rows (`docs/decisions.md`) and open-question numbers (`docs/open-questions.md`) listed here.

| Q | Decision rows | Open questions |
| --- | --- | --- |
| 1 | D-060, D-112 | 47 |
| 2 | D-019, D-060 | 47, 50 |
| 3 | D-076, D-137 | 98, 112 |
| 4 | D-019, D-034, D-080 | 28 |
| 5 | D-109 | 88 |
| 6 | D-162 | 61 |
| 7 | D-019, D-075 | 58 |
| 8 | D-114 | 60 |
| 9 | D-074 | 58, 60 |
| 10 | D-131 | - |
| 11 | D-179 | 104 |
| 12 | D-128 | 34 |
| 13 | D-065, D-115 | 4 |
| 14 | D-024, D-025, D-085, D-088 | 14, 15, 63 |
| 15 | GitHub Pages enablement (changelog 0020) | - |
| 16 | D-012 | - |
| 17 | D-009 | - |
| 18 | `docs/reference/company-os.md` recommendation | - |

Still-proposed rows not asked about (D-004 name, D-010, D-011, D-035, D-037, D-047, D-086, D-123, D-138, D-148, D-154, D-174 and the module "proposed" rows) stay as built by default; they are flagged to Justin only if he objects.

How answers land: each answer is appended to `docs/decisions.md` as a new row (D-183 onward, never renumbering) and the old row's status is updated to point at it. Nothing in `docs/decisions.md` or `docs/open-questions.md` changes until an answer arrives.
