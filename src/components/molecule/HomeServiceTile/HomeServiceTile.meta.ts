import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { HomeServiceTile } from './HomeServiceTile';

export default defineMeta({
  tier: 'molecule', name: 'HomeServiceTile', description: 'Brand-purple service tile for the customer Home "Services" row: icon over label; disabled variant for services not yet bookable.',
  props: [{ name: 'label', type: 'string', required: true, description: 'Hotel / Grooming & Spa / Daycare' }, { name: 'icon', type: 'IconName', required: true, description: 'Outline icon' }, { name: 'onClick', type: '() => void', description: 'Tap handler' }, { name: 'disabled', type: 'boolean', description: 'Greyed, not clickable' }, { name: 'hint', type: 'string', description: 'Small caption e.g. "Coming soon"' }],
  states: ['default', 'hover', 'disabled'],
  usages: [{ title: 'Services row', render: () => h('div', { className: 'grid grid-3', style: { maxWidth: 390 } }, h(HomeServiceTile, { label: 'Hotel', icon: 'bed', onClick: () => {} }), h(HomeServiceTile, { label: 'Grooming & Spa', icon: 'scissors', onClick: () => {} }), h(HomeServiceTile, { label: 'Daycare', icon: 'sun', onClick: () => {} })) }, { title: 'Disabled', render: () => h('div', { style: { maxWidth: 120 } }, h(HomeServiceTile, { label: 'In Home', icon: 'home', disabled: true, hint: 'Via chat' })) }],
  a11y: ['A real button; label is visible text; hint doubles as title.'],
  usedBy: ['C-10'], figma: ['Services.png', 'Home Page-1.png'],
});
