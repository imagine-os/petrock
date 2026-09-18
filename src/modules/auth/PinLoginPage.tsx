import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { useTable } from '../../data/DataContext';
import type { EmployeeRow, UserRow, LocationRow } from '../../data/schema/core';
import { demoPinHolders, findByPin, type PinHolder } from '../../auth/pin';
import { ROLE_HOME, ROLE_LABEL, type Role } from '../../auth/roles';
import { Card } from '../../components/molecule/Card/Card';
import { PinPad } from '../../components/molecule/PinPad/PinPad';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { useToast } from '../../components/molecule/Toast/Toast';
import './auth.css';

/** A-00 staff PIN login: 4-6 digits, matched against employees.pin_hash (+ demo holders), then ROLE_HOME. */
export function PinLoginPage() {
  const nav = useNavigate();
  const { switchUser } = useSession();
  const { toast } = useToast();
  const { rows: employees } = useTable<EmployeeRow>('employees');
  const { rows: users } = useTable<UserRow>('users');
  const { rows: locations } = useTable<LocationRow>('locations');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const holders = useMemo<PinHolder[]>(() => {
    const fromEmployees = employees.filter((e) => e.pin_hash && e.status === 'active').map((e) => { const u = users.find((x) => x.id === e.user_id); return { userId: e.user_id ?? e.id, name: e.name, role: (u?.role ?? 'front_desk') as Role, pinHash: e.pin_hash!, locationId: e.location_id ?? null }; });
    const ids = new Set(fromEmployees.map((h) => h.userId));
    return [...fromEmployees, ...demoPinHolders.filter((h) => !ids.has(h.userId))];
  }, [employees, users]);

  const submit = async (pin: string) => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 300));
    const h = findByPin(pin, holders);
    if (!h) { setError('PIN not recognised. Try again.'); setBusy(false); return; }
    if (!users.some((u) => u.id === h.userId) && !demoPinHolders.some((d) => d.userId === h.userId)) { setError(`${h.name.split(' ')[0]} has no login yet - ask a manager to create one in Employees (A-30).`); setBusy(false); return; }
    switchUser(h.userId);
    const loc = locations.find((l) => l.id === h.locationId);
    toast({ tone: 'success', title: `Welcome, ${h.name.split(' ')[0]}`, body: `${ROLE_LABEL[h.role]}${loc ? ` · ${loc.short_name}` : ''}` });
    nav(ROLE_HOME[h.role]);
  };

  return (
    <div className="pinlogin">
      <Card className="pinlogin-card" padding="lg">
        <div className="pinlogin-brand"><img src="./brand/petrock-mark.svg" alt="" width={44} height={44} /><div><h1>Staff sign in</h1><p className="muted small">Enter your PIN to open your desk.</p></div></div>
        <PinPad onSubmit={submit} error={error} busy={busy} label="Your PIN" />
        <p className="xs faint pinlogin-help"><Icon name="info" size={12} /> Demo PINs: 0000 super admin · 1111 owner · 2222 manager · 3333 Encino desk · 4444 Westwood desk · 5555 groomer</p>
        <div className="row wrap" style={{ justifyContent: 'center' }}><Link to="/"><Button variant="ghost" size="sm" icon="arrow-left">Testing hub</Button></Link><Link to="/auth/sign-in"><Button variant="link" size="sm">Customer sign in</Button></Link></div>
      </Card>
    </div>
  );
}
