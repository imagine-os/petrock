# 0017 - Public website on real petrockhotel.com content: crawl, media hero, gallery, pricing from the live site

date: 2026-09-20 22:33 UTC · from: Justin Massion (Slack thread https://playsetllc.slack.com/archives/C0C2PP1NRPE/p1789937344275589) · surface: public website (P-01..P-04, P-12, new P-13), pricing seed, scripts · follows: prompt 0008 (fact-find, D-187), 0016

Models: Fable 5.1 (plan, review, docs), Opus 5 (site rebuild, pricing adoption), Sonnet 5 (crawl and inventory).

## Prompt (verbatim)

Justin: "for the public website please scrape the info and images and video from <http://petrockhotel.com|petrockhotel.com> ... especially the hero section should integrate that stuff well"

## Response

The public website now runs on the real petrockhotel.com content: https://imagine-os.github.io/petrock/#/site . Fable 5.1 planned and reviewed, Opus 5 built the site and the pricing update, Sonnet 5 did the crawl.

- Hero: the site's own background video over its real lobby photo, with the tagline, the service strip (Hotel · Grooming & Spa · Day care · Training) and Book now / Call Encino / Call Westwood. Phones, reduced-motion users and offline visitors get the photo; a visible play/pause control is always there.
- Real copy and the site's 50 photos across home, hotel, grooming, daycare and about, a Training & Fitness section, and a new Gallery page (P-13) with a keyboard-friendly lightbox. Images are served as responsive WebP derivatives from a new `npm run site:images` pipeline; the originals stay in `docs/reference/petrockhotel-scrape/`.
- The live price lists are now in the pricing tables (D-187 makes the site the first source): penthouse $135 / $150, suite $100 / $110, separate seasonal (Easter to Labor Day) and holiday (Thanksgiving to New Year's) bands, daycare cutoff 5 h, the Gold / Platinum / Diamond grid, 18 add-ons, prepaid daycare packages. Legal name: Petrock Holdings LLC. The full before/after table is `docs/reference/pricing-adoption-2026-09-20.md`.
- Still for the owner: per-holiday "please call" prices, cat grooming, the large-dog accommodation fee, dematting, whether training becomes a bookable service, and the moveable season dates each year.

Docs this turn: prompt 0017, changelog 0031, decisions D-224..D-230, kanban, page docs P-01..P-04, P-12, P-13, surfaces.md, v0.3.0.
