import json, sys, os
sys.path.insert(0, 'scenes'); from scenes import S
man = json.load(open('www/scenes/manifest.json'))
data = [{"id":sid, "title":t, "r":list(r), "hook":h} for sid, img, t, r, h in S if sid in man]
p = 'www/index.html'; s = open(p, encoding='utf-8').read()
css = open('scenes/feed.css').read(); js = open('scenes/feed.js').read().replace('__SCENES__', json.dumps(data, ensure_ascii=False))
A, B = '/* scenes:start */', '/* scenes:end */'
def put(s, anchor, block, before=True):
    if A + block[:0] in s and False: pass
    return s.replace(anchor, (block + anchor) if before else (anchor + block), 1)
# remove previous injection
import re
s = re.sub(re.escape('/* scenes-css:start */') + '.*?' + re.escape('/* scenes-css:end */'), '', s, flags=re.S)
s = re.sub(re.escape('/* scenes-js:start */') + '.*?' + re.escape('/* scenes-js:end */'), '', s, flags=re.S)
i = s.index('</style>'); s = s[:i] + '/* scenes-css:start */\n' + css + '/* scenes-css:end */\n' + s[i:]
anchor = '/* ---------- DECK (today'
assert anchor in s; s = s.replace(anchor, '/* scenes-js:start */\n' + js + '/* scenes-js:end */\n' + anchor, 1)
old = '    ${sevenCardHTML()}\n    ${planCardHTML()}\n    <label class="search">'
if '${scenesCardHTML()}' not in s:
    assert old in s; s = s.replace(old, '    ${scenesCardHTML()}\n' + old, 1)
old2 = '  bindSeven(); bindPlan();\n  view.querySelectorAll(".chips .chip[data-b]")'
if 'openScenes").onclick' not in s:
    assert old2 in s; s = s.replace(old2, '  $("#openScenes").onclick = openScenes;\n' + old2, 1)
open(p, 'w', encoding='utf-8').write(s); print(len(data), 'scenes')
