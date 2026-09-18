import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { SiteLayout } from './SiteLayout';

export default defineMeta({
  tier: 'template', name: 'SiteLayout', description: 'Frame of the public website (P-01..P-12): sticky header with brand, section nav (slide-in drawer under 960 px), theme toggle and the Book now CTA; footer with both locations from the locations table, links and the staff entry.',
  props: [{ name: 'nav', type: 'SiteNavItem[]', default: 'SITE_NAV', description: 'Header links' }, { name: 'ctaTo / ctaLabel', type: 'string', default: '/site/book · Book now', description: 'Call to action' }, { name: 'footerNote', type: 'ReactNode', description: 'Right side of the legal line' }],
  states: ['desktop nav', 'phone drawer open', 'dark'],
  usages: [{ title: 'Frame (scaled preview)', render: () => h('div', { style: { border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', maxHeight: 420, overflowY: 'auto' } }, h(SiteLayout, null, h('div', { className: 'container', style: { padding: '40px 16px' } }, h('h2', null, 'Page content'), h('p', { className: 'muted' }, 'Pages render bare inside the frame.')))) }],
  a11y: ['Skip link, nav landmark with aria-label, burger has aria-expanded, scrim closes the drawer, route change closes it.'],
  usedBy: ['P-01', 'P-02', 'P-03', 'P-04', 'P-05', 'P-06', 'P-07', 'P-08', 'P-09', 'P-10', 'P-11', 'P-12'],
});
