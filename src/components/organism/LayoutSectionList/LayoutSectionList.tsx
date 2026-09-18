import { useState } from 'react';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Toggle } from '../../atom/Toggle/Toggle';
import { Icon } from '../../atom/Icon/Icon';
import './LayoutSectionList.css';

export interface LayoutSectionItem { name: string; hidden: boolean }
export interface LayoutSectionListProps { items: LayoutSectionItem[]; onChange: (items: LayoutSectionItem[]) => void; disabled?: boolean }

/** D-11: the sections of a page as an ordered list. Drag handles (HTML5 DnD), up/down buttons for keyboards, a visibility toggle per section. */
export function LayoutSectionList({ items, onChange, disabled = false }: LayoutSectionListProps) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items]; const [it] = next.splice(from, 1); next.splice(to, 0, it); onChange(next);
  };
  const toggle = (i: number, visible: boolean) => onChange(items.map((it, k) => (k === i ? { ...it, hidden: !visible } : it)));
  return (
    <ol className="lsl" aria-label="Page sections in order">
      {items.map((it, i) => (
        <li key={it.name} className={`lsl-item ${it.hidden ? 'is-hidden' : ''} ${over === i && drag !== null && drag !== i ? 'is-over' : ''}`}
          draggable={!disabled} onDragStart={() => setDrag(i)} onDragOver={(e) => { e.preventDefault(); setOver(i); }} onDragLeave={() => setOver(null)} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); setOver(null); }} onDragEnd={() => { setDrag(null); setOver(null); }}>
          <span className="lsl-handle" aria-hidden="true"><Icon name="more" size={14} /></span>
          <span className="lsl-index mono xs">{i + 1}</span>
          <span className="lsl-name">{it.name}</span>
          <span className="lsl-actions">
            <IconButton size="sm" icon="chevron-up" label={`Move ${it.name} up`} disabled={disabled || i === 0} onClick={() => move(i, i - 1)} />
            <IconButton size="sm" icon="chevron-down" label={`Move ${it.name} down`} disabled={disabled || i === items.length - 1} onClick={() => move(i, i + 1)} />
            <Toggle size="sm" checked={!it.hidden} onChange={(v) => toggle(i, v)} disabled={disabled} label={<span className="sr-only">Show {it.name}</span>} />
          </span>
        </li>
      ))}
    </ol>
  );
}
