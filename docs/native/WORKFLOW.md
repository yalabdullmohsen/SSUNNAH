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
- `.github/workflows/content-sensitive-gate.yml` يفشل ما لم يحمل الـPR الحسّاس وسم `visually-verified`. لا يُفعَّل auto-merge قبل الوسم.
- سبب القاعدة: #3192 عرضت أحاديث ضعيفة تحت «موضوعة» ودُمج قبل الفحص البصري.
