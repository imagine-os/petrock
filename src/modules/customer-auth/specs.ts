import { defineSpec } from '../../specs/defineSpec';
import { EVERYONE } from '../../auth/roles';

const WIDTHS = [360, 390, 768, 1280, 1920];
const INTEGRATIONS = ['Company-OS auth (later; same authService functions)', 'Email / SMS code delivery (mock: code shown in-app)'];

export const welcomeSpec = defineSpec({
  code: 'C-01', name: 'Welcome', purpose: 'First screen of the customer app: brand, one-line promise, Create account, Sign in, staff PIN link; the first visit opens the three-slide "How Petrock works" intro.',
  layout: ['AuthBrandHeader (hero)', 'Service chips (Hotel, Grooming & Spa, Daycare)', 'Create account button', 'Already have an account? Sign in', 'Locations line', 'Staff PIN link', 'OnboardingIntroModal (first visit)'],
  data: ['locations'], roles: EVERYONE,
  logic: ['If a customer is already signed in show "Continue as {name}" first.', 'Intro shown once per browser (localStorage petrock.auth.introSeen), re-openable from "How Petrock works".', 'Right-hand Figma variant chosen (New to Petrock? + button) per open question 12.'],
  integrations: [], components: ['AuthBrandHeader', 'Button', 'Chip', 'OnboardingIntroModal', 'Icon'], rules: ['R-M14'],
  states: ['signed out', 'signed in (continue)', 'intro open'], checkedAt: WIDTHS, figma: ['Frame 1171276420.png'],
});

export const signInSpec = defineSpec({
  code: 'C-02', name: 'Sign in', purpose: 'Customer sign in with email + password, show / hide password, remember me, forgot-password link, friendly errors, lockout after repeated failures, and email verification on first sign-in when it is still pending.',
  layout: ['AuthBrandHeader (back to C-01)', 'FormAlert (error)', 'Email', 'PasswordField', 'Remember me + Forgot password?', 'Sign in button', 'New to Petrock? Create account', 'Demo credentials hint (mock only)', 'OtpVerifyModal (unverified email)'],
  data: ['auth_credentials', 'auth_codes', 'auth_events', 'users', 'settings'], roles: EVERYONE,
  logic: ['authService.signIn: normalise email, compare password hash, count failed attempts, lock for policy.lockMinutes after policy.maxFailedAttempts (R-X31).', 'Unknown email and wrong password give the same message (R-X34).', 'email_verified = false opens OtpVerifyModal; "Skip for now" still signs in (R-X33).', 'Success: switchUser(user_id), toast, navigate to ROLE_HOME (customer /app).', 'Already signed in: show Continue / Use another account.'],
  integrations: INTEGRATIONS, components: ['AuthBrandHeader', 'Input', 'PasswordField', 'Checkbox', 'Button', 'FormAlert', 'OtpVerifyModal', 'Card', 'Toast'], rules: ['R-M14', 'R-X31', 'R-X33', 'R-X34', 'R-X35', 'R-X37'],
  states: ['empty', 'validating', 'busy', 'error (invalid)', 'locked (redirects to C-07)', 'verify modal', 'already signed in'], checkedAt: WIDTHS, figma: ['Frame 1171276422.png'],
});

export const signUpSpec = defineSpec({
  code: 'C-03', name: 'Create account', purpose: 'Sign-up form: first / last name, email, optional mobile, usual Petrock location, password with live strength meter, terms and optional marketing consent; creates users + customers + auth_credentials and sends the verification code.',
  layout: ['AuthBrandHeader (back to C-01)', 'FormAlert (error)', 'First name + Last name', 'Email', 'Mobile (optional)', 'Your usual Petrock (Select)', 'PasswordField with strength', 'Terms checkbox (required)', 'Marketing checkbox', 'Create account button', 'Already have an account? Sign in'],
  data: ['users', 'customers', 'auth_credentials', 'auth_codes', 'auth_events', 'locations', 'settings'], roles: EVERYONE,
  logic: ['Validate on blur and on submit: names required, email shape, US phone shape when given, password policy (R-X30), terms accepted (R-X38).', 'Duplicate email (auth_credentials or users) -> error with a Sign in link (R-X36).', 'authService.signUp inserts users (role customer), customers (home_location_id), auth_credentials (email_verified false, terms_accepted_at), logs sign_up and issues a verify_email code.', 'Navigate to C-04 with email + next=/auth/welcome.'],
  integrations: INTEGRATIONS, components: ['AuthBrandHeader', 'Input', 'Select', 'PasswordField', 'Checkbox', 'Button', 'FormAlert'], rules: ['R-M14', 'R-X30', 'R-X36', 'R-X37', 'R-X38'],
  states: ['empty', 'field errors', 'busy', 'email taken'], checkedAt: WIDTHS, figma: ['Frame 1171276421.png'],
});

export const verifySpec = defineSpec({
  code: 'C-04', name: 'Verify code', purpose: 'One-time code entry after sign-up (or from a deep link): six boxes, auto-verify on the last digit, resend with cooldown, expiry; on success the session switches to the new customer and continues to the next screen.',
  layout: ['AuthBrandHeader (back)', 'OtpVerifyPanel', 'Demo code hint (mock only)', 'Wrong email? Start over'],
  data: ['auth_codes', 'auth_credentials', 'auth_events', 'settings'], roles: EVERYONE,
  logic: ['Query: email, purpose (verify_email | sign_in), next (default /auth/welcome).', 'authService.verifyCode: latest live code for email + purpose; expired -> new code needed; attempts >= policy.maxCodeAttempts -> consumed; match -> consumed, credential email_verified = true (R-X32).', 'Resend: issueCode consumes the previous live code; cooldown policy.resendSeconds.', 'Verified: switchUser(credential.user_id), navigate(next).'],
  integrations: INTEGRATIONS, components: ['AuthBrandHeader', 'OtpVerifyPanel', 'OtpCodeInput', 'FormAlert', 'Button'], rules: ['R-X32', 'R-X33', 'R-X37'],
  states: ['waiting', 'verifying', 'wrong code', 'expired', 'verified', 'no email in query'], checkedAt: WIDTHS, figma: ['deep-dive 444:19287 (OTP Verify)'],
});

export const forgotSpec = defineSpec({
  code: 'C-05', name: 'Forgot password', purpose: 'Request a password-reset code by email without revealing whether the account exists; continues to C-06.',
  layout: ['AuthBrandHeader (back to C-02)', 'Title + corrected copy (R-M15)', 'Email', 'Send code button', 'Sent state: FormAlert + Enter code button', 'Back to sign in'],
  data: ['auth_credentials', 'auth_codes', 'auth_events', 'settings'], roles: EVERYONE,
  logic: ['authService.requestPasswordReset: log the request; issue a reset_password code only when the email is known; the UI shows the same confirmation either way (R-X34).', 'Email prefilled from ?email= (C-07 link).'],
  integrations: INTEGRATIONS, components: ['AuthBrandHeader', 'Input', 'Button', 'FormAlert'], rules: ['R-M15', 'R-X32', 'R-X34', 'R-X37'],
  states: ['empty', 'invalid email', 'busy', 'sent'], checkedAt: WIDTHS, figma: ['Frame 1171276423.png'],
});

export const resetSpec = defineSpec({
  code: 'C-06', name: 'Reset password', purpose: 'Enter the emailed code and a new password (strength meter); clears any lockout and marks the email verified.',
  layout: ['AuthBrandHeader (back to C-05)', 'FormAlert (error)', 'Email', 'OtpCodeInput', 'Resend with cooldown', 'PasswordField (new, strength)', 'Update password button', 'Demo code hint (mock only)'],
  data: ['auth_credentials', 'auth_codes', 'auth_events', 'settings'], roles: EVERYONE,
  logic: ['authService.resetPassword = verifyCode(reset_password) + update password_hash, password_changed_at, failed_attempts 0, locked_until null, email_verified true (R-X31).', 'Password must pass the policy (R-X30); code errors clear the boxes.', 'Success: toast + navigate to C-02.'],
  integrations: INTEGRATIONS, components: ['AuthBrandHeader', 'Input', 'OtpCodeInput', 'PasswordField', 'Button', 'FormAlert', 'Toast'], rules: ['R-M15', 'R-X30', 'R-X31', 'R-X32', 'R-X37'],
  states: ['empty', 'code error', 'weak password', 'busy', 'updated'], checkedAt: WIDTHS, figma: ['Frame 1171276423.png'],
});

export const lockedSpec = defineSpec({
  code: 'C-07', name: 'Account locked', purpose: 'Shown after too many failed sign-ins: explains the pause, counts down to when sign-in reopens, offers password reset and a way to reach the front desk.',
  layout: ['AuthBrandHeader', 'Lock illustration + title', 'Countdown', 'Reset password button', 'Try again (enabled at 0)', 'Call the front desk (locations phones)', 'Help in Settings note (C-70)'],
  data: ['auth_credentials', 'locations', 'settings'], roles: EVERYONE,
  logic: ['Query ?email= -> auth_credentials.locked_until; countdown from useCountdown; at 0 the Try again button navigates to C-02.', 'Reset password goes to C-05 with the email prefilled; a reset clears the lock (R-X31).'],
  integrations: [], components: ['AuthBrandHeader', 'Card', 'Button', 'FormAlert', 'Icon'], rules: ['R-X31', 'R-X39'],
  states: ['locked (counting)', 'unlocked', 'unknown email'], checkedAt: WIDTHS,
});

export const accountCreatedSpec = defineSpec({
  code: 'C-08', name: 'Account created', purpose: 'Success screen after email verification: greets the new customer, lists the three next steps (add dogs, upload vaccines, book) and opens the app; the intro carousel is available again here.',
  layout: ['Success mark', 'Welcome title with first name', 'Next steps list (3)', 'Go to my Petrock button', 'How Petrock works (opens OnboardingIntroModal)'],
  data: ['users', 'customers', 'auth_credentials'], roles: EVERYONE,
  logic: ['Reads the session user (switched by C-04) and the customers row for the first name and home location.', 'Not signed in -> friendly redirect card to C-01.'],
  integrations: [], components: ['Card', 'Button', 'Badge', 'Icon', 'OnboardingIntroModal'], rules: ['R-X36'],
  states: ['signed in (new)', 'not signed in'], checkedAt: WIDTHS,
});

export const signOutSpec = defineSpec({
  code: 'C-09', name: 'Sign out', purpose: 'Confirm sign-out, log the event, clear the session to the public visitor and offer sign-in again or the hub.',
  layout: ['AuthBrandHeader', 'Confirm card (name, email)', 'Sign out button + Back', 'Signed-out state with Sign in / Create account'],
  data: ['auth_events'], roles: EVERYONE,
  logic: ['Sign out = authService.signOutEvent + SessionProvider.signOut() (session becomes usr_public) + clear petrock.auth.remember.', 'Already public -> show the signed-out state directly.'],
  integrations: [], components: ['AuthBrandHeader', 'Card', 'Avatar', 'Button'], rules: ['R-X35', 'R-X37'],
  states: ['confirm', 'signed out'], checkedAt: WIDTHS,
});
