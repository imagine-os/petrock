/**
 * Seed for customer auth (C-01..C-09): the demo customer's credentials, a second customer whose email is not verified
 * yet (to demo the verify-on-sign-in path), the auth policy setting and a few auth events.
 * Demo password for every seeded customer: Biscuit!23 (fictional).
 */
import type { SeedCtx } from './index';
import { hashPin } from '../../auth/pin';
import { AUTH_POLICY_KEY, DEFAULT_AUTH_POLICY } from '../schema/customer-auth';

export const order = 50;
export const DEMO_CUSTOMER_PASSWORD = 'Biscuit!23';
/** Mock password hash: same FNV-1a as PINs, salted with a prefix so a PIN never equals a password hash. */
export const hashPassword = (pw: string) => hashPin(`pw:${pw}`);

export function seed(ctx: SeedCtx) {
  const { add, now } = ctx;
  const iso = (d: Date) => d.toISOString();
  const daysAgo = (n: number, h = 10) => { const d = new Date(now); d.setDate(d.getDate() - n); d.setHours(h, 0, 0, 0); return iso(d); };

  // A second app customer, email not verified yet (fictional). Has a customers row so the app can show a profile.
  add('users', { id: 'usr_cust_riley', name: 'Riley Chen', email: 'riley@demo.petrock.test', role: 'customer', location_id: null, phone: '+1 (310) 555-0142', avatar_url: null, active: true, preferred_language: 'en' });
  add('customers', { id: 'cus_riley', user_id: 'usr_cust_riley', first_name: 'Riley', last_name: 'Chen', email: 'riley@demo.petrock.test', mobile: '+1 (310) 555-0142', alt_phone: null, address: null, apt_suite: null, city: 'Los Angeles', state: 'CA', zip: '90024', status: 'active', preferred_contact: 'email', home_location_id: 'loc_westwood', marketing_opt_in: false, note: 'Signed up in the app; email not verified yet.', balance: 0 });
  ctx.ids.customers = [...(ctx.ids.customers ?? []), 'cus_riley'];

  add('auth_credentials', { id: 'cred_avery', user_id: 'usr_customer', email: 'avery@demo.petrock.test', password_hash: hashPassword(DEMO_CUSTOMER_PASSWORD), email_verified: true, email_verified_at: daysAgo(28), phone: '+1 (818) 555-0120', failed_attempts: 0, locked_until: null, last_sign_in_at: daysAgo(1, 18), password_changed_at: null, terms_accepted_at: daysAgo(28), remember_me: true });
  add('auth_credentials', { id: 'cred_riley', user_id: 'usr_cust_riley', email: 'riley@demo.petrock.test', password_hash: hashPassword(DEMO_CUSTOMER_PASSWORD), email_verified: false, email_verified_at: null, phone: '+1 (310) 555-0142', failed_attempts: 0, locked_until: null, last_sign_in_at: null, password_changed_at: null, terms_accepted_at: daysAgo(2), remember_me: false });

  add('settings', { id: 'set_auth_policy', key: AUTH_POLICY_KEY, value: DEFAULT_AUTH_POLICY, description: 'Customer auth policy: lockout after N failed sign-ins for M minutes; one-time code length, expiry, resend delay and attempts; remember-me days; password minimum length.' });

  const ev = (id: string, user_id: string | null, email: string, kind: string, page_code: string, when: string, details: Record<string, unknown> | null = null) => add('auth_events', { id, user_id, email, kind, page_code, details, created_at: when, updated_at: when });
  ev('aev_1', 'usr_customer', 'avery@demo.petrock.test', 'sign_up', 'C-03', daysAgo(28, 9));
  ev('aev_2', 'usr_customer', 'avery@demo.petrock.test', 'otp_sent', 'C-04', daysAgo(28, 9), { purpose: 'verify_email', channel: 'email' });
  ev('aev_3', 'usr_customer', 'avery@demo.petrock.test', 'email_verified', 'C-04', daysAgo(28, 9));
  ev('aev_4', 'usr_customer', 'avery@demo.petrock.test', 'sign_in', 'C-02', daysAgo(1, 18), { remember_me: true });
  ev('aev_5', 'usr_cust_riley', 'riley@demo.petrock.test', 'sign_up', 'C-03', daysAgo(2, 20));
  ev('aev_6', 'usr_cust_riley', 'riley@demo.petrock.test', 'otp_sent', 'C-04', daysAgo(2, 20), { purpose: 'verify_email', channel: 'email' });
  ev('aev_7', null, 'nobody@example.com', 'sign_in_failed', 'C-02', daysAgo(3, 12), { reason: 'unknown_email' });
}
