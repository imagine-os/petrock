import type { ReactNode } from 'react';
import { Modal } from '../Modal/Modal';
import { OtpVerifyPanel, type OtpVerifyPanelProps } from '../../molecule/OtpVerifyPanel/OtpVerifyPanel';

export interface OtpVerifyModalProps extends Omit<OtpVerifyPanelProps, 'children'> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
}

/** The OTP Verify modal from the older Figma sections (D-010): OtpVerifyPanel in a small Modal. Opens over sign-in when the email is not verified yet. */
export function OtpVerifyModal({ open, onClose, title = 'Verify your email', children, ...panel }: OtpVerifyModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" closeOnScrim={false}>
      {open && <OtpVerifyPanel {...panel}>{children}</OtpVerifyPanel>}
    </Modal>
  );
}
