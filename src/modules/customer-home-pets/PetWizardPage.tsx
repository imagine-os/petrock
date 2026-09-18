import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useData, useTable } from '../../data/DataContext';
import type { PetRow, UserRow } from '../../data/schema/core';
import type { EmergencyContactRow, PetLookupRow, VetRow } from '../../data/schema/customer-home-pets';
import { PET_MEALS, PET_PERSONALITIES, PET_SOCIALIZED } from '../../data/schema/customer-home-pets';
import { PET_SIZES, sizeFromWeightLbs } from '../../domain/booking';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Stepper } from '../../components/molecule/Stepper/Stepper';
import { PetPhotoPicker } from '../../components/molecule/PetPhotoPicker/PetPhotoPicker';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { RadioGroup } from '../../components/atom/RadioGroup/RadioGroup';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { Modal } from '../../components/organism/Modal/Modal';
import { VaccineRecordRow as VaccineRow } from '../../components/molecule/VaccineRecordRow/VaccineRecordRow';
import { VaccineRecordForm, type VaccineRecordDraft } from '../../components/organism/VaccineRecordForm/VaccineRecordForm';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCurrentCustomer, useVaccineData, vaccineStatusOf, fmtDate, isoToday } from './lib';
import { notifyCustomer, submitVaccineRecord, upsertEmergencyContact } from './actions';
import './customer-home-pets.css';

const STEPS = ['Basics', 'Size', 'Care', 'Vet', 'Vaccines'];
const PET_TYPES = ['Dog', 'Cat', 'Other'];

interface Form {
  photo: string | null; name: string; type: string; breed: string; sex: '' | 'male' | 'female'; neutered: '' | 'yes' | 'no'; color: string; dob: string;
  weight: string;
  socialized: string[]; personality: string; ownFood: boolean; meals: string; feedingAm: string; feedingMid: string; feedingPm: string; treats: boolean;
  conditions: string; allergies: string; vetId: string; ecName: string; ecPhone: string; ecRelationship: string;
}
const EMPTY: Form = { photo: null, name: '', type: 'Dog', breed: '', sex: '', neutered: '', color: '', dob: '', weight: '', socialized: [], personality: '', ownFood: false, meals: 'AM & PM', feedingAm: '', feedingMid: '', feedingPm: '', treats: true, conditions: '', allergies: '', vetId: '', ecName: '', ecPhone: '', ecRelationship: '' };

const fromPet = (p: PetRow, ec: EmergencyContactRow | null): Form => ({
  photo: (p.photo_url as string | null) ?? null, name: p.name, type: p.type, breed: p.breed ?? '', sex: p.sex ?? '', neutered: p.neutered ? 'yes' : 'no', color: (p.color as string | null) ?? '', dob: p.date_of_birth ?? '',
  weight: p.weight_lbs != null ? String(p.weight_lbs) : '',
  socialized: (p.socialized_with as string[] | null) ?? [], personality: p.personality ?? '', ownFood: !!p.own_food, meals: (p.meals_per_day as string | null) ?? 'AM & PM', feedingAm: (p.feeding_am as string | null) ?? '', feedingMid: (p.feeding_midday as string | null) ?? '', feedingPm: (p.feeding_pm as string | null) ?? '', treats: p.can_have_treats !== false,
  conditions: (p.medical_conditions as string | null) ?? '', allergies: (p.allergies as string | null) ?? '', vetId: (p.vet_id as string | null) ?? '', ecName: ec?.name ?? '', ecPhone: ec?.phone ?? '', ecRelationship: ec?.relationship ?? '',
});

/** C-12 (new) and C-14 (edit): one five-step wizard. */
export function PetWizardPage({ mode }: { mode: 'new' | 'edit' }) {
  const { t } = useI18n();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user } = useSession();
  const { petId } = useParams();
  const { customer } = useCurrentCustomer();
  const { rows: petRows } = useTable<PetRow>('pets', petId ? { where: { id: petId } } : undefined);
  const pet = mode === 'edit' ? petRows[0] ?? null : null;
  const { rows: contacts } = useTable<EmergencyContactRow>('emergency_contacts', petId ? { where: { pet_id: petId } } : undefined);
  const existingContact = mode === 'edit' ? contacts[0] ?? null : null;
  const { rows: lookups } = useTable<PetLookupRow>('pet_lookups', { where: { active: true }, orderBy: { column: 'sort_order' } });
  const { rows: vets } = useTable<VetRow>('vets', { orderBy: { column: 'name' } });
  const { rows: users } = useTable<UserRow>('users');
  const { types, records } = useVaccineData();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [loaded, setLoaded] = useState(mode === 'new');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, VaccineRecordDraft>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState<null | { kind: 'breed' | 'color' | 'vet'; value: string; phone?: string }>(null);

  useEffect(() => { if (mode === 'edit' && pet && !loaded) { setForm(fromPet(pet, existingContact)); setLoaded(true); } }, [mode, pet, existingContact, loaded]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const breeds = lookups.filter((l) => l.kind === 'breed').map((l) => l.value);
  const colors = lookups.filter((l) => l.kind === 'color').map((l) => l.value);
  const opt = (xs: string[], extra?: string) => [...new Set(extra && !xs.includes(extra) ? [extra, ...xs] : xs)].map((v) => ({ value: v, label: v }));

  const errors = {
    name: !form.name.trim() ? 'Give your pet a name.' : undefined,
    type: !form.type ? 'Choose a type.' : undefined,
    sex: !form.sex ? 'Choose male or female.' : undefined,
    neutered: !form.neutered ? 'Tell us if your dog is neutered or spayed.' : undefined,
    dob: form.dob && form.dob > isoToday() ? 'Birthday cannot be in the future.' : undefined,
    weight: form.weight && (Number.isNaN(Number(form.weight)) || Number(form.weight) <= 0 || Number(form.weight) > 400) ? 'Enter a weight between 1 and 400 lb.' : undefined,
    ecPhone: form.ecName.trim() && !form.ecPhone.trim() ? 'Add a phone number for this contact.' : undefined,
  };
  const stepValid = [!errors.name && !errors.type && !errors.sex && !errors.neutered && !errors.dob, !errors.weight, true, !errors.ecPhone, true];
  const weightNum = Number(form.weight);
  const band = form.weight && !errors.weight ? sizeFromWeightLbs(weightNum) : null;

  const petVaccineLines = useMemo(() => types.map((type) => {
    const record = pet ? records.filter((r) => r.pet_id === pet.id && r.vaccine_type_id === type.id).sort((a, b) => (b.vaccinated_on ?? '').localeCompare(a.vaccinated_on ?? ''))[0] ?? null : null;
    const draft = drafts[type.id];
    return { type, record, draft, status: draft ? ('pending' as const) : vaccineStatusOf(record) };
  }), [types, records, pet, drafts]);
  const requiredCovered = petVaccineLines.filter((l) => l.type.required).every((l) => l.draft || (l.record && l.status !== 'missing' && l.status !== 'expired'));

  const next = () => { setTouched(true); if (!stepValid[step]) return; setTouched(false); setStep((s) => Math.min(STEPS.length - 1, s + 1)); window.scrollTo({ top: 0 }); };
  const back = () => { if (step === 0) nav(mode === 'edit' && pet ? `/app/pets/${pet.id}` : '/app/pets'); else { setStep((s) => s - 1); window.scrollTo({ top: 0 }); } };

  const addLookup = async () => {
    if (!adding || !adding.value.trim()) return;
    if (adding.kind === 'vet') { const v = await data.insert<VetRow>('vets', { name: adding.value.trim(), phone: adding.phone?.trim() || null, address: null }); set('vetId', v.id); }
    else { await data.insert<PetLookupRow>('pet_lookups', { kind: adding.kind, value: adding.value.trim(), sort_order: 999, active: true, added_by: user.id }); set(adding.kind, adding.value.trim()); }
    setAdding(null);
  };

  const save = async (finish: boolean, skipVaccines = false) => {
    setTouched(true);
    const firstInvalid = stepValid.findIndex((ok) => !ok);
    if (firstInvalid >= 0) { setStep(firstInvalid); return; }
    if (!customer) { toast({ tone: 'danger', title: 'No customer account', body: 'Sign in as a pet parent to add a pet.' }); return; }
    setBusy(true);
    try {
      const w = form.weight && !errors.weight ? weightNum : null;
      const hasDrafts = Object.keys(drafts).length > 0;
      const patch: Partial<PetRow> = {
        customer_id: customer.id, name: form.name.trim(), type: form.type, breed: form.breed || null, is_mixed: form.breed === 'Mixed breed', sex: form.sex as 'male' | 'female', neutered: form.neutered === 'yes', color: form.color || null,
        weight_lbs: w, size: w ? sizeFromWeightLbs(w) : null, date_of_birth: form.dob || null, personality: form.personality || null, socialized_with: form.socialized, can_have_treats: form.treats, own_food: form.ownFood,
        meals_per_day: form.meals || null, feeding_am: form.feedingAm.trim() || null, feeding_midday: form.feedingMid.trim() || null, feeding_pm: form.feedingPm.trim() || null, medical_conditions: form.conditions.trim() || null, allergies: form.allergies.trim() || null, vet_id: form.vetId || null, photo_url: form.photo,
      };
      let saved: PetRow;
      if (mode === 'edit' && pet) {
        saved = await data.update<PetRow>('pets', pet.id, patch);
      } else {
        saved = await data.insert<PetRow>('pets', { ...patch, attributes: null, approval_status: hasDrafts || !finish ? 'pending' : skipVaccines ? 'needs_details' : 'pending', status: 'active', note: null });
      }
      await upsertEmergencyContact(data, customer.id, saved.id, { name: form.ecName, phone: form.ecPhone, relationship: form.ecRelationship }, existingContact);
      for (const [typeId, draft] of Object.entries(drafts)) {
        const type = types.find((x) => x.id === typeId); if (!type) continue;
        const existing = pet ? records.filter((r) => r.pet_id === pet.id && r.vaccine_type_id === typeId).sort((a, b) => (b.vaccinated_on ?? '').localeCompare(a.vaccinated_on ?? ''))[0] ?? null : null;
        await submitVaccineRecord({ data, pet: saved, type, draft, existing, customer, users });
      }
      setDrafts({});
      if (mode === 'new') {
        if (customer.user_id) await notifyCustomer(data, customer.user_id, 'pet_added', `${saved.name} was added`, skipVaccines ? `${saved.name} is waiting for vaccine records. Bookings stay pending until the front desk verifies them.` : `${saved.name} is waiting for the front desk to verify the vaccine records.`, `/app/pets/${saved.id}`);
        toast({ tone: skipVaccines ? 'warn' : 'success', title: `${saved.name} added`, body: skipVaccines ? t('customer-home-pets.wizard.pendingWarning') : 'The front desk will verify the vaccines shortly.' });
        nav(`/app/pets/${saved.id}`, { replace: true });
      } else {
        toast(`${saved.name} updated`);
        if (finish) nav(`/app/pets/${saved.id}`);
      }
    } finally { setBusy(false); }
  };

  if (mode === 'edit' && !pet) return <div><CustomerScreenHeader title={t('customer-home-pets.wizard.edit')} backTo="/app/pets" rule={false} /><div className="chp-page"><p className="muted small">Pet not found.</p></div></div>;
  if (mode === 'edit' && pet && customer && pet.customer_id !== customer.id && user.role === 'customer') { nav('/app/pets', { replace: true }); return null; }

  const title = mode === 'new' ? t('customer-home-pets.wizard.add') : t('customer-home-pets.wizard.edit');
  const editingLine = editing ? petVaccineLines.find((l) => l.type.id === editing) : null;

  return (
    <div>
      <CustomerScreenHeader title={title} backTo={mode === 'edit' && pet ? `/app/pets/${pet.id}` : '/app/pets'} rule={false} />
      <div className="chp-wizard">
        <div className="chp-wizard-steps"><Stepper steps={STEPS} current={step} onStepClick={(i) => setStep(i)} compact /></div>

        {step === 0 && (
          <section className="chp-wizard-step" aria-label="Basics">
            <h2 className="sr-only">Basics</h2>
            <div className="chp-center"><PetPhotoPicker name={form.name || 'Pet'} value={form.photo} onChange={(v) => set('photo', v)} size={70} /></div>
            <Input label="Name" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Boss" error={touched ? errors.name : undefined} autoComplete="off" />
            <div className="chp-two">
              <Select label="Type" required value={form.type} onChange={(e) => set('type', e.target.value)} options={opt(PET_TYPES)} error={touched ? errors.type : undefined} />
              <Select label="Breed" value={form.breed} onChange={(e) => (e.target.value === '__add' ? setAdding({ kind: 'breed', value: '' }) : set('breed', e.target.value))} placeholder="Choose a breed" options={[...opt(breeds, form.breed), { value: '__add', label: '+ Add another breed' }]} />
            </div>
            <div className="chp-two">
              <Select label="Sex" required value={form.sex} onChange={(e) => set('sex', e.target.value as Form['sex'])} placeholder="Choose" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} error={touched ? errors.sex : undefined} />
              <Select label="Neutered/Spayed" required value={form.neutered} onChange={(e) => set('neutered', e.target.value as Form['neutered'])} placeholder="Choose" options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} error={touched ? errors.neutered : undefined} />
            </div>
            <div className="chp-two">
              <Select label="Color" value={form.color} onChange={(e) => (e.target.value === '__add' ? setAdding({ kind: 'color', value: '' }) : set('color', e.target.value))} placeholder="Choose a colour" options={[...opt(colors, form.color), { value: '__add', label: '+ Add another colour' }]} />
              <Input label="Date Of Birth" type="date" value={form.dob} max={isoToday()} onChange={(e) => set('dob', e.target.value)} error={touched ? errors.dob : undefined} />
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="chp-wizard-step" aria-label="Size and weight">
            <h2>Size & weight</h2>
            <p className="chp-step-intro">Weight decides the room fit and the Grooming & Spa price tier. Round to the nearest pound.</p>
            <Input label="Weight" type="number" inputMode="decimal" min={1} max={400} step={1} value={form.weight} onChange={(e) => set('weight', e.target.value)} suffix="lbs" placeholder="e.g. 42" error={touched ? errors.weight : undefined} hint={!errors.weight ? 'Optional now, needed before a grooming booking' : undefined} />
            <Card padding="md">
              <div className="chp-size-card">
                <div><div className="eyebrow">Size band</div><div className="small muted">{band ? { S: 'Small, under 20 lb', M: 'Medium, 20-39 lb', L: 'Large, 40-69 lb', XL: 'Extra large, 70-99 lb', Giant: 'Giant, 100 lb and over' }[band] : 'Enter a weight to see the band'}</div></div>
                <div className="chp-size-band" aria-live="polite">{band ?? '-'}</div>
              </div>
              <div className="chp-size-scale" aria-hidden>{PET_SIZES.map((s) => <span key={s} className={s === band ? 'is-active' : ''}>{s}</span>)}</div>
            </Card>
          </section>
        )}

        {step === 2 && (
          <section className="chp-wizard-step" aria-label="Personality and feeding">
            <h2>Personality & feeding</h2>
            <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="field-label">Is your dog socialised? Check all that apply</legend>
              <div className="chp-checks">{PET_SOCIALIZED.map((s) => <Checkbox key={s} label={s} checked={form.socialized.includes(s)} onChange={(e) => set('socialized', e.target.checked ? [...form.socialized, s] : form.socialized.filter((x) => x !== s))} />)}</div>
            </fieldset>
            <RadioGroup label="What is your dog's personality?" inline value={form.personality || null} onChange={(v) => set('personality', v)} options={PET_PERSONALITIES.map((p) => ({ value: p, label: p }))} />
            <Toggle checked={form.ownFood} onChange={(v) => set('ownFood', v)} label="Are you providing your own food?" description={form.ownFood ? 'Yes, I will bring food' : 'No, please use Petrock food'} />
            <Select label="How many meals per day does your dog eat?" value={form.meals} onChange={(e) => set('meals', e.target.value)} options={opt([...PET_MEALS])} />
            {(form.meals.includes('AM') || form.meals === 'Free feeding') && <Textarea label="AM feeding instructions" rows={2} value={form.feedingAm} onChange={(e) => set('feedingAm', e.target.value)} placeholder="Write instructions here" maxLength={200} showCount />}
            {form.meals.includes('Mid') && <Textarea label="Mid day feeding instructions" rows={2} value={form.feedingMid} onChange={(e) => set('feedingMid', e.target.value)} placeholder="Write instructions here" maxLength={200} showCount />}
            {(form.meals.includes('PM') || form.meals === 'Free feeding') && <Textarea label="PM feeding instructions" rows={2} value={form.feedingPm} onChange={(e) => set('feedingPm', e.target.value)} placeholder="Write instructions here" maxLength={200} showCount />}
            <Toggle checked={form.treats} onChange={(v) => set('treats', v)} label="Can your dog have treats?" description={form.treats ? 'Yes' : 'No treats, please'} />
          </section>
        )}

        {step === 3 && (
          <section className="chp-wizard-step" aria-label="Vet and emergency contact">
            <h2>Vet & emergency</h2>
            <Textarea label="Medical conditions" rows={2} value={form.conditions} onChange={(e) => set('conditions', e.target.value)} placeholder="List any medical conditions" maxLength={300} showCount />
            <Textarea label="Allergies" rows={2} value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="List any allergies" maxLength={300} showCount />
            <Select label="Your vet" value={form.vetId} onChange={(e) => (e.target.value === '__add' ? setAdding({ kind: 'vet', value: '', phone: '' }) : set('vetId', e.target.value))} placeholder="See the list of vets or add a vet" options={[...vets.map((v) => ({ value: v.id, label: v.name })), { value: '__add', label: '+ Add a vet' }]} />
            <Card padding="md" tint>
              <div className="stack-sm">
                <div className="row" style={{ gap: 8 }}><Icon name="phone" size={16} /><strong className="small">Emergency contact</strong><Badge size="sm">Optional</Badge></div>
                <p className="xs muted">Someone we can call about {form.name || 'your dog'} if we cannot reach you.</p>
                <Input label="Name" value={form.ecName} onChange={(e) => set('ecName', e.target.value)} placeholder="e.g. Jamie Thompson" autoComplete="off" />
                <div className="chp-two">
                  <Input label="Phone" type="tel" value={form.ecPhone} onChange={(e) => set('ecPhone', e.target.value)} placeholder="+1 (818) 555-0100" error={touched ? errors.ecPhone : undefined} />
                  <Input label="Relationship" value={form.ecRelationship} onChange={(e) => set('ecRelationship', e.target.value)} placeholder="Partner, neighbour..." />
                </div>
              </div>
            </Card>
          </section>
        )}

        {step === 4 && (
          <section className="chp-wizard-step" aria-label="Vaccines">
            <h2>Vaccines</h2>
            <p className="chp-step-intro">Upload a certificate or invoice for each vaccine. The front desk verifies them before a booking is confirmed.</p>
            <div className="chp-vaccine-list">
              <div className="eyebrow">{t('customer-home-pets.vaccines.required')}</div>
              {petVaccineLines.filter((l) => l.type.required).map((l) => <VaccineRow key={l.type.id} name={l.type.name} required status={l.status} vaccinatedOn={fmtDate(l.draft?.vaccinatedOn ?? l.record?.vaccinated_on)} expiresOn={fmtDate(l.draft?.expiresOn ?? l.record?.expires_on)} proofName={l.draft?.proof?.name ?? l.record?.proof_name} note={l.draft ? 'Will be submitted when you save' : (l.record?.note as string | null | undefined)} action={<Button size="sm" variant={l.status === 'verified' || l.draft ? 'secondary' : 'primary'} icon="upload" onClick={() => setEditing(l.type.id)}>{l.draft || (l.record && l.status !== 'missing') ? 'Update' : 'Upload'}</Button>} />)}
              <div className="eyebrow" style={{ marginTop: 8 }}>{t('customer-home-pets.vaccines.recommended')}</div>
              {petVaccineLines.filter((l) => !l.type.required).map((l) => <VaccineRow key={l.type.id} name={l.type.name} required={false} status={l.status} vaccinatedOn={fmtDate(l.draft?.vaccinatedOn ?? l.record?.vaccinated_on)} expiresOn={fmtDate(l.draft?.expiresOn ?? l.record?.expires_on)} proofName={l.draft?.proof?.name ?? l.record?.proof_name} note={l.draft ? 'Will be submitted when you save' : (l.record?.note as string | null | undefined)} action={<Button size="sm" variant="secondary" icon="upload" onClick={() => setEditing(l.type.id)}>{l.draft || (l.record && l.status !== 'missing') ? 'Update' : 'Upload'}</Button>} />)}
            </div>
            {!requiredCovered && <div className="chp-warning" role="status"><Icon name="warning" size={16} /><span>{t('customer-home-pets.wizard.pendingWarning')}</span></div>}
          </section>
        )}

        <div className="chp-wizard-foot">
          {step < STEPS.length - 1 ? (
            <div className="chp-wizard-foot-row">
              {step > 0 && <Button variant="ghost" size="sm" onClick={back} icon="arrow-left" aria-label={t('customer-home-pets.wizard.back')} />}
              <Button size="sm" block onClick={next} disabled={touched && !stepValid[step]}>{t('customer-home-pets.wizard.next')}</Button>
            </div>
          ) : (
            <div className="chp-wizard-foot-row">
              <Button variant="ghost" size="sm" onClick={back} icon="arrow-left" aria-label={t('customer-home-pets.wizard.back')} />
              <Button size="sm" block onClick={() => save(true, !requiredCovered && Object.keys(drafts).length === 0)} loading={busy}>{mode === 'new' ? t('customer-home-pets.wizard.submit') : t('customer-home-pets.wizard.save')}</Button>
            </div>
          )}
          {mode === 'edit' && step < STEPS.length - 1 && <Button variant="ghost" size="sm" onClick={() => save(false)} loading={busy}>{t('customer-home-pets.wizard.save')}</Button>}
          {mode === 'new' && step === STEPS.length - 1 && !requiredCovered && <Button variant="link" size="sm" onClick={() => save(true, true)} disabled={busy}>{t('customer-home-pets.wizard.skip')}</Button>}
        </div>
      </div>

      {editingLine && <VaccineRecordForm key={editingLine.type.id} open onClose={() => setEditing(null)} petName={form.name || 'your dog'} vaccineName={editingLine.type.name} required={editingLine.type.required}
        initial={editingLine.draft ?? (editingLine.record && editingLine.status !== 'missing' ? { vaccinatedOn: editingLine.record.vaccinated_on ?? '', expiresOn: editingLine.record.expires_on ?? '', proof: editingLine.record.proof_name ? { name: editingLine.record.proof_name, sizeBytes: 0, type: '', url: editingLine.record.proof_url ?? '' } : null } : null)}
        defaultMonths={editingLine.type.short_name === 'Rabies' ? 12 : 12}
        onSave={(d) => { setDrafts((x) => ({ ...x, [editingLine.type.id]: d })); setEditing(null); }}
        onRemove={editingLine.draft ? () => { setDrafts((x) => { const y = { ...x }; delete y[editingLine.type.id]; return y; }); setEditing(null); } : undefined} />}

      <Modal open={!!adding} onClose={() => setAdding(null)} size="sm" title={adding?.kind === 'vet' ? 'Add a vet' : adding?.kind === 'breed' ? 'Add a breed' : 'Add a colour'} footer={<><Button variant="secondary" onClick={() => setAdding(null)}>Cancel</Button><Button onClick={addLookup} disabled={!adding?.value.trim()}>Add</Button></>}>
        <div className="stack-sm">
          <Input label={adding?.kind === 'vet' ? 'Clinic or vet name' : 'Name'} value={adding?.value ?? ''} onChange={(e) => setAdding((a) => (a ? { ...a, value: e.target.value } : a))} autoFocus />
          {adding?.kind === 'vet' && <Input label="Phone" type="tel" value={adding.phone ?? ''} onChange={(e) => setAdding((a) => (a ? { ...a, phone: e.target.value } : a))} />}
        </div>
      </Modal>
    </div>
  );
}
