import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useData, useTable } from '../../data/DataContext';
import { usePayments } from '../../payments';
import type { LocationRow } from '../../data/schema/core';
import { quoteDaycare, fmtMoney } from '../../pricing/engine';
import { Card } from '../../components/molecule/Card/Card';
import { Chip } from '../../components/atom/Chip/Chip';
import { ServiceQuoteLines } from '../../components/molecule/ServiceQuoteLines/ServiceQuoteLines';
import { ServicePayMethod, EMPTY_CARD, cardValid, type MockCard, type PayMethod } from '../../components/molecule/ServicePayMethod/ServicePayMethod';
import { ServiceFlowFooter } from '../../components/molecule/ServiceFlowFooter/ServiceFlowFooter';
import { fmt12 } from '../../components/molecule/TimePicker/TimePicker';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomer } from './useCustomer';
import { usePricingTables } from './pricing';
import { useDaycareDraft } from './draft';
import { createDaycareBooking } from './actions';
import { fmtDateLong, hoursBetween } from './format';
import { CgdPage, DAYCARE_STEPS, Notice } from './layout';

/** C-63 Daycare checkout (Figma DayCare-3 was empty; designed fresh): summary, pets, payment method, engine totals, pay. */
export function DaycareCheckoutPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const payments = usePayments();
  const { toast } = useToast();
  const { customer, pets, userId } = useCustomer();
  const { daycarePricing, discounts, fees, taxes } = usePricingTables();
  const [draft, , reset] = useDaycareDraft();
  const [method, setMethod] = useState<PayMethod>('card');
  const [card, setCard] = useState<MockCard>(EMPTY_CARD);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { rows: locations } = useTable<LocationRow>('locations');
  const location = locations.find((l) => l.id === draft.locationId);
  const chosen = pets.filter((p) => draft.petIds.includes(p.id));
  const hours = hoursBetween(draft.checkIn, draft.checkOut);
  const ready = chosen.length > 0 && !!draft.date && hours >= 1 && !!location;
  useEffect(() => { if (!ready) nav('/app/daycare/new', { replace: true }); }, [ready, nav]);
  const quote = useMemo(() => quoteDaycare({ hours: Math.max(1, hours), pets: Math.max(1, chosen.length), pricing: daycarePricing, discounts, payWithCard: method === 'card', fees, taxes }), [hours, chosen.length, daycarePricing, discounts, method, fees, taxes]);
  const fee = fees.find((f) => f.active && f.kind === 'card');

  const pay = async () => {
    if (!customer) return;
    setBusy(true); setError(null);
    const res = await createDaycareBooking(data, payments, { draft, quote, pets, customerId: customer.id, userId, pay: { method, card }, locationName: location?.short_name ?? 'Petrock' });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    reset();
    toast({ tone: 'success', title: res.status === 'confirmed' ? 'Daycare booked' : 'Daycare requested' });
    nav(`/app/daycare/bookings/${res.id}?new=1`, { replace: true });
  };

  return (
    <CgdPage title={t('cgd.checkout')} backTo="/app/daycare/new/details" steps={DAYCARE_STEPS} step={2}>
      <Card padding="md">
        <dl className="cgd-kvs">
          <div className="cgd-kv"><dt>Day</dt><dd>{draft.date && fmtDateLong(draft.date)}</dd></div>
          <div className="cgd-kv"><dt>Drop off / pick up</dt><dd>{fmt12(draft.checkIn)} – {fmt12(draft.checkOut)} ({hours} h)</dd></div>
          <div className="cgd-kv"><dt>Where</dt><dd>{location?.name ?? '—'}</dd></div>
          <div className="cgd-kv"><dt>Rate</dt><dd>{quote.lines[0]?.label}</dd></div>
          {draft.addGrooming && <div className="cgd-kv"><dt>Grooming</dt><dd>Wants a groom during the day</dd></div>}
        </dl>
        <div className="cgd-chips" style={{ marginTop: 12 }}>{chosen.map((p) => <Chip key={p.id} icon="paw" tone="primary" size="sm">{p.name}{draft.details[p.id]?.fleaMedication ? ' · flea med' : ''}{draft.details[p.id]?.medicalAlert ? ' · alert' : ''}</Chip>)}</div>
      </Card>
      {chosen.some((p) => !p.vaccinesOk) && <Notice tone="warn">Some required vaccines are not verified: the day stays "Pending verification" until the front desk checks the proof.</Notice>}
      <ServicePayMethod value={method} onChange={setMethod} card={card} onCardChange={setCard} needsCardElement={payments.needsCardElement} feeNote={fee ? `${fee.name} ${fee.percent}% applies to card payments in the app.` : undefined} error={error} />
      <Card padding="md"><ServiceQuoteLines lines={quote.lines} total={quote.total} /></Card>
      <ServiceFlowFooter primaryLabel={method === 'card' ? `Pay ${fmtMoney(quote.total)}` : `Book · pay ${fmtMoney(quote.total)} at location`} primaryLoading={busy} primaryDisabled={!ready || (method === 'card' && !payments.needsCardElement && !cardValid(card))} onPrimary={pay} hint={method === 'card' ? 'Mock payment today; Stripe later. Cards ending 0002 are declined.' : 'We hold the spot; pay at drop-off.'} />
    </CgdPage>
  );
}
