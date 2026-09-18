import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { useData, useTable } from '../../data/DataContext';
import { useLocation } from '../../tenant/LocationProvider';
import type { PetRow } from '../../data/schema/core';
import type { EmergencyContactRow, VetRow } from '../../data/schema/customer-home-pets';
import { PhonePageHeader } from '../../components/molecule/PhonePageHeader/PhonePageHeader';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Badge } from '../../components/atom/Badge/Badge';
import { VaccineStatusChip } from '../../components/atom/VaccineStatusChip/VaccineStatusChip';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import { CustomerBookingCard } from '../../components/molecule/CustomerBookingCard/CustomerBookingCard';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Icon } from '../../components/atom/Icon/Icon';
import { Modal } from '../../components/organism/Modal/Modal';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCurrentCustomer, useVaccineData, useCustomerBookings, petVaccineSummary, petApproval, fmtDate, fmtTime, ageLabel, petNames, locationShort, useCustomerPets } from './lib';
import { routeExists } from './HomePage';
import './customer-home-pets.css';

const SIZE_LABEL: Record<string, string> = { S: 'Small', M: 'Medium', L: 'Large', XL: 'Extra large', Giant: 'Giant' };

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
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => (pet ? petVaccineSummary(pet.id, records, types) : null), [pet, records, types]);
  if (!pet || !summary) return <div><PhonePageHeader title="Pet profile" backTo="/app/pets" /><div className="chp-page"><EmptyState icon="paw" title="Pet not found" action={<Link to="/app/pets"><Button variant="secondary">My pets</Button></Link>} /></div></div>;
  if (customer && pet.customer_id !== customer.id && user.role === 'customer') { nav('/app/pets', { replace: true }); return null; }

  const approval = petApproval(pet, summary);
  const vet = vets.find((v) => v.id === pet.vet_id);
  const contact = contacts.find((c) => c.pet_id === pet.id) ?? contacts.find((c) => c.pet_id === null) ?? null;
  const upcoming = bookings.filter((b) => !b.past && b.petIds.includes(pet.id));
  const p = pet as PetRow & Record<string, unknown>;

  const remove = async () => {
    if (upcoming.length) { toast({ tone: 'warn', title: `${pet.name} has upcoming bookings`, body: 'Cancel or finish them first, or ask the front desk.' }); setConfirm(false); return; }
    setBusy(true);
    try { await data.update<PetRow>('pets', pet.id, { status: 'inactive' }); toast(`${pet.name} removed`); nav('/app/pets', { replace: true }); } finally { setBusy(false); setConfirm(false); }
  };
  const openBooking = (link: string) => { if (routeExists(link)) nav(link); else toast({ tone: 'info', title: 'Booking details coming soon' }); };

  return (
    <div>
      <PhonePageHeader title="Pet profile" backTo="/app/pets" actions={<IconButton icon="edit" label="Edit pet" onClick={() => nav(`/app/pets/${pet.id}/edit`)} />} />
      <div className="chp-page">
        <div className="chp-profile-hero">
          <Avatar name={pet.name} src={pet.photo_url as string | null} size={112} kind="pet" />
          <h2>{pet.name}</h2>
          <p className="muted small">{pet.breed ?? pet.type}{pet.is_mixed ? ' (mixed)' : ''}{pet.color ? ` · ${String(pet.color)}` : ''}</p>
          {approval.tone === 'success' ? <Badge tone="success">{approval.label}</Badge> : <VaccineStatusChip status={approval.chip} label={approval.label} />}
        </div>

        <Card padding="sm">
          <div className="chp-stats">
            <div className="chp-stat"><span className="chp-stat-label">Sex</span><span className="chp-stat-value">{pet.sex === 'male' ? 'Male' : 'Female'}{pet.neutered ? ' · fixed' : ''}</span></div>
            <div className="chp-stat"><span className="chp-stat-label">Age</span><span className="chp-stat-value">{pet.date_of_birth ? ageLabel(pet.date_of_birth) : '-'}</span>{pet.date_of_birth && <span className="xs faint">{fmtDate(pet.date_of_birth)}</span>}</div>
            <div className="chp-stat"><span className="chp-stat-label">Weight</span><span className="chp-stat-value">{pet.weight_lbs != null ? `${pet.weight_lbs} lb` : '-'}</span>{pet.size && <span className="xs faint">{SIZE_LABEL[pet.size] ?? pet.size} ({pet.size})</span>}</div>
          </div>
        </Card>

        <Section title="Vaccines" description={summary.allRequiredVerified ? 'All required vaccines verified.' : `${summary.requiredVerified} of ${summary.required.length} required vaccines verified.`} actions={<Link to={`/app/pets/${pet.id}/vaccines`} className="chp-link">Manage</Link>}>
          <div className="chp-vaccine-chips">{summary.lines.map((l) => <span key={l.type.id} className="chp-vaccine-chip"><span>{l.type.short_name}</span><VaccineStatusChip status={l.status} size="sm" /></span>)}</div>
          {summary.nextExpiry && <p className="xs muted" style={{ marginTop: 8 }}>Next expiry {fmtDate(summary.nextExpiry)}</p>}
          {!summary.allRequiredVerified && <div className="chp-banner" style={{ marginTop: 12 }}><Icon name="warning" size={16} /><div className="chp-banner-text"><span>Bookings for {pet.name} stay pending until the front desk verifies the required vaccines.</span><Link to={`/app/pets/${pet.id}/vaccines`}>Upload now →</Link></div></div>}
        </Section>

        <Section title="Care & feeding">
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
        </Section>

        <Section title="Medical & vet">
          <dl className="chp-kv">
            <dt>Conditions</dt><dd>{(p.medical_conditions as string | null) ?? 'None listed'}</dd>
            <dt>Allergies</dt><dd>{(p.allergies as string | null) ?? 'None listed'}</dd>
            <dt>Vet</dt><dd>{vet ? <>{vet.name}{vet.phone ? <span className="muted"> · {String(vet.phone)}</span> : null}</> : 'Not set'}</dd>
          </dl>
        </Section>

        <Section title="Emergency contact" actions={<button type="button" className="chp-link" onClick={() => nav(`/app/pets/${pet.id}/edit`)}>Edit</button>}>
          {contact ? <dl className="chp-kv"><dt>Name</dt><dd>{contact.name}{contact.relationship ? <span className="muted"> · {contact.relationship}</span> : null}</dd><dt>Phone</dt><dd><a href={`tel:${contact.phone}`}>{contact.phone}</a></dd>{contact.pet_id === null && <><dt></dt><dd className="xs faint">Household contact</dd></>}</dl> : <p className="small muted">No emergency contact yet.</p>}
        </Section>

        <Section title="Upcoming bookings" description={upcoming.length ? undefined : `Nothing booked for ${pet.name} yet.`}>
          {upcoming.length > 0 && <div className="chp-strip chp-strip-cards">{upcoming.map((b) => <CustomerBookingCard key={b.id} kind={b.kind} title={b.title} pets={petNames(b.petIds, pets)} status={b.status} location={locationShort(b.locationId, locations)} start={{ date: fmtDate(b.startsAt), time: fmtTime(b.startsAt) }} end={b.endsAt ? { date: fmtDate(b.endsAt), time: fmtTime(b.endsAt) } : undefined} onClick={() => openBooking(b.link)} />)}</div>}
        </Section>

        <div className="chp-danger"><Button variant="ghost" size="sm" icon="trash" onClick={() => setConfirm(true)} style={{ color: 'var(--color-danger)' }}>Remove {pet.name}</Button></div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} size="sm" title={`Remove ${pet.name}?`} footer={<><Button variant="secondary" onClick={() => setConfirm(false)}>Keep</Button><Button variant="danger" onClick={remove} loading={busy}>Remove</Button></>}>
        <p className="small">{upcoming.length ? `${pet.name} has ${upcoming.length} upcoming ${upcoming.length === 1 ? 'booking' : 'bookings'}. Cancel or finish them first.` : `${pet.name}'s profile and vaccine records are kept for the front desk but disappear from your app. You can ask the front desk to restore them.`}</p>
      </Modal>
    </div>
  );
}
