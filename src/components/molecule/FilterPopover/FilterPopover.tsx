import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../atom/Button/Button';
import { Badge } from '../../atom/Badge/Badge';
import './FilterPopover.css';

export interface FilterPopoverProps {
  /** Button text (Figma "Filters"). */
  label?: string;
  /** Number of active filters; shows a small badge on the button. */
  count?: number;
  /** Filter controls (Select / Toggle / Input). */
  children?: ReactNode;
  align?: 'left' | 'right';
  /** "Clear" action in the panel head; hidden when omitted or count is 0. */
  onClear?: () => void;
  size?: 'sm' | 'md';
}

/**
 * Figma desk "Filters" tool button (front desk.jpg, all reservation grooming-2.jpg): white outline button with the filter
 * glyph; the actual controls open in a popover so the toolbar stays a single row. Escape / outside click closes it.
 */
export function FilterPopover({ label = 'Filters', count = 0, children, align = 'right', onClear, size = 'sm' }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div className={`fpop fpop-${align}`} ref={ref}>
      <Button variant="outline" size={size} icon="filter" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog" className={open ? 'is-open' : ''}>
        {label}{count > 0 && <Badge size="sm" tone="primary" className="fpop-count">{count}</Badge>}
      </Button>
      {open && (
        <div className="fpop-panel" role="dialog" aria-label={label}>
          <div className="fpop-head"><span className="fpop-title">{label}</span>{onClear && count > 0 && <Button variant="link" size="sm" onClick={onClear}>Clear</Button>}</div>
          <div className="fpop-body">{children}</div>
        </div>
      )}
    </div>
  );
}
