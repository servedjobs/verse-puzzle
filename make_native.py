# Turns the published PrayerChair page into the app's www/ (offline fonts, full HTML skeleton).
import re, shutil, os
A='/home/claude/prayerchair-app/'; F=A+'node_modules/@fontsource/'
os.makedirs(A+'www/fonts', exist_ok=True)
faces=[('Inter',400,'normal','inter/files/inter-latin-400-normal.woff2'),('Inter',500,'normal','inter/files/inter-latin-500-normal.woff2'),
 ('Inter',600,'normal','inter/files/inter-latin-600-normal.woff2'),('Inter',700,'normal','inter/files/inter-latin-700-normal.woff2'),
 ('Source Serif 4',400,'normal','source-serif-4/files/source-serif-4-latin-400-normal.woff2'),('Source Serif 4',600,'normal','source-serif-4/files/source-serif-4-latin-600-normal.woff2'),
 ('Source Serif 4',400,'italic','source-serif-4/files/source-serif-4-latin-400-italic.woff2')]
css=''
for fam,w,st,p in faces:
    fn=os.path.basename(p); shutil.copy(F+p, A+'www/fonts/'+fn)
    css+=f"@font-face{{font-family:'{fam}';font-style:{st};font-weight:{w};font-display:swap;src:url(fonts/{fn}) format('woff2')}}"
s=open('/home/claude/prayerchair/prayerchair.html',encoding='utf-8').read()
s=re.sub(r'<link rel="preconnect"[^>]*>\s*','',s)
s=re.sub(r'<link href="https://fonts.googleapis.com[^>]*>\s*','',s)
# the puzzles iframe font link (inside JS)
s=re.sub(r'const fontLink = `[^`]*`;', 'const fontLink = `<style>'+css.replace('\\','\\\\')+'</style>`;', s, count=1)
assert 'fonts.googleapis' not in s, 'google font reference left'
head='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>'+css+'html,body{margin:0}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>\n'
open(A+'www/index.html','w',encoding='utf-8').write(head+s+'\n</html>\n')
print('www/index.html', os.path.getsize(A+'www/index.html'))
