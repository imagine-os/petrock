import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './FormAlert.css';

export type FormAlertTone = 'danger' | 'warn' | 'info' | 'success';
export interface FormAlertProps { tone?: FormAlertTone; title?: ReactNode; children?: ReactNode; action?: ReactNode; icon?: IconName; className?: string }
const ICON: Record<FormAlertTone, IconName> = { danger: 'warning', warn: 'warning', info: 'info', success: 'check' };

/** Inline message above or below a form: friendly error, hint or success, with an optional action link. role=alert for danger. */
export function FormAlert({ tone = 'info', title, children, action, icon, className = '' }: FormAlertProps) {
  return (
    <div className={`formalert formalert-${tone} ${className}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon name={icon ?? ICON[tone]} size={18} className="formalert-icon" />
      <div className="formalert-text">{title && <div className="formalert-title">{title}</div>}{children && <div className="formalert-body">{children}</div>}{action && <div className="formalert-action">{action}</div>}</div>
    </div>
  );
}
