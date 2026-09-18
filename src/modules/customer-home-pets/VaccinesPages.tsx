import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useData, useTable } from '../../data/DataContext';
import type { PetRow, UserRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import { PhonePageHeader } from '../../components/molecule/PhonePageHeader/PhonePageHeader';
import { PetAvatarCard } from '../../components/molecule/PetAvatarCard/PetAvatarCard';
import { VaccineStatusChip } from '../../components/atom/VaccineStatusChip/VaccineStatusChip';
import { VaccineRecordRow as VaccineRow } from '../../components/molecule/VaccineRecordRow/VaccineRecordRow';
import { VaccineRecordForm } from '../../components/organism/VaccineRecordForm/VaccineRecordForm';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Card } from '../../components/molecule/Card/Card';
import { Icon } from '../../components/atom/Icon/Icon';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCurrentCustomer, useCustomerPets, useVaccineData, petVaccineSummary, petApproval, fmtDate, daysUntil, vaccineStatusOf, type PetVaccineLine } from './lib';
import { submitVaccineRecord } from './actions';
import './customer-home-pets.css';

/** Shared list + form for one pet (C-20 and C-21). */
function PetVaccinePanel({ pet, types, records, showHistory = false }: { pet: PetRow; types: VaccineTypeRow[]; records: VaccineRecordRow[]; showHistory?: boolean }) {
  const { t } = useI18n();
  const data = useData();
  const { toast } = useToast();
  const { customer } = useCurrentCustomer();
  const { rows: users } = useTable<UserRow>('users');
  const [editing, setEditing] = useState<PetVaccineLine | null>(null);
  const summary = useMemo(() => petVaccineSummary(pet.id, records, types), [pet.id, records, types]);
  const history = useMemo(() => records.filter((r) => r.pet_id === pet.id && !summary.lines.some((l) => l.record?.id === r.id)).sort((a, b) => (b.vaccinated_on ?? '').localeCompare(a.vaccinated_on ?? '')), [records, pet.id, summary]);

  const row = (l: PetVaccineLine) => {
    const has = l.record && l.status !== 'missing';
    const expSoon = l.record?.expires_on && l.status === 'verified' && daysUntil(l.record.expires_on) <= 30;
    return <VaccineRow key={l.type.id} name={l.type.name} required={l.type.required} status={l.status} vaccinatedOn={fmtDate(l.record?.vaccinated_on)} expiresOn={fmtDate(l.record?.expires_on)} proofName={l.record?.proof_name} note={l.status === 'pending' ? 'Awaiting front desk verification' : l.status === 'rejected' ? ((l.record?.note as string | null | undefined) ?? 'Rejected by the front desk; upload a clearer document') : expSoon ? `Expires in ${daysUntil(l.record!.expires_on!)} days - upload the booster when done` : (l.record?.note as string | null | undefined)}
      action={<Button size="sm" variant={has && l.status !== 'expired' && l.status !== 'rejected' ? 'secondary' : 'primary'} icon="upload" onClick={() => setEditing(l)}>{has ? 'Update' : 'Upload'}</Button>} />;
  };

  const save = async (l: PetVaccineLine, draft: { vaccinatedOn: string; expiresOn: string; proof: { name: string; sizeBytes: number; type: string; url: string } | null }) => {
    await submitVaccineRecord({ data, pet, type: l.type, draft, existing: l.record, customer, users });
    toast({ tone: 'success', title: `${l.type.short_name} submitted`, body: 'The front desk will verify it shortly.' });
    setEditing(null);
  };

  return (
    <>
      <Card padding="md" tint>
        <div className="chp-vax-summary">
          <div className="stack-sm" style={{ gap: 2 }}><strong className="small">{summary.allRequiredVerified ? `${pet.name} is cleared for bookings` : `${summary.requiredVerified} of ${summary.required.length} required verified`}</strong><span className="xs muted">{summary.nextExpiry ? `Next expiry ${fmtDate(summary.nextExpiry)}` : 'No upcoming expiry on file'}</span></div>
          <VaccineStatusChip status={summary.worstRequired} />
        </div>
      </Card>
      {!summary.allRequiredVerified && <div className="chp-banner is-info"><Icon name="info" size={16} /><div className="chp-banner-text"><span>{t('customer-home-pets.home.vaccineBanner')}</span></div></div>}
      <div className="chp-vaccine-list">
        <div className="eyebrow">{t('customer-home-pets.vaccines.required')}</div>
        {summary.required.map(row)}
        <div className="eyebrow" style={{ marginTop: 8 }}>{t('customer-home-pets.vaccines.recommended')}</div>
        {summary.recommended.map(row)}
      </div>
      {showHistory && history.length > 0 && (
        <div className="chp-section">
          <div className="eyebrow">History</div>
          <ul className="chp-vax-history">{history.map((r) => { const ty = types.find((x) => x.id === r.vaccine_type_id); return <li key={r.id}><span>{ty?.short_name ?? '?'}</span><span>given {fmtDate(r.vaccinated_on)}</span>{r.expires_on && <span>expired {fmtDate(r.expires_on)}</span>}<VaccineStatusChip status={vaccineStatusOf(r)} size="sm" /></li>; })}</ul>
        </div>
      )}
      {editing && <VaccineRecordForm key={editing.type.id} open onClose={() => setEditing(null)} petName={pet.name} vaccineName={editing.type.name} required={editing.type.required}
        initial={editing.record && editing.status !== 'missing' && editing.status !== 'verified' ? { vaccinatedOn: editing.record.vaccinated_on ?? '', expiresOn: editing.record.expires_on ?? '', proof: editing.record.proof_name ? { name: editing.record.proof_name, sizeBytes: 0, type: '', url: editing.record.proof_url ?? '' } : null } : null}
        onSave={(d) => save(editing, d)} />}
    </>
  );
}

/** C-20 /app/vaccines: choose a pet, then manage its vaccines. */
export function VaccinesHubPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { customer } = useCurrentCustomer();
  const pets = useCustomerPets(customer?.id);
  const { types, records } = useVaccineData();
  const summaries = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, petVaccineSummary(p.id, records, types)])), [pets, records, types]);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    if (selected && pets.some((p) => p.id === selected)) return;
    const order = ['rejected', 'expired', 'missing', 'pending', 'verified'];
    const first = [...pets].sort((a, b) => order.indexOf(summaries[a.id]?.worstRequired) - order.indexOf(summaries[b.id]?.worstRequired))[0];
    setSelected(first?.id ?? null);
  }, [pets, summaries, selected]);
  const pet = pets.find((p) => p.id === selected) ?? null;

  return (
    <div>
      <PhonePageHeader title={t('customer-home-pets.vaccines.title')} backTo="/app" subtitle={pets.length ? t('customer-home-pets.vaccines.intro') : undefined} />
      <div className="chp-page">
        {pets.length === 0 ? (
          <EmptyState icon="shield" title={t('customer-home-pets.pets.empty')} body="Add a pet first, then upload its vaccine records here." action={<Button icon="plus" onClick={() => nav('/app/pets/new')}>{t('customer-home-pets.wizard.add')}</Button>} />
        ) : (
          <>
            <div className="chp-strip" role="radiogroup" aria-label="Choose a pet">
              {pets.map((p) => { const s = summaries[p.id]; const a = petApproval(p, s); return <PetAvatarCard key={p.id} name={p.name} photoUrl={p.photo_url as string | null} size="sm" selected={p.id === selected} subtitle={s.nextExpiry ? `Exp. ${fmtDate(s.nextExpiry)}` : 'No expiry on file'} warning={a.warning} status={<VaccineStatusChip status={s.worstRequired} size="sm" />} onClick={() => setSelected(p.id)} />; })}
            </div>
            {pet && <PetVaccinePanel key={pet.id} pet={pet} types={types} records={records} />}
            {pet && <div className="chp-center"><Link to={`/app/pets/${pet.id}/vaccines`} className="chp-link">Full records and history for {pet.name} →</Link></div>}
          </>
        )}
      </div>
    </div>
  );
}

/** C-21 /app/pets/:petId/vaccines: one pet, all records, with history. */
export function PetVaccinesPage() {
  const nav = useNavigate();
  const { user } = useSession();
  const { petId } = useParams();
  const { customer } = useCurrentCustomer();
  const { rows: petRows } = useTable<PetRow>('pets', { where: { id: petId } });
  const pet = petRows[0] ?? null;
  const { types, records } = useVaccineData();
  if (!pet) return <div><PhonePageHeader title="Vaccine records" backTo="/app/vaccines" /><div className="chp-page"><EmptyState icon="paw" title="Pet not found" /></div></div>;
  if (customer && pet.customer_id !== customer.id && user.role === 'customer') { nav('/app/pets', { replace: true }); return null; }
  return (
    <div>
      <PhonePageHeader title={`${pet.name}'s vaccines`} backTo={`/app/pets/${pet.id}`} subtitle={<span className="row" style={{ justifyContent: 'center', gap: 6 }}>{pet.breed ?? pet.type} <Badge size="sm">{pet.weight_lbs ? `${pet.weight_lbs} lb` : pet.type}</Badge></span>} />
      <div className="chp-page">
        <PetVaccinePanel pet={pet} types={types} records={records} showHistory />
      </div>
    </div>
  );
}
