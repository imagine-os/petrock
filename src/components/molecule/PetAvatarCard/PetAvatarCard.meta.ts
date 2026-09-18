import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PetAvatarCard } from './PetAvatarCard';
import { VaccineStatusChip } from '../../atom/VaccineStatusChip/VaccineStatusChip';
import { Badge } from '../../atom/Badge/Badge';

export default defineMeta({
  tier: 'molecule', name: 'PetAvatarCard', description: 'Pet tile: round photo or initials, name, subtitle (breed / weight) and a status slot; selectable with a primary ring (Home pets strip, My pets grid, vaccine pet selector).',
  props: [{ name: 'name', type: 'string', required: true, description: 'Pet name' }, { name: 'filled', type: 'boolean', description: 'Hotel-flow selected pet: primary fill, white text (Figma 1807:27155)' }, { name: 'photoUrl', type: 'string | null', description: 'Photo; initials when empty' }, { name: 'subtitle', type: 'ReactNode', description: 'Breed line' }, { name: 'status', type: 'ReactNode', description: 'VaccineStatusChip / Badge under the name' }, { name: 'warning', type: 'boolean', description: 'Warning triangle before the status' }, { name: 'selected', type: 'boolean', description: 'Primary ring (Figma Boss card)' }, { name: 'muted', type: 'boolean', description: 'Dimmed (not approved)' }, { name: 'size', type: "'sm'|'md'|'lg'", default: 'md', description: 'Avatar 56 / 72 / 88 px' }, { name: 'onClick', type: '() => void', description: 'Renders as a button' }],
  states: ['default', 'selected', 'muted', 'with warning'],
  usages: [{ title: 'Filled (hotel flow) and glow', render: () => h('div', { className: 'grid grid-3', style: { maxWidth: 360 } }, h(PetAvatarCard, { name: 'Boss', filled: true, status: h(Badge, { tone: 'success', variant: 'pill', dot: true }, 'Active'), onClick: () => {} }), h(PetAvatarCard, { name: 'Sparky', status: h(Badge, { tone: 'warn', variant: 'pill', dot: true }, 'Pending'), onClick: () => {} }), h(PetAvatarCard, { name: 'Sparky', warning: true, status: 'Pending & Needs more Details', onClick: () => {} })) },
    { title: 'Home strip', render: () => h('div', { className: 'grid grid-3' }, h(PetAvatarCard, { name: 'Boss', subtitle: 'Pomeranian', selected: true, status: h(Badge, { tone: 'success', size: 'sm' }, 'Approved'), onClick: () => {} }), h(PetAvatarCard, { name: 'Sparky', subtitle: 'Border Collie', warning: true, muted: true, status: h(VaccineStatusChip, { status: 'pending', size: 'sm' }), onClick: () => {} }), h(PetAvatarCard, { name: 'Bear', subtitle: 'Bernese · 105 lb', status: h(VaccineStatusChip, { status: 'expired', size: 'sm' }) })) }],
  a11y: ['Interactive cards are real buttons with aria-pressed when selectable; the avatar carries the pet name as its label.'],
  usedBy: ['C-10', 'C-11', 'C-20'], figma: ['Home Page-1.png', 'My pets (more than one pet).jpg', 'Choose Vaccine.png'],
});
