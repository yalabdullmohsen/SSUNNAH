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

## بوابة البناء `scripts/build-slot.sh` (إلزامية لكل النوافذ، ن4)
سبب الإضافة: استنفاد حدّ العمليات `ulimit -u` (fork) أسقط كل النوافذ. الآن **ببناء/قياس واحد في كل مرة (BUILD_SLOTS=1؛ الـswap شبه ممتلئ) عبر كل الـworktrees**، والباقي ينتظر دوره (طابور FIFO)، مع تنظيف تلقائي لليتامى وتحذير من الحمل.
- الاستعمال: `bash scripts/build-slot.sh -- xcodebuild …` (أو أي أمر ثقيل: xctest، xctrace، سكربت قياس). `status` يعرض الخانات والطابور وحمل العمليات؛ `reap` ينظّف يتامى worktree الحالي.
- كل سكربتات `scripts/native-*.sh` وسكربتات المحاكي تمر عليه تلقائيًا (سطر `BUILD_SLOT_HELD` في أولها)؛ التداخل آمن (لا قفل ذاتي). `native-build-locked.sh` يأخذ قفل الـDerivedData ثم الخانة.
- **التنظيف:** عند البدء وعند الانتهاء/الإشارة (INT/TERM) تُقتل عمليات `xcodebuild|xctest|XCTRunner|swift-*|xctrace|fswatch` **اليتيمة** (أبوها launchd أو ميت) **التي يحمل سطر أمرها مسار worktree هذا** أو `BUILD_SLOT_PATTERNS` (مثل DerivedData) فقط. لا `pkill` بالاسم ولا قتل لعمليات نافذة أخرى.
- **الحمل:** عمليات المستخدم >70% من `ulimit -u` ⇒ تحذير؛ ≥90% ⇒ ينتظر انخفاضه (حتى 10 دقائق) ثم يرفض بالرمز 75.
- `BUILD_SLOTS=N` يغيّر العدد (الافتراضي 2). لا تشغّل `xcodebuild` أو قياسًا ثقيلًا خارجه.

## لا worktree ولا عمل داخل `/tmp`
`/tmp` يُمسح عند إعادة التشغيل. الـworktrees في `~/.majalis-tools/wt/` أو `~/ssunnah-wt/`، والـDerivedData في `~/.majalis-tools/dd/<نافذة>`. `native-window-guard.sh` يرفض العمل من مسار تحت `/tmp` أو `/var/folders`. (السجلات المؤقتة فقط تجوز هناك.)

## المحاكيات (قاعدة ملزمة)
- لا أي سكربت يحذف أو يمسح (`simctl delete` / `erase` / `shutdown all` / `delete unavailable`) محاكيًا لم تنشئه النافذة نفسها في الجلسة نفسها. لا `erase all` أبدًا.
- المسموح الوحيد: سكربت ينشئ محاكيه بنفسه (`simctl create`) ثم يحذف ذلك المعرّف حصرًا (مثل `capture-store-screenshots.sh`).
- **ممنوع أي أمر يمسّ كل المحاكيات أو محاكيات لم تنشئها نافذتك**: `simctl shutdown all` و`erase all` و`delete all` و`delete unavailable` وأي حلقة على `simctl list` تُغلق/تمسح/تحذف. أغلق محاكيك فقط بمعرّفه: `xcrun simctl shutdown <UDID>`. (وقعت الحادثة: `shutdown all` أغلق محاكيات ن1/ن3/ن4 العاملة؛ لا تتكرر.)
- سبب القاعدة: اختفى `n2-sim` لأن `disk-clean.sh` كان يحذف كل المحاكيات عدا واحد؛ أُزيل ذلك. `scripts/check-no-sim-delete.sh` يفرض القاعدة (يُشغَّل في native-release-check).

## أولوية طابور البناء
`build-slot.sh` يرتّب الطابور: ن3 (قياس الأداء) ثم ن1 ثم ن2 ثم ن4؛ ن4 بناءاتها قصيرة (عيّنة/اختبار محدد). `BUILD_SLOT_PRIO=<رقم>` يتجاوز الأولوية.

## لقطة مسار واحد: `-snapshotRoute <route>` (Debug فقط)
`xcrun simctl launch <UDID> com.yousef.majlisilm -snapshotRoute /fawaid` يفتح أي مسار يعرفه `AppRouter` (مثل `/hadith/daif` و`/about` و`/mushaf/page/150`) عند الإقلاع بلا حوار الرابط العميق؛ الخطافات الداخلية الأخرى (`SNAP_DETAIL`…) تبقى متغيّرات بيئة `SIMCTL_CHILD_*`. كله داخل `#if DEBUG`، ويفحص `scripts/native-debug-hooks-guard.sh` أن لا أثر له في Release.

## بناء HEAD المشترك للمحاكي
`bash scripts/native-head-build.sh` يبني SunnahApp للمحاكي مرة واحدة لكل شجرة مصدر نظيفة (المفتاح من `native-head-key.sh`) ويخزّنه في `~/.majalis-tools/headbuild/<key>/` (+ PROVENANCE.txt وهاش الـbinary)؛ يمرّ عبر build-slot فيخدم كل النوافذ ببناء واحد، و`--lookup` يطبع المسار دون بناء.
`native-snapshot.sh` يستعمله تلقائيًا و`native-shot-guard.sh` يقبله؛ نافذة بتعديلات غير مدفوعة في ios-native/SunnahNative تبني لنفسها (الأمر يرفض بخروج 3). أوامر `archive` تأخذ أولوية قبل بناءات الاختبار في build-slot.

## قواعد البناء والاختبار (خانة واحدة)
- كل `xcodebuild` / `swift build` / `swift test` / `simctl boot` عبر `scripts/build-slot.sh --` فقط؛ hook على مستوى المستخدم (`~/.majalis-tools/build-gate-hook.sh`) يرفض غير ذلك.
- شغّل البناء في الخلفية وأكمل كتابة الكود أثناء الانتظار؛ لا تحجز الجلسة على الانتظار.
- الاختبار أثناء العمل للأهداف المتأثرة فقط (`--filter`)، والكامل مرة قبل الدمج.
- لا تحذف DerivedData ولا مخزن headbuild؛ محاكي واحد مشترك لكل نافذة (`NATIVE_WINDOW`).
- لا تُحمّل نموذج WhisperKit في الاختبارات إلا عند الحاجة الفعلية؛ استعمل mock بدله.
