import { Link } from 'react-router-dom';
import { useTable } from '../../../data/DataContext';
import type { CustomerRow, ReviewRow } from '../../../data/schema/core';
import { company } from '../../../tenant/locations';
import { fmtMoney } from '../../../pricing/engine';
import { useT } from '../../../i18n/I18nProvider';
import { SiteLayout } from '../../../components/template/SiteLayout/SiteLayout';
import { SiteHero } from '../../../components/molecule/SiteHero/SiteHero';
import { Button } from '../../../components/atom/Button/Button';
import { Card } from '../../../components/molecule/Card/Card';
import { Icon } from '../../../components/atom/Icon/Icon';
import { Badge } from '../../../components/atom/Badge/Badge';
import { ReviewListItem } from '../../../components/molecule/ReviewListItem/ReviewListItem';
import { ReviewStars } from '../../../components/atom/ReviewStars/ReviewStars';
import { SectionHead, CtaBand, CheckList } from './siteBits';
import { HERO_VIDEO_ID, SitePhoto, HOME_STRIP, type PhotoSlug } from './siteImages';
import { from, fromNightly, hoursSummary, isOpenNow, tel, useLocations, usePricingTables } from './teasers';

const K = 'extras-manual-website.site';

/** P-01 Website home: full-bleed media hero (the client's own background video over their lobby photo), the three
 *  services in their own words with live "from" teasers, Training & Fitness, why Petrock, a photo strip into the
 *  gallery, both locations, published reviews and the book-now hand-off. */
export function SiteHome() {
  const t = useT();
  const { roomTypes, rates, packages, daycare } = usePricingTables();
  const locations = useLocations();
  const { rows: reviews } = useTable<ReviewRow>('reviews', { where: { status: 'published' } });
  const { rows: customers } = useTable<CustomerRow>('customers');
  const cheapestRoom = roomTypes.map((rt) => fromNightly(rates, rt.id)).filter((n): n is number => n != null);
  const fullDay = daycare.find((d) => d.item === 'full_day');
  const gold = packages[0];
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const anyOpen = locations.some((l) => isOpenNow(l.hours));
  const custName = (id: string) => { const c = customers.find((x) => x.id === id); return c ? `${c.first_name} ${c.last_name[0]}.` : 'A pet parent'; };
  const services: { slug: PhotoSlug; key: string; teaser: string; to: string }[] = [
    { slug: 'dsc06426', key: 'hotel', teaser: cheapestRoom.length ? `${from(Math.min(...cheapestRoom))} ${t(`${K}.services.perNight`)}` : '—', to: '/site/hotel' },
    { slug: 'grooming', key: 'spa', teaser: gold ? `${from(gold.price_s)} · ${gold.name}` : '—', to: '/site/grooming' },
    { slug: 'dsc06450', key: 'daycare', teaser: fullDay ? `${from(fullDay.price)} ${t(`${K}.services.perDay`)}` : '—', to: '/site/daycare' },
  ];
  return (
    <SiteLayout>
      <SiteHero tone="media" eyebrow={t(`${K}.hero.eyebrow`)} title={company.tagline} subhead={t(`${K}.hero.subhead`)} lead={t(`${K}.hero.lead`)}
        media={{ kind: 'video-youtube', id: HERO_VIDEO_ID, poster: <SitePhoto slug="dsc06310" alt="" priority sizes="100vw" />, playLabel: t(`${K}.hero.playVideo`), pauseLabel: t(`${K}.hero.pauseVideo`) }}
        actions={<>
          <Link to="/site/book"><Button size="lg" iconRight="arrow-right">{t(`${K}.hero.book`)}</Button></Link>
          {locations.map((l) => l.phone && <a key={l.id} href={tel(l.phone)}><Button size="lg" variant="secondary" icon="phone">{t(`${K}.hero.call`, { name: l.short_name })}</Button></a>)}
        </>} />
      <div className="ps-openstrip">
        <div className="container ps-openstrip-in">
          <span className="ps-openstrip-now"><strong>{t(`${K}.openNow.label`)}</strong><Badge tone={anyOpen ? 'success' : 'neutral'} dot>{anyOpen ? t(`${K}.openNow.open`) : t(`${K}.openNow.closed`)}</Badge></span>
          {locations.map((l) => <span key={l.id} className="small ps-openstrip-loc"><Icon name="location" size={14} /> {l.short_name} <span className="muted">{hoursSummary(l.hours)[0]?.value ?? ''}</span></span>)}
          <Link to="/site/locations" className="small">{t(`${K}.openNow.link`)} →</Link>
        </div>
      </div>
      <div className="container ps">
        <section className="ps-section">
          <SectionHead eyebrow={t(`${K}.services.eyebrow`)} title={t(`${K}.services.title`)} lead={t(`${K}.services.lead`)} />
          <div className="ps-tiles">{services.map((s) => (
            <Card key={s.key} padding="none" className="ps-tile is-media">
              <SitePhoto slug={s.slug} ratio="4 / 3" className="is-flush is-zoom" sizes="(max-width: 900px) 100vw, (max-width: 1600px) 33vw, 480px" />
              <div className="ps-tile-body">
                <h3>{t(`${K}.services.${s.key}.title`)}</h3>
                <p>{t(`${K}.services.${s.key}.body`)}</p>
                <div className="row-between"><span className="ps-from">{s.teaser}</span><Link to={s.to} className="small">{t(`${K}.services.learnMore`)} →</Link></div>
              </div>
            </Card>
          ))}</div>
        </section>
        <section className="ps-section">
          <div className="ps-room">
            <SitePhoto slug="dsc06382" ratio="4 / 3" sizes="(max-width: 900px) 100vw, 40vw" />
            <div className="stack">
              <SectionHead eyebrow={t(`${K}.training.eyebrow`)} title={t(`${K}.training.title`)} lead={t(`${K}.training.lead`)} />
              <CheckList prefix={`${K}.training.item`} count={4} />
              <div className="row wrap">{locations[0]?.phone && <a href={tel(locations[0].phone)}><Button icon="phone">{t(`${K}.training.cta`)}</Button></a>}</div>
              <p className="ps-inline-note">{t(`${K}.training.note`)}</p>
            </div>
          </div>
        </section>
        <section className="ps-section">
          <div className="ps-room">
            <SitePhoto slug="dsc06464" ratio="4 / 3" sizes="(max-width: 900px) 100vw, 40vw" />
            <div className="stack">
              <SectionHead eyebrow={t(`${K}.why.eyebrow`)} title={t(`${K}.why.title`)} lead={t(`${K}.why.lead`)} />
              <CheckList prefix={`${K}.why.item`} count={6} />
            </div>
          </div>
        </section>
        <section className="ps-section">
          <div className="row-between wrap"><SectionHead eyebrow={t(`${K}.gallery.eyebrow`)} title={t(`${K}.gallery.title`)} lead={t(`${K}.gallery.lead`)} /><Link to="/site/gallery"><Button variant="secondary" iconRight="arrow-right">{t(`${K}.gallery.cta`)}</Button></Link></div>
          <div className="ps-strip">{HOME_STRIP.map((slug) => <Link key={slug} to="/site/gallery" className="ps-strip-item"><SitePhoto slug={slug} ratio="1 / 1" className="is-zoom" sizes="(max-width: 700px) 45vw, 22vw" /></Link>)}</div>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Locations" title="Two homes in Los Angeles" />
          <div className="grid grid-2">{locations.map((l) => <Card key={l.id} padding="lg" className="ps-loc"><h3><Icon name="location" size={18} /> {l.name}</h3><p className="small">{l.address}</p><ul className="ps-hours">{hoursSummary(l.hours).map((h) => <li key={h.label}><span>{h.label}</span><span>{h.value}</span></li>)}</ul><div className="row wrap">{l.phone && <a href={tel(l.phone)}><Button size="sm" variant="secondary" icon="phone">{l.phone}</Button></a>}<Link to="/site/locations"><Button size="sm" variant="ghost">Details</Button></Link></div></Card>)}</div>
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
          <div className="ps-steps">{[['Create your account', 'In the Petrock app, with your phone or email.'], ['Add your dog', 'Name, breed, weight, habits, meds. Weight sets the grooming size band.'], ['Upload vaccines', 'Rabies, DHPP and Bordetella required. We verify them the same day.'], ['Book', 'Hotel, daycare or Grooming & Spa. Pay a deposit or in full; prepay stays get a discount.']].map(([t2, b]) => <div key={t2} className="ps-step"><h3>{t2}</h3><p>{b}</p></div>)}</div>
        </section>
        <CtaBand />
        <p className="ps-inline-note">Teaser prices on this site are computed from our current price list (smallest size, standard season); see the full <Link to="/site/pricing">pricing</Link>. Example: the {gold?.name ?? 'Gold'} groom starts at {gold ? fmtMoney(gold.price_s) : '—'} for small dogs.</p>
      </div>
    </SiteLayout>
  );
}
