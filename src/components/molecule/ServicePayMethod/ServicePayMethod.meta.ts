import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { ServicePayMethod, EMPTY_CARD, type PayMethod, type MockCard } from './ServicePayMethod';

function Demo() {
  const [v, setV] = useState<PayMethod>('card');
  const [c, setC] = useState<MockCard>(EMPTY_CARD);
  return h(ServicePayMethod, { value: v, onChange: setV, card: c, onCardChange: setC, feeNote: 'Card service fee 3.89% applies (from the fees table).' });
}

export default defineMeta({
  tier: 'molecule', name: 'ServicePayMethod', description: 'Checkout payment method for the customer app: card (Figma "Credit card" tile) with mock card fields today and a Stripe Elements mount point when the PaymentProvider needsCardElement, or "Pay at location" (Figma "Pay with cash at location"). Fee copy comes from the fees table, never typed.',
  props: [{ name: 'value', type: "'card' | 'cash'", required: true, description: '' }, { name: 'onChange', type: '(v) => void', required: true, description: '' }, { name: 'card', type: 'MockCard', required: true, description: 'name, number, exp, cvc' }, { name: 'onCardChange', type: '(c) => void', required: true, description: '' }, { name: 'feeNote', type: 'string', description: 'Card fee line (R-H03)' }, { name: 'cashNote', type: 'string', description: '' }, { name: 'needsCardElement', type: 'boolean', description: 'Render the provider mount instead of mock fields' }, { name: 'error', type: 'string', description: 'Declined message' }],
  states: ['card (mock fields)', 'cash', 'card element (Stripe)', 'error'],
  usages: [{ title: 'Card or cash', render: () => h(Demo) }, { title: 'Stripe Elements mount', render: () => h(ServicePayMethod, { value: 'card', onChange: () => {}, card: EMPTY_CARD, onCardChange: () => {}, needsCardElement: true }) }],
  a11y: ['RadioGroup cards; card inputs carry autocomplete cc-* hints; CVC is a password field.'],
  usedBy: ['C-54', 'C-63'], figma: ['Frame 1171276435.png', 'Payment-1.png'],
});
