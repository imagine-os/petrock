import { useMemo, useState } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useData, useTable } from '../../../data/DataContext';
import type { CustomerRow, ReviewRow } from '../../../data/schema/core';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { Tabs } from '../../../components/molecule/Tabs/Tabs';
import { Select } from '../../../components/atom/Select/Select';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { StatTile } from '../../../components/molecule/StatTile/StatTile';
import { ReviewListItem } from '../../../components/molecule/ReviewListItem/ReviewListItem';
import { useToast } from '../../../components/molecule/Toast/Toast';
import './extras.css';

type Tab = 'pending' | 'published' | 'archived' | 'all';

/** F-65 Reviews moderation (reviews.jpg): tabs pending / published / archived, rating filter, Approve publishes, Archive hides (R-M12, R-X40). */
export function ReviewsModerationPage() {
  const data = useData();
  const { can } = useSession();
  const { scope, locations } = useLocation();
  const { toast } = useToast();
  const { rows } = useTable<ReviewRow>('reviews', { where: scope, orderBy: { column: 'created_at', dir: 'desc' } });
  const { rows: customers } = useTable<CustomerRow>('customers');
  const [tab, setTab] = useState<Tab>('pending');
  const [minRating, setMinRating] = useState('');
  const list = useMemo(() => rows.filter((r) => (tab === 'all' || r.status === tab) && (!minRating || r.rating >= Number(minRating))), [rows, tab, minRating]);
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const avg = rows.filter((r) => r.status === 'published');
  const cust = (id: string) => customers.find((c) => c.id === id);
  const set = async (r: ReviewRow, status: 'published' | 'archived') => { await data.update('reviews', r.id, { status }); toast({ tone: status === 'published' ? 'success' : 'info', title: status === 'published' ? 'Review published' : 'Review archived', body: r.title ?? undefined }); };
  const moderate = can('reviews.moderate');
  return (
    <div className="container ex-page">
      <PageHeader code="F-65" title="Reviews" subtitle="Reviews arrive from the app as pending. Approve publishes them on the website; Archive hides them. Only published reviews leave this queue." actions={<Select size="sm" aria-label="Minimum rating" placeholder="Any rating" value={minRating} onChange={(e) => setMinRating(e.target.value)} options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n}+ stars` }))} />}>
        <Tabs size="sm" value={tab} onChange={setTab} ariaLabel="Status" items={[{ key: 'pending', label: 'Pending', count: count('pending') }, { key: 'published', label: 'Published', count: count('published') }, { key: 'archived', label: 'Archived', count: count('archived') }, { key: 'all', label: 'All', count: rows.length }]} />
      </PageHeader>
      <div className="ex-kpis"><StatTile label="Waiting for moderation" value={count('pending')} icon="star" tone={count('pending') ? 'primary' : 'default'} /><StatTile label="Published average" value={avg.length ? (avg.reduce((s, r) => s + r.rating, 0) / avg.length).toFixed(1) : '—'} hint={`${avg.length} published`} icon="check" /><StatTile label="Archived" value={count('archived')} icon="trash" /></div>
      <Card padding="lg">
        {!moderate && <p className="small tone-warn">You can read the queue; publishing and archiving need the permission reviews.moderate (manager, owner).</p>}
        {list.length === 0 ? <EmptyState icon="star" title={tab === 'pending' ? 'Nothing waiting' : 'No reviews here'} /> : list.map((r) => { const c = cust(r.customer_id); return <ReviewListItem key={r.id} rating={r.rating} title={r.title} body={r.body} tags={r.tags} status={r.status} customerName={c ? `${c.first_name} ${c.last_name}` : 'Customer'} customerCode={c ? `#${c.id.replace(/\W/g, '').slice(-6).toUpperCase()}` : undefined} locationName={locations.find((l) => l.id === r.location_id)?.short_name} when={new Date(r.created_at).toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' })} onApprove={moderate ? () => void set(r, 'published') : undefined} onArchive={moderate ? () => void set(r, 'archived') : undefined} />; })}
      </Card>
    </div>
  );
}
