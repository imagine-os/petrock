import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { HotelBookingFrame } from './HotelBookingFrame';
import { Button } from '../../atom/Button/Button';
import { Card } from '../../molecule/Card/Card';

export default defineMeta({
  tier: 'template', name: 'HotelBookingFrame', description: 'Customer booking page frame (Figma header: back chevron, centered title): sticky header with aside slot, optional compact Stepper, scrolling body and a sticky footer CTA that sits above the customer BottomNav. Used by every hotel flow step, the reservations list and the detail pages.',
  props: [{ name: 'title', type: 'string', required: true, description: 'Centered title' }, { name: 'subtitle', type: 'ReactNode', description: 'Small line under the title' }, { name: 'backTo', type: 'string', description: 'Back link target' }, { name: 'onBack', type: '() => void', description: 'Back handler (wins over backTo)' }, { name: 'steps', type: 'string[]', description: 'Wizard steps (Stepper)' }, { name: 'step', type: 'number', description: 'Current step index' }, { name: 'aside', type: 'ReactNode', description: 'Right header slot' }, { name: 'footer', type: 'ReactNode', description: 'Sticky CTA row' }, { name: 'footerNote', type: 'ReactNode', description: 'Small text above the CTA' }],
  states: ['wizard step', 'plain page'],
  usages: [{ title: 'Wizard step', render: () => h('div', { style: { maxWidth: 390, height: 420, border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'auto' } }, h(HotelBookingFrame, { title: 'Choose pets', backTo: '#', steps: ['Pets & dates', 'Room', 'Details', 'Grooming', 'You', 'Estimate', 'Pay'], step: 1, footer: h(Button, { block: true, size: 'lg' }, 'Next'), footerNote: '2 pets · 3 nights' }, h(Card, null, 'Body content'))) }],
  a11y: ['Back control is a link or button with aria-label; the title is the page h1.'],
  usedBy: ['C-30', 'C-31', 'C-32', 'C-33', 'C-34', 'C-35', 'C-36', 'C-37', 'C-38', 'C-39', 'C-40', 'C-41'], figma: ['Choose Pets-3.png', 'Booking Detail.jpg'],
});
