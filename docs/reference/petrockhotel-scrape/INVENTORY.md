# petrockhotel.com scrape inventory (2026-09-20)

Full crawl of the live client marketing site, done because the site is reachable from this
environment today (it was blocked by the egress proxy on 2026-09-18 — see
`docs/reference/petrockhotel-site.md` for that earlier, index-snippet-only digest). This
inventory supersedes Part A of that file wherever the two disagree; treat this scrape as the
primary source and re-verify the old file's "not indexed" rows below.

- Crawled: 2026-09-20, `curl` + BeautifulSoup, from `http://petrockhotel.com` (redirects
  `http://` → `https://` → `https://www.petrockhotel.com/`).
- Platform: Squarespace. The nav items **Home / About / Hotel / Spa / Day Care / Training and
  Fitness / Gallery / Reservations** are anchors on ONE long page (`/welcome`, also served at
  `/`), not separate pages — the 2026-09-18 digest's guess that `/hotel`, `/spa`, `/day-care`,
  `/about` were distinct URLs was wrong (or the site changed); they don't exist as own paths.
- Real separate pages found (via `/sitemap.xml` + header nav): `/`, `/blog` (+3 dead test
  posts), `/contact`, `/privacy`, `/petrock-gallery`, `/spa-gallery`. `/readme-pacific` also
  exists but is a leftover Squarespace theme "Style Editor Options" help page, not site content
  (excluded below). No `/pricing`, `/rates`, `/faq`, `/policies`, `/locations`, `/westwood`,
  `/encino`, `/book` — matches the earlier digest.
- Pages crawled: **8** (home + 5 content pages + 2 galleries; blog confirmed placeholder and not
  further expanded). Well under the 40-page cap.
- Images downloaded (≥300px wide, originals, deduped by content — two pairs shared a filename
  but had different bytes, kept as `NAME.jpg` / `NAME_2.jpg`): **50 files, ~11.3 MiB total**
  (11,838,210 bytes) in `images/`.
- Video: **one** background video on the hero (YouTube `https://youtu.be/htG1NJsfp24`, `sqs-video-background`
  component) with a static fallback image. No self-hosted `<video>`/mp4/webm anywhere on the
  site, no other YouTube/Vimeo embeds. Nothing to put in `video/` (left empty).
- Booking / CTA: **no booking software link anywhere** (no Gingr/PetExec/etc.). Every call to
  action is "call/text/email us" — phone, SMS and email only, both locations. Confirms
  A27/owner-Q15 from the earlier digest.
- New fact not in the earlier digest: `privacy.html` names the legal entity **"Petrock Holdings
  LLC"** and references a planned **`app.petrockhotel.com`** mobile app already in its privacy
  policy text.

## Page-by-page

| # | URL | Title | Meta description | H1/H2s | Text file | Images | Video |
|---|---|---|---|---|---|---|---|
| 1 | `https://www.petrockhotel.com/` (= `/welcome`) | Petrock Hotel and Spa \| Encino, CA | (empty) | H1 "Petrock hotel & Spa"; section H2/H3s: Hotel, Spa, Play, Training & Fitness, Hotel Menu, Spa Menu, Day Care Menu, Training & Fitness Menu, "For Reservations, Please Call!" | `pages/home.md` | ~30 unique (hero, about strip, hotel/spa/day-care/training photos, gallery strip) | Hero background video (see above) |
| 2 | `https://www.petrockhotel.com/contact` | Petrock Hotel and Spa \| Encino, CA | (empty) | "Contact Us" | `pages/contact.md` | 0 (text only) | none |
| 3 | `https://www.petrockhotel.com/privacy` | Petrock Hotel and Spa \| Encino, CA | (empty) | "Privacy Policy for Petrock Hotel & Spa (Petrock Holdings LLC)" | `pages/privacy.md` | 0 | none |
| 4 | `https://www.petrockhotel.com/petrock-gallery` | Petrock Hotel and Spa \| Encino, CA | (empty) | none (lightbox grid, numbered 1-28) | `pages/petrock-gallery.md` | 28 | none |
| 5 | `https://www.petrockhotel.com/spa-gallery` | Petrock Hotel and Spa \| Encino, CA | (empty) | none (lightbox grid, numbered 1-12) | `pages/spa-gallery.md` | 12 | none |
| 6 | `https://www.petrockhotel.com/blog` (+3 post URLs) | Petrock Hotel and Spa \| Encino, CA | (empty) | placeholder Squarespace test posts, 2018 | `pages/blog.md` | 0 (real content) | none |
| 7 | `https://www.petrockhotel.com/readme-pacific` | Petrock Hotel and Spa \| Encino, CA | (empty) | Squarespace theme docs, not site content | not written (noise, excluded) | — | — |

Image counts above count occurrences per page section; `images/` holds the deduplicated,
downloaded set (50 files) referenced from `all_images.json` / `download_results.json` below.

## Hero section (home-section, id="home-section")

- **Background**: `sqs-video-background`, `data-config-url="https://youtu.be/htG1NJsfp24"`
  (YouTube, muted/looping background style), with filter + 50% strength and a static
  `<img>` fallback: `DSC06310.jpg` (8475×5650 original) → downloaded to
  `images/DSC06310.jpg`.
- **Headline (H1)**: "Petrock hotel & Spa"
- **Subhead (H3, bold)**: "Hotel • Grooming • Day care • Training • FoOD"
- **CTA**: none in the hero itself — the site's only CTAs are phone/SMS/email, surfaced lower
  down in the About and Reservations sections (no button, no booking link).
- **Logo** (site header, all pages): `images/PetRockLogo.png` — original at
  `https://images.squarespace-cdn.com/content/v1/5af0d76f5b409b4ca8deac97/1525733637097-DLXTL33CLHHU2DUXA6IB/PetRockLogo.png`,
  alt text "Petrock Hotel and Spa | Encino & Westwood , CA".

## Pricing surfaced (new — was "not indexed" in the 2026-09-18 digest)

Full detail is in `pages/home.md`; headline numbers, per dog per night unless noted:

- **Penthouse**: $135 Mon–Thu / $150 Fri–Sun; seasonal (Easter–Labor Day) $145/$160; holiday
  (Thanksgiving–New Year's) $165/$175. 2 dogs: $15 off each; 3 dogs: $20 off each.
- **Suite**: $100 Mon–Thu / $110 Fri–Sun; seasonal $110/$120; holiday $120/$130. 2 dogs: $10 off
  each.
- **Daycare**: Full day (>5 hr) $45 (+$40 each add'l pet); Half day (<5 hr) $35 (+$30); Per hour
  $15 (+$10). Package discounts: 7 days 5%, 14 days 7.5%, 21 days 10% (prepaid in full).
- **Grooming** — Gold / Platinum / Diamond by size (S/M/L/XL/Giant, cats too on Platinum/Diamond),
  full line-item "On the Side" add-on price list (Furminator, medicated/flea shampoo, Frontline,
  facial, nail trim/polish, anal glands, ear clean, teeth, face/sanitary trim, foxtail removal,
  dental scale/polish, transportation $35-55). $12 sanitation fee included in every price;
  "rates are estimates, pets assessed in person" disclaimer confirmed verbatim.
- **Training**: private course $500/6 wk or $900/12 wk combo; seminars $95/45 min; agility $125
  (1 hr) or $660/6 wk; consultations $70 (puppy consult includes food/toy/pee pads/free gold
  groom; adult consult includes spray + treats).

These numbers are new inputs for the pricing-engine seed / owner Q5-6, Q9-10 — flagging for
Justin/owner sign-off before anything gets adopted into `rates`/`daycare_pricing`/`packages`
tables (that adoption is out of scope for this scrape).

## Contact / hours (confirms, does not change, the 2026-09-18 digest)

- Encino: (818) 817-9451, SMS (818) 406-5196, info@petrockhotel.com, 17401 Ventura Blvd, Encino,
  CA 91316, M-F 7am-7pm / Sa-Su 9am-5:30pm.
- Westwood: (310) 479-4319, SMS (310) 405-2076, westwood@petrockhotel.com, 10946 Santa Monica
  [Blvd], LA, CA 90025, M-F 8am-6pm / Sa-Su 8am-5:30pm (site does **not** say Sunday closed —
  the Yelp conflict noted in owner Q13 is not resolved by this scrape either way).

## Files in this folder

- `INVENTORY.md` — this file.
- `pages/*.md` — per-page markdown (text, headings, image lists).
- `images/` — 50 downloaded originals (≥300px wide), including the hero fallback and the logo.
- `video/` — empty; no self-hosted video files found (hero is a YouTube embed, recorded above by
  URL only per the task's instruction for large/external video).
