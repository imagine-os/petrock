import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation as useRouterLocation } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Section } from '../../../components/molecule/Section/Section';
import { Input } from '../../../components/atom/Input/Input';
import { Select } from '../../../components/atom/Select/Select';
import { Checkbox } from '../../../components/atom/Checkbox/Checkbox';
import { Textarea } from '../../../components/atom/Textarea/Textarea';
import { Button } from '../../../components/atom/Button/Button';
import { Badge } from '../../../components/atom/Badge/Badge';
import { Chip } from '../../../components/atom/Chip/Chip';
import { Icon } from '../../../components/atom/Icon/Icon';
import { DeskLookupSelect } from '../../../components/molecule/DeskLookupSelect/DeskLookupSelect';
import { DeskAttachmentDropzone, type DeskAttachmentFile } from '../../../components/molecule/DeskAttachmentDropzone/DeskAttachmentDropzone';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useRow, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { VaccineRecordRow, VaccineTypeRow } from '../../../data/schema/core';
import type { AttachmentRow, PetProfileRow } from '../../../data/schema/frontdesk-grooming-people';
import { PET_SIZES, sizeFromWeightLbs } from '../../../domain/booking';
import { usePeople } from '../hooks';
import { fullName, petVaccineSummary, settleVaccineStatus, sizeLabel, todayIso, writeAudit, type PetFull } from '../lib';
import '../module.css';

const ATTRIBUTE_OPTIONS = ['Aggressive', 'Muzzle', 'Staff only', 'Senior', 'Anxious', 'Escape artist', 'No stairs', 'Separate from other dogs'];
interface VaxDraft { typeId: string; vaccinated: string; expires: string; reference: string; file: DeskAttachmentFile | null; recordId: string | null; status: string }
const plusYear = (d: string) => { if (!d) return ''; const x = new Date(`${d}T12:00:00`); x.setFullYear(x.getFullYear() + 1); return x.toISOString().slice(0, 10); };

function CertUpload({ label, onFile }: { label: string; onFile: (f: DeskAttachmentFile) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <span style={{ alignSelf: 'center' }}>
      <Button size="sm" variant="ghost" icon="upload" onClick={() => ref.current?.click()} aria-label={`Upload ${label} certificate`}>Upload document</Button>
      <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.pdf" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile({ name: file.name, size_bytes: file.size, mime: file.type || null, url: `mock://uploads/${Date.now()}-${file.name.replace(/\s+/g, '-').toLowerCase()}` }); e.target.value = ''; }} />
    </span>
  );
}

/** F-54 Add / edit pet (Figma Pet Details). */
export function PetFormPage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { id } = useParams();
  const { search } = useRouterLocation();
  const q = useMemo(() => new URLSearchParams(search), [search]);
  const { user, can } = useSession();
  const { locationId } = useLocation();
  const existing = useRow<PetFull>('pets', id);
  const { customers, vaccineTypes, vaccineRecords } = usePeople();
  const { rows: profiles } = useTable<PetProfileRow>('pet_profiles', { where: { pet_id: id ?? '__none__' } });
  const { rows: existingFiles } = useTable<AttachmentRow>('attachments', { where: { subject_table: 'pets', subject_id: id ?? '__none__' } });
  const [f, setF] = useState({ customer_id: q.get('customer') ?? '', name: '', type: 'Dog', status: 'active', breed: '', is_mixed: false, size: '', sex: '', neutered: true, weight_lbs: '', color: '', temper: '', date_of_birth: '', dob_approximate: false, vet_id: '', registration_number: '', microchip_number: '', groom_style: '', personality: '', medical_conditions: '', allergies: '', note: '' });
  const [attributes, setAttributes] = useState<string[]>([]);
  const [vax, setVax] = useState<VaxDraft[]>([]);
  const [files, setFiles] = useState<DeskAttachmentFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const types = useMemo(() => [...vaccineTypes].sort((a, b) => a.sort_order - b.sort_order), [vaccineTypes]);
  useEffect(() => { if (vax.length === 0 && types.length) setVax(types.map((t) => ({ typeId: t.id, vaccinated: '', expires: '', reference: '', file: null, recordId: null, status: 'missing' }))); }, [types, vax.length]);
  useEffect(() => {
    if (!existing || loaded || !types.length) return;
    const p = profiles[0];
    setF({ customer_id: existing.customer_id, name: existing.name, type: existing.type, status: existing.status, breed: existing.breed ?? '', is_mixed: existing.is_mixed, size: existing.size ?? '', sex: existing.sex, neutered: existing.neutered, weight_lbs: existing.weight_lbs != null ? String(existing.weight_lbs) : '', color: existing.color ?? '', temper: p?.temper ?? existing.personality ?? '', date_of_birth: existing.date_of_birth ?? '', dob_approximate: p?.dob_approximate ?? false, vet_id: existing.vet_id ?? '', registration_number: p?.registration_number ?? '', microchip_number: p?.microchip_number ?? '', groom_style: p?.groom_style ?? '', personality: existing.personality ?? '', medical_conditions: existing.medical_conditions ?? '', allergies: existing.allergies ?? '', note: existing.note ?? '' });
    setAttributes(existing.attributes ?? []);
    setVax(types.map((t) => { const r = vaccineRecords.find((x) => x.pet_id === existing.id && x.vaccine_type_id === t.id); return { typeId: t.id, vaccinated: r?.vaccinated_on ?? '', expires: r?.expires_on ?? '', reference: (r?.note as string | null) ?? '', file: r?.proof_name ? { name: r.proof_name, url: r.proof_url ?? '', size_bytes: 0, mime: null } : null, recordId: r?.id ?? null, status: r?.status ?? 'missing' }; }));
    setFiles(existingFiles.map((a) => ({ name: a.name, size_bytes: a.size_bytes, mime: a.mime, url: a.url })));
    setLoaded(true);
  }, [existing, profiles, types, vaccineRecords, existingFiles, loaded]);
  const owner = customers.find((c) => c.id === f.customer_id);
  const autoSize = f.weight_lbs ? sizeFromWeightLbs(Number(f.weight_lbs)) : null;
  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.customer_id) e.customer_id = 'Choose the owner'; if (!f.name.trim()) e.name = 'Required'; if (!f.type.trim()) e.type = 'Required'; if (!f.sex) e.sex = 'Required';
    if (f.weight_lbs && (Number(f.weight_lbs) <= 0 || Number(f.weight_lbs) > 300)) e.weight_lbs = 'Enter pounds'; if (f.note.length > 100) e.note = '100 characters max';
    vax.forEach((v) => { if (v.expires && v.vaccinated && v.expires < v.vaccinated) e[`vax_${v.typeId}`] = 'Expiry before vaccination date'; });
    setErrors(e); return Object.keys(e).length === 0;
  };
  const submit = async () => {
    if (!validate()) { toast({ tone: 'warn', title: 'Please fix the highlighted fields' }); return; }
    setSaving(true);
    try {
      const weight = f.weight_lbs ? Number(f.weight_lbs) : null;
      const core: Partial<PetFull> = { customer_id: f.customer_id, name: f.name.trim(), type: f.type.trim(), status: f.status, breed: f.breed || null, is_mixed: f.is_mixed, size: (f.size || autoSize || null) as PetFull['size'], sex: f.sex as PetFull['sex'], neutered: f.neutered, weight_lbs: weight, color: f.color || null, personality: f.temper || f.personality || null, date_of_birth: f.date_of_birth || null, vet_id: f.vet_id || null, attributes: attributes.length ? attributes : null, medical_conditions: f.medical_conditions || null, allergies: f.allergies || null, note: f.note || null } as Partial<PetFull>;
      let pet: PetFull;
      if (existing) { pet = await data.update<PetFull>('pets', existing.id, core); await writeAudit(data, user, 'update', 'pets', pet.id, { fields: Object.keys(core) }, locationId); }
      else { pet = await data.insert<PetFull>('pets', { ...core, approval_status: 'pending', socialized_with: null, can_have_treats: true, own_food: false, meals_per_day: null, feeding_am: null, feeding_midday: null, feeding_pm: null, photo_url: null } as Partial<PetFull>); await writeAudit(data, user, 'insert', 'pets', pet.id, { name: pet.name, owner: f.customer_id }, locationId); }
      const prof: Partial<PetProfileRow> = { pet_id: pet.id, registration_number: f.registration_number || null, microchip_number: f.microchip_number || null, dob_approximate: f.dob_approximate, temper: f.temper || null, groom_style: f.groom_style || null, groom_notes: null };
      if (profiles[0]) await data.update<PetProfileRow>('pet_profiles', profiles[0].id, prof); else await data.insert<PetProfileRow>('pet_profiles', prof);
      // vaccine rows (R-X65)
      const verifier = can('vaccines.verify');
      for (const v of vax) {
        const hasDates = !!v.vaccinated;
        const status = !hasDates ? 'missing' : v.expires && v.expires < todayIso() ? 'expired' : v.file && verifier ? 'verified' : v.recordId && v.status === 'verified' && !v.file ? 'submitted' : v.recordId && ['verified', 'submitted', 'rejected'].includes(v.status) && v.file ? (v.status === 'rejected' ? 'submitted' : v.status) : 'submitted';
        const patch: Partial<VaccineRecordRow> = { pet_id: pet.id, vaccine_type_id: v.typeId, vaccinated_on: v.vaccinated || null, expires_on: v.expires || (v.vaccinated ? plusYear(v.vaccinated) : null), proof_url: v.file?.url ?? null, proof_name: v.file?.name ?? null, status, note: v.reference || null, verified_by: status === 'verified' ? user.id : null, verified_at: status === 'verified' ? new Date().toISOString() : null };
        if (v.recordId) await data.update<VaccineRecordRow>('vaccine_records', v.recordId, patch); else if (hasDates || v.file) await data.insert<VaccineRecordRow>('vaccine_records', patch);
      }
      for (const file of files.filter((x) => !existingFiles.some((e) => e.url === x.url))) await data.insert<AttachmentRow>('attachments', { subject_table: 'pets', subject_id: pet.id, name: file.name, url: file.url, size_bytes: file.size_bytes, mime: file.mime, uploaded_by: user.id });
      for (const gone of existingFiles.filter((e) => !files.some((x) => x.url === e.url))) await data.remove('attachments', gone.id);
      const settled = await settleVaccineStatus(data, pet.id, user, locationId);
      setSaving(false);
      toast({ tone: 'success', title: existing ? `${pet.name} updated` : `${pet.name} added`, body: settled.petApproved ? `Approved: every required vaccine is verified${settled.bookingsConfirmed.length ? ` · confirmed ${settled.bookingsConfirmed.join(', ')}` : ''}` : undefined });
      const ret = q.get('return');
      if (ret) { const url = new URL(ret, 'http://x'); url.searchParams.set('pet', pet.id); nav(`${url.pathname}${url.search}`); } else nav(`/desk/pets/${pet.id}`);
    } catch (err) { setSaving(false); toast({ tone: 'danger', title: 'Could not save', body: String(err) }); }
  };
  const readOnly = !can('pets.write');
  const summaryPreview = existing ? petVaccineSummary(existing.id, vaccineRecords, vaccineTypes) : null;
  return (
    <div className="page stack">
      <PageHeader code="F-54" title={existing ? `Edit ${existing.name}` : 'Pet details'} backTo={existing ? `/desk/pets/${existing.id}` : q.get('return') ?? (f.customer_id ? `/desk/customers/${f.customer_id}` : '/desk/pets')} subtitle="Required: owner, name, type, sex (R-C01). Id is generated; breed can be Mixed; DOB can be approximate (R-C06)." />
      <Section title="Owner & identity">
        <div className="fgp-form-grid">
          <Select className="span-2" label="Owner" required placeholder="Choose the customer" value={f.customer_id} onChange={set('customer_id')} options={[...customers].filter((c) => c.status === 'active' || c.id === f.customer_id).sort((a, b) => a.last_name.localeCompare(b.last_name)).map((c) => ({ value: c.id, label: `${c.last_name}, ${c.first_name} · ${c.mobile}` }))} error={errors.customer_id} hint={owner ? <span>Pet of {fullName(owner)} · <button type="button" className="xs" style={{ border: 0, background: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }} onClick={() => nav(`/desk/customers/new?return=${encodeURIComponent('/desk/pets/new')}`)}>new customer</button></span> : undefined} />
          <Input label="Id" value={existing?.id ?? 'Generated on save'} readOnly disabled hint="System-generated (R-J03)" />
          <Select label="Status" value={f.status} onChange={set('status')} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          <Input label="Pet name" required value={f.name} onChange={set('name')} error={errors.name} placeholder="Name" />
          <Input label="Type" required value={f.type} onChange={set('type')} error={errors.type} placeholder="Dog" hint="Default pet type from settings" />
          <Select label="Sex" required placeholder="Sex" value={f.sex} onChange={set('sex')} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} error={errors.sex} />
          <Checkbox className="field-check" label="Neutered / spayed" checked={f.neutered} onChange={(e) => setF((s) => ({ ...s, neutered: e.target.checked }))} />
        </div>
      </Section>
      <Section title="Traits">
        <div className="fgp-form-grid">
          <div className="span-2"><DeskLookupSelect kind="breed" label="Breed" value={f.breed} onChange={(v) => setF((s) => ({ ...s, breed: v }))} placeholder="Choose a breed" /></div>
          <Checkbox className="field-check" label="Mixed" checked={f.is_mixed} onChange={(e) => setF((s) => ({ ...s, is_mixed: e.target.checked }))} />
          <Input label="Weight (lb)" type="number" inputMode="decimal" min={0} step={0.5} value={f.weight_lbs} onChange={set('weight_lbs')} error={errors.weight_lbs} suffix="lb" hint={autoSize ? `Auto size: ${sizeLabel[autoSize]}` : 'Weight drives the spa size (R-G01)'} />
          <Select label="Size" placeholder={autoSize ? `Auto (${sizeLabel[autoSize]})` : 'From weight'} value={f.size} onChange={set('size')} options={PET_SIZES.map((s) => ({ value: s, label: sizeLabel[s] }))} hint="Override only for coat / build" />
          <DeskLookupSelect kind="color" label="Color" value={f.color} onChange={(v) => setF((s) => ({ ...s, color: v }))} placeholder="Color" />
          <DeskLookupSelect kind="temper" label="Temper" value={f.temper} onChange={(v) => setF((s) => ({ ...s, temper: v }))} placeholder="Temper" />
          <Input label="Date of birth" type="date" value={f.date_of_birth} onChange={set('date_of_birth')} max={todayIso()} />
          <Checkbox className="field-check" label="Approximate age" checked={f.dob_approximate} onChange={(e) => setF((s) => ({ ...s, dob_approximate: e.target.checked }))} />
          <div className="span-2"><DeskLookupSelect kind="vet" label="Vet" value={f.vet_id} onChange={(v) => setF((s) => ({ ...s, vet_id: v }))} placeholder="Choose or add a vet" /></div>
          <Input label="Registration number" value={f.registration_number} onChange={set('registration_number')} placeholder="License / registration" />
          <Input label="Microchip number" value={f.microchip_number} onChange={set('microchip_number')} placeholder="15-digit chip id" inputMode="numeric" />
          <Input className="span-2" label="Groom style" value={f.groom_style} onChange={set('groom_style')} placeholder="Saved style used to prefill groom bookings" />
          <div className="span-2">
            <span className="xs muted" style={{ display: 'block', marginBottom: 6 }}>Attributes (staff instructions, R-A13)</span>
            <div className="fgp-taglist">{ATTRIBUTE_OPTIONS.map((a) => <Chip key={a} size="sm" selected={attributes.includes(a)} onClick={() => setAttributes((l) => (l.includes(a) ? l.filter((x) => x !== a) : [...l, a]))}>{a}</Chip>)}</div>
          </div>
          <Input className="span-2" label="Medical conditions" value={f.medical_conditions} onChange={set('medical_conditions')} placeholder="e.g. Hip dysplasia; no stairs" />
          <Input className="span-2" label="Allergies" value={f.allergies} onChange={set('allergies')} placeholder="e.g. Chicken" />
        </div>
      </Section>
      <Section title="Vaccination" description={can('vaccines.verify') ? 'Dates + certificate entered by you are saved as verified (you hold the paper, R-X65); dates without a certificate stay "submitted"; empty = missing.' : 'Dates and certificates are saved for a verifier to check.'}>
        {summaryPreview && <div className="row wrap xs muted" style={{ marginBottom: 8 }}>Current standing: <Badge size="sm" tone={summaryPreview.overall === 'ok' ? 'success' : 'warn'}>{summaryPreview.overall}</Badge></div>}
        <div className="fgp-vaxrow" style={{ fontWeight: 600, fontSize: 12, color: 'var(--color-text-muted)' }}><span>Type</span><span>Vaccinated</span><span>Expires</span><span>Reference</span><span>Certificate</span></div>
        {vax.map((v, i) => { const t = types.find((x) => x.id === v.typeId) as VaccineTypeRow | undefined; if (!t) return null; return (
          <div className="fgp-vaxrow" key={v.typeId}>
            <span className="row wrap" style={{ gap: 6, alignSelf: 'center' }}><strong>{t.name}</strong>{t.required ? <Badge size="sm" tone="primary">required</Badge> : <span className="xs muted">recommended</span>}{v.recordId && <Badge size="sm">{v.status}</Badge>}</span>
            <Input type="date" aria-label={`${t.name} vaccinated on`} value={v.vaccinated} max={todayIso()} onChange={(e) => setVax((l) => l.map((x, j) => (j === i ? { ...x, vaccinated: e.target.value, expires: x.expires || plusYear(e.target.value) } : x)))} />
            <Input type="date" aria-label={`${t.name} expires on`} value={v.expires} onChange={(e) => setVax((l) => l.map((x, j) => (j === i ? { ...x, expires: e.target.value } : x)))} error={errors[`vax_${v.typeId}`]} />
            <Input aria-label={`${t.name} reference`} placeholder="Lot / clinic" value={v.reference} onChange={(e) => setVax((l) => l.map((x, j) => (j === i ? { ...x, reference: e.target.value } : x)))} />
            {v.file ? <span className="row" style={{ gap: 6, alignSelf: 'center' }}><Icon name="book" size={14} /><span className="xs" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.file.name}</span><Button size="sm" variant="ghost" icon="close" aria-label="Remove certificate" onClick={() => setVax((l) => l.map((x, j) => (j === i ? { ...x, file: null } : x)))} /></span>
              : <CertUpload label={t.name} onFile={(file) => setVax((l) => l.map((x, j) => (j === i ? { ...x, file } : x)))} />}
          </div>); })}
      </Section>
      <Section title="Note & attachment">
        <div className="fgp-form-grid">
          <Textarea className="span-4" label="Note" maxLength={100} showCount value={f.note} onChange={set('note')} error={errors.note} placeholder="Short note (100 chars)" />
          <div className="span-4"><DeskAttachmentDropzone files={files} onChange={setFiles} label="Attachment (photos, vet letters)" /></div>
        </div>
      </Section>
      <div className="fgp-form-foot">
        <Button variant="secondary" onClick={() => nav(existing ? `/desk/pets/${existing.id}` : q.get('return') ?? '/desk/pets')}>Cancel</Button>
        <Button onClick={submit} loading={saving} disabled={readOnly} icon="check">{existing ? 'Save changes' : 'Add pet'}</Button>
      </div>
    </div>
  );
}
