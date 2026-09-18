import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { bundleReport } from './qaReports';
import { useTable } from '../../data/DataContext';
import type { PerfBudgetRow } from '../../data/schema/dev-quality';
import { buildSeed } from '../../data/seed';
import { getRoutes } from '../../app/registry';
import { storageKb } from './SeedInspectorPage';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { BudgetBar, budgetStatus } from '../../components/molecule/BudgetBar/BudgetBar';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import './dev-quality.css';

const kb = (b: number) => b / 1024;

/** D-16 */
export function PerfBudgetPage() {
  const { rows: budgets } = useTable<PerfBudgetRow>('perf_budgets');
  const rep = bundleReport;
  const [runtime, setRuntime] = useState<Record<string, number | null>>({});
  const measure = () => {
    const t0 = performance.now(); buildSeed(); const seedMs = performance.now() - t0;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paint = performance.getEntriesByType('paint').find((p) => p.name === 'first-contentful-paint');
    setRuntime({ seed_ms: Math.round(seedMs), localstorage_kb: storageKb(), route_count_max: getRoutes().length, first_render_ms: paint ? Math.round(paint.startTime) : nav ? Math.round(nav.domContentLoadedEventEnd) : null });
  };
  useEffect(measure, []);
  const values: Record<string, number | null> = useMemo(() => ({ js_total_kb: rep ? kb(rep.totals.jsGzip) : null, css_total_kb: rep ? kb(rep.totals.cssGzip) : null, largest_chunk_kb: rep?.largest ? kb(rep.largest.gzip) : null, assets_count_max: rep ? rep.totals.files : null, docs_kb: rep ? kb(rep.docsBytes) : null, ...runtime }), [rep, runtime]);
  const active = budgets.filter((b) => b.active);
  const statuses = active.map((b) => budgetStatus(values[b.metric] ?? null, b.budget, b.warn_at_percent));
  const fails = statuses.filter((s) => s === 'fail').length, warns = statuses.filter((s) => s === 'warn').length;
  return (
    <div className="page stack">
      <PageHeader code="D-16" title="Performance budget" subtitle={rep ? `Bundle from build ${rep.version} on ${rep.generatedAt.slice(0, 16).replace('T', ' ')} UTC; runtime numbers measured in this tab. Budgets come from perf_budgets (R-X85).` : 'No bundle report yet; runtime numbers measured in this tab. Budgets come from perf_budgets (R-X85).'}
        actions={<><Button size="sm" variant="secondary" icon="refresh" onClick={measure}>Re-measure</Button><Link to="/dev/data/perf_budgets"><Button size="sm" icon="edit">Edit budgets</Button></Link></>} />
      <div className="dq-stat-grid"><StatTile label="Budgets" value={active.length} icon="flag" /><StatTile label="Passing" value={statuses.filter((s) => s === 'pass').length} icon="check" tone="primary" /><StatTile label="Warnings" value={warns} icon="warning" /><StatTile label="Failing" value={fails} icon="close" /></div>
      <Section title="Budgets" description="Measured value against its limit; the tick marks the warning threshold.">
        <div className="dq-budgets">{active.map((b) => <BudgetBar key={b.id} label={b.label} value={values[b.metric] ?? null} budget={b.budget} unit={b.unit} warnAtPercent={b.warn_at_percent} hint={b.description ?? undefined} />)}</div>
      </Section>
      <Section title="Bundle assets" description="dist/assets by gzip size, from scripts/qa-bundle.mjs." actions={<code className="xs">npm run build && npm run qa:bundle</code>}>
        {!rep ? <EmptyState compact icon="download" title="No bundle report" body="Run npm run build, then npm run qa:bundle to write docs/qa/bundle-report.json." /> : (
          <DataTable rows={rep.assets.map((a) => ({ id: a.file, ...a }))} rowKey={(r) => r.id} dense pageSize={40} columns={[{ key: 'file', label: 'File', mono: true }, { key: 'kind', label: 'Kind', render: (r) => <Badge size="sm">{r.kind}</Badge> }, { key: 'bytes', label: 'Raw', align: 'right', render: (r) => `${kb(r.bytes).toFixed(1)} kB` }, { key: 'gzip', label: 'Gzip', align: 'right', render: (r) => `${kb(r.gzip).toFixed(1)} kB` }]} />
        )}
      </Section>
      <Section title="Runtime (this tab)"><Card padding="md"><dl className="dq-kv"><dt>Seed build</dt><dd>{runtime.seed_ms ?? '…'} ms</dd><dt>localStorage snapshot</dt><dd>{runtime.localstorage_kb ?? '…'} kB</dd><dt>Routes</dt><dd>{runtime.route_count_max ?? '…'}</dd><dt>First contentful paint</dt><dd>{runtime.first_render_ms ?? 'n/a'} ms</dd><dt>User agent</dt><dd className="xs">{navigator.userAgent.slice(0, 80)}</dd></dl></Card></Section>
    </div>
  );
}
