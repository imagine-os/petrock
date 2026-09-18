import type { RouteDef } from '../../specs/types';
import { specCompleteness } from '../../specs/types';
import { tableRegistry } from '../../data/schema';
import { componentByName } from '../../design/library';
import { ruleById } from '../../rules';
import { isStubElement, getModules } from '../../app/registry';

export const REQUIRED_WIDTHS = [360, 390, 768, 1280, 1920];

/** Module -> page-code ranges from docs/build-plan.md; used by D-09 / D-19 to flag codes outside their module's range. */
export const CODE_RANGES: { module: string; prefix: string; from: number; to: number }[] = [
  { module: 'customer-auth', prefix: 'C', from: 1, to: 9 }, { module: 'customer-home-pets', prefix: 'C', from: 10, to: 29 }, { module: 'customer-hotel', prefix: 'C', from: 30, to: 49 },
  { module: 'customer-grooming-daycare', prefix: 'C', from: 50, to: 69 }, { module: 'customer-settings-chat', prefix: 'C', from: 70, to: 89 },
  { module: 'frontdesk-reservations', prefix: 'F', from: 1, to: 29 }, { module: 'frontdesk-grooming-people', prefix: 'F', from: 30, to: 59 },
  { module: 'admin-control-panel', prefix: 'A', from: 1, to: 49 }, { module: 'extras-manual-website', prefix: 'P', from: 1, to: 19 }, { module: 'extras-manual-website', prefix: 'M', from: 1, to: 39 }, { module: 'extras-manual-website', prefix: 'F', from: 60, to: 79 },
  { module: 'dev-quality', prefix: 'D', from: 8, to: 19 }, { module: 'dev', prefix: 'D', from: 1, to: 7 }, { module: 'docs', prefix: 'D', from: 6, to: 6 }, { module: 'hub', prefix: 'HUB', from: 1, to: 2 }, { module: 'auth', prefix: 'A', from: 0, to: 0 }, { module: 'settings-rules', prefix: 'A', from: 40, to: 40 }, { module: 'public', prefix: 'P', from: 0, to: 0 },
];
export function expectedModule(code: string): string[] {
  const m = code.match(/^([A-Z]+)-(\d+)/); if (!m) return [];
  const n = Number(m[2]);
  return CODE_RANGES.filter((r) => r.prefix === m[1] && n >= r.from && n <= r.to).map((r) => r.module);
}

export interface SpecIssue { kind: 'missing' | 'unknown_table' | 'unknown_component' | 'unknown_rule' | 'widths' | 'stub' | 'duplicate_code' | 'code_range' | 'no_nav' | 'bad_code'; severity: 'error' | 'warn'; text: string }
export interface SpecReportRow { code: string; name: string; path: string; module: string; surface: string; status: 'built' | 'stub'; score: number; issues: SpecIssue[]; errors: number; warnings: number; route: RouteDef }

/** Which module registered a route (the registry keeps the winner; a stub loses to a built page). */
export function moduleOfRoute(route: RouteDef): string {
  for (const m of getModules()) if (m.routes.some((r) => r === route)) return m.name;
  return '?';
}

/** R-X80: every reference in every spec must resolve; every field must be filled; every width checked. */
export function buildSpecReport(routes: RouteDef[]): SpecReportRow[] {
  const codeCount = new Map<string, Set<string>>();
  for (const r of routes) { if (!codeCount.has(r.spec.code)) codeCount.set(r.spec.code, new Set()); codeCount.get(r.spec.code)!.add(r.spec.name); }
  return routes.map((route) => {
    const s = route.spec; const issues: SpecIssue[] = [];
    const { score, missing } = specCompleteness(s);
    const stub = isStubElement(route.element);
    if (!/^(C|F|A|P|M|D|HUB)-\d{2}[a-z]?$/.test(s.code)) issues.push({ kind: 'bad_code', severity: 'error', text: `Code "${s.code}" does not match <PREFIX>-<nn>` });
    const tooling = ['dev', 'docs', 'public'].includes(route.surface);
    for (const m of missing) issues.push({ kind: 'missing', severity: m === 'states' || m === 'rules' || (m === 'data' && tooling) ? 'warn' : 'error', text: `spec.${m} is empty${m === 'data' && tooling ? ' (tooling / static page: acceptable when it reads no table)' : ''}` });
    for (const t of s.data) if (!tableRegistry[t] && !t.includes(' ')) issues.push({ kind: 'unknown_table', severity: 'error', text: `data "${t}" is not a table in src/data/schema` });
    for (const c of s.components) if (!componentByName(c)) issues.push({ kind: 'unknown_component', severity: 'error', text: `component "${c}" has no meta in src/components` });
    for (const id of s.rules ?? []) if (!ruleById(id)) issues.push({ kind: 'unknown_rule', severity: 'warn', text: `rule ${id} is not in the registry (requested?)` });
    const widths = s.checkedAt ?? []; const missW = REQUIRED_WIDTHS.filter((w) => !widths.includes(w));
    if (!stub && missW.length) issues.push({ kind: 'widths', severity: 'warn', text: `not checked at ${missW.join(', ')} px (D-016)` });
    if (stub) issues.push({ kind: 'stub', severity: 'warn', text: 'still a PageStub' });
    const names = codeCount.get(s.code)!; if (names.size > 1) issues.push({ kind: 'duplicate_code', severity: 'error', text: `code ${s.code} is used by ${names.size} different pages: ${[...names].join(' / ')}` });
    const mod = moduleOfRoute(route); const expected = expectedModule(s.code);
    if (expected.length && !expected.includes(mod) && mod !== '_stubs') issues.push({ kind: 'code_range', severity: 'warn', text: `code ${s.code} is in the range of ${expected.join(' or ')}, registered by ${mod}` });
    if (!route.nav && !route.path.includes(':') && !route.path.includes('*') && route.surface !== 'public' && route.surface !== 'customer' && !['dev', 'docs'].includes(route.surface) && !stub) issues.push({ kind: 'no_nav', severity: 'warn', text: 'no side-menu entry (nav) and not a detail route' });
    return { code: s.code, name: s.name, path: route.path, module: mod, surface: route.surface, status: (stub ? 'stub' : 'built') as 'stub' | 'built', score, issues, errors: issues.filter((i) => i.severity === 'error').length, warnings: issues.filter((i) => i.severity === 'warn').length, route };
  }).sort((a, b) => b.errors - a.errors || b.warnings - a.warnings || a.code.localeCompare(b.code, undefined, { numeric: true }));
}

export function specReportMarkdown(rows: SpecReportRow[]): string {
  const clean = rows.filter((r) => !r.issues.length).length;
  let md = `# Spec completeness report\n\n_Generated from the running app (D-09) on ${new Date().toISOString().slice(0, 10)}. ${rows.length} routes, ${clean} without issues, ${rows.reduce((s, r) => s + r.errors, 0)} errors, ${rows.reduce((s, r) => s + r.warnings, 0)} warnings._\n\n| Code | Page | Route | Module | Status | Score | Issues |\n| --- | --- | --- | --- | --- | --- | --- |\n`;
  for (const r of rows) md += `| \`${r.code}\` | ${r.name} | \`#${r.path}\` | ${r.module} | ${r.status} | ${r.score}% | ${r.issues.map((i) => `${i.severity === 'error' ? '**E**' : 'W'} ${i.text}`).join('<br>') || '—'} |\n`;
  return md;
}
