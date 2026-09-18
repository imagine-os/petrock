import type { PaymentIntentRequest, PaymentIntentResult, PaymentProvider, RefundResult } from './PaymentProvider';

/**
 * STUB with the Stripe Elements-ready shape. No keys in the repo. When wired:
 *  - the BFF (Company-OS or a thin Petrock API) creates the PaymentIntent server-side with the secret key and
 *    returns client_secret; the customer app mounts <PaymentElement> with the publishable key and confirms.
 *  - refunds go through the BFF too (secret key never reaches the browser).
 * Card fee (fees table, 3.89%) is added by the pricing engine before the intent is created.
 */
export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';
  readonly needsCardElement = true;
  constructor(private publishableKey: string | undefined, private bffUrl: string) {}
  private notReady(): never { throw new Error(`Stripe not configured (publishable key ${this.publishableKey ? 'set' : 'missing'}; BFF ${this.bffUrl}).`); }
  async createPaymentIntent(_req: PaymentIntentRequest): Promise<PaymentIntentResult> {
    // POST `${bffUrl}/payments/intents` { amount, currency, customer, description, metadata } -> { id, client_secret }
    return this.notReady();
  }
  async confirm(_intentId: string): Promise<PaymentIntentResult> {
    // stripe.confirmPayment({ elements, clientSecret, redirect: 'if_required' })
    return this.notReady();
  }
  async refund(_providerRef: string, _amountCents: number): Promise<RefundResult> {
    // POST `${bffUrl}/payments/refunds` { payment_intent, amount }
    return this.notReady();
  }
}
