// Generates supabase/schema.sql and docs/data-model.md from src/data/schema/*.ts. Run: npm run sql. Commit both outputs.
import { readdirSync, writeFileSync } from 'node:fs';
const dir = new URL('../src/data/schema/', import.meta.url);
const { TABLE_GROUPS, baseColumns } = await import('../src/data/schema/types.ts');
const tables = [];
for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts') && !['index.ts', 'types.ts'].includes(f)).sort()) {
  const m = await import(new URL(f, dir));
  if (m.tables) tables.push(...m.tables);
}
tables.sort((a, b) => a.name.localeCompare(b.name));

const PG = { uuid: 'uuid', text: 'text', int: 'integer', numeric: 'numeric(12,2)', money: 'numeric(12,2)', bool: 'boolean', timestamptz: 'timestamptz', date: 'date', time: 'time', json: 'jsonb', enum: 'text' };
const col = (c) => {
  const parts = [`  ${c.name} ${PG[c.type]}`];
  if (c.name === 'id') parts.push('primary key default gen_random_uuid()');
  else if (!c.nullable) parts.push('not null');
  if (c.name === 'created_at' || c.name === 'updated_at') parts.push('default now()');
  if (c.type === 'bool') parts.push('default false');
  if (c.enum) parts.push(`check (${c.name} in (${c.enum.map((e) => `'${e}'`).join(', ')}))`);
  if (c.references) parts.push(`references public.${c.references}(id)${c.name === 'location_id' ? '' : ' on delete set null'}`);
  const line = parts.join(' ');
  return c.description ? `  -- ${c.description}\n${line}` : line;
};

let sql = `-- Petrock - Postgres schema draft (Company-OS entity shapes / Supabase later)
-- GENERATED from src/data/schema/*.ts by scripts/gen-sql.mjs. Edit the TS, regenerate, review, then apply as a migration.
-- Conventions: every table has id, created_at, updated_at; location-scoped tables add location_id -> locations.
-- Company-OS mapping: one tenant "petrock", org_unit = location; each table below is an entity whose columns are fields.

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

`;
for (const t of tables) {
  const cols = [...baseColumns(t), ...t.columns].map(col);
  const access = (t.access ?? []).map((n) => `--   · ${n}`).join('\n');
  sql += `-- ${t.group} · ${t.label}: ${t.description}\n${access ? `-- access:\n${access}\n` : ''}create table if not exists public.${t.name} (\n${cols.join(',\n')}\n);\n`;
  if (t.scope === 'location') sql += `create index if not exists ${t.name}_location_idx on public.${t.name}(location_id);\n`;
  for (const c of t.columns.filter((c) => c.references)) sql += `create index if not exists ${t.name}_${c.name}_idx on public.${t.name}(${c.name});\n`;
  sql += `create trigger ${t.name}_touch before update on public.${t.name} for each row execute function public.touch_updated_at();\n\n`;
}
sql += `-- Access intent per role (enforced in the API layer / RLS later):
--   super_admin, owner   read/write everything, every location
--   manager              read/write at their location; approves PIN-gated actions
--   front_desk           read/write bookings, appointments, daycare, customers, pets, vaccines, payments, messages at their location
--   groomer              read appointments/pets/customers at their location; write own appointments
--   customer             read/write own customers/pets/vaccine_records/bookings/appointments/daycare_bookings/messages; read catalog tables
--   public               read locations, room_types, packages (website)
`;
writeFileSync(new URL('../supabase/schema.sql', import.meta.url), sql);

let md = `# Data model

_Generated from \`src/data/schema/*.ts\` by \`npm run sql\`. The TypeScript files are the source of truth; \`supabase/schema.sql\` is the Postgres draft; this page is the human view. The table library at \`/#/dev/tables\` shows the same with live row counts._

## Principles
- **Location is first class.** Location-scoped tables carry \`location_id\`; front desk and groomer are pinned to one, owner and super admin see all.
- **Same interface, two providers.** Pages call \`useData()\` / \`useTable()\` (\`DataProvider\`: list, get, insert, update, remove, subscribe). \`MockProvider\` (localStorage) today; \`CompanyOsProvider\` (REST \`/t/petrock/api/:entity\`, \`/query\`) later. Swap is one line in \`src/data/DataContext.tsx\`.
- **Prices live in tables.** rates, seasons, discounts, fees, taxes, packages, addons, daycare_pricing feed \`src/pricing/engine.ts\`; pages never hardcode a price.
- **One booking lifecycle.** requested -> pending_vaccines -> confirmed -> checked_in -> checked_out (+ cancelled, no_show) on bookings and daycare_bookings.
- **Money is USD numeric(12,2).**

## Mapping Mock -> Company-OS
| Mock (today) | Company-OS (later) |
| --- | --- |
| \`localStorage['petrock.db.v1']\` | \`records\` rows per entity (JSONB data) |
| table name | entity key |
| \`location_id\` | \`org_unit_id\` |
| \`MockProvider.emit()\` | polling or a realtime channel |
| \`demoUsers\` + \`SessionProvider\` | \`/t/petrock/auth\` + memberships |

## Tables (${tables.length})
`;
for (const g of TABLE_GROUPS) {
  const list = tables.filter((x) => x.group === g.id);
  if (!list.length) continue;
  md += `\n### ${g.label}\n`;
  for (const t of list) {
    md += `\n#### \`${t.name}\` (${t.scope === 'location' ? 'per location' : 'global'})\n${t.description}${t.source ? `  \n_Source: ${t.source}_` : ''}\n\n| column | type | notes |\n| --- | --- | --- |\n`;
    for (const c of [...baseColumns(t), ...t.columns]) md += `| \`${c.name}\` | ${c.type}${c.enum ? ` (${c.enum.join(' \\| ')})` : ''}${c.nullable ? ', null' : ''} | ${c.references ? `-> \`${c.references}\` ` : ''}${c.description ?? ''} |\n`;
    if (t.access?.length) md += `\n**Access:** ${t.access.join('; ')}\n`;
  }
}
md += `\n## Adding a table
1. Add a \`TableDef\` to \`src/data/schema/<area>.ts\` (new file per module; \`index.ts\` globs them) plus a typed row interface.
2. Seed it in \`src/data/seed/<area>.ts\` (exports \`seed(ctx)\`).
3. \`npm run sql\` regenerates \`supabase/schema.sql\` and this file.
4. Reference it in the page's \`PageSpec.data\` so the inspector links to it.
`;
writeFileSync(new URL('../docs/data-model.md', import.meta.url), md);
console.log(`wrote supabase/schema.sql (${tables.length} tables) and docs/data-model.md`);
