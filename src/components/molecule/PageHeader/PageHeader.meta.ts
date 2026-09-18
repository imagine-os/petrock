import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PageHeader } from './PageHeader';
import { Button } from '../../atom/Button/Button';

export default defineMeta({
  tier: 'molecule', name: 'PageHeader', description: 'Title row for every page: back link, eyebrow / page code, title, subtitle, right-side actions and an optional bar for tabs or filters. Actions stack full-width on phones.',
  props: [{ name: 'title', type: 'string', required: true, description: 'H1' }, { name: 'subtitle', type: 'ReactNode', description: 'Muted line' }, { name: 'actions', type: 'ReactNode', description: 'Buttons' }, { name: 'backTo', type: 'string', description: 'Back link route' }, { name: 'code', type: 'string', description: 'Page code chip' }, { name: 'children', type: 'ReactNode', description: 'Bar under the title (tabs, filters)' }],
  states: ['default', 'with actions', 'with back'],
  usages: [{ title: 'Front desk style', render: () => h(PageHeader, { code: 'F-01', eyebrow: 'Encino', title: 'Hotel reservations', subtitle: 'Arrivals, departures and stays for today.', actions: h(Button, { icon: 'plus' }, 'New booking') }) }],
  a11y: ['One h1 per page.'],
  usedBy: ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-07'],
});
