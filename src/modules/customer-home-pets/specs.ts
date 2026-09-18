import { defineSpec } from '../../specs/defineSpec';
import type { Role } from '../../auth/roles';

/** Customers own these pages; super admin can open them (view-as customer or as themself, falling back to the demo pet parent). */
export const CUSTOMER_ROLES: Role[] = ['customer', 'super_admin'];
const W = [360, 390, 768, 1280, 1920];

export const homeSpec = defineSpec({
  code: 'C-10', name: 'Customer home',
  purpose: 'Pet parent landing screen: greeting with the preferred location, the three bookable services (Hotel, Grooming & Spa, Daycare), the pets strip with approval / vaccine status, upcoming bookings across all services and a link to past bookings. Gates booking on having at least one pet.',
  layout: ['HomeHeader (greeting, location chip, notifications bell)', 'HeroBanner', 'ServicesRow (Hotel / Grooming & Spa / Daycare)', 'VaccineBanner (only when a pet has missing or expired required vaccines)', 'PetsStrip (PetAvatarCard x n + Add a pet)', 'UpcomingBookings (CustomerBookingCard x n)', 'PastBookingsLink', 'AddPetFirstModal', 'LocationPickerModal'],
  data: ['customers', 'pets', 'vaccine_records', 'vaccine_types', 'bookings', 'booking_pets', 'appointments', 'daycare_bookings', 'packages', 'room_types', 'locations', 'notifications'],
  roles: CUSTOMER_ROLES,
  logic: ['useCurrentCustomer(): customers.user_id = session user, else the demo customer for staff previews.', 'Upcoming = bookings + appointments + daycare days of this customer that are not finished and not in the past, sorted by start; appointment statuses map onto the one lifecycle for the badge.', 'Service tile: no active pets -> AddAPetFirst modal (R-A01); otherwise navigate to /app/hotel, /app/grooming, /app/daycare when that route exists, else a "coming soon" toast.', 'Location chip opens a picker; choosing sets LocationProvider.setLocationId and customers.home_location_id (R-X23).', 'Pet card status: petApproval(pet, petVaccineSummary()) (R-A04, R-X20); warning triangle for needs_details / expired.', 'Bell badge = unread notifications for the user.'],
  integrations: [], components: ['HomeServiceTile', 'PetAvatarCard', 'CustomerBookingCard', 'VaccineStatusChip', 'Badge', 'StatusBadge', 'IconButton', 'Chip', 'Button', 'Card', 'Modal', 'RadioGroup', 'EmptyState', 'Toast', 'Avatar'],
  rules: ['R-A01', 'R-A02', 'R-A04', 'R-A06', 'R-B11', 'R-I01', 'R-M08', 'R-X20', 'R-X23'],
  states: ['no pets (empty strip, services gated)', 'pets without bookings', 'pets with upcoming bookings', 'vaccine banner', 'add-a-pet-first modal', 'location picker open'],
  figma: ['Home Page-1.png', 'Home Page-2.png', 'Home Page-4.png', 'Services.png', 'Frame 1171276424.png'], checkedAt: W,
  notes: ['In Home is not a tile (D-003: out of scope; inquiry via chat).', 'Hero uses a brand gradient until a licensed photo exists (open question 116).'],
});

export const myPetsSpec = defineSpec({
  code: 'C-11', name: 'My pets',
  purpose: 'Every active pet of the household in a grid with photo, breed, weight and approval / vaccine status; entry point to add a pet or open a profile.',
  layout: ['PhonePageHeader (back, title, add)', 'SummaryLine (count, needs attention)', 'PetGrid (PetAvatarCard x n)', 'EmptyState'],
  data: ['customers', 'pets', 'vaccine_records', 'vaccine_types'], roles: CUSTOMER_ROLES,
  logic: ['Active pets only (pets.status != inactive) ordered by created_at.', 'Card status from petApproval(); tapping opens /app/pets/:petId.', 'Grid: 2 columns on phones, 3 at >= 600 px inside the phone column.'],
  integrations: [], components: ['PhonePageHeader', 'PetAvatarCard', 'VaccineStatusChip', 'Badge', 'Button', 'EmptyState', 'IconButton'],
  rules: ['R-A04', 'R-X20'], states: ['empty', 'populated', 'some pets need attention'], figma: ['My pets (more than one pet).jpg', 'Home Page-1.png'], checkedAt: W,
});

export const addPetSpec = defineSpec({
  code: 'C-12', name: 'Add pet wizard',
  purpose: 'Five clean steps to add a dog: Basics (photo, name, type, breed, sex, neutered, colour, date of birth), Size (weight in lbs with the computed size band), Personality & feeding, Vet & emergency contact, Vaccines (per required / recommended vaccine: date, expiry, proof). Resolves the duplicated Figma steps into one stepper.',
  layout: ['PhonePageHeader (back, title)', 'Stepper (5 steps)', 'Step 1 Basics (PetPhotoPicker, Input, Select x5, date)', 'Step 2 Size & weight (Input lbs, size band card)', 'Step 3 Personality & feeding (Checkbox group, RadioGroup, Select, Textarea x3)', 'Step 4 Vet & emergency (Select vets + add, Input name/phone/relationship, Textarea conditions/allergies)', 'Step 5 Vaccines (VaccineRecordRow x5 + VaccineRecordForm, pending warning)', 'WizardFooter (Back / Next / Submit / Skip)'],
  data: ['pets', 'pet_lookups', 'vets', 'emergency_contacts', 'vaccine_types', 'vaccine_records', 'notifications', 'users', 'customers'], roles: CUSTOMER_ROLES,
  logic: ['Required basics: name, type, sex, neutered (R-C01); Next is blocked with inline errors until valid.', 'Weight in lbs -> size = sizeFromWeightLbs(weight) shown live and saved (R-C02, R-X21).', 'Meals per day is slot based (R-C04); feeding instructions per slot (R-C05).', 'Breed / colour selects come from pet_lookups; "Add another" inserts a row (entities 5). Vet select + "Add a vet" inserts a vets row (R-B08).', 'Submit: insert pets (approval pending, or needs_details when vaccines are skipped, R-X25), upsert emergency_contacts, insert vaccine_records (status submitted) for each drafted vaccine, notify the customer (pet_added) and the front desk of the home location (vaccine_submitted) when proofs were uploaded.', 'Skip on the vaccines step is allowed (R-B07) and shows the pending warning (R-A05).'],
  integrations: ['Company-OS file storage (later; proofs and photos are mock URLs / data URLs now)'],
  components: ['PhonePageHeader', 'Stepper', 'PetPhotoPicker', 'Input', 'Select', 'Checkbox', 'RadioGroup', 'Textarea', 'Toggle', 'Card', 'Badge', 'VaccineRecordRow', 'VaccineRecordForm', 'PetDocumentUpload', 'Button', 'Modal', 'Toast'],
  rules: ['R-C01', 'R-C02', 'R-C03', 'R-C04', 'R-C05', 'R-B01', 'R-B02', 'R-B06', 'R-B07', 'R-B08', 'R-B09', 'R-X21', 'R-X22', 'R-X25', 'R-A05'],
  states: ['step 1 empty', 'step 1 invalid', 'steps 2-4', 'step 5 with drafted records', 'submitting', 'vaccines skipped'],
  figma: ['Pet Edit.png', 'Pet Edit-1.png', 'Pet Edit 3.png', 'Pet Edit 5.png', 'Pet Edit 7.png', 'Frame 1171276417.png', 'Frame 1171276418.png'], checkedAt: W,
  notes: ['Type defaults to Dog; other species are allowed in the select but all copy says dog (open question 25 -> decision pending).'],
});

export const petProfileSpec = defineSpec({
  code: 'C-13', name: 'Pet profile',
  purpose: 'Everything about one pet: photo, name, breed, approval status, stats (sex, age, weight and size band), vaccine summary with a link to the records, care and feeding, medical and vet, emergency contact, upcoming bookings; edit or remove the pet.',
  layout: ['PhonePageHeader (back, title, edit)', 'ProfileHero (Avatar, name, breed, approval badge)', 'StatsRow (sex, age, weight / size)', 'VaccinesSection (VaccineStatusChip per type, link to C-21)', 'CareSection (personality, socialised with, food, meals, treats, feeding notes)', 'MedicalSection (conditions, allergies, vet)', 'EmergencyContactSection', 'UpcomingBookingsSection (CustomerBookingCard)', 'DangerZone (remove pet) + ConfirmModal'],
  data: ['pets', 'vets', 'emergency_contacts', 'vaccine_records', 'vaccine_types', 'bookings', 'booking_pets', 'appointments', 'daycare_bookings', 'packages', 'room_types', 'locations'], roles: CUSTOMER_ROLES,
  logic: ['Only the owner household (or a staff preview) can open a pet; other ids redirect to My pets.', 'Approval badge = petApproval(); vaccine chips = petVaccineSummary() (R-X20).', 'Remove = soft delete (status inactive) after confirmation; blocked while the pet has an unfinished booking, appointment or daycare day (R-X24).'],
  integrations: [], components: ['PhonePageHeader', 'Avatar', 'Badge', 'VaccineStatusChip', 'Card', 'Section', 'CustomerBookingCard', 'Button', 'IconButton', 'Modal', 'EmptyState', 'Toast'],
  rules: ['R-A04', 'R-C02', 'R-C05', 'R-X20', 'R-X22', 'R-X24'], states: ['approved', 'pending', 'needs details / expired', 'no bookings', 'remove blocked', 'remove confirm'],
  figma: ['Pet Profile (Single Pet).jpg', 'Home Page-1.png'], checkedAt: W,
  notes: ['The UI-kit Reminder / Notes concept is not built (open question 26); care notes come from the pet record instead.'],
});

export const editPetSpec = defineSpec({
  code: 'C-14', name: 'Edit pet',
  purpose: 'The same five-step wizard prefilled with the pet, with a Save on every step; vaccine records edited here are saved immediately as submitted.',
  layout: ['PhonePageHeader (back, title)', 'Stepper (5 steps, all clickable)', 'Steps 1-5 as C-12', 'WizardFooter (Back / Next / Save changes)'],
  data: ['pets', 'pet_lookups', 'vets', 'emergency_contacts', 'vaccine_types', 'vaccine_records', 'notifications', 'users', 'customers'], roles: CUSTOMER_ROLES,
  logic: ['Loads the pet, its emergency contact and vaccine records into the wizard state.', 'Save updates pets (size recomputed, R-X21), upserts the emergency contact, inserts / updates vaccine_records for changed drafts; approval_status is not touched unless a required vaccine was newly uploaded (pending) - staff approve.', 'Owner check as C-13.'],
  integrations: [], components: ['PhonePageHeader', 'Stepper', 'PetPhotoPicker', 'Input', 'Select', 'Checkbox', 'RadioGroup', 'Textarea', 'Toggle', 'Card', 'Badge', 'VaccineRecordRow', 'VaccineRecordForm', 'PetDocumentUpload', 'Button', 'Modal', 'Toast'],
  rules: ['R-C01', 'R-C02', 'R-C03', 'R-C04', 'R-C05', 'R-B06', 'R-B08', 'R-B09', 'R-X21', 'R-X22'], states: ['prefilled', 'dirty', 'saving', 'saved'],
  figma: ['edit profile.jpg', 'Pet Edit.png'], checkedAt: W,
  notes: ['The Figma "Pet Profile (edit)" mixed owner fields into the pet form; here the form is pet-only (open question 27).'],
});

export const vaccinesHubSpec = defineSpec({
  code: 'C-20', name: 'Vaccines',
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
