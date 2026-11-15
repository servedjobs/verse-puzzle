import json, sys, re, os
sys.path.insert(0, os.path.dirname(__file__))
import full_a, full_b, full_c, full_d, full_e, full_f  # noqa: registers categories in order
from full_a import CATS
from relations import EXTRA, REL
from long_peter import LONG as L1
from long_twelve import LONG as L2
LONG = {**L2, **L1}
for c in CATS:
    for pp in c["people"]:
        x = LONG.get(pp["id"])
        if not x: continue
        if x.get("cards"): pp["cards"] = x["cards"]
        pp["intro"] = [list(s) for s in x.get("intro", [])]
        pp["outro"] = [list(s) for s in x.get("outro", [])]
ids = {p["id"] for c in CATS for p in c["people"]}
for a, r, b in REL:
    for x in (a, b):
        assert x in ids or x in EXTRA, ("unknown person", x)
p = 'www/index.html'; s = open(p, encoding='utf-8').read()
css = open('people/people.css').read()
js = (open('people/people.js').read().replace('__PCATS__', json.dumps(CATS, ensure_ascii=False))
      .replace('__PEXTRA__', json.dumps(EXTRA, ensure_ascii=False)).replace('__PREL__', json.dumps(REL)))
s = re.sub(re.escape('/* people-css:start */') + '.*?' + re.escape('/* people-css:end */\n'), '', s, flags=re.S)
s = re.sub(re.escape('/* people-js:start */') + '.*?' + re.escape('/* people-js:end */\n'), '', s, flags=re.S)
i = s.index('</style>'); s = s[:i] + '/* people-css:start */\n' + css + '/* people-css:end */\n' + s[i:]
anchor = '/* ---------- DECK (today'
s = s.replace(anchor, '/* people-js:start */\n' + js + '/* people-js:end */\n' + anchor, 1)
if '${peopleCardHTML()}' not in s:
    s = s.replace('    ${scenesCardHTML()}\n', '    ${scenesCardHTML()}\n    ${peopleCardHTML()}\n', 1)
if 'openPeople").onclick' not in s:
    s = s.replace('  $("#openScenes").onclick = openScenes;\n', '  $("#openScenes").onclick = openScenes;\n  $("#openPeople").onclick = () => openPeople();\n', 1)
open(p, 'w', encoding='utf-8').write(s)
print(len(ids), "people with stories,", len(EXTRA), "more on the map,", len(REL), "connections")
