# customer-auth - Customer app auth & onboarding (C-01..C-09)

version: 0.2.0-customer-auth
date: 2026-09-18
prompt: 0005
intent: Give the customer app a complete, best-practice sign-up / sign-in / recovery flow (D-018) on top of the foundation: welcome + intro, sign in with lockout and first-sign-in verification, create account with password strength and terms, one-time code verification, forgot / reset password, locked screen, account-created screen, sign out. Mock auth against the DataProvider so Company-OS / Supabase Auth can replace it behind the same functions.
decision: docs/decisions/_pending/customer-auth.md (12 pending rows: Figma variant, copy fixes, remember me, OTP scope, password policy, lockout, no enumeration, home location at sign-up, terms, settings split, verify-before-booking, intro carousel)
rejected: OTP on every sign-in (friction; codes only for verification and reset); password confirm field (show/hide + strength meter instead); forcing symbols in passwords (NIST 800-63B); blocking unverified users from signing in (they can browse, booking gates on verification, R-X33); a separate `sessions` table (SessionProvider owns the session; remember-me stored on the credential).
files: src/modules/customer-auth/** (index, specs, strings, authService, passwordPolicy, useAuthPolicy, 9 pages, css), src/components/molecule/{AuthBrandHeader,PasswordField,OtpCodeInput,OtpVerifyPanel,FormAlert}/**, src/components/organism/{OtpVerifyModal,OnboardingIntroModal}/**, src/data/schema/customer-auth.ts, src/data/seed/customer-auth.ts, src/rules/customer-auth.ts, supabase/schema.sql + docs/data-model.md (regenerated, 42 tables), docs/pages/C-01..C-09.md, docs/screenshots/C-01..C-09/**, docs/decisions/_pending/customer-auth.md
codes: C-01, C-02, C-03, C-04, C-05, C-06, C-07, C-08, C-09

## What exists now

- **Routes** (customer surface, mobile layout, bottom nav hidden under /auth): `/auth` C-01 Welcome, `/auth/sign-in` C-02 (replaces the foundation stub), `/auth/sign-up` C-03, `/auth/verify` C-04, `/auth/forgot` C-05, `/auth/reset` C-06, `/auth/locked` C-07, `/auth/welcome` C-08, `/auth/sign-out` C-09. Every route has a full PageSpec (100 % completeness) with rules, states and `checkedAt: [360, 390, 768, 1280, 1920]`.
- **Components (7 new, all with metas in /dev/components)**: AuthBrandHeader, PasswordField (+ `strength.ts`), OtpCodeInput, OtpVerifyPanel (+ `useCountdown`), FormAlert (molecules); OtpVerifyModal, OnboardingIntroModal (organisms).
- **Tables (3 new)**: `auth_credentials` (email, mock password hash, email_verified, failed_attempts, locked_until, remember_me, terms_accepted_at), `auth_codes` (purpose verify_email / reset_password / sign_in, expiry, attempts, consumed_at), `auth_events` (audit of every auth action with page code). Policy in `settings` key `auth.policy` (5 attempts / 15 min lock, 6-digit codes / 10 min / 5 tries / 30 s resend, 30-day remember, 8-char passwords).
- **Seed**: Avery Thompson (verified, password `Biscuit!23`), Riley Chen (new customer + user, email not verified) and 7 auth events.
- **Rules (12)**: R-M14, R-M15 implemented; R-X30..R-X39 (password policy, lockout, codes, verify-before-booking in_dev, no enumeration, remember me in_dev, atomic sign-up, audit, terms, settings split requested).
- **Service**: `authService.ts` (signUp, signIn, issueCode, verifyCode, requestPasswordReset, resetPassword, signOutEvent, loadPolicy) - plain async functions over `DataProvider`, no React.
- **Strings**: 47 keys `customer-auth.*` with Spanish.

## Verification

- `npm run typecheck` and `npm run build` green; `npm run sql` regenerated 42 tables.
- Playwright (own script on port 4931, Chromium at /opt/pw-browsers): all 9 routes at 360 / 390 / 768 / 1280 / 1920 with no horizontal overflow and no console errors; screenshots at 390 + 1280 (dark for C-01, C-02, C-03, C-04, C-08; extra `390-verify-modal.jpg`, `390-intro.jpg`).
- Flows exercised end to end in the mock: sign in OK -> /app; 5 wrong passwords -> C-07 locked -> forgot -> reset with the emailed code -> sign in with the new password; sign up -> C-04 code -> C-08 "You're in, Taylor!"; unverified sign-in -> OtpVerifyModal -> verified -> /app; first-visit intro carousel opens and is remembered.

## Gaps

- Remember-me duration is stored but not enforced (needs a `SessionProvider` expiry check - foundation file, not touched).
- Code delivery and password hashing are mocks (plain code shown in a demo hint when the provider is `mock`; FNV-1a hash). Company-OS / Supabase Auth replace `authService` internals.
- Legal links point to the public site until the settings module ships Terms / Privacy pages; help / delete account live in C-70..C-79.
- Spanish is present for labels but not for validation messages.
