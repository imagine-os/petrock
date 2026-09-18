import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { Select } from '../../components/atom/Select/Select';
import { Input } from '../../components/atom/Input/Input';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { ServiceFlowFooter } from '../../components/molecule/ServiceFlowFooter/ServiceFlowFooter';
import { useCustomer } from './useCustomer';
import { useDaycareDraft, EMPTY_PET_DETAILS, type DaycarePetDetails } from './draft';
import { CgdPage, DAYCARE_STEPS, Notice } from './layout';

/** C-62 Additional pet details (Figma DayCare-2): per pet, vet-recommended flea medication (brand, date) and medical alerts. */
export function DaycareDetailsPage() {
  const t = useT();
  const nav = useNavigate();
  const { pets } = useCustomer();
  const [draft, update] = useDaycareDraft();
  const chosen = pets.filter((p) => draft.petIds.includes(p.id));
  useEffect(() => { if (!draft.petIds.length || !draft.date) nav('/app/daycare/new', { replace: true }); }, [draft.petIds.length, draft.date, nav]);
  const get = (id: string): DaycarePetDetails => draft.details[id] ?? EMPTY_PET_DETAILS;
  const set = (id: string, patch: Partial<DaycarePetDetails>) => update((d) => ({ ...d, details: { ...d.details, [id]: { ...(d.details[id] ?? EMPTY_PET_DETAILS), ...patch } } }));

  return (
    <CgdPage title={t('cgd.petDetails')} backTo="/app/daycare/new" steps={DAYCARE_STEPS} step={1} subtitle="Helps our handlers keep every dog safe. Saved with this booking only.">
      {chosen.map((p, i) => {
        const d = get(p.id);
        return (
          <Card key={p.id} padding="md">
            <Section title={<span className="row"><Avatar name={p.name} size={28} kind="pet" /> {p.name}</span>} description={p.breed ?? undefined} collapsible defaultOpen={i === 0 || chosen.length <= 2}>
              <Select label="Is your dog currently on a vet-recommended flea medication?" value={d.fleaMedication ? 'yes' : 'no'} onChange={(e) => set(p.id, { fleaMedication: e.target.value === 'yes' })} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
              {d.fleaMedication && <div className="cgd-two"><Input label="Flea medication brand" value={d.fleaBrand} onChange={(e) => set(p.id, { fleaBrand: e.target.value })} placeholder="Frontline Plus" /><Input label="Last applied" type="date" value={d.fleaDate} onChange={(e) => set(p.id, { fleaDate: e.target.value })} /></div>}
              <Textarea label="Is there anything else you'd like us to know? (medical alerts)" value={d.medicalAlert} onChange={(e) => set(p.id, { medicalAlert: e.target.value })} maxLength={100} showCount rows={2} placeholder="Allergies, medication, anxieties..." />
              {(() => { const x = p as typeof p & { medical_conditions?: string | null; allergies?: string | null }; return x.medical_conditions ? <Notice>On file: {x.medical_conditions}{x.allergies ? ` · allergies: ${x.allergies}` : ''}</Notice> : null; })()}
            </Section>
          </Card>
        );
      })}
      <ServiceFlowFooter primaryLabel={t('cgd.next')} onPrimary={() => nav('/app/daycare/new/checkout')} hint="Flea medication is not required for daycare, but we ask so we can keep the play groups healthy." />
    </CgdPage>
  );
}
