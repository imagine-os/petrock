import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Figure } from './Figure';

export default defineMeta({
  tier: 'molecule', name: 'Figure', description: 'Framed screenshot with caption and page-code chip linking to the live screen; dashed placeholder when the capture does not exist yet.',
  props: [{ name: 'src', type: 'string', description: 'Image URL' }, { name: 'alt', type: 'string', required: true, description: 'Alt text' }, { name: 'caption', type: 'string', description: 'Caption' }, { name: 'code', type: 'string', description: 'Page code' }, { name: 'to', type: 'string', description: 'Route the code links to' }],
  states: ['image', 'placeholder'],
  usages: [{ title: 'Placeholder', render: () => h(Figure, { alt: 'Hotel reservations', code: 'F-01', to: '/desk', caption: 'Front desk · today', placeholder: true, width: 360 }) }],
  a11y: ['Placeholder has role="img" with the alt text.'],
  usedBy: ['D-06', 'D-07'],
});
