import type { Role } from './roles';

/** Fictional people, one per role, plus a second front desk for the second location. Ids match seed `users` rows. */
export interface DemoUser {
  id: string;
  role: Role;
  name: string;
  initials: string;
  email: string;
  blurb: string;
  /** Pinned location for location-scoped staff; null = all locations. */
  locationId: string | null;
  /** Demo PIN (staff only). Fictional. */
  pin?: string;
}

export const demoUsers: DemoUser[] = [
  { id: 'usr_super', role: 'super_admin', name: 'Sam Rivera', initials: 'SR', email: 'sam@demo.petrock.test', blurb: 'Sees everything, including the builder tool.', locationId: null, pin: '000000' },
  { id: 'usr_owner', role: 'owner', name: 'Jordan Blake', initials: 'JB', email: 'jordan@demo.petrock.test', blurb: 'Owner: both locations, pricing, staff, rules.', locationId: null, pin: '1111' },
  { id: 'usr_manager', role: 'manager', name: 'Priya Natarajan', initials: 'PN', email: 'priya@demo.petrock.test', blurb: 'Encino manager: approves status changes, refunds, discounts.', locationId: 'loc_encino', pin: '2222' },
  { id: 'usr_desk', role: 'front_desk', name: 'Marcus Lee', initials: 'ML', email: 'marcus@demo.petrock.test', blurb: 'Encino front desk: check-ins, bookings, messages.', locationId: 'loc_encino', pin: '3333' },
  { id: 'usr_desk_ww', role: 'front_desk', name: 'Dana Whitfield', initials: 'DW', email: 'dana@demo.petrock.test', blurb: 'Westwood front desk.', locationId: 'loc_westwood', pin: '4444' },
  { id: 'usr_groomer', role: 'groomer', name: 'Renee Castillo', initials: 'RC', email: 'renee@demo.petrock.test', blurb: 'Encino groomer: the grooming day view.', locationId: 'loc_encino', pin: '5555' },
  { id: 'usr_customer', role: 'customer', name: 'Avery Thompson', initials: 'AT', email: 'avery@demo.petrock.test', blurb: 'Pet parent of Biscuit and Mochi.', locationId: null },
  { id: 'usr_public', role: 'public', name: 'Visitor', initials: '·', email: '', blurb: 'Not signed in.', locationId: null },
];

export const demoUserByRole = (role: Role): DemoUser => demoUsers.find((u) => u.role === role) ?? demoUsers[demoUsers.length - 1];
export const demoUserById = (id: string): DemoUser | undefined => demoUsers.find((u) => u.id === id);
