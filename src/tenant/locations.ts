/**
 * The two Petrock locations (R-K01..K04, R-E10..E13). Facts here mirror the seed `locations` and `capacities`
 * rows; pages read from the tables, this file only supplies defaults for the seed and the LocationProvider fallback.
 * Adding a location is a settings flow (A-xx) that inserts a `locations` row; nothing else is hardcoded.
 */
export interface LocationDef {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  city: string;
  address: string;
  phone: string;
  timezone: string;
  /** Weekly hours, 0 = Sunday. `null` = closed. */
  hours: Record<number, { open: string; close: string } | null>;
  capacities: { penthouse: number; suite: number; daycare: number; grooming: number };
}

const WEEK_HOURS: LocationDef['hours'] = {
  0: { open: '09:00', close: '17:30' }, 1: { open: '07:00', close: '19:00' }, 2: { open: '07:00', close: '19:00' }, 3: { open: '07:00', close: '19:00' },
  4: { open: '07:00', close: '19:00' }, 5: { open: '07:00', close: '19:00' }, 6: { open: '09:00', close: '17:30' },
};

export const locations: LocationDef[] = [
  { id: 'loc_encino', slug: 'encino', name: 'Petrock Encino', shortName: 'Encino', city: 'Encino, Los Angeles', address: '17401 Ventura Blvd, Encino, CA 91316', phone: '+1 (818) 555-0142', timezone: 'America/Los_Angeles', hours: WEEK_HOURS, capacities: { penthouse: 12, suite: 42, daycare: 20, grooming: 2 } },
  { id: 'loc_westwood', slug: 'westwood', name: 'Petrock Westwood', shortName: 'Westwood', city: 'Westwood, Los Angeles', address: '10900 Wilshire Blvd, Los Angeles, CA 90024', phone: '+1 (310) 555-0179', timezone: 'America/Los_Angeles', hours: WEEK_HOURS, capacities: { penthouse: 20, suite: 16, daycare: 15, grooming: 2 } },
];

export const DEFAULT_LOCATION_ID = locations[0].id;
export const locationById = (id: string | null | undefined) => locations.find((l) => l.id === id);

export const company = { name: 'Petrock Hotel', legalName: 'Petrock Hotel LLC', website: 'https://petrockhotel.com', tagline: 'Rock Out With Your Paws Out!', currency: 'USD', locale: 'en-US' } as const;
