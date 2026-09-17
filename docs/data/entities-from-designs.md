# Entities and fields implied by the designs

Derived from `docs/figma/screen-catalog.md` (Figma export drop 1, 2026-09-17). Merged and de-duplicated across the customer mobile app, front desk web, owner Control Panel and the legacy PetLinx screenshots. Status of everything here: **seen in design**; nothing is confirmed by Justin yet. Field names are normalised to camelCase; the label seen on screen is kept in the notes.

Conventions: `*` = marked required on a design; `(1 surface)` = the field appears on only one surface (mobile, front desk, Control Panel or legacy) and needs confirming before it goes into the data model; `(legacy only)` = only in PetLinx screenshots and dropped in the redesign. Screen references use the catalog file names.

This document feeds the Company-OS integration decision (kanban: "define new entities") and the table library / data-model docs planned in `docs/README.md`.

## Index

1. Customer
2. Pet
3. Vaccination record and vaccine type
4. Vet
5. Lookup lists (breed, colour, city, attributes, reference)
6. Location (store)
7. Company / brand
8. Room type and room
9. Hotel (boarding) booking
10. Booking room assignment, discounts/surcharges, additional services
11. Pet medical / boarding questionnaire
12. Grooming appointment (groom booking)
13. Grooming package (appointment type), groom add-on, groom style
14. Daycare booking and daycare pricing
15. Service line item, estimate and invoice
16. Payment, deposit, payment method, credit-card fee
17. Tax settings
18. Discount rules and capacity rules
19. Booking status, pet status, customer status
20. Employee / staff user, role and permissions, manager PIN
21. Notification
22. Conversation and message
23. Review
24. Reminder and pet note (UI-kit concept)
25. Agenda item
26. Settings entities (boarding, grooming, general, form, invoice, email/SMS)
27. Dashboard KPI
28. Cross-surface contradictions to resolve

## 1. Customer

| Field | Type | Seen on | Notes |
|---|---|---|---|
| id | system | Reviews (#C01234), legacy | Front desk shows `#C0xxxx`; not on the add form |
| title | text/select | Customer Details.pdf ('Mr.'), legacy Title dropdown | |
| initials | text | legacy only | dropped in redesign |
| firstName * | text | Customer Details.pdf, Booking Details Final Customer Details.png, Frame 1171276431, Frame 1171276421 (sign up) | |
| lastName * | text | same | |
| status | enum Active/... | Customer Details.pdf, legacy | only 'Active' seen; other values unknown (open question) |
| address | text | Customer Details.pdf, mobile Customer Details, Frame 1171276431, legacy (2 lines) | |
| aptSuite | text | mobile Customer Details, Frame 1171276431 (1 surface: mobile) | not on front desk form |
| townCity * | select + add | Customer Details.pdf (dropdown with +), mobile City (text) | dropdown vs free text differs |
| state * | select | all address forms | US states; 'NY' sample |
| zip | text | all address forms | |
| country | select | 2.pdf company only, employees-2 | not on customer forms |
| mobile * | phone | Customer Details.pdf; mobile 'Phone' / 'Cell Phone' | |
| altPhone | phone | mobile Customer Details ('Alt Phone'), Frame 1171276431; front desk 'Alternative Phone' | |
| homePhone | phone | Customer Details.pdf, mobile Billing ('Home Phone'), reservations table 'Home' | |
| workPhone (+ ext) | phone | Customer Details.pdf, legacy (Ext. legacy only) | placeholder wrongly 'Email Address' |
| alternativeContact | text | Customer Details.pdf, legacy | name of another person |
| email * | email | all | |
| password | secret | Frame 1171276421/1171276422, image 175 (disabled, changed via flow) | customer app only |
| preferredContactMethod | enum | Customer Details.pdf ('Mobile Number'), legacy ('Phone'), 7.pdf default | |
| reference | text + add | Customer Details.pdf, legacy | meaning unclear |
| attributes[] | multi-select + add | Customer Details.pdf, legacy checklist ('Newsletter') | |
| referredBy | select + add | legacy only | referral source; dropped |
| customerSince | date | legacy only (default today) | dropped |
| newsletterOptIn / sendRemindersAndMarketing | bool | legacy only (default checked) | dropped; needed for SMS/email consent |
| note | text <= 100 | Customer Details.pdf (0/100), legacy Notes (unlimited) | |
| attachments[] / documents[] | files | Customer Details.pdf (single dropzone), legacy Documents table (Title, Type, Email Me, Delete) | |
| profilePhoto | image | profile.jpg, Frame 1171276432 (1 surface: mobile) | |
| preferredLanguage | enum | language.jpg (1 surface: mobile) | English, Deutsch, French, Dutch, Bulgarian |
| darkMode | bool | setting.jpg (1 surface: mobile) | |
| rememberMe | bool | Frame 1171276422 (1 surface) | |
| outstandingBalance | money (derived) | 6.pdf 'Show Customers With Outstanding Balances' | implies balance per customer |
| pets[] | relation | Home Page-1, My pets, Choose Pets | |
| bookings[] | relation | Home Page-1 | |

Billing details (Booking Details Final Customer Details-2): same field set as Customer with 'Cell Phone' / 'Home Phone' labels. Unclear whether a separate BillingAddress entity exists (open question).

## 2. Pet

| Field | Type | Seen on | Notes |
|---|---|---|---|
| id | system read-only | Pet Details .pdf ('0012'), legacy | |
| customerId | relation | implied (Pet Details opened from customer; 'Pets of Abdallah, Eman') | no owner selector on the front desk form |
| photo | image | Pet Edit.png (camera badge), Frame 1171276417 (pencil badge), My pets, legacy Photos gallery (multiple) | mobile one photo; legacy many |
| name * | text | all | mobile 'Name *'; edit profile.jpg oddly 'First Name' |
| type * | select | Pet Edit ('Dog'), Pet Details .pdf ('Dog'), legacy, 7.pdf Default Pet Type | multi-species implied by My pets sample (cats, birds, rabbit) but all copy says 'dog' |
| breed | select + add | all; 'Pom', 'Shepperd', 'Bulldog' | |
| isMixed | bool | Pet Details .pdf, legacy 'Mixed Breed' | front desk only |
| size | enum | Pet Details .pdf ('Large'), legacy ('Medium'), spa pricing S/M/L/XL/Giant | mapping size to spa price tiers is an open question |
| sex * | select | Pet Edit ('Male'), Pet Details .pdf, popover 'Male - Entire; Female - Sprayed' | |
| neuteredSpayed * | select | Pet Edit ('Yes') (mobile), popover 'Entire/Spayed' (front desk) | |
| color | select + add | all | 'Brindle', 'Black and tan' |
| weight (+ unit) | number | Pet Edit '9 lbs' (dropdown!), Frame 1171276417 numeric with lbs suffix, Pet Profile '16 Kg', legacy Weight 0 | unit lbs vs Kg conflict; drives 30 lb / 55 lb room rules |
| dateOfBirth | date | Pet Edit '9-23-2024', Frame 1171276417 '4/05/2025', Pet Details .pdf 'MM-DD-YYYY', Pet Profile 'June 20, 2022' | four date formats |
| isApproximateAge | bool | Pet Details .pdf, legacy | front desk only |
| temper | select | Pet Details .pdf, legacy (1 surface: front desk) | compare mobile 'personality' |
| personality | enum Shy/Calm/Hyper/Aggressive | Pet Edit 3, Pet Edit-1 (radio), Frame 1171276418 (dropdown) (mobile) | probably the same concept as temper |
| socializedWith[] | multi Humans/Dogs | Pet Edit 3, Pet Edit-1, Frame 1171276418 (1 surface: mobile) | |
| canHaveTreats | bool | Pet Edit 3, Pet Edit-1, Frame 1171276418 (1 surface: mobile) | |
| providingOwnFood | bool | Pet Edit 3, Frame 1171276418 (1 surface: mobile) | |
| mealsPerDay | enum/number | Pet Edit 3 ('AM & PM'), Frame 1171276418 ('1') | control and option set conflict |
| amFeedingInstructions / midDayFeedingInstructions / pmFeedingInstructions | text | Pet Edit 3, Frame 1171276418 (1 surface: mobile) | |
| medicalConditions | text | Pet Edit 5 (1 surface: mobile) | |
| allergies | text | Pet Edit 5 (1 surface: mobile) | |
| vetId | relation + add | Pet Edit 5 ('See List of Vets or Add a Vet'), Pet Details .pdf, legacy | |
| registrationNumber | text | Pet Details .pdf, legacy 'Registration #' (front desk) | placeholder error on design |
| microchipNumber | text | Pet Details .pdf, legacy 'Microchip #' (front desk) | |
| attributes[] | multi-select + add | Pet Details .pdf ('Attribute'), legacy checklist (Aggressive, Muzzle, 'Nasim only', 'Have dad put one of our...'), booking pet tables 'Attributes' column | staff-facing flags, includes staff-assignment instructions |
| groomStyle | select | Groom Booking .pdf pet table, legacy 'Groom Style', 8.pdf 'Use Groom Style' | grooming only |
| vaccinations[] | relation | see 3 | |
| approvalStatus | enum | Home Page-1 ('Approved', 'Pending & Needs more Details'), Choose Pets chips ('Active', 'Pending'), Frame 1171276424 ('Approved') | see 19 |
| statusDate | date | Choose Pets / Choose Vaccine pet cards '3-03-2024' | meaning unknown (open question) |
| status | enum Active/Non-Active | Pet Details .pdf ('Active'), legacy ('Show Non-Active') | front desk record status; distinct from approvalStatus |
| note | text <= 100 | Pet Details .pdf (0/100), legacy Notes | |
| attachments[] | files | Pet Details .pdf dropzone | |
| notes[] (dated) / reminders[] | relation | Pet Profile (Single Pet).jpg only | UI-kit concept, see 24 |
| ownerEmail / ownerContactNumber | | edit profile.jpg | owner fields shown on a pet form; UI-kit leftover |

## 3. Vaccination record and vaccine type

VaccineType (catalog): `name`, `isCompulsory` (6.pdf 'Compulsory Vaccinations' prompt; Pet Edit 5 'Required' vs 'Reccomended').

| Surface | Vaccine list seen |
|---|---|
| Customer app (Choose Vaccine, Frame 1171276419) | required: Distemper/Parvo, Bordetella, Rabies |
| Customer app (Pet Edit 5/6/7) | required: Distemper/Parvo, Bordetella, Rabies; recommended: Lepto, Influenza |
| Front desk (Pet Details .pdf) | DHPP, Leptospirosis, Bordetella, Rabies |
| Legacy (image 114) | Bordetella, Canine Influenza, DHPP |

DHPP = Distemper/Parvo (+ Hepatitis/Parainfluenza), so the union is: DHPP (Distemper/Parvo), Bordetella, Rabies, Leptospirosis, Canine Influenza. Which are compulsory is an open question (D-003 vaccine flow).

VaccinationRecord: `petId`, `vaccineTypeId`, `selected` (front desk 'Select' column), `vaccinatedDate`, `expiresDate`, `reference` (free text), `certificate` (file), `status` (missing/valid/expired; legacy renders missing rows red; timeline shows 'Exp Vaccine' and red-cross bar icon; booking pet tables show 'Vaccination: OK').

UploadedDocument (customer app): `fileName`, `fileType` (.jpg .png .gif .pdf on Choose Vaccine; .jpg .png .pdf on Pet Edit 5), `sizeBytes` ('10 MB'), `uploadProgress` (65%), `uploadStatus` (complete / in progress / cancel). Customer uploads are either per vaccine (Choose Vaccine, Frame 1171276419) or a single multi-file 'invoices or certificates' upload (Pet Edit 5); both patterns exist (open question).

## 4. Vet

`name` (+ 'Dr. Smith Jonas' in Pet Profile reminder), selectable from a list or added inline (Pet Edit 5 'Add a Vet', Pet Details .pdf '+', legacy '+'). No other fields seen.

## 5. Lookup lists (extendable inline via '+')

Breed, Color, Vet, Town/City, Reference, Attributes (customer), Attribute (pet), Referred By (legacy). Data Lists is a legacy setup module (cloud1 screenshot: 'Data Lists'). These become admin-maintained lists in the table library.

## 6. Location (store)

| Field | Seen on |
|---|---|
| name | 1.pdf ('Encino', 'Log Angeles'), 3.pdf, front desk-7 / 13.pdf (Encino, Los Angeles), Home Page-1 booking card 'LA' |
| images[] | 3.pdf Location Images, 1.pdf thumbnail |
| address | 1.pdf (17401 Ventura Blvd, Encino, CA, 91316, same for both rows), 3.pdf |
| description (<= 100) | 3.pdf |
| workingHours[day] {open, timeIn, timeOut} | 3.pdf 7-day grid; summary Mon-Fri 7am-7pm, Sat-Sun 9am-5:30pm (1.pdf, front desk-7) |
| note (<= 100) | 3.pdf |
| capacities per appointment type | front desk-7 / 13.pdf (see 18) |

Two locations now (project brief); the capacity table has a third unlabeled column (open question).

## 7. Company / brand (1.pdf, 2.pdf)

Company: `name` ('PetRock'), `address`, `townCity`, `state`, `zip`, `country`, `phone`, `fax`, `email`, `website`, `hours`, `notes`. Brand: `logo`, `font` ('Inter'), `textColor`, `backgroundColor` (magenta/purple). Brand settings are the natural home for theme tokens (D-007).

## 8. Room type and room

RoomType (HotelRoomType): `name` (Penthouse(s), Suite), `photo` + `description` (Choose Your Room: inclusions copy), `avgPricePerNightPerPet` (customer app: $150/$105 or $115/$115), `rateMonThu`, `rateFriSun`, `seasonalRateMonThu`, `seasonalRateFriSun` (front desk-7 / 13.pdf, per 24 hr: Penthouse 120/135/140/155, Suite 85/95/100/110), `maxSimultaneousBookings` per location (Penthouses 12/20, Suites 42/16), notes ('Dogs over 30lbs can only fit in bottom 6 rooms'). Naming: 'Penthouse' / 'Suite' on all surfaces; the boarding settings (4.pdf) let the owner rename the enclosure ('Name Of Pet Enclosure singular/plural' = 'Hotel Room(s)').

Room (hotel room / legacy 'Run'): `code` ('105 - Rock' in tables; 'PH(B) COUN', 'PH(B) Regg', 'PH(T) Keit', 'Suite A7', 'Suite C1' in timeline and legacy; 'PHB Kaws S' legacy run), `roomTypeId`, `group` (timeline row groups: Daycare, Penthouses, Suites), `position` (bottom/top: PH(B)/PH(T) -> 30 lb rule), `rate` (per booking room assignment), `locationId` (implied). Legacy also has a 'Hotel Rooms' setup module and 'Hotel Room Availability' view. Daycare capacity is modelled as timeline rows 'Full Day' / 'Half Day'.

## 9. Hotel (boarding) booking

| Field | Type | Seen on | Notes |
|---|---|---|---|
| id | system | Board Booking.pdf ('0012'), tables ('#1'), legacy (647, 40029) | |
| customerId | relation | Board Booking.pdf (+ New Customer inline), tables 'Customer' | |
| pets[] | relation | all; multiple pets per booking ('Pets: Sparky, Boss'; 'Apollo; Daisy') | |
| petCount | derived | tables 'Pet Count' | |
| shareRoom | bool | Choose Pets ('Do You Want Your Pets To Share A Room?') (1 surface: mobile) | front desk equivalent: room assignment per pet |
| addGrooming | bool | Choose Pets, Estimate 'Add Grooming', Frame 1171276425/1171276430 (mobile) | links a grooming order to the stay |
| dateIn / timeIn | date, time | all | |
| dateOut / timeOut | date, time | all | |
| chargeableDays / nbrDays | number | Board Booking.pdf ('10'), tables 'Nbr Days' ('02'), legacy fractional (1.25, 6.50) | derived from dates + boarding settings (4.pdf) |
| firstDayCharge / lastDayCharge | multiplier | Board Booking.pdf ('1.0'), legacy (1.00) | partial-day billing; front desk only |
| roomTypeId / rooms[] | relation | Choose Your Room (BOOK NOW), Board Booking.pdf Rooms table (Date In, Date Out, Room Name, Rate), legacy Runs | |
| bookOutWholeRoom | bool | Board Booking.pdf, 4.pdf default, legacy 'Book Out Whole Run' | |
| handlerId | relation (employee) | Board Booking.pdf ('Handler All'), legacy | front desk only |
| reminder | bool | Board Booking.pdf, legacy (checked) | front desk only |
| pickupRequiredAt / deliveryRequiredAt | datetime | Board Booking.pdf, Groom Booking .pdf, legacy | transport; front desk only |
| status | enum | see 19 | |
| groupBucket | derived | Arriving / Departing / Staying / Checking out (tables, legacy) | relative to selected day |
| boardingTotal | money | Board Booking.pdf (twice), legacy $1,310 = rate x days | |
| discountsSurcharges[] | relation | see 10 | |
| salesTax | select | Board Booking.pdf ('All') | see 17 |
| additionalServices[] | relation | see 10 | |
| discount (pct or amount) | number + unit | Board Booking.pdf ('0012 %'), legacy ('655.00 $', unit dropdown) | |
| subTotal / total | money | Board Booking.pdf (1454 / 45725 placeholder), legacy $745 | |
| deposits | money | Board Booking.pdf (+ add), tables 'Deposits', legacy 'Add Deposit' | |
| balance | money derived | tables, Board Booking.pdf read-only; legacy negative shown in parentheses | total - deposits |
| totalCharge | money | tables 'Total Charge' ($150), Estimate TOTAL | |
| paymentStatus | enum | front desk-5 'Pending'; mobile 'Pending Verification' | see 19 |
| paymentMethod / paymentOption | enum | Payment-1 (credit card / cash at location), Booking Detail (deposit / pay in full) | see 16 |
| bookingNotes / note | text <= 100 | tables 'Booking Notes', Board Booking.pdf, legacy (long notes with staff practices) | |
| includeNotesOnInvoice | bool | Board Booking.pdf, Groom Booking .pdf, legacy | |
| flags: vip, warn, inv, vacc | bool/derived | legacy grid columns; agenda list icons (warning, money, medical) | |
| audit: createdBy/At, editedBy/At | system | legacy ('Added ... by Doris') | not in redesign; needed (audit log on kanban) |
| location | relation | Home Page-1 spa card 'LA' only | bookings should carry a location |

## 10. Booking room assignment, discounts/surcharges, additional services

BookingRoom: `dateIn`, `dateOut`, `roomId`, `rate` (Board Booking.pdf, legacy Runs).

DiscountSurcharge: `used` (bool), `name`, `type` (discount/surcharge), `plusMinus` (Board Booking.pdf, legacy 'Calc.').

AdditionalService (boarding): `type` ('Boarding Services'), `service` (Veterinary Travel $50/$55, Vaccination Fee $40 'HST'), `appliesTo` (pet or All), `rate`, `total`, `occurs` ('Once on 2/20/2025' - frequency), `morning` / `afternoon` / `evening` flags (M/A/E). Service catalog is a legacy setup module ('Services', 'Products').

## 11. Pet medical / boarding questionnaire (per pet per booking)

Seen on Booking Details Add Pets (hotel), Frame 1171276426 (build), DayCare-2 (daycare): `takesMedication` (bool), `medicationCount`, `medicationName`, `dosingFrequency` ('1 Daily (AM ONLY)'), `onVetRecommendedFleaMedication` (bool), `fleaMedicationBrand`, `fleaMedicationDate` (unlabeled date '9-23-2024'), `medicalAlert` (text). Attributed to one or more selected pets (checkbox list, Booking Details Add Pets-4, DayCare-2). Title variants Add / Confirm / Additional imply the data is stored on the pet and confirmed per booking (1 surface: mobile; the front desk stores medical info as pet attributes/notes only).

## 12. Grooming appointment (groom booking)

| Field | Seen on | Notes |
|---|---|---|
| id | Groom Booking .pdf ('0012'), legacy | |
| customerId (+ New Customer) | Groom Booking .pdf, legacy | |
| pets[] {petId, groomStyle} | Groom Booking .pdf pet table (Id, Name, Groom Style, Type, Breed, Vaccination, Attributes, Status), Frame 1171276428 Choose Pet, Frame 1171276429 'Groom another pet' | multi-pet |
| groomerId | Groom Booking .pdf ('Groomer All'), legacy ('Jad'), front desk-5 ('Groomer: Dr. Benjamin Parker'), day view columns | |
| dateIn / timeIn | Groom Booking .pdf, legacy, Frame 1171276435 'Check-In Friday 16 October, 2024', Home Page-1 'Appointment 16 Nov 2024 10:00 AM' | single date/time (appointment), not a stay |
| duration (hours) | Groom Booking .pdf ('1.0'), legacy, 8.pdf default 1:00 | |
| packageId | Frame 1171276428 (Choose Package), Frame 1171276435 ('Gold Groom'), front desk-8 'GROOMING (GOLD)' | |
| addOns[] | Frame 1171276429 (toggle list), Frame 1171276430/1171276434 ('Furminator, Medicated Shampoo') | |
| services[] | Groom Booking .pdf Additional Services (Service, Applies To, Rate, Duration, Time Taken, Total), legacy Services | front desk models packages/add-ons as service rows |
| reminder, pickupRequiredAt, deliveryRequiredAt | Groom Booking .pdf, legacy | |
| recurrence {recurs, everyNWeeks | nthWeekdayEveryNMonths} | legacy only; 8.pdf recurring settings | not in redesign form (open question) |
| location | Home Page-1 ('LA') | |
| status | timeline statuses; Home Page-1 'Upcoming' | see 19 |
| invoiceNumber, discountPct, subTotal, total | Groom Booking .pdf, legacy | |
| tax, groomingTotal, grandTotal | Frame 1171276435 / 1171276434 (Tax 2% $64, Grooming $500, Grand Total $565) | mobile totals, inconsistent |
| note (<= 100), includeNotesOnInvoice | Groom Booking .pdf, legacy | |
| linkedHotelBookingId | Estimate 'Add Grooming' / Frame 1171276430 | groom attached to a stay ('We generally do grooms at the end of hotel stays') |
| pastOrders / reCreate | Frame 1171276434 ('Your Past Spa/Grooming', 'Re-Create Spa') | re-book a previous configuration |

Day-view appointment card label: 'Owner Last, PET; Breed; Package Size' with flags (vaccine red cross, warning triangle). Groomer column colour/order/hidden are ViewPreferences (see 20).

## 13. Grooming package (appointment type), groom add-on, groom style

GroomingPackage (front desk-6, 12.pdf, Spa 12.7 2.png, Frame 1171276428/1171276435): `name` (Gold Groom, Platinum Groom, Diamond Groom), `icon` (paw / dog / diamond badge), `priceBySize {S, M, L, XL, Giant}`, `calendarTimeBySize {S, M, L, XL, Giant}` (minutes; Gold 60/60/60/90/90), `description` (inclusions), `notes`, `parentGroup` (mobile placeholder 'Parent group's Grooming package's Description'), `maxSimultaneousBookings` per location (2 / 2). Mobile also shows a flat package price ($65.00, $50).

GroomingAddOn (front desk-6, 12.pdf, Frame 1171276429): `name`, `price` (some 'starting at' with '+'), `addedTimeSM`, `addedTimeL`, `employeeType` ('special employee' for internal anal glands), `selected` per order.

GroomStyle: per-pet saved style (Groom Booking .pdf column, legacy 'Select', 8.pdf 'Use Groom Style'). No fields seen beyond the name.

Size tiers S/M/L/XL/Giant are used for pricing; the pet `size` field uses Small/Medium/Large in legacy. Mapping (weight bands) is an open question.

## 14. Daycare booking and daycare pricing

DaycareReservation (DayCare-1/-2/DayCare.png, mobile only): `pets[]`, `date` (calendar), `checkInTime`, `checkOutTime`, `durationType` (Half Day / Full Day / Play Hour), `computedPrice` ('= $45 for Half Day'), medical questionnaire (see 11), `checkout` (not designed, DayCare-3 empty). Front desk has no daycare screens (empty shell, D-003) except timeline rows Full Day / Half Day and capacity (20/15).

DaycarePricing (front desk-7, 13.pdf, DayCare-1): `item` (Full Day, Half Day, Hourly/Play Hour, Walk), `price` ($45, $35, $15/hr, $12), `timeRule` (> 6 h / < 6 h on front desk; < 5 h / > 5 h on mobile), `multiPetDiscount` ($5 off each additional pet). Legacy 'Walking' is a sidebar module with no screens.

## 15. Service line item, estimate and invoice

ServiceLineItem (Products.png, front desk-5/-8, Estimate, Frame 1171276427/1171276430): `serviceType` (Grooming, Boarding, Hotel Rent, Room nights, Pets, Grooming Add-On), `tier` ('GOLD'), `description`, `quantity x rate` ('2 Nights X $15.50'), `amount`, `icon`.

Estimate (mobile Booking Detail): `roomName`, `headlinePrice`, line items, `tax` (2%), `total`, check-in/out, Payment Details card (Hotel Rent, Tax, Total), payment path (deposit / full), non-cash fee footnote. Numbers in the mocks do not reconcile (see 28).

Invoice (Board/Groom Booking .pdf, 9.pdf, legacy, front desk-5): `invoiceNumber` (auto, 'Next Invoice/Payment Number' setting), `discountPct`, `subTotal`, `total`, `deposit`, `balance`, `taxLines[]` (front desk-5: Sales tax, Use tax, Local tax, Other taxes, Service tax or gross receipts tax), `tip` (9.pdf 'Show Tip Field'), `title` ('Invoice'), `footerMessage` ('Rock Out With Your Paws Out!'), `showBoardingChargeRates`, `showTaxNumber`, `copiesToPrint`, `includeNotes`. Legacy: 'Uninvoiced bookings' prompt, 'Set Bookings Status To Completed' on invoicing. Context menu 'Create Invoice' on timeline bars.

## 16. Payment, deposit, payment method, credit-card fee

PaymentMethod: `type` (Credit card / Pay With Cash At Location) (Payment-1, Frame 1171276427), `brand` (Mastercard icon, Frame 1171276435). Only these two methods designed; 9.pdf 'Payment Processing Option 1-3' placeholders; legacy 'Update Credit Card'. Stripe is on the kanban.

PaymentOption on Estimate: `payDeposit` | `payInFull` (discount for paying in full: '*pay full upfront to get discount'; long-stay discounts 'if paid in full').

Deposit: `amount` (Board Booking.pdf '+ add', tables, legacy 'Add Deposit'), linked payments (9.pdf 'Use Linked Payment/Deposits').

CreditCardFee (front desk-7, 13.pdf): `name` ('Service Fee'), `percentage` (3.89%; Estimate says '[3.8]%'), `rule` ('If Paying by credit card through app').

Payment status values: 'Pending' (front desk-5), 'Pending Verification' (mobile booking card; may be vaccine verification rather than payment), 'Your service payment successfully done!' (notification).

## 17. Tax settings (11.pdf)

`taxNumber`, `pricesAre` (Exclusive / Inclusive of tax; default exclusive), `taxName`, `serviceTaxRate`, `productTaxRate`, `boardingTaxRate`. Customer app shows a flat 'Tax (2%)' everywhere; front desk-5 shows five tax lines; Board Booking.pdf has a 'Sales Tax' dropdown. One model must be chosen (open question).

## 18. Discount rules and capacity rules (front desk-7, 13.pdf)

HotelDiscountRule: `appointmentType` (Penthouse, Suite, Penthouse or Suite), `rule` (2 dogs in penthouse; 3 dogs in penthouse; 2 dogs in suite; 7 / 14 / 21 days not holiday, paid in full), `discount` ($15 / $20 / $10 off each dog per night; 5% / 7.5% / 10%). Legacy note: '6% off non holiday days PREPAY'.

AppointmentTypeCapacity: `appointmentType` (Grooming Package, Penthouses, Suites, Day Care), `maxSimultaneousBookings` per location (Encino / Los Angeles / third column), `note`.

Room-fit rule: 'Dogs over 30lbs can only fit in bottom 6 rooms' (penthouse). Compare the D-006 seed 'Dog 55lb or greater must be a Suite' (not in this drop).

## 19. Statuses

Booking status (front desk timeline context menu, colour-coded): Future (green), Checked In (pink), Checked out and Complete (yellow), Canceled (red), No Show (dark red). Tables also use Completed (mint), Checking In (blue), Checked Out (amber), Confirm (green, booking detail); legacy: Future, Checked In, 'Checked Out & ...'. Mobile customer-facing: Pending Verification (red), Upcoming (green), 'Your Hotel Booking is confirmed'. Day buckets: Arriving, Departing, Staying, Checking out, Checked Out, All.

Pet approval status (mobile): Approved / Active (green), Pending (orange), 'Pending & Needs more Details' (warning). Pet record status (front desk): Active / Non-Active. Vaccination status: OK / missing / expired.

Customer status: Active (others unknown). Employee status: Active, Inactive, On Leave. Review status: pending, Publish (approved), Deleted (archived). Payment status: Pending (others unknown). Upload status: complete, in progress, cancelled.

## 20. Employee / staff user, role and permissions, manager PIN

Employee (employees.jpg, add employees.jpg, employees-2.jpg, 14.pdf, 15.pdf, legacy):

| Field | Seen on |
|---|---|
| id (read-only) | 15.pdf '0012' |
| fullName / name, nameOnCalendar | add employees, 15.pdf ('Jad'), day view columns |
| avatar | employees.jpg |
| gender | add employees, employees-2 |
| email, phone (+ country code, default +62), homePhone, mobile | add employees, employees-2, 14.pdf, 15.pdf |
| status (Active / Inactive / On Leave) | employees.jpg, add employees |
| department ('Departement': Groom, Sales, Operations, IT, Receptionist, Room Service, Take Care) | employees.jpg, add employees, employees-2 |
| jobTitle / role (Groomer, Front Desk, Walker, Hotel Stuff, Account Manager, Admin Manager, Account Executive, IT Helpdesk) | employees.jpg, 14.pdf |
| managerId | employees-2 |
| dateOfBirth, maritalStatus, personalTaxId, socialInsurance, healthInsurance | employees-2 (1 surface, UI kit) |
| address {primary, country, city, stateProvince, postalCode}; townCity, state, zip | employees-2, 15.pdf |
| emergencyContact {fullName, relationship, phone} | employees-2 (1 surface) |
| dateStarted, dateLeft, isExEmployee | 15.pdf |
| colorInCalendar | 15.pdf; day view column tint; column context menu Change Color |
| workingHours[day], matchTimeToBusiness, holidayHoursSameAsPrimary, lunchFrom/To | 15.pdf, 8.pdf grooming hours |
| serviceCommissionPct, retailSalesCommission | 15.pdf |
| note (<= 100) ('She is on Duty') | 14.pdf, 15.pdf |
| tabs not designed: Job, Payroll, Performance, Documents, Account Settings; Check List sub-page | employees-2, employees-1 |
| isGroomer / isHandler (assignable) | Groomer and Handler dropdowns |
| employeeType ('special employee') | add-on constraint, front desk-6 |

StaffUser (login): `name` ('Wade Warren'), `role` ('Admin'; legacy 'General User'), `avatar`. Role / permission set (10.pdf 'General User Security Setting'): openCashDrawer, deleteCustomers, useReportingCenter, deleteBookings, extractExportData, cancelBookings, viewFinancialReports, viewEmployeeReports, customizeReports, maintainServices, maintainCustomerTransactions, maintainProducts, editCustomerTransactions, deleteCustomerTransactions, createRefunds. Whether per user or per role is open.

ManagerPIN: a code issued by a manager to authorise a booking status change (PIN Verification modal: 'You Will Get A PIN CODE From Manager To Change The Status'); fields unknown (length, expiry, single use). Maps to the PIN login / manager approval popup on the kanban.

ViewPreference (per user, 1 surface: front desk day view): groomer column order, colour, hidden; timeline vs agenda view; selected date; filters.

## 21. Notification (notification.png)

`type` (pet added, payment success, vet appointment reminder, hotel booking confirmed, order delivered, new service, order delivery confirmation - the 'order' and 'vet' types are UI-kit leftovers), `message`, `icon`, `createdAt` (relative display), `readState` (filled purple circle = unread?), `recipientCustomerId`. Also shown inline in the chat timeline (Message Support-2) and as a red dot / '1' badge on the Paw tab. Email/SMS provider settings in 5.pdf; legacy has Email/SMS Template Editors and a Messaging Center.

## 22. Conversation and message

Conversation (notification-1, message-1.jpg): `participants` (customer <-> Front Desk; one thread per customer), `lastMessagePreview`, `lastMessageAt`, `unreadCount` (badge 3), `contactOnlineStatus`, `sessionStart` marker (mobile 'Session Start' pill, possibly per stay). Message: `sender` (customer | staff), `text`, `imageAttachment`, `sentAt`. Staff-side actions: attach, send, voice call, video call (icons; scope open). Chat also serves In Home inquiries ('Chat Now', Home Page-5). D-018: messaging may be redesigned beyond these screens.

## 23. Review (reviews.jpg)

`customerId` ('#C01234'), `customerName`, `avatar`, `dateTime`, `title`, `rating` (0-5, one decimal), `tags[]` (Excellent, Amazing, Normal, Not good), `body`, `status` (pending -> Publish via Approve | Deleted via Archive). 'Rate App' on the mobile profile menu is the customer entry point.

## 24. Reminder and pet note (Pet Profile (Single Pet).jpg only)

Reminder: `petId`, `title` ('Vet appointment'), `dateTime`, `vetName`. PetNote: `petId`, `title` ('Grooming for brownie'), `lastDoneDate`, `categoryIcon`. UI-kit style; whether in scope is an open question.

## 25. Agenda item (Agenda List)

`startTime`-`endTime` ('09:00-9:30'), `date`, `title` (link), `statusFlags[]` (warning/alert, payment/money, medical/vaccine), `linkedBooking`. Probably a projection of grooming appointments (reached via All Booking > Groom), possibly generic.

## 26. Settings entities (Control Panel PDFs)

- BoardingSettings (4.pdf): enclosureNameSingular/Plural, checkInOutWindows[] (07:00 AM - 08:00 PM + 'And Also'), chargeBy (Day | Night | Hours), firstDayChargeRule {days, ifCheckInAfter}, lastDayChargeRule {days, ifCheckOutBefore}, minimumChargeDays, bookOutWholeRoomByDefault, doNotPromptCopyServices.
- GroomingSettings (8.pdf): useGroomStyle, workingHours[day], defaultBookingHours (1:00), recurringMonthsAhead, moveHolidayRecurrenceToNextWorkingDay.
- GeneralSettings (7.pdf): databaseLanguage, timeFormat (12/24), timeIntervalMinutes (calendar slot), restrictTimeFieldsFrom/To, defaultCustomerContactMethod, defaultPetType, useProductsAndRetailSales, useSkins, useDropbox.
- FormSettings (6.pdf): confirmation prompts, readOnlyFieldColor, selectedFieldColor, startup actions (open customers & pets / grooming calendar / boarding calendar, show outstanding balances), singleCopyOfEachForm, displayRelevantTab, promptPastUncompletedBookings, promptPastUninvoicedBookings, promptExpiredOrMissingCompulsoryVaccinations.
- InvoiceSettings (9.pdf): see 15.
- EmailSmsSettings (5.pdf): emailDisplayName, emailAddress, emailProvider (None | Gmail | Other SMTP), smsProvider (None | Petlinx), smsUserName, smsApiKey, test-send actions.
- TaxSettings (11.pdf): see 17.
- Holiday / closed day (legacy 'Day is Holiday', 'Boarding Closed'; discount rules 'not holiday'; recurrence holiday shift): `date`, `isHoliday`, `boardingClosed`, `dayNotes` (legacy 'Day's Notes').
- Season (implied by seasonal rates): date range, not designed.

## 27. Dashboard KPI (front desk-4, front desk-3)

`todaysHotelRevenue` ($3,600; older variant 'Total Revenue $10,29,478'), `totalRooms` (1,250), `availableRooms` (600), `newBookings` (600), `updatedAt`, `revenueByMonth` (bar chart, 'This Month' filter), `reservationScheduleCalendar`, reservation table with tab counts (All 45, Arriving 34, Departing 18, Staying 5, Checked Out 2). Legacy: 'Pets Checked In: 46'.

## 28. Cross-surface contradictions to resolve

1. Weight unit: lbs (Add Pet, rules) vs Kg (Pet Profile); Weight as numeric input vs dropdown.
2. Date formats: 9-23-2024, 4/05/2025, 16 Nov 2024, 24/12/24, June 20, 2022, 06-29-2024, Mar 21, 2024, 06/29/2024, 14/24/2025 (invalid).
3. Vaccine lists differ per surface (see 3) and accepted file types (.gif on some screens only).
4. Personality radio vs dropdown; meals per day 'AM & PM' vs '1'; questions duplicated between Add Pet step 1 and step 2.
5. Daycare half/full-day threshold 5 h (mobile) vs 6 h (settings); computed '$45 for Half Day' for a 4 h stay.
6. Room prices: $150/$105, $115/$115 'Avg Per Night/Pet' (mobile) vs $120-$155 / $85-$110 per 24 h (settings).
7. Grooming package prices: all tiers $50-$135 (settings) vs Platinum $65-$150 (Spa 12.7 price card); mobile shows $65.00 or $50 flat.
8. Tax: flat 2% (mobile) vs single tax with three category rates (11.pdf) vs five tax lines (booking detail); credit-card fee 3.8% vs 3.89%.
9. Estimate and grooming totals do not add up ($31 + $1.09 = $232.09; $50 + $200 -> $500, tax $64, total $565).
10. Booking status vocabularies differ between timeline, tables, booking detail, legacy and the customer app.
11. Sidebar naming: All Reservations vs All Booking (Groom / Broad / Day Care); extra 'Hotel' item; 'Broad' typo.
12. Settings tabs: Pricing Setup / Appointment / Employee Schedule (1.pdf) vs Spa Setup / Hotel & Daycare Setup / Employee Setup (12-14.pdf).
13. Employee record: HR-style Details page (employees-2) vs operational Control Panel modal (15.pdf); two emails on one record.
14. Customer phone labels: Phone / Alt Phone vs Cell Phone / Home Phone vs Mobile / Home / Work / Alternative.
15. Chat: tab named 'Front Desk Chat' vs 'Inbox'; full-screen vs tabbed; bubble alignment inverted.
