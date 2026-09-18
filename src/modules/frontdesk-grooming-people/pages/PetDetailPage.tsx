import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { Button } from '../../../components/atom/Button/Button';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { Badge, StatusBadge, toneFor } from '../../../components/atom/Badge/Badge';
import { Icon } from '../../../components/atom/Icon/Icon';
import { Textarea } from '../../../components/atom/Textarea/Textarea';
import { Input } from '../../../components/atom/Input/Input';
import { Modal } from '../../../components/organism/Modal/Modal';
import { CustomerSummaryCard } from '../../../components/molecule/CustomerSummaryCard/CustomerSummaryCard';
import { PetVaccineChip } from '../../../components/molecule/PetVaccineChip/PetVaccineChip';
import { GroomStatusBadge } from '../../../components/molecule/GroomStatusBadge/GroomStatusBadge';
import { PetVaccineVerifyTable, type VaccineVerifyRow } from '../../../components/organism/PetVaccineVerifyTable/PetVaccineVerifyTable';
import { DeskAttachmentDropzone } from '../../../components/molecule/DeskAttachmentDropzone/DeskAttachmentDropzone';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { PinApprovalModal, type PinApprovalRequest } from '../../../components/organism/PinApprovalModal/PinApprovalModal';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useRow, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { BookingRow, BookingPetRow, UserRow, VaccineRecordRow } from '../../../data/schema/core';
import type { AttachmentRow, PetProfileRow } from '../../../data/schema/frontdesk-grooming-people';
import type { BaseRow } from '../../../data/schema/types';
import { usePeople, useAppointments } from '../hooks';
import { ageOf, fmtDate, fmtDateTime, fmtMoney, fmtTime, fullName, petVaccineSummary, rejectVaccineRecord, settleVaccineStatus, sizeLabel, todayIso, verifyVaccineRecord, writeAudit, type PetFull } from '../lib';
import '../module.css';

type VetRow = BaseRow & { name: string; phone: string | null };

/** F-55 Pet detail with vaccine verification. */
export function PetDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { locationId } = useLocation();
  const pet = useRow<PetFull>('pets', id);
  const { customerById, vaccineRecords, vaccineTypes } = usePeople();
  const { views } = useAppointments();
  const { rows: profiles } = useTable<PetProfileRow>('pet_profiles', { where: { pet_id: id ?? '__none__' } });
  const { rows: vets } = useTable<VetRow>('vets');
  const { rows: users } = useTable<UserRow>('users');
  const { rows: bookingPets } = useTable<BookingPetRow>('booking_pets', { where: { pet_id: id ?? '__none__' } });
  const { rows: bookings } = useTable<BookingRow>('bookings');
  const { rows: files } = useTable<AttachmentRow>('attachments', { where: { subject_table: 'pets', subject_id: id ?? '__none__' } });
  const [reject, setReject] = useState<VaccineVerifyRow | null>(null); const [reason, setReason] = useState('');
  const [dates, setDates] = useState<VaccineVerifyRow | null>(null); const [dVac, setDVac] = useState(''); const [dExp, setDExp] = useState('');
  const [upload, setUpload] = useState<VaccineVerifyRow | null>(null);
  const [pin, setPin] = useState<PinApprovalRequest | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const records = useMemo(() => vaccineRecords.filter((r) => r.pet_id === id), [vaccineRecords, id]);
  const summary = useMemo(() => (id ? petVaccineSummary(id, vaccineRecords, vaccineTypes) : null), [id, vaccineRecords, vaccineTypes]);
  const rows = useMemo<VaccineVerifyRow[]>(() => [...vaccineTypes].sort((a, b) => a.sort_order - b.sort_order).map((t) => {
    const r = records.find((x) => x.vaccine_type_id === t.id);
    return { id: r?.id ?? `missing_${t.id}`, typeName: t.name, required: t.required, status: r?.status ?? 'missing', vaccinatedOn: r?.vaccinated_on ?? null, expiresOn: r?.expires_on ?? null, proofName: r?.proof_name ?? null, proofUrl: r?.proof_url ?? null, note: (r?.note as string | null) ?? null, verifiedBy: r?.verified_by ? users.find((u) => u.id === r.verified_by)?.name ?? r.verified_by : null, petId: id };
  }), [vaccineTypes, records, users, id]);
  const myBookings = useMemo(() => bookingPets.map((bp) => bookings.find((b) => b.id === bp.booking_id)).filter((b): b is BookingRow => !!b).sort((a, b) => b.check_in.localeCompare(a.check_in)), [bookingPets, bookings]);
  const myApps = useMemo(() => views.filter((v) => v.ap.pet_id === id).sort((a, b) => b.ap.starts_at.localeCompare(a.ap.starts_at)), [views, id]);
  if (!pet || !summary) return <div className="page"><PageHeader code="F-55" title="Pet" backTo="/desk/pets" /><EmptyState icon="paw" title="Pet not found" action={<Button onClick={() => nav('/desk/pets')}>Back to pets</Button>} /></div>;
  const owner = customerById.get(pet.customer_id);
  const profile = profiles[0];
  const vet = vets.find((v) => v.id === pet.vet_id);
  const recordOf = (row: VaccineVerifyRow) => records.find((r) => r.id === row.id);
  const ensureRecord = async (row: VaccineVerifyRow, patch: Partial<VaccineRecordRow>) => {
    const r = recordOf(row);
    if (r) return data.update<VaccineRecordRow>('vaccine_records', r.id, patch);
    const t = vaccineTypes.find((x) => x.name === row.typeName)!;
    return data.insert<VaccineRecordRow>('vaccine_records', { pet_id: pet.id, vaccine_type_id: t.id, vaccinated_on: null, expires_on: null, proof_url: null, proof_name: null, status: 'missing', verified_by: null, verified_at: null, note: null, ...patch } as Partial<VaccineRecordRow>);
  };
  const onVerify = async (row: VaccineVerifyRow) => {
    const r = recordOf(row); if (!r) return;
    const res = await verifyVaccineRecord(data, r, user, locationId);
    const msg = res.petApproved ? `${pet.name} is now approved` : res.bookingsConfirmed.length ? '' : null;
    setBanner(res.bookingsConfirmed.length ? `${res.petApproved ? `${pet.name} approved. ` : ''}Confirmed ${res.bookingsConfirmed.join(', ')} (were pending vaccines).` : msg);
    toast({ tone: 'success', title: `${row.typeName} verified`, body: res.bookingsConfirmed.length ? `Bookings confirmed: ${res.bookingsConfirmed.join(', ')}` : res.petApproved ? `${pet.name} approved` : undefined });
  };
  const onReject = async () => {
    if (!reject) return; const r = recordOf(reject); if (!r) return;
    await rejectVaccineRecord(data, r, reason.trim() || 'Certificate unreadable', user, locationId, owner?.user_id, pet.name, reject.typeName);
    toast({ tone: 'warn', title: `${reject.typeName} rejected`, body: 'The customer was asked to re-upload.' }); setReject(null); setReason('');
  };
  const saveDates = async () => {
    if (!dates) return;
    const exp = dExp || (dVac ? (() => { const d = new Date(`${dVac}T12:00:00`); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); })() : null);
    const r = recordOf(dates);
    await ensureRecord(dates, { vaccinated_on: dVac || null, expires_on: exp, status: !dVac ? 'missing' : exp && exp < todayIso() ? 'expired' : r?.status === 'verified' ? 'verified' : 'submitted' });
    await writeAudit(data, user, 'vaccine.dates', 'vaccine_records', r?.id ?? null, { vaccinated_on: dVac, expires_on: exp }, locationId);
    await settleVaccineStatus(data, pet.id, user, locationId);
    setDates(null); toast({ tone: 'success', title: `${dates.typeName} dates saved` });
  };
  const deactivate = async (approvalId: string) => {
    const to = pet.status === 'active' ? 'inactive' : 'active';
    await data.update<PetFull>('pets', pet.id, { status: to } as Partial<PetFull>);
    await writeAudit(data, user, 'record.delete', 'pets', pet.id, { status: [pet.status, to], approval_id: approvalId }, locationId);
    toast({ tone: 'success', title: `${pet.name} ${to === 'inactive' ? 'deactivated' : 'reactivated'}` });
  };
  const canVerify = can('vaccines.verify');
  return (
    <div className="page stack">
      <PageHeader code="F-55" title={pet.name} backTo={owner ? `/desk/customers/${owner.id}` : '/desk/pets'} eyebrow={<span className="row" style={{ gap: 6 }}><Badge size="sm" tone={toneFor(pet.approval_status)}>{pet.approval_status.replace('_', ' ')}</Badge>{pet.status === 'inactive' && <Badge size="sm">inactive</Badge>}</span>} subtitle={`${pet.breed ?? 'Mixed'}${pet.is_mixed ? ' (mixed)' : ''} · ${pet.sex}${pet.neutered ? ', neutered' : ''} · ${sizeLabel[pet.size ?? ''] ?? pet.size ?? 'size unknown'}${pet.weight_lbs ? ` · ${pet.weight_lbs} lb` : ''}${pet.date_of_birth ? ` · ${ageOf(pet.date_of_birth)}${profile?.dob_approximate ? ' (approx.)' : ''}` : ''}`}
        actions={<div className="fgp-actions">{can('pets.write') && <Button variant="secondary" icon="edit" onClick={() => nav(`/desk/pets/${pet.id}/edit`)}>Edit</Button>}{can('appointments.write') && <Button icon="scissors" onClick={() => nav(`/desk/grooming/new?customer=${pet.customer_id}&pet=${pet.id}`)}>Book groom</Button>}</div>} />
      {banner && <div className="fgp-warn is-success"><Icon name="check" size={16} /> {banner}</div>}
      {summary.overall !== 'ok' && <div className={`fgp-warn ${summary.overall === 'pending' ? 'is-info' : 'is-danger'}`}><Icon name="shield" size={16} /> <span>{summary.overall === 'pending' ? `Proof to verify: ${summary.pending.join(', ')}.` : ''}{summary.expired.length ? ` Expired: ${summary.expired.join(', ')}.` : ''}{summary.missing.length ? ` Missing: ${summary.missing.join(', ')}.` : ''}{summary.rejected.length ? ` Rejected: ${summary.rejected.join(', ')}.` : ''} Hotel and daycare bookings for {pet.name} stay <strong>pending vaccines</strong> until every required record is verified (R-A05, R-X30).</span></div>}
      <div className="fgp-two">
        <div className="stack">
          <Card>
            <div className="fgp-pet-head"><Avatar name={pet.name} kind="pet" size={64} /><div className="grow"><h2>{pet.name}</h2><PetVaccineChip overall={summary.overall} detail={`${summary.requiredOk}/${summary.requiredTotal} required`} size="md" /></div></div>
            <div className="fgp-facts" style={{ marginTop: 16, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <div className="fgp-fact"><span className="eyebrow">Color</span><strong>{pet.color ?? '—'}</strong></div>
              <div className="fgp-fact"><span className="eyebrow">Temper</span><strong>{profile?.temper ?? pet.personality ?? '—'}</strong></div>
              <div className="fgp-fact"><span className="eyebrow">Date of birth</span><strong>{pet.date_of_birth ? fmtDate(pet.date_of_birth) : '—'}</strong></div>
              <div className="fgp-fact"><span className="eyebrow">Vet</span><strong>{vet ? `${vet.name}${vet.phone ? ` · ${vet.phone}` : ''}` : '—'}</strong></div>
              <div className="fgp-fact"><span className="eyebrow">Registration</span><strong>{profile?.registration_number ?? '—'}</strong></div>
              <div className="fgp-fact"><span className="eyebrow">Microchip</span><strong className="mono xs">{profile?.microchip_number ?? '—'}</strong></div>
              <div className="fgp-fact"><span className="eyebrow">Groom style</span><strong>{profile?.groom_style ?? '—'}</strong></div>
              <div className="fgp-fact"><span className="eyebrow">Food</span><strong>{pet.own_food ? 'Own food' : 'House food'}{pet.meals_per_day ? ` · ${pet.meals_per_day}` : ''}{pet.can_have_treats ? '' : ' · no treats'}</strong></div>
            </div>
            {(pet.attributes?.length || pet.medical_conditions || pet.allergies || profile?.groom_notes) ? (
              <div className="stack-sm" style={{ marginTop: 16 }}>
                {pet.attributes?.length ? <div className="fgp-taglist">{pet.attributes.map((a) => <Badge key={a} tone="warn" size="sm">{a}</Badge>)}</div> : null}
                {pet.medical_conditions && <p className="small" style={{ margin: 0 }}><strong>Medical:</strong> {pet.medical_conditions}</p>}
                {pet.allergies && <p className="small" style={{ margin: 0 }}><strong>Allergies:</strong> {pet.allergies}</p>}
                {profile?.groom_notes && <p className="small" style={{ margin: 0 }}><strong>Groom notes:</strong> {profile.groom_notes}</p>}
              </div>) : null}
            {pet.note && <p className="small" style={{ margin: '12px 0 0', padding: 8, background: 'var(--color-surface-tint)', borderRadius: 6 }}>{pet.note}</p>}
            {files.length > 0 && <div style={{ marginTop: 12 }}><DeskAttachmentDropzone files={files.map((f) => ({ name: f.name, size_bytes: f.size_bytes, mime: f.mime, url: f.url }))} onChange={() => {}} disabled label="Attachments" /></div>}
          </Card>
          {owner && <CustomerSummaryCard compact name={fullName(owner)} email={owner.email} mobile={owner.mobile} to={`/desk/customers/${owner.id}`} balance={owner.balance} actions={<Button size="sm" variant="ghost" icon="message" onClick={() => nav(`/desk/messages?customer=${owner.id}`)}>Message</Button>} />}
        </div>
        <div className="stack">
          <Card header={<div className="row-between" style={{ width: '100%' }}><h3>Vaccines</h3><span className="xs muted">Rabies, DHPP, Bordetella required · Lepto, Influenza recommended (R-B01, R-B02)</span></div>} padding="sm">
            <PetVaccineVerifyTable rows={rows} canVerify={canVerify} onVerify={onVerify} onReject={(r) => { setReject(r); setReason(''); }} onEditDates={(r) => { setDates(r); setDVac(r.vaccinatedOn ?? ''); setDExp(r.expiresOn ?? ''); }} onUpload={can('pets.write') ? (r) => setUpload(r) : undefined} />
          </Card>
          <Card header={<h3>Hotel bookings</h3>} padding="sm">
            <DataTable<BookingRow> rows={myBookings} rowKey={(b) => b.id} dense emptyText="No hotel bookings for this pet" stickyHeader={false} columns={[
              { key: 'code', label: 'Booking', render: (b) => <span className="mono xs">{b.code}</span> }, { key: 'check_in', label: 'Check-in', render: (b) => fmtDateTime(b.check_in) }, { key: 'check_out', label: 'Check-out', render: (b) => fmtDateTime(b.check_out) },
              { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} size="sm" /> }, { key: 'total', label: 'Total', align: 'right', render: (b) => fmtMoney(b.total) }]} />
          </Card>
          <Card header={<h3>Grooming & Spa</h3>} padding="sm">
            <DataTable rows={myApps} rowKey={(v) => v.ap.id} dense emptyText="No grooming appointments for this pet" stickyHeader={false} onRowClick={(v) => nav(`/desk/grooming/${v.ap.id}`)} columns={[
              { key: 'code', label: 'Code', value: (v) => v.ap.code, render: (v) => <span className="mono xs">{v.ap.code}</span> }, { key: 'when', label: 'When', value: (v) => v.ap.starts_at, render: (v) => `${fmtDate(v.ap.starts_at)} ${fmtTime(v.ap.starts_at)}` }, { key: 'pkg', label: 'Package', value: (v) => v.pkg?.name, render: (v) => `${v.pkg?.name ?? 'Add-ons'}${v.addonNames.length ? ` + ${v.addonNames.join(', ')}` : ''}` },
              { key: 'groomer', label: 'Groomer', value: (v) => v.groomer?.display_name, render: (v) => v.groomer?.display_name ?? '—' }, { key: 'status', label: 'Status', value: (v) => v.ap.status, render: (v) => <GroomStatusBadge status={v.ap.status} size="sm" /> }]} />
          </Card>
          {can('pets.write') && <div className="row" style={{ justifyContent: 'flex-end' }}><Button size="sm" variant={pet.status === 'active' ? 'danger' : 'secondary'} icon="lock" onClick={() => setPin({ action: 'record.delete', title: pet.status === 'active' ? 'Deactivate pet' : 'Reactivate pet', description: `${pet.name} keeps its history (R-X38).`, subjectTable: 'pets', subjectId: pet.id })}>{pet.status === 'active' ? 'Deactivate pet' : 'Reactivate pet'}</Button></div>}
        </div>
      </div>
      <Modal open={!!reject} onClose={() => setReject(null)} title={`Reject ${reject?.typeName ?? ''} proof`} size="sm" footer={<><Button variant="secondary" onClick={() => setReject(null)}>Cancel</Button><Button variant="danger" onClick={onReject}>Reject and notify</Button></>}>
        <p className="small muted">The customer gets a notification asking for a new upload (R-X31). Say what was wrong.</p>
        <Textarea label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Certificate is blurry / dates do not match / wrong pet" rows={3} autoFocus />
      </Modal>
      <Modal open={!!dates} onClose={() => setDates(null)} title={`${dates?.typeName ?? ''} dates`} size="sm" footer={<><Button variant="secondary" onClick={() => setDates(null)}>Cancel</Button><Button onClick={saveDates}>Save</Button></>}>
        <div className="stack-sm">
          <Input type="date" label="Vaccinated on" value={dVac} max={todayIso()} onChange={(e) => setDVac(e.target.value)} />
          <Input type="date" label="Expires on" value={dExp} onChange={(e) => setDExp(e.target.value)} hint="Defaults to one year after vaccination" />
        </div>
      </Modal>
      <Modal open={!!upload} onClose={() => setUpload(null)} title={`Upload ${upload?.typeName ?? ''} certificate`} size="sm">
        <DeskAttachmentDropzone files={[]} multiple={false} onChange={async (fs) => { const f = fs[0]; if (!f || !upload) return; await ensureRecord(upload, { proof_url: f.url, proof_name: f.name, status: upload.vaccinatedOn ? 'submitted' : 'submitted' }); await writeAudit(data, user, 'vaccine.upload', 'vaccine_records', recordOf(upload)?.id ?? null, { proof_name: f.name }, locationId); setUpload(null); toast({ tone: 'success', title: 'Certificate attached', body: 'Now set the dates and verify.' }); }} />
      </Modal>
      <PinApprovalModal open={!!pin} request={pin} onClose={() => setPin(null)} onApproved={(a) => { setPin(null); deactivate(a.id); }} />
    </div>
  );
}
