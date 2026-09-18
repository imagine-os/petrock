import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import './Checkbox.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> { label?: ReactNode; description?: ReactNode; indeterminate?: boolean }

/** Checkbox with label and optional description. Multi-select lists (socialised with Humans / Dogs) use it. */
export function Checkbox({ label, description, indeterminate, className = '', id, ...rest }: CheckboxProps) {
  const auto = useId();
  const cbId = id ?? auto;
  return (
    <label className={`checkbox ${rest.disabled ? 'is-disabled' : ''} ${className}`} htmlFor={cbId}>
      <input type="checkbox" id={cbId} className="checkbox-input" ref={(el) => { if (el) el.indeterminate = !!indeterminate; }} {...rest} />
      <span className="checkbox-box" aria-hidden><Icon name={indeterminate ? 'minus' : 'check'} size={14} strokeWidth={2.5} /></span>
      {(label || description) && <span className="checkbox-text">{label && <span className="checkbox-label">{label}</span>}{description && <span className="checkbox-desc">{description}</span>}</span>}
    </label>
  );
}
