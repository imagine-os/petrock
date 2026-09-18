import { Link } from 'react-router-dom';
import { tables, type TableDef } from '../../../data/schema';
import { Icon } from '../../atom/Icon/Icon';
import { Badge } from '../../atom/Badge/Badge';
import './TableRelationsPanel.css';

export interface TableRelationsPanelProps { table: TableDef; counts?: Record<string, number>; linkTo?: (table: string) => string; onPick?: (table: string, column: string, direction: 'out' | 'in') => void }

export interface Relation { table: string; column: string; nullable: boolean }
export function relationsOf(def: TableDef): { outgoing: Relation[]; incoming: Relation[] } {
  const outgoing = def.columns.filter((c) => c.references).map((c) => ({ table: c.references!, column: c.name, nullable: !!c.nullable }));
  if (def.scope === 'location') outgoing.unshift({ table: 'locations', column: 'location_id', nullable: false });
  const incoming: Relation[] = [];
  for (const t of tables) { for (const c of t.columns) if (c.references === def.name) incoming.push({ table: t.name, column: c.name, nullable: !!c.nullable }); if (t.scope === 'location' && def.name === 'locations') incoming.push({ table: t.name, column: 'location_id', nullable: false }); }
  return { outgoing, incoming };
}

/** D-10: what a table points to and what points at it, from ColumnDef.references; each side links to that table. */
export function TableRelationsPanel({ table, counts, linkTo = (t) => `/dev/data/${t}`, onPick }: TableRelationsPanelProps) {
  const { outgoing, incoming } = relationsOf(table);
  const Row = ({ r, dir }: { r: Relation; dir: 'out' | 'in' }) => (
    <li className="trp-row">
      <Link to={linkTo(r.table)} className="trp-table"><Icon name="table" size={12} />{r.table}</Link>
      <code className="trp-col">{dir === 'out' ? `${table.name}.${r.column}` : `${r.table}.${r.column}`}</code>
      {r.nullable && <Badge size="sm">optional</Badge>}
      {counts && counts[r.table] != null && <span className="xs faint">{counts[r.table]} rows</span>}
      {onPick && <button type="button" className="trp-pick xs" onClick={() => onPick(r.table, r.column, dir)}>show rows</button>}
    </li>
  );
  return (
    <div className="trp">
      <div className="trp-side"><div className="eyebrow">References ({outgoing.length})</div>{outgoing.length ? <ul>{outgoing.map((r) => <Row key={`${r.table}.${r.column}`} r={r} dir="out" />)}</ul> : <p className="xs faint">Points to nothing.</p>}</div>
      <div className="trp-side"><div className="eyebrow">Referenced by ({incoming.length})</div>{incoming.length ? <ul>{incoming.map((r) => <Row key={`${r.table}.${r.column}`} r={r} dir="in" />)}</ul> : <p className="xs faint">Nothing points here.</p>}</div>
    </div>
  );
}
