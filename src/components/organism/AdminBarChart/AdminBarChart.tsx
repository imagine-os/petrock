import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type React from 'react';
import './AdminBarChart.css';

export interface AdminChartSeries { key: string; label: string; /** 1-4 picks a validated categorical slot; default = index + 1. */ slot?: 1 | 2 | 3 | 4 }
export interface AdminChartPoint { label: string; values: Record<string, number>; /** Longer label for the tooltip. */ title?: string }
export interface AdminBarChartProps {
  series: AdminChartSeries[];
  data: AdminChartPoint[];
  stacked?: boolean;
  /** Formats values for axis, labels and tooltip (e.g. fmtMoney). */
  format?: (n: number) => string;
  height?: number;
  /** Label the extreme bar (default true). Never every bar. */
  labelMax?: boolean;
  ariaLabel?: string;
  /** Show the data-table toggle (default true). */
  table?: boolean;
}

const niceMax = (v: number) => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10; return m * p; };
export const seriesColor = (slot: number) => `var(--achart-${((slot - 1) % 4) + 1})`;

/** Measures the chart container so the SVG viewBox matches its pixel width and text stays 11 px at any card size. */
export function useChartWidth(fallback = 640): [React.RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current; if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => { const cw = Math.round(entries[0]?.contentRect.width ?? 0); if (cw > 0) setW(Math.max(280, cw)); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/**
 * Bar / column chart (grouped or stacked) with hover tooltip, legend for >= 2 series, selective direct label and a
 * table view. Colours are the four validated categorical slots (light and dark steps) defined in AdminBarChart.css.
 */
export function AdminBarChart({ series, data, stacked = false, format = (n) => String(Math.round(n)), height = 220, labelMax = true, ariaLabel = 'Bar chart', table = true }: AdminBarChartProps) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [ref, W] = useChartWidth();
  const H = height, padL = 52, padR = 12, padT = 16, padB = 28;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const max = useMemo(() => niceMax(Math.max(0, ...data.map((d) => (stacked ? series.reduce((s, k) => s + (d.values[k.key] ?? 0), 0) : Math.max(...series.map((k) => d.values[k.key] ?? 0)))))), [data, series, stacked]);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const band = data.length ? innerW / data.length : innerW;
  const barMax = 24;
  const groupN = stacked ? 1 : series.length;
  const barW = Math.min(barMax, (band * 0.7) / groupN);
  const gap = 2;
  const y = (v: number) => padT + innerH - (v / max) * innerH;
  const maxIdx = useMemo(() => { let bi = -1, bv = -Infinity; data.forEach((d, i) => { const v = stacked ? series.reduce((s, k) => s + (d.values[k.key] ?? 0), 0) : Math.max(...series.map((k) => d.values[k.key] ?? 0)); if (v > bv) { bv = v; bi = i; } }); return bi; }, [data, series, stacked]);
  const tip = hover != null && data.length ? data[hover] : null;
  const tipX = hover != null ? ((padL + band * hover + band / 2) / W) * 100 : 0;
  const skipX = Math.max(1, Math.ceil(data.length / Math.max(4, Math.floor(innerW / 56))));
  if (!data.length) return <div className="achart" ref={ref}><div className="achart-empty">No data for this period</div></div>;
  return (
    <div className="achart" role="figure" aria-label={ariaLabel} ref={ref}>
      {series.length > 1 && <div className="achart-legend">{series.map((s, i) => <span key={s.key} className="achart-key"><span className="achart-swatch" style={{ background: seriesColor(s.slot ?? i + 1) }} />{s.label}</span>)}</div>}
      <svg className="achart-svg" viewBox={`0 0 ${W} ${H}`} onMouseLeave={() => setHover(null)} aria-hidden={showTable}>
        <g className="achart-grid">{ticks.map((t) => <line key={t} x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />)}</g>
        <g className="achart-axis">{ticks.map((t) => <text key={t} x={padL - 8} y={y(t) + 4} textAnchor="end">{format(t)}</text>)}{data.map((d, i) => (i % skipX === 0 ? <text key={i} x={padL + band * i + band / 2} y={H - 8} textAnchor="middle">{d.label}</text> : null))}</g>
        {data.map((d, i) => {
          const x0 = padL + band * i + (band - barW * groupN - (groupN - 1) * gap) / 2;
          let acc = 0;
          return (
            <g key={i} className={`achart-band ${hover === i ? 'is-active' : ''}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${d.title ?? d.label}: ${series.map((s) => `${s.label} ${format(d.values[s.key] ?? 0)}`).join(', ')}`}>
              <rect className="achart-hit" x={padL + band * i} y={padT} width={band} height={innerH} />
              {series.map((s, si) => {
                const v = d.values[s.key] ?? 0;
                const color = seriesColor(s.slot ?? si + 1);
                if (stacked) { const y1 = y(acc + v), y0 = y(acc); acc += v; const h = Math.max(0, y0 - y1 - (si > 0 ? gap : 0)); const top = si === series.length - 1; return <rect key={s.key} className="achart-bar" x={x0} y={y1} width={barW} height={h} fill={color} rx={top ? 4 : 0} clipPath={`url(#${id}-clip)`} />; }
                const bx = x0 + si * (barW + gap); const h = Math.max(0, y(0) - y(v));
                return <rect key={s.key} className="achart-bar" x={bx} y={y(v)} width={barW} height={h} fill={color} rx={4} clipPath={`url(#${id}-clip)`} />;
              })}
              {labelMax && i === maxIdx && <text className="achart-label" x={padL + band * i + band / 2} y={y(stacked ? series.reduce((s2, k) => s2 + (d.values[k.key] ?? 0), 0) : Math.max(...series.map((k) => d.values[k.key] ?? 0))) - 6} textAnchor="middle">{format(stacked ? series.reduce((s2, k) => s2 + (d.values[k.key] ?? 0), 0) : Math.max(...series.map((k) => d.values[k.key] ?? 0)))}</text>}
            </g>
          );
        })}
        <defs><clipPath id={`${id}-clip`}><rect x={0} y={0} width={W} height={y(0)} /></clipPath></defs>
      </svg>
      {tip && <div className="achart-tip" style={{ left: `${tipX}%`, top: padT }}><strong>{tip.title ?? tip.label}</strong>{series.map((s, i) => <div key={s.key} className="achart-tip-row"><span className="achart-key"><span className="achart-swatch" style={{ background: seriesColor(s.slot ?? i + 1) }} />{s.label}</span><span>{format(tip.values[s.key] ?? 0)}</span></div>)}</div>}
      {table && <button type="button" className="achart-toggle" onClick={() => setShowTable((t) => !t)}>{showTable ? 'Hide table' : 'Show as table'}</button>}
      {showTable && <table className="achart-table"><thead><tr><th>Period</th>{series.map((s) => <th key={s.key}>{s.label}</th>)}</tr></thead><tbody>{data.map((d, i) => <tr key={i}><td>{d.title ?? d.label}</td>{series.map((s) => <td key={s.key}>{format(d.values[s.key] ?? 0)}</td>)}</tr>)}</tbody></table>}
    </div>
  );
}
