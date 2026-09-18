/** Data hooks shared by the F-30..F-59 pages. Everything comes through useTable (mock now, Company-OS later). */
import { useMemo } from 'react';
import { useTable } from '../../data/DataContext';
import { useLocation } from '../../tenant/LocationProvider';
import type { EmployeeRow, FeeRow, TaxRow, VaccineRecordRow, VaccineTypeRow, CapacityRow } from '../../data/schema/core';
import type { AppointmentExtrasRow } from '../../data/schema/frontdesk-grooming-people';
import { byId, dayViewLabel, groomersAt, petVaccineSummary, type AddonFull, type AppointmentFull, type CustomerFull, type PackageFull, type PetFull, type VaccineSummary } from './lib';
import type { GroomAppointmentFlags } from '../../components/molecule/GroomAppointmentCard/GroomAppointmentCard';

export function usePricingTables() {
  const { rows: packages } = useTable<PackageFull>('packages');
  const { rows: addons } = useTable<AddonFull>('addons');
  const { rows: fees } = useTable<FeeRow>('fees');
  const { rows: taxes } = useTable<TaxRow>('taxes');
  return { packages, addons, fees, taxes };
}

export function usePeople() {
  const { rows: customers } = useTable<CustomerFull>('customers');
  const { rows: pets } = useTable<PetFull>('pets');
  const { rows: vaccineRecords } = useTable<VaccineRecordRow>('vaccine_records');
  const { rows: vaccineTypes } = useTable<VaccineTypeRow>('vaccine_types');
  const customerById = useMemo(() => byId(customers), [customers]);
  const petById = useMemo(() => byId(pets), [pets]);
  const vaccineOf = useMemo(() => { const m = new Map<string, VaccineSummary>(); for (const p of pets) m.set(p.id, petVaccineSummary(p.id, vaccineRecords, vaccineTypes)); return m; }, [pets, vaccineRecords, vaccineTypes]);
  return { customers, pets, vaccineRecords, vaccineTypes, customerById, petById, vaccineOf };
}

export interface AppointmentView { ap: AppointmentFull; customer?: CustomerFull; pet?: PetFull; pkg?: PackageFull; groomer?: EmployeeRow; extras?: AppointmentExtrasRow; label: string; flags: GroomAppointmentFlags; addonNames: string[]; vaccine?: VaccineSummary }

/** Appointments at the current location (or all) joined with what the cards need. */
export function useAppointments(day?: string) {
  const { scope, locationId, allLocations } = useLocation();
  const { rows: apps } = useTable<AppointmentFull>('appointments', { where: scope, orderBy: { column: 'starts_at' } });
  const { rows: extras } = useTable<AppointmentExtrasRow>('appointment_extras');
  const { rows: employees } = useTable<EmployeeRow>('employees');
  const { rows: capacities } = useTable<CapacityRow>('capacities', { where: scope });
  const pricing = usePricingTables();
  const people = usePeople();
  const groomers = useMemo(() => groomersAt(employees, locationId, allLocations), [employees, locationId, allLocations]);
  const employeeById = useMemo(() => byId(employees), [employees]);
  const packageById = useMemo(() => byId(pricing.packages), [pricing.packages]);
  const addonById = useMemo(() => byId(pricing.addons), [pricing.addons]);
  const extrasByAp = useMemo(() => { const m = new Map<string, AppointmentExtrasRow>(); for (const e of extras) m.set(e.appointment_id, e); return m; }, [extras]);
  const views = useMemo<AppointmentView[]>(() => apps.filter((a) => !day || a.starts_at.slice(0, 10) === toLocalDay(a.starts_at, day)).map((ap) => {
    const customer = people.customerById.get(ap.customer_id), pet = people.petById.get(ap.pet_id), pkg = ap.package_id ? packageById.get(ap.package_id) : undefined;
    const vaccine = people.vaccineOf.get(ap.pet_id);
    const flags: GroomAppointmentFlags = { vaccine: !!vaccine && vaccine.overall !== 'ok', warning: ap.status === 'requested' || !!ap.notes, payment: ap.payment_status === 'pending' && !['cancelled', 'no_show'].includes(ap.status) };
    return { ap, customer, pet, pkg, groomer: ap.groomer_id ? employeeById.get(ap.groomer_id) : undefined, extras: extrasByAp.get(ap.id), label: dayViewLabel(customer, pet, pkg, ap.size), flags, addonNames: (ap.addon_ids ?? []).map((id) => addonById.get(id)?.name).filter((x): x is string => !!x), vaccine };
  }), [apps, day, people, packageById, addonById, employeeById, extrasByAp]);
  const groomingCapacity = capacities.find((c) => c.kind === 'grooming')?.max_simultaneous ?? null;
  return { apps, views, extras, extrasByAp, employees, groomers, employeeById, capacities, groomingCapacity, ...pricing, ...people, locationId, allLocations };
}

/** Local-day comparison: appointments are stored as ISO UTC; compare in the browser's local day. */
function toLocalDay(iso: string, wanted: string): string {
  const d = new Date(iso);
  const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return local === wanted ? iso.slice(0, 10) : '__no__';
}
