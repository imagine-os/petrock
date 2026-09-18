import { Navigate, useNavigate } from 'react-router-dom';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { Input } from '../../components/atom/Input/Input';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Section } from '../../components/molecule/Section/Section';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { useT } from '../../i18n';
import { EMPTY_PET_DETAILS, STEP_LABELS, STEP_PATHS, draftStage, useHotelDraft, type PetStayDetails } from './draft';
import { useCustomerAccount } from './lib';
import type { PetRow } from '../../data/schema/core';
import './customer-hotel.css';

const YN = [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }];
const MEALS = ['AM only', 'AM & PM', 'AM, midday & PM', 'Free feeding'].map((v) => ({ value: v, label: v }));
const DOSING = ['1 daily (AM only)', '1 daily (PM only)', '2 daily (AM & PM)', '3 daily', 'As needed'].map((v) => ({ value: v, label: v }));

function defaultsFor(p: PetRow): PetStayDetails {
  const x = p as unknown as { feeding_am?: string | null; feeding_pm?: string | null; own_food?: boolean; meals_per_day?: string | null; medical_conditions?: string | null };
  return { ...EMPTY_PET_DETAILS, feeding: [x.feeding_am && `AM: ${x.feeding_am}`, x.feeding_pm && `PM: ${x.feeding_pm}`].filter(Boolean).join('\n'), ownFood: !!x.own_food, mealsPerDay: x.meals_per_day ?? 'AM & PM', medicalAlert: x.medical_conditions ?? '' };
}

/** C-32 · Hotel: pet stay details (Figma Booking Details Add Pets) - one collapsible section per pet. */
export function PetDetailsPage() {
  const t = useT();
  const nav = useNavigate();
  const { draft, patch } = useHotelDraft();
  const { pets: myPets } = useCustomerAccount();
  if (draftStage(draft) < 2) return <Navigate to={STEP_PATHS[draftStage(draft)]} replace />;
  const pets = myPets.filter((p) => draft.petIds.includes(p.id));
  const get = (p: PetRow): PetStayDetails => draft.petDetails[p.id] ?? defaultsFor(p);
  const set = (p: PetRow, patchD: Partial<PetStayDetails>) => patch((d) => ({ petDetails: { ...d.petDetails, [p.id]: { ...(d.petDetails[p.id] ?? defaultsFor(p)), ...patchD } } }));
  const next = () => { patch((d) => ({ petDetails: Object.fromEntries(pets.map((p) => [p.id, d.petDetails[p.id] ?? defaultsFor(p)])) })); nav(STEP_PATHS[3]); };

  return (
    <HotelBookingFrame title={t('customer-hotel.petDetails')} backTo={STEP_PATHS[1]} steps={STEP_LABELS} step={2} onStepClick={(i) => nav(STEP_PATHS[i])}
      footer={<Button size="lg" block onClick={next}>{t('customer-hotel.next')}</Button>} footerNote="Prefilled from each pet profile; adjust for this stay.">
      {pets.map((p, i) => {
        const v = get(p);
        return (
          <Section key={p.id} collapsible defaultOpen={i === 0} title={<span className="ch-pet-head"><Avatar name={p.name} kind="pet" size={28} />{p.name}<span className="xs muted">{p.breed}</span></span>}>
            <div className="stack">
              <Textarea label="Feeding instructions" rows={2} value={v.feeding} onChange={(e) => set(p, { feeding: e.target.value })} placeholder="AM: 1 cup kibble · PM: 1 cup kibble" />
              <div className="ch-cols-2">
                <Select label="Meals per day" value={v.mealsPerDay} onChange={(e) => set(p, { mealsPerDay: e.target.value })} options={MEALS} />
                <div className="field"><span className="field-label">Own food</span><Toggle checked={v.ownFood} onChange={(on) => set(p, { ownFood: on })} label={v.ownFood ? 'Bringing food' : 'House food'} /></div>
              </div>
              <Select label="Does your dog take medication or supplements?" value={v.takesMedication ? 'yes' : 'no'} onChange={(e) => set(p, { takesMedication: e.target.value === 'yes' })} options={YN} />
              {v.takesMedication && (
                <div className="stack-sm">
                  <div className="ch-cols-2">
                    <Select label="How many?" value={v.medicationCount} onChange={(e) => set(p, { medicationCount: e.target.value })} options={['1', '2', '3', '4+'].map((x) => ({ value: x, label: x }))} />
                    <Select label="How many times a day?" value={v.dosing} onChange={(e) => set(p, { dosing: e.target.value })} options={DOSING} />
                  </div>
                  <Input label="Medication / supplement name and dose" value={v.medication} onChange={(e) => set(p, { medication: e.target.value })} placeholder="Carprofen 75 mg with breakfast" />
                </div>
              )}
              <Select label="Is your dog currently on a vet-recommended flea medication?" value={v.fleaMedication ? 'yes' : 'no'} onChange={(e) => set(p, { fleaMedication: e.target.value === 'yes' })} options={YN} />
              {v.fleaMedication && <div className="ch-cols-2"><Input label="Flea medication brand" value={v.fleaBrand} onChange={(e) => set(p, { fleaBrand: e.target.value })} placeholder="NexGard" /><Input label="Last dose" type="date" value={v.fleaDate} onChange={(e) => set(p, { fleaDate: e.target.value })} /></div>}
              <Input label="Belongings" value={v.belongings} onChange={(e) => set(p, { belongings: e.target.value })} placeholder="Bed, favourite toy, leash" hint="Label everything with your pet's name." />
              <Textarea label="Medical alert" rows={2} value={v.medicalAlert} onChange={(e) => set(p, { medicalAlert: e.target.value })} placeholder="Allergies, conditions, anything staff must know" />
              <Textarea label="Anything else?" rows={2} value={v.notes} onChange={(e) => set(p, { notes: e.target.value })} placeholder="Shy with big dogs, loves belly rubs..." />
            </div>
          </Section>
        );
      })}
    </HotelBookingFrame>
  );
}
