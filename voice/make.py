import json, os, subprocess, numpy as np, soundfile as sf
from kokoro import KPipeline
S = json.load(open('voice/lines.json'))
VOICES = {"george": ("b", "bm_george"), "michael": ("a", "am_michael"), "heart": ("a", "af_heart")}
os.makedirs('voice/out', exist_ok=True); meta = {}
for name, (lang, v) in VOICES.items():
    pipe = KPipeline(lang_code=lang); sr = 24000; parts = []; times = []; t = 0.0
    parts.append(np.zeros(int(sr*0.6))); t += 0.6
    for line in S:
        chunks = [a for _, _, a in pipe(line, voice=v, speed=0.95)]
        a = np.concatenate([np.asarray(c, dtype=np.float32) for c in chunks])
        times.append([round(t, 2), round(t + len(a)/sr, 2)]); parts.append(a); t += len(a)/sr
        gap = 0.55 if line.rstrip().endswith(('.', '”', '!', '?')) else 0.3
        parts.append(np.zeros(int(sr*gap))); t += gap
    sf.write(f'voice/out/{name}.wav', np.concatenate(parts), sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'voice/out/{name}.wav', '-ac', '1', '-b:a', '64k', f'voice/out/{name}.mp3'], check=True)
    os.remove(f'voice/out/{name}.wav'); meta[name] = times; print(name, round(t, 1), 's')
json.dump(meta, open('voice/out/times.json', 'w'))
