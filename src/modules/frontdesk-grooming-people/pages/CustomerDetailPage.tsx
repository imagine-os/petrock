import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { Tabs } from '../../../components/molecule/Tabs/Tabs';
import { Button } from '../../../components/atom/Button/Button';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { Badge, StatusBadge, toneFor } from '../../../components/atom/Badge/Badge';
import { Textarea } from '../../../components/atom/Textarea/Textarea';
import { Checkbox } from '../../../components/atom/Checkbox/Checkbox';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import { CustomerSummaryCard } from '../../../components/molecule/CustomerSummaryCard/CustomerSummaryCard';
import { GroomStatusBadge } from '../../../components/molecule/GroomStatusBadge/GroomStatusBadge';
import { PetVaccineChip } from '../../../components/molecule/PetVaccineChip/PetVaccineChip';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { PinApprovalModal, type PinApprovalRequest } from '../../../components/organism/PinApprovalModal/PinApprovalModal';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useRow, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { BookingRow, BookingPetRow, DaycareBookingRow, InvoiceRow, LocationRow, RoomTypeRow, ConversationRow } from '../../../data/schema/core';
import type { AttachmentRow, CustomerNoteRow, CustomerProfileRow } from '../../../data/schema/frontdesk-grooming-people';
import { usePeople, useAppointments } from '../hooks';
import { ageOf, fmtDate, fmtDateTime, fmtMoney, fmtTime, fullName, relativeTime, sizeLabel, writeAudit, type CustomerFull } from '../lib';
import '../module.css';

type Tab = 'pets' | 'bookings' | 'grooming' | 'daycare' | 'invoices' | 'notes';

/** F-52 Customer detail. */
export function CustomerDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { locationId } = useLocation();
  const customer = useRow<CustomerFull>('customers', id);
  const { pets, vaccineOf } = usePeople();
  const { views } = useAppointments();
  const { rows: profiles } = useTable<CustomerProfileRow>('customer_profiles', { where: { customer_id: id ?? '__none__' } });
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: { customer_id: id ?? '__none__' }, orderBy: { column: 'check_in', dir: 'desc' } });
  const { rows: bookingPets } = useTable<BookingPetRow>('booking_pets');
  const { rows: daycare } = useTable<DaycareBookingRow>('daycare_bookings', { where: { customer_id: id ?? '__none__' }, orderBy: { column: 'date', dir: 'desc' } });
  const { rows: invoices } = useTable<InvoiceRow>('invoices', { where: { customer_id: id ?? '__none__' }, orderBy: { column: 'issued_at', dir: 'desc' } });
  const { rows: notes } = useTable<CustomerNoteRow>('customer_notes', { where: { customer_id: id ?? '__none__' }, orderBy: { column: 'created_at', dir: 'desc' } });
  const { rows: files } = useTable<AttachmentRow>('attachments', { where: { subject_table: 'customers', subject_id: id ?? '__none__' } });
  const { rows: conversations } = useTable<ConversationRow>('conversations', { where: { customer_id: id ?? '__none__' } });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types');
  const { rows: locations } = useTable<LocationRow>('locations');
  const [tab, setTab] = useState<Tab>('pets');
  const [noteDraft, setNoteDraft] = useState(''); const [notePinned, setNotePinned] = useState(false);
  const [pin, setPin] = useState<PinApprovalRequest | null>(null);
  const myPets = useMemo(() => pets.filter((p) => p.customer_id === id), [pets, id]);
  const myApps = useMemo(() => views.filter((v) => v.ap.customer_id === id).sort((a, b) => b.ap.starts_at.localeCompare(a.ap.starts_at)), [views, id]);
  if (!customer) return <div className="page"><PageHeader code="F-52" title="Customer" backTo="/desk/customers" /><EmptyState icon="users" title="Customer not found" action={<Button onClick={() => nav('/desk/customers')}>Back to customers</Button>} /></div>;
  const profile = profiles[0];
  const invoiceDue = invoices.filter((i) => i.status === 'issued').reduce((s, i) => s + i.balance, 0);
  const balance = Math.round((customer.balance + invoiceDue) * 100) / 100;
  const locName = locations.find((l) => l.id === customer.home_location_id)?.short_name ?? null;
  const petNames = (b: BookingRow) => bookingPets.filter((bp) => bp.booking_id === b.id).map((bp) => pets.find((p) => p.id === bp.pet_id)?.name ?? '?').join(', ');
  const addNote = async () => { const text = noteDraft.trim(); if (!text) return; await data.insert<CustomerNoteRow>('customer_notes', { customer_id: customer.id, author_id: user.id, author_name: user.name, text, pinned: notePinned }); setNoteDraft(''); setNotePinned(false); toast({ tone: 'success', title: 'Note added' }); };
  const deactivate = async (approvalId: string) => {
    const to = customer.status === 'active' ? 'inactive' : 'active';
    await data.update<CustomerFull>('customers', customer.id, { status: to } as Partial<CustomerFull>);
    await writeAudit(data, user, 'record.delete', 'customers', customer.id, { status: [customer.status, to], approval_id: approvalId }, locationId);
    toast({ tone: 'success', title: `Customer ${to === 'inactive' ? 'deactivated' : 'reactivated'}` });
  };
  const tabs = [{ key: 'pets' as Tab, label: 'Pets', count: myPets.length }, { key: 'bookings' as Tab, label: 'Hotel', count: bookings.length }, { key: 'grooming' as Tab, label: 'Grooming', count: myApps.length }, { key: 'daycare' as Tab, label: 'Daycare', count: daycare.length }, { key: 'invoices' as Tab, label: 'Invoices', count: invoices.length }, { key: 'notes' as Tab, label: 'Notes', count: notes.length }];
  return (
    <div className="page stack">
      <PageHeader code="F-52" title={fullName(customer)} backTo="/desk/customers" eyebrow={profile?.title ? <span>{profile.title}</span> : undefined} subtitle={[customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(', ') || 'No address on file'}
        actions={<div className="fgp-actions">{can('customers.write') && <Button variant="secondary" icon="edit" onClick={() => nav(`/desk/customers/${customer.id}/edit`)}>Edit</Button>}<Button variant="secondary" icon="message" onClick={() => nav(`/desk/messages?customer=${customer.id}${conversations[0] ? `&conversation=${conversations[0].id}` : ''}`)}>Message</Button>{can('pets.write') && <Button icon="plus" onClick={() => nav(`/desk/pets/new?customer=${customer.id}`)}>Add pet</Button>}</div>} />
      <CustomerSummaryCard name={fullName(customer)} email={customer.email} mobile={customer.mobile} status={customer.status} balance={balance} petsCount={myPets.filter((p) => p.status === 'active').length} location={locName} since={profile?.customer_since ? fmtDate(profile.customer_since, { month: 'short', year: 'numeric' }) : undefined}>
        <div className="row wrap xs muted" style={{ marginTop: 12, gap: 16 }}>
          {customer.preferred_contact && <span>Prefers <strong>{customer.preferred_contact}</strong></span>}
          {profile?.home_phone && <span>Home {profile.home_phone}</span>}{profile?.work_phone && <span>Work {profile.work_phone}</span>}{customer.alt_phone && <span>Alt {customer.alt_phone}</span>}{profile?.alt_contact && <span>Alt contact: {profile.alt_contact}</span>}
          {profile?.reference && <span>Via {profile.reference}</span>}<span>{customer.marketing_opt_in ? 'Marketing on' : 'Marketing off'}</span>
          {profile?.attributes?.map((a) => <Badge key={a} size="sm" tone="warn">{a}</Badge>)}
          {files.length > 0 && <span>{files.length} attachment{files.length === 1 ? '' : 's'}: {files.map((f) => f.name).join(', ')}</span>}
        </div>
        {customer.note && <p className="small" style={{ margin: '8px 0 0', padding: 8, background: 'var(--color-surface-tint)', borderRadius: 6 }}>{customer.note}</p>}
      </CustomerSummaryCard>
      <Tabs items={tabs} value={tab} onChange={setTab} ariaLabel="Customer sections" />
      {tab === 'pets' && (myPets.length === 0 ? <EmptyState icon="paw" title="No pets yet" body="Bookings need at least one pet (R-A01)." action={can('pets.write') ? <Button icon="plus" onClick={() => nav(`/desk/pets/new?customer=${customer.id}`)}>Add pet</Button> : undefined} /> : (
        <div className="grid grid-auto">
          {myPets.map((p) => { const vs = vaccineOf.get(p.id); return (
            <Card key={p.id} interactive onClick={() => nav(`/desk/pets/${p.id}`)} className={p.status === 'inactive' ? 'faint' : ''}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <Avatar name={p.name} kind="pet" size={48} />
                <div className="grow stack-sm" style={{ gap: 4 }}>
                  <div className="row wrap" style={{ gap: 6 }}><strong>{p.name}</strong><Badge size="sm" tone={toneFor(p.approval_status)}>{p.approval_status.replace('_', ' ')}</Badge>{p.status === 'inactive' && <Badge size="sm">inactive</Badge>}</div>
                  <span className="xs muted">{p.breed ?? 'Mixed'} · {p.sex} · {sizeLabel[p.size ?? ''] ?? p.size}{p.weight_lbs ? ` · ${p.weight_lbs} lb` : ''}{p.date_of_birth ? ` · ${ageOf(p.date_of_birth)}` : ''}</span>
                  <div className="row wrap" style={{ gap: 4 }}>{vs && <PetVaccineChip overall={vs.overall} detail={`${vs.requiredOk}/${vs.requiredTotal}`} />}{(p.attributes ?? []).map((a) => <Badge key={a} size="sm" tone="warn">{a}</Badge>)}</div>
                </div>
              </div>
            </Card>); })}
        </div>))}
      {tab === 'bookings' && <DataTable<BookingRow> rows={bookings} rowKey={(b) => b.id} emptyText="No hotel bookings" dense columns={[
        { key: 'code', label: 'Booking', render: (b) => <span className="mono xs">{b.code}</span> }, { key: 'check_in', label: 'Check-in', render: (b) => fmtDateTime(b.check_in) }, { key: 'check_out', label: 'Check-out', render: (b) => fmtDateTime(b.check_out) },
        { key: 'room', label: 'Room type', value: (b) => roomTypes.find((r) => r.id === b.room_type_id)?.name, render: (b) => roomTypes.find((r) => r.id === b.room_type_id)?.name ?? '—' }, { key: 'pets', label: 'Pets', sortable: false, render: (b) => petNames(b) },
        { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} size="sm" /> }, { key: 'payment_status', label: 'Payment', render: (b) => <Badge size="sm" tone={toneFor(b.payment_status)}>{b.payment_status}</Badge> }, { key: 'total', label: 'Total', align: 'right', render: (b) => <Link to={`/desk/invoices/${b.id}`} onClick={(e) => e.stopPropagation()}>{fmtMoney(b.total)}</Link> },
      ]} />}
      {tab === 'grooming' && <DataTable rows={myApps} rowKey={(v) => v.ap.id} onRowClick={(v) => nav(`/desk/grooming/${v.ap.id}`)} emptyText="No grooming appointments" dense columns={[
        { key: 'code', label: 'Code', value: (v) => v.ap.code, render: (v) => <span className="mono xs">{v.ap.code}</span> }, { key: 'when', label: 'When', value: (v) => v.ap.starts_at, render: (v) => `${fmtDate(v.ap.starts_at)} ${fmtTime(v.ap.starts_at)}` }, { key: 'pet', label: 'Pet', value: (v) => v.pet?.name, render: (v) => v.pet?.name ?? '—' },
        { key: 'pkg', label: 'Package', value: (v) => v.pkg?.name, render: (v) => `${v.pkg?.name ?? 'Add-ons only'}${v.addonNames.length ? ` + ${v.addonNames.join(', ')}` : ''}` }, { key: 'groomer', label: 'Groomer', value: (v) => v.groomer?.display_name, render: (v) => v.groomer?.display_name ?? '—' },
        { key: 'status', label: 'Status', value: (v) => v.ap.status, render: (v) => <GroomStatusBadge status={v.ap.status} size="sm" /> }, { key: 'total', label: 'Total', value: (v) => v.ap.total, align: 'right', render: (v) => fmtMoney(v.ap.total) },
      ]} toolbar={can('appointments.write') ? <Button size="sm" icon="plus" onClick={() => nav(`/desk/grooming/new?customer=${customer.id}`)}>Book a groom</Button> : undefined} />}
      {tab === 'daycare' && <DataTable<DaycareBookingRow> rows={daycare} rowKey={(d) => d.id} emptyText="No daycare days" dense columns={[
        { key: 'code', label: 'Code', render: (d) => <span className="mono xs">{d.code}</span> }, { key: 'date', label: 'Date', render: (d) => fmtDate(d.date) }, { key: 'times', label: 'Times', sortable: false, render: (d) => `${d.check_in_time} – ${d.check_out_time}` }, { key: 'item', label: 'Item', render: (d) => d.item.replace('_', ' ') },
        { key: 'pets', label: 'Pets', sortable: false, render: (d) => d.pet_ids.map((pid) => pets.find((p) => p.id === pid)?.name ?? '?').join(', ') }, { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} size="sm" /> }, { key: 'total', label: 'Total', align: 'right', render: (d) => fmtMoney(d.total) },
      ]} />}
      {tab === 'invoices' && <DataTable<InvoiceRow> rows={invoices} rowKey={(i) => i.id} onRowClick={(i) => nav(`/desk/invoices/${i.id}`)} emptyText="No invoices" dense columns={[
        { key: 'number', label: 'Invoice', render: (i) => <span className="mono xs">{i.number}</span> }, { key: 'issued_at', label: 'Issued', render: (i) => fmtDate(i.issued_at) }, { key: 'source_type', label: 'For', render: (i) => `${i.source_type} ${i.source_id}` },
        { key: 'total', label: 'Total', align: 'right', render: (i) => fmtMoney(i.total) }, { key: 'balance', label: 'Balance', align: 'right', render: (i) => <span className={i.balance > 0 ? 'tone-danger' : ''}>{fmtMoney(i.balance)}</span> }, { key: 'status', label: 'Status', render: (i) => <Badge size="sm" tone={toneFor(i.status)}>{i.status}</Badge> },
      ]} />}
      {tab === 'notes' && (
        <div className="fgp-two">
          <Card header={<h3>Add a note</h3>}>
            <Textarea label="Note" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={4} placeholder="Anything the next shift should know" />
            <Checkbox label="Pin to the top" checked={notePinned} onChange={(e) => setNotePinned(e.target.checked)} />
            <Button icon="plus" onClick={addNote} disabled={!noteDraft.trim()} style={{ marginTop: 8 }}>Add note</Button>
          </Card>
          <div className="fgp-notes">
            {notes.length === 0 && <EmptyState compact icon="edit" title="No notes yet" />}
            {[...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned)).map((n) => (
              <div key={n.id} className={`fgp-note ${n.pinned ? 'is-pinned' : ''}`}>
                <div className="fgp-note-meta"><span>{n.author_name} · {relativeTime(n.created_at)}</span><span className="row" style={{ gap: 4 }}>{n.pinned && <Badge size="sm" tone="primary">pinned</Badge>}<Button size="sm" variant="ghost" onClick={() => data.update<CustomerNoteRow>('customer_notes', n.id, { pinned: !n.pinned })}>{n.pinned ? 'Unpin' : 'Pin'}</Button>{(can('customers.delete') || n.author_id === user.id) && <Button size="sm" variant="ghost" icon="trash" aria-label="Delete note" onClick={() => data.remove('customer_notes', n.id)} />}</span></div>
                <span className="small">{n.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {can('customers.write') && <div className="row wrap" style={{ justifyContent: 'flex-end' }}><Button variant={customer.status === 'active' ? 'danger' : 'secondary'} icon="lock" size="sm" onClick={() => setPin({ action: 'record.delete', title: customer.status === 'active' ? 'Deactivate customer' : 'Reactivate customer', description: `${fullName(customer)} keeps their history; bookings stay linked (R-X38).`, subjectTable: 'customers', subjectId: customer.id })}>{customer.status === 'active' ? 'Deactivate customer' : 'Reactivate customer'}</Button></div>}
      <PinApprovalModal open={!!pin} request={pin} onClose={() => setPin(null)} onApproved={(a) => { setPin(null); deactivate(a.id); }} />
    </div>
  );
}
