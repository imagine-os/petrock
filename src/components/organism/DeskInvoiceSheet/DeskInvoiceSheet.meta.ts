import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { DeskInvoiceSheet } from './DeskInvoiceSheet';

export default defineMeta({
  tier: 'organism', name: 'DeskInvoiceSheet', description: 'Printable invoice: business block, customer, meta (booking code, dates, groomer), service lines, discount / tax / fee lines, total, deposit and balance, note (R-J06) and footer from invoice settings. Preview watermark when not yet issued; print CSS hides the shell.',
  props: [{ name: 'number', type: 'string', required: true, description: 'INV-1042' }, { name: 'status', type: 'string', required: true, description: 'draft / issued / paid / void' }, { name: 'lines', type: 'DeskInvoiceLine[]', required: true, description: 'Quote lines with kind' }, { name: 'subtotal … balance', type: 'number', required: true, description: 'Totals from the pricing engine' }, { name: 'preview', type: 'boolean', description: 'Watermark' }, { name: 'meta', type: '{label,value}[]', description: 'Right-hand facts' }],
  states: ['issued', 'paid', 'preview (draft)', 'balance due'],
  usages: [{ title: 'Grooming invoice', render: () => h(DeskInvoiceSheet, { number: 'INV-1042', status: 'issued', issuedAt: new Date().toISOString(), business: { name: 'Petrock Encino', address: '17401 Ventura Blvd, Encino, CA 91316', phone: '+1 (818) 555-0142', taxNumber: 'US-PETROCK-0001' }, customer: { name: 'Avery Thompson', email: 'avery@demo.petrock.test', mobile: '+1 (818) 555-0120' }, meta: [{ label: 'Appointment', value: 'GR-604' }, { label: 'Pet', value: 'Biscuit' }, { label: 'Groomer', value: 'Renee' }],
    lines: [{ label: 'Gold Groom (L)', qty: 1, unit: 80, amount: 80, kind: 'service' }, { label: 'Furminator', qty: 1, unit: 25, amount: 25, kind: 'addon' }, { label: 'Tax (2%)', qty: 1, unit: 2.1, amount: 2.1, kind: 'tax' }, { label: 'Card service fee (3.89%)', qty: 1, unit: 4.17, amount: 4.17, kind: 'fee' }], subtotal: 105, discountTotal: 0, feeTotal: 4.17, taxTotal: 2.1, total: 111.27, deposit: 30, balance: 81.27, footer: 'Rock Out With Your Paws Out!' }) }],
  a11y: ['Semantic table with header row; totals as labelled pairs.', 'Article labelled with the invoice number.'],
  usedBy: ['F-59'], figma: ['front desk-5.jpg', 'front desk-8.jpg', '9.pdf'],
});
