import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useLocation } from '../../tenant/LocationProvider';
import { getRoutes } from '../../app/registry';
import { HomeHero } from '../../components/molecule/HomeHero/HomeHero';
import { Section } from '../../components/molecule/Section/Section';
import { HomeServiceTile } from '../../components/molecule/HomeServiceTile/HomeServiceTile';
import { PetAvatarCard } from '../../components/molecule/PetAvatarCard/PetAvatarCard';
import { CustomerBookingCard } from '../../components/molecule/CustomerBookingCard/CustomerBookingCard';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { Modal } from '../../components/organism/Modal/Modal';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCurrentCustomer, useCustomerPets, useVaccineData, useCustomerBookings, petVaccineSummary, petApproval, fmtDate, fmtTime, petNames, locationShort } from './lib';
import './customer-home-pets.css';

/** Figma Services row (Services.png): Hotel, Spa, Daycare, In Home. In Home is not bookable (D-003): the tile opens the "coming soon" note. */
const SERVICES: { key: 'hotel' | 'grooming' | 'daycare' | 'inhome'; label: string; icon: 'svc-hotel' | 'svc-spa' | 'svc-daycare' | 'svc-inhome'; to: string | null }[] = [
  { key: 'hotel', label: 'customer-home-pets.services.hotel', icon: 'svc-hotel', to: '/app/hotel' },
  { key: 'grooming', label: 'customer-home-pets.services.spa', icon: 'svc-spa', to: '/app/grooming' },
  { key: 'daycare', label: 'customer-home-pets.services.daycare', icon: 'svc-daycare', to: '/app/daycare' },
  { key: 'inhome', label: 'customer-home-pets.services.inhome', icon: 'svc-inhome', to: null },
];

/** Does a route exist in the registry (another module may not have shipped yet)? */
export function routeExists(path: string): boolean {
  const clean = path.split('?')[0];
  return getRoutes().some((r) => r.path === clean || (r.path.includes(':') && new RegExp(`^${r.path.replace(/:\w+/g, '[^/]+')}$`).test(clean)));
}

/** C-10 Customer home (Figma Home Page.png / -2 / -5, D-189): hero, Services band, Pets band, Upcoming Bookings band, past-reservations link; "Hey!" alert gates booking until a pet exists (R-A01). */
export function HomePage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { toast } = useToast();
  const { locations, location } = useLocation();
  const { customer } = useCurrentCustomer();
  const pets = useCustomerPets(customer?.id);
  const { types, records } = useVaccineData();
  const bookings = useCustomerBookings(customer?.id);
  const [gate, setGate] = useState(false);

  const summaries = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, petVaccineSummary(p.id, records, types)])), [pets, records, types]);
  const upcoming = bookings.filter((b) => !b.past).slice(0, 6);

  const openService = (to: string | null) => {
    if (!pets.length) { setGate(true); return; }
    if (!to) { toast({ tone: 'info', title: t('customer-home-pets.services.inhomeSoon'), body: t('customer-home-pets.services.inhomeBody') }); return; }
    if (routeExists(to)) nav(`${to}?location=${location.id}`); else toast({ tone: 'info', title: 'Coming soon', body: 'This booking flow is being built by its module.' });
  };
  const openBooking = (link: string) => { if (routeExists(link)) nav(link); else toast({ tone: 'info', title: 'Booking details coming soon', body: 'The bookings pages ship with the hotel module.' }); };

  return (
    <div className="chp-home">
      <HomeHero />

      <div className="chp-page chp-home-body">
        <Section band title={t('customer-home-pets.home.services')} className="chp-home-services">
          <div className="chp-services">{SERVICES.map((s) => <HomeServiceTile key={s.key} label={t(s.label)} icon={s.icon} onClick={() => openService(s.to)} />)}</div>
        </Section>

        <Section band title={t('customer-home-pets.home.pets')} className="chp-home-pets">
          {pets.length === 0 ? (
            <div className="chp-pets-empty"><Button size="sm" onClick={() => nav('/app/pets/new')}>{t('customer-home-pets.home.addPet')}</Button></div>
          ) : (
            <div className="chp-strip chp-strip-pets">
              {pets.map((p, i) => { const a = petApproval(p, summaries[p.id]); const ok = a.tone === 'success'; return <PetAvatarCard key={p.id} name={p.name} photoUrl={p.photo_url as string | null} selected={i === 0} warning={!ok} status={ok ? undefined : a.label} onClick={() => nav(`/app/pets/${p.id}`)} />; })}
              <Card padding="sm" className="chp-addpet" onClick={() => nav('/app/pets/new')} aria-label={t('customer-home-pets.home.addPet')}><Button size="sm" tabIndex={-1}>{t('customer-home-pets.home.addPet')}</Button></Card>
            </div>
          )}
        </Section>

        {pets.length > 0 && (
          <Section band title={t('customer-home-pets.home.upcoming')} className="chp-home-upcoming">
            {upcoming.length === 0 ? (
              <p className="chp-upcoming-empty">{t('customer-home-pets.home.noUpcoming')}</p>
            ) : (
              <div className="chp-strip chp-strip-cards">
                {upcoming.map((b) => <CustomerBookingCard key={b.id} kind={b.kind} title={b.title} pets={petNames(b.petIds, pets)} status={b.status} location={b.kind === 'hotel' ? undefined : locationShort(b.locationId, locations)} start={{ date: fmtDate(b.startsAt), time: fmtTime(b.startsAt) }} end={b.endsAt ? { date: fmtDate(b.endsAt), time: fmtTime(b.endsAt) } : undefined} onClick={() => openBooking(b.link)} />)}
              </div>
            )}
          </Section>
        )}

        <div className="chp-center chp-home-past"><Button variant="link" onClick={() => openBooking('/app/bookings')}>{t('customer-home-pets.home.past')}</Button></div>
      </div>

      <Modal open={gate} onClose={() => setGate(false)} size="alert" title={t('customer-home-pets.home.addPetFirstTitle')} footer={<><Button variant="ghost" onClick={() => setGate(false)}>{t('customer-home-pets.wizard.back')}</Button><Button onClick={() => { setGate(false); nav('/app/pets/new'); }}>{t('customer-home-pets.home.addPet')}</Button></>}>
        <p>{t('customer-home-pets.home.addPetFirstBody')}</p>
      </Modal>
    </div>
  );
}
