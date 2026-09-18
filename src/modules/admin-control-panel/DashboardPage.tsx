/** A-01 Owner dashboard: KPIs, revenue chart, occupancy meters, today's schedule, attention list. Location-scoped (R-X45). */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import { useLocation } from '../../tenant/LocationProvider';
import type { BookingRow, AppointmentRow, DaycareBookingRow, PaymentRow, RoomRow, RoomTypeRow, CapacityRow, FeedbackRow, ReviewRow, VaccineRecordRow, CustomerRow, PetRow, EmployeeRow } from '../../data/schema/core';
import { BOOKING_STATUSES, BOOKING_STATUS_LABEL, dayBucket, type BookingStatus } from '../../domain/booking';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Card } from '../../components/molecule/Card/Card';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { Badge, StatusBadge, toneFor } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { AdminBarChart } from '../../components/organism/AdminBarChart/AdminBarChart';
import { AdminMeter } from '../../components/molecule/AdminMeter/AdminMeter';
import { fmtMoney, fmtInt, isoDay, addDays, startOfDay, staysOn, sum, dayLabel, monthLabel } from './lib';
import './admin.css';

type Range = '7d' | '30d' | '12m';

export function DashboardPage() {
  const { scope, allLocations, location, locations } = useLocation();
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: scope });
  const { rows: appointments } = useTable<AppointmentRow>('appointments', { where: scope });
  const { rows: daycare } = useTable<DaycareBookingRow>('daycare_bookings', { where: scope });
  const { rows: payments } = useTable<PaymentRow>('payments', { where: scope });
  const { rows: rooms } = useTable<RoomRow>('rooms', { where: scope });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: capacities } = useTable<CapacityRow>('capacities', { where: scope });
  const { rows: feedback } = useTable<FeedbackRow>('feedback');
  const { rows: reviews } = useTable<ReviewRow>('reviews', { where: scope });
  const { rows: vaccines } = useTable<VaccineRecordRow>('vaccine_records');
  const { rows: customers } = useTable<CustomerRow>('customers');
  const { rows: pets } = useTable<PetRow>('pets');
  const { rows: employees } = useTable<EmployeeRow>('employees', { where: scope });
  const [range, setRange] = useState<Range>('30d');
  const today = startOfDay();
  const todayIso = isoDay(today);
  const cust = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);
  const petById = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, p])), [pets]);

  // KPIs
  const paidToday = payments.filter((p) => p.status === 'paid' && p.paid_at && p.paid_at.slice(0, 10) === todayIso);
  const revenueToday = sum(paidToday, (p) => p.amount);
  const monthStart = `${todayIso.slice(0, 7)}-01`;
  const revenueMonth = sum(payments.filter((p) => p.status === 'paid' && p.paid_at && p.paid_at >= monthStart), (p) => p.amount);
  const inHouse = bookings.filter((b) => b.status === 'checked_in');
  const arriving = bookings.filter((b) => dayBucket({ ...b, status: b.status as BookingStatus }, todayIso) === 'arriving');
  const departing = bookings.filter((b) => dayBucket({ ...b, status: b.status as BookingStatus }, todayIso) === 'departing');
  const activeRooms = rooms.filter((r) => r.active);
  const occupiedTonight = bookings.filter((b) => staysOn(b, todayIso));
  const pendingVax = bookings.filter((b) => b.status === 'pending_vaccines' || b.status === 'requested');
  const groomsToday = appointments.filter((a) => a.starts_at.slice(0, 10) === todayIso && !['cancelled', 'no_show'].includes(a.status));
  const dcToday = daycare.filter((d) => d.date === todayIso && !['cancelled', 'no_show'].includes(d.status));
  const newFeedback = feedback.filter((f) => f.status === 'new').length;
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;
  const expiringVax = vaccines.filter((v) => v.expires_on && v.status === 'verified' && v.expires_on <= isoDay(addDays(today, 30)) && v.expires_on >= todayIso).length;

  // Revenue chart: paid payments bucketed by day (7d / 30d) or month (12m), split by source type via invoice? payments lack type -> by method.
  const chart = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'paid' && p.paid_at);
    if (range === '12m') {
      const months: string[] = []; for (let i = 11; i >= 0; i--) { const d = new Date(today.getFullYear(), today.getMonth() - i, 1); months.push(isoDay(d).slice(0, 7)); }
      return months.map((m) => ({ label: monthLabel(m), title: m, values: { card: sum(paid.filter((p) => p.paid_at!.slice(0, 7) === m && p.method === 'card'), (p) => p.amount), cash: sum(paid.filter((p) => p.paid_at!.slice(0, 7) === m && p.method === 'cash'), (p) => p.amount) } }));
    }
    const n = range === '7d' ? 7 : 30;
    return Array.from({ length: n }, (_, i) => { const d = isoDay(addDays(today, i - n + 1)); return { label: n === 7 ? dayLabel(d) : String(Number(d.slice(8))), title: d, values: { card: sum(paid.filter((p) => p.paid_at!.slice(0, 10) === d && p.method === 'card'), (p) => p.amount), cash: sum(paid.filter((p) => p.paid_at!.slice(0, 10) === d && p.method === 'cash'), (p) => p.amount) } }; });
  }, [payments, range, today]);
  const rangeTotal = sum(chart, (c) => c.values.card + c.values.cash);

  // Occupancy per room type (tonight)
  const occ = roomTypes.map((rt) => { const total = activeRooms.filter((r) => r.room_type_id === rt.id).length; const used = occupiedTonight.filter((b) => b.room_type_id === rt.id).length; return { rt, total, used }; });
  const dcCap = sum(capacities.filter((c) => c.kind === 'daycare'), (c) => c.max_simultaneous);
  const groomCap = sum(capacities.filter((c) => c.kind === 'grooming'), (c) => c.max_simultaneous);

  // Today's schedule
  const schedule = useMemo(() => {
    const items: { time: string; sort: string; title: string; sub: string; badge: string; to: string }[] = [];
    for (const b of arriving) items.push({ time: new Date(b.check_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), sort: b.check_in, title: `Arrival · ${b.code}`, sub: `${cust[b.customer_id] ? `${cust[b.customer_id].first_name} ${cust[b.customer_id].last_name}` : ''} · ${roomTypes.find((r) => r.id === b.room_type_id)?.name ?? ''}`, badge: b.status, to: '/desk' });
    for (const b of departing) items.push({ time: new Date(b.check_out).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), sort: b.check_out, title: `Departure · ${b.code}`, sub: cust[b.customer_id] ? `${cust[b.customer_id].first_name} ${cust[b.customer_id].last_name}` : '', badge: b.status, to: '/desk' });
    for (const a of groomsToday) items.push({ time: new Date(a.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), sort: a.starts_at, title: `Groom · ${petById[a.pet_id]?.name ?? a.code}`, sub: `${a.duration_min} min · ${employees.find((e) => e.id === a.groomer_id)?.display_name ?? 'unassigned'}`, badge: a.status, to: '/desk/grooming' });
    for (const d of dcToday) items.push({ time: d.check_in_time, sort: `${d.date}T${d.check_in_time}`, title: `Daycare · ${d.pet_ids.map((p) => petById[p]?.name ?? '?').join(', ')}`, sub: `${d.check_in_time} - ${d.check_out_time} · ${d.item.replace('_', ' ')}`, badge: d.status, to: '/desk' });
    return items.sort((a, b) => a.sort.localeCompare(b.sort));
  }, [arriving, departing, groomsToday, dcToday, cust, petById, roomTypes, employees]);

  const locLabel = allLocations ? `${locations.length} locations` : location.short_name;
  return (
    <div className="page stack">
      <PageHeader code="A-01" title="Dashboard" subtitle={`${locLabel} · ${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`} actions={<Link to="/admin/reports"><Button variant="secondary" icon="chart">Reports</Button></Link>} />
      <div className="acp-kpis">
        <StatTile label="Revenue today" value={fmtMoney(revenueToday)} icon="dollar" hint={`${fmtMoney(revenueMonth)} this month`} />
        <StatTile label="Dogs in house" value={fmtInt(inHouse.length)} icon="bed" hint={`${arriving.length} arriving · ${departing.length} departing`} />
        <StatTile label="Grooms today" value={groomsToday.length} icon="scissors" hint={`${dcToday.length} daycare`} />
        <StatTile label="Needs attention" value={pendingVax.length + newFeedback + pendingReviews} icon="flag" hint={`${pendingVax.length} bookings waiting · ${newFeedback} feedback · ${pendingReviews} reviews`} />
      </div>
      <div className="acp-two">
        <Card padding="md" header={<div className="acp-card-title"><div><h3>Revenue</h3><p className="acp-note">Paid payments · {fmtMoney(rangeTotal)} in range</p></div><SegmentedControl<Range> size="sm" value={range} onChange={setRange} options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '12m', label: '12 months' }]} ariaLabel="Range" /></div>}>
          <AdminBarChart stacked series={[{ key: 'card', label: 'Card' }, { key: 'cash', label: 'Cash' }]} data={chart} format={(n) => fmtMoney(n)} ariaLabel="Revenue over time" height={240} />
        </Card>
        <Card padding="md" header={<div className="acp-card-title"><h3>Occupancy tonight</h3><Link to="/admin/rooms" className="xs">Rooms</Link></div>}>
          <div className="stack-sm">
            {occ.map(({ rt, total, used }) => <AdminMeter key={rt.id} label={rt.name} value={used} max={total} hint={`${total - used} free`} />)}
            <AdminMeter label="Daycare" value={dcToday.length} max={dcCap} hint="spots today" />
            <AdminMeter label="Grooming" value={groomsToday.length} max={Math.max(groomCap * 8, 1)} hint={`${groomCap} groomers × 8 slots`} />
            {expiringVax > 0 && <p className="acp-note"><Badge size="sm" tone="warn">{expiringVax}</Badge> vaccines expire within 30 days</p>}
          </div>
        </Card>
      </div>
      <div className="acp-two">
        <Card padding="md" header={<div className="acp-card-title"><h3>Today's schedule</h3><span className="acp-note">{schedule.length} items</span></div>}>
          {schedule.length === 0 ? <EmptyState compact icon="calendar" title="Nothing scheduled today" body="Arrivals, departures, grooms and daycare drop-offs show here." /> : (
            <div className="acp-list">{schedule.slice(0, 12).map((s, i) => <Link key={i} to={s.to} className="acp-item" style={{ color: 'inherit', textDecoration: 'none' }}><span className="acp-item-time">{s.time}</span><span className="acp-item-main">{s.title}<small>{s.sub}</small></span>{(BOOKING_STATUSES as readonly string[]).includes(s.badge) ? <StatusBadge status={s.badge} size="sm" /> : <Badge size="sm" tone={toneFor(s.badge)}>{s.badge.replace('_', ' ')}</Badge>}</Link>)}</div>
          )}
        </Card>
        <Card padding="md" header={<h3>Attention</h3>}>
          <div className="acp-list">
            <Link to="/desk" className="acp-item" style={{ color: 'inherit', textDecoration: 'none' }}><Badge tone={pendingVax.length ? 'warn' : 'neutral'}>{pendingVax.length}</Badge><span className="acp-item-main">Bookings waiting<small>{BOOKING_STATUS_LABEL.requested} or {BOOKING_STATUS_LABEL.pending_vaccines}</small></span><span className="xs faint">Front desk</span></Link>
            <Link to="/admin/feedback" className="acp-item" style={{ color: 'inherit', textDecoration: 'none' }}><Badge tone={newFeedback ? 'info' : 'neutral'}>{newFeedback}</Badge><span className="acp-item-main">New staff feedback<small>From the feedback button on staff pages</small></span><span className="xs faint">A-36</span></Link>
            <Link to="/admin/reviews" className="acp-item" style={{ color: 'inherit', textDecoration: 'none' }}><Badge tone={pendingReviews ? 'accent' : 'neutral'}>{pendingReviews}</Badge><span className="acp-item-main">Reviews to moderate<small>Publish or archive</small></span><span className="xs faint">A-35</span></Link>
            <Link to="/admin/approvals" className="acp-item" style={{ color: 'inherit', textDecoration: 'none' }}><Badge tone="neutral">PIN</Badge><span className="acp-item-main">Approvals log<small>Every manager-PIN approval</small></span><span className="xs faint">A-37</span></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
