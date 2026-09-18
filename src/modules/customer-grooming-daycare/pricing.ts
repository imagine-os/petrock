/** Settings-table rows the module prices from (never a hardcoded number) plus the per-order grooming quote. */
import { useMemo } from 'react';
import { useTable } from '../../data/DataContext';
import type { AddonRow, DaycarePricingRow, DiscountRow, FeeRow, PackageRow, TaxRow } from '../../data/schema/core';
import { quoteGrooming, packageMinutes, round2, type Quote, type QuoteLine, type Size } from '../../pricing/engine';
import type { GroomingDraftItem } from './draft';
import type { CustomerPet } from './useCustomer';

export function usePricingTables() {
  const { rows: packages } = useTable<PackageRow>('packages', { where: { active: true }, orderBy: { column: 'sort_order' } });
  const { rows: addons } = useTable<AddonRow>('addons', { where: { active: true } });
  const { rows: fees } = useTable<FeeRow>('fees');
  const { rows: taxes } = useTable<TaxRow>('taxes');
  const { rows: discounts } = useTable<DiscountRow>('discounts');
  const { rows: daycarePricing } = useTable<DaycarePricingRow>('daycare_pricing');
  return { packages, addons, fees, taxes, discounts, daycarePricing };
}

export interface PetQuote { item: GroomingDraftItem; pet: CustomerPet | undefined; pkg: PackageRow | undefined; addons: AddonRow[]; quote: Quote; minutes: number }
export interface OrderQuote { perPet: PetQuote[]; lines: QuoteLine[]; subtotal: number; taxTotal: number; feeTotal: number; total: number; longestMinutes: number; totalMinutes: number; notes: string[] }

/** One quoteGrooming per pet (package for the pet's size + its add-ons); tax and card fee are summed across pets. */
export function quoteOrder(items: GroomingDraftItem[], pets: CustomerPet[], t: { packages: PackageRow[]; addons: AddonRow[]; fees: FeeRow[]; taxes: TaxRow[] }, payWithCard: boolean): OrderQuote {
  const perPet = items.map((item) => {
    const pet = pets.find((p) => p.id === item.petId);
    const pkg = t.packages.find((p) => p.id === item.packageId);
    const adds = item.addonIds.map((id) => t.addons.find((a) => a.id === id)).filter((a): a is AddonRow => !!a);
    const size: Size = pet?.sizeTier ?? 'M';
    const quote = quoteGrooming({ pkg: pkg ?? null, size, addons: adds, payWithCard, fees: t.fees, taxes: t.taxes });
    return { item, pet, pkg, addons: adds, quote, minutes: Math.max(60, quote.minutes ?? (pkg ? packageMinutes(pkg, size) : 60)) };
  });
  const lines: QuoteLine[] = [];
  for (const p of perPet) for (const l of p.quote.lines) if (l.kind === 'service' || l.kind === 'addon') lines.push({ ...l, label: p.pet ? `${p.pet.name} · ${l.label}` : l.label });
  const taxTotal = round2(perPet.reduce((s, p) => s + p.quote.taxTotal, 0));
  const feeTotal = round2(perPet.reduce((s, p) => s + p.quote.feeTotal, 0));
  const taxLine = perPet.flatMap((p) => p.quote.lines).find((l) => l.kind === 'tax');
  const feeLine = perPet.flatMap((p) => p.quote.lines).find((l) => l.kind === 'fee');
  if (taxLine && taxTotal) lines.push({ ...taxLine, qty: 1, unit: taxTotal, amount: taxTotal });
  if (feeLine && feeTotal) lines.push({ ...feeLine, qty: 1, unit: feeTotal, amount: feeTotal });
  const subtotal = round2(perPet.reduce((s, p) => s + p.quote.subtotal, 0));
  const notes = [...new Set(perPet.flatMap((p) => p.quote.notes))];
  return { perPet, lines, subtotal, taxTotal, feeTotal, total: round2(subtotal + taxTotal + feeTotal), longestMinutes: Math.max(0, ...perPet.map((p) => p.minutes)), totalMinutes: perPet.reduce((s, p) => s + p.minutes, 0), notes };
}

export function useOrderQuote(items: GroomingDraftItem[], pets: CustomerPet[], payWithCard: boolean) {
  const t = usePricingTables();
  return useMemo(() => ({ ...quoteOrder(items, pets, t, payWithCard), tables: t }), [items, pets, t, payWithCard]);
}
