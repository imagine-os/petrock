/**
 * customer-home-pets tables (C-10..C-29): emergency contacts per pet and the extendable lookup lists
 * (breeds, colours) the Add / Edit pet wizard offers. Pets and vaccine_records themselves live in core.ts.
 */
import { defineTables, type BaseRow, type ColumnDef } from './types.ts';

const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });

export const PET_LOOKUP_KINDS = ['breed', 'color'] as const;
export const PET_PERSONALITIES = ['Shy', 'Calm', 'Hyper', 'Aggressive'] as const;
export const PET_MEALS = ['AM', 'PM', 'AM & PM', 'AM, Mid Day & PM', 'Free feeding'] as const;
export const PET_SOCIALIZED = ['Humans', 'Dogs'] as const;

export const tables = defineTables([
  { name: 'emergency_contacts', label: 'Emergency contacts', description: 'Who to call about a pet when the parent is unreachable (customer-level, optionally pinned to one pet). Captured on the Add / Edit pet wizard step "Vet & emergency".', group: 'people', scope: 'global', titleColumn: 'name', source: 'customer-home-pets (R-X22)', access: ['customer read/write own', 'staff read'],
    columns: [ref('customer_id', 'customers'), ref('pet_id', 'pets', true), text('name'), text('phone'), text('relationship', true, 'e.g. Partner, Neighbour, Dog walker'), text('note', true)] },
  { name: 'pet_lookups', label: 'Pet lookup lists', description: 'Extendable option lists for pet forms: breeds and colours (entities 5: "extendable inline via +"). Customers and staff can add a value from the form.', group: 'pets', scope: 'global', titleColumn: 'value', source: 'entities 5, Pet Edit.png', access: ['everyone read', 'signed-in add'],
    columns: [{ name: 'kind', type: 'enum', enum: PET_LOOKUP_KINDS }, text('value'), { name: 'sort_order', type: 'int' }, { name: 'active', type: 'bool' }, text('added_by', true, 'user id when added from a form')] },
]);

export interface EmergencyContactRow extends BaseRow { customer_id: string; pet_id: string | null; name: string; phone: string; relationship: string | null; note: string | null }
export interface PetLookupRow extends BaseRow { kind: (typeof PET_LOOKUP_KINDS)[number]; value: string; sort_order: number; active: boolean; added_by: string | null }
/** Typed row for the core `vets` table (core.ts defines the table but no row type). */
export interface VetRow extends BaseRow { name: string; phone: string | null; address: string | null }
