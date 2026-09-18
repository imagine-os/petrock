import { Link } from 'react-router-dom';
import { fmtMoney } from '../../../pricing/engine';
import { PET_SIZES } from '../../../domain/booking';
import { SiteLayout } from '../../../components/template/SiteLayout/SiteLayout';
import { SiteHero } from '../../../components/molecule/SiteHero/SiteHero';
import { Button } from '../../../components/atom/Button/Button';
import { Card } from '../../../components/molecule/Card/Card';
import { Section } from '../../../components/molecule/Section/Section';
import { SectionHead, CtaBand } from './siteBits';
import { cardFee, usePricingTables } from './teasers';

/** P-05 Pricing teaser: rooms by day kind and season, discounts, Grooming & Spa by size, add-ons, daycare, fees and taxes; everything from the tables. */
export function SitePricing() {
  const { roomTypes, rates, seasons, packages, addons, daycare, discounts, fees, taxes } = usePricingTables();
  const fee = cardFee(fees);
  const rate = (rt: string, kind: 'weekday' | 'weekend', season: string | null) => rates.find((r) => r.room_type_id === rt && r.day_kind === kind && (r.season_id ?? null) === season)?.price_per_night;
  const key = (s: string) => `price_${s.toLowerCase()}` as 'price_s' | 'price_m' | 'price_l' | 'price_xl' | 'price_giant';
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow="Pricing" title="Every price, live" lead="This page reads our price list directly, so it is always current. Your exact quote (dates, dogs, size, add-ons, fees and tax) appears in the app before you pay." actions={<Link to="/site/book"><Button size="lg" iconRight="arrow-right">Get my quote</Button></Link>} />
      <div className="container ps">
        <Section title="Hotel: per night, per pet" description="Mon–Thu vs Fri–Sun nights; a night inside a season uses the season rate.">
          <Card padding="none"><div className="ps-scroll"><table className="ps-price-table"><thead><tr><th>Room</th><th>Season</th><th className="num">Mon–Thu</th><th className="num">Fri–Sun</th></tr></thead><tbody>{roomTypes.flatMap((rt) => [null, ...seasons].map((s) => { const wd = rate(rt.id, 'weekday', s?.id ?? null), we = rate(rt.id, 'weekend', s?.id ?? null); return wd == null && we == null ? null : <tr key={`${rt.id}-${s?.id ?? 'std'}`}><td><strong>{rt.name}</strong></td><td>{s ? `${s.name} · ${s.starts_on} to ${s.ends_on}` : 'Standard'}</td><td className="num">{wd != null ? fmtMoney(wd) : '—'}</td><td className="num">{we != null ? fmtMoney(we) : '—'}</td></tr>; }))}</tbody></table></div></Card>
          <div className="grid grid-3">{discounts.map((d) => <Card key={d.id} padding="lg" className="stack-sm"><h3>{d.name}</h3><span className="ps-from">{d.percent_off != null ? `${d.percent_off}% off` : `${fmtMoney(d.amount_off)} off per dog per night`}</span><p className="xs muted">{[d.min_nights ? `${d.min_nights}+ nights` : null, d.requires_paid_in_full ? 'paid in full upfront' : null, d.excludes_holidays ? 'holidays excluded' : null, d.dog_count ? `${d.dog_count} dogs sharing` : null].filter(Boolean).join(' · ') || 'applies automatically'}</p></Card>)}</div>
        </Section>
        <Section title="Grooming & Spa: by package and size" description="S under 20 lb · M under 40 · L under 70 · XL under 100 · Giant 100+.">
          <Card padding="none"><div className="ps-scroll"><table className="ps-price-table"><thead><tr><th>Package</th>{PET_SIZES.map((s) => <th key={s} className="num">{s}</th>)}<th className="num">Minutes</th></tr></thead><tbody>{packages.map((p) => <tr key={p.id}><td><strong>{p.name}</strong><div className="xs muted">{p.inclusions}</div></td>{PET_SIZES.map((s) => <td key={s} className="num">{fmtMoney(p[key(s)])}</td>)}<td className="num">{p.minutes_s}–{p.minutes_giant}</td></tr>)}</tbody></table></div></Card>
          <Card padding="none"><div className="ps-scroll"><table className="ps-price-table"><thead><tr><th>Add-on</th><th className="num">Price</th><th className="num">Extra minutes</th></tr></thead><tbody>{addons.map((a) => <tr key={a.id}><td>{a.name}</td><td className="num">{a.starting_at ? 'from ' : ''}{fmtMoney(a.price)}</td><td className="num">{a.added_minutes_sm} / {a.added_minutes_l}</td></tr>)}</tbody></table></div></Card>
        </Section>
        <Section title="Daycare" description="The item is computed from your drop-off and pick-up times.">
          <Card padding="none"><div className="ps-scroll"><table className="ps-price-table"><thead><tr><th>Item</th><th className="num">Price</th><th>When</th></tr></thead><tbody>{daycare.map((d) => <tr key={d.id}><td>{d.name}</td><td className="num">{fmtMoney(d.price)}</td><td className="muted">{d.threshold_hours != null ? (d.item === 'full_day' ? `${d.threshold_hours} hours or more` : `under ${d.threshold_hours} hours`) : d.item === 'hour' ? 'per hour' : 'per walk'}</td></tr>)}</tbody></table></div></Card>
        </Section>
        <Section title="Fees and taxes" description="Shown as separate lines on every quote and invoice.">
          <div className="grid grid-2">{fee && <Card padding="lg" className="stack-sm"><h3>{fee.name}</h3><span className="ps-from">{fee.percent}%</span><p className="small muted">Applies to card payments only; cash and prepaid stays avoid it.</p></Card>}{taxes.map((t) => <Card key={t.id} padding="lg" className="stack-sm"><h3>{t.name}</h3><span className="ps-from">services {t.service_rate}% · boarding {t.boarding_rate}% · products {t.product_rate}%</span><p className="small muted">{t.prices_inclusive ? 'Prices shown include tax.' : 'Added at checkout.'}</p></Card>)}</div>
        </Section>
        <SectionHead eyebrow="Example" title="How a quote adds up" lead="Nights × rate per dog, minus multi-dog and long-stay discounts, plus the card fee if you pay by card, plus tax. The app shows every line." />
        <CtaBand title="See your exact price" lead="Open the app, choose dates and dogs; the estimate updates as you go." />
      </div>
    </SiteLayout>
  );
}
