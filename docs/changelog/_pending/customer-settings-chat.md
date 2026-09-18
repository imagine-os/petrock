# customer-settings-chat - profile & settings, notification centre, Front Desk chat (C-70..C-84)

version: 0.2.0 (pending merge)
date: 2026-09-18
prompt: 0005
intent: Give the customer app its account side: profile hub, edit profile, app settings (language en/es, dark mode, colour theme), payment methods (tokenised mock cards), notification preferences, app-store legal pages (privacy, terms, licences, delete account), help & support (FAQ, contact, requests), rate the app, plus a best-practice notification centre and Front Desk chat (one thread per location, read receipts, photo attachments, quick replies, typing indicator, demo staff reply).
decision: Pending rows in `docs/decisions/_pending/customer-settings-chat.md` (chat convention, languages en+es, 30-day deletion grace, tokenised cards, notification categories, profile menu). D-018 applied to chat and notifications.
rejected: Five Figma languages (kept en + es until confirmed); inverted chat alignment from the Figma draft; inline email / password editing; "Invite Friend" and "Add Pets" hub items (no referral programme, pets belong to the pets module); voice / video call icons (tel: link instead); storing card numbers (tokens only); a second notification list inside the chat stream (Message Support-2) - system events stay in the notification centre.
files: src/modules/customer-settings-chat/** (15 pages, specs.ts, strings, time.ts, useCustomerAccount.ts, chatMock.ts, ConversationList.tsx, css), src/components/molecule/{CustomerScreenHeader,AccountMenuRow,AccountProfileHero,ChatMessageBubble,ChatComposer,ChatConversationRow,NotificationRow,PaymentCardTile}/**, src/components/atom/{ChatTimelineMarker,StarRatingInput,PasswordStrengthBar}/**, src/data/schema/customer-settings-chat.ts (7 tables), src/data/seed/customer-settings-chat.ts, src/rules/customer-settings-chat.ts (15 rules), scripts/screenshots-customer-settings-chat.mjs, scripts/flows-customer-settings-chat.mjs, docs/pages/C-70..C-84.md, docs/screenshots/C-70..C-84/**, docs/decisions/_pending/customer-settings-chat.md, supabase/schema.sql + docs/data-model.md + docs/specs.md + docs/screenshots/routes.json (regenerated)
codes: C-70, C-71, C-72, C-73, C-74, C-75, C-76, C-77, C-78, C-79, C-80, C-81, C-82, C-83, C-84

## What exists now

- **Routes** (customer surface, PhoneShell, roles customer + super admin preview): `/app/profile` (C-70, bottom-nav **Settings**), `/app/profile/edit` (C-71), `/app/settings` (C-72), `/app/settings/language` (C-73), `/app/payment-methods` (C-74), `/app/settings/notifications` (C-75), `/app/settings/delete-account` (C-76), `/app/help` (C-77), `/app/about` (C-78), `/app/legal/:slug` (C-79), `/app/notifications` (C-80), `/app/inbox` (C-81, bottom-nav **Chat**), `/app/inbox/:conversationId` (C-82), `/app/rate` (C-83), `/app/settings/password` (C-84). Every route has a full PageSpec (completeness 100 % in D-03) with `checkedAt: [360, 390, 768, 1280, 1920]`.
- **Components (11, all with metas and usages)**: CustomerScreenHeader, AccountMenuRow, AccountProfileHero, ChatMessageBubble, ChatComposer, ChatConversationRow, NotificationRow (+ `NOTIFICATION_KIND_ICON` map), PaymentCardTile (+ `CARD_BRAND_LABEL`), ChatTimelineMarker, StarRatingInput, PasswordStrengthBar (+ `passwordChecks` / `passwordScore`).
- **Tables (7)**: `payment_methods`, `notification_prefs`, `account_deletion_requests`, `legal_documents`, `faq_items`, `support_requests` (location-scoped), `chat_quick_replies`. Seed: two saved cards for Avery, prefs, three legal documents (markdown), nine FAQs, nine quick replies (customer + staff), a Westwood thread, four extra Encino messages including an inline-SVG photo, five extra notifications, one resolved support request.
- **Rules (15)**: R-M01, R-M06, R-M07, R-M08, R-M10, R-M11 (from the design doc) and new R-M20..R-M28 (thread per location, deletion grace, tokenised cards, notification prefs, read receipts, bubble convention, languages, rate-the-app review, attachments).
- **i18n**: every module label has en + es (`strings` in `useCustomerAccount.ts`); C-73 switches the app and persists `users.preferred_language`.
- **Account resolution**: `useCustomerAccount()` maps the session user to its `customers` row; staff previewing the customer app see the demo customer with a "Previewing as" chip and read-only chat.
- **Demo staff reply**: `chatMock.ts` answers each customer message after ~3 s (typing indicator, canned copy, photo on request, never a price). Delete it when F-61 / realtime lands.

## Verification

- `npm run typecheck` and `npm run build` green.
- `node scripts/screenshots-customer-settings-chat.mjs`: 15 routes x 5 widths (360, 390, 768, 1280, 1920), no console errors, no horizontal overflow, no redirects; screenshots 390 + 1280 for every code, 390-dark for C-70, C-72, C-74, C-80, C-82, plus `C-82/390-after-send.jpg` and `C-72/390-es.jpg`.
- `node scripts/flows-customer-settings-chat.mjs`: 13 interaction checks pass (send + mock reply + Seen receipt, inbox row, language -> es, dark mode, add card -> default, mark all read, delete-account gating and disabled CTA, review submitted, support request listed).

## Notes for the integrator

- `src/rules/operations.ts` (shared, not edited): set **R-M03 implemented** (pages C-72, C-73; implementedIn `LanguagePage.tsx`), **R-M05 implemented** (pages C-72, C-76), and add **C-81, C-82** to R-M09 `pages`.
- Core seed (`src/data/seed/core.ts`) stamps today's messages at fixed clock times (13:07-13:35); before 1:35 PM local those sit "in the future" and sort after this module's messages. Consider stamping core chat times relative to `now` (bump `SEED_VERSION`).
- The PhoneShell BottomNav renders `nav.label` verbatim (no `t()`), so the Chat / Settings tab labels are English only.
- `My pets` on C-70 links to `/app/pets`, owned by customer-home-pets; `Forgot password?` on C-84 links to `/auth/forgot`, owned by customer-auth.
- The staff side of chat (F-61) and the support_requests inbox belong to extras-manual-website / admin; they read the same tables (`conversations`, `messages`, `support_requests`).
- Regenerated files (`supabase/schema.sql`, `docs/data-model.md`, `docs/specs.md`, `docs/screenshots/routes.json`) will conflict with other modules: rerun `npm run sql`, `npm run screenshots`, `npm run specs` after merging.
