import { Navigate, useNavigate } from 'react-router-dom';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { RadioGroup } from '../../components/atom/RadioGroup/RadioGroup';
import { Chip } from '../../components/atom/Chip/Chip';
import { Card } from '../../components/molecule/Card/Card';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { HotelEstimateCard } from '../../components/molecule/HotelEstimateCard/HotelEstimateCard';
import { fmtMoney, packagePrice, round2, type Size } from '../../pricing/engine';
import { useT } from '../../i18n';
import { STEP_LABELS, STEP_PATHS, draftStage, useHotelDraft } from './draft';
import { buildGroomingQuotes, useCustomerAccount, usePricingTables } from './lib';
import './customer-hotel.css';

/** C-33 · Hotel: add Grooming & Spa during the stay (packages by size + add-ons per pet). */
export function GroomingPage() {
  const t = useT();
  const nav = useNavigate();
  const { draft, patch } = useHotelDraft();
  const { pets: myPets } = useCustomerAccount();
  const pricing = usePricingTables();
  if (draftStage(draft) < 3) return <Navigate to={STEP_PATHS[draftStage(draft)]} replace />;
  const pets = myPets.filter((p) => draft.petIds.includes(p.id));
  const items = buildGroomingQuotes(draft.grooming, pets, pricing);
  const total = round2(items.reduce((s, i) => s + i.quote.total, 0));
  const setPkg = (petId: string, packageId: string | null) => patch((d) => ({ grooming: { ...d.grooming, [petId]: { packageId, addonIds: packageId ? d.grooming[petId]?.addonIds ?? [] : [] } } }));
  const toggleAddon = (petId: string, id: string) => patch((d) => { const g = d.grooming[petId] ?? { packageId: null, addonIds: [] }; return { grooming: { ...d.grooming, [petId]: { ...g, addonIds: g.addonIds.includes(id) ? g.addonIds.filter((x) => x !== id) : [...g.addonIds, id] } } }; });
  const go = (skip: boolean) => { patch({ groomingDecided: true, ...(skip ? { grooming: {} } : {}) }); nav(STEP_PATHS[4]); };

  return (
    <HotelBookingFrame title={t('customer-hotel.grooming')} backTo={STEP_PATHS[2]} steps={STEP_LABELS} step={3} onStepClick={(i) => nav(STEP_PATHS[i])}
      footer={<><Button size="lg" variant="secondary" onClick={() => go(true)}>Skip</Button><Button size="lg" onClick={() => go(false)}>{items.length ? `Add ${fmtMoney(total)} of grooming` : 'Continue'}</Button></>}
      footerNote="Groomed on check-out morning so your dog comes home fresh.">
      <div className="ch-band"><span className="ch-band-title">Grooming & Spa at the end of the stay</span><span>{t('customer-hotel.groomCopy')}</span></div>
      {pets.map((p) => {
        const size = (p.size ?? 'M') as Size;
        const g = draft.grooming[p.id] ?? { packageId: null, addonIds: [] };
        return (
          <Card key={p.id} padding="md">
            <div className="stack">
              <div className="ch-pet-head"><Avatar name={p.name} kind="pet" size={32} /><div><strong>{p.name}</strong> <span className="xs muted">· size {size}{p.weight_lbs ? ` (${p.weight_lbs} lb)` : ''}</span></div></div>
              <RadioGroup cards name={`pkg-${p.id}`} value={g.packageId ?? 'none'} onChange={(v) => setPkg(p.id, v === 'none' ? null : v)}
                options={[{ value: 'none', label: 'No grooming for ' + p.name }, ...pricing.packages.map((pk) => ({ value: pk.id, label: <span className="row-between" style={{ width: '100%' }}><span>{pk.name}</span><strong>{fmtMoney(packagePrice(pk, size))}</strong></span>, description: pk.inclusions ?? undefined }))]} />
              {g.packageId && (
                <div className="stack-sm">
                  <span className="ch-label">Add-ons</span>
                  <div className="ch-addons">{pricing.addons.map((a) => <Chip key={a.id} size="sm" selected={g.addonIds.includes(a.id)} onClick={() => toggleAddon(p.id, a.id)}>{a.name} · {a.starting_at ? 'from ' : ''}{fmtMoney(a.price)}</Chip>)}</div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
      {items.length > 0 && <HotelEstimateCard compact icon="scissors" title="Grooming & Spa" lines={items.flatMap((i) => i.quote.lines.map((l) => ({ ...l, label: l.kind === 'tax' ? l.label : `${i.pet.name} · ${l.label}` })))} total={total} notes={[...new Set(items.flatMap((i) => i.quote.notes))]} />}
    </HotelBookingFrame>
  );
}
