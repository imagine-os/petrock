import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge, type BadgeTone } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import './BookingPetCard.css';

export type PetVaccineState = 'ok' | 'pending' | 'missing' | 'expired';
export interface BookingPetCardProps {
  name: string;
  breed?: string | null;
  weightLbs?: number | null;
  photoUrl?: string | null;
  /** pets.approval_status */
  approval?: string;
  vaccine?: PetVaccineState;
  selected: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  /** Compact chip-like variant for summaries. */
  compact?: boolean;
}

const VACCINE_LABEL: Record<PetVaccineState, [string, BadgeTone]> = { ok: ['Vaccines OK', 'success'], pending: ['Vaccines pending', 'warn'], missing: ['Vaccines missing', 'danger'], expired: ['Vaccine expired', 'danger'] };

/** Selectable pet card for booking flows (Choose Pets): avatar, name, breed / weight, approval + vaccine chips. Filled purple when selected (Figma). */
export function BookingPetCard({ name, breed, weightLbs, photoUrl, approval, vaccine, selected, onToggle, disabled = false, disabledReason, compact = false }: BookingPetCardProps) {
  const [vl, vt] = vaccine ? VACCINE_LABEL[vaccine] : ['', 'neutral' as BadgeTone];
  return (
    <button type="button" className={`bpetcard ${selected ? 'is-selected' : ''} ${compact ? 'is-compact' : ''}`} aria-pressed={selected} disabled={disabled} onClick={onToggle} title={disabled ? disabledReason : undefined}>
      <span className="bpetcard-check" aria-hidden>{selected && <Icon name="check" size={12} strokeWidth={3} />}</span>
      <Avatar name={name} src={photoUrl} kind="pet" size={compact ? 36 : 56} />
      <span className="bpetcard-name">{name}</span>
      {!compact && <span className="bpetcard-sub">{[breed, weightLbs != null ? `${weightLbs} lb` : null].filter(Boolean).join(' · ') || ' '}</span>}
      {!compact && (
        <span className="bpetcard-chips">
          {approval && approval !== 'approved' && <Badge size="sm" tone="warn" dot>{approval === 'needs_details' ? 'Needs details' : 'Pending'}</Badge>}
          {vaccine && <Badge size="sm" tone={vt} dot>{vl}</Badge>}
        </span>
      )}
      {disabled && disabledReason && <span className="bpetcard-reason">{disabledReason}</span>}
    </button>
  );
}
