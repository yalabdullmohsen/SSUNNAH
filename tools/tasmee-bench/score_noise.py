#!/usr/bin/env python3
"""كلمات وهمية على صمت/ضوضاء بلا تلاوة. الاستعمال: score_noise.py <runsDir/config>
يطبع لكل تسجيل: نبضات فك، نبضات خرج فيها كلمات، مجموع الكلمات الصادرة، الكلمات «المكشوفة» (يجب 0)."""
import json, os, sys
d = sys.argv[1]
tot_dec = tot_nonempty = tot_words = tot_rev = 0
for f in sorted(os.listdir(d)):
    if not f.endswith(".json"): continue
    r = json.load(open(os.path.join(d, f)))
    dec = r["decodes"]; ne = [x for x in dec if x["text"].strip()]
    words = sum(len(x["text"].split()) for x in ne)
    rev = sum(w["state"] == "correct" for w in r["words"])
    tot_dec += len(dec); tot_nonempty += len(ne); tot_words += words; tot_rev += rev
    print(f"  {f[:-5]:24s} فك {len(dec):4d} (VAD تخطّى {r['skippedByVAD']:3d}) | نبضات بنص {len(ne):4d} | كلمات صادرة {words:5d} | مكشوفة {rev}")
print(f"المجموع: فك {tot_dec} | نبضات بنص {tot_nonempty} ({100*tot_nonempty/max(1,tot_dec):.1f}%) | كلمات صادرة {tot_words} | مكشوفة خطأً {tot_rev}")
