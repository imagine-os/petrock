import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useLocation } from '../../tenant/LocationProvider';
import { useData, useTable } from '../../data/DataContext';
import { getRoutes } from '../../app/registry';
import type { NotificationRow, LocationRow, CustomerRow } from '../../data/schema/core';
import { HomeServiceTile } from '../../components/molecule/HomeServiceTile/HomeServiceTile';
import { PetAvatarCard } from '../../components/molecule/PetAvatarCard/PetAvatarCard';
import { CustomerBookingCard } from '../../components/molecule/CustomerBookingCard/CustomerBookingCard';
import { VaccineStatusChip } from '../../components/atom/VaccineStatusChip/VaccineStatusChip';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Chip } from '../../components/atom/Chip/Chip';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Icon } from '../../components/atom/Icon/Icon';
import { Card } from '../../components/molecule/Card/Card';
import { Modal } from '../../components/organism/Modal/Modal';
import { RadioGroup } from '../../components/atom/RadioGroup/RadioGroup';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCurrentCustomer, useCustomerPets, useVaccineData, useCustomerBookings, petVaccineSummary, petApproval, fmtDate, fmtTime, petNames, locationShort, hoursToday } from './lib';
import './customer-home-pets.css';

const SERVICES: { key: 'hotel' | 'grooming' | 'daycare'; label: string; icon: 'bed' | 'scissors' | 'sun'; to: string }[] = [
  { key: 'hotel', label: 'customer-home-pets.services.hotel', icon: 'bed', to: '/app/hotel' },
  { key: 'grooming', label: 'customer-home-pets.services.grooming', icon: 'scissors', to: '/app/grooming' },
  { key: 'daycare', label: 'customer-home-pets.services.daycare', icon: 'sun', to: '/app/daycare' },
];

/** Does a route exist in the registry (another module may not have shipped yet)? */
export function routeExists(path: string): boolean {
  const clean = path.split('?')[0];
  return getRoutes().some((r) => r.path === clean || (r.path.includes(':') && new RegExp(`^${r.path.replace(/:\w+/g, '[^/]+')}$`).test(clean)));
}

export function HomePage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user } = useSession();
  const { locations, location, setLocationId } = useLocation();
  const { customer } = useCurrentCustomer();
  const pets = useCustomerPets(customer?.id);
  const { types, records } = useVaccineData();
  const bookings = useCustomerBookings(customer?.id);
  const { rows: unread } = useTable<NotificationRow>('notifications', { where: { user_id: user.id, read: false } });
  const [gate, setGate] = useState(false);
  const [pickLoc, setPickLoc] = useState(false);

  const summaries = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, petVaccineSummary(p.id, records, types)])), [pets, records, types]);
  const needsVaccines = pets.filter((p) => ['missing', 'expired', 'rejected'].includes(summaries[p.id]?.worstRequired));
  const upcoming = bookings.filter((b) => !b.past).slice(0, 6);
  const firstName = customer?.first_name ?? user.name.split(' ')[0];

  const openService = (to: string) => {
    if (!pets.length) { setGate(true); return; }
    if (routeExists(to)) nav(`${to}?location=${location.id}`); else toast({ tone: 'info', title: 'Coming soon', body: 'This booking flow is being built by its module.' });
  };
  const openBooking = (link: string) => { if (routeExists(link)) nav(link); else toast({ tone: 'info', title: 'Booking details coming soon', body: 'The bookings pages ship with the hotel module.' }); };
  const chooseLocation = async (id: string) => {
    setLocationId(id);
    if (customer) await data.update<CustomerRow>('customers', customer.id, { home_location_id: id });
    setPickLoc(false);
    toast({ tone: 'success', title: `Your Petrock: ${locations.find((l) => l.id === id)?.short_name ?? ''}` });
  };

  return (
    <div className="chp-home">
      <header className="chp-home-head">
        <div className="chp-home-greet">
          <span className="eyebrow">{t('customer-home-pets.home.location')}</span>
          <h1>{t('customer-home-pets.home.greeting', { name: firstName })}</h1>
        </div>
        <div className="chp-home-actions">
          <Chip icon="location" onClick={() => setPickLoc(true)} tone="primary" size="sm" aria-label={`Location: ${location.short_name}. Change`}>{location.short_name} <Icon name="chevron-down" size={12} /></Chip>
          <IconButton icon="bell" label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`} variant="outline" badge={unread.length || undefined} onClick={() => nav('/app/notifications')} />
        </div>
      </header>

      <div className="chp-page" style={{ paddingTop: 'var(--sp-4)' }}>
        <div className="chp-hero" role="img" aria-label="Petrock Hotel & Spa">
          <span className="chp-hero-mark"><img src="./brand/petrock-mark.svg" alt="" /></span>
          <div className="chp-hero-text"><strong>Petrock Hotel & Spa</strong><span>{location.name} · {hoursToday(location as LocationRow)}</span></div>
        </div>

        <section className="chp-section" aria-labelledby="chp-services">
          <div className="chp-section-head"><h2 className="chp-section-title" id="chp-services">{t('customer-home-pets.home.services')}</h2></div>
          <div className="chp-services">{SERVICES.map((s) => <HomeServiceTile key={s.key} label={t(s.label)} icon={s.icon} onClick={() => openService(s.to)} />)}</div>
        </section>

        {needsVaccines.length > 0 && (
          <div className="chp-banner" role="status">
            <Icon name="warning" size={18} />
            <div className="chp-banner-text"><span>{t('customer-home-pets.home.vaccineBanner')} {needsVaccines.map((p) => p.name).join(', ')} {needsVaccines.length === 1 ? 'needs' : 'need'} attention.</span><Link to="/app/vaccines">Upload vaccines →</Link></div>
          </div>
        )}

        <section className="chp-section" aria-labelledby="chp-pets">
          <div className="chp-section-head"><h2 className="chp-section-title" id="chp-pets">{t('customer-home-pets.home.pets')}</h2>{pets.length > 0 && <Link className="chp-link" to="/app/pets">See all</Link>}</div>
          {pets.length === 0 ? (
            <EmptyState compact icon="paw" title={t('customer-home-pets.pets.empty')} body={t('customer-home-pets.pets.emptyBody')} action={<Button icon="plus" onClick={() => nav('/app/pets/new')}>{t('customer-home-pets.home.addPet')}</Button>} />
          ) : (
            <div className="chp-strip">
              {pets.map((p) => { const a = petApproval(p, summaries[p.id]); return <PetAvatarCard key={p.id} name={p.name} photoUrl={p.photo_url as string | null} subtitle={p.breed ?? p.type} warning={a.warning} muted={a.tone !== 'success'} status={a.tone === 'success' ? <Badge tone="success" size="sm">{a.label}</Badge> : <VaccineStatusChip status={a.chip} size="sm" label={a.label} />} onClick={() => nav(`/app/pets/${p.id}`)} />; })}
              <Card interactive padding="sm" className="chp-addpet" onClick={() => nav('/app/pets/new')}><Button variant="primary" size="sm" icon="plus" tabIndex={-1}>{t('customer-home-pets.home.addPet')}</Button></Card>
            </div>
          )}
        </section>

        <section className="chp-section" aria-labelledby="chp-upcoming">
          <div className="chp-section-head"><h2 className="chp-section-title" id="chp-upcoming">{t('customer-home-pets.home.upcoming')}</h2>{upcoming.length > 0 && <span className="xs faint">{upcoming.length}</span>}</div>
          {upcoming.length === 0 ? (
            <EmptyState compact icon="calendar" title={pets.length ? 'No upcoming bookings' : 'Nothing booked yet'} body={pets.length ? 'Book a stay, a groom or a daycare day from the services above.' : 'Add a pet, then pick a service.'} />
          ) : (
            <div className="chp-strip chp-strip-cards">
              {upcoming.map((b) => <CustomerBookingCard key={b.id} kind={b.kind} title={b.title} pets={petNames(b.petIds, pets)} status={b.status} location={locationShort(b.locationId, locations)} start={{ date: fmtDate(b.startsAt), time: fmtTime(b.startsAt) }} end={b.endsAt ? { date: fmtDate(b.endsAt), time: fmtTime(b.endsAt) } : undefined} onClick={() => openBooking(b.link)} />)}
            </div>
          )}
          <div className="chp-center"><Button variant="link" onClick={() => openBooking('/app/bookings')}>{t('customer-home-pets.home.past')}</Button></div>
        </section>
      </div>

      <Modal open={gate} onClose={() => setGate(false)} size="sm" title={t('customer-home-pets.home.addPetFirstTitle')} footer={<><Button variant="secondary" onClick={() => setGate(false)}>{t('customer-home-pets.wizard.back')}</Button><Button icon="plus" onClick={() => { setGate(false); nav('/app/pets/new'); }}>{t('customer-home-pets.home.addPet')}</Button></>}>
        <p className="small">{t('customer-home-pets.home.addPetFirstBody')}</p>
      </Modal>

      <Modal open={pickLoc} onClose={() => setPickLoc(false)} size="sm" title={t('customer-home-pets.home.chooseLocation')}>
        <div className="chp-locs">
          <RadioGroup cards value={location.id} onChange={chooseLocation} options={locations.map((l) => ({ value: l.id, label: l.name, description: <span className="chp-loc-line">{l.address}<br />Today {hoursToday(l)}</span> }))} />
        </div>
      </Modal>
    </div>
  );
}
