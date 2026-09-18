import type { Role } from './roles';

/** String permissions (R-L05 seeds the staff set). Pages ask `can('bookings.status')`, never `role === ...`. bookings.status enables the status menu (front desk+); PIN_GATED_TRANSITIONS still need a manager PIN. */
export type Permission =
  | 'bookings.read' | 'bookings.write' | 'bookings.write_any' | 'bookings.status' | 'bookings.cancel' | 'bookings.delete'
  | 'appointments.read' | 'appointments.write' | 'daycare.write'
  | 'customers.read' | 'customers.write' | 'customers.delete'
  | 'pets.read' | 'pets.write' | 'vaccines.verify'
  | 'payments.read' | 'payments.write' | 'payments.refund' | 'discounts.apply' | 'cash_drawer.open'
  | 'invoices.write'
  | 'employees.read' | 'employees.write' | 'roles.write'
  | 'pricing.write' | 'settings.write' | 'locations.write' | 'rules.write'
  | 'reports.read' | 'reports.financial' | 'reports.employees' | 'reports.export'
  | 'messages.read' | 'messages.write' | 'reviews.moderate'
  | 'feedback.write' | 'feedback.read'
  | 'approvals.grant' | 'tables.read' | 'tables.write' | 'dev.tools' | 'docs.read' | 'audit.read';

const ALL: Permission[] = [
  'bookings.read', 'bookings.write', 'bookings.write_any', 'bookings.status', 'bookings.cancel', 'bookings.delete',
  'appointments.read', 'appointments.write', 'daycare.write', 'customers.read', 'customers.write', 'customers.delete',
  'pets.read', 'pets.write', 'vaccines.verify', 'payments.read', 'payments.write', 'payments.refund', 'discounts.apply', 'cash_drawer.open',
  'invoices.write', 'employees.read', 'employees.write', 'roles.write', 'pricing.write', 'settings.write', 'locations.write', 'rules.write',
  'reports.read', 'reports.financial', 'reports.employees', 'reports.export', 'messages.read', 'messages.write', 'reviews.moderate',
  'feedback.write', 'feedback.read', 'approvals.grant', 'tables.read', 'tables.write', 'dev.tools', 'docs.read', 'audit.read',
];

const FRONT_DESK: Permission[] = [
  'bookings.read', 'bookings.write_any', 'bookings.status', 'appointments.read', 'appointments.write', 'daycare.write', 'customers.read', 'customers.write',
  'pets.read', 'pets.write', 'vaccines.verify', 'payments.read', 'payments.write', 'invoices.write', 'messages.read', 'messages.write',
  'feedback.write', 'docs.read', 'cash_drawer.open',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL,
  owner: ALL.filter((p) => p !== 'dev.tools'),
  manager: [...FRONT_DESK, 'bookings.cancel', 'bookings.delete', 'customers.delete', 'payments.refund', 'discounts.apply', 'employees.read', 'reports.read', 'reports.employees', 'reviews.moderate', 'approvals.grant', 'feedback.read', 'audit.read', 'tables.read'],
  front_desk: FRONT_DESK,
  groomer: ['appointments.read', 'appointments.write', 'pets.read', 'customers.read', 'messages.read', 'feedback.write', 'docs.read'],
  customer: ['bookings.read', 'bookings.write', 'appointments.read', 'pets.read', 'pets.write', 'payments.read', 'messages.read', 'messages.write', 'docs.read'],
  public: ['docs.read'],
};

export function roleCan(role: Role, permission: Permission): boolean { return ROLE_PERMISSIONS[role].includes(permission); }
