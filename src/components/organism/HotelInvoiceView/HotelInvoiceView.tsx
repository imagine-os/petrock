import type { QuoteLine } from '../../../pricing/engine';
import { fmtMoney } from '../../../pricing/engine';
import { Badge, toneFor } from '../../atom/Badge/Badge';
import './HotelInvoiceView.css';

export interface InvoiceViewPayment { date: string | null; method: string; amount: number; status: string; last4?: string | null; brand?: string | null; isDeposit?: boolean }
export interface HotelInvoiceViewProps {
  number: string;
  status: string;
  issuedAt?: string | null;
  business: { name: string; address?: string; phone?: string | null; taxNumber?: string | null };
  customer: { name: string; email?: string; phone?: string; address?: string | null };
  reference: { code: string; title: string; pets: string[]; checkIn: string; checkOut: string; nights: number };
  lines: QuoteLine[] | { label: string; qty: number; unit: number; amount: number }[];
  subtotal: number; discountTotal: number; taxTotal: number; feeTotal: number; total: number; deposit: number; balance: number;
  payments?: InvoiceViewPayment[];
  footer?: string | null;
}

const d = (iso?: string | null, withTime = false) => (iso ? new Date(iso).toLocaleString('en-US', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }) : '—');

/** Printable invoice for a stay (R-H09 / R-H10): header, parties, reference block, line items, totals, deposit and balance, payments, footer "Rock Out With Your Paws Out!". */
export function HotelInvoiceView({ number, status, issuedAt, business, customer, reference, lines, subtotal, discountTotal, taxTotal, feeTotal, total, deposit, balance, payments = [], footer }: HotelInvoiceViewProps) {
  return (
    <article className="inv">
      <header className="inv-head">
        <div><div className="inv-brand"><img src="./brand/petrock-mark.svg" alt="" width={34} height={34} /><strong>{business.name}</strong></div>{business.address && <div className="inv-muted">{business.address}</div>}{business.phone && <div className="inv-muted">{business.phone}</div>}{business.taxNumber && <div className="inv-muted">Tax no. {business.taxNumber}</div>}</div>
        <div className="inv-meta"><h1 className="inv-title">Invoice</h1><div className="inv-number">{number}</div><div className="inv-muted">Issued {d(issuedAt)}</div><Badge tone={toneFor(status)} size="sm">{status}</Badge></div>
      </header>
      <section className="inv-parties">
        <div><div className="eyebrow">Billed to</div><strong>{customer.name}</strong>{customer.email && <div className="inv-muted">{customer.email}</div>}{customer.phone && <div className="inv-muted">{customer.phone}</div>}{customer.address && <div className="inv-muted">{customer.address}</div>}</div>
        <div><div className="eyebrow">Stay</div><strong>{reference.title} · {reference.code}</strong><div className="inv-muted">{reference.pets.join(', ')}</div><div className="inv-muted">{d(reference.checkIn, true)} → {d(reference.checkOut, true)}</div><div className="inv-muted">{reference.nights} night{reference.nights === 1 ? '' : 's'}</div></div>
      </section>
      <table className="inv-table">
        <thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Unit</th><th className="num">Amount</th></tr></thead>
        <tbody>{lines.map((l, i) => <tr key={i} className={l.amount < 0 ? 'is-discount' : ''}><td>{l.label}</td><td className="num">{l.qty}</td><td className="num">{fmtMoney(l.unit)}</td><td className="num">{fmtMoney(l.amount)}</td></tr>)}</tbody>
      </table>
      <section className="inv-totals">
        <div><span>Subtotal</span><span>{fmtMoney(subtotal)}</span></div>
        {discountTotal > 0 && <div className="is-discount"><span>Discounts</span><span>−{fmtMoney(discountTotal)}</span></div>}
        <div><span>Tax</span><span>{fmtMoney(taxTotal)}</span></div>
        {feeTotal > 0 && <div><span>Card service fee</span><span>{fmtMoney(feeTotal)}</span></div>}
        <div className="is-total"><span>Total</span><span>{fmtMoney(total)}</span></div>
        <div><span>Paid / deposit</span><span>−{fmtMoney(deposit)}</span></div>
        <div className={`is-balance ${balance > 0 ? 'is-due' : ''}`}><span>Balance due</span><span>{fmtMoney(balance)}</span></div>
      </section>
      {payments.length > 0 && (
        <section className="inv-payments"><div className="eyebrow">Payments</div>
          <ul>{payments.map((p, i) => <li key={i}><span>{d(p.date, true)}</span><span>{p.method === 'card' ? `${p.brand ?? 'Card'} •••• ${p.last4 ?? '????'}` : 'Cash at location'}{p.isDeposit ? ' · deposit' : ''}</span><Badge size="sm" tone={toneFor(p.status)}>{p.status}</Badge><strong>{fmtMoney(p.amount)}</strong></li>)}</ul>
        </section>
      )}
      {footer && <footer className="inv-foot">{footer}</footer>}
    </article>
  );
}
