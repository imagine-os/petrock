import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { InspectorPanel } from './InspectorPanel';
import { Button } from '../../atom/Button/Button';

const spec = { code: 'F-01', name: 'Hotel reservations', purpose: 'Run the day: arrivals, departures, stays, with status changes gated by manager PIN.', layout: ['PageHeader', 'StatTiles', 'DayTabs', 'ReservationsTable'], data: ['bookings', 'booking_pets', 'customers', 'pets', 'rooms', 'nope_table'], roles: ['front_desk' as const, 'manager' as const, 'owner' as const], logic: ['dayBucket(booking, today)', 'transitionNeedsPin(from, to) opens PinApprovalModal'], integrations: [], components: ['DataTable', 'StatusBadge', 'PinApprovalModal'], rules: ['R-I05', 'R-I06'], states: ['loading', 'empty', 'error'], checkedAt: [360, 390, 768, 1280, 1920] };
function Demo() { const [o, setO] = useState(false); return h('div', null, h(Button, { variant: 'secondary', icon: 'spec', onClick: () => setO(true) }, 'Open inspector'), h(InspectorPanel, { spec, open: o, onClose: () => setO(false), routePath: '/desk' })); }

export default defineMeta({
  tier: 'organism', name: 'InspectorPanel', description: 'The builder tool drawer: Overview (purpose, route, roles, states, Figma, responsive check, missing), Layout, Data (tables linking to the manager), Rules (linked to the registry with status), Components (linking to the library) and Logic / integrations.',
  props: [{ name: 'spec', type: 'PageSpec', required: true, description: 'The route spec' }, { name: 'open/onClose', type: '', required: true, description: 'Visibility' }, { name: 'routePath', type: 'string', description: 'Route pattern' }, { name: 'initialTab', type: 'string', description: 'Tab to open on' }],
  states: ['six tabs', 'known / unknown tables', 'completeness badge'],
  usages: [{ title: 'Sample spec', render: () => h(Demo) }],
  a11y: ['Drawer dialog + Tabs tablist.'],
  usedBy: ['HUB-01', 'D-03'],
});
