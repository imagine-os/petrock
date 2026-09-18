import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../../components/molecule/StatTile/StatTile';
import { Button } from '../../../components/atom/Button/Button';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { Badge, toneFor } from '../../../components/atom/Badge/Badge';
import { PetVaccineChip } from '../../../components/molecule/PetVaccineChip/PetVaccineChip';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { usePeople } from '../hooks';
import { ageOf, fullName, sizeLabel } from '../lib';
import '../module.css';

/** F-53 Pets list. */
export function PetsPage() {
  const nav = useNavigate();
  const { can } = useSession();
  const { locationId, allLocations, location, canSwitch } = useLocation();
  const { pets, customerById, vaccineOf } = usePeople();
  const [scopeAll, setScopeAll] = useState(allLocations);
  const rows = useMemo(() => pets.map((p) => ({ ...p, owner: customerById.get(p.customer_id), vaccine: vaccineOf.get(p.id)! })).filter((r) => scopeAll || !r.owner?.home_location_id || r.owner.home_location_id === locationId), [pets, customerById, vaccineOf, scopeAll, locationId]);
  type Row = (typeof rows)[number];
  const pending = rows.filter((r) => r.approval_status !== 'approved');
  const issues = rows.filter((r) => r.vaccine.overall !== 'ok');
  const columns = [
    { key: 'name', label: 'Pet', value: (r: Row) => r.name, render: (r: Row) => <span className="fgp-cell-person"><Avatar name={r.name} kind="pet" size={32} /><span className="grow"><strong>{r.name}</strong><span className="xs muted">{r.breed ?? 'Mixed'} · {r.sex}{r.date_of_birth ? ` · ${ageOf(r.date_of_birth)}` : ''}</span></span></span> },
    { key: 'owner', label: 'Owner', value: (r: Row) => r.owner ? `${r.owner.last_name} ${r.owner.first_name}` : '', render: (r: Row) => r.owner ? <span>{fullName(r.owner)}<span className="xs muted"> · {r.owner.mobile}</span></span> : '—' },
    { key: 'size', label: 'Size', value: (r: Row) => r.weight_lbs ?? 0, render: (r: Row) => `${sizeLabel[r.size ?? ''] ?? r.size ?? '—'}${r.weight_lbs ? ` · ${r.weight_lbs} lb` : ''}` },
    { key: 'approval_status', label: 'Approval', render: (r: Row) => <Badge size="sm" tone={toneFor(r.approval_status)}>{r.approval_status.replace('_', ' ')}</Badge> },
    { key: 'vaccine', label: 'Vaccines', value: (r: Row) => r.vaccine.overall, render: (r: Row) => <PetVaccineChip overall={r.vaccine.overall} detail={r.vaccine.overall === 'ok' ? `${r.vaccine.requiredOk}/${r.vaccine.requiredTotal}` : [...r.vaccine.expired, ...r.vaccine.missing, ...r.vaccine.pending, ...r.vaccine.rejected].join(', ')} /> },
    { key: 'attributes', label: 'Flags', sortable: false, hideOnCard: true, render: (r: Row) => <span className="fgp-taglist">{(r.attributes ?? []).map((a) => <Badge key={a} size="sm" tone="warn">{a}</Badge>)}{r.medical_conditions && <Badge size="sm" tone="info">medical</Badge>}{r.allergies && <Badge size="sm" tone="info">allergy</Badge>}</span> },
    { key: 'status', label: 'Status', render: (r: Row) => <Badge size="sm" tone={toneFor(r.status)}>{r.status}</Badge> },
  ];
  return (
    <div className="page stack">
      <PageHeader code="F-53" title="Pets" subtitle={`${scopeAll ? 'All locations' : location.short_name} · ${rows.length} pets on file`} actions={can('pets.write') ? <Button icon="plus" onClick={() => nav('/desk/pets/new')}>Add pet</Button> : undefined} />
      <div className="fgp-stats">
        <StatTile label="Pets" value={rows.length} icon="paw" />
        <StatTile label="Pending approval" value={pending.length} icon="clock" tone={pending.length ? 'primary' : 'default'} />
        <StatTile label="Vaccine issues" value={issues.length} icon="shield" hint="expired, missing or to verify" onClick={() => nav('/desk/vaccines')} />
        <StatTile label="Approved" value={rows.length - pending.length} icon="check" />
      </div>
      <DataTable<Row> columns={columns} rows={rows} rowKey={(r) => r.id} searchable onRowClick={(r) => nav(`/desk/pets/${r.id}`)} emptyText="No pets match"
        filters={[{ key: 'approval', label: 'Approval', options: [{ value: 'approved', label: 'Approved' }, { value: 'pending', label: 'Pending' }, { value: 'needs_details', label: 'Needs details' }], test: (r, v) => r.approval_status === v }, { key: 'vax', label: 'Vaccines', options: [{ value: 'ok', label: 'OK' }, { value: 'issue', label: 'Any issue' }, { value: 'pending', label: 'To verify' }, { value: 'expired', label: 'Expired' }, { value: 'missing', label: 'Missing' }], test: (r, v) => (v === 'issue' ? r.vaccine.overall !== 'ok' : r.vaccine.overall === v) }, { key: 'size', label: 'Size', options: Object.entries(sizeLabel).map(([k, l]) => ({ value: k, label: l })), test: (r, v) => r.size === v }]}
        toolbar={canSwitch ? <Button size="sm" variant={scopeAll ? 'primary' : 'secondary'} icon="location" onClick={() => setScopeAll((s) => !s)}>{scopeAll ? 'All locations' : `${location.short_name} only`}</Button> : undefined} />
    </div>
  );
}
