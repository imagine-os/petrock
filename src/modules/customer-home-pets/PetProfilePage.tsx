import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { useData, useTable } from '../../data/DataContext';
import { useLocation } from '../../tenant/LocationProvider';
import type { PetRow } from '../../data/schema/core';
import type { EmergencyContactRow, VetRow } from '../../data/schema/customer-home-pets';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { AccountProfileHero } from '../../components/molecule/AccountProfileHero/AccountProfileHero';
import { AccountMenuRow } from '../../components/molecule/AccountMenuRow/AccountMenuRow';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { Modal } from '../../components/organism/Modal/Modal';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCurrentCustomer, useVaccineData, useCustomerBookings, petVaccineSummary, petApproval, fmtDate, fmtTime, ageLabel, petNames, locationShort, useCustomerPets } from './lib';
import { routeExists } from './HomePage';
import './customer-home-pets.css';

const SIZE_LABEL: Record<string, string> = { S: 'Small', M: 'Medium', L: 'Large', XL: 'Extra large', Giant: 'Giant' };

/**
 * C-13 Pet Profile (Figma Pet Profile (Single Pet).jpg): #F4F6FA screen, hero (110 px photo in the dashed coral ring, purple pencil disc,
 * Be Vietnam Pro name, "Breed: X"), white stats card (Gender / Birthday / Weight), "Reminder" card with the next booking, then the
 * "Notes for <pet>" list (vaccines, care & feeding, medical & vet, emergency contact, bookings) as 68 px rows with filled purple / coral icons.
 */
export function PetProfilePage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user } = useSession();
  const { locations } = useLocation();
  const { petId } = useParams();
  const { customer } = useCurrentCustomer();
  const { rows: petRows } = useTable<PetRow>('pets', { where: { id: petId } });
  const pet = petRows[0] ?? null;
  const pets = useCustomerPets(customer?.id);
  const { types, records } = useVaccineData();
  const { rows: vets } = useTable<VetRow>('vets');
  const { rows: contacts } = useTable<EmergencyContactRow>('emergency_contacts', customer ? { where: { customer_id: customer.id } } : undefined);
  const bookings = useCustomerBookings(customer?.id);
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState<null | 'care' | 'medical' | 'contact'>(null);
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => (pet ? petVaccineSummary(pet.id, records, types) : null), [pet, records, types]);
  if (!pet || !summary) return <div><CustomerScreenHeader title="Pet Profile" backTo="/app/pets" rule={false} /><div className="chp-page"><EmptyState icon="paw" title="Pet not found" action={<Link to="/app/pets"><Button variant="secondary">My Pets</Button></Link>} /></div></div>;
  if (customer && pet.customer_id !== customer.id && user.role === 'customer') { nav('/app/pets', { replace: true }); return null; }

  const approval = petApproval(pet, summary);
  const vet = vets.find((v) => v.id === pet.vet_id);
  const contact = contacts.find((c) => c.pet_id === pet.id) ?? contacts.find((c) => c.pet_id === null) ?? null;
  const upcoming = bookings.filter((b) => !b.past && b.petIds.includes(pet.id));
  const next = upcoming[0];
  const p = pet as PetRow & Record<string, unknown>;
  const lower = pet.name.toLowerCase();

  const remove = async () => {
    if (upcoming.length) { toast({ tone: 'warn', title: `${pet.name} has upcoming bookings`, body: 'Cancel or finish them first, or ask the front desk.' }); setConfirm(false); return; }
    setBusy(true);
    try { await data.update<PetRow>('pets', pet.id, { status: 'inactive' }); toast(`${pet.name} removed`); nav('/app/pets', { replace: true }); } finally { setBusy(false); setConfirm(false); }
  };
  const openBooking = (link: string) => { if (routeExists(link)) nav(link); else toast({ tone: 'info', title: 'Booking details coming soon' }); };
  const vaccineLine = summary.allRequiredVerified ? `All required vaccines verified${summary.nextExpiry ? ` · next expiry ${fmtDate(summary.nextExpiry)}` : ''}` : `${summary.requiredVerified} of ${summary.required.length} required verified · bookings stay pending`;

  return (
    <div>
      <CustomerScreenHeader title="Pet Profile" backTo="/app/pets" rule={false} />
      <div className="chp-page chp-profile">
        <AccountProfileHero name={pet.name} kind="pet" avatarUrl={pet.photo_url as string | null} subtitle={`Breed: ${pet.breed ?? pet.type}${pet.is_mixed ? ' (mixed)' : ''}`} action={{ icon: 'edit', label: 'Edit pet', onClick: () => nav(`/app/pets/${pet.id}/edit`) }} />
        {approval.tone !== 'success' && <p className="chp-profile-status"><Icon name="warning" size={14} /> {approval.label}</p>}

        <Card padding="sm" className="chp-stats-card">
          <div className="chp-stats">
            <div className="chp-stat"><span className="chp-stat-label">Gender</span><span className="chp-stat-value">{pet.sex === 'male' ? 'Male' : 'Female'}{pet.neutered ? ' · fixed' : ''}</span></div>
            <div className="chp-stat"><span className="chp-stat-label">Birthday</span><span className="chp-stat-value">{pet.date_of_birth ? fmtDate(pet.date_of_birth) : '-'}</span>{pet.date_of_birth && <span className="chp-stat-sub">{ageLabel(pet.date_of_birth)}</span>}</div>
            <div className="chp-stat"><span className="chp-stat-label">Weight</span><span className="chp-stat-value">{pet.weight_lbs != null ? `${pet.weight_lbs} lb` : '-'}</span>{pet.size && <span className="chp-stat-sub">{SIZE_LABEL[pet.size] ?? pet.size}</span>}</div>
          </div>
        </Card>

        <Section title="Reminder" className="chp-profile-section">
          {next ? (
            <Card padding="md" className="chp-reminder" onClick={() => openBooking(next.link)}>
              <div className="chp-reminder-body">
                <strong className="chp-reminder-title">{next.title}</strong>
                <span className="chp-reminder-row"><Icon name="calendar-filled" size={16} className="is-primary" /> {fmtDate(next.startsAt)} @ {fmtTime(next.startsAt)}</span>
                <span className="chp-reminder-row"><Icon name="user-filled" size={16} className="is-coral" /> Petrock {locationShort(next.locationId, locations)} · Pets: {petNames(next.petIds, pets)}</span>
              </div>
              <span className="chp-reminder-icon" aria-hidden><Icon name={next.kind === 'hotel' ? 'svc-hotel' : next.kind === 'grooming' ? 'svc-spa' : 'svc-daycare'} size={56} strokeWidth={1.1} /></span>
            </Card>
          ) : (
            <Card padding="md" className="chp-reminder"><div className="chp-reminder-body"><strong className="chp-reminder-title">Nothing booked for {pet.name}</strong><span className="chp-reminder-row muted">Book a stay, a groom or a daycare day from Home.</span></div></Card>
          )}
        </Section>

        <Section title={`Notes for ${lower}`} actions={<Link to={`/app/pets/${pet.id}/edit`} className="chp-link">Edit</Link>} className="chp-profile-section">
          <Card padding="none" className="chp-notes">
            <AccountMenuRow icon="shield" label="Vaccines" description={vaccineLine} chevron to={`/app/pets/${pet.id}/vaccines`} tone={summary.allRequiredVerified ? 'primary' : 'accent'} />
            <AccountMenuRow icon="star" label="Care & feeding" description={[pet.personality, p.own_food ? 'Own food' : 'Petrock food', (p.meals_per_day as string | null) ?? null].filter(Boolean).join(' · ') || 'Add personality and feeding notes'} chevron tone="accent" onClick={() => setOpen('care')} />
            <AccountMenuRow icon="vet" label="Medical & vet" description={vet ? `Vet: ${vet.name}` : 'No vet on file'} chevron tone="primary" onClick={() => setOpen('medical')} />
            <AccountMenuRow icon="user" label="Emergency contact" description={contact ? `${contact.name}${contact.relationship ? ` · ${contact.relationship}` : ''}` : 'No emergency contact yet'} chevron tone="accent" onClick={() => setOpen('contact')} />
          </Card>
        </Section>

        <div className="chp-danger"><Button variant="ghost" size="sm" icon="trash" onClick={() => setConfirm(true)} style={{ color: 'var(--color-danger)' }}>Remove {pet.name}</Button></div>
      </div>

      <Modal open={open === 'care'} onClose={() => setOpen(null)} size="sm" title="Care & feeding" footer={<Button variant="secondary" onClick={() => nav(`/app/pets/${pet.id}/edit`)}>Edit</Button>}>
        <dl className="chp-kv">
          <dt>Personality</dt><dd>{pet.personality ?? '-'}</dd>
          <dt>Socialised with</dt><dd>{((p.socialized_with as string[] | null) ?? []).join(', ') || '-'}</dd>
          <dt>Food</dt><dd>{p.own_food ? 'Own food provided' : 'Petrock food'}</dd>
          <dt>Meals</dt><dd>{(p.meals_per_day as string | null) ?? '-'}</dd>
          {(p.feeding_am as string | null) && <><dt>AM</dt><dd>{p.feeding_am as string}</dd></>}
          {(p.feeding_midday as string | null) && <><dt>Mid day</dt><dd>{p.feeding_midday as string}</dd></>}
          {(p.feeding_pm as string | null) && <><dt>PM</dt><dd>{p.feeding_pm as string}</dd></>}
          <dt>Treats</dt><dd>{p.can_have_treats === false ? 'No treats' : 'Yes'}</dd>
        </dl>
      </Modal>
      <Modal open={open === 'medical'} onClose={() => setOpen(null)} size="sm" title="Medical & vet" footer={<Button variant="secondary" onClick={() => nav(`/app/pets/${pet.id}/edit`)}>Edit</Button>}>
        <dl className="chp-kv">
          <dt>Conditions</dt><dd>{(p.medical_conditions as string | null) ?? 'None listed'}</dd>
          <dt>Allergies</dt><dd>{(p.allergies as string | null) ?? 'None listed'}</dd>
          <dt>Vet</dt><dd>{vet ? <>{vet.name}{vet.phone ? <span className="muted"> · {String(vet.phone)}</span> : null}</> : 'Not set'}</dd>
        </dl>
      </Modal>
      <Modal open={open === 'contact'} onClose={() => setOpen(null)} size="sm" title="Emergency contact" footer={<Button variant="secondary" onClick={() => nav(`/app/pets/${pet.id}/edit`)}>Edit</Button>}>
        {contact ? <dl className="chp-kv"><dt>Name</dt><dd>{contact.name}{contact.relationship ? <span className="muted"> · {contact.relationship}</span> : null}</dd><dt>Phone</dt><dd><a href={`tel:${contact.phone}`}>{contact.phone}</a></dd>{contact.pet_id === null && <><dt></dt><dd className="xs faint">Household contact</dd></>}</dl> : <p className="small muted">No emergency contact yet.</p>}
      </Modal>

      <Modal open={confirm} onClose={() => setConfirm(false)} size="sm" title={`Remove ${pet.name}?`} footer={<><Button variant="secondary" onClick={() => setConfirm(false)}>Keep</Button><Button variant="danger" onClick={remove} loading={busy}>Remove</Button></>}>
        <p className="small">{upcoming.length ? `${pet.name} has ${upcoming.length} upcoming ${upcoming.length === 1 ? 'booking' : 'bookings'}. Cancel or finish them first.` : `${pet.name}'s profile and vaccine records are kept for the front desk but disappear from your app. You can ask the front desk to restore them.`}</p>
      </Modal>
    </div>
  );
}
