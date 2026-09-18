import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';

export default defineMeta({
  tier: 'template', name: 'DesktopShell', description: 'Front desk / admin / dev / docs page frame: per-role categorised Sidebar (from routes with nav), TopBar with location and user menu, content, FeedbackButton. Rail mode on desktop, overlay drawer under 900 px, checked at 360-1920.',
  props: [{ name: 'surfaces', type: 'Surface[]', required: true, description: 'Which surfaces feed the menu' }, { name: 'routes', type: 'RouteDef[]', required: true, description: 'All routes' }, { name: 'title', type: 'string', required: true, description: 'Surface title' }, { name: 'feedback', type: 'boolean', default: 'true', description: 'Mount the FeedbackButton' }],
  states: ['sidebar expanded', 'rail', 'narrow drawer'],
  usages: [{ title: 'This page is rendered inside DesktopShell', render: () => h('p', { className: 'muted small' }, 'Look around: the sidebar, top bar and feedback button on this page are the DesktopShell. Resize the window under 900 px to see the drawer.') }],
  a11y: ['main landmark with id="main"; sidebar and top bar are their own landmarks.'],
  usedBy: ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-06', 'D-07'],
});
