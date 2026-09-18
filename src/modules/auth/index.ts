import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { defineSpec } from '../../specs/defineSpec';
import { EVERYONE } from '../../auth/roles';
import { PinLoginPage } from './PinLoginPage';

export const strings = {};

export const pinLoginSpec = defineSpec({
  code: 'A-00', name: 'Staff PIN login',
  purpose: 'Fast staff sign-in with a 4-6 digit PIN; lands on the role home and pins the location for front desk / groomer.',
  layout: ['Brand', 'PinPad', 'Demo hint', 'Links (hub, customer sign in)'], data: ['employees', 'users', 'locations'], roles: EVERYONE,
  logic: ['findByPin(pin, holders): hash the PIN (FNV-1a mock) and match employees.pin_hash merged with demo holders.', 'On success switchUser(userId) and navigate to ROLE_HOME[role]; the LocationProvider pins location-scoped roles.', 'Wrong PIN clears the pad and shows an error; the real backend rate-limits.'],
  integrations: ['Company-OS auth (later)'], components: ['Card', 'PinPad', 'Button', 'Toast'], rules: ['R-P02'], states: ['empty', 'error', 'busy', 'success'], checkedAt: [360, 390, 768, 1280, 1920],
  figma: ['all reservation grooming-2.pdf (PIN Verification)'],
});

export const routes: RouteDef[] = [
  { path: '/staff/pin', element: h(PinLoginPage), spec: pinLoginSpec, roles: EVERYONE, surface: 'public', layout: 'auto' },
];
