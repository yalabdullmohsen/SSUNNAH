# سير عمل نوافذ native

- فرع لكل بند `nN/<name>` + PR بوسمي `safe:auto-merge` و`native-section` + `gh pr merge --squash --auto`، وrebase على `origin/native-app` قبل الدفع.
- **لا تقرير «تم الدمج» قبل تشغيل** `scripts/verify-merged.sh <PR...>`؛ فهو ينتظر الفحوص ويتحقق أن كل PR دُمج فعلًا في native-app. أي فشل: إصلاح في PR مستقل، ثم أعد التشغيل.
- التقرير: سطران بعد كل PR، مع نتيجة السكربت.
- ممنوع: `--admin`، الدمج مع بناء فاشل، الدفع المباشر، تعطيل فحص، بناء TestFlight دون إذن.
- **عزل النوافذ:** لكل نافذة worktree مستقل لا تشاركه نافذة أخرى (ن1: `~/ssunnah-wt/ssunnah-n1`، فروعه `n1/…` أو `feat/native-…`). `scripts/native-window-guard.sh n1` (يُستدعى من `ensure-sim.sh`) يرفض العمل إن اختلف المسار أو الفرع، وفرع `native-loop/progress` محجوز لحلقة ن4. لا تعمل من worktree غيرك ولا تبدّل فرعه.


## قياس المسارات السريع: `OPEN=inapp` (Debug فقط، متاح لكل النوافذ)
التطبيق يُطلَق مرة واحدة بـ`-snapshotRoutes <file>` ويمرّ بنفسه على المسارات عبر `AppRouter` (بلا `openurl` ولا إعادة إطلاق لكل مسار). لكل مسار: ينتظر `screen.ready` ثم يكتب `tmp/audit-ready.json` (`{i,route,state}`)؛ السكربت يلتقط `simctl io screenshot` ثم يكتب `tmp/audit-next`. عند الانتهاء `tmp/audit-done`.
```bash
NATIVE_WINDOW=n1 APP=<SunnahApp.app> MODE=light BOARD=<dir> OPEN=inapp bash scripts/native-audit-fast.sh
- يُعاد تشغيل المحاكي تلقائيًا في بداية كل جولة (`REBOOT=0` لتخطّيه) لإزالة حوارات SpringBoard العالقة من اللقطات.
```
- إن سقط التطبيق يُعاد إطلاقه تلقائيًا من المسار التالي. `OPEN=launch` (إطلاق لكل مسار) بديل أبطأ؛ `openurl` الافتراضي يعلق عند حوار iOS «فتح في سُنّة؟».
- الشيفرة: `SnapshotRoutesRunner` في `Components/ScreenProbe.swift` (داخل `#if DEBUG`).

## قاعدة النص الشرعي (لكل النوافذ، قرار يوسف 2026-10-14)
أي PR يمسّ نصًا شرعيًا (قرآن، حديث، حكم، بيانات شرعية) **لا يُفعَّل له الدمج التلقائي عند فتحه**؛ يُفعَّل بعد التحقق البصري منه بلقطة (فاتح وداكن، وكل اتجاه تنقّل إن كانت الشاشة معاملية).
- `content-sensitive`: يضعه صاحب الـPR (ويُستنتج تلقائيًا من المسارات الحسّاسة). `visually-verified`: يضيفه بعد فحص اللقطة بنفسه.
- `content-sensitive-gate.yml` لا يفشل أبدًا: ينشر commit status باسم `content-sensitive` — `pending` («بانتظار التحقق البصري — أضف وسم visually-verified بعد فحص اللقطة») للحسّاس بلا وسم، و`success` لغير الحسّاس أو بعد الوسم. أي commit جديد بعد الوسم **يُزيل الوسم تلقائيًا** ويعيد `pending` (التحقق كان للنسخة السابقة).
- قائمة المسارات الحسّاسة في ملف واحد: `.github/content-sensitive-paths` (نص شرعي معروض/منسوخ/مشارَك فقط؛ لا أداء ولا تخزين ولا تخطيط ولا حالات فارغة) واختبارها `scripts/test-content-sensitive-paths.sh`.
- **لكل النوافذ:** افحص اللقطة بنفسك ثم أضف `visually-verified`؛ لا تضعه قبل الفحص. (عند فشل التصنيف أضف المسار الناقص/الزائد في ملف القائمة مع حالة اختبار.)
- سبب القاعدة: #3192 عرضت أحاديث ضعيفة تحت «موضوعة» ودُمج قبل الفحص البصري.

## تصدير البيانات تزايدي بكاش مشترك (ن4)
مرحلة «تجهيز البيانات» = `ios-native/scripts/prepare-data.sh`: تحسب hash لمدخلات التصدير (blob SHAs المتتبَّعة لـ`content`/`public/data`/`public/fonts`/`src`/`scripts/native` + أي تعديل أو ملف غير متتبَّع، ~0.1ث) ثم:
1. ختم `ios-native/Data/.input-hash` مطابق ⇒ تخطٍّ فوري (كل بناء بعد الأول في الـworktree).
2. وإلا كاش مشترك `~/.cache/ssunnah-native-data/<hash>/` ⇒ نسخ clonefile بثوانٍ (يُعاد استعماله بين كل النوافذ).
3. وإلا تصدير كامل ثم نشر ذري للكاش؛ قفل على الـhash يمنع نافذتين من تصدير المدخلات نفسها (التالية تنتظر ثم تقرأ الكاش).

`FORCE_EXPORT=1` يتجاوز الكاش. لا حاجة لتشغيل `native-export-data.sh` يدويًا قبل البناء. إن لم تتغيّر مدخلات الداتا في فرعك فلن تدفع كلفة التصدير مطلقًا.
