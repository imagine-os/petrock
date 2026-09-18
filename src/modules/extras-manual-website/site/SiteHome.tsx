import { Link } from 'react-router-dom';
import { useTable } from '../../../data/DataContext';
import type { CustomerRow, ReviewRow } from '../../../data/schema/core';
import { company } from '../../../tenant/locations';
import { fmtMoney } from '../../../pricing/engine';
import { SiteLayout } from '../../../components/template/SiteLayout/SiteLayout';
import { SiteHero } from '../../../components/molecule/SiteHero/SiteHero';
import { Button } from '../../../components/atom/Button/Button';
import { Card } from '../../../components/molecule/Card/Card';
import { Icon, type IconName } from '../../../components/atom/Icon/Icon';
import { Badge } from '../../../components/atom/Badge/Badge';
import { ReviewListItem } from '../../../components/molecule/ReviewListItem/ReviewListItem';
import { ReviewStars } from '../../../components/atom/ReviewStars/ReviewStars';
import { SectionHead, CtaBand, Art } from './siteBits';
import { from, fromNightly, hoursSummary, isOpenNow, useLocations, usePricingTables } from './teasers';

/** P-01 Website home: hero, three services with "from" teasers, why Petrock, locations strip, published reviews, app CTA. */
export function SiteHome() {
  const { roomTypes, rates, packages, daycare } = usePricingTables();
  const locations = useLocations();
  const { rows: reviews } = useTable<ReviewRow>('reviews', { where: { status: 'published' } });
  const { rows: customers } = useTable<CustomerRow>('customers');
  const cheapestRoom = roomTypes.map((rt) => fromNightly(rates, rt.id)).filter((n): n is number => n != null);
  const fullDay = daycare.find((d) => d.item === 'full_day');
  const gold = packages[0];
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const custName = (id: string) => { const c = customers.find((x) => x.id === id); return c ? `${c.first_name} ${c.last_name[0]}.` : 'A pet parent'; };
  const services: { icon: IconName; title: string; body: string; teaser: string; to: string }[] = [
    { icon: 'bed', title: 'Hotel', body: 'Penthouses and suites, two walks a day, playtime and nightly photos. Two dogs can share a room.', teaser: cheapestRoom.length ? `${from(Math.min(...cheapestRoom))} / night` : '—', to: '/site/hotel' },
    { icon: 'sun', title: 'Daycare', body: 'Half days, full days and play hours in a supervised yard with real play, naps and walks.', teaser: fullDay ? `${from(fullDay.price)} / day` : '—', to: '/site/daycare' },
    { icon: 'scissors', title: 'Grooming & Spa', body: 'Gold, Platinum and Diamond packages priced by your dog\'s size, plus add-ons like teeth brushing and de-shed.', teaser: gold ? `${from(gold.price_s)} · ${gold.name}` : '—', to: '/site/grooming' },
  ];
  return (
    <SiteLayout>
      <SiteHero eyebrow={`Dog hotel & spa · ${locations.map((l) => l.short_name).join(' & ')}, Los Angeles`} title={company.tagline} lead="A hotel your dog actually wants to come back to: bright rooms, people who know their name, and photos every night. Book the hotel, daycare or a spa day from the Petrock app."
        actions={<><Link to="/site/book"><Button size="lg" iconRight="arrow-right">Book now</Button></Link><Link to="/site/hotel"><Button size="lg" variant="secondary">See the rooms</Button></Link></>}
        aside={<Card padding="lg" className="stack-sm"><div className="row-between"><strong>Open now?</strong><Badge tone={locations.some((l) => isOpenNow(l.hours)) ? 'success' : 'neutral'} dot>{locations.some((l) => isOpenNow(l.hours)) ? 'Open' : 'Closed'}</Badge></div>{locations.map((l) => <div key={l.id} className="row-between small"><span><Icon name="location" size={14} /> {l.short_name}</span><span className="muted">{hoursSummary(l.hours)[0]?.value ?? ''}</span></div>)}<Link to="/site/locations" className="xs">Hours, addresses and phones →</Link></Card>} />
      <div className="container ps">
        <section className="ps-section">
          <SectionHead eyebrow="Services" title="Three ways to spoil them" lead="Prices are live from our price list and start at the smallest size or shortest stay; your exact quote is in the app before you pay." />
          <div className="ps-tiles">{services.map((s) => <Card key={s.title} padding="lg" className="ps-tile"><span className="ps-tile-icon"><Icon name={s.icon} size={24} /></span><h3>{s.title}</h3><p>{s.body}</p><div className="row-between"><span className="ps-from">{s.teaser}</span><Link to={s.to} className="small">Learn more →</Link></div></Card>)}</div>
        </section>
        <section className="ps-section">
          <div className="ps-room"><Art icon="paw" label="A dog resting in a penthouse room" /><div className="stack"><SectionHead eyebrow="Why Petrock" title="Small rooms, big attention" lead="We are two neighbourhood hotels, not a kennel chain. Every guest has a profile with meds, habits and vaccines; every stay is logged; every parent gets photos." /><ul className="ps-inclusions">{['Vaccines verified by our staff before any stay', 'Two dogs can share a room, with a multi-dog discount', 'Grooming at the end of the stay so they go home clean', 'Nightly photos in the app', 'Front desk chat with a real person', 'Encino and Westwood, same standards'].map((t) => <li key={t}><Icon name="check" size={16} />{t}</li>)}</ul></div></div>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Locations" title="Two homes in Los Angeles" />
          <div className="grid grid-2">{locations.map((l) => <Card key={l.id} padding="lg" className="ps-loc"><h3><Icon name="location" size={18} /> {l.name}</h3><p className="small">{l.address}</p><ul className="ps-hours">{hoursSummary(l.hours).map((h) => <li key={h.label}><span>{h.label}</span><span>{h.value}</span></li>)}</ul><div className="row wrap">{l.phone && <a href={`tel:${l.phone.replace(/[^\d+]/g, '')}`}><Button size="sm" variant="secondary" icon="phone">{l.phone}</Button></a>}<Link to="/site/locations"><Button size="sm" variant="ghost">Details</Button></Link></div></Card>)}</div>
        </section>
        {reviews.length > 0 && (
          <section className="ps-section">
            <div className="row-between wrap"><SectionHead eyebrow="Reviews" title="What parents say" /><div className="stack-sm" style={{ alignItems: 'flex-end' }}><ReviewStars rating={avg} size={20} /><span className="xs muted">{reviews.length} published review{reviews.length === 1 ? '' : 's'}</span></div></div>
            <div className="ps-reviews">{reviews.slice(0, 3).map((r) => <ReviewListItem key={r.id} compact rating={r.rating} title={r.title} body={r.body} tags={r.tags} customerName={custName(r.customer_id)} locationName={locations.find((l) => l.id === r.location_id)?.short_name} when={new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />)}</div>
            <Link to="/site/reviews" className="small">All reviews →</Link>
          </section>
        )}
        <section className="ps-section">
          <SectionHead eyebrow="How it works" title="Four steps, then it is one tap" center />
          <div className="ps-steps">{[['Create your account', 'In the Petrock app, with your phone or email.'], ['Add your dog', 'Name, breed, weight, habits, meds. Weight sets the grooming size band.'], ['Upload vaccines', 'Rabies, DHPP and Bordetella required. We verify them the same day.'], ['Book', 'Hotel, daycare or Grooming & Spa. Pay a deposit or in full; prepay stays get a discount.']].map(([t, b]) => <div key={t} className="ps-step"><h3>{t}</h3><p>{b}</p></div>)}</div>
        </section>
        <CtaBand />
        <p className="ps-inline-note">Teaser prices on this site are computed from our current price list (smallest size, standard season); see the full <Link to="/site/pricing">pricing</Link>. Example: the {gold?.name ?? 'Gold'} groom starts at {gold ? fmtMoney(gold.price_s) : '—'} for small dogs.</p>
      </div>
    </SiteLayout>
  );
}
