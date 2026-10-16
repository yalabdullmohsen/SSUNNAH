#!/usr/bin/env python3
"""حارس أطوال حقول App Store Connect: يفشل (exit 1) إن تجاوز أي حقل حدّ Apple.
يقرأ submission/STORE_LISTING_1_2_0.md (وأقسام TESTFLIGHT_COPY.md إن وُجدت)."""
import re, sys, pathlib
base = pathlib.Path(__file__).parent / "submission"
LIMITS = [("الاسم الفرعي", 30), ("Subtitle", 30), ("النص الترويجي", 170), ("Promotional", 170),
          ("الكلمات المفتاحية", 100), ("Keywords", 100), ("الوصف", 4000), ("Description", 4000),
          ("ما الجديد", 4000), ("What's New", 4000)]
bad = 0
def values(lines):
    for i, l in enumerate(lines):
        m = re.match(r"\*\*(.+?)(?: \(≤\d+\))?:\*\*(.*)", l)
        if not m: continue
        label, rest = m.group(1), m.group(2)
        v = re.search(r"`([^`]+)`", rest)
        if v: yield label, v.group(1); continue
        if i + 1 < len(lines) and lines[i + 1].startswith("```"):
            j = i + 2; buf = []
            while j < len(lines) and not lines[j].startswith("```"): buf.append(lines[j]); j += 1
            yield label, "\n".join(buf)
for f in ["STORE_LISTING_1_2_0.md", "TESTFLIGHT_COPY.md"]:
    p = base / f
    if not p.exists(): continue
    for label, text in values(p.read_text(encoding="utf-8").splitlines()):
        lim = next((n for k, n in LIMITS if label.startswith(k)), None)
        if lim is None: continue
        n = len(text); ok = n <= lim; bad += not ok
        print(f"{'OK  ' if ok else 'FAIL'} {f}: {label} {n}/{lim}")
sys.exit(1 if bad else 0)
