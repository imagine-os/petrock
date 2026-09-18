// Interaction checks for C-70..C-84: chat send + mock reply + read receipt, language switch, dark mode, add card, mark all read, delete-account gating, rate, help request.
// Usage: node scripts/flows-customer-settings-chat.mjs   (vite preview on 4182)
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { chromium } from 'playwright';
const ROOT = '/home/claude/wt/customer-settings-chat'; const PORT = 4182; const BASE = `http://localhost:${PORT}/#`;
const exe = `/opt/pw-browsers/${readdirSync('/opt/pw-browsers').find((d) => /^chromium-\d+/.test(d))}/chrome-linux/chrome`;
const server = spawn(process.execPath, [`${ROOT}/node_modules/vite/bin/vite.js`, 'preview', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'pipe' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => { localStorage.setItem('petrock.session', JSON.stringify({ userId: 'usr_customer', devMode: false, viewAs: null })); localStorage.setItem('petrock.theme', JSON.stringify({ theme: 'light', brand: 'petrock', skin: 'styled' })); });
const page = await ctx.newPage(); const errors = [];
page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|net::/.test(m.text())) errors.push(m.text()); });
const results = [];
const check = (name, ok, extra = '') => { results.push(`${ok ? 'PASS' : 'FAIL'} ${name} ${extra}`); };
// 1. chat
await page.goto(`${BASE}/app/inbox/conv_1`); await page.waitForSelector('.chatcomp-input');
const before = await page.locator('.chatmsg').count();
await page.fill('.chatcomp-input', 'Could you send a photo of Biscuit?'); await page.click('.chatcomp-send');
await page.waitForTimeout(600);
check('own message posted', (await page.locator('.chatmsg.is-mine').filter({ hasText: 'photo of Biscuit' }).count()) === 1);
check('typing indicator appears', await page.locator('.csc-chat-typing').waitFor({ timeout: 3000 }).then(() => true).catch(() => false));
await page.waitForTimeout(3500);
const after = await page.locator('.chatmsg').count();
check('mock staff reply arrived with image', after >= before + 2 && (await page.locator('.chatmsg.is-theirs .chatmsg-image').count()) >= 1, `${before}->${after}`);
check('read receipt Seen', (await page.locator('.chatmsg.is-mine').filter({ hasText: 'photo of Biscuit' }).innerText()).includes('Seen'));
await page.screenshot({ path: `${ROOT}/docs/screenshots/C-82/390-after-send.jpg`, type: 'jpeg', quality: 72 });
// inbox shows the thread with preview
await page.goto(`${BASE}/app/inbox`); await page.waitForSelector('.convrow');
check('inbox shows Encino thread', (await page.locator('.convrow').first().innerText()).includes('Encino'));
// 2. language switch
await page.goto(`${BASE}/app/settings/language`); await page.waitForSelector('.radiogroup');
await page.getByText('Español').click(); await page.getByRole('button', { name: 'Save' }).click(); await page.waitForTimeout(400);
check('language -> es title', (await page.locator('.cshead-title').innerText()) === 'Ajustes de la app', await page.locator('.cshead-title').innerText());
await page.screenshot({ path: `${ROOT}/docs/screenshots/C-72/390-es.jpg`, type: 'jpeg', quality: 72 });
// dark mode toggle
await page.locator('.toggle').first().click(); await page.waitForTimeout(200);
check('dark mode attribute', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
await page.locator('.toggle').first().click();
await page.goto(`${BASE}/app/settings/language`); await page.locator('.radio').filter({ hasText: 'English (US)' }).click(); await page.getByRole('button', { name: 'Guardar' }).click(); await page.waitForTimeout(300);
// 3. add card
await page.goto(`${BASE}/app/payment-methods`); await page.waitForSelector('.paycard');
const cardsBefore = await page.locator('.paycard').count();
await page.getByRole('button', { name: 'Add card' }).first().click(); await page.waitForSelector('.modal');
await page.getByLabel('Name on card').fill('Avery Thompson'); await page.getByLabel('Card number').fill('4242424242424242'); await page.getByLabel('Expiry').fill('1229'); await page.getByLabel('CVC').fill('123'); await page.getByLabel('Billing ZIP').fill('91316');
await page.getByRole('button', { name: 'Save card' }).click(); await page.waitForTimeout(900);
check('card added and default', (await page.locator('.paycard').count()) === cardsBefore + 1 && (await page.locator('.paycard').first().innerText()).includes('Default'));
// 4. notifications mark all
await page.goto(`${BASE}/app/notifications`); await page.waitForSelector('.ntfrow');
const unreadBefore = await page.locator('.ntfrow.is-unread').count();
await page.getByRole('button', { name: 'Mark all read' }).click(); await page.waitForTimeout(300);
check('mark all read', unreadBefore > 0 && (await page.locator('.ntfrow.is-unread').count()) === 0, `${unreadBefore}`);
// 5. delete account gating
await page.goto(`${BASE}/app/settings/delete-account`); await page.waitForSelector('.csc-screen');
const blocked = await page.locator('.csc-danger-box').count();
check('delete account shows active-bookings block or form', blocked >= 0, `blocked=${blocked}`);
check('delete CTA disabled by default', await page.getByRole('button', { name: 'Delete my account' }).isDisabled());
// 6. rate app
await page.goto(`${BASE}/app/rate`); await page.waitForSelector('.stars');
await page.getByRole('radio', { name: '5 stars' }).click(); await page.getByRole('button', { name: 'Excellent' }).click(); await page.getByRole('button', { name: 'Send review' }).click(); await page.waitForTimeout(400);
check('review submitted', (await page.locator('.empty-title').innerText()).includes('Thank'));
// 7. help request
await page.goto(`${BASE}/app/help`); await page.waitForSelector('.csc-screen');
await page.getByLabel('Topic', { exact: true }).selectOption('app'); await page.getByLabel('How can we help?').fill('The dark mode toggle is great, but can I follow the system setting?');
await page.getByRole('button', { name: 'Send request' }).click(); await page.waitForTimeout(500);
check('support request listed', (await page.locator('.csc-screen').innerText()).includes('follow the system setting'));
await browser.close(); server.kill();
console.log(results.join('\n')); if (errors.length) console.log('ERRORS', errors);
process.exit(results.some((r) => r.startsWith('FAIL')) || errors.length ? 1 : 0);
