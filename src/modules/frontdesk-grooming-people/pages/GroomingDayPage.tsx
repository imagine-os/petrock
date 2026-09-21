import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { GroomingDateNav } from '../../../components/molecule/GroomingDateNav/GroomingDateNav';
import { Button } from '../../../components/atom/Button/Button';
import { Select } from '../../../components/atom/Select/Select';
import { Chip } from '../../../components/atom/Chip/Chip';
import { Badge } from '../../../components/atom/Badge/Badge';
import { useT } from '../../../i18n';
import { GroomDayGrid, GroomDayGridLegend, type GroomDayGridColumn, type GroomDayGridItem } from '../../../components/organism/GroomDayGrid/GroomDayGrid';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { AppointmentRow } from '../../../data/schema/core';
import type { GroomerColumnPrefRow } from '../../../data/schema/frontdesk-grooming-people';
import { cardChips, cardCustomer, useAppointments } from '../hooks';
import { GroomingViewToggle, useDayParam } from './GroomingViewToggle';
import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_LABEL, combineDayTime, fmtRange, fmtTime, hoursFor, minutesOf, todayIso, writeAudit } from '../lib';
import '../module.css';

/** F-30 Grooming day view. */
export function GroomingDayPage() {
  const nav = useNavigate();
  const data = useData();
  const t = useT();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { location, locationId } = useLocation();
  const [day, setDay] = useDayParam();
  const [groomerFilter, setGroomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { views, groomers, groomingCapacity, employeeById } = useAppointments(day);
  const { rows: prefs } = useTable<GroomerColumnPrefRow>('groomer_column_prefs', { where: { user_id: user.id, location_id: locationId } });

  const columns = useMemo<GroomDayGridColumn[]>(() => groomers.map((g) => {
    const p = prefs.find((x) => x.groomer_id === g.id);
    return { id: g.id, name: g.display_name ?? g.name, color: p?.color ?? g.color ?? '#C9C9D6', hidden: p?.hidden ?? false, hours: hoursFor(g, day), order: p?.sort_order ?? 1000 + groomers.indexOf(g) };
  }).sort((a, b) => a.order - b.order).filter((c) => !groomerFilter || c.id === groomerFilter), [groomers, prefs, day, groomerFilter]);
  const hidden = columns.filter((c) => c.hidden);

  const items = useMemo<GroomDayGridItem[]>(() => views.filter((v) => !statusFilter || v.ap.status === statusFilter).map((v) => ({
    id: v.ap.id, columnId: v.ap.groomer_id, startsAt: v.ap.starts_at, durationMin: v.ap.duration_min,
    label: v.label, pet: v.pet?.name, breed: v.pet?.breed, customer: cardCustomer(v), chips: cardChips(v, t),
    subtitle: v.addonNames.join(' · ') || undefined, timeLabel: v.ap.duration_min >= 45 ? fmtRange(v.ap) : fmtTime(v.ap.starts_at), status: v.ap.status, flags: v.flags,
  })), [views, statusFilter, t]);

  const dow = new Date(`${day}T12:00:00`).getDay();
  const locHours = (location.hours as Record<string, { open: string; close: string } | null> | undefined)?.[String(dow)];
  const startHour = Math.max(6, Math.floor(minutesOf(locHours?.open ?? '07:00') / 60) - 1);
  const endHour = Math.min(22, Math.ceil(minutesOf(locHours?.close ?? '18:00') / 60) + 1);

  const upsertPref = async (groomerId: string, patch: Partial<GroomerColumnPrefRow>) => {
    const existing = prefs.find((p) => p.groomer_id === groomerId);
    if (existing) await data.update<GroomerColumnPrefRow>('groomer_column_prefs', existing.id, patch);
    else await data.insert<GroomerColumnPrefRow>('groomer_column_prefs', { location_id: locationId, user_id: user.id, groomer_id: groomerId, color: null, sort_order: columns.findIndex((c) => c.id === groomerId), hidden: false, ...patch });
  };
  const moveColumn = async (id: string, dir: -1 | 1) => {
    const visible = columns.filter((c) => !c.hidden); const i = visible.findIndex((c) => c.id === id); const j = i + dir; if (j < 0 || j >= visible.length) return;
    const order = [...visible]; [order[i], order[j]] = [order[j], order[i]];
    for (let k = 0; k < order.length; k++) await upsertPref(order[k].id, { sort_order: k });
  };
  const moveItem = async (id: string, columnId: string, hm: string) => {
    if (!can('appointments.write')) { toast({ tone: 'warn', title: 'You cannot reschedule appointments' }); return; }
    const ap = views.find((v) => v.ap.id === id)?.ap; if (!ap) return;
    const starts_at = combineDayTime(day, hm);
    await data.update<AppointmentRow>('appointments', id, { starts_at, groomer_id: columnId });
    await writeAudit(data, user, 'appointment.reschedule', 'appointments', id, { starts_at: [ap.starts_at, starts_at], groomer_id: [ap.groomer_id, columnId] }, locationId);
    toast({ tone: 'success', title: 'Rescheduled', body: `${ap.code} → ${employeeById.get(columnId)?.display_name ?? 'groomer'} at ${hm}` });
  };

  return (
    <div className="page stack">
      <PageHeader code="F-30" title="Grooming day view" subtitle={`${location.short_name} · ${groomers.length} groomer${groomers.length === 1 ? '' : 's'} · ${views.length} appointment${views.length === 1 ? '' : 's'}${groomingCapacity ? ` · capacity ${groomingCapacity} at a time` : ''}`}
        actions={can('appointments.write') ? <Button icon="plus" onClick={() => nav(`/desk/grooming/new?day=${day}`)}>New groom booking</Button> : undefined} />
      <div className="fgp-toolbar">
        <GroomingDateNav value={day} onChange={setDay}>
          <Select size="sm" aria-label="Groomer" placeholder="All groomers" value={groomerFilter} onChange={(e) => setGroomerFilter(e.target.value)} options={groomers.map((g) => ({ value: g.id, label: g.display_name ?? g.name }))} />
          <Select size="sm" aria-label="Status" placeholder="All statuses" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={APPOINTMENT_STATUSES.map((s) => ({ value: s, label: APPOINTMENT_STATUS_LABEL[s] }))} />
        </GroomingDateNav>
        <GroomingViewToggle day={day} />
      </div>
      <GroomDayGridLegend>
        {hidden.length > 0 && <span className="row wrap" style={{ gap: 6 }}>{t('frontdesk-grooming-people.hiddenColumns')} {hidden.map((c) => <Chip key={c.id} size="sm" icon="eye" onClick={() => upsertPref(c.id, { hidden: false })}>{c.name}</Chip>)}</span>}
        <Badge size="sm" tone="info" dot>{APPOINTMENT_STATUS_LABEL.requested}</Badge><Badge size="sm" tone="success" dot>{APPOINTMENT_STATUS_LABEL.confirmed}</Badge><Badge size="sm" tone="warn" dot>{APPOINTMENT_STATUS_LABEL.in_progress}</Badge><Badge size="sm" tone="completed" dot>{APPOINTMENT_STATUS_LABEL.done}</Badge>
      </GroomDayGridLegend>
      <GroomDayGrid columns={columns} items={items} startHour={startHour} endHour={endHour} capacity={groomingCapacity ?? undefined} onItemClick={(id) => nav(`/desk/grooming/${id}`)}
        onMoveColumn={moveColumn} onColorColumn={(id, color) => upsertPref(id, { color })} onHideColumn={(id, h) => upsertPref(id, { hidden: h })}
        onSlotClick={can('appointments.write') ? (colId, hm) => nav(`/desk/grooming/new?day=${day}&time=${hm}&groomer=${colId}`) : undefined} onItemMove={can('appointments.write') ? moveItem : undefined}
        showNow={day === todayIso()}
        labels={{ time: t('frontdesk-grooming-people.time'), unassigned: t('frontdesk-grooming-people.unassigned'), off: t('frontdesk-grooming-people.offToday'), moveLeft: t('frontdesk-grooming-people.moveLeft'), moveRight: t('frontdesk-grooming-people.moveRight'), colour: t('frontdesk-grooming-people.changeColour'), reset: t('frontdesk-grooming-people.reset'), picker: t('frontdesk-grooming-people.picker'), hide: t('frontdesk-grooming-people.hideColumn'), options: t('frontdesk-grooming-people.columnOptions'), overCapacity: t('frontdesk-grooming-people.overCapacity'), now: t('frontdesk-grooming-people.now'), manyAlerts: t('frontdesk-grooming-people.alertsCount') }}
        emptyText={groomers.length ? 'All groomer columns are hidden' : `No groomers at ${location.short_name}`} />
      <p className="xs muted" style={{ margin: 0 }}>{t('frontdesk-grooming-people.gridLegend')}</p>
    </div>
  );
}
