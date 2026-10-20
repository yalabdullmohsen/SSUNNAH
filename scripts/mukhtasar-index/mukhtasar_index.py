#!/usr/bin/env python3
"""فهرس توقيتات «المختصر الصوتي» لكل آية.

الخطوات (لكل سورة، النتائج المؤقتة خارج المستودع في $MUKH_WORK):
  fetch N        تنزيل ملف السورة من archive.org/Mokhtasr_Asmari
  transcribe N   تفريغ بـ mlx-whisper بطوابع كلمات
  match N        مطابقة بداية تلاوة كل آية بنص الآية (تطبيع بلا تشكيل)
  emit           توليد Audio/MukhtasarIndex+Data.swift من كل ما طُوبق
  run N...       fetch+transcribe+match
البيئة: venv فيه mlx-whisper وimageio-ffmpeg؛ ffmpeg على PATH.
"""
import json, os, re, sys, urllib.parse, urllib.request, difflib, pathlib

WORK = pathlib.Path(os.environ.get("MUKH_WORK", os.path.expanduser("~/.majalis-tools/mukh-work")))
QURAN = pathlib.Path(os.environ.get("MUKH_QURAN", os.path.expanduser("~/.majalis-tools/mukh-work/quran")))
ITEM = "Mokhtasr_Asmari"
MODEL = os.environ.get("MUKH_MODEL", "mlx-community/whisper-small-mlx")
SWIFT = pathlib.Path(__file__).resolve().parents[2] / "artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Audio/MukhtasarIndex+Data.swift"

_DIAC = re.compile(r"[ؐ-ًؚ-ٰٟۖ-ۭـ﻿]")
def norm(s):
    s = _DIAC.sub("", s)
    s = re.sub("[ٱأإآ]", "ا", s)
    s = s.replace("ى", "ي").replace("ة", "ه").replace("ؤ", "و").replace("ئ", "ي").replace("ء", "")
    s = re.sub(r"[^ء-ي ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def files():
    p = WORK / "files.json"
    if not p.exists():
        WORK.mkdir(parents=True, exist_ok=True)
        d = json.load(urllib.request.urlopen(f"https://archive.org/metadata/{ITEM}"))
        p.write_text(json.dumps([f["name"] for f in d["files"] if f["name"].endswith(".mp3")], ensure_ascii=False))
    return json.loads(p.read_text())

def name_of(n):
    for f in files():
        if f.startswith(f"{n:03d} "): return f
    raise SystemExit(f"لا ملف للسورة {n}")

def fetch(n):
    out = WORK / "audio" / f"{n:03d}.mp3"
    if out.exists() and out.stat().st_size > 0: return out
    out.parent.mkdir(parents=True, exist_ok=True)
    url = f"https://archive.org/download/{ITEM}/" + urllib.parse.quote(name_of(n))
    urllib.request.urlretrieve(url, out)
    return out

def transcribe(n):
    out = WORK / "tr" / f"{n:03d}.json"
    if out.exists(): return out
    import mlx_whisper
    out.parent.mkdir(parents=True, exist_ok=True)
    r = mlx_whisper.transcribe(str(fetch(n)), path_or_hf_repo=MODEL, language="ar", word_timestamps=False,
                               condition_on_previous_text=False)
    # طوابع على مستوى المقطع (أسرع بنحو 5×)؛ تُوزَّع على كلماته خطيًا عند المطابقة
    segs = [{"t": g["text"].strip(), "s": g["start"], "e": g["end"]} for g in r["segments"]]
    out.write_text(json.dumps({"segs": segs}, ensure_ascii=False))
    return out

def ayahs(n):
    d = json.loads((QURAN / f"surah-{n:03d}.json").read_text())
    res = []
    for a in d["ayahs"]:
        t = norm(a["text"])
        if a["numberInSurah"] == 1 and n not in (1, 9):
            t = re.sub(r"^بسم الله الرحمن الرحيم ?", "", t)
        res.append(t)
    return res

WINDOW = 900  # أقصى مسافة (ث) بين تلاوتين متتاليتين

def match(n):
    segs = json.loads((WORK / "tr" / f"{n:03d}.json").read_text())["segs"]
    toks = []
    for g in segs:
        ws = [w for w in (norm(x) for x in g["t"].split()) if w]
        for k, w in enumerate(ws):
            toks.append((w, g["s"] + (g["e"] - g["s"]) * k / max(len(ws), 1)))
    # «من مقاصد السورة» = بداية المقاصد؛ والتلاوة تأتي بعد «التفسير»
    mi = next((i for i, (t, _) in enumerate(toks) if t == "مقاصد"), None)
    start = round(max(toks[mi - 1][1] if mi else 0, 0), 2) if mi is not None else 0.0
    ti = next((i for i in range((mi or 0), len(toks)) if toks[i][0] == "التفسير"), mi or 0)
    A = ayahs(n)
    from rapidfuzz import fuzz
    words = [t for t, _ in toks]
    times = [x for _, x in toks]
    # مرشَّحو كل آية: قمم النسبة (≥0.6) على كامل التفريغ بعد «التفسير»
    K = 40
    cands = []
    for txt in A:
        hw = txt.split()[:6]
        head, m = " ".join(hw), len(hw)
        if len(head) < 6:  # حروف مقطّعة تُمحى بالتطبيع: تُستوفى لاحقًا
            cands.append([]); continue
        sc = [(fuzz.ratio(head, " ".join(words[j:j + m])) / 100, j) for j in range(ti, len(words))]
        sc = [c for c in sc if c[0] >= 0.6]
        sc.sort(reverse=True)
        pick = []
        for r, j in sc:
            if all(abs(j - q) > 2 for _, q in pick):
                pick.append((r, j))
            if len(pick) >= K: break
        cands.append(sorted(pick, key=lambda c: c[1]))
    SKIP = 0.5  # مكافأة ضئيلة تُفضَّل على مطابقة <0.5
    # فيتربي: الحالة = (آية، مرشّح أو None)؛ يجب أن تتصاعد المواضع
    best = [{}]  # best[i][k] = (score, prevkey)
    prev_pos = {(-1): (0.0, None, ti - 1, start)}
    layers = []
    state = {None: (0.0, None, ti - 1)}  # key -> (score, backkey, lastpos)
    for i, cs in enumerate(cands):
        new = {}
        for key, (sc0, _, lp) in state.items():
            # تخطّي الآية
            k2 = ("skip", i)
            v = sc0 + 0.0
            if k2 not in new or new[k2][0] < v: new[k2] = (v, key, lp)
            for r, j in cs:
                if j <= lp: continue
                if times[j] - times[max(lp, ti)] > WINDOW: continue
                v = sc0 + r
                k3 = (i, j)
                if k3 not in new or new[k3][0] < v: new[k3] = (v, key, j)
        # قصّ: أبقِ أفضل 200 حالة
        state = dict(sorted(new.items(), key=lambda kv: -kv[1][0])[:600])
        layers.append(state)
    key = max(state, key=lambda k: state[k][0])
    chosen = [None] * len(A)
    for i in range(len(A) - 1, -1, -1):
        if key[0] != "skip": chosen[i] = key[1]
        key = layers[i][key][1]
    starts, report = [], []
    for i, j in enumerate(chosen):
        if j is None or dict((q, r) for r, q in cands[i]).get(j, 0) < 0.7:
            starts.append(None); report.append((i + 1, 0.0 if j is None else dict((q, r) for r, q in cands[i])[j], None))
        else:
            r = dict((q, r) for r, q in cands[i])[j]
            starts.append(round(max(times[j] - 0.3, 0), 2)); report.append((i + 1, round(r, 2), starts[-1]))
    end = segs[-1]["e"] if segs else 0.0
    known = [(k, v) for k, v in enumerate(starts) if v is not None]
    if not known: known = [(-1, start)]
    for k, v in enumerate(starts):
        if v is not None: continue
        lo = max(((a, b) for a, b in known if a < k), default=(-1, start), key=lambda x: x[0])
        hi = min(((a, b) for a, b in known if a > k), default=(len(starts), end), key=lambda x: x[0])
        starts[k] = round(lo[1] + (hi[1] - lo[1]) * (k - lo[0]) / (hi[0] - lo[0]), 2)
    (WORK / "match").mkdir(exist_ok=True)
    (WORK / "match" / f"{n:03d}.json").write_text(json.dumps({"start": start, "ayahs": starts, "report": report}))
    weak = [x for x in report if x[1] < 0.75]
    print(f"سورة {n}: {len(starts)} آية، ضعيفة(<0.75): {len(weak)}", weak[:10])

def emit():
    ents = {}
    for p in sorted((WORK / "match").glob("*.json")):
        n = int(p.stem); d = json.loads(p.read_text())
        a, rep = d["ayahs"], d["report"]
        weak = sum(1 for x in rep if x[1] < 0.75)
        ok = (len(a) == len(ayahs(n)) and all(x < y for x, y in zip(a, a[1:]))
              and d.get("start", 0) < a[0] and weak <= max(1, len(a) // 10))
        if ok: ents[n] = d
        else: print(f"سورة {n}: مستبعدة (ضعيفة {weak}/{len(a)}) — تحتاج نموذجًا أدق")
    lines = ["// مولَّد — لا تحرّره يدويًا. يُعاد توليده بـ scripts/mukhtasar-index (تفريغ الملفات ومطابقة الآيات).",
             "extension MukhtasarIndex {", "    static let generatedIntroSkip: Double = 0", "    static let generated: [Int: Entry] = ["]
    for n, d in ents.items():
        a = d["ayahs"]; start = max(a[0] - 8, 0) if a else 0  # تقدير؛ يُستبدل بمطابقة «مقاصد السورة» إن وُجدت
        start = d.get("start", start)
        lines.append(f"        {n}: Entry(start: {start}, ayahs: [" + ", ".join(str(x) for x in a) + "]),")
    lines += ["    ]", "}", ""]
    SWIFT.write_text("\n".join(lines))
    print("كُتب", SWIFT, len(ents), "سورة")

if __name__ == "__main__":
    c, *a = sys.argv[1:] or ["-h"]
    if c == "emit": emit()
    elif c in ("fetch", "transcribe", "match", "run"):
        for n in map(int, a):
            if c in ("fetch", "run"): fetch(n)
            if c in ("transcribe", "run"): transcribe(n)
            if c in ("match", "run"): match(n)
    else: print(__doc__)
