import json, os, subprocess, numpy as np, soundfile as sf
from kokoro import KPipeline
S = json.load(open('voice/people.json'))
os.makedirs('voice/pout/v', exist_ok=True)
pipe = KPipeline(lang_code='a'); sr = 24000; meta = {}
if os.path.exists('voice/pout/narr.json'): meta = json.load(open('voice/pout/narr.json'))
for sid, d in S.items():
    lines = d['lines']
    if sid in meta and os.path.exists(f'voice/pout/v/{sid}.mp3') and meta[sid]['lines'] == lines: continue
    parts = [np.zeros(int(sr*0.6))]; t = 0.6; times = []
    for i, line in enumerate(lines):
        a = np.concatenate([np.asarray(c, dtype=np.float32) for _, _, c in pipe(line, voice='af_heart', speed=0.95)])
        times.append([round(t, 2), round(t + len(a)/sr, 2)]); parts.append(a); t += len(a)/sr
        newsec = i + 1 < len(lines) and d['sec'][i+1] != d['sec'][i]
        gap = 0.9 if newsec else (0.5 if line.rstrip().endswith(('.', '”', '!', '?')) else 0.3)
        parts.append(np.zeros(int(sr*gap))); t += gap
    sf.write('/tmp/x.wav', np.concatenate(parts), sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/x.wav', '-ac', '1', '-b:a', '40k', f'voice/pout/v/{sid}.mp3'], check=True)
    meta[sid] = {"lines": lines, "sec": d['sec'], "times": times, "dur": round(t, 1)}; print(sid, round(t, 1), flush=True)
    json.dump(meta, open('voice/pout/narr.json', 'w'), ensure_ascii=False)
