/**
 * frontdesk-grooming-people: F-30..F-59. Grooming day view / board / agenda / form / detail, customers, pets,
 * vaccine verification queue, staff inbox, staff notifications, invoice view & print.
 */
import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import type { StringTable } from '../../i18n/types';
import { GroomingDayPage } from './pages/GroomingDayPage';
import { GroomingBoardPage } from './pages/GroomingBoardPage';
import { GroomingAgendaPage } from './pages/GroomingAgendaPage';
import { GroomBookingFormPage } from './pages/GroomBookingFormPage';
import { AppointmentDetailPage } from './pages/AppointmentDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerFormPage } from './pages/CustomerFormPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { PetsPage } from './pages/PetsPage';
import { PetFormPage } from './pages/PetFormPage';
import { PetDetailPage } from './pages/PetDetailPage';
import { VaccineQueuePage } from './pages/VaccineQueuePage';
import { MessagesPage } from './pages/MessagesPage';
import { InvoicePage } from './pages/InvoicePage';
import * as S from './specs';

export const strings: StringTable = {
  'frontdesk-grooming-people.dayView': { en: 'Day view', es: 'Vista del día' },
  'frontdesk-grooming-people.board': { en: 'Board', es: 'Tablero' },
  'frontdesk-grooming-people.agenda': { en: 'Agenda', es: 'Agenda' },
  'frontdesk-grooming-people.newBooking': { en: 'New groom booking', es: 'Nueva cita de grooming' },
  'frontdesk-grooming-people.customers': { en: 'Customers', es: 'Clientes' },
  'frontdesk-grooming-people.pets': { en: 'Pets', es: 'Mascotas' },
  'frontdesk-grooming-people.vaccineQueue': { en: 'Verification queue', es: 'Cola de verificación' },
  'frontdesk-grooming-people.messages': { en: 'Messages', es: 'Mensajes' },
  'frontdesk-grooming-people.notifications': { en: 'Notifications', es: 'Notificaciones' },
};

const fd = (r: Omit<RouteDef, 'surface' | 'layout'>): RouteDef => ({ ...r, surface: 'frontdesk', layout: 'desktop' });

export const routes: RouteDef[] = [
  fd({ path: '/desk/grooming', element: h(GroomingDayPage), spec: S.dayViewSpec, roles: S.dayViewSpec.roles, nav: { label: 'Day view', icon: 'scissors', order: 0, group: 'grooming' } }),
  fd({ path: '/desk/grooming/board', element: h(GroomingBoardPage), spec: S.boardSpec, roles: S.boardSpec.roles, nav: { label: 'Board', icon: 'grid', order: 1, group: 'grooming' } }),
  fd({ path: '/desk/grooming/agenda', element: h(GroomingAgendaPage), spec: S.agendaSpec, roles: S.agendaSpec.roles, nav: { label: 'Agenda list', icon: 'list', order: 2, group: 'grooming' } }),
  fd({ path: '/desk/grooming/new', element: h(GroomBookingFormPage), spec: S.bookingFormSpec, roles: S.bookingFormSpec.roles, nav: { label: 'New groom booking', icon: 'plus', order: 3, group: 'grooming' } }),
  fd({ path: '/desk/grooming/:id/edit', element: h(GroomBookingFormPage), spec: S.bookingFormSpec, roles: S.bookingFormSpec.roles }),
  fd({ path: '/desk/grooming/:id', element: h(AppointmentDetailPage), spec: S.appointmentDetailSpec, roles: S.appointmentDetailSpec.roles }),
  fd({ path: '/desk/customers', element: h(CustomersPage), spec: S.customersSpec, roles: S.customersSpec.roles, nav: { label: 'Customers', icon: 'users', order: 0, group: 'people' } }),
  fd({ path: '/desk/customers/new', element: h(CustomerFormPage), spec: S.customerFormSpec, roles: S.customerFormSpec.roles }),
  fd({ path: '/desk/customers/:id/edit', element: h(CustomerFormPage), spec: S.customerFormSpec, roles: S.customerFormSpec.roles }),
  fd({ path: '/desk/customers/:id', element: h(CustomerDetailPage), spec: S.customerDetailSpec, roles: S.customerDetailSpec.roles }),
  fd({ path: '/desk/pets', element: h(PetsPage), spec: S.petsSpec, roles: S.petsSpec.roles, nav: { label: 'Pets', icon: 'paw', order: 1, group: 'people' } }),
  fd({ path: '/desk/pets/new', element: h(PetFormPage), spec: S.petFormSpec, roles: S.petFormSpec.roles }),
  fd({ path: '/desk/pets/:id/edit', element: h(PetFormPage), spec: S.petFormSpec, roles: S.petFormSpec.roles }),
  fd({ path: '/desk/pets/:id', element: h(PetDetailPage), spec: S.petDetailSpec, roles: S.petDetailSpec.roles }),
  fd({ path: '/desk/vaccines', element: h(VaccineQueuePage), spec: S.vaccineQueueSpec, roles: S.vaccineQueueSpec.roles, nav: { label: 'Verification queue', icon: 'shield', order: 0, group: 'vaccines' } }),
  fd({ path: '/desk/messages', element: h(MessagesPage), spec: S.messagesSpec, roles: S.messagesSpec.roles, nav: { label: 'Inbox', icon: 'message', order: 0, group: 'messages' } }),
  fd({ path: '/desk/invoices/:id', element: h(InvoicePage), spec: S.invoiceSpec, roles: S.invoiceSpec.roles }),
];
