import { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atom/Button/Button';
import { Select } from '../../atom/Select/Select';
import { Textarea } from '../../atom/Textarea/Textarea';
import { Icon } from '../../atom/Icon/Icon';
import { useToast } from '../../molecule/Toast/Toast';
import { useData } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import './FeedbackButton.css';

export interface FeedbackButtonProps { pageCode: string; route: string }
const CATS = [{ value: 'idea', label: 'Idea' }, { value: 'bug', label: 'Something is broken' }, { value: 'question', label: 'Question' }, { value: 'praise', label: 'Praise' }];

/** Floating "Feedback" button on every staff page; writes to the `feedback` table with page code and route. The owner reads the inbox. */
export function FeedbackButton({ pageCode, route }: FeedbackButtonProps) {
  const data = useData();
  const { user, role } = useSession();
  const { locationId } = useLocation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('idea');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    await data.insert('feedback', { location_id: locationId, user_id: user.id, user_name: user.name, role, page_code: pageCode, route, category: cat, text: text.trim(), status: 'new', owner_reply: null });
    setBusy(false); setOpen(false); setText('');
    toast({ tone: 'success', title: 'Thanks for the feedback', body: `Sent from ${pageCode}` });
  };
  return (
    <>
      <button type="button" className="feedbackbtn" onClick={() => setOpen(true)} aria-label="Leave feedback"><Icon name="feedback" size={18} /><span className="feedbackbtn-label">Feedback</span></button>
      <Modal open={open} onClose={() => setOpen(false)} title="Leave feedback" size="sm" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={send} loading={busy} disabled={!text.trim()}>Send</Button></>}>
        <div className="stack">
          <p className="muted small">About this page: <code>{pageCode}</code> <span className="faint">{route}</span></p>
          <Select label="Type" value={cat} onChange={(e) => setCat(e.target.value)} options={CATS} />
          <Textarea label="What would make this better?" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} showCount rows={4} placeholder="Tell us what happened or what you'd like." />
        </div>
      </Modal>
    </>
  );
}
