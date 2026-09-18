/**
 * Payment seam. MockPaymentProvider today; StripePaymentProvider (Stripe Elements-ready shape) later.
 * Pages call useTable('fees') etc. for pricing, then hand a PaymentIntent request to the provider.
 */
export interface PaymentMethodInfo { type: 'card' | 'cash'; brand?: string; last4?: string; token?: string }
export interface PaymentIntentRequest { amountCents: number; currency: string; customerId: string; description: string; method: PaymentMethodInfo; metadata?: Record<string, string> }
export interface PaymentIntentResult { id: string; status: 'requires_action' | 'succeeded' | 'failed'; providerRef: string; error?: string }
export interface RefundResult { id: string; status: 'succeeded' | 'failed'; amountCents: number; error?: string }

export interface PaymentProvider {
  readonly name: string;
  /** True when the UI must mount the provider's card element (Stripe Elements). */
  readonly needsCardElement: boolean;
  createPaymentIntent(req: PaymentIntentRequest): Promise<PaymentIntentResult>;
  confirm(intentId: string): Promise<PaymentIntentResult>;
  refund(providerRef: string, amountCents: number, reason?: string): Promise<RefundResult>;
}
