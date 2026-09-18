import { createContext, useContext } from 'react';
import type { PaymentProvider } from './PaymentProvider';
import { MockPaymentProvider } from './MockPaymentProvider';
export * from './PaymentProvider';
export { MockPaymentProvider } from './MockPaymentProvider';
export { StripePaymentProvider } from './StripePaymentProvider';

/** Swap here when Stripe is wired: new StripePaymentProvider(import.meta.env.VITE_STRIPE_PK, bffUrl). */
export const defaultPaymentProvider: PaymentProvider = new MockPaymentProvider();
export const PaymentCtx = createContext<PaymentProvider>(defaultPaymentProvider);
export const usePayments = () => useContext(PaymentCtx);
