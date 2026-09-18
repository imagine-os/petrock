import type { ReactNode } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import './QaMatrix.css';

export type QaCellStatus = 'pass' | 'warn' | 'fail' | 'none';
export interface QaCell { status: QaCellStatus; count?: number; title?: string }
export interface QaMatrixRow { key: string; label: ReactNode; sub?: ReactNode }
export interface QaMatrixCol { key: string; label: ReactNode }
export interface QaMatrixProps { rows: QaMatrixRow[]; cols: QaMatrixCol[]; cell: (row: string, col: string) => QaCell; onCell?: (row: string, col: string) => void; dense?: boolean }

const ICON: Record<QaCellStatus, 'check' | 'warning' | 'close' | 'minus'> = { pass: 'check', warn: 'warning', fail: 'close', none: 'minus' };

/** Routes x widths (or any rows x columns) grid with a pass / warn / fail cell each; the row label column sticks on narrow screens. */
export function QaMatrix({ rows, cols, cell, onCell, dense = false }: QaMatrixProps) {
  return (
    <div className={`qam ${dense ? 'is-dense' : ''}`} role="table">
      <div className="qam-scroll">
        <table>
          <thead><tr><th className="qam-rowhead">Route</th>{cols.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row" className="qam-rowhead"><span className="qam-label">{r.label}</span>{r.sub && <span className="qam-sub">{r.sub}</span>}</th>
                {cols.map((c) => { const v = cell(r.key, c.key); const inner = <><Icon name={ICON[v.status]} size={12} />{v.count ? <span className="qam-count">{v.count}</span> : null}</>; return <td key={c.key} className={`qam-cell is-${v.status}`} title={v.title}>{onCell ? <button type="button" onClick={() => onCell(r.key, c.key)} aria-label={`${typeof r.label === 'string' ? r.label : r.key} at ${typeof c.label === 'string' ? c.label : c.key}: ${v.status}${v.count ? `, ${v.count} issues` : ''}`}>{inner}</button> : <span>{inner}</span>}</td>; })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="qam-legend xs muted"><span className="is-pass"><Icon name="check" size={12} /> pass</span><span className="is-warn"><Icon name="warning" size={12} /> warning</span><span className="is-fail"><Icon name="close" size={12} /> fail</span><span className="is-none"><Icon name="minus" size={12} /> not checked</span></div>
    </div>
  );
}
