// Responsive check (360/390/768/1280/1920, console errors, horizontal overflow) + screenshots (390, 1280, dark for key pages) for the customer-settings-chat module (C-70..C-84).
// Usage: node scripts/screenshots-customer-settings-chat.mjs [--check-only]   (vite preview on 4181; Chromium from /opt/pw-browsers)
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { chromium } from 'playwright';
const ROOT = '/home/claude/wt/customer-settings-chat';
const PORT = 4181; const BASE = `http://localhost:${PORT}/#`;
const SAVE = !process.argv.includes('--check-only');
const PAGES = [
  ['C-70', '/app/profile'], ['C-71', '/app/profile/edit'], ['C-72', '/app/settings'], ['C-73', '/app/settings/language'], ['C-74', '/app/payment-methods'],
  ['C-75', '/app/settings/notifications'], ['C-76', '/app/settings/delete-account'], ['C-77', '/app/help'], ['C-78', '/app/about'], ['C-79', '/app/legal/privacy-policy'],
  ['C-80', '/app/notifications'], ['C-81', '/app/inbox'], ['C-82', '/app/inbox/conv_1'], ['C-83', '/app/rate'], ['C-84', '/app/settings/password'],
];
const DARK = new Set(['C-70', 'C-72', 'C-74', 'C-80', 'C-82']);
const WIDTHS = [360, 390, 768, 1280, 1920];
const SAVED = new Set([390, 1280]);
const exe = `/opt/pw-browsers/${readdirSync('/opt/pw-browsers').find((d) => /^chromium-\d+/.test(d))}/chrome-linux/chrome`;
const server = spawn(process.execPath, [`${ROOT}/node_modules/vite/bin/vite.js`, 'preview', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'pipe' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const NOISE = /Failed to load resource|ERR_CERT|fonts\.g|net::|favicon/;
const problems = [];
for (const [code, path] of PAGES) {
  for (const width of WIDTHS) {
    const themes = SAVE && DARK.has(code) && width === 390 ? ['light', 'dark'] : ['light'];
    for (const theme of themes) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: 1 });
      await ctx.addInitScript(([th]) => {
        localStorage.setItem('petrock.theme', JSON.stringify({ theme: th, brand: 'petrock', skin: 'styled' }));
        localStorage.setItem('petrock.session', JSON.stringify({ userId: 'usr_customer', devMode: false, viewAs: null }));
        localStorage.setItem('petrock.location', JSON.stringify({ locationId: 'loc_encino', all: false }));
      }, [theme]);
      const page = await ctx.newPage();
      await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errors.push(m.text()); });
      try {
        await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 15000 });
        await page.waitForSelector('#root > *', { timeout: 8000 });
        await page.waitForTimeout(500);
        const overflow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, url: location.hash }));
        if (overflow.sw > overflow.iw) errors.push(`horizontal overflow ${overflow.sw}>${overflow.iw}`);
        if (!overflow.url.includes(path.split('/').slice(0, 3).join('/'))) errors.push(`redirected to ${overflow.url}`);
        if (SAVE && SAVED.has(width)) {
          const dir = `${ROOT}/docs/screenshots/${code}`; mkdirSync(dir, { recursive: true });
          await page.screenshot({ path: `${dir}/${width}${theme === 'dark' ? '-dark' : ''}.jpg`, fullPage: width >= 600, type: 'jpeg', quality: 72 });
        }
      } catch (e) { errors.push(String(e.message)); }
      if (errors.length) problems.push({ code, path, width, theme, errors: [...new Set(errors)].slice(0, 3) });
      await ctx.close();
    }
  }
  process.stdout.write(`${code} ${path}\n`);
}
await browser.close(); server.kill();
if (problems.length) { console.log('PROBLEMS'); for (const p of problems) console.log(` ${p.code} ${p.path} [${p.width}/${p.theme}] ${p.errors.join(' | ')}`); process.exit(1); }
console.log('all clean');
