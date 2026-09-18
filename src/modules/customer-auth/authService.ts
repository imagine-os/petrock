/**
 * Customer auth against the DataProvider (mock today, Company-OS / Supabase Auth later behind the same functions).
 * Everything the pages need: sign up, sign in with lockout, one-time codes, password reset, events. No React here.
 */
import type { DataProvider } from '../../data/provider';
import type { CustomerRow, SettingRow, UserRow } from '../../data/schema/core';
import { AUTH_POLICY_KEY, DEFAULT_AUTH_POLICY, type AuthCodePurpose, type AuthCodeRow, type AuthCredentialRow, type AuthEventKind, type AuthPolicy } from '../../data/schema/customer-auth';
import { hashPassword } from '../../data/seed/customer-auth';
import { normalizeEmail } from './passwordPolicy';

export { hashPassword };
export type AuthResult<T> = { ok: true; value: T } | { ok: false; error: AuthError; until?: string };
export type AuthError = 'invalid_credentials' | 'locked' | 'email_taken' | 'unknown_email' | 'code_invalid' | 'code_expired' | 'code_attempts' | 'no_code';

export const fail = <T>(error: AuthError, until?: string): AuthResult<T> => ({ ok: false, error, until });
export const succeed = <T>(value: T): AuthResult<T> => ({ ok: true, value });

/** Friendly copy per error (R-X34: sign-in never says which of email / password was wrong). */
export const AUTH_ERROR_TEXT: Record<AuthError, string> = {
  invalid_credentials: "That email and password don't match. Check both and try again.",
  locked: 'Too many attempts. This account is locked for a little while.',
  email_taken: 'An account with this email already exists. Sign in instead, or reset your password.',
  unknown_email: "We couldn't find an account for that email.",
  code_invalid: "That code isn't right.",
  code_expired: 'That code has expired. Request a new one.',
  code_attempts: 'Too many wrong codes. Request a new one.',
  no_code: 'No active code for this email. Request a new one.',
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const iso = (d = new Date()) => d.toISOString();
const plusMinutes = (min: number) => iso(new Date(Date.now() + min * 60_000));

export async function loadPolicy(data: DataProvider): Promise<AuthPolicy> {
  const rows = await data.list<SettingRow>('settings', { where: { key: AUTH_POLICY_KEY } });
  const v = rows[0]?.value as Partial<AuthPolicy> | undefined;
  return { ...DEFAULT_AUTH_POLICY, ...(v ?? {}) };
}

export async function findCredential(data: DataProvider, email: string): Promise<AuthCredentialRow | null> {
  const rows = await data.list<AuthCredentialRow>('auth_credentials', { where: { email: normalizeEmail(email) } });
  return rows[0] ?? null;
}

export async function logEvent(data: DataProvider, kind: AuthEventKind, page_code: string, opts: { userId?: string | null; email?: string | null; details?: Record<string, unknown> | null } = {}) {
  await data.insert('auth_events', { user_id: opts.userId ?? null, email: opts.email ?? null, kind, page_code, details: opts.details ?? null });
}

const randomCode = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');

/** Issues a one-time code; the previous live code for the same email + purpose is consumed (R-X32). Returns the code so the mock can show it. */
export async function issueCode(data: DataProvider, args: { email: string; purpose: AuthCodePurpose; userId?: string | null; pageCode: string; channel?: 'email' | 'sms' }): Promise<AuthCodeRow> {
  const email = normalizeEmail(args.email);
  const policy = await loadPolicy(data);
  const live = await data.list<AuthCodeRow>('auth_codes', { where: { email, purpose: args.purpose, consumed_at: null } });
  for (const c of live) await data.update<AuthCodeRow>('auth_codes', c.id, { consumed_at: iso() });
  const row = await data.insert<AuthCodeRow>('auth_codes', { user_id: args.userId ?? null, email, purpose: args.purpose, channel: args.channel ?? 'email', code: randomCode(policy.codeLength), expires_at: plusMinutes(policy.codeTtlMinutes), consumed_at: null, attempts: 0 });
  await logEvent(data, 'otp_sent', args.pageCode, { userId: args.userId ?? null, email, details: { purpose: args.purpose, channel: row.channel } });
  return row;
}

/** Checks a code: expiry, attempts, match. On success the code is consumed and (for verify_email) the credential is marked verified. */
export async function verifyCode(data: DataProvider, args: { email: string; purpose: AuthCodePurpose; code: string; pageCode: string }): Promise<AuthResult<AuthCodeRow>> {
  const email = normalizeEmail(args.email);
  const policy = await loadPolicy(data);
  const live = (await data.list<AuthCodeRow>('auth_codes', { where: { email, purpose: args.purpose, consumed_at: null }, orderBy: { column: 'created_at', dir: 'desc' } }))[0];
  if (!live) return fail('no_code');
  if (new Date(live.expires_at).getTime() < Date.now()) { await data.update<AuthCodeRow>('auth_codes', live.id, { consumed_at: iso() }); return fail('code_expired'); }
  if (live.attempts >= policy.maxCodeAttempts) { await data.update<AuthCodeRow>('auth_codes', live.id, { consumed_at: iso() }); return fail('code_attempts'); }
  if (live.code !== args.code.trim()) {
    const attempts = live.attempts + 1;
    await data.update<AuthCodeRow>('auth_codes', live.id, { attempts, ...(attempts >= policy.maxCodeAttempts ? { consumed_at: iso() } : {}) });
    await logEvent(data, 'otp_failed', args.pageCode, { userId: live.user_id, email, details: { purpose: args.purpose, attempts } });
    return fail(attempts >= policy.maxCodeAttempts ? 'code_attempts' : 'code_invalid');
  }
  const done = await data.update<AuthCodeRow>('auth_codes', live.id, { consumed_at: iso() });
  if (args.purpose === 'verify_email') {
    const cred = await findCredential(data, email);
    if (cred && !cred.email_verified) await data.update<AuthCredentialRow>('auth_credentials', cred.id, { email_verified: true, email_verified_at: iso() });
    await logEvent(data, 'email_verified', args.pageCode, { userId: cred?.user_id ?? live.user_id, email });
  }
  return succeed(done);
}

export interface SignUpInput { firstName: string; lastName: string; email: string; phone: string; password: string; homeLocationId: string; marketingOptIn: boolean }

/** R-X36: users + customers + auth_credentials in one go, then a verify_email code. */
export async function signUp(data: DataProvider, input: SignUpInput, pageCode = 'C-03'): Promise<AuthResult<{ user: UserRow; customer: CustomerRow; credential: AuthCredentialRow; code: AuthCodeRow }>> {
  const email = normalizeEmail(input.email);
  await wait(350);
  if (await findCredential(data, email)) return fail('email_taken');
  const users = await data.list<UserRow>('users', { where: { email } });
  if (users.length) return fail('email_taken');
  const name = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  const phone = input.phone.trim() || null;
  const user = await data.insert<UserRow>('users', { name, email, role: 'customer', location_id: null, phone, avatar_url: null, active: true, preferred_language: 'en' } as Partial<UserRow>);
  const customer = await data.insert<CustomerRow>('customers', { user_id: user.id, first_name: input.firstName.trim(), last_name: input.lastName.trim(), email, mobile: phone ?? '', alt_phone: null, address: null, apt_suite: null, city: null, state: null, zip: null, status: 'active', preferred_contact: 'email', home_location_id: input.homeLocationId, marketing_opt_in: input.marketingOptIn, note: 'Created in the app (C-03).', balance: 0 } as Partial<CustomerRow>);
  const credential = await data.insert<AuthCredentialRow>('auth_credentials', { user_id: user.id, email, password_hash: hashPassword(input.password), email_verified: false, email_verified_at: null, phone, failed_attempts: 0, locked_until: null, last_sign_in_at: null, password_changed_at: null, terms_accepted_at: iso(), remember_me: true });
  await logEvent(data, 'sign_up', pageCode, { userId: user.id, email, details: { home_location_id: input.homeLocationId } });
  const code = await issueCode(data, { email, purpose: 'verify_email', userId: user.id, pageCode });
  return succeed({ user, customer, credential, code });
}

/** R-X31 lockout; R-X34 one generic message for unknown email and wrong password. */
export async function signIn(data: DataProvider, email: string, password: string, rememberMe: boolean, pageCode = 'C-02'): Promise<AuthResult<{ credential: AuthCredentialRow; emailVerified: boolean }>> {
  const policy = await loadPolicy(data);
  const norm = normalizeEmail(email);
  await wait(400);
  const cred = await findCredential(data, norm);
  if (!cred) { await logEvent(data, 'sign_in_failed', pageCode, { email: norm, details: { reason: 'unknown_email' } }); return fail('invalid_credentials'); }
  if (cred.locked_until && new Date(cred.locked_until).getTime() > Date.now()) return fail('locked', cred.locked_until);
  if (cred.password_hash !== hashPassword(password)) {
    const failed = (cred.locked_until ? 0 : cred.failed_attempts) + 1;
    const lock = failed >= policy.maxFailedAttempts;
    const until = lock ? plusMinutes(policy.lockMinutes) : null;
    await data.update<AuthCredentialRow>('auth_credentials', cred.id, { failed_attempts: lock ? 0 : failed, locked_until: until });
    await logEvent(data, lock ? 'locked' : 'sign_in_failed', pageCode, { userId: cred.user_id, email: norm, details: { failed_attempts: failed, ...(until ? { locked_until: until } : {}) } });
    return lock ? fail('locked', until!) : fail('invalid_credentials');
  }
  const updated = await data.update<AuthCredentialRow>('auth_credentials', cred.id, { failed_attempts: 0, locked_until: null, last_sign_in_at: iso(), remember_me: rememberMe });
  await logEvent(data, 'sign_in', pageCode, { userId: cred.user_id, email: norm, details: { remember_me: rememberMe } });
  try { localStorage.setItem('petrock.auth.remember', JSON.stringify({ rememberMe, expiresAt: rememberMe ? plusMinutes(policy.rememberDays * 24 * 60) : null })); } catch { /* ignore */ }
  return succeed({ credential: updated, emailVerified: updated.email_verified });
}

/** R-X34: resolves the same way whether or not the email exists; only known emails get a code. */
export async function requestPasswordReset(data: DataProvider, email: string, pageCode = 'C-05'): Promise<{ code: AuthCodeRow | null }> {
  const norm = normalizeEmail(email);
  await wait(350);
  const cred = await findCredential(data, norm);
  await logEvent(data, 'password_reset_requested', pageCode, { userId: cred?.user_id ?? null, email: norm, details: { known: !!cred } });
  if (!cred) return { code: null };
  const code = await issueCode(data, { email: norm, purpose: 'reset_password', userId: cred.user_id, pageCode });
  return { code };
}

/** Code + new password. Clears the lockout and the failed counter (R-X31). */
export async function resetPassword(data: DataProvider, args: { email: string; code: string; password: string; pageCode?: string }): Promise<AuthResult<AuthCredentialRow>> {
  const pageCode = args.pageCode ?? 'C-06';
  const norm = normalizeEmail(args.email);
  await wait(300);
  const cred = await findCredential(data, norm);
  if (!cred) return fail('no_code');
  const v = await verifyCode(data, { email: norm, purpose: 'reset_password', code: args.code, pageCode });
  if (!v.ok) return v as AuthResult<AuthCredentialRow>;
  const updated = await data.update<AuthCredentialRow>('auth_credentials', cred.id, { password_hash: hashPassword(args.password), password_changed_at: iso(), failed_attempts: 0, locked_until: null, email_verified: true, email_verified_at: cred.email_verified_at ?? iso() });
  await logEvent(data, 'password_reset', pageCode, { userId: cred.user_id, email: norm });
  return succeed(updated);
}

export async function signOutEvent(data: DataProvider, userId: string, email: string | null, pageCode = 'C-09') {
  await logEvent(data, 'sign_out', pageCode, { userId, email });
}

/** Seconds left on a lock, 0 when not locked. */
export const lockSecondsLeft = (lockedUntil: string | null | undefined) => (lockedUntil ? Math.max(0, Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000)) : 0);
