import json, sys, re, glob, importlib.util
BOOKS = None
p = 'www/index.html'; s = open(p, encoding='utf-8').read()
# merged chapter notes
N = {}
for f in sorted(glob.glob('scroll/notes/n*.py')):
    spec = importlib.util.spec_from_file_location('m', f); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    for b, arr in m.N.items(): N[b] = arr
js = open('scroll/scroll.js').read().replace('__CHN__', json.dumps(N, ensure_ascii=False))
css = open('scroll/scroll.css').read()
s = re.sub(re.escape('/* scroll-css:start */') + '.*?' + re.escape('/* scroll-css:end */\n'), '', s, flags=re.S)
s = re.sub(re.escape('/* scroll-js:start */') + '.*?' + re.escape('/* scroll-js:end */\n'), '', s, flags=re.S)
i = s.index('</style>'); s = s[:i] + '/* scroll-css:start */\n' + css + '\n/* scroll-css:end */\n' + s[i:]
anchor = '/* people-js:start */'; assert anchor in s
s = s.replace(anchor, '/* scroll-js:start */\n' + js + '\n/* scroll-js:end */\n' + anchor, 1)
if 'function sevenCardHTML_old' not in s:
    s = s.replace('function sevenCardHTML(){', 'function sevenCardHTML_old(){', 1).replace('function bindSeven(){', 'function bindSeven_old(){', 1)
if 'data-tab="pray"' not in s:
    s = s.replace('<button class="tab" data-tab="play">', '<button class="tab" data-tab="pray"><svg class="ico" viewBox="0 0 24 24"><use href="#i-hands"/></svg>Pray</button>\n      <button class="tab" data-tab="play">', 1)
s = s.replace('.tabbar{flex:none; display:grid; grid-template-columns:repeat(3,1fr)', '.tabbar{flex:none; display:grid; grid-template-columns:repeat(4,1fr)', 1)
if 'renderPray();' not in s.split('/* scroll-js:start */')[0]:
    s = s.replace('  else if(tab === "saved") renderSaved();', '  else if(tab === "pray") renderPray();\n  else if(tab === "saved") renderSaved();', 1)
    s = s.replace('  view.scrollTop = 0;\n  if(tab === "today"){ renderToday();', '  view.scrollTop = 0;\n  if(tab !== "pray") prStop();\n  if(tab === "today"){ renderToday();', 1)
open(p, 'w', encoding='utf-8').write(s)
print('notes books', len(N), 'chapters', sum(len(v) for v in N.values()))
# sanity: note count must equal chapter count for every book
_i = s.index('const BIBLE = ') + len('const BIBLE = ')
_B, _ = json.JSONDecoder().raw_decode(s[_i:])
_bad = [(k, len(N.get(k, [])), len(v)) for k, v in _B.items() if len(N.get(k, [])) != len(v)]
assert not _bad, _bad
print('note counts match BIBLE for all', len(_B), 'books')
