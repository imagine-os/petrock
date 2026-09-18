import { useTheme } from '../../design/ThemeProvider';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { AccountMenuRow } from '../../components/molecule/AccountMenuRow/AccountMenuRow';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

export const LANGUAGE_LABEL: Record<string, string> = { en: 'English', es: 'Español' };

/** C-72 Settings (Figma setting.jpg): Language (purple translate icon), Change password (coral lock), Dark mode (purple moon + toggle, R-M04), Delete account (coral trash, R-M05); notifications, payment methods and colour theme keep their rows; no header rule. */
export function AppSettingsPage() {
  const { theme, setTheme, brand, setBrand, brands } = useTheme();
  const { t, lang } = useCustomerAccount();
  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('settings.title'))} backTo="/app/profile" rule={false} />
      <div className="csc-body is-flush">
        <div className="csc-list">
          <AccountMenuRow icon="globe" label={t(k('settings.language'))} value={LANGUAGE_LABEL[lang]} to="/app/settings/language" tone="primary" />
          <AccountMenuRow icon="lock" label={t(k('settings.password'))} to="/app/settings/password" tone="accent" />
          <AccountMenuRow icon="moon" label={t(k('settings.dark'))} tone="primary" trailing={<Toggle size="sm" checked={theme === 'dark'} onChange={(on) => setTheme(on ? 'dark' : 'light')} />} />
          <AccountMenuRow icon="bell" label={t(k('profile.notifications'))} to="/app/settings/notifications" tone="accent" />
          <AccountMenuRow icon="card" label={t(k('profile.payments'))} to="/app/payment-methods" tone="primary" />
          <AccountMenuRow icon="palette" label={t(k('settings.brand'))} tone="accent" trailing={<SegmentedControl size="sm" ariaLabel={t(k('settings.brand'))} value={brand} onChange={(b) => setBrand(b as typeof brand)} options={brands.map((b) => ({ value: b, label: b === 'petrock' ? 'Petrock' : 'Sunset' }))} />} />
          <AccountMenuRow icon="trash" label={t(k('settings.delete'))} tone="accent" to="/app/settings/delete-account" />
        </div>
        <p className="csc-version">Petrock {t(k('settings.version'))} {__APP_VERSION__}</p>
      </div>
    </div>
  );
}
