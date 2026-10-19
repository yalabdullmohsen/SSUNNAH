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
    starts, pos, report = [], ti, []
    for i, txt in enumerate(A):
        L = max(1, len(txt.split()))
        head = " ".join(txt.split()[:6])
        best = None
        # أول مطابقة جيدة بعد موضع الآية السابقة (نافذة طولها كطول الآية، مقارنة الرأس)
        cands = []
        t0 = toks[pos][1] if pos < len(toks) else 0
        for j in range(pos, len(toks)):
            if toks[j][1] > t0 + WINDOW: break
            seg = " ".join(t for t, _ in toks[j:j + min(L, 6)])
            r = difflib.SequenceMatcher(None, head, seg).ratio()
            cands.append((r, j))
            if r >= 0.86 and best is None: best = (r, j); break
        if best is None and cands:
            best = max(cands, key=lambda c: c[0])
        r, j = best if best else (0, pos)
        if r < 0.7 or j >= len(toks):
            # لم تُلتقط الآية: لا نُقدّم الموضع؛ تُستكمل بالاستيفاء لاحقًا
            starts.append(None); report.append((i + 1, round(r, 2), None)); continue
        starts.append(round(max(toks[j][1] - 0.3, 0), 2))
        report.append((i + 1, round(r, 2), starts[-1]))
        pos = j + 1
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
