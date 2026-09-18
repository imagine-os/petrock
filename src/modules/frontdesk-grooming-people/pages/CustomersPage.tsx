import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../../components/molecule/StatTile/StatTile';
import { Button } from '../../../components/atom/Button/Button';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { Badge, toneFor } from '../../../components/atom/Badge/Badge';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import { useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { LocationRow } from '../../../data/schema/core';
import type { CustomerProfileRow } from '../../../data/schema/frontdesk-grooming-people';
import { usePeople } from '../hooks';
import { fmtMoney, fullName } from '../lib';
import '../module.css';

/** F-50 Customers list. */
export function CustomersPage() {
  const nav = useNavigate();
  const { can } = useSession();
  const { locationId, allLocations, location } = useLocation();
  const { customers, pets, vaccineOf } = usePeople();
  const { rows: profiles } = useTable<CustomerProfileRow>('customer_profiles');
  const { rows: locations } = useTable<LocationRow>('locations');
  const [scopeAll, setScopeAll] = useState(allLocations);
  const rows = useMemo(() => customers.filter((c) => scopeAll || !c.home_location_id || c.home_location_id === locationId).map((c) => {
    const cp = pets.filter((p) => p.customer_id === c.id && p.status === 'active');
    return { ...c, petsCount: cp.length, petNames: cp.map((p) => p.name).join(', '), vaccineIssue: cp.some((p) => vaccineOf.get(p.id)?.overall !== 'ok'), profile: profiles.find((x) => x.customer_id === c.id), locName: locations.find((l) => l.id === c.home_location_id)?.short_name ?? '—' };
  }), [customers, pets, vaccineOf, profiles, locations, scopeAll, locationId]);
  type Row = (typeof rows)[number];
  const due = rows.filter((r) => r.balance > 0);
  const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
  const newRows = rows.filter((r) => (r.profile?.customer_since ?? r.created_at.slice(0, 10)) >= monthAgo.toISOString().slice(0, 10));
  const columns = [
    { key: 'name', label: 'Customer', value: (r: Row) => `${r.last_name} ${r.first_name}`, render: (r: Row) => <span className="fgp-cell-person"><Avatar name={fullName(r)} size={32} /><span className="grow"><strong>{r.last_name}, {r.first_name}</strong><span className="xs muted">{r.email}</span></span></span> },
    { key: 'mobile', label: 'Mobile', render: (r: Row) => <a href={`tel:${r.mobile}`} onClick={(e) => e.stopPropagation()} className="xs mono" style={{ color: 'inherit' }}>{r.mobile}</a> },
    { key: 'pets', label: 'Pets', value: (r: Row) => r.petsCount, render: (r: Row) => <span className="row" style={{ gap: 6 }}><Badge size="sm" tone={r.petsCount ? 'primary' : 'neutral'}>{r.petsCount}</Badge><span className="xs muted">{r.petNames || 'No pets'}</span>{r.vaccineIssue && <Badge size="sm" tone="danger">vaccines</Badge>}</span> },
    { key: 'city', label: 'City', value: (r: Row) => r.city ?? '', hideOnCard: true },
    { key: 'locName', label: 'Home location', value: (r: Row) => r.locName, hideOnCard: !scopeAll },
    { key: 'balance', label: 'Balance', value: (r: Row) => r.balance, render: (r: Row) => <span className={r.balance > 0 ? 'tone-danger' : 'muted'}>{fmtMoney(r.balance)}</span>, align: 'right' as const },
    { key: 'status', label: 'Status', render: (r: Row) => <Badge size="sm" tone={toneFor(r.status)}>{r.status}</Badge> },
  ];
  return (
    <div className="page stack">
      <PageHeader code="F-50" title="Customers" subtitle={`${scopeAll ? 'All locations' : location.short_name} · ${rows.length} pet parents`} actions={can('customers.write') ? <Button icon="plus" onClick={() => nav('/desk/customers/new')}>Add customer</Button> : undefined} />
      <div className="fgp-stats">
        <StatTile label="Customers" value={rows.length} icon="users" />
        <StatTile label="With balance due" value={due.length} hint={fmtMoney(due.reduce((s, r) => s + r.balance, 0))} icon="dollar" tone={due.length ? 'primary' : 'default'} />
        <StatTile label="New in 30 days" value={newRows.length} icon="sparkle" />
        <StatTile label="Pets on file" value={rows.reduce((s, r) => s + r.petsCount, 0)} icon="paw" onClick={() => nav('/desk/pets')} />
      </div>
      <DataTable<Row> columns={columns} rows={rows} rowKey={(r) => r.id} searchable onRowClick={(r) => nav(`/desk/customers/${r.id}`)} emptyText="No customers match"
        filters={[{ key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }], test: (r, v) => r.status === v }, { key: 'balance', label: 'Balance', options: [{ value: 'due', label: 'Balance due' }, { value: 'clear', label: 'Nothing due' }], test: (r, v) => (v === 'due' ? r.balance > 0 : r.balance <= 0) }]}
        toolbar={<Button size="sm" variant={scopeAll ? 'primary' : 'secondary'} icon="location" onClick={() => setScopeAll((s) => !s)}>{scopeAll ? 'All locations' : `${location.short_name} only`}</Button>} />
    </div>
  );
}
