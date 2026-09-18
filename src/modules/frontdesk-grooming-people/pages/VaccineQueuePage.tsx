import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../../components/molecule/Tabs/Tabs';
import { Button } from '../../../components/atom/Button/Button';
import { Textarea } from '../../../components/atom/Textarea/Textarea';
import { Modal } from '../../../components/organism/Modal/Modal';
import { PetVaccineVerifyTable, type VaccineVerifyRow } from '../../../components/organism/PetVaccineVerifyTable/PetVaccineVerifyTable';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { BookingRow, BookingPetRow, UserRow } from '../../../data/schema/core';
import { usePeople } from '../hooks';
import { fullName, isExpired, rejectVaccineRecord, verifyVaccineRecord } from '../lib';
import '../module.css';

type Tab = 'verify' | 'expired' | 'rejected' | 'upcoming' | 'all';

/** F-56 Vaccine verification queue. */
export function VaccineQueuePage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { locationId, allLocations, location } = useLocation();
  const { pets, customerById, vaccineRecords, vaccineTypes, vaccineOf } = usePeople();
  const { rows: users } = useTable<UserRow>('users');
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: { status: 'pending_vaccines' } });
  const { rows: bookingPets } = useTable<BookingPetRow>('booking_pets');
  const [tab, setTab] = useState<Tab>('verify');
  const [reject, setReject] = useState<VaccineVerifyRow | null>(null); const [reason, setReason] = useState('');
  const rows = useMemo<VaccineVerifyRow[]>(() => vaccineRecords.map((r): VaccineVerifyRow | null => {
    const pet = pets.find((p) => p.id === r.pet_id); const owner = pet ? customerById.get(pet.customer_id) : undefined; const t = vaccineTypes.find((x) => x.id === r.vaccine_type_id);
    if (!pet || !t || (!allLocations && owner?.home_location_id && owner.home_location_id !== locationId)) return null;
    return { id: r.id, typeName: t.name, required: t.required, status: r.status === 'verified' && isExpired(r) ? 'expired' : r.status, vaccinatedOn: r.vaccinated_on, expiresOn: r.expires_on, proofName: r.proof_name, proofUrl: r.proof_url, note: (r.note as string | null) ?? null, verifiedBy: r.verified_by ? users.find((u) => u.id === r.verified_by)?.name ?? r.verified_by : null, petName: pet.name, ownerName: owner ? fullName(owner) : '—', petId: pet.id };
  }).filter((x): x is VaccineVerifyRow => !!x), [vaccineRecords, pets, customerById, vaccineTypes, users, allLocations, locationId]);
  const pendingPetIds = useMemo(() => new Set(bookingPets.filter((bp) => bookings.some((b) => b.id === bp.booking_id)).map((bp) => bp.pet_id)), [bookingPets, bookings]);
  const lists: Record<Tab, VaccineVerifyRow[]> = {
    verify: rows.filter((r) => r.status === 'submitted'), expired: rows.filter((r) => r.status === 'expired'), rejected: rows.filter((r) => r.status === 'rejected'),
    upcoming: rows.filter((r) => r.petId && pendingPetIds.has(r.petId) && r.status !== 'verified'), all: rows,
  };
  const petsWithIssues = pets.filter((p) => vaccineOf.get(p.id)?.overall !== 'ok' && (allLocations || !customerById.get(p.customer_id)?.home_location_id || customerById.get(p.customer_id)?.home_location_id === locationId)).length;
  const rec = (row: VaccineVerifyRow) => vaccineRecords.find((r) => r.id === row.id);
  const onVerify = async (row: VaccineVerifyRow) => {
    const r = rec(row); if (!r) return;
    const res = await verifyVaccineRecord(data, r, user, locationId);
    toast({ tone: 'success', title: `${row.petName}: ${row.typeName} verified`, body: res.bookingsConfirmed.length ? `Confirmed ${res.bookingsConfirmed.join(', ')}` : res.petApproved ? `${row.petName} approved` : undefined });
  };
  const onReject = async () => {
    if (!reject) return; const r = rec(reject); if (!r) return;
    const pet = pets.find((p) => p.id === r.pet_id); const owner = pet ? customerById.get(pet.customer_id) : undefined;
    await rejectVaccineRecord(data, r, reason.trim() || 'Certificate unreadable', user, locationId, owner?.user_id, pet?.name ?? 'Pet', reject.typeName);
    toast({ tone: 'warn', title: `${reject.petName}: ${reject.typeName} rejected` }); setReject(null); setReason('');
  };
  const tabs = [{ key: 'verify' as Tab, label: 'To verify', count: lists.verify.length }, { key: 'upcoming' as Tab, label: 'Blocking a booking', count: lists.upcoming.length }, { key: 'expired' as Tab, label: 'Expired', count: lists.expired.length }, { key: 'rejected' as Tab, label: 'Rejected', count: lists.rejected.length }, { key: 'all' as Tab, label: 'All records', count: lists.all.length }];
  return (
    <div className="page stack">
      <PageHeader code="F-56" title="Vaccine verification" subtitle={`${allLocations ? 'All locations' : location.short_name} · verify uploads so pending bookings can confirm (R-X30)`} />
      <div className="fgp-stats">
        <StatTile label="Proofs to verify" value={lists.verify.length} icon="shield" tone={lists.verify.length ? 'primary' : 'default'} onClick={() => setTab('verify')} />
        <StatTile label="Bookings pending vaccines" value={bookings.length} icon="bed" hint={`${lists.upcoming.length} records to clear`} onClick={() => setTab('upcoming')} />
        <StatTile label="Expired records" value={lists.expired.length} icon="warning" onClick={() => setTab('expired')} />
        <StatTile label="Pets with issues" value={petsWithIssues} icon="paw" onClick={() => nav('/desk/pets')} />
      </div>
      <Tabs items={tabs} value={tab} onChange={setTab} ariaLabel="Queue" />
      <PetVaccineVerifyTable rows={lists[tab]} showPet canVerify={can('vaccines.verify')} onVerify={onVerify} onReject={(r) => { setReject(r); setReason(''); }} onOpenPet={(r) => nav(`/desk/pets/${r.petId}`)} />
      <Modal open={!!reject} onClose={() => setReject(null)} title={`Reject ${reject?.typeName ?? ''} for ${reject?.petName ?? ''}`} size="sm" footer={<><Button variant="secondary" onClick={() => setReject(null)}>Cancel</Button><Button variant="danger" onClick={onReject}>Reject and notify</Button></>}>
        <Textarea label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Certificate is blurry / dates do not match / wrong pet" rows={3} autoFocus />
      </Modal>
    </div>
  );
}
