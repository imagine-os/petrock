import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { GroomingDateNav } from '../../../components/molecule/GroomingDateNav/GroomingDateNav';
import { Button } from '../../../components/atom/Button/Button';
import { Select } from '../../../components/atom/Select/Select';
import { Badge, toneFor } from '../../../components/atom/Badge/Badge';
import { useT } from '../../../i18n';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import { GroomStatusBadge } from '../../../components/molecule/GroomStatusBadge/GroomStatusBadge';
import { PetVaccineChip } from '../../../components/molecule/PetVaccineChip/PetVaccineChip';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useAppointments, type AppointmentView } from '../hooks';
import { GroomingViewToggle, useDayParam } from './GroomingViewToggle';
import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_LABEL, fmtDate, fmtMoney, fmtRange, quoteForAppointment } from '../lib';
import '../module.css';

/** F-32 Grooming agenda list. */
export function GroomingAgendaPage() {
  const nav = useNavigate();
  const t = useT();
  const { can } = useSession();
  const { location } = useLocation();
  const [day, setDay] = useDayParam();
  const [groomerFilter, setGroomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payFilter, setPayFilter] = useState('');
  const { views, groomers, packages, addons, fees, taxes } = useAppointments(day);
  const rows = useMemo(() => views.filter((v) => (!groomerFilter || v.ap.groomer_id === groomerFilter) && (!statusFilter || v.ap.status === statusFilter) && (!payFilter || v.ap.payment_status === payFilter)).map((v) => ({ ...v, quote: quoteForAppointment(v.ap, packages, addons, fees, taxes, v.extras) })), [views, groomerFilter, statusFilter, payFilter, packages, addons, fees, taxes]);
  const dayTotal = rows.filter((r) => !['cancelled', 'no_show'].includes(r.ap.status)).reduce((s, r) => s + r.quote.total, 0);
  type Row = (typeof rows)[number];
  const columns = [
    { key: 'time', label: 'Time', value: (r: Row) => r.ap.starts_at, render: (r: Row) => <span className="tnum xs" style={{ whiteSpace: 'nowrap' }}>{fmtRange(r.ap)}</span>, width: 150, tone: 'num' as const },
    { key: 'date', label: 'Date', value: (r: Row) => r.ap.starts_at.slice(0, 10), render: (r: Row) => <span className="tnum xs">{fmtDate(r.ap.starts_at)}</span>, hideOnCard: true, tone: 'num' as const },
    { key: 'groomer', label: 'Groomer', value: (r: Row) => r.groomer?.display_name ?? '', render: (r: Row) => r.groomer ? <span className="row" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: r.groomer.color ?? 'var(--color-border)', flex: 'none' }} />{r.groomer.display_name ?? r.groomer.name}</span> : <span className="faint">Unassigned</span> },
    { key: 'flags', label: 'Status', sortable: false, render: (r: Row) => <span className="fgp-flags"><GroomStatusBadge status={r.ap.status} size="sm" />{r.flags.vaccine && <Badge size="sm" tone="danger" title={t('frontdesk-grooming-people.vaccineIssue')}>{t('frontdesk-grooming-people.vaccineIssue')}</Badge>}{r.flags.payment && <Badge size="sm" tone="warn" title={t('frontdesk-grooming-people.balanceDue')}>{t('frontdesk-grooming-people.balanceDue')}</Badge>}{r.flags.warning && <Badge size="sm" tone="warn" title={t('frontdesk-grooming-people.needsAttention')}>{t('frontdesk-grooming-people.needsAttention')}</Badge>}</span> },
    { key: 'agenda', label: 'Agenda', value: (r: Row) => r.label, render: (r: Row) => <div className="fgp-agenda-title"><Link to={`/desk/grooming/${r.ap.id}`}>{r.label}</Link><span className="fgp-agenda-items">{r.quote.lines.filter((l) => l.kind === 'service' || l.kind === 'addon').map((l) => `${l.label} ${fmtMoney(l.amount)}`).join(' · ') || 'No line items'}{r.ap.notes ? ` · “${r.ap.notes}”` : ''}</span>{r.vaccine && r.vaccine.overall !== 'ok' && <PetVaccineChip overall={r.vaccine.overall} detail={[...r.vaccine.expired, ...r.vaccine.missing, ...r.vaccine.pending].join(', ')} />}</div> },
    { key: 'payment', label: 'Payment', value: (r: Row) => r.ap.payment_status, render: (r: Row) => <Badge size="sm" tone={toneFor(r.ap.payment_status)}>{r.ap.payment_status}</Badge> },
    { key: 'total', label: 'Total', value: (r: Row) => r.quote.total, render: (r: Row) => <strong className="tnum">{fmtMoney(r.quote.total)}</strong>, align: 'right' as const, tone: 'num' as const },
  ];
  return (
    <div className="page stack">
      <PageHeader code="F-32" title="Agenda list" subtitle={`${location.short_name} · ${rows.length} appointment${rows.length === 1 ? '' : 's'} · ${fmtMoney(dayTotal)} booked (excl. cancelled)`}
        actions={can('appointments.write') ? <Button icon="plus" onClick={() => nav(`/desk/grooming/new?day=${day}`)}>New groom booking</Button> : undefined} />
      <div className="fgp-toolbar">
        <GroomingDateNav value={day} onChange={setDay}>
          <Select size="sm" aria-label="Groomer" placeholder="All groomers" value={groomerFilter} onChange={(e) => setGroomerFilter(e.target.value)} options={groomers.map((g) => ({ value: g.id, label: g.display_name ?? g.name }))} />
          <Select size="sm" aria-label="Status" placeholder="All statuses" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={APPOINTMENT_STATUSES.map((s) => ({ value: s, label: APPOINTMENT_STATUS_LABEL[s] }))} />
          <Select size="sm" aria-label="Payment" placeholder="Any payment" value={payFilter} onChange={(e) => setPayFilter(e.target.value)} options={['pending', 'authorized', 'paid', 'refunded'].map((s) => ({ value: s, label: s }))} />
        </GroomingDateNav>
        <GroomingViewToggle day={day} />
      </div>
      <DataTable<Row> framed title="Grooming Agenda" columns={columns} rows={rows} rowKey={(r: AppointmentView) => r.ap.id} onRowClick={(r) => nav(`/desk/grooming/${r.ap.id}`)} emptyText={`No grooming appointments on ${fmtDate(day)}`} />
    </div>
  );
}
