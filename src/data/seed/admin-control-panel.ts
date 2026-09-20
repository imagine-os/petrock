/** Seed for the admin-control-panel module: three provider stubs, one export log row, a few audit rows so A-38 has history. */
import type { SeedCtx } from './index';
import { addDays, at } from './rng';

export const order = 50;

export function seed(ctx: SeedCtx) {
  const { add, now } = ctx;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const D = (n: number) => addDays(today, n);

  add('providers', { id: 'prv_email', kind: 'email', name: 'Petrock Hotel', provider: 'none', from_address: 'hello@petrockhotel.com', config: { host: null, port: null }, secret_masked: null, status: 'not_configured', last_test_at: null, last_test_result: null, enabled: false });
  add('providers', { id: 'prv_sms', kind: 'sms', name: 'Petrock', provider: 'none', from_address: null, config: { sender_id: 'PETROCK' }, secret_masked: null, status: 'not_configured', last_test_at: null, last_test_result: null, enabled: false });
  add('providers', { id: 'prv_push', kind: 'push', name: 'Petrock app', provider: 'none', from_address: null, config: { platforms: ['ios', 'android'] }, secret_masked: null, status: 'not_configured', last_test_at: null, last_test_result: null, enabled: false });

  add('backups', { id: 'bkp_1', kind: 'manual', file_name: `petrock-export-${D(-7).toISOString().slice(0, 10)}.json`, table_count: 41, row_count: 512, size_bytes: 318_204, created_by: 'usr_owner', created_by_name: 'Jordan Blake', note: 'Before the seasonal rate change' });

  add('audit_log', { id: 'aud_acp_1', location_id: null, user_id: 'usr_owner', user_name: 'Jordan Blake', action: 'update', table_name: 'rates', row_id: 'rate_rt_penthouse_weekend_sea_summer', diff: { price_per_night: [155, 160] }, created_at: at(D(-7), 10, 12), updated_at: at(D(-7), 10, 12) });
  add('audit_log', { id: 'aud_acp_2', location_id: null, user_id: 'usr_owner', user_name: 'Jordan Blake', action: 'update', table_name: 'fees', row_id: 'fee_card', diff: { percent: [3.8, 3.89] }, created_at: at(D(-5), 15, 40), updated_at: at(D(-5), 15, 40) });
  add('audit_log', { id: 'aud_acp_3', location_id: 'loc_westwood', user_id: 'usr_owner', user_name: 'Jordan Blake', action: 'insert', table_name: 'employees', row_id: 'emp_jessica', diff: { name: [null, 'Jessica Moreno'], job_title: [null, 'Groomer'] }, created_at: at(D(-3), 9, 5), updated_at: at(D(-3), 9, 5) });
  add('audit_log', { id: 'aud_acp_4', location_id: 'loc_encino', user_id: 'usr_super', user_name: 'Sam Rivera', action: 'update', table_name: 'capacities', row_id: 'cap_encino_daycare', diff: { max_simultaneous: [18, 20] }, created_at: at(D(-1), 17, 22), updated_at: at(D(-1), 17, 22) });
}
