import { RadioGroup } from '../../atom/Radio/Radio';
import { Input } from '../../atom/Input/Input';
import { Icon } from '../../atom/Icon/Icon';
import './ServicePayMethod.css';

export type PayMethod = 'card' | 'cash';
export interface MockCard { name: string; number: string; exp: string; cvc: string }
export interface ServicePayMethodProps { value: PayMethod; onChange: (v: PayMethod) => void; card: MockCard; onCardChange: (c: MockCard) => void; feeNote?: string; cashNote?: string; needsCardElement?: boolean; error?: string | null }

export const EMPTY_CARD: MockCard = { name: '', number: '', exp: '', cvc: '' };
export const cardValid = (c: MockCard) => c.name.trim().length > 1 && c.number.replace(/\D/g, '').length >= 12 && /^\d{2}\s*\/\s*\d{2}$/.test(c.exp) && c.cvc.replace(/\D/g, '').length >= 3;
export const cardLast4 = (c: MockCard) => c.number.replace(/\D/g, '').slice(-4);
export const cardBrand = (c: MockCard) => { const n = c.number.replace(/\D/g, ''); return n.startsWith('4') ? 'Visa' : n.startsWith('5') ? 'Mastercard' : n.startsWith('3') ? 'Amex' : 'Card'; };

/** Payment method for a customer checkout: card (mock fields today, Stripe Elements mount tomorrow) or pay at the location. Shows the card-fee note from the fees table. */
export function ServicePayMethod({ value, onChange, card, onCardChange, feeNote, cashNote = 'Pay by card or cash at the front desk when you arrive.', needsCardElement = false, error }: ServicePayMethodProps) {
  const set = (k: keyof MockCard) => (e: { target: { value: string } }) => onCardChange({ ...card, [k]: e.target.value });
  return (
    <div className="paymethod">
      <RadioGroup<PayMethod> cards label="Payment method" value={value} onChange={onChange} options={[
        { value: 'card', label: <span className="paymethod-opt"><Icon name="card" size={18} /> Credit / debit card</span>, description: feeNote },
        { value: 'cash', label: <span className="paymethod-opt"><Icon name="dollar" size={18} /> Pay at location</span>, description: cashNote },
      ]} />
      {value === 'card' && (needsCardElement ? <div className="paymethod-element" data-stripe-element>Card element mounts here</div> : (
        <div className="paymethod-fields">
          <Input label="Name on card" value={card.name} onChange={set('name')} autoComplete="cc-name" placeholder="Avery Thompson" />
          <Input label="Card number" value={card.number} onChange={set('number')} inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" icon="card" hint="Demo: any number works; ending in 0002 is declined." />
          <div className="paymethod-row">
            <Input label="Expiry" value={card.exp} onChange={set('exp')} inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" />
            <Input label="CVC" value={card.cvc} onChange={set('cvc')} inputMode="numeric" autoComplete="cc-csc" placeholder="123" type="password" />
          </div>
        </div>
      ))}
      {error && <p className="paymethod-error xs"><Icon name="warning" size={14} /> {error}</p>}
    </div>
  );
}
