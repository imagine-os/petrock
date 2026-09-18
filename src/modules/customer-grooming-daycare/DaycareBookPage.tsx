import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import type { LocationRow, SettingRow } from '../../data/schema/core';
import { quoteDaycare, fmtMoney, packageMinutes } from '../../pricing/engine';
import { Chip } from '../../components/atom/Chip/Chip';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Card } from '../../components/molecule/Card/Card';
import { DatePicker } from '../../components/molecule/DatePicker/DatePicker';
import { TimePicker } from '../../components/molecule/TimePicker/TimePicker';
import { PetChoiceStrip } from '../../components/molecule/PetChoiceStrip/PetChoiceStrip';
import { ServiceFlowFooter } from '../../components/molecule/ServiceFlowFooter/ServiceFlowFooter';
import { useCustomer } from './useCustomer';
import { usePricingTables } from './pricing';
import { useDaycareDraft } from './draft';
import { dayWindow, isClosed, toHHMM, toMin } from './slots';
import { addDaysIso, hoursBetween, todayIso } from './format';
import { CgdPage, DAYCARE_STEPS, Notice } from './layout';

/** Shortest possible groom for these pets + buffer: the day must be at least this long to add grooming (R-X02 / R-X07). */
export function groomingFitMinutes(petSizes: string[], packages: { minutes_s: number; minutes_m: number; minutes_l: number; minutes_xl: number; minutes_giant: number }[], bufferMin: number) {
  if (!packages.length || !petSizes.length) return null;
  const shortest = Math.min(...petSizes.map((s) => Math.min(...packages.map((p) => packageMinutes(p as never, (s as 'S' | 'M' | 'L' | 'XL' | 'Giant') ?? 'M')))));
  return shortest + bufferMin;
}

/** C-61 Daycare reservation (Figma DayCare-1): pets, location, day, drop-off / pick-up, live price, add-grooming offer when the day is long enough. */
export function DaycareBookPage() {
  const t = useT();
  const nav = useNavigate();
  const { customer, pets } = useCustomer();
  const { daycarePricing, discounts, fees, taxes, packages } = usePricingTables();
  const [draft, update] = useDaycareDraft();
  const { rows: locations } = useTable<LocationRow>('locations', { where: { active: true }, orderBy: { column: 'sort_order' } });
  const { rows: settings } = useTable<SettingRow>('settings', { where: { key: 'daycare' } });
  const bufferMin = Number((settings[0]?.value as { grooming_buffer_min?: number } | undefined)?.grooming_buffer_min ?? 60);
  const locationId = draft.locationId ?? customer?.home_location_id ?? locations[0]?.id ?? null;
  useEffect(() => { if (!draft.locationId && locationId) update({ locationId }); }, [draft.locationId, locationId, update]);
  const location = locations.find((l) => l.id === locationId);
  const window = dayWindow(location, draft.date);
  // keep times inside the day's window (R-X06)
  useEffect(() => {
    if (!window) return;
    let ci = draft.checkIn, co = draft.checkOut;
    if (toMin(ci) < toMin(window.min)) ci = window.min;
    if (toMin(ci) > toMin(window.max) - 60) ci = toHHMM(toMin(window.max) - 60);
    if (toMin(co) > toMin(window.max)) co = window.max;
    if (toMin(co) < toMin(ci) + 60) co = toHHMM(Math.min(toMin(window.max), toMin(ci) + 60));
    if (ci !== draft.checkIn || co !== draft.checkOut) update({ checkIn: ci, checkOut: co });
  }, [window, draft.checkIn, draft.checkOut, update]);
  const hours = hoursBetween(draft.checkIn, draft.checkOut);
  const chosen = pets.filter((p) => draft.petIds.includes(p.id));
  const quote = useMemo(() => (chosen.length && hours > 0 ? quoteDaycare({ hours, pets: chosen.length, pricing: daycarePricing, discounts, payWithCard: false, fees, taxes }) : null), [chosen.length, hours, daycarePricing, discounts, fees, taxes]);
  const fit = groomingFitMinutes(chosen.map((p) => p.sizeTier), packages, bufferMin);
  const canGroom = fit != null && hours * 60 >= fit;
  const today = todayIso();
  const ready = chosen.length > 0 && !!draft.date && hours >= 1 && !!location;

  return (
    <CgdPage title="Daycare reservation" backTo="/app/daycare" steps={DAYCARE_STEPS} step={0}>
      <PetChoiceStrip multiple label={t('cgd.selectPets')} pets={pets.map((p) => ({ id: p.id, name: p.name, breed: p.breed, size: p.sizeTier, approval: p.approval_status, vaccinesOk: p.vaccinesOk }))} value={draft.petIds} onChange={(ids) => update({ petIds: ids })} onAddPet={() => nav('/app/pets/new')} />
      {chosen.some((p) => !p.vaccinesOk) && <Notice tone="warn">{chosen.filter((p) => !p.vaccinesOk).map((p) => p.name).join(' & ')} still need verified vaccines; the day will stay "Pending verification" until the desk checks the proof.</Notice>}
      <div>
        <div className="field-label">Location</div>
        <div className="cgd-chips">{locations.map((l) => <Chip key={l.id} icon="location" selected={l.id === locationId} onClick={() => update({ locationId: l.id })}>{l.short_name}</Chip>)}</div>
      </div>
      <Card padding="md">
        <div className="cgd-section-title"><h2>Pricing</h2><span className="xs muted">per pet</span></div>
        <div className="cgd-pricing">{daycarePricing.filter((p) => p.active && p.item !== 'walk').map((p) => <div key={p.id} className={`cgd-price ${quote?.item === p.item ? 'is-current' : ''}`}><strong>{fmtMoney(p.price)}</strong><span>{p.name}{p.threshold_hours != null ? (p.item === 'full_day' ? ` · ${p.threshold_hours} h+` : ` · < ${p.threshold_hours} h`) : p.item === 'hour' ? ' · up to 1 h' : ''}</span></div>)}</div>
      </Card>
      <div className="cgd-datepicker"><DatePicker label={t('cgd.dayTime')} value={draft.date} min={today} max={addDaysIso(today, 90)} onChange={(iso) => update({ date: iso })} disabledDates={(iso) => isClosed(location, iso)} /></div>
      <div className="cgd-two">
        <TimePicker label="Check in" value={draft.checkIn} onChange={(v) => update({ checkIn: v })} min={window?.min ?? '07:00'} max={window ? toHHMM(toMin(window.max) - 60) : '18:00'} />
        <TimePicker label="Check out" value={draft.checkOut} onChange={(v) => update({ checkOut: v })} min={toHHMM(toMin(draft.checkIn) + 60)} max={window?.max ?? '19:00'} />
      </div>
      {quote ? (
        <div className="cgd-computed">
          <span className="muted small">{hours} h · {chosen.length} {chosen.length === 1 ? 'pet' : 'pets'}</span>
          <strong>= {fmtMoney(quote.subtotal - quote.discountTotal)} for {quote.lines[0]?.label.replace(/ \(.*\)$/, '')}</strong>
          <span className="xs muted">{quote.discountTotal > 0 ? `includes ${fmtMoney(quote.discountTotal)} extra-pet discount · ` : ''}tax added at checkout</span>
        </div>
      ) : <Notice>Select at least one pet and a day to see the price.</Notice>}
      {chosen.length > 0 && fit != null && (canGroom
        ? <Card padding="sm" tint><Toggle checked={draft.addGrooming} onChange={(v) => update({ addGrooming: v })} label="Add a groom during daycare" description={`A ${hours} h day leaves time for a Grooming & Spa package (about ${fit - bufferMin} min plus handover). You will pick the package after booking.`} /></Card>
        : <Notice tone="warn">A {hours} h daycare day leaves no time for grooming: the shortest groom for {chosen.map((p) => p.name).join(' & ')} needs about {fit} min including handover. Extend the day to add a spa.</Notice>)}
      <ServiceFlowFooter primaryLabel={t('cgd.next')} primaryDisabled={!ready} onPrimary={() => nav('/app/daycare/new/details')} summary={quote ? <span>{chosen.map((p) => p.name).join(', ')} <strong>{fmtMoney(quote.subtotal - quote.discountTotal)}</strong> <span className="xs">before tax</span></span> : undefined} />
    </CgdPage>
  );
}
