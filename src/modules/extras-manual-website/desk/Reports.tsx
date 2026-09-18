import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useTable } from '../../../data/DataContext';
import type { AppointmentRow, BookingRow, CapacityRow, DaycareBookingRow, FeedbackRow, InvoiceRow, PaymentRow, RoomTypeRow, VaccineRecordRow } from '../../../data/schema/core';
import { fmtMoney } from '../../../pricing/engine';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { SegmentedControl } from '../../../components/molecule/SegmentedControl/SegmentedControl';
import { StatTile } from '../../../components/molecule/StatTile/StatTile';
import { Card } from '../../../components/molecule/Card/Card';
import { Section } from '../../../components/molecule/Section/Section';
import { Button } from '../../../components/atom/Button/Button';
import { Badge } from '../../../components/atom/Badge/Badge';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import { ReportBarChart } from '../../../components/organism/ReportBarChart/ReportBarChart';
import './extras.css';

type Period = '7' | '30' | '90';
const PERIODS = [{ value: '7' as Period, label: '7 days' }, { value: '30' as Period, label: '30 days' }, { value: '90' as Period, label: '90 days' }];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayLabel = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** Days of the period ending today, oldest first. */
function useDays(period: Period) {
  return useMemo(() => { const n = Number(period); const out: string[] = []; const t = new Date(); t.setHours(12, 0, 0, 0); for (let i = n - 1; i >= 0; i--) { const d = new Date(t); d.setDate(t.getDate() - i); out.push(iso(d)); } return out; }, [period]);
}
function usePeriod() {
  const [period, setPeriod] = useState<Period>('30');
  const days = useDays(period);
  const start = days[0], end = days[days.length - 1];
  const inRange = (ts: string | null | undefined) => !!ts && ts.slice(0, 10) >= start && ts.slice(0, 10) <= end;
  return { period, setPeriod, days, start, end, inRange };
}
const Locs = ({ all, name }: { all: boolean; name: string }) => <Badge size="sm" tone={all ? 'primary' : 'neutral'}>{all ? 'All locations' : name}</Badge>;

/** F-62 Reports overview: KPIs for the period at the location scope, revenue per day chart, quick links to the detailed reports (R-X76). */
export function ReportsOverviewPage() {
  const { scope, allLocations, location } = useLocation();
  const { can } = useSession();
  const { period, setPeriod, days, inRange } = usePeriod();
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: scope });
  const { rows: appts } = useTable<AppointmentRow>('appointments', { where: scope });
  const { rows: daycare } = useTable<DaycareBookingRow>('daycare_bookings', { where: scope });
  const { rows: payments } = useTable<PaymentRow>('payments', { where: { ...scope, status: 'paid' } });
  const { rows: vax } = useTable<VaccineRecordRow>('vaccine_records', { where: { status: 'submitted' } });
  const { rows: feedback } = useTable<FeedbackRow>('feedback', { where: { ...scope, status: 'new' } });
  const pb = bookings.filter((b) => inRange(b.check_in)); const pa = appts.filter((a) => inRange(a.starts_at)); const pd = daycare.filter((d) => inRange(d.date)); const pp = payments.filter((p) => inRange(p.paid_at));
  const revenue = pp.reduce((s, p) => s + p.amount, 0);
  const nights = pb.reduce((s, b) => s + (b.nights ?? 0), 0);
  const perDay = days.map((d) => ({ label: dayLabel(d), value: Math.round(pp.filter((p) => (p.paid_at ?? '').slice(0, 10) === d).reduce((s, p) => s + p.amount, 0) * 100) / 100, hint: `${pb.filter((b) => b.check_in.slice(0, 10) === d).length} arrivals` }));
  return (
    <div className="container ex-page">
      <PageHeader code="F-62" title="Reports" subtitle={<>Bookings, services and money for the period. <Locs all={allLocations} name={location.short_name} /></>} actions={<SegmentedControl size="sm" ariaLabel="Period" value={period} onChange={setPeriod} options={PERIODS} />} />
      <div className="ex-tiles">
        <StatTile label="Hotel bookings" value={pb.length} hint={`${nights} nights`} icon="bed" />
        <StatTile label="Grooming appointments" value={pa.length} icon="scissors" />
        <StatTile label="Daycare days" value={pd.length} hint={`${pd.reduce((s, d) => s + d.pet_ids.length, 0)} dogs`} icon="sun" />
        <StatTile label="Collected" value={can('reports.financial') ? fmtMoney(revenue) : '—'} hint={can('reports.financial') ? `${pp.length} payments` : 'owner only'} icon="dollar" tone="primary" />
      </div>
      <div className="ex-grid-2">
        <Card padding="lg">{can('reports.financial') ? <ReportBarChart title={`Collected per day (${period} days)`} data={perDay} format={(v) => fmtMoney(v)} /> : <EmptyState compact icon="lock" title="Financial figures need the owner" body="Managers see counts; the owner sees money (permission reports.financial)." />}</Card>
        <Card padding="lg" className="stack">
          <h3>Needs attention</h3>
          <div className="ex-progress"><span>Vaccine proofs waiting for verification</span><Link to="/desk/vaccines"><Badge tone={vax.length ? 'warn' : 'success'}>{vax.length}</Badge></Link></div>
          <div className="ex-progress"><span>Bookings pending vaccines</span><Badge tone={bookings.filter((b) => b.status === 'pending_vaccines').length ? 'warn' : 'success'}>{bookings.filter((b) => b.status === 'pending_vaccines').length}</Badge></div>
          <div className="ex-progress"><span>Requested bookings not yet handled</span><Badge tone={bookings.filter((b) => b.status === 'requested').length ? 'info' : 'success'}>{bookings.filter((b) => b.status === 'requested').length}</Badge></div>
          <div className="ex-progress"><span>Staff feedback unanswered</span><Link to="/admin/feedback"><Badge tone={feedback.length ? 'info' : 'success'}>{feedback.length}</Badge></Link></div>
          <div className="row wrap" style={{ marginTop: 'auto' }}><Link to="/desk/reports/revenue"><Button size="sm" variant="secondary" icon="dollar">Revenue</Button></Link><Link to="/desk/reports/occupancy"><Button size="sm" variant="secondary" icon="bed">Occupancy</Button></Link></div>
        </Card>
      </div>
      <Section title="Bookings by status in the period" description="Hotel bookings whose check-in falls in the period.">
        <Card padding="none"><DataTable<{ status: string; count: number; nights: number; total: number }> rows={Object.entries(pb.reduce<Record<string, { count: number; nights: number; total: number }>>((acc, b) => { const k = b.status; acc[k] = acc[k] ?? { count: 0, nights: 0, total: 0 }; acc[k].count++; acc[k].nights += b.nights ?? 0; acc[k].total += b.total ?? 0; return acc; }, {})).map(([status, v]) => ({ status, ...v }))} rowKey={(r) => r.status} dense columns={[{ key: 'status', label: 'Status' }, { key: 'count', label: 'Bookings', align: 'right' }, { key: 'nights', label: 'Nights', align: 'right' }, { key: 'total', label: 'Booked value', align: 'right', render: (r) => (can('reports.financial') ? fmtMoney(r.total) : '—') }]} emptyText="No bookings in the period" /></Card>
      </Section>
    </div>
  );
}

/** F-63 Revenue: collected payments per day, by service and by method, fee and tax collected, CSV export (owner: reports.financial). */
export function ReportRevenuePage() {
  const { scope, allLocations, location } = useLocation();
  const { can } = useSession();
  const { period, setPeriod, days, inRange } = usePeriod();
  const { rows: payments } = useTable<PaymentRow>('payments', { where: scope });
  const { rows: invoices } = useTable<InvoiceRow>('invoices', { where: scope });
  const paid = payments.filter((p) => p.status === 'paid' && inRange(p.paid_at));
  const inv = (id: string | null) => invoices.find((i) => i.id === id);
  const sum = (list: PaymentRow[]) => Math.round(list.reduce((s, p) => s + p.amount, 0) * 100) / 100;
  const byService = ['booking', 'appointment', 'daycare'].map((k) => ({ key: k, label: k === 'booking' ? 'Hotel' : k === 'appointment' ? 'Grooming & Spa' : 'Daycare', amount: sum(paid.filter((p) => inv(p.invoice_id)?.source_type === k)), count: paid.filter((p) => inv(p.invoice_id)?.source_type === k).length }));
  const byMethod = (['card', 'cash'] as const).map((m) => ({ key: m, label: m === 'card' ? 'Card' : 'Cash', amount: sum(paid.filter((p) => p.method === m)), count: paid.filter((p) => p.method === m).length }));
  const perDay = days.map((d) => ({ label: dayLabel(d), value: sum(paid.filter((p) => (p.paid_at ?? '').slice(0, 10) === d)) }));
  const periodInvoices = invoices.filter((i) => inRange(i.issued_at));
  const fee = Math.round(periodInvoices.reduce((s, i) => s + (i.fee_total ?? 0), 0) * 100) / 100, tax = Math.round(periodInvoices.reduce((s, i) => s + (i.tax_total ?? 0), 0) * 100) / 100;
  const outstanding = Math.round(invoices.filter((i) => i.status !== 'paid' && i.status !== 'void').reduce((s, i) => s + (i.balance ?? 0), 0) * 100) / 100;
  const exportCsv = () => { const lines = [['paid_at', 'invoice', 'customer_id', 'method', 'amount', 'deposit', 'source'].join(','), ...paid.map((p) => [p.paid_at, inv(p.invoice_id)?.number ?? '', p.customer_id, p.method, p.amount, p.is_deposit ? 'yes' : 'no', inv(p.invoice_id)?.source_type ?? ''].join(','))]; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })); a.download = `petrock-revenue-${period}d.csv`; a.click(); URL.revokeObjectURL(a.href); };
  if (!can('reports.financial')) return <div className="container ex-page"><PageHeader code="F-63" title="Revenue" backTo="/desk/reports" /><EmptyState icon="lock" title="Financial reports need the owner" body="Your role sees counts on the overview; revenue needs the permission reports.financial (R-L05)." action={<Link to="/desk/reports"><Button variant="secondary">Back to reports</Button></Link>} /></div>;
  return (
    <div className="container ex-page">
      <PageHeader code="F-63" title="Revenue" backTo="/desk/reports" subtitle={<>Collected payments (status paid) by day, service and method. <Locs all={allLocations} name={location.short_name} /></>} actions={<div className="row wrap"><SegmentedControl size="sm" ariaLabel="Period" value={period} onChange={setPeriod} options={PERIODS} /><Button size="sm" variant="secondary" icon="download" onClick={exportCsv} disabled={!paid.length}>Export CSV</Button></div>} />
      <div className="ex-tiles">
        <StatTile label="Collected" value={fmtMoney(sum(paid))} hint={`${paid.length} payments`} icon="dollar" tone="primary" />
        <StatTile label="Card fee collected" value={fmtMoney(fee)} hint="from invoices issued in the period" icon="card" />
        <StatTile label="Tax collected" value={fmtMoney(tax)} icon="dollar" />
        <StatTile label="Outstanding balances" value={fmtMoney(outstanding)} hint="all open invoices" icon="warning" />
      </div>
      <Card padding="lg"><ReportBarChart title={`Collected per day (${period} days)`} data={perDay} format={(v) => fmtMoney(v)} /></Card>
      <div className="ex-grid-2">
        <Card padding="none"><DataTable rows={byService} rowKey={(r) => r.key} dense columns={[{ key: 'label', label: 'Service' }, { key: 'count', label: 'Payments', align: 'right' }, { key: 'amount', label: 'Collected', align: 'right', render: (r) => fmtMoney(r.amount) }]} /></Card>
        <Card padding="none"><DataTable rows={byMethod} rowKey={(r) => r.key} dense columns={[{ key: 'label', label: 'Method' }, { key: 'count', label: 'Payments', align: 'right' }, { key: 'amount', label: 'Collected', align: 'right', render: (r) => fmtMoney(r.amount) }]} /></Card>
      </div>
      <Section title="Payments in the period">
        <Card padding="none"><DataTable<PaymentRow> rows={paid} rowKey={(p) => p.id} searchable pageSize={25} columns={[{ key: 'paid_at', label: 'Paid', render: (p) => new Date(p.paid_at!).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }, { key: 'invoice_id', label: 'Invoice', render: (p) => inv(p.invoice_id)?.number ?? '—', mono: true }, { key: 'source', label: 'Service', value: (p) => inv(p.invoice_id)?.source_type, render: (p) => inv(p.invoice_id)?.source_type ?? '—' }, { key: 'method', label: 'Method', render: (p) => `${p.method}${p.card_brand ? ` · ${p.card_brand} ${p.card_last4}` : ''}` }, { key: 'is_deposit', label: 'Deposit', render: (p) => (p.is_deposit ? 'yes' : 'no'), hideOnCard: true }, { key: 'amount', label: 'Amount', align: 'right', render: (p) => fmtMoney(p.amount) }]} emptyText="No payments in the period" /></Card>
      </Section>
    </div>
  );
}

/** F-64 Occupancy: nights sold vs capacity per room type per day, average stay, today's fill per location (R-X76). */
export function ReportOccupancyPage() {
  const { scope, allLocations, location, locations } = useLocation();
  const { period, setPeriod, days } = usePeriod();
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: scope });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: caps } = useTable<CapacityRow>('capacities');
  const locIds = allLocations ? locations.map((l) => l.id) : [location.id];
  const capOf = (kind: string) => caps.filter((c) => locIds.includes(c.location_id as string) && c.kind === kind).reduce((s, c) => s + c.max_simultaneous, 0);
  const live = bookings.filter((b) => !['cancelled', 'no_show'].includes(b.status));
  const occupied = (day: string, rt?: string) => live.filter((b) => (!rt || b.room_type_id === rt) && b.check_in.slice(0, 10) <= day && b.check_out.slice(0, 10) > day).length;
  const totalCap = roomTypes.reduce((s, rt) => s + capOf(rt.key), 0);
  const perDay = days.map((d) => ({ label: dayLabel(d), value: occupied(d), hint: totalCap ? `${Math.round((occupied(d) / totalCap) * 100)}% of ${totalCap} rooms` : undefined }));
  const nightsSold = perDay.reduce((s, d) => s + d.value, 0);
  const avgStay = live.length ? Math.round((live.reduce((s, b) => s + (b.nights ?? 0), 0) / live.length) * 10) / 10 : 0;
  const today = iso(new Date());
  return (
    <div className="container ex-page">
      <PageHeader code="F-64" title="Occupancy" backTo="/desk/reports" subtitle={<>Rooms occupied per day against capacity; cancelled and no-show bookings excluded. <Locs all={allLocations} name={location.short_name} /></>} actions={<SegmentedControl size="sm" ariaLabel="Period" value={period} onChange={setPeriod} options={PERIODS} />} />
      <div className="ex-tiles">
        <StatTile label="Occupied tonight" value={`${occupied(today)} / ${totalCap}`} hint={totalCap ? `${Math.round((occupied(today) / totalCap) * 100)}% full` : ''} icon="bed" tone="primary" />
        <StatTile label="Room-nights in period" value={nightsSold} hint={totalCap ? `${Math.round((nightsSold / (totalCap * days.length)) * 100)}% average` : ''} icon="calendar" />
        <StatTile label="Average stay" value={`${avgStay} nights`} icon="clock" />
        <StatTile label="Arrivals in period" value={live.filter((b) => b.check_in.slice(0, 10) >= days[0] && b.check_in.slice(0, 10) <= days[days.length - 1]).length} icon="arrow-right" />
      </div>
      <Card padding="lg"><ReportBarChart title={`Rooms occupied per night (${period} days)`} data={perDay} unit="rooms" /></Card>
      <div className="ex-grid-2">
        {roomTypes.map((rt) => { const cap = capOf(rt.key); const now = occupied(today, rt.id); return <Card key={rt.id} padding="lg" className="stack-sm"><div className="row-between"><h3>{rt.name}</h3><span className="small muted">{now} / {cap} tonight</span></div><div className="ex-meter"><div className="ex-meter-bar"><div style={{ width: `${cap ? Math.min(100, (now / cap) * 100) : 0}%` }} /></div><span className="xs muted">{cap ? `${Math.round((now / cap) * 100)}% occupied` : 'no capacity row for this location'}</span></div><ReportBarChart title={`${rt.name} per night`} height={120} data={days.map((d) => ({ label: dayLabel(d), value: occupied(d, rt.id) }))} unit="rooms" /></Card>; })}
      </div>
    </div>
  );
}
