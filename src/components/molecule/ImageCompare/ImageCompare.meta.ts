import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ImageCompare } from './ImageCompare';

const svg = (bg: string, txt: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="${bg}"/><text x="20" y="110" font-family="sans-serif" font-size="28" fill="#fff">${txt}</text></svg>`)}`;

export default defineMeta({
  tier: 'molecule', name: 'ImageCompare', description: 'Before / after comparison of two screenshots: draggable split, side by side, or blended. The screenshot diff page (D-17) uses it per page code and width.',
  props: [{ name: 'before', type: 'string', description: 'Image url' }, { name: 'after', type: 'string', description: 'Image url' }, { name: 'alt', type: 'string', required: true, description: 'What the images show' }, { name: 'mode', type: "'slider'|'side'|'onion'", default: 'slider', description: 'Initial mode' }, { name: 'beforeLabel / afterLabel', type: 'string', description: 'Tags' }],
  states: ['split', 'side by side', 'blend', 'one image missing', 'both missing'],
  usages: [{ title: 'Two captures', render: () => h('div', { style: { maxWidth: 480 } }, h(ImageCompare, { before: svg('#552583', 'before'), after: svg('#2A9D8F', 'after'), alt: 'Demo page at 1280 px' })) }, { title: 'Missing capture', render: () => h(ImageCompare, { after: svg('#2A9D8F', 'after'), alt: 'Demo' }) }],
  a11y: ['Mode switch is a labelled segmented control; the split / blend slider is a native range input with an aria-label.', 'Both images carry alt text including which capture they are.'],
  usedBy: ['D-17'],
});
