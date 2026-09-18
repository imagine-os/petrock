// Captures routes as super_admin (dev mode on) at 390 and 1280 px, light (+ dark for key pages).
// Output: docs/screenshots/<CODE>/<width>[-dark][-<label>].jpg and docs/screenshots/routes.json (the route manifest).
// Usage: npm run screenshots [-- --smoke] [-- --only=/dev,/docs] [-- --codes=HUB-01,D-02] [-- --label=before] [-- --quality=72] [-- --dark]
//   --smoke      1280 only, no files, just console errors (exit 1 when anything throws)
//   --only=a,b   routes whose path starts with a prefix (trailing $ = exact)
//   --codes=A,B  routes whose spec code is listed
//   --dark       dark captures for every listed route (default: KEY_PAGES only)
// Chromium is preinstalled at /opt/pw-browsers; PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1; never run `playwright install`.
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const SMOKE = args.includes('--smoke');
const ALL_DARK = args.includes('--dark');
const ONLY = (args.find((a) => a.startsWith('--only='))?.slice(7) ?? '').split(',').filter(Boolean);
const CODES = (args.find((a) => a.startsWith('--codes='))?.slice(8) ?? '').split(',').filter(Boolean);
const LABEL = args.find((a) => a.startsWith('--label='))?.slice(8) ?? '';
const QUALITY = Number(args.find((a) => a.startsWith('--quality='))?.slice(10) ?? 72);
const PORT = 4173;
const BASE = `http://localhost:${PORT}/#`;
const KEY_PAGES = new Set(['HUB-01', 'A-00', 'D-01', 'D-02', 'D-04', 'D-05', 'P-00', 'C-10', 'F-01', 'A-01']);
const PARAMS = { ':table': 'bookings', '*': '' };
const fileName = (width, theme, label = '') => `${width}${theme === 'dark' ? '-dark' : ''}${label ? `-${label}` : ''}.jpg`;
const safe = (code) => code.replace(/[^\w-]/g, '_');

function findChromium() {
  try { const dir = readdirSync('/opt/pw-browsers').find((d) => /^chromium-\d+/.test(d)); if (dir) return `/opt/pw-browsers/${dir}/chrome-linux/chrome`; } catch { /* fall through */ }
  return process.env.CHROMIUM_PATH;
}
async function fetchManifest(browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForFunction(() => window.__petrock?.routes?.length > 0, null, { timeout: 15000 });
  const routes = await page.evaluate(() => window.__petrock.routes);
  await ctx.close();
  return routes.filter((r, i, a) => a.findIndex((x) => x.path === r.path) === i);
}
const inOnly = (r) => (!ONLY.length || ONLY.some((p) => (p.endsWith('$') ? r.path === p.slice(0, -1) : r.path === p || r.path.startsWith(p.endsWith('/') ? p : `${p}/`)))) && (!CODES.length || CODES.includes(r.code));

async function main() {
  const server = spawn(process.execPath, [new URL('../node_modules/vite/bin/vite.js', import.meta.url).pathname, 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
  await new Promise((r) => setTimeout(r, 2500));
  const exe = findChromium();
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const NOISE = /Failed to load resource|ERR_CERT|fonts\.g(oogleapis|static)|net::|favicon/;
  let manifest;
  try { manifest = await fetchManifest(browser); } catch (e) { console.error('could not read the route manifest:', e.message); await browser.close(); server.kill(); process.exit(1); }
  mkdirSync(new URL('../docs/screenshots/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../docs/screenshots/routes.json', import.meta.url), JSON.stringify(manifest, null, 1));
  const list = manifest.filter(inOnly).filter((r) => !r.path.includes('*'));
  const problems = [];
  const widths = SMOKE ? [1280] : [390, 1280];
  console.log(`${list.length} routes · chromium ${exe}${ONLY.length ? ` · only ${ONLY.join(',')}` : ''}${CODES.length ? ` · codes ${CODES.join(',')}` : ''}${SMOKE ? ' · smoke' : ` · jpeg q${QUALITY}`}`);
  const seenCode = new Set();
  for (const { path, code } of list) {
    if (seenCode.has(code)) continue; // parameterised duplicates share a code
    seenCode.add(code);
    const url = path.replace(/:\w+/g, (p) => PARAMS[p] ?? 'x');
    for (const width of widths) {
      const themes = !SMOKE && (ALL_DARK || KEY_PAGES.has(code)) ? ['light', 'dark'] : ['light'];
      for (const theme of themes) {
        const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 800 }, deviceScaleFactor: 1 });
        await ctx.addInitScript(([th]) => {
          localStorage.setItem('petrock.theme', JSON.stringify({ theme: th, brand: 'petrock', skin: 'styled' }));
          localStorage.setItem('petrock.session', JSON.stringify({ userId: 'usr_super', devMode: true, viewAs: null }));
          localStorage.setItem('petrock.location', JSON.stringify({ locationId: 'loc_encino', all: false }));
        }, [theme]);
        const page = await ctx.newPage();
        await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push(m.text()); });
        try {
          await page.goto(`${BASE}${url}`, { waitUntil: 'load', timeout: 15000 });
          await page.waitForSelector('#root > *', { timeout: 8000 });
          await page.waitForTimeout(400);
          if (!SMOKE) {
            const dir = new URL(`../docs/screenshots/${safe(code)}/`, import.meta.url);
            mkdirSync(dir, { recursive: true });
            await page.screenshot({ path: new URL(fileName(width, theme, LABEL), dir).pathname, fullPage: width >= 600, type: 'jpeg', quality: QUALITY });
          }
        } catch (e) { errors.push(String(e.message)); }
        if (errors.length) problems.push({ path, width, theme, errors: [...new Set(errors)].slice(0, 3) });
        await ctx.close();
      }
    }
    process.stdout.write(`${code.padEnd(8)} ${path}\n`);
  }
  await browser.close();
  server.kill();
  if (!SMOKE && !ONLY.length && !CODES.length && !LABEL) {
    writeFileSync(new URL('../docs/screenshots/README.md', import.meta.url), `# Screenshots\n\nGenerated by \`npm run screenshots\` on ${new Date().toISOString().slice(0, 10)} (JPEG q${QUALITY}). One folder per page code; file name \`<width>[-dark][-<label>].jpg\`. \`routes.json\` is the route manifest the app published (\`window.__petrock.routes\`). Browse them at \`/#/docs/screenshots\`.\n\n| Code | Route | Status |\n| --- | --- | --- |\n${list.map((r) => `| \`${r.code}\` | \`#${r.path}\` | ${r.status} |`).join('\n')}\n`);
  }
  if (problems.length) { console.log('\nPROBLEMS:'); for (const p of problems) console.log(`  ${p.path} [${p.width}/${p.theme}]`, p.errors.join(' | ')); }
  else console.log('\nno console errors');
  process.exit(problems.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
