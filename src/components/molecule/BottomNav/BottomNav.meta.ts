import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { BottomNav } from './BottomNav';

export default defineMeta({
  tier: 'molecule', name: 'BottomNav', description: 'Customer app tab bar with icons, labels and badges; safe-area aware. Items come from routes with surface customer and a nav entry.',
  props: [{ name: 'items', type: 'BottomNavItem[]', required: true, description: '{ to, label, icon, badge?, end? }' }],
  states: ['active', 'inactive', 'badge'],
  usages: [{ title: 'Customer tabs', render: () => h('div', { style: { maxWidth: 390 } }, h(BottomNav, { items: [{ to: '/dev/components', label: 'Home', icon: 'home', end: true }, { to: '/x1', label: 'Bookings', icon: 'calendar' }, { to: '/x2', label: 'Paw', icon: 'paw', badge: 1 }, { to: '/x3', label: 'Chat', icon: 'message' }, { to: '/x4', label: 'Profile', icon: 'user' }] })) }],
  a11y: ['nav landmark; NavLink sets aria-current on the active tab.'],
  usedBy: [], figma: ['Home Page-1.png', 'profile.jpg'],
});
