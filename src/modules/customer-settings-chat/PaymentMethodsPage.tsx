import { useMemo, useState } from 'react';
import { useData, useTable } from '../../data/DataContext';
import { usePayments } from '../../payments';
import type { PaymentMethodRow } from '../../data/schema/customer-settings-chat';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { PaymentCardTile, CARD_BRAND_LABEL } from '../../components/molecule/PaymentCardTile/PaymentCardTile';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Input } from '../../components/atom/Input/Input';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Modal } from '../../components/organism/Modal/Modal';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

/** Brand from the number prefix (mock; Stripe Elements reports the brand itself later). */
export function detectBrand(num: string): PaymentMethodRow['brand'] {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(011|5)/.test(n)) return 'discover';
  return n ? 'other' : null;
}
export function luhn(num: string): boolean {
  const n = num.replace(/\D/g, '');
  if (n.length < 13 || n.length > 19) return false;
  let sum = 0, alt = false;
  for (let i = n.length - 1; i >= 0; i--) { let d = Number(n[i]); if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; }
  return sum % 10 === 0;
}
const isExpired = (m: number | null, y: number | null, now = new Date()) => !!m && !!y && (y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1));

/** C-74 Payment methods: saved cards (tokenised, R-M22), add / make default / remove; cash at the location is always possible. */
export function PaymentMethodsPage() {
  const data = useData();
  const payments = usePayments();
  const { toast } = useToast();
  const acc = useCustomerAccount();
  const { t, customer } = acc;
  const { rows } = useTable<PaymentMethodRow>('payment_methods', customer ? { where: { customer_id: customer.id }, orderBy: { column: 'created_at' } } : undefined);
  const cards = useMemo(() => (customer ? rows.filter((r) => r.status !== 'removed').sort((a, b) => Number(b.is_default) - Number(a.is_default)) : []), [rows, customer]);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<PaymentMethodRow | null>(null);
  const [f, setF] = useState({ holder: '', number: '', exp: '', cvc: '', zip: '', makeDefault: true });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const brand = detectBrand(f.number);

  const makeDefault = async (card: PaymentMethodRow) => {
    await Promise.all(cards.filter((c) => c.is_default && c.id !== card.id).map((c) => data.update('payment_methods', c.id, { is_default: false })));
    await data.update('payment_methods', card.id, { is_default: true });
    toast(t(k('common.saved')));
  };
  const remove = async () => {
    if (!removing) return;
    await data.update('payment_methods', removing.id, { status: 'removed', is_default: false });
    const next = cards.find((c) => c.id !== removing.id);
    if (removing.is_default && next) await data.update('payment_methods', next.id, { is_default: true });
    setRemoving(null);
    toast({ tone: 'info', title: `${CARD_BRAND_LABEL[removing.brand ?? 'other']} ···· ${removing.last4} removed` });
  };
  const add = async () => {
    if (!customer) return;
    const e: Record<string, string> = {};
    const [mm, yy] = f.exp.split('/').map((s) => s.trim());
    const m = Number(mm), y = yy?.length === 2 ? 2000 + Number(yy) : Number(yy);
    if (!f.holder.trim()) e.holder = 'Name on card is required';
    if (!luhn(f.number)) e.number = 'Check the card number';
    if (!m || m < 1 || m > 12 || !y || isExpired(m, y)) e.exp = 'Use MM/YY, not expired';
    if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = '3 or 4 digits';
    if (!/^\d{5}$/.test(f.zip)) e.zip = '5-digit ZIP';
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 500)); // provider tokenisation round-trip (mock)
      if (f.makeDefault || cards.length === 0) await Promise.all(cards.filter((c) => c.is_default).map((c) => data.update('payment_methods', c.id, { is_default: false })));
      const digits = f.number.replace(/\D/g, '');
      await data.insert<PaymentMethodRow>('payment_methods', { customer_id: customer.id, type: 'card', brand, last4: digits.slice(-4), exp_month: m, exp_year: y, holder_name: f.holder.trim(), billing_zip: f.zip, is_default: f.makeDefault || cards.length === 0, provider: payments.name, provider_token: `pm_${payments.name}_${Math.random().toString(36).slice(2, 10)}`, status: 'active' });
      setAdding(false); setF({ holder: '', number: '', exp: '', cvc: '', zip: '', makeDefault: true }); setErrs({});
      toast({ tone: 'success', title: 'Card saved', body: `${CARD_BRAND_LABEL[brand ?? 'other']} ···· ${digits.slice(-4)}` });
    } finally { setBusy(false); }
  };
  const fmtNumber = (v: string) => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
  const fmtExp = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('pay.title'))} backTo="/app/profile" actions={<IconButton icon="plus" label={t(k('pay.add'))} variant="primary" onClick={() => setAdding(true)} disabled={!customer} />} />
      <div className="csc-body">
        {cards.length === 0 ? (
          <EmptyState icon="card" title={t(k('pay.empty'))} body={t(k('pay.empty.body'))} action={<Button icon="plus" onClick={() => setAdding(true)} disabled={!customer}>{t(k('pay.add'))}</Button>} />
        ) : (
          <div className="stack-sm">
            {cards.map((c) => {
              const expired = isExpired(c.exp_month, c.exp_year);
              return <PaymentCardTile key={c.id} brand={c.brand} last4={c.last4} expMonth={c.exp_month} expYear={c.exp_year} holderName={c.holder_name} isDefault={c.is_default} expired={expired}
                actions={<>{!c.is_default && !expired && <Button size="sm" variant="secondary" onClick={() => makeDefault(c)}>{t(k('pay.default'))}</Button>}<Button size="sm" variant="ghost" icon="trash" onClick={() => setRemoving(c)}>{t(k('pay.remove'))}</Button></>} />;
            })}
          </div>
        )}
        <p className="csc-note">{t(k('pay.cash'))} {payments.needsCardElement ? '' : 'Card details are tokenised by the payment provider; Petrock stores only the brand, last four digits and expiry.'}</p>
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title={t(k('pay.add'))} size="sm"
        footer={<><Button variant="secondary" onClick={() => setAdding(false)}>{t(k('edit.cancel'))}</Button><Button onClick={add} loading={busy}>Save card</Button></>}>
        <div className="stack-sm">
          <Input label="Name on card" value={f.holder} onChange={(e) => setF({ ...f, holder: e.target.value })} autoComplete="cc-name" error={errs.holder} />
          <Input label="Card number" value={f.number} onChange={(e) => setF({ ...f, number: fmtNumber(e.target.value) })} inputMode="numeric" autoComplete="cc-number" icon="card" suffix={brand ? <span className="xs muted">{CARD_BRAND_LABEL[brand]}</span> : undefined} error={errs.number} placeholder="4242 4242 4242 4242" />
          <div className="csc-form-grid">
            <Input label="Expiry" value={f.exp} onChange={(e) => setF({ ...f, exp: fmtExp(e.target.value) })} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" error={errs.exp} />
            <Input label="CVC" value={f.cvc} onChange={(e) => setF({ ...f, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} inputMode="numeric" autoComplete="cc-csc" error={errs.cvc} />
            <Input label="Billing ZIP" value={f.zip} onChange={(e) => setF({ ...f, zip: e.target.value.replace(/\D/g, '').slice(0, 5) })} inputMode="numeric" autoComplete="postal-code" error={errs.zip} />
          </div>
          <Checkbox label="Use as default card" checked={f.makeDefault} onChange={(e) => setF({ ...f, makeDefault: e.target.checked })} />
          <p className="csc-note">Demo: any number that passes the Luhn check works (4242 4242 4242 4242). Stripe Elements replaces these fields when the provider is wired.</p>
        </div>
      </Modal>

      <Modal open={!!removing} onClose={() => setRemoving(null)} title="Remove card?" size="sm"
        footer={<><Button variant="secondary" onClick={() => setRemoving(null)}>{t(k('edit.cancel'))}</Button><Button variant="danger" icon="trash" onClick={remove}>{t(k('pay.remove'))}</Button></>}>
        {removing && <p className="small">{CARD_BRAND_LABEL[removing.brand ?? 'other']} ···· {removing.last4} will no longer be available for deposits. Bookings already paid are not affected.</p>}
      </Modal>
    </div>
  );
}
