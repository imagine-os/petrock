import type { ReactNode } from 'react';
import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import { VaccineStatusChip, type VaccineChipStatus } from '../../atom/VaccineStatusChip/VaccineStatusChip';
import './VaccineRecordRow.css';

export interface VaccineRecordRowProps {
  name: string;
  required: boolean;
  status: VaccineChipStatus;
  /** Preformatted dates. */
  vaccinatedOn?: string | null;
  expiresOn?: string | null;
  proofName?: string | null;
  note?: string | null;
  /** Right-side action (Button "Upload" / "Update"). */
  action?: ReactNode;
  className?: string;
}

/** One vaccine of a pet: name with Required / Recommended tag, status chip, dates and proof file name, action slot. */
export function VaccineRecordRow({ name, required, status, vaccinatedOn, expiresOn, proofName, note, action, className = '' }: VaccineRecordRowProps) {
  return (
    <div className={`vrow ${className}`} data-status={status}>
      <span className="vrow-icon" aria-hidden><Icon name="shield" size={18} /></span>
      <div className="vrow-main">
        <div className="vrow-head"><span className="vrow-name">{name}</span><Badge size="sm" tone={required ? 'primary' : 'neutral'}>{required ? 'Required' : 'Recommended'}</Badge></div>
        <div className="vrow-meta">
          <VaccineStatusChip status={status} size="sm" />
          {vaccinatedOn && <span><Icon name="check" size={11} /> Given {vaccinatedOn}</span>}
          {expiresOn && <span className={status === 'expired' ? 'tone-danger' : ''}><Icon name="calendar" size={11} /> {status === 'expired' ? 'Expired' : 'Expires'} {expiresOn}</span>}
          {proofName && <span className="vrow-proof"><Icon name="spec" size={11} /> {proofName}</span>}
        </div>
        {note && <div className="vrow-note">{note}</div>}
      </div>
      {action && <div className="vrow-action">{action}</div>}
    </div>
  );
}
