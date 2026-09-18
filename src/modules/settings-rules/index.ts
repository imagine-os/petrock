/** Settings > Rules for the owner: the same rules registry page (D-05) mounted in the admin surface as A-40. */
import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { RulesPage } from '../dev/RulesPage';
import { rulesSpec } from '../dev/specs';

export const strings = {};
export const settingsRulesSpec = { ...rulesSpec, code: 'A-40', name: 'Settings › Rules', roles: ['owner' as const, 'super_admin' as const, 'manager' as const] };
export const routes: RouteDef[] = [
  { path: '/admin/settings/rules', element: h(RulesPage, { code: 'A-40' }), spec: settingsRulesSpec, roles: ['owner', 'super_admin', 'manager'], surface: 'admin', layout: 'desktop', nav: { label: 'Rules', icon: 'flag', order: 90, group: 'settings' } },
];
