import { Badge, toneFor } from '../../atom/Badge/Badge';
import './DeskInvoiceSheet.css';

export interface DeskInvoiceLine { label: string; qty: number; unit: number; amount: number; kind?: string }
export interface DeskInvoiceSheetProps {
  number: string; status: string; issuedAt: string | null; preview?: boolean;
  business: { name: string; address?: string | null; phone?: string | null; taxNumber?: string | null };
  customer: { name: string; email?: string | null; mobile?: string | null; address?: string | null };
  meta?: { label: string; value: string }[];
  lines: DeskInvoiceLine[]; subtotal: number; discountTotal: number; feeTotal: number; taxTotal: number; total: number; deposit: number; balance: number;
  note?: string | null; footer?: string | null;
}
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not issued');

/** Printable invoice (front desk-5/-8 "Your appointment" panel grown into a full sheet): business, customer, meta, service lines, discount / tax / fee lines, totals, deposit and balance, footer. Print CSS hides the app shell. */
export function DeskInvoiceSheet({ number, status, issuedAt, preview = false, business, customer, meta = [], lines, subtotal, discountTotal, feeTotal, taxTotal, total, deposit, balance, note, footer }: DeskInvoiceSheetProps) {
  const services = lines.filter((l) => !l.kind || l.kind === 'service' || l.kind === 'addon' || l.kind === 'room');
  const extras = lines.filter((l) => l.kind === 'discount' || l.kind === 'tax' || l.kind === 'fee');
  return (
    <article className={`invsheet ${preview ? 'is-preview' : ''}`} aria-label={`Invoice ${number}`}>
      {preview && <div className="invsheet-watermark" aria-hidden>PREVIEW</div>}
      <header className="invsheet-head">
        <div className="invsheet-brand"><img src="./brand/petrock-mark.svg" alt="" width={40} height={40} /><div><strong>{business.name}</strong>{business.address && <div className="xs muted">{business.address}</div>}{business.phone && <div className="xs muted">{business.phone}</div>}{business.taxNumber && <div className="xs muted">Tax no. {business.taxNumber}</div>}</div></div>
        <div className="invsheet-title"><span className="eyebrow">Invoice</span><h2>{number}</h2><Badge tone={toneFor(status)} size="sm">{status}</Badge><div className="xs muted">{fmt(issuedAt)}</div></div>
      </header>
      <section className="invsheet-parties">
        <div><span className="eyebrow">Bill to</span><strong>{customer.name}</strong>{customer.address && <div className="xs muted">{customer.address}</div>}{customer.email && <div className="xs muted">{customer.email}</div>}{customer.mobile && <div className="xs muted">{customer.mobile}</div>}</div>
        {meta.length > 0 && <dl className="invsheet-meta">{meta.map((m) => <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>)}</dl>}
      </section>
      <table className="invsheet-table">
        <thead><tr><th>Item</th><th className="num">Qty</th><th className="num">Unit</th><th className="num">Amount</th></tr></thead>
        <tbody>
          {services.map((l, i) => <tr key={i}><td>{l.label}</td><td className="num">{l.qty}</td><td className="num">{money(l.unit)}</td><td className="num">{money(l.amount)}</td></tr>)}
          {services.length === 0 && <tr><td colSpan={4} className="muted">No lines</td></tr>}
        </tbody>
      </table>
      <div className="invsheet-totals">
        <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
        {extras.map((l, i) => <div key={i}><span>{l.label}</span><span>{money(l.amount)}</span></div>)}
        {extras.length === 0 && discountTotal > 0 && <div><span>Discount</span><span>-{money(discountTotal)}</span></div>}
        {extras.length === 0 && taxTotal > 0 && <div><span>Tax</span><span>{money(taxTotal)}</span></div>}
        {extras.length === 0 && feeTotal > 0 && <div><span>Card fee</span><span>{money(feeTotal)}</span></div>}
        <div className="is-total"><span>Total</span><span>{money(total)}</span></div>
        {deposit > 0 && <div><span>Paid / deposit</span><span>-{money(deposit)}</span></div>}
        <div className={`is-balance ${balance > 0 ? 'is-due' : ''}`}><span>Balance due</span><span>{money(balance)}</span></div>
      </div>
      {note && <p className="invsheet-note"><strong>Note:</strong> {note}</p>}
      {footer && <footer className="invsheet-foot">{footer}</footer>}
    </article>
  );
}
