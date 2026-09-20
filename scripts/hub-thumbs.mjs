// Captures hub-card thumbnails: one fixed page per hub card, dev mode OFF, viewport-only (no full-page scroll).
// Output: docs/screenshots/<CODE>/thumb[-dark][-<label>].jpg
// Usage: npm run thumbs [-- --codes=C-10,P-01] [-- --theme=light|dark|both] [-- --quality=68] [-- --port=4173]
//   --codes=A,B  only these hub-card codes (matches the CODE below, not the route's spec code)
//   --theme      light | dark | both (default both)
//   --quality    JPEG quality (default 68)
//   --port       preview port (default 4173, env QA_PORT); QA_NO_SERVER=1 reuses a server already running
// Chromium is preinstalled at /opt/pw-browsers; PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1; never run `playwright install`.
import { mkdirSync } from 'node:fs';
import { arg, list, startPreview, launch, initScript, fillParams, NOISE } from './qa-lib.mjs';

const args = process.argv.slice(2);
const CODES = list(arg(args, 'codes'));
const THEME = arg(args, 'theme', 'both');
const QUALITY = Number(arg(args, 'quality', '68'));
const PORT = Number(arg(args, 'port', process.env.QA_PORT ?? '4173'));
const BASE = `http://localhost:${PORT}/#`;
const THEMES = THEME === 'both' ? ['light', 'dark'] : [THEME];
const safe = (code) => code.replace(/[^\w-]/g, '_');

// One entry per hub card. kind picks the viewport; label distinguishes a second capture of the same code.
const THUMBS = [
  { code: 'C-10', path: '/app', kind: 'phone', userId: 'usr_customer' },
  { code: 'C-02', path: '/auth/sign-in', kind: 'phone', userId: 'usr_public' },
  { code: 'P-01', path: '/site', kind: 'desktop', userId: 'usr_public' },
  { code: 'P-10', path: '/site/book', kind: 'desktop', userId: 'usr_public' },
  { code: 'F-01', path: '/desk', kind: 'desktop', userId: 'usr_desk', locationId: 'loc_encino' },
  { code: 'F-01', path: '/desk', kind: 'desktop', userId: 'usr_desk_ww', locationId: 'loc_westwood', label: 'westwood' },
  { code: 'F-30', path: '/desk/grooming', kind: 'desktop', userId: 'usr_groomer', locationId: 'loc_encino' },
  { code: 'F-10', path: '/desk/reservations', kind: 'desktop', userId: 'usr_manager', locationId: 'loc_encino' },
  { code: 'A-01', path: '/admin', kind: 'desktop', userId: 'usr_owner' },
  { code: 'A-44', path: '/admin/settings', kind: 'desktop', userId: 'usr_super' },
  { code: 'M-01', path: '/manual', kind: 'desktop', userId: 'usr_owner' },
  { code: 'D-06', path: '/docs', kind: 'desktop', userId: 'usr_super' },
  { code: 'D-01', path: '/dev/tokens', kind: 'desktop', userId: 'usr_super' },
  { code: 'D-12', path: '/dev/qa/responsive', kind: 'desktop', userId: 'usr_super' },
];

const VIEWPORT = { desktop: { width: 1280, height: 800 }, phone: { width: 390, height: 844 } };
const fileName = (theme, label = '') => `thumb${theme === 'dark' ? '-dark' : ''}${label ? `-${label}` : ''}.jpg`;

/** Overwrites the location init script's location entry after initScript has set the rest. */
function locationOverride(locationId) {
  return [(loc) => { localStorage.setItem('petrock.location', JSON.stringify({ locationId: loc, all: false })); }, [locationId]];
}

async function main() {
  const filtered = CODES.length ? THUMBS.filter((t) => CODES.includes(t.code)) : THUMBS;
  const server = await startPreview(PORT);
  const browser = await launch();
  console.log(`${filtered.length} thumbs · ${THEMES.join('/')} · jpeg q${QUALITY}`);
  const problems = [];
  let captured = 0;
  for (const t of filtered) {
    for (const theme of THEMES) {
      const ctx = await browser.newContext({ viewport: VIEWPORT[t.kind], deviceScaleFactor: 1 });
      await ctx.addInitScript(...initScript(theme, t.path, { devMode: false, userId: t.userId }));
      await ctx.addInitScript(...locationOverride(t.locationId ?? 'loc_encino'));
      const page = await ctx.newPage();
      await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push(m.text()); });
      try {
        await page.goto(`${BASE}${fillParams(t.path)}`, { waitUntil: 'load', timeout: 20000 });
        await page.waitForSelector('#root > *', { timeout: 10000 });
        await page.waitForTimeout(600);
        const dir = new URL(`../docs/screenshots/${safe(t.code)}/`, import.meta.url);
        mkdirSync(dir, { recursive: true });
        await page.screenshot({ path: new URL(fileName(theme, t.label), dir).pathname, fullPage: false, type: 'jpeg', quality: QUALITY });
        captured++;
      } catch (e) { errors.push(String(e.message).split('\n')[0]); }
      if (errors.length) problems.push({ code: t.code, label: t.label, theme, errors: [...new Set(errors)].slice(0, 3) });
      await ctx.close();
    }
    process.stdout.write(`${t.code.padEnd(8)} ${t.path}${t.label ? ` (${t.label})` : ''}\n`);
  }
  await browser.close();
  server.kill();
  if (problems.length) { console.log('\nPROBLEMS:'); for (const p of problems) console.log(`  ${p.code}${p.label ? `/${p.label}` : ''} [${p.theme}]`, p.errors.join(' | ')); }
  else console.log(`\nno console errors · ${captured} files`);
  process.exit(problems.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
