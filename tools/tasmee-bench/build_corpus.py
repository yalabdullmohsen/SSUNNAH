#!/usr/bin/env python3
"""
يبني مدوّنة قياس «تسميع»: مقاطع تلاوة (سورة الملك ١–٦) من قرّاء بسرعات مختلفة + نسخ بضوضاء مُحاكاة،
مع حقيقة أرضية على مستوى الكلمة (بداية/نهاية كل كلمة بالمللي ثانية) من مقاطع Quran.com (segments=true).
الصوت لا يُودَع في المستودع (للقياس المحلي فقط).

الاستعمال: build_corpus.py <corpusDir> <repoPagesDir>
  corpusDir: يحوي ch67_<id>.wav (16kHz mono) و ch67_<id>.json (chapter_recitations?segments=true)
"""
import json, sys, wave, os
import numpy as np

AYAH_FROM, AYAH_TO = 1, 6
SR = 16000

# (اسم، reciter_id، نمط)
CLEAN = [
    ("husary_slow", 6), ("abdulbaset_mujawwad_madd", 1), ("minshawi_murattal", 9), ("afasy_medium", 7),
    ("sudais", 3), ("rifai_fast", 5), ("shuraym_fast", 10), ("abdulbaset_murattal", 2),
]
NOISY = [  # (اسم، المصدر، نوع، SNR dB)
    ("afasy_babble10", "afasy_medium", "babble", 10),
    ("rifai_pink5", "rifai_fast", "pink", 5),
    ("husary_babble10", "husary_slow", "babble", 10),
    ("sudais_phone_pink15", "sudais", "phone+pink", 15),   # نطاق هاتف ضيّق 300–3400Hz: اختبار إجهاد (ميكروفون iPhone عريض النطاق)
    ("sudais_room_pink15", "sudais", "room+pink", 15),     # صدى غرفة (RT60≈0.6ث) + ضوضاء
]

def read_wav(p):
    with wave.open(p) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

def write_wav(p, x):
    x = np.clip(x, -1, 1)
    with wave.open(p, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def pink(n, rng):
    f = np.fft.rfft(rng.standard_normal(n))
    k = np.arange(len(f)); k[0] = 1
    x = np.fft.irfft(f / np.sqrt(k), n)
    return x / (np.std(x) + 1e-9)

def mix_snr(speech, noise, snr_db):
    ps = np.mean(speech ** 2); pn = np.mean(noise ** 2) + 1e-12
    return speech + noise * np.sqrt(ps / (pn * 10 ** (snr_db / 10)))

def bandlimit(x):
    f = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    f[(fr < 300) | (fr > 3400)] = 0
    return np.fft.irfft(f, len(x))

def main(corpus, pages_dir):
    out = os.path.join(corpus, "set"); os.makedirs(out, exist_ok=True)
    rng = np.random.default_rng(7)
    # الكلمات المرجعية من بيانات الصفحات (٥٦٢–٥٦٣)
    ref = []
    for pg in (562, 563):
        for v in json.load(open(os.path.join(pages_dir, f"page-{pg:03d}.json"))):
            n = int(v["verse_number"])
            if v["verse_key"].startswith("67:") and AYAH_FROM <= n <= AYAH_TO:
                for w in v["words"]:
                    if w["char_type_name"] == "word":
                        ref.append({"verseKey": v["verse_key"], "ayah": n, "pos": w["position"],
                                    "textUthmani": w["text_uthmani"], "textQpcHafs": w["text_qpc_hafs"]})
    ref.sort(key=lambda r: (r["ayah"], r["pos"]))
    json.dump(ref, open(os.path.join(out, "ref.json"), "w"), ensure_ascii=False)
    print("ref words:", len(ref))

    clean = {}
    manifest = []
    for name, rid in CLEAN:
        meta = json.load(open(os.path.join(corpus, f"ch67_{rid}.json")))["audio_file"]["timestamps"]
        full = read_wav(os.path.join(corpus, f"ch67_{rid}.wav"))
        segs = {}
        for v in meta:
            n = int(v["verse_key"].split(":")[1])
            if AYAH_FROM <= n <= AYAH_TO:
                segs[n] = v["segments"]
        t0 = segs[AYAH_FROM][0][1]; t1 = segs[AYAH_TO][-1][2]
        a = max(0, int((t0 - 400) / 1000 * SR)); b = min(len(full), int((t1 + 400) / 1000 * SR))
        x = full[a:b]
        shift = (t0 - 400) if t0 >= 400 else 0
        truth = []
        for r in ref:
            seg = next((s for s in segs[r["ayah"]] if s[0] == r["pos"]), None)
            truth.append(None if seg is None else {"startMs": seg[1] - shift, "endMs": seg[2] - shift})
        miss = sum(t is None for t in truth)
        assert miss == 0, f"{name}: {miss} words lack segments"
        clean[name] = x
        write_wav(os.path.join(out, f"{name}.wav"), x)
        json.dump(truth, open(os.path.join(out, f"{name}.truth.json"), "w"))
        manifest.append({"id": name, "reciter": rid, "noise": None, "snrDb": None, "durationSec": round(len(x) / SR, 1)})

    others = list(clean.values())
    for name, src, kind, snr in NOISY:
        x = clean[src]
        n = len(x)
        if kind == "babble":  # ثرثرة: ٤ مقاطع من قرّاء آخرين بإزاحات مختلفة (محاكاة مقهى/مجلس)
            bab = np.zeros(n, dtype=np.float32)
            for i, o in enumerate(k for k in others if k is not x):
                if i >= 4: break
                off = int(rng.integers(0, max(1, len(o) - n))) if len(o) > n else 0
                seg = o[off:off + n]; bab[:len(seg)] += seg
            nz = bab
        else:
            nz = pink(n, rng)
        y = bandlimit(x) if kind.startswith("phone") else x
        if kind.startswith("room"):
            t = np.arange(int(0.6 * SR)) / SR
            ir = rng.standard_normal(len(t)) * np.exp(-6.9 * t / 0.6); ir[0] = 1.0
            nfft = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
            y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:len(x)].astype(np.float32)
            y *= np.sqrt(np.mean(x ** 2) / (np.mean(y ** 2) + 1e-12))
        if kind in ("phone+pink", "room+pink"): nz = pink(n, rng)
        y = mix_snr(y, nz, snr)
        write_wav(os.path.join(out, f"{name}.wav"), y)
        os.system(f"cp '{out}/{src}.truth.json' '{out}/{name}.truth.json'")
        manifest.append({"id": name, "reciter": None, "noise": kind, "snrDb": snr, "durationSec": round(n / SR, 1), "source": src})
    json.dump(manifest, open(os.path.join(out, "manifest.json"), "w"), ensure_ascii=False, indent=1)
    for m in manifest: print(m)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
