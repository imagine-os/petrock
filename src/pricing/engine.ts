/**
 * Pricing engine. Pure functions: every price comes from settings-table rows passed in (rates, seasons,
 * discounts, fees, taxes, packages, addons, daycare_pricing). Pages never hardcode a price.
 * Tested by scripts/test-pricing.mjs (npm run test:pricing). Money is USD with 2 decimals.
 */

export interface RateLike { room_type_id: string; day_kind: 'weekday' | 'weekend'; season_id: string | null; price_per_night: number; location_id?: string | null }
export interface SeasonLike { id: string; starts_on: string; ends_on: string; is_holiday: boolean }
export interface DiscountLike { kind: 'multi_dog' | 'long_stay' | 'prepay' | 'daycare_extra_pet'; room_type_id: string | null; dog_count: number | null; min_nights: number | null; amount_off: number; percent_off: number | null; requires_paid_in_full: boolean; excludes_holidays: boolean; active: boolean; name: string }
export interface FeeLike { kind: 'card' | 'other' | 'grooming_sanitation'; percent: number; amount?: number | null; applies_to: 'card_payments' | 'all' | 'grooming'; included?: boolean; active: boolean; name: string }
export interface TaxLike { service_rate: number; product_rate: number; boarding_rate: number; prices_inclusive: boolean; active: boolean; name: string }
export interface PackageLike { id: string; name: string; price_s: number; price_m: number; price_l: number; price_xl: number; price_giant: number; minutes_s: number; minutes_m: number; minutes_l: number; minutes_xl: number; minutes_giant: number }
export interface AddonLike { id: string; name: string; price: number; starting_at: boolean; added_minutes_sm: number; added_minutes_l: number }
export interface DaycarePriceLike { item: 'full_day' | 'half_day' | 'hour' | 'walk'; name: string; price: number; threshold_hours: number | null; active: boolean }

export interface QuoteLine { label: string; qty: number; unit: number; amount: number; kind: 'room' | 'discount' | 'fee' | 'tax' | 'service' | 'addon' }
export interface Quote { lines: QuoteLine[]; subtotal: number; discountTotal: number; feeTotal: number; taxTotal: number; total: number; nights?: number; minutes?: number; notes: string[] }

export const round2 = (n: number) => Math.round(n * 100) / 100;
export type Size = 'S' | 'M' | 'L' | 'XL' | 'Giant';

/** Fri/Sat/Sun nights are 'weekend' (R-D05 "Fri-Sun"). */
export const dayKind = (d: Date): 'weekday' | 'weekend' => ([0, 5, 6].includes(d.getDay()) ? 'weekend' : 'weekday');
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function seasonFor(day: Date, seasons: SeasonLike[]): SeasonLike | null {
  const s = iso(day);
  return seasons.find((x) => x.starts_on <= s && s <= x.ends_on) ?? null;
}
/** Nights between two dates (calendar days, min 1). */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const a = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const b = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
}

export interface HotelQuoteInput {
  roomTypeId: string;
  roomTypeName: string;
  checkIn: Date;
  checkOut: Date;
  /** Dogs sharing the room (multi-dog discount applies per dog per night). */
  dogs: number;
  paidInFull: boolean;
  payWithCard: boolean;
  locationId?: string | null;
  rates: RateLike[];
  seasons: SeasonLike[];
  discounts: DiscountLike[];
  fees: FeeLike[];
  taxes: TaxLike[];
}

/** Hotel stay quote: per-night rate by day kind and season, multi-dog + long-stay discounts, card fee, boarding tax. */
export function quoteHotel(i: HotelQuoteInput): Quote {
  const nights = nightsBetween(i.checkIn, i.checkOut);
  const lines: QuoteLine[] = [];
  const notes: string[] = [];
  let holidayNights = 0;
  const perNight: { day: Date; price: number; season: SeasonLike | null }[] = [];
  for (let n = 0; n < nights; n++) {
    const day = new Date(i.checkIn); day.setDate(day.getDate() + n);
    const season = seasonFor(day, i.seasons);
    if (season?.is_holiday) holidayNights++;
    const kind = dayKind(day);
    const pick = (sid: string | null) => i.rates.find((r) => r.room_type_id === i.roomTypeId && r.day_kind === kind && (r.season_id ?? null) === sid && (!r.location_id || !i.locationId || r.location_id === i.locationId));
    const rate = (season && pick(season.id)) ?? pick(null);
    if (!rate) notes.push(`No rate for ${i.roomTypeName} ${kind}${season ? ` (${season.id})` : ''}`);
    perNight.push({ day, price: rate?.price_per_night ?? 0, season });
  }
  // group identical nightly prices into lines
  const groups = new Map<string, { price: number; count: number; label: string }>();
  for (const pn of perNight) {
    const label = `${i.roomTypeName} · ${dayKind(pn.day) === 'weekend' ? 'Fri-Sun' : 'Mon-Thu'}${pn.season ? ' (seasonal)' : ''}`;
    const k = `${label}|${pn.price}`;
    const g = groups.get(k) ?? { price: pn.price, count: 0, label };
    g.count++; groups.set(k, g);
  }
  for (const g of groups.values()) lines.push({ label: g.label, qty: g.count * i.dogs, unit: g.price, amount: round2(g.count * i.dogs * g.price), kind: 'room' });
  if (i.dogs > 1) notes.push(`${i.dogs} dogs × ${nights} nights`);
  const subtotal = round2(lines.reduce((s, l) => s + l.amount, 0));

  // discounts
  let discountTotal = 0;
  const active = i.discounts.filter((d) => d.active);
  const multi = active.filter((d) => d.kind === 'multi_dog' && d.room_type_id === i.roomTypeId && d.dog_count === i.dogs)[0]
    ?? active.filter((d) => d.kind === 'multi_dog' && d.room_type_id === i.roomTypeId && d.dog_count != null && d.dog_count <= i.dogs).sort((a, b) => (b.dog_count ?? 0) - (a.dog_count ?? 0))[0];
  if (multi && i.dogs > 1) {
    const amt = round2(multi.amount_off * i.dogs * nights);
    lines.push({ label: multi.name, qty: i.dogs * nights, unit: -multi.amount_off, amount: -amt, kind: 'discount' });
    discountTotal += amt;
  }
  const longStay = active.filter((d) => d.kind === 'long_stay' && (d.min_nights ?? 0) <= nights && (!d.requires_paid_in_full || i.paidInFull) && (!d.excludes_holidays || holidayNights === 0))
    .sort((a, b) => (b.min_nights ?? 0) - (a.min_nights ?? 0))[0];
  if (longStay?.percent_off) {
    const base = subtotal - discountTotal;
    const amt = round2(base * longStay.percent_off / 100);
    lines.push({ label: `${longStay.name} (${longStay.percent_off}%)`, qty: 1, unit: -amt, amount: -amt, kind: 'discount' });
    discountTotal += amt;
  } else if (holidayNights > 0 && active.some((d) => d.kind === 'long_stay' && (d.min_nights ?? 0) <= nights)) notes.push('Long-stay discount not applied: stay includes holiday nights');
  else if (!i.paidInFull && active.some((d) => d.kind === 'long_stay' && (d.min_nights ?? 0) <= nights && d.requires_paid_in_full)) notes.push('Pay in full upfront to get the long-stay discount');
  discountTotal = round2(discountTotal);
  const afterDiscount = round2(subtotal - discountTotal);

  // tax (boarding rate) then card fee on the amount charged
  const tax = i.taxes.find((t) => t.active);
  const taxTotal = tax ? round2(afterDiscount * tax.boarding_rate / 100) : 0;
  if (tax && taxTotal) lines.push({ label: `${tax.name} (${tax.boarding_rate}%)`, qty: 1, unit: taxTotal, amount: taxTotal, kind: 'tax' });
  let feeTotal = 0;
  if (i.payWithCard) {
    const fee = i.fees.find((f) => f.active && f.kind === 'card');
    if (fee) { feeTotal = round2((afterDiscount + taxTotal) * fee.percent / 100); lines.push({ label: `${fee.name} (${fee.percent}%)`, qty: 1, unit: feeTotal, amount: feeTotal, kind: 'fee' }); }
  }
  const total = round2(afterDiscount + taxTotal + feeTotal);
  return { lines, subtotal, discountTotal, feeTotal, taxTotal, total, nights, notes };
}

const sizeKey = (s: Size) => s.toLowerCase() as 's' | 'm' | 'l' | 'xl' | 'giant';
export const packagePrice = (p: PackageLike, size: Size) => p[`price_${sizeKey(size)}`];
export const packageMinutes = (p: PackageLike, size: Size) => p[`minutes_${sizeKey(size)}`];

export interface GroomingQuoteInput { pkg: PackageLike | null; size: Size; addons: AddonLike[]; payWithCard: boolean; fees: FeeLike[]; taxes: TaxLike[] }

/** Grooming & Spa quote: package by size + add-ons (added minutes by size), service tax, card fee. */
export function quoteGrooming(i: GroomingQuoteInput): Quote {
  const lines: QuoteLine[] = [];
  const notes: string[] = [];
  let minutes = 0;
  if (i.pkg) { const p = packagePrice(i.pkg, i.size); lines.push({ label: `${i.pkg.name} (${i.size})`, qty: 1, unit: p, amount: p, kind: 'service' }); minutes += packageMinutes(i.pkg, i.size); }
  for (const a of i.addons) {
    lines.push({ label: a.name + (a.starting_at ? ' (from)' : ''), qty: 1, unit: a.price, amount: a.price, kind: 'addon' });
    minutes += ['L', 'XL', 'Giant'].includes(i.size) ? a.added_minutes_l : a.added_minutes_sm;
    if (a.starting_at) notes.push(`${a.name} is a starting price; final depends on coat condition`);
  }
  const subtotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  const tax = i.taxes.find((t) => t.active);
  const taxTotal = tax ? round2(subtotal * tax.service_rate / 100) : 0;
  if (tax && taxTotal) lines.push({ label: `${tax.name} (${tax.service_rate}%)`, qty: 1, unit: taxTotal, amount: taxTotal, kind: 'tax' });
  let feeTotal = 0;
  if (i.payWithCard) { const fee = i.fees.find((f) => f.active && f.kind === 'card'); if (fee) { feeTotal = round2((subtotal + taxTotal) * fee.percent / 100); lines.push({ label: `${fee.name} (${fee.percent}%)`, qty: 1, unit: feeTotal, amount: feeTotal, kind: 'fee' }); } }
  return { lines, subtotal, discountTotal: 0, feeTotal, taxTotal, total: round2(subtotal + taxTotal + feeTotal), minutes, notes };
}

export interface DaycareQuoteInput { hours: number; pets: number; pricing: DaycarePriceLike[]; discounts: DiscountLike[]; payWithCard: boolean; fees: FeeLike[]; taxes: TaxLike[] }

/** Daycare: half day below the threshold, full day at/above; each extra pet $X off; service tax; card fee. */
export function quoteDaycare(i: DaycareQuoteInput): Quote & { item: 'full_day' | 'half_day' | 'hour' } {
  const p = i.pricing.filter((x) => x.active);
  const full = p.find((x) => x.item === 'full_day'), half = p.find((x) => x.item === 'half_day'), hour = p.find((x) => x.item === 'hour');
  const threshold = full?.threshold_hours ?? half?.threshold_hours ?? 5; // fallback only; the real cutoff is the daycare_pricing row (5 h on petrockhotel.com, D-187)
  let item: 'full_day' | 'half_day' | 'hour' = i.hours >= threshold ? 'full_day' : 'half_day';
  let unit = item === 'full_day' ? full?.price ?? 0 : half?.price ?? 0;
  if (hour && i.hours <= 1 && hour.price < unit) { item = 'hour'; unit = hour.price; }
  const label = item === 'full_day' ? full?.name ?? 'Full day' : item === 'half_day' ? half?.name ?? 'Half day' : hour?.name ?? 'Play hour';
  const lines: QuoteLine[] = [{ label: `${label} (${i.hours} h)`, qty: i.pets, unit, amount: round2(unit * i.pets), kind: 'service' }];
  const subtotal = round2(unit * i.pets);
  let discountTotal = 0;
  const extra = i.discounts.find((d) => d.active && d.kind === 'daycare_extra_pet');
  if (extra && i.pets > 1) { discountTotal = round2(extra.amount_off * (i.pets - 1)); lines.push({ label: extra.name, qty: i.pets - 1, unit: -extra.amount_off, amount: -discountTotal, kind: 'discount' }); }
  const after = round2(subtotal - discountTotal);
  const tax = i.taxes.find((t) => t.active);
  const taxTotal = tax ? round2(after * tax.service_rate / 100) : 0;
  if (tax && taxTotal) lines.push({ label: `${tax.name} (${tax.service_rate}%)`, qty: 1, unit: taxTotal, amount: taxTotal, kind: 'tax' });
  let feeTotal = 0;
  if (i.payWithCard) { const fee = i.fees.find((f) => f.active && f.kind === 'card'); if (fee) { feeTotal = round2((after + taxTotal) * fee.percent / 100); lines.push({ label: `${fee.name} (${fee.percent}%)`, qty: 1, unit: feeTotal, amount: feeTotal, kind: 'fee' }); } }
  return { item, lines, subtotal, discountTotal, feeTotal, taxTotal, total: round2(after + taxTotal + feeTotal), notes: [] };
}

export const fmtMoney = (n: number, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
