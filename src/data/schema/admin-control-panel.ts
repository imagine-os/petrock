/**
 * Tables owned by the admin-control-panel module (A-01..A-49): outbound providers (email / SMS / push stubs) and the
 * backup / export log. Everything else the Control Panel edits already lives in core (locations, capacities, rooms,
 * rates, discounts, fees, taxes, packages, addons, daycare_pricing, services, employees, roles, permissions, settings).
 */
import { defineTables, type BaseRow } from './types.ts';

export const PROVIDER_KINDS = ['email', 'sms', 'push'] as const;
export const PROVIDER_STATUS = ['not_configured', 'configured', 'test_ok', 'error'] as const;
export const BACKUP_KINDS = ['manual', 'scheduled'] as const;

export const tables = defineTables([
  { name: 'providers', label: 'Providers', description: 'Outbound channel configuration: email (None / Gmail / SMTP), SMS (None / Twilio / Petlinx), push (None / FCM / APNs). Secrets are masked; test-send is a stub until an integration exists.', group: 'system', scope: 'global', titleColumn: 'name', source: '5.pdf, R-M13', access: ['owner write', 'super_admin write'],
    columns: [
      { name: 'kind', type: 'enum', enum: PROVIDER_KINDS }, { name: 'name', type: 'text', description: 'Display name (email From name, SMS sender name)' }, { name: 'provider', type: 'text', description: 'none | gmail | smtp | twilio | petlinx | fcm | apns' },
      { name: 'from_address', type: 'text', nullable: true }, { name: 'config', type: 'json', wide: true, nullable: true, description: 'Non-secret settings (host, port, sender id)' }, { name: 'secret_masked', type: 'text', nullable: true, description: 'Last 4 of the API key; the real secret never lives in the mock' },
      { name: 'status', type: 'enum', enum: PROVIDER_STATUS }, { name: 'last_test_at', type: 'timestamptz', nullable: true }, { name: 'last_test_result', type: 'text', nullable: true }, { name: 'enabled', type: 'bool' },
    ] },
  { name: 'backups', label: 'Backups & exports', description: 'Log of JSON exports of the mock database (A-43). Each row records who exported, how many tables / rows and the file size.', group: 'system', scope: 'global', titleColumn: 'file_name', source: 'project brief (backups / export)', access: ['owner read/write', 'super_admin read/write'],
    columns: [
      { name: 'kind', type: 'enum', enum: BACKUP_KINDS }, { name: 'file_name', type: 'text' }, { name: 'table_count', type: 'int' }, { name: 'row_count', type: 'int' }, { name: 'size_bytes', type: 'int' },
      { name: 'created_by', type: 'uuid', references: 'users', nullable: true }, { name: 'created_by_name', type: 'text', nullable: true }, { name: 'note', type: 'text', nullable: true },
    ] },
]);

export interface ProviderRow extends BaseRow { kind: (typeof PROVIDER_KINDS)[number]; name: string; provider: string; from_address: string | null; config: Record<string, unknown> | null; secret_masked: string | null; status: (typeof PROVIDER_STATUS)[number]; last_test_at: string | null; last_test_result: string | null; enabled: boolean }
export interface BackupRow extends BaseRow { kind: (typeof BACKUP_KINDS)[number]; file_name: string; table_count: number; row_count: number; size_bytes: number; created_by: string | null; created_by_name: string | null; note: string | null }
