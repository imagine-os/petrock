/** The 18 reservation columns of the design (Frame 1171276264-10) as DataTable columns, shared by F-01 and F-10. */
import type { DataTableColumn } from '../../../components/organism/DataTable/DataTable';
import { StatusBadge } from '../../../components/atom/Badge/Badge';
import { PetVaccineStatus } from '../../../components/molecule/PetVaccineStatus/PetVaccineStatus';
import { fmtMoney } from '../../../pricing/engine';
import { fmtDate } from './dates';
import type { ReservationRow } from './reservations';

const money = (n: number) => <span className="mono">{fmtMoney(n)}</span>;

export const RESERVATION_COLUMNS: DataTableColumn<ReservationRow>[] = [
  { key: 'code', label: 'ID', mono: true, width: 96, render: (r) => <span className="mono xs">{r.code}</span> },
  { key: 'status', label: 'Status', width: 140, render: (r) => <span className="row" style={{ gap: 6 }}><StatusBadge status={r.status} size="sm" />{!r.vaccineOk && r.pets[0] && <PetVaccineStatus compact summary={Object.values(r.vaccines).find((v) => !v.ok)!} petName={r.pets.find((p) => !r.vaccines[p.id]?.ok)?.name} />}</span> },
  { key: 'customer', label: 'Customer' },
  { key: 'room', label: 'Hotel room', render: (r) => (r.room === 'Unassigned' ? <span className="tone-warn">Unassigned</span> : r.room) },
  { key: 'dayIn', label: 'Date in', group: 'Stay', render: (r) => fmtDate(r.dayIn) },
  { key: 'timeIn', label: 'Time in', group: 'Stay' },
  { key: 'dayOut', label: 'Date out', group: 'Stay', render: (r) => fmtDate(r.dayOut) },
  { key: 'timeOut', label: 'Time out', group: 'Stay' },
  { key: 'nights', label: 'Nbr days', group: 'Stay', align: 'right', render: (r) => String(r.kind === 'daycare' ? 1 : r.nights).padStart(2, '0') },
  { key: 'petNames', label: 'Pet(s)', group: 'Pets' },
  { key: 'breeds', label: 'Breed', group: 'Pets' },
  { key: 'petCount', label: 'Pet count', group: 'Pets', align: 'right', render: (r) => String(r.petCount).padStart(2, '0') },
  { key: 'mobile', label: 'Mobile', group: 'Contact', mono: true, hideOnCard: false },
  { key: 'altPhone', label: 'Home', group: 'Contact', mono: true, hideOnCard: true },
  { key: 'total', label: 'Total charge', group: 'Money', align: 'right', render: (r) => money(r.total) },
  { key: 'deposit', label: 'Deposits', group: 'Money', align: 'right', render: (r) => money(r.deposit) },
  { key: 'balance', label: 'Balance', group: 'Money', align: 'right', render: (r) => <span className={r.balance > 0 ? 'tone-warn' : 'tone-success'}>{money(r.balance)}</span> },
  { key: 'notes', label: 'Booking notes', width: 200, render: (r) => (r.notes ? <span className="fdr-notes" title={r.notes}>{r.notes}</span> : <span className="faint">—</span>) },
];

/** Shorter set for the dashboard (F-01). */
export const TODAY_COLUMNS: DataTableColumn<ReservationRow>[] = RESERVATION_COLUMNS.filter((c) => ['code', 'status', 'customer', 'room', 'dayIn', 'timeIn', 'dayOut', 'timeOut', 'nights', 'petNames', 'balance'].includes(c.key)).map((c) => ({ ...c, group: undefined }));
