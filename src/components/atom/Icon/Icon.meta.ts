import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Icon, ICON_NAMES } from './Icon';

export default defineMeta({
  tier: 'atom', name: 'Icon', description: 'Inline SVG outline icon set (24 grid, currentColor). One set for every surface; names mirror the Figma export icons where they exist.',
  props: [{ name: 'name', type: 'IconName', required: true, description: 'Icon key' }, { name: 'size', type: 'number', default: '20', description: 'Pixel size' }, { name: 'title', type: 'string', description: 'Accessible title (otherwise decorative)' }],
  states: ['default'],
  usages: [{ title: 'All icons', render: () => h('div', { className: 'row wrap', style: { gap: 12 } }, ...ICON_NAMES.map((n) => h('span', { key: n, className: 'row', style: { gap: 6, fontSize: 12 } }, h(Icon, { name: n }), n))) }],
  a11y: ['Decorative by default (aria-hidden); pass title for meaningful icons.'],
  usedBy: ['HUB-01', 'D-02'], figma: ['Calendar.svg', 'Message.svg', 'Moon.svg', 'Setting.svg', 'Shield-Done.svg', 'Lock.svg', 'Logout.svg', 'User.svg', 'Users.svg', 'Trash Bin.svg', 'Arrow-Right.svg'],
});
