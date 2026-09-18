import type { RouteDef } from '../specs/types';
import { isStubElement } from './registry';

/** What scripts/screenshots.mjs reads from the running app: every route with its real spec. */
export interface RouteManifestEntry { path: string; code: string; surface: RouteDef['surface']; status: 'built' | 'stub'; roles: string[]; spec: RouteDef['spec'] }

export function buildManifest(routes: RouteDef[]): RouteManifestEntry[] {
  return routes.map((r) => ({ path: r.path, code: r.spec.code, surface: r.surface, status: isStubElement(r.element) ? 'stub' : 'built', roles: r.roles, spec: r.spec }));
}

/** Exposes the manifest on window.__petrock so tooling can read spec codes without parsing TypeScript. */
export function publishManifest(routes: RouteDef[]): void {
  if (typeof window === 'undefined') return;
  (window as unknown as { __petrock?: { routes: RouteManifestEntry[]; version: string } }).__petrock = { routes: buildManifest(routes), version: __APP_VERSION__ };
}
