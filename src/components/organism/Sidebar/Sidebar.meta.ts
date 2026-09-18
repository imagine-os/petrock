import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { Sidebar } from './Sidebar';

const groups = [
  { key: 'overview', label: 'Overview', icon: 'home' as const, items: [{ to: '/dev/components', label: 'Dashboard', icon: 'home' as const, end: true, code: 'F-01' }] },
  { key: 'reservations', label: 'Hotel reservations', icon: 'bed' as const, items: [{ to: '/x/table', label: 'All reservations', icon: 'table' as const }, { to: '/x/timeline', label: 'Timeline', icon: 'calendar' as const }, { to: '/x/new', label: 'New booking', icon: 'plus' as const, badge: 3 }] },
  { key: 'grooming', label: 'Grooming & Spa', icon: 'scissors' as const, items: [{ to: '/x/day', label: 'Day view', icon: 'calendar' as const }, { to: '/x/board', label: 'Board', icon: 'grid' as const }] },
];
function Demo() { const [rail, setRail] = useState(false); return h('div', { style: { height: 380, display: 'flex', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' } }, h(Sidebar, { groups, rail, onToggleRail: () => setRail((r) => !r), storageKey: 'petrock.sidebar.demo' })); }

export default defineMeta({
  tier: 'organism', name: 'Sidebar', description: 'Categorised side menu (D-014): collapsible categories with a per-category toggle, expand-all / collapse-all, active state, badges, page codes, and a rail mode. Categories come from routes with `nav` filtered by role, so each role has its own menu.',
  props: [{ name: 'groups', type: 'SidebarGroup[]', required: true, description: '{ key, label, icon, items[] }' }, { name: 'rail', type: 'boolean', description: 'Icons only' }, { name: 'showCodes', type: 'boolean', default: 'false', description: 'Page-code pills (dev mode only)' }, { name: 'footer', type: 'ReactNode', description: 'Bottom slot (DesktopShell puts the Log Out button here)' }, { name: 'onToggleRail', type: '() => void', description: 'Rail toggle' }, { name: 'storageKey', type: 'string', description: 'Persist collapsed categories per role' }, { name: 'header/footer', type: 'ReactNode', description: 'Slots' }],
  states: ['expanded', 'category collapsed', 'all collapsed', 'rail', 'active link'],
  usages: [{ title: 'Live (toggle rail with the chevron)', render: () => h(Demo) }],
  a11y: ['nav landmark; category buttons carry aria-expanded; NavLink sets aria-current.'],
  usedBy: ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-06', 'D-07'], figma: ['front desk.jpg (sidebar)', 'Section 4.png (collapsed nav)'],
});
