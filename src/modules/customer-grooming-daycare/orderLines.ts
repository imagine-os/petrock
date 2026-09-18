import type { AddonRow, AppointmentRow, PackageRow } from '../../data/schema/core';
import type { GroomingOrderRow } from '../../data/schema/customer-grooming-daycare';
import type { GroomingOrderPetLine } from '../../components/molecule/GroomingOrderCard/GroomingOrderCard';

/** Per-pet lines of an order from its appointments (package, size, add-ons, amount before tax). */
export function orderPetLines(o: GroomingOrderRow, appointments: AppointmentRow[], pets: { id: string; name: string }[], packages: PackageRow[], addons: AddonRow[]): GroomingOrderPetLine[] {
  const aps = o.appointment_ids.map((id) => appointments.find((a) => a.id === id)).filter((a): a is AppointmentRow => !!a);
  if (!aps.length) return o.pet_ids.map((pid) => ({ petName: pets.find((p) => p.id === pid)?.name ?? 'Pet', packageName: 'Grooming & Spa', size: null, addons: [], amount: o.subtotal / Math.max(1, o.pet_ids.length) }));
  return aps.map((a) => ({ petName: pets.find((p) => p.id === a.pet_id)?.name ?? 'Pet', packageName: packages.find((p) => p.id === a.package_id)?.name ?? 'Grooming & Spa', size: a.size, addons: (a.addon_ids ?? []).map((id) => addons.find((x) => x.id === id)?.name ?? '').filter(Boolean), amount: a.subtotal }));
}
