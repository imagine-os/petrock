import { useEffect, useState } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import { PIN_MAX, PIN_MIN } from '../../../auth/pin';
import './PinPad.css';

export interface PinPadProps { onSubmit: (pin: string) => void | Promise<void>; error?: string | null; busy?: boolean; autoSubmitAt?: number; label?: string }

/** 4-6 digit PIN entry: masked dots, a 3x4 keypad, keyboard digits, Backspace and Enter. */
export function PinPad({ onSubmit, error, busy = false, autoSubmitAt, label = 'Enter your PIN' }: PinPadProps) {
  const [pin, setPin] = useState('');
  useEffect(() => { if (error) setPin(''); }, [error]);
  const push = (d: string) => setPin((p) => (p.length < PIN_MAX ? p + d : p));
  const submit = () => { if (pin.length >= PIN_MIN && !busy) onSubmit(pin); };
  useEffect(() => { if (autoSubmitAt && pin.length === autoSubmitAt) onSubmit(pin); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pin]);
  const onKey = (e: React.KeyboardEvent) => {
    if (/^\d$/.test(e.key)) push(e.key);
    else if (e.key === 'Backspace') setPin((p) => p.slice(0, -1));
    else if (e.key === 'Enter') submit();
  };
  return (
    <div className="pinpad" tabIndex={0} onKeyDown={onKey} role="group" aria-label={label}>
      <div className="pinpad-label">{label}</div>
      <div className="pinpad-dots" aria-live="polite" aria-label={`${pin.length} digits entered`}>
        {Array.from({ length: PIN_MAX }).map((_, i) => <span key={i} className={`pinpad-dot ${i < pin.length ? 'is-filled' : ''} ${i >= PIN_MIN ? 'is-optional' : ''}`} />)}
      </div>
      {error && <div className="pinpad-error" role="alert">{error}</div>}
      <div className="pinpad-keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} type="button" className="pinpad-key" onClick={() => push(d)} disabled={busy}>{d}</button>)}
        <button type="button" className="pinpad-key pinpad-key-fn" onClick={() => setPin((p) => p.slice(0, -1))} aria-label="Delete" disabled={busy}><Icon name="arrow-left" size={20} /></button>
        <button type="button" className="pinpad-key" onClick={() => push('0')} disabled={busy}>0</button>
        <button type="button" className="pinpad-key pinpad-key-go" onClick={submit} aria-label="Submit PIN" disabled={busy || pin.length < PIN_MIN}><Icon name="check" size={20} strokeWidth={2.5} /></button>
      </div>
    </div>
  );
}
