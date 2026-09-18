import './PasswordStrengthBar.css';

export interface PasswordCheck { label: string; ok: boolean }
export function passwordChecks(pw: string): PasswordCheck[] {
  return [
    { label: 'At least 8 characters', ok: pw.length >= 8 },
    { label: 'A letter and a number', ok: /[a-zA-Z]/.test(pw) && /\d/.test(pw) },
    { label: 'Upper and lower case', ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: 'A symbol', ok: /[^\w\s]/.test(pw) },
  ];
}
export const passwordScore = (pw: string) => passwordChecks(pw).filter((c) => c.ok).length;

export interface PasswordStrengthBarProps { password: string; showChecks?: boolean; className?: string }

/** Four-segment strength bar (Weak / Fair / Good / Strong) with the rule checklist under a new-password field. */
export function PasswordStrengthBar({ password, showChecks = true, className = '' }: PasswordStrengthBarProps) {
  const checks = passwordChecks(password);
  const score = checks.filter((c) => c.ok).length;
  const label = !password ? '' : ['Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
  return (
    <div className={`pwbar ${className}`} aria-live="polite">
      <div className="pwbar-track" role="meter" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score} aria-label="Password strength">
        {[1, 2, 3, 4].map((n) => <span key={n} className={`pwbar-seg ${password && n <= score ? `is-on lvl-${score}` : ''}`} />)}
      </div>
      {label && <span className={`pwbar-label lvl-${score}`}>{label}</span>}
      {showChecks && <ul className="pwbar-checks">{checks.map((c) => <li key={c.label} className={c.ok ? 'is-ok' : ''}>{c.label}</li>)}</ul>}
    </div>
  );
}
