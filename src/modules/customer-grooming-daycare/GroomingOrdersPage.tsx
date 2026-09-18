import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import type { AppointmentRow, EmployeeRow, LocationRow } from '../../data/schema/core';
import type { GroomingOrderRow } from '../../data/schema/customer-grooming-daycare';
import { Button } from '../../components/atom/Button/Button';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { GroomingOrderCard } from '../../components/molecule/GroomingOrderCard/GroomingOrderCard';
import { useCustomer } from './useCustomer';
import { usePricingTables } from './pricing';
import { EMPTY_GROOMING, writeDraft } from './draft';
import { orderPetLines } from './orderLines';
import { CgdPage } from './layout';

/** C-56 Your Grooming & Spa orders (Figma Frame 1171276434): upcoming / past tabs, re-create a past order, create a new one. */
export function GroomingOrdersPage() {
  const t = useT();
  const nav = useNavigate();
  const { customer, pets } = useCustomer();
  const { packages, addons } = usePricingTables();
  const { rows: orders } = useTable<GroomingOrderRow>('grooming_orders', customer ? { where: { customer_id: customer.id }, orderBy: { column: 'starts_at', dir: 'desc' } } : undefined);
  const { rows: appointments } = useTable<AppointmentRow>('appointments', customer ? { where: { customer_id: customer.id } } : undefined);
  const { rows: locations } = useTable<LocationRow>('locations');
  const { rows: groomers } = useTable<EmployeeRow>('employees', { where: { is_groomer: true } });
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const now = Date.now();
  const { upcoming, past } = useMemo(() => {
    const up = orders.filter((o) => ['requested', 'pending_vaccines', 'confirmed', 'checked_in'].includes(o.status) && new Date(o.starts_at).getTime() > now - 3 * 3600e3).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    return { upcoming: up, past: orders.filter((o) => !up.includes(o)) };
  }, [orders, now]);
  const list = tab === 'upcoming' ? upcoming : past;
  const recreate = (o: GroomingOrderRow) => {
    const aps = o.appointment_ids.map((id) => appointments.find((a) => a.id === id)).filter((a): a is AppointmentRow => !!a);
    writeDraft('grooming', { ...EMPTY_GROOMING, source: 'recreate', locationId: o.location_id, groomerId: o.groomer_id, items: aps.length ? aps.map((a) => ({ petId: a.pet_id, packageId: a.package_id, addonIds: a.addon_ids ?? [] })) : o.pet_ids.map((petId) => ({ petId, packageId: null, addonIds: [] })) });
    nav(aps.length && aps.every((a) => a.package_id) ? '/app/grooming/new/time' : '/app/grooming/new');
  };

  return (
    <CgdPage title={t('cgd.pastOrders')} backTo="/app/grooming" actions={<Button icon="plus" onClick={() => { writeDraft('grooming', EMPTY_GROOMING); nav('/app/grooming/new'); }}>New</Button>}>
      <Tabs value={tab} onChange={setTab} ariaLabel="Orders" items={[{ key: 'upcoming', label: 'Upcoming', count: upcoming.length }, { key: 'past', label: 'Past', count: past.length }]} />
      {list.length === 0 ? <EmptyState icon="scissors" title={tab === 'upcoming' ? 'No upcoming grooms' : 'No past orders yet'} body={tab === 'upcoming' ? 'Book a Gold, Platinum or Diamond groom for any of your pets.' : 'Completed orders show here and can be re-created in one tap.'} action={<Button onClick={() => { writeDraft('grooming', EMPTY_GROOMING); nav('/app/grooming/new'); }}>{t('cgd.bookNow')}</Button>} /> : (
        <div className="cgd-list">
          {list.map((o) => <GroomingOrderCard key={o.id} code={o.code} startsAt={o.starts_at} status={o.status} paymentStatus={o.payment_status} total={o.total} locationName={locations.find((l) => l.id === o.location_id)?.short_name} groomerName={groomers.find((g) => g.id === o.groomer_id)?.display_name ?? null} pets={orderPetLines(o, appointments, pets, packages, addons)} onOpen={() => nav(`/app/grooming/orders/${o.id}`)}
            actions={<><Button size="sm" variant="secondary" icon="refresh" onClick={() => recreate(o)}>{t('cgd.recreate')}</Button><Button size="sm" variant="ghost" iconRight="chevron-right" onClick={() => nav(`/app/grooming/orders/${o.id}`)}>Details</Button></>} />)}
        </div>
      )}
    </CgdPage>
  );
}
