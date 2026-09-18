import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import type { AppointmentRow, CapacityRow, EmployeeRow, LocationRow } from '../../data/schema/core';
import { Chip } from '../../components/atom/Chip/Chip';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Card } from '../../components/molecule/Card/Card';
import { DatePicker } from '../../components/molecule/DatePicker/DatePicker';
import { GroomingSlotPicker } from '../../components/molecule/GroomingSlotPicker/GroomingSlotPicker';
import { ServiceFlowFooter } from '../../components/molecule/ServiceFlowFooter/ServiceFlowFooter';
import { fmt12 } from '../../components/molecule/TimePicker/TimePicker';
import { useCustomer } from './useCustomer';
import { useOrderQuote } from './pricing';
import { useGroomingDraft } from './draft';
import { computeSlots, hoursFor, isClosed } from './slots';
import { addDaysIso, fmtDateLong, todayIso } from './format';
import { CgdPage, GROOMING_STEPS, Notice } from './layout';

/** C-53 Choose location, date, groomer and start time. Slots respect hours, capacity and groomer availability (R-X05, R-G21). */
export function GroomingTimePage() {
  const t = useT();
  const nav = useNavigate();
  const { customer, pets } = useCustomer();
  const [draft, update] = useGroomingDraft();
  const q = useOrderQuote(draft.items, pets, false);
  const { rows: locations } = useTable<LocationRow>('locations', { where: { active: true }, orderBy: { column: 'sort_order' } });
  const locationId = draft.locationId ?? customer?.home_location_id ?? locations[0]?.id ?? null;
  useEffect(() => { if (!draft.locationId && locationId) update({ locationId }); }, [draft.locationId, locationId, update]);
  const location = locations.find((l) => l.id === locationId);
  const { rows: groomers } = useTable<EmployeeRow>('employees', { where: { location_id: locationId ?? '__none__', is_groomer: true, status: 'active' } });
  const { rows: caps } = useTable<CapacityRow>('capacities', { where: { location_id: locationId ?? '__none__', kind: 'grooming' } });
  const { rows: appointments } = useTable<AppointmentRow>('appointments', { where: { location_id: locationId ?? '__none__' } });
  const capacity = caps[0]?.max_simultaneous ?? 2;
  const ready = draft.items.length > 0 && draft.items.every((i) => i.petId && i.packageId);
  useEffect(() => { if (!ready) nav('/app/grooming/new', { replace: true }); }, [ready, nav]);
  const date = draft.date;
  const slots = useMemo(() => (date ? computeSlots({ location, date, orderMinutes: q.longestMinutes || 60, petCount: draft.items.length, capacity, appointments, groomerId: draft.groomerId }) : []), [location, date, q.longestMinutes, draft.items.length, capacity, appointments, draft.groomerId]);
  const hours = date ? hoursFor(location, date) : null;
  const today = todayIso();
  const petNames = q.perPet.map((p) => p.pet?.name ?? 'Pet').join(' & ');

  return (
    <CgdPage title={t('cgd.chooseTime')} backTo="/app/grooming/new/add-ons" steps={GROOMING_STEPS} step={2} subtitle={`${petNames} · about ${q.longestMinutes} min${draft.items.length > 1 ? ` (${draft.items.length} pets groomed side by side)` : ''}`}>
      <div>
        <div className="field-label">Location</div>
        <div className="cgd-chips">{locations.map((l) => <Chip key={l.id} icon="location" selected={l.id === locationId} onClick={() => update({ locationId: l.id, time: null, groomerId: null })}>{l.short_name}</Chip>)}</div>
        {location && <p className="xs muted" style={{ marginTop: 6 }}>{location.address}</p>}
      </div>
      <div className="cgd-datepicker"><DatePicker label="Date" value={date} min={today} max={addDaysIso(today, 90)} onChange={(iso) => update({ date: iso, time: null })} disabledDates={(iso) => isClosed(location, iso)} /></div>
      {groomers.length > 0 && <Select label="Groomer" value={draft.groomerId ?? ''} onChange={(e) => update({ groomerId: e.target.value || null, time: null })} options={[{ value: '', label: 'Any available groomer' }, ...groomers.map((g) => ({ value: g.id, label: g.display_name ?? g.name }))]} hint={draft.items.some((i) => q.tables.addons.some((a) => i.addonIds.includes(a.id) && a.employee_type)) ? 'One of your add-ons needs a specially trained groomer; the desk will assign one.' : undefined} />}
      {date ? (
        <Card padding="md">
          <div className="cgd-section-title"><h2>{fmtDateLong(date)}</h2>{hours && <span className="xs muted">open {fmt12(hours.open)} – {fmt12(hours.close)}</span>}</div>
          <GroomingSlotPicker slots={slots} value={draft.time} onChange={(time) => update({ time })} emptyText={hours ? 'No start time fits this day. Try another date, location or fewer add-ons.' : `${location?.short_name ?? 'This location'} is closed that day.`} />
        </Card>
      ) : <Notice>Pick a date to see available start times. We hold {capacity} grooming tables per location.</Notice>}
      <Textarea label="Anything the groomer should know?" value={draft.notes} onChange={(e) => update({ notes: e.target.value })} maxLength={100} showCount placeholder="Sensitive skin, favourite cut, matting..." rows={2} />
      <ServiceFlowFooter primaryLabel={t('cgd.next')} primaryDisabled={!date || !draft.time} onPrimary={() => nav('/app/grooming/new/checkout')} summary={date && draft.time ? <span>{fmtDateLong(date)} · <strong>{fmt12(draft.time)}</strong></span> : <span>Choose a date and time</span>} />
    </CgdPage>
  );
}
