import { Navigate, useNavigate } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { BookingPetRow, BookingRow, CapacityRow, LocationRow, PetRow, RoomRow } from '../../data/schema/core';
import { fmtMoney } from '../../pricing/engine';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { HotelRoomTypeCard } from '../../components/molecule/HotelRoomTypeCard/HotelRoomTypeCard';
import { useT } from '../../i18n';
import { STEP_PATHS, draftStage, useHotelDraft } from './draft';
import { availability, avgNightly, combineDateTime, fmtDate, roomFit, useCustomerAccount, usePricingTables } from './lib';
import './customer-hotel.css';

/** C-31 · Choose Your Room Type (Figma Choose Your Room.png): photo cards with BOOK NOW, title, inclusions, avg price per night / pet; fit + capacity rules; books straight from the card (D-191). */
export function RoomTypePage() {
  const t = useT();
  const nav = useNavigate();
  const { draft, patch } = useHotelDraft();
  const { pets: myPets } = useCustomerAccount();
  const pricing = usePricingTables();
  const { rows: bookings } = useTable<BookingRow>('bookings');
  const { rows: bookingPets } = useTable<BookingPetRow>('booking_pets');
  const { rows: allPets } = useTable<PetRow>('pets');
  const { rows: rooms } = useTable<RoomRow>('rooms');
  const { rows: capacities } = useTable<CapacityRow>('capacities');
  const { rows: locations } = useTable<LocationRow>('locations');
  if (draftStage(draft) < 1) return <Navigate to={STEP_PATHS[0]} replace />;
  const pets = myPets.filter((p) => draft.petIds.includes(p.id));
  const location = locations.find((l) => l.id === draft.locationId);
  const roomsNeeded = draft.shareRoom ? 1 : pets.length;
  const checkIn = combineDateTime(draft.checkIn!, draft.checkInTime), checkOut = combineDateTime(draft.checkOut!, draft.checkOutTime);
  const heavyCount = pets.filter((p) => (p.weight_lbs ?? 0) >= 30).length;

  const cards = pricing.roomTypes.map((rt) => {
    const fit = roomFit(rt, pets);
    const av = availability({ locationId: draft.locationId!, roomType: rt, checkIn, checkOut, bookings, bookingPets, pets: allPets, rooms, capacities, roomsNeeded });
    const bottomNeeded = fit.needsBottom ? (draft.shareRoom ? 1 : heavyCount) : 0;
    const bottomOk = !fit.needsBottom || av.bottomFree >= bottomNeeded;
    const avg = avgNightly(draft, rt, pricing);
    const chips: { label: string; tone?: 'neutral' | 'success' | 'warn' | 'danger' | 'info' | 'primary' }[] = [];
    if (!fit.blocked) chips.push(av.free > 0 ? { label: `${av.free} of ${av.capacity} free`, tone: av.free <= 2 ? 'warn' : 'success' } : { label: 'Full', tone: 'danger' });
    if (fit.needsBottom && !fit.blocked) chips.push({ label: `Bottom room needed (${av.bottomFree} free)`, tone: bottomOk ? 'info' : 'danger' });
    const disabled = fit.blocked || !av.ok || !bottomOk;
    const reason = fit.blocked ? fit.reason : !av.ok ? `Only ${av.free} ${rt.name.toLowerCase()} room${av.free === 1 ? '' : 's'} free for these dates at ${location?.short_name ?? 'this location'} (you need ${roomsNeeded})` : !bottomOk ? `Dogs 30 lb+ need one of the ${av.bottomTotal} bottom penthouse rooms; ${av.bottomFree} free for these dates` : undefined;
    return { rt, avg, chips, disabled, reason };
  });
  const choose = (id: string) => { patch({ roomTypeId: id }); nav(STEP_PATHS[2]); };
  const current = cards.find((c) => c.rt.id === draft.roomTypeId);

  return (
    <HotelBookingFrame title={t('customer-hotel.chooseRoom')} backTo={STEP_PATHS[0]}
      footer={current && !current.disabled ? <Button block onClick={() => nav(STEP_PATHS[2])}>{t('customer-hotel.next')}</Button> : undefined}>
      <div className="ch-summary"><span className="row" style={{ gap: 4 }}><Icon name="paw" size={14} /> {pets.map((p) => p.name).join(', ')}</span><span className="row" style={{ gap: 4 }}><Icon name="calendar" size={14} /> {fmtDate(draft.checkIn)} → {fmtDate(draft.checkOut)}</span><span className="row" style={{ gap: 4 }}><Icon name="location" size={14} /> {location?.short_name}</span><span className="row" style={{ gap: 4 }}><Icon name="bed" size={14} /> {roomsNeeded} room{roomsNeeded === 1 ? '' : 's'}</span></div>
      {cards.map(({ rt, avg, chips, disabled, reason }) => (
        <HotelRoomTypeCard key={rt.id} name={rt.name} description={rt.description} photoUrl={(rt as unknown as { photo_url?: string | null }).photo_url ?? null} priceLabel={avg != null ? fmtMoney(avg) : '—'} chips={chips} selected={draft.roomTypeId === rt.id} disabled={disabled} reason={reason} onSelect={() => choose(rt.id)} />
      ))}
      <p className="xs faint">Average nightly rate per pet for your dates before discounts; weekend (Fri-Sun) and seasonal nights cost more. Two or three dogs sharing a room get a per-dog discount on the estimate.</p>
    </HotelBookingFrame>
  );
}
