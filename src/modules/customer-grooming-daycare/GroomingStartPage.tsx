import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import type { AddonRow, AppointmentRow, EmployeeRow, LocationRow, PackageRow } from '../../data/schema/core';
import type { GroomingOrderRow } from '../../data/schema/customer-grooming-daycare';
import { fmtMoney } from '../../pricing/engine';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { Chip } from '../../components/atom/Chip/Chip';
import { Icon } from '../../components/atom/Icon/Icon';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { GroomingPriceMenu } from '../../components/molecule/GroomingPriceMenu/GroomingPriceMenu';
import { GroomingOrderCard } from '../../components/molecule/GroomingOrderCard/GroomingOrderCard';
import { useCustomer } from './useCustomer';
import { usePricingTables } from './pricing';
import { EMPTY_GROOMING, writeDraft } from './draft';
import { CgdPage, NoPetsModal } from './layout';
import { orderPetLines } from './orderLines';

/** C-50 Grooming & Spa landing: what it is, live price menu from the packages table, add-ons, upcoming orders, book now. */
export function GroomingStartPage() {
  const t = useT();
  const nav = useNavigate();
  const { customer, pets } = useCustomer();
  const { packages, addons } = usePricingTables();
  const { rows: orders } = useTable<GroomingOrderRow>('grooming_orders', customer ? { where: { customer_id: customer.id }, orderBy: { column: 'starts_at' } } : undefined);
  const { rows: appointments } = useTable<AppointmentRow>('appointments', customer ? { where: { customer_id: customer.id } } : undefined);
  const { rows: locations } = useTable<LocationRow>('locations');
  const { rows: groomers } = useTable<EmployeeRow>('employees', { where: { is_groomer: true } });
  const [noPets, setNoPets] = useState(false);
  const now = Date.now();
  const upcoming = useMemo(() => orders.filter((o) => ['requested', 'pending_vaccines', 'confirmed', 'checked_in'].includes(o.status) && new Date(o.starts_at).getTime() > now - 3 * 3600e3).slice(0, 3), [orders, now]);
  const start = () => { if (!pets.length) { setNoPets(true); return; } writeDraft('grooming', EMPTY_GROOMING); nav('/app/grooming/new'); };
  const hl = pets[0]?.sizeTier ?? null;

  return (
    <CgdPage title={t('cgd.grooming')} backTo="/app" subtitle="Gold, Platinum and Diamond grooms, priced by your dog's size. Spa treatments are add-ons.">
      <div className="cgd-hero">
        <Icon name="scissors" size={140} />
        <h2>Bath, blow-dry & pampering</h2>
        <p>Pick a package per pet, add spa extras, choose a groomer and a time at Encino or Westwood. Pay in the app or at the desk.</p>
        <Button size="lg" iconRight="arrow-right" onClick={start}>{t('cgd.bookNow')}</Button>
      </div>

      {upcoming.length > 0 && (
        <section className="cgd-list">
          <div className="cgd-section-title"><h2>Upcoming</h2><Link to="/app/grooming/orders" className="small">All orders</Link></div>
          {upcoming.map((o) => <GroomingOrderCard key={o.id} code={o.code} startsAt={o.starts_at} status={o.status} paymentStatus={o.payment_status} total={o.total} locationName={locations.find((l) => l.id === o.location_id)?.short_name} groomerName={groomers.find((g) => g.id === o.groomer_id)?.display_name ?? null} pets={orderPetLines(o, appointments, pets, packages, addons)} onOpen={() => nav(`/app/grooming/orders/${o.id}`)} />)}
        </section>
      )}

      <Card padding="md">
        <div className="cgd-section-title"><h2>Packages</h2><span className="xs muted">prices before tax</span></div>
        <GroomingPriceMenu packages={packages as (PackageRow & { tier: string })[]} highlightSize={hl} caption={hl && pets[0] ? `${pets[0].name} is size ${hl}` : undefined} />
      </Card>

      <Card padding="md">
        <div className="cgd-section-title"><h2>Spa add-ons</h2></div>
        <div className="cgd-chips">{addons.map((a: AddonRow) => <Chip key={a.id} size="sm">{a.name} · {a.starting_at ? 'from ' : ''}{fmtMoney(a.price)}</Chip>)}</div>
        <p className="xs muted" style={{ marginTop: 8 }}>"From" prices depend on coat condition; the groomer confirms at drop-off. Grooms on hotel stays are done at the end of the stay.</p>
      </Card>

      {upcoming.length === 0 && <EmptyState compact icon="scissors" title="No upcoming grooms" body="Your past orders can be re-created in one tap." action={<Link to="/app/grooming/orders"><Button variant="secondary" size="sm">Past orders</Button></Link>} />}
      <NoPetsModal open={noPets} onClose={() => setNoPets(false)} />
    </CgdPage>
  );
}
