/**
 * Front desk reservations (F-01..F-29): the activity trail per booking and the additional services a desk booking
 * carries (Board Booking form: Type / Service / Applies To / Rate / Total / Occurs / M A E).
 */
import { defineTables, type BaseRow, type ColumnDef } from './types.ts';
import { BOOKING_STATUSES } from '../../domain/booking.ts';

const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });

export const BOOKING_EVENT_KINDS = ['created', 'status', 'room', 'dates', 'note', 'payment', 'edited'] as const;
export const SERVICE_OCCURS = ['once', 'daily', 'per_night'] as const;

export const tables = defineTables([
  { name: 'booking_events', label: 'Booking activity', description: 'Activity trail per hotel booking: creation, status changes (with the approval that allowed them), room moves, date changes, notes, payments. Replaces the legacy "Added / Last edited by" line (R-J08).', group: 'hotel', scope: 'location', source: 'F-12 booking detail; R-J08, R-I06',
    columns: [ref('booking_id', 'bookings'), { name: 'kind', type: 'enum', enum: BOOKING_EVENT_KINDS }, { name: 'from_status', type: 'enum', enum: BOOKING_STATUSES, nullable: true }, { name: 'to_status', type: 'enum', enum: BOOKING_STATUSES, nullable: true }, text('summary'), ref('user_id', 'users', true), text('user_name'), ref('approval_id', 'approvals', true), { name: 'details', type: 'json', nullable: true, wide: true }, { name: 'at', type: 'timestamptz' }],
    access: ['staff read', 'system write'] },
  { name: 'booking_services', label: 'Booking additional services', description: 'Extra services attached to a hotel booking (Veterinary travel, Vaccination fee...): rate snapshot, quantity, occurrence and Morning / Afternoon / Evening flags (R-D16).', group: 'hotel', scope: 'global', source: 'Board Booking.pdf; R-D16',
    columns: [ref('booking_id', 'bookings'), ref('service_id', 'services'), text('label'), ref('pet_id', 'pets', true), { name: 'rate', type: 'money' }, { name: 'qty', type: 'int' }, { name: 'total', type: 'money' }, { name: 'occurs', type: 'enum', enum: SERVICE_OCCURS }, { name: 'morning', type: 'bool' }, { name: 'afternoon', type: 'bool' }, { name: 'evening', type: 'bool' }, text('note', true)],
    access: ['staff read/write'] },
]);

export type BookingEventKind = (typeof BOOKING_EVENT_KINDS)[number];
export interface BookingEventRow extends BaseRow { booking_id: string; kind: BookingEventKind; from_status: string | null; to_status: string | null; summary: string; user_id: string | null; user_name: string; approval_id: string | null; details: Record<string, unknown> | null; at: string }
export interface BookingServiceRow extends BaseRow { booking_id: string; service_id: string; label: string; pet_id: string | null; rate: number; qty: number; total: number; occurs: (typeof SERVICE_OCCURS)[number]; morning: boolean; afternoon: boolean; evening: boolean; note: string | null }
