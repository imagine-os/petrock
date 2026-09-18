import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { SegmentedControl } from '../../../components/molecule/SegmentedControl/SegmentedControl';

const VIEWS = [{ value: '/desk/grooming', label: 'Day', icon: 'calendar' as const }, { value: '/desk/grooming/board', label: 'Board', icon: 'grid' as const }, { value: '/desk/grooming/agenda', label: 'Agenda', icon: 'list' as const }];

/** Day / Board / Agenda toggle shared by F-30, F-31, F-32; keeps the ?day= query. */
export function GroomingViewToggle({ day }: { day: string }) {
  const nav = useNavigate();
  const { pathname } = useRouterLocation();
  return <SegmentedControl size="sm" ariaLabel="Grooming view" options={VIEWS} value={VIEWS.find((v) => v.value === pathname)?.value ?? '/desk/grooming'} onChange={(v) => nav(`${v}?day=${day}`)} />;
}

export function useDayParam(): [string, (d: string) => void] {
  const nav = useNavigate();
  const { search, pathname } = useRouterLocation();
  const params = new URLSearchParams(search);
  const today = new Date(); const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const day = /^\d{4}-\d{2}-\d{2}$/.test(params.get('day') ?? '') ? params.get('day')! : iso;
  return [day, (d) => { const p = new URLSearchParams(search); p.set('day', d); nav(`${pathname}?${p.toString()}`, { replace: true }); }];
}
