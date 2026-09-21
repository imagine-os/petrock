import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { GroomingDateNav } from '../../../components/molecule/GroomingDateNav/GroomingDateNav';
import { Button } from '../../../components/atom/Button/Button';
import { Select } from '../../../components/atom/Select/Select';
import { AppointmentBoard, type BoardCard, type BoardColumn } from '../../../components/organism/AppointmentBoard/AppointmentBoard';
import { flagAlerts } from '../../../components/molecule/ScheduleCard/ScheduleCard';
import { PinApprovalModal, type PinApprovalRequest } from '../../../components/organism/PinApprovalModal/PinApprovalModal';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useT } from '../../../i18n';
import type { AppointmentRow } from '../../../data/schema/core';
import { cardChips, cardCustomer, useAppointments, type AppointmentView } from '../hooks';
import { GroomingViewToggle, useDayParam } from './GroomingViewToggle';
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_TRANSITIONS, appointmentNeedsPin, fmtTime, writeAudit, type AppointmentStatus } from '../lib';
import '../module.css';

const COLUMNS: BoardColumn[] = [
  { key: 'requested', label: 'Requested', tone: 'info', hint: 'From the app or phone; confirm once vaccines are OK.' },
  { key: 'confirmed', label: 'Confirmed', tone: 'success' },
  { key: 'in_progress', label: 'In progress', tone: 'warn' },
  { key: 'done', label: 'Done', tone: 'completed' },
  { key: 'cancelled', label: 'Cancelled', tone: 'danger', locked: true, collapsedByDefault: true },
  { key: 'no_show', label: 'No show', tone: 'danger', locked: true, collapsedByDefault: true },
];

/** F-31 Grooming board (kanban by status). */
export function GroomingBoardPage() {
  const nav = useNavigate();
  const data = useData();
  const t = useT();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { location, locationId } = useLocation();
  const [day, setDay] = useDayParam();
  const [groomerFilter, setGroomerFilter] = useState('');
  const [pin, setPin] = useState<{ request: PinApprovalRequest; view: AppointmentView; to: AppointmentStatus } | null>(null);
  const { views, groomers } = useAppointments(day);
  const list = useMemo(() => views.filter((v) => !groomerFilter || v.ap.groomer_id === groomerFilter), [views, groomerFilter]);
  const byId = useMemo(() => new Map(list.map((v) => [v.ap.id, v])), [list]);
  const cards = useMemo<BoardCard[]>(() => list.map((v) => ({
    id: v.ap.id, column: v.ap.status, sortKey: v.ap.starts_at, status: v.ap.status,
    time: fmtTime(v.ap.starts_at), assignee: v.groomer?.display_name ?? v.groomer?.name ?? t('frontdesk-grooming-people.unassigned'), assigneeColor: v.groomer?.color ?? null,
    title: v.pet?.name ?? '—', titleMeta: v.pet?.breed, subtitle: cardCustomer(v), tooltip: v.label,
    chips: cardChips(v, t), alerts: flagAlerts(v.flags),
  })), [list, t]);

  const apply = async (v: AppointmentView, to: AppointmentStatus, approvalId?: string) => {
    await data.update<AppointmentRow>('appointments', v.ap.id, { status: to });
    await writeAudit(data, user, 'appointment.status', 'appointments', v.ap.id, { status: [v.ap.status, to], approval_id: approvalId ?? null }, locationId);
    toast({ tone: 'success', title: `${v.ap.code} → ${APPOINTMENT_STATUS_LABEL[to]}` });
  };
  const onMove = (card: BoardCard, to: string) => {
    const v = byId.get(card.id); if (!v) return;
    if (!can('appointments.write')) { toast({ tone: 'warn', title: 'You cannot change appointment status' }); return; }
    const target = to as AppointmentStatus;
    if (appointmentNeedsPin(v.ap.status, target)) setPin({ view: v, to: target, request: { action: 'appointment.status', title: 'Manager approval needed', description: `${v.ap.code}: ${APPOINTMENT_STATUS_LABEL[v.ap.status as AppointmentStatus]} → ${APPOINTMENT_STATUS_LABEL[target]}`, subjectTable: 'appointments', subjectId: v.ap.id, details: { from: v.ap.status, to: target } } });
    else apply(v, target);
  };
  const allowed = (card: BoardCard) => (APPOINTMENT_TRANSITIONS[card.column as AppointmentStatus] ?? []).map((to) => ({ to, label: t('frontdesk-grooming-people.moveTo', { status: APPOINTMENT_STATUS_LABEL[to] }), locked: appointmentNeedsPin(card.column, to) }));

  return (
    <div className="page stack">
      <PageHeader code="F-31" title="Grooming board" subtitle={`${location.short_name} · ${t('frontdesk-grooming-people.boardHint')}`}
        actions={can('appointments.write') ? <Button icon="plus" onClick={() => nav(`/desk/grooming/new?day=${day}`)}>New groom booking</Button> : undefined} />
      <div className="fgp-toolbar">
        <GroomingDateNav value={day} onChange={setDay}>
          <Select size="sm" aria-label="Groomer" placeholder="All groomers" value={groomerFilter} onChange={(e) => setGroomerFilter(e.target.value)} options={groomers.map((g) => ({ value: g.id, label: g.display_name ?? g.name }))} />
        </GroomingDateNav>
        <GroomingViewToggle day={day} />
      </div>
      <AppointmentBoard columns={COLUMNS} cards={cards} ariaLabel="Grooming board"
        onCardClick={(c) => nav(`/desk/grooming/${c.id}`)}
        onMove={can('appointments.write') ? onMove : undefined}
        allowedMoves={can('appointments.write') ? allowed : () => []}
        emptyText={t('frontdesk-grooming-people.noneHere')}
        labels={{ open: t('frontdesk-grooming-people.open'), more: t('frontdesk-grooming-people.cardActions'), collapse: t('frontdesk-grooming-people.collapseColumn'), expand: t('frontdesk-grooming-people.expandColumn'), locked: t('frontdesk-grooming-people.needsPin') }} />
      <PinApprovalModal open={!!pin} request={pin?.request ?? null} onClose={() => setPin(null)} onApproved={(a) => { if (pin) apply(pin.view, pin.to, a.id); setPin(null); }} />
    </div>
  );
}
