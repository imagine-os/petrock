import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import type { DaycareBookingRow, DiscountRow, LocationRow } from '../../data/schema/core';
import { fmtMoney } from '../../pricing/engine';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { Icon } from '../../components/atom/Icon/Icon';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { DaycareDayCard } from '../../components/molecule/DaycareDayCard/DaycareDayCard';
import { useCustomer } from './useCustomer';
import { usePricingTables } from './pricing';
import { EMPTY_DAYCARE, writeDraft } from './draft';
import { todayIso } from './format';
import { CgdPage, NoPetsModal } from './layout';

/** C-60 Daycare landing: live pricing from daycare_pricing (threshold included), upcoming days, book now. Supersedes the "Coming soon" placeholder (R-A03). */
export function DaycareStartPage() {
  const t = useT();
  const nav = useNavigate();
  const { customer, pets } = useCustomer();
  const { daycarePricing, discounts } = usePricingTables();
  const { rows: bookings } = useTable<DaycareBookingRow>('daycare_bookings', customer ? { where: { customer_id: customer.id }, orderBy: { column: 'date' } } : undefined);
  const { rows: locations } = useTable<LocationRow>('locations');
  const [noPets, setNoPets] = useState(false);
  const today = todayIso();
  const upcoming = useMemo(() => bookings.filter((b) => b.date >= today && ['requested', 'pending_vaccines', 'confirmed', 'checked_in'].includes(b.status)).slice(0, 3), [bookings, today]);
  const active = daycarePricing.filter((p) => p.active);
  const threshold = active.find((p) => p.item === 'full_day')?.threshold_hours ?? active.find((p) => p.item === 'half_day')?.threshold_hours;
  const extra = discounts.find((d: DiscountRow) => d.active && d.kind === 'daycare_extra_pet');
  const start = () => { if (!pets.length) { setNoPets(true); return; } writeDraft('daycare', { ...EMPTY_DAYCARE, locationId: customer?.home_location_id ?? null }); nav('/app/daycare/new'); };
  const nameFor = (id: string) => pets.find((p) => p.id === id)?.name ?? 'Pet';

  return (
    <CgdPage title={t('cgd.daycare')} backTo="/app" subtitle="A day of play with our handlers while you work. Drop off and pick up when it suits you.">
      <div className="cgd-hero">
        <Icon name="sun" size={140} />
        <h2>Play all day</h2>
        <p>Supervised group play, naps and water breaks at Encino or Westwood. Price follows the hours you pick.</p>
        <Button size="lg" iconRight="arrow-right" onClick={start}>{t('cgd.bookNow')}</Button>
      </div>

      {upcoming.length > 0 && (
        <section className="cgd-list">
          <div className="cgd-section-title"><h2>Upcoming</h2><Link to="/app/daycare/bookings" className="small">All days</Link></div>
          {upcoming.map((b) => <DaycareDayCard key={b.id} code={b.code} date={b.date} checkIn={b.check_in_time} checkOut={b.check_out_time} itemLabel={active.find((p) => p.item === b.item)?.name ?? b.item} petNames={b.pet_ids.map(nameFor)} status={b.status} paymentStatus={b.payment_status} total={b.total} locationName={locations.find((l) => l.id === (b as DaycareBookingRow & { location_id?: string }).location_id)?.short_name} onOpen={() => nav(`/app/daycare/bookings/${b.id}`)} />)}
        </section>
      )}

      <Card padding="md">
        <div className="cgd-section-title"><h2>Pricing</h2><span className="xs muted">per pet, before tax</span></div>
        <div className="cgd-pricing">
          {active.map((p) => <div key={p.id} className="cgd-price"><strong>{fmtMoney(p.price)}</strong><span>{p.name}{p.item === 'full_day' && threshold != null ? ` · ${threshold} h or more` : p.item === 'half_day' && threshold != null ? ` · under ${threshold} h` : p.item === 'hour' ? ' · 1 h or less' : p.item === 'walk' ? ' · add-on' : ''}</span></div>)}
        </div>
        {extra && <p className="xs muted" style={{ marginTop: 8 }}><Icon name="paw" size={12} /> {extra.name}: {fmtMoney(extra.amount_off)} off each additional pet on the same day.</p>}
      </Card>

      {upcoming.length === 0 && <EmptyState compact icon="sun" title="No daycare days booked" body="Book a play day; past days can be booked again in one tap." action={<Link to="/app/daycare/bookings"><Button variant="secondary" size="sm">Past days</Button></Link>} />}
      <NoPetsModal open={noPets} onClose={() => setNoPets(false)} />
    </CgdPage>
  );
}
