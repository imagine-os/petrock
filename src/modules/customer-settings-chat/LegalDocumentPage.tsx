import { useParams } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { LegalDocumentRow } from '../../data/schema/customer-settings-chat';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { MarkdownViewer } from '../../components/organism/MarkdownViewer/MarkdownViewer';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { useCustomerAccount } from './useCustomerAccount';
import { longDate } from './time';
import './customer-settings-chat.css';

/** C-79 Legal document: privacy policy / terms / licences from legal_documents by slug, versioned. */
export function LegalDocumentPage() {
  const { slug } = useParams();
  const { lang } = useCustomerAccount();
  const { rows } = useTable<LegalDocumentRow>('legal_documents', { where: { slug: slug ?? '', published: true } });
  const doc = rows[0];
  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={doc?.title ?? 'Legal'} backTo="/app/about" actions={doc && <Badge size="sm">v{doc.version}</Badge>} />
      <div className="csc-body">
        {doc ? (
          <>
            <p className="csc-note">Effective {longDate(doc.effective_on, lang)}</p>
            <MarkdownViewer source={doc.body.replace(/^# .*\n/, '')} className="prose" />
            <div className="row wrap"><Button variant="secondary" size="sm" icon="download" onClick={() => window.print()}>Save / print</Button></div>
          </>
        ) : (
          <EmptyState icon="book" title="Document not found" body="This legal document is not published yet." />
        )}
      </div>
    </div>
  );
}
