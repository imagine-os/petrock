import type { QuoteLine } from '../../../pricing/engine';
import { fmtMoney } from '../../../pricing/engine';
import './ServiceQuoteLines.css';

export interface ServiceQuoteLinesProps { lines: QuoteLine[]; total: number; totalLabel?: string; notes?: string[]; compact?: boolean; showQty?: boolean }

/** Line items + grand total for a grooming or daycare quote (service, add-on, discount, tax, fee lines from the pricing engine). */
export function ServiceQuoteLines({ lines, total, totalLabel = 'Grand total', notes = [], compact = false, showQty = true }: ServiceQuoteLinesProps) {
  return (
    <div className={`quotelines ${compact ? 'is-compact' : ''}`}>
      <dl className="quotelines-list">
        {lines.map((l, i) => (
          <div key={`${l.label}-${i}`} className={`quotelines-row kind-${l.kind}`}>
            <dt>{l.label}{showQty && l.qty > 1 && <span className="muted xs"> × {l.qty}</span>}</dt>
            <dd>{l.amount < 0 ? `−${fmtMoney(-l.amount)}` : fmtMoney(l.amount)}</dd>
          </div>
        ))}
      </dl>
      <div className="quotelines-total"><span>{totalLabel}</span><strong>{fmtMoney(total)}</strong></div>
      {notes.length > 0 && <ul className="quotelines-notes xs muted">{notes.map((n) => <li key={n}>{n}</li>)}</ul>}
    </div>
  );
}
