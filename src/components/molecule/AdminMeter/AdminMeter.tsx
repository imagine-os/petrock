import './AdminMeter.css';

export interface AdminMeterProps { label: string; value: number; max: number; /** Percent at which the bar turns warn / danger. */ warnAt?: number; dangerAt?: number; hint?: string; format?: (value: number, max: number) => string }

/** Capacity / occupancy meter: label, value of max, a single-hue bar that turns warn / danger near the limit. */
export function AdminMeter({ label, value, max, warnAt = 80, dangerAt = 95, hint, format }: AdminMeterProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const tone = pct >= dangerAt ? 'ameter-danger' : pct >= warnAt ? 'ameter-warn' : '';
  return (
    <div className={`ameter ${tone}`} role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className="ameter-head"><span>{label}</span><strong>{format ? format(value, max) : `${value} / ${max}`}</strong></div>
      <div className="ameter-track"><div className="ameter-fill" style={{ width: `${pct}%` }} /></div>
      {(hint || max > 0) && <div className="ameter-foot">{pct}% {hint ? `· ${hint}` : ''}</div>}
    </div>
  );
}
