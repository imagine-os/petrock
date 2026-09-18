import { useState } from 'react';
import { Select } from '../../atom/Select/Select';
import { Input } from '../../atom/Input/Input';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Button } from '../../atom/Button/Button';
import { useData, useTable } from '../../../data/DataContext';
import type { LookupValueRow } from '../../../data/schema/frontdesk-grooming-people';
import type { BaseRow } from '../../../data/schema/types';
type VetRow = BaseRow & { name: string };
import './DeskLookupSelect.css';

export interface DeskLookupSelectProps { kind: LookupValueRow['kind'] | 'vet'; label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string; error?: string; allowAdd?: boolean; hint?: string }

/**
 * Select fed by the lookup_values table (or vets) with the Figma "+" to add a value inline (R-J04, R-B08). The added
 * value is written to the table so every form sees it.
 */
export function DeskLookupSelect({ kind, label, value, onChange, required, placeholder = 'Choose', error, allowAdd = true, hint }: DeskLookupSelectProps) {
  const data = useData();
  const isVet = kind === 'vet';
  const { rows: lookups } = useTable<LookupValueRow>('lookup_values', isVet ? { where: { kind: '__none__' } } : { where: { kind } });
  const { rows: vets } = useTable<VetRow>('vets');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const options = isVet ? vets.map((v) => ({ value: v.id, label: v.name })) : lookups.filter((l) => l.active).sort((a, b) => a.sort_order - b.sort_order).map((l) => ({ value: l.value, label: l.value }));
  if (value && !options.some((o) => o.value === value)) options.push({ value, label: isVet ? value : value });
  const add = async () => {
    const v = draft.trim(); if (!v) return;
    if (isVet) { const row = await data.insert<VetRow>('vets', { name: v, phone: null, address: null } as Partial<VetRow>); onChange(row.id); }
    else { await data.insert<LookupValueRow>('lookup_values', { kind, value: v, sort_order: lookups.length, active: true } as Partial<LookupValueRow>); onChange(v); }
    setDraft(''); setAdding(false);
  };
  return (
    <div className="lookupsel">
      {adding ? (
        <div className="lookupsel-add">
          <Input label={`New ${label.toLowerCase()}`} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } if (e.key === 'Escape') setAdding(false); }} />
          <Button size="sm" onClick={add} disabled={!draft.trim()}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      ) : (
        <div className="lookupsel-row">
          <Select label={label} value={value} onChange={(e) => onChange(e.target.value)} options={options} placeholder={placeholder} required={required} error={error} hint={hint} className="grow" />
          {allowAdd && <IconButton icon="plus" label={`Add ${label.toLowerCase()}`} variant="outline" size="sm" className="lookupsel-plus" onClick={() => setAdding(true)} />}
        </div>
      )}
    </div>
  );
}
