import { useMemo, useState, type ReactNode } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import { Input } from '../../atom/Input/Input';
import { Select } from '../../atom/Select/Select';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './DataTable.css';

export interface DataTableColumn<T> {
  key: string;
  label: ReactNode;
  render?: (row: T) => ReactNode;
  /** Value used for sorting / filtering when render is custom. */
  value?: (row: T) => unknown;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  /** Figma cell colour per column role (598:23546..23562): muted #7C7E93 (id / room / breed), heading #11104A (customer), date #181818, primary #552583 (times / counts / phones / money). */
  tone?: 'muted' | 'heading' | 'date' | 'primary';
  /** Column group header (e.g. "Dates", "Money"). Adjacent columns with the same group share one header cell. */
  group?: string;
  /** Hide on the phone card layout. */
  hideOnCard?: boolean;
}
export interface DataTableFilter<T> { key: string; label: string; options: { value: string; label: string }[]; test: (row: T, value: string) => boolean }
export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
  /** Show the built-in search box. */
  searchable?: boolean;
  search?: string;
  filters?: DataTableFilter<T>[];
  emptyText?: string;
  dense?: boolean;
  pageSize?: number;
  stickyHeader?: boolean;
  /** Below this width rows render as cards (default 768). */
  cardBreakpoint?: number;
  toolbar?: ReactNode;
  rowActions?: (row: T) => ReactNode;
}

function cmp(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

/** The one table: sortable, searchable, filterable, column groups, sticky header, pagination, card fallback on phones. */
export function DataTable<T extends object>({ columns, rows, rowKey, onRowClick, selectedKey, searchable = false, search: extSearch, filters = [], emptyText, dense = false, pageSize = 50, stickyHeader = true, cardBreakpoint = 768, toolbar, rowActions }: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);
  const [intSearch, setIntSearch] = useState('');
  const [active, setActive] = useState<Record<string, string>>({});
  const search = extSearch ?? intSearch;
  const get = (r: T, key: string) => (r as Record<string, unknown>)[key];
  const val = (c: DataTableColumn<T>, r: T) => (c.value ? c.value(r) : get(r, c.key));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = rows;
    for (const f of filters) { const v = active[f.key]; if (v) out = out.filter((r) => f.test(r, v)); }
    if (q) out = out.filter((r) => columns.some((c) => String(val(c, r) ?? '').toLowerCase().includes(q)));
    return out;
  }, [rows, columns, search, filters, active]);
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const c = columns.find((x) => x.key === sort.key);
    const s = [...filtered].sort((a, b) => cmp(c ? val(c, a) : get(a, sort.key), c ? val(c, b) : get(b, sort.key)));
    return sort.dir === 'asc' ? s : s.reverse();
  }, [filtered, sort, columns]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const visible = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const toggleSort = (key: string) => setSort((s) => (s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }));

  const groups: { label: string; span: number }[] = [];
  const hasGroups = columns.some((c) => c.group);
  if (hasGroups) for (const c of columns) { const last = groups[groups.length - 1]; if (last && last.label === (c.group ?? '')) last.span++; else groups.push({ label: c.group ?? '', span: 1 }); }
  const cols = rowActions ? columns.length + 1 : columns.length;

  return (
    <div className={`datatable ${dense ? 'is-dense' : ''}`} style={{ ['--dt-card-bp' as string]: `${cardBreakpoint}px` }}>
      {(searchable || filters.length > 0 || toolbar) && (
        <div className="datatable-toolbar">
          {searchable && extSearch === undefined && <Input size="sm" icon="search" placeholder="Search" value={intSearch} onChange={(e) => { setIntSearch(e.target.value); setPage(0); }} aria-label="Search table" className="datatable-search" />}
          {filters.map((f) => <Select key={f.key} size="sm" aria-label={f.label} placeholder={f.label} value={active[f.key] ?? ''} onChange={(e) => { setActive((a) => ({ ...a, [f.key]: e.target.value })); setPage(0); }} options={f.options} className="datatable-filter" />)}
          {toolbar && <div className="datatable-toolbar-extra">{toolbar}</div>}
        </div>
      )}
      <div className={`datatable-scroll ${cardBreakpoint >= 768 ? 'cards-md' : 'cards-sm'}`}>
        <table>
          <thead className={stickyHeader ? 'is-sticky' : ''}>
            {hasGroups && <tr className="datatable-groups">{groups.map((g, i) => <th key={i} colSpan={g.span} className={g.label ? 'has-group' : ''}>{g.label}</th>)}{rowActions && <th />}</tr>}
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width, textAlign: c.align }} aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortable === false ? c.label : <button type="button" className="datatable-sort" onClick={() => toggleSort(c.key)}>{c.label}<Icon name={sort?.key === c.key ? (sort.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'sort'} size={12} className="datatable-sorticon" /></button>}
                </th>
              ))}
              {rowActions && <th className="datatable-actions-h" aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <tr className="datatable-emptyrow"><td colSpan={cols}><EmptyState compact icon="search" title={emptyText ?? 'No rows'} /></td></tr>}
            {visible.map((r) => {
              const k = rowKey(r);
              return (
                <tr key={k} className={`${onRowClick ? 'is-clickable' : ''} ${selectedKey === k ? 'is-selected' : ''}`} onClick={onRowClick ? () => onRowClick(r) : undefined} tabIndex={onRowClick ? 0 : undefined} onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(r); } : undefined}>
                  {columns.map((c) => <td key={c.key} data-label={typeof c.label === 'string' ? c.label : c.key} className={`${c.mono ? 'mono' : ''} ${c.hideOnCard ? 'hide-card' : ''} ${c.tone ? `cell-${c.tone}` : ''}`} style={{ textAlign: c.align }}>{c.render ? c.render(r) : formatCell(get(r, c.key))}</td>)}
                  {rowActions && <td className="datatable-actions" onClick={(e) => e.stopPropagation()}>{rowActions(r)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="datatable-foot">
        <span className="muted xs">{sorted.length} {sorted.length === 1 ? 'row' : 'rows'}{sorted.length !== rows.length ? ` of ${rows.length}` : ''}</span>
        {pages > 1 && <span className="row"><button type="button" className="datatable-page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Previous page">‹</button><span className="xs mono">{safePage + 1} / {pages}</span><button type="button" className="datatable-page" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)} aria-label="Next page">›</button></span>}
      </div>
    </div>
  );
}

export function formatCell(v: unknown): ReactNode {
  if (v == null || v === '') return <span className="faint">—</span>;
  if (typeof v === 'boolean') return v ? <Icon name="check" size={14} className="tone-success" /> : <span className="faint">·</span>;
  if (typeof v === 'object') return <code className="datatable-json">{JSON.stringify(v)}</code>;
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return <span className="mono xs">{s.slice(0, 16).replace('T', ' ')}</span>;
  return s;
}
