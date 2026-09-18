import { Badge, type BadgeTone } from '../../atom/Badge/Badge';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './PetVaccineChip.css';

export type VaccineOverall = 'ok' | 'pending' | 'expired' | 'missing' | 'rejected';
export interface PetVaccineChipProps { overall: VaccineOverall; /** "2/3" style detail. */ detail?: string; size?: 'sm' | 'md'; title?: string }
const TONE: Record<VaccineOverall, BadgeTone> = { ok: 'success', pending: 'warn', expired: 'danger', missing: 'danger', rejected: 'danger' };
const LABEL: Record<VaccineOverall, string> = { ok: 'Vaccines OK', pending: 'Verify proof', expired: 'Expired', missing: 'Missing', rejected: 'Rejected' };
const ICON: Record<VaccineOverall, IconName> = { ok: 'shield', pending: 'clock', expired: 'warning', missing: 'plus', rejected: 'close' };

/** One-glance vaccine standing of a pet (R-A11): OK / verify proof / expired / missing / rejected. */
export function PetVaccineChip({ overall, detail, size = 'sm', title }: PetVaccineChipProps) {
  return <Badge tone={TONE[overall]} size={size} className="petvax" title={title ?? LABEL[overall]}><Icon name={ICON[overall]} size={12} /> {LABEL[overall]}{detail ? <span className="petvax-detail">{detail}</span> : null}</Badge>;
}
