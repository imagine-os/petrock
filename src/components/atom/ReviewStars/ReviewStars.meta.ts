import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ReviewStars } from './ReviewStars';

export default defineMeta({
  tier: 'atom', name: 'ReviewStars', description: 'Star rating display for reviews (0..5 with halves) with the numeric value beside it; used on the public reviews page and the moderation queue.',
  props: [{ name: 'rating', type: 'number', required: true, description: '0..max' }, { name: 'max', type: 'number', default: '5', description: 'Star count' }, { name: 'size', type: 'number', default: '16', description: 'Icon size' }, { name: 'showValue', type: 'boolean', default: 'true', description: 'Show "4.0"' }],
  states: ['full', 'half', 'empty'],
  usages: [{ title: 'Ratings', render: () => h('div', { className: 'stack-sm' }, h(ReviewStars, { rating: 5 }), h(ReviewStars, { rating: 4.5 }), h(ReviewStars, { rating: 3, size: 20 }), h(ReviewStars, { rating: 0, showValue: false })) }],
  a11y: ['role="img" with an aria-label carrying the numeric rating; stars themselves are aria-hidden.'],
  usedBy: ['P-01', 'P-07', 'F-65'], figma: ['reviews.jpg'],
});
