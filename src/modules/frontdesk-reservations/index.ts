/**
 * Module frontdesk-reservations (F-01..F-15): today dashboard, hotel & daycare table, board booking form, booking
 * detail, room timeline, Grooming & Spa board, quick availability. All routes use the DesktopShell (surface frontdesk).
 */
import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { STAFF_ROLES } from '../../auth/roles';
import { TodayPage } from './TodayPage';
import { ReservationsTablePage } from './ReservationsTablePage';
import { BookingFormPage } from './BookingFormPage';
import { BookingDetailPage } from './BookingDetailPage';
import { TimelinePage } from './TimelinePage';
import { BoardPage } from './BoardPage';
import { AvailabilityPage } from './AvailabilityPage';
import { availabilitySpec, boardSpec, detailSpec, formSpec, tableSpec, timelineSpec, todaySpec } from './specs';
export { strings } from './strings';

const DESK = STAFF_ROLES.filter((r) => r !== 'groomer');

export const routes: RouteDef[] = [
  { path: '/desk', element: h(TodayPage), spec: todaySpec, roles: STAFF_ROLES, surface: 'frontdesk', layout: 'desktop', nav: { label: 'Today', icon: 'home', order: 0, group: 'overview' } },
  { path: '/desk/reservations', element: h(ReservationsTablePage), spec: tableSpec, roles: DESK, surface: 'frontdesk', layout: 'desktop', nav: { label: 'Table', icon: 'table', order: 10, group: 'reservations' } },
  { path: '/desk/reservations/timeline', element: h(TimelinePage), spec: timelineSpec, roles: DESK, surface: 'frontdesk', layout: 'desktop', nav: { label: 'Timeline', icon: 'calendar', order: 20, group: 'reservations' } },
  { path: '/desk/reservations/board', element: h(BoardPage), spec: boardSpec, roles: STAFF_ROLES, surface: 'frontdesk', layout: 'desktop', nav: { label: 'Board', icon: 'grid', order: 20, group: 'grooming' } },
  { path: '/desk/reservations/availability', element: h(AvailabilityPage), spec: availabilitySpec, roles: DESK, surface: 'frontdesk', layout: 'desktop', nav: { label: 'Availability', icon: 'search', order: 30, group: 'reservations' } },
  { path: '/desk/reservations/new', element: h(BookingFormPage), spec: formSpec, roles: DESK, surface: 'frontdesk', layout: 'desktop', nav: { label: 'New booking', icon: 'plus', order: 40, group: 'reservations' } },
  { path: '/desk/reservations/:id/edit', element: h(BookingFormPage), spec: formSpec, roles: DESK, surface: 'frontdesk', layout: 'desktop' },
  { path: '/desk/reservations/:id', element: h(BookingDetailPage), spec: detailSpec, roles: DESK, surface: 'frontdesk', layout: 'desktop' },
];
