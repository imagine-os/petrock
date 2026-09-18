import { useTheme } from '../../design/ThemeProvider';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { AccountMenuRow } from '../../components/molecule/AccountMenuRow/AccountMenuRow';
import { Card } from '../../components/molecule/Card/Card';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

export const LANGUAGE_LABEL: Record<string, string> = { en: 'English', es: 'Español' };

/** C-72 App settings: language, dark mode (R-M04), colour theme, notifications, password, payment methods, delete account (R-M05). */
export function AppSettingsPage() {
  const { theme, setTheme, brand, setBrand, brands } = useTheme();
  const { t, lang } = useCustomerAccount();
  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('settings.title'))} backTo="/app/profile" />
      <div className="csc-body">
        <div className="csc-group">
          <p className="eyebrow csc-group-title">{t(k('settings.appearance'))}</p>
          <Card padding="none">
            <AccountMenuRow icon="globe" label={t(k('settings.language'))} value={LANGUAGE_LABEL[lang]} to="/app/settings/language" />
            <AccountMenuRow icon="moon" label={t(k('settings.dark'))} trailing={<Toggle checked={theme === 'dark'} onChange={(on) => setTheme(on ? 'dark' : 'light')} />} />
            <AccountMenuRow icon="palette" label={t(k('settings.brand'))} trailing={<SegmentedControl size="sm" ariaLabel={t(k('settings.brand'))} value={brand} onChange={(b) => setBrand(b as typeof brand)} options={brands.map((b) => ({ value: b, label: b === 'petrock' ? 'Petrock' : 'Sunset' }))} />} />
          </Card>
        </div>
        <div className="csc-group">
          <p className="eyebrow csc-group-title">{t(k('settings.account'))}</p>
          <Card padding="none">
            <AccountMenuRow icon="bell" label={t(k('profile.notifications'))} to="/app/settings/notifications" />
            <AccountMenuRow icon="lock" label={t(k('edit.changePassword'))} to="/app/settings/password" />
            <AccountMenuRow icon="card" label={t(k('profile.payments'))} to="/app/payment-methods" />
            <AccountMenuRow icon="trash" label={t(k('settings.delete'))} description={t(k('settings.delete.desc'))} tone="danger" to="/app/settings/delete-account" />
          </Card>
        </div>
        <p className="csc-version">Petrock {t(k('settings.version'))} {__APP_VERSION__}</p>
      </div>
    </div>
  );
}
