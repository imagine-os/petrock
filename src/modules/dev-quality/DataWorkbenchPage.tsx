import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { tables, tableRegistry, allColumns, TABLE_GROUPS, type BaseRow, type ColumnDef } from '../../data/schema';
import { useData, useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import { useLocation } from '../../tenant/LocationProvider';
import type { ApprovalRow } from '../../data/schema/core';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Section } from '../../components/molecule/Section/Section';
import { Card } from '../../components/molecule/Card/Card';
import { Badge, toneFor } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { Chip } from '../../components/atom/Chip/Chip';
import { DataTable, formatCell } from '../../components/organism/DataTable/DataTable';
import { InlineCell, type InlineCellType } from '../../components/molecule/InlineCell/InlineCell';
import { TableRelationsPanel, relationsOf } from '../../components/organism/TableRelationsPanel/TableRelationsPanel';
import { CsvImportModal, toCsv } from '../../components/organism/CsvImportModal/CsvImportModal';
import { PinApprovalModal, type PinApprovalRequest } from '../../components/organism/PinApprovalModal/PinApprovalModal';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { downloadText } from './SpecReportPage';
import './dev-quality.css';

const BASE = new Set(['id', 'location_id', 'created_at', 'updated_at']);
const cellType = (c: ColumnDef): InlineCellType => (BASE.has(c.name) ? 'readonly' : c.type === 'bool' ? 'bool' : c.type === 'enum' ? 'enum' : ['int', 'numeric', 'money'].includes(c.type) ? 'number' : c.type === 'date' ? 'date' : c.type === 'json' ? 'json' : c.references || c.type === 'timestamptz' ? 'text' : 'text');

/** D-10 index: every table with relation counts. */
function WorkbenchIndex() {
  const data = useData();
  const counts = useMemo(() => Object.fromEntries(tables.map((t) => [t.name, data.peek?.(t.name)?.length ?? 0])), [data]);
  return (
    <div className="page stack">
      <PageHeader code="D-10" title="Data workbench" subtitle="Inline editing, relations, CSV import / export on any table. Deletes and bulk imports need a manager PIN; every write is audited (R-X84)." actions={<Link to="/dev/tables"><Button variant="ghost" icon="table">Table library</Button></Link>} />
      {TABLE_GROUPS.map((g) => { const list = tables.filter((t) => t.group === g.id); if (!list.length) return null; return (
        <Section key={g.id} title={g.label}><div className="dq-cards">{list.map((t) => { const rel = relationsOf(t); return <Link key={t.name} to={`/dev/data/${t.name}`} style={{ textDecoration: 'none', color: 'inherit' }}><Card interactive padding="sm" className="dq-card"><div className="row-between"><h3>{t.name}</h3><span className="xs muted">{counts[t.name]} rows</span></div><div className="row wrap xs muted"><span>→ {rel.outgoing.length} refs</span><span>← {rel.incoming.length} referenced by</span><span>{t.columns.length} cols</span></div></Card></Link>; })}</div></Section>); })}
    </div>
  );
}

/** D-10 table view. */
export function DataWorkbenchPage() {
  const { table = '' } = useParams();
  const def = tableRegistry[table];
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const data = useData();
  const { can, user } = useSession();
  const { locationId } = useLocation();
  const { toast } = useToast();
  const { rows } = useTable(table || 'locations');
  const [pin, setPin] = useState<{ req: PinApprovalRequest; then: (a: ApprovalRow) => void } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [showRel, setShowRel] = useState(false);
  if (!table) return <WorkbenchIndex />;
  if (!def) return <div className="page"><EmptyState icon="table" title={`No table named "${table}"`} action={<Link to="/dev/data"><Button variant="secondary">Workbench index</Button></Link>} /></div>;
  const cols = allColumns(def);
  const visible = cols.filter((c) => !c.wide);
  const ref = params.get('ref'); // column:id
  const filtered = ref ? rows.filter((r) => { const [c, id] = ref.split(':'); return r[c] === id; }) : rows;
  const audit = (action: string, rowId: string | null, diff: Record<string, unknown>) => data.insert('audit_log', { location_id: locationId, user_id: user.id, user_name: user.name, action, table_name: table, row_id: rowId, diff });
  const commit = async (r: BaseRow, c: ColumnDef, v: unknown) => { await data.update(table, r.id, { [c.name]: v }); await audit('update', r.id, { [c.name]: [r[c.name], v] }); toast({ tone: 'success', title: `${c.name} saved` }); };
  const remove = (r: BaseRow) => setPin({ req: { action: 'record.delete', title: `Delete ${table} / ${r.id}?`, description: 'Deleting records needs a manager PIN (R-P01).', subjectTable: table, subjectId: r.id }, then: async (a) => { await data.remove(table, r.id); await audit('delete', r.id, { approval_id: a.id }); setPin(null); toast({ tone: 'warn', title: 'Row deleted' }); } });
  const addRow = async () => { const row: Record<string, unknown> = Object.fromEntries(def.columns.map((c) => [c.name, c.type === 'bool' ? false : c.type === 'enum' && c.enum && !c.nullable ? c.enum[0] : null])); if (def.scope === 'location') row.location_id = locationId; const ins = await data.insert(table, row); await audit('insert', ins.id, row); toast('Row added; edit its cells inline'); };
  const doImport = async (list: Record<string, unknown>[], mode: 'insert' | 'upsert') => {
    let ins = 0, upd = 0;
    for (const r of list) { const { id, created_at: _c, updated_at: _u, ...rest } = r as Record<string, unknown> & { id?: string }; if (mode === 'upsert' && id && rows.some((x) => x.id === id)) { await data.update(table, id, rest); upd++; } else { if (def.scope === 'location' && !rest.location_id) rest.location_id = locationId; await data.insert(table, rest); ins++; } }
    await audit('import', null, { inserted: ins, updated: upd, mode });
    toast({ tone: 'success', title: `Imported ${ins} new, ${upd} updated` });
  };
  const importRows = (list: Record<string, unknown>[], mode: 'insert' | 'upsert') => new Promise<void>((resolve) => { if (list.length <= 1) return doImport(list, mode).then(resolve); setPin({ req: { action: 'table.import', title: `Import ${list.length} rows into ${table}?`, description: 'Bulk imports need a manager PIN (R-X84).', subjectTable: table, details: { rows: list.length, mode } }, then: async () => { setPin(null); await doImport(list, mode); resolve(); } }); });
  const exportCsv = () => downloadText(`${table}${ref ? `-${ref.replace(':', '-')}` : ''}.csv`, toCsv(filtered as Record<string, unknown>[], cols.map((c) => c.name)), 'text/csv');
  const writable = can('tables.write');
  return (
    <div className="page stack">
      <PageHeader code="D-10" backTo="/dev/data" title={def.label} subtitle={def.description} eyebrow={<code>{table}</code>}
        actions={<><Select size="sm" aria-label="Table" value={table} onChange={(e) => nav(`/dev/data/${e.target.value}`)} options={tables.map((t) => ({ value: t.name, label: t.name }))} /><Button size="sm" variant="secondary" icon="download" onClick={exportCsv}>Export CSV</Button>{writable && <Button size="sm" variant="secondary" icon="upload" onClick={() => setImportOpen(true)}>Import CSV</Button>}{writable && <Button size="sm" icon="plus" onClick={addRow}>Add row</Button>}</>}>
        <div className="row wrap xs"><Badge size="sm" tone={def.scope === 'location' ? 'primary' : 'neutral'}>{def.scope === 'location' ? 'per location' : 'global'}</Badge><Badge size="sm">{def.group}</Badge><Chip size="sm" selected={showRel} onClick={() => setShowRel((s) => !s)} icon="layers">relations</Chip>{ref && <Chip size="sm" selected onRemove={() => { params.delete('ref'); setParams(params); }}>{ref.split(':')[0]} = {ref.split(':')[1]}</Chip>}<Link to={`/dev/tables/${table}`} className="xs">form editor (D-04) →</Link></div>
      </PageHeader>
      {showRel && <Section title="Relations" description="What this table points to and what points at it. 'show rows' filters the other table to rows linked to the first row here."><TableRelationsPanel table={def} counts={Object.fromEntries(tables.map((t) => [t.name, data.peek?.(t.name)?.length ?? 0]))} onPick={(t, c, dir) => { const first = filtered[0]; if (!first) return; if (dir === 'in') nav(`/dev/data/${t}?ref=${c}:${first.id}`); else nav(`/dev/data/${t}?ref=id:${String(first[c] ?? '')}`); }} /></Section>}
      <DataTable rows={filtered} rowKey={(r) => r.id} searchable dense pageSize={50} emptyText={ref ? 'No rows match this relation' : 'No rows'}
        filters={cols.filter((c) => c.type === 'enum' && c.enum).slice(0, 3).map((c) => ({ key: c.name, label: c.name, options: c.enum!.map((v) => ({ value: v, label: v })), test: (r: BaseRow, v: string) => r[c.name] === v }))}
        columns={visible.map((c) => ({ key: c.name, label: c.name, mono: c.type === 'uuid' || c.type === 'timestamptz', hideOnCard: BASE.has(c.name) && c.name !== 'id', align: ['money', 'int', 'numeric'].includes(c.type) ? 'right' as const : undefined,
          render: (r: BaseRow) => <InlineCell value={r[c.name]} type={writable ? cellType(c) : 'readonly'} options={c.enum} nullable={c.nullable} label={`${c.name} of ${r.id}`} onCommit={(v) => commit(r, c, v)}
            render={c.type === 'enum' ? () => (r[c.name] ? <Badge size="sm" tone={toneFor(String(r[c.name]))}>{String(r[c.name])}</Badge> : formatCell(null)) : c.type === 'money' ? () => (r[c.name] == null ? formatCell(null) : `$${Number(r[c.name]).toFixed(2)}`) : c.references && r[c.name] ? () => <span className="xs mono">{String(r[c.name])} <Link to={`/dev/data/${c.references}?ref=id:${String(r[c.name])}`} onClick={(e) => e.stopPropagation()} title={`open ${c.references}`}>↗</Link></span> : undefined} /> }))}
        rowActions={writable ? (r) => <Button size="sm" variant="ghost" icon="trash" onClick={() => remove(r)} aria-label="Delete row" /> : undefined} />
      <CsvImportModal open={importOpen} table={def} onClose={() => setImportOpen(false)} onImport={importRows} />
      <PinApprovalModal open={!!pin} request={pin?.req ?? null} onClose={() => setPin(null)} onApproved={(a) => pin?.then(a)} />
    </div>
  );
}
