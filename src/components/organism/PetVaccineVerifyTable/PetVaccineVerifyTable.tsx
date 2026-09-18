import { Badge, toneFor } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Icon } from '../../atom/Icon/Icon';
import { DataTable } from '../DataTable/DataTable';
import './PetVaccineVerifyTable.css';

export interface VaccineVerifyRow { id: string; typeName: string; required: boolean; status: string; vaccinatedOn: string | null; expiresOn: string | null; proofName: string | null; proofUrl: string | null; note: string | null; verifiedBy?: string | null; verifiedAt?: string | null; petName?: string; ownerName?: string; petId?: string }
export interface PetVaccineVerifyTableProps {
  rows: VaccineVerifyRow[]; canVerify: boolean; showPet?: boolean; dense?: boolean;
  onVerify?: (row: VaccineVerifyRow) => void; onReject?: (row: VaccineVerifyRow) => void; onUpload?: (row: VaccineVerifyRow) => void; onEditDates?: (row: VaccineVerifyRow) => void; onOpenPet?: (row: VaccineVerifyRow) => void;
}
const fmt = (iso: string | null) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
const expired = (r: VaccineVerifyRow) => !!r.expiresOn && r.expiresOn < new Date().toISOString().slice(0, 10);

/** Per-pet vaccine records (Pet Details .pdf table) with the staff verify / reject actions that drive R-X60. Also used by the F-56 queue with pet + owner columns. */
export function PetVaccineVerifyTable({ rows, canVerify, showPet = false, dense = true, onVerify, onReject, onUpload, onEditDates, onOpenPet }: PetVaccineVerifyTableProps) {
  const columns = [
    ...(showPet ? [{ key: 'pet', label: 'Pet', value: (r: VaccineVerifyRow) => r.petName, render: (r: VaccineVerifyRow) => <button type="button" className="vaxtable-link" onClick={() => onOpenPet?.(r)}>{r.petName}<span className="muted xs"> · {r.ownerName}</span></button> }] : []),
    { key: 'type', label: 'Vaccine', value: (r: VaccineVerifyRow) => r.typeName, render: (r: VaccineVerifyRow) => <span className="vaxtable-type">{r.typeName}{r.required ? <Badge size="sm" tone="primary">required</Badge> : <span className="xs muted">recommended</span>}</span> },
    { key: 'vaccinatedOn', label: 'Vaccinated', value: (r: VaccineVerifyRow) => r.vaccinatedOn, render: (r: VaccineVerifyRow) => fmt(r.vaccinatedOn) },
    { key: 'expiresOn', label: 'Expires', value: (r: VaccineVerifyRow) => r.expiresOn, render: (r: VaccineVerifyRow) => <span className={expired(r) ? 'tone-danger' : ''}>{fmt(r.expiresOn)}{expired(r) && <Icon name="warning" size={12} />}</span> },
    { key: 'proof', label: 'Certificate', sortable: false, render: (r: VaccineVerifyRow) => (r.proofName ? <a className="vaxtable-proof" href={r.proofUrl ?? '#'} onClick={(e) => e.preventDefault()} title="Mock upload; opens nothing yet"><Icon name="book" size={12} /> {r.proofName}</a> : onUpload ? <Button size="sm" variant="ghost" icon="upload" onClick={() => onUpload(r)}>Upload</Button> : <span className="faint">—</span>) },
    { key: 'status', label: 'Status', value: (r: VaccineVerifyRow) => r.status, render: (r: VaccineVerifyRow) => <span className="vaxtable-status"><Badge size="sm" tone={toneFor(expired(r) && r.status === 'verified' ? 'expired' : r.status)}>{expired(r) && r.status === 'verified' ? 'expired' : r.status}</Badge>{r.note && <span className="xs muted" title={r.note}>{r.note}</span>}{r.status === 'verified' && r.verifiedBy && <span className="xs faint">by {r.verifiedBy}</span>}</span> },
  ];
  return (
    <div className="vaxtable">
      <DataTable<VaccineVerifyRow> columns={columns} rows={rows} rowKey={(r) => r.id} dense={dense} stickyHeader={false} emptyText="No vaccine records" cardBreakpoint={showPet ? 900 : 640}
        rowActions={canVerify && (onVerify || onReject || onEditDates) ? (r) => (
          <div className="vaxtable-actions">
            {onEditDates && <IconButton size="sm" icon="edit" onClick={() => onEditDates(r)} label={`Edit ${r.typeName} dates`} />}
            {onVerify && (r.status === 'submitted' || r.status === 'rejected' || (r.status === 'missing' && r.vaccinatedOn)) && <Button size="sm" icon="check" onClick={() => onVerify(r)}>Verify</Button>}
            {onReject && r.status === 'submitted' && <Button size="sm" variant="danger" icon="close" onClick={() => onReject(r)}>Reject</Button>}
          </div>
        ) : undefined} />
    </div>
  );
}
