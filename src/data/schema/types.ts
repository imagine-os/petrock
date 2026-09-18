/**
 * Table definitions shaped like the future Postgres schema (Company-OS entity or Supabase table).
 * Every table gets id, created_at, updated_at; location-scoped tables also get location_id (see baseColumns).
 * supabase/schema.sql and docs/data-model.md are generated from here (npm run sql).
 */
export type ColumnType = 'uuid' | 'text' | 'int' | 'numeric' | 'money' | 'bool' | 'timestamptz' | 'date' | 'time' | 'json' | 'enum';

export interface ColumnDef {
  name: string;
  type: ColumnType;
  nullable?: boolean;
  /** Referenced table (column `id`). */
  references?: string;
  enum?: readonly string[];
  description?: string;
  /** Hide in the default table view (long text, json). */
  wide?: boolean;
}

export type TableGroup = 'core' | 'people' | 'pets' | 'hotel' | 'grooming' | 'daycare' | 'commerce' | 'comms' | 'system' | 'design';

export const TABLE_GROUPS: { id: TableGroup; label: string }[] = [
  { id: 'core', label: 'Core & locations' }, { id: 'people', label: 'People & staff' }, { id: 'pets', label: 'Pets & vaccines' },
  { id: 'hotel', label: 'Hotel' }, { id: 'grooming', label: 'Grooming & Spa' }, { id: 'daycare', label: 'Daycare' },
  { id: 'commerce', label: 'Pricing, invoices & payments' }, { id: 'comms', label: 'Messages, reviews & feedback' },
  { id: 'system', label: 'System' }, { id: 'design', label: 'Design & layout' },
];

export interface TableDef {
  name: string;
  label: string;
  description: string;
  group: TableGroup;
  /** 'location' adds location_id to the base columns. */
  scope: 'global' | 'location';
  columns: ColumnDef[];
  /** Column used as the human-readable title of a row. */
  titleColumn?: string;
  /** Access intent per role, emitted as comments in the SQL and the data-model doc. */
  access?: string[];
  /** Where the entity came from (docs/data/entities-from-designs.md section). */
  source?: string;
}

export const GLOBAL_BASE: ColumnDef[] = [
  { name: 'id', type: 'uuid', description: 'Primary key' },
  { name: 'created_at', type: 'timestamptz' },
  { name: 'updated_at', type: 'timestamptz' },
];
export const LOCATION_COLUMN: ColumnDef = { name: 'location_id', type: 'uuid', references: 'locations', description: 'Owning location (Encino / Westwood)' };

export function baseColumns(t: TableDef): ColumnDef[] {
  return t.scope === 'location' ? [GLOBAL_BASE[0], LOCATION_COLUMN, GLOBAL_BASE[1], GLOBAL_BASE[2]] : GLOBAL_BASE;
}
export const allColumns = (t: TableDef): ColumnDef[] => [...baseColumns(t), ...t.columns];

export interface BaseRow {
  id: string;
  created_at: string;
  updated_at: string;
  location_id?: string | null;
  [key: string]: unknown;
}

export const defineTables = (tables: TableDef[]): TableDef[] => tables;
