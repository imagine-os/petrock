import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { GroomingDateNav } from '../../../components/molecule/GroomingDateNav/GroomingDateNav';
import { Button } from '../../../components/atom/Button/Button';
import { Select } from '../../../components/atom/Select/Select';
import { GroomStatusBoard, type GroomBoardItem } from '../../../components/organism/GroomStatusBoard/GroomStatusBoard';
import { GroomAppointmentCard } from '../../../components/molecule/GroomAppointmentCard/GroomAppointmentCard';
import { PinApprovalModal, type PinApprovalRequest } from '../../../components/organism/PinApprovalModal/PinApprovalModal';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { AppointmentRow } from '../../../data/schema/core';
import { useAppointments, type AppointmentView } from '../hooks';
import { GroomingViewToggle, useDayParam } from './GroomingViewToggle';
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_TRANSITIONS, appointmentNeedsPin, fmtTime, writeAudit, type AppointmentStatus } from '../lib';
import '../module.css';

const COLUMNS = [{ key: 'requested', label: 'Requested', hint: 'From the app or phone; confirm once vaccines are OK.' }, { key: 'confirmed', label: 'Confirmed' }, { key: 'in_progress', label: 'In progress' }, { key: 'done', label: 'Done' }, { key: 'cancelled', label: 'Cancelled', collapsedByDefault: true }, { key: 'no_show', label: 'No show', collapsedByDefault: true }];

/** F-31 Grooming board (kanban by status). */
export function GroomingBoardPage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { location, locationId } = useLocation();
  const [day, setDay] = useDayParam();
  const [groomerFilter, setGroomerFilter] = useState('');
  const [pin, setPin] = useState<{ request: PinApprovalRequest; view: AppointmentView; to: AppointmentStatus } | null>(null);
  const { views, groomers } = useAppointments(day);
  const list = useMemo(() => views.filter((v) => !groomerFilter || v.ap.groomer_id === groomerFilter), [views, groomerFilter]);
  const byId = useMemo(() => new Map(list.map((v) => [v.ap.id, v])), [list]);
  const items = useMemo<GroomBoardItem[]>(() => list.map((v) => ({ id: v.ap.id, status: v.ap.status, sortKey: v.ap.starts_at, node: <GroomAppointmentCard label={v.label} status={v.ap.status} flags={v.flags} color={v.groomer?.color} timeLabel={`${fmtTime(v.ap.starts_at)} · ${v.groomer?.display_name ?? 'Unassigned'}`} subtitle={v.addonNames.join(', ') || undefined} onClick={() => nav(`/desk/grooming/${v.ap.id}`)} /> })), [list, nav]);

  const apply = async (v: AppointmentView, to: AppointmentStatus, approvalId?: string) => {
    await data.update<AppointmentRow>('appointments', v.ap.id, { status: to });
    await writeAudit(data, user, 'appointment.status', 'appointments', v.ap.id, { status: [v.ap.status, to], approval_id: approvalId ?? null }, locationId);
    toast({ tone: 'success', title: `${v.ap.code} → ${APPOINTMENT_STATUS_LABEL[to]}` });
  };
  const onMove = (item: GroomBoardItem, to: string) => {
    const v = byId.get(item.id); if (!v) return;
    if (!can('appointments.write')) { toast({ tone: 'warn', title: 'You cannot change appointment status' }); return; }
    const target = to as AppointmentStatus;
    if (appointmentNeedsPin(v.ap.status, target)) setPin({ view: v, to: target, request: { action: 'appointment.status', title: 'Manager approval needed', description: `${v.ap.code}: ${APPOINTMENT_STATUS_LABEL[v.ap.status as AppointmentStatus]} → ${APPOINTMENT_STATUS_LABEL[target]}`, subjectTable: 'appointments', subjectId: v.ap.id, details: { from: v.ap.status, to: target } } });
    else apply(v, target);
  };
  const allowed = (item: GroomBoardItem) => (APPOINTMENT_TRANSITIONS[item.status as AppointmentStatus] ?? []).map((to) => ({ to, label: APPOINTMENT_STATUS_LABEL[to], pin: appointmentNeedsPin(item.status, to) }));

  return (
    <div className="page stack">
      <PageHeader code="F-31" title="Grooming board" subtitle={`${location.short_name} · drag between columns or use "Move to"; locked moves ask for a manager PIN`}
        actions={can('appointments.write') ? <Button icon="plus" onClick={() => nav(`/desk/grooming/new?day=${day}`)}>New groom booking</Button> : undefined} />
      <div className="fgp-toolbar">
        <GroomingDateNav value={day} onChange={setDay}>
          <Select size="sm" aria-label="Groomer" placeholder="All groomers" value={groomerFilter} onChange={(e) => setGroomerFilter(e.target.value)} options={groomers.map((g) => ({ value: g.id, label: g.display_name ?? g.name }))} />
        </GroomingDateNav>
        <GroomingViewToggle day={day} />
      </div>
      <GroomStatusBoard columns={COLUMNS} items={items} allowedMoves={can('appointments.write') ? allowed : () => []} onMove={onMove} />
      <PinApprovalModal open={!!pin} request={pin?.request ?? null} onClose={() => setPin(null)} onApproved={(a) => { if (pin) apply(pin.view, pin.to, a.id); setPin(null); }} />
    </div>
  );
}
