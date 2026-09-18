import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomingPackageCard } from './GroomingPackageCard';

function Demo() {
  const [v, setV] = useState('gold');
  return h('div', { className: 'stack-sm' },
    h(GroomingPackageCard, { name: 'Gold Groom', tier: 'gold', inclusions: 'Bath, blow-dry, brush teeth, four-paw massage and scented spray', price: 80, minutes: 60, size: 'L', selected: v === 'gold', onSelect: () => setV('gold') }),
    h(GroomingPackageCard, { name: 'Platinum Groom', tier: 'platinum', inclusions: 'Gold package + nail trim, ear cleanse and gland expression', price: 95, minutes: 90, size: 'L', selected: v === 'platinum', onSelect: () => setV('platinum') }),
    h(GroomingPackageCard, { name: 'Diamond Groom', tier: 'diamond', inclusions: 'Platinum package + shave or clip', price: 120, minutes: 120, size: 'L', selected: v === 'diamond', onSelect: () => setV('diamond'), note: 'Prices pending confirmation' }));
}

export default defineMeta({
  tier: 'molecule', name: 'GroomingPackageCard', description: 'Selectable Grooming & Spa package card (Figma "Choose Package"): tier tile, name + tier badge, inclusions copy, price for the pet\'s size in red, chair minutes and a check circle. Prices always come from the packages table via packagePrice().',
  props: [{ name: 'name', type: 'string', required: true, description: 'Package name' }, { name: 'tier', type: 'string', description: 'gold | platinum | diamond (tile colour)' }, { name: 'inclusions', type: 'string', description: 'What is included' }, { name: 'price', type: 'number', required: true, description: 'Price for the size' }, { name: 'minutes', type: 'number', description: 'Chair time' }, { name: 'size', type: 'string', description: 'S/M/L/XL/Giant label' }, { name: 'selected', type: 'boolean', description: '' }, { name: 'onSelect', type: '() => void', description: 'Makes the card a button' }, { name: 'note', type: 'string', description: 'Warning line (placeholder prices)' }, { name: 'compact', type: 'boolean', description: 'Summary variant without inclusions' }],
  states: ['default', 'selected', 'dimmed (not selected)', 'disabled', 'compact'],
  usages: [{ title: 'Choose package', render: () => h(Demo) }, { title: 'Compact summary', render: () => h(GroomingPackageCard, { name: 'Gold Groom', tier: 'gold', price: 50, size: 'S', compact: true }) }],
  a11y: ['Renders a button with aria-pressed when selectable, a div otherwise.'],
  usedBy: ['C-51', 'C-54', 'C-55', 'C-56'], figma: ['Frame 1171276428.png', 'Frame 1171276435.png'],
});
