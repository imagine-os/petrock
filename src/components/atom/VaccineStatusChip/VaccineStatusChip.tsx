import { Icon, type IconName } from '../Icon/Icon';
import './VaccineStatusChip.css';

/** Customer-facing vaccine states (R-X20): derived from vaccine_records.status plus expiry. */
export type VaccineChipStatus = 'verified' | 'pending' | 'expired' | 'missing' | 'rejected';
export interface VaccineStatusChipProps { status: VaccineChipStatus; size?: 'sm' | 'md'; label?: string; className?: string }

export const VACCINE_STATUS_LABEL: Record<VaccineChipStatus, string> = { verified: 'Verified', pending: 'Pending', expired: 'Expired', missing: 'Missing', rejected: 'Rejected' };
const ICON: Record<VaccineChipStatus, IconName> = { verified: 'check', pending: 'clock', expired: 'warning', missing: 'close', rejected: 'warning' };

/** Small status pill for one vaccine or a pet's overall vaccine state: verified (green), pending (orange), expired / rejected (red), missing (grey). */
export function VaccineStatusChip({ status, size = 'md', label, className = '' }: VaccineStatusChipProps) {
  return (
    <span className={`vchip vchip-${size} ${className}`} data-status={status} title={VACCINE_STATUS_LABEL[status]}>
      <Icon name={ICON[status]} size={size === 'sm' ? 11 : 13} strokeWidth={2.5} />
      <span>{label ?? VACCINE_STATUS_LABEL[status]}</span>
    </span>
  );
}
