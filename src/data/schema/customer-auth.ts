/**
 * Customer auth tables (module customer-auth, pages C-01..C-09).
 * Credentials live apart from `users` so the login principal stays the same when Company-OS (or Supabase Auth) takes
 * over: the adapter then maps these three tables to the provider's auth API and the pages do not change.
 */
import { defineTables, type BaseRow, type ColumnDef } from './types.ts';

const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const bool = (name: string, description?: string): ColumnDef => ({ name, type: 'bool', description });
const ts = (name: string, nullable = false): ColumnDef => ({ name, type: 'timestamptz', nullable });
const en = (name: string, values: readonly string[], nullable = false): ColumnDef => ({ name, type: 'enum', enum: values, nullable });

export const AUTH_CODE_PURPOSES = ['verify_email', 'reset_password', 'sign_in'] as const;
export const AUTH_CODE_CHANNELS = ['email', 'sms'] as const;
export const AUTH_EVENT_KINDS = ['sign_up', 'email_verified', 'sign_in', 'sign_in_failed', 'locked', 'sign_out', 'otp_sent', 'otp_failed', 'password_reset_requested', 'password_reset'] as const;

export const tables = defineTables([
  { name: 'auth_credentials', label: 'Auth credentials', description: 'Customer email + password login (mock hash today; a real auth provider later). Tracks verification, failed attempts and lockout.', group: 'core', scope: 'global', titleColumn: 'email', source: 'C-02, C-03 (D-018)', access: ['customer read own', 'system write'],
    columns: [ref('user_id', 'users'), text('email', false, 'Lower-cased; unique'), text('password_hash', false, 'Mock FNV-1a today; bcrypt/argon2 server-side later'), bool('email_verified'), ts('email_verified_at', true), text('phone', true), { name: 'failed_attempts', type: 'int' }, ts('locked_until', true), ts('last_sign_in_at', true), ts('password_changed_at', true), ts('terms_accepted_at'), bool('remember_me', 'Last "remember me" choice (30 days vs session)')] },
  { name: 'auth_codes', label: 'Auth one-time codes', description: 'Six-digit codes for email verification, password reset and sign-in confirmation. 10 minute expiry, 5 attempts, one live code per email + purpose.', group: 'core', scope: 'global', titleColumn: 'email', source: 'C-04, C-06 (D-010 OTP modal)',
    columns: [ref('user_id', 'users', true), text('email'), en('purpose', AUTH_CODE_PURPOSES), en('channel', AUTH_CODE_CHANNELS), text('code', false, 'Plain in the mock so the demo can show it; hashed server-side later'), ts('expires_at'), ts('consumed_at', true), { name: 'attempts', type: 'int' }] },
  { name: 'auth_events', label: 'Auth events', description: 'Sign-up, sign-in, failed attempts, lockouts, code sends, password resets. Feeds the security audit and the owner reports.', group: 'system', scope: 'global', source: 'best practice (D-018)',
    columns: [ref('user_id', 'users', true), text('email', true), en('kind', AUTH_EVENT_KINDS), text('page_code', true), { name: 'details', type: 'json', nullable: true, wide: true }] },
]);

export type AuthCodePurpose = (typeof AUTH_CODE_PURPOSES)[number];
export type AuthEventKind = (typeof AUTH_EVENT_KINDS)[number];

export interface AuthCredentialRow extends BaseRow { user_id: string; email: string; password_hash: string; email_verified: boolean; email_verified_at: string | null; phone: string | null; failed_attempts: number; locked_until: string | null; last_sign_in_at: string | null; password_changed_at: string | null; terms_accepted_at: string; remember_me: boolean }
export interface AuthCodeRow extends BaseRow { user_id: string | null; email: string; purpose: AuthCodePurpose; channel: 'email' | 'sms'; code: string; expires_at: string; consumed_at: string | null; attempts: number }
export interface AuthEventRow extends BaseRow { user_id: string | null; email: string | null; kind: AuthEventKind; page_code: string | null; details: Record<string, unknown> | null }

/** Tunable policy stored in `settings` under key `auth.policy` (seeded by src/data/seed/customer-auth.ts). */
export interface AuthPolicy { maxFailedAttempts: number; lockMinutes: number; codeLength: number; codeTtlMinutes: number; resendSeconds: number; maxCodeAttempts: number; rememberDays: number; passwordMinLength: number }
export const AUTH_POLICY_KEY = 'auth.policy';
export const DEFAULT_AUTH_POLICY: AuthPolicy = { maxFailedAttempts: 5, lockMinutes: 15, codeLength: 6, codeTtlMinutes: 10, resendSeconds: 30, maxCodeAttempts: 5, rememberDays: 30, passwordMinLength: 8 };
