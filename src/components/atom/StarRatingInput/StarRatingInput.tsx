import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import './StarRatingInput.css';

export interface StarRatingInputProps { value: number; onChange?: (v: number) => void; max?: number; size?: number; readOnly?: boolean; label?: string; className?: string }

/** 1-5 star picker (Rate the app, reviews). Read-only mode renders the review rating. Keyboard: arrows change, Enter/Space set. */
export function StarRatingInput({ value, onChange, max = 5, size = 32, readOnly = false, label = 'Rating', className = '' }: StarRatingInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  const set = (v: number) => { if (!readOnly && onChange) onChange(v); };
  return (
    <div className={`stars ${readOnly ? 'is-readonly' : ''} ${className}`} role={readOnly ? 'img' : 'radiogroup'} aria-label={readOnly ? `${label}: ${value} of ${max}` : label} onMouseLeave={() => setHover(null)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" className={`stars-star ${n <= shown ? 'is-on' : ''}`} style={{ width: size, height: size }} role={readOnly ? undefined : 'radio'} aria-checked={readOnly ? undefined : value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} tabIndex={readOnly ? -1 : value === n || (value === 0 && n === 1) ? 0 : -1} disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)} onFocus={() => !readOnly && setHover(n)} onBlur={() => setHover(null)} onClick={() => set(n)}
          onKeyDown={(e) => { if (readOnly) return; if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(Math.min(max, value + 1)); } if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(Math.max(1, value - 1)); } }}>
          <Icon name="star" size={Math.round(size * 0.78)} />
        </button>
      ))}
    </div>
  );
}
