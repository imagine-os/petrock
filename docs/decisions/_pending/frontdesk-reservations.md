# Pending decisions - frontdesk-reservations (F-01..F-15)

Working choices made while building the module. The integrator appends accepted rows to `docs/decisions.md` (next free D-number); rows marked **needs Justin** stay pending until he answers.

| Id (placeholder) | Decision | Rationale | Source question |
| --- | --- | --- | --- |
| FDR-01 | The reservations table groups are **Arriving / Departing / Staying / Daycare / Checked out** for the selected day; "Checking out" from the design is the same as Departing. | Open question 69: the design mixed statuses inside DEPARTING; the lifecycle buckets (`dayBucket`, R-I05) are unambiguous. | open-questions 69, 70 |
| FDR-02 | Design chips **Future / Checking In / Checked Out / Completed map onto confirmed / checked_in / checked_out**; no second vocabulary (R-I02). | D-019 fixed one lifecycle. | open-questions 70 |
| FDR-03 | The **v2 table (date navigator, 18 columns) supersedes v1**; "Timesheet View" = the Timeline (F-13); "See All" = the "All upcoming" mode; Filters = status / kind / room type / cancelled toggle + search. | Open question 71. | open-questions 71 |
| FDR-04 | **Row click opens the booking detail**; per-row quick action is the natural next transition; no bulk actions yet. | Open question 72; bulk check-in can come later. | open-questions 72 |
| FDR-05 | **Nbr days = nights** (check-out day - check-in day); a same-day stay counts as one night for availability and price. Pet(s) lists every pet, Pet count is the number. | Open question 73. | open-questions 73 |
| FDR-06 | **Booking detail is hotel-specific** (dates, room, deposits, balance, activity); the tax lines are the real engine lines and are added to the total (design's five placeholder tax lines dropped). | Open question 74; R-H06 was a UI-kit placeholder. | open-questions 74 |
| FDR-07 | **Timeline bar colour = booking status** (R-I09); flags = vaccine issue, balance due, notes, medication; the "..." chips become truncated labels with a full title. | Open question 77. | open-questions 77 |
| FDR-08 | The **SORT / FILTER / date-range variant is deprecated**; the Today / arrows / Filters header is used everywhere (ReservationDayNav). | Open question 78. | open-questions 78 |
| FDR-09 | Room rows are the seeded room codes (PH(B) 101 ... , Suite A1 ...); **Suites group is populated**; Daycare rows are Full day / Half day / Play hour. | Open question 81. | open-questions 81 |
| FDR-10 | **Board view designed fresh**: columns Requested / Confirmed / In progress / Done / Cancelled-no show, cards "Pet · Breed / Customer / Package · size / minutes / groomer", groomer colour as accent, PIN on the closed column (R-X06). | Open question 84; D-008. | open-questions 84 |
| FDR-11 | **Phone degradation**: timeline scrolls horizontally with a sticky 96 px room column; board columns stack; tables become cards under 768 px (D-016). | Open question 85. | open-questions 85 |
| FDR-12 | **Boarding total shown once**; Sub total = rooms + services, then discounts, tax, card fee, Total charge, Deposits, Balance (R-D14). | Open question 87. | open-questions 87 |
| FDR-13 | **Chargeable days are not a dropdown**: nights drive the price; first / last day multipliers (R-D09) are not modelled. **Needs Justin.** | Open question 88; pricing-affecting. | open-questions 88 |
| FDR-14 | **Type / Handler "All" dropdowns are filters**: Handler = optional employee with is_handler; room type is a radio card. Sales tax = the active taxes row. | Open question 89. | open-questions 89 |
| FDR-15 | **Additional services**: catalog = `services` rows with category extra; Occurs = once / daily / per night; M / A / E are toggles; stored in `booking_services`. | Open question 90. | open-questions 90 |
| FDR-16 | **Deposit defaults to 0** on desk bookings; Paid in full sets deposit = total; payments recorded on the detail through the PaymentProvider. **Needs Justin** (deposit amount / percentage, open question 47). | No deposit rule exists in the designs. | open-questions 47 |
| FDR-17 | **Desk bookings start confirmed only when every required vaccine of every pet is verified**, else pending_vaccines (R-X04); confirming anyway needs a manager PIN. | R-A05 + R-I06. | open-questions 34 |
| FDR-18 | **Hotel guests are not deducted from daycare capacity** (R-E14 working answer). **Needs Justin.** | Designer's own question; affects capacity. | open-questions 60, R-E14 |
| FDR-19 | **Dogs over 30 lb cannot be assigned a top penthouse room** (R-E09 enforced); the 55 lb suite rule (R-X01) only warns until confirmed. | R-X01 is `requested`. | R-E09, R-X01 |
| FDR-20 | **Check-in requires a room**; checked-in stays keep their dates but can change room (R-X05); a timeline move keeps the nights (R-X07). | Operational sanity for the desk. | built fresh |
| FDR-21 | **Booking codes** `PR-<n>` continue from the highest existing number; every action writes `booking_events` (R-J08). | Replaces the legacy "Added / edited by" line. | R-J08 |
