/** A-42 Reports & analytics: revenue by service / location, occupancy, bookings funnel, groomer utilization, balances; CSV export (R-X45). */
import { useMemo, useState } from 'react';
import { useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import { useLocation } from '../../tenant/LocationProvider';
import type { BookingRow, AppointmentRow, DaycareBookingRow, RoomRow, EmployeeRow, LocationRow, CustomerRow, PackageRow } from '../../data/schema/core';
import { BOOKING_STATUSES, BOOKING_STATUS_LABEL } from '../../domain/booking';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { AdminBarChart } from '../../components/organism/AdminBarChart/AdminBarChart';
import { AdminLineChart } from '../../components/organism/AdminLineChart/AdminLineChart';
import { AdminMeter } from '../../components/molecule/AdminMeter/AdminMeter';
import { fmtMoney, fmtMoney2, fmtInt, isoDay, addDays, startOfDay, staysOn, sum, groupBy, dayLabel, downloadText, toCsv } from './lib';
import './admin.css';

type Tab = 'revenue' | 'occupancy' | 'funnel' | 'groomers' | 'customers';
type Range = '30d' | '90d' | 'all';
const REVENUE_STATUSES = ['confirmed', 'checked_in', 'checked_out'];

export function ReportsPage() {
  const { scope, allLocations, location } = useLocation();
  const { can } = useSession();
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: scope });
  const { rows: appointments } = useTable<AppointmentRow>('appointments', { where: scope });
  const { rows: daycare } = useTable<DaycareBookingRow>('daycare_bookings', { where: scope });
  const { rows: rooms } = useTable<RoomRow>('rooms', { where: scope });
  const { rows: employees } = useTable<EmployeeRow>('employees', { where: scope });
  const { rows: locs } = useTable<LocationRow>('locations');
  const { rows: customers } = useTable<CustomerRow>('customers');
  const { rows: packages } = useTable<PackageRow>('packages');
  const [tab, setTab] = useState<Tab>('revenue');
  const [range, setRange] = useState<Range>('90d');
  const today = startOfDay();
  const from = range === 'all' ? '0000' : isoDay(addDays(today, range === '30d' ? -30 : -90));
  const to = isoDay(addDays(today, range === 'all' ? 3650 : 0));
  const locName = useMemo(() => Object.fromEntries(locs.map((l) => [l.id, l.short_name])), [locs]);
  const inRange = (d: string) => d.slice(0, 10) >= from && d.slice(0, 10) <= to;

  // Revenue = booked value (totals) of non-cancelled records in the range, by service and location.
  const hotel = bookings.filter((b) => REVENUE_STATUSES.includes(b.status) && inRange(b.check_in));
  const grooms = appointments.filter((a) => ['confirmed', 'in_progress', 'done'].includes(a.status) && inRange(a.starts_at));
  const dc = daycare.filter((d) => REVENUE_STATUSES.includes(d.status) && inRange(d.date));
  const revenue = { hotel: sum(hotel, (b) => b.total), grooming: sum(grooms, (a) => a.total), daycare: sum(dc, (d) => d.total) };
  const total = revenue.hotel + revenue.grooming + revenue.daycare;
  const byLocation = useMemo(() => locs.filter((l) => allLocations || l.id === location.id).map((l) => ({ label: l.short_name, values: { hotel: sum(hotel.filter((b) => b.location_id === l.id), (b) => b.total), grooming: sum(grooms.filter((a) => a.location_id === l.id), (a) => a.total), daycare: sum(dc.filter((d) => d.location_id === l.id), (d) => d.total) } })), [locs, allLocations, location.id, hotel, grooms, dc]);
  const byWeek = useMemo(() => { const weeks = new Map<string, { hotel: number; grooming: number; daycare: number }>(); const wk = (iso: string) => { const d = new Date(iso.slice(0, 10) + 'T12:00:00'); d.setDate(d.getDate() - d.getDay()); return isoDay(d); }; const bump = (k: string, f: 'hotel' | 'grooming' | 'daycare', v: number) => { if (!weeks.has(k)) weeks.set(k, { hotel: 0, grooming: 0, daycare: 0 }); weeks.get(k)![f] += v; }; hotel.forEach((b) => bump(wk(b.check_in), 'hotel', b.total)); grooms.forEach((a) => bump(wk(a.starts_at), 'grooming', a.total)); dc.forEach((d) => bump(wk(d.date), 'daycare', d.total)); return [...weeks.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ label: new Date(k + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), title: `Week of ${k}`, values: v })); }, [hotel, grooms, dc]);

  // Occupancy: nights sold / room-nights available over the last 14 days + next 14 days.
  const occDays = useMemo(() => Array.from({ length: 28 }, (_, i) => isoDay(addDays(today, i - 14))), [today]);
  const activeRooms = rooms.filter((r) => r.active).length;
  const occSeries = useMemo(() => occDays.map((d) => ({ label: dayLabel(d), title: d, values: { occ: activeRooms ? Math.round((bookings.filter((b) => staysOn(b, d)).length / activeRooms) * 100) : 0 } })), [occDays, bookings, activeRooms]);
  const avgOcc = occSeries.length ? Math.round(sum(occSeries.slice(0, 14), (s) => s.values.occ) / 14) : 0;
  const revPar = activeRooms ? sum(hotel, (b) => b.subtotal) / Math.max(1, activeRooms * (range === '30d' ? 30 : range === '90d' ? 90 : 365)) : 0;

  // Funnel: bookings by status in range (created in range or check-in in range).
  const funnel = BOOKING_STATUSES.map((s) => ({ status: s, n: bookings.filter((b) => b.status === s && inRange(b.check_in)).length }));
  const funnelMax = Math.max(1, ...funnel.map((f) => f.n));
  const bySource = [...groupBy(bookings.filter((b) => inRange(b.check_in)), (b) => b.source ?? 'unknown').entries()].map(([k, v]) => ({ label: k, values: { n: v.length } }));

  // Groomer utilization: booked minutes / available minutes (8 h per working day in range).
  const groomers = employees.filter((e) => e.is_groomer);
  const workDays = range === '30d' ? 26 : range === '90d' ? 78 : 300;
  const util = groomers.map((g) => { const mine = grooms.filter((a) => a.groomer_id === g.id); const minutes = sum(mine, (a) => a.duration_min); return { g, appts: mine.length, minutes, revenue: sum(mine, (a) => a.total), pct: Math.min(100, Math.round((minutes / (workDays * 8 * 60)) * 100)) }; });
  const pkgMix = useMemo(() => packages.map((p) => ({ label: p.name.replace(' Groom', ''), values: { n: grooms.filter((a) => a.package_id === p.id).length } })), [packages, grooms]);

  // Customers: top by booked value and balances.
  const custRows = useMemo(() => customers.map((c) => { const b = bookings.filter((x) => x.customer_id === c.id && REVENUE_STATUSES.includes(x.status)); const a = appointments.filter((x) => x.customer_id === c.id && x.status === 'done'); const d = daycare.filter((x) => x.customer_id === c.id && REVENUE_STATUSES.includes(x.status)); return { id: c.id, name: `${c.first_name} ${c.last_name}`, home: locName[c.home_location_id ?? ''] ?? '—', stays: b.length, grooms: a.length, daycare: d.length, value: sum(b, (x) => x.total) + sum(a, (x) => x.total) + sum(d, (x) => x.total), balance: c.balance }; }).filter((r) => allLocations || r.stays + r.grooms + r.daycare > 0 || r.balance > 0).sort((a, b) => b.value - a.value), [customers, bookings, appointments, daycare, locName, allLocations]);

  const exportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (tab === 'revenue') downloadText(`revenue-${stamp}.csv`, toCsv([...hotel.map((b) => ({ date: b.check_in.slice(0, 10), service: 'hotel', code: b.code, location: locName[b.location_id ?? ''], status: b.status, subtotal: b.subtotal, discount: b.discount_total, fee: b.fee_total, tax: b.tax_total, total: b.total })), ...grooms.map((a) => ({ date: a.starts_at.slice(0, 10), service: 'grooming', code: a.code, location: locName[a.location_id ?? ''], status: a.status, subtotal: a.subtotal, discount: 0, fee: 0, tax: a.tax_total, total: a.total })), ...dc.map((d) => ({ date: d.date, service: 'daycare', code: d.code, location: locName[d.location_id ?? ''], status: d.status, subtotal: d.subtotal, discount: d.discount_total, fee: 0, tax: d.tax_total, total: d.total }))]), 'text/csv');
    else if (tab === 'occupancy') downloadText(`occupancy-${stamp}.csv`, toCsv(occSeries.map((s) => ({ day: s.title, occupancy_pct: s.values.occ, rooms: activeRooms }))), 'text/csv');
    else if (tab === 'funnel') downloadText(`funnel-${stamp}.csv`, toCsv(funnel.map((f) => ({ status: f.status, count: f.n }))), 'text/csv');
    else if (tab === 'groomers') downloadText(`groomers-${stamp}.csv`, toCsv(util.map((u) => ({ groomer: u.g.name, appointments: u.appts, minutes: u.minutes, revenue: u.revenue, utilization_pct: u.pct }))), 'text/csv');
    else downloadText(`customers-${stamp}.csv`, toCsv(custRows), 'text/csv');
  };
  const scopeLabel = allLocations ? 'all locations' : location.short_name;
  return (
    <div className="page stack">
      <PageHeader code="A-42" title="Reports & analytics" subtitle={`${scopeLabel} · booked value of confirmed, in-house and completed records; cancellations and no-shows excluded.`} actions={<div className="row wrap" style={{ gap: 8 }}><SegmentedControl<Range> size="sm" value={range} onChange={setRange} options={[{ value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }, { value: 'all', label: 'All' }]} ariaLabel="Range" />{can('reports.export') && <Button variant="secondary" size="sm" icon="download" onClick={exportCsv}>CSV</Button>}</div>} />
      <div className="acp-tabs-scroll"><Tabs<Tab> value={tab} onChange={setTab} items={[{ key: 'revenue', label: 'Revenue' }, { key: 'occupancy', label: 'Occupancy' }, { key: 'funnel', label: 'Bookings funnel' }, { key: 'groomers', label: 'Groomer utilization' }, { key: 'customers', label: 'Customers & balances' }]} /></div>
      {tab === 'revenue' && <>
        <div className="acp-kpis"><StatTile label="Total booked" value={fmtMoney(total)} tone="primary" icon="dollar" /><StatTile label="Hotel" value={fmtMoney(revenue.hotel)} hint={`${hotel.length} stays`} icon="bed" /><StatTile label="Grooming & Spa" value={fmtMoney(revenue.grooming)} hint={`${grooms.length} appointments`} icon="scissors" /><StatTile label="Daycare" value={fmtMoney(revenue.daycare)} hint={`${dc.length} days`} icon="sun" /></div>
        <div className="acp-two">
          <Card padding="md" header={<h3>Revenue by week and service</h3>}><AdminBarChart stacked series={[{ key: 'hotel', label: 'Hotel' }, { key: 'grooming', label: 'Grooming & Spa' }, { key: 'daycare', label: 'Daycare' }]} data={byWeek} format={(n) => fmtMoney(n)} ariaLabel="Revenue by week" height={260} /></Card>
          <Card padding="md" header={<h3>By location</h3>}><AdminBarChart stacked series={[{ key: 'hotel', label: 'Hotel' }, { key: 'grooming', label: 'Grooming & Spa' }, { key: 'daycare', label: 'Daycare' }]} data={byLocation} format={(n) => fmtMoney(n)} ariaLabel="Revenue by location" height={260} /></Card>
        </div>
      </>}
      {tab === 'occupancy' && <>
        <div className="acp-kpis"><StatTile label="Avg occupancy (14 d)" value={`${avgOcc}%`} tone="primary" icon="bed" /><StatTile label="Rooms" value={activeRooms} icon="grid" /><StatTile label="Tonight" value={bookings.filter((b) => staysOn(b, isoDay(today))).length} hint="rooms in use" icon="moon" /><StatTile label="RevPAR" value={fmtMoney2(revPar)} hint="room revenue per available room-night" icon="dollar" /></div>
        <Card padding="md" header={<div className="acp-card-title"><h3>Occupancy per night</h3><span className="acp-note">14 days back, 14 ahead</span></div>}><AdminLineChart series={[{ key: 'occ', label: 'Occupancy' }]} data={occSeries} format={(n) => `${Math.round(n)}%`} max={100} area ariaLabel="Occupancy per night" height={240} /></Card>
        <Card padding="md" header={<h3>Room type fill tonight</h3>}><div className="stack-sm">{[...groupBy(rooms.filter((r) => r.active), (r) => r.room_type_id).entries()].map(([rt, rs]) => <AdminMeter key={rt} label={rt === 'rt_penthouse' ? 'Penthouse' : rt === 'rt_suite' ? 'Suite' : rt} value={bookings.filter((b) => b.room_type_id === rt && staysOn(b, isoDay(today))).length} max={rs.length} />)}</div></Card>
      </>}
      {tab === 'funnel' && <>
        <div className="acp-kpis"><StatTile label="Bookings in range" value={sum(funnel, (f) => f.n)} icon="list" tone="primary" /><StatTile label="Conversion" value={`${Math.round(((funnel.find((f) => f.status === 'checked_out')?.n ?? 0) / Math.max(1, sum(funnel, (f) => f.n))) * 100)}%`} hint="completed of all" icon="check" /><StatTile label="Cancelled" value={funnel.find((f) => f.status === 'cancelled')?.n ?? 0} icon="close" /><StatTile label="No-show" value={funnel.find((f) => f.status === 'no_show')?.n ?? 0} icon="warning" /></div>
        <div className="acp-two">
          <Card padding="md" header={<h3>By status (one lifecycle)</h3>}><div className="acp-funnel">{funnel.map((f) => <div key={f.status} className="acp-funnel-row"><span>{BOOKING_STATUS_LABEL[f.status]}</span><div className="acp-funnel-bar" style={{ width: `${(f.n / funnelMax) * 100}%`, opacity: ['cancelled', 'no_show'].includes(f.status) ? 0.35 : 0.9 }} /><strong>{f.n}</strong></div>)}</div></Card>
          <Card padding="md" header={<h3>By source</h3>}><AdminBarChart series={[{ key: 'n', label: 'Bookings' }]} data={bySource} format={(n) => fmtInt(n)} height={200} ariaLabel="Bookings by source" /></Card>
        </div>
      </>}
      {tab === 'groomers' && <>
        <div className="acp-kpis"><StatTile label="Groomers" value={groomers.length} icon="scissors" /><StatTile label="Appointments" value={grooms.length} icon="calendar" tone="primary" /><StatTile label="Booked hours" value={Math.round(sum(grooms, (a) => a.duration_min) / 60)} icon="clock" /><StatTile label="Avg ticket" value={grooms.length ? fmtMoney2(revenue.grooming / grooms.length) : '—'} icon="dollar" /></div>
        <div className="acp-two">
          <Card padding="md" header={<div><h3>Utilization</h3><p className="acp-note">Booked minutes of {workDays} working days × 8 h</p></div>}><div className="stack-sm">{util.length === 0 ? <p className="acp-empty-inline">No groomers at this location</p> : util.map((u) => <AdminMeter key={u.g.id} label={`${u.g.name} · ${u.appts} appts · ${fmtMoney(u.revenue)}`} value={u.minutes} max={workDays * 8 * 60} format={() => `${u.pct}%`} />)}</div></Card>
          <Card padding="md" header={<h3>Package mix</h3>}><AdminBarChart series={[{ key: 'n', label: 'Appointments' }]} data={pkgMix} format={(n) => fmtInt(n)} height={200} ariaLabel="Package mix" /></Card>
        </div>
      </>}
      {tab === 'customers' && <>
        <div className="acp-kpis"><StatTile label="Customers" value={custRows.length} icon="users" /><StatTile label="Lifetime value" value={fmtMoney(sum(custRows, (c) => c.value))} icon="dollar" tone="primary" /><StatTile label="Outstanding balances" value={fmtMoney(sum(custRows, (c) => c.balance))} hint={`${custRows.filter((c) => c.balance > 0).length} customers owe`} icon="warning" /><StatTile label="Repeat customers" value={custRows.filter((c) => c.stays + c.grooms + c.daycare > 1).length} icon="refresh" /></div>
        <DataTable rows={custRows} rowKey={(r) => r.id} searchable dense columns={[{ key: 'name', label: 'Customer' }, { key: 'home', label: 'Home' }, { key: 'stays', label: 'Stays', align: 'right' }, { key: 'grooms', label: 'Grooms', align: 'right' }, { key: 'daycare', label: 'Daycare', align: 'right' }, { key: 'value', label: 'Booked value', align: 'right', render: (r) => <strong>{fmtMoney2(r.value)}</strong> }, { key: 'balance', label: 'Balance', align: 'right', render: (r) => (r.balance > 0 ? <Badge tone="warn" size="sm">{fmtMoney2(r.balance)}</Badge> : <span className="faint">—</span>) }]} />
      </>}
    </div>
  );
}
