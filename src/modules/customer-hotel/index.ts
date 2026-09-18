/** customer-hotel module: hotel stay booking wizard (C-30..C-37), my reservations (C-38), detail / invoice / change (C-39..C-41). */
import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import type { Role } from '../../auth/roles';
import { PetsDatesPage } from './PetsDatesPage';
import { RoomTypePage } from './RoomTypePage';
import { PetDetailsPage } from './PetDetailsPage';
import { GroomingPage } from './GroomingPage';
import { CustomerDetailsPage } from './CustomerDetailsPage';
import { EstimatePage } from './EstimatePage';
import { PaymentPage } from './PaymentPage';
import { ConfirmationPage } from './ConfirmationPage';
import { ReservationsPage } from './ReservationsPage';
import { ReservationDetailPage } from './ReservationDetailPage';
import { InvoicePage } from './InvoicePage';
import { ChangeRequestPage } from './ChangeRequestPage';
import * as S from './specs';
export { strings } from './strings';

const roles: Role[] = ['customer'];
const page = (path: string, el: () => JSX.Element, spec: RouteDef['spec'], nav?: RouteDef['nav']): RouteDef => ({ path, element: h(el), spec, roles, surface: 'customer', layout: 'mobile', nav });

export const routes: RouteDef[] = [
  page('/app/hotel', PetsDatesPage, S.petsDatesSpec),
  page('/app/hotel/room', RoomTypePage, S.roomTypeSpec),
  page('/app/hotel/pets', PetDetailsPage, S.petDetailsSpec),
  page('/app/hotel/grooming', GroomingPage, S.groomingSpec),
  page('/app/hotel/customer', CustomerDetailsPage, S.customerDetailsSpec),
  page('/app/hotel/estimate', EstimatePage, S.estimateSpec),
  page('/app/hotel/pay', PaymentPage, S.paymentSpec),
  page('/app/hotel/done/:id', ConfirmationPage, S.confirmationSpec),
  page('/app/bookings', ReservationsPage, S.reservationsSpec, { label: 'Bookings', icon: 'calendar', order: 10, group: 'customer' }),
  page('/app/bookings/:id', ReservationDetailPage, S.reservationDetailSpec),
  page('/app/bookings/:id/invoice', InvoicePage, S.invoiceSpec),
  page('/app/bookings/:id/change', ChangeRequestPage, S.changeRequestSpec),
];
