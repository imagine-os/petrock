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

## Answers (running log)

Appended as answers arrive in the same Slack thread; never edited, only extended.

| Timestamp (UTC) | Q | Justin's answer (verbatim) | Claude's reply (summary) | Decision row |
| --- | --- | --- | --- | --- |
| 2026-09-18 13:40 | 18 | "Do not write to  company os unless I tell you to.  That project is seperate for now. The dev will connect wheb he is ready. Its only for your reference as of now." | Company-OS stays reference only: nothing wired or written to it until Justin says so; the adapter seam stays empty for the dev to connect later. | D-183 |
| 2026-09-18 13:40 | 14 | "I assume we can define this from supabase for auth later?" | Yes: password rules and lockout come from Supabase Auth's settings when the app moves there (configurable min length / required characters, rate limits for brute-force); the listed numbers are what the mock enforces until then. 30-day deletion grace and English + Spanish are app-side and stay as built. | D-184 (D-024 / D-025 superseded, D-085 / D-088 decided) |
| 2026-09-18 13:45 | (new) | "You an give me a list of questions for the owner. As a note suites are smaller than penthouses. each penthouse has a different theme, the themes are music genre are art style. such as rock, pop, or andy warhol theme.  We will set the naming in the system so its not just penthouse 1, 2, 3, etc. but has the name of the penthouse also. look at petrockhotel.com 1st for accurate data about pricing and stuff." | Owner question list posted (15 questions, below); site fact-find done from indexed copies because petrockhotel.com is network-blocked for the agent; seed updated where the listings settle it (Westwood address / hours, real phones, Suite copy, $12 sanitation fee, estimate disclaimer). | D-185, D-186, D-187 |

### 13:45 UTC - owner question list (verbatim exchange)

Justin Massion (13:45 UTC):

> You an give me a list of questions for the owner. As a note suites are smaller than penthouses. each penthouse has a different theme, the themes are music genre are art style. such as rock, pop, or andy warhol theme.  We will set the naming in the system so its not just penthouse 1, 2, 3, etc. but has the name of the penthouse also. look at petrockhotel.com 1st for accurate data about pricing and stuff.

Claude (13:53 UTC):

> Here's the owner list. One caveat: petrockhotel.com is blocked from where I run (network policy), so this comes from search-indexed copies of the site, press and listings, not the live pages. An org owner can allow the domain in the Claude Tag settings (https://claude.ai/admin-settings/claude-tag), or paste the pricing page here and I'll work from that.
>
> Your room notes are in: suites smaller than penthouses, themed penthouses, theme name on every room.
>
> **Rooms**
> 1. Full list of penthouse names per location. Press mentions Country, Pop, Rock n' Roll, Americana; the old timeline shows COUN, Regg, Keit, Kaws. Which are real, and which are Encino vs Westwood?
> 2. How many penthouses and suites per location? Designs say 12/42 Encino, 20/16 Westwood.
> 3. Weight rules: over 30 lb only in the 6 bottom penthouses, 55 lb+ must be a suite. Both true? Any breed, age or intact-dog limits?
> 4. Suite inclusions look like penthouse minus the TV. Right?
>
> **Pricing & policy**
> 5. Nightly rates: Penthouse $120 Mon-Thu / $135 Fri-Sun, Suite $85 / $95, seasonal $140/$155 and $100/$110? Per room or per dog? Same at Westwood?
> 6. Season dates and holiday surcharges or blackout dates.
> 7. Deposit, cancellation window, no-show charge.
> 8. Check-in and check-out times, late pickup fee.
> 9. Grooming: Gold / Platinum / Diamond prices per size. Is the $12 sanitation fee inside the price or a line item? Keep "rates are estimates, assessed in person" on app quotes?
> 10. Daycare: half vs full day cutoff (5 h or 6 h), Play Hour price, Walk $12, any multi-day passes?
> 11. What are the Vaccination Fee $40 and Veterinary Travel $50? Webcam access, medication fee, transport?
>
> **Operations**
> 12. Vaccines: Rabies, DHPP, Bordetella required, Lepto and Influenza recommended? Bordetella valid 6 or 12 months? Puppy minimum age?
> 13. Westwood Sunday: site says 8-5:30, Yelp says closed. Which?
> 14. Training (private, agility, CGC): bookable in the app or off-app?
> 15. Keep phone/SMS booking alongside the app?
>
> I'll fix the seed data the listings settle (Westwood address, real phones and hours, Suite copy, sanitation fee) and log the room notes as decisions.

Decisions from this message (`docs/decisions.md`): **D-185** suites are smaller than penthouses, Suite copy = penthouse minus TV (D-067 superseded); **D-186** penthouses are themed and named in the system (names pending owner, kanban item); **D-187** petrockhotel.com is the first source for pricing and business facts (site network-blocked on 2026-09-18; digest in `docs/reference/petrockhotel-site.md`). Changelog `docs/changelog/0022-site-facts-and-owner-questions.md`.

## Owner questions (for Justin to take to the owner)

Same 15 questions as posted at 13:53 UTC, kept here so answers can be filed one by one (each answer becomes a new decision row, D-188 onward).

**Rooms**
1. Full list of penthouse names per location. Press mentions Country, Pop, Rock n' Roll, Americana; the old timeline shows COUN, Regg, Keit, Kaws. Which are real, and which are Encino vs Westwood?
2. How many penthouses and suites per location? Designs say 12/42 Encino, 20/16 Westwood.
3. Weight rules: over 30 lb only in the 6 bottom penthouses, 55 lb+ must be a suite. Both true? Any breed, age or intact-dog limits?
4. Suite inclusions look like penthouse minus the TV. Right?

**Pricing & policy**
5. Nightly rates: Penthouse $120 Mon-Thu / $135 Fri-Sun, Suite $85 / $95, seasonal $140/$155 and $100/$110? Per room or per dog? Same at Westwood?
6. Season dates and holiday surcharges or blackout dates.
7. Deposit, cancellation window, no-show charge.
8. Check-in and check-out times, late pickup fee.
9. Grooming: Gold / Platinum / Diamond prices per size. Is the $12 sanitation fee inside the price or a line item? Keep "rates are estimates, assessed in person" on app quotes?
10. Daycare: half vs full day cutoff (5 h or 6 h), Play Hour price, Walk $12, any multi-day passes?
11. What are the Vaccination Fee $40 and Veterinary Travel $50? Webcam access, medication fee, transport?

**Operations**
12. Vaccines: Rabies, DHPP, Bordetella required, Lepto and Influenza recommended? Bordetella valid 6 or 12 months? Puppy minimum age?
13. Westwood Sunday: site says 8-5:30, Yelp says closed. Which?
14. Training (private, agility, CGC): bookable in the app or off-app?
15. Keep phone/SMS booking alongside the app?

| Owner Q | Resolves | Current default |
| --- | --- | --- |
| 1, 2 | D-186 rooms naming, R-K07, capacities | codes `PH(B) 101` / `Suite A1`; 12/42 Encino, 20/16 Westwood |
| 3 | D-065, D-115, R-X01 | 30 lb bottom-6 note, 55 lb Suite hard block |
| 4 | D-185 | adopted from the site |
| 5, 6 | D-019 rates, seasons seed | $120/$135, $85/$95, +$20/+$15 seasonal; Winter holidays, Summer peak |
| 7, 8 | D-060, D-112, D-109 | 30 % deposit, 48 h; check-in window 07:00-20:00 |
| 9 | D-076, D-137, D-187 | Diamond placeholders; $12 fee included; disclaimer shown |
| 10 | D-075, D-162 | 6 h cutoff, Play Hour $15, Walk $12 |
| 11 | services seed | $40 / $50 rows, meaning unknown |
| 12 | vaccine_types seed, D-003 | Rabies, DHPP, Bordetella required; Lepto, Influenza recommended |
| 13 | D-187 (Westwood hours) | site hours Sun 8-17:30 |
| 14 | extras scope (D-005) | off-app |
| 15 | D-144 | app + desk; phone/SMS as `source: 'phone'` |
