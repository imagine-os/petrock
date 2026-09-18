import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { HotelEstimateCard } from './HotelEstimateCard';

export default defineMeta({
  tier: 'molecule', name: 'HotelEstimateCard', description: 'Line-item card for estimates, payment summaries and invoices (Figma Booking Detail / Estimate): quote lines from the pricing engine with qty × unit, discounts in green, TOTAL row, extra rows (deposit, balance), engine notes and a footnote.',
  props: [{ name: 'title', type: 'ReactNode', description: 'Card heading (room name, Grooming & Spa)' }, { name: 'icon', type: "'bed'|'scissors'|'sun'|'dollar'", default: 'bed', description: 'Heading icon' }, { name: 'headline', type: 'ReactNode', description: 'Green headline figure (Figma $200)' }, { name: 'lines', type: 'QuoteLine[]', required: true, description: 'From quoteHotel / quoteGrooming' }, { name: 'total', type: 'number', description: 'Bold TOTAL row' }, { name: 'extras', type: '{label, value, strong?, tone?}[]', description: 'Deposit due now, balance at check-in...' }, { name: 'notes', type: 'string[]', description: 'Quote.notes (why a discount did not apply)' }, { name: 'footnote', type: 'ReactNode', description: 'Card fee footnote (R-H03)' }, { name: 'compact', type: 'boolean', description: 'Tighter padding' }],
  states: ['default', 'with discounts', 'empty'],
  usages: [{ title: 'Estimate', render: () => h('div', { style: { maxWidth: 400 } }, h(HotelEstimateCard, { title: 'Penthouse', headline: '$255.00', lines: [
    { label: 'Penthouse · Mon-Thu', qty: 2, unit: 120, amount: 240, kind: 'room' }, { label: 'Penthouse · Fri-Sun', qty: 2, unit: 135, amount: 270, kind: 'room' }, { label: '2 dogs in a penthouse', qty: 4, unit: -15, amount: -60, kind: 'discount' }, { label: 'Tax (2%)', qty: 1, unit: 9, amount: 9, kind: 'tax' }],
    total: 459, extras: [{ label: 'Deposit due now (30%)', value: '$137.70', strong: true }, { label: 'Balance at check-in', value: '$321.30', tone: 'muted' }], notes: ['Pay in full upfront to get the long-stay discount'], footnote: '* A 3.89% card service fee applies when paying by card.' })) }],
  a11y: ['Definition list per line; amounts use tabular numerals.'],
  usedBy: ['C-35', 'C-36', 'C-39', 'C-40'], figma: ['Booking Detail.jpg', 'Frame 1171276427.png'],
});
