/** Password policy (R-X30): length + a letter + a number; strength score 0-4 for the meter. */
export const COMMON_PASSWORDS = ['password', 'password1', '12345678', '123456789', 'qwerty123', 'petrock', 'petrock123', 'iloveyou', 'letmein1', 'welcome1'];

export interface PasswordCheck { ok: boolean; score: 0 | 1 | 2 | 3 | 4; label: string; checks: { id: string; label: string; ok: boolean }[] }

export function checkPassword(pw: string, minLength = 8): PasswordCheck {
  const lower = pw.toLowerCase();
  const checks = [
    { id: 'length', label: `At least ${minLength} characters`, ok: pw.length >= minLength },
    { id: 'letter', label: 'A letter', ok: /[a-z]/i.test(pw) },
    { id: 'number', label: 'A number', ok: /\d/.test(pw) },
    { id: 'common', label: 'Not a common password', ok: pw.length === 0 || !COMMON_PASSWORDS.includes(lower) },
  ];
  const ok = checks.every((c) => c.ok) && pw.length > 0;
  let score = 0;
  if (pw.length >= minLength) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-z0-9]/i.test(pw) || pw.length >= minLength + 6) score++;
  if (!ok) score = Math.min(score, 1) as 0 | 1;
  const s = Math.max(0, Math.min(4, score)) as 0 | 1 | 2 | 3 | 4;
  const label = pw.length === 0 ? '' : ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'][s];
  return { ok, score: s, label, checks };
}
