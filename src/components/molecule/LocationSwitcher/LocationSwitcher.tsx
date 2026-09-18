import { useLocation } from '../../../tenant/LocationProvider';
import { Icon } from '../../atom/Icon/Icon';
import { Select } from '../../atom/Select/Select';
import './LocationSwitcher.css';

export interface LocationSwitcherProps { allowAll?: boolean; compact?: boolean }

/** Current location, always visible in the top bar. Pinned roles see a label; owner / super admin get a select (+ "All locations"). */
export function LocationSwitcher({ allowAll = true, compact = false }: LocationSwitcherProps) {
  const { locations, location, locationId, canSwitch, allLocations, setLocationId, setAllLocations } = useLocation();
  if (!canSwitch) {
    return <span className={`locswitch is-pinned ${compact ? 'is-compact' : ''}`} title={location.address}><Icon name="location" size={16} /><span className="locswitch-name">{compact ? location.short_name : location.name}</span></span>;
  }
  const value = allLocations ? '__all__' : locationId;
  return (
    <span className={`locswitch ${compact ? 'is-compact' : ''}`}>
      <Icon name="location" size={16} className="locswitch-icon" />
      <Select size="sm" aria-label="Location" value={value} onChange={(e) => (e.target.value === '__all__' ? setAllLocations(true) : setLocationId(e.target.value))}
        options={[...locations.map((l) => ({ value: l.id, label: compact ? l.short_name : l.name })), ...(allowAll ? [{ value: '__all__', label: 'All locations' }] : [])]} />
    </span>
  );
}
