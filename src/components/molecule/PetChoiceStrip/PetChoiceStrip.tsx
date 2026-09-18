import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import './PetChoiceStrip.css';

export interface PetChoice { id: string; name: string; breed?: string | null; size?: string | null; photoUrl?: string | null; approval?: 'approved' | 'pending' | 'needs_details' | string; vaccinesOk?: boolean }
export interface PetChoiceStripProps { pets: PetChoice[]; value: string[]; onChange: (ids: string[]) => void; multiple?: boolean; label?: string; onAddPet?: () => void; disabledIds?: string[] }

/** Horizontal row of selectable pet cards (Figma "Choose Pet" / "Select Your Pet"): photo, name, breed / size, approval + vaccine status. Single or multi select. */
export function PetChoiceStrip({ pets, value, onChange, multiple = false, label, onAddPet, disabledIds = [] }: PetChoiceStripProps) {
  const toggle = (id: string) => {
    if (multiple) onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
    else onChange([id]);
  };
  return (
    <div className="petstrip" role="group" aria-label={label ?? 'Choose pet'}>
      {label && <div className="field-label">{label}</div>}
      <div className="petstrip-row">
        {pets.map((p) => {
          const selected = value.includes(p.id);
          const disabled = disabledIds.includes(p.id);
          return (
            <button key={p.id} type="button" className={`petstrip-card ${selected ? 'is-selected' : ''}`} aria-pressed={selected} disabled={disabled} onClick={() => toggle(p.id)}>
              <Avatar name={p.name} src={p.photoUrl} size={48} kind="pet" />
              <span className="petstrip-name">{p.name}</span>
              <span className="petstrip-sub">{[p.breed, p.size ? `Size ${p.size}` : null].filter(Boolean).join(' · ') || ' '}</span>
              <span className="petstrip-badges">
                {p.approval && p.approval !== 'approved' && <Badge tone="warn" size="sm" dot>{p.approval === 'needs_details' ? 'Needs details' : 'Pending'}</Badge>}
                {p.vaccinesOk != null && <Badge tone={p.vaccinesOk ? 'success' : 'warn'} size="sm" dot>{p.vaccinesOk ? 'Vaccines OK' : 'Vaccines pending'}</Badge>}
              </span>
              {selected && <span className="petstrip-check" aria-hidden><Icon name="check" size={12} strokeWidth={3} /></span>}
            </button>
          );
        })}
        {onAddPet && <button type="button" className="petstrip-card petstrip-add" onClick={onAddPet}><span className="petstrip-addicon"><Icon name="plus" size={20} /></span><span className="petstrip-name">Add a pet</span></button>}
      </div>
    </div>
  );
}
