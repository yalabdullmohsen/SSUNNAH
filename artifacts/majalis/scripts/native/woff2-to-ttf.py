#!/usr/bin/env python3
"""يعيد تغليف خطوط QPC V2 (woff2 → TTF) دون أي تعديل في الجلايفات: Core Text لا يقرأ woff2 أصلًا.
نفس الخط المنشور اليوم؛ لا خط جديد. الاستعمال: woff2-to-ttf.py <srcDir> <dstDir>"""
import os, sys
from fontTools.ttLib import TTFont

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for n in range(1, 605):
    f = TTFont(f"{src}/p{n}.woff2", recalcTimestamp=False)
    f.flavor = None
    f.save(f"{dst}/p{n}.ttf")
    # بوابة: الجلايفات والـcmap والمقاييس مطابقة للمصدر تمامًا، وإلا يفشل التصدير
    a, b = TTFont(f"{src}/p{n}.woff2"), TTFont(f"{dst}/p{n}.ttf")
    assert a.getBestCmap() == b.getBestCmap(), f"cmap p{n}"
    assert a.getGlyphOrder() == b.getGlyphOrder(), f"glyph order p{n}"
    ga, gb, ha, hb = a["glyf"], b["glyf"], a["hmtx"], b["hmtx"]
    for g in a.getGlyphOrder():
        assert ha[g] == hb[g], f"hmtx p{n} {g}"
        x, y = ga[g], gb[g]
        assert x.numberOfContours == y.numberOfContours, f"contours p{n} {g}"
        if x.numberOfContours:
            assert list(x.coordinates) == list(y.coordinates) and list(x.flags) == list(y.flags) and list(x.endPtsOfContours) == list(y.endPtsOfContours), f"glyph p{n} {g}"
