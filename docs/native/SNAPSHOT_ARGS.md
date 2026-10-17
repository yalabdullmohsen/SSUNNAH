# معاملات إطلاق لقطات التدقيق (Debug فقط)

كلها تعمل في بناء Debug للمحاكي فقط، وغير موجودة في Release؛ يفرض ذلك `scripts/native-debug-hooks-guard.sh` (مصدرًا وbinary).

| المعامل | الأثر | الملف |
|---|---|---|
| `-snapshotRoute <route>` | يفتح أي مسار مسجّل عند الإقلاع بلا حوار الرابط العميق | `Shell/RootTabView.swift` |
| `-snapshotScroll end` أو كسر `0.5` | يمرّر أكبر شاشة تمرير ظاهرة إلى نهايتها (يعيد المحاولة نحو 30 ثانية لأن المحتوى يكبر بعد التحميل) | `Components/SnapshotScroll.swift` |
| `-snapshotRoute /prophets -snapshotProphet <index>` | يفتح صفحة النبي ذي الفهرس <index> في مصفوفة `prophets` (UserDefaults `snapshotProphet` → `ProphetPageView(start:)`)، DEBUG فقط. مقروء من كود #3461 (فرع `n1/design-prophets`) | `Sections/sirah/ProphetsStories.swift` (#3461، غير مدموج بعد) |
| `-snapshotRoute /explainers` | شاشة الشروح («مراحل خلق الإنسان»)؛ تحتاج تصدير explainers.json. من #3470، بحسب ن1 | #3470 |

## الصيغة
```
xcrun simctl launch <UDID> com.yousef.majlisilm -snapshotRoute /hadith/daif -snapshotScroll end
```
- `-snapshotScroll` يعمل مع أي شاشة طويلة (UIScrollView/ScrollView/List) دون خطاف في الشاشة، فيخدم لقطة زر الإبلاغ والذيل الموحّد أسفل الصفحة.
- يُدمج مع حجم الخط: `xcrun simctl ui <UDID> content_size accessibility-extra-extra-extra-large` قبل الإطلاق، ثم انتظر اكتمال التحميل (~10 ثوانٍ) قبل `simctl io screenshot`.
- لقطة رسمية: `native-shot-guard.sh <App.app> <مجلد>` يكتب PROVENANCE.txt ويرفض binary قديمًا.
- مسارات «ورقة» (sheet) أو الأدراج غير مشمولة؛ لها `SNAP_DRAWER`/`SNAP_DETAIL` (متغيرات بيئة عبر `SIMCTL_CHILD_`).

## البناء المشترك
`bash scripts/native-head-build.sh` يبني SunnahApp للمحاكي مرة واحدة لكل شجرة نظيفة ويخدم كل النوافذ (`--lookup` يطبع المسار دون بناء)؛ `native-snapshot.sh` يستعمله تلقائيًا، و`native-shot-guard.sh <App.app> <outdir>` يقبله ويكتب PROVENANCE.
نافذة بتعديلات غير مدفوعة تبني لنفسها (الأمر يخرج بـ3)، ثم تمرّر `APP=<مسار .app>` للقطات.

## تغطية الوسم visually-verified (صيغة الأسماء)
الحارس `scripts/native-sensitive-coverage.sh` يطلب لكل ملف حسّاس معدَّل في الـPR أحد:
1. صورة png/jpg مضافة/معدَّلة اسمها (بعد إبقاء a-z0-9 صغيرة) يحوي اسم الملف بلا امتداد، أو اسمه بعد حذف اللاحقة Screens|Screen|Views|View|Adapters|Models|Content|Reading (وللملفات تحت `Data/` اسم المجلد الأب).
2. سطر في `PROVENANCE.txt` معدَّل يحوي الاسم نفسه.
3. سطر `covers=<اسم>`.
تحقق قبل الدفع: `bash scripts/native-sensitive-coverage.sh origin/native-app HEAD`. الاسم المختصر (كطول <4) لا يُقبل. وPR بتعارض (CONFLICTING) لا تُشغَّل عليه فحوص CI فيبدو بلا check-runs: ادمج native-app في الفرع أولًا.
