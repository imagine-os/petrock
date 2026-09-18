import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { rules as codeRules, RULE_CATEGORY_LABEL, RULE_STATUS_LABEL, type Rule, type RuleCategory, type RuleStatus } from '../../rules';
import { useData, useTable } from '../../data/DataContext';
import type { RuleRow } from '../../data/schema/core';
import { useSession } from '../../auth/SessionProvider';
import { getRoutes } from '../../app/registry';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Badge, toneFor } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { useToast } from '../../components/molecule/Toast/Toast';
import './dev.css';

const STATUSES = Object.keys(RULE_STATUS_LABEL) as RuleStatus[];
const CATS = Object.keys(RULE_CATEGORY_LABEL) as RuleCategory[];

/** D-05 / A-40: the rules registry (code rules merged with runtime rows), filters, and the add-rule form. */
export function RulesPage({ code = 'D-05' }: { code?: string }) {
  const data = useData();
  const { can, user } = useSession();
  const { toast } = useToast();
  const { rows: dbRules } = useTable<RuleRow>('rules');
  const routes = getRoutes();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ id: '', title: '', description: '', category: 'operations' as RuleCategory, status: 'requested' as RuleStatus, pages: '', source: '' });
  const [busy, setBusy] = useState(false);

  const merged = useMemo<(Rule & { origin: 'code' | 'runtime'; rowId?: string })[]>(() => {
    const map = new Map<string, Rule & { origin: 'code' | 'runtime'; rowId?: string }>();
    for (const r of codeRules) map.set(r.id, { ...r, origin: 'code' });
    for (const r of dbRules) map.set(r.rule_id, { id: r.rule_id, title: r.title, description: r.description ?? '', category: (r.category as RuleCategory) ?? 'operations', status: (r.status as RuleStatus) ?? 'requested', pages: r.pages ?? [], source: r.source ?? '', origin: 'runtime', rowId: r.id });
    return [...map.values()].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [dbRules]);
  const count = (s: RuleStatus) => merged.filter((r) => r.status === s).length;
  const codeOf = (c: string) => routes.find((r) => r.spec.code === c);
  const nextId = () => { const n = merged.filter((r) => r.id.startsWith('R-X')).map((r) => Number(r.id.slice(3))).filter((x) => !isNaN(x)); return `R-X${String((n.length ? Math.max(...n) : 0) + 1).padStart(2, '0')}`; };
  const openAdd = () => { setForm({ id: nextId(), title: '', description: '', category: 'operations', status: 'requested', pages: '', source: `${user.name}, ${new Date().toISOString().slice(0, 10)}` }); setAdding(true); };
  const save = async () => {
    if (!form.title.trim() || !form.id.trim()) return;
    setBusy(true);
    await data.insert('rules', { rule_id: form.id.trim(), title: form.title.trim(), description: form.description.trim() || null, category: form.category, status: form.status, pages: form.pages.split(/[,\s]+/).filter(Boolean), source: form.source || null, requested_by: user.id });
    setBusy(false); setAdding(false); toast({ tone: 'success', title: 'Rule added', body: `${form.id} · ${RULE_STATUS_LABEL[form.status]}` });
  };
  const setStatus = async (r: typeof merged[number], status: RuleStatus) => {
    if (r.origin === 'runtime' && r.rowId) await data.update('rules', r.rowId, { status });
    else await data.insert('rules', { rule_id: r.id, title: r.title, description: r.description, category: r.category, status, pages: r.pages, source: `${r.source} (status changed by ${user.name})`, requested_by: user.id });
    toast(`${r.id} → ${RULE_STATUS_LABEL[status]}`);
  };

  return (
    <div className="page stack">
      <PageHeader code={code} title={code === 'A-40' ? 'Settings › Rules' : 'Business rules registry'} subtitle="Every rule the system enforces or should enforce, with status. Each page's builder tool lists the rules it uses; ids are append-only." actions={can('rules.write') ? <Button icon="plus" onClick={openAdd}>Add rule</Button> : undefined} />
      <div className="grid grid-4">{STATUSES.map((s) => <StatTile key={s} label={RULE_STATUS_LABEL[s]} value={count(s)} icon={s === 'implemented' ? 'check' : s === 'in_dev' ? 'code' : s === 'requested' ? 'flag' : 'trash'} tone={s === 'implemented' ? 'primary' : 'default'} />)}</div>
      <DataTable rows={merged} rowKey={(r) => r.id} searchable pageSize={200} dense
        filters={[{ key: 'category', label: 'Category', options: CATS.map((c) => ({ value: c, label: RULE_CATEGORY_LABEL[c] })), test: (r, v) => r.category === v }, { key: 'status', label: 'Status', options: STATUSES.map((s) => ({ value: s, label: RULE_STATUS_LABEL[s] })), test: (r, v) => r.status === v }]}
        columns={[
          { key: 'id', label: 'Id', mono: true, width: 80, render: (r) => <span id={r.id} style={{ scrollMarginTop: 80 }}>{r.id}</span> },
          { key: 'title', label: 'Rule', render: (r) => <div><div>{r.title}</div>{r.description && <div className="rule-desc">{r.description}</div>}</div> },
          { key: 'category', label: 'Category', render: (r) => <Badge size="sm">{RULE_CATEGORY_LABEL[r.category] ?? r.category}</Badge> },
          { key: 'status', label: 'Status', render: (r) => can('rules.write') ? <Select size="sm" aria-label={`Status of ${r.id}`} value={r.status} onChange={(e) => setStatus(r, e.target.value as RuleStatus)} options={STATUSES.map((s) => ({ value: s, label: RULE_STATUS_LABEL[s] }))} /> : <Badge size="sm" tone={toneFor(r.status)}>{RULE_STATUS_LABEL[r.status]}</Badge> },
          { key: 'pages', label: 'Pages', sortable: false, render: (r) => <span className="row wrap" style={{ gap: 4 }}>{r.pages.map((p) => codeOf(p) ? <Link key={p} to={codeOf(p)!.path} className="xs mono">{p}</Link> : <span key={p} className="xs mono faint" title="No route yet">{p}</span>)}</span> },
          { key: 'source', label: 'Source', hideOnCard: true, render: (r) => <span className="xs muted">{r.source}{r.implementedIn ? ` · ${r.implementedIn}` : ''}</span> },
          { key: 'origin', label: 'Origin', hideOnCard: true, render: (r) => <Badge size="sm" tone={r.origin === 'code' ? 'neutral' : 'info'}>{r.origin}</Badge> },
        ]} />
      <Drawer open={adding} onClose={() => setAdding(false)} title={<h3>Add a business rule</h3>} footer={<><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button onClick={save} loading={busy} disabled={!form.title.trim()}>Add rule</Button></>}>
        <div className="stack">
          <Input label="Rule id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} hint="R-Xnn for owner-requested rules; ids are append-only" required />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Dog 55 lb or greater must be a Suite" required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="grid grid-2"><Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as RuleCategory })} options={CATS.map((c) => ({ value: c, label: RULE_CATEGORY_LABEL[c] }))} /><Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RuleStatus })} options={STATUSES.map((s) => ({ value: s, label: RULE_STATUS_LABEL[s] }))} /></div>
          <Input label="Pages (codes)" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} placeholder="C-30, F-11" hint="Comma separated page codes" />
          <Input label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
        </div>
      </Drawer>
    </div>
  );
}
