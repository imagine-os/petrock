import { Toggle } from '../../atom/Toggle/Toggle';
import { Icon } from '../../atom/Icon/Icon';
import { fmtMoney } from '../../../pricing/engine';
import './GroomingAddonRow.css';

export interface GroomingAddonRowProps { name: string; price: number; startingAt?: boolean; addedMinutes?: number; description?: string | null; restricted?: string | null; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }

/** One add-on line (Figma add-ons list): name, green price ("from" when starting_at), added minutes, toggle with Yes/No. */
export function GroomingAddonRow({ name, price, startingAt = false, addedMinutes, description, restricted, checked, onChange, disabled = false }: GroomingAddonRowProps) {
  return (
    <div className={`addonrow ${checked ? 'is-on' : ''} ${disabled ? 'is-disabled' : ''}`}>
      <div className="addonrow-text">
        <span className="addonrow-name">{name}</span>
        {(description || restricted || addedMinutes) && <span className="addonrow-sub xs muted">{[description, addedMinutes ? `+${addedMinutes} min` : null, restricted ? `needs ${restricted}` : null].filter(Boolean).join(' · ')}</span>}
      </div>
      <span className="addonrow-price">{startingAt && <span className="xs">from </span>}{fmtMoney(price)}</span>
      <div className="addonrow-toggle"><Toggle checked={checked} onChange={onChange} disabled={disabled} size="sm" label={<span className="addonrow-yes">{checked ? 'Yes' : 'No'}</span>} /></div>
      {startingAt && <span className="addonrow-info" title="Starting price; final price depends on coat condition"><Icon name="info" size={14} /></span>}
    </div>
  );
}
