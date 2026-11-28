"""Put the chair logo everywhere the app uses an icon or splash. Run from the repo root:
  python3 logo/install.py
"""
import os, glob, subprocess, sys
from PIL import Image, ImageDraw
T = 'logo/out'; os.makedirs(T, exist_ok=True)
subprocess.check_call([sys.executable, 'logo/make_logo.py', f'{T}/logo-1024.png', '1024'])
subprocess.check_call([sys.executable, 'logo/make_logo.py', f'{T}/logo-wide-1024.png', '1024', '0.84'])
logo = Image.open(f'{T}/logo-1024.png').convert('RGB'); wide = Image.open(f'{T}/logo-wide-1024.png').convert('RGB')
CREAM, DARK = (252, 243, 220), (38, 24, 12)
def rounded(im, r):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], r, fill=255)
    o = im.convert('RGBA'); o.putalpha(m); return o
def splash(w, h, bg):
    c = Image.new('RGB', (w, h), bg); s = int(min(w, h) * 0.34); t = rounded(logo.resize((s, s), Image.LANCZOS), int(s * 0.2))
    c.paste(t, ((w - s) // 2, (h - s) // 2), t); return c
# sources kept in assets/
logo.save('assets/icon-only.png'); wide.convert('RGBA').save('assets/icon-foreground.png'); Image.new('RGB', (1024, 1024), CREAM).save('assets/icon-background.png')
splash(2732, 2732, CREAM).save('assets/splash.png'); splash(2732, 2732, DARK).save('assets/splash-dark.png')
# iOS
logo.save('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
for f in glob.glob('ios/App/App/Assets.xcassets/Splash.imageset/*.png'): splash(2732, 2732, CREAM).save(f)
# Android launcher icons
for d, px in (('ldpi', 36), ('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)):
    base = f'android/app/src/main/res/mipmap-{d}'
    if not os.path.isdir(base): continue
    fg = int(px * 108 / 48)
    rounded(logo.resize((px, px), Image.LANCZOS), int(px * 0.18)).save(f'{base}/ic_launcher.png')
    r = wide.resize((px, px), Image.LANCZOS).convert('RGBA'); m = Image.new('L', (px * 4, px * 4), 0); ImageDraw.Draw(m).ellipse([0, 0, px * 4 - 1, px * 4 - 1], fill=255); r.putalpha(m.resize((px, px), Image.LANCZOS)); r.save(f'{base}/ic_launcher_round.png')
    wide.resize((fg, fg), Image.LANCZOS).convert('RGBA').save(f'{base}/ic_launcher_foreground.png')
    Image.new('RGB', (fg, fg), CREAM).save(f'{base}/ic_launcher_background.png')
# Android splash screens (night folders get the dark one)
for f in glob.glob('android/app/src/main/res/drawable*/splash.png'):
    w, h = Image.open(f).size; splash(w, h, DARK if 'night' in f else CREAM).save(f)
# in-app header, store listing
logo.resize((192, 192), Image.LANCZOS).save('www/img/logo-icon.png')
logo.resize((512, 512), Image.LANCZOS).save('store/app-icon-512.png')
print('installed')
