import { Badge, type BadgeTone } from '../../atom/Badge/Badge';
import './GroomStatusBadge.css';

export type GroomStatus = 'requested' | 'confirmed' | 'in_progress' | 'done' | 'cancelled' | 'no_show';
export const GROOM_STATUS_LABEL: Record<GroomStatus, string> = { requested: 'Requested', confirmed: 'Confirmed', in_progress: 'In progress', done: 'Done', cancelled: 'Cancelled', no_show: 'No show' };
const TONE: Record<GroomStatus, BadgeTone> = { requested: 'info', confirmed: 'success', in_progress: 'warn', done: 'neutral', cancelled: 'danger', no_show: 'danger' };

/** Grooming appointment status (core APPOINTMENT_STATUS); colours follow the booking StatusBadge palette (R-I01). */
export function GroomStatusBadge({ status, size = 'md' }: { status: GroomStatus | string; size?: 'sm' | 'md' }) {
  const s = status as GroomStatus;
  return <Badge tone={TONE[s] ?? 'neutral'} size={size} dot className="groomstatus" title={GROOM_STATUS_LABEL[s] ?? status}>{GROOM_STATUS_LABEL[s] ?? status}</Badge>;
}
