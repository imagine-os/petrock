import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { EVERYONE } from '../../auth/roles';
import { strings } from './strings';
import { welcomeSpec, signInSpec, signUpSpec, verifySpec, forgotSpec, resetSpec, lockedSpec, accountCreatedSpec, signOutSpec } from './specs';
import { WelcomePage } from './WelcomePage';
import { SignInPage } from './SignInPage';
import { SignUpPage } from './SignUpPage';
import { VerifyPage } from './VerifyPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import { LockedPage } from './LockedPage';
import { AccountCreatedPage } from './AccountCreatedPage';
import { SignOutPage } from './SignOutPage';

export { strings };

/** Customer auth & onboarding (C-01..C-09). Customer surface, mobile layout, no bottom nav (PhoneShell hides it under /auth). */
const page = (path: string, element: RouteDef['element'], spec: RouteDef['spec']): RouteDef => ({ path, element, spec, roles: EVERYONE, surface: 'customer', layout: 'mobile' });

export const routes: RouteDef[] = [
  page('/auth', h(WelcomePage), welcomeSpec),
  page('/auth/sign-in', h(SignInPage), signInSpec),
  page('/auth/sign-up', h(SignUpPage), signUpSpec),
  page('/auth/verify', h(VerifyPage), verifySpec),
  page('/auth/forgot', h(ForgotPasswordPage), forgotSpec),
  page('/auth/reset', h(ResetPasswordPage), resetSpec),
  page('/auth/locked', h(LockedPage), lockedSpec),
  page('/auth/welcome', h(AccountCreatedPage), accountCreatedSpec),
  page('/auth/sign-out', h(SignOutPage), signOutSpec),
];
