import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { packagePrice, packageMinutes } from '../../pricing/engine';
import { Button } from '../../components/atom/Button/Button';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PetChoiceStrip } from '../../components/molecule/PetChoiceStrip/PetChoiceStrip';
import { GroomingPackageCard } from '../../components/molecule/GroomingPackageCard/GroomingPackageCard';
import { ServiceFlowFooter } from '../../components/molecule/ServiceFlowFooter/ServiceFlowFooter';
import { useCustomer } from './useCustomer';
import { usePricingTables } from './pricing';
import { useGroomingDraft, type GroomingDraftItem } from './draft';
import { CgdPage, GROOMING_STEPS, Notice } from './layout';

/** C-51 Choose pet & package (Figma Frame 1171276428): one pet per item, package priced for that pet's size. */
export function GroomingPetPackagePage() {
  const t = useT();
  const nav = useNavigate();
  const { pets } = useCustomer();
  const { packages } = usePricingTables();
  const [draft, update] = useGroomingDraft();
  useEffect(() => { if (!draft.items.length) update({ items: [{ petId: '', packageId: null, addonIds: [] }], current: 0 }); }, [draft.items.length, update]);
  const idx = Math.min(draft.current, Math.max(0, draft.items.length - 1));
  const item: GroomingDraftItem = draft.items[idx] ?? { petId: '', packageId: null, addonIds: [] };
  const otherPetIds = draft.items.filter((_, i) => i !== idx).map((x) => x.petId).filter(Boolean);
  const pet = pets.find((p) => p.id === item.petId);
  const setItem = (patch: Partial<GroomingDraftItem>) => update((d) => ({ ...d, items: d.items.map((x, i) => (i === idx ? { ...x, ...patch } : x)) }));

  if (!pets.length) return <CgdPage title={t('cgd.grooming')} backTo="/app/grooming"><EmptyState icon="paw" title="Add a pet first" body="Bookings need at least one pet on your account." action={<Button icon="plus" onClick={() => nav('/app/pets/new')}>Add a pet</Button>} /></CgdPage>;

  return (
    <CgdPage title={t('cgd.grooming')} backTo={idx > 0 ? '/app/grooming/new/add-ons' : '/app/grooming'} steps={GROOMING_STEPS} step={0} subtitle={draft.items.length > 1 ? `Pet ${idx + 1} of ${draft.items.length} in this order` : undefined}>
      <PetChoiceStrip label={t('cgd.choosePet')} pets={pets.map((p) => ({ id: p.id, name: p.name, breed: p.breed, size: p.sizeTier, photoUrl: null, approval: p.approval_status, vaccinesOk: p.vaccinesOk }))} value={item.petId ? [item.petId] : []} onChange={(ids) => setItem({ petId: ids[0] ?? '' })} disabledIds={otherPetIds} onAddPet={() => nav('/app/pets/new')} />
      {pet && !pet.vaccinesOk && <Notice tone="warn">{pet.name}'s {pet.vaccinesMissing.join(', ')} {pet.vaccinesMissing.length > 1 ? 'vaccines are' : 'vaccine is'} not verified yet. You can book now; the appointment stays "Pending verification" until the front desk checks the proof.</Notice>}
      <div className="cgd-list">
        <div className="field-label">{t('cgd.choosePackage')}{pet && <span className="muted"> · size {pet.sizeTier}{pet.weight_lbs ? ` (${pet.weight_lbs} lb)` : ''}</span>}</div>
        {packages.map((p) => (
          <GroomingPackageCard key={p.id} name={p.name} tier={p.tier} inclusions={p.inclusions} price={packagePrice(p, pet?.sizeTier ?? 'M')} minutes={packageMinutes(p, pet?.sizeTier ?? 'M')} size={pet?.sizeTier} selected={item.packageId === p.id} onSelect={() => setItem({ packageId: p.id })} disabled={!pet} note={p.tier === 'diamond' ? 'Specialty cuts: prices pending confirmation' : null} />
        ))}
        {!pet && <p className="xs muted">Pick a pet to see prices for its size.</p>}
      </div>
      <ServiceFlowFooter primaryLabel={t('cgd.next')} primaryDisabled={!pet || !item.packageId} onPrimary={() => nav('/app/grooming/new/add-ons')} summary={pet && item.packageId ? <span>{pet.name} · {packages.find((p) => p.id === item.packageId)?.name} <strong>${packagePrice(packages.find((p) => p.id === item.packageId)!, pet.sizeTier).toFixed(2)}</strong></span> : undefined} />
    </CgdPage>
  );
}
