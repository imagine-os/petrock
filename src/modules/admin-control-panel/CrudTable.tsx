/**
 * Module-internal composition (not a library component): Card + DataTable + AdminRecordDrawer with audited CRUD.
 * Every settings / pricing / staff list in the Control Panel is one of these, configured with columns and fields.
 */
import { useMemo, useState, type ReactNode } from 'react';
import type { BaseRow } from '../../data/schema/types';
import { useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import type { Permission } from '../../auth/permissions';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { DataTable, type DataTableColumn, type DataTableFilter } from '../../components/organism/DataTable/DataTable';
import { AdminRecordDrawer, type AdminField } from '../../components/organism/AdminRecordDrawer/AdminRecordDrawer';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useAdminCrud } from './lib';

export interface CrudTableProps<T extends BaseRow> {
  table: string;
  title: ReactNode;
  description?: ReactNode;
  columns: DataTableColumn<T>[];
  fields: AdminField[];
  /** Filter rows (e.g. location scope). */
  where?: Record<string, unknown>;
  filterRows?: (rows: T[]) => T[];
  orderBy?: { column: string; dir?: 'asc' | 'desc' };
  /** Defaults for a new row (location_id etc.). */
  defaults?: () => Partial<T>;
  permission?: Permission;
  /** Row label for toasts. */
  rowLabel?: (row: T) => string;
  addLabel?: string;
  filters?: DataTableFilter<T>[];
  searchable?: boolean;
  dense?: boolean;
  /** Allow delete (PIN-gated). Default true. */
  deletable?: boolean;
  /** Extra toolbar actions. */
  actions?: ReactNode;
  /** Optional preview inside the drawer. */
  preview?: (values: Record<string, unknown>) => ReactNode;
  /** Transform values before save. */
  beforeSave?: (values: Record<string, unknown>, isNew: boolean) => Record<string, unknown>;
  /** Runs after a successful insert / update with the raw form values. */
  afterSave?: (values: Record<string, unknown>, isNew: boolean) => Promise<void> | void;
  pageSize?: number;
  emptyText?: string;
  cardBreakpoint?: number;
}

export function CrudTable<T extends BaseRow>({ table, title, description, columns, fields, where, filterRows, orderBy, defaults, permission = 'settings.write', rowLabel, addLabel = 'Add', filters, searchable = false, dense = true, deletable = true, actions, preview, beforeSave, afterSave, pageSize = 100, emptyText, cardBreakpoint }: CrudTableProps<T>) {
  // Always pass an orderBy so the provider returns a fresh array (a query-less useTable hands back its live array).
  const { rows: raw } = useTable<T>(table, { where, orderBy: orderBy ?? { column: 'created_at' } });
  const rows = useMemo(() => (filterRows ? filterRows(raw) : raw), [raw, filterRows]);
  const { can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Record<string, unknown> | null | undefined>(undefined);
  const writable = can(permission);
  const keys = useMemo(() => fields.map((f) => f.key), [fields]);
  const save = async (values: Record<string, unknown>) => {
    const isNew = !values.id;
    const v = beforeSave ? beforeSave(values, isNew) : values;
    const patch = crud.clean(v, [...keys, 'location_id']);
    if (isNew) { await crud.insert<T>(table, { ...(defaults?.() ?? {}), ...patch } as Partial<T>); toast({ tone: 'success', title: 'Added', body: String(title) }); }
    else { await crud.update<T>(table, String(values.id), patch as Partial<T>); toast({ tone: 'success', title: 'Saved', body: rowLabel ? rowLabel(values as unknown as T) : String(title) }); }
    await afterSave?.(values, isNew);
  };
  return (
    <>
      <Card padding="md" header={<div className="acp-card-title"><div><h3>{title}</h3>{description && <p className="acp-note">{description}</p>}</div><div className="row wrap" style={{ gap: 8 }}>{actions}{writable && <Button size="sm" icon="plus" onClick={() => setEditing(defaults ? { ...(defaults() as Record<string, unknown>) } : {})}>{addLabel}</Button>}</div></div>}>
        <DataTable<T> rows={rows} rowKey={(r) => r.id} columns={columns} dense={dense} pageSize={pageSize} searchable={searchable} filters={filters} emptyText={emptyText} cardBreakpoint={cardBreakpoint} stickyHeader={false}
          onRowClick={writable ? (r) => setEditing(r as unknown as Record<string, unknown>) : undefined}
          rowActions={writable ? (r) => <Button size="sm" variant="ghost" icon="edit" onClick={() => setEditing(r as unknown as Record<string, unknown>)} aria-label="Edit">Edit</Button> : undefined} />
      </Card>
      <AdminRecordDrawer open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing?.id ? `Edit ${rowLabel ? rowLabel(editing as unknown as T) : ''}` : `${addLabel}`} fields={fields} initial={editing ?? null} onSave={save} subjectTable={table}
        onDelete={deletable && writable ? async (values, approval) => { await crud.remove(table, String(values.id), approval.id); toast({ tone: 'warn', title: 'Deleted', body: `Approved by ${approval.approved_by_name}` }); } : undefined}
        children={preview} />
    </>
  );
}
