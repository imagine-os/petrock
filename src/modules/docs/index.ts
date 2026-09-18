import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import { DocsBrowser } from './DocsBrowser';
import { docsSpec } from '../dev/specs';

export const strings = {};
const roles = ['super_admin' as const, 'owner' as const, 'manager' as const];
export const routes: RouteDef[] = [
  { path: '/docs', element: h(DocsBrowser), spec: docsSpec, roles, surface: 'docs', layout: 'desktop', nav: { label: 'Documentation', icon: 'layers', order: 1, group: 'docs' } },
  { path: '/docs/*', element: h(DocsBrowser), spec: docsSpec, roles, surface: 'docs', layout: 'desktop' },
];
