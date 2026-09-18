import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { responsiveReport, cellKey, type ResponsiveCell } from './qaReports';
import { useTable } from '../../data/DataContext';
import type { QaRunRow } from '../../data/schema/dev-quality';
import { REQUIRED_WIDTHS } from './specReport';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { QaMatrix, type QaCell } from '../../components/organism/QaMatrix/QaMatrix';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { Select } from '../../components/atom/Select/Select';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Section } from '../../components/molecule/Section/Section';
import './dev-quality.css';

export const cellStatus = (c: ResponsiveCell | undefined): QaCell => {
  if (!c) return { status: 'none' };
  const fails = (c.hscroll ? 1 : 0) + c.errors.length;
  const warns = c.a11y.filter((a) => a.severity === 'error').length;
  if (fails) return { status: 'fail', count: fails + warns, title: `${c.hscroll ? `horizontal scroll (${c.scrollWidth}px)` : ''} ${c.errors.length ? `${c.errors.length} console errors` : ''}`.trim() };
  if (warns) return { status: 'warn', count: warns, title: `${warns} a11y findings` };
  return { status: 'pass' };
};

/** D-12 */
export function ResponsiveReportPage() {
  const rep = responsiveReport;
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [surface, setSurface] = useState('');
  const [sel, setSel] = useState<{ route: string; width: number } | null>(null);
  const { rows: runs } = useTable<QaRunRow>('qa_runs', { orderBy: { column: 'started_at', dir: 'desc' } });
  const widths = rep?.widths ?? REQUIRED_WIDTHS;
  const routes = useMemo(() => (rep?.routes ?? []).filter((r) => !surface || r.surface === surface), [rep, surface]);
  const cells = routes.flatMap((r) => widths.map((w) => r.cells[cellKey(w, theme)]));
  const failing = cells.filter((c) => c && (c.hscroll || c.errors.length)).length;
  const a11y = cells.reduce((s, c) => s + (c?.a11y.length ?? 0), 0);
  const selRoute = sel ? routes.find((r) => r.path === sel.route) : null;
  const selCell = sel && selRoute ? selRoute.cells[cellKey(sel.width, theme)] : undefined;
  return (
    <div className="page stack">
      <PageHeader code="D-12" title="Responsive QA report" subtitle={rep ? `Last run ${rep.generatedAt.slice(0, 16).replace('T', ' ')} UTC · ${rep.routes.length} routes × ${widths.join(' / ')} px × ${rep.themes.join(' + ')}. Fail = horizontal scroll or console error; warn = a11y findings.` : 'No report yet.'}
        actions={<code className="xs">npm run build && npm run qa:responsive</code>}>
        <div className="dq-toolbar"><SegmentedControl size="sm" ariaLabel="Theme" value={theme} onChange={setTheme} options={[{ value: 'light', label: 'Light', icon: 'sun' }, { value: 'dark', label: 'Dark', icon: 'moon' }]} /><Select size="sm" aria-label="Surface" placeholder="All surfaces" value={surface} onChange={(e) => setSurface(e.target.value)} options={[...new Set((rep?.routes ?? []).map((r) => r.surface))].map((s) => ({ value: s, label: s }))} /></div>
      </PageHeader>
      {!rep ? <EmptyState icon="expand" title="No responsive report yet" body="Run npm run build, then npm run qa:responsive. The script loads every route in the manifest at 360 / 390 / 768 / 1280 / 1920 px in light and dark and writes docs/qa/responsive-report.{md,json}." /> : (
        <>
          <div className="dq-stat-grid"><StatTile label="Routes" value={routes.length} icon="spec" /><StatTile label="Cells" value={cells.filter(Boolean).length} icon="grid" /><StatTile label="Failing cells" value={failing} icon={failing ? 'close' : 'check'} tone={failing ? 'primary' : 'default'} /><StatTile label="A11y findings" value={a11y} icon="shield" /></div>
          <QaMatrix rows={routes.map((r) => ({ key: r.path, label: `${r.code} ${r.name}`, sub: r.path }))} cols={widths.map((w) => ({ key: String(w), label: `${w}` }))} cell={(rk, ck) => cellStatus(routes.find((r) => r.path === rk)?.cells[cellKey(Number(ck), theme)])} onCell={(rk, ck) => setSel({ route: rk, width: Number(ck) })} dense />
        </>
      )}
      <Section title="Runs" description="qa_runs rows written by the scripts (and the seed).">
        <DataTable rows={runs} rowKey={(r) => r.id} dense pageSize={20} columns={[{ key: 'started_at', label: 'Started', mono: true }, { key: 'kind', label: 'Kind', render: (r) => <Badge size="sm">{r.kind}</Badge> }, { key: 'label', label: 'Label' }, { key: 'routes', label: 'Routes', align: 'right' }, { key: 'issues', label: 'Issues', align: 'right' }, { key: 'result', label: 'Result', render: (r) => <Badge size="sm" tone={r.result === 'pass' ? 'success' : r.result === 'warn' ? 'warn' : 'danger'}>{r.result}</Badge> }, { key: 'report_path', label: 'Report', hideOnCard: true, render: (r) => (r.report_path ? <Link to={`/docs/${r.report_path.replace(/^docs\//, '').replace(/\.md$/, '')}`}>{r.report_path}</Link> : '—') }]} />
      </Section>
      <Drawer open={!!sel} onClose={() => setSel(null)} width={520} title={<div className="row wrap"><code>{selRoute?.code}</code><h3>{selRoute?.name}</h3><Badge size="sm" tone="primary">{sel?.width} px · {theme}</Badge></div>}
        footer={<><Button variant="ghost" onClick={() => setSel(null)}>Close</Button><span className="grow" />{selRoute && <Link to={`/dev/qa/preview?route=${encodeURIComponent(selRoute.path)}&width=${sel?.width}`}><Button variant="secondary" icon="expand">Preview at {sel?.width}</Button></Link>}{selRoute && <Link to={`/dev/qa/a11y?route=${encodeURIComponent(selRoute.path)}`}><Button icon="shield">Scan a11y</Button></Link>}</>}>
        {selCell ? (
          <div className="stack">
            <dl className="dq-kv"><dt>Horizontal scroll</dt><dd>{selCell.hscroll ? <span className="tone-danger">yes, scrollWidth {selCell.scrollWidth}</span> : 'no'}</dd><dt>Console errors</dt><dd>{selCell.errors.length}</dd><dt>A11y findings</dt><dd>{selCell.a11y.length}</dd>{selCell.ms != null && <><dt>Load</dt><dd>{selCell.ms} ms</dd></>}</dl>
            {selCell.offenders.length > 0 && <div><div className="eyebrow">Elements past the right edge</div><ul className="dq-issues">{selCell.offenders.map((o, i) => <li key={i} className="is-error"><code>{o.selector}</code> right {o.right}px</li>)}</ul></div>}
            {selCell.errors.length > 0 && <div><div className="eyebrow">Console</div><ul className="dq-issues">{selCell.errors.map((e, i) => <li key={i} className="is-error">{e}</li>)}</ul></div>}
            {selCell.a11y.length > 0 && <div><div className="eyebrow">Accessibility</div><ul className="dq-issues">{selCell.a11y.map((a, i) => <li key={i} className={`is-${a.severity}`}><Badge size="sm" tone={a.severity === 'error' ? 'danger' : 'warn'}>{a.rule}</Badge><span>{a.text} <code className="faint">{a.selector}</code></span></li>)}</ul></div>}
            {!selCell.hscroll && !selCell.errors.length && !selCell.a11y.length && <p className="tone-success">Clean at this width.</p>}
          </div>
        ) : <p className="muted small">Not checked in the last run.</p>}
      </Drawer>
    </div>
  );
}
