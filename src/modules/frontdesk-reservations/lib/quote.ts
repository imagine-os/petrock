/** Desk stay quote = engine hotel quote + additional services taxed at the service rate + card fee on the whole (R-D16, R-H03, R-H04). */
import { quoteHotel, round2, type DiscountLike, type FeeLike, type HotelQuoteInput, type Quote, type QuoteLine, type RateLike, type SeasonLike, type TaxLike } from '../../../pricing/engine';

export interface ServiceLineInput { label: string; rate: number; qty: number; occurs: 'once' | 'daily' | 'per_night' }
export interface DeskQuoteInput extends Omit<HotelQuoteInput, 'payWithCard'> { payWithCard: boolean; services: ServiceLineInput[]; rates: RateLike[]; seasons: SeasonLike[]; discounts: DiscountLike[]; fees: FeeLike[]; taxes: TaxLike[] }

export const serviceMultiplier = (occurs: ServiceLineInput['occurs'], nights: number) => (occurs === 'once' ? 1 : occurs === 'per_night' ? Math.max(1, nights) : Math.max(1, nights) + 1);

export function quoteDeskStay(i: DeskQuoteInput): Quote {
  const room = quoteHotel({ ...i, payWithCard: false });
  const nights = room.nights ?? 0;
  const lines: QuoteLine[] = room.lines.filter((l) => l.kind !== 'fee');
  let svcSubtotal = 0;
  for (const s of i.services) {
    const qty = s.qty * serviceMultiplier(s.occurs, nights);
    const amount = round2(qty * s.rate);
    svcSubtotal += amount;
    lines.push({ label: `${s.label}${s.occurs !== 'once' ? ` (${s.occurs.replace('_', ' ')})` : ''}`, qty, unit: s.rate, amount, kind: 'service' });
  }
  svcSubtotal = round2(svcSubtotal);
  const tax = i.taxes.find((t) => t.active);
  const svcTax = tax && svcSubtotal ? round2(svcSubtotal * tax.service_rate / 100) : 0;
  if (svcTax) lines.push({ label: `${tax!.name} on services (${tax!.service_rate}%)`, qty: 1, unit: svcTax, amount: svcTax, kind: 'tax' });
  const taxTotal = round2(room.taxTotal + svcTax);
  const beforeFee = round2(room.subtotal - room.discountTotal + svcSubtotal + taxTotal);
  let feeTotal = 0;
  if (i.payWithCard) {
    const fee = i.fees.find((f) => f.active && f.kind === 'card');
    if (fee) { feeTotal = round2(beforeFee * fee.percent / 100); lines.push({ label: `${fee.name} (${fee.percent}%)`, qty: 1, unit: feeTotal, amount: feeTotal, kind: 'fee' }); }
  }
  return { lines, subtotal: round2(room.subtotal + svcSubtotal), discountTotal: room.discountTotal, feeTotal, taxTotal, total: round2(beforeFee + feeTotal), nights, notes: room.notes };
}
