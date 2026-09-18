/** The 18 reservation columns of the design (Frame 1171276264-10) as DataTable columns, shared by F-01 and F-10.
 *  Cell tones per Figma 598:23546..23562: id / room / breed muted, customer navy, dates #181818, times / counts / phones / money purple. */
import type { DataTableColumn } from '../../../components/organism/DataTable/DataTable';
import { StatusBadge } from '../../../components/atom/Badge/Badge';
import { PetVaccineStatus } from '../../../components/molecule/PetVaccineStatus/PetVaccineStatus';
import { fmtMoney } from '../../../pricing/engine';
import { fmtDate } from './dates';
import type { ReservationRow } from './reservations';

const money = (n: number) => <span>{fmtMoney(n)}</span>;

export const RESERVATION_COLUMNS: DataTableColumn<ReservationRow>[] = [
  { key: 'code', label: 'ID', width: 96, tone: 'muted', render: (r) => <span className="xs">{r.code}</span> },
  { key: 'status', label: 'Status', width: 140, render: (r) => <span className="row" style={{ gap: 6 }}><StatusBadge status={r.status} />{!r.vaccineOk && r.pets[0] && <PetVaccineStatus compact summary={Object.values(r.vaccines).find((v) => !v.ok)!} petName={r.pets.find((p) => !r.vaccines[p.id]?.ok)?.name} />}</span> },
  { key: 'customer', label: 'Customer', tone: 'heading' },
  { key: 'room', label: 'Hotel room', tone: 'muted', render: (r) => (r.room === 'Unassigned' ? <span className="tone-warn">Unassigned</span> : r.room) },
  { key: 'dayIn', label: 'Date in', group: 'Stay', tone: 'date', render: (r) => fmtDate(r.dayIn) },
  { key: 'timeIn', label: 'Time in', group: 'Stay', tone: 'primary' },
  { key: 'dayOut', label: 'Date out', group: 'Stay', tone: 'date', render: (r) => fmtDate(r.dayOut) },
  { key: 'timeOut', label: 'Time out', group: 'Stay', tone: 'primary' },
  { key: 'nights', label: 'Nbr days', group: 'Stay', tone: 'primary', render: (r) => String(r.kind === 'daycare' ? 1 : r.nights).padStart(2, '0') },
  { key: 'petNames', label: 'Pet(s)', group: 'Pets', tone: 'muted' },
  { key: 'breeds', label: 'Breed', group: 'Pets', tone: 'muted' },
  { key: 'petCount', label: 'Pet count', group: 'Pets', tone: 'primary', render: (r) => String(r.petCount).padStart(2, '0') },
  { key: 'mobile', label: 'Mobile', group: 'Contact', tone: 'primary', hideOnCard: false },
  { key: 'altPhone', label: 'Home', group: 'Contact', tone: 'primary', hideOnCard: true },
  { key: 'total', label: 'Total charge', group: 'Money', tone: 'primary', render: (r) => money(r.total) },
  { key: 'deposit', label: 'Deposits', group: 'Money', tone: 'primary', render: (r) => money(r.deposit) },
  { key: 'balance', label: 'Balance', group: 'Money', tone: 'primary', render: (r) => <span className={r.balance > 0 ? 'tone-warn' : undefined}>{money(r.balance)}</span> },
  { key: 'notes', label: 'Booking notes', width: 200, tone: 'muted', render: (r) => (r.notes ? <span className="fdr-notes" title={r.notes}>{r.notes}</span> : <span className="faint">—</span>) },
];

/** Shorter set for the dashboard (F-01). */
export const TODAY_COLUMNS: DataTableColumn<ReservationRow>[] = RESERVATION_COLUMNS.filter((c) => ['code', 'status', 'customer', 'room', 'dayIn', 'timeIn', 'dayOut', 'timeOut', 'nights', 'petNames', 'balance'].includes(c.key)).map((c) => ({ ...c, group: undefined }));

/** Figma (front desk.jpg) shows the 18 columns under ONE purple head without the "Stay / Pets / Contact / Money" group tier. */
export const RESERVATION_COLUMNS_FLAT: DataTableColumn<ReservationRow>[] = RESERVATION_COLUMNS.map((c) => ({ ...c, group: undefined }));
