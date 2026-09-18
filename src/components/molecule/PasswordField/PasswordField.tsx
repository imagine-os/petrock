import { forwardRef, useId, useState, type ReactNode } from 'react';
import { Input, type InputProps } from '../../atom/Input/Input';
import { Icon } from '../../atom/Icon/Icon';
import { checkPassword } from './strength';
import './PasswordField.css';

export interface PasswordFieldProps extends Omit<InputProps, 'type' | 'suffix' | 'value' | 'onChange'> {
  value: string;
  onChange: (v: string) => void;
  /** Show the strength meter and the policy checklist (sign-up, reset). */
  showStrength?: boolean;
  minLength?: number;
  label?: ReactNode;
}

const EyeOff = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
  </svg>
);

/** Password input with a show / hide toggle and an optional live strength meter + policy checklist (R-X30). */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField({ value, onChange, showStrength = false, minLength = 8, label = 'Password', hint, className = '', ...rest }, ref) {
  const [visible, setVisible] = useState(false);
  const check = checkPassword(value, minLength);
  const id = useId();
  return (
    <div className={`pwfield ${className}`}>
      <Input ref={ref} type={visible ? 'text' : 'password'} label={label} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={rest.autoComplete ?? 'current-password'} hint={hint}
        suffix={<button type="button" className="pwfield-toggle" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>{visible ? <EyeOff /> : <Icon name="eye" size={18} />}</button>}
        aria-describedby={showStrength ? `${id}-strength` : undefined} {...rest} />
      {showStrength && (
        <div className="pwfield-strength" id={`${id}-strength`}>
          <div className={`pwfield-meter s-${check.score}`} aria-hidden>{[0, 1, 2, 3].map((i) => <span key={i} className={i < check.score ? 'is-on' : ''} />)}</div>
          <div className="pwfield-meter-label" aria-live="polite">{check.label}</div>
          <ul className="pwfield-checks">
            {check.checks.map((c) => <li key={c.id} className={c.ok && value ? 'is-ok' : ''}><Icon name={c.ok && value ? 'check' : 'minus'} size={12} strokeWidth={2.5} />{c.label}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
});
