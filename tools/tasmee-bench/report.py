#!/usr/bin/env python3
"""
جدول مقارنة نهائي بالأرقام (Markdown) من مجلدات التشغيل/الإعادة.
الاستعمال: report.py <setDir> <label=dir[:excludeRec,...]> ...
مثال: report.py corpus/set base_plain=replay/base_plain_ts base_prompt=replay/base_prompt5_ts
يُحسب كل صف على كل التلاوات، وصف إضافي «بلا تلاوة الإجهاد» يستثني sudais_phone_pink15 (نطاق هاتف ضيّق غير واقعي).
"""
import json, os, statistics as st, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from score import pct, score_run

def collect(set_dir, d, exclude=()):
    rows = {}
    for f in sorted(os.listdir(d)):
        if not f.endswith(".json"): continue
        rec = f[:-5]
        if rec in exclude: continue
        truth = json.load(open(os.path.join(set_dir, f"{rec}.truth.json")))
        rows[rec] = score_run(json.load(open(os.path.join(d, f))), truth)
    return rows

def line(label, rows):
    tot = lambda k: sum(r[k] for r in rows.values())
    n = tot("n"); le = [x for r in rows.values() for x in r["lat_end"]]
    comp = [x for r in rows.values() for x in r["compute"]]
    planted = tot("planted")
    cells = [label, str(len(rows)),
             f"{100*tot('correct')/n:.1f}%", f"{100*(tot('wrong')+tot('skipped'))/n:.1f}%",
             f"{st.median(le):.2f}" if le else "—", f"{pct(le,.95):.2f}" if le else "—",
             f"{100*sum(x<=1 for x in le)/len(le):.0f}%" if le else "—",
             f"{st.mean(comp):.0f}", f"{pct(comp,.95):.0f}",
             f"{100*tot('detected')/planted:.0f}%" if planted else "—"]
    return "| " + " | ".join(cells) + " |"

def main(set_dir, specs):
    print("| الإعداد | تلاوات | كشف صحيح | أخطاء كاذبة (خطأ+تجاوز) | تأخير وسيط (ث) | p95 (ث) | ≤1ث | فك متوسط ms | فك p95 ms | كشف الأخطاء المزروعة |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    for spec in specs:
        label, d = spec.split("=", 1)
        rows = collect(set_dir, d)
        if not rows: continue
        print(line(label, rows))
        if "sudais_phone_pink15" in rows:
            print(line(label + " (بلا تلاوة الإجهاد)", collect(set_dir, d, ("sudais_phone_pink15",))))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
