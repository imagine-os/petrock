import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getRoutes } from '../../app/registry';
import { screenshotIndex, findShot } from './screenshots';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { ImageCompare } from '../../components/molecule/ImageCompare/ImageCompare';
import { Select } from '../../components/atom/Select/Select';
import { Badge } from '../../components/atom/Badge/Badge';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Icon } from '../../components/atom/Icon/Icon';
import './dev-quality.css';

const KEY_PAGES = new Set(['HUB-01', 'A-00', 'D-01', 'D-02', 'D-04', 'D-05', 'P-00', 'C-10', 'F-01', 'A-01']);
const yes = (v: boolean) => (v ? <Icon name="check" size={14} className="tone-success" /> : <span className="faint">—</span>);

/** D-17 */
export function ScreenshotDiffPage() {
  const [params, setParams] = useSearchParams();
  const shots = useMemo(() => screenshotIndex(), []);
  const codes = useMemo(() => { const seen = new Set<string>(); return getRoutes().map((r) => r.spec.code).filter((c) => { if (seen.has(c)) return false; seen.add(c); return true; }).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })); }, []);
  const rows = codes.map((code) => { const g = shots[code]; const has = (w: number, d = false, l = '') => !!findShot(g, w, d, l); const labels = [...new Set(g?.files.map((f) => f.label).filter(Boolean) ?? [])]; return { id: code, code, count: g?.files.length ?? 0, w390: has(390), w1280: has(1280), dark: has(390, true) || has(1280, true), before: labels.includes('before'), labels: labels.join(', '), key: KEY_PAGES.has(code), complete: has(390) && has(1280) && (!KEY_PAGES.has(code) || has(1280, true)) }; });
  const code = params.get('code') || rows.find((r) => r.count)?.code || codes[0];
  const width = Number(params.get('width') || 1280);
  const dark = params.get('theme') === 'dark';
  const g = shots[code];
  const labels = [...new Set(g?.files.map((f) => f.label) ?? [])];
  const label = params.get('label') ?? (labels.includes('before') ? 'before' : labels.find((l) => l) ?? '');
  const set = (k: string, v: string) => { params.set(k, v); setParams(params, { replace: true }); };
  return (
    <div className="page stack">
      <PageHeader code="D-17" title="Screenshot diff" subtitle="Which captures exist per page code (docs/screenshots/<CODE>/<width>[-dark][-<label>].jpg) and a before / after comparison. Capture a baseline with npm run screenshots -- --label=before, then capture again." />
      <div className="dq-stat-grid"><StatTile label="Page codes" value={codes.length} icon="spec" /><StatTile label="With screenshots" value={rows.filter((r) => r.count).length} icon="image" tone="primary" /><StatTile label="Complete" value={rows.filter((r) => r.complete).length} icon="check" hint="390 + 1280 (+ dark for key pages)" /><StatTile label="Without shots" value={rows.filter((r) => !r.count).length} icon="warning" /></div>
      <Section title="Compare" description="Pick a code, width and theme; the baseline is the labelled capture.">
        <div className="dq-toolbar"><Select size="sm" label="Page" value={code} onChange={(e) => set('code', e.target.value)} options={codes.map((c) => ({ value: c, label: `${c}${shots[c] ? ` (${shots[c].files.length})` : ''}` }))} /><Select size="sm" label="Width" value={String(width)} onChange={(e) => set('width', e.target.value)} options={[...new Set(g?.files.map((f) => f.width) ?? [390, 1280])].sort((a, b) => a - b).map((w) => ({ value: String(w), label: `${w} px` }))} /><Select size="sm" label="Theme" value={dark ? 'dark' : 'light'} onChange={(e) => set('theme', e.target.value)} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /><Select size="sm" label="Baseline label" value={label} onChange={(e) => set('label', e.target.value)} options={labels.filter(Boolean).map((l) => ({ value: l, label: l }))} placeholder="none captured" /></div>
        <Card padding="md" style={{ marginTop: 12 }}>{g ? <ImageCompare before={findShot(g, width, dark, label)?.url} after={findShot(g, width, dark, '')?.url} beforeLabel={label || 'baseline'} afterLabel="current" alt={`${code} at ${width} px ${dark ? 'dark' : 'light'}`} /> : <EmptyState compact icon="image" title={`No screenshots for ${code}`} body={`npm run screenshots -- --codes=${code}`} />}</Card>
      </Section>
      <Section title="Coverage" description="Per page code; key pages also need a dark capture.">
        <DataTable rows={rows} rowKey={(r) => r.id} searchable dense pageSize={200} onRowClick={(r) => set('code', r.code)} filters={[{ key: 'c', label: 'Coverage', options: [{ value: 'complete', label: 'Complete' }, { value: 'partial', label: 'Partial' }, { value: 'none', label: 'None' }], test: (r, v) => (v === 'complete' ? r.complete : v === 'none' ? !r.count : !!r.count && !r.complete) }]}
          columns={[{ key: 'code', label: 'Code', mono: true, render: (r) => <span className="mono">{r.code}{r.key && <Badge size="sm" tone="primary"> key</Badge>}</span> }, { key: 'count', label: 'Files', align: 'right' }, { key: 'w390', label: '390', render: (r) => yes(r.w390) }, { key: 'w1280', label: '1280', render: (r) => yes(r.w1280) }, { key: 'dark', label: 'Dark', render: (r) => yes(r.dark) }, { key: 'before', label: 'Baseline', render: (r) => yes(r.before) }, { key: 'labels', label: 'Labels', hideOnCard: true, render: (r) => r.labels || <span className="faint">—</span> }, { key: 'complete', label: 'Status', render: (r) => <Badge size="sm" tone={r.complete ? 'success' : r.count ? 'warn' : 'neutral'}>{r.complete ? 'complete' : r.count ? 'partial' : 'none'}</Badge> }]}
          rowActions={() => <Link to="/docs/screenshots" className="xs">gallery</Link>} />
      </Section>
    </div>
  );
}
