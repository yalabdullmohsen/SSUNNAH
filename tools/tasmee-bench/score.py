#!/usr/bin/env python3
"""
يحسب مقاييس «تسميع» من مخرجات tasmee-bench مقابل الحقيقة الأرضية (بداية/نهاية كل كلمة بالمللي ثانية).
الاستعمال: score.py <runsDir> <corpusSetDir>   (runsDir/<config>/<rec>.json)

المقاييس لكل إعداد:
- كشف صحيح: نسبة الكلمات المقروءة صحيحة التي كُشفت «صحيحة».
- أخطاء كاذبة: نسبة الكلمات المقروءة صحيحة التي عُلّمت «خطأ» أو «متجاوزة» أو لم تُكشف.
- كشف مبكر: كُشفت قبل بدء نطقها (تخمين خاطئ التوقيت).
- التأخير: وقت الكشف (ساعة الصوت + زمن الفك) ناقصًا نهاية نطق الكلمة؛ وسيط/٩٠٪/٩٥٪ وحصة ما دون ثانية.
- في تشغيل الأخطاء المزروعة: كشف الخطأ = الكلمة المزروعة لم تُكشف «صحيحة».
"""
import json, os, sys, statistics as st

def pct(xs, p):
    xs = sorted(xs)
    return xs[min(len(xs) - 1, int(len(xs) * p))] if xs else float("nan")

def score_run(run, truth):
    n = len(truth)
    corrupted = set(run.get("corrupted", []))
    final = ["pending"] * n
    t_reveal = [None] * n
    for w in run["words"]:
        final[w["index"]] = w["state"]
        if w["state"] == "correct": t_reveal[w["index"]] = w["time"]
    ok = [i for i in range(n) if i not in corrupted]
    lat_end, lat_start, early = [], [], 0
    for i in ok:
        if final[i] == "correct":
            te = truth[i]["endMs"] / 1000; ts = truth[i]["startMs"] / 1000
            lat_end.append(t_reveal[i] - te); lat_start.append(t_reveal[i] - ts)
            if t_reveal[i] < ts: early += 1
    correct = sum(final[i] == "correct" for i in ok)
    wrong = sum(final[i] == "wrong" for i in ok); skipped = sum(final[i] == "skipped" for i in ok)
    unrev = sum(final[i] == "pending" for i in ok)
    det = sum(final[i] != "correct" for i in corrupted) if corrupted else None
    comp = [d["computeMs"] for d in run["decodes"]]
    return {"n": len(ok), "correct": correct, "wrong": wrong, "skipped": skipped, "unrevealed": unrev, "early": early,
            "lat_end": lat_end, "lat_start": lat_start, "planted": len(corrupted), "detected": det,
            "compute": comp, "audio": run["duration"], "decodes": len(comp), "vad_skipped": run["skippedByVAD"]}

def main(runs_dir, set_dir):
    manifest = {m["id"]: m for m in json.load(open(os.path.join(set_dir, "manifest.json")))}
    for cfg in sorted(os.listdir(runs_dir)):
        d = os.path.join(runs_dir, cfg)
        if not os.path.isdir(d): continue
        rows = {}
        for f in sorted(os.listdir(d)):
            if not f.endswith(".json"): continue
            rec = f[:-5]
            truth = json.load(open(os.path.join(set_dir, f"{rec}.truth.json")))
            rows[rec] = score_run(json.load(open(os.path.join(d, f))), truth)
        if not rows: continue
        tot = lambda k: sum(r[k] for r in rows.values())
        le = [x for r in rows.values() for x in r["lat_end"]]; ls = [x for r in rows.values() for x in r["lat_start"]]
        comp = [x for r in rows.values() for x in r["compute"]]
        n = tot("n")
        print(f"\n=== {cfg}  ({len(rows)} تلاوة، {n} كلمة) ===")
        print(f" كشف صحيح {100*tot('correct')/n:.1f}% | خطأ {100*tot('wrong')/n:.1f}% | متجاوزة {100*tot('skipped')/n:.1f}% | لم تُكشف {100*tot('unrevealed')/n:.1f}% | مبكر {100*tot('early')/max(1,tot('correct')):.1f}% من المكشوفة")
        if le:
            print(f" التأخير بعد نهاية النطق: وسيط {st.median(le):.2f}s | p90 {pct(le,.9):.2f}s | p95 {pct(le,.95):.2f}s | ≤1s: {100*sum(x<=1 for x in le)/len(le):.0f}%")
            print(f" التأخير بعد بداية النطق: وسيط {st.median(ls):.2f}s | p90 {pct(ls,.9):.2f}s")
        print(f" فك الترميز: متوسط {st.mean(comp):.0f}ms | p95 {pct(comp,.95):.0f}ms | أقصى {max(comp):.0f}ms | ({tot('decodes')} فك، تخطّى VAD {tot('vad_skipped')} نبضة)")
        if tot("planted"):
            print(f" كشف الأخطاء المزروعة: {tot('detected')}/{tot('planted')} = {100*tot('detected')/tot('planted'):.0f}%")
        for rec, r in rows.items():
            m = manifest.get(rec, {})
            tag = (m.get("noise") or "clean") + (f"@{m['snrDb']}dB" if m.get("snrDb") else "")
            med = st.median(r["lat_end"]) if r["lat_end"] else float("nan")
            print(f"   {rec:28s} {tag:14s} صحيح {100*r['correct']/r['n']:5.1f}%  خطأ/تجاوز {100*(r['wrong']+r['skipped'])/r['n']:5.1f}%  تأخير وسيط {med:5.2f}s  فك {st.mean(r['compute']):4.0f}ms")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
