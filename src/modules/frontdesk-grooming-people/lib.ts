/**
 * Shared logic for the frontdesk-grooming-people module: appointment lifecycle helpers (mirroring the ONE booking
 * lifecycle), vaccine summaries and the verify -> approve pet -> confirm bookings chain (R-X30), audit writes,
 * invoice creation (R-X37), date / time formatting and relative timestamps (R-M08).
 */
import type { DataProvider } from '../../data/provider';
import type { BaseRow } from '../../data/schema/types';
import type { AddonRow, AppointmentRow, AuditLogRow, BookingPetRow, BookingRow, CustomerRow, DaycareBookingRow, EmployeeRow, FeeRow, InvoiceRow, NotificationRow, PackageRow, PetRow, SettingRow, TaxRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import type { AppointmentExtrasRow } from '../../data/schema/frontdesk-grooming-people';
import { quoteGrooming, type Quote, type Size } from '../../pricing/engine';

// ---- fuller row types (core typed rows omit some columns that exist in the schema) ----
export type PetFull = PetRow & { is_mixed: boolean; color: string | null; medical_conditions: string | null; allergies: string | null; vet_id: string | null; can_have_treats: boolean; own_food: boolean; meals_per_day: string | null; feeding_am: string | null; feeding_midday: string | null; feeding_pm: string | null; socialized_with: string[] | null; photo_url: string | null; note: string | null };
export type CustomerFull = CustomerRow & { alt_phone: string | null; address: string | null; apt_suite: string | null; zip: string | null; preferred_contact: string | null; marketing_opt_in: boolean; note: string | null };
export type PackageFull = PackageRow & { inclusions: string | null; notes: string | null };
export type AddonFull = AddonRow & { description: string | null; employee_type: string | null };
export type AppointmentFull = AppointmentRow & { notes: string | null };

// ---- appointment lifecycle (core enum APPOINTMENT_STATUS; transitions mirror src/domain/booking.ts) ----
export type AppointmentStatus = 'requested' | 'confirmed' | 'in_progress' | 'done' | 'cancelled' | 'no_show';
export const APPOINTMENT_STATUSES: AppointmentStatus[] = ['requested', 'confirmed', 'in_progress', 'done', 'cancelled', 'no_show'];
export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = { requested: 'Requested', confirmed: 'Confirmed', in_progress: 'In progress', done: 'Done', cancelled: 'Cancelled', no_show: 'No show' };
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  requested: ['confirmed', 'cancelled'], confirmed: ['in_progress', 'cancelled', 'no_show'], in_progress: ['done'], done: [], cancelled: ['requested'], no_show: ['requested'],
};
/** R-X33: same PIN gates as PIN_GATED_TRANSITIONS (cancel / no-show a confirmed one, re-open). */
export const APPOINTMENT_PIN_GATED: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = { confirmed: ['cancelled', 'no_show'], cancelled: ['requested'], no_show: ['requested'] };
export const canTransitionAppointment = (from: string, to: string) => (APPOINTMENT_TRANSITIONS[from as AppointmentStatus] ?? []).includes(to as AppointmentStatus);
export const appointmentNeedsPin = (from: string, to: string) => (APPOINTMENT_PIN_GATED[from as AppointmentStatus] ?? []).includes(to as AppointmentStatus);
export const TRANSITION_VERB: Record<AppointmentStatus, string> = { requested: 'Re-open', confirmed: 'Confirm', in_progress: 'Start', done: 'Finish', cancelled: 'Cancel', no_show: 'No show' };

// ---- names and labels ----
export const fullName = (c?: Pick<CustomerRow, 'first_name' | 'last_name'> | null) => (c ? `${c.first_name} ${c.last_name}`.trim() : 'Unknown customer');
export const sizeLabel: Record<string, string> = { S: 'Small', M: 'Medium', L: 'Large', XL: 'X-Large', Giant: 'Giant' };
/** R-G20: "Owner Last, PET; Breed; Package Size". */
export function dayViewLabel(c: CustomerRow | undefined, p: PetRow | undefined, pkg: PackageRow | undefined, size: string | null) {
  return `${c?.last_name ?? '?'}, ${(p?.name ?? '?').toUpperCase()}; ${p?.breed ?? 'Mixed'}; ${pkg ? `${pkg.name} ${sizeLabel[size ?? ''] ?? size ?? ''}`.trim() : 'No package'}`;
}
export const initials = (name: string) => name.split(/\s+/).map((s) => s[0]).join('').slice(0, 2).toUpperCase();

// ---- dates ----
export const pad2 = (n: number) => String(n).padStart(2, '0');
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const todayIso = () => isoDay(new Date());
export const dayOf = (iso: string) => { const d = new Date(iso); return isoDay(d); };
export const shiftDay = (day: string, n: number) => { const d = new Date(`${day}T12:00:00`); d.setDate(d.getDate() + n); return isoDay(d); };
export const fmtDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) => (iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('en-US', opts) : '—');
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
export const fmtDateTime = (iso: string) => `${fmtDate(iso)} · ${fmtTime(iso)}`;
export const hhmm = (iso: string) => { const d = new Date(iso); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
export const minutesOf = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
export const endOf = (ap: Pick<AppointmentRow, 'starts_at' | 'duration_min'>) => new Date(new Date(ap.starts_at).getTime() + ap.duration_min * 60_000).toISOString();
export const fmtRange = (ap: Pick<AppointmentRow, 'starts_at' | 'duration_min'>) => `${fmtTime(ap.starts_at)} – ${fmtTime(endOf(ap))}`;
export function combineDayTime(day: string, hm: string): string { const [h, m] = hm.split(':').map(Number); const d = new Date(`${day}T12:00:00`); d.setHours(h, m || 0, 0, 0); return d.toISOString(); }
/** R-M08 relative time; absolute after a week. */
export function relativeTime(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '';
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
  const d = Math.round(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return fmtDate(iso);
}
export const fmtMoney = (n: number | null | undefined) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);
export const ageOf = (dob: string | null) => { if (!dob) return null; const y = (Date.now() - new Date(dob).getTime()) / (365.25 * 86_400_000); return y < 1 ? `${Math.max(1, Math.round(y * 12))} mo` : `${Math.floor(y)} yr`; };

// ---- vaccines (R-A11, R-B01) ----
export type VaccineOverall = 'ok' | 'pending' | 'expired' | 'missing' | 'rejected';
export interface VaccineSummary { overall: VaccineOverall; ok: string[]; pending: string[]; expired: string[]; missing: string[]; rejected: string[]; requiredTotal: number; requiredOk: number }
export const isExpired = (r: Pick<VaccineRecordRow, 'expires_on'>, today = todayIso()) => !!r.expires_on && r.expires_on < today;
export function petVaccineSummary(petId: string, records: VaccineRecordRow[], types: VaccineTypeRow[], today = todayIso()): VaccineSummary {
  const s: VaccineSummary = { overall: 'ok', ok: [], pending: [], expired: [], missing: [], rejected: [], requiredTotal: 0, requiredOk: 0 };
  for (const t of types.filter((x) => x.required)) {
    s.requiredTotal++;
    const r = records.find((x) => x.pet_id === petId && x.vaccine_type_id === t.id);
    if (!r || r.status === 'missing') s.missing.push(t.short_name);
    else if (r.status === 'rejected') s.rejected.push(t.short_name);
    else if (r.status === 'expired' || isExpired(r, today)) s.expired.push(t.short_name);
    else if (r.status === 'submitted') s.pending.push(t.short_name);
    else { s.ok.push(t.short_name); s.requiredOk++; }
  }
  s.overall = s.expired.length ? 'expired' : s.rejected.length ? 'rejected' : s.missing.length ? 'missing' : s.pending.length ? 'pending' : 'ok';
  return s;
}
export const VACCINE_OVERALL_LABEL: Record<VaccineOverall, string> = { ok: 'Vaccines OK', pending: 'Proof to verify', expired: 'Expired vaccine', missing: 'Missing vaccine', rejected: 'Proof rejected' };

// ---- pricing helper (never hardcode: tables in, quote out) ----
export function quoteForAppointment(ap: Pick<AppointmentRow, 'package_id' | 'addon_ids' | 'size' | 'total'>, packages: PackageRow[], addons: AddonRow[], fees: FeeRow[], taxes: TaxRow[], extras?: Pick<AppointmentExtrasRow, 'payment_method' | 'discount_pct'> | null): Quote & { discountPct: number } {
  const pkg = packages.find((p) => p.id === ap.package_id) ?? null;
  const adds = (ap.addon_ids ?? []).map((id) => addons.find((a) => a.id === id)).filter((a): a is AddonRow => !!a);
  const size = (ap.size ?? 'M') as Size;
  const card = extras ? extras.payment_method === 'card' : Math.abs(quoteGrooming({ pkg, size, addons: adds, payWithCard: true, fees, taxes }).total - ap.total) < 0.011;
  const q = quoteGrooming({ pkg, size, addons: adds, payWithCard: card, fees, taxes });
  const pct = extras?.discount_pct ?? 0;
  if (pct > 0) {
    const off = Math.round(q.subtotal * pct) / 100;
    const tax = taxes.find((t) => t.active);
    const taxTotal = tax ? Math.round((q.subtotal - off) * tax.service_rate) / 100 : 0;
    const fee = card ? fees.find((f) => f.active && f.kind === 'card') : undefined;
    const feeTotal = fee ? Math.round((q.subtotal - off + taxTotal) * fee.percent) / 100 : 0;
    const lines = q.lines.filter((l) => l.kind === 'service' || l.kind === 'addon');
    lines.push({ label: `Discount (${pct}%)`, qty: 1, unit: -off, amount: -off, kind: 'discount' });
    if (tax && taxTotal) lines.push({ label: `${tax.name} (${tax.service_rate}%)`, qty: 1, unit: taxTotal, amount: taxTotal, kind: 'tax' });
    if (fee && feeTotal) lines.push({ label: `${fee.name} (${fee.percent}%)`, qty: 1, unit: feeTotal, amount: feeTotal, kind: 'fee' });
    return { ...q, lines, discountTotal: off, taxTotal, feeTotal, total: Math.round((q.subtotal - off + taxTotal + feeTotal) * 100) / 100, discountPct: pct };
  }
  return { ...q, discountPct: 0 };
}

/** R-G21: how many appointments overlap a slot at a location. */
export function overlapCount(apps: AppointmentRow[], startsAt: string, durationMin: number, excludeIds: string[] = []): number {
  const s = new Date(startsAt).getTime(), e = s + durationMin * 60_000;
  return apps.filter((a) => !excludeIds.includes(a.id) && !['cancelled', 'no_show'].includes(a.status) && new Date(a.starts_at).getTime() < e && new Date(endOf(a)).getTime() > s).length;
}

// ---- writes shared by pages ----
export interface Actor { id: string; name: string }
export async function writeAudit(data: DataProvider, actor: Actor, action: string, table: string, rowId: string | null, diff: Record<string, unknown> | null, locationId: string | null) {
  return data.insert<AuditLogRow>('audit_log', { location_id: locationId, user_id: actor.id, user_name: actor.name, action, table_name: table, row_id: rowId, diff });
}
export async function notify(data: DataProvider, userId: string | null | undefined, kind: string, title: string, body: string | null, link: string | null) {
  if (!userId) return null;
  return data.insert<NotificationRow>('notifications', { user_id: userId, kind, title, body, link, read: false, sent_at: new Date().toISOString() });
}

/** Approves the pet when every required vaccine is verified and confirms its pending_vaccines bookings (R-X30). Returns what changed. */
export async function settleVaccineStatus(data: DataProvider, petId: string, actor: Actor, locationId: string | null): Promise<{ petApproved: boolean; bookingsConfirmed: string[] }> {
  const types = await data.list<VaccineTypeRow>('vaccine_types');
  const records = await data.list<VaccineRecordRow>('vaccine_records', { where: { pet_id: petId } });
  const summary = petVaccineSummary(petId, records, types);
  const out = { petApproved: false, bookingsConfirmed: [] as string[] };
  if (summary.overall !== 'ok') return out;
  const pet = await data.get<PetRow>('pets', petId);
  if (!pet) return out;
  if (pet.approval_status !== 'approved') {
    await data.update<PetRow>('pets', petId, { approval_status: 'approved' });
    await writeAudit(data, actor, 'update', 'pets', petId, { approval_status: [pet.approval_status, 'approved'] }, locationId);
    out.petApproved = true;
  }
  const customer = await data.get<CustomerRow>('customers', pet.customer_id);
  const pets = await data.list<PetRow>('pets', { where: { customer_id: pet.customer_id } });
  const approved = new Set(pets.filter((p) => p.approval_status === 'approved' || p.id === petId).map((p) => p.id));
  const bps = await data.list<BookingPetRow>('booking_pets', { where: { pet_id: petId } });
  for (const bp of bps) {
    const b = await data.get<BookingRow>('bookings', bp.booking_id);
    if (!b || b.status !== 'pending_vaccines') continue;
    const all = await data.list<BookingPetRow>('booking_pets', { where: { booking_id: b.id } });
    if (!all.every((x) => approved.has(x.pet_id))) continue;
    await data.update<BookingRow>('bookings', b.id, { status: 'confirmed' });
    await writeAudit(data, actor, 'booking.status', 'bookings', b.id, { status: ['pending_vaccines', 'confirmed'], reason: 'vaccines verified' }, b.location_id ?? locationId);
    await notify(data, customer?.user_id, 'booking_confirmed', 'Your hotel booking is confirmed', `${b.code}: vaccines verified by the front desk`, '/app/bookings');
    out.bookingsConfirmed.push(b.code);
  }
  const dcs = await data.list<DaycareBookingRow>('daycare_bookings', { where: { customer_id: pet.customer_id, status: 'pending_vaccines' } });
  for (const d of dcs) {
    if (!d.pet_ids.includes(petId) || !d.pet_ids.every((id) => approved.has(id))) continue;
    await data.update<DaycareBookingRow>('daycare_bookings', d.id, { status: 'confirmed' });
    await writeAudit(data, actor, 'booking.status', 'daycare_bookings', d.id, { status: ['pending_vaccines', 'confirmed'], reason: 'vaccines verified' }, d.location_id ?? locationId);
    await notify(data, customer?.user_id, 'booking_confirmed', 'Your daycare day is confirmed', `${d.code}: vaccines verified by the front desk`, '/app/bookings');
    out.bookingsConfirmed.push(d.code);
  }
  return out;
}

export async function verifyVaccineRecord(data: DataProvider, rec: VaccineRecordRow, actor: Actor, locationId: string | null) {
  await data.update<VaccineRecordRow>('vaccine_records', rec.id, { status: isExpired(rec) ? 'expired' : 'verified', verified_by: actor.id, verified_at: new Date().toISOString(), note: null });
  await writeAudit(data, actor, 'vaccine.verify', 'vaccine_records', rec.id, { status: [rec.status, 'verified'] }, locationId);
  return settleVaccineStatus(data, rec.pet_id, actor, locationId);
}
export async function rejectVaccineRecord(data: DataProvider, rec: VaccineRecordRow, reason: string, actor: Actor, locationId: string | null, customerUserId: string | null | undefined, petName: string, vaccineName: string) {
  await data.update<VaccineRecordRow>('vaccine_records', rec.id, { status: 'rejected', verified_by: actor.id, verified_at: new Date().toISOString(), note: reason });
  await writeAudit(data, actor, 'vaccine.reject', 'vaccine_records', rec.id, { status: [rec.status, 'rejected'], reason }, locationId);
  await notify(data, customerUserId, 'vaccine_rejected', `${petName}: ${vaccineName} proof needs another look`, reason, '/app/pets');
}

/** R-X37: invoice from an appointment or hotel booking using settings.invoice numbering. */
export async function createInvoiceFor(data: DataProvider, src: { type: 'appointment' | 'booking' | 'daycare'; id: string; customerId: string; locationId: string | null; quote: Quote; deposit: number; note?: string | null }): Promise<InvoiceRow> {
  const settings = await data.list<SettingRow>('settings', { where: { key: 'invoice' } });
  const setting = settings[0];
  const v = (setting?.value ?? {}) as { next_number?: number; footer?: string; title?: string };
  const n = v.next_number ?? 1001;
  if (setting) await data.update<SettingRow>('settings', setting.id, { value: { ...v, next_number: n + 1 } });
  const q = src.quote;
  const inv = await data.insert<InvoiceRow>('invoices', {
    location_id: src.locationId, number: `INV-${n}`, customer_id: src.customerId, source_type: src.type, source_id: src.id, lines: q.lines.map((l) => ({ label: l.label, qty: l.qty, unit: l.unit, amount: l.amount })),
    subtotal: q.subtotal, discount_total: q.discountTotal, fee_total: q.feeTotal, tax_total: q.taxTotal, total: q.total, deposit: src.deposit, balance: Math.round((q.total - src.deposit) * 100) / 100, status: 'issued', issued_at: new Date().toISOString(), footer: src.note ? `${src.note}\n${v.footer ?? ''}`.trim() : v.footer ?? null,
  } as Partial<InvoiceRow>);
  return inv;
}

export const byId = <T extends BaseRow>(rows: T[]) => { const m = new Map<string, T>(); for (const r of rows) m.set(r.id, r); return m; };
export const groomersAt = (employees: EmployeeRow[], locationId: string | null, all: boolean) => employees.filter((e) => e.is_groomer && e.status !== 'inactive' && (all || !locationId || e.location_id === locationId));
export type WorkingHours = Record<string, { open: string; close: string } | null> | null;
export function hoursFor(e: { [k: string]: unknown } | undefined, day: string): { open: string; close: string } | null | undefined {
  const wh = e?.working_hours as WorkingHours | undefined;
  if (!wh) return undefined;
  const dow = new Date(`${day}T12:00:00`).getDay();
  return wh[String(dow)] ?? wh[dow as unknown as string] ?? null;
}
export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
export const nextCode = (rows: { code: string }[], prefix: string, start: number) => `${prefix}-${rows.reduce((m, r) => Math.max(m, Number(r.code.split('-')[1]) || 0), start - 1) + 1}`;
