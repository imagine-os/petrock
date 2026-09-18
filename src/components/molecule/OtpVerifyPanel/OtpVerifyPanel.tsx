import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { OtpCodeInput } from '../OtpCodeInput/OtpCodeInput';
import { Button } from '../../atom/Button/Button';
import { Icon } from '../../atom/Icon/Icon';
import './OtpVerifyPanel.css';

export interface OtpVerifyPanelProps {
  /** Where the code went, shown to the person (masked email or phone). */
  destination: string;
  /** Returns null when the code is right, else a friendly error message. */
  onVerify: (code: string) => Promise<string | null>;
  /** Sends a new code; resolves when it is on its way. */
  onResend: () => Promise<void>;
  onVerified?: () => void;
  length?: number;
  resendSeconds?: number;
  expiresMinutes?: number;
  /** Extra line under the boxes (e.g. the demo code hint). */
  children?: ReactNode;
  autoFocus?: boolean;
}

/** Countdown hook: seconds left until `until` (ms epoch), ticking every second. */
export function useCountdown(until: number | null): number {
  const [left, setLeft] = useState(() => (until ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0));
  useEffect(() => {
    if (!until) { setLeft(0); return; }
    const tick = () => setLeft(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [until]);
  return left;
}

/** Code boxes + "sent to" line + resend with a cooldown timer + verifying state. Used by the C-04 page and OtpVerifyModal. */
export function OtpVerifyPanel({ destination, onVerify, onResend, onVerified, length = 6, resendSeconds = 30, expiresMinutes = 10, children, autoFocus = true }: OtpVerifyPanelProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [resendAt, setResendAt] = useState<number | null>(() => Date.now() + resendSeconds * 1000);
  const [sending, setSending] = useState(false);
  const left = useCountdown(resendAt);

  const verify = useCallback(async (c: string) => {
    if (busy || ok) return;
    setBusy(true); setError(null);
    const err = await onVerify(c);
    setBusy(false);
    if (err) { setError(err); return; }
    setOk(true);
    onVerified?.();
  }, [busy, ok, onVerify, onVerified]);

  const resend = async () => {
    if (left > 0 || sending) return;
    setSending(true); setError(null); setCode('');
    await onResend();
    setSending(false);
    setResendAt(Date.now() + resendSeconds * 1000);
  };

  return (
    <div className={`otpverify ${ok ? 'is-ok' : ''}`}>
      <p className="otpverify-sent">We sent a {length}-digit code to <strong>{destination}</strong>. It expires in {expiresMinutes} minutes.</p>
      <OtpCodeInput length={length} value={code} onChange={(v) => { setCode(v); if (error) setError(null); }} onComplete={verify} error={error} disabled={busy || ok} autoFocus={autoFocus} />
      {ok ? <div className="otpverify-ok" role="status"><Icon name="check" size={16} strokeWidth={2.5} /> Verified</div>
        : <Button block loading={busy} disabled={code.length < length} onClick={() => verify(code)}>Verify</Button>}
      <div className="otpverify-resend">
        <span className="muted xs">Didn't get it?</span>
        <Button variant="link" size="sm" onClick={resend} disabled={left > 0 || sending || ok} loading={sending}>{left > 0 ? `Resend in ${left}s` : 'Resend code'}</Button>
      </div>
      {children}
    </div>
  );
}
