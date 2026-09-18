import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { TopBar } from './TopBar';

export default defineMeta({
  tier: 'organism', name: 'TopBar', description: 'Staff top bar: menu button under 900 px, title, the current location (always visible), theme toggle, brand cycle, notifications with count, and the user menu with RoleSwitcher, dev-mode toggle (super admin), hub and sign out.',
  props: [{ name: 'title', type: 'ReactNode', description: 'Surface title (narrow screens)' }, { name: 'searchTo', type: 'string', description: 'Search box target (?q=); hidden when omitted' }, { name: 'newBookingTo', type: 'string', description: 'New booking button target' }, { name: 'chatTo', type: 'string', description: 'Chat icon target' }, { name: 'helpTo', type: 'string', description: 'Help link target' }, { name: 'onMenu', type: '() => void', description: 'Opens the sidebar drawer on narrow screens' }, { name: 'children', type: 'ReactNode', description: 'Middle slot (search, quick actions)' }, { name: 'showLocation', type: 'boolean', default: 'true', description: 'Location switcher' }],
  states: ['desktop', 'narrow (menu button)', 'user menu open'],
  usages: [{ title: 'Live', render: () => h('div', { style: { border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' } }, h(TopBar, { title: 'Front desk', searchTo: '/desk/customers', newBookingTo: '/desk/reservations', chatTo: '/desk/messages', helpTo: '/manual' })) }],
  a11y: ['User button has aria-haspopup / aria-expanded; all icon buttons are labelled.'],
  usedBy: ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-06', 'D-07'], figma: ['front desk.jpg (top bar)'],
});
