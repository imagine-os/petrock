import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ServiceQuoteLines } from './ServiceQuoteLines';

const LINES = [
  { label: 'Gold Groom (L)', qty: 1, unit: 80, amount: 80, kind: 'service' as const }, { label: 'Furminator', qty: 1, unit: 25, amount: 25, kind: 'addon' as const },
  { label: 'Medicated Shampoo (from)', qty: 1, unit: 20, amount: 20, kind: 'addon' as const }, { label: 'Tax (2%)', qty: 1, unit: 2.5, amount: 2.5, kind: 'tax' as const }, { label: 'Card service fee (3.89%)', qty: 1, unit: 4.96, amount: 4.96, kind: 'fee' as const },
];

export default defineMeta({
  tier: 'molecule', name: 'ServiceQuoteLines', description: 'Totals block for a Grooming & Spa or Daycare quote: engine line items (service, add-on, discount, tax, fee) and the grand total. Replaces the Figma "Tax / Grooming / Grand Total" card whose numbers did not reconcile (R-G15).',
  props: [{ name: 'lines', type: 'QuoteLine[]', required: true, description: 'From quoteGrooming / quoteDaycare' }, { name: 'total', type: 'number', required: true, description: '' }, { name: 'totalLabel', type: 'string', default: 'Grand total', description: '' }, { name: 'notes', type: 'string[]', description: 'Engine notes (starting prices...)' }, { name: 'compact', type: 'boolean', description: 'Smaller type for cards' }, { name: 'showQty', type: 'boolean', default: 'true', description: 'Show × qty' }],
  states: ['default', 'with discount', 'compact'],
  usages: [
    { title: 'Grooming quote', render: () => h(ServiceQuoteLines, { lines: LINES, total: 132.46, notes: ['Medicated Shampoo is a starting price; final depends on coat condition'] }) },
    { title: 'Daycare with extra-pet discount (compact)', render: () => h(ServiceQuoteLines, { compact: true, lines: [{ label: 'Full Day (8 h)', qty: 2, unit: 45, amount: 90, kind: 'service' }, { label: 'Each additional pet (daycare)', qty: 1, unit: -5, amount: -5, kind: 'discount' }, { label: 'Tax (2%)', qty: 1, unit: 1.7, amount: 1.7, kind: 'tax' }], total: 86.7 }) },
  ],
  a11y: ['Definition list; negative amounts use a real minus sign.'],
  usedBy: ['C-54', 'C-55', 'C-56', 'C-63', 'C-64', 'C-65'], figma: ['Frame 1171276435.png', 'Frame 1171276434.png'],
});
