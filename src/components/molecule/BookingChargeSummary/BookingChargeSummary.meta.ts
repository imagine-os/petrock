import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { BookingChargeSummary } from './BookingChargeSummary';
import type { QuoteLine } from '../../../pricing/engine';

const lines: QuoteLine[] = [
  { label: 'Penthouse · Mon-Thu', qty: 4, unit: 120, amount: 480, kind: 'room' }, { label: 'Penthouse · Fri-Sun', qty: 2, unit: 135, amount: 270, kind: 'room' },
  { label: 'Veterinary Travel', qty: 1, unit: 50, amount: 50, kind: 'service' }, { label: '2 dogs in a penthouse', qty: 6, unit: -15, amount: -90, kind: 'discount' },
  { label: 'Tax (2%)', qty: 1, unit: 14.2, amount: 14.2, kind: 'tax' }, { label: 'Card service fee (3.89%)', qty: 1, unit: 28.17, amount: 28.17, kind: 'fee' },
];

export default defineMeta({
  tier: 'molecule', name: 'BookingChargeSummary', description: 'The invoice panel of the booking detail (front desk-5) redrawn for real maths: room nights and services as line items, then subtotal, discounts, tax, card fee, total charge, deposits and balance. Numbers always come from src/pricing/engine.ts.',
  props: [{ name: 'lines', type: 'QuoteLine[]', required: true, description: 'Engine lines (room / service / addon / discount / tax / fee)' }, { name: 'subtotal…total', type: 'number', required: true, description: 'Engine totals' }, { name: 'deposit', type: 'number', description: 'Shows Deposits and Balance rows (R-D14)' }, { name: 'notes', type: 'string[]', description: 'Engine notes (e.g. pay in full for the long-stay discount)' }, { name: 'compact', type: 'boolean', description: 'Tighter rows for side panels' }, { name: 'footer', type: 'ReactNode', description: 'Payment actions' }],
  states: ['no charges', 'with discounts', 'balance due', 'settled', 'credit (negative balance)'],
  usages: [{ title: 'Stay with deposit', render: () => h('div', { style: { maxWidth: 460 } }, h(BookingChargeSummary, { lines, subtotal: 800, discountTotal: 90, taxTotal: 14.2, feeTotal: 28.17, total: 752.37, deposit: 225, notes: ['2 dogs × 6 nights'] })) }],
  a11y: ['Totals are a definition list; amounts use tabular monospace digits.'],
  usedBy: ['F-11', 'F-12', 'F-15'], figma: ['front desk-5.jpg', 'front desk-8.jpg', 'Products.png'],
});
