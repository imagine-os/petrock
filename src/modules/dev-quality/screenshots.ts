/** Every image under docs/screenshots grouped by page code with parsed width / theme / label (D-17, D-19). */
const assets = import.meta.glob<string>('../../../docs/screenshots/**/*.{png,jpg,jpeg,webp}', { query: '?url', import: 'default', eager: true });

export interface Shot { name: string; url: string; width: number; dark: boolean; label: string }
export interface ShotGroup { code: string; files: Shot[] }

export function screenshotIndex(): Record<string, ShotGroup> {
  const out: Record<string, ShotGroup> = {};
  for (const [k, url] of Object.entries(assets)) {
    const m = k.match(/docs\/screenshots\/([^/]+)\/(\d+)(-dark)?(?:-([\w-]+))?\.(?:png|jpe?g|webp)$/);
    if (!m) continue;
    const code = m[1];
    (out[code] ??= { code, files: [] }).files.push({ name: k.split('/').pop()!, url, width: Number(m[2]), dark: !!m[3], label: m[4] ?? '' });
  }
  for (const g of Object.values(out)) g.files.sort((a, b) => a.width - b.width || Number(a.dark) - Number(b.dark) || a.label.localeCompare(b.label));
  return out;
}
export const findShot = (g: ShotGroup | undefined, width: number, dark: boolean, label = '') => g?.files.find((f) => f.width === width && f.dark === dark && f.label === label);
