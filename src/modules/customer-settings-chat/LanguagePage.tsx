import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import type { Lang } from '../../i18n/types';
import { useData } from '../../data/DataContext';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { RadioGroup } from '../../components/atom/Radio/Radio';
import { Button } from '../../components/atom/Button/Button';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

const OPTIONS: { value: Lang; label: string; native: string; flag: string }[] = [
  { value: 'en', label: 'English', native: 'English (US)', flag: '🇺🇸' },
  { value: 'es', label: 'Español', native: 'Spanish', flag: '🇲🇽' },
];

/** C-73 Language: single-select with explicit Save (R-M03); en + es for now (R-M26); saved on the device and on users.preferred_language. */
export function LanguagePage() {
  const nav = useNavigate();
  const data = useData();
  const { lang, setLang } = useI18n();
  const { toast } = useToast();
  const acc = useCustomerAccount();
  const { t } = acc;
  const [choice, setChoice] = useState<Lang>(lang);
  const save = async () => {
    setLang(choice);
    if (acc.userRow) await data.update('users', acc.userRow.id, { preferred_language: choice });
    toast(choice === 'es' ? 'Idioma guardado' : 'Language saved');
    nav('/app/settings');
  };
  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('lang.title'))} backTo="/app/settings" align="start" />
      <div className="csc-body">
        <p className="small muted">{t(k('lang.choose'))}</p>
        <RadioGroup<Lang> cards value={choice} onChange={setChoice} options={OPTIONS.map((o) => ({ value: o.value, label: <span className="row"><span className="csc-langflag" aria-hidden>{o.flag}</span>{o.label}</span>, description: o.native }))} />
        <p className="csc-note">{t(k('lang.more'))}</p>
        <div className="csc-sticky-cta"><Button block size="lg" onClick={save} disabled={choice === lang}>{t(k('lang.save'))}</Button></div>
      </div>
    </div>
  );
}
