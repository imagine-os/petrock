import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { BottomNav } from './BottomNav';

export default defineMeta({
  tier: 'molecule', name: 'BottomNav', description: 'Customer app tab bar (Figma Navbar 1824:40233): 71 px primary purple, four unlabelled white glyphs (home, ticket, paw disc, gear; NAV_GLYPH maps route icons), 8 px #BF0000 badge dot on the paw; labels stay for screen readers; safe-area aware. Items come from routes with surface customer and a nav entry.',
  props: [{ name: 'items', type: 'BottomNavItem[]', required: true, description: '{ to, label, icon, badge?, end? }' }],
  states: ['active', 'inactive', 'badge'],
  usages: [{ title: 'Customer tabs', render: () => h('div', { style: { maxWidth: 390 } }, h(BottomNav, { items: [{ to: '/dev/components', label: 'Home', icon: 'home', end: true }, { to: '/x1', label: 'Bookings', icon: 'calendar' }, { to: '/x2', label: 'Paw', icon: 'paw', badge: 1 }, { to: '/x3', label: 'Chat', icon: 'message' }, { to: '/x4', label: 'Profile', icon: 'user' }] })) }],
  a11y: ['nav landmark; NavLink sets aria-current on the active tab.'],
  usedBy: [], figma: ['Home Page-1.png', 'profile.jpg'],
});
