import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../data/DataContext';
import type { ReviewRow } from '../../data/schema/core';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { StarRatingInput } from '../../components/atom/StarRatingInput/StarRatingInput';
import { Chip } from '../../components/atom/Chip/Chip';
import { Input } from '../../components/atom/Input/Input';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

export const REVIEW_TAGS = ['Excellent', 'Amazing', 'Normal', 'Not good'] as const;
const STAR_HINT = ['', 'We are sorry to hear that', 'Could be better', 'Good', 'Great', 'Excellent!'];

/** C-83 Rate the app: stars + tags + comment -> reviews (pending, R-M27 / R-M12); store prompt follows with Capacitor. */
export function RateAppPage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const acc = useCustomerAccount();
  const { t, customer } = acc;
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const toggle = (tg: string) => setTags((xs) => (xs.includes(tg) ? xs.filter((x) => x !== tg) : [...xs, tg]));
  const submit = async () => {
    if (!stars || !customer) return;
    setBusy(true);
    try {
      await data.insert<ReviewRow>('reviews', { location_id: customer.home_location_id ?? null, customer_id: customer.id, rating: stars, title: title.trim() || null, body: body.trim() || null, tags: tags.length ? tags : null, status: 'pending' });
      setDone(true);
      toast(t(k('rate.thanks')));
    } finally { setBusy(false); }
  };
  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('rate.title'))} backTo="/app/profile" />
      <div className="csc-body">
        {done ? (
          <EmptyState icon="star" title={t(k('rate.thanks'))} body={t(k('rate.thanks.body'))} action={<div className="row wrap" style={{ justifyContent: 'center' }}><Button variant="secondary" onClick={() => nav('/app/profile')}>Done</Button><Button icon="external" onClick={() => toast({ tone: 'info', title: 'App Store review', body: 'Opens the store review sheet once the app is packaged with Capacitor.' })}>Rate on the store</Button></div>} />
        ) : (
          <>
            <Card>
              <div className="csc-rate-stars">
                <h3>{t(k('rate.question'))}</h3>
                <StarRatingInput value={stars} onChange={setStars} size={44} />
                <p className="small muted" aria-live="polite">{STAR_HINT[stars] || 'Tap a star'}</p>
              </div>
            </Card>
            <div className="stack-sm">
              <p className="small" style={{ fontWeight: 500 }}>{t(k('rate.tags'))}</p>
              <div className="csc-tags">{REVIEW_TAGS.map((tg) => <Chip key={tg} selected={tags.includes(tg)} tone="primary" onClick={() => toggle(tg)}>{tg}</Chip>)}</div>
            </div>
            <Input label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
            <Textarea label={t(k('rate.comment'))} value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={600} showCount />
            <p className="csc-note">Reviews are read by the owner before they appear on our website. Your name is shown as first name and last initial.</p>
            <div className="csc-sticky-cta"><Button block size="lg" onClick={submit} loading={busy} disabled={!stars || !customer}>{t(k('rate.submit'))}</Button></div>
          </>
        )}
      </div>
    </div>
  );
}
