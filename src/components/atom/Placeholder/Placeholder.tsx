import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { useT } from '../../../i18n/I18nProvider';
import { useToast } from '../../molecule/Toast/Toast';
import './Placeholder.css';

export interface PlaceholderProps {
  /** The control that is not wired yet (a button, a link, a whole card). */
  children?: ReactNode;
  /** What is missing, in the user's words; falls back to "This control". */
  what?: string;
  className?: string;
}

/**
 * D-201 / D-202: wraps UI that is designed but not wired. Shows "Not wired yet" on hover AND on focus (never
 * hover-only), swallows the activation (click, Enter, Space) and answers with an info toast instead, and in the
 * builder tool (`devMode`) marks itself permanently with a dashed outline and a badge. Sets `data-placeholder`
 * so the QA scripts and the spec report can count unwired controls.
 */
export function Placeholder({ children, what, className = '' }: PlaceholderProps) {
  const t = useT();
  const { devMode } = useSession();
  const { toast } = useToast();
  const title = t('placeholder.notWired');
  const subject = what ?? t('placeholder.thisControl');

  const block = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({ tone: 'info', title, body: t('placeholder.hint', { what: subject }) });
  };

  return (
    <span className={`placeholder ${devMode ? 'is-dev' : ''} ${className}`} data-placeholder={subject} title={`${title} — ${t('placeholder.hint', { what: subject })}`}
      onClickCapture={block} onKeyDownCapture={(e) => { if (e.key === 'Enter' || e.key === ' ') block(e); }}>
      {children}
      <span className="placeholder-tip" role="tooltip">{title}</span>
      {devMode && <span className="placeholder-badge">{title}</span>}
    </span>
  );
}
