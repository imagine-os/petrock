import type { PageSpec } from './types';

/** Identity helper that keeps specs typed and greppable. Every module's specs.ts uses it. */
export function defineSpec(spec: PageSpec): PageSpec {
  if (import.meta.env.DEV && !/^(C|F|A|P|M|D|HUB)-\d{2}[a-z]?$/.test(spec.code)) console.warn(`[specs] unusual page code ${spec.code}`);
  return spec;
}
