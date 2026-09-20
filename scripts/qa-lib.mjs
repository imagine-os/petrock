// Shared helpers for scripts/screenshots.mjs, qa-responsive.mjs: preview server, chromium, manifest.
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { chromium } from 'playwright';

export const arg = (args, name, def = '') => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
export const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

export function findChromium() {
  try { const dir = readdirSync('/opt/pw-browsers').find((d) => /^chromium-\d+/.test(d)); if (dir) return `/opt/pw-browsers/${dir}/chrome-linux/chrome`; } catch { /* fall through */ }
  return process.env.CHROMIUM_PATH;
}

/** Starts `vite preview` on `port` and resolves once it answers. Returns { kill }. Set QA_NO_SERVER=1 to reuse one already running. */
export async function startPreview(port, timeoutMs = 20000) {
  if (process.env.QA_NO_SERVER) return { kill() {} };
  try { await fetch(`http://localhost:${port}/`); throw new Error(`something already answers on :${port} (another preview server?) - pass --port=<free port> or QA_NO_SERVER=1 to reuse it`); } catch (e) { if (!(e instanceof TypeError)) throw e; /* connection refused = free */ }
  const server = spawn(process.execPath, [new URL('../node_modules/vite/bin/vite.js', import.meta.url).pathname, 'preview', '--port', String(port), '--strictPort'], { stdio: 'pipe' });
  let err = '';
  server.stderr.on('data', (d) => { err += d; });
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try { const r = await fetch(`http://localhost:${port}/`); if (r.ok) return { kill: () => server.kill() }; } catch { /* not yet */ }
    if (server.exitCode != null) throw new Error(`vite preview exited (${server.exitCode}): ${err.slice(0, 300)} - run npm run build first?`);
    await new Promise((r) => setTimeout(r, 250));
  }
  server.kill();
  throw new Error(`vite preview did not answer on :${port} within ${timeoutMs} ms`);
}

export async function launch() { return chromium.launch({ executablePath: findChromium(), args: ['--no-sandbox'] }); }

/** Reads window.__petrock.routes with retries; de-duplicated by path. */
export async function fetchManifest(browser, base, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    const ctx = await browser.newContext();
    try {
      const page = await ctx.newPage();
      await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      await page.goto(`${base}/`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForFunction(() => window.__petrock?.routes?.length > 0, null, { timeout: 15000 });
      const routes = await page.evaluate(() => window.__petrock.routes);
      return routes.filter((r, k, a) => a.findIndex((x) => x.path === r.path) === k);
    } catch (e) { last = e; await new Promise((r) => setTimeout(r, 1000)); } finally { await ctx.close(); }
  }
  throw new Error(`could not read the route manifest after ${attempts} attempts: ${last?.message}`);
}

export const PARAMS = { ':table': 'bookings', ':code': 'D-03', ':id': 'bk_1001', ':petId': 'pet_1', ':customerId': 'cus_1', ':slug': 'privacy-policy', ':conversationId': 'conv_1', '*': '' };
export const fillParams = (path) => path.replace(/:\w+|\*/g, (p) => PARAMS[p] ?? 'x').replace(/\/$/, '') || '/';
export const routeFilter = (only, codes) => (r) => (!only.length || only.some((p) => (p.endsWith('$') ? r.path === p.slice(0, -1) : r.path === p || r.path.startsWith(p.endsWith('/') ? p : `${p}/`)))) && (!codes.length || codes.includes(r.code));
export const NOISE = /Failed to load resource|ERR_CERT|fonts\.g(oogleapis|static)|net::|favicon/;

/** Demo user per surface (D-016 brief: customer routes as the customer, staff routes as the super admin, dev mode off). */
export function userFor(path) {
  if (path.startsWith('/app')) return 'usr_customer';
  if (path.startsWith('/site') || path === '/' || path.startsWith('/no-access') || path.startsWith('/staff')) return 'usr_public';
  return 'usr_super';
}

/**
 * Init script for a QA context: theme, session (per surface, devMode off unless `devMode`), location, and the three customer
 * wizard drafts (hotel, grooming, daycare) so C-31..C-36, C-52..C-54, C-62 / C-63 render their own step instead of redirecting.
 */
export function initScript(theme, path = '/', opts = {}) {
  const userId = opts.userId ?? userFor(path);
  const devMode = opts.devMode ?? false;
  return [([th, uid, dev, seedDrafts]) => {
    localStorage.setItem('petrock.theme', JSON.stringify({ theme: th, brand: 'petrock', skin: 'styled' }));
    localStorage.setItem('petrock.session', JSON.stringify({ userId: uid, devMode: dev, viewAs: null }));
    localStorage.setItem('petrock.location', JSON.stringify({ locationId: 'loc_encino', all: false }));
    if (!seedDrafts) return;
    const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
    const customer = { first_name: 'Avery', last_name: 'Thompson', mobile: '(818) 555-0142', alt_phone: '', email: 'avery@demo.petrock.test', address: '1412 Ventura Blvd', apt_suite: '', city: 'Encino', state: 'CA', zip: '91436' };
    const details = { feeding: '1 cup kibble', mealsPerDay: 'AM & PM', ownFood: true, takesMedication: false, medicationCount: '1', medication: '', dosing: '1 daily (AM only)', fleaMedication: true, fleaBrand: 'NexGard', fleaDate: day(-10), belongings: 'Blue blanket', medicalAlert: '', notes: '' };
    localStorage.setItem('petrock.hotelDraft.v1', JSON.stringify({ locationId: 'loc_encino', petIds: ['pet_1', 'pet_2'], shareRoom: true, checkIn: day(7), checkInTime: '10:00', checkOut: day(10), checkOutTime: '11:00', roomTypeId: 'rt_suite', petDetails: { pet_1: details, pet_2: details }, grooming: { pet_1: { packageId: 'pkg_gold', addonIds: ['add_1'] } }, groomingDecided: true, customer, payPlan: 'deposit', payMethod: 'card', startedAt: new Date().toISOString() }));
    localStorage.setItem('petrock.draft.grooming', JSON.stringify({ items: [{ petId: 'pet_1', packageId: 'pkg_gold', addonIds: ['add_1'] }], current: 0, locationId: 'loc_encino', date: day(7), time: '10:00', groomerId: null, notes: '', source: 'app' }));
    localStorage.setItem('petrock.draft.daycare', JSON.stringify({ petIds: ['pet_1'], locationId: 'loc_encino', date: day(7), checkIn: '08:00', checkOut: '16:00', details: { pet_1: { fleaMedication: true, fleaBrand: 'NexGard', fleaDate: day(-10), medicalAlert: '' } }, addGrooming: false, notes: '' }));
  }, [theme, userId, devMode, path.startsWith('/app')]];
}

/**
 * Chromium does not paint off-screen images during a full-page capture, so scroll the whole document
 * (step ~600 px) back to the top and then poll until every `img` is decoded (`complete && naturalWidth > 0`)
 * or `timeoutMs` passes. Call this right before a `fullPage` screenshot.
 */
export async function settleImages(page, timeoutMs = 8000) {
  const t0 = Date.now();
  try {
    await page.evaluate(async () => {
      const height = () => Math.max(document.body?.scrollHeight ?? 0, document.documentElement?.scrollHeight ?? 0);
      for (let y = 0; y < height(); y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 60));
    });
  } catch { /* navigation or detached frame: still give the images a chance below */ }
  while (Date.now() - t0 < timeoutMs) {
    let done = false;
    try { done = await page.evaluate(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0)); } catch { return; }
    if (done) return;
    await page.waitForTimeout(100);
  }
}
