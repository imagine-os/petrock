import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useData, useTable } from '../../data/DataContext';
import { usePayments } from '../../payments';
import type { EmployeeRow, LocationRow } from '../../data/schema/core';
import { fmtMoney } from '../../pricing/engine';
import { Card } from '../../components/molecule/Card/Card';
import { GroomingPackageCard } from '../../components/molecule/GroomingPackageCard/GroomingPackageCard';
import { ServiceQuoteLines } from '../../components/molecule/ServiceQuoteLines/ServiceQuoteLines';
import { ServicePayMethod, EMPTY_CARD, cardValid, type MockCard, type PayMethod } from '../../components/molecule/ServicePayMethod/ServicePayMethod';
import { ServiceFlowFooter } from '../../components/molecule/ServiceFlowFooter/ServiceFlowFooter';
import { fmt12 } from '../../components/molecule/TimePicker/TimePicker';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomer } from './useCustomer';
import { useOrderQuote } from './pricing';
import { useGroomingDraft } from './draft';
import { createGroomingOrder } from './actions';
import { fmtDateLong } from './format';
import { CgdPage, GROOMING_STEPS, Notice } from './layout';

/** C-54 Summary & payment (Figma Frame 1171276435): per-pet package + add-ons, when / where, payment method, engine totals, pay. */
export function GroomingCheckoutPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const payments = usePayments();
  const { toast } = useToast();
  const { customer, pets, userId } = useCustomer();
  const [draft, , reset] = useGroomingDraft();
  const [method, setMethod] = useState<PayMethod>('card');
  const [card, setCard] = useState<MockCard>(EMPTY_CARD);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const q = useOrderQuote(draft.items, pets, method === 'card');
  const { rows: locations } = useTable<LocationRow>('locations');
  const { rows: groomers } = useTable<EmployeeRow>('employees', { where: { is_groomer: true } });
  const location = locations.find((l) => l.id === draft.locationId);
  const groomer = groomers.find((g) => g.id === draft.groomerId);
  const ready = !!(draft.date && draft.time && draft.locationId && draft.items.length && draft.items.every((i) => i.petId && i.packageId));
  useEffect(() => { if (!ready) nav('/app/grooming/new', { replace: true }); }, [ready, nav]);
  const fee = q.tables.fees.find((f) => f.active && f.kind === 'card');
  const vaccinesOk = q.perPet.every((p) => p.pet?.vaccinesOk);

  const pay = async () => {
    if (!customer) return;
    setBusy(true); setError(null);
    const res = await createGroomingOrder(data, payments, { draft, quote: q, pets, customerId: customer.id, userId, pay: { method, card }, locationName: location?.short_name ?? 'Petrock' });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    reset();
    toast({ tone: 'success', title: res.status === 'confirmed' ? 'Grooming & Spa booked' : 'Grooming & Spa requested', body: res.status === 'pending_vaccines' ? 'Pending vaccine verification' : undefined });
    nav(`/app/grooming/orders/${res.id}?new=1`, { replace: true });
  };

  return (
    <CgdPage title={t('cgd.checkout')} backTo="/app/grooming/new/time" steps={GROOMING_STEPS} step={3}>
      <Card padding="md">
        <dl className="cgd-kvs">
          <div className="cgd-kv"><dt>When</dt><dd>{draft.date && fmtDateLong(draft.date)} · {draft.time && fmt12(draft.time)}</dd></div>
          <div className="cgd-kv"><dt>Where</dt><dd>{location?.name ?? '—'}</dd></div>
          <div className="cgd-kv"><dt>Groomer</dt><dd>{groomer ? groomer.display_name ?? groomer.name : 'Any available'}</dd></div>
          <div className="cgd-kv"><dt>Duration</dt><dd>about {q.longestMinutes} min</dd></div>
          {draft.notes && <div className="cgd-kv"><dt>Notes</dt><dd>{draft.notes}</dd></div>}
        </dl>
      </Card>
      <div className="cgd-list">
        <div className="field-label">Grooming details</div>
        {q.perPet.map((p) => (
          <Card key={p.item.petId} padding="sm">
            <div className="row-between"><strong>{p.pet?.name}</strong><span className="xs muted">size {p.pet?.sizeTier} · {p.minutes} min</span></div>
            {p.pkg && <GroomingPackageCard compact name={p.pkg.name} tier={p.pkg.tier} price={p.quote.lines[0]?.amount ?? 0} size={p.pet?.sizeTier} />}
            {p.addons.length > 0 && <dl className="cgd-kvs" style={{ marginTop: 8 }}>{p.addons.map((a) => <div key={a.id} className="cgd-kv"><dt>+ {a.name}{a.starting_at ? ' (from)' : ''}</dt><dd className="tone-success">{fmtMoney(a.price)}</dd></div>)}</dl>}
          </Card>
        ))}
      </div>
      {!vaccinesOk && <Notice tone="warn">Some required vaccines are not verified yet: the order will stay "Pending verification" until the front desk checks the proof. Upload it under Pets to speed this up.</Notice>}
      <ServicePayMethod value={method} onChange={setMethod} card={card} onCardChange={setCard} needsCardElement={payments.needsCardElement} feeNote={fee ? `${fee.name} ${fee.percent}% applies to card payments in the app.` : undefined} error={error} />
      <Card padding="md"><ServiceQuoteLines lines={q.lines} total={q.total} notes={q.notes} /><p className="xs muted" style={{ marginTop: 8 }}>{t('cgd.groomingEstimateNote')}</p></Card>
      <ServiceFlowFooter primaryLabel={method === 'card' ? `Pay ${fmtMoney(q.total)}` : `Book · pay ${fmtMoney(q.total)} at location`} primaryLoading={busy} primaryDisabled={!ready || (method === 'card' && !payments.needsCardElement && !cardValid(card))} onPrimary={pay} hint={method === 'card' ? 'Mock payment today; Stripe later. Cards ending 0002 are declined.' : 'We hold your slot; pay when you drop off.'} />
    </CgdPage>
  );
}
