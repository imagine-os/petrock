import { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atom/Button/Button';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './OnboardingIntroModal.css';

export interface OnboardingSlide { icon: IconName; title: string; body: string }
export interface OnboardingIntroModalProps {
  open: boolean;
  onClose: () => void;
  slides?: OnboardingSlide[];
  /** Label of the last slide's button. */
  doneLabel?: string;
  onDone?: () => void;
}

export const DEFAULT_ONBOARDING_SLIDES: OnboardingSlide[] = [
  { icon: 'paw', title: 'Add your dogs', body: 'Create a profile for each dog: breed, weight, food, meds and the little things that make them happy.' },
  { icon: 'shield', title: 'Upload vaccines once', body: 'Snap Rabies, DHPP and Bordetella records. Our team verifies them and reminds you before they expire.' },
  { icon: 'bed', title: 'Book hotel, Grooming & Spa or Daycare', body: 'Pick Encino or Westwood, choose dates, see the price up front and pay a deposit or in full.' },
];

/** First-run "how Petrock works" carousel: three slides with dots, Skip, Next and a final action. Shown once on C-01 and again from C-08. */
export function OnboardingIntroModal({ open, onClose, slides = DEFAULT_ONBOARDING_SLIDES, doneLabel = 'Get started', onDone }: OnboardingIntroModalProps) {
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  const close = () => { setI(0); onClose(); };
  const s = slides[i];
  return (
    <Modal open={open} onClose={close} size="sm" className="onboard" closeOnScrim={false}
      footer={<><Button variant="ghost" onClick={close}>{last ? 'Close' : 'Skip'}</Button><Button onClick={() => { if (last) { close(); onDone?.(); } else setI(i + 1); }} iconRight={last ? undefined : 'arrow-right'}>{last ? doneLabel : 'Next'}</Button></>}>
      {s && (
        <div className="onboard-slide" key={i} aria-live="polite">
          <div className="onboard-art"><Icon name={s.icon} size={40} /></div>
          <h2 className="onboard-title">{s.title}</h2>
          <p className="onboard-body">{s.body}</p>
        </div>
      )}
      <div className="onboard-dots" role="tablist" aria-label="Slides">
        {slides.map((sl, k) => <button key={sl.title} type="button" role="tab" aria-selected={k === i} aria-label={`Slide ${k + 1}: ${sl.title}`} className={`onboard-dot ${k === i ? 'is-on' : ''}`} onClick={() => setI(k)} />)}
      </div>
    </Modal>
  );
}
