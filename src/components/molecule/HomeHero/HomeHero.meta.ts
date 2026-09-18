import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { HomeHero } from './HomeHero';

export default defineMeta({
  tier: 'molecule', name: 'HomeHero', description: 'Customer home hero (Figma Home Page.png, 390x142): full-bleed photo with the Petrock logo centred on it; brand-gradient placeholder until a licensed photo exists.',
  props: [{ name: 'photoUrl', type: 'string | null', description: 'Hero photo; omitted = gradient placeholder' }, { name: 'logoUrl', type: 'string', description: 'Logo image (default ./brand/petrock-logo-2x.png)' }, { name: 'alt', type: 'string', description: 'Accessible name' }, { name: 'height', type: 'number', description: 'Height in px (default 142)' }],
  states: ['placeholder gradient', 'with photo'],
  usages: [{ title: 'Placeholder', render: () => h('div', { style: { maxWidth: 390 } }, h(HomeHero, {})) }],
  a11y: ['role="img" with the brand name; the logo image is decorative.'],
  usedBy: ['C-10'], figma: ['Home Page.png'],
});
