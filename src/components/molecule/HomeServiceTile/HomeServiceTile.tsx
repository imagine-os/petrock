import { Icon, type IconName } from '../../atom/Icon/Icon';
import './HomeServiceTile.css';

export interface HomeServiceTileProps { label: string; icon: IconName; onClick?: () => void; disabled?: boolean; hint?: string; className?: string }

/** Generic service glyphs -> the Figma tile line art (Services.png): house + paw, bubbles, person + dogs, van + paw. */
const TILE_ICON: Partial<Record<string, IconName>> = { bed: 'svc-hotel', hotel: 'svc-hotel', scissors: 'svc-spa', spa: 'svc-spa', grooming: 'svc-spa', sun: 'svc-daycare', daycare: 'svc-daycare', building: 'svc-inhome', inhome: 'svc-inhome', home: 'svc-inhome' };

/** Purple service tile from the Home "Services" row (528:13558): ~75x76 #552583 r8, white 36 px line icon over an Open Sans 700 12 label, no shadow. */
export function HomeServiceTile({ label, icon, onClick, disabled = false, hint, className = '' }: HomeServiceTileProps) {
  return (
    <button type="button" className={`svctile ${disabled ? 'is-disabled' : ''} ${className}`} onClick={onClick} disabled={disabled} title={hint}>
      <span className="svctile-icon"><Icon name={TILE_ICON[icon] ?? icon} size={36} strokeWidth={1.5} /></span>
      <span className="svctile-label">{label}</span>
      {hint && <span className="svctile-hint">{hint}</span>}
    </button>
  );
}
