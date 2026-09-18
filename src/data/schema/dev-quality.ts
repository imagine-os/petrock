/**
 * dev-quality tables: QA runs (responsive / a11y / bundle passes written by scripts and shown in D-12, D-15, D-16)
 * and performance budgets (D-16 reads its limits from here, never from a constant in the page).
 */
import { defineTables, type BaseRow, type ColumnDef } from './types.ts';

const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });

export const QA_KINDS = ['responsive', 'a11y', 'bundle', 'screenshots', 'smoke'] as const;
export const QA_RESULTS = ['pass', 'warn', 'fail'] as const;
export const BUDGET_UNITS = ['kb', 'ms', 'count', 'percent'] as const;

export const tables = defineTables([
  { name: 'qa_runs', label: 'QA runs', description: 'One row per quality pass (responsive matrix, a11y scan, bundle budget, screenshot pass): what ran, at which widths, how many issues, where the report lives.', group: 'system', scope: 'global', titleColumn: 'label', source: 'dev-quality module (D-12, D-15, D-16)',
    access: ['super_admin: read/write', 'owner: read'],
    columns: [
      { name: 'kind', type: 'enum', enum: QA_KINDS },
      text('label', false, 'Human label, e.g. "Responsive pass 2026-09-18"'),
      { name: 'started_at', type: 'timestamptz' },
      { name: 'finished_at', type: 'timestamptz', nullable: true },
      { name: 'routes', type: 'int', description: 'Routes covered' },
      { name: 'widths', type: 'json', nullable: true, description: 'Widths checked, e.g. [360,390,768,1280,1920]' },
      { name: 'issues', type: 'int', description: 'Issues found' },
      { name: 'result', type: 'enum', enum: QA_RESULTS },
      text('report_path', true, 'docs/qa/<file>.md the run wrote'),
      text('triggered_by', true, 'script | page | ci'),
      { name: 'summary', type: 'json', nullable: true, wide: true, description: 'Per-route counts' },
    ] },
  { name: 'perf_budgets', label: 'Performance budgets', description: 'Limits the bundle and runtime checks compare against (D-16). Edit here, never in code.', group: 'system', scope: 'global', titleColumn: 'metric', source: 'dev-quality module (D-16)',
    access: ['super_admin: read/write', 'owner: read'],
    columns: [
      text('metric', false, 'Key, e.g. js_total_kb, css_total_kb, largest_chunk_kb, route_count_max, localstorage_kb, ttfr_ms'),
      text('label'),
      { name: 'budget', type: 'numeric' },
      { name: 'unit', type: 'enum', enum: BUDGET_UNITS },
      { name: 'warn_at_percent', type: 'int', description: 'Warn when usage passes this share of the budget (default 80)' },
      text('description', true),
      { name: 'active', type: 'bool' },
    ] },
]);

export interface QaRunRow extends BaseRow { kind: (typeof QA_KINDS)[number]; label: string; started_at: string; finished_at: string | null; routes: number; widths: number[] | null; issues: number; result: (typeof QA_RESULTS)[number]; report_path: string | null; triggered_by: string | null; summary: Record<string, unknown> | null }
export interface PerfBudgetRow extends BaseRow { metric: string; label: string; budget: number; unit: (typeof BUDGET_UNITS)[number]; warn_at_percent: number; description: string | null; active: boolean }
