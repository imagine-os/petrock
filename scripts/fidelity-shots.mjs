// Captures the pages compared in docs/design/fidelity/ (Figma export vs app) as full-page PNGs at the export's width.
// Usage: node scripts/fidelity-shots.mjs [--only=C-10,F-10] [--port=4181]
// Output: docs/design/fidelity/_shots/<key>.png ; then `python3 scripts/fidelity-composite.py` builds the side-by-sides.
import { mkdirSync } from 'node:fs';
import { arg, list, startPreview, launch, initScript } from './qa-lib.mjs';

const args = process.argv.slice(2);
const PORT = Number(arg(args, 'port', '4181'));
const ONLY = list(arg(args, 'only', ''));
const BASE = `http://localhost:${PORT}/#`;
const OUT = new URL('../docs/design/fidelity/_shots/', import.meta.url);

/** key -> capture recipe. `state` runs after the first render and may reload the page. */
export const PAIRS = [
  { key: 'C-10', code: 'C-10', path: '/app', width: 390, user: 'usr_customer' },
  { key: 'C-10-empty', code: 'C-10', path: '/app', width: 390, user: 'usr_customer', state: 'noPets' },
  { key: 'C-10-gate', code: 'C-10', path: '/app', width: 390, user: 'usr_customer', state: 'gate' },
  { key: 'C-13', code: 'C-13', path: '/app/pets/pet_1', width: 390, user: 'usr_customer' },
  { key: 'C-14', code: 'C-14', path: '/app/pets/pet_1/edit', width: 390, user: 'usr_customer' },
  { key: 'C-30', code: 'C-30', path: '/app/hotel', width: 390, user: 'usr_customer' },
  { key: 'C-33', code: 'C-33', path: '/app/hotel/grooming', width: 390, user: 'usr_customer' },
  { key: 'C-70', code: 'C-70', path: '/app/profile', width: 390, user: 'usr_customer' },
  { key: 'F-01', code: 'F-01', path: '/desk', width: 1440, user: 'usr_desk' },
  { key: 'F-10', code: 'F-10', path: '/desk/reservations', width: 1440, user: 'usr_desk' },
  { key: 'F-13', code: 'F-13', path: '/desk/reservations/timeline', width: 1440, user: 'usr_desk' },
  { key: 'A-01', code: 'A-01', path: '/admin', width: 1440, user: 'usr_owner' },
];

async function removePets(page) {
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('petrock.db.v1'));
    raw.db.pets = raw.db.pets.filter((p) => p.customer_id !== 'cus_1');
    localStorage.setItem('petrock.db.v1', JSON.stringify(raw));
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#root > *');
  await page.waitForTimeout(400);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const server = await startPreview(PORT);
  const browser = await launch();
  const problems = [];
  try {
    for (const p of PAIRS) {
      if (ONLY.length && !ONLY.includes(p.key) && !ONLY.includes(p.code)) continue;
      const ctx = await browser.newContext({ viewport: { width: p.width, height: p.width < 600 ? 844 : 900 }, deviceScaleFactor: 1 });
      await ctx.addInitScript(...initScript('light', p.path, { userId: p.user }));
      const page = await ctx.newPage();
      await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::|favicon/.test(m.text())) errors.push(m.text()); });
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForSelector('#root > *', { timeout: 10000 });
      await page.waitForTimeout(500);
      if (p.state === 'noPets' || p.state === 'gate') await removePets(page);
      if (p.state !== 'gate') {
        // The Figma frames are one tall screen (nav at the bottom). Grow the viewport to the content so fixed footers / nav sit under it.
        const h = await page.evaluate(() => { const c = document.querySelector('.phoneshell-content'); const pad = c ? parseFloat(getComputedStyle(c).paddingBottom) || 0 : 0; return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - pad; });
        const target = Math.max(p.width < 600 ? 844 : 900, Math.min(h, 4000));
        await page.setViewportSize({ width: p.width, height: target });
        await page.waitForTimeout(250);
      } else { await page.locator('.svctile').first().click(); await page.waitForTimeout(350); }
      await page.screenshot({ path: new URL(`${p.key}.png`, OUT).pathname, fullPage: false, type: 'png' });
      if (errors.length) problems.push({ key: p.key, errors: [...new Set(errors)].slice(0, 3) });
      console.log(`${p.key}  ${p.path}  ${p.width}px${errors.length ? '  ERRORS' : ''}`);
      await ctx.close();
    }
  } finally { await browser.close(); server.kill(); }
  if (problems.length) { console.log('\nPROBLEMS:'); for (const x of problems) console.log(' ', x.key, x.errors.join(' | ')); }
}
main().catch((e) => { console.error(e); process.exit(1); });
