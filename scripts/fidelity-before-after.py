#!/usr/bin/env python3
"""3-panel composites for Slack: [Figma export | before (v0.1.0 capture from git) | after (current capture)].

Usage: python3 scripts/fidelity-before-after.py [--before=8ec320a] [--out=/home/claude/petrock-fidelity-shots]
Pairs: home  = Home Page.png | docs/screenshots/C-10/390.jpg (git) | docs/screenshots/C-10/390.jpg (working tree)
       desk  = front desk.jpg | docs/screenshots/F-10/1280.jpg (git) | docs/design/fidelity/_shots/F-10.png (1440) or F-10/1280.jpg
Every panel is fitted to the same width, the shared height is the Figma export's height (plus a labelled header).
Needs Pillow. Icons grid: node scripts/fidelity-icon-grid.mjs.
"""
import io, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORTS = os.path.join(ROOT, 'docs/figma/exports/petrock-main')
args = {a.split('=')[0][2:]: a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--')}
BEFORE = args.get('before', '8ec320a')
OUT = args.get('out', '/home/claude/petrock-fidelity-shots')
os.makedirs(OUT, exist_ok=True)

def git_image(rev, path):
    data = subprocess.check_output(['git', '-C', ROOT, 'show', f'{rev}:{path}'])
    return Image.open(io.BytesIO(data)).convert('RGB')

def fit_width(im, w):
    return im if im.width == w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)

def font(size, bold=False):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
              os.path.join(ROOT, 'node_modules/@fontsource/open-sans/files/open-sans-latin-700-normal.woff2')]:
        if os.path.exists(p) and p.endswith('.ttf'):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def compose(panels, labels, title, out, panel_w, gap=24, pad=32, header=72):
    ims = [fit_width(im, panel_w) for im in panels]
    h = max(im.height for im in ims)
    h = min(h, ims[0].height + 40)  # clip to the export's height (+ a little slack)
    W = pad * 2 + panel_w * 3 + gap * 2
    H = header + pad + h + pad
    canvas = Image.new('RGB', (W, H), '#F4F0FF')
    d = ImageDraw.Draw(canvas)
    d.text((pad, 22), title, fill='#181818', font=font(26, True))
    for i, (im, lab) in enumerate(zip(ims, labels)):
        x = pad + i * (panel_w + gap)
        d.text((x, header - 4), lab, fill='#552583', font=font(18, True))
        y = header + pad
        crop = im.crop((0, 0, panel_w, min(im.height, h)))
        canvas.paste(Image.new('RGB', (panel_w + 4, h + 4), '#D8DADE'), (x - 2, y - 2))
        canvas.paste(Image.new('RGB', (panel_w, h), '#FFFFFF'), (x, y))
        canvas.paste(crop, (x, y))
    canvas.save(out, quality=88)
    print(out, canvas.size)

# home: C-10 at 390
home_export = Image.open(os.path.join(EXPORTS, 'Home Page.png')).convert('RGB')
home_before = git_image(BEFORE, 'docs/screenshots/C-10/390.jpg')
home_after = Image.open(os.path.join(ROOT, 'docs/screenshots/C-10/390.jpg')).convert('RGB')
compose([home_export, home_before, home_after],
        ['Figma  ·  Home Page.png', f'Before  ·  v0.1.0 ({BEFORE})', 'After  ·  v0.2.0'],
        'C-10 Customer home (390)', os.path.join(OUT, 'home-before-after.jpg'), 390)

# desk: F-10 at 1440 (export) - panels fitted to 900 px each
desk_export = Image.open(os.path.join(EXPORTS, 'front desk.jpg')).convert('RGB')
desk_before = git_image(BEFORE, 'docs/screenshots/F-10/1280.jpg')
shot = os.path.join(ROOT, 'docs/design/fidelity/_shots/F-10.png')
desk_after = Image.open(shot if os.path.exists(shot) else os.path.join(ROOT, 'docs/screenshots/F-10/1280.jpg')).convert('RGB')
compose([desk_export, desk_before, desk_after],
        ['Figma  ·  front desk.jpg', f'Before  ·  v0.1.0 ({BEFORE})', 'After  ·  v0.2.0'],
        'F-10 Front desk reservations', os.path.join(OUT, 'desk-before-after.jpg'), 900)
