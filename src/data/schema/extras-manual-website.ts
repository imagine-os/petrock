/**
 * Tables owned by the extras-manual-website module: public website content and inquiries, staff training progress
 * (education), the dog-walking log and the management task list. Globbed by src/data/schema/index.ts.
 */
import { defineTables, type BaseRow } from './types.ts';

export const tables = defineTables([
  { name: 'site_faqs', label: 'Website FAQs', description: 'Questions and answers shown on the public website (P-11) grouped by topic; owners edit them here instead of in code.', group: 'comms', scope: 'global', titleColumn: 'question', source: 'extras-manual-website (P-11)', access: ['everyone read', 'owner write'],
    columns: [
      { name: 'topic', type: 'enum', enum: ['hotel', 'grooming', 'daycare', 'vaccines', 'payments', 'general'] },
      { name: 'question', type: 'text' }, { name: 'answer', type: 'text', wide: true },
      { name: 'sort_order', type: 'int' }, { name: 'published', type: 'bool' },
    ] },
  { name: 'site_inquiries', label: 'Website inquiries', description: 'Contact-form submissions from the public website (P-10): who wrote, about what, for which location, and whether staff replied.', group: 'comms', scope: 'location', titleColumn: 'name', source: 'extras-manual-website (P-10)', access: ['public insert', 'staff read/write'],
    columns: [
      { name: 'name', type: 'text' }, { name: 'email', type: 'text' }, { name: 'phone', type: 'text', nullable: true },
      { name: 'topic', type: 'enum', enum: ['hotel', 'grooming', 'daycare', 'in_home', 'other'] },
      { name: 'message', type: 'text', wide: true },
      { name: 'status', type: 'enum', enum: ['new', 'seen', 'replied', 'closed'] },
      { name: 'replied_by', type: 'uuid', references: 'users', nullable: true }, { name: 'replied_at', type: 'timestamptz', nullable: true },
    ] },
  { name: 'training_completions', label: 'Training completions', description: 'Which ops-manual chapter each employee has completed (Education, F-66): one row per employee per chapter, with the lesson mode and who signed it off.', group: 'people', scope: 'location', source: 'extras-manual-website (F-66, M-xx)', access: ['staff read own', 'manager write'],
    columns: [
      { name: 'employee_id', type: 'uuid', references: 'employees' }, { name: 'user_id', type: 'uuid', references: 'users', nullable: true },
      { name: 'chapter_slug', type: 'text', description: 'File name of the chapter in docs/ops-manual/en' }, { name: 'chapter_code', type: 'text', description: 'Manual page code (M-xx)' },
      { name: 'mode', type: 'enum', enum: ['in_person', 'online'] },
      { name: 'completed_at', type: 'timestamptz' }, { name: 'signed_off_by', type: 'uuid', references: 'employees', nullable: true }, { name: 'note', type: 'text', nullable: true },
    ] },
  { name: 'walks', label: 'Dog walks', description: 'Walk log (Walking, F-67): which pet was walked by which handler, when, for how long, and how it went. Feeds the daycare "Walk" item later.', group: 'daycare', scope: 'location', source: 'extras-manual-website (F-67); front desk-7.jpg (Walk $12)', access: ['staff read/write', 'customer read own (later)'],
    columns: [
      { name: 'pet_id', type: 'uuid', references: 'pets' }, { name: 'handler_id', type: 'uuid', references: 'employees', nullable: true },
      { name: 'booking_id', type: 'uuid', references: 'bookings', nullable: true }, { name: 'daycare_booking_id', type: 'uuid', references: 'daycare_bookings', nullable: true },
      { name: 'started_at', type: 'timestamptz' }, { name: 'duration_min', type: 'int' },
      { name: 'status', type: 'enum', enum: ['planned', 'in_progress', 'done', 'skipped'] },
      { name: 'potty', type: 'bool', nullable: true }, { name: 'note', type: 'text', nullable: true },
    ] },
  { name: 'tasks', label: 'Tasks', description: 'Management task list (F-68): to-dos per location with assignee, due date, priority and status; the "Tasks" and "Check List" items of the Figma sidebar.', group: 'people', scope: 'location', titleColumn: 'title', source: 'extras-manual-website (F-68); education-1.jpg (Tasks shell), employees-1.jpg (Check List)', access: ['staff read/write', 'manager delete (PIN)'],
    columns: [
      { name: 'title', type: 'text' }, { name: 'description', type: 'text', nullable: true, wide: true },
      { name: 'assignee_id', type: 'uuid', references: 'employees', nullable: true }, { name: 'created_by', type: 'uuid', references: 'users', nullable: true },
      { name: 'due_on', type: 'date', nullable: true },
      { name: 'priority', type: 'enum', enum: ['low', 'normal', 'high'] },
      { name: 'status', type: 'enum', enum: ['open', 'in_progress', 'done'] },
      { name: 'kind', type: 'enum', enum: ['task', 'checklist'] }, { name: 'completed_at', type: 'timestamptz', nullable: true },
    ] },
]);

export interface SiteFaqRow extends BaseRow { topic: string; question: string; answer: string; sort_order: number; published: boolean }
export interface SiteInquiryRow extends BaseRow { name: string; email: string; phone: string | null; topic: string; message: string; status: string; replied_by: string | null; replied_at: string | null }
export interface TrainingCompletionRow extends BaseRow { employee_id: string; user_id: string | null; chapter_slug: string; chapter_code: string; mode: 'in_person' | 'online'; completed_at: string; signed_off_by: string | null; note: string | null }
export interface WalkRow extends BaseRow { pet_id: string; handler_id: string | null; booking_id: string | null; daycare_booking_id: string | null; started_at: string; duration_min: number; status: string; potty: boolean | null; note: string | null }
export interface TaskRow extends BaseRow { title: string; description: string | null; assignee_id: string | null; created_by: string | null; due_on: string | null; priority: 'low' | 'normal' | 'high'; status: 'open' | 'in_progress' | 'done'; kind: 'task' | 'checklist'; completed_at: string | null }
