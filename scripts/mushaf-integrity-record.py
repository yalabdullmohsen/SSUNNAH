#!/usr/bin/env python3
"""يولّد مراجع حارس سلامة المصحف (ن3) من مصدر QPC المُلتزَم artifacts/majalis/public/data/quran-v2.
ممنوع تشغيله لتحديث المراجع إلا بقاعدة المراجع البصرية (docs/native/OWNERSHIP.md): صورتا قبل/بعد وسبب في وصف الـPR وموافقة ن1.
الصيغة القانونية لكل صفحة يطابقها `MushafIntegrityTests.canonical(_:)` حرفيًا."""
import hashlib, json, os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "..", "artifacts/majalis/public/data/quran-v2")
out = os.path.join(here, "..", "artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/Fixtures/MushafIntegrity/reference.json")
def hx(s): return "-".join("%x" % ord(c) for c in s)
def canon(verses):
    return "\n".join("%s|%s|%s|%s|%s|%s" % (v["verse_key"], w["position"], w["line_number"], w["char_type_name"], hx(w["code_v2"]), hx(w["text_qpc_hafs"]))
                     for v in verses for w in v["words"])
pages = {}
for n in range(1, 605):
    vs = json.load(open(os.path.join(src, "pages", "page-%03d.json" % n), encoding="utf-8"))
    ws = [w for v in vs for w in v["words"]]
    pages[str(n)] = {"lines": max(w["line_number"] for w in ws), "words": len(ws), "ayahs": len(vs), "sha256": hashlib.sha256(canon(vs).encode()).hexdigest()}
juz, rub, last_j, last_r = {}, [], 0, 0
for n in range(1, 605):
    for v in json.load(open(os.path.join(src, "pages", "page-%03d.json" % n), encoding="utf-8")):
        if v["juz_number"] != last_j: last_j = v["juz_number"]; juz[str(last_j)] = [n, v["verse_key"]]
        if v["rub_el_hizb_number"] != last_r: last_r = v["rub_el_hizb_number"]; rub.append(v["verse_key"])
chapters = [[c["id"], c["verses_count"], c["pages"][0], c["pages"][1]] for c in json.load(open(os.path.join(src, "chapters.json"), encoding="utf-8"))]
ref = {"version": 1, "totalAyahs": 6236, "pages": pages, "juzStarts": juz, "rubStarts": rub, "chapters": chapters}
json.dump(ref, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0, sort_keys=True)
print("OK", len(pages), sum(p["ayahs"] for p in pages.values()), sorted({p["lines"] for p in pages.values()}))
