import { useMemo, useState } from 'react';
import { tables } from '../../data/schema';
import { useData } from '../../data/DataContext';
import { DB_KEY, SEED_VERSION } from '../../data/MockProvider';
import { fmtMoney } from '../../pricing/engine';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { MiniBarChart } from '../../components/molecule/MiniBarChart/MiniBarChart';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { useToast } from '../../components/molecule/Toast/Toast';
import { downloadText } from './SpecReportPage';
import './dev-quality.css';

const months = (n = 12) => { const out: { key: string; label: string }[] = []; const d = new Date(); d.setDate(1); for (let i = n - 1; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push({ key: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`, label: x.toLocaleString('en-US', { month: 'short' }) }); } return out; };
const monthOf = (iso: string | null | undefined) => (iso ? String(iso).slice(0, 7) : '');
export const storageKb = () => { try { return Math.round((localStorage.getItem(DB_KEY)?.length ?? 0) / 1024); } catch { return 0; } };

/** D-14 */
export function SeedInspectorPage() {
  const data = useData();
  const { toast } = useToast();
  const [tick, setTick] = useState(0);
  const peek = (t: string) => data.peek?.(t) ?? [];
  const M = months();
  const stats = useMemo(() => {
    void tick;
    const count = (t: string, col: string, filter?: (r: Record<string, unknown>) => boolean) => { const m = Object.fromEntries(M.map((x) => [x.key, 0])); for (const r of peek(t)) { if (filter && !filter(r)) continue; const k = monthOf(r[col] as string); if (k in m) m[k]++; } return M.map((x) => ({ label: x.label, value: m[x.key], hint: x.key })); };
    const revenue = (() => { const m = Object.fromEntries(M.map((x) => [x.key, 0])); for (const r of peek('invoices')) { if (r.status !== 'paid') continue; const k = monthOf(r.issued_at as string); if (k in m) m[k] += Number(r.total) || 0; } return M.map((x) => ({ label: x.label, value: Math.round(m[x.key]), hint: x.key })); })();
    const coverage = tables.map((t) => { const rows = peek(t.name); const dates = rows.map((r) => String(r.created_at)).filter(Boolean).sort(); const enc = rows.filter((r) => r.location_id === 'loc_encino').length, ww = rows.filter((r) => r.location_id === 'loc_westwood').length; return { id: t.name, table: t.name, group: t.group, rows: rows.length, first: dates[0]?.slice(0, 10) ?? '', last: dates[dates.length - 1]?.slice(0, 10) ?? '', split: t.scope === 'location' ? `${enc} / ${ww}` : '—' }; });
    const totalRows = coverage.reduce((s, c) => s + c.rows, 0);
    const paid = peek('invoices').filter((i) => i.status === 'paid').reduce((s, i) => s + (Number(i.total) || 0), 0);
    return { stays: count('bookings', 'check_in'), grooms: count('appointments', 'starts_at'), daycare: count('daycare_bookings', 'date'), revenue, coverage, totalRows, paid, bookings: peek('bookings').length, invoices: peek('invoices').length };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tick]);
  const reseed = async () => { const t0 = performance.now(); await data.reset?.(); setTick((t) => t + 1); toast({ tone: 'success', title: `Reseeded in ${Math.round(performance.now() - t0)} ms` }); };
  const exportJson = () => downloadText('petrock-mock-db.json', JSON.stringify(Object.fromEntries(tables.map((t) => [t.name, peek(t.name)]))), 'application/json');
  return (
    <div className="page stack">
      <PageHeader code="D-14" title="Seed inspector" subtitle={`Mock database v${SEED_VERSION} in localStorage (${DB_KEY}). Core seed = today's operations; dev-quality seed = twelve months of history priced by the engine (R-X86).`}
        actions={<><Button size="sm" variant="secondary" icon="download" onClick={exportJson}>Export JSON</Button><Button size="sm" icon="refresh" onClick={reseed}>Reseed</Button></>} />
      <div className="dq-stat-grid"><StatTile label="Tables" value={tables.length} icon="table" /><StatTile label="Rows" value={stats.totalRows.toLocaleString()} icon="layers" /><StatTile label="Hotel bookings" value={stats.bookings} icon="bed" /><StatTile label="Invoices" value={stats.invoices} icon="card" /><StatTile label="Paid revenue (12 mo)" value={fmtMoney(stats.paid)} icon="dollar" tone="primary" /><StatTile label="Storage" value={`${storageKb()} kB`} icon="download" hint="of ~5 MB per origin" /></div>
      <Section title="Last twelve months" description="What the reports module has to work with.">
        <div className="dq-charts"><Card padding="md"><MiniBarChart title="Hotel stays (by check-in)" data={stats.stays} /></Card><Card padding="md"><MiniBarChart title="Grooming appointments" data={stats.grooms} /></Card><Card padding="md"><MiniBarChart title="Daycare days" data={stats.daycare} /></Card><Card padding="md"><MiniBarChart title="Paid revenue" data={stats.revenue} format={(v) => fmtMoney(v)} /></Card></div>
      </Section>
      <Section title="Coverage per table" description="Rows, first / last created_at, Encino / Westwood split.">
        <DataTable rows={stats.coverage} rowKey={(r) => r.id} searchable dense pageSize={100} columns={[{ key: 'table', label: 'Table', mono: true }, { key: 'group', label: 'Group', render: (r) => <Badge size="sm">{r.group}</Badge> }, { key: 'rows', label: 'Rows', align: 'right' }, { key: 'first', label: 'First', mono: true, hideOnCard: true }, { key: 'last', label: 'Last', mono: true, hideOnCard: true }, { key: 'split', label: 'Encino / Westwood', hideOnCard: true }]} />
      </Section>
      <Section title="Seed files" description="src/data/seed/*.ts, run in order.">
        <div className="dq-cards"><Card padding="sm" className="dq-card"><h3>core.ts (order 0)</h3><p className="xs muted">Locations, roles, users, employees, customers, pets, vaccines, rooms, pricing tables, ~30 stays around today, appointments, daycare, messages, reviews, feedback, approvals.</p></Card><Card padding="sm" className="dq-card"><h3>dev-quality.ts (order 50)</h3><p className="xs muted">A year of checked-out stays, grooms and daycare days with paid invoices and payments; monthly reviews; perf_budgets; a first qa_runs row. Own PRNG stream so core data does not shift.</p></Card></div>
      </Section>
    </div>
  );
}
