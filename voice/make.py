import json, os, subprocess, numpy as np, soundfile as sf
from kokoro import KPipeline
S = json.load(open('voice/lines.json'))
os.makedirs('voice/out/v', exist_ok=True)
pipe = KPipeline(lang_code='a'); sr = 24000; meta = {}
if os.path.exists('voice/out/narr.json'): meta = json.load(open('voice/out/narr.json'))
SH = int(os.environ.get('SHARD', 0)); NS = int(os.environ.get('NSHARD', 1)); mine = {}
for n, (sid, lines) in enumerate(S.items()):
    if n % NS != SH: continue
    def ok():
        f = f'voice/out/v/{sid}.mp3'
        if sid not in meta or not os.path.exists(f) or meta[sid]['lines'] != lines: return False
        try: d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode().strip())
        except Exception: return False
        return abs(d - meta[sid]['dur']) < 3
    if ok(): continue
    parts = [np.zeros(int(sr*0.6))]; t = 0.6; times = []
    for line in lines:
        a = np.concatenate([np.asarray(c, dtype=np.float32) for _, _, c in pipe(line, voice='af_heart', speed=0.95)])
        times.append([round(t, 2), round(t + len(a)/sr, 2)]); parts.append(a); t += len(a)/sr
        gap = 0.5 if line.rstrip().endswith(('.', '”', '!', '?')) else 0.3
        parts.append(np.zeros(int(sr*gap))); t += gap
    sf.write('/tmp/x.wav', np.concatenate(parts), sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/x.wav', '-ac', '1', '-b:a', '32k', f'voice/out/v/{sid}.mp3'], check=True)
    meta[sid] = mine[sid] = {"lines": lines, "times": times, "dur": round(t, 1)}; print(sid, round(t, 1), flush=True)
for sid in S:
    if sid in meta and sid not in mine and list(S).index(sid) % NS == SH: mine[sid] = meta[sid]
json.dump(mine, open(f'voice/out/narr_{SH}.json', 'w'), ensure_ascii=False)
