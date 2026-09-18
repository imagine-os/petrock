import type { ReactNode } from 'react';
import type { QuoteLine } from '../../../pricing/engine';
import { fmtMoney } from '../../../pricing/engine';
import './BookingChargeSummary.css';

export interface BookingChargeSummaryProps {
  lines: QuoteLine[];
  subtotal: number; discountTotal: number; feeTotal: number; taxTotal: number; total: number;
  deposit?: number;
  notes?: string[];
  compact?: boolean;
  /** Extra footer content (e.g. payment buttons). */
  footer?: ReactNode;
}

/** Invoice-style breakdown of a stay: line items by kind, subtotal, discounts, tax, card fee, total, deposits and balance (R-D14, R-H08). All numbers come from the pricing engine. */
export function BookingChargeSummary({ lines, subtotal, discountTotal, feeTotal, taxTotal, total, deposit, notes = [], compact = false, footer }: BookingChargeSummaryProps) {
  const balance = deposit != null ? Math.round((total - deposit) * 100) / 100 : null;
  const items = lines.filter((l) => l.kind === 'room' || l.kind === 'service' || l.kind === 'addon');
  return (
    <div className={`charges ${compact ? 'is-compact' : ''}`}>
      <ul className="charges-lines">
        {items.map((l, i) => (
          <li key={i} className="charges-line">
            <span className="charges-label">{l.label}<span className="charges-qty muted xs">{l.qty > 1 ? ` · ${l.qty} × ${fmtMoney(l.unit)}` : ''}</span></span>
            <span className="charges-amt mono">{fmtMoney(l.amount)}</span>
          </li>
        ))}
        {items.length === 0 && <li className="charges-line muted">No charges yet</li>}
      </ul>
      <dl className="charges-totals">
        <div><dt>Subtotal</dt><dd className="mono">{fmtMoney(subtotal)}</dd></div>
        {discountTotal > 0 && <div className="is-discount"><dt>Discounts{lines.filter((l) => l.kind === 'discount').map((l) => <span key={l.label} className="charges-sub xs">{l.label}</span>)}</dt><dd className="mono">−{fmtMoney(discountTotal)}</dd></div>}
        {taxTotal > 0 && <div><dt>Tax{lines.filter((l) => l.kind === 'tax').map((l) => <span key={l.label} className="charges-sub xs">{l.label}</span>)}</dt><dd className="mono">{fmtMoney(taxTotal)}</dd></div>}
        {feeTotal > 0 && <div><dt>Card fee{lines.filter((l) => l.kind === 'fee').map((l) => <span key={l.label} className="charges-sub xs">{l.label}</span>)}</dt><dd className="mono">{fmtMoney(feeTotal)}</dd></div>}
        <div className="is-total"><dt>Total charge</dt><dd className="mono">{fmtMoney(total)}</dd></div>
        {deposit != null && <div><dt>Deposits</dt><dd className="mono">−{fmtMoney(deposit)}</dd></div>}
        {balance != null && <div className={`is-balance ${balance <= 0 ? 'is-settled' : ''}`}><dt>Balance</dt><dd className="mono">{balance < 0 ? `(${fmtMoney(-balance)})` : fmtMoney(balance)}</dd></div>}
      </dl>
      {notes.length > 0 && <ul className="charges-notes xs muted">{notes.map((n) => <li key={n}>{n}</li>)}</ul>}
      {footer && <div className="charges-footer">{footer}</div>}
    </div>
  );
}
