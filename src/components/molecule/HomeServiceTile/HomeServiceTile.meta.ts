import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { HomeServiceTile } from './HomeServiceTile';

export default defineMeta({
  tier: 'molecule', name: 'HomeServiceTile', description: 'Brand-purple service tile for the customer Home "Services" row: icon over label; disabled variant for services not yet bookable.',
  props: [{ name: 'label', type: 'string', required: true, description: 'Hotel / Grooming & Spa / Daycare' }, { name: 'icon', type: 'IconName', required: true, description: 'svc-hotel / svc-spa / svc-daycare / svc-inhome (bed / scissors / sun map to them)' }, { name: 'onClick', type: '() => void', description: 'Tap handler' }, { name: 'disabled', type: 'boolean', description: 'Greyed, not clickable' }, { name: 'hint', type: 'string', description: 'Small caption e.g. "Coming soon"' }],
  states: ['default', 'hover', 'disabled'],
  usages: [{ title: 'Services row', render: () => h('div', { className: 'grid grid-4', style: { maxWidth: 390, gap: 19, padding: 6, background: 'var(--color-band)' } }, h(HomeServiceTile, { label: 'Hotel', icon: 'svc-hotel', onClick: () => {} }), h(HomeServiceTile, { label: 'Spa', icon: 'svc-spa', onClick: () => {} }), h(HomeServiceTile, { label: 'Daycare', icon: 'sun', onClick: () => {} })) }, { title: 'Disabled', render: () => h('div', { style: { maxWidth: 120 } }, h(HomeServiceTile, { label: 'In Home', icon: 'home', disabled: true, hint: 'Via chat' })) }],
  a11y: ['A real button; label is visible text; hint doubles as title.'],
  usedBy: ['C-10'], figma: ['Services.png', 'Home Page-1.png'],
});
