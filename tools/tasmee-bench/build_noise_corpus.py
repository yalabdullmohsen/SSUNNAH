#!/usr/bin/env python3
"""
تسجيلات بلا تلاوة (صمت وضوضاء) لقياس الكلمات الوهمية (hallucination): يجب ألا يُكشف شيء ولا يُخرج المفكِّك كلمات.
الاستعمال: build_noise_corpus.py <corpusDir>  → <corpusDir>/noise/*.wav + manifest.json
"""
import json, os, sys, wave
import numpy as np

SR = 16000
out = os.path.join(sys.argv[1], "noise"); os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(11)
n = SR * 60

def pink(n):
    f = np.fft.rfft(rng.standard_normal(n)); k = np.arange(len(f)); k[0] = 1
    x = np.fft.irfft(f / np.sqrt(k), n); return x / (np.std(x) + 1e-9)

def brown(n):
    x = np.cumsum(rng.standard_normal(n)); x -= np.convolve(x, np.ones(SR) / SR, "same"); return x / (np.std(x) + 1e-9)

def dbfs(x, db): return x * (10 ** (db / 20))

def save(name, x):
    x = np.clip(x, -1, 1)
    with wave.open(os.path.join(out, name + ".wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())

items = {
    "silence_digital": np.zeros(n),
    "silence_dither": rng.integers(-1, 2, n) / 32768.0,
    "room_tone_-50dB": dbfs(pink(n), -50),       # غرفة هادئة (تحت عتبة VAD غالبًا)
    "room_tone_-35dB": dbfs(pink(n), -35),       # غرفة بمروحة/مكيّف
    "pink_loud_-22dB": dbfs(pink(n), -22),       # ضوضاء عالية (تتجاوز VAD)
    "traffic_brown_-24dB": dbfs(brown(n), -24),  # ضجيج شارع منخفض التردد
    "taps_clicks": np.zeros(n),
}
# نقرات/طرقات متفرقة فوق ضوضاء خافتة
x = dbfs(pink(n), -45)
for t in rng.integers(SR, n - SR, 40):
    x[t:t + 400] += dbfs(rng.standard_normal(400), -12) * np.hanning(400)
items["taps_clicks"] = x
for k, v in items.items(): save(k, v)
json.dump([{"id": k, "durationSec": 60} for k in items], open(os.path.join(out, "manifest.json"), "w"), ensure_ascii=False, indent=1)
print("noise corpus:", ", ".join(items))
