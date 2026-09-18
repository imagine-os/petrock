#!/usr/bin/env python3
"""Side-by-side composites (Figma export left, app screenshot right) plus a rough similarity score per pair.

Usage: python3 scripts/fidelity-composite.py [--label=before] [KEY ...]
Reads docs/design/fidelity/_shots/<key>.png (from scripts/fidelity-shots.mjs), writes docs/design/fidelity/<key>.png
and appends a row per pair to docs/design/fidelity/scores.json. Similarity = mean of a global SSIM-style score on a
blurred 64-px-wide greyscale thumbnail and a colour histogram overlap, both on the shared height (0..1, higher = closer).
"""
import json, sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORTS = os.path.join(ROOT, 'docs/figma/exports/petrock-main')
SHOTS = os.path.join(ROOT, 'docs/design/fidelity/_shots')
OUT = os.path.join(ROOT, 'docs/design/fidelity')

# key -> (export file, optional crop box on the export, human note)
PAIRS = {
    'C-10': ('Home Page.png', None),
    'C-10-empty': ('Home Page-2.png', None),
    'C-10-gate': ('Home Page-5.png', None),
    'C-13': ('Pet Profile (Single Pet).jpg', None),
    'C-14': ('Pet Edit.png', None),
    'C-30': ('Hotel Reservation.png', None),
    'C-33': ('Frame 1171276428.png', (0, 0, 390, 665)),
    'C-70': ('profile.jpg', None),
    'F-01': ('front desk-4.jpg', None),
    'F-10': ('front desk.jpg', None),
    'F-13': ('all reservation grooming.jpg', None),
    'A-01': ('front desk-4.jpg', None),
}

def load(path, crop=None):
    im = Image.open(path).convert('RGB')
    if crop: im = im.crop(crop)
    return im

def fit_width(im, w):
    if im.width == w: return im
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)

def ssim_global(a, b):
    """SSIM over the whole (blurred, small) greyscale image: catches layout/tone, ignores text detail."""
    a = np.asarray(a, dtype=np.float64); b = np.asarray(b, dtype=np.float64)
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    mu_a, mu_b = a.mean(), b.mean()
    va, vb = a.var(), b.var()
    cov = ((a - mu_a) * (b - mu_b)).mean()
    return ((2 * mu_a * mu_b + c1) * (2 * cov + c2)) / ((mu_a ** 2 + mu_b ** 2 + c1) * (va + vb + c2))

def block_ssim(a, b, block=8):
    """Mean of local SSIM over block x block windows on a small grey thumbnail (structure of the layout)."""
    a = np.asarray(a, dtype=np.float64); b = np.asarray(b, dtype=np.float64)
    h, w = a.shape; vals = []
    for y in range(0, h - block + 1, block):
        for x in range(0, w - block + 1, block):
            vals.append(ssim_global(a[y:y+block, x:x+block], b[y:y+block, x:x+block]))
    return float(np.mean(vals)) if vals else 0.0

def hist_overlap(a, b):
    """Colour histogram intersection (8 bins per channel)."""
    def h(im):
        arr = np.asarray(im.resize((128, max(1, round(im.height * 128 / im.width)))), dtype=np.uint8) // 32
        idx = arr[..., 0] * 64 + arr[..., 1] * 8 + arr[..., 2]
        hist = np.bincount(idx.ravel(), minlength=512).astype(np.float64)
        return hist / hist.sum()
    return float(np.minimum(h(a), h(b)).sum())

def similarity(fig, app):
    h = min(fig.height, app.height)
    f, a = fig.crop((0, 0, fig.width, h)), app.crop((0, 0, app.width, h))
    tw = 64; th = max(8, round(h * tw / fig.width))
    fg = f.convert('L').resize((tw, th), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1))
    ag = a.convert('L').resize((tw, th), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1))
    s_struct = block_ssim(fg, ag)
    s_tone = float(ssim_global(fg, ag))
    s_col = hist_overlap(f, a)
    return {'structure': round(s_struct, 3), 'tone': round(s_tone, 3), 'colour': round(s_col, 3), 'score': round((s_struct + s_tone + s_col) / 3, 3), 'sharedHeight': h}

def font(size):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def composite(key, fig, app, score, label):
    gutter, header = 24, 44
    w = fig.width * 2 + gutter * 3
    h = max(fig.height, app.height) + header + gutter
    canvas = Image.new('RGB', (w, h), (240, 240, 244))
    d = ImageDraw.Draw(canvas)
    f = font(16 if fig.width < 600 else 22)
    d.text((gutter, 12), f'{key}  Figma export', fill=(20, 20, 30), font=f)
    d.text((gutter * 2 + fig.width, 12), f'app {label}  similarity {score["score"]:.2f} (structure {score["structure"]:.2f} / tone {score["tone"]:.2f} / colour {score["colour"]:.2f})', fill=(20, 20, 30), font=f)
    canvas.paste(fig, (gutter, header)); canvas.paste(app, (gutter * 2 + fig.width, header))
    d.rectangle((gutter - 1, header - 1, gutter + fig.width, header + fig.height), outline=(180, 180, 190))
    d.rectangle((gutter * 2 + fig.width - 1, header - 1, gutter * 2 + fig.width * 2, header + app.height), outline=(180, 180, 190))
    return canvas

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    label = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--label=')), '')
    keys = args or list(PAIRS)
    scores_path = os.path.join(OUT, 'scores.json')
    scores = json.load(open(scores_path)) if os.path.exists(scores_path) else {}
    for key in keys:
        exp, crop = PAIRS[key]
        fig = load(os.path.join(EXPORTS, exp), crop)
        app = load(os.path.join(SHOTS, f'{key}.png'))
        app = fit_width(app, fig.width)
        sc = similarity(fig, app)
        composite(key, fig, app, sc, label).save(os.path.join(OUT, f'{key}.png'), optimize=True)
        scores.setdefault(key, {})[label or 'current'] = sc
        print(f'{key:12s} {exp:32s} score {sc["score"]:.3f}  structure {sc["structure"]:.3f}  tone {sc["tone"]:.3f}  colour {sc["colour"]:.3f}  ({fig.width}x{fig.height} vs app {app.height} tall)')
    json.dump(scores, open(scores_path, 'w'), indent=1)

if __name__ == '__main__':
    main()
