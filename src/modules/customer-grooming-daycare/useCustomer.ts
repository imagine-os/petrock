/**
 * Who is booking. The signed-in customer's `customers` row (users.id -> customers.user_id); a super admin / staff
 * viewing the customer app falls back to the demo customer so every screen has data. Also derives per-pet vaccine
 * status from vaccine_records (R-A05 / R-A11): every required vaccine type must be verified and not expired.
 */
import { useMemo } from 'react';
import { useSession } from '../../auth/SessionProvider';
import { useTable } from '../../data/DataContext';
import type { CustomerRow, PetRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import { demoUserByRole } from '../../auth/demoUsers';
import { sizeFromWeightLbs, type PetSize } from '../../domain/booking';

export interface CustomerPet extends PetRow { sizeTier: PetSize; vaccinesOk: boolean; vaccinesMissing: string[] }

export function useCustomer() {
  const { user } = useSession();
  const demoCustomerUserId = demoUserByRole('customer').id;
  const { rows: customers } = useTable<CustomerRow>('customers');
  const customer = useMemo(() => customers.find((c) => c.user_id === user.id) ?? customers.find((c) => c.user_id === demoCustomerUserId) ?? null, [customers, user.id, demoCustomerUserId]);
  const { rows: petRows } = useTable<PetRow>('pets', customer ? { where: { customer_id: customer.id } } : { where: { customer_id: '__none__' } });
  const { rows: types } = useTable<VaccineTypeRow>('vaccine_types');
  const { rows: records } = useTable<VaccineRecordRow>('vaccine_records');
  const today = new Date().toISOString().slice(0, 10);
  const pets = useMemo<CustomerPet[]>(() => petRows.filter((p) => p.status !== 'inactive').map((p) => {
    const required = types.filter((t) => t.required);
    const missing = required.filter((t) => !records.some((r) => r.pet_id === p.id && r.vaccine_type_id === t.id && r.status === 'verified' && (!r.expires_on || r.expires_on >= today))).map((t) => t.short_name);
    return { ...p, sizeTier: (p.size as PetSize) ?? sizeFromWeightLbs(p.weight_lbs ?? 30), vaccinesOk: missing.length === 0, vaccinesMissing: missing };
  }), [petRows, types, records, today]);
  const isOwnAccount = !!customer && customer.user_id === user.id;
  return { customer, pets, isOwnAccount, userId: customer?.user_id ?? user.id };
}
