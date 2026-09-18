/** Modal around RoomAssignmentPicker used by check-in without a room (R-X05), the detail page and the timeline. */
import { useState } from 'react';
import { Modal } from '../../../components/organism/Modal/Modal';
import { Button } from '../../../components/atom/Button/Button';
import { RoomAssignmentPicker } from '../../../components/organism/RoomAssignmentPicker/RoomAssignmentPicker';
import type { BookingRow, RoomRow, RoomTypeRow } from '../../../data/schema/core';
import { dayOf } from './dates';

export interface RoomPickModalProps { booking: BookingRow | null; rooms: RoomRow[]; roomTypes: RoomTypeRow[]; bookings: BookingRow[]; heaviestLbs: number; title?: string; confirmLabel?: string; onClose: () => void; onPick: (roomId: string, roomCode: string) => void }

export function RoomPickModal({ booking, rooms, roomTypes, bookings, heaviestLbs, title, confirmLabel = 'Assign room', onClose, onPick }: RoomPickModalProps) {
  const [value, setValue] = useState<string | null>(booking?.room_id ?? null);
  if (!booking) return null;
  const code = rooms.find((r) => r.id === value)?.code ?? '';
  return (
    <Modal open onClose={onClose} title={title ?? `Room for ${booking.code}`} size="md"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!value} onClick={() => value && onPick(value, code)}>{confirmLabel}{code ? ` · ${code}` : ''}</Button></>}>
      <RoomAssignmentPicker rooms={rooms} roomTypes={roomTypes} bookings={bookings} roomTypeId={booking.room_type_id} checkInDay={dayOf(booking.check_in)} checkOutDay={dayOf(booking.check_out)} heaviestLbs={heaviestLbs} value={value} onChange={setValue} excludeBookingId={booking.id} allowNone={false} />
    </Modal>
  );
}
