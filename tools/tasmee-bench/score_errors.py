#!/usr/bin/env python3
"""
يقيّم تقرير جلسة «تسميع» (نسخ JSON من شاشة القياس) مقابل حقيقة أرضية وضعها مراجِع: docs/tasmee-benchmark.md
الاستعمال: score_errors.py <annotations/R07.json> <reports/R07.ours.json> [... أزواج]
أخطاء حقيقية: omission/substitution (insertion «غير مدعومة»)؛ سلوكيات سليمة: repeat/self_correction (أي تنبيه عليها = تنبيه خاطئ).
التنبيه = حالة «wrong» أو «skipped» للكلمة. التأخير = decidedAtMs − endMs (ms من بدء الجلسة، والجلسة تبدأ مع التسجيل).
"""
import json, statistics as st, sys

ALERT = {"wrong", "skipped"}
REAL = {"omission", "substitution"}
SAFE = {"repeat", "self_correction"}

def pct(xs, p):
    xs = sorted(xs)
    return xs[min(len(xs) - 1, int(len(xs) * p))] if xs else float("nan")

def score(ann, rep):
    words = {w["id"]: w for w in rep["words"]}
    ev = ann["events"]
    real = [e for e in ev if e["type"] in REAL]
    unsupported = [e for e in ev if e["type"] == "insertion"]
    safe = {e["wordId"] for e in ev if e["type"] in SAFE}
    flagged = {i for i, w in words.items() if w["state"] in ALERT}
    truth_err = {e["wordId"] for e in real}
    detected, missed, lat = [], [], []
    for e in real:
        w = words.get(e["wordId"])
        if w and w["state"] in ALERT:
            detected.append(e)
            if w.get("decidedAtMs") is not None:
                lat.append((w["decidedAtMs"] - e["endMs"]) / 1000)
        else:
            missed.append(e)
    false_alarms = sorted(flagged - truth_err)
    on_safe = sorted(set(false_alarms) & safe)
    n_words = len(words)
    return {
        "real": len(real), "detected": len(detected), "missed": len(missed), "unsupported": len(unsupported),
        "false": len(false_alarms), "false_on_safe": len(on_safe), "per100": 100 * len(false_alarms) / max(1, n_words),
        "lat": lat, "words": n_words,
        "by_type": {t: (sum(1 for e in detected if e["type"] == t), sum(1 for e in real if e["type"] == t)) for t in REAL},
    }

def main(args):
    rows = []
    for a, r in zip(args[::2], args[1::2]):
        ann, rep = json.load(open(a)), json.load(open(r))
        s = score(ann, rep); rows.append((ann["recording"], s))
    print("| التلاوة | أخطاء حقيقية | مكشوفة | فائتة | غير مدعومة (زيادة) | تنبيهات خاطئة | منها على إعادة/تصحيح ذاتي | /100 كلمة | تأخير وسيط (ث) | p90 (ث) |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    tot = dict(real=0, detected=0, missed=0, unsupported=0, false=0, false_on_safe=0, words=0)
    lat_all = []
    for name, s in rows:
        for k in tot: tot[k] += s[k]
        lat_all += s["lat"]
        print(f"| {name} | {s['real']} | {s['detected']} | {s['missed']} | {s['unsupported']} | {s['false']} | {s['false_on_safe']} | {s['per100']:.1f} | "
              f"{st.median(s['lat']):.2f} | {pct(s['lat'], .9):.2f} |" if s["lat"] else f"| {name} | {s['real']} | {s['detected']} | {s['missed']} | {s['unsupported']} | {s['false']} | {s['false_on_safe']} | {s['per100']:.1f} | — | — |")
    if len(rows) > 1:
        print(f"| **المجموع** | {tot['real']} | {tot['detected']} | {tot['missed']} | {tot['unsupported']} | {tot['false']} | {tot['false_on_safe']} | {100*tot['false']/max(1,tot['words']):.1f} | "
              f"{(st.median(lat_all) if lat_all else float('nan')):.2f} | {pct(lat_all, .9):.2f} |")
    if tot["real"]:
        print(f"\nRecall: {100*tot['detected']/tot['real']:.0f}%  (دقة التنبيه: {100*tot['detected']/max(1,tot['detected']+tot['false']):.0f}%)")

if __name__ == "__main__":
    main(sys.argv[1:])
