import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { HotelRoomTypeCard } from './HotelRoomTypeCard';

const PH = 'Petrock Penthouses offer a TV, premium bed, toys, potty pads, room service, playtime, 2 walks per day, photos and videos every night, a bedtime tuck-in and tummy rub.';

export default defineMeta({
  tier: 'molecule', name: 'HotelRoomTypeCard', description: 'Room type card for the customer hotel flow (Figma Choose Your Room Type): photo with BOOK NOW overlay, inclusions copy, average price per night per pet from the pricing engine, fit and capacity chips, disabled with a reason (55 lb rule, full).',
  props: [{ name: 'name', type: 'string', required: true, description: 'Penthouse / Suite' }, { name: 'description', type: 'string | null', description: 'Inclusions copy from room_types' }, { name: 'photoUrl', type: 'string | null', description: 'Cover photo; placeholder icon when null' }, { name: 'priceLabel', type: 'ReactNode', description: 'Formatted avg nightly price (caller computes)' }, { name: 'priceHint', type: 'string', default: 'avg per night / pet', description: 'Text after the price' }, { name: 'selected', type: 'boolean', description: 'Primary border' }, { name: 'disabled', type: 'boolean', description: 'With reason' }, { name: 'reason', type: 'string', description: 'Why it cannot be chosen' }, { name: 'chips', type: '{label, tone}[]', description: 'Rooms left, bottom room needed...' }, { name: 'onSelect', type: '() => void', description: 'BOOK NOW' }],
  states: ['default', 'selected', 'disabled with reason', 'no photo'],
  usages: [{ title: 'Two room types', render: () => h('div', { className: 'grid grid-2' },
    h(HotelRoomTypeCard, { name: 'Penthouse', description: PH, priceLabel: '$127.50', chips: [{ label: '4 rooms left', tone: 'success' }], onSelect: () => {}, selected: true }),
    h(HotelRoomTypeCard, { name: 'Suite', description: 'Premium bed, toys, potty pads, playtime, 2 walks per day and a bedtime tuck-in.', priceLabel: '$90.00', disabled: true, reason: 'Full for these dates at Encino', onSelect: () => {} })) }],
  a11y: ['aria-disabled on the article; the CTA button is disabled too.'],
  usedBy: ['C-31'], figma: ['Choose Your Room.png', 'Choose Your Room-1.png'],
});
