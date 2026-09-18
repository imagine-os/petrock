import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { AuthBrandHeader } from './AuthBrandHeader';

export default defineMeta({
  tier: 'molecule', name: 'AuthBrandHeader', description: 'Petrock mark + wordmark with a title and purple subtitle; hero variant for the welcome screen, compact variant with a back chevron for auth forms.',
  props: [{ name: 'title', type: 'ReactNode', description: 'Heading' }, { name: 'subtitle', type: 'ReactNode', description: 'Purple subheading (e.g. New to Petrock?)' }, { name: 'variant', type: "'hero'|'compact'", default: 'compact', description: 'Big centered logo vs small logo row' }, { name: 'backTo', type: 'string', description: 'Route for the back chevron' }],
  states: ['hero', 'compact', 'compact with back'],
  usages: [
    { title: 'Hero (C-01)', render: () => h(AuthBrandHeader, { variant: 'hero', title: 'Rock out with your paws out', subtitle: 'New to Petrock?' }) },
    { title: 'Compact with back (C-03)', render: () => h(AuthBrandHeader, { title: 'Create your account', subtitle: 'New to Petrock?', backTo: '/auth' }) },
  ],
  a11y: ['Logo image is decorative (empty alt); the wordmark is real text.', 'Back chevron is a link with an aria-label.'],
  usedBy: ['C-01', 'C-02', 'C-03', 'C-04', 'C-05', 'C-06', 'C-07', 'C-08', 'C-09'], figma: ['Frame 1171276420.png', 'Frame 1171276422.png'],
});
