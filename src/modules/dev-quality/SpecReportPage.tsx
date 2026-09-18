import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRoutes } from '../../app/registry';
import { buildSpecReport, specReportMarkdown, type SpecReportRow } from './specReport';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { InspectorPanel } from '../../components/organism/InspectorPanel/InspectorPanel';
import { Chip } from '../../components/atom/Chip/Chip';
import { useToast } from '../../components/molecule/Toast/Toast';
import './dev-quality.css';

export function downloadText(name: string, text: string, type = 'text/plain') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** D-09 */
export function SpecReportPage() {
  const rows = useMemo(() => buildSpecReport(getRoutes()), []);
  const [sel, setSel] = useState<SpecReportRow | null>(null);
  const [inspect, setInspect] = useState(false);
  const { toast } = useToast();
  const clean = rows.filter((r) => !r.issues.length).length;
  const errors = rows.reduce((s, r) => s + r.errors, 0), warnings = rows.reduce((s, r) => s + r.warnings, 0);
  const opt = (k: keyof SpecReportRow) => [...new Set(rows.map((r) => String(r[k])))].sort().map((v) => ({ value: v, label: v }));
  return (
    <div className="page stack">
      <PageHeader code="D-09" title="Spec completeness report" subtitle="Missing fields and unresolved references per route (R-X80), widths not checked (D-016), stubs, duplicate or out-of-range codes, pages without a menu entry."
        actions={<><Button variant="secondary" size="sm" icon="copy" onClick={() => navigator.clipboard?.writeText(specReportMarkdown(rows)).then(() => toast('Markdown copied'))}>Copy markdown</Button><Button size="sm" icon="download" onClick={() => downloadText('spec-report.md', specReportMarkdown(rows), 'text/markdown')}>Download</Button></>} />
      <div className="dq-stat-grid"><StatTile label="Routes" value={rows.length} icon="spec" /><StatTile label="Clean" value={`${clean} / ${rows.length}`} icon="check" tone="primary" hint={`${Math.round((clean / Math.max(1, rows.length)) * 100)} %`} /><StatTile label="Errors" value={errors} icon="close" /><StatTile label="Warnings" value={warnings} icon="warning" /></div>
      <DataTable rows={rows} rowKey={(r) => r.path} searchable pageSize={100} onRowClick={setSel}
        filters={[{ key: 'module', label: 'Module', options: opt('module'), test: (r, v) => r.module === v }, { key: 'surface', label: 'Surface', options: opt('surface'), test: (r, v) => r.surface === v }, { key: 'sev', label: 'Severity', options: [{ value: 'error', label: 'Has errors' }, { value: 'warn', label: 'Has warnings' }, { value: 'clean', label: 'Clean' }], test: (r, v) => (v === 'error' ? r.errors > 0 : v === 'warn' ? r.warnings > 0 : !r.issues.length) }]}
        columns={[{ key: 'code', label: 'Code', mono: true, width: 90 }, { key: 'name', label: 'Page' }, { key: 'path', label: 'Route', mono: true, hideOnCard: true, render: (r) => <Link to={r.path} onClick={(e) => e.stopPropagation()}>{r.path}</Link> }, { key: 'module', label: 'Module', hideOnCard: true }, { key: 'status', label: 'Status', render: (r) => <Badge size="sm" tone={r.status === 'built' ? 'success' : 'warn'}>{r.status}</Badge> }, { key: 'score', label: 'Spec', align: 'right', render: (r) => <Badge size="sm" tone={r.score === 100 ? 'success' : r.score >= 70 ? 'warn' : 'danger'}>{r.score}%</Badge> }, { key: 'errors', label: 'E', align: 'right', render: (r) => (r.errors ? <span className="tone-danger mono">{r.errors}</span> : <span className="faint">0</span>) }, { key: 'warnings', label: 'W', align: 'right', render: (r) => (r.warnings ? <span className="mono" style={{ color: 'var(--color-warn)' }}>{r.warnings}</span> : <span className="faint">0</span>) }, { key: 'issues', label: 'Issues', sortable: false, render: (r) => (r.issues.length ? <ul className="dq-issues">{r.issues.slice(0, 3).map((i, k) => <li key={k} className={`is-${i.severity}`}>{i.text}</li>)}{r.issues.length > 3 && <li className="faint">+{r.issues.length - 3} more</li>}</ul> : <Badge size="sm" tone="success">clean</Badge>) }]} />
      <Drawer open={!!sel && !inspect} onClose={() => setSel(null)} width={520} title={<div className="row wrap"><code>{sel?.code}</code><h3>{sel?.name}</h3></div>}
        footer={<><Button variant="ghost" onClick={() => setSel(null)}>Close</Button><span className="grow" />{sel && <Link to={sel.path}><Button variant="secondary" icon="external">Open page</Button></Link>}<Button icon="spec" onClick={() => setInspect(true)}>Inspect spec</Button></>}>
        {sel && (
          <div className="stack">
            <div className="row wrap xs muted"><Chip size="sm">{sel.module}</Chip><Chip size="sm">{sel.surface}</Chip><Badge size="sm" tone={sel.status === 'built' ? 'success' : 'warn'}>{sel.status}</Badge><code>{sel.path}</code></div>
            {sel.issues.length ? <ul className="dq-issues" style={{ fontSize: 'var(--fs-sm)', gap: 6 }}>{sel.issues.map((i, k) => <li key={k} className={`is-${i.severity}`}><Badge size="sm" tone={i.severity === 'error' ? 'danger' : 'warn'}>{i.kind}</Badge><span>{i.text}</span></li>)}</ul> : <p className="tone-success">No issues. Spec is complete and every reference resolves.</p>}
            <div className="xs faint">Checked at: {(sel.route.spec.checkedAt ?? []).join(', ') || 'nothing recorded'} · rules: {(sel.route.spec.rules ?? []).join(', ') || 'none'}</div>
          </div>
        )}
      </Drawer>
      <InspectorPanel spec={sel?.route.spec ?? null} open={!!sel && inspect} onClose={() => setInspect(false)} routePath={sel?.path} />
    </div>
  );
}
