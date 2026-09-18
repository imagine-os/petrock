import { Input } from '../../atom/Input/Input';
import { Icon } from '../../atom/Icon/Icon';
import './HotelCardPaymentForm.css';

export interface CardFormValue { number: string; exp: string; cvc: string; name: string; zip: string }
export const EMPTY_CARD: CardFormValue = { number: '', exp: '', cvc: '', name: '', zip: '' };
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export function detectBrand(num: string): CardBrand {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(011|5)/.test(n)) return 'discover';
  return 'unknown';
}
export const formatCardNumber = (v: string) => { const n = v.replace(/\D/g, '').slice(0, detectBrand(v) === 'amex' ? 15 : 16); return detectBrand(n) === 'amex' ? n.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' ')) : n.replace(/(\d{4})(?=\d)/g, '$1 '); };
export const formatExp = (v: string) => { const n = v.replace(/\D/g, '').slice(0, 4); return n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n; };
export function luhn(num: string): boolean { const n = num.replace(/\D/g, ''); let s = 0, dbl = false; for (let i = n.length - 1; i >= 0; i--) { let d = Number(n[i]); if (dbl) { d *= 2; if (d > 9) d -= 9; } s += d; dbl = !dbl; } return n.length >= 13 && s % 10 === 0; }
export function validateCard(v: CardFormValue): Partial<Record<keyof CardFormValue, string>> {
  const e: Partial<Record<keyof CardFormValue, string>> = {};
  if (!luhn(v.number)) e.number = 'Enter a valid card number';
  const m = /^(\d{2})\/(\d{2})$/.exec(v.exp);
  if (!m) e.exp = 'MM/YY';
  else { const mm = Number(m[1]), yy = 2000 + Number(m[2]); const now = new Date(); if (mm < 1 || mm > 12 || yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) e.exp = 'Card has expired'; }
  if (!/^\d{3,4}$/.test(v.cvc)) e.cvc = 'CVC';
  if (v.name.trim().length < 2) e.name = 'Name on card';
  if (!/^\d{5}(-\d{4})?$/.test(v.zip.trim())) e.zip = 'ZIP code';
  return e;
}
export const cardLast4 = (v: CardFormValue) => v.number.replace(/\D/g, '').slice(-4);

export interface HotelCardPaymentFormProps { value: CardFormValue; onChange: (v: CardFormValue) => void; errors?: Partial<Record<keyof CardFormValue, string>>; disabled?: boolean }

const BRAND_LABEL: Record<CardBrand, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', discover: 'Discover', unknown: 'Card' };

/**
 * Stripe-Elements-shaped card form (number, expiry, CVC, name, ZIP) with brand detection, formatting and Luhn check.
 * Used with MockPaymentProvider today; when StripePaymentProvider.needsCardElement is true the page mounts <PaymentElement> in its place.
 */
export function HotelCardPaymentForm({ value, onChange, errors = {}, disabled = false }: HotelCardPaymentFormProps) {
  const brand = detectBrand(value.number);
  const set = (k: keyof CardFormValue) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="cardform" aria-label="Card details">
      <Input label="Card number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={value.number} onChange={(e) => set('number')(formatCardNumber(e.target.value))} error={errors.number} disabled={disabled} icon="card"
        suffix={<span className={`cardform-brand is-${brand}`}>{BRAND_LABEL[brand]}</span>} />
      <div className="cardform-row">
        <Input label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={value.exp} onChange={(e) => set('exp')(formatExp(e.target.value))} error={errors.exp} disabled={disabled} />
        <Input label="CVC" inputMode="numeric" autoComplete="cc-csc" placeholder={brand === 'amex' ? '1234' : '123'} maxLength={4} value={value.cvc} onChange={(e) => set('cvc')(e.target.value.replace(/\D/g, ''))} error={errors.cvc} disabled={disabled} />
      </div>
      <Input label="Name on card" autoComplete="cc-name" placeholder="Avery Thompson" value={value.name} onChange={(e) => set('name')(e.target.value)} error={errors.name} disabled={disabled} />
      <Input label="Billing ZIP" inputMode="numeric" autoComplete="postal-code" placeholder="91316" value={value.zip} onChange={(e) => set('zip')(e.target.value.replace(/[^\d-]/g, '').slice(0, 10))} error={errors.zip} disabled={disabled} />
      <p className="cardform-secure"><Icon name="lock" size={12} /> Card details are tokenised by the payment provider; Petrock never stores the full number. Test: any Luhn-valid number succeeds, ending in 0002 declines.</p>
    </div>
  );
}
