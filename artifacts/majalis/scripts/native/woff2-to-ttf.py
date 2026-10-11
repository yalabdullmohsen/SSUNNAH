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
