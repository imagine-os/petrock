import { Link, useParams } from 'react-router-dom';
import { useRow, useTable } from '../../data/DataContext';
import type { BookingPetRow, BookingRow, LocationRow, PetRow, RoomTypeRow } from '../../data/schema/core';
import { fmtMoney } from '../../pricing/engine';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { BookingStatusTimeline } from '../../components/molecule/BookingStatusTimeline/BookingStatusTimeline';
import { useT } from '../../i18n';
import { fmtDateTime } from './lib';
import './customer-hotel.css';

/** C-37 · Hotel: confirmation after payment. */
export function ConfirmationPage() {
  const t = useT();
  const { id } = useParams();
  const booking = useRow<BookingRow>('bookings', id);
  const roomType = useRow<RoomTypeRow>('room_types', booking?.room_type_id);
  const location = useRow<LocationRow>('locations', booking?.location_id);
  const { rows: bps } = useTable<BookingPetRow>('booking_pets', { where: { booking_id: id ?? '__none__' } });
  const { rows: pets } = useTable<PetRow>('pets');
  if (!booking) return <HotelBookingFrame title={t('customer-hotel.confirmed')} backTo="/app"><EmptyState title="Booking not found" action={<Link to="/app/bookings"><Button variant="secondary">My reservations</Button></Link>} /></HotelBookingFrame>;
  const names = bps.map((bp) => pets.find((p) => p.id === bp.pet_id)?.name ?? 'Pet');
  const pending = booking.status === 'pending_vaccines';
  return (
    <HotelBookingFrame title={t('customer-hotel.confirmed')} footer={<><Link to={`/app/bookings/${booking.id}`}><Button block>View reservation</Button></Link><Link to="/app"><Button block variant="secondary">Home</Button></Link></>}>
      <div className="ch-success"><span className="ch-success-icon"><Icon name="check" size={32} strokeWidth={2.5} /></span><h2>{pending ? 'Almost there!' : 'Thanks! Your stay is requested'}</h2><span className="ch-code">{booking.code}</span><p className="small muted">{names.join(', ')} · {roomType?.name} · {location?.name}<br />{fmtDateTime(booking.check_in)} → {fmtDateTime(booking.check_out)}</p></div>
      <Card><BookingStatusTimeline status={booking.status} reachedAt={{ requested: booking.created_at, ...(pending ? { pending_vaccines: booking.created_at } : {}) }} hint={pending ? 'Upload vaccine proofs so the desk can verify them' : 'The front desk confirms within a day'} /></Card>
      <Card tint>
        <div className="stack-sm">
          <strong className="small">What happens next</strong>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
            {pending && <li>One or more pets have vaccines missing or awaiting verification. <Link to="/app/pets">Upload the proofs</Link> and the desk will verify them; the stay stays <em>Pending verification</em> until then.</li>}
            <li>The front desk reviews your request and confirms it; you get a notification when it becomes <em>Upcoming</em>.</li>
            <li>{booking.payment_method === 'cash' ? `Nothing was charged; ${fmtMoney(booking.total)} is due at check-in.` : booking.paid_in_full ? `Paid in full (${fmtMoney(booking.deposit)}).` : `Deposit of ${fmtMoney(booking.deposit)} paid; ${fmtMoney(Math.max(0, booking.total - booking.deposit))} due at check-in.`}</li>
            {booking.add_grooming && <li>Grooming is scheduled for check-out morning so your dog comes home fresh.</li>}
            <li>Bring labelled food and belongings; check-in from {fmtDateTime(booking.check_in).split(', ').pop()}.</li>
          </ul>
        </div>
      </Card>
    </HotelBookingFrame>
  );
}
