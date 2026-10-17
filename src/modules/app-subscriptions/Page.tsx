import { directoryStrings } from '../../shared/subscriptions/strings';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { DirectoryPanel } from '../../shared/subscriptions/DirectoryPanel';
import { defineSpec } from '../../specs/defineSpec';
import type { RouteDef } from '../../specs/types';
const spec = defineSpec({code:'A-28a',checkedAt:[390,768,1280,1920,3840],name:'Apps & subscriptions',purpose:'Workspace app dependencies and manual subscription expense tracking.',roles:['owner','super_admin'],layout:['Storage notice','Estimates and actuals','Directory','Possible integrations','Charge history'],data:[],components:['DirectoryPanel'],logic:['Browser-local workspace records; no server persistence.','Unknown is distinct from zero; currencies never combined.','Actual charge references deduplicate per subscription.'],integrations:['Email: DISCONNECTED','Bank: DISCONNECTED'],states:['empty','editing','saved','storage failure','conflict'],notes:['Portable contract in src/shared/subscriptions/model.ts. CompanyOS persistence is not implemented.'],actions:[{id:'subscriptions.app',label:'Add or edit app',intent:'Record an app dependency',permission:'settings.write'},{id:'subscriptions.subscription',label:'Add or edit subscription',intent:'Record expected subscription cost and owner',permission:'settings.write'},{id:'subscriptions.charge',label:'Record charge',intent:'Record a charge with evidence',permission:'settings.write'},{id:'subscriptions.search',label:'Find app',intent:'Find a workspace app dependency'}]});
function AppSubscriptionsPage() {
  const {can}=useSession();
  const {t}=useI18n();
  return <DirectoryPanel text={s=>t('subscriptions.'+s)} workspaceId="petrock" workspaceName="PetRock" canRead={can('settings.write')} canWrite={can('settings.write')} candidates={[
    {key:'email',name:'Email provider',purpose:'Booking confirmations and receipts; outbound provider seam only.'},
    {key:'sms',name:'SMS provider',purpose:'Arrival and pickup reminders; outbound provider seam only.'},
    {key:'push',name:'Push provider',purpose:'Customer app notifications; outbound provider seam only.'},
    {key:'stripe',name:'Stripe',purpose:'Payment processing adapter stub; not evidence of a subscription.'},
    {key:'companyos',name:'CompanyOS',purpose:'REST data adapter seam; not a connected production backend.'},
  ]} />;
}
export const routes: RouteDef[]=[{path:'/admin/subscriptions',element:<AppSubscriptionsPage />,spec,roles:spec.roles,surface:'admin',layout:'desktop',nav:{label:'subscriptions.Apps & subscriptions',icon:'globe',order:61,group:'settings'}}];
export const strings=directoryStrings;
