/**
 * Demo-only: pretends the Front Desk answers. Company-OS replaces this with real staff replies (F-61) over the same
 * conversations / messages tables. Never quotes a price (R-M10): prices live in the pricing tables.
 */
import type { DataProvider } from '../../data/provider';
import type { ConversationRow, MessageRow } from '../../data/schema/core';
import { DEMO_PHOTO_URL } from '../../data/seed/customer-settings-chat';

export function mockStaffReply(text: string, petName: string, locationName: string, hours: string | null): { text: string; image?: string } {
  const s = text.toLowerCase();
  if (/(photo|picture|pic|video)/.test(s)) return { text: `Here is ${petName} from a few minutes ago.`, image: DEMO_PHOTO_URL };
  if (/(pick.?up|what time|hours|open|close)/.test(s)) return { text: hours ? `Pick-up is any time we are open today (${hours}). Just message us when you are 10 minutes out.` : 'Pick-up is any time during opening hours. Just message us when you are 10 minutes out.' };
  if (/late/.test(s)) return { text: `No problem at all, ${petName} is happy here. See you when you arrive.` };
  if (/(groom|spa|bath|nails)/.test(s)) return { text: `We generally do grooms at the end of hotel stays. I can add one for ${petName} - the estimate in the app shows the price for their size.` };
  if (/(how is|how's|doing|today)/.test(s)) return { text: `${petName} is doing great today - ate everything and has been out for two walks already.` };
  return { text: `Thanks! The ${locationName} team will get back to you shortly.` };
}

/** Marks the customer's messages as seen, then posts the staff reply and updates the thread (unread_customer + 1). */
export async function deliverMockReply(data: DataProvider, conv: ConversationRow, mine: MessageRow[], reply: { text: string; image?: string }, staffUserId: string) {
  await Promise.all(mine.filter((m) => !m.read).map((m) => data.update('messages', m.id, { read: true })));
  const now = new Date().toISOString();
  await data.insert<MessageRow>('messages', { conversation_id: conv.id, sender: 'staff', sender_user_id: staffUserId, text: reply.text, image_url: reply.image ?? null, sent_at: now, read: false });
  await data.update('conversations', conv.id, { last_message_at: now, last_preview: reply.text, unread_customer: (conv.unread_customer ?? 0) + 1, unread_staff: 0 });
}
