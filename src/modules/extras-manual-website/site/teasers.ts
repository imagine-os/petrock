/** Website price teasers: "from" values computed from the pricing tables (R-X41). Nothing here is a typed price. */
import { useTable } from '../../../data/DataContext';
import type { AddonRow, DaycarePricingRow, DiscountRow, FeeRow, PackageRow, RateRow, RoomTypeRow, SeasonRow, TaxRow, VaccineTypeRow, LocationRow } from '../../../data/schema/core';
import { fmtMoney } from '../../../pricing/engine';

export function usePricingTables() {
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: rates } = useTable<RateRow>('rates');
  const { rows: seasons } = useTable<SeasonRow>('seasons');
  const { rows: packages } = useTable<PackageRow>('packages', { orderBy: { column: 'sort_order' } });
  const { rows: addons } = useTable<AddonRow>('addons');
  const { rows: daycare } = useTable<DaycarePricingRow>('daycare_pricing');
  const { rows: discounts } = useTable<DiscountRow>('discounts');
  const { rows: fees } = useTable<FeeRow>('fees');
  const { rows: taxes } = useTable<TaxRow>('taxes');
  return { roomTypes, rates, seasons, packages: packages.filter((p) => p.active !== false), addons: addons.filter((a) => a.active !== false), daycare: daycare.filter((d) => d.active !== false), discounts: discounts.filter((d) => d.active), fees: fees.filter((f) => f.active), taxes: taxes.filter((t) => t.active) };
}

/** Lowest standard-season nightly rate of a room type. */
export const fromNightly = (rates: RateRow[], roomTypeId: string): number | null => { const r = rates.filter((x) => x.room_type_id === roomTypeId && !x.season_id).map((x) => x.price_per_night); return r.length ? Math.min(...r) : null; };
export const weekendNightly = (rates: RateRow[], roomTypeId: string): number | null => rates.find((x) => x.room_type_id === roomTypeId && !x.season_id && x.day_kind === 'weekend')?.price_per_night ?? null;
export const packageRange = (p: PackageRow) => `${fmtMoney(p.price_s)} – ${fmtMoney(p.price_giant)}`;
export const cardFee = (fees: FeeRow[]) => fees.find((f) => f.kind === 'card') ?? null;
export const from = (n: number | null) => (n == null ? '—' : `from ${fmtMoney(n)}`);

export function useLocations() { return useTable<LocationRow>('locations', { orderBy: { column: 'sort_order' } }).rows.filter((l) => l.active !== false); }
export function useVaccineTypes() { return useTable<VaccineTypeRow>('vaccine_types', { orderBy: { column: 'sort_order' } }).rows; }

const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const fmtTime = (t: string) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'pm' : 'am'}`; };
/** Collapses identical consecutive days: Mon–Fri 7 am – 7 pm, Sat–Sun 9 am – 5:30 pm. */
export function hoursSummary(hours: LocationRow['hours'] | null | undefined): { label: string; value: string }[] {
  if (!hours) return [];
  const order = [1, 2, 3, 4, 5, 6, 0];
  const out: { from: number; to: number; value: string }[] = [];
  for (const d of order) { const h = hours[String(d)]; const v = h ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : 'Closed'; const last = out[out.length - 1]; if (last && last.value === v) last.to = d; else out.push({ from: d, to: d, value: v }); }
  return out.map((r) => ({ label: r.from === r.to ? DAY[r.from] : `${DAY[r.from].slice(0, 3)} – ${DAY[r.to].slice(0, 3)}`, value: r.value }));
}
export function isOpenNow(hours: LocationRow['hours'] | null | undefined, now = new Date()): boolean {
  const h = hours?.[String(now.getDay())]; if (!h) return false;
  const cur = now.getHours() * 60 + now.getMinutes(); const [oh, om] = h.open.split(':').map(Number); const [ch, cm] = h.close.split(':').map(Number);
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}
