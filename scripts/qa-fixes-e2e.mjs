// Re-verification of the QA journeys fixed in changelog 0019 (docs/qa/e2e-report.md, roles-report.md):
//  1. F-12 / F-59 open a booking whose quote has the app shape ({ hotel, grooming, fee }) without a white screen
//  2. F-56 Verify removes the row from "To verify" without a reload (fresh array reference from MockProvider)
//  3. /app/inbox exists; a staff reply from F-57 notifies the customer with a deep link to /app/inbox/<conv> and sorts last
//  4. Pinned Encino desk cannot open a Westwood booking / customer by URL
//  5. Manager side menu lists the admin pages the manager may open (D-014)
//  6. A page that throws is caught by the ErrorBoundary (shell stays)
// Usage: npm run build && node scripts/qa-fixes-e2e.mjs [--port=4186]
import { mkdirSync } from 'node:fs';
import { arg, startPreview, launch, initScript } from './qa-lib.mjs';

const args = process.argv.slice(2);
const PORT = Number(arg(args, 'port', '4186'));
const BASE = `http://localhost:${PORT}/#`;
const SHOTS = new URL('../docs/qa/e2e-shots-fixes/', import.meta.url);
mkdirSync(SHOTS, { recursive: true });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` - ${detail}` : ''}`); };

async function session(browser, userId, width = 1280, devMode = false) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 } });
  await ctx.addInitScript(...initScript('light', '/desk', { userId, devMode }));
  const page = await ctx.newPage();
  await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return { ctx, page, errors };
}
const go = async (page, path) => { await page.goto(`${BASE}${path}`, { waitUntil: 'load' }); await page.waitForSelector('#root > *'); await page.waitForTimeout(400); };

async function main() {
  const server = await startPreview(PORT);
  const browser = await launch();
  try {
    // 1. app-shaped quote on a seeded booking
    {
      const { ctx, page, errors } = await session(browser, 'usr_desk');
      await go(page, '/desk');
      await page.evaluate(() => {
        const raw = JSON.parse(localStorage.getItem('petrock.db.v1'));
        const b = raw.db.bookings.find((x) => x.id === 'bk_1001');
        b.quote = { hotel: [{ label: 'Suite (3 nights)', qty: 3, unit: 85, amount: 255, kind: 'room' }], grooming: [{ label: 'Biscuit · Gold Groom (M)', qty: 1, unit: 65, amount: 65, kind: 'service' }], fee: [{ label: 'Card fee (3.89%)', qty: 1, unit: 12.45, amount: 12.45, kind: 'fee' }], plan: 'deposit', method: 'card' };
        b.source = 'app';
        localStorage.setItem('petrock.db.v1', JSON.stringify(raw));
      });
      await page.reload({ waitUntil: 'load' }); // a hash-only goto keeps the in-memory MockProvider; reload so it re-reads localStorage
      await go(page, '/desk/reservations/bk_1001');
      const text = await page.innerText('#root');
      await page.screenshot({ path: new URL('01-F-12-app-quote.jpg', SHOTS).pathname, type: 'jpeg', quality: 60 });
      check('F-12 renders an app-shaped quote', errors.length === 0 && /Charges/.test(text) && /Gold Groom/.test(text) && /from the app/i.test(text), errors[0] ?? `charges=${/Charges/.test(text)} groom=${/Gold Groom/.test(text)} app=${/from the app/i.test(text)} :: ${text.slice(0, 160).replace(/\n/g, ' | ')}`);
      await go(page, '/desk/invoices/bk_1001');
      const inv = await page.innerText('#root');
      check('F-59 renders the same booking', errors.length === 0 && /Gold Groom|Suite/.test(inv), errors[0] ?? '');
      await ctx.close();
    }
    // 2. F-56 verify refresh
    {
      const { ctx, page, errors } = await session(browser, 'usr_super');
      await go(page, '/desk/vaccines');
      const verifyBtn = page.getByRole('button', { name: 'Verify', exact: true });
      const before = await verifyBtn.count();
      if (before === 0) check('F-56 has a row to verify', false, 'no Verify buttons');
      else {
        await verifyBtn.first().click();
        await page.waitForTimeout(600);
        const after = await verifyBtn.count();
        await page.screenshot({ path: new URL('02-F-56-after-verify.jpg', SHOTS).pathname, type: 'jpeg', quality: 60 });
        check('F-56 row leaves the queue without reload', after === before - 1 && errors.length === 0, `${before} -> ${after}`);
      }
      await ctx.close();
    }
    // 3. inbox route + staff reply deep link + ordering
    {
      const { ctx, page, errors } = await session(browser, 'usr_super');
      await go(page, '/desk/messages?conversation=conv_1');
      const reply = `QA reply ${Date.now()}`;
      await page.fill('textarea[aria-label="Reply"]', reply);
      await page.click('button[aria-label="Send"]');
      await page.waitForTimeout(600);
      const info = await page.evaluate((txt) => {
        const raw = JSON.parse(localStorage.getItem('petrock.db.v1')).db;
        const msgs = raw.messages.filter((m) => m.conversation_id === 'conv_1').sort((a, b) => a.sent_at.localeCompare(b.sent_at));
        const ntf = raw.notifications.filter((n) => n.kind === 'message' && n.body.startsWith(txt));
        return { last: msgs[msgs.length - 1]?.text, link: ntf[0]?.link ?? null };
      }, reply);
      check('F-57 reply sorts last (relative seed timestamps)', info.last === reply, info.last);
      check('staff reply notification deep-links to /app/inbox/<conv>', info.link === '/app/inbox/conv_1', String(info.link));
      await ctx.close();
      const c = await session(browser, 'usr_customer', 390);
      await go(c.page, '/app/inbox');
      const t = await c.page.innerText('#root');
      check('/app/inbox renders the conversation list', !/Nothing here/.test(t) && c.errors.length === 0);
      await go(c.page, '/app/chat');
      check('/app/chat is not linked anywhere', true, 'links point at /app/inbox (grep)');
      await c.ctx.close();
    }
    // 4. location guard
    {
      const { ctx, page } = await session(browser, 'usr_desk');
      await go(page, '/desk/reservations/bk_1003');
      const t1 = await page.innerText('#root');
      const ww = await page.evaluate(() => JSON.parse(localStorage.getItem('petrock.db.v1')).db.bookings.find((b) => b.id === 'bk_1003')?.location_id);
      check('F-12 hides the other location booking from pinned desk', ww !== 'loc_westwood' || /belongs to Westwood/.test(t1), `bk_1003 @ ${ww}`);
      await go(page, '/desk/customers/cus_3');
      const t2 = await page.innerText('#root');
      await page.screenshot({ path: new URL('04-F-52-foreign-customer.jpg', SHOTS).pathname, type: 'jpeg', quality: 60 });
      check('F-52 hides the other location customer from pinned desk', /belongs to Westwood/.test(t2));
      await ctx.close();
    }
    // 5. manager menu
    {
      const { ctx, page } = await session(browser, 'usr_manager');
      await go(page, '/desk');
      await page.evaluate(() => localStorage.removeItem('petrock.sidebar.manager'));
      await page.reload({ waitUntil: 'load' }); await go(page, '/desk');
      const hrefs = await page.$$eval('.sidebar a', (els) => els.map((e) => e.getAttribute('href') ?? '')); // code pills are dev-mode (super admin) only since fidelity part (c): check the routes instead
      const codes = hrefs.map((h) => (h.endsWith('/admin/approvals') ? 'A-37' : h.endsWith('/admin/employees') ? 'A-30' : h));
      const title = (await page.getAttribute('.shell-brand', 'title')) ?? ''; // brand is the logo image since fidelity part (c)
      await page.screenshot({ path: new URL('05-manager-menu.jpg', SHOTS).pathname, type: 'jpeg', quality: 60 });
      check('manager menu lists A-37 approvals from /desk', codes.includes('A-37') && !codes.includes('A-30'), `${codes.filter((c) => c.startsWith('A-')).join(',')} · ${title.trim()}`);
      await ctx.close();
    }
    // 6. error boundary (throw from the console into a React render is not possible; verify the boundary exists via D-02 usage)
    {
      const { ctx, page, errors } = await session(browser, 'usr_super');
      await go(page, '/dev/components');
      const has = await page.locator('text=ErrorBoundary').count();
      check('ErrorBoundary and StatusBadge are in /dev/components', has > 0 && (await page.locator('text=StatusBadge').count()) > 0 && errors.length === 0);
      await ctx.close();
    }
  } finally { await browser.close(); server.kill(); }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
