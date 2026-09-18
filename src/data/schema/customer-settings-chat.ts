/**
 * Tables owned by the customer-settings-chat module (C-70..C-89): saved payment methods, notification preferences,
 * account deletion requests (app-store requirement), legal documents, FAQ items, support requests and chat quick replies.
 * Conversations, messages, notifications, reviews and customers live in core.ts.
 */
import { defineTables, type BaseRow, type ColumnDef } from './types.ts';

const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const bool = (name: string, description?: string): ColumnDef => ({ name, type: 'bool', description });
const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const en = (name: string, values: readonly string[], nullable = false): ColumnDef => ({ name, type: 'enum', enum: values, nullable });

export const PAYMENT_METHOD_TYPES = ['card', 'cash'] as const;
export const CARD_BRANDS = ['visa', 'mastercard', 'amex', 'discover', 'other'] as const;
export const NOTIFICATION_CATEGORIES = ['bookings', 'vaccines', 'chat', 'payments', 'promotions'] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];
export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, { en: string; es: string; hint: { en: string; es: string } }> = {
  bookings: { en: 'Bookings & stays', es: 'Reservas y estancias', hint: { en: 'Confirmations, check-in reminders, photo updates', es: 'Confirmaciones, recordatorios de entrada, fotos' } },
  vaccines: { en: 'Vaccines', es: 'Vacunas', hint: { en: 'Expiring records, verification results', es: 'Vencimientos y verificaciones' } },
  chat: { en: 'Front Desk chat', es: 'Chat con recepción', hint: { en: 'New messages from the desk', es: 'Mensajes nuevos de recepción' } },
  payments: { en: 'Payments & receipts', es: 'Pagos y recibos', hint: { en: 'Deposits, receipts, refunds', es: 'Depósitos, recibos, reembolsos' } },
  promotions: { en: 'Offers & news', es: 'Ofertas y novedades', hint: { en: 'App-user offers, new services', es: 'Ofertas para la app, servicios nuevos' } },
};
export const DELETION_STATUS = ['requested', 'cancelled', 'completed'] as const;
export const DELETION_REASONS = ['moving', 'no_longer_needed', 'privacy', 'too_many_notifications', 'other'] as const;
export const LEGAL_KINDS = ['privacy', 'terms', 'licenses', 'other'] as const;
export const SUPPORT_TOPICS = ['booking', 'payment', 'vaccines', 'app', 'other'] as const;
export const SUPPORT_STATUS = ['new', 'open', 'resolved'] as const;

export const tables = defineTables([
  { name: 'payment_methods', label: 'Saved payment methods', description: 'Cards a customer saved in the app. Only brand, last4, expiry and the provider token are stored (mock now; Stripe PaymentMethod ids later).', group: 'commerce', scope: 'global', titleColumn: 'last4', source: 'entities 16, Payment-1.png, R-M22',
    columns: [ref('customer_id', 'customers'), en('type', PAYMENT_METHOD_TYPES), en('brand', CARD_BRANDS, true), text('last4', true), { name: 'exp_month', type: 'int', nullable: true }, { name: 'exp_year', type: 'int', nullable: true }, text('holder_name', true), text('billing_zip', true), bool('is_default'), text('provider', false, 'mock | stripe'), text('provider_token', true, 'Tokenised reference; never a PAN'), en('status', ['active', 'expired', 'removed'])] },
  { name: 'notification_prefs', label: 'Notification preferences', description: 'Per user per category: push / email / SMS on or off (C-75).', group: 'comms', scope: 'global', source: 'setting.jpg, R-M23',
    columns: [ref('user_id', 'users'), en('category', NOTIFICATION_CATEGORIES), bool('push'), bool('email'), bool('sms')] },
  { name: 'account_deletion_requests', label: 'Account deletion requests', description: 'App-store requirement: a customer can request deletion; 30-day grace period, then anonymisation (R-M21).', group: 'system', scope: 'global', source: 'setting.jpg, Frame 1171276432.png, R-M05',
    columns: [ref('user_id', 'users'), ref('customer_id', 'customers', true), en('reason', DELETION_REASONS, true), text('details', true), en('status', DELETION_STATUS), { name: 'requested_at', type: 'timestamptz' }, { name: 'scheduled_for', type: 'date', description: 'Day the data is anonymised unless cancelled' }, { name: 'completed_at', type: 'timestamptz', nullable: true }] },
  { name: 'legal_documents', label: 'Legal documents', description: 'Privacy policy, terms of service and open-source licences shown in the app (C-79); versioned markdown.', group: 'system', scope: 'global', titleColumn: 'title', source: 'app-store requirements (build plan phase 5)',
    columns: [text('slug'), text('title'), en('kind', LEGAL_KINDS), text('version'), { name: 'effective_on', type: 'date' }, { name: 'body', type: 'text', wide: true, description: 'Markdown' }, bool('published')] },
  { name: 'faq_items', label: 'FAQ items', description: 'Help & support questions and answers grouped by topic (C-77).', group: 'comms', scope: 'global', titleColumn: 'question', source: 'profile.jpg (Help)',
    columns: [text('question'), { name: 'answer', type: 'text', wide: true }, en('topic', SUPPORT_TOPICS), { name: 'sort_order', type: 'int' }, bool('active')] },
  { name: 'support_requests', label: 'Support requests', description: 'Help form submissions from the app; the front desk / owner answers them (C-77).', group: 'comms', scope: 'location', source: 'profile.jpg (Help)',
    columns: [ref('customer_id', 'customers', true), ref('user_id', 'users'), text('user_name'), text('email', true), en('topic', SUPPORT_TOPICS), { name: 'message', type: 'text', wide: true }, en('status', SUPPORT_STATUS), text('staff_reply', true)] },
  { name: 'chat_quick_replies', label: 'Chat quick replies', description: 'Canned messages offered above the chat composer for customers and staff (C-82, F-61).', group: 'comms', scope: 'global', titleColumn: 'text', source: 'D-018 (chat best practices)',
    columns: [en('audience', ['customer', 'staff']), text('text', false, 'May contain {pet} placeholder'), { name: 'sort_order', type: 'int' }, bool('active')] },
]);

export interface PaymentMethodRow extends BaseRow { customer_id: string; type: 'card' | 'cash'; brand: (typeof CARD_BRANDS)[number] | null; last4: string | null; exp_month: number | null; exp_year: number | null; holder_name: string | null; billing_zip: string | null; is_default: boolean; provider: string; provider_token: string | null; status: 'active' | 'expired' | 'removed' }
export interface NotificationPrefRow extends BaseRow { user_id: string; category: NotificationCategory; push: boolean; email: boolean; sms: boolean }
export interface AccountDeletionRequestRow extends BaseRow { user_id: string; customer_id: string | null; reason: (typeof DELETION_REASONS)[number] | null; details: string | null; status: (typeof DELETION_STATUS)[number]; requested_at: string; scheduled_for: string; completed_at: string | null }
export interface LegalDocumentRow extends BaseRow { slug: string; title: string; kind: (typeof LEGAL_KINDS)[number]; version: string; effective_on: string; body: string; published: boolean }
export interface FaqItemRow extends BaseRow { question: string; answer: string; topic: (typeof SUPPORT_TOPICS)[number]; sort_order: number; active: boolean }
export interface SupportRequestRow extends BaseRow { customer_id: string | null; user_id: string; user_name: string; email: string | null; topic: (typeof SUPPORT_TOPICS)[number]; message: string; status: (typeof SUPPORT_STATUS)[number]; staff_reply: string | null }
export interface ChatQuickReplyRow extends BaseRow { audience: 'customer' | 'staff'; text: string; sort_order: number; active: boolean }

/** Core rows with the extra columns this module reads (core.ts keeps its own narrower interfaces). */
export interface AccountUserRow extends BaseRow { name: string; email: string; role: string; location_id: string | null; phone: string | null; avatar_url: string | null; active: boolean; preferred_language: string | null }
export interface AccountCustomerRow extends BaseRow { user_id: string | null; first_name: string; last_name: string; email: string; mobile: string; alt_phone: string | null; address: string | null; apt_suite: string | null; city: string | null; state: string | null; zip: string | null; status: string; preferred_contact: string | null; home_location_id: string | null; marketing_opt_in: boolean; note: string | null; balance: number }
