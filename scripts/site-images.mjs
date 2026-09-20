// Builds the public-website photo set from the client scrape (docs/reference/petrockhotel-scrape/images).
// Output: public/site/img/<slug>-<w>.webp for w in 480, 960, 1600, 2560 (never upscaled) + <slug>-1600.jpg (q80)
//         as the <img> fallback, plus the logo as PNG (logo-petrock.png at source size, logo-petrock-800.png).
//         src/modules/extras-manual-website/site/siteImages.generated.ts (SITE_IMAGES manifest: widths + source w/h
//         so <SitePhoto> can emit srcset and width/height without layout shift).
// Usage: npm run site:images [-- --clean]
//   --clean   empty public/site/img before writing (drops derivatives of removed sources)
// Budget (D-194): no derivative over MAX_BYTES; the quality ladder steps down per file until it fits.
// Sources are the originals only - this script never reads the network. Re-run it after adding a photo to the scrape.
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const SRC_DIR = new URL('../docs/reference/petrockhotel-scrape/images/', import.meta.url).pathname;
const OUT_DIR = new URL('../public/site/img/', import.meta.url).pathname;
const MANIFEST = new URL('../src/modules/extras-manual-website/site/siteImages.generated.ts', import.meta.url).pathname;
const WIDTHS = [480, 960, 1600, 2560];
const JPG_WIDTH = 1600;
const MAX_BYTES = 450 * 1024;
const QUALITY_LADDER = [80, 72, 64, 56, 48];
const LOGO = 'PetRockLogo.png';

const slugOf = (file) => basename(file, extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

/** Writes one derivative, stepping down the quality ladder until it fits the budget. Returns the bytes written. */
async function writeFit(pipeline, path, encode) {
  let last = 0;
  for (const q of QUALITY_LADDER) {
    const buf = await encode(pipeline.clone(), q).toBuffer();
    last = buf.length;
    if (buf.length <= MAX_BYTES || q === QUALITY_LADDER[QUALITY_LADDER.length - 1]) { writeFileSync(path, buf); return last; }
  }
  return last;
}

async function main() {
  if (process.argv.includes('--clean')) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(SRC_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const manifest = {};
  const rows = [];
  let total = 0;

  for (const file of files) {
    if (file === LOGO) continue;
    const slug = slugOf(file);
    const src = join(SRC_DIR, file);
    const image = sharp(src, { failOn: 'none' }).rotate();
    const { width: w, height: h } = await image.metadata();
    if (!w || !h) { console.warn(`! ${file}: no dimensions, skipped`); continue; }

    const widths = WIDTHS.filter((x) => x <= w);
    if (widths.length === 0) widths.push(w);
    const out = [];
    for (const width of widths) {
      const bytes = await writeFit(image.clone().resize({ width }), join(OUT_DIR, `${slug}-${width}.webp`), (p, q) => p.webp({ quality: q }));
      out.push(`${width}w ${kb(bytes)}`);
      total += bytes;
    }
    const jpgBytes = await writeFit(image.clone().resize({ width: Math.min(JPG_WIDTH, w) }), join(OUT_DIR, `${slug}-${JPG_WIDTH}.jpg`), (p, q) => p.jpeg({ quality: Math.min(q, 80), mozjpeg: true }));
    out.push(`jpg ${kb(jpgBytes)}`);
    total += jpgBytes;

    manifest[slug] = { widths, w, h, jpg: `./site/img/${slug}-${JPG_WIDTH}.jpg` };
    rows.push([slug, `${w}x${h}`, kb(statSync(src).size), out.join(' · ')]);
  }

  // The logo stays PNG (flat art on transparency): source size plus an 800 px cap that is still 2x-safe at 400 px.
  const logoSrc = join(SRC_DIR, LOGO);
  const logo = sharp(logoSrc);
  const { width: lw, height: lh } = await logo.metadata();
  const logoOut = join(OUT_DIR, 'logo-petrock.png');
  await logo.clone().png({ compressionLevel: 9 }).toFile(logoOut);
  const logo800 = join(OUT_DIR, 'logo-petrock-800.png');
  await logo.clone().resize({ width: Math.min(800, lw) }).png({ compressionLevel: 9 }).toFile(logo800);
  total += statSync(logoOut).size + statSync(logo800).size;
  rows.push(['logo-petrock', `${lw}x${lh}`, kb(statSync(logoSrc).size), `png ${kb(statSync(logoOut).size)} · png800 ${kb(statSync(logo800).size)}`]);

  const pad = (s, n) => String(s).padEnd(n);
  console.log(`${pad('slug', 24)}${pad('source', 12)}${pad('src size', 10)}outputs`);
  for (const r of rows) console.log(`${pad(r[0], 24)}${pad(r[1], 12)}${pad(r[2], 10)}${r[3]}`);
  const written = readdirSync(OUT_DIR);
  console.log(`\n${rows.length} sources -> ${written.length} files, ${(total / 1024 / 1024).toFixed(2)} MiB in public/site/img`);
  const over = written.filter((f) => statSync(join(OUT_DIR, f)).size > MAX_BYTES);
  if (over.length) console.warn(`! over the ${kb(MAX_BYTES)} budget: ${over.join(', ')}`);

  const entries = Object.entries(manifest).map(([slug, m]) => `  '${slug}': { widths: [${m.widths.join(', ')}], w: ${m.w}, h: ${m.h}, jpg: '${m.jpg}' },`).join('\n');
  writeFileSync(MANIFEST, `/* GENERATED by scripts/site-images.mjs (npm run site:images) - do not edit. */

export interface SiteImageEntry {
  /** Widths of the .webp derivatives in public/site/img, ascending; the srcset candidates. */
  widths: number[];
  /** Source pixel size, used for the img width/height attributes (aspect ratio, no layout shift). */
  w: number;
  h: number;
  /** The .jpg fallback path, relative to the document base. */
  jpg: string;
}

/** Path prefix of every derivative; a .webp candidate is \`\${SITE_IMG_BASE}\${slug}-\${width}.webp\`. */
export const SITE_IMG_BASE = './site/img/';

/** The Petrock logo from the client site; PNG because it is flat art on transparency. */
export const SITE_LOGO = { png: './site/img/logo-petrock.png', png800: './site/img/logo-petrock-800.png', w: ${lw}, h: ${lh} };

export const SITE_IMAGES: Record<string, SiteImageEntry> = {
${entries}
};
`);
  console.log(`manifest: ${MANIFEST.replace(/.*\/petrock\//, '')} (${Object.keys(manifest).length} entries)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
