/** Writes shared by the wizard and the vaccine pages: submit a vaccine record, notify, upsert emergency contact. */
import type { DataProvider } from '../../data/provider';
import type { VaccineRecordRow, VaccineTypeRow, NotificationRow, UserRow, CustomerRow, PetRow } from '../../data/schema/core';
import type { EmergencyContactRow } from '../../data/schema/customer-home-pets';
import type { VaccineRecordDraft } from '../../components/organism/VaccineRecordForm/VaccineRecordForm';

export interface SubmitVaccineArgs { data: DataProvider; pet: PetRow; type: VaccineTypeRow; draft: VaccineRecordDraft; existing: VaccineRecordRow | null; customer: CustomerRow | null; users: UserRow[] }

/**
 * Inserts a submitted record (or updates the existing non-verified one). A verified record is never overwritten: a new
 * submitted row is inserted so the verified history stays (R-B03). Notifies the front desk of the home location.
 */
export async function submitVaccineRecord({ data, pet, type, draft, existing, customer, users }: SubmitVaccineArgs): Promise<VaccineRecordRow> {
  const patch: Partial<VaccineRecordRow> = { pet_id: pet.id, vaccine_type_id: type.id, vaccinated_on: draft.vaccinatedOn, expires_on: draft.expiresOn, proof_url: draft.proof?.url ?? null, proof_name: draft.proof?.name ?? null, status: 'submitted', verified_by: null, verified_at: null, note: null };
  const row = existing && existing.status !== 'verified' ? await data.update<VaccineRecordRow>('vaccine_records', existing.id, patch) : await data.insert<VaccineRecordRow>('vaccine_records', patch);
  if (pet.approval_status === 'needs_details') await data.update<PetRow>('pets', pet.id, { approval_status: 'pending' });
  const desk = users.find((u) => u.role === 'front_desk' && u.location_id === customer?.home_location_id) ?? users.find((u) => u.role === 'front_desk');
  if (desk) await data.insert<NotificationRow>('notifications', { user_id: desk.id, kind: 'vaccine_submitted', title: `Vaccine proof submitted for ${pet.name}`, body: `${customer ? `${customer.first_name} ${customer.last_name}` : 'A customer'} uploaded ${type.short_name} (${draft.proof?.name ?? 'no file'}); verify it in the vaccine queue.`, link: '/desk/vaccines', read: false, sent_at: new Date().toISOString() });
  return row;
}

export async function notifyCustomer(data: DataProvider, userId: string, kind: string, title: string, body: string, link: string) {
  await data.insert<NotificationRow>('notifications', { user_id: userId, kind, title, body, link, read: false, sent_at: new Date().toISOString() });
}

export interface EmergencyDraft { name: string; phone: string; relationship: string }
export async function upsertEmergencyContact(data: DataProvider, customerId: string, petId: string, draft: EmergencyDraft, existing: EmergencyContactRow | null) {
  const empty = !draft.name.trim() && !draft.phone.trim();
  if (existing && empty) { await data.remove('emergency_contacts', existing.id); return; }
  if (empty) return;
  const patch: Partial<EmergencyContactRow> = { customer_id: customerId, pet_id: petId, name: draft.name.trim(), phone: draft.phone.trim(), relationship: draft.relationship.trim() || null, note: null };
  if (existing) await data.update<EmergencyContactRow>('emergency_contacts', existing.id, patch); else await data.insert<EmergencyContactRow>('emergency_contacts', patch);
}
