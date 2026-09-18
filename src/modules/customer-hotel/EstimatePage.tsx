import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { LocationRow } from '../../data/schema/core';
import { fmtMoney, round2 } from '../../pricing/engine';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { RadioGroup } from '../../components/atom/RadioGroup/RadioGroup';
import { HotelEstimateCard } from '../../components/molecule/HotelEstimateCard/HotelEstimateCard';
import { StayDatesCard } from '../../components/molecule/StayDatesCard/StayDatesCard';
import { useT } from '../../i18n';
import { STEP_LABELS, STEP_PATHS, draftStage, useHotelDraft } from './draft';
import { buildGroomingQuotes, buildHotelQuote, chargeFor, depositFor, useCustomerAccount, useHotelSettings, usePricingTables } from './lib';
import './customer-hotel.css';

/** Everything the estimate and payment pages need, computed once from the draft and the settings tables. */
export function useEstimate() {
  const { draft } = useHotelDraft();
  const { pets: myPets } = useCustomerAccount();
  const pricing = usePricingTables();
  const settings = useHotelSettings();
  const pets = myPets.filter((p) => draft.petIds.includes(p.id));
  const roomType = pricing.roomTypes.find((r) => r.id === draft.roomTypeId) ?? null;
  const paidInFull = draft.payPlan === 'full';
  const hotel = roomType ? buildHotelQuote(draft, roomType, pets, paidInFull, pricing) : null;
  const grooming = buildGroomingQuotes(draft.grooming, pets, pricing);
  const groomingTotal = round2(grooming.reduce((s, g) => s + g.quote.total, 0));
  const baseTotal = round2((hotel?.total ?? 0) + groomingTotal);
  const deposit = depositFor(baseTotal, settings);
  const dueBase = paidInFull ? baseTotal : deposit;
  const charge = chargeFor(dueBase, draft.payMethod === 'card', pricing.fees);
  const balance = round2(baseTotal - dueBase);
  return { draft, pets, roomType, pricing, settings, hotel, grooming, groomingTotal, baseTotal, deposit, dueBase, charge, balance, paidInFull };
}

/** C-35 · Hotel: estimate (Figma Booking Detail / Estimate) - deposit vs full, card vs cash, engine lines. */
export function EstimatePage() {
  const t = useT();
  const nav = useNavigate();
  const { patch } = useHotelDraft();
  const est = useEstimate();
  const { rows: locations } = useTable<LocationRow>('locations');
  if (draftStage(est.draft) < 5) return <Navigate to={STEP_PATHS[draftStage(est.draft)]} replace />;
  const { draft, hotel, roomType, grooming, groomingTotal, baseTotal, deposit, dueBase, charge, balance, settings, pets } = est;
  const location = locations.find((l) => l.id === draft.locationId);
  const pay = (plan: 'deposit' | 'full') => { patch({ payPlan: plan }); nav(STEP_PATHS[6]); };
  const longStayHint = hotel?.notes.some((n) => /pay in full/i.test(n));
  const fullCharge = chargeFor(baseTotal, draft.payMethod === 'card', est.pricing.fees);
  const depositCharge = chargeFor(deposit, draft.payMethod === 'card', est.pricing.fees);

  return (
    <HotelBookingFrame title={t('customer-hotel.estimate')} backTo={STEP_PATHS[4]} steps={STEP_LABELS} step={5} onStepClick={(i) => nav(STEP_PATHS[i])}
      footer={<><Button size="lg" variant={draft.payPlan === 'deposit' ? 'primary' : 'secondary'} onClick={() => pay('deposit')}>{t('customer-hotel.payDeposit')} {fmtMoney(depositCharge.charged)}</Button><Button size="lg" variant={draft.payPlan === 'full' ? 'primary' : 'secondary'} onClick={() => pay('full')}>{t('customer-hotel.payFull')} {fmtMoney(fullCharge.charged)}</Button></>}
      footerNote={longStayHint || draft.payPlan === 'full' ? <span className="tone-success">{t('customer-hotel.payFullHint')}</span> : `Deposit is ${settings.deposit_percent}% now, the rest at check-in.`}>
      <SegmentedControl block ariaLabel="Payment plan" value={draft.payPlan} onChange={(v) => patch({ payPlan: v })} options={[{ value: 'deposit', label: `Deposit (${settings.deposit_percent}%)` }, { value: 'full', label: 'Pay in full' }]} />
      <RadioGroup inline name="paymethod" label="How will you pay?" value={draft.payMethod} onChange={(v) => patch({ payMethod: v })} options={[{ value: 'card', label: 'Credit card' }, { value: 'cash', label: 'Cash at location' }]} />
      <div className="ch-label">Booking detail</div>
      {hotel && roomType && <HotelEstimateCard title={`Hotel ${roomType.name}${hotel.rooms.length > 1 ? ` × ${hotel.rooms.length}` : ''}`} headline={fmtMoney(hotel.total)} lines={hotel.lines} total={hotel.total} notes={hotel.notes} footnote={`${pets.map((p) => p.name).join(', ')} · ${hotel.nights} night${hotel.nights === 1 ? '' : 's'} · ${location?.name ?? ''}`} />}
      <StayDatesCard readOnly value={{ checkIn: draft.checkIn, checkInTime: draft.checkInTime, checkOut: draft.checkOut, checkOutTime: draft.checkOutTime }} nights={hotel?.nights} />
      {grooming.length > 0 ? (
        <HotelEstimateCard icon="scissors" title="Grooming & Spa" headline={fmtMoney(groomingTotal)} lines={grooming.flatMap((g) => g.quote.lines.map((l) => ({ ...l, label: l.kind === 'tax' ? l.label : `${g.pet.name} · ${l.label}` })))} total={groomingTotal} notes={[...new Set(grooming.flatMap((g) => g.quote.notes))]} footnote={<Link to={STEP_PATHS[3]}>Change grooming</Link>} />
      ) : (
        <div className="ch-band"><span>{t('customer-hotel.groomCopy')}</span><Link to={STEP_PATHS[3]}><Button variant="secondary" block icon="scissors">Add grooming</Button></Link></div>
      )}
      <div className="ch-label">Payment details</div>
      <HotelEstimateCard icon="dollar" lines={[{ label: 'Hotel rent', qty: 1, unit: hotel?.total ?? 0, amount: hotel?.total ?? 0, kind: 'service' }, ...(groomingTotal ? [{ label: 'Grooming total', qty: 1, unit: groomingTotal, amount: groomingTotal, kind: 'service' as const }] : [])]} total={baseTotal}
        extras={[{ label: draft.payPlan === 'full' ? 'Due now (in full)' : `Deposit due now (${settings.deposit_percent}%)`, value: fmtMoney(dueBase), strong: true }, ...(charge.fee ? [{ label: `Card service fee (${charge.feePercent}%)`, value: fmtMoney(charge.fee), tone: 'muted' as const }] : []), { label: 'Charged now', value: fmtMoney(charge.charged), strong: true, tone: 'success' as const }, { label: 'Balance at check-in', value: fmtMoney(balance), tone: 'muted' as const }]}
        footnote={charge.feePercent ? `* There is a ${charge.feePercent}% non-cash fee when paying by card. Tax and discounts come from the current Petrock price list.` : 'Tax and discounts come from the current Petrock price list.'} />
    </HotelBookingFrame>
  );
}
