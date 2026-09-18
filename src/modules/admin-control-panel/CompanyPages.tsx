/** A-10 Company & locations, A-11 Location detail, A-41 Add location. Location = a locations row + capacities (R-X46). */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData, useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import type { LocationRow, CapacityRow, SettingRow, RoomRow, EmployeeRow } from '../../data/schema/core';
import { company as COMPANY_DEFAULT } from '../../tenant/locations';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Input } from '../../components/atom/Input/Input';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Stepper } from '../../components/molecule/Stepper/Stepper';
import { Section } from '../../components/molecule/Section/Section';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { AdminRecordDrawer, type AdminField } from '../../components/organism/AdminRecordDrawer/AdminRecordDrawer';
import { AdminHoursGrid, summarizeHours, type WeekHours } from '../../components/molecule/AdminHoursGrid/AdminHoursGrid';
import { AdminMeter } from '../../components/molecule/AdminMeter/AdminMeter';
import { PinApprovalModal, type PinApprovalRequest } from '../../components/organism/PinApprovalModal/PinApprovalModal';
import { CrudTable } from './CrudTable';
import { useAdminCrud } from './lib';
import './admin.css';

const CAP_KINDS = ['penthouse', 'suite', 'daycare', 'grooming'] as const;
const CAP_LABEL: Record<string, string> = { penthouse: 'Penthouses', suite: 'Suites', daycare: 'Daycare', grooming: 'Groomers' };
const DEFAULT_HOURS: WeekHours = { 0: { open: '09:00', close: '17:30' }, 1: { open: '07:00', close: '19:00' }, 2: { open: '07:00', close: '19:00' }, 3: { open: '07:00', close: '19:00' }, 4: { open: '07:00', close: '19:00' }, 5: { open: '07:00', close: '19:00' }, 6: { open: '09:00', close: '17:30' } };
interface CompanyProfile { name: string; legal_name: string; address: string; city: string; state: string; zip: string; country: string; phone: string; email: string; website: string; tagline: string }
const COMPANY_FIELDS: AdminField[] = [
  { key: 'name', label: 'Company name', required: true }, { key: 'legal_name', label: 'Legal name' }, { key: 'address', label: 'Address', required: true, full: true }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }, { key: 'zip', label: 'Zip' }, { key: 'country', label: 'Country' },
  { key: 'phone', label: 'Phone', type: 'tel' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'website', label: 'Website', type: 'url' }, { key: 'tagline', label: 'Tagline (invoice footer)', full: true },
];
export function useCompanyProfile(): { row: SettingRow | null; profile: CompanyProfile } {
  const { rows } = useTable<SettingRow>('settings', { where: { key: 'company' } });
  const row = rows[0] ?? null;
  const profile = useMemo<CompanyProfile>(() => ({ name: COMPANY_DEFAULT.name, legal_name: COMPANY_DEFAULT.legalName, address: '17401 Ventura Blvd', city: 'Encino', state: 'CA', zip: '91316', country: 'United States', phone: '+1 (818) 555-0142', email: 'hello@petrockhotel.com', website: COMPANY_DEFAULT.website, tagline: COMPANY_DEFAULT.tagline, ...((row?.value as Partial<CompanyProfile>) ?? {}) }), [row]);
  return { row, profile };
}

/** A-10 */
export function CompanyPage() {
  const { rows: locations } = useTable<LocationRow>('locations', { orderBy: { column: 'sort_order' } });
  const { rows: capacities } = useTable<CapacityRow>('capacities');
  const { rows: rooms } = useTable<RoomRow>('rooms');
  const { rows: employees } = useTable<EmployeeRow>('employees');
  const { row: companyRow, profile } = useCompanyProfile();
  const { can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const [editCompany, setEditCompany] = useState(false);
  const writable = can('locations.write');
  const saveCompany = async (values: Record<string, unknown>) => {
    const value = crud.clean(values, COMPANY_FIELDS.map((f) => f.key));
    if (companyRow) await crud.update('settings', companyRow.id, { value }); else await crud.insert('settings', { key: 'company', value, description: 'Company profile (A-10)' });
    toast({ tone: 'success', title: 'Company saved' });
  };
  return (
    <div className="page stack">
      <PageHeader code="A-10" title="Company & locations" subtitle="Who you are and where you operate. Every other table is scoped by location; adding one here is the whole flow (R-K01..K04, R-X46)." actions={writable ? <Link to="/admin/locations/new"><Button icon="plus">Add location</Button></Link> : undefined} />
      <Card padding="md" header={<div className="acp-card-title"><h3>{profile.name}</h3>{writable && <Button size="sm" variant="secondary" icon="edit" onClick={() => setEditCompany(true)}>Edit company</Button>}</div>}>
        <div className="acp-form-grid">
          <div><span className="eyebrow">Legal name</span><div>{profile.legal_name}</div></div>
          <div><span className="eyebrow">Address</span><div>{profile.address}, {profile.city}, {profile.state} {profile.zip}</div></div>
          <div><span className="eyebrow">Contact</span><div>{profile.phone} · {profile.email}</div></div>
          <div><span className="eyebrow">Website · tagline</span><div>{profile.website} · <em>{profile.tagline}</em></div></div>
        </div>
      </Card>
      <Section title={`Locations (${locations.length})`} description="Hours, capacities, rooms and staff per store. Open a location to edit it.">
        {locations.length === 0 ? <EmptyState title="No locations yet" action={<Link to="/admin/locations/new"><Button icon="plus">Add location</Button></Link>} /> : (
          <div className="acp-loc-grid">
            {locations.map((l) => {
              const caps = capacities.filter((c) => c.location_id === l.id);
              return (
                <Card key={l.id} padding="md" interactive header={<div className="acp-loc-head"><div><h3>{l.name}</h3><p className="acp-note">{l.address}</p></div><Badge tone={l.active ? 'success' : 'neutral'}>{l.active ? 'active' : 'inactive'}</Badge></div>} footer={<><Link to={`/admin/locations/${l.id}`}><Button size="sm" variant="secondary" icon="edit">Open</Button></Link><span className="acp-note">{rooms.filter((r) => r.location_id === l.id && r.active).length} rooms · {employees.filter((e) => e.location_id === l.id && e.status === 'active').length} active staff</span></>}>
                  <div className="stack-sm">
                    <p className="xs"><strong>Hours</strong> · {summarizeHours(l.hours ?? {})}</p>
                    <div className="acp-caps">{CAP_KINDS.map((k) => <div key={k} className="acp-cap"><strong>{caps.find((c) => c.kind === k)?.max_simultaneous ?? '—'}</strong>{CAP_LABEL[k]}</div>)}</div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
      <AdminRecordDrawer open={editCompany} onClose={() => setEditCompany(false)} title="Company profile" fields={COMPANY_FIELDS} initial={{ ...profile, id: companyRow?.id ?? 'company' }} onSave={saveCompany} saveLabel="Save company" />
    </div>
  );
}

/** A-11 Location detail: identity, hours, capacities, holidays, danger zone. */
export function LocationPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const data = useData();
  const { rows } = useTable<LocationRow>('locations', { where: { id } });
  const loc = rows[0];
  const { rows: capacities } = useTable<CapacityRow>('capacities', { where: { location_id: id } });
  const { rows: rooms } = useTable<RoomRow>('rooms', { where: { location_id: id } });
  const { can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const [hours, setHours] = useState<WeekHours>({});
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState<PinApprovalRequest | null>(null);
  useEffect(() => { if (loc && !dirty) setHours(loc.hours ?? {}); }, [loc, dirty]);
  const writable = can('locations.write');
  if (!loc) return <div className="page"><EmptyState title="Location not found" action={<Link to="/admin/company"><Button variant="secondary">Back</Button></Link>} /></div>;
  const saveHours = async () => { await crud.update('locations', loc.id, { hours }); setDirty(false); toast({ tone: 'success', title: 'Hours saved', body: summarizeHours(hours) }); };
  const setCap = async (kind: string, n: number) => { const c = capacities.find((x) => x.kind === kind); if (c) await crud.update('capacities', c.id, { max_simultaneous: n }); else await crud.insert('capacities', { location_id: loc.id, kind, max_simultaneous: n, note: null }); };
  const fields: AdminField[] = [{ key: 'name', label: 'Name', required: true }, { key: 'short_name', label: 'Short name', required: true }, { key: 'slug', label: 'Slug', required: true, hint: 'lowercase, no spaces', validate: (v) => (/^[a-z0-9-]+$/.test(String(v ?? '')) ? null : 'lowercase letters, digits, dashes') }, { key: 'city', label: 'City', required: true }, { key: 'address', label: 'Address', required: true, full: true }, { key: 'phone', label: 'Phone', type: 'tel' }, { key: 'timezone', label: 'Timezone', required: true }, { key: 'note', label: 'Note', type: 'textarea', maxLength: 100 }, { key: 'active', label: 'Active', type: 'toggle' }];
  return (
    <div className="page stack">
      <PageHeader code="A-11" title={loc.name} subtitle={`${loc.address} · ${loc.timezone}`} backTo="/admin/company" eyebrow={<Badge tone={loc.active ? 'success' : 'neutral'}>{loc.active ? 'active' : 'inactive'}</Badge>} actions={writable ? <Button variant="secondary" icon="edit" onClick={() => setEditing(true)}>Edit details</Button> : undefined} />
      <div className="acp-two-even">
        <Card padding="md" header={<div className="acp-card-title"><h3>Opening hours</h3>{writable && <Button size="sm" onClick={saveHours} disabled={!dirty}>Save hours</Button>}</div>}>
          <AdminHoursGrid value={hours} onChange={(v) => { setHours(v); setDirty(true); }} readOnly={!writable} />
        </Card>
        <div className="stack">
          <Card padding="md" header={<div><h3>Capacities</h3><p className="acp-note">Max simultaneous bookings per kind (R-E10..E13). Rooms below count against penthouse / suite.</p></div>}>
            <div className="acp-form-grid">
              {CAP_KINDS.map((k) => { const c = capacities.find((x) => x.kind === k); const roomCount = rooms.filter((r) => r.active && (k === 'penthouse' ? r.room_type_id === 'rt_penthouse' : k === 'suite' ? r.room_type_id === 'rt_suite' : false)).length; return <Input key={k} label={CAP_LABEL[k]} type="number" min={0} value={c?.max_simultaneous ?? 0} disabled={!writable} onChange={(e) => setCap(k, Math.max(0, Number(e.target.value) || 0))} hint={k === 'penthouse' || k === 'suite' ? `${roomCount} rooms defined` : k === 'grooming' ? 'groomers working at once' : 'dogs per day'} />; })}
            </div>
            {capacities.find((c) => c.kind === 'penthouse')?.note ? <p className="acp-note" style={{ marginTop: 8 }}>{String(capacities.find((c) => c.kind === 'penthouse')!.note)}</p> : null}
          </Card>
          <Card padding="md" header={<h3>Rooms</h3>}>
            <div className="stack-sm">
              <AdminMeter label="Penthouse rooms" value={rooms.filter((r) => r.active && r.room_type_id === 'rt_penthouse').length} max={capacities.find((c) => c.kind === 'penthouse')?.max_simultaneous ?? 0} hint="defined of capacity" warnAt={101} dangerAt={101} />
              <AdminMeter label="Suite rooms" value={rooms.filter((r) => r.active && r.room_type_id === 'rt_suite').length} max={capacities.find((c) => c.kind === 'suite')?.max_simultaneous ?? 0} hint="defined of capacity" warnAt={101} dangerAt={101} />
              <Link to="/admin/rooms" className="xs">Manage rooms</Link>
            </div>
          </Card>
        </div>
      </div>
      <CrudTable table="holidays" title="Holidays & closures" description="Holiday dates exclude long-stay discounts (R-E15); boarding closed blocks check-in / check-out." where={{ location_id: id }} orderBy={{ column: 'date' }} permission="locations.write" defaults={() => ({ location_id: id, is_holiday: true, boarding_closed: false })} rowLabel={(h) => String(h.name)}
        columns={[{ key: 'date', label: 'Date' }, { key: 'name', label: 'Name' }, { key: 'is_holiday', label: 'Holiday' }, { key: 'boarding_closed', label: 'Boarding closed' }]}
        fields={[{ key: 'date', label: 'Date', type: 'date', required: true }, { key: 'name', label: 'Name', required: true }, { key: 'is_holiday', label: 'Holiday (no long-stay discount)', type: 'toggle' }, { key: 'boarding_closed', label: 'Boarding closed', type: 'toggle' }]} />
      {writable && <Card padding="md" header={<h3>Danger zone</h3>}><div className="row wrap"><Button variant="danger" icon="trash" onClick={() => setPin({ action: 'location.delete', title: 'Delete this location?', description: 'Everything scoped to it (rooms, bookings, staff) keeps its location_id and becomes orphaned. Needs a manager or owner PIN.', subjectTable: 'locations', subjectId: loc.id })}>Delete location</Button><span className="acp-note">Prefer marking it inactive. Deleting needs a manager PIN (R-X42).</span></div></Card>}
      <AdminRecordDrawer open={editing} onClose={() => setEditing(false)} title="Location details" fields={fields} initial={loc as unknown as Record<string, unknown>} onSave={async (v) => { await crud.update('locations', loc.id, crud.clean(v, fields.map((f) => f.key))); toast({ tone: 'success', title: 'Location saved' }); }} />
      <PinApprovalModal open={!!pin} request={pin} onClose={() => setPin(null)} onApproved={async (a) => { setPin(null); for (const c of capacities) await data.remove('capacities', c.id); await crud.remove('locations', loc.id, a.id); toast({ tone: 'warn', title: 'Location deleted' }); navigate('/admin/company'); }} />
    </div>
  );
}

/** A-41 Add location: 3-step flow -> locations row + 4 capacities rows. */
export function AddLocationPage() {
  const navigate = useNavigate();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const { rows: locations } = useTable<LocationRow>('locations');
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: 'Petrock ', short_name: '', slug: '', city: '', address: '', phone: '', timezone: 'America/Los_Angeles', note: '', active: true });
  const [hours, setHours] = useState<WeekHours>(DEFAULT_HOURS);
  const [caps, setCaps] = useState<Record<string, number>>({ penthouse: 12, suite: 20, daycare: 15, grooming: 2 });
  const [busy, setBusy] = useState(false);
  const slugTaken = locations.some((l) => l.slug === f.slug);
  const step0ok = f.name.trim().length > 3 && f.short_name.trim() && /^[a-z0-9-]+$/.test(f.slug) && !slugTaken && f.city.trim() && f.address.trim();
  const auto = (short: string) => setF((s) => ({ ...s, short_name: short, name: `Petrock ${short}`.trim(), slug: short.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));
  const create = async () => {
    setBusy(true);
    try {
      const loc = await crud.insert<LocationRow>('locations', { name: f.name.trim(), short_name: f.short_name.trim(), slug: f.slug, city: f.city.trim(), address: f.address.trim(), phone: f.phone || null, timezone: f.timezone, hours, sort_order: locations.length, active: f.active, note: f.note || null } as Partial<LocationRow>);
      for (const k of CAP_KINDS) await crud.insert('capacities', { location_id: loc.id, kind: k, max_simultaneous: caps[k] ?? 0, note: null });
      toast({ tone: 'success', title: 'Location added', body: `${loc.name} is ready; add rooms and staff next.` });
      navigate(`/admin/locations/${loc.id}`);
    } finally { setBusy(false); }
  };
  return (
    <div className="page stack">
      <PageHeader code="A-41" title="Add a location" subtitle="One flow, no code: a new locations row plus its four capacities. Rooms, rates and staff follow from their own pages." backTo="/admin/company" />
      <Card padding="lg">
        <div className="stack">
          <Stepper steps={['Details', 'Hours', 'Capacities', 'Review']} current={step} onStepClick={(i) => { if (i < step) setStep(i); }} />
          {step === 0 && <div className="acp-form-grid">
            <Input label="Short name *" value={f.short_name} onChange={(e) => auto(e.target.value)} placeholder="e.g. Santa Monica" hint="Shown in the top bar" />
            <Input label="Full name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <Input label="Slug *" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} error={f.slug && slugTaken ? 'Already used' : f.slug && !/^[a-z0-9-]+$/.test(f.slug) ? 'lowercase, digits, dashes' : undefined} />
            <Input label="City *" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Santa Monica, Los Angeles" />
            <div className="is-full"><Input label="Address *" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Street, City, CA 90000" /></div>
            <Input label="Phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <Input label="Timezone" value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })} />
            <div className="is-full"><Textarea label="Note" value={f.note} maxLength={100} showCount onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
            <Toggle label="Active (bookable) right away" checked={f.active} onChange={(v) => setF({ ...f, active: v })} />
          </div>}
          {step === 1 && <div className="stack-sm"><p className="acp-note">Opening hours per weekday (R-K04). Defaults match Encino and Westwood.</p><AdminHoursGrid value={hours} onChange={setHours} /></div>}
          {step === 2 && <div className="acp-form-grid">{CAP_KINDS.map((k) => <Input key={k} label={CAP_LABEL[k]} type="number" min={0} value={caps[k]} onChange={(e) => setCaps({ ...caps, [k]: Math.max(0, Number(e.target.value) || 0) })} hint={k === 'grooming' ? 'groomers at once' : k === 'daycare' ? 'dogs per day' : 'rooms (add them on Rooms after)'} />)}</div>}
          {step === 3 && <div className="stack-sm">
            <h3>{f.name}</h3><p className="muted small">{f.address} · {f.city} · {f.timezone}{f.phone ? ` · ${f.phone}` : ''}</p>
            <p className="xs"><strong>Hours</strong> · {summarizeHours(hours)}</p>
            <div className="acp-caps">{CAP_KINDS.map((k) => <div key={k} className="acp-cap"><strong>{caps[k]}</strong>{CAP_LABEL[k]}</div>)}</div>
            <p className="acp-note">Creates 1 locations row and 4 capacities rows, both audited. Status: {f.active ? 'active' : 'inactive'}.</p>
          </div>}
          <div className="row-between wrap">
            <Button variant="ghost" onClick={() => (step === 0 ? navigate('/admin/company') : setStep(step - 1))}>{step === 0 ? 'Cancel' : 'Back'}</Button>
            {step < 3 ? <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !step0ok} iconRight="arrow-right">Next</Button> : <Button onClick={create} loading={busy} icon="check">Create location</Button>}
          </div>
        </div>
      </Card>
    </div>
  );
}
