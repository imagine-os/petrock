/**
 * Tables owned by the frontdesk-grooming-people module (F-30..F-59). Core tables (appointments, customers, pets,
 * vaccine_records, conversations, messages, notifications, invoices) stay in core.ts; these extend them without
 * touching shared files: extra form fields from the Figma add-forms, groomer column preferences, lookup lists,
 * customer notes, conversation assignment, mock attachments.
 */
import { defineTables, type BaseRow, type ColumnDef } from './types.ts';

const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const bool = (name: string, description?: string): ColumnDef => ({ name, type: 'bool', description });
const en = (name: string, values: readonly string[], nullable = false): ColumnDef => ({ name, type: 'enum', enum: values, nullable });

export const LOOKUP_KINDS = ['breed', 'color', 'city', 'reference', 'attribute', 'customer_title', 'temper'] as const;
export const ATTACHMENT_SUBJECTS = ['customers', 'pets', 'appointments', 'vaccine_records'] as const;

export const tables = defineTables([
  { name: 'customer_profiles', label: 'Customer profile extras', description: 'Front desk Customer Details fields that are not on the core customers row: title, home / work phone, alternative contact, reference, attributes (R-J01, Customer Details.pdf).', group: 'people', scope: 'global', source: 'Customer Details.pdf, entities 1', access: ['front_desk write', 'customer read'],
    columns: [ref('customer_id', 'customers'), text('title', true, 'Mr. / Ms. / Dr.'), text('home_phone', true), text('work_phone', true), text('alt_contact', true, 'Name of another person to call'), text('reference', true, 'How they heard about Petrock'), { name: 'attributes', type: 'json', nullable: true, description: 'Staff flags e.g. VIP, Late payer' }, { name: 'customer_since', type: 'date', nullable: true }] },
  { name: 'pet_profiles', label: 'Pet profile extras', description: 'Front desk Pet Details fields beyond the core pets row: registration and microchip numbers, approximate-age flag, temper, saved groom style (R-C06, Pet Details .pdf).', group: 'pets', scope: 'global', source: 'Pet Details .pdf, Groom Booking .pdf, entities 2, 13', access: ['front_desk write'],
    columns: [ref('pet_id', 'pets'), text('registration_number', true), text('microchip_number', true), bool('dob_approximate', 'Date of birth is an estimate'), text('temper', true, 'Front desk temper (mirrors personality on the app)'), text('groom_style', true, 'Saved groom style used to prefill groom bookings'), text('groom_notes', true)] },
  { name: 'appointment_extras', label: 'Appointment extras', description: 'Groom Bookings form fields not on the core appointments row: reminder, pickup / delivery, discount %, payment method, include-notes-on-invoice, groom style at booking (Groom Booking .pdf).', group: 'grooming', scope: 'global', source: 'Groom Booking .pdf, entities 12', access: ['front_desk write'],
    columns: [ref('appointment_id', 'appointments'), bool('reminder'), { name: 'pickup_at', type: 'timestamptz', nullable: true }, { name: 'delivery_at', type: 'timestamptz', nullable: true }, { name: 'discount_pct', type: 'numeric', description: 'Percent discount applied with manager PIN (R-P01)' }, en('payment_method', ['card', 'cash'], true), bool('include_notes_on_invoice'), text('groom_style', true), ref('approval_id', 'approvals', true), ref('invoice_id', 'invoices', true)] },
  { name: 'groomer_column_prefs', label: 'Groomer column preferences', description: 'Per staff user per location: groomer column order, colour and hidden state on the grooming day view (Grooming.png context menu).', group: 'grooming', scope: 'location', source: 'Grooming.png, open question 82', access: ['staff write own'],
    columns: [ref('user_id', 'users'), ref('groomer_id', 'employees'), text('color', true, 'Hex tint; null = employee colour'), { name: 'sort_order', type: 'int' }, bool('hidden')] },
  { name: 'lookup_values', label: 'Lookup lists', description: 'Extendable dropdown lists used by the add forms: breed, color, city, reference, attribute, customer title, temper (R-J04).', group: 'system', scope: 'global', titleColumn: 'value', source: 'Customer Details.pdf, Pet Details .pdf (+ buttons)', access: ['staff write'],
    columns: [en('kind', LOOKUP_KINDS), text('value'), { name: 'sort_order', type: 'int' }, bool('active')] },
  { name: 'customer_notes', label: 'Customer notes', description: 'Timeline of staff notes on a customer (who, when, pinned). The 100-char customers.note stays the headline note (R-J02).', group: 'people', scope: 'global', source: 'legacy Notes tab, Customer Details.pdf', access: ['staff write', 'owner read'],
    columns: [ref('customer_id', 'customers'), ref('author_id', 'users', true), text('author_name'), text('text'), bool('pinned')] },
  { name: 'conversation_assignments', label: 'Conversation assignments', description: 'Which staff member owns a Front Desk chat thread (assign / reassign from the inbox).', group: 'comms', scope: 'location', source: 'message-1.jpg (D-018 improvement)', access: ['staff write'],
    columns: [ref('conversation_id', 'conversations'), ref('assignee_user_id', 'users', true), text('assignee_name', true), ref('assigned_by', 'users', true), { name: 'assigned_at', type: 'timestamptz' }] },
  { name: 'attachments', label: 'Attachments', description: 'Mock file uploads from the add forms (customer / pet / appointment / vaccine certificate). URLs are mock:// until storage lands.', group: 'system', scope: 'global', titleColumn: 'name', source: 'Customer/Pet Details .pdf dropzone (R-J11)', access: ['staff write'],
    columns: [en('subject_table', ATTACHMENT_SUBJECTS), text('subject_id'), text('name'), text('url'), { name: 'size_bytes', type: 'int' }, text('mime', true), ref('uploaded_by', 'users', true)] },
]);

export interface CustomerProfileRow extends BaseRow { customer_id: string; title: string | null; home_phone: string | null; work_phone: string | null; alt_contact: string | null; reference: string | null; attributes: string[] | null; customer_since: string | null }
export interface PetProfileRow extends BaseRow { pet_id: string; registration_number: string | null; microchip_number: string | null; dob_approximate: boolean; temper: string | null; groom_style: string | null; groom_notes: string | null }
export interface AppointmentExtrasRow extends BaseRow { appointment_id: string; reminder: boolean; pickup_at: string | null; delivery_at: string | null; discount_pct: number; payment_method: 'card' | 'cash' | null; include_notes_on_invoice: boolean; groom_style: string | null; approval_id: string | null; invoice_id: string | null }
export interface GroomerColumnPrefRow extends BaseRow { user_id: string; groomer_id: string; color: string | null; sort_order: number; hidden: boolean }
export interface LookupValueRow extends BaseRow { kind: (typeof LOOKUP_KINDS)[number]; value: string; sort_order: number; active: boolean }
export interface CustomerNoteRow extends BaseRow { customer_id: string; author_id: string | null; author_name: string; text: string; pinned: boolean }
export interface ConversationAssignmentRow extends BaseRow { conversation_id: string; assignee_user_id: string | null; assignee_name: string | null; assigned_by: string | null; assigned_at: string }
export interface AttachmentRow extends BaseRow { subject_table: (typeof ATTACHMENT_SUBJECTS)[number]; subject_id: string; name: string; url: string; size_bytes: number; mime: string | null; uploaded_by: string | null }
