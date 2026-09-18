import { useId, useState } from 'react';
import { Button } from '../../atom/Button/Button';
import './ReportBarChart.css';

export interface ReportBarDatum { label: string; value: number; hint?: string }
export interface ReportBarChartProps { data: ReportBarDatum[]; title: string; format?: (v: number) => string; height?: number; /** Label every nth bar on the x axis (auto when omitted). */ labelEvery?: number; unit?: string }

/**
 * Single-series bar chart for reports: one hue (primary), thin rounded bars anchored to the baseline, recessive grid,
 * direct labels on the max and last bars, hover tooltip per bar and a table view toggle. One axis, no legend (one series).
 */
export function ReportBarChart({ data, title, format = (v) => String(v), height = 180, labelEvery, unit }: ReportBarChartProps) {
  const id = useId();
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 600, padL = 8, padR = 8, padT = 18, padB = 22;
  const innerW = W - padL - padR, innerH = height - padT - padB;
  const n = Math.max(1, data.length);
  const gap = 2, bw = Math.max(2, innerW / n - gap);
  const every = labelEvery ?? Math.max(1, Math.ceil(n / 8));
  const maxIdx = data.findIndex((d) => d.value === max);
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <figure className="rbar" aria-labelledby={`${id}-t`}>
      <figcaption className="rbar-head"><span id={`${id}-t`} className="rbar-title">{title}</span><span className="rbar-total muted xs">total {format(total)}{unit ? ` ${unit}` : ''}</span><Button size="sm" variant="ghost" icon={table ? 'chart' : 'table'} onClick={() => setTable((t) => !t)}>{table ? 'Chart' : 'Table'}</Button></figcaption>
      {table ? (
        <div className="rbar-tablewrap"><table className="rbar-table"><thead><tr><th>Period</th><th className="rbar-num">Value</th></tr></thead><tbody>{data.map((d) => <tr key={d.label}><td>{d.label}{d.hint && <span className="muted xs"> · {d.hint}</span>}</td><td className="rbar-num">{format(d.value)}</td></tr>)}</tbody></table></div>
      ) : (
        <div className="rbar-plot" onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`${title}: ${data.map((d) => `${d.label} ${format(d.value)}`).join(', ')}`} preserveAspectRatio="none" className="rbar-svg">
            {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1={padL} x2={W - padR} y1={padT + innerH - innerH * f} y2={padT + innerH - innerH * f} className="rbar-grid" />)}
            <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} className="rbar-base" />
            {data.map((d, i) => {
              const h = Math.max(d.value > 0 ? 2 : 0, (d.value / max) * innerH);
              const x = padL + i * (innerW / n) + gap / 2, y = padT + innerH - h;
              const labelled = i === maxIdx || i === n - 1;
              return (
                <g key={d.label} className={`rbar-bar ${hover === i ? 'is-hover' : ''}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0}>
                  <rect x={x - gap / 2} y={padT} width={bw + gap} height={innerH} className="rbar-hit" />
                  <rect x={x} y={y} width={bw} height={h} rx={Math.min(4, bw / 2)} className="rbar-fill" />
                  {h > 0 && <rect x={x} y={padT + innerH - Math.min(4, h)} width={bw} height={Math.min(4, h)} className="rbar-fill" />}
                  {labelled && d.value > 0 && <text x={x + bw / 2} y={y - 5} textAnchor="middle" className="rbar-val">{format(d.value)}</text>}
                  {i % every === 0 && <text x={x + bw / 2} y={height - 6} textAnchor="middle" className="rbar-x">{d.label}</text>}
                </g>
              );
            })}
          </svg>
          {hover != null && data[hover] && <div className="rbar-tip" style={{ left: `${((hover + 0.5) / n) * 100}%` }}><strong>{format(data[hover].value)}</strong><span>{data[hover].label}{data[hover].hint ? ` · ${data[hover].hint}` : ''}</span></div>}
        </div>
      )}
    </figure>
  );
}
