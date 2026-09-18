import type { BaseRow } from './schema/types';
import type { ChangeEvent, DataProvider, Query } from './provider';

/**
 * Adapter for the Company-OS REST API (docs/reference/company-os.md):
 *   GET/POST   /t/:tenant/api/:entityKey
 *   GET/PATCH/DELETE /t/:tenant/api/:entityKey/:id
 *   POST       /t/:tenant/query   { entity, filters, sort, page }
 * Petrock is one tenant ("petrock") with two org_units (the locations); `location_id` maps to org_unit_id.
 * STUB: the shape is real, the transport is not wired (no backend yet). Swap it in at createDefaultProvider().
 */
export class CompanyOsProvider implements DataProvider {
  readonly name = 'company-os';
  private listeners = new Map<string, Set<(e: ChangeEvent) => void>>();

  constructor(private baseUrl: string, private tenant = 'petrock', private token?: string) {}

  private url(path: string) { return `${this.baseUrl}/t/${this.tenant}${path}`; }
  private headers(): Record<string, string> { return { 'content-type': 'application/json', ...(this.token ? { authorization: `Bearer ${this.token}` } : {}) }; }
  private async req<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(this.url(path), { method, headers: this.headers(), body: body == null ? undefined : JSON.stringify(body) });
    if (!res.ok) throw new Error(`Company-OS ${method} ${path} -> ${res.status}`);
    return (res.status === 204 ? null : await res.json()) as T;
  }
  /** Company-OS records are { id, org_unit_id, data: {...}, created_at, updated_at }; flatten to a row. */
  private static toRow<T extends BaseRow>(r: { id: string; org_unit_id?: string | null; data: Record<string, unknown>; created_at: string; updated_at: string }): T {
    return { id: r.id, location_id: r.org_unit_id ?? null, created_at: r.created_at, updated_at: r.updated_at, ...r.data } as unknown as T;
  }
  private static toData(row: Record<string, unknown>) {
    const { id: _id, created_at: _c, updated_at: _u, location_id, ...data } = row;
    return { org_unit_id: location_id ?? null, data };
  }

  async list<T extends BaseRow>(table: string, query?: Query): Promise<T[]> {
    const spec = {
      entity: table,
      filters: Object.entries(query?.where ?? {}).map(([field, value]) => ({ field, op: Array.isArray(value) ? 'in' : 'eq', value })),
      sort: query?.orderBy ? [{ field: query.orderBy.column, dir: query.orderBy.dir ?? 'asc' }] : [],
      page: { limit: query?.limit ?? 500, offset: query?.offset ?? 0 },
    };
    const out = await this.req<{ rows: Parameters<typeof CompanyOsProvider.toRow>[0][] }>('POST', '/query', spec);
    return out.rows.map((r) => CompanyOsProvider.toRow<T>(r));
  }
  async get<T extends BaseRow>(table: string, id: string): Promise<T | null> {
    try { return CompanyOsProvider.toRow<T>(await this.req('GET', `/api/${table}/${id}`)); } catch { return null; }
  }
  async insert<T extends BaseRow>(table: string, row: Partial<T>): Promise<T> {
    const out = CompanyOsProvider.toRow<T>(await this.req('POST', `/api/${table}`, CompanyOsProvider.toData(row)));
    this.emit({ table, type: 'insert', row: out });
    return out;
  }
  async update<T extends BaseRow>(table: string, id: string, patch: Partial<T>): Promise<T> {
    const out = CompanyOsProvider.toRow<T>(await this.req('PATCH', `/api/${table}/${id}`, CompanyOsProvider.toData(patch)));
    this.emit({ table, type: 'update', row: out, id });
    return out;
  }
  async remove(table: string, id: string): Promise<void> {
    await this.req('DELETE', `/api/${table}/${id}`);
    this.emit({ table, type: 'remove', id });
  }
  subscribe(table: string, cb: (e: ChangeEvent) => void): () => void {
    if (!this.listeners.has(table)) this.listeners.set(table, new Set());
    this.listeners.get(table)!.add(cb);
    return () => { this.listeners.get(table)?.delete(cb); };
  }
  private emit(e: ChangeEvent) { this.listeners.get(e.table)?.forEach((cb) => cb(e)); this.listeners.get('*')?.forEach((cb) => cb(e)); }
}
