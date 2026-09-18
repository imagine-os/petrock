import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { EMPTY_CARD, HotelCardPaymentForm, validateCard, type CardFormValue } from './HotelCardPaymentForm';

function Demo() {
  const [v, setV] = useState<CardFormValue>({ ...EMPTY_CARD, number: '4242 4242 4242 4242' });
  const [touched, setTouched] = useState(false);
  return h('div', { style: { maxWidth: 380 } }, h(HotelCardPaymentForm, { value: v, onChange: (x) => { setV(x); setTouched(true); }, errors: touched ? validateCard(v) : {} }));
}

export default defineMeta({
  tier: 'organism', name: 'HotelCardPaymentForm', description: 'Stripe-Elements-shaped card form for the customer payment step: number with brand detection and grouping, expiry MM/YY, CVC, name, billing ZIP; Luhn and expiry validation. Pairs with MockPaymentProvider now; a real Stripe PaymentElement replaces it when StripePaymentProvider is wired (no keys in the repo).',
  props: [{ name: 'value', type: 'CardFormValue', required: true, description: '{ number, exp, cvc, name, zip }' }, { name: 'onChange', type: '(v) => void', required: true, description: 'Controlled; formatting applied' }, { name: 'errors', type: 'Partial<Record<field, string>>', description: 'From validateCard(value)' }, { name: 'disabled', type: 'boolean', description: 'While charging' }],
  states: ['empty', 'brand detected', 'errors', 'disabled'],
  usages: [{ title: 'Card form', render: () => h(Demo) }],
  a11y: ['Library Inputs with labels, inputMode numeric and autocomplete cc-* tokens.', 'Errors are announced through the Input error slot.'],
  usedBy: ['C-36'], figma: ['Payment-1.png', 'Frame 1171276435.png'],
});
