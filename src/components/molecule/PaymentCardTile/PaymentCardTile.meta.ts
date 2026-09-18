import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PaymentCardTile } from './PaymentCardTile';
import { Button } from '../../atom/Button/Button';

export default defineMeta({
  tier: 'molecule', name: 'PaymentCardTile', description: 'Saved payment card tile: brand-coloured mark, "Visa ···· 4242", expiry and holder, Default / Expired badges, optional actions footer or selectable behaviour (checkout).',
  props: [{ name: 'brand', type: 'string | null', required: true, description: 'visa | mastercard | amex | discover | other' }, { name: 'last4', type: 'string | null', required: true, description: 'Last four digits' }, { name: 'expMonth / expYear', type: 'number | null', description: 'Expiry' }, { name: 'holderName', type: 'string | null', description: 'Name on card' }, { name: 'isDefault', type: 'boolean', description: 'Default badge' }, { name: 'expired', type: 'boolean', description: 'Expired badge, dimmed' }, { name: 'selected / onClick', type: 'boolean / () => void', description: 'Selectable in a checkout' }, { name: 'actions', type: 'ReactNode', description: 'Footer buttons' }],
  states: ['default card', 'other card with actions', 'expired', 'selected'],
  usages: [{ title: 'Wallet', render: () => h('div', { className: 'stack-sm', style: { maxWidth: 390 } }, h(PaymentCardTile, { brand: 'visa', last4: '4242', expMonth: 8, expYear: 2028, holderName: 'Avery Thompson', isDefault: true, actions: h(Button, { size: 'sm', variant: 'ghost', icon: 'trash' }, 'Remove') }), h(PaymentCardTile, { brand: 'mastercard', last4: '4444', expMonth: 1, expYear: 2027, holderName: 'Avery Thompson', actions: [h(Button, { key: 'd', size: 'sm', variant: 'secondary' }, 'Make default'), h(Button, { key: 'r', size: 'sm', variant: 'ghost', icon: 'trash' }, 'Remove')] }), h(PaymentCardTile, { brand: 'amex', last4: '0005', expMonth: 3, expYear: 2024, expired: true }), h(PaymentCardTile, { brand: 'discover', last4: '1117', selected: true, onClick: () => {} })) }],
  a11y: ['Selectable tiles are buttons with aria-pressed; badges are text.', 'Only masked data is ever rendered (R-M22).'],
  usedBy: ['C-74'], figma: ['Payment-1.png', 'Frame 1171276435.png'],
});
