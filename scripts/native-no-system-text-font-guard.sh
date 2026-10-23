#!/bin/bash
# حارس «لا خط نظام مباشر على Text» (طلب يوسف 23 أكتوبر): كل عنوان/نص يمرّ عبر Sunnah.Typography أو AppearancePrefs.ui
# فيتبع خط التطبيق المختار. الممنوع: .font(.system(...)) و.font(.title/.title2/.title3/.headline/.largeTitle/.body/...) على غير Image(systemName:).
# السقف في docs/native/no-system-text-font-baseline.json يُخفَّض فقط حتى صفر؛ زيادة = فشل. --write-baseline لتحديثه بعد خفض.
set -u
cd "$(dirname "$0")/.."
exec python3 - "$@" <<'PY'
import json, os, re, sys
S = "artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative"
B = "docs/native/no-system-text-font-baseline.json"
EXCL = re.compile(r"/Design/|Debug|Probe")
FONT = re.compile(r"\.font\(\s*(Font\.)?\.(system|largeTitle|title2?|title3|headline|subheadline|body|callout|footnote|caption2?)\b")
hits = []
for root, _, fs in os.walk(S):
    for f in fs:
        p = os.path.join(root, f)
        if not f.endswith(".swift") or EXCL.search(p): continue
        L = open(p, encoding="utf-8").read().split("\n")
        for i, l in enumerate(L):
            if l.lstrip().startswith("//") or not FONT.search(l): continue
            ctx = " ".join(L[max(0, i - 2):i + 1])
            if re.search(r"Image\(|Label\(|systemName", ctx): continue
            hits.append((p, i + 1))
n = len(hits)
if "--write-baseline" in sys.argv[1:]:
    json.dump({"about": "سقف Text بخط نظام مباشر؛ يُخفَّض فقط حتى صفر", "count": n}, open(B, "w", encoding="utf-8"), ensure_ascii=False)
    open(B, "a").write("\n"); print("baseline:", n); sys.exit(0)
cap = json.load(open(B, encoding="utf-8"))["count"]
if n > cap:
    print(f"✗ Text بخط نظام مباشر: {n} > السقف {cap} — استعمل Sunnah.Typography.pageTitle/sectionTitle/cardTitle/body أو AppearancePrefs.ui")
    for p, i in hits[:8]: print(f"   {p}:{i}")
    sys.exit(1)
print(f"✓ لا زيادة في Text بخط نظام مباشر (المتبقي {n} — الهدف 0)")
PY
