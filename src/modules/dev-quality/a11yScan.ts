/**
 * R-X87: small, dependency-free accessibility checks that run against any Document (the page's own, or a same-origin
 * iframe). The same rules run headless in scripts/qa-responsive.mjs, so a page and the script agree.
 */
export interface A11yFinding { rule: string; severity: 'error' | 'warn'; selector: string; text: string; wcag: string }

const accessibleName = (el: Element): string => {
  const aria = el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') ? el.ownerDocument.getElementById(el.getAttribute('aria-labelledby')!)?.textContent : '') || el.getAttribute('title');
  if (aria?.trim()) return aria.trim();
  if (el instanceof HTMLImageElement) return el.alt;
  const txt = (el.textContent ?? '').trim();
  if (txt) return txt;
  const img = el.querySelector('img[alt]'); if (img?.getAttribute('alt')) return img.getAttribute('alt')!;
  const svgTitle = el.querySelector('svg title'); if (svgTitle?.textContent) return svgTitle.textContent;
  return '';
};
export const cssPath = (el: Element): string => {
  const parts: string[] = []; let cur: Element | null = el;
  while (cur && parts.length < 4 && cur.nodeType === 1) { let s = cur.tagName.toLowerCase(); if (cur.id) { parts.unshift(`#${cur.id}`); break; } const cls = [...cur.classList].slice(0, 2).join('.'); if (cls) s += `.${cls}`; parts.unshift(s); cur = cur.parentElement; }
  return parts.join(' > ');
};
const visible = (el: Element) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

export function scanA11y(doc: Document, root: ParentNode = doc.body): A11yFinding[] {
  const out: A11yFinding[] = [];
  const push = (rule: string, severity: 'error' | 'warn', el: Element, text: string, wcag: string) => { if (out.length < 200) out.push({ rule, severity, selector: cssPath(el), text, wcag }); };
  root.querySelectorAll('img').forEach((img) => { if (!img.hasAttribute('alt')) push('img-alt', 'error', img, `image without alt (${img.getAttribute('src')?.slice(0, 60) ?? 'no src'})`, '1.1.1'); });
  root.querySelectorAll('button, [role="button"], a[href]').forEach((el) => { if (!visible(el)) return; if (!accessibleName(el)) push('control-name', 'error', el, `${el.tagName.toLowerCase()} without an accessible name`, '4.1.2'); });
  root.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach((el) => {
    const i = el as HTMLInputElement; if (!visible(el)) return;
    const labelled = i.labels?.length || i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || i.getAttribute('title') || (i.type === 'submit' || i.type === 'button' ? i.value : '');
    if (!labelled) push('input-label', 'error', el, `${el.tagName.toLowerCase()}${i.type ? `[type=${i.type}]` : ''} without a label`, '1.3.1');
  });
  root.querySelectorAll('iframe').forEach((f) => { if (!f.title) push('iframe-title', 'error', f, 'iframe without title', '4.1.2'); });
  const heads = [...root.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);
  if (!heads.some((h) => h.tagName === 'H1')) out.push({ rule: 'h1', severity: 'warn', selector: 'document', text: 'no visible h1 on the page', wcag: '2.4.6' });
  let prev = 0; for (const h of heads) { const lvl = Number(h.tagName[1]); if (prev && lvl > prev + 1) push('heading-skip', 'warn', h, `heading jumps from h${prev} to h${lvl}`, '1.3.1'); prev = lvl; }
  if (!root.querySelector('main, [role="main"]')) out.push({ rule: 'landmark-main', severity: 'warn', selector: 'document', text: 'no <main> landmark', wcag: '1.3.1' });
  root.querySelectorAll('[tabindex]').forEach((el) => { const t = Number(el.getAttribute('tabindex')); if (t > 0) push('tabindex-positive', 'warn', el, `tabindex=${t} breaks the natural order`, '2.4.3'); });
  root.querySelectorAll('a[href="#"], a:not([href])').forEach((a) => { if (visible(a)) push('link-href', 'warn', a, 'link without a real href (use a button)', '4.1.2'); });
  root.querySelectorAll('button, a[href], input, select, [role="button"]').forEach((el) => {
    if (!visible(el)) return;
    const cs = getComputedStyle(el);
    if (cs.opacity === '0' || cs.visibility === 'hidden' || cs.position === 'absolute' && el.getBoundingClientRect().width <= 1) return; // visually-hidden native input behind a custom control
    if (el instanceof HTMLInputElement && ['checkbox', 'radio', 'range', 'file'].includes(el.type)) return; // native controls render their own target
    if (el.tagName === 'A' && cs.display === 'inline') return; // inline text links are exempt (2.5.8)
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) { if ((el as HTMLElement).closest('table, .datatable, .comp-props')) return; push('target-size', 'warn', el, `target ${Math.round(r.width)}x${Math.round(r.height)} px is under 24 px`, '2.5.8'); }
  });
  if (doc.documentElement.lang === '') out.push({ rule: 'html-lang', severity: 'error', selector: 'html', text: 'html has no lang attribute', wcag: '3.1.1' });
  return out;
}

export function overflowScan(doc: Document, innerWidth: number): { hscroll: boolean; scrollWidth: number; offenders: { selector: string; right: number }[] } {
  const scrollWidth = doc.documentElement.scrollWidth;
  const offenders: { selector: string; right: number }[] = [];
  if (scrollWidth > innerWidth + 1) {
    doc.body.querySelectorAll('*').forEach((el) => { if (offenders.length >= 12) return; const r = el.getBoundingClientRect(); if (r.width > 0 && r.right > innerWidth + 2 && getComputedStyle(el).position !== 'fixed') { const parent = el.parentElement; if (parent && getComputedStyle(parent).overflowX !== 'visible') return; offenders.push({ selector: cssPath(el), right: Math.round(r.right) }); } });
  }
  return { hscroll: scrollWidth > innerWidth + 1, scrollWidth, offenders };
}
