import { demoUsers, type DemoUser } from './demoUsers';
import { APPROVER_ROLES, type Role } from './roles';

export const PIN_MIN = 4;
export const PIN_MAX = 6;
export const isValidPinShape = (pin: string) => /^\d{4,6}$/.test(pin);

/**
 * Mock PIN hashing: a tiny FNV-1a so seeds never store a raw PIN. The real backend replaces this
 * with a server-side check (Company-OS or Supabase edge function); the UI contract stays the same.
 */
export function hashPin(pin: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < pin.length; i++) { h ^= pin.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return `fnv_${h.toString(16).padStart(8, '0')}`;
}

export interface PinHolder { userId: string; name: string; role: Role; pinHash: string; locationId: string | null }

/** Demo PIN holders (staff demo users). Employees added in-app extend this through the employees table. */
export const demoPinHolders: PinHolder[] = demoUsers.filter((u): u is DemoUser & { pin: string } => !!u.pin)
  .map((u) => ({ userId: u.id, name: u.name, role: u.role, pinHash: hashPin(u.pin), locationId: u.locationId }));

/** Finds who owns a PIN. `holders` lets the caller merge employees-table rows with the demo set. */
export function findByPin(pin: string, holders: PinHolder[] = demoPinHolders): PinHolder | null {
  if (!isValidPinShape(pin)) return null;
  const h = hashPin(pin);
  return holders.find((x) => x.pinHash === h) ?? null;
}

export const canApprove = (role: Role) => APPROVER_ROLES.includes(role);
