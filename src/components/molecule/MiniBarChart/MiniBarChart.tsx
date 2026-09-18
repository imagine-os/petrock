import { useState } from 'react';
import './MiniBarChart.css';

export interface MiniBarDatum { label: string; value: number; hint?: string }
export interface MiniBarChartProps { data: MiniBarDatum[]; format?: (v: number) => string; height?: number; title: string; /** Show every Nth x label (default auto). */ labelEvery?: number }

/** Single-series bar chart (one hue, thin bars, rounded tops, hover tooltip) with a table view toggle. Used by the seed inspector (D-14). */
export function MiniBarChart({ data, format = (v) => String(v), height = 140, title, labelEvery }: MiniBarChartProps) {
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const every = labelEvery ?? Math.max(1, Math.ceil(data.length / 12));
  return (
    <div className="mbc">
      <div className="mbc-head"><span className="mbc-title">{title}</span><button type="button" className="mbc-toggle xs" onClick={() => setTable((t) => !t)} aria-pressed={table}>{table ? 'Chart' : 'Table'}</button></div>
      {table ? (
        <div className="mbc-tablewrap"><table className="mbc-table"><thead><tr><th>Period</th><th>Value</th></tr></thead><tbody>{data.map((d) => <tr key={d.label}><td>{d.label}</td><td className="mono">{format(d.value)}</td></tr>)}</tbody></table></div>
      ) : (
        <div className="mbc-plot" style={{ height }} role="img" aria-label={`${title}: ${data.map((d) => `${d.label} ${format(d.value)}`).join(', ')}`}>
          {data.map((d, i) => (
            <div key={d.label} className={`mbc-col ${hover === i ? 'is-hover' : ''}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}>
              <div className="mbc-bar" style={{ height: `${(d.value / max) * 100}%` }} />
              {hover === i && <div className="mbc-tip" role="tooltip"><strong>{format(d.value)}</strong><span>{d.hint ?? d.label}</span></div>}
              <span className={`mbc-x ${i % every === 0 ? '' : 'is-hidden'}`}>{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
