import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { AppointmentRow, EmployeeRow, InvoiceRow, LocationRow } from '../../data/schema/core';
import type { GroomingOrderRow } from '../../data/schema/customer-grooming-daycare';
import { fmtMoney } from '../../pricing/engine';
import { BOOKING_STATUS_CUSTOMER_LABEL, type BookingStatus } from '../../domain/booking';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Modal } from '../../components/organism/Modal/Modal';
import { GroomingOrderCard } from '../../components/molecule/GroomingOrderCard/GroomingOrderCard';
import { ServiceQuoteLines } from '../../components/molecule/ServiceQuoteLines/ServiceQuoteLines';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomer } from './useCustomer';
import { usePricingTables } from './pricing';
import { writeDraft, EMPTY_GROOMING } from './draft';
import { cancelGroomingOrder, CUSTOMER_CANCELLABLE } from './actions';
import { orderPetLines } from './orderLines';
import { CgdPage, Notice } from './layout';

/** C-55 Order detail & confirmation: status, per-pet lines, totals, invoice; re-create (R-G16) and cancel-before-confirmation (R-X14). */
export function GroomingOrderPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { id } = useParams();
  const [sp] = useSearchParams();
  const isNew = sp.get('new') === '1';
  const { pets, userId } = useCustomer();
  const { packages, addons } = usePricingTables();
  const order = useRow<GroomingOrderRow>('grooming_orders', id);
  const { rows: appointments } = useTable<AppointmentRow>('appointments', { where: { id: order?.appointment_ids ?? ['__none__'] } });
  const { rows: locations } = useTable<LocationRow>('locations');
  const { rows: groomers } = useTable<EmployeeRow>('employees', { where: { is_groomer: true } });
  const invoice = useRow<InvoiceRow>('invoices', order?.invoice_id);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!order) return <CgdPage title={t('cgd.grooming')} backTo="/app/grooming/orders"><EmptyState icon="scissors" title="Order not found" body="It may belong to another account or was removed." action={<Link to="/app/grooming/orders"><Button variant="secondary">All orders</Button></Link>} /></CgdPage>;
  const location = locations.find((l) => l.id === order.location_id);
  const groomer = groomers.find((g) => g.id === order.groomer_id);
  const cancellable = CUSTOMER_CANCELLABLE.includes(order.status as BookingStatus);
  const lines = orderPetLines(order, appointments, pets, packages, addons);
  const missing = order.pet_ids.flatMap((pid) => { const p = pets.find((x) => x.id === pid); return p && !p.vaccinesOk ? [`${p.name}: ${p.vaccinesMissing.join(', ')}`] : []; });

  const recreate = () => {
    writeDraft('grooming', { ...EMPTY_GROOMING, source: 'recreate', locationId: order.location_id, groomerId: order.groomer_id, items: appointments.length ? appointments.map((a) => ({ petId: a.pet_id, packageId: a.package_id, addonIds: a.addon_ids ?? [] })) : order.pet_ids.map((petId) => ({ petId, packageId: null, addonIds: [] })) });
    nav(appointments.length && appointments.every((a) => a.package_id) ? '/app/grooming/new/time' : '/app/grooming/new');
  };
  const cancel = async () => { setBusy(true); await cancelGroomingOrder(data, order, userId); setBusy(false); setConfirm(false); toast({ tone: 'info', title: 'Booking cancelled' }); };

  return (
    <CgdPage title={isNew ? 'You\'re booked!' : `Order ${order.code}`} backTo={isNew ? '/app/grooming' : '/app/grooming/orders'}>
      {isNew && (
        <div className="cgd-success">
          <span className="cgd-success-icon"><Icon name="check" size={28} strokeWidth={2.5} /></span>
          <h2>{order.status === 'pending_vaccines' ? 'Request received' : 'Grooming & Spa confirmed'}</h2>
          <p className="muted small">{order.status === 'pending_vaccines' ? 'We will confirm as soon as the front desk verifies the vaccines.' : order.status === 'requested' ? 'The front desk will confirm shortly. Pay when you drop off.' : 'See you soon. A reminder goes out the day before.'}</p>
        </div>
      )}
      <GroomingOrderCard highlight={isNew} code={order.code} startsAt={order.starts_at} status={order.status} paymentStatus={order.payment_status} total={order.total} locationName={location?.short_name} groomerName={groomer?.display_name ?? groomer?.name ?? null} pets={lines} />
      {order.status === 'pending_vaccines' && <Notice tone="warn">Pending verification: {missing.length ? missing.join(' · ') : 'required vaccines'}. <Link to="/app/pets">Upload proof under Pets</Link>.</Notice>}
      <Card padding="md">
        <dl className="cgd-kvs">
          <div className="cgd-kv"><dt>Status</dt><dd>{BOOKING_STATUS_CUSTOMER_LABEL[order.status as BookingStatus] ?? order.status}</dd></div>
          <div className="cgd-kv"><dt>Location</dt><dd>{location ? `${location.name}, ${location.address}` : '—'}</dd></div>
          <div className="cgd-kv"><dt>Groomer</dt><dd>{groomer ? groomer.display_name ?? groomer.name : 'Assigned at the desk'}</dd></div>
          <div className="cgd-kv"><dt>Chair time</dt><dd>about {order.duration_min} min</dd></div>
          <div className="cgd-kv"><dt>Payment</dt><dd>{order.payment_method === 'card' ? 'Card in app' : 'At location'} · {order.payment_status === 'paid' ? 'paid' : 'due ' + fmtMoney(order.total)}</dd></div>
          {invoice && <div className="cgd-kv"><dt>Invoice</dt><dd><code>{invoice.number}</code></dd></div>}
          {order.notes && <div className="cgd-kv"><dt>Notes</dt><dd>{order.notes}</dd></div>}
        </dl>
      </Card>
      {invoice && <Card padding="md"><div className="field-label" style={{ marginBottom: 8 }}>Totals</div><ServiceQuoteLines lines={invoice.lines.map((l) => ({ ...l, kind: l.label.toLowerCase().includes('tax') ? 'tax' as const : l.label.toLowerCase().includes('fee') ? 'fee' as const : 'service' as const }))} total={invoice.total} /></Card>}
      <div className="cgd-inline-actions">
        <Button variant="secondary" icon="refresh" onClick={recreate}>{t('cgd.recreate')}</Button>
        {cancellable ? <Button variant="danger" icon="close" onClick={() => setConfirm(true)}>{t('cgd.cancelBooking')}</Button> : !['cancelled', 'checked_out', 'no_show'].includes(order.status) && <Link to="/app/inbox"><Button variant="secondary" icon="message" block>{t('cgd.messageDesk')}</Button></Link>}
      </div>
      {!cancellable && order.status === 'confirmed' && <p className="xs muted">Confirmed bookings are changed by the front desk (a manager approves cancellations).</p>}
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Cancel this booking?" size="sm" footer={<><Button variant="secondary" onClick={() => setConfirm(false)}>Keep it</Button><Button variant="danger" loading={busy} onClick={cancel}>Cancel booking</Button></>}>
        <p className="muted">Order {order.code} for {lines.map((l) => l.petName).join(' & ')} will be cancelled. {order.payment_status === 'paid' ? 'Card payments are refunded by the front desk.' : ''}</p>
      </Modal>
    </CgdPage>
  );
}
