import { useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { tables, tableRegistry, TABLE_GROUPS, allColumns, type ColumnDef, type BaseRow } from '../../data/schema';
import { useData, useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import { useLocation } from '../../tenant/LocationProvider';
import type { ApprovalRow } from '../../data/schema/core';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Section } from '../../components/molecule/Section/Section';
import { Card } from '../../components/molecule/Card/Card';
import { Badge, toneFor } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { DataTable, formatCell } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { PinApprovalModal, type PinApprovalRequest } from '../../components/organism/PinApprovalModal/PinApprovalModal';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import './dev.css';

/** D-04 table library: every TableDef grouped by area with live row counts. */
export function TablesPage() {
  const data = useData();
  const counts = useMemo(() => Object.fromEntries(tables.map((t) => [t.name, data.peek?.(t.name)?.length ?? 0])), [data]);
  return (
    <div className="page stack">
      <PageHeader code="D-04" title="Table library" subtitle={`${tables.length} tables from src/data/schema/*.ts. Base columns: id, location_id (where scoped), created_at, updated_at. npm run sql writes supabase/schema.sql and docs/data-model.md.`}
        actions={<Button variant="secondary" size="sm" icon="refresh" onClick={() => data.reset?.()}>Reseed mock data</Button>} />
      {TABLE_GROUPS.map((g) => {
        const list = tables.filter((t) => t.group === g.id);
        if (!list.length) return null;
        return (
          <Section key={g.id} title={g.label} description={`${list.length} ${list.length === 1 ? 'table' : 'tables'}`}>
            <div className="tables-grid">
              {list.map((t) => (
                <Link key={t.name} to={`/dev/tables/${t.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card className="table-card" interactive padding="md">
                    <div className="row-between"><h3>{t.name}</h3><Badge size="sm" tone={t.scope === 'location' ? 'primary' : 'neutral'}>{t.scope === 'location' ? 'per location' : 'global'}</Badge></div>
                    <p className="xs muted">{t.description}</p>
                    <div className="table-cols">{t.columns.slice(0, 8).map((c) => <code key={c.name}>{c.name}</code>)}{t.columns.length > 8 && <code>+{t.columns.length - 8}</code>}</div>
                    <div className="row-between xs muted"><span>{counts[t.name]} rows</span><span>{t.columns.length + (t.scope === 'location' ? 4 : 3)} columns</span></div>
                  </Card>
                </Link>
              ))}
            </div>
          </Section>
        );
      })}
    </div>
  );
}

const BASE = new Set(['id', 'location_id', 'created_at', 'updated_at']);

function Field({ col, value, onChange, refs }: { col: ColumnDef; value: unknown; onChange: (v: unknown) => void; refs: BaseRow[] }) {
  const label = col.name + (col.nullable ? '' : ' *');
  if (col.references) return <Select label={label} value={(value as string) ?? ''} placeholder={col.nullable ? '(none)' : 'Choose'} onChange={(e) => onChange(e.target.value || null)} options={refs.map((r) => ({ value: r.id, label: String(tableRegistry[col.references!]?.titleColumn ? r[tableRegistry[col.references!].titleColumn!] ?? r.id : r.id) + ` (${r.id})` }))} hint={`→ ${col.references}`} />;
  if (col.type === 'enum' && col.enum) return <Select label={label} value={(value as string) ?? ''} placeholder={col.nullable ? '(none)' : 'Choose'} onChange={(e) => onChange(e.target.value || null)} options={col.enum.map((v) => ({ value: v, label: v }))} />;
  if (col.type === 'bool') return <Checkbox label={col.name} checked={!!value} onChange={(e) => onChange(e.target.checked)} description={col.description} />;
  if (col.type === 'json') return <Textarea label={label} value={typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 0)} onChange={(e) => onChange(e.target.value)} rows={3} hint="JSON" />;
  if (col.type === 'int' || col.type === 'numeric' || col.type === 'money') return <Input label={label} type="number" step={col.type === 'int' ? 1 : 0.01} value={value == null ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} hint={col.description} />;
  if (col.type === 'date') return <Input label={label} type="date" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)} />;
  if (col.type === 'time') return <Input label={label} type="time" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)} />;
  if (col.type === 'timestamptz') return <Input label={label} type="datetime-local" value={value ? String(value).slice(0, 16) : ''} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />;
  return <Input label={label} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || (col.nullable ? null : ''))} hint={col.description} />;
}

/** /dev/tables/:table - the generic table manager: list, add, edit, delete (PIN-gated) any table. */
export function TableManagerPage() {
  const { table = '' } = useParams();
  const def = tableRegistry[table];
  const data = useData();
  const { can, user } = useSession();
  const { locationId } = useLocation();
  const { toast } = useToast();
  const { rows } = useTable(table);
  const [editing, setEditing] = useState<{ row: Partial<BaseRow>; isNew: boolean } | null>(null);
  const [pin, setPin] = useState<{ req: PinApprovalRequest; then: (a: ApprovalRow) => void } | null>(null);
  const [busy, setBusy] = useState(false);
  const refRows = useMemo(() => Object.fromEntries((def?.columns ?? []).filter((c) => c.references).map((c) => [c.references!, data.peek?.(c.references!) ?? []])), [def, data]);

  if (!def) return <div className="page"><EmptyState icon="table" title={`No table named "${table}"`} body="Tables are defined in src/data/schema/<area>.ts." action={<Link to="/dev/tables"><Button variant="secondary">Table library</Button></Link>} /></div>;

  const cols = allColumns(def);
  const visible = cols.filter((c) => !c.wide);
  const titleOf = (r: BaseRow) => String(def.titleColumn ? r[def.titleColumn] ?? r.id : r.id);
  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const patch: Record<string, unknown> = {};
    for (const c of def.columns) {
      let v = editing.row[c.name];
      if (c.type === 'json' && typeof v === 'string') { try { v = v.trim() ? JSON.parse(v) : null; } catch { toast({ tone: 'danger', title: `${c.name} is not valid JSON` }); setBusy(false); return; } }
      patch[c.name] = v ?? (c.type === 'bool' ? false : null);
    }
    try {
      if (editing.isNew) { if (def.scope === 'location') patch.location_id = editing.row.location_id ?? locationId; await data.insert(table, patch); toast('Row added'); }
      else { await data.update(table, editing.row.id!, patch); toast('Row saved'); }
      await data.insert('audit_log', { location_id: locationId, user_id: user.id, user_name: user.name, action: editing.isNew ? 'insert' : 'update', table_name: table, row_id: editing.row.id ?? null, diff: patch });
      setEditing(null);
    } finally { setBusy(false); }
  };
  const remove = (r: BaseRow) => setPin({
    req: { action: 'record.delete', title: `Delete ${table} / ${titleOf(r)}?`, description: 'Deleting records needs a manager PIN. The approval is recorded first.', subjectTable: table, subjectId: r.id },
    then: async (a) => { await data.remove(table, r.id); await data.insert('audit_log', { location_id: locationId, user_id: user.id, user_name: user.name, action: 'delete', table_name: table, row_id: r.id, diff: { approval_id: a.id } }); setPin(null); setEditing(null); toast({ tone: 'warn', title: 'Row deleted', body: `Approved by ${a.approved_by_name}` }); },
  });

  return (
    <div className="page stack">
      <PageHeader code="D-04" backTo="/dev/tables" title={def.label} subtitle={def.description} eyebrow={<code>{table}</code>}
        actions={<>{can('tables.write') && <Button icon="plus" onClick={() => setEditing({ row: Object.fromEntries(def.columns.map((c) => [c.name, c.type === 'bool' ? false : null])), isNew: true })}>Add row</Button>}<Link to="/dev/tables"><Button variant="ghost" icon="table">All tables</Button></Link></>}>
        <div className="row wrap xs"><Badge size="sm" tone={def.scope === 'location' ? 'primary' : 'neutral'}>{def.scope === 'location' ? 'per location' : 'global'}</Badge><Badge size="sm">{def.group}</Badge>{def.source && <span className="muted">source: {def.source}</span>}{def.access?.map((a) => <span key={a} className="muted">· {a}</span>)}</div>
      </PageHeader>
      <DataTable rows={rows} rowKey={(r) => r.id} searchable dense pageSize={50} onRowClick={(r) => setEditing({ row: r, isNew: false })}
        filters={cols.filter((c) => c.type === 'enum' && c.enum).slice(0, 3).map((c) => ({ key: c.name, label: c.name, options: c.enum!.map((v) => ({ value: v, label: v })), test: (r: BaseRow, v: string) => r[c.name] === v }))}
        columns={visible.map((c) => ({ key: c.name, label: c.name, mono: c.type === 'uuid' || c.type === 'timestamptz', hideOnCard: BASE.has(c.name) && c.name !== 'id', render: c.type === 'enum' ? (r: BaseRow) => (r[c.name] ? <Badge size="sm" tone={toneFor(String(r[c.name]))}>{String(r[c.name])}</Badge> : formatCell(null)) : c.type === 'money' ? (r: BaseRow) => (r[c.name] == null ? formatCell(null) : `$${Number(r[c.name]).toFixed(2)}`) : c.references ? (r: BaseRow) => (r[c.name] ? <Link to={`/dev/tables/${c.references}`} onClick={(e) => e.stopPropagation()} className="xs mono">{String(r[c.name])}</Link> : formatCell(null)) : undefined, align: ['money', 'int', 'numeric'].includes(c.type) ? 'right' as const : undefined }))}
        rowActions={can('tables.write') ? (r) => <span><Button size="sm" variant="ghost" icon="edit" onClick={() => setEditing({ row: r, isNew: false })} aria-label="Edit" /><Button size="sm" variant="ghost" icon="trash" onClick={() => remove(r)} aria-label="Delete" /></span> : undefined} />
      <Drawer open={!!editing} onClose={() => setEditing(null)} title={<h3>{editing?.isNew ? `New ${def.label.toLowerCase()} row` : titleOf(editing?.row as BaseRow ?? { id: '' })}</h3>} width={520}
        footer={<>{!editing?.isNew && can('tables.write') && <Button variant="danger" icon="trash" onClick={() => remove(editing!.row as BaseRow)}>Delete</Button>}<span className="grow" /><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>{can('tables.write') && <Button onClick={save} loading={busy}>Save</Button>}</>}>
        {editing && (
          <div className="stack">
            {!editing.isNew && <div className="row wrap xs muted">{cols.filter((c) => BASE.has(c.name)).map((c) => <span key={c.name}><code>{c.name}</code> {formatCell(editing.row[c.name]) as ReactNode}</span>)}</div>}
            {editing.isNew && def.scope === 'location' && <Field col={{ name: 'location_id', type: 'uuid', references: 'locations' }} value={editing.row.location_id ?? locationId} onChange={(v) => setEditing((e) => e && ({ ...e, row: { ...e.row, location_id: v as string } }))} refs={data.peek?.('locations') ?? []} />}
            {def.columns.map((c) => <Field key={c.name} col={c} value={editing.row[c.name]} onChange={(v) => setEditing((e) => e && ({ ...e, row: { ...e.row, [c.name]: v } }))} refs={c.references ? refRows[c.references] ?? [] : []} />)}
          </div>
        )}
      </Drawer>
      <PinApprovalModal open={!!pin} request={pin?.req ?? null} onClose={() => setPin(null)} onApproved={(a) => pin?.then(a)} />
    </div>
  );
}
