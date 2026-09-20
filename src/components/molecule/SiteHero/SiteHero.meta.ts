import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { SiteHero } from './SiteHero';
import { SitePhoto } from '../SitePhoto/SitePhoto';
import { Button } from '../../atom/Button/Button';

const lobby = { webp: './site/img/dsc06310-{w}.webp', jpg: './site/img/dsc06310-1600.jpg', widths: [480, 960, 1600], w: 2500, h: 1667 };

export default defineMeta({
  tier: 'molecule', name: 'SiteHero', description: 'Public-website hero block: eyebrow, large title, subhead, lead, call-to-action row and optional aside. Brand tone paints the primary purple; soft and plain tones head the inner pages; media tone is the full-bleed landing hero (photo or muted background video behind a brand scrim, with a pause / play control).',
  props: [
    { name: 'title', type: 'ReactNode', required: true, description: 'Headline' },
    { name: 'eyebrow', type: 'ReactNode', description: 'Small line above' },
    { name: 'subhead', type: 'ReactNode', description: 'One line under the title (services strip)' },
    { name: 'lead', type: 'ReactNode', description: 'Paragraph' },
    { name: 'actions', type: 'ReactNode', description: 'Buttons' },
    { name: 'aside', type: 'ReactNode', description: 'Right column' },
    { name: 'tone', type: "'brand'|'soft'|'plain'|'media'", default: 'brand', description: 'Background' },
    { name: 'align', type: "'left'|'center'", default: 'left', description: 'Alignment' },
    { name: 'compact', type: 'boolean', description: 'Less padding' },
    { name: 'media', type: 'SiteHeroMedia', description: "{ kind: 'video-youtube', id, poster, playLabel, pauseLabel } or { kind: 'image', node }" },
  ],
  states: ['brand', 'soft', 'plain', 'with aside', 'media (poster)', 'media (video playing)'],
  usages: [
    { title: 'Media hero', render: () => h(SiteHero, { tone: 'media', eyebrow: 'Petrock Hotel & Spa · Encino & Westwood, Los Angeles', title: 'Rock Out With Your Paws Out!', subhead: 'Hotel · Grooming & Spa · Day care · Training', lead: 'Boutique, all-inclusive, music-themed penthouses and suites since 2011, with pictures and videos of your dog every day.', media: { kind: 'image', node: h(SitePhoto, { sources: lobby, alt: '', priority: true, sizes: '100vw' }) }, actions: h('div', { className: 'row wrap' }, h(Button, { size: 'lg', iconRight: 'arrow-right' }, 'Book now'), h(Button, { size: 'lg', variant: 'secondary' }, 'Call Encino')) }) },
    { title: 'Brand hero', render: () => h(SiteHero, { eyebrow: 'Dog hotel & spa · Encino & Westwood', title: 'Rock Out With Your Paws Out!', lead: 'Penthouses and suites with nightly photos, daycare with real playtime, Grooming & Spa for every size.', actions: h('div', { className: 'row wrap' }, h(Button, { size: 'lg', iconRight: 'arrow-right' }, 'Book in the app'), h(Button, { size: 'lg', variant: 'secondary' }, 'See the rooms')) }) },
    { title: 'Soft inner-page hero', render: () => h(SiteHero, { tone: 'soft', compact: true, eyebrow: 'Hotel', title: 'Penthouses and suites', lead: 'Every stay includes walks, playtime and nightly photos.' }) },
  ],
  a11y: [
    'One h1 per page; contrast of on-primary text checked in both themes, and over the media scrim.',
    'The background video is decorative: aria-hidden, tabIndex -1, pointer-events none, and it only mounts when motion is welcome, the viewport is at least 700 px and the run is not automated (navigator.webdriver).',
    'The pause / play control is a real 44 px button with aria-pressed, reachable by keyboard and visible without hover.',
  ],
  usedBy: ['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06', 'P-07', 'P-08', 'P-09', 'P-10', 'P-11', 'P-12', 'P-13'],
});
