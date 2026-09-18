/**
 * customer-home-pets module (C-10..C-29): customer home, my pets, add / edit pet wizard, pet profile, vaccines, notifications.
 * Replaces the C-10 stub at /app. Bottom tabs: Home (0) and Pets (20); other customer modules add Bookings / Settings.
 */
import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { HomePage } from './HomePage';
import { MyPetsPage } from './MyPetsPage';
import { PetWizardPage } from './PetWizardPage';
import { PetProfilePage } from './PetProfilePage';
import { NotificationsPage } from './NotificationsPage';
import { VaccinesHubPage, PetVaccinesPage } from './VaccinesPages';
import { homeSpec, myPetsSpec, addPetSpec, petProfileSpec, editPetSpec, notificationsSpec, vaccinesHubSpec, petVaccinesSpec, CUSTOMER_ROLES } from './specs';
export { strings } from './strings';

const customer = (r: Omit<RouteDef, 'roles' | 'surface' | 'layout'>): RouteDef => ({ ...r, roles: CUSTOMER_ROLES, surface: 'customer', layout: 'mobile' });

export const routes: RouteDef[] = [
  customer({ path: '/app', element: h(HomePage), spec: homeSpec, nav: { label: 'Home', icon: 'home', order: 0, group: 'customer' } }),
  customer({ path: '/app/pets', element: h(MyPetsPage), spec: myPetsSpec, nav: { label: 'Pets', icon: 'paw', order: 20, group: 'customer' } }),
  customer({ path: '/app/pets/new', element: h(PetWizardPage, { mode: 'new' }), spec: addPetSpec }),
  customer({ path: '/app/pets/:petId', element: h(PetProfilePage), spec: petProfileSpec }),
  customer({ path: '/app/pets/:petId/edit', element: h(PetWizardPage, { mode: 'edit' }), spec: editPetSpec }),
  customer({ path: '/app/pets/:petId/vaccines', element: h(PetVaccinesPage), spec: petVaccinesSpec }),
  customer({ path: '/app/vaccines', element: h(VaccinesHubPage), spec: vaccinesHubSpec }),
  customer({ path: '/app/notifications', element: h(NotificationsPage), spec: notificationsSpec }),
];
