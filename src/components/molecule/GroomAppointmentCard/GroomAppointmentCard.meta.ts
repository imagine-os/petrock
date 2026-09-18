import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomAppointmentCard } from './GroomAppointmentCard';

export default defineMeta({
  tier: 'molecule', name: 'GroomAppointmentCard', description: 'Appointment card for the grooming day view, board and agenda. Label follows R-G20 ("Owner Last, PET; Breed; Package Size"); green = confirmed, blue = requested, white + red cross = vaccine issue, red text + triangle = alert.',
  props: [{ name: 'label', type: 'string', required: true, description: 'R-G20 label' }, { name: 'subtitle', type: 'string', description: 'Add-ons, groomer or time range' }, { name: 'timeLabel', type: 'string', description: 'Shown above the label' }, { name: 'status', type: 'GroomStatus', required: true, description: 'Drives the background' }, { name: 'flags', type: '{ vaccine?, warning?, payment? }', description: 'Figma flag icons' }, { name: 'color', type: 'string', description: 'Groomer colour for the left border' }, { name: 'compact', type: 'boolean', description: 'One-line variant for dense grids' }, { name: 'onClick', type: '() => void', description: 'Opens the appointment' }],
  states: ['confirmed', 'requested', 'in_progress', 'done', 'cancelled', 'vaccine alert', 'compact'],
  usages: [{ title: 'Figma examples', render: () => h('div', { className: 'stack-sm', style: { maxWidth: 320 } },
    h(GroomAppointmentCard, { label: 'Wong, TEDDY; Cairn Terrier; Diamond Groom Medium', status: 'confirmed', color: '#F4D06F', timeLabel: '10:00 AM – 11:45 AM', subtitle: 'Furminator · Itzel' }),
    h(GroomAppointmentCard, { label: 'Alkoby, LOUIE; Poodle/Shihtzu Mix; Gold Groom Medium', status: 'requested', flags: { warning: true }, color: '#8A9BB8' }),
    h(GroomAppointmentCard, { label: 'Ford, WOOKIE; Shih Tzu; Diamond Groom Medium', status: 'confirmed', flags: { vaccine: true, payment: true }, color: '#7B7BE8' }),
    h(GroomAppointmentCard, { label: 'Howe, OZZIE; Mini Aussie; Platinum Groom Medium', status: 'done', color: '#E79DD1', compact: true }),
  ) }],
  a11y: ['role=button + Enter/Space when clickable.', 'Flags are aria-hidden; a visually hidden text repeats status and flags.'],
  usedBy: ['F-30', 'F-31'], figma: ['Grooming.png', 'Grooming-1.png'],
});
