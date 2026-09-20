import { defineSpec } from '../../specs/defineSpec';
import { EVERYONE } from '../../auth/roles';

export const hubSpec = defineSpec({
  code: 'HUB-01', name: 'Testing hub',
  purpose: 'The front door of the build: a hero band, a floating session bar and audience-grouped cards with a real screenshot of every surface, so anyone can enter the system as the right demo person in one click, and see at a glance what is built, what is a stub and what is only planned.',
  layout: [
    'HubHeader (brand + version, EN / ES, brand theme, light / dark, builder tool)',
    'HeroBand (eyebrow, display title, promise, company tagline, logo art)',
    'SessionBar (floating: RoleSwitcher, LocationSwitcher, builder-tool hint with Ctrl+.)',
    'Group "What a pet parent sees" (customer app feature card with phone thumbnail, public website, sign in & account, book from the website)',
    'Group "Every seat at the hotel" (front desk Encino / Westwood, Grooming & Spa, manager, owner, admin & settings)',
    'Group "How Petrock is built" (tinted band: ops manual, docs & knowledge, dev tools, quality)',
    'Group "See the whole system at once" (compact tool rows; Canvas, Demo simulator and Plan viewer are Placeholders)',
    'StatStrip (routes, built, tables, rules, components, actions, page docs, tasks done) + mock-data note',
  ],
  data: ['users', 'locations'], roles: EVERYONE,
  logic: [
    'Each card carries one control only; the Card container is never clickable, so there are no nested interactives.',
    'Entering a surface calls switchUser(<demo user id>), pins setLocationId when the card is location-bound, then navigates.',
    'The status pill comes from the route manifest: built when the route exists and is not a PageStub, stub when it is, planned when the path is not registered.',
    '"You are here" shows when the card\'s role equals the effective role and the card is that role\'s home (and its location matches).',
    'Thumbnails are static JPEGs from docs/screenshots/<CODE>/thumb[-dark][-<label>].jpg, bundled by import.meta.glob; a missing capture falls back to the light twin and then to a CSS / SVG window wireframe in the card hue.',
    'Page codes only render when the builder tool is on; role and route always show in the card footer.',
    'Footer counts come from getRoutes(), the table and rule registries, the component library, the sum of spec.actions and docs/kanban.md.',
    'Type, spacing, medallions, thumbnails and the content width scale with --hub-scale (1 / 1.375 at 2560 / 1.75 at 3840).',
  ],
  integrations: [],
  components: ['Card', 'Button', 'Badge', 'Icon', 'IconButton', 'Toggle', 'SegmentedControl', 'RoleSwitcher', 'LocationSwitcher', 'StatTile', 'Placeholder'],
  actions: [
    { id: 'hub.enterAs', label: 'Enter a surface as its demo person', intent: 'open a surface as the demo person who works there', params: { surface: 'enum:app,site,auth,book,desk,grooming,reservations,admin,settings,manual,docs,dev,qa', role: 'enum:super_admin,owner,manager,front_desk,groomer,customer,public' } },
    { id: 'hub.openTool', label: 'Open a testing-hub tool', intent: 'open one of the whole-system tools', params: { tool: 'enum:preview,screenshots,routes,specs,components,tables,rules,knowledge,docsSearch,pin,canvas,simulator,plan' } },
    { id: 'hub.setLang', label: 'Change language', intent: 'switch the interface between English and Spanish', params: { lang: 'enum:en,es' } },
    { id: 'hub.toggleTheme', label: 'Toggle light / dark', intent: 'switch between light and dark mode' },
    { id: 'hub.setBrand', label: 'Change brand theme', intent: 'switch the brand palette', params: { brand: 'enum:petrock,sunset' } },
    { id: 'hub.toggleDevMode', label: 'Toggle the builder tool', intent: 'turn the builder tool and its spec chips on or off', permission: 'dev.tools' },
    { id: 'hub.switchLocation', label: 'Change location', intent: 'work in Encino or Westwood', params: { locationId: 'id' } },
  ],
  rules: ['R-K01', 'R-M04'],
  states: ['default', 'dev mode on', 'viewing as another role', 'thumbnails missing (wireframe fallback)'],
  notes: [
    'Not a customer-facing screen; internal testing entry point (hoy pattern).',
    'No live iframes: the old phone preview shared the viewer\'s session and rendered "No access" for a visitor.',
    'Thumbnails are captured by `npm run thumbs`; the page ships correctly before they exist.',
  ],
  checkedAt: [360, 390, 768, 1280, 1920, 2560, 3840],
});

export const noAccessSpec = defineSpec({
  code: 'HUB-02', name: 'No access',
  purpose: 'Friendly page when the current role cannot open a route; offers the hub to switch demo user or the PIN login.',
  layout: ['Illustration', 'Title', 'Body (role name, target route)', 'Actions (hub, PIN login)'], data: ['users'], roles: EVERYONE,
  logic: ['RequireRole redirects here with ?from=<path>.'], integrations: [], components: ['EmptyState', 'Button'], rules: ['R-X88'], states: ['default'], checkedAt: [360, 390, 768, 1280],
});
