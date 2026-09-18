import { Icon } from '../../atom/Icon/Icon';
import './AdminPermissionMatrix.css';

export interface AdminPermissionMatrixColumn { key: string; label: string; readOnly?: boolean }
export interface AdminPermissionMatrixRow { key: string; label?: string; group?: string }
export interface AdminPermissionMatrixProps {
  columns: AdminPermissionMatrixColumn[];
  rows: AdminPermissionMatrixRow[];
  granted: (row: string, column: string) => boolean;
  onToggle?: (row: string, column: string, next: boolean) => void;
  disabled?: boolean;
}

/** Roles x permissions matrix (R-L05, R-X49): sticky first column and header, grouped rows, click a cell to toggle. */
export function AdminPermissionMatrix({ columns, rows, granted, onToggle, disabled = false }: AdminPermissionMatrixProps) {
  const groups: { group: string; rows: AdminPermissionMatrixRow[] }[] = [];
  for (const r of rows) { const g = r.group ?? ''; const last = groups[groups.length - 1]; if (last && last.group === g) last.rows.push(r); else groups.push({ group: g, rows: [r] }); }
  const counts = Object.fromEntries(columns.map((c) => [c.key, rows.filter((r) => granted(r.key, c.key)).length]));
  return (
    <div className="apm" role="region" aria-label="Permissions matrix">
      <table>
        <thead><tr><th>Permission</th>{columns.map((c) => <th key={c.key}>{c.label}<span className="apm-count">{counts[c.key]} / {rows.length}{c.readOnly ? ' · locked' : ''}</span></th>)}</tr></thead>
        <tbody>
          {groups.map((g) => (
            <GroupRows key={g.group || '_'} group={g.group} rows={g.rows} columns={columns} granted={granted} onToggle={onToggle} disabled={disabled} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupRows({ group, rows, columns, granted, onToggle, disabled }: { group: string; rows: AdminPermissionMatrixRow[]; columns: AdminPermissionMatrixColumn[]; granted: AdminPermissionMatrixProps['granted']; onToggle?: AdminPermissionMatrixProps['onToggle']; disabled: boolean }) {
  return (
    <>
      {group && <tr className="apm-group"><td colSpan={columns.length + 1}>{group}</td></tr>}
      {rows.map((r) => (
        <tr key={r.key}>
          <td className="apm-perm">{r.key}{r.label && <small>{r.label}</small>}</td>
          {columns.map((c) => {
            const on = granted(r.key, c.key);
            const locked = disabled || c.readOnly || !onToggle;
            return <td key={c.key}><button type="button" className={`apm-cell ${on ? 'is-on' : ''}`} disabled={locked} aria-pressed={on} aria-label={`${r.key} for ${c.label}: ${on ? 'granted' : 'not granted'}`} onClick={() => onToggle?.(r.key, c.key, !on)}><Icon name={on ? 'check' : 'minus'} size={14} /></button></td>;
          })}
        </tr>
      ))}
    </>
  );
}
