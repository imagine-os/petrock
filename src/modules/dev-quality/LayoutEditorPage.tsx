import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getRoutes, isStubElement } from '../../app/registry';
import { useTable } from '../../data/DataContext';
import type { PageLayoutRow } from '../../data/schema/core';
import { useLayout } from '../../layout/useLayout';
import type { PageSpec } from '../../specs/types';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { LayoutSectionList, type LayoutSectionItem } from '../../components/organism/LayoutSectionList/LayoutSectionList';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { Badge } from '../../components/atom/Badge/Badge';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import './dev-quality.css';

function LayoutIndex() {
  const routes = getRoutes();
  const { rows: layouts } = useTable<PageLayoutRow>('page_layouts');
  const rows = useMemo(() => { const seen = new Set<string>(); return routes.filter((r) => { if (seen.has(r.spec.code)) return false; seen.add(r.spec.code); return true; }).map((r) => ({ id: r.spec.code, code: r.spec.code, name: r.spec.name, path: r.path, sections: r.spec.layout.length, status: isStubElement(r.element) ? 'stub' : 'built', customised: layouts.some((l) => l.page_code === r.spec.code) })).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })); }, [routes, layouts]);
  const nav = useNavigate();
  return (
    <div className="page stack">
      <PageHeader code="D-11" title="Layout editor" subtitle="Reorder or hide the sections a page declares in spec.layout. Saved per page code in page_layouts; pages that call useLayout(spec) render in that order (R-X83)." />
      <DataTable rows={rows} rowKey={(r) => r.id} searchable dense pageSize={200} onRowClick={(r) => nav(`/dev/layout/${r.code}`)}
        filters={[{ key: 'c', label: 'Customised', options: [{ value: 'yes', label: 'Customised' }, { value: 'no', label: 'Spec order' }], test: (r, v) => r.customised === (v === 'yes') }]}
        columns={[{ key: 'code', label: 'Code', mono: true, width: 90 }, { key: 'name', label: 'Page' }, { key: 'path', label: 'Route', mono: true, hideOnCard: true }, { key: 'sections', label: 'Sections', align: 'right' }, { key: 'status', label: 'Status', render: (r) => <Badge size="sm" tone={r.status === 'built' ? 'success' : 'warn'}>{r.status}</Badge> }, { key: 'customised', label: 'Layout', render: (r) => (r.customised ? <Badge size="sm" tone="primary">customised</Badge> : <span className="xs faint">spec order</span>) }]}
        rowActions={(r) => <Button size="sm" variant="ghost" icon="edit" onClick={() => nav(`/dev/layout/${r.code}`)}>Edit</Button>} />
    </div>
  );
}

function Editor({ spec, path }: { spec: PageSpec; path: string }) {
  const layout = useLayout(spec);
  const { toast } = useToast();
  const [items, setItems] = useState<LayoutSectionItem[]>([]);
  const [saving, setSaving] = useState(false);
  const fromState = useMemo(() => layout.order.map((name) => ({ name, hidden: layout.hidden.includes(name) })), [layout.order, layout.hidden]);
  useEffect(() => { setItems(fromState); }, [fromState]);
  const dirty = JSON.stringify(items) !== JSON.stringify(fromState);
  const save = async () => { setSaving(true); try { await layout.save({ order: items.map((i) => i.name), hidden: items.filter((i) => i.hidden).map((i) => i.name) }); toast({ tone: 'success', title: `Layout saved for ${spec.code}` }); } finally { setSaving(false); } };
  const reset = async () => { await layout.reset(); setItems(spec.layout.map((name) => ({ name, hidden: false }))); toast('Back to the spec order'); };
  const nav = useNavigate();
  const codes = useMemo(() => { const seen = new Set<string>(); return getRoutes().filter((r) => { if (seen.has(r.spec.code)) return false; seen.add(r.spec.code); return true; }).sort((a, b) => a.spec.code.localeCompare(b.spec.code, undefined, { numeric: true })); }, []);
  return (
    <div className="page stack">
      <PageHeader code="D-11" backTo="/dev/layout" title={`Layout: ${spec.name}`} subtitle={spec.purpose} eyebrow={<code>{spec.code}</code>}
        actions={<><Select size="sm" aria-label="Page" value={spec.code} onChange={(e) => nav(`/dev/layout/${e.target.value}`)} options={codes.map((r) => ({ value: r.spec.code, label: `${r.spec.code} · ${r.spec.name}` }))} />{layout.customised && <Button size="sm" variant="secondary" icon="refresh" onClick={reset}>Reset to spec</Button>}<Button size="sm" icon="check" onClick={save} disabled={!dirty} loading={saving}>Save</Button></>}>
        <div className="row wrap xs"><Badge size="sm" tone={layout.customised ? 'primary' : 'neutral'}>{layout.customised ? 'customised' : 'spec order'}</Badge>{dirty && <Badge size="sm" tone="warn">unsaved changes</Badge>}<Link to={path.replace(/:table/, 'bookings').replace(/:code/, 'D-03').replace(/\/\*$/, '')} className="xs">open page →</Link></div>
      </PageHeader>
      {!spec.layout.length ? <EmptyState icon="layers" title="This spec declares no sections" body="Add section names to spec.layout first." /> : (
        <div className="grid grid-2">
          <Section title="Sections" description="Drag, or use the arrows. Toggle hides a section without removing it from the spec."><Card padding="sm"><LayoutSectionList items={items} onChange={setItems} /></Card></Section>
          <Section title="Preview" description="How the page will render once it reads useLayout(spec).">
            <Card padding="sm"><ol className="dq-outline">{items.map((it, i) => <li key={it.name} className={it.hidden ? 'is-hidden' : ''}><span className="mono">{i + 1}</span>{it.name}</li>)}</ol></Card>
            <p className="xs faint" style={{ marginTop: 8 }}>Adoption: <code>{'const { sections } = useLayout(spec); sections.map(name => ...)'}</code> (src/layout/useLayout.ts). Pages that do not call it ignore this layout.</p>
          </Section>
        </div>
      )}
    </div>
  );
}

/** D-11 */
export function LayoutEditorPage() {
  const { code } = useParams();
  const route = code ? getRoutes().find((r) => r.spec.code === code) : undefined;
  if (!code) return <LayoutIndex />;
  if (!route) return <div className="page"><EmptyState icon="layers" title={`No page with code ${code}`} action={<Link to="/dev/layout"><Button variant="secondary">All pages</Button></Link>} /></div>;
  return <Editor key={code} spec={route.spec} path={route.path} />;
}
