import type { ReactNode } from 'react';
import type { Role } from '../auth/roles';

export type Surface = 'public' | 'customer' | 'frontdesk' | 'admin' | 'dev' | 'docs' | 'manual';
export type LayoutMode = 'mobile' | 'desktop' | 'auto';

/**
 * The builder-tool contract. Every routed page carries one of these and the InspectorPanel shows it.
 * `layout` = ordered section names the page renders; `data` = table names from src/data/schema (linked to the
 * table manager); `rules` = rule ids from src/rules (linked to the registry); `components` = library names
 * (linked to /dev/components); `logic` = calculations in plain words; `integrations` = external systems.
 */
export interface PageSpec {
  code: string;
  name: string;
  purpose: string;
  layout: string[];
  data: string[];
  roles: Role[];
  logic: string[];
  integrations: string[];
  components: string[];
  /** Rule ids this page implements or displays (see src/rules). */
  rules?: string[];
  states?: string[];
  notes?: string[];
  /** Figma file names (docs/figma/exports/petrock-main) the page was built from. */
  figma?: string[];
  /** Widths the page has been checked at (D-016). */
  checkedAt?: number[];
}

export interface NavDef {
  /** Label (an i18n key when one exists, else verbatim). */
  label: string;
  icon: string;
  order: number;
  /** Menu category key (src/app/navGroups.ts) or a verbatim label for an ad-hoc category. */
  group: string;
  /** Override the link target (parameterised routes). */
  to?: string;
}

export interface RouteDef {
  path: string;
  element: ReactNode;
  spec: PageSpec;
  roles: Role[];
  surface: Surface;
  layout?: LayoutMode;
  nav?: NavDef;
}

/** Marks a spec as complete enough for the specs index badge. */
export function specCompleteness(spec: PageSpec): { score: number; missing: string[] } {
  const checks: [string, boolean][] = [
    ['purpose', !!spec.purpose],
    ['layout', spec.layout.length > 0],
    ['data', spec.data.length > 0],
    ['roles', spec.roles.length > 0],
    ['logic', spec.logic.length > 0],
    ['components', spec.components.length > 0],
    ['rules', !!spec.rules && spec.rules.length > 0],
    ['states', !!spec.states && spec.states.length > 0],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([k]) => k);
  return { score: Math.round(((checks.length - missing.length) / checks.length) * 100), missing };
}

/** Which surface a page code belongs to, from its prefix. */
export function surfaceOfCode(code: string): string {
  const p = code.split('-')[0];
  return ({ C: 'Customer app', F: 'Front desk', A: 'Owner / admin', P: 'Public website', M: 'Ops manual', D: 'Dev', HUB: 'Hub' } as Record<string, string>)[p] ?? p;
}
