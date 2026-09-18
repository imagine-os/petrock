import { defineSpec } from '../../specs/defineSpec';
import { EVERYONE } from '../../auth/roles';

export const hubSpec = defineSpec({
  code: 'HUB-01', name: 'Testing hub',
  purpose: 'First screen for the team: open any surface (customer app in a phone frame, front desk per location, owner/admin, ops manual, docs, dev), switch demo user by role, and toggle theme, brand and the builder tool.',
  layout: ['HubHeader (brand, theme, brand cycle, dev mode)', 'SessionStrip (RoleSwitcher, LocationSwitcher)', 'SurfaceGrid (customer phone preview, front desk x2, owner/admin, manual, docs, dev)', 'RoleButtons', 'DevLinks', 'Footer (version, counts)'],
  data: ['users', 'locations', 'notifications'], roles: EVERYONE,
  logic: ['Picking a role calls switchUser(role) then navigates to ROLE_HOME[role].', 'Front desk cards pin the demo front-desk user of that location.', 'Dev toggle only renders for super_admin; theme and brand persist in localStorage (petrock.theme).'],
  integrations: [], components: ['Card', 'Button', 'Toggle', 'RoleSwitcher', 'LocationSwitcher', 'PhoneFrame', 'Badge', 'SegmentedControl', 'IconButton'],
  rules: ['R-K01', 'R-M04'], states: ['default', 'dev mode on', 'viewing as another role'],
  notes: ['Not a customer-facing screen; internal testing entry point (hoy pattern).'], checkedAt: [360, 390, 768, 1280, 1920],
});

export const noAccessSpec = defineSpec({
  code: 'HUB-02', name: 'No access',
  purpose: 'Friendly page when the current role cannot open a route; offers the hub to switch demo user or the PIN login.',
  layout: ['Illustration', 'Title', 'Body (role name, target route)', 'Actions (hub, PIN login)'], data: ['users'], roles: EVERYONE,
  logic: ['RequireRole redirects here with ?from=<path>.'], integrations: [], components: ['EmptyState', 'Button'], rules: ['R-X88'], states: ['default'], checkedAt: [360, 390, 768, 1280],
});
