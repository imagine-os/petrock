import { Link } from 'react-router-dom';
import { useTable } from '../../../data/DataContext';
import type { CapacityRow } from '../../../data/schema/core';
import { fmtMoney } from '../../../pricing/engine';
import { PET_SIZES } from '../../../domain/booking';
import { useT } from '../../../i18n/I18nProvider';
import { SiteLayout } from '../../../components/template/SiteLayout/SiteLayout';
import { SiteHero } from '../../../components/molecule/SiteHero/SiteHero';
import { Button } from '../../../components/atom/Button/Button';
import { Card } from '../../../components/molecule/Card/Card';
import { Badge } from '../../../components/atom/Badge/Badge';
import { SectionHead, CtaBand, CheckList } from './siteBits';
import { SitePhoto, type PhotoSlug } from './siteImages';
import { from, fromNightly, weekendNightly, useLocations, usePricingTables, useVaccineTypes } from './teasers';

const K = 'extras-manual-website.site';
const ROOM_PHOTO: Record<string, PhotoSlug> = { penthouse: 'penthouse-photo-layout', suite: 'dsc06426' };

/** P-02 Hotel: room types with the client's own inclusion list and "from" rates, shared-room and long-stay rules, vaccines. */
export function SiteHotel() {
  const t = useT();
  const { roomTypes, rates, seasons, discounts } = usePricingTables();
  const locations = useLocations();
  const { rows: caps } = useTable<CapacityRow>('capacities');
  const vaccines = useVaccineTypes();
  const rooms = caps.filter((c) => c.kind === 'penthouse' || c.kind === 'suite').reduce((s, c) => s + c.max_simultaneous, 0);
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow={t(`${K}.services.hotel.title`)} title={t(`${K}.hotel.title`)} lead={`${t(`${K}.hotel.lead`)} ${t(`${K}.hotel.rooms`, { rooms, locations: locations.length })}`}
        actions={<><Link to="/site/book"><Button size="lg" iconRight="arrow-right">Book a stay</Button></Link><Link to="/site/pricing"><Button size="lg" variant="secondary">Full pricing</Button></Link></>} />
      <div className="container ps">
        <section className="ps-section">
          {roomTypes.map((rt, i) => (
            <div key={rt.id} className="ps-room">
              <SitePhoto slug={ROOM_PHOTO[rt.key] ?? 'dsc06464'} ratio="4 / 3" sizes="(max-width: 900px) 100vw, 40vw" />
              <div className="stack">
                <SectionHead eyebrow={`Room type ${i + 1}`} title={rt.name} lead={rt.description} />
                <div className="row wrap"><span className="ps-from md">{from(fromNightly(rates, rt.id))} / night per pet</span>{weekendNightly(rates, rt.id) != null && <span className="small muted">Fri–Sun {fmtMoney(weekendNightly(rates, rt.id)!)}</span>}{rt.max_weight_lbs != null && <Badge tone="info">up to {rt.max_weight_lbs} lb</Badge>}</div>
                <CheckList prefix={`${K}.hotel.inc`} count={6} />
                {rt.key === 'penthouse' && <p className="small muted">{t(`${K}.hotel.penthouseExtra`)}</p>}
                <Link to="/site/book"><Button iconRight="arrow-right">Book {rt.name}</Button></Link>
              </div>
            </div>
          ))}
          <p className="ps-inline-note">{t(`${K}.hotel.vaccineNote`)} {t(`${K}.hotel.largeDogNote`)}</p>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Good to know" title="Rooms, dogs and discounts" />
          <div className="grid grid-3">
            <Card padding="lg" className="stack-sm"><h3>Sharing a room</h3><p className="small muted">Two or three dogs from the same family can share a penthouse or suite. Multi-dog discounts apply per dog per night: {discounts.filter((d) => d.kind === 'multi_dog').map((d) => `${d.name} (${fmtMoney(d.amount_off)} off)`).join('; ') || 'see pricing'}.</p></Card>
            <Card padding="lg" className="stack-sm"><h3>Longer stays</h3><p className="small muted">{discounts.filter((d) => d.kind === 'long_stay').map((d) => `${d.name}: ${d.percent_off}% off${d.excludes_holidays ? ', holidays excluded' : ''}`).join('; ') || 'Ask us about long-stay discounts.'}{seasons.length ? ` Seasonal rates apply during ${seasons.map((s) => s.name).join(', ')}.` : ''}</p></Card>
            <Card padding="lg" className="stack-sm"><h3>Vaccines first</h3><p className="small muted">Required before any stay: {vaccines.filter((v) => v.required).map((v) => v.short_name).join(', ')}. Recommended: {vaccines.filter((v) => !v.required).map((v) => v.short_name).join(', ')}. Upload the certificate in the app; we verify it the same day and your booking confirms.</p><Link to="/site/policies" className="small">Vaccines & policies →</Link></Card>
          </div>
        </section>
        <CtaBand title="Pick your dates in the app" lead="You will see the exact price for your dates, dogs and room before paying a deposit." />
      </div>
    </SiteLayout>
  );
}

/** P-03 Grooming & Spa: the real Spa Menu in the client's words, packages by size from the tables, add-ons, sanitation and estimate notes. */
export function SiteGrooming() {
  const t = useT();
  const { packages, addons, fees } = usePricingTables();
  const sanitation = fees.find((f) => f.kind === 'grooming_sanitation');
  const key = (s: string) => `price_${s.toLowerCase()}` as 'price_s' | 'price_m' | 'price_l' | 'price_xl' | 'price_giant';
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow={t(`${K}.services.spa.title`)} title={t(`${K}.grooming.title`)} lead={t(`${K}.grooming.lead`)} actions={<Link to="/site/book"><Button size="lg" iconRight="arrow-right">Book a groom</Button></Link>} />
      <div className="container ps">
        <section className="ps-section">
          <div className="ps-room">
            <SitePhoto slug="grooming" ratio="4 / 3" sizes="(max-width: 900px) 100vw, 40vw" />
            <div className="stack">
              <SectionHead eyebrow="Packages" title="Gold, Platinum, Diamond" lead="Live from our price list. Sizes: S under 20 lb, M under 40, L under 70, XL under 100, Giant 100 lb and up." />
              <p className="small muted">{sanitation?.amount ? t(`${K}.grooming.sanitationWithFee`, { amount: fmtMoney(sanitation.amount) }) : t(`${K}.grooming.sanitation`)}</p>
              <p className="small muted">{t(`${K}.grooming.estimate`)}</p>
            </div>
          </div>
          <div className="ps-tiles">{packages.map((p) => <Card key={p.id} padding="lg" className="ps-tile" tint={p.tier === 'platinum'}><div className="row-between"><h3>{p.name}</h3><Badge tone={p.tier === 'diamond' ? 'primary' : 'neutral'}>{p.tier}</Badge></div><p>{p.inclusions}</p><span className="ps-from">{from(p.price_s)} · {p.minutes_s}–{p.minutes_giant} min</span></Card>)}</div>
          <Card padding="none"><div className="ps-scroll"><table className="ps-price-table"><thead><tr><th>Package</th>{PET_SIZES.map((s) => <th key={s} className="num">{s}</th>)}</tr></thead><tbody>{packages.map((p) => <tr key={p.id}><td><strong>{p.name}</strong></td>{PET_SIZES.map((s) => <td key={s} className="num">{fmtMoney(p[key(s)])}</td>)}</tr>)}</tbody></table></div></Card>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Add-ons" title="On the side" lead="Add-ons add minutes to the appointment and a fixed price; some start at a price and are confirmed by the groomer." />
          <div className="grid grid-3">{addons.map((a) => <Card key={a.id} padding="lg" className="stack-sm"><div className="row-between"><h3>{a.name}</h3><span className="ps-from">{a.starting_at ? 'from ' : ''}{fmtMoney(a.price)}</span></div><p className="small muted">+{a.added_minutes_sm} min (S–M) · +{a.added_minutes_l} min (L and up){a.employee_type ? ` · ${a.employee_type} only` : ''}</p></Card>)}</div>
        </section>
        <section className="ps-section"><div className="ps-room"><div className="stack"><SectionHead eyebrow="Hotel guests" title="Clean when they go home" lead="We generally do grooms at the end of hotel stays. Add grooming when you book the hotel, or message the front desk during the stay." /><Link to="/site/hotel"><Button variant="secondary">See the hotel</Button></Link></div><SitePhoto slug="img-3110" ratio="4 / 3" sizes="(max-width: 900px) 100vw, 40vw" /></div></section>
        <CtaBand title="Book a spa day" lead="Choose your dog, the package for their size, add-ons and a time. Pay in the app or at the desk." />
      </div>
    </SiteLayout>
  );
}

/** P-04 Daycare: the Play area in the client's words, price items and thresholds, a typical day, capacity. */
export function SiteDaycare() {
  const t = useT();
  const { daycare, discounts } = usePricingTables();
  const locations = useLocations();
  const { rows: caps } = useTable<CapacityRow>('capacities');
  const full = daycare.find((d) => d.item === 'full_day'), half = daycare.find((d) => d.item === 'half_day');
  const extra = discounts.find((d) => d.kind === 'daycare_extra_pet');
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow={t(`${K}.services.daycare.title`)} title={t(`${K}.daycare.title`)} lead={`${t(`${K}.daycare.lead`)}${half && full && full.threshold_hours != null ? ` Visits under ${full.threshold_hours} hours are a half day; longer visits are a full day.` : ''}`} actions={<Link to="/site/book"><Button size="lg" iconRight="arrow-right">Book daycare</Button></Link>} />
      <div className="container ps">
        <section className="ps-section">
          <div className="ps-room">
            <SitePhoto slug="dsc06450" ratio="4 / 3" sizes="(max-width: 900px) 100vw, 40vw" />
            <div className="stack">
              <SectionHead eyebrow={t(`${K}.services.daycare.title`)} title={t(`${K}.services.title`)} lead={t(`${K}.services.daycare.body`)} />
              <p className="small muted">{t(`${K}.hotel.vaccineNote`)}</p>
            </div>
          </div>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Pricing" title="Simple by the day" lead="Live from our price list; the app computes the item from your drop-off and pick-up times." />
          <div className="grid grid-4">{daycare.map((d) => <Card key={d.id} padding="lg" className="ps-tile"><h3>{d.name}</h3><span className="ps-from md">{fmtMoney(d.price)}</span><p className="small muted">{d.threshold_hours != null ? (d.item === 'full_day' ? `${d.threshold_hours} h or more` : `under ${d.threshold_hours} h`) : d.item === 'hour' ? 'per hour' : 'per walk'}</p></Card>)}</div>
          {extra && <p className="ps-inline-note">{extra.name}: {extra.percent_off != null ? `${extra.percent_off}% off` : `${fmtMoney(extra.amount_off)} off`} for each additional dog on the same day.</p>}
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="A typical day" title="Morning to pick-up" />
          <div className="ps-steps">{[['Drop-off', 'We check vaccines are current, note meds and feeding, and your dog joins the yard.'], ['Play', 'Supervised groups by size and temperament, naps in between.'], ['Walks', 'Logged per dog with the handler and minutes; a walk is a small add-on.'], ['Pick-up', 'We recompute the day from real times if you run late, then you pay in the app or at the desk.']].map(([t2, b]) => <div key={t2} className="ps-step"><h3>{t2}</h3><p>{b}</p></div>)}</div>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Capacity" title="Small groups on purpose" />
          <div className="grid grid-2">{locations.map((l) => <Card key={l.id} padding="lg" className="row-between"><div><h3>{l.name}</h3><p className="small muted">{l.address}</p></div><div className="ps-stat"><strong>{caps.find((c) => c.location_id === l.id && c.kind === 'daycare')?.max_simultaneous ?? '—'}</strong><span>dogs per day</span></div></Card>)}</div>
        </section>
        <CtaBand title="Book a daycare day" lead="Pick the date and times in the app; the price is computed before you confirm." />
      </div>
    </SiteLayout>
  );
}
