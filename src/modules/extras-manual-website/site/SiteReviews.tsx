import { useMemo, useState } from 'react';
import { useTable } from '../../../data/DataContext';
import type { CustomerRow, ReviewRow } from '../../../data/schema/core';
import { SiteLayout } from '../../../components/template/SiteLayout/SiteLayout';
import { SiteHero } from '../../../components/molecule/SiteHero/SiteHero';
import { SegmentedControl } from '../../../components/molecule/SegmentedControl/SegmentedControl';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { ReviewListItem } from '../../../components/molecule/ReviewListItem/ReviewListItem';
import { ReviewStars } from '../../../components/atom/ReviewStars/ReviewStars';
import { Card } from '../../../components/molecule/Card/Card';
import { CtaBand } from './siteBits';
import { useLocations } from './teasers';

/** P-07 Reviews: only published reviews (R-X70), average rating, filter by location, distribution. */
export function SiteReviews() {
  const locations = useLocations();
  const [loc, setLoc] = useState<string>('all');
  const { rows: reviews } = useTable<ReviewRow>('reviews', { where: { status: 'published' }, orderBy: { column: 'created_at', dir: 'desc' } });
  const { rows: customers } = useTable<CustomerRow>('customers');
  const list = useMemo(() => (loc === 'all' ? reviews : reviews.filter((r) => r.location_id === loc)), [reviews, loc]);
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  const custName = (id: string) => { const c = customers.find((x) => x.id === id); return c ? `${c.first_name} ${c.last_name[0]}.` : 'A pet parent'; };
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: list.filter((r) => Math.round(r.rating) === n).length }));
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow="Reviews" title="From the parents" lead="Reviews come from the Petrock app after a stay, a groom or a daycare day. We publish them after a quick check that they are about us and not about someone else's dog." />
      <div className="container ps">
        <div className="ps-two">
          <div className="stack">
            <div className="row-between wrap"><SegmentedControl size="sm" ariaLabel="Location" value={loc} onChange={setLoc} options={[{ value: 'all', label: 'All' }, ...locations.map((l) => ({ value: l.id, label: l.short_name }))]} /><span className="small muted">{list.length} review{list.length === 1 ? '' : 's'}</span></div>
            {list.length === 0 ? <EmptyState icon="star" title="No published reviews here yet" body="Reviews appear after our team publishes them." /> : <div className="stack">{list.map((r) => <ReviewListItem key={r.id} compact rating={r.rating} title={r.title} body={r.body} tags={r.tags} customerName={custName(r.customer_id)} locationName={locations.find((l) => l.id === r.location_id)?.short_name} when={new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />)}</div>}
          </div>
          <Card padding="lg" className="stack"><div className="stack-sm"><span className="eyebrow">Average</span><ReviewStars rating={avg} size={22} /></div><div className="stack-sm">{dist.map((d) => <div key={d.n} className="row"><span className="xs muted" style={{ width: 40 }}>{d.n} star</span><div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--color-surface-3)', overflow: 'hidden' }}><div style={{ width: `${list.length ? (d.count / list.length) * 100 : 0}%`, height: '100%', background: 'var(--color-primary)' }} /></div><span className="xs muted" style={{ width: 20, textAlign: 'right' }}>{d.count}</span></div>)}</div><p className="xs faint">Only published reviews are shown; pending and archived reviews never appear here.</p></Card>
        </div>
        <CtaBand title="Leave your own" lead="Rate your last visit from the app: Profile › Rate your stay." primary={{ to: '/app', label: 'Open the app' }} secondary={null} />
      </div>
    </SiteLayout>
  );
}
