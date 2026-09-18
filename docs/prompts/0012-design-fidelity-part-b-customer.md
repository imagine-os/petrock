# 0012 - Figma fidelity part (b): customer screens

date: 2026-09-18
from: Justin (Slack, relayed by the fidelity workflow after prompt 0010 / part a)
branch: `fidelity/customer-screens`

## Prompt

> I need you to get the design to actually look closer to the artwork. From figma, the icons, the colors, especially the homepage on mobile, everything needs to match the exact styling from before. Please fix this at the design system level

Workflow task: customer-screens - C-10 home (every state), services row, pet cards, upcoming booking card, section headers, C-11 my pets, C-13 pet profile, C-12 add pet wizard, C-30..C-36 hotel flow, C-50 grooming, C-70..C-72 profile / settings, notifications, chat. Match the exports block by block using only the restyled shared components and tokens; prefer fixing a shared component over page CSS; do not edit `tokens.ts`; keep responsive behaviour and dark mode; commit on the branch, do not push or merge.

## Response

Rebuilt the customer screens against the exports in `docs/figma/exports/petrock-main` (pixel-measured with PIL: `Home Page.png` hero 0..142, label rows on white, `#EEF2F5` bands 170..263 / 312..461 / 491..729, 122 px pet cards, 160 px booking cards, nav 773..844). Shared work: `HomeHero` (new), `Section band`, `AccountProfileHero` for pets, `HotelBookingFrame` on `CustomerScreenHeader` (+ `onBack`), Figma skins for `DatePicker`, `StayDatesCard`, `HotelRoomTypeCard`, `HotelEstimateCard`, `BookingPetCard`, `RadioGroup cards`, `PetPhotoPicker`. Pages: C-10 (D-189, alert gate, empty band, Chat tab dropped), C-11, C-12 / C-14 (D-190), C-13, hotel flow without stepper (D-191) with C-30 / C-31 / C-35 / C-36 restructured, C-70 / C-72 rows, C-80 split tabs, grooming frame. Every customer spec carries `tone`. Details, remaining gaps and the (empty) token wish-list: `docs/changelog/_pending/fidelity-customer-screens.md`. Screenshots regenerated for the touched codes; `npm run build` green.
