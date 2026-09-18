import type { ReactNode } from 'react';
import type { QuoteLine } from '../../../pricing/engine';
import { fmtMoney } from '../../../pricing/engine';
import { Icon } from '../../atom/Icon/Icon';
import './HotelEstimateCard.css';

export interface HotelEstimateCardProps {
  title?: ReactNode;
  icon?: 'bed' | 'scissors' | 'sun' | 'dollar';
  headline?: ReactNode;
  lines: QuoteLine[];
  /** Totals; when omitted the card ends after the lines (use `total` to print a bold TOTAL row). */
  total?: number;
  totalLabel?: string;
  /** Extra rows after the total (deposit, balance due). */
  extras?: { label: ReactNode; value: ReactNode; strong?: boolean; tone?: 'success' | 'muted' | 'danger' }[];
  notes?: string[];
  footnote?: ReactNode;
  compact?: boolean;
}

/** Line-item card for estimates and invoices (Figma Booking Detail): label / qty x unit / amount rows, discounts in green, TOTAL, extra rows, engine notes. */
export function HotelEstimateCard({ title, icon = 'bed', headline, lines, total, totalLabel = 'Total', extras = [], notes = [], footnote, compact = false }: HotelEstimateCardProps) {
  return (
    <section className={`estcard ${compact ? 'is-compact' : ''}`}>
      {(title || headline) && <header className="estcard-head"><span className="estcard-icon" aria-hidden><Icon name={icon} size={18} /></span><h3 className="estcard-title">{title}</h3>{headline && <span className="estcard-headline">{headline}</span>}</header>}
      <dl className="estcard-lines">
        {lines.map((l, i) => (
          <div key={`${l.label}-${i}`} className={`estcard-line is-${l.kind}`}>
            <dt><span className="estcard-label">{l.label}</span>{l.kind === 'room' || l.kind === 'service' || l.kind === 'addon' ? <span className="estcard-qty">{l.qty > 1 ? `${l.qty} × ${fmtMoney(l.unit)}` : ''}</span> : null}</dt>
            <dd>{l.amount < 0 ? `−${fmtMoney(Math.abs(l.amount))}` : fmtMoney(l.amount)}</dd>
          </div>
        ))}
        {lines.length === 0 && <div className="estcard-line"><dt className="muted">Nothing to price yet</dt><dd>—</dd></div>}
      </dl>
      {total != null && <div className="estcard-total"><span>{totalLabel}</span><strong>{fmtMoney(total)}</strong></div>}
      {extras.length > 0 && <div className="estcard-extras">{extras.map((e, i) => <div key={i} className={`estcard-extra ${e.strong ? 'is-strong' : ''} ${e.tone ? `tone-${e.tone}` : ''}`}><span>{e.label}</span><span>{e.value}</span></div>)}</div>}
      {notes.length > 0 && <ul className="estcard-notes">{notes.map((n) => <li key={n}><Icon name="info" size={12} /> {n}</li>)}</ul>}
      {footnote && <p className="estcard-foot">{footnote}</p>}
    </section>
  );
}
