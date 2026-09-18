import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { LocationRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import { nightsBetween } from '../../pricing/engine';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { BookingPetCard } from '../../components/molecule/BookingPetCard/BookingPetCard';
import { StayDatesCard } from '../../components/molecule/StayDatesCard/StayDatesCard';
import { Badge } from '../../components/atom/Badge/Badge';
import { useT } from '../../i18n';
import { useHotelDraft } from './draft';
import { hoursForLocation, petVaccineState, useCustomerAccount, useHotelSettings, validateStay } from './lib';
import './customer-hotel.css';

/** C-30 · Hotel Reservation (Figma Hotel Reservation.png, D-191 no stepper): "Select Your Pet" cards (selected = primary fill), share-a-room select, location, calendar card, Check In / Check Out card, Next. */
export function PetsDatesPage() {
  const t = useT();
  const nav = useNavigate();
  const { draft, patch } = useHotelDraft();
  const { customer, pets } = useCustomerAccount();
  const settings = useHotelSettings();
  const { rows: locations } = useTable<LocationRow>('locations', { orderBy: { column: 'sort_order' } });
  const { rows: records } = useTable<VaccineRecordRow>('vaccine_records');
  const { rows: vtypes } = useTable<VaccineTypeRow>('vaccine_types');
  const [touched, setTouched] = useState(false);

  const locationId = draft.locationId ?? customer?.home_location_id ?? locations[0]?.id ?? null;
  useEffect(() => { if (!draft.locationId && locationId) patch({ locationId }); }, [draft.locationId, locationId, patch]);
  useEffect(() => { if (draft.checkInTime === '10:00' && draft.checkOutTime === '11:00' && (settings.default_check_in_time !== '10:00' || settings.default_check_out_time !== '11:00')) patch({ checkInTime: settings.default_check_in_time, checkOutTime: settings.default_check_out_time }); }, [settings, draft.checkInTime, draft.checkOutTime, patch]);
  const location = locations.find((l) => l.id === locationId) ?? null;
  const hoursFor = useMemo(() => hoursForLocation(location), [location]);
  const selected = pets.filter((p) => draft.petIds.includes(p.id));
  const tooMany = selected.length > settings.max_pets_per_room;
  const error = validateStay(draft, settings, hoursFor);
  const nights = draft.checkIn && draft.checkOut && draft.checkOut > draft.checkIn ? nightsBetween(new Date(`${draft.checkIn}T00:00:00`), new Date(`${draft.checkOut}T00:00:00`)) : undefined;
  const canNext = selected.length > 0 && !error && !!locationId;

  const toggle = (id: string) => patch((d) => ({ petIds: d.petIds.includes(id) ? d.petIds.filter((x) => x !== id) : [...d.petIds, id] }));
  const next = () => { setTouched(true); if (!canNext) return; patch({ locationId, shareRoom: tooMany ? false : draft.shareRoom }); nav('/app/hotel/room'); };

  if (!customer) return <HotelBookingFrame title={t('customer-hotel.choosePets')} backTo="/app"><EmptyState icon="user" title="Sign in to book a stay" body="Hotel stays are booked from your Petrock account." action={<Link to="/auth/sign-in"><Button>Sign in</Button></Link>} /></HotelBookingFrame>;
  if (!pets.length) return <HotelBookingFrame title={t('customer-hotel.choosePets')} backTo="/app"><EmptyState icon="paw" title="Hey! To book a stay please first add a pet" body="Every stay needs at least one pet on your account (with vaccine records)." action={<Link to="/app/pets"><Button icon="plus">Add a pet</Button></Link>} /></HotelBookingFrame>;

  return (
    <HotelBookingFrame title={t('customer-hotel.choosePets')} backTo="/app"
      footer={<Button block onClick={next} disabled={touched && !canNext}>{t('customer-hotel.next')}</Button>}
      footerNote={selected.length ? `${selected.map((p) => p.name).join(', ')}${nights ? ` · ${nights} night${nights === 1 ? '' : 's'}` : ''}${location ? ` · ${location.short_name}` : ''}` : 'Select at least one pet'}>
      <div>
        <div className="ch-center-label">{t('customer-hotel.selectPet')}</div>
        <div className="ch-pets">
          {pets.map((p) => <BookingPetCard key={p.id} name={p.name} breed={p.breed} weightLbs={p.weight_lbs} photoUrl={p.photo_url as string | null} approval={p.approval_status} vaccine={petVaccineState(p.id, records, vtypes)} selected={draft.petIds.includes(p.id)} onToggle={() => toggle(p.id)} />)}
        </div>
        <div className="row-between" style={{ marginTop: 6 }}><span className="xs muted">{selected.some((p) => petVaccineState(p.id, records, vtypes) !== 'ok') ? <>Unverified vaccines: the stay stays <Badge size="sm" tone="warn" variant="text">Pending verification</Badge> until the front desk checks the proofs.</> : null}</span><Link to="/app/pets" className="xs">Manage pets</Link></div>
      </div>
      {selected.length > 1 && (
        <Select size="xs" label={t('customer-hotel.shareRoom')} value={tooMany ? 'no' : draft.shareRoom ? 'yes' : 'no'} disabled={tooMany} onChange={(e) => patch({ shareRoom: e.target.value === 'yes' })} options={[{ value: 'yes', label: 'Yes, one room together' }, { value: 'no', label: 'No, a room each' }]}
          hint={tooMany ? `Up to ${settings.max_pets_per_room} pets share a room; ${selected.length} pets get separate rooms.` : draft.shareRoom ? 'Sharing a room gives a per-dog per-night discount.' : 'Each pet is quoted as its own room.'} />
      )}
      <Select size="xs" label="Location" value={locationId ?? ''} onChange={(e) => patch({ locationId: e.target.value })} options={locations.map((l) => ({ value: l.id, label: `${l.name} · ${l.city}` }))} hint={location?.address ?? undefined} />
      <StayDatesCard value={{ checkIn: draft.checkIn, checkInTime: draft.checkInTime, checkOut: draft.checkOut, checkOutTime: draft.checkOutTime }} onChange={(v) => patch(v)} hoursFor={hoursFor} nights={nights} error={touched || (draft.checkIn && draft.checkOut) ? error : null} />
    </HotelBookingFrame>
  );
}
