import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../tenant/LocationProvider';
import { useTable } from '../../data/DataContext';
import type { BookingRow, CapacityRow, CustomerRow, DaycareBookingRow, DiscountRow, FeeRow, PetRow, RateRow, RoomRow, RoomTypeRow, SeasonRow, TaxRow } from '../../data/schema/core';
import { quoteHotel, fmtMoney } from '../../pricing/engine';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { BookingInfoGrid } from '../../components/molecule/BookingInfoGrid/BookingInfoGrid';
import { BookingChargeSummary } from '../../components/molecule/BookingChargeSummary/BookingChargeSummary';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Section } from '../../components/molecule/Section/Section';
import { availabilityByType, roomFits, suiteRuleWarning, PENTHOUSE_TOP_MAX_LBS } from './lib/availability';
import { addDaysIso, diffDays, fmtDate, fmtDay, todayIso } from './lib/dates';
import './frontdesk-reservations.css';

/** F-15 - the phone question: free rooms, fit, price, next two weeks. */
export function AvailabilityPage() {
  const nav = useNavigate();
  const { location, locationId, scope } = useLocation();
  const { rows: rooms } = useTable<RoomRow>('rooms', { where: scope });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: scope });
  const { rows: daycare } = useTable<DaycareBookingRow>('daycare_bookings', { where: scope });
  const { rows: capacities } = useTable<CapacityRow>('capacities', { where: scope });
  const { rows: customers } = useTable<CustomerRow>('customers', { orderBy: { column: 'last_name' } });
  const { rows: pets } = useTable<PetRow>('pets');
  const { rows: rates } = useTable<RateRow>('rates');
  const { rows: seasons } = useTable<SeasonRow>('seasons');
  const { rows: discounts } = useTable<DiscountRow>('discounts');
  const { rows: fees } = useTable<FeeRow>('fees');
  const { rows: taxes } = useTable<TaxRow>('taxes');
  const today = todayIso();
  const [dayIn, setDayIn] = useState(today);
  const [dayOut, setDayOut] = useState(addDaysIso(today, 2));
  const [dogs, setDogs] = useState('1');
  const [lbs, setLbs] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [petIds, setPetIds] = useState<string[]>([]);
  const [paidInFull, setPaidInFull] = useState(false);
  const [card, setCard] = useState(true);

  const custPets = pets.filter((p) => p.customer_id === customerId);
  const chosen = custPets.filter((p) => petIds.includes(p.id));
  const dogCount = chosen.length || Math.max(1, Number(dogs) || 1);
  const heaviest = chosen.length ? Math.max(...chosen.map((p) => p.weight_lbs ?? 0)) : Number(lbs) || 0;
  const nights = Math.max(0, diffDays(dayIn, dayOut));
  const avail = useMemo(() => availabilityByType({ rooms, roomTypes, bookings, checkInDay: dayIn, checkOutDay: dayOut }), [rooms, roomTypes, bookings, dayIn, dayOut]);
  const dcCap = capacities.find((c) => c.kind === 'daycare')?.max_simultaneous ?? 0;
  const dcUsed = daycare.filter((d) => d.date === dayIn && !['cancelled', 'no_show', 'checked_out'].includes(d.status)).length;
  const occupancy = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = addDaysIso(dayIn, i); const a = availabilityByType({ rooms, roomTypes, bookings, checkInDay: d, checkOutDay: addDaysIso(d, 1) }); return { day: d, ...Object.fromEntries(a.map((x) => [x.roomType.key, `${x.free} / ${x.total}`])), daycare: `${Math.max(0, dcCap - daycare.filter((x) => x.date === d && !['cancelled', 'no_show'].includes(x.status)).length)} / ${dcCap}` } as Record<string, string>; }), [rooms, roomTypes, bookings, dayIn, daycare, dcCap]);

  return (
    <div className="fdr-page">
      <PageHeader title="Quick availability check" subtitle={`${location.name} · ${nights} night${nights === 1 ? '' : 's'} · ${dogCount} dog${dogCount === 1 ? '' : 's'}${heaviest ? ` · heaviest ${heaviest} lb` : ''}`} code="F-15" actions={<Button icon="plus" onClick={() => nav('/desk/reservations/new')}>New booking</Button>} />

      <Card header={<strong>Dates and dogs</strong>}>
        <div className="fdr-fields">
          <Input type="date" label="Check-in" value={dayIn} onChange={(e) => { setDayIn(e.target.value); if (dayOut <= e.target.value) setDayOut(addDaysIso(e.target.value, 1)); }} />
          <Input type="date" label="Check-out" value={dayOut} min={addDaysIso(dayIn, 1)} onChange={(e) => setDayOut(e.target.value)} />
          <Select label="Dogs" value={dogs} onChange={(e) => setDogs(e.target.value)} options={['1', '2', '3', '4'].map((n) => ({ value: n, label: n }))} disabled={chosen.length > 0} />
          <Input type="number" label="Heaviest dog (lb)" min={0} value={chosen.length ? String(heaviest) : lbs} onChange={(e) => setLbs(e.target.value)} disabled={chosen.length > 0} hint={`Over ${PENTHOUSE_TOP_MAX_LBS} lb: bottom penthouse rooms only (R-E09)`} />
          <Select label="Or pick a customer's pets" value={customerId} onChange={(e) => { setCustomerId(e.target.value); setPetIds([]); }} placeholder="Customer…" options={customers.map((c) => ({ value: c.id, label: `${c.last_name}, ${c.first_name}` }))} />
          <div className="stack-sm"><Toggle size="sm" checked={paidInFull} onChange={setPaidInFull} label="Paid in full" /><Toggle size="sm" checked={card} onChange={setCard} label="Card payment" /></div>
        </div>
        {customerId && <div className="row wrap" style={{ marginTop: 12 }}>{custPets.length === 0 && <span className="muted small">No pets on this account.</span>}{custPets.map((p) => <Checkbox key={p.id} checked={petIds.includes(p.id)} onChange={(e) => setPetIds(e.target.checked ? [...petIds, p.id] : petIds.filter((x) => x !== p.id))} label={`${p.name} · ${p.breed} · ${p.weight_lbs} lb`} />)}</div>}
      </Card>

      <div className="fdr-results">
        {avail.map((a) => {
          const rt = a.roomType;
          const fitRooms = a.freeRooms.filter((r) => roomFits(r, rt, heaviest).ok);
          const warn = suiteRuleWarning(rt, heaviest);
          const q = nights > 0 ? quoteHotel({ roomTypeId: rt.id, roomTypeName: rt.name, checkIn: new Date(dayIn + 'T10:00:00'), checkOut: new Date(dayOut + 'T11:00:00'), dogs: dogCount, paidInFull, payWithCard: card, locationId, rates, seasons, discounts, fees, taxes }) : null;
          const ok = Math.min(a.free, fitRooms.length) > 0;
          return (
            <Card key={rt.id} header={<><strong>{rt.name}</strong><Badge tone={ok ? 'success' : 'danger'}>{ok ? 'Available' : 'Full'}</Badge></>}>
              <div className="stack">
                <div className="row" style={{ alignItems: 'baseline', gap: 12 }}><span className="fdr-avail-big">{Math.min(a.free, fitRooms.length)}</span><span className="muted small">of {a.total} rooms free for every night{rt.key === 'penthouse' ? ` · ${fitRooms.filter((r) => r.position === 'bottom').length} bottom` : ''}</span></div>
                <BookingInfoGrid dense columns={3} items={[{ label: 'Occupied', value: a.occupied }, { label: 'Unassigned bookings', value: a.unassigned }, { label: 'Fit', value: heaviest > PENTHOUSE_TOP_MAX_LBS && rt.key === 'penthouse' ? 'Bottom rooms only' : 'Any room', tone: heaviest > PENTHOUSE_TOP_MAX_LBS && rt.key === 'penthouse' ? 'warn' : 'default' }]} />
                {warn && <p className="small tone-warn">{warn}</p>}
                {q && <BookingChargeSummary compact lines={q.lines} subtotal={q.subtotal} discountTotal={q.discountTotal} feeTotal={q.feeTotal} taxTotal={q.taxTotal} total={q.total} notes={q.notes} />}
                <div className="row" style={{ justifyContent: 'space-between' }}><span className="xs muted">{q ? `${fmtMoney(q.total / Math.max(1, nights))} per night avg` : 'Pick at least one night'}</span><Button size="sm" disabled={!ok || nights === 0} iconRight="arrow-right" onClick={() => nav(`/desk/reservations/new?checkIn=${dayIn}&checkOut=${dayOut}&roomType=${rt.id}${customerId ? `&customer=${customerId}` : ''}${petIds.length ? `&pets=${petIds.join(',')}` : ''}`)}>Book {rt.name}</Button></div>
              </div>
            </Card>
          );
        })}
        <Card header={<><strong>Daycare on {fmtDate(dayIn)}</strong><Badge tone={dcCap - dcUsed > 0 ? 'success' : 'danger'}>{Math.max(0, dcCap - dcUsed)} spots</Badge></>}>
          <div className="stack-sm">
            <div className="row" style={{ alignItems: 'baseline', gap: 12 }}><span className="fdr-avail-big">{Math.max(0, dcCap - dcUsed)}</span><span className="muted small">of {dcCap} daycare spots (R-E13)</span></div>
            <p className="xs muted">Hotel guests are not deducted from daycare capacity - working answer to the designer's question (R-E14, needs Justin).</p>
          </div>
        </Card>
      </div>

      <Section title="Next 14 days" description={`Rooms free each night from ${fmtDay(dayIn)} (R-X03) and daycare spots per day.`}>
        <DataTable dense stickyHeader={false} rows={occupancy} rowKey={(r) => r.day} cardBreakpoint={480} columns={[{ key: 'day', label: 'Day', render: (r) => <span className={r.day === today ? 'tone-info' : ''}>{fmtDay(r.day)}</span> }, ...roomTypes.map((rt) => ({ key: rt.key, label: `${rt.name}s free`, align: 'right' as const, render: (r: Record<string, string>) => <span className={`mono ${r[rt.key]?.startsWith('0 ') ? 'tone-danger' : ''}`}>{r[rt.key]}</span> })), { key: 'daycare', label: 'Daycare free', align: 'right', render: (r) => <span className="mono">{r.daycare}</span> }]} />
      </Section>
    </div>
  );
}
