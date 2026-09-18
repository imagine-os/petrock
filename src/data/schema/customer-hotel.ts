/**
 * customer-hotel tables (C-30..C-41): per-pet stay care notes beyond the core medical questionnaire, and the
 * change / cancellation requests a pet parent files from the app for the front desk to handle.
 */
import { defineTables, type BaseRow, type ColumnDef } from './types.ts';

const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const bool = (name: string, description?: string): ColumnDef => ({ name, type: 'bool', description });

export const CHANGE_REQUEST_KINDS = ['modify_dates', 'add_pet', 'remove_pet', 'add_grooming', 'cancel', 'other'] as const;
export const CHANGE_REQUEST_STATUS = ['open', 'approved', 'declined', 'withdrawn'] as const;

export const tables = defineTables([
  { name: 'booking_pet_care', label: 'Stay care notes', description: 'Per pet per hotel stay: feeding, own food, belongings, flea medication brand and date, extra notes (the customer fills these in C-32; the desk reads them at check-in).', group: 'hotel', scope: 'global', source: 'entities 11, Booking Details Add Pets*.png',
    columns: [ref('booking_id', 'bookings'), ref('booking_pet_id', 'booking_pets'), ref('pet_id', 'pets'), text('feeding_instructions', true), text('meals_per_day', true), bool('own_food'), text('belongings', true, 'Bed, toys, leash... brought along'), { name: 'medication_count', type: 'int', nullable: true }, text('dosing_frequency', true, "e.g. '1 daily (AM only)'"), text('flea_brand', true), { name: 'flea_last_dose_on', type: 'date', nullable: true }, text('emergency_contact', true), text('notes', true)] },
  { name: 'booking_change_requests', label: 'Booking change requests', description: 'A pet parent asks to modify dates, add / remove a pet, add grooming or cancel a stay. The front desk approves or declines; approving a cancellation of a confirmed stay is PIN-gated (R-I06).', group: 'hotel', scope: 'location', source: 'C-39 / C-41 (no Figma screen; D-003 hotel consistency)',
    columns: [ref('booking_id', 'bookings'), ref('customer_id', 'customers'), { name: 'kind', type: 'enum', enum: CHANGE_REQUEST_KINDS }, { name: 'requested_check_in', type: 'timestamptz', nullable: true }, { name: 'requested_check_out', type: 'timestamptz', nullable: true }, { name: 'pet_ids', type: 'json', nullable: true }, text('message', true), { name: 'status', type: 'enum', enum: CHANGE_REQUEST_STATUS }, ref('handled_by', 'users', true), { name: 'handled_at', type: 'timestamptz', nullable: true }, text('staff_note', true)] },
]);

export interface BookingPetCareRow extends BaseRow { booking_id: string; booking_pet_id: string; pet_id: string; feeding_instructions: string | null; meals_per_day: string | null; own_food: boolean; belongings: string | null; medication_count: number | null; dosing_frequency: string | null; flea_brand: string | null; flea_last_dose_on: string | null; emergency_contact: string | null; notes: string | null }
export interface BookingChangeRequestRow extends BaseRow { booking_id: string; customer_id: string; kind: (typeof CHANGE_REQUEST_KINDS)[number]; requested_check_in: string | null; requested_check_out: string | null; pet_ids: string[] | null; message: string | null; status: (typeof CHANGE_REQUEST_STATUS)[number]; handled_by: string | null; handled_at: string | null; staff_note: string | null }

/** Shape of the `settings` row with key `hotel_booking` (seeded by src/data/seed/customer-hotel.ts). */
export interface HotelBookingSettings { deposit_percent: number; default_check_in_time: string; default_check_out_time: string; min_nights: number; free_cancellation_hours: number; max_pets_per_room: number }
export const HOTEL_SETTINGS_KEY = 'hotel_booking';
