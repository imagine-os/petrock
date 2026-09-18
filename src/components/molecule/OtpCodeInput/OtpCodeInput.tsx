import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import './OtpCodeInput.css';

export interface OtpCodeInputProps {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  /** Called once when every box is filled. */
  onComplete?: (code: string) => void;
  error?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
}

/** One box per digit with auto-advance, Backspace, arrow keys and paste of the whole code. Numeric keyboard on phones. */
export function OtpCodeInput({ length = 6, value, onChange, onComplete, error, disabled = false, autoFocus = false, label = 'Verification code' }: OtpCodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const completed = useRef('');
  useEffect(() => { if (value.length === length && completed.current !== value) { completed.current = value; onComplete?.(value); } if (value.length < length) completed.current = ''; }, [value, length, onComplete]);
  useEffect(() => { if (autoFocus) refs.current[0]?.focus(); }, [autoFocus]);
  useEffect(() => { if (error) { onChange(''); refs.current[0]?.focus(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [error]);

  const setAt = (i: number, d: string) => {
    const next = digits.slice(); next[i] = d;
    onChange(next.join('').slice(0, length));
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') { e.preventDefault(); if (digits[i]) setAt(i, ''); else if (i > 0) { setAt(i - 1, ''); refs.current[i - 1]?.focus(); } }
    else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };
  const onInput = (i: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (!clean) { setAt(i, ''); return; }
    if (clean.length > 1) { const merged = (value.slice(0, i) + clean).slice(0, length); onChange(merged); refs.current[Math.min(merged.length, length - 1)]?.focus(); return; }
    setAt(i, clean);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const clean = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!clean) return;
    e.preventDefault(); onChange(clean); refs.current[Math.min(clean.length, length - 1)]?.focus();
  };
  return (
    <div className={`otp ${error ? 'has-error' : ''}`} role="group" aria-label={label}>
      <div className="otp-boxes">
        {digits.map((d, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} className={`otp-box ${d ? 'is-filled' : ''} ${focused === i ? 'is-focused' : ''}`} inputMode="numeric" pattern="[0-9]*" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={length} value={d} disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`} aria-invalid={!!error || undefined} onChange={(e) => onInput(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} onPaste={onPaste} onFocus={(e) => { setFocused(i); e.target.select(); }} onBlur={() => setFocused(null)} />
        ))}
      </div>
      {error && <div className="otp-error" role="alert">{error}</div>}
    </div>
  );
}
