import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import type { DaycareBookingRow, LocationRow } from '../../data/schema/core';
import { Button } from '../../components/atom/Button/Button';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { DaycareDayCard } from '../../components/molecule/DaycareDayCard/DaycareDayCard';
import { useCustomer } from './useCustomer';
import { usePricingTables } from './pricing';
import { EMPTY_DAYCARE, writeDraft } from './draft';
import { todayIso } from './format';
import { CgdPage } from './layout';

type Row = DaycareBookingRow & { location_id?: string };

/** C-65 Your daycare days: upcoming / past, book again, new. */
export function DaycareBookingsPage() {
  const t = useT();
  const nav = useNavigate();
  const { customer, pets } = useCustomer();
  const { daycarePricing } = usePricingTables();
  const { rows } = useTable<Row>('daycare_bookings', customer ? { where: { customer_id: customer.id }, orderBy: { column: 'date', dir: 'desc' } } : undefined);
  const { rows: locations } = useTable<LocationRow>('locations');
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const today = todayIso();
  const { upcoming, past } = useMemo(() => { const up = rows.filter((b) => b.date >= today && ['requested', 'pending_vaccines', 'confirmed', 'checked_in'].includes(b.status)).sort((a, b) => a.date.localeCompare(b.date)); return { upcoming: up, past: rows.filter((b) => !up.includes(b)) }; }, [rows, today]);
  const list = tab === 'upcoming' ? upcoming : past;
  const nameFor = (pid: string) => pets.find((p) => p.id === pid)?.name ?? 'Pet';
  const fresh = () => { writeDraft('daycare', { ...EMPTY_DAYCARE, locationId: customer?.home_location_id ?? null }); nav('/app/daycare/new'); };
  const again = (b: Row) => { writeDraft('daycare', { ...EMPTY_DAYCARE, petIds: b.pet_ids, locationId: b.location_id ?? null, checkIn: b.check_in_time, checkOut: b.check_out_time }); nav('/app/daycare/new'); };

  return (
    <CgdPage title={t('cgd.myDaycare')} backTo="/app/daycare" actions={<Button icon="plus" onClick={fresh}>New</Button>}>
      <Tabs value={tab} onChange={setTab} ariaLabel="Daycare days" items={[{ key: 'upcoming', label: 'Upcoming', count: upcoming.length }, { key: 'past', label: 'Past', count: past.length }]} />
      {list.length === 0 ? <EmptyState icon="sun" title={tab === 'upcoming' ? 'No upcoming daycare' : 'No past days yet'} body="Book a play day; the price follows the hours you choose." action={<Button onClick={fresh}>{t('cgd.bookNow')}</Button>} /> : (
        <div className="cgd-list">
          {list.map((b) => <DaycareDayCard key={b.id} code={b.code} date={b.date} checkIn={b.check_in_time} checkOut={b.check_out_time} itemLabel={daycarePricing.find((p) => p.item === b.item)?.name ?? b.item} petNames={b.pet_ids.map(nameFor)} status={b.status} paymentStatus={b.payment_status} total={b.total} locationName={locations.find((l) => l.id === b.location_id)?.short_name} onOpen={() => nav(`/app/daycare/bookings/${b.id}`)}
            actions={<><Button size="sm" variant="secondary" icon="refresh" onClick={() => again(b)}>{t('cgd.bookAgain')}</Button><Button size="sm" variant="ghost" iconRight="chevron-right" onClick={() => nav(`/app/daycare/bookings/${b.id}`)}>Details</Button></>} />)}
        </div>
      )}
    </CgdPage>
  );
}
