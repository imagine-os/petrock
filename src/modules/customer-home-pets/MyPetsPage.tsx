import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { PetAvatarCard } from '../../components/molecule/PetAvatarCard/PetAvatarCard';
import { Button } from '../../components/atom/Button/Button';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useCurrentCustomer, useCustomerPets, useVaccineData, petVaccineSummary, petApproval } from './lib';
import './customer-home-pets.css';

/** C-11 My Pets (Figma My pets (more than one pet).jpg): #F4F6FA screen, header "My Pets", right "Add Pet" text action, 2-column white r10 cards (avatar 76, Be Vietnam Pro 600 18 name, "Breed: X"); status only when a pet needs attention (R-A04). */
export function MyPetsPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { customer } = useCurrentCustomer();
  const pets = useCustomerPets(customer?.id);
  const { types, records } = useVaccineData();
  const approvals = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, petApproval(p, petVaccineSummary(p.id, records, types))])), [pets, records, types]);

  return (
    <div>
      <CustomerScreenHeader title={t('customer-home-pets.pets.title')} backTo="/app" rule={false} />
      <div className="chp-page chp-pets-page">
        <div className="chp-pets-action"><Button variant="link" onClick={() => nav('/app/pets/new')}>{t('customer-home-pets.wizard.add')}</Button></div>
        {pets.length === 0 ? (
          <EmptyState icon="paw" title={t('customer-home-pets.pets.empty')} body={t('customer-home-pets.pets.emptyBody')} action={<Button onClick={() => nav('/app/pets/new')}>{t('customer-home-pets.wizard.add')}</Button>} />
        ) : (
          <div className="chp-petgrid">
            {pets.map((p) => { const a = approvals[p.id]; const ok = a.tone === 'success'; return <PetAvatarCard key={p.id} name={p.name} photoUrl={p.photo_url as string | null} size="lg" subtitle={`Breed: ${p.breed ?? p.type}`} warning={!ok} status={ok ? undefined : a.label} onClick={() => nav(`/app/pets/${p.id}`)} />; })}
          </div>
        )}
      </div>
    </div>
  );
}
