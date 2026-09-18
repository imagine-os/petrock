/**
 * Booking actions shared by F-01 / F-10 / F-12 / F-13: status transitions (PIN-gated per PIN_GATED_TRANSITIONS),
 * room assignment, moves. Every action writes booking_events (R-J08) and, when approved, links the approvals row.
 */
import { useCallback, useState } from 'react';
import { useData } from '../../../data/DataContext';
import type { ApprovalRow, BookingPetRow, BookingRow } from '../../../data/schema/core';
import type { BookingEventRow } from '../../../data/schema/frontdesk-reservations';
import { useSession } from '../../../auth/SessionProvider';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { PinApprovalModal, type PinApprovalRequest } from '../../../components/organism/PinApprovalModal/PinApprovalModal';
import { BOOKING_STATUS_LABEL, canTransition, transitionNeedsPin, type BookingStatus } from '../../../domain/booking';

type Pending = { request: PinApprovalRequest; run: (approval: ApprovalRow | null) => Promise<void> };

export function useBookingActions() {
  const data = useData();
  const { user } = useSession();
  const { toast } = useToast();
  const [pending, setPending] = useState<Pending | null>(null);

  const logEvent = useCallback(async (b: BookingRow, kind: BookingEventRow['kind'], summary: string, extra: Partial<BookingEventRow> = {}) => {
    await data.insert<BookingEventRow>('booking_events', { location_id: b.location_id ?? null, booking_id: b.id, kind, summary, user_id: user.id, user_name: user.name, from_status: null, to_status: null, approval_id: null, details: null, at: new Date().toISOString(), ...extra });
  }, [data, user]);

  /** Runs `run` now, or after a manager PIN when `gated`. */
  const gate = useCallback((gated: boolean, request: PinApprovalRequest, run: Pending['run']) => { if (gated) setPending({ request, run }); else void run(null); }, []);

  const changeStatus = useCallback((b: BookingRow, to: BookingStatus, opts: { roomId?: string | null } = {}) => {
    const from = b.status as BookingStatus;
    if (!canTransition(from, to)) { toast({ tone: 'danger', title: `Cannot go from ${BOOKING_STATUS_LABEL[from]} to ${BOOKING_STATUS_LABEL[to]}` }); return; }
    const run = async (approval: ApprovalRow | null) => {
      const patch: Partial<BookingRow> = { status: to };
      if (opts.roomId !== undefined) patch.room_id = opts.roomId;
      if (to === 'cancelled' || to === 'no_show') patch.payment_status = b.deposit > 0 ? 'refunded' : b.payment_status;
      await data.update<BookingRow>('bookings', b.id, patch);
      if (opts.roomId) { const bps = await data.list<BookingPetRow>('booking_pets', { where: { booking_id: b.id } }); for (const bp of bps) await data.update('booking_pets', bp.id, { room_id: opts.roomId }); }
      await logEvent(b, 'status', `Status ${BOOKING_STATUS_LABEL[from]} → ${BOOKING_STATUS_LABEL[to]}${approval ? ` (approved by ${approval.approved_by_name})` : ''}`, { from_status: from, to_status: to, approval_id: approval?.id ?? null });
      await data.insert('audit_log', { location_id: b.location_id ?? null, user_id: user.id, user_name: user.name, action: 'booking.status', table_name: 'bookings', row_id: b.id, diff: { from, to } });
      toast({ tone: 'success', title: `${b.code} is now ${BOOKING_STATUS_LABEL[to]}` });
    };
    gate(transitionNeedsPin(from, to), { action: 'booking.status', title: `Set ${b.code} to ${BOOKING_STATUS_LABEL[to]}`, description: `Changing a ${BOOKING_STATUS_LABEL[from]} booking to ${BOOKING_STATUS_LABEL[to]} needs a manager PIN (R-I06).`, subjectTable: 'bookings', subjectId: b.id, details: { from, to } }, run);
  }, [data, gate, logEvent, toast, user]);

  const assignRoom = useCallback(async (b: BookingRow, roomId: string | null, roomCode: string) => {
    await data.update<BookingRow>('bookings', b.id, { room_id: roomId });
    const bps = await data.list<BookingPetRow>('booking_pets', { where: { booking_id: b.id } });
    for (const bp of bps) await data.update('booking_pets', bp.id, { room_id: roomId });
    await logEvent(b, 'room', roomId ? `Room ${roomCode} assigned` : 'Room unassigned', { details: { room_id: roomId } });
    toast(roomId ? `${b.code} → ${roomCode}` : `${b.code} room cleared`);
  }, [data, logEvent, toast]);

  const moveStay = useCallback(async (b: BookingRow, roomId: string | null, roomCode: string, checkIn: string, checkOut: string) => {
    await data.update<BookingRow>('bookings', b.id, { room_id: roomId, check_in: checkIn, check_out: checkOut });
    const bps = await data.list<BookingPetRow>('booking_pets', { where: { booking_id: b.id } });
    for (const bp of bps) await data.update('booking_pets', bp.id, { room_id: roomId });
    await logEvent(b, 'dates', `Moved to ${roomCode}, ${checkIn.slice(0, 10)} → ${checkOut.slice(0, 10)}`, { details: { room_id: roomId, check_in: checkIn, check_out: checkOut } });
    toast(`${b.code} moved to ${roomCode}`);
  }, [data, logEvent, toast]);

  /** Any other approval-gated action (delete, discount, refund). */
  const withApproval = useCallback((request: PinApprovalRequest, run: Pending['run']) => gate(true, request, run), [gate]);

  const modal = <PinApprovalModal open={!!pending} request={pending?.request ?? null} onClose={() => setPending(null)} onApproved={(a) => { const p = pending; setPending(null); void p?.run(a); }} />;
  return { changeStatus, assignRoom, moveStay, withApproval, logEvent, modal };
}
