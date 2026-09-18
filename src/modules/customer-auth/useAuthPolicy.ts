import { useMemo } from 'react';
import { useData, useTable } from '../../data/DataContext';
import type { SettingRow } from '../../data/schema/core';
import { AUTH_POLICY_KEY, DEFAULT_AUTH_POLICY, type AuthPolicy } from '../../data/schema/customer-auth';

/** Live auth policy from settings (key auth.policy) with defaults; plus whether the demo hints may show (mock provider only). */
export function useAuthPolicy(): { policy: AuthPolicy; isMock: boolean } {
  const data = useData();
  const { rows } = useTable<SettingRow>('settings', { where: { key: AUTH_POLICY_KEY } });
  const policy = useMemo(() => ({ ...DEFAULT_AUTH_POLICY, ...((rows[0]?.value as Partial<AuthPolicy> | undefined) ?? {}) }), [rows]);
  return { policy, isMock: data.name === 'mock' };
}
