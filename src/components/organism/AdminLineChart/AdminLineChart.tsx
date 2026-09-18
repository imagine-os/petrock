import { useMemo, useState } from 'react';
import type { AdminChartPoint, AdminChartSeries } from '../AdminBarChart/AdminBarChart';
import { seriesColor, useChartWidth } from '../AdminBarChart/AdminBarChart';
import '../AdminBarChart/AdminBarChart.css';
import './AdminLineChart.css';

export interface AdminLineChartProps { series: AdminChartSeries[]; data: AdminChartPoint[]; format?: (n: number) => string; height?: number; area?: boolean; ariaLabel?: string; table?: boolean; /** Y axis max override (e.g. 100 for percent). */ max?: number }

const niceMax = (v: number) => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10; return m * p; };

/** Line chart with crosshair + tooltip, end-point labels, optional 10 % area wash, table view. Same palette slots as AdminBarChart. */
export function AdminLineChart({ series, data, format = (n) => String(Math.round(n)), height = 200, area = false, ariaLabel = 'Line chart', table = true, max: maxProp }: AdminLineChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [ref, W] = useChartWidth();
  const H = height, padL = 48, padR = 56, padT = 16, padB = 28;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const max = useMemo(() => maxProp ?? niceMax(Math.max(0, ...data.flatMap((d) => series.map((s) => d.values[s.key] ?? 0)))), [data, series, maxProp]);
  const x = (i: number) => (data.length <= 1 ? padL + innerW / 2 : padL + (i / (data.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - (Math.min(v, max) / max) * innerH;
  const ticks = [0, 0.5, 1].map((t) => t * max);
  const skipX = Math.max(1, Math.ceil(data.length / Math.max(3, Math.floor(innerW / 64))));
  const tip = hover != null && data.length ? data[hover] : null;
  if (!data.length) return <div className="alchart" ref={ref}><div className="achart-empty">No data for this period</div></div>;
  return (
    <div className="alchart achart" role="figure" aria-label={ariaLabel} ref={ref}>
      {series.length > 1 && <div className="achart-legend">{series.map((s, i) => <span key={s.key} className="achart-key"><span className="achart-swatch" style={{ background: seriesColor(s.slot ?? i + 1) }} />{s.label}</span>)}</div>}
      <svg className="alchart-svg" viewBox={`0 0 ${W} ${H}`} onMouseLeave={() => setHover(null)} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; const i = Math.round(((px - padL) / innerW) * (data.length - 1)); setHover(Math.max(0, Math.min(data.length - 1, i))); }}>
        <g className="alchart-grid">{ticks.map((t) => <line key={t} x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />)}</g>
        <g className="alchart-axis">{ticks.map((t) => <text key={t} x={padL - 8} y={y(t) + 4} textAnchor="end">{format(t)}</text>)}{data.map((d, i) => (i % skipX === 0 || i === data.length - 1 ? <text key={i} x={x(i)} y={H - 8} textAnchor="middle">{d.label}</text> : null))}</g>
        {series.map((s, si) => {
          const color = seriesColor(s.slot ?? si + 1);
          const pts = data.map((d, i) => `${x(i)},${y(d.values[s.key] ?? 0)}`);
          const last = data[data.length - 1];
          return (
            <g key={s.key}>
              {area && <polygon className="alchart-area" fill={color} points={`${x(0)},${y(0)} ${pts.join(' ')} ${x(data.length - 1)},${y(0)}`} />}
              <polyline className="alchart-line" stroke={color} points={pts.join(' ')} />
              <circle className="alchart-dot" cx={x(data.length - 1)} cy={y(last.values[s.key] ?? 0)} r={4} fill={color} />
              <text className="alchart-label" x={x(data.length - 1) + 8} y={y(last.values[s.key] ?? 0) + 4}>{format(last.values[s.key] ?? 0)}</text>
            </g>
          );
        })}
        {hover != null && <g><line className="alchart-cross" x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} />{series.map((s, si) => <circle key={s.key} className="alchart-dot" cx={x(hover)} cy={y(data[hover].values[s.key] ?? 0)} r={4} fill={seriesColor(s.slot ?? si + 1)} />)}</g>}
        <rect className="alchart-hit" x={padL} y={padT} width={innerW} height={innerH} />
      </svg>
      {tip && <div className="achart-tip" style={{ left: `${(x(hover!) / W) * 100}%`, top: padT }}><strong>{tip.title ?? tip.label}</strong>{series.map((s, i) => <div key={s.key} className="achart-tip-row"><span className="achart-key"><span className="achart-swatch" style={{ background: seriesColor(s.slot ?? i + 1) }} />{s.label}</span><span>{format(tip.values[s.key] ?? 0)}</span></div>)}</div>}
      {table && <button type="button" className="achart-toggle" onClick={() => setShowTable((t) => !t)}>{showTable ? 'Hide table' : 'Show as table'}</button>}
      {showTable && <table className="achart-table"><thead><tr><th>Period</th>{series.map((s) => <th key={s.key}>{s.label}</th>)}</tr></thead><tbody>{data.map((d, i) => <tr key={i}><td>{d.title ?? d.label}</td>{series.map((s) => <td key={s.key}>{format(d.values[s.key] ?? 0)}</td>)}</tr>)}</tbody></table>}
    </div>
  );
}
