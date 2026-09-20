# petrockhotel.com fact-find vs. the Petrock app seed (2026-09-18)

Status: **D-187** makes petrockhotel.com the first source for pricing and business facts. This file is the cleaned digest of the 2026-09-18 fact-find (prompt 0008, Justin 13:45 UTC: "look at petrockhotel.com 1st for accurate data about pricing and stuff"). Re-verify every row against the live site when it is reachable; update this file, never the decisions retroactively (new rows only).

## 0. Access caveat (read first)

Direct fetches of `https://petrockhotel.com` (and `/sitemap.xml`, `?format=json`) were refused by the session's egress proxy (`CONNECT` -> 403, organization allowlist). Third-party mirrors (yelp.com, pethotels.com, abc7.com, dogsniffer.com, dogpackapp.com) are blocked too. The Squarespace mirror and caches were not used for the same reason (policy denial is reported, not routed around). Remedy: an org owner allows the domain in the Claude Tag settings (https://claude.ai/admin-settings/claude-tag), or Justin pastes the page copy into the thread.

**Every Part A fact comes from search-index snippets** of the pages, not verbatim page reads. Prices and policies that live behind JavaScript or images did not surface. Treat Part A as "publicly indexed" and re-verify before adopting anything further.

Pages discovered (Squarespace title pattern `<Page> — Petrock Hotel and Spa | Encino & Westwood , CA`): `/` (home), `/hotel`, `/spa`, `/spa-gallery`, `/day-care`, `/about`, `/contact`, `/privacy`, plus a training section on `/` or `/about`. Not found in the index: `/pricing`, `/rates`, `/faq`, `/policies`, `/locations`, `/westwood`, `/encino`, `/book`. Hosting: Squarespace (mirror host `petrock.squarespace.com`).

## 0a. Update 2026-09-20

The domain was **reachable on 2026-09-20** and fully crawled (prompt 0017): every page, the copy, the price
lists and 50 images are in `docs/reference/petrockhotel-scrape/` (INVENTORY.md, `pages/*.md`, `images/`,
`all_images.json`), D-224. **`petrockhotel-scrape/INVENTORY.md` supersedes Part A below wherever the two
differ** — Part A is the 2026-09-18 search-index reconstruction and is kept for history, not corrected in
place.

What the crawl settled: the price rows Part A marks "not indexed" (A11 nightly prices, A15 package tier
names and prices, A17 daycare prices and cut-offs) are now known and **adopted into the pricing tables**
per `pricing-adoption-2026-09-20.md` (D-229) — penthouse $135 / $150, suite $100 / $110, a separate
Seasonal (Easter - Labor Day) and Holiday (Thanksgiving - New Year's) band, a 5 h daycare cut-off, the
Gold / Platinum / Diamond grid by size, 18 add-ons and the prepaid daycare packages. The legal entity is
**Petrock Holdings LLC** (D-230). Addresses, phones, SMS numbers, emails and hours for both locations
matched the seed exactly and were left alone.

Still open for the owner (numbers are the question list at the end of this file):

- **Q1-Q3** rooms - penthouse names / themes per location, how many penthouses and suites, the weight
  rules. The crawl added no room inventory.
- **Q6** season dates: the two bands are now known by name, but Easter and Thanksgiving move every year
  (seeded with the 2026 dates) and every band ends with a per-holiday "Holidays - **please call**" line
  whose prices are not published. **Q7** (deposit, cancellation, no-show) and **Q8** (check-in / check-out
  times, late pickup) are still not on the site.
- **Q9** grooming: the Gold / Platinum / Diamond grid is adopted, but the site quotes **ranges** for
  Platinum XL ($120-140), Diamond XL ($150-175), Sanitary Trim ($10-20), Face Trim with Sanitary ($25-30)
  and Foxtail ($20-25) - the low end is seeded, confirm that is the right number to show - and it lists
  **cat** grooming (Platinum $120-130, Diamond $130-140), which has no species column and is not seeded.
- **Q11** the vaccination and veterinary-travel fees, webcam, medication and transport: still unanswered,
  though the spa menu does add Transportation ($35-55, seeded at $35). **Q12** vaccine validity windows
  and puppy minimum age: still not on the site.
- **Q13** Westwood Sunday: the conflict stands (site Sa-Su 8 am-5:30 pm, Yelp Sunday closed).
- **Q14** whether Training & Fitness becomes a bookable service; the prices are recorded in
  `pricing-adoption-2026-09-20.md` but nothing is seeded until a `training_courses` table exists (D-228).
- **Q15** keeping phone / SMS booking alongside the app.
- **New from this crawl**: the "Large Dog Accommodation fee may be applicable" amount (no number on the
  site), the dematting surcharge, and confirmation of the D-229 **not-adopted** list - hotel long-stay
  discounts, the 2 % tax and the 3.89 % card fee are not published on the site and were left as they were.

**Q10** (daycare half / full-day cut-off) is **resolved**: the site says Full Day > 5 hr, Half Day < 5 hr,
so `daycare_pricing.threshold_hours` is 5 and rule R-F01 no longer waits on Justin.

## Part A. Website facts (indexed snippets)

| # | Fact | Website / public says | Source |
|---|---|---|---|
| A1 | Brand name | "Petrock Hotel and Spa" (also "PETROCK HOTEL & SPA" on Instagram) | https://petrockhotel.com/ title; https://instagram.com/petrockhotel |
| A2 | Slogan | "Rock Out With Your Paws Out" | visitor blog (2011); matches the invoice footer in the designs |
| A3 | Founded | "established in 2011" | https://petrockhotel.com/about |
| A4 | Positioning | "cozy accommodations in luxurious music-themed penthouses and suites"; "boutique hotel is all-inclusive" | https://petrockhotel.com/, /about |
| A5 | Room types | Penthouses, Suites | https://petrockhotel.com/hotel |
| A6 | Penthouse inclusions | "Petrock Penthouses offer TV, premium bed, toys during the day, potty pads, room service, playtime, 2 walks per day, photos and videos every night of their stay, and a bedtime tuck in & tummy rub." | https://petrockhotel.com/hotel |
| A7 | Suite inclusions | "Petrock Suites offer a premium bed, toys during the day, potty pads, room service, playtime, 2 walks per day, photos and videos every night of their stay, a bedtime tuck in & tummy rub." (= Penthouse minus TV) | https://petrockhotel.com/hotel |
| A8 | Walks per day | "2 walks per day" (hotel, about) vs "3 walks a day ... pictures and videos emailed everyday" (older home copy) | https://petrockhotel.com/, /hotel, /about |
| A9 | Daily updates | "pictures, videos and status reports sent everyday" | https://petrockhotel.com/about |
| A10 | Room themes | "private rooms with musical themes, such as country, pop or rock n' roll" (ABC7 feature); an "Americana room" penthouse (visitor blog, early years) | https://abc7.com/archive/8748336/; visitor blog |
| A11 | Nightly prices | **Not indexed.** Only a directory aggregator line "starting at $68 before taxes and fees" (unit unclear, likely stale) | pethotels.com listing (Encino) |
| A12 | Room counts / weight limits | Not indexed | - |
| A13 | Spa services | "spa bath, blow dry, brush out, brush teeth, paw massage" ... "nail trim, anal expression, and ear clean" ... "full package haircut"; "relaxing massages, deep cleaning, conditioning and specialty services"; "massages, facials and can even get their nails painted" (ABC7) | https://petrockhotel.com/spa, /about, abc7 |
| A14 | Grooming pricing policy | "All grooming prices include a $12 sanitation fee to ensure all pet belongings and equipment have been cleaned with animal safe and COVID-19 approved disinfectant. Grooming rates are estimates, pets will be assessed in person for actual rate." | https://petrockhotel.com/spa |
| A15 | Package tier names Gold / Platinum / Diamond | **Not indexed** on the site (the three bundles in A13 map to the design tiers but no names or prices surfaced) | https://petrockhotel.com/spa |
| A16 | Daycare | Area called "Play": "dogs can interact, exercise, socialize and learn good social skills with their 'pack leader' daycare attendant"; "interactive jungle gym accessories, toys, and activities"; "specially designed floors maintain pets' joint and bone health"; "vaccine verification required for all pets" | https://petrockhotel.com/day-care |
| A17 | Daycare prices / cut-offs | Not indexed | - |
| A18 | Training | "private personal training, training seminars, agility courses and a canine good citizen course"; "puppy, intermediate, and advanced courses"; "call to set up a consultation" | https://petrockhotel.com/ (training section) |
| A19 | Encino address | 17401 Ventura Blvd, Encino, CA 91316 | https://petrockhotel.com/contact; yelp; yellowpages |
| A20 | Encino phone / SMS / email | (818) 817-9451; SMS (818) 406-5196; info@petrockhotel.com | https://petrockhotel.com/contact |
| A21 | Encino hours | "M-F 7am-7pm, Sa-Su 9am-5:30pm" (contact page, yellowpages). One directory says Sa-Su 9-5. | https://petrockhotel.com/contact; yellowpages.com |
| A22 | Westwood address | 10946 Santa Monica Blvd, Los Angeles, CA 90025 (one gift-card site lists 10948) | https://petrockhotel.com/contact; yelp (los-angeles-4) |
| A23 | Westwood phone / SMS / email | (310) 479-4319; SMS (310) 405-2076; westwood@petrockhotel.com | https://petrockhotel.com/contact |
| A24 | Westwood hours | Site / Nextdoor: "M-F 8am-6pm, Sa-Su 8am-5:30pm". Yelp: "Mon-Fri 8am-7pm, Sat 8am-5:30pm, Sun closed" (conflict, owner Q13) | https://petrockhotel.com/contact; nextdoor.com; yelp |
| A25 | Westwood history | Formerly "Tender Loving Care Pet Spa (re-opened now Petrock Hotel And Spa)"; Yelp categorises Westwood as "Pet Groomers" (grooming-led site) | dogdaycarehub.com; yelp |
| A26 | Early drop-off | "early drop off is available but requires advance arrangements and reservations" | https://petrockhotel.com/contact |
| A27 | Reservations | "recommends reservations for all grooming and boarding"; contact by phone / SMS / email; Instagram asks to call for appointments. No online booking engine surfaced; legacy screenshots in the design drop are PetLinx desktop | https://petrockhotel.com/contact; instagram |
| A28 | Vaccines (list), deposit, cancellation, check-in/out times, late fees, holiday surcharge, webcam, transport | **Not indexed** (only "vaccine verification required" on day-care) | - |
| A29 | Social | facebook.com/petrockhotel, instagram.com/petrockhotel, TikTok place page | search |

## Part B. App seed / schema before this change (HEAD db4d689)

| Area | Seed / schema said | File |
|---|---|---|
| Locations | Encino 17401 Ventura Blvd (correct), phone placeholder; Westwood **10900 Wilshire Blvd 90024** (placeholder), phone placeholder; one hours object for both (M-F 7-19, Sa-Su 9-17:30) | `src/tenant/locations.ts` |
| Capacities | Encino penthouse 12 / suite 42 / daycare 20 / grooming 2; Westwood 20 / 16 / 15 / 2; "Dogs over 30 lbs only fit the bottom 6 penthouse rooms" | `src/data/seed/core.ts` |
| Room types | Penthouse copy close to the site; Suite copy invented (D-067: "premium bed, toys, potty pads, playtime, 2 walks per day and a bedtime tuck-in") | `src/data/seed/core.ts` |
| Rooms | `PH(B) 101..106`, `PH(T) 107..`, `Suite A1..`; no display-name / theme column | `src/data/schema/core.ts`, seed |
| Rates | Penthouse $120 / $135 (+$20 seasonal), Suite $85 / $95 (+$15 seasonal), global | seed |
| Fees | Card service fee 3.89 % only | seed |
| Packages | Gold / Platinum / Diamond by size S..Giant (Diamond invented, pending) | seed |
| Daycare | Full $45 (> 6 h), Half $35, Play Hour $15, Walk $12 | seed |
| Vaccines | Rabies, DHPP, Bordetella required; Lepto, Influenza recommended | seed |
| Room naming in designs | '105 - Rock' (tables); 'PH(B) COUN', 'PH(B) Regg', 'PH(T) Keit', 'PHB Kaws S' (timeline / legacy) | `docs/data/entities-from-designs.md`, R-K07 |

## Part C. Diff and verdicts

| Fact | Website says | App seed said | Verdict / action |
|---|---|---|---|
| Business name | "Petrock Hotel and Spa" | "Petrock Hotel"; locations "Petrock Encino / Westwood" | minor; company settings copy (later) |
| Slogan | "Rock Out With Your Paws Out" | same | match |
| Encino address | 17401 Ventura Blvd, Encino, CA 91316 | same | match |
| Encino phone / SMS / email | (818) 817-9451 / (818) 406-5196 / info@petrockhotel.com | placeholder, none, none | **adopted** (D-187) |
| Westwood address | 10946 Santa Monica Blvd, Los Angeles, CA 90025 | 10900 Wilshire Blvd 90024 | **adopted** (D-187) |
| Westwood phone / SMS / email | (310) 479-4319 / (310) 405-2076 / westwood@petrockhotel.com | placeholder | **adopted** (D-187) |
| Encino hours | M-F 7-19, Sa-Su 9-17:30 | same | match |
| Westwood hours | M-F 8-18, Sa-Su 8-17:30 (Yelp: Sun closed) | Encino hours reused | **adopted** site hours; Sunday to owner (Q13) |
| Room types | Penthouse, Suite | same | match |
| Penthouse inclusions | TV, premium bed, toys during the day, potty pads, room service, playtime, 2 walks, photos & videos every night, tuck-in & tummy rub | same minus "during the day" / "every night of the stay" | **adopted** wording |
| Suite inclusions | penthouse minus TV | invented shorter copy | **adopted** (D-185, resolves R-D03) |
| Walks per day | 2 (hotel / about) vs 3 (old home copy) | 2 | match on the hotel page |
| Room themes | music-themed rooms: country, pop, rock n' roll; "Americana" | none; codes only | **missing in app** -> D-186, owner Q1-2 |
| Nightly prices | not indexed | PH $120 / $135, Suite $85 / $95, seasonal +$20 / +$15 | owner Q5-6 |
| Multi-dog / long-stay discounts | not on site | seeded | owner |
| Deposit / cancellation / late fee / holiday surcharge | not on site | deposit path, amounts undefined | owner Q7-8 |
| Check-in / check-out times | only "early drop off requires advance arrangements" | window 07:00-20:00 | owner Q8 |
| Weight / room-fit limits | not on site | 30 lb bottom-6 note; 55 lb Suite rule | owner Q3 |
| Room counts | not on site | 12 / 42 Encino, 20 / 16 Westwood | owner Q2 |
| Grooming packages | three bundles, no names or prices | Gold / Platinum / Diamond with prices | owner Q9 |
| Grooming sanitation fee | $12 included in every groom price | no row | **adopted** as `fees` row `fee_sanitation` (included, totals unchanged) |
| Grooming disclaimer | "rates are estimates, pets will be assessed in person" | none | **adopted** on C-54 (`cgd.groomingEstimateNote`) |
| Daycare | "Play" area, pack leader, jungle gym, vaccine verification required | prices seeded, no "Play" copy | owner Q10; copy later |
| Vaccines | list not indexed | Rabies, DHPP, Bordetella + Lepto, Influenza | owner Q12 |
| Training | private, seminars, agility, CGC | not in app | owner Q14 (extras) |
| Booking software | none surfaced (phone / SMS / email) | app replaces PetLinx (D-144) | consistent; owner Q15 |

## Penthouse theme names and room naming (D-186)

- Public sources: country, pop, rock n' roll (ABC7; site says "music-themed"); Americana (2011 blog). No art-style names surfaced in the index; Justin (13:45 UTC) says themes are music genres **or** art styles (e.g. Andy Warhol).
- Design drop: timeline / legacy codes `PH(B) COUN`, `PH(B) Regg`, `PH(T) Keit`, `PHB Kaws S`, table label `105 - Rock` -> likely Country, Reggae, Keith (Haring?), Kaws, Rock: a mix of music and pop-art themes; unconfirmed.
- App today: `rooms.code` only. D-186 requires a `display_name` / `theme` column and per-location names from the owner before the seed changes (kanban item).

## Owner questions (for Justin to take to the owner)

Posted in #petrock-hotel on 2026-09-18 13:53 UTC (prompt 0008).

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

Answers land as new decision rows (D-188 onward) and in the prompt 0008 running log.
