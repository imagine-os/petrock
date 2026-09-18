/** Per-pet vaccine summary (R-A05, R-X04): every required vaccine verified and not expired -> ok. */
import type { VaccineRecordRow, VaccineTypeRow } from '../../../data/schema/core';
import { todayIso } from './dates';

export type PetVaccineState = 'verified' | 'submitted' | 'expired' | 'missing';
export interface PetVaccineSummary { state: PetVaccineState; ok: boolean; verified: string[]; submitted: string[]; expired: string[]; missing: string[]; soon: string[] }

export function petVaccineSummary(petId: string, records: VaccineRecordRow[], types: VaccineTypeRow[], today = todayIso()): PetVaccineSummary {
  const s: PetVaccineSummary = { state: 'verified', ok: true, verified: [], submitted: [], expired: [], missing: [], soon: [] };
  const soonLimit = new Date(today + 'T00:00:00'); soonLimit.setDate(soonLimit.getDate() + 30);
  for (const t of types.filter((x) => x.required).sort((a, b) => a.sort_order - b.sort_order)) {
    const r = records.find((x) => x.pet_id === petId && x.vaccine_type_id === t.id);
    const expired = !!r?.expires_on && r.expires_on < today;
    if (!r || r.status === 'missing' || r.status === 'rejected') s.missing.push(t.short_name);
    else if (r.status === 'expired' || expired) s.expired.push(t.short_name);
    else if (r.status === 'submitted') s.submitted.push(t.short_name);
    else { s.verified.push(t.short_name); if (r.expires_on && new Date(r.expires_on + 'T00:00:00') <= soonLimit) s.soon.push(t.short_name); }
  }
  s.state = s.expired.length ? 'expired' : s.missing.length ? 'missing' : s.submitted.length ? 'submitted' : 'verified';
  s.ok = s.state === 'verified';
  return s;
}

export const vaccineTone = (state: PetVaccineState): 'success' | 'warn' | 'danger' => (state === 'verified' ? 'success' : state === 'submitted' ? 'warn' : 'danger');
