/** Aggregates every src/rules/<area>.ts (each exports `rules: Rule[]`). Module agents add a file, never edit this one. */
import type { Rule } from './types';
export * from './types';

const found = import.meta.glob<{ rules?: Rule[] }>('./*.ts', { eager: true });
export const rules: Rule[] = Object.entries(found)
  .filter(([p]) => !/\/(index|types)\.ts$/.test(p))
  .flatMap(([, m]) => m.rules ?? [])
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
export const ruleById = (id: string) => rules.find((r) => r.id === id);
export const rulesForPage = (code: string) => rules.filter((r) => r.pages.includes(code));

if (import.meta.env.DEV) {
  const seen = new Set<string>();
  for (const r of rules) { if (seen.has(r.id)) console.warn(`[rules] duplicate rule ${r.id}`); seen.add(r.id); }
}
