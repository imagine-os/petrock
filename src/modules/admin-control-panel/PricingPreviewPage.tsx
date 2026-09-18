/** A-27 Pricing overview: every price table at a glance plus a live quote calculator through src/pricing/engine.ts (R-X44). */
import { useMemo, useState } from 'react';
import { useTable } from '../../data/DataContext';
import type { RoomTypeRow, SeasonRow, RateRow, DiscountRow, FeeRow, TaxRow, PackageRow, AddonRow, DaycarePricingRow } from '../../data/schema/core';
import { quoteHotel, quoteGrooming, quoteDaycare, packagePrice, type Size, type Quote } from '../../pricing/engine';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Select } from '../../components/atom/Select/Select';
import { Input } from '../../components/atom/Input/Input';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { PricingNav } from './PricingPages';
import { fmtMoney2, isoDay, addDays, startOfDay } from './lib';
import './admin.css';

type Kind = 'hotel' | 'grooming' | 'daycare';
const SIZES: Size[] = ['S', 'M', 'L', 'XL', 'Giant'];

function QuoteLines({ q }: { q: Quote }) {
  return (
    <div className="acp-quote">
      {q.lines.map((l, i) => <div key={i} style={{ display: 'contents' }}><span className={l.kind === 'discount' ? 'is-discount' : ''}>{l.label}{l.qty > 1 ? ` × ${l.qty}` : ''}</span><span className={l.kind === 'discount' ? 'is-discount' : ''}>{fmtMoney2(l.amount)}</span></div>)}
      <span className="is-total">Total</span><span className="is-total">{fmtMoney2(q.total)}</span>
      {q.notes.map((n, i) => <span key={i} className="acp-note" style={{ gridColumn: '1 / -1' }}>{n}</span>)}
    </div>
  );
}

export function PricingPreviewPage() {
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: seasons } = useTable<SeasonRow>('seasons');
  const { rows: rates } = useTable<RateRow>('rates');
  const { rows: discounts } = useTable<DiscountRow>('discounts');
  const { rows: fees } = useTable<FeeRow>('fees');
  const { rows: taxes } = useTable<TaxRow>('taxes');
  const { rows: packages } = useTable<PackageRow>('packages', { orderBy: { column: 'sort_order' } });
  const { rows: addons } = useTable<AddonRow>('addons');
  const { rows: daycare } = useTable<DaycarePricingRow>('daycare_pricing');
  const [kind, setKind] = useState<Kind>('hotel');
  const today = startOfDay();
  const [h, setH] = useState({ roomTypeId: '', checkIn: isoDay(addDays(today, 7)), checkOut: isoDay(addDays(today, 10)), dogs: 1, paidInFull: true, card: true });
  const [g, setG] = useState({ pkg: '', size: 'M' as Size, addons: [] as string[], card: true });
  const [d, setD] = useState({ hours: 7, pets: 1, card: false });
  const rtId = h.roomTypeId || roomTypes[0]?.id || '';
  const pkgId = g.pkg || packages[0]?.id || '';
  const hotelQ = useMemo(() => { const rt = roomTypes.find((r) => r.id === rtId); if (!rt) return null; return quoteHotel({ roomTypeId: rt.id, roomTypeName: rt.name, checkIn: new Date(h.checkIn + 'T10:00:00'), checkOut: new Date(h.checkOut + 'T11:00:00'), dogs: h.dogs, paidInFull: h.paidInFull, payWithCard: h.card, rates, seasons, discounts, fees, taxes }); }, [roomTypes, rtId, h, rates, seasons, discounts, fees, taxes]);
  const groomQ = useMemo(() => { const pkg = packages.find((p) => p.id === pkgId) ?? null; return quoteGrooming({ pkg, size: g.size, addons: addons.filter((a) => g.addons.includes(a.id)), payWithCard: g.card, fees, taxes }); }, [packages, pkgId, g, addons, fees, taxes]);
  const dcQ = useMemo(() => quoteDaycare({ hours: d.hours, pets: d.pets, pricing: daycare, discounts, payWithCard: d.card, fees, taxes }), [d, daycare, discounts, fees, taxes]);
  const baseRate = (rt: string, kind: 'weekday' | 'weekend') => rates.find((r) => r.room_type_id === rt && r.day_kind === kind && !r.season_id)?.price_per_night;
  const cardFee = fees.find((f) => f.kind === 'card' && f.active);
  const tax = taxes.find((t) => t.active);
  return (
    <div className="page stack">
      <PageHeader code="A-27" title="Pricing" subtitle="Everything the pricing engine reads, in one view, plus a live quote to prove every page computes from these tables and never hardcodes a price."><PricingNav current="A-27" /></PageHeader>
      <div className="acp-kpis">
        {roomTypes.map((rt) => <StatTile key={rt.id} label={`${rt.name} per night`} value={baseRate(rt.id, 'weekday') != null ? `${fmtMoney2(baseRate(rt.id, 'weekday')!)} / ${fmtMoney2(baseRate(rt.id, 'weekend') ?? 0)}` : '—'} hint="Mon-Thu / Fri-Sun base" icon="bed" />)}
        <StatTile label="Card fee" value={cardFee ? `${cardFee.percent}%` : 'none'} hint={cardFee?.name} icon="card" />
        <StatTile label="Tax" value={tax ? `${tax.service_rate}% / ${tax.boarding_rate}%` : 'none'} hint="service / boarding" icon="dollar" />
      </div>
      <div className="acp-two">
        <Card padding="md" header={<div className="acp-card-title"><h3>Quote calculator</h3><span className="acp-note">quoteHotel · quoteGrooming · quoteDaycare</span></div>}>
          <div className="stack">
            <Tabs<Kind> items={[{ key: 'hotel', label: 'Hotel stay' }, { key: 'grooming', label: 'Grooming & Spa' }, { key: 'daycare', label: 'Daycare' }]} value={kind} onChange={setKind} variant="pills" size="sm" />
            {kind === 'hotel' && <div className="acp-form-grid">
              <Select label="Room type" value={rtId} onChange={(e) => setH({ ...h, roomTypeId: e.target.value })} options={roomTypes.map((r) => ({ value: r.id, label: r.name }))} />
              <Input label="Dogs sharing" type="number" min={1} max={4} value={h.dogs} onChange={(e) => setH({ ...h, dogs: Math.max(1, Number(e.target.value) || 1) })} />
              <Input label="Check-in" type="date" value={h.checkIn} onChange={(e) => setH({ ...h, checkIn: e.target.value })} />
              <Input label="Check-out" type="date" value={h.checkOut} min={h.checkIn} onChange={(e) => setH({ ...h, checkOut: e.target.value })} />
              <Toggle label="Paid in full" checked={h.paidInFull} onChange={(v) => setH({ ...h, paidInFull: v })} description="Long-stay discounts need full payment" />
              <Toggle label="Pay by card" checked={h.card} onChange={(v) => setH({ ...h, card: v })} description="Adds the card service fee" />
            </div>}
            {kind === 'grooming' && <div className="acp-form-grid">
              <Select label="Package" value={pkgId} onChange={(e) => setG({ ...g, pkg: e.target.value })} options={packages.map((p) => ({ value: p.id, label: p.name }))} />
              <Select label="Dog size" value={g.size} onChange={(e) => setG({ ...g, size: e.target.value as Size })} options={SIZES.map((s) => ({ value: s, label: s }))} />
              <div className="is-full stack-sm"><span className="xs muted">Add-ons</span><div className="row wrap" style={{ gap: 12 }}>{addons.filter((a) => a.active).map((a) => <Checkbox key={a.id} label={`${a.name} ${fmtMoney2(a.price)}${a.starting_at ? '+' : ''}`} checked={g.addons.includes(a.id)} onChange={(e) => setG({ ...g, addons: e.target.checked ? [...g.addons, a.id] : g.addons.filter((x) => x !== a.id) })} />)}</div></div>
              <Toggle label="Pay by card" checked={g.card} onChange={(v) => setG({ ...g, card: v })} />
            </div>}
            {kind === 'daycare' && <div className="acp-form-grid">
              <Input label="Hours" type="number" min={1} max={12} value={d.hours} onChange={(e) => setD({ ...d, hours: Math.max(1, Number(e.target.value) || 1) })} hint={`Full day from ${daycare.find((x) => x.item === 'full_day')?.threshold_hours ?? '?'} h`} />
              <Input label="Pets" type="number" min={1} max={5} value={d.pets} onChange={(e) => setD({ ...d, pets: Math.max(1, Number(e.target.value) || 1) })} />
              <Toggle label="Pay by card" checked={d.card} onChange={(v) => setD({ ...d, card: v })} />
            </div>}
          </div>
        </Card>
        <Card padding="md" header={<h3>Quote</h3>}>
          {kind === 'hotel' && (hotelQ ? <QuoteLines q={hotelQ} /> : <p className="acp-empty-inline">No room type</p>)}
          {kind === 'grooming' && <QuoteLines q={groomQ} />}
          {kind === 'daycare' && <QuoteLines q={dcQ} />}
        </Card>
      </div>
      <Card padding="md" header={<h3>Grooming packages by size</h3>}>
        <div className="acp-price-grid">{packages.filter((p) => p.active).flatMap((p) => SIZES.map((s) => <div key={`${p.id}${s}`} className="acp-price">{p.name} · {s}<strong>{fmtMoney2(packagePrice(p, s))}</strong></div>))}</div>
      </Card>
    </div>
  );
}
