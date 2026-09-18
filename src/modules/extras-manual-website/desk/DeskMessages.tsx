import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useData, useTable } from '../../../data/DataContext';
import type { SiteInquiryRow } from '../../../data/schema/extras-manual-website';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { Badge, toneFor } from '../../../components/atom/Badge/Badge';
import { Button } from '../../../components/atom/Button/Button';
import { relativeTime } from '../../../components/molecule/StaffNotificationRow/StaffNotificationRow';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import './extras.css';

/** F-61 Website inquiries: contact-form submissions for this location, marked seen / replied / closed by the desk (R-X72). The customer chat inbox is F-57 (/desk/messages). */
export function DeskMessagesPage() {
  const data = useData();
  const { user } = useSession();
  const { scope } = useLocation();
  const { rows: inquiries } = useTable<SiteInquiryRow>('site_inquiries', { where: scope, orderBy: { column: 'created_at', dir: 'desc' } });
  const newInq = inquiries.filter((i) => i.status === 'new').length;
  const setInq = (row: SiteInquiryRow, status: string) => data.update('site_inquiries', row.id, { status, replied_by: status === 'replied' ? user.id : row.replied_by, replied_at: status === 'replied' ? new Date().toISOString() : row.replied_at });
  return (
    <div className="container ex-page">
      <PageHeader code="F-61" title="Website inquiries" subtitle={`Contact-form messages from the public website for this location. ${newInq} new. Customer chat lives in the Inbox (F-57).`} />
      <Card padding="none">
        <DataTable<SiteInquiryRow> rows={inquiries} rowKey={(r) => r.id} searchable pageSize={20} emptyText="No website inquiries for this location"
          filters={[{ key: 'status', label: 'Status', options: ['new', 'seen', 'replied', 'closed'].map((s) => ({ value: s, label: s })), test: (r, v) => r.status === v }]}
          columns={[
            { key: 'created_at', label: 'Received', render: (r) => <span title={r.created_at}>{relativeTime(r.created_at)}</span>, width: 120 },
            { key: 'name', label: 'From', render: (r) => <div className="stack-sm" style={{ gap: 0 }}><strong>{r.name}</strong><span className="xs muted">{r.email}{r.phone ? ` · ${r.phone}` : ''}</span></div> },
            { key: 'topic', label: 'About', render: (r) => <Badge size="sm">{r.topic.replace('_', ' ')}</Badge>, width: 120 },
            { key: 'message', label: 'Message', render: (r) => <span className="small">{r.message}</span> },
            { key: 'status', label: 'Status', render: (r) => <Badge size="sm" tone={toneFor(r.status)}>{r.status}</Badge>, width: 100 },
          ]}
          rowActions={(r) => <div className="row" style={{ gap: 4 }}>{r.status === 'new' && <Button size="sm" variant="ghost" onClick={() => void setInq(r, 'seen')}>Seen</Button>}{r.status !== 'replied' && r.status !== 'closed' && <Button size="sm" variant="secondary" onClick={() => void setInq(r, 'replied')}>Replied</Button>}{r.status !== 'closed' && <Button size="sm" variant="ghost" onClick={() => void setInq(r, 'closed')}>Close</Button>}</div>} />
      </Card>
    </div>
  );
}
