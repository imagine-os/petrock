/**
 * customer-grooming-daycare: customer Grooming & Spa (C-50..C-56) and Daycare (C-60..C-65) flows.
 * Entry points: /app/grooming and /app/daycare (linked from the Home service tiles, C-10). No bottom-nav entries.
 */
import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import type { Role } from '../../auth/roles';
import { GroomingStartPage } from './GroomingStartPage';
import { GroomingPetPackagePage } from './GroomingPetPackagePage';
import { GroomingAddonsPage } from './GroomingAddonsPage';
import { GroomingTimePage } from './GroomingTimePage';
import { GroomingCheckoutPage } from './GroomingCheckoutPage';
import { GroomingOrderPage } from './GroomingOrderPage';
import { GroomingOrdersPage } from './GroomingOrdersPage';
import { DaycareStartPage } from './DaycareStartPage';
import { DaycareBookPage } from './DaycareBookPage';
import { DaycareDetailsPage } from './DaycareDetailsPage';
import { DaycareCheckoutPage } from './DaycareCheckoutPage';
import { DaycareBookingPage } from './DaycareBookingPage';
import { DaycareBookingsPage } from './DaycareBookingsPage';
import * as S from './specs';
export { strings } from './strings';

const ROLES: Role[] = ['customer', 'super_admin'];
const page = (path: string, el: () => JSX.Element | null, spec: RouteDef['spec']): RouteDef => ({ path, element: h(el), spec, roles: ROLES, surface: 'customer', layout: 'mobile' });

export const routes: RouteDef[] = [
  page('/app/grooming', GroomingStartPage, S.groomingStartSpec),
  page('/app/grooming/new', GroomingPetPackagePage, S.groomingPetPackageSpec),
  page('/app/grooming/new/add-ons', GroomingAddonsPage, S.groomingAddonsSpec),
  page('/app/grooming/new/time', GroomingTimePage, S.groomingTimeSpec),
  page('/app/grooming/new/checkout', GroomingCheckoutPage, S.groomingCheckoutSpec),
  page('/app/grooming/orders', GroomingOrdersPage, S.groomingOrdersSpec),
  page('/app/grooming/orders/:id', GroomingOrderPage, S.groomingOrderSpec),
  page('/app/daycare', DaycareStartPage, S.daycareStartSpec),
  page('/app/daycare/new', DaycareBookPage, S.daycareBookSpec),
  page('/app/daycare/new/details', DaycareDetailsPage, S.daycareDetailsSpec),
  page('/app/daycare/new/checkout', DaycareCheckoutPage, S.daycareCheckoutSpec),
  page('/app/daycare/bookings', DaycareBookingsPage, S.daycareBookingsSpec),
  page('/app/daycare/bookings/:id', DaycareBookingPage, S.daycareBookingSpec),
];
