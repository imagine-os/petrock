import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { componentLibrary, TIER_ORDER } from '../../design/library';
import type { ComponentMeta, Tier } from '../../design/meta';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Badge } from '../../components/atom/Badge/Badge';
import { Chip } from '../../components/atom/Chip/Chip';
import { Section } from '../../components/molecule/Section/Section';
import { Card } from '../../components/molecule/Card/Card';
import './dev-quality.css';

interface Row { id: string; name: string; tier: Tier; states: number; usages: number; props: number; a11y: number; usedBy: number; figma: number; gaps: string[]; meta: ComponentMeta }
const gapsOf = (m: ComponentMeta): string[] => [!m.usages.length && 'no usage', !m.a11y.length && 'no a11y notes', !(m.usedBy?.length) && 'not on a page', !m.states.length && 'no states', !m.props.length && 'no props'].filter(Boolean) as string[];

/** D-08 */
export function ComponentMatrixPage() {
  const [tier, setTier] = useState<Tier | 'all'>('all');
  const [gapsOnly, setGapsOnly] = useState(false);
  const rows = useMemo<Row[]>(() => componentLibrary.map((m) => ({ id: m.name, name: m.name, tier: m.tier, states: m.states.length, usages: m.usages.length, props: m.props.length, a11y: m.a11y.length, usedBy: m.usedBy?.length ?? 0, figma: m.figma?.length ?? 0, gaps: gapsOf(m), meta: m })), []);
  const list = rows.filter((r) => (tier === 'all' || r.tier === tier) && (!gapsOnly || r.gaps.length));
  const withA11y = rows.filter((r) => r.a11y > 0).length, onPage = rows.filter((r) => r.usedBy > 0).length, withGaps = rows.filter((r) => r.gaps.length).length;
  return (
    <div className="page stack">
      <PageHeader code="D-08" title="Component states matrix" subtitle="Every component with its documented states, usages, props, accessibility notes and the pages that use it. Gaps are flagged (R-X81: no component without a meta, no meta without a usage).">
        <div className="dq-toolbar"><Tabs size="sm" value={tier} onChange={(v) => setTier(v as Tier | 'all')} items={[{ key: 'all', label: 'All', count: rows.length }, ...TIER_ORDER.map((t) => ({ key: t, label: t[0].toUpperCase() + t.slice(1) + 's', count: rows.filter((r) => r.tier === t).length }))]} /><Toggle size="sm" checked={gapsOnly} onChange={setGapsOnly} label="Gaps only" /></div>
      </PageHeader>
      <div className="dq-stat-grid"><StatTile label="Components" value={rows.length} icon="grid" /><StatTile label="With a11y notes" value={`${withA11y} / ${rows.length}`} icon="shield" tone="primary" /><StatTile label="Used on a page" value={`${onPage} / ${rows.length}`} icon="spec" /><StatTile label="With gaps" value={withGaps} icon="warning" hint={`${Math.round(((rows.length - withGaps) / rows.length) * 100)} % clean`} /></div>
      <Section title="Matrix" description="Counts per signal; click a name to open it in the component library.">
        <DataTable rows={list} rowKey={(r) => r.id} searchable dense pageSize={100}
          columns={[{ key: 'name', label: 'Component', render: (r) => <Link to={`/dev/components#${r.name}`} className="mono">{r.name}</Link> }, { key: 'tier', label: 'Tier', render: (r) => <Badge size="sm" tone="primary">{r.tier}</Badge> }, { key: 'states', label: 'States', align: 'right' }, { key: 'usages', label: 'Usages', align: 'right' }, { key: 'props', label: 'Props', align: 'right', hideOnCard: true }, { key: 'a11y', label: 'A11y notes', align: 'right', render: (r) => <span className={r.a11y ? 'tone-success' : 'faint'}>{r.a11y || '—'}</span> }, { key: 'usedBy', label: 'Pages', align: 'right', render: (r) => (r.usedBy ? <span title={r.meta.usedBy!.join(', ')}>{r.usedBy}</span> : <span className="faint">—</span>) }, { key: 'figma', label: 'Figma', align: 'right', hideOnCard: true, render: (r) => (r.figma ? r.figma : <span className="faint">—</span>) }, { key: 'gaps', label: 'Gaps', sortable: false, render: (r) => (r.gaps.length ? <span className="dq-states">{r.gaps.map((g) => <Badge key={g} size="sm" tone="warn">{g}</Badge>)}</span> : <Badge size="sm" tone="success">clean</Badge>) }]} />
      </Section>
      <Section title="States by component" description="The states each meta declares; the component library renders the usages that exercise them.">
        <div className="dq-cards">{list.map((r) => <Card key={r.id} className="dq-card" padding="sm"><div className="row-between"><h3>{r.name}</h3><span className="xs faint">{r.tier}</span></div><div className="dq-states">{r.meta.states.map((s) => <Chip key={s} size="sm">{s}</Chip>)}{!r.meta.states.length && <span className="xs faint">no states declared</span>}</div></Card>)}</div>
      </Section>
      <Section title="Accessibility notes" description="Every a11y note in the library, grouped by component. Empty groups are the gaps.">
        <div className="dq-cards">{list.map((r) => <Card key={r.id} padding="sm" className="dq-card"><h3>{r.name}</h3>{r.meta.a11y.length ? <ul className="xs muted" style={{ margin: 0, paddingLeft: '1.1em' }}>{r.meta.a11y.map((a, i) => <li key={i}>{a}</li>)}</ul> : <span className="xs tone-danger">no accessibility notes</span>}</Card>)}</div>
      </Section>
    </div>
  );
}
