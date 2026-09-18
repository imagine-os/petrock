import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../tenant/LocationProvider';
import { useSession } from '../../auth/SessionProvider';
import { useData, useTable } from '../../data/DataContext';
import type { AddonRow, AppointmentRow, CustomerRow, EmployeeRow, PackageRow, PetRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import { APPOINTMENT_STATUS } from '../../data/schema/core';
import { fmtMoney } from '../../pricing/engine';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { ReservationDayNav } from '../../components/molecule/ReservationDayNav/ReservationDayNav';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Select } from '../../components/atom/Select/Select';
import { Badge, toneFor } from '../../components/atom/Badge/Badge';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Button } from '../../components/atom/Button/Button';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Modal } from '../../components/organism/Modal/Modal';
import { RadioGroup } from '../../components/atom/RadioGroup/RadioGroup';
import { AppointmentBoard, type BoardCard, type BoardColumn } from '../../components/organism/AppointmentBoard/AppointmentBoard';
import { BookingInfoGrid } from '../../components/molecule/BookingInfoGrid/BookingInfoGrid';
import { PetVaccineStatus } from '../../components/molecule/PetVaccineStatus/PetVaccineStatus';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { petVaccineSummary } from './lib/vaccines';
import { addDaysIso, fmtDateTime, fmtDay, fmtTime, todayIso, weekStart } from './lib/dates';
import { useBookingActions } from './lib/useBookingActions';
import { ViewSwitch } from './ReservationsTablePage';
import './frontdesk-reservations.css';

const CLOSED = 'closed';
const COLUMNS: BoardColumn[] = [
  { key: 'requested', label: 'Requested', tone: 'info' }, { key: 'confirmed', label: 'Confirmed', tone: 'success' }, { key: 'in_progress', label: 'In progress', tone: 'warn' }, { key: 'done', label: 'Done', tone: 'neutral' },
  { key: CLOSED, label: 'Cancelled / no show', tone: 'danger', locked: true, hint: 'Cancelling or no-show needs a manager PIN (R-X06)' },
];
const STATUS_LABEL: Record<string, string> = { requested: 'Requested', confirmed: 'Confirmed', in_progress: 'In progress', done: 'Done', cancelled: 'Cancelled', no_show: 'No show' };

/** F-14 - Grooming & Spa kanban by status (D-008: Spa gets Table + Board). */
export function BoardPage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { location, scope, locationId } = useLocation();
  const actions = useBookingActions();
  const { rows: appts } = useTable<AppointmentRow>('appointments', { where: scope });
  const { rows: customers } = useTable<CustomerRow>('customers');
  const { rows: pets } = useTable<PetRow>('pets');
  const { rows: employees } = useTable<EmployeeRow>('employees', { where: scope });
  const { rows: packages } = useTable<PackageRow>('packages');
  const { rows: addons } = useTable<AddonRow>('addons');
  const { rows: records } = useTable<VaccineRecordRow>('vaccine_records');
  const { rows: vtypes } = useTable<VaccineTypeRow>('vaccine_types');
  const [day, setDay] = useState(todayIso());
  const [span, setSpan] = useState<'day' | 'week'>('day');
  const [groomer, setGroomer] = useState('');
  const [pkg, setPkg] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelFor, setCancelFor] = useState<{ appt: AppointmentRow; to: 'cancelled' | 'no_show' } | null>(null);

  const from = span === 'day' ? day : weekStart(day), to = span === 'day' ? addDaysIso(day, 1) : addDaysIso(weekStart(day), 7);
  const inView = useMemo(() => appts.filter((a) => { const d = a.starts_at.slice(0, 10); return d >= from && d < to && (!groomer || a.groomer_id === groomer) && (!pkg || a.package_id === pkg); }), [appts, from, to, groomer, pkg]);
  const petOf = (a: AppointmentRow) => pets.find((p) => p.id === a.pet_id);
  const custOf = (a: AppointmentRow) => customers.find((c) => c.id === a.customer_id);
  const groomerOf = (a: AppointmentRow) => employees.find((e) => e.id === a.groomer_id);
  const pkgOf = (a: AppointmentRow) => packages.find((p) => p.id === a.package_id);
  const cards = useMemo<BoardCard[]>(() => inView.map((a) => { const p = petOf(a), c = custOf(a), g = groomerOf(a), k = pkgOf(a); const v = p ? petVaccineSummary(p.id, records, vtypes) : null; return {
    id: a.id, column: a.status === 'cancelled' || a.status === 'no_show' ? CLOSED : a.status, time: fmtTime(a.starts_at), sortKey: a.starts_at, title: `${p?.name ?? 'Pet'} · ${p?.breed ?? ''}`, subtitle: c ? `${c.last_name}, ${c.first_name}` : undefined, accent: g?.color ?? null,
    meta: <><Badge size="sm">{k?.name.replace(' Groom', '') ?? 'Package'} · {a.size}</Badge><Badge size="sm" tone="neutral">{a.duration_min} min</Badge>{g && <Badge size="sm" tone="primary">{g.display_name ?? g.name}</Badge>}{span === 'week' && <Badge size="sm">{fmtDay(a.starts_at.slice(0, 10))}</Badge>}</>,
    flags: <>{v && !v.ok && <PetVaccineStatus compact summary={v} petName={p?.name} />}{a.payment_status !== 'paid' && a.status !== 'cancelled' && <Badge size="sm" tone="warn" title="Balance due">{fmtMoney(a.total)}</Badge>}{a.status === 'no_show' && <Badge size="sm" tone="danger">no show</Badge>}</>,
  }; }), [inView, pets, customers, employees, packages, records, vtypes, span]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (a: AppointmentRow, status: string, approvedBy?: string) => {
    await data.update<AppointmentRow>('appointments', a.id, { status, payment_status: status === 'cancelled' && a.payment_status === 'paid' ? 'refunded' : a.payment_status });
    await data.insert('audit_log', { location_id: locationId, user_id: user.id, user_name: user.name, action: 'appointment.status', table_name: 'appointments', row_id: a.id, diff: { from: a.status, to: status, approvedBy: approvedBy ?? null } });
    toast({ tone: status === 'cancelled' || status === 'no_show' ? 'warn' : 'success', title: `${a.code} → ${STATUS_LABEL[status]}` });
  };
  const onMove = (card: BoardCard, col: string) => {
    const a = appts.find((x) => x.id === card.id); if (!a) return;
    if (!can('appointments.write')) { toast({ tone: 'danger', title: 'No permission to change appointments' }); return; }
    if (col === CLOSED) { setCancelFor({ appt: a, to: 'cancelled' }); return; }
    if (a.status === 'done' && col !== 'done') { toast({ tone: 'danger', title: 'Done appointments stay done', body: 'Rebook instead.' }); return; }
    void setStatus(a, col);
  };
  const confirmCancel = () => { if (!cancelFor) return; const { appt, to } = cancelFor; setCancelFor(null);
    actions.withApproval({ action: 'appointment.status', title: `${STATUS_LABEL[to]} · ${appt.code}`, description: `Marking a Grooming & Spa appointment ${STATUS_LABEL[to].toLowerCase()} needs a manager PIN (R-X06).`, subjectTable: 'appointments', subjectId: appt.id, details: { from: appt.status, to } }, (approval) => setStatus(appt, to, approval?.approved_by_name)); };

  const open = appts.find((a) => a.id === openId) ?? null;
  const openPet = open ? petOf(open) : undefined, openCust = open ? custOf(open) : undefined, openPkg = open ? pkgOf(open) : undefined, openGroomer = open ? groomerOf(open) : undefined;
  const openVacc = openPet ? petVaccineSummary(openPet.id, records, vtypes) : null;
  const live = inView.filter((a) => !['cancelled', 'no_show'].includes(a.status));
  const groomers = employees.filter((e) => e.is_groomer);

  return (
    <div className="fdr-page">
      <PageHeader title="Grooming & Spa board" subtitle={`${location.name} · ${span === 'day' ? fmtDay(day) : `week of ${fmtDay(weekStart(day))}`} · ${inView.length} appointments`} code="F-14"
        actions={<div className="fdr-toolbar"><ViewSwitch value="board" /><ReservationDayNav value={day} onChange={setDay} step={span === 'day' ? 1 : 7} rangeDays={span === 'week' ? 7 : undefined} /><SegmentedControl size="sm" ariaLabel="Span" value={span} onChange={(v) => { setSpan(v); if (v === 'week') setDay(weekStart(day)); }} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]} /><Button variant="secondary" icon="scissors" onClick={() => nav('/desk/grooming')}>Day view</Button></div>}>
        <div className="fdr-toolbar">
          <Select size="sm" aria-label="Groomer" placeholder="All groomers" value={groomer} onChange={(e) => setGroomer(e.target.value)} options={groomers.map((g) => ({ value: g.id, label: g.display_name ?? g.name }))} />
          <Select size="sm" aria-label="Package" placeholder="All packages" value={pkg} onChange={(e) => setPkg(e.target.value)} options={packages.map((p) => ({ value: p.id, label: p.name }))} />
        </div>
      </PageHeader>

      <div className="fdr-stats">
        <StatTile label="Appointments" value={live.length} icon="scissors" hint={span === 'day' ? 'today' : 'this week'} />
        <StatTile label="In progress" value={live.filter((a) => a.status === 'in_progress').length} icon="clock" />
        <StatTile label="Done" value={live.filter((a) => a.status === 'done').length} icon="check" />
        <StatTile label="Booked revenue" value={fmtMoney(live.reduce((s, a) => s + a.total, 0))} icon="dollar" hint={`${fmtMoney(live.filter((a) => a.payment_status !== 'paid').reduce((s, a) => s + a.total, 0))} unpaid`} />
        <StatTile label="Groomers" value={groomers.length} icon="users" hint="at this location (R-E10: 2 simultaneous)" />
      </div>

      {inView.length === 0 ? <EmptyState icon="scissors" title="No appointments in this range" body="Try another day or the week view." /> : <AppointmentBoard columns={COLUMNS} cards={cards} onMove={onMove} onCardClick={(c) => setOpenId(c.id)} selectedId={openId} />}

      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open ? `${open.code} · ${openPet?.name ?? ''}` : ''} footer={open && <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
        <Select size="sm" aria-label="Status" value={open.status} onChange={(e) => { const to = e.target.value; if (to === 'cancelled' || to === 'no_show') setCancelFor({ appt: open, to }); else void setStatus(open, to); }} options={APPOINTMENT_STATUS.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
        <Button variant="secondary" onClick={() => setOpenId(null)}>Close</Button></div>}>
        {open && (
          <div className="stack">
            <div className="fdr-customer"><Avatar name={openPet?.name ?? 'Pet'} kind="pet" shape="rounded" size={48} /><div className="fdr-customer-text"><span className="fdr-customer-name">{openPet?.name}</span><span className="small muted">{openPet?.breed} · {openPet?.weight_lbs} lb · size {open.size}</span></div><Badge tone={toneFor(open.status)}>{STATUS_LABEL[open.status]}</Badge></div>
            <BookingInfoGrid columns={2} dense items={[{ label: 'When', value: fmtDateTime(open.starts_at) }, { label: 'Duration', value: `${open.duration_min} min` }, { label: 'Groomer', value: openGroomer?.display_name ?? openGroomer?.name ?? 'Unassigned', tone: openGroomer ? 'default' : 'warn' }, { label: 'Package', value: openPkg?.name ?? '—' }, { label: 'Customer', value: openCust ? `${openCust.first_name} ${openCust.last_name}` : '—' }, { label: 'Mobile', value: openCust?.mobile }, { label: 'Total', value: fmtMoney(open.total) }, { label: 'Payment', value: open.payment_status, tone: open.payment_status === 'paid' ? 'success' : 'warn' }]} />
            {openPkg?.inclusions && <p className="small muted">{openPkg.inclusions}</p>}
            <div className="row wrap" style={{ gap: 4 }}>{(open.addon_ids ?? []).map((id) => addons.find((a) => a.id === id)).filter(Boolean).map((a) => <Badge key={a!.id} size="sm">{a!.name} · {fmtMoney(a!.price)}</Badge>)}{(open.addon_ids ?? []).length === 0 && <span className="xs muted">No add-ons</span>}</div>
            {openVacc && <PetVaccineStatus summary={openVacc} />}
            {(open as unknown as { notes?: string | null }).notes && <p className="small" style={{ fontStyle: 'italic' }}>{(open as unknown as { notes?: string | null }).notes}</p>}
            {open.booking_id && <Button size="sm" variant="secondary" icon="bed" onClick={() => nav(`/desk/reservations/${open.booking_id}`)}>Linked hotel stay</Button>}
            <p className="xs faint">Editing the appointment (time, groomer, add-ons) lives in the grooming module (F-30s).</p>
          </div>
        )}
      </Drawer>

      <Modal open={!!cancelFor} onClose={() => setCancelFor(null)} title={cancelFor ? `Close ${cancelFor.appt.code}` : ''} size="sm" footer={<><Button variant="secondary" onClick={() => setCancelFor(null)}>Back</Button><Button icon="lock" variant="danger" onClick={confirmCancel}>Continue to PIN</Button></>}>
        {cancelFor && <RadioGroup cards name="closeAs" value={cancelFor.to} onChange={(v) => setCancelFor({ ...cancelFor, to: v as 'cancelled' | 'no_show' })} options={[{ value: 'cancelled', label: 'Cancelled', description: 'Customer cancelled; paid amounts are marked refunded.' }, { value: 'no_show', label: 'No show', description: 'Customer did not come.' }]} />}
      </Modal>
      {actions.modal}
    </div>
  );
}
