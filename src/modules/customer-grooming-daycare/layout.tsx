import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Stepper } from '../../components/molecule/Stepper/Stepper';
import { Modal } from '../../components/organism/Modal/Modal';
import { Button } from '../../components/atom/Button/Button';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import './cgd.css';

export const GROOMING_STEPS = ['Pet & package', 'Add-ons', 'Date & time', 'Pay'];
export const DAYCARE_STEPS = ['Pets & day', 'Pet details', 'Pay'];

/** Page frame shared by the module: header with back link, optional stepper, body. Composes library components only. */
export function CgdPage({ title, subtitle, backTo, steps, step, onStep, actions, children }: { title: string; subtitle?: ReactNode; backTo?: string; steps?: string[]; step?: number; onStep?: (i: number) => void; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="cgd">
      <CustomerScreenHeader title={title} subtitle={subtitle} backTo={backTo ?? null} actions={actions} />
      {steps && step != null && <div className="cgd-steps"><Stepper steps={steps} current={step} onStepClick={onStep} compact /></div>}
      <div className="cgd-body">{children}</div>
    </div>
  );
}

export function Notice({ tone = 'info', icon, children }: { tone?: 'info' | 'warn' | 'success'; icon?: IconName; children: ReactNode }) {
  return <div className={`cgd-notice is-${tone}`} role={tone === 'warn' ? 'alert' : undefined}><Icon name={icon ?? (tone === 'warn' ? 'warning' : tone === 'success' ? 'check' : 'info')} size={16} /><span>{children}</span></div>;
}

/** R-A01: booking needs at least one pet on the account. */
export function NoPetsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  return (
    <Modal open={open} onClose={onClose} title="Hey!" size="alert" footer={<><Button variant="ghost" onClick={onClose}>Back</Button><Button onClick={() => nav('/app/pets/new')}>Add a Pet</Button></>}>
      <p>To Book An Appointment Please 1st Add A Pet</p>
    </Modal>
  );
}
