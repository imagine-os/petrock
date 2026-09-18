/**
 * Tables owned by the customer-grooming-daycare module (C-50..C-69).
 * grooming_orders groups the per-pet `appointments` of one Grooming & Spa booking (R-G16: several pets, one payment,
 * re-creatable); daycare_booking_pets holds the per-pet daycare questionnaire (flea medication, medical alert).
 */
import { defineTables, type BaseRow, type ColumnDef } from './types.ts';
import { BOOKING_STATUSES } from '../../domain/booking.ts';
import { PAYMENT_STATUS } from './core.ts';

const money = (name: string, description?: string): ColumnDef => ({ name, type: 'money', description: description ?? 'USD' });
const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const bool = (name: string, description?: string): ColumnDef => ({ name, type: 'bool', description });
const en = (name: string, values: readonly string[], nullable = false): ColumnDef => ({ name, type: 'enum', enum: values, nullable });

export const tables = defineTables([
  { name: 'grooming_orders', label: 'Grooming & Spa orders', description: 'One customer booking of Grooming & Spa for one or more pets at one time: groups the per-pet appointments, carries the payment and the one booking lifecycle status. Past orders can be re-created (R-G16).', group: 'grooming', scope: 'location', titleColumn: 'code', source: 'Frame 1171276434/35.png, entities 12', access: ['customer read own', 'front desk read/write', 'owner read'],
    columns: [text('code', false, 'Human reference e.g. GS-1042'), ref('customer_id', 'customers'), { name: 'appointment_ids', type: 'json', description: 'appointments.id per pet' }, { name: 'pet_ids', type: 'json', description: 'pets.id in order' }, { name: 'starts_at', type: 'timestamptz' }, { name: 'duration_min', type: 'int', description: 'Longest chair time; pets are groomed in parallel up to the grooming capacity' }, ref('groomer_id', 'employees', true), en('status', BOOKING_STATUSES), en('payment_method', ['card', 'cash'], true), en('payment_status', PAYMENT_STATUS), money('subtotal'), money('tax_total'), money('fee_total'), money('total'), ref('invoice_id', 'invoices', true), text('notes', true), text('source', true, 'app | desk | recreate')] },
  { name: 'daycare_booking_pets', label: 'Daycare booking pets', description: 'Per pet on a daycare day: the additional pet details questionnaire (vet-recommended flea medication with brand and date, medical alerts).', group: 'daycare', scope: 'global', source: 'DayCare-2.png, R-A10', access: ['customer write own', 'front desk read'],
    columns: [ref('daycare_booking_id', 'daycare_bookings'), ref('pet_id', 'pets'), bool('flea_medication', 'On a vet-recommended flea medication'), text('flea_brand', true), { name: 'flea_date', type: 'date', nullable: true, description: 'Last application' }, text('medical_alert', true)] },
]);

export interface GroomingOrderRow extends BaseRow { location_id: string; code: string; customer_id: string; appointment_ids: string[]; pet_ids: string[]; starts_at: string; duration_min: number; groomer_id: string | null; status: string; payment_method: 'card' | 'cash' | null; payment_status: string; subtotal: number; tax_total: number; fee_total: number; total: number; invoice_id: string | null; notes: string | null; source: string | null }
export interface DaycareBookingPetRow extends BaseRow { daycare_booking_id: string; pet_id: string; flea_medication: boolean; flea_brand: string | null; flea_date: string | null; medical_alert: string | null }
