import type { ReactNode } from 'react';
import { Button } from '../../atom/Button/Button';
import { Icon } from '../../atom/Icon/Icon';
import { Badge } from '../../atom/Badge/Badge';
import './HotelRoomTypeCard.css';

export interface HotelRoomTypeCardProps {
  name: string;
  description?: string | null;
  photoUrl?: string | null;
  /** Average nightly rate per pet for the chosen dates (from the pricing engine), formatted by the caller. */
  priceLabel?: ReactNode;
  priceHint?: string;
  selected?: boolean;
  disabled?: boolean;
  /** Why the room cannot be chosen (55 lb rule, capacity). */
  reason?: string;
  /** Small informational chips (e.g. "3 rooms left", "Bottom room needed"). */
  chips?: { label: string; tone?: 'neutral' | 'success' | 'warn' | 'danger' | 'info' | 'primary' }[];
  ctaLabel?: string;
  onSelect?: () => void;
}

/** Room type card (Figma Choose Your Room.png): 239 px photo bleeding to the gutter with the purple BOOK NOW overlay bottom-right, name 20/600, 12 px #304050 inclusions copy, "$150" 24/700 + "Avg Per Night/Pet" 14/600 in primary; no card border or shadow. */
export function HotelRoomTypeCard({ name, description, photoUrl, priceLabel, priceHint = 'Avg Per Night/Pet', selected = false, disabled = false, reason, chips = [], ctaLabel = 'Book now', onSelect }: HotelRoomTypeCardProps) {
  return (
    <article className={`roomcard ${selected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`} aria-disabled={disabled || undefined}>
      <div className="roomcard-photo" style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}>
        {!photoUrl && <span className="roomcard-photo-ph" aria-hidden><Icon name="svc-hotel" size={72} strokeWidth={1.2} /></span>}
        {onSelect && <div className="roomcard-cta"><Button size="sm" onClick={onSelect} disabled={disabled} icon={selected ? 'check' : undefined}>{selected ? 'Selected' : ctaLabel.toUpperCase()}</Button></div>}
      </div>
      <div className="roomcard-body">
        <div className="row-between wrap"><h3 className="roomcard-name">{name}</h3>{chips.length > 0 && <div className="row wrap" style={{ gap: 4 }}>{chips.map((c) => <Badge key={c.label} size="sm" tone={c.tone ?? 'neutral'}>{c.label}</Badge>)}</div>}</div>
        {description && <p className="roomcard-desc">{description}</p>}
        {priceLabel != null && <p className="roomcard-price"><span className="roomcard-price-value">{priceLabel}</span> <span className="roomcard-price-hint">{priceHint}</span></p>}
        {disabled && reason && <p className="roomcard-reason"><Icon name="warning" size={14} /> {reason}</p>}
      </div>
    </article>
  );
}
