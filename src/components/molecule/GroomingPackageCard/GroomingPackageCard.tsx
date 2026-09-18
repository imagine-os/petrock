import { Icon } from '../../atom/Icon/Icon';
import { Badge } from '../../atom/Badge/Badge';
import { fmtMoney } from '../../../pricing/engine';
import './GroomingPackageCard.css';

export interface GroomingPackageCardProps { name: string; tier?: string; inclusions?: string | null; price: number; minutes?: number; size?: string; selected?: boolean; onSelect?: () => void; disabled?: boolean; note?: string | null; compact?: boolean }

/** Package option (Gold / Platinum / Diamond) with paw tile, inclusions, price for the pet's size and a check circle (Figma "Choose Package"). */
export function GroomingPackageCard({ name, tier, inclusions, price, minutes, size, selected = false, onSelect, disabled = false, note, compact = false }: GroomingPackageCardProps) {
  const Tag = onSelect ? 'button' : 'div';
  return (
    <Tag type={onSelect ? 'button' : undefined} className={`pkgcard pkg-${tier ?? 'default'} ${selected ? 'is-selected' : ''} ${compact ? 'is-compact' : ''} ${onSelect ? 'is-interactive' : ''}`} onClick={onSelect} disabled={onSelect ? disabled : undefined} aria-pressed={onSelect ? selected : undefined}>
      <span className="pkgcard-tile" aria-hidden><Icon name={tier === 'diamond' ? 'sparkle' : tier === 'platinum' ? 'star' : 'paw'} size={22} /></span>
      <span className="pkgcard-text">
        <span className="pkgcard-title">{name}{tier && <Badge tone={tier === 'diamond' ? 'primary' : tier === 'platinum' ? 'info' : 'accent'} size="sm">{tier}</Badge>}</span>
        {inclusions && !compact && <span className="pkgcard-desc">{inclusions}</span>}
        <span className="pkgcard-meta"><strong className="pkgcard-price">{fmtMoney(price)}</strong>{size && <span className="muted xs">size {size}</span>}{minutes != null && <span className="muted xs"><Icon name="clock" size={12} /> {minutes} min</span>}</span>
        {note && <span className="pkgcard-note xs">{note}</span>}
      </span>
      {onSelect && <span className="pkgcard-check" aria-hidden>{selected ? <Icon name="check" size={14} strokeWidth={3} /> : null}</span>}
    </Tag>
  );
}
