import { Badge } from '../../atom/Badge/Badge';
import './BudgetBar.css';

export interface BudgetBarProps { label: string; value: number | null; budget: number; unit: string; warnAtPercent?: number; hint?: string }

export function budgetStatus(value: number | null, budget: number, warnAt = 80): 'pass' | 'warn' | 'fail' | 'none' {
  if (value == null || !budget) return 'none';
  const pct = (value / budget) * 100;
  return pct > 100 ? 'fail' : pct >= warnAt ? 'warn' : 'pass';
}
const fmt = (n: number, unit: string) => (unit === 'kb' ? `${n.toFixed(n >= 100 ? 0 : 1)} kB` : unit === 'ms' ? `${Math.round(n)} ms` : unit === 'percent' ? `${n.toFixed(1)} %` : String(Math.round(n)));

/** D-16: one metric against its budget as a thin meter; the number is text, the bar is the picture. */
export function BudgetBar({ label, value, budget, unit, warnAtPercent = 80, hint }: BudgetBarProps) {
  const status = budgetStatus(value, budget, warnAtPercent);
  const pct = value == null ? 0 : Math.min(100, (value / budget) * 100);
  return (
    <div className={`bb is-${status}`}>
      <div className="bb-head"><span className="bb-label">{label}</span><span className="bb-nums mono xs">{value == null ? '—' : fmt(value, unit)} <span className="faint">/ {fmt(budget, unit)}</span></span><Badge size="sm" tone={status === 'pass' ? 'success' : status === 'warn' ? 'warn' : status === 'fail' ? 'danger' : 'neutral'}>{status === 'none' ? 'no data' : `${Math.round((value! / budget) * 100)} %`}</Badge></div>
      <div className="bb-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={budget} aria-valuenow={value ?? undefined} aria-valuetext={value == null ? 'no data' : `${fmt(value, unit)} of ${fmt(budget, unit)}`}><div className="bb-fill" style={{ width: `${pct}%` }} /><div className="bb-warn" style={{ left: `${warnAtPercent}%` }} aria-hidden="true" /></div>
      {hint && <div className="bb-hint xs faint">{hint}</div>}
    </div>
  );
}
