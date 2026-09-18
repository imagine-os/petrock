import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { PhonePageHeader } from '../../components/molecule/PhonePageHeader/PhonePageHeader';
import { PetAvatarCard } from '../../components/molecule/PetAvatarCard/PetAvatarCard';
import { VaccineStatusChip } from '../../components/atom/VaccineStatusChip/VaccineStatusChip';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useCurrentCustomer, useCustomerPets, useVaccineData, petVaccineSummary, petApproval } from './lib';
import './customer-home-pets.css';

export function MyPetsPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { customer } = useCurrentCustomer();
  const pets = useCustomerPets(customer?.id);
  const { types, records } = useVaccineData();
  const approvals = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, petApproval(p, petVaccineSummary(p.id, records, types))])), [pets, records, types]);
  const attention = pets.filter((p) => approvals[p.id].tone !== 'success').length;

  return (
    <div>
      <PhonePageHeader title={t('customer-home-pets.pets.title')} backTo="/app" actions={<IconButton icon="plus" label={t('customer-home-pets.wizard.add')} variant="outline" onClick={() => nav('/app/pets/new')} />} />
      <div className="chp-page">
        {pets.length === 0 ? (
          <EmptyState icon="paw" title={t('customer-home-pets.pets.empty')} body={t('customer-home-pets.pets.emptyBody')} action={<Button icon="plus" onClick={() => nav('/app/pets/new')}>{t('customer-home-pets.wizard.add')}</Button>} />
        ) : (
          <>
            <p className="small muted">{pets.length} {pets.length === 1 ? 'pet' : 'pets'}{attention ? ` · ${attention} ${attention === 1 ? 'needs' : 'need'} attention` : ' · all approved'}</p>
            <div className="chp-petgrid">
              {pets.map((p) => { const a = approvals[p.id]; return <PetAvatarCard key={p.id} name={p.name} photoUrl={p.photo_url as string | null} size="lg" subtitle={<>{p.breed ?? p.type}{p.weight_lbs ? ` · ${p.weight_lbs} lb` : ''}</>} warning={a.warning} status={a.tone === 'success' ? <Badge tone="success" size="sm">{a.label}</Badge> : <VaccineStatusChip status={a.chip} size="sm" label={a.label} />} onClick={() => nav(`/app/pets/${p.id}`)} />; })}
            </div>
            <div className="chp-center"><Button variant="secondary" icon="plus" onClick={() => nav('/app/pets/new')}>{t('customer-home-pets.wizard.add')}</Button></div>
          </>
        )}
      </div>
    </div>
  );
}
