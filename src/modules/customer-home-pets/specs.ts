import { defineSpec } from '../../specs/defineSpec';
import type { Role } from '../../auth/roles';

/** Customers own these pages; super admin can open them (view-as customer or as themself, falling back to the demo pet parent). */
export const CUSTOMER_ROLES: Role[] = ['customer', 'super_admin'];
const W = [360, 390, 768, 1280, 1920];

export const homeSpec = defineSpec({
  code: 'C-10', tone: 'home', name: 'Customer home',
  purpose: 'Pet parent landing screen per Figma Home Page.png (D-189): hero with the logo, the Services band (Hotel, Spa, Daycare, In Home), the Pets band with the selected-pet border and vaccine attention as a coral status line, Upcoming Bookings cards and the underlined past-reservations link. No greeting, location chip, bell or counts. Gates booking on having at least one pet.',
  layout: ['HomeHero (photo placeholder + logo, 142 px)', 'ServicesBand (Section band: Hotel / Spa / Daycare / In Home tiles)', 'PetsBand (PetAvatarCard x n, first pet with the selected border, "Add a Pet" card; empty = centred Add a Pet button)', 'UpcomingBookingsBand (CustomerBookingCard x n; hidden while there are no pets)', 'PastReservationsLink (underlined "View Past Reservations")', 'AddPetFirstAlert (Modal size alert: "Hey!" with Back / Add a Pet split footer)'],
  data: ['customers', 'pets', 'vaccine_records', 'vaccine_types', 'bookings', 'booking_pets', 'appointments', 'daycare_bookings', 'packages', 'room_types', 'locations', 'notifications'],
  roles: CUSTOMER_ROLES,
  logic: ['useCurrentCustomer(): customers.user_id = session user, else the demo customer for staff previews.', 'Upcoming = bookings + appointments + daycare days of this customer that are not finished and not in the past, sorted by start; appointment statuses map onto the one lifecycle for the badge.', 'Service tile: no active pets -> AddAPetFirst modal (R-A01); otherwise navigate to /app/hotel, /app/grooming, /app/daycare when that route exists, else a "coming soon" toast.', 'The Petrock location is chosen in the hotel / grooming / daycare flows and Settings (no location chip on home, D-189; R-X23 still applies when it is saved).', 'Pet card status: petApproval(pet, petVaccineSummary()) (R-A04, R-X20); warning triangle for needs_details / expired.', 'Unread notifications show as the dot on the paw tab (PhoneShell); In Home opens a coming-soon toast (D-003).'],
  integrations: [], components: ['HomeHero', 'Section', 'HomeServiceTile', 'PetAvatarCard', 'CustomerBookingCard', 'StatusBadge', 'Button', 'Card', 'Modal', 'Toast', 'Avatar'],
  rules: ['R-A01', 'R-A02', 'R-A04', 'R-A06', 'R-B11', 'R-I01', 'R-M08', 'R-X20', 'R-X23'],
  states: ['no pets (Home Page-2: Pets band with a single Add a Pet button, Upcoming hidden)', 'pets without bookings', 'pets with upcoming bookings', 'pet needing vaccines (coral status line)', '"Hey!" add-a-pet-first alert (Home Page-5)'],
  figma: ['Home Page.png', 'Home Page-2.png', 'Home Page-5.png', 'Services.png', 'Frame 1171276424.png'], checkedAt: W,
  notes: ['In Home is a tile per Services.png but not bookable (D-003): it opens a coming-soon toast pointing to chat.', 'HomeHero shows a brand gradient placeholder with the logo until a licensed pool photo exists (open question 116).', 'Fidelity part (b), prompt 0012: layout rebuilt block by block against Home Page.png (hero 142, services 170..263, pets 312..461, bookings 491..729, link row, nav 71).'],
});

export const myPetsSpec = defineSpec({
  code: 'C-11', tone: 'list', name: 'My pets',
  purpose: 'Every active pet of the household in a grid with photo, breed, weight and approval / vaccine status; entry point to add a pet or open a profile.',
  layout: ['CustomerScreenHeader (back, "My Pets", no rule)', 'AddPetTextAction (right-aligned "Add Pet" link)', 'PetGrid (2-up PetAvatarCard lg: avatar 76, display name, "Breed: X"; status text only when a pet needs attention)', 'EmptyState'],
  data: ['customers', 'pets', 'vaccine_records', 'vaccine_types'], roles: CUSTOMER_ROLES,
  logic: ['Active pets only (pets.status != inactive) ordered by created_at.', 'Card status from petApproval(); tapping opens /app/pets/:petId.', 'Grid: 2 columns on phones, 3 at >= 600 px inside the phone column.'],
  integrations: [], components: ['CustomerScreenHeader', 'PetAvatarCard', 'Button', 'EmptyState'],
  rules: ['R-A04', 'R-X20'], states: ['empty', 'populated', 'some pets need attention'], figma: ['My pets (more than one pet).jpg', 'Home Page-1.png'], checkedAt: W,
  notes: ['Fidelity part (b): #F4F6FA list tone, 24 px gutter, 20 px grid gap, no summary line or approval pills (My pets (more than one pet).jpg).'],
});

export const addPetSpec = defineSpec({
  code: 'C-12', tone: 'form', name: 'Add pet wizard',
  purpose: 'Five clean steps to add a dog: Basics (photo, name, type, breed, sex, neutered, colour, date of birth), Size (weight in lbs with the computed size band), Personality & feeding, Vet & emergency contact, Vaccines (per required / recommended vaccine: date, expiry, proof). Resolves the duplicated Figma steps into one stepper.',
  layout: ['CustomerScreenHeader (back, "Add Pet", no rule)', 'Stepper (5 filled circles, no labels, D-190)', 'Step 1 Basics (PetPhotoPicker 70 with the green camera dot, Name, Type / Breed, Sex / Neutered/Spayed, Color / Date Of Birth in the 4 px input skin)', 'Step 2 Size & weight (Input lbs, size band card)', 'Step 3 Personality & feeding (Checkbox group, RadioGroup, Select, Textarea x3)', 'Step 4 Vet & emergency (Select vets + add, Input name/phone/relationship, Textarea conditions/allergies)', 'Step 5 Vaccines (VaccineRecordRow x5 + VaccineRecordForm, pending warning)', 'WizardFooter (full-width 40 px Next / Submit, small back arrow from step 2, Skip)'],
  data: ['pets', 'pet_lookups', 'vets', 'emergency_contacts', 'vaccine_types', 'vaccine_records', 'notifications', 'users', 'customers'], roles: CUSTOMER_ROLES,
  logic: ['Required basics: name, type, sex, neutered (R-C01); Next is blocked with inline errors until valid.', 'Weight in lbs -> size = sizeFromWeightLbs(weight) shown live and saved (R-C02, R-X21).', 'Meals per day is slot based (R-C04); feeding instructions per slot (R-C05).', 'Breed / colour selects come from pet_lookups; "Add another" inserts a row (entities 5). Vet select + "Add a vet" inserts a vets row (R-B08).', 'Submit: insert pets (approval pending, or needs_details when vaccines are skipped, R-X25), upsert emergency_contacts, insert vaccine_records (status submitted) for each drafted vaccine, notify the customer (pet_added) and the front desk of the home location (vaccine_submitted) when proofs were uploaded.', 'Skip on the vaccines step is allowed (R-B07) and shows the pending warning (R-A05).'],
  integrations: ['Company-OS file storage (later; proofs and photos are mock URLs / data URLs now)'],
  components: ['CustomerScreenHeader', 'Stepper', 'PetPhotoPicker', 'Input', 'Select', 'Checkbox', 'RadioGroup', 'Textarea', 'Toggle', 'Card', 'Badge', 'VaccineRecordRow', 'VaccineRecordForm', 'PetDocumentUpload', 'Button', 'Modal', 'Toast'],
  rules: ['R-C01', 'R-C02', 'R-C03', 'R-C04', 'R-C05', 'R-B01', 'R-B02', 'R-B06', 'R-B07', 'R-B08', 'R-B09', 'R-X21', 'R-X22', 'R-X25', 'R-A05'],
  states: ['step 1 empty', 'step 1 invalid', 'steps 2-4', 'step 5 with drafted records', 'submitting', 'vaccines skipped'],
  figma: ['Pet Edit.png', 'Pet Edit-1.png', 'Pet Edit 3.png', 'Pet Edit 5.png', 'Pet Edit 7.png', 'Frame 1171276417.png', 'Frame 1171276418.png'], checkedAt: W,
  notes: ['Type defaults to Dog; other species are allowed in the select but all copy says dog (open question 25 -> decision pending).', 'Fidelity part (b): #EEF2F5 form tone, single 40 px Next (Pet Edit.png 337x40), no step headings on step 1.'],
});

export const petProfileSpec = defineSpec({
  code: 'C-13', tone: 'list', name: 'Pet profile',
  purpose: 'Everything about one pet: photo, name, breed, approval status, stats (sex, age, weight and size band), vaccine summary with a link to the records, care and feeding, medical and vet, emergency contact, upcoming bookings; edit or remove the pet.',
  layout: ['CustomerScreenHeader (back, "Pet Profile")', 'AccountProfileHero (110 px photo in the dashed coral ring, purple pencil disc -> edit, display name, "Breed: X"; coral attention line when not approved)', 'StatsCard (Gender / Birthday / Weight with vertical rules)', 'ReminderSection (next booking card: title, calendar row, location + pets row, line-art glyph)', 'NotesSection ("Notes for <pet>" + Edit: AccountMenuRow x4 - Vaccines, Care & feeding, Medical & vet, Emergency contact - with chevrons; detail modals)', 'DangerZone (remove pet) + ConfirmModal'],
  data: ['pets', 'vets', 'emergency_contacts', 'vaccine_records', 'vaccine_types', 'bookings', 'booking_pets', 'appointments', 'daycare_bookings', 'packages', 'room_types', 'locations'], roles: CUSTOMER_ROLES,
  logic: ['Only the owner household (or a staff preview) can open a pet; other ids redirect to My pets.', 'Approval badge = petApproval(); vaccine chips = petVaccineSummary() (R-X20).', 'Remove = soft delete (status inactive) after confirmation; blocked while the pet has an unfinished booking, appointment or daycare day (R-X24).'],
  integrations: [], components: ['CustomerScreenHeader', 'AccountProfileHero', 'AccountMenuRow', 'Card', 'Section', 'Button', 'Icon', 'Modal', 'EmptyState', 'Toast'],
  rules: ['R-A04', 'R-C02', 'R-C05', 'R-X20', 'R-X22', 'R-X24'], states: ['approved', 'pending', 'needs details / expired', 'no bookings', 'remove blocked', 'remove confirm'],
  figma: ['Pet Profile (Single Pet).jpg', 'Home Page-1.png'], checkedAt: W,
  notes: ['The UI-kit Reminder / Notes concept is not built (open question 26); care notes come from the pet record instead.', 'Fidelity part (b): rebuilt against Pet Profile (Single Pet).jpg; care / medical / emergency details open in modals from the notes rows and are edited in C-14.'],
});

export const editPetSpec = defineSpec({
  code: 'C-14', tone: 'form', name: 'Edit pet',
  purpose: 'The same five-step wizard prefilled with the pet, with a Save on every step; vaccine records edited here are saved immediately as submitted.',
  layout: ['CustomerScreenHeader (back, "Edit Pet", no rule)', 'Stepper (5 filled circles, all clickable)', 'Steps 1-5 as C-12', 'WizardFooter (Next / Save changes, back arrow)'],
  data: ['pets', 'pet_lookups', 'vets', 'emergency_contacts', 'vaccine_types', 'vaccine_records', 'notifications', 'users', 'customers'], roles: CUSTOMER_ROLES,
  logic: ['Loads the pet, its emergency contact and vaccine records into the wizard state.', 'Save updates pets (size recomputed, R-X21), upserts the emergency contact, inserts / updates vaccine_records for changed drafts; approval_status is not touched unless a required vaccine was newly uploaded (pending) - staff approve.', 'Owner check as C-13.'],
  integrations: [], components: ['CustomerScreenHeader', 'Stepper', 'PetPhotoPicker', 'Input', 'Select', 'Checkbox', 'RadioGroup', 'Textarea', 'Toggle', 'Card', 'Badge', 'VaccineRecordRow', 'VaccineRecordForm', 'PetDocumentUpload', 'Button', 'Modal', 'Toast'],
  rules: ['R-C01', 'R-C02', 'R-C03', 'R-C04', 'R-C05', 'R-B06', 'R-B08', 'R-B09', 'R-X21', 'R-X22'], states: ['prefilled', 'dirty', 'saving', 'saved'],
  figma: ['edit profile.jpg', 'Pet Edit.png'], checkedAt: W,
  notes: ['The Figma "Pet Profile (edit)" mixed owner fields into the pet form; here the form is pet-only (open question 27).'],
});

export const vaccinesHubSpec = defineSpec({
  code: 'C-20', tone: 'form', name: 'Vaccines',
  purpose: 'Choose a pet, see each vaccine\'s status and upload proofs: the customer side of the vaccine flow that gates bookings (pending_vaccines until the front desk verifies).',
  layout: ['PhonePageHeader (back, title)', 'Intro copy', 'PetSelector (PetAvatarCard x n with status chip and next expiry)', 'GateBanner (booking stays pending)', 'RequiredList (VaccineRecordRow x3 + Upload / Update)', 'RecommendedList (VaccineRecordRow x2)', 'VaccineRecordForm modal'],
  data: ['customers', 'pets', 'vaccine_types', 'vaccine_records', 'notifications', 'users'], roles: CUSTOMER_ROLES,
  logic: ['Selected pet defaults to the first pet needing attention (worst status), else the first pet.', 'Upload / Update opens VaccineRecordForm; Save inserts a vaccine_records row (status submitted, proof_url mock) or updates the existing one; a vaccine_submitted notification goes to the front desk user of the customer\'s home location.', 'Statuses per R-X20; chips on the pet cards show the worst required status and the earliest upcoming expiry.'],
  integrations: ['Company-OS file storage (later)'], components: ['PhonePageHeader', 'PetAvatarCard', 'VaccineStatusChip', 'VaccineRecordRow', 'VaccineRecordForm', 'PetDocumentUpload', 'Button', 'Card', 'EmptyState', 'Toast'],
  rules: ['R-B01', 'R-B02', 'R-B03', 'R-B05', 'R-B06', 'R-B09', 'R-A05', 'R-X20', 'R-X25'], states: ['no pets', 'pet selected: all verified', 'missing / expired', 'pending verification', 'form open'],
  figma: ['Choose Vaccine.png', 'Frame 1171276419.png'], checkedAt: W,
  notes: ['Resolves open question 32: one proof per vaccine record (per-vaccine uploads), not one bulk upload.', 'The Figma pet-card date (3-03-2024) is read as the earliest upcoming expiry (open question 35).'],
});

export const petVaccinesSpec = defineSpec({
  code: 'C-21', name: 'Pet vaccine records',
  purpose: 'All vaccine records of one pet with verification state, dates and proofs; upload or update each record and see the history of earlier records.',
  layout: ['PhonePageHeader (back, pet name)', 'StatusSummary (verified count, next expiry)', 'RequiredList (VaccineRecordRow)', 'RecommendedList (VaccineRecordRow)', 'History (earlier records per vaccine)', 'VaccineRecordForm modal'],
  data: ['pets', 'vaccine_types', 'vaccine_records', 'notifications', 'users', 'customers'], roles: CUSTOMER_ROLES,
  logic: ['Current record per type = latest vaccinated_on; older rows show under History.', 'Updating a verified record inserts a new submitted record (the verified one stays in history) so staff verify the new proof (R-B03).', 'Statuses per R-X20.'],
  integrations: ['Company-OS file storage (later)'], components: ['PhonePageHeader', 'VaccineStatusChip', 'VaccineRecordRow', 'VaccineRecordForm', 'PetDocumentUpload', 'Card', 'Button', 'Badge', 'EmptyState', 'Toast'],
  rules: ['R-B01', 'R-B02', 'R-B03', 'R-B06', 'R-B09', 'R-X20'], states: ['all verified', 'pending', 'expired', 'missing', 'with history', 'form open'],
  figma: ['Pet Edit 5.png', 'Pet Edit 7.png'], checkedAt: W,
});
