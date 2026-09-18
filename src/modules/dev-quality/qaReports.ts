/** Reports the QA scripts write into docs/qa/*.json, bundled read-only so the pages can show the last run without a server. */
export interface ResponsiveCell { hscroll: boolean; scrollWidth: number; offenders: { selector: string; right: number }[]; a11y: { rule: string; severity: string; selector: string; text: string }[]; errors: string[]; ms?: number }
export interface ResponsiveReport { generatedAt: string; widths: number[]; themes: string[]; routes: { code: string; path: string; name: string; surface: string; status: string; cells: Record<string, ResponsiveCell> }[] }
export interface BundleReport { generatedAt: string; version: string; assets: { file: string; bytes: number; gzip: number; kind: 'js' | 'css' | 'other' }[]; totals: { js: number; css: number; other: number; jsGzip: number; cssGzip: number; files: number }; largest: { file: string; gzip: number } | null; docsBytes: number }

const found = import.meta.glob<unknown>('../../../docs/qa/*.json', { eager: true, import: 'default' });
const get = <T,>(name: string): T | null => (Object.entries(found).find(([k]) => k.endsWith(`/${name}`))?.[1] as T) ?? null;

export const responsiveReport = get<ResponsiveReport>('responsive-report.json');
export const bundleReport = get<BundleReport>('bundle-report.json');
export const cellKey = (width: number, theme: string) => `${width}-${theme}`;
