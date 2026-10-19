#!/bin/bash
# حارس «لا مظهر iOS افتراضي» (قرار يوسف 19 أكتوبر): يمنع مكوّنات النظام في واجهة SunnahNative ويفرض المكوّنات المشتركة للنموذج ٢.
# الممنوع: List/Form/.listStyle/Toggle/Picker/.pickerStyle/.searchable/.sheet/DisclosureGroup/.toolbar{}/.navigationTitle/NavigationLink.
# السقف في docs/native/no-system-ui-baseline.json يُخفَّض فقط حتى صفر؛ زيادة أي بند = فشل. --write-baseline لتحديثه بعد خفض.
# متوافق مع bash 3.2 (macOS): المنطق في python3.
set -u
cd "$(dirname "$0")/.."
exec python3 - "$@" <<'PY'
import json, os, re, sys
S = "artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative"
B = "docs/native/no-system-ui-baseline.json"
EXCL = re.compile(r"/Components/|/Design/|Debug|Probe")
P = {
  "list": r"\bList\s*[\({]", "form": r"\bForm\s*\{", "listStyle": r"\.listStyle\(", "toggle": r"\bToggle\(",
  "picker": r"\bPicker\(", "pickerStyle": r"\.pickerStyle\(", "searchable": r"\.searchable\(", "sheet": r"\.sheet\(",
  "disclosure": r"DisclosureGroup", "toolbar": r"\.toolbar\s*\{", "navTitle": r"\.navigationTitle\(", "navLink": r"NavigationLink\(",
}
files = []
for root, _, fs in os.walk(S):
    for f in fs:
        p = os.path.join(root, f)
        if f.endswith(".swift") and not EXCL.search(p): files.append(p)
lines = []
for p in sorted(files):
    with open(p, encoding="utf-8") as fh:
        for i, l in enumerate(fh, 1):
            if not l.lstrip().startswith("//"): lines.append((p, i, l))
N = {k: [(p, i) for (p, i, l) in lines if re.search(rx, l)] for k, rx in P.items()}
counts = {k: len(v) for k, v in sorted(N.items())}
if "--write-baseline" in sys.argv[1:]:
    with open(B, "w", encoding="utf-8") as fh:
        json.dump({"about": "سقف مكوّنات iOS الافتراضية؛ يُخفَّض فقط حتى صفر", "counts": counts}, fh, ensure_ascii=False); fh.write("\n")
    print("baseline:", json.dumps(counts)); sys.exit(0)
cap = json.load(open(B, encoding="utf-8"))["counts"]
fail = False
for k, n in counts.items():
    if n > cap.get(k, 0):
        fail = True
        print(f"✗ {k}: {n} > السقف {cap.get(k, 0)} — استعمل المكوّن المشترك (SunnahCard/SunnahTile/SunnahSettingsRow/SunnahSegmented/SunnahSwitch/SunnahSearchField/SunnahPage)")
        for p, i in N[k][:5]: print(f"   {p}:{i}")
total = sum(counts.values())
if not fail: print(f"✓ لا زيادة في مكوّنات iOS الافتراضية (المتبقي {total} — الهدف 0)")
sys.exit(1 if fail else 0)
PY
