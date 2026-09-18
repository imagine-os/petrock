import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation as useRouterLocation } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Section } from '../../../components/molecule/Section/Section';
import { Input } from '../../../components/atom/Input/Input';
import { Select } from '../../../components/atom/Select/Select';
import { Checkbox } from '../../../components/atom/Checkbox/Checkbox';
import { Textarea } from '../../../components/atom/Textarea/Textarea';
import { Button } from '../../../components/atom/Button/Button';
import { Chip } from '../../../components/atom/Chip/Chip';
import { DeskLookupSelect } from '../../../components/molecule/DeskLookupSelect/DeskLookupSelect';
import { DeskAttachmentDropzone, type DeskAttachmentFile } from '../../../components/molecule/DeskAttachmentDropzone/DeskAttachmentDropzone';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useRow, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { LocationRow } from '../../../data/schema/core';
import type { AttachmentRow, CustomerProfileRow } from '../../../data/schema/frontdesk-grooming-people';
import { todayIso, writeAudit, type CustomerFull } from '../lib';
import '../module.css';

const US_STATES = ['CA', 'AZ', 'NV', 'OR', 'WA', 'NY', 'TX', 'FL', 'CO', 'IL', 'Other'];
const CONTACT = [{ value: 'mobile', label: 'Mobile number' }, { value: 'email', label: 'Email' }, { value: 'home', label: 'Home phone' }, { value: 'work', label: 'Work phone' }, { value: 'text', label: 'Text message' }];

/** F-51 Add / edit customer (Figma Customer Details). */
export function CustomerFormPage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { id } = useParams();
  const { search } = useRouterLocation();
  const returnTo = useMemo(() => new URLSearchParams(search).get('return'), [search]);
  const { user, can } = useSession();
  const { locationId } = useLocation();
  const existing = useRow<CustomerFull>('customers', id);
  const { rows: profiles } = useTable<CustomerProfileRow>('customer_profiles', { where: { customer_id: id ?? '__none__' } });
  const { rows: locations } = useTable<LocationRow>('locations');
  const { rows: existingFiles } = useTable<AttachmentRow>('attachments', { where: { subject_table: 'customers', subject_id: id ?? '__none__' } });
  const [f, setF] = useState({ title: '', first_name: '', last_name: '', status: 'active', address: '', apt_suite: '', city: '', state: 'CA', zip: '', mobile: '', email: '', home_phone: '', work_phone: '', alt_phone: '', alt_contact: '', preferred_contact: 'mobile', reference: '', home_location_id: locationId, marketing_opt_in: true, note: '', customer_since: todayIso() });
  const [attributes, setAttributes] = useState<string[]>([]);
  const [attrDraft, setAttrDraft] = useState('');
  const [files, setFiles] = useState<DeskAttachmentFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  useEffect(() => {
    if (!existing || loaded) return;
    const p = profiles[0];
    setF((s) => ({ ...s, title: p?.title ?? '', first_name: existing.first_name, last_name: existing.last_name, status: existing.status, address: existing.address ?? '', apt_suite: existing.apt_suite ?? '', city: existing.city ?? '', state: existing.state ?? 'CA', zip: existing.zip ?? '', mobile: existing.mobile, email: existing.email, home_phone: p?.home_phone ?? '', work_phone: p?.work_phone ?? '', alt_phone: existing.alt_phone ?? '', alt_contact: p?.alt_contact ?? '', preferred_contact: existing.preferred_contact ?? 'mobile', reference: p?.reference ?? '', home_location_id: existing.home_location_id ?? locationId, marketing_opt_in: existing.marketing_opt_in, note: existing.note ?? '', customer_since: p?.customer_since ?? existing.created_at.slice(0, 10) }));
    setAttributes(p?.attributes ?? []); setFiles(existingFiles.map((a) => ({ name: a.name, size_bytes: a.size_bytes, mime: a.mime, url: a.url }))); setLoaded(true);
  }, [existing, profiles, existingFiles, loaded, locationId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.first_name.trim()) e.first_name = 'Required'; if (!f.last_name.trim()) e.last_name = 'Required';
    if (!f.city.trim()) e.city = 'Town / city is required'; if (!f.state) e.state = 'Required';
    if (!/^\+?[\d\s()-]{7,}$/.test(f.mobile)) e.mobile = 'Enter a phone number'; if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Enter a valid email';
    if (f.note.length > 100) e.note = '100 characters max';
    setErrors(e); return Object.keys(e).length === 0;
  };
  const submit = async () => {
    if (!validate()) { toast({ tone: 'warn', title: 'Please fix the highlighted fields' }); return; }
    setSaving(true);
    try {
      const core: Partial<CustomerFull> = { first_name: f.first_name.trim(), last_name: f.last_name.trim(), email: f.email.trim(), mobile: f.mobile.trim(), alt_phone: f.alt_phone || null, address: f.address || null, apt_suite: f.apt_suite || null, city: f.city, state: f.state, zip: f.zip || null, status: f.status, preferred_contact: f.preferred_contact, home_location_id: f.home_location_id || null, marketing_opt_in: f.marketing_opt_in, note: f.note || null } as Partial<CustomerFull>;
      let row: CustomerFull;
      if (existing) { row = await data.update<CustomerFull>('customers', existing.id, core); await writeAudit(data, user, 'update', 'customers', row.id, { fields: Object.keys(core) }, locationId); }
      else { row = await data.insert<CustomerFull>('customers', { ...core, user_id: null, balance: 0 } as Partial<CustomerFull>); await writeAudit(data, user, 'insert', 'customers', row.id, { name: `${row.first_name} ${row.last_name}` }, locationId); }
      const prof: Partial<CustomerProfileRow> = { customer_id: row.id, title: f.title || null, home_phone: f.home_phone || null, work_phone: f.work_phone || null, alt_contact: f.alt_contact || null, reference: f.reference || null, attributes: attributes.length ? attributes : null, customer_since: f.customer_since || null };
      if (profiles[0]) await data.update<CustomerProfileRow>('customer_profiles', profiles[0].id, prof); else await data.insert<CustomerProfileRow>('customer_profiles', prof);
      for (const file of files.filter((x) => !existingFiles.some((e) => e.url === x.url))) await data.insert<AttachmentRow>('attachments', { subject_table: 'customers', subject_id: row.id, name: file.name, url: file.url, size_bytes: file.size_bytes, mime: file.mime, uploaded_by: user.id });
      for (const gone of existingFiles.filter((e) => !files.some((x) => x.url === e.url))) await data.remove('attachments', gone.id);
      setSaving(false);
      toast({ tone: 'success', title: existing ? 'Customer updated' : 'Customer added', body: `${row.first_name} ${row.last_name}` });
      if (returnTo) { const url = new URL(returnTo, 'http://x'); url.searchParams.set('customer', row.id); nav(`${url.pathname}${url.search}`); }
      else nav(`/desk/customers/${row.id}`);
    } catch (err) { setSaving(false); toast({ tone: 'danger', title: 'Could not save', body: String(err) }); }
  };
  const readOnly = !can('customers.write');
  return (
    <div className="page stack">
      <PageHeader code="F-51" title={existing ? `Edit ${existing.first_name} ${existing.last_name}` : 'Customer details'} backTo={existing ? `/desk/customers/${existing.id}` : returnTo ?? '/desk/customers'} subtitle="Required: name, town / city, state, mobile and email (R-J01). Lists with a + can be extended inline (R-J04)." />
      <Section title="Identity">
        <div className="fgp-form-grid">
          <DeskLookupSelect kind="customer_title" label="Title" value={f.title} onChange={(v) => setF((s) => ({ ...s, title: v }))} placeholder="Mr. / Ms." />
          <Input label="First name" required value={f.first_name} onChange={set('first_name')} error={errors.first_name} placeholder="Name" autoComplete="off" />
          <Input label="Last name" required value={f.last_name} onChange={set('last_name')} error={errors.last_name} placeholder="Name" autoComplete="off" />
          <Select label="Status" value={f.status} onChange={set('status')} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </div>
      </Section>
      <Section title="Address">
        <div className="fgp-form-grid">
          <Input className="span-2" label="Address" value={f.address} onChange={set('address')} placeholder="Street and number" autoComplete="off" />
          <Input label="Apt / suite" value={f.apt_suite} onChange={set('apt_suite')} />
          <Input label="Zip" value={f.zip} onChange={set('zip')} placeholder="Zip" inputMode="numeric" />
          <div className="span-2"><DeskLookupSelect kind="city" label="Town / city" required value={f.city} onChange={(v) => setF((s) => ({ ...s, city: v }))} placeholder="City name" error={errors.city} /></div>
          <Select label="State" required value={f.state} onChange={set('state')} options={US_STATES.map((s) => ({ value: s, label: s }))} error={errors.state} />
          <Select label="Home location" value={f.home_location_id} onChange={set('home_location_id')} options={locations.map((l) => ({ value: l.id, label: l.short_name }))} hint="Where they usually come" />
        </div>
      </Section>
      <Section title="Contacts">
        <div className="fgp-form-grid">
          <Input label="Mobile" required type="tel" value={f.mobile} onChange={set('mobile')} error={errors.mobile} placeholder="Mobile number" icon="phone" />
          <Input label="Email" required type="email" value={f.email} onChange={set('email')} error={errors.email} placeholder="Email address" icon="message" />
          <Input label="Home phone" type="tel" value={f.home_phone} onChange={set('home_phone')} placeholder="Home phone" />
          <Input label="Work phone" type="tel" value={f.work_phone} onChange={set('work_phone')} placeholder="Work phone" />
          <Input label="Alternative phone" type="tel" value={f.alt_phone} onChange={set('alt_phone')} />
          <Input label="Alternative contact" value={f.alt_contact} onChange={set('alt_contact')} placeholder="Name of another person to call" />
          <Select label="Preferred contact method" value={f.preferred_contact} onChange={set('preferred_contact')} options={CONTACT} />
          <Input type="date" label="Customer since" value={f.customer_since} onChange={set('customer_since')} />
        </div>
      </Section>
      <Section title="Preferences & note">
        <div className="fgp-form-grid">
          <div className="span-2"><DeskLookupSelect kind="reference" label="Reference" value={f.reference} onChange={(v) => setF((s) => ({ ...s, reference: v }))} placeholder="How did they hear about us?" /></div>
          <div className="span-2">
            <DeskLookupSelect kind="attribute" label="Attributes" value={attrDraft} onChange={(v) => { setAttrDraft(''); if (v && !attributes.includes(v)) setAttributes((l) => [...l, v]); }} placeholder="Add an attribute" />
            {attributes.length > 0 && <div className="fgp-taglist" style={{ marginTop: 8 }}>{attributes.map((a) => <Chip key={a} size="sm" selected onRemove={() => setAttributes((l) => l.filter((x) => x !== a))}>{a}</Chip>)}</div>}
          </div>
          <Checkbox className="span-2 field-check" label="Send reminders & marketing messages" description="Legacy default: on (R-J07)" checked={f.marketing_opt_in} onChange={(e) => setF((s) => ({ ...s, marketing_opt_in: e.target.checked }))} />
          <Textarea className="span-4" label="Note" maxLength={100} showCount value={f.note} onChange={set('note')} error={errors.note} placeholder="Short headline note (100 chars). Longer notes live on the customer page." />
          <div className="span-4"><DeskAttachmentDropzone files={files} onChange={setFiles} /></div>
        </div>
      </Section>
      <div className="fgp-form-foot">
        <Button variant="secondary" onClick={() => nav(existing ? `/desk/customers/${existing.id}` : returnTo ?? '/desk/customers')}>Cancel</Button>
        <Button onClick={submit} loading={saving} disabled={readOnly} icon="check">{existing ? 'Save changes' : 'Add customer'}</Button>
      </div>
    </div>
  );
}
