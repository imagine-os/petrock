/** Hotel booking draft: one object across the C-30..C-36 steps, persisted per browser (localStorage) so a refresh keeps the wizard. */
import { useCallback, useSyncExternalStore } from 'react';

export interface PetStayDetails { feeding: string; mealsPerDay: string; ownFood: boolean; takesMedication: boolean; medicationCount: string; medication: string; dosing: string; fleaMedication: boolean; fleaBrand: string; fleaDate: string; belongings: string; medicalAlert: string; notes: string }
export interface PetGrooming { packageId: string | null; addonIds: string[] }
export interface CustomerDetailsDraft { first_name: string; last_name: string; mobile: string; alt_phone: string; email: string; address: string; apt_suite: string; city: string; state: string; zip: string }
export interface HotelDraft {
  locationId: string | null;
  petIds: string[];
  shareRoom: boolean;
  checkIn: string | null; checkInTime: string; checkOut: string | null; checkOutTime: string;
  roomTypeId: string | null;
  petDetails: Record<string, PetStayDetails>;
  grooming: Record<string, PetGrooming>;
  groomingDecided: boolean;
  customer: CustomerDetailsDraft | null;
  payPlan: 'deposit' | 'full';
  payMethod: 'card' | 'cash';
  startedAt: string;
}

export const EMPTY_PET_DETAILS: PetStayDetails = { feeding: '', mealsPerDay: 'AM & PM', ownFood: false, takesMedication: false, medicationCount: '1', medication: '', dosing: '1 daily (AM only)', fleaMedication: false, fleaBrand: '', fleaDate: '', belongings: '', medicalAlert: '', notes: '' };
export const emptyDraft = (): HotelDraft => ({ locationId: null, petIds: [], shareRoom: true, checkIn: null, checkInTime: '10:00', checkOut: null, checkOutTime: '11:00', roomTypeId: null, petDetails: {}, grooming: {}, groomingDecided: false, customer: null, payPlan: 'deposit', payMethod: 'card', startedAt: new Date().toISOString() });

const KEY = 'petrock.hotelDraft.v1';
let current: HotelDraft = read();
const listeners = new Set<() => void>();
function read(): HotelDraft { try { const raw = localStorage.getItem(KEY); if (raw) return { ...emptyDraft(), ...(JSON.parse(raw) as Partial<HotelDraft>) }; } catch { /* ignore */ } return emptyDraft(); }
function write(next: HotelDraft) { current = next; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ } listeners.forEach((l) => l()); }
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function useHotelDraft(): { draft: HotelDraft; patch: (p: Partial<HotelDraft> | ((d: HotelDraft) => Partial<HotelDraft>)) => void; reset: () => void } {
  const draft = useSyncExternalStore(subscribe, () => current, () => current);
  const patch = useCallback((p: Partial<HotelDraft> | ((d: HotelDraft) => Partial<HotelDraft>)) => write({ ...current, ...(typeof p === 'function' ? p(current) : p) }), []);
  const reset = useCallback(() => write(emptyDraft()), []);
  return { draft, patch, reset };
}

/** Which wizard step the draft can reach (used by guards and the stepper). */
export function draftStage(d: HotelDraft): number {
  if (!d.locationId || d.petIds.length === 0 || !d.checkIn || !d.checkOut) return 0;
  if (!d.roomTypeId) return 1;
  if (!d.petIds.every((id) => d.petDetails[id])) return 2;
  if (!d.groomingDecided) return 3;
  if (!d.customer) return 4;
  return 6;
}
export const STEP_PATHS = ['/app/hotel', '/app/hotel/room', '/app/hotel/pets', '/app/hotel/grooming', '/app/hotel/customer', '/app/hotel/estimate', '/app/hotel/pay'];
export const STEP_LABELS = ['Pets & dates', 'Room', 'Details', 'Grooming', 'You', 'Estimate', 'Pay'];
