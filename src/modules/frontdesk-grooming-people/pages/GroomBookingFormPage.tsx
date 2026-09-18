import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation as useRouterLocation } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Section } from '../../../components/molecule/Section/Section';
import { Card } from '../../../components/molecule/Card/Card';
import { DatePicker } from '../../../components/molecule/DatePicker/DatePicker';
import { TimePicker } from '../../../components/molecule/TimePicker/TimePicker';
import { Input } from '../../../components/atom/Input/Input';
import { Select } from '../../../components/atom/Select/Select';
import { Checkbox } from '../../../components/atom/Checkbox/Checkbox';
import { Textarea } from '../../../components/atom/Textarea/Textarea';
import { Button } from '../../../components/atom/Button/Button';
import { Badge } from '../../../components/atom/Badge/Badge';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { Icon } from '../../../components/atom/Icon/Icon';
import { PetVaccineChip } from '../../../components/molecule/PetVaccineChip/PetVaccineChip';
import { PinApprovalModal, type PinApprovalRequest } from '../../../components/organism/PinApprovalModal/PinApprovalModal';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useRow, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { AppointmentRow } from '../../../data/schema/core';
import type { AppointmentExtrasRow, PetProfileRow } from '../../../data/schema/frontdesk-grooming-people';
import { packagePrice, quoteGrooming, type Size } from '../../../pricing/engine';
import { sizeFromWeightLbs } from '../../../domain/booking';
import { useAppointments } from '../hooks';
import { combineDayTime, fmtMoney, fullName, hhmm, nextCode, notify, overlapCount, sizeLabel, todayIso, writeAudit, type AppointmentFull } from '../lib';
import '../module.css';

const DURATIONS = [30, 45, 60, 75, 90, 105, 120, 150, 180];

/** F-33 Groom booking form (new at /desk/grooming/new, edit at /desk/grooming/:id/edit). */
export function GroomBookingFormPage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { id } = useParams();
  const { search } = useRouterLocation();
  const q = useMemo(() => new URLSearchParams(search), [search]);
  const { user, can } = useSession();
  const { locationId, location } = useLocation();
  const editing = useRow<AppointmentFull>('appointments', id);
  const { apps, customers, pets, vaccineOf, groomers, packages, addons, fees, taxes, groomingCapacity, extrasByAp } = useAppointments();
  const { rows: petProfiles } = useTable<PetProfileRow>('pet_profiles');

  const [day, setDay] = useState(q.get('day') ?? todayIso());
  const [time, setTime] = useState(q.get('time') ?? '10:00');
  const [durationOverride, setDurationOverride] = useState<number | null>(null);
  const [reminder, setReminder] = useState(true);
  const [pickup, setPickup] = useState(''); const [delivery, setDelivery] = useState('');
  const [customerId, setCustomerId] = useState(q.get('customer') ?? '');
  const [petIds, setPetIds] = useState<string[]>(q.get('pet') ? [q.get('pet')!] : []);
  const [groomerId, setGroomerId] = useState(q.get('groomer') ?? '');
  const [packageId, setPackageId] = useState('');
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<'card' | 'cash'>('card');
  const [note, setNote] = useState(''); const [notesOnInvoice, setNotesOnInvoice] = useState(false);
  const [groomStyle, setGroomStyle] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pin, setPin] = useState<PinApprovalRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // load an existing appointment once
  useEffect(() => {
    if (!editing || loaded) return;
    const ex = extrasByAp.get(editing.id);
    setDay(editing.starts_at.slice(0, 10)); setTime(hhmm(editing.starts_at)); setDurationOverride(editing.duration_min); setCustomerId(editing.customer_id); setPetIds([editing.pet_id]); setGroomerId(editing.groomer_id ?? ''); setPackageId(editing.package_id ?? ''); setAddonIds(editing.addon_ids ?? []); setNote(editing.notes ?? '');
    if (ex) { setReminder(ex.reminder); setPickup(ex.pickup_at?.slice(0, 10) ?? ''); setDelivery(ex.delivery_at?.slice(0, 10) ?? ''); setDiscount(ex.discount_pct); setPayment(ex.payment_method ?? 'card'); setNotesOnInvoice(ex.include_notes_on_invoice); setGroomStyle(ex.groom_style ?? ''); }
    setLoaded(true);
  }, [editing, loaded, extrasByAp]);

  const customer = customers.find((c) => c.id === customerId);
  const customerPets = useMemo(() => pets.filter((p) => p.customer_id === customerId && p.status === 'active'), [pets, customerId]);
  const chosenPets = customerPets.filter((p) => petIds.includes(p.id));
  const sizeOf = (p: { size: string | null; weight_lbs: number | null }): Size => ((p.size as Size) ?? (p.weight_lbs != null ? sizeFromWeightLbs(p.weight_lbs) : 'M'));
  const pkg = packages.find((p) => p.id === packageId) ?? null;
  const chosenAddons = addons.filter((a) => addonIds.includes(a.id));
  const quotes = chosenPets.map((p) => ({ pet: p, size: sizeOf(p), quote: quoteGrooming({ pkg, size: sizeOf(p), addons: chosenAddons, payWithCard: payment === 'card', fees, taxes }) }));
  const computedMinutes = Math.max(...quotes.map((x) => x.quote.minutes ?? 0), 0) || 60;
  const duration = durationOverride ?? computedMinutes;
  const startsAt = combineDayTime(day, time);
  const subtotal = quotes.reduce((s, x) => s + x.quote.subtotal, 0);
  const discountAmt = Math.round(subtotal * discount) / 100;
  const tax = taxes.find((t) => t.active); const fee = payment === 'card' ? fees.find((f) => f.active && f.kind === 'card') : undefined;
  const taxTotal = tax ? Math.round((subtotal - discountAmt) * tax.service_rate) / 100 : 0;
  const feeTotal = fee ? Math.round((subtotal - discountAmt + taxTotal) * fee.percent) / 100 : 0;
  const total = Math.round((subtotal - discountAmt + taxTotal + feeTotal) * 100) / 100;
  const overlaps = overlapCount(apps, startsAt, duration, editing ? [editing.id] : []);
  const overCapacity = groomingCapacity != null && overlaps + chosenPets.length > groomingCapacity;
  const groomer = groomers.find((g) => g.id === groomerId);
  const groomerBusy = groomerId ? overlapCount(apps.filter((a) => a.groomer_id === groomerId), startsAt, duration, editing ? [editing.id] : []) : 0;
  useEffect(() => { if (!groomStyle && chosenPets.length === 1) { const pp = petProfiles.find((x) => x.pet_id === chosenPets[0].id); const gs = pp?.groom_style; if (typeof gs === 'string' && gs) setGroomStyle(gs); } }, [chosenPets, petProfiles, groomStyle]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!customerId) e.customer = 'Choose a customer'; if (!chosenPets.length) e.pets = 'Choose at least one pet'; if (!packageId && !chosenAddons.length) e.package = 'Choose a package or at least one add-on';
    if (!day || !time) e.time = 'Date and time are required'; if (discount < 0 || discount > 100) e.discount = '0–100';
    setErrors(e); return Object.keys(e).length === 0;
  };
  const save = async (approvalId: string | null) => {
    setSaving(true);
    try {
      const codes: string[] = [];
      const saved: AppointmentRow[] = [];
      for (const { pet, size, quote } of quotes) {
        const vaccine = vaccineOf.get(pet.id);
        const status = editing ? editing.status : vaccine?.overall === 'ok' ? 'confirmed' : 'requested';
        const off = Math.round(quote.subtotal * discount) / 100;
        const tTax = tax ? Math.round((quote.subtotal - off) * tax.service_rate) / 100 : 0;
        const tFee = fee ? Math.round((quote.subtotal - off + tTax) * fee.percent) / 100 : 0;
        const patch: Partial<AppointmentRow> = { location_id: locationId, customer_id: customerId, pet_id: pet.id, package_id: packageId || null, addon_ids: addonIds, groomer_id: groomerId || null, starts_at: startsAt, duration_min: duration, status, size, subtotal: quote.subtotal, tax_total: tTax, total: Math.round((quote.subtotal - off + tTax + tFee) * 100) / 100, notes: note || null } as Partial<AppointmentRow>;
        let ap: AppointmentRow;
        if (editing && saved.length === 0) { ap = await data.update<AppointmentRow>('appointments', editing.id, patch); await writeAudit(data, user, 'update', 'appointments', ap.id, { fields: Object.keys(patch) }, locationId); }
        else { const code = nextCode([...apps, ...codes.map((c) => ({ code: c }))], 'GR', 700); codes.push(code); ap = await data.insert<AppointmentRow>('appointments', { ...patch, code, booking_id: null, payment_status: 'pending' } as Partial<AppointmentRow>); await writeAudit(data, user, 'insert', 'appointments', ap.id, { code, status }, locationId); }
        const extrasPatch: Partial<AppointmentExtrasRow> = { appointment_id: ap.id, reminder, pickup_at: pickup ? combineDayTime(pickup, '09:00') : null, delivery_at: delivery ? combineDayTime(delivery, '17:00') : null, discount_pct: discount, payment_method: payment, include_notes_on_invoice: notesOnInvoice, groom_style: groomStyle || null, approval_id: approvalId };
        const ex = extrasByAp.get(ap.id);
        if (ex) await data.update<AppointmentExtrasRow>('appointment_extras', ex.id, extrasPatch); else await data.insert<AppointmentExtrasRow>('appointment_extras', { ...extrasPatch, invoice_id: null } as Partial<AppointmentExtrasRow>);
        if (!editing && customer?.user_id) await notify(data, customer.user_id, `appointment_${status}`, status === 'confirmed' ? `${pet.name}'s groom is confirmed` : `${pet.name}'s groom is requested`, `${pkg?.name ?? 'Grooming & Spa'} · ${new Date(startsAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} at ${location.short_name}${status === 'requested' ? ' · vaccines to verify' : ''}`, '/app/bookings');
        saved.push(ap);
      }
      setSaving(false);
      if (saved.length === 1) { toast({ tone: 'success', title: `${saved[0].code} ${editing ? 'updated' : 'saved'}`, body: `${chosenPets[0]?.name ?? ''} · ${fmtMoney(saved[0].total)}` }); nav(`/desk/grooming/${saved[0].id}`); }
      else { toast({ tone: 'success', title: `${saved.length} appointments saved`, body: saved.map((a) => a.code).join(', ') }); nav(`/desk/grooming?day=${day}`); }
    } catch (err) { setSaving(false); toast({ tone: 'danger', title: 'Could not save', body: String(err) }); }
  };
  const submit = () => {
    if (!validate()) { toast({ tone: 'warn', title: 'Please fix the highlighted fields' }); return; }
    const prevDiscount = editing ? extrasByAp.get(editing.id)?.discount_pct ?? 0 : 0;
    if (discount > 0 && discount !== prevDiscount) { setPin({ action: 'discount.apply', title: 'Discount needs a manager PIN', description: `${discount}% off ${fmtMoney(subtotal)} for ${fullName(customer)}`, subjectTable: 'appointments', subjectId: editing?.id, details: { discount_pct: discount, subtotal } }); return; }
    save(null);
  };
  const newCustomerUrl = `/desk/customers/new?return=${encodeURIComponent(`/desk/grooming/${id ? `${id}/edit` : 'new'}?day=${day}&time=${time}&groomer=${groomerId}`)}`;
  const title = editing ? `Edit ${editing.code}` : 'New groom booking';
  const readOnly = !can('appointments.write');

  return (
    <div className="page stack">
      <PageHeader code="F-33" title={title} backTo={editing ? `/desk/grooming/${editing.id}` : `/desk/grooming?day=${day}`} subtitle={`Grooming & Spa at ${location.short_name}. Prices come from the packages, add-ons, tax and fee tables.`} />
      {readOnly && <div className="fgp-warn"><Icon name="lock" size={16} /> Your role can view but not create groom bookings.</div>}
      <Section title="When" description="Duration is computed from the package minutes by size plus add-on minutes; you can override it.">
        <div className="fgp-form-grid">
          <DatePicker label="Date" value={day} onChange={setDay} />
          <TimePicker label="Time in" value={time} onChange={setTime} min="06:00" max="20:00" />
          <Select label="Duration" value={String(duration)} onChange={(e) => setDurationOverride(Number(e.target.value))} options={[...new Set([computedMinutes, ...DURATIONS])].sort((a, b) => a - b).map((m) => ({ value: String(m), label: `${m} min${m === computedMinutes ? ' (computed)' : ''}` }))} hint={durationOverride && durationOverride !== computedMinutes ? <button type="button" className="xs" style={{ border: 0, background: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0 }} onClick={() => setDurationOverride(null)}>Reset to computed</button> : undefined} />
          <Checkbox className="field-check" label="Reminder" description="Text / push the day before (R-I11)" checked={reminder} onChange={(e) => setReminder(e.target.checked)} />
          <Input type="date" label="Pickup required at" value={pickup} onChange={(e) => setPickup(e.target.value)} />
          <Input type="date" label="Delivery required at" value={delivery} onChange={(e) => setDelivery(e.target.value)} />
          <Select className="span-2" label="Groomer" placeholder="Any available groomer" value={groomerId} onChange={(e) => setGroomerId(e.target.value)} options={groomers.map((g) => ({ value: g.id, label: `${g.display_name ?? g.name}${g.status === 'on_leave' ? ' (on leave)' : ''}` }))} hint={groomer && groomerBusy > 0 ? `${groomer.display_name ?? groomer.name} already has ${groomerBusy} appointment${groomerBusy === 1 ? '' : 's'} in this slot` : undefined} error={errors.time} />
        </div>
        {overCapacity && <div className="fgp-warn" style={{ marginTop: 12 }}><Icon name="warning" size={16} /> Over grooming capacity: {overlaps} appointment{overlaps === 1 ? '' : 's'} already overlap this slot and the location allows {groomingCapacity} at a time (R-G21). You can still save; a manager may want to move one.</div>}
      </Section>
      <Section title="Customer & pets" description="One appointment is written per pet at the same time and groomer (R-G16).">
        <div className="fgp-form-grid">
          <Select className="span-2" label="Customer" required placeholder="Search by name" value={customerId} onChange={(e) => { setCustomerId(e.target.value); setPetIds([]); }} options={[...customers].filter((c) => c.status === 'active').sort((a, b) => a.last_name.localeCompare(b.last_name)).map((c) => ({ value: c.id, label: `${c.last_name}, ${c.first_name} · ${c.mobile}` }))} error={errors.customer} />
          <div className="field-check row wrap" style={{ gap: 8 }}><Button variant="secondary" icon="plus" onClick={() => nav(newCustomerUrl)} disabled={readOnly}>New customer</Button>{customer && <Button variant="ghost" icon="user" onClick={() => nav(`/desk/customers/${customer.id}`)}>Open {customer.first_name}</Button>}</div>
          <Input label="Groom style" placeholder="e.g. Teddy bear face, 1/2 inch body" value={groomStyle} onChange={(e) => setGroomStyle(e.target.value)} hint="Saved on the appointment; the pet profile keeps the last style" />
        </div>
        <div style={{ marginTop: 12 }}>
          {!customerId && <p className="muted small">Choose a customer to see their pets.</p>}
          {customerId && customerPets.length === 0 && <EmptyState compact icon="paw" title="This customer has no active pets" action={<Button size="sm" icon="plus" onClick={() => nav(`/desk/pets/new?customer=${customerId}&return=${encodeURIComponent(`/desk/grooming/new?customer=${customerId}&day=${day}&time=${time}`)}`)}>Add pet</Button>} />}
          {customerPets.length > 0 && (
            <div className="fgp-petpick" role="group" aria-label="Pets">
              {customerPets.map((p) => { const on = petIds.includes(p.id); const vs = vaccineOf.get(p.id); const size = sizeOf(p); return (
                <button type="button" key={p.id} className={`fgp-petcard ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => setPetIds((l) => (on ? l.filter((x) => x !== p.id) : [...l, p.id]))}>
                  <Avatar name={p.name} kind="pet" size={36} />
                  <span className="fgp-petcard-text"><strong>{p.name}</strong><span className="xs muted">{p.breed ?? 'Mixed'} · {sizeLabel[size]} {p.weight_lbs ? `(${p.weight_lbs} lb)` : ''}</span><span className="row wrap" style={{ gap: 4 }}>{vs && <PetVaccineChip overall={vs.overall} detail={`${vs.requiredOk}/${vs.requiredTotal}`} />}{(p.attributes ?? []).map((a) => <Badge key={a} size="sm" tone="warn">{a}</Badge>)}</span></span>
                  {on && <Icon name="check" size={16} className="tone-success" />}
                </button>); })}
            </div>
          )}
          {errors.pets && <p className="xs tone-danger" style={{ marginTop: 6 }}>{errors.pets}</p>}
          {chosenPets.some((p) => vaccineOf.get(p.id)?.overall !== 'ok') && <div className="fgp-warn is-info" style={{ marginTop: 12 }}><Icon name="shield" size={16} /> A chosen pet has a vaccine issue: the appointment is saved as <strong>Requested</strong> until the front desk verifies the records (R-A11, R-A05).</div>}
        </div>
      </Section>
      <Section title="Package & add-ons" description="Gold / Platinum / Diamond priced by size (R-G01); add-ons add minutes by size (R-G13).">
        <div className="fgp-pkgs" role="radiogroup" aria-label="Package">
          {packages.filter((p) => p.active).sort((a, b) => a.sort_order - b.sort_order).map((p) => { const on = packageId === p.id; return (
            <button type="button" key={p.id} role="radio" aria-checked={on} className={`fgp-pkg ${on ? 'is-on' : ''}`} onClick={() => setPackageId(on ? '' : p.id)}>
              <span className="fgp-pkg-head"><strong>{p.name}</strong><span className="fgp-pkg-price">{chosenPets.length ? chosenPets.map((cp) => fmtMoney(packagePrice(p, sizeOf(cp)))).join(' + ') : `${fmtMoney(p.price_s)} – ${fmtMoney(p.price_giant)}`}</span></span>
              <span className="fgp-pkg-inc">{p.inclusions}</span>
              {p.notes && <span className="xs faint">{p.notes}</span>}
            </button>); })}
        </div>
        {errors.package && <p className="xs tone-danger" style={{ marginTop: 6 }}>{errors.package}</p>}
        <div className="fgp-addons" style={{ marginTop: 12 }}>
          {addons.filter((a) => a.active).map((a) => { const on = addonIds.includes(a.id); return (
            <label key={a.id} className={`fgp-addon ${on ? 'is-on' : ''}`}>
              <Checkbox checked={on} onChange={(e) => setAddonIds((l) => (e.target.checked ? [...l, a.id] : l.filter((x) => x !== a.id)))} label={a.name} description={a.employee_type ? `${a.employee_type} only` : a.description ?? undefined} />
              <span className="fgp-addon-price">{a.starting_at ? 'from ' : ''}{fmtMoney(a.price)}{a.added_minutes_sm || a.added_minutes_l ? <span className="faint"> · +{a.added_minutes_sm}/{a.added_minutes_l} min</span> : null}</span>
            </label>); })}
        </div>
      </Section>
      <div className="fgp-two">
        <Section title="Note" description="Up to 100 characters (R-J02).">
          <Textarea label="Note" maxLength={100} showCount value={note} onChange={(e) => setNote(e.target.value)} placeholder="Owner asked for a shorter cut around the ears" />
          <Checkbox label="Include notes on invoice" checked={notesOnInvoice} onChange={(e) => setNotesOnInvoice(e.target.checked)} />
        </Section>
        <Section title="Invoice" description="Computed live from the pricing tables. Discounts need a manager PIN (R-X64).">
          <Card padding="sm">
            <div className="fgp-lines">
              {quotes.length === 0 && <p className="muted small" style={{ margin: 8 }}>Pick pets and a package to see the estimate.</p>}
              {quotes.map(({ pet, size, quote }) => quote.lines.filter((l) => l.kind === 'service' || l.kind === 'addon').map((l, i) => (
                <div className="fgp-line" key={`${pet.id}-${i}`}><span className="fgp-line-icon"><Icon name={l.kind === 'addon' ? 'sparkle' : 'scissors'} size={18} /></span><span className="fgp-line-name"><strong>{l.label}</strong><span className="xs muted">{pet.name} · {sizeLabel[size]}</span></span><span className="fgp-line-amt">{fmtMoney(l.amount)}</span></div>
              )))}
            </div>
            <div className="fgp-form-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <Input type="number" label="Discount %" min={0} max={100} step={1} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} error={errors.discount} hint={discount > 0 ? 'Manager PIN on save' : undefined} disabled={!can('discounts.apply') && !can('appointments.write')} />
              <Select label="Payment method" value={payment} onChange={(e) => setPayment(e.target.value as 'card' | 'cash')} options={[{ value: 'card', label: `Card${fee ? ` (+${fee.percent}% fee)` : ''}` }, { value: 'cash', label: 'Cash at the desk' }]} />
            </div>
            <div className="fgp-sub"><span>Sub total</span><span>{fmtMoney(subtotal)}</span></div>
            {discountAmt > 0 && <div className="fgp-sub"><span>Discount ({discount}%)</span><span>-{fmtMoney(discountAmt)}</span></div>}
            {tax && <div className="fgp-sub"><span>{tax.name} ({tax.service_rate}%)</span><span>{fmtMoney(taxTotal)}</span></div>}
            {fee && <div className="fgp-sub"><span>{fee.name} ({fee.percent}%)</span><span>{fmtMoney(feeTotal)}</span></div>}
            <div className="fgp-sub is-total"><span>Total{quotes.length > 1 ? ` (${quotes.length} pets)` : ''}</span><span>{fmtMoney(total)}</span></div>
            <p className="xs faint" style={{ margin: '8px 8px 0' }}>Invoice number and balance are generated when the invoice is created (R-J03).</p>
          </Card>
        </Section>
      </div>
      <div className="fgp-form-foot">
        <Button variant="secondary" onClick={() => nav(editing ? `/desk/grooming/${editing.id}` : `/desk/grooming?day=${day}`)}>Cancel</Button>
        <Button onClick={submit} loading={saving} disabled={readOnly} icon="check">{editing ? 'Save changes' : quotes.length > 1 ? `Book ${quotes.length} appointments` : 'Submit booking'}</Button>
      </div>
      <PinApprovalModal open={!!pin} request={pin} onClose={() => setPin(null)} onApproved={(a) => { setPin(null); save(a.id); }} />
    </div>
  );
}
