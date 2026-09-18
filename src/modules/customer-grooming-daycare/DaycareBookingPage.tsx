import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { DaycareBookingRow, InvoiceRow, LocationRow } from '../../data/schema/core';
import type { DaycareBookingPetRow } from '../../data/schema/customer-grooming-daycare';
import { fmtMoney } from '../../pricing/engine';
import { BOOKING_STATUS_CUSTOMER_LABEL, type BookingStatus } from '../../domain/booking';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Modal } from '../../components/organism/Modal/Modal';
import { DaycareDayCard } from '../../components/molecule/DaycareDayCard/DaycareDayCard';
import { ServiceQuoteLines } from '../../components/molecule/ServiceQuoteLines/ServiceQuoteLines';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomer } from './useCustomer';
import { usePricingTables } from './pricing';
import { writeDraft, EMPTY_DAYCARE, EMPTY_GROOMING } from './draft';
import { cancelDaycareBooking, CUSTOMER_CANCELLABLE } from './actions';
import { hoursBetween } from './format';
import { groomingFitMinutes } from './DaycareBookPage';
import { CgdPage, Notice } from './layout';

type Row = DaycareBookingRow & { location_id?: string; notes?: string | null };

/** C-64 Daycare day detail & confirmation: status, pets and their questionnaire, totals, book again, cancel before confirmation (R-X04), add grooming when the day is long enough (R-X07). */
export function DaycareBookingPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { id } = useParams();
  const [sp] = useSearchParams();
  const isNew = sp.get('new') === '1';
  const { pets, userId } = useCustomer();
  const { daycarePricing, packages } = usePricingTables();
  const booking = useRow<Row>('daycare_bookings', id);
  const { rows: details } = useTable<DaycareBookingPetRow>('daycare_booking_pets', { where: { daycare_booking_id: id ?? '__none__' } });
  const { rows: locations } = useTable<LocationRow>('locations');
  const { rows: invoices } = useTable<InvoiceRow>('invoices', { where: { source_type: 'daycare', source_id: id ?? '__none__' } });
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!booking) return <CgdPage title={t('cgd.daycare')} backTo="/app/daycare/bookings"><EmptyState icon="sun" title="Booking not found" action={<Link to="/app/daycare/bookings"><Button variant="secondary">All days</Button></Link>} /></CgdPage>;
  const location = locations.find((l) => l.id === booking.location_id);
  const invoice = invoices[0];
  const cancellable = CUSTOMER_CANCELLABLE.includes(booking.status as BookingStatus);
  const chosen = booking.pet_ids.map((pid) => pets.find((p) => p.id === pid)).filter((p): p is NonNullable<typeof p> => !!p);
  const hours = hoursBetween(booking.check_in_time, booking.check_out_time);
  const fit = groomingFitMinutes(chosen.map((p) => p.sizeTier), packages, 60);
  const canGroom = fit != null && hours * 60 >= fit && ['requested', 'pending_vaccines', 'confirmed'].includes(booking.status);
  const nameFor = (pid: string) => pets.find((p) => p.id === pid)?.name ?? 'Pet';
  const again = () => { writeDraft('daycare', { ...EMPTY_DAYCARE, petIds: booking.pet_ids, locationId: booking.location_id ?? null, checkIn: booking.check_in_time, checkOut: booking.check_out_time, details: Object.fromEntries(details.map((d) => [d.pet_id, { fleaMedication: d.flea_medication, fleaBrand: d.flea_brand ?? '', fleaDate: d.flea_date ?? '', medicalAlert: d.medical_alert ?? '' }])) }); nav('/app/daycare/new'); };
  const addGroom = () => { writeDraft('grooming', { ...EMPTY_GROOMING, locationId: booking.location_id ?? null, date: booking.date, items: booking.pet_ids.map((petId) => ({ petId, packageId: null, addonIds: [] })), notes: `During daycare ${booking.code}` }); nav('/app/grooming/new'); };
  const cancel = async () => { setBusy(true); await cancelDaycareBooking(data, booking, userId); setBusy(false); setConfirm(false); toast({ tone: 'info', title: 'Daycare cancelled' }); };

  return (
    <CgdPage title={isNew ? 'You\'re booked!' : `Daycare ${booking.code}`} backTo={isNew ? '/app/daycare' : '/app/daycare/bookings'}>
      {isNew && <div className="cgd-success"><span className="cgd-success-icon"><Icon name="check" size={28} strokeWidth={2.5} /></span><h2>{booking.status === 'pending_vaccines' ? 'Request received' : 'Daycare confirmed'}</h2><p className="muted small">{booking.status === 'pending_vaccines' ? 'We confirm as soon as the vaccines are verified.' : booking.status === 'requested' ? 'The front desk will confirm shortly. Pay at drop-off.' : 'See you at drop-off. Bring a leash and their favourite treat.'}</p></div>}
      <DaycareDayCard highlight={isNew} code={booking.code} date={booking.date} checkIn={booking.check_in_time} checkOut={booking.check_out_time} itemLabel={daycarePricing.find((p) => p.item === booking.item)?.name ?? booking.item} petNames={booking.pet_ids.map(nameFor)} status={booking.status} paymentStatus={booking.payment_status} total={booking.total} locationName={location?.short_name} />
      {booking.status === 'pending_vaccines' && <Notice tone="warn">Pending verification: {chosen.filter((p) => !p.vaccinesOk).map((p) => `${p.name}: ${p.vaccinesMissing.join(', ')}`).join(' · ') || 'required vaccines'}. <Link to="/app/pets">Upload proof under Pets</Link>.</Notice>}
      {canGroom && <Card padding="sm" tint><div className="row-between wrap"><div><strong>Add a groom during daycare?</strong><p className="xs muted">A {hours} h day leaves time for a Grooming & Spa package. {booking.notes?.includes('groom') ? 'You asked for one when booking.' : ''}</p></div><Button size="sm" icon="scissors" onClick={addGroom}>Book grooming</Button></div></Card>}
      <Card padding="md">
        <dl className="cgd-kvs">
          <div className="cgd-kv"><dt>Status</dt><dd>{BOOKING_STATUS_CUSTOMER_LABEL[booking.status as BookingStatus] ?? booking.status}</dd></div>
          <div className="cgd-kv"><dt>Location</dt><dd>{location ? `${location.name}, ${location.address}` : '—'}</dd></div>
          <div className="cgd-kv"><dt>Payment</dt><dd>{booking.payment_status === 'paid' ? 'Paid' : `Due ${fmtMoney(booking.total)} at drop-off`}</dd></div>
          {invoice && <div className="cgd-kv"><dt>Invoice</dt><dd><code>{invoice.number}</code></dd></div>}
          {booking.notes && <div className="cgd-kv"><dt>Notes</dt><dd>{booking.notes}</dd></div>}
        </dl>
      </Card>
      {details.length > 0 && <Card padding="md"><div className="field-label" style={{ marginBottom: 8 }}>Pet details</div><dl className="cgd-kvs">{details.map((d) => <div key={d.id} className="cgd-kv"><dt>{nameFor(d.pet_id)}</dt><dd>{d.flea_medication ? `Flea med: ${d.flea_brand ?? 'yes'}${d.flea_date ? ` (${d.flea_date})` : ''}` : 'No flea medication'}{d.medical_alert ? ` · ${d.medical_alert}` : ''}</dd></div>)}</dl></Card>}
      {invoice && <Card padding="md"><div className="field-label" style={{ marginBottom: 8 }}>Totals</div><ServiceQuoteLines lines={invoice.lines.map((l) => ({ ...l, kind: l.amount < 0 ? 'discount' as const : l.label.toLowerCase().includes('tax') ? 'tax' as const : l.label.toLowerCase().includes('fee') ? 'fee' as const : 'service' as const }))} total={invoice.total} /></Card>}
      <div className="cgd-inline-actions">
        <Button variant="secondary" icon="refresh" onClick={again}>{t('cgd.bookAgain')}</Button>
        {cancellable ? <Button variant="danger" icon="close" onClick={() => setConfirm(true)}>{t('cgd.cancelBooking')}</Button> : !['cancelled', 'checked_out', 'no_show'].includes(booking.status) && <Link to="/app/chat"><Button variant="secondary" icon="message" block>{t('cgd.messageDesk')}</Button></Link>}
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Cancel this daycare day?" size="sm" footer={<><Button variant="secondary" onClick={() => setConfirm(false)}>Keep it</Button><Button variant="danger" loading={busy} onClick={cancel}>Cancel booking</Button></>}>
        <p className="muted">{booking.code} on {booking.date} for {booking.pet_ids.map(nameFor).join(' & ')} will be cancelled.</p>
      </Modal>
    </CgdPage>
  );
}
