import { Icon, type IconName } from '../../atom/Icon/Icon';
import './HomeServiceTile.css';

export interface HomeServiceTileProps { label: string; icon: IconName; onClick?: () => void; disabled?: boolean; hint?: string; className?: string }

/** Purple service tile from the Home "Services" row (Hotel, Grooming & Spa, Daycare): white outline icon over the label. */
export function HomeServiceTile({ label, icon, onClick, disabled = false, hint, className = '' }: HomeServiceTileProps) {
  return (
    <button type="button" className={`svctile ${disabled ? 'is-disabled' : ''} ${className}`} onClick={onClick} disabled={disabled} title={hint}>
      <span className="svctile-icon"><Icon name={icon} size={30} strokeWidth={1.6} /></span>
      <span className="svctile-label">{label}</span>
      {hint && <span className="svctile-hint">{hint}</span>}
    </button>
  );
}
