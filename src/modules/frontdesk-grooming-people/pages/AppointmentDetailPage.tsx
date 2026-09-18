import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { Button } from '../../../components/atom/Button/Button';
import { Badge, toneFor } from '../../../components/atom/Badge/Badge';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { Icon } from '../../../components/atom/Icon/Icon';
import { CustomerSummaryCard } from '../../../components/molecule/CustomerSummaryCard/CustomerSummaryCard';
import { GroomStatusBadge } from '../../../components/molecule/GroomStatusBadge/GroomStatusBadge';
import { PetVaccineChip } from '../../../components/molecule/PetVaccineChip/PetVaccineChip';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { PinApprovalModal, type PinApprovalRequest } from '../../../components/organism/PinApprovalModal/PinApprovalModal';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { AppointmentRow, InvoiceRow } from '../../../data/schema/core';
import { useAppointments } from '../hooks';
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_TRANSITIONS, TRANSITION_VERB, appointmentNeedsPin, fmtDate, fmtMoney, fmtRange, fmtTime, fullName, quoteForAppointment, sizeLabel, writeAudit, type AppointmentStatus } from '../lib';
import '../module.css';

/** F-34 Appointment detail (Figma booking detail for a grooming service). */
export function AppointmentDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { locationId, location } = useLocation();
  const { views, packages, addons, fees, taxes } = useAppointments();
  const { rows: invoices } = useTable<InvoiceRow>('invoices', { where: { source_type: 'appointment', source_id: id ?? '' } });
  const v = views.find((x) => x.ap.id === id);
  const [pin, setPin] = useState<{ request: PinApprovalRequest; to: AppointmentStatus } | null>(null);
  const quote = useMemo(() => (v ? quoteForAppointment(v.ap, packages, addons, fees, taxes, v.extras) : null), [v, packages, addons, fees, taxes]);
  if (!v || !quote) return <div className="page"><PageHeader code="F-34" title="Appointment" backTo="/desk/grooming" /><EmptyState icon="scissors" title="Appointment not found" body="It may belong to another location or have been deleted." action={<Button onClick={() => nav('/desk/grooming')}>Back to the day view</Button>} /></div>;
  const { ap, customer, pet, pkg, groomer, extras, vaccine } = v;
  const invoice = invoices[0];
  const apply = async (to: AppointmentStatus, approvalId?: string) => {
    await data.update<AppointmentRow>('appointments', ap.id, { status: to });
    await writeAudit(data, user, 'appointment.status', 'appointments', ap.id, { status: [ap.status, to], approval_id: approvalId ?? null }, locationId);
    toast({ tone: 'success', title: `${ap.code} → ${APPOINTMENT_STATUS_LABEL[to]}` });
  };
  const transition = (to: AppointmentStatus) => {
    if (appointmentNeedsPin(ap.status, to)) setPin({ to, request: { action: 'appointment.status', title: 'Manager approval needed', description: `${ap.code}: ${APPOINTMENT_STATUS_LABEL[ap.status as AppointmentStatus]} → ${APPOINTMENT_STATUS_LABEL[to]}`, subjectTable: 'appointments', subjectId: ap.id, details: { from: ap.status, to } } });
    else apply(to);
  };
  const moves = APPOINTMENT_TRANSITIONS[ap.status as AppointmentStatus] ?? [];
  const services = quote.lines.filter((l) => l.kind === 'service' || l.kind === 'addon');
  const extrasLines = quote.lines.filter((l) => l.kind === 'discount' || l.kind === 'tax' || l.kind === 'fee');
  return (
    <div className="page stack">
      <PageHeader code="F-34" title={`Appointment ${ap.code}`} backTo="/desk/grooming" eyebrow={<GroomStatusBadge status={ap.status} size="sm" />} subtitle={`${fmtDate(ap.starts_at, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · ${fmtRange(ap)} · ${location.short_name}`}
        actions={<div className="fgp-actions">{can('appointments.write') && ap.status !== 'done' && <Button variant="secondary" icon="edit" onClick={() => nav(`/desk/grooming/${ap.id}/edit`)}>Edit</Button>}<Button variant="secondary" icon="book" onClick={() => nav(`/desk/invoices/${invoice?.id ?? ap.id}`)}>{invoice ? invoice.number : 'Invoice preview'}</Button></div>} />
      <CustomerSummaryCard name={fullName(customer)} email={customer?.email} mobile={customer?.mobile} to={customer ? `/desk/customers/${customer.id}` : undefined} status={customer?.status} balance={customer?.balance}
        actions={<div className="row wrap" style={{ gap: 16 }}>
          <div className="fgp-fact"><span className="eyebrow">Pet</span><Link to={pet ? `/desk/pets/${pet.id}` : '#'} className="row" style={{ gap: 6, textDecoration: 'none', color: 'inherit' }}><Avatar name={pet?.name ?? '?'} kind="pet" size={24} /><strong>{pet?.name ?? 'Unknown'}</strong></Link></div>
          <div className="fgp-fact"><span className="eyebrow">Breed</span><strong>{pet?.breed ?? 'Mixed'}</strong></div>
          <div className="fgp-fact"><span className="eyebrow">Size</span><strong>{sizeLabel[ap.size ?? ''] ?? ap.size ?? '—'}{pet?.weight_lbs ? ` · ${pet.weight_lbs} lb` : ''}</strong></div>
          <div className="fgp-fact"><span className="eyebrow">Vaccines</span>{vaccine && <PetVaccineChip overall={vaccine.overall} detail={`${vaccine.requiredOk}/${vaccine.requiredTotal}`} />}</div>
        </div>} />
      <Card>
        <div className="fgp-facts">
          <div className="fgp-fact"><span className="eyebrow">Date</span><strong>{fmtDate(ap.starts_at)}</strong></div>
          <div className="fgp-fact"><span className="eyebrow">Time</span><strong>At {fmtTime(ap.starts_at)} · {ap.duration_min} min</strong></div>
          <div className="fgp-fact"><span className="eyebrow">Groomer</span><strong>{groomer ? <span className="row" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: groomer.color ?? 'var(--color-border)' }} />{groomer.name}</span> : 'Unassigned'}</strong></div>
          <div className="fgp-fact"><span className="eyebrow">Payment status</span><Badge tone={toneFor(ap.payment_status)}>{ap.payment_status}</Badge></div>
          <div className="fgp-fact"><span className="eyebrow">Contact number</span><strong>{customer?.mobile ?? '—'}</strong></div>
          <div className="fgp-fact"><span className="eyebrow">Reason</span><strong>Grooming & Spa{pkg ? ` · ${pkg.name}` : ''}</strong></div>
          {extras?.groom_style && <div className="fgp-fact"><span className="eyebrow">Groom style</span><strong>{extras.groom_style}</strong></div>}
          {extras && <div className="fgp-fact"><span className="eyebrow">Reminder</span><strong>{extras.reminder ? 'On' : 'Off'}{extras.payment_method ? ` · pays by ${extras.payment_method}` : ''}</strong></div>}
          {(extras?.pickup_at || extras?.delivery_at) && <div className="fgp-fact"><span className="eyebrow">Pickup / delivery</span><strong>{extras.pickup_at ? fmtDate(extras.pickup_at) : '—'} / {extras.delivery_at ? fmtDate(extras.delivery_at) : '—'}</strong></div>}
        </div>
      </Card>
      <div className="fgp-two">
        <Card header={<h3>Additional information</h3>}>
          {ap.notes ? <p className="small" style={{ margin: 0 }}>{ap.notes}</p> : <p className="muted small" style={{ margin: 0 }}>No note on this appointment.</p>}
          {(pet?.attributes?.length || pet?.medical_conditions || pet?.allergies) && (
            <div className="stack-sm" style={{ marginTop: 12 }}>
              {pet?.attributes?.length ? <div className="fgp-taglist">{pet.attributes.map((a) => <Badge key={a} tone="warn" size="sm">{a}</Badge>)}</div> : null}
              {pet?.medical_conditions && <p className="xs muted" style={{ margin: 0 }}><strong>Medical:</strong> {pet.medical_conditions}</p>}
              {pet?.allergies && <p className="xs muted" style={{ margin: 0 }}><strong>Allergies:</strong> {pet.allergies}</p>}
            </div>
          )}
          <h4 style={{ margin: '16px 0 8px' }}>Status</h4>
          <div className="fgp-status-actions">
            <GroomStatusBadge status={ap.status} />
            {can('appointments.write') && moves.map((to) => <Button key={to} size="sm" variant={to === 'cancelled' || to === 'no_show' ? 'danger' : to === 'requested' ? 'secondary' : 'primary'} icon={appointmentNeedsPin(ap.status, to) ? 'lock' : undefined} onClick={() => transition(to)}>{TRANSITION_VERB[to]}</Button>)}
            {moves.length === 0 && <span className="xs muted">Final state</span>}
          </div>
          {customer && <div className="fgp-actions" style={{ marginTop: 16 }}><Button size="sm" variant="ghost" icon="message" onClick={() => nav(`/desk/messages?customer=${customer.id}`)}>Message {customer.first_name}</Button>{pet && <Button size="sm" variant="ghost" icon="shield" onClick={() => nav(`/desk/pets/${pet.id}`)}>Vaccines</Button>}</div>}
        </Card>
        <Card header={<h3>Your appointment</h3>}>
          <div className="fgp-lines">
            {services.map((l, i) => <div className="fgp-line" key={i}><span className="fgp-line-icon"><Icon name={l.kind === 'addon' ? 'sparkle' : 'scissors'} size={20} /></span><span className="fgp-line-name"><strong>{l.label}</strong>{l.kind === 'service' && pkg?.inclusions && <span className="xs muted">{pkg.inclusions}</span>}</span><span className="fgp-line-amt">{fmtMoney(l.amount)}</span></div>)}
            {services.length === 0 && <p className="muted small">No package or add-ons on this appointment.</p>}
          </div>
          <div className="fgp-sub"><span>Sub total</span><span>{fmtMoney(quote.subtotal)}</span></div>
          {extrasLines.map((l, i) => <div className="fgp-sub" key={i}><span>{l.label}</span><span>{fmtMoney(l.amount)}</span></div>)}
          <div className="fgp-sub is-total"><span>Total</span><span>{fmtMoney(quote.total)}</span></div>
          {Math.abs(quote.total - ap.total) > 0.011 && <p className="xs muted" style={{ margin: '8px 8px 0' }}>Stored at booking time: {fmtMoney(ap.total)} (prices changed since).</p>}
          {quote.notes.map((n) => <p key={n} className="xs faint" style={{ margin: '4px 8px 0' }}>{n}</p>)}
        </Card>
      </div>
      <PinApprovalModal open={!!pin} request={pin?.request ?? null} onClose={() => setPin(null)} onApproved={(a) => { if (pin) apply(pin.to, a.id); setPin(null); }} />
    </div>
  );
}
