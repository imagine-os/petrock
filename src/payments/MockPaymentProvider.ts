import type { PaymentIntentRequest, PaymentIntentResult, PaymentProvider, RefundResult } from './PaymentProvider';

/** Always succeeds unless the card last4 is 0002 (declined) - enough to test both paths in the UI. */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';
  readonly needsCardElement = false;
  private n = 0;
  async createPaymentIntent(req: PaymentIntentRequest): Promise<PaymentIntentResult> {
    await new Promise((r) => setTimeout(r, 300));
    const id = `pi_mock_${Date.now().toString(36)}_${++this.n}`;
    if (req.method.type === 'card' && req.method.last4 === '0002') return { id, status: 'failed', providerRef: id, error: 'Card declined (mock)' };
    return { id, status: 'succeeded', providerRef: id };
  }
  async confirm(intentId: string): Promise<PaymentIntentResult> { return { id: intentId, status: 'succeeded', providerRef: intentId }; }
  async refund(providerRef: string, amountCents: number): Promise<RefundResult> { return { id: `re_mock_${providerRef}`, status: 'succeeded', amountCents }; }
}
