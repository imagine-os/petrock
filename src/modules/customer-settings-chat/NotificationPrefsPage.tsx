import { useEffect, useMemo, useRef } from 'react';
import { useData, useTable } from '../../data/DataContext';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_CATEGORY_LABEL, type NotificationPrefRow } from '../../data/schema/customer-settings-chat';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Icon } from '../../components/atom/Icon/Icon';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

const DEFAULTS: Record<string, { push: boolean; email: boolean; sms: boolean }> = { bookings: { push: true, email: true, sms: true }, vaccines: { push: true, email: true, sms: false }, chat: { push: true, email: false, sms: false }, payments: { push: true, email: true, sms: false }, promotions: { push: false, email: false, sms: false } };

/** C-75 Notification preferences: category x channel matrix saved per toggle (R-M23); missing rows are created with defaults. */
export function NotificationPrefsPage() {
  const data = useData();
  const acc = useCustomerAccount();
  const { t, lang } = acc;
  const { rows } = useTable<NotificationPrefRow>('notification_prefs', { where: { user_id: acc.accountUserId } });
  const byCat = useMemo(() => Object.fromEntries(rows.map((r) => [r.category, r])), [rows]);
  const seeded = useRef<string | null>(null);
  useEffect(() => {
    if (seeded.current === acc.accountUserId) return;
    const missing = NOTIFICATION_CATEGORIES.filter((c) => !byCat[c]);
    if (rows.length === 0 && missing.length) { seeded.current = acc.accountUserId; missing.forEach((c) => data.insert('notification_prefs', { user_id: acc.accountUserId, category: c, ...DEFAULTS[c] })); }
  }, [rows.length, byCat, acc.accountUserId, data]);

  const set = async (cat: string, ch: 'push' | 'email' | 'sms', on: boolean) => {
    const row = byCat[cat];
    if (row) await data.update('notification_prefs', row.id, { [ch]: on }); else await data.insert('notification_prefs', { user_id: acc.accountUserId, category: cat, ...DEFAULTS[cat], [ch]: on });
  };
  const channels: ('push' | 'email' | 'sms')[] = ['push', 'email', 'sms'];
  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('prefs.title'))} backTo="/app/settings" />
      <div className="csc-body">
        <Card padding="none">
          <div className="csc-prefs-head"><span /> {channels.map((c) => <span key={c} className="csc-prefs-cell eyebrow">{t(k(`prefs.${c}`))}</span>)}</div>
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const row = byCat[cat];
            const lbl = NOTIFICATION_CATEGORY_LABEL[cat];
            return (
              <div key={cat} className="csc-prefs-row">
                <div className="stack-sm" style={{ gap: 0 }}><span className="small" style={{ fontWeight: 500 }}>{lang === 'es' ? lbl.es : lbl.en}</span><span className="xs muted">{lang === 'es' ? lbl.hint.es : lbl.hint.en}</span></div>
                {channels.map((ch) => <span key={ch} className="csc-prefs-cell"><Toggle size="sm" checked={row ? row[ch] : DEFAULTS[cat][ch]} onChange={(on) => set(cat, ch, on)} label={<span className="sr-only">{`${lbl.en} ${ch}`}</span>} /></span>)}
              </div>
            );
          })}
        </Card>
        <p className="csc-note row" style={{ alignItems: 'flex-start' }}><Icon name="info" size={14} /> {t(k('prefs.note'))}</p>
      </div>
    </div>
  );
}
