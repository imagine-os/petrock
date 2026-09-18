import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { HotelInvoiceView } from './HotelInvoiceView';

export default defineMeta({
  tier: 'organism', name: 'HotelInvoiceView', description: 'Printable invoice for a hotel stay (R-H09 numbering, R-H10 footer): business and customer blocks, stay reference (code, pets, dates, nights), line items from the quote, totals with discounts / tax / card fee, deposit and balance due, payments list, footer "Rock Out With Your Paws Out!".',
  props: [{ name: 'number', type: 'string', required: true, description: 'INV-1042' }, { name: 'status', type: 'string', required: true, description: 'invoices.status' }, { name: 'business', type: '{name, address?, phone?, taxNumber?}', required: true, description: 'Location + tax number' }, { name: 'customer', type: '{name, email?, phone?, address?}', required: true, description: 'Billed to' }, { name: 'reference', type: '{code, title, pets, checkIn, checkOut, nights}', required: true, description: 'The stay' }, { name: 'lines', type: 'QuoteLine[]', required: true, description: 'invoices.lines' }, { name: 'total / deposit / balance ...', type: 'number', required: true, description: 'Totals from the invoice row' }, { name: 'payments', type: 'InvoiceViewPayment[]', description: 'payments rows' }, { name: 'footer', type: 'string', description: 'settings.invoice.footer' }],
  states: ['issued with balance', 'paid'],
  usages: [{ title: 'Invoice', render: () => h('div', { style: { maxWidth: 620 } }, h(HotelInvoiceView, { number: 'INV-1042', status: 'issued', issuedAt: '2026-09-18T16:00:00Z', business: { name: 'Petrock Encino', address: '17401 Ventura Blvd, Encino, CA 91316', phone: '+1 (818) 555-0142', taxNumber: 'US-PETROCK-0001' }, customer: { name: 'Avery Thompson', email: 'avery@demo.petrock.test', phone: '+1 (818) 555-0120' }, reference: { code: 'PR-1042', title: 'Penthouse', pets: ['Biscuit', 'Mochi'], checkIn: '2026-10-02T17:00:00Z', checkOut: '2026-10-05T18:00:00Z', nights: 3 },
    lines: [{ label: 'Penthouse · Mon-Thu', qty: 4, unit: 120, amount: 480, kind: 'room' }, { label: '2 dogs in a penthouse', qty: 6, unit: -15, amount: -90, kind: 'discount' }, { label: 'Tax (2%)', qty: 1, unit: 7.8, amount: 7.8, kind: 'tax' }], subtotal: 480, discountTotal: 90, taxTotal: 7.8, feeTotal: 0, total: 397.8, deposit: 119.34, balance: 278.46,
    payments: [{ date: '2026-09-18T16:01:00Z', method: 'card', amount: 119.34, status: 'paid', brand: 'visa', last4: '4242', isDeposit: true }], footer: 'Rock Out With Your Paws Out!' })) }],
  a11y: ['Semantic table for line items; totals as label / value pairs.', 'Print stylesheet drops the card border.'],
  usedBy: ['C-40'], figma: ['9.pdf (invoice settings)', 'front desk-5.jpg'],
});
