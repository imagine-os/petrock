// Renders the ICON_SVGS registry (Figma icons) as a labelled grid and captures it: /home/claude/petrock-fidelity-shots/icons.jpg
// Usage: node scripts/fidelity-icon-grid.mjs [--out=/path/icons.jpg]
import { mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { arg, launch } from './qa-lib.mjs';

const args = process.argv.slice(2);
const OUT = arg(args, 'out', '/home/claude/petrock-fidelity-shots/icons.jpg');
const TMP = new URL('../node_modules/.cache/figmaIcons.mjs', import.meta.url);
mkdirSync(new URL('../node_modules/.cache/', import.meta.url), { recursive: true });
execSync(`npx esbuild src/components/atom/Icon/figmaIcons.ts --format=esm --outfile=${TMP.pathname}`, { cwd: new URL('..', import.meta.url).pathname, stdio: 'inherit' });
const { ICON_SVGS } = await import(TMP.href);

function svg(entry, size = 40) {
  const box = Number(entry.viewBox.split(' ')[3]);
  const sw = (1.5 * box) / 24;
  const paths = entry.paths.map((p) => p.stroke
    ? `<path d="${p.d}" fill="none" stroke="${p.fill ?? 'currentColor'}" stroke-width="${p.sw ?? sw}" stroke-linecap="round" stroke-linejoin="round"${p.dash ? ` stroke-dasharray="${p.dash}"` : ''}${p.opacity != null ? ` opacity="${p.opacity}"` : ''}/>`
    : `<path d="${p.d}" fill="${p.fill ?? 'currentColor'}"${p.evenodd ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''}${p.opacity != null ? ` opacity="${p.opacity}"` : ''}/>`).join('');
  return `<svg width="${size}" height="${size}" viewBox="${entry.viewBox}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}
const names = Object.keys(ICON_SVGS);
const fromExport = names.filter((n) => /\.svg$/.test(ICON_SVGS[n].source ?? ''));
const redrawn = names.filter((n) => !fromExport.includes(n));
const cell = (n) => `<div class="c"><div class="i">${svg(ICON_SVGS[n])}</div><div class="n">${n}</div><div class="s">${ICON_SVGS[n].source ?? 'redrawn from frame'}</div></div>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#F4F0FF;font-family:"Open Sans",system-ui,sans-serif;color:#181818;padding:32px;width:1136px}
h1{font-size:26px;margin:0 0 6px}p{margin:0 0 20px;color:#808080;font-size:14px}h2{font-size:16px;color:#552583;margin:18px 0 10px;letter-spacing:.04em;text-transform:uppercase}
.g{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.c{background:#fff;border:1px solid #D8DADE;border-radius:10px;padding:14px 10px;text-align:center}
.i{color:#552583;height:44px;display:flex;align-items:center;justify-content:center}.n{font-size:12px;font-weight:700;margin-top:8px}.s{font-size:10px;color:#808080;margin-top:2px;word-break:break-all}
</style></head><body><h1>Petrock icon set (v0.2.0)</h1><p>${names.length} entries in ICON_SVGS - ${fromExport.length} converted from the Figma SVG exports, ${redrawn.length} redrawn from the frames (provisional until the Design System export). Rendered in --color-primary #552583.</p>
<h2>From the Figma exports</h2><div class="g">${fromExport.map(cell).join('')}</div>
<h2>Redrawn from the frames</h2><div class="g">${redrawn.map(cell).join('')}</div></body></html>`;
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'load' });
mkdirSync(OUT.slice(0, OUT.lastIndexOf('/')), { recursive: true });
await page.screenshot({ path: OUT, fullPage: true, type: 'jpeg', quality: 90 });
await browser.close();
console.log(OUT, names.length, 'icons');
