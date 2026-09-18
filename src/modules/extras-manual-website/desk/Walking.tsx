import { useMemo, useState } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useData, useTable } from '../../../data/DataContext';
import type { BookingRow, CustomerRow, EmployeeRow, PetRow } from '../../../data/schema/core';
import type { WalkRow } from '../../../data/schema/extras-manual-website';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { StatTile } from '../../../components/molecule/StatTile/StatTile';
import { Button } from '../../../components/atom/Button/Button';
import { Badge, toneFor } from '../../../components/atom/Badge/Badge';
import { Select } from '../../../components/atom/Select/Select';
import { Input } from '../../../components/atom/Input/Input';
import { Textarea } from '../../../components/atom/Textarea/Textarea';
import { Checkbox } from '../../../components/atom/Checkbox/Checkbox';
import { Drawer } from '../../../components/organism/Drawer/Drawer';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import { DatePicker, toIso } from '../../../components/molecule/DatePicker/DatePicker';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { useToast } from '../../../components/molecule/Toast/Toast';
import './extras.css';

const fmtT = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/** F-67 Dog walking: the day's walk log per pet with handler, start, minutes and status; plan, start, finish, skip (R-X75). */
export function WalkingPage() {
  const data = useData();
  const { user } = useSession();
  const { scope, locationId } = useLocation();
  const { toast } = useToast();
  const [day, setDay] = useState(toIso(new Date()));
  const [open, setOpen] = useState(false);
  const { rows: walks } = useTable<WalkRow>('walks', { where: scope, orderBy: { column: 'started_at' } });
  const { rows: pets } = useTable<PetRow>('pets');
  const { rows: customers } = useTable<CustomerRow>('customers');
  const { rows: handlers } = useTable<EmployeeRow>('employees', { where: { ...scope, status: 'active' } });
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: { ...scope, status: 'checked_in' } });
  const list = useMemo(() => walks.filter((w) => w.started_at.slice(0, 10) === day), [walks, day]);
  const pet = (id: string) => pets.find((p) => p.id === id);
  const owner = (p?: PetRow) => { const c = p && customers.find((x) => x.id === p.customer_id); return c ? c.last_name : ''; };
  const handler = (id: string | null) => handlers.find((h) => h.id === id)?.display_name ?? '—';
  const me = handlers.find((h) => h.user_id === user.id);
  const guests = useMemo(() => { const ids = new Set<string>(); for (const b of bookings) for (const p of pets) if (p.customer_id === b.customer_id) ids.add(p.id); return pets.filter((p) => ids.has(p.id)); }, [bookings, pets]);
  const [form, setForm] = useState({ pet_id: '', handler_id: '', time: '09:00', duration_min: 20, note: '' });
  const setStatus = async (w: WalkRow, status: string, patch: Partial<WalkRow> = {}) => { await data.update('walks', w.id, { status, ...patch }); };
  const plan = async () => {
    if (!form.pet_id) return;
    await data.insert('walks', { location_id: locationId, pet_id: form.pet_id, handler_id: form.handler_id || me?.id || null, booking_id: bookings.find((b) => pet(form.pet_id)?.customer_id === b.customer_id)?.id ?? null, daycare_booking_id: null, started_at: `${day}T${form.time}:00`, duration_min: Number(form.duration_min) || 20, status: 'planned', potty: null, note: form.note.trim() || null });
    setOpen(false); setForm({ pet_id: '', handler_id: '', time: '09:00', duration_min: 20, note: '' });
    toast({ tone: 'success', title: 'Walk planned' });
  };
  const minutes = list.filter((w) => w.status === 'done').reduce((s, w) => s + w.duration_min, 0);
  return (
    <div className="container ex-page">
      <PageHeader code="F-67" title="Walking" subtitle="Every outing logged per dog: who walked, when, how long, how it went. Hotel guests get their included walks; daycare walks are billed from these rows later." actions={<div className="row wrap"><Input size="sm" type="date" aria-label="Day" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} /><Button size="sm" icon="plus" onClick={() => setOpen(true)}>Plan a walk</Button></div>} />
      <div className="ex-tiles"><StatTile label="Planned" value={list.filter((w) => w.status === 'planned').length} icon="clock" /><StatTile label="Out now" value={list.filter((w) => w.status === 'in_progress').length} icon="paw" tone="primary" /><StatTile label="Done" value={list.filter((w) => w.status === 'done').length} hint={`${minutes} min`} icon="check" /><StatTile label="Guests in house" value={guests.length} hint="checked-in pets" icon="bed" /></div>
      <Card padding="none">
        <DataTable<WalkRow> rows={list} rowKey={(w) => w.id} emptyText="No walks logged for this day. Plan one." dense
          columns={[
            { key: 'started_at', label: 'Time', render: (w) => fmtT(w.started_at), width: 90 },
            { key: 'pet_id', label: 'Dog', value: (w) => pet(w.pet_id)?.name, render: (w) => { const p = pet(w.pet_id); return <div className="row" style={{ gap: 8 }}><Avatar name={p?.name ?? '?'} size={28} kind="pet" /><div><strong>{p?.name ?? 'Pet'}</strong><div className="xs muted">{p?.breed ?? ''}{owner(p) ? ` · ${owner(p)}` : ''}{p?.weight_lbs ? ` · ${p.weight_lbs} lb` : ''}</div></div></div>; } },
            { key: 'handler_id', label: 'Handler', value: (w) => handler(w.handler_id), render: (w) => handler(w.handler_id) },
            { key: 'duration_min', label: 'Minutes', align: 'right', width: 90 },
            { key: 'status', label: 'Status', render: (w) => <Badge size="sm" tone={w.status === 'done' ? 'success' : w.status === 'in_progress' ? 'primary' : w.status === 'skipped' ? 'danger' : 'neutral'}>{w.status.replace('_', ' ')}</Badge>, width: 110 },
            { key: 'potty', label: 'Potty', render: (w) => (w.potty == null ? '—' : w.potty ? 'yes' : 'no'), width: 70, hideOnCard: true },
            { key: 'note', label: 'Note', render: (w) => <span className="small muted">{w.note ?? ''}</span> },
          ]}
          rowActions={(w) => <div className="row" style={{ gap: 4 }}>
            {w.status === 'planned' && <Button size="sm" onClick={() => void setStatus(w, 'in_progress', { started_at: new Date().toISOString(), handler_id: w.handler_id ?? me?.id ?? null })}>Start</Button>}
            {w.status === 'in_progress' && <Button size="sm" onClick={() => void setStatus(w, 'done', { potty: true, duration_min: Math.max(5, Math.round((Date.now() - new Date(w.started_at).getTime()) / 60000)) || w.duration_min })}>Finish</Button>}
            {w.status === 'planned' && <Button size="sm" variant="ghost" onClick={() => void setStatus(w, 'skipped')}>Skip</Button>}
            {w.status === 'done' && <Badge size="sm" tone={toneFor('done')}>logged</Badge>}
          </div>} />
      </Card>
      <Drawer open={open} onClose={() => setOpen(false)} title="Plan a walk" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void plan()} disabled={!form.pet_id}>Plan</Button></>}>
        <div className="stack">
          <DatePicker label="Day" value={day} onChange={setDay} />
          <Select label="Dog" placeholder="Choose a dog" value={form.pet_id} onChange={(e) => setForm((f) => ({ ...f, pet_id: e.target.value }))} options={[...guests, ...pets.filter((p) => !guests.includes(p))].map((p) => ({ value: p.id, label: `${p.name}${owner(p) ? ` (${owner(p)})` : ''}${guests.includes(p) ? ' · in house' : ''}` }))} hint="Checked-in hotel guests first." />
          <Select label="Handler" placeholder={me ? `${me.display_name} (me)` : 'Assign later'} value={form.handler_id} onChange={(e) => setForm((f) => ({ ...f, handler_id: e.target.value }))} options={handlers.map((h) => ({ value: h.id, label: h.display_name ?? h.name }))} />
          <div className="grid grid-2"><Input label="Start time" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} /><Input label="Minutes" type="number" min={5} step={5} value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: Number(e.target.value) }))} /></div>
          <Textarea label="Note" rows={3} maxLength={200} showCount value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Leash habits, route, anything the parent should hear." />
          <Checkbox label="Bill as a daycare walk" description="Coming later: links the walk to the daycare day's Walk price item." disabled />
        </div>
      </Drawer>
    </div>
  );
}
