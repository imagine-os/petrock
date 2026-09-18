import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { StarRatingInput } from './StarRatingInput';

function Demo() { const [v, setV] = useState(4); return h('div', { className: 'row' }, h(StarRatingInput, { value: v, onChange: setV }), h('span', { className: 'muted small' }, `${v} / 5`)); }

export default defineMeta({
  tier: 'atom', name: 'StarRatingInput', description: 'Five-star rating picker with hover preview and keyboard support; read-only mode displays a stored rating.',
  props: [{ name: 'value', type: 'number', required: true, description: '0-max' }, { name: 'onChange', type: '(v: number) => void', description: 'Called on click / arrow keys' }, { name: 'max', type: 'number', default: '5', description: 'Number of stars' }, { name: 'size', type: 'number', default: '32', description: 'Hit target size in px' }, { name: 'readOnly', type: 'boolean', description: 'Display only' }],
  states: ['empty', 'hover preview', 'selected', 'read-only'],
  usages: [{ title: 'Interactive', render: () => h(Demo) }, { title: 'Read-only 4.5 rounds to 5 shown, small', render: () => h(StarRatingInput, { value: 5, readOnly: true, size: 20 }) }],
  a11y: ['role="radiogroup" of radio buttons labelled "n stars"; arrows move the value; read-only renders role="img" with the rating in the label.'],
  usedBy: ['C-83', 'A-35'], figma: ['reviews.jpg', 'profile.jpg (Rate App)'],
});
