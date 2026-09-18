import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomingPriceMenu } from './GroomingPriceMenu';

const PKGS = [
  { id: 'g', name: 'Gold Groom', tier: 'gold', inclusions: 'Bath, blow-dry, brush teeth, four-paw massage and scented spray', price_s: 50, price_m: 65, price_l: 80, price_xl: 95, price_giant: 135, minutes_s: 60, minutes_m: 60, minutes_l: 60, minutes_xl: 90, minutes_giant: 90 },
  { id: 'p', name: 'Platinum Groom', tier: 'platinum', inclusions: 'Gold package + nail trim, ear cleanse and gland expression', price_s: 65, price_m: 80, price_l: 95, price_xl: 115, price_giant: 150, minutes_s: 75, minutes_m: 75, minutes_l: 90, minutes_xl: 105, minutes_giant: 120 },
];

export default defineMeta({
  tier: 'molecule', name: 'GroomingPriceMenu', description: 'Packages × sizes price grid built from packages rows (Spa 12.7 price card). Highlights the size column of the pet being booked. Sizes are the weight bands from src/domain/booking.ts.',
  props: [{ name: 'packages', type: 'PackageLike[]', required: true, description: 'packages rows' }, { name: 'highlightSize', type: 'PetSize', description: 'Column to highlight' }, { name: 'caption', type: 'string', description: 'Table caption' }],
  states: ['default', 'highlighted size'],
  usages: [{ title: 'Menu with size L highlighted', render: () => h(GroomingPriceMenu, { packages: PKGS, highlightSize: 'L', caption: 'Prices before tax' }) }],
  a11y: ['Real table with column and row headers; scrolls horizontally on very narrow phones.'],
  usedBy: ['C-50'], figma: ['Spa 12.7 2.png', 'front desk-6.jpg'],
});
