import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { fmtMoney } from '../../pricing/engine';
import { Chip } from '../../components/atom/Chip/Chip';
import { GroomingAddonRow } from '../../components/molecule/GroomingAddonRow/GroomingAddonRow';
import { ServiceFlowFooter } from '../../components/molecule/ServiceFlowFooter/ServiceFlowFooter';
import { useCustomer } from './useCustomer';
import { useOrderQuote } from './pricing';
import { useGroomingDraft } from './draft';
import { CgdPage, GROOMING_STEPS, Notice } from './layout';

/** C-52 Add-ons (Figma Frame 1171276429): toggles per add-on with size-based added minutes; "Groom another pet" adds a pet to the same order. */
export function GroomingAddonsPage() {
  const t = useT();
  const nav = useNavigate();
  const { pets } = useCustomer();
  const [draft, update] = useGroomingDraft();
  const idx = Math.min(draft.current, Math.max(0, draft.items.length - 1));
  const item = draft.items[idx];
  const pet = pets.find((p) => p.id === item?.petId);
  const q = useOrderQuote(draft.items, pets, false);
  const { addons, packages } = q.tables;
  const incomplete = !item || !item.petId || !item.packageId;
  useEffect(() => { if (incomplete) nav('/app/grooming/new', { replace: true }); }, [incomplete, nav]);
  if (incomplete) return null;
  const big = ['L', 'XL', 'Giant'].includes(pet?.sizeTier ?? 'M');
  const toggle = (id: string, on: boolean) => update((d) => ({ ...d, items: d.items.map((x, i) => (i === idx ? { ...x, addonIds: on ? [...new Set([...x.addonIds, id])] : x.addonIds.filter((a) => a !== id) } : x)) }));
  const others = draft.items.filter((_, i) => i !== idx);
  const canAddPet = pets.some((p) => !draft.items.some((x) => x.petId === p.id));
  const groomAnother = () => { update((d) => ({ ...d, items: [...d.items, { petId: '', packageId: null, addonIds: [] }], current: d.items.length })); nav('/app/grooming/new'); };
  const removeOther = (i: number) => update((d) => { const items = d.items.filter((_, k) => k !== i); return { ...d, items, current: Math.min(items.length - 1, items.findIndex((x) => x === item)) }; });
  const mine = q.perPet[idx];

  return (
    <CgdPage title={t('cgd.addons')} backTo="/app/grooming/new" steps={GROOMING_STEPS} step={1} subtitle={pet ? `${pet.name} · ${packages.find((p) => p.id === item.packageId)?.name}` : undefined}>
      {others.length > 0 && <div className="cgd-chips">{others.map((o) => { const i = draft.items.indexOf(o); const p = pets.find((x) => x.id === o.petId); return <Chip key={i} tone="primary" size="sm" icon="paw" onClick={() => { update({ current: i }); nav('/app/grooming/new'); }} onRemove={() => removeOther(i)}>{p?.name ?? 'Pet'} · {packages.find((k) => k.id === o.packageId)?.name ?? '…'}</Chip>; })}</div>}
      <div className="cgd-list">
        {addons.map((a) => <GroomingAddonRow key={a.id} name={a.name} price={a.price} startingAt={a.starting_at} addedMinutes={big ? a.added_minutes_l : a.added_minutes_sm} description={(a as typeof a & { description?: string | null }).description ?? null} restricted={a.employee_type} checked={item.addonIds.includes(a.id)} onChange={(v) => toggle(a.id, v)} />)}
      </div>
      {mine && mine.addons.some((a) => a.starting_at) && <Notice>"From" prices are confirmed by the groomer at drop-off depending on coat condition.</Notice>}
      <ServiceFlowFooter primaryLabel={t('cgd.next')} onPrimary={() => nav('/app/grooming/new/time')} secondaryLabel={canAddPet ? t('cgd.groomAnother') : undefined} onSecondary={canAddPet ? groomAnother : undefined}
        summary={<span>{draft.items.length} {draft.items.length === 1 ? 'pet' : 'pets'} · {mine ? `${mine.minutes} min` : ''} <strong>{fmtMoney(q.subtotal)}</strong> <span className="xs">before tax</span></span>} />
    </CgdPage>
  );
}
