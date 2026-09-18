import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { ComponentMatrixPage } from './ComponentMatrixPage';
import { SpecReportPage } from './SpecReportPage';
import { DataWorkbenchPage } from './DataWorkbenchPage';
import { LayoutEditorPage } from './LayoutEditorPage';
import { ResponsiveReportPage } from './ResponsiveReportPage';
import { ViewportPreviewPage } from './ViewportPreviewPage';
import { SeedInspectorPage } from './SeedInspectorPage';
import { A11yScanPage } from './A11yScanPage';
import { PerfBudgetPage } from './PerfBudgetPage';
import { ScreenshotDiffPage } from './ScreenshotDiffPage';
import { DocsSearchPage } from './DocsSearchPage';
import { RouteManifestPage } from './RouteManifestPage';
import { componentMatrixSpec, specReportSpec, dataWorkbenchSpec, layoutEditorSpec, responsiveReportSpec, viewportPreviewSpec, seedInspectorSpec, a11yScanSpec, perfBudgetSpec, screenshotDiffSpec, docsSearchSpec, routeManifestSpec } from './specs';

export const strings = {
  'dev-quality.title': { en: 'Quality tools', es: 'Herramientas de calidad' },
  'dev-quality.run_hint': { en: 'Run the script after a build to refresh this report.', es: 'Ejecuta el script después de compilar para actualizar este informe.' },
};

const base = { roles: ['super_admin' as const], surface: 'dev' as const, layout: 'desktop' as const };
const G = 'developer';
const Q = 'Quality';

export const routes: RouteDef[] = [
  { ...base, path: '/dev/components/matrix', element: h(ComponentMatrixPage), spec: componentMatrixSpec, nav: { label: 'Component matrix', icon: 'grid', order: 11, group: G } },
  { ...base, path: '/dev/specs/report', element: h(SpecReportPage), spec: specReportSpec, nav: { label: 'Spec report', icon: 'spec', order: 12, group: G } },
  { ...base, path: '/dev/data', element: h(DataWorkbenchPage), spec: dataWorkbenchSpec, nav: { label: 'Data workbench', icon: 'table', order: 13, group: G } },
  { ...base, path: '/dev/data/:table', element: h(DataWorkbenchPage), spec: dataWorkbenchSpec },
  { ...base, path: '/dev/layout', element: h(LayoutEditorPage), spec: layoutEditorSpec, nav: { label: 'Layout editor', icon: 'layers', order: 14, group: G } },
  { ...base, path: '/dev/layout/:code', element: h(LayoutEditorPage), spec: layoutEditorSpec },
  { ...base, path: '/dev/seed', element: h(SeedInspectorPage), spec: seedInspectorSpec, nav: { label: 'Seed inspector', icon: 'refresh', order: 15, group: G } },
  { ...base, path: '/dev/routes', element: h(RouteManifestPage), spec: routeManifestSpec, nav: { label: 'Route manifest', icon: 'list', order: 16, group: G } },
  { ...base, path: '/dev/qa/responsive', element: h(ResponsiveReportPage), spec: responsiveReportSpec, nav: { label: 'Responsive report', icon: 'expand', order: 1, group: Q } },
  { ...base, path: '/dev/qa/preview', element: h(ViewportPreviewPage), spec: viewportPreviewSpec, nav: { label: 'Responsive preview', icon: 'phone', order: 2, group: Q } },
  { ...base, path: '/dev/qa/a11y', element: h(A11yScanPage), spec: a11yScanSpec, nav: { label: 'Accessibility scan', icon: 'shield', order: 3, group: Q } },
  { ...base, path: '/dev/qa/perf', element: h(PerfBudgetPage), spec: perfBudgetSpec, nav: { label: 'Performance budget', icon: 'chart', order: 4, group: Q } },
  { ...base, path: '/dev/qa/screenshots', element: h(ScreenshotDiffPage), spec: screenshotDiffSpec, nav: { label: 'Screenshot diff', icon: 'image', order: 5, group: Q } },
  { ...base, roles: ['super_admin', 'owner', 'manager'], path: '/dev/docs-search', element: h(DocsSearchPage), spec: docsSearchSpec, nav: { label: 'Docs search', icon: 'search', order: 2, group: 'docs' } },
];
