import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { SiteHero } from './SiteHero';
import { Button } from '../../atom/Button/Button';

export default defineMeta({
  tier: 'molecule', name: 'SiteHero', description: 'Public-website hero block: eyebrow, large title, lead, call-to-action row and optional aside. Brand tone paints the primary purple; soft and plain tones head the inner pages.',
  props: [{ name: 'title', type: 'ReactNode', required: true, description: 'Headline' }, { name: 'eyebrow', type: 'ReactNode', description: 'Small line above' }, { name: 'lead', type: 'ReactNode', description: 'Paragraph' }, { name: 'actions', type: 'ReactNode', description: 'Buttons' }, { name: 'aside', type: 'ReactNode', description: 'Right column' }, { name: 'tone', type: "'brand'|'soft'|'plain'", default: 'brand', description: 'Background' }, { name: 'align', type: "'left'|'center'", default: 'left', description: 'Alignment' }, { name: 'compact', type: 'boolean', description: 'Less padding' }],
  states: ['brand', 'soft', 'plain', 'with aside'],
  usages: [{ title: 'Brand hero', render: () => h(SiteHero, { eyebrow: 'Dog hotel & spa · Encino & Westwood', title: 'Rock Out With Your Paws Out!', lead: 'Penthouses and suites with nightly photos, daycare with real playtime, Grooming & Spa for every size.', actions: h('div', { className: 'row wrap' }, h(Button, { size: 'lg', iconRight: 'arrow-right' }, 'Book in the app'), h(Button, { size: 'lg', variant: 'secondary' }, 'See the rooms')) }) }, { title: 'Soft inner-page hero', render: () => h(SiteHero, { tone: 'soft', compact: true, eyebrow: 'Hotel', title: 'Penthouses and suites', lead: 'Every stay includes walks, playtime and nightly photos.' }) }],
  a11y: ['One h1 per page; contrast of on-primary text checked in both themes.'],
  usedBy: ['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06', 'P-07', 'P-08', 'P-09', 'P-10', 'P-11', 'P-12'],
});
