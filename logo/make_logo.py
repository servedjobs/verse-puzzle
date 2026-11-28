"""PrayerChair logo: a plain carpenter's chair in window light, drawn as a hand-tinted engraving
to sit beside the Dore plates used in the app. Pure code, no outside artwork.
  python3 logo/make_logo.py out.png [size] [zoom]     zoom < 1 pulls back to show more room (Android adaptive icon)
"""
import sys, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
N = 2048                                   # working size; saved at half
rng = np.random.default_rng(7)
ZOOM = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
C = int(round(N / ZOOM)); OFF = (C - N) / 2   # canvas is bigger than the picture when pulled back

# ---------- chair geometry (seat is 1 wide, 1 deep, 1 high) ----------
def box(x0, x1, y0, y1, z0, z1, grain, top=True): return dict(lo=np.array([x0, y0, z0], float), hi=np.array([x1, y1, z1], float), grain=grain, top=top, bias=0.0)
L = 0.15                                   # leg thickness
boxes = [
  box(0, L, 0, 0.98, 1 - L, 1, 'y', False), box(1 - L, 1, 0, 0.98, 1 - L, 1, 'y', False),             # front legs
  box(0, L, 0, 2.28, 0, L, 'y'), box(1 - L, 1, 0, 2.28, 0, L, 'y'),                   # back posts
  dict(box(-0.05, 1.05, 0.98, 1.12, -0.03, 1.06, 'x'), bias=0.45),                                     # seat plank
  box(L, 1 - L, 0.80, 0.97, 1 - L + 0.02, 1 - 0.02, 'x', False),                             # front apron
  box(0.02, L - 0.02, 0.80, 0.97, L, 1 - L, 'z', False), box(1 - L + 0.02, 1 - 0.02, 0.80, 0.97, L, 1 - L, 'z', False),  # side aprons
  box(L, 1 - L, 0.36, 0.46, 1 - L + 0.03, 1 - 0.03, 'x'),                             # front stretcher
  box(0.03, L - 0.03, 0.30, 0.40, L, 1 - L, 'z'), box(1 - L + 0.03, 1 - 0.03, 0.30, 0.40, L, 1 - L, 'z'),  # side stretchers
  box(L, 1 - L, 1.42, 1.66, 0.03, L - 0.03, 'x'),                                     # lower back slat
  box(L, 1 - L, 1.86, 2.18, 0.03, L - 0.03, 'x'),                                     # top back slat
]
yaw, pitch = math.radians(-33), math.radians(17)
Ry = np.array([[math.cos(yaw), 0, math.sin(yaw)], [0, 1, 0], [-math.sin(yaw), 0, math.cos(yaw)]])
Rx = np.array([[1, 0, 0], [0, math.cos(pitch), -math.sin(pitch)], [0, math.sin(pitch), math.cos(pitch)]])
R = Rx @ Ry
SC, CX, CY = 650, N * 0.535, N * 0.875      # scale and where the chair's floor centre lands
def proj(p):                               # world -> screen (x right, y down), plus depth toward viewer
    q = R @ (np.asarray(p, float) - np.array([0.5, 0, 0.5]))
    return np.array([CX + q[0] * SC, CY - q[1] * SC]), q[2]
LIGHT = np.array([-0.62, 0.66, 0.42]); LIGHT /= np.linalg.norm(LIGHT)   # toward the window, up and to the left
TRAVEL = -LIGHT

tone = np.zeros((C, C), np.float32)        # 1 = paper white, 0 = solid ink
ang = np.zeros((C, C), np.float32)         # direction the engraved lines run, radians
warm = np.zeros((C, C), np.float32)        # where sunlight falls
wood = np.zeros((C, C), np.float32)        # where the chair is
yy, xx = np.mgrid[0:C, 0:C].astype(np.float32); yy -= OFF; xx -= OFF

def poly_mask(pts, blur=0):
    im = Image.new('L', (C, C), 0); ImageDraw.Draw(im).polygon([(p[0] + OFF, p[1] + OFF) for p in pts], fill=255)
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(im, np.float32) / 255

# ---------- room: back wall, floor, window ----------
HZ = N * 0.60                              # where wall meets floor
wall = yy < HZ
vig = np.clip(1 - (((xx - N * 0.42) / (N * 0.95)) ** 2 + ((yy - N * 0.45) / (N * 0.95)) ** 2), 0, 1)
tone[:] = np.where(wall, 0.62 + 0.24 * vig, 0.64 + 0.24 * vig)
ang[:] = np.where(wall, math.radians(57), math.radians(3))

# window, top left, deep-set with a cross of glazing bars
WX0, WX1, WY0, WY1 = N * 0.075, N * 0.375, N * 0.06, N * 0.40
arch = lambda x0, x1, y0, y1: ((xx > x0) & (xx < x1) & (yy > y0 + (x1 - x0) / 2) & (yy < y1)) | ((((xx - (x0 + x1) / 2) ** 2 + (yy - (y0 + (x1 - x0) / 2)) ** 2) < ((x1 - x0) / 2) ** 2) & (yy <= y0 + (x1 - x0) / 2))
frame = arch(WX0 - 44, WX1 + 44, WY0 - 44, WY1 + 40)
glass = arch(WX0, WX1, WY0, WY1)
tone[frame] = 0.40; ang[frame] = math.radians(90)
tone[glass] = 1.0
mx, my = (WX0 + WX1) / 2, WY0 + (WY1 - WY0) * 0.52
bars = glass & ((np.abs(xx - mx) < 13) | (np.abs(yy - my) < 13))
tone[bars] = 0.30
sill = (xx > WX0 - 80) & (xx < WX1 + 80) & (yy > WY1 + 40) & (yy < WY1 + 84)
tone[sill] = 0.72; ang[sill] = 0.0

# shafts of light fanning from the window down to the floor
beam_pts = [(WX0 + 10, WY0 + 120), (WX1 - 4, WY0 + 30), (N * 1.9, N * 1.22), (N * 1.9, N * 1.9), (N * 0.72, N * 1.9)]
beam = poly_mask(beam_pts, 46)
streak = 0.5 + 0.5 * np.sin(((xx - WX1) * math.sin(math.radians(57)) - (yy - WY0) * math.cos(math.radians(57))) / 46.0)
tone += beam * (0.10 + 0.09 * streak) * (tone < 0.99)
warm += beam * 0.75

# pool of sunlight on the floor: the window's shape thrown down, with the cross as shadow
def floor_pt(u, v):                        # u across, v away from viewer, in chair units
    return proj([u, 0, v])[0]
c0 = floor_pt(0.75, 0.75)
pool = np.clip(1.25 - (((xx - c0[0]) / (N * 0.52)) ** 2 + ((yy - c0[1]) / (N * 0.20)) ** 2), 0, 1) ** 0.8
tone = np.where(wall, tone, np.maximum(tone, tone + pool * 0.34))
warm = np.maximum(warm, pool * (~wall) * 1.0)

# glow around the glass
glow = np.asarray(Image.fromarray((glass * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(70)), np.float32) / 255
tone += glow * 0.30 * (~glass) * (~bars); warm = np.maximum(warm, glow * 1.2); warm[glass & ~bars] = 1.0

# ---------- chair shadow on the floor ----------
sh = np.zeros((C, C), np.float32)
for b in boxes:
    c = [np.array([x, y, z]) for x in (b['lo'][0], b['hi'][0]) for y in (b['lo'][1], b['hi'][1]) for z in (b['lo'][2], b['hi'][2])]
    pts = []
    for p in c:
        t = p[1] / -TRAVEL[1]; g = p + TRAVEL * t; pts.append(proj([g[0], 0, g[2]])[0])
    pts = np.array(pts); ctr = pts.mean(0); order = np.argsort(np.arctan2(pts[:, 1] - ctr[1], pts[:, 0] - ctr[0]))
    # convex hull of the eight shadow points
    def hull(P):
        P = sorted(map(tuple, P)); 
        def half(S):
            h = []
            for p in S:
                while len(h) >= 2 and ((h[-1][0]-h[-2][0])*(p[1]-h[-2][1]) - (h[-1][1]-h[-2][1])*(p[0]-h[-2][0])) <= 0: h.pop()
                h.append(p)
            return h
        lo, up = half(P), half(P[::-1]); return lo[:-1] + up[:-1]
    sh = np.maximum(sh, poly_mask(hull(pts), 0))
sh = np.asarray(Image.fromarray((sh * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9)), np.float32) / 255
sh *= (~wall)
tone = tone * (1 - sh * 0.52); warm *= (1 - sh * 0.8)
ang = np.where(sh > 0.5, math.radians(-28), ang)

# ---------- chair ----------
faces = []
V = R.T @ np.array([0, 0, 1.0])            # toward viewer, in world space
for b in boxes:
    lo, hi = b['lo'], b['hi']
    for ax in range(3):
        for s in (0, 1):
            n = np.zeros(3); n[ax] = 1 if s else -1
            if n @ V <= 0.02: continue
            if ax == 1 and s and not b['top']: continue
            o = [i for i in range(3) if i != ax]; f = lo.copy(); f[ax] = hi[ax] if s else lo[ax]
            c4 = []
            for du, dv in ((0, 0), (1, 0), (1, 1), (0, 1)):
                p = f.copy(); p[o[0]] = hi[o[0]] if du else lo[o[0]]; p[o[1]] = hi[o[1]] if dv else lo[o[1]]; c4.append(p)
            c4 = np.array(c4); depth = np.mean([proj(p)[1] for p in c4]) + b['bias']
            g = {'x': np.array([1, 0, 0.]), 'y': np.array([0, 1, 0.]), 'z': np.array([0, 0, 1.])}[b['grain']]
            if abs(g @ n) > 0.5:               # end grain: run lines the other way
                g = np.zeros(3); g[o[0]] = 1
            a2, b2 = proj(c4.mean(0))[0], proj(c4.mean(0) + g)[0]
            faces.append((depth, c4, n, math.atan2(b2[1] - a2[1], b2[0] - a2[0])))
faces.sort(key=lambda t: t[0])
edges = Image.new('L', (C, C), 0); ed = ImageDraw.Draw(edges)
for depth, c4, n, ga in faces:
    pts = [tuple(proj(p)[0]) for p in c4]; m = poly_mask(pts) > 0.5; pts = [(x + OFF, y + OFF) for x, y in pts]
    lit = max(0.0, float(n @ LIGHT))
    t = 0.34 + 0.62 * lit ** 0.8
    if n[1] > 0.5: t = min(1.0, t + 0.10)     # tops catch the sun
    tone[m] = t; ang[m] = ga; wood[m] = 1.0; warm[m] = 0.25 + 0.75 * lit
    ed.polygon(pts, fill=0)
    ed.line(pts + [pts[0]], fill=255, width=7, joint='curve')
wood_soft = wood

# ---------- engrave ----------
def lines(t, a, period, wobble):
    nx, ny = -np.sin(a), np.cos(a)            # across the lines
    u = (xx * nx + yy * ny) / period + wobble
    v = np.abs((u - np.floor(u)) - 0.5) * 2   # 0 on the line, 1 between lines
    d = np.clip(1 - t, 0, 1)
    w = d * 1.08
    return np.clip((w - v) / (2.2 / period) + 0.5, 0, 1) * (d > 0.035)
lowf = np.asarray(Image.fromarray((rng.random((C // 64 + 1, C // 64 + 1)) * 255).astype(np.uint8)).resize((C, C), Image.BICUBIC), np.float32) / 255
tone = np.clip(tone, 0, 1)
ink = lines(tone, ang, 15.0, lowf * 0.55)
cross = lines(np.clip(tone * 2.0, 0, 1) * 0.5 + 0.5 * (tone > 0.5), ang + math.radians(64), 17.0, lowf * 0.5) * (tone < 0.46)
ink = np.maximum(ink, cross * 0.9)
ink = np.maximum(ink, np.asarray(edges.filter(ImageFilter.GaussianBlur(1.1)), np.float32) / 255)
# crisp outlines for the window
for msk in (frame & ~glass, bars):
    e = np.asarray(Image.fromarray((msk * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.0)), np.float32) / 255
    ink = np.maximum(ink, e)

# ---------- hand tint ----------
paper = np.array([252, 243, 220], np.float32); inkc = np.array([62, 36, 16], np.float32)
sun = np.array([255, 205, 104], np.float32); honey = np.array([214, 150, 78], np.float32); sky = np.array([255, 244, 200], np.float32)
warm = np.clip(warm, 0, 1)
base = paper[None, None, :] * np.ones((C, C, 1), np.float32)
base = base * (1 - 0.50 * warm[..., None]) + (base * sun / 255) * (0.50 * warm[..., None])
wmask = np.asarray(Image.fromarray((wood_soft * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)), np.float32)[..., None] / 255
base = base * (1 - wmask) + (base * honey / 255 * 1.10) * wmask
gm = (glass & ~bars)[..., None]
base = np.where(gm, sky[None, None, :], base)
img = base * (1 - ink[..., None]) + inkc[None, None, :] * ink[..., None]
size = int(sys.argv[2]) if len(sys.argv) > 2 else 1024
out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((size, size), Image.LANCZOS)
out.save(sys.argv[1])
print('saved', sys.argv[1], out.size)
