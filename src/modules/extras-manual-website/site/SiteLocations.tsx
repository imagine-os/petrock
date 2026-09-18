import { Link } from 'react-router-dom';
import { useTable } from '../../../data/DataContext';
import type { CapacityRow } from '../../../data/schema/core';
import { SiteLayout } from '../../../components/template/SiteLayout/SiteLayout';
import { SiteHero } from '../../../components/molecule/SiteHero/SiteHero';
import { Button } from '../../../components/atom/Button/Button';
import { Card } from '../../../components/molecule/Card/Card';
import { Badge } from '../../../components/atom/Badge/Badge';
import { Icon } from '../../../components/atom/Icon/Icon';
import { CtaBand, SectionHead } from './siteBits';
import { hoursSummary, isOpenNow, useLocations } from './teasers';

/** P-06 Locations: each location with address, phone, hours, open-now, capacities and a map placeholder. */
export function SiteLocations() {
  const locations = useLocations();
  const { rows: caps } = useTable<CapacityRow>('capacities');
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow="Locations" title={`${locations.length} neighbourhood hotels, one standard`} lead="Same rooms, same people-first approach, same app. Pick the one closest to you; your account works at both." />
      <div className="container ps">
        {locations.map((l) => {
          const c = (k: CapacityRow['kind']) => caps.find((x) => x.location_id === l.id && x.kind === k)?.max_simultaneous;
          return (
            <section key={l.id} className="ps-section" id={l.slug}>
              <div className="ps-two">
                <Card padding="lg" className="ps-loc">
                  <div className="row-between wrap"><h3><Icon name="location" size={20} /> {l.name}</h3><Badge tone={isOpenNow(l.hours) ? 'success' : 'neutral'} dot>{isOpenNow(l.hours) ? 'Open now' : 'Closed now'}</Badge></div>
                  <p>{l.address}</p>
                  <ul className="ps-hours">{hoursSummary(l.hours).map((h) => <li key={h.label}><span>{h.label}</span><span>{h.value}</span></li>)}</ul>
                  <div className="ps-stats">{[['penthouse', 'penthouse rooms'], ['suite', 'suites'], ['daycare', 'daycare spots'], ['grooming', 'grooming tables']].map(([k, label]) => <div key={k} className="ps-stat"><strong>{c(k as CapacityRow['kind']) ?? '—'}</strong><span>{label}</span></div>)}</div>
                  <div className="row wrap">{l.phone && <a href={`tel:${l.phone.replace(/[^\d+]/g, '')}`}><Button icon="phone">{l.phone}</Button></a>}<a href={`https://maps.google.com/?q=${encodeURIComponent(l.address)}`} target="_blank" rel="noreferrer"><Button variant="secondary" iconRight="external">Directions</Button></a><Link to={`/site/contact?location=${l.id}`}><Button variant="ghost">Message this location</Button></Link></div>
                </Card>
                <div className="ps-map" role="img" aria-label={`Map placeholder for ${l.name}`}><span><Icon name="location" size={16} /> {l.city} · {l.timezone}</span></div>
              </div>
            </section>
          );
        })}
        <SectionHead eyebrow="Parking & drop-off" title="Arriving" lead="Street and lot parking at both locations. Come in with your dog on a leash; the front desk checks vaccines and meds and takes them to their room." />
        <CtaBand title="Book at either location" lead="Choose the location when you book; your dog's profile and vaccines follow you." />
      </div>
    </SiteLayout>
  );
}
