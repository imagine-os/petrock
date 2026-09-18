import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { defineSpec } from '../../specs/defineSpec';
import { EVERYONE } from '../../auth/roles';
import { LandingPage } from './LandingPage';

export const strings = {};
export const landingSpec = defineSpec({
  code: 'P-00', name: 'Public landing (placeholder)',
  purpose: 'Placeholder public website: hero, room types, Grooming & Spa packages and locations with hours, all read from tables. The real website rebuild is P-01…P-19.',
  layout: ['SiteHeader', 'Hero', 'Rooms', 'GroomingPackages', 'Locations', 'Footer'], data: ['locations', 'room_types', 'packages'], roles: EVERYONE,
  logic: ['Hours render from locations.hours; prices from packages.'], integrations: ['Squarespace (current site, unchanged)'], components: ['Button', 'Card', 'Icon'], rules: ['R-K02', 'R-G02'], states: ['default'], checkedAt: [360, 390, 768, 1280, 1920],
});
export const routes: RouteDef[] = [{ path: '/site', element: h(LandingPage), spec: landingSpec, roles: EVERYONE, surface: 'public', layout: 'auto' }];
