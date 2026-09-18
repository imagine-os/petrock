import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSession } from '../auth/SessionProvider';
import { ALL_LOCATION_ROLES } from '../auth/roles';
import { demoUserByRole } from '../auth/demoUsers';
import { useTable } from '../data/DataContext';
import type { LocationRow } from '../data/schema/core';
import { DEFAULT_LOCATION_ID } from './locations';

interface LocationCtx {
  /** Every active location (from the `locations` table). */
  locations: LocationRow[];
  /** The location the UI is working in. Never null: staff are pinned, others fall back to the first. */
  location: LocationRow;
  locationId: string;
  /** True when the current role may switch and see all locations (owner, super admin). */
  canSwitch: boolean;
  /** Owner/super admin "all locations" mode for lists and reports. */
  allLocations: boolean;
  setLocationId: (id: string) => void;
  setAllLocations: (on: boolean) => void;
  /** Filter helper: a `where` for location-scoped tables ({} when allLocations). */
  scope: Record<string, unknown>;
}

const Ctx = createContext<LocationCtx | null>(null);
export const LOCATION_KEY = 'petrock.location';

function read(): { locationId: string; all: boolean } {
  try { const raw = localStorage.getItem(LOCATION_KEY); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  return { locationId: DEFAULT_LOCATION_ID, all: false };
}

/** Must sit inside SessionProvider and DataProviderRoot. Front desk / groomer / manager are pinned to their location. */
export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, role, viewAs } = useSession();
  const { rows } = useTable<LocationRow>('locations', { orderBy: { column: 'sort_order' } });
  const [state, setState] = useState(read);
  useEffect(() => { try { localStorage.setItem(LOCATION_KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);

  const canSwitch = ALL_LOCATION_ROLES.includes(role);
  // A super admin viewing as a pinned role is pinned where that role's demo user works (not the super admin's own null location).
  const pinned = !canSwitch ? (viewAs ? demoUserByRole(viewAs).locationId ?? user.locationId : user.locationId) : null;
  const active = rows.filter((l) => l.active !== false);
  const locationId = (pinned && active.some((l) => l.id === pinned) ? pinned : null) ?? (active.some((l) => l.id === state.locationId) ? state.locationId : active[0]?.id ?? DEFAULT_LOCATION_ID);
  const location = active.find((l) => l.id === locationId) ?? ({ id: locationId, name: 'Location', short_name: 'Location' } as unknown as LocationRow);
  const allLocations = canSwitch && state.all;

  const setLocationId = useCallback((id: string) => setState((s) => ({ ...s, locationId: id, all: false })), []);
  const setAllLocations = useCallback((all: boolean) => setState((s) => ({ ...s, all })), []);
  const value = useMemo<LocationCtx>(() => ({ locations: active, location, locationId, canSwitch, allLocations, setLocationId, setAllLocations, scope: allLocations ? {} : { location_id: locationId } }),
    [active, location, locationId, canSwitch, allLocations, setLocationId, setAllLocations]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocation(): LocationCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLocation outside LocationProvider');
  return v;
}
