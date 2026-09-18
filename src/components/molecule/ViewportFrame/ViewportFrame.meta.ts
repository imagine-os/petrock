import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ViewportFrame } from './ViewportFrame';

export default defineMeta({
  tier: 'molecule', name: 'ViewportFrame', description: 'The app rendered at an exact viewport width inside a same-origin iframe, scaled down to fit. Used by the responsive preview (D-13) and the a11y scanner (D-15).',
  props: [{ name: 'route', type: 'string', required: true, description: 'Hash route to load' }, { name: 'width', type: 'number', required: true, description: 'Viewport width in px' }, { name: 'height', type: 'number', default: '800', description: 'Viewport height' }, { name: 'fit', type: 'boolean', default: 'true', description: 'Scale to the container' }, { name: 'onLoad', type: '(doc) => void', description: 'Receives the iframe document' }],
  states: ['loading', 'scaled', 'full size'],
  usages: [{ title: 'Hub at 360 px', render: () => h('div', { style: { maxWidth: 240 } }, h(ViewportFrame, { route: '/', width: 360, height: 640, label: 'HUB-01' })) }],
  a11y: ['iframe has a descriptive title with route and width.', 'Scale percentage is shown as text so nobody has to guess the reduction.'],
  usedBy: ['D-13', 'D-15'],
});
