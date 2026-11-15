import json, os, sys, time, urllib.request, urllib.parse, io
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__)); from scenes import S
UA = {"User-Agent": "PrayerChairSceneFetcher/1.0 (https://prayerchair.app; erik app build)"}
def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: return r.read()
        except Exception as e:
            print("retry", url, e); time.sleep(3 + i * 5)
    raise RuntimeError(url)
API = "https://commons.wikimedia.org/w/api.php?"
cat = []; cont = {}
while True:
    q = {"action":"query","list":"categorymembers","cmtitle":"Category:Doré's English Bible","cmtype":"file","cmlimit":"500","format":"json", **cont}
    j = json.loads(get(API + urllib.parse.urlencode(q)))
    cat += [m["title"][5:] for m in j["query"]["categorymembers"]]
    if "continue" not in j: break
    cont = {"cmcontinue": j["continue"]["cmcontinue"]}
out = "www/scenes"; os.makedirs(out, exist_ok=True); ok = {}
for sid, img, *_ in S:
    name = img
    if img.startswith("pfx:"):
        m = [c for c in cat if c.startswith(img[4:])]
        if not m: print("NO MATCH", sid, img); continue
        name = m[0]
    q = {"action":"query","titles":"File:" + name,"prop":"imageinfo","iiprop":"url|size","iiurlwidth":"900","format":"json"}
    j = json.loads(get(API + urllib.parse.urlencode(q)))
    pg = next(iter(j["query"]["pages"].values()))
    if "imageinfo" not in pg: print("MISSING", sid, name); continue
    ii = pg["imageinfo"][0]; url = ii.get("thumburl") or ii["url"]
    im = Image.open(io.BytesIO(get(url))).convert("L")  # engravings: grayscale keeps files small
    im.thumbnail((900, 1200), Image.LANCZOS)
    im.save(f"{out}/{sid}.jpg", "JPEG", quality=74, optimize=True, progressive=True)
    ok[sid] = {"file": name, "w": im.width, "h": im.height}
    print("ok", sid, name, im.size, os.path.getsize(f"{out}/{sid}.jpg"))
    time.sleep(0.5)
json.dump(ok, open(f"{out}/manifest.json", "w"), indent=1, ensure_ascii=False)
print(len(ok), "of", len(S))
