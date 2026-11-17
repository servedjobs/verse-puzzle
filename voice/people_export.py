import sys, os, re, json
sys.path.insert(0, 'people')
import full_a, full_b, full_c, full_d, full_e, full_f
from full_a import CATS
from long_peter import LONG as L1
from long_twelve import LONG as L2
from long_nt import LONG as L3
from long_ot import LONG as L4
from long_twelve2 import CARDS as LC
from long_full import LONG as L0
LONG = {**L4, **L3, **L2, **L1, **L0}
for k, v in LC.items(): LONG.setdefault(k, {})["cards"] = v
def split(t):
    m = re.split(r'(?<=[.!?”"])\s+(?=[A-Z“"‘\'])', t.strip()); out = []
    for s in m:
        if out and len(s) < 25: out[-1] += ' ' + s
        else: out.append(s)
    return out
R = {}
for c in CATS:
    for p in c['people']:
        x = LONG.get(p['id'], {}); cards = x.get('cards') or p['cards']
        secs = [(s[0], s[1]) for s in x.get('intro', [])] + [(k['h'], k.get('more') or k['t']) for k in cards] + [(s[0], s[1]) for s in x.get('outro', [])]
        lines = []; sec = []
        for i, (h, t) in enumerate(secs):
            lines.append(h.rstrip('.') + '.'); sec.append(i)
            for para in re.split(r'\n\n+', t):
                for s in split(para): lines.append(s); sec.append(i)
        R[p['id']] = {"lines": lines, "sec": sec}
json.dump(R, open('voice/people.json', 'w'), ensure_ascii=False)
print(len(R), sum(len(v['lines']) for v in R.values()))
