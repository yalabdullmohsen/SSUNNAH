# معاملات إطلاق لقطات التدقيق (Debug فقط)

كلها تعمل في بناء Debug للمحاكي فقط، وغير موجودة في Release؛ يفرض ذلك `scripts/native-debug-hooks-guard.sh` (مصدرًا وbinary).

| المعامل | الأثر | الملف |
|---|---|---|
| `-snapshotRoute <route>` | يفتح أي مسار مسجّل عند الإقلاع بلا حوار الرابط العميق | `Shell/RootTabView.swift` |
| `-snapshotScroll end` | يمرّر أكبر شاشة تمرير ظاهرة إلى نهايتها (يعيد المحاولة نحو 30 ثانية لأن المحتوى يكبر بعد التحميل) | `Components/SnapshotScroll.swift` |

## الصيغة
```
xcrun simctl launch <UDID> com.yousef.majlisilm -snapshotRoute /hadith/daif -snapshotScroll end
```
- `-snapshotScroll` يعمل مع أي شاشة طويلة (UIScrollView/ScrollView/List) دون خطاف في الشاشة، فيخدم لقطة زر الإبلاغ والذيل الموحّد أسفل الصفحة.
- يُدمج مع حجم الخط: `xcrun simctl ui <UDID> content_size accessibility-extra-extra-extra-large` قبل الإطلاق، ثم انتظر اكتمال التحميل (~10 ثوانٍ) قبل `simctl io screenshot`.
- لقطة رسمية: `native-shot-guard.sh <App.app> <مجلد>` يكتب PROVENANCE.txt ويرفض binary قديمًا.
- مسارات «ورقة» (sheet) أو الأدراج غير مشمولة؛ لها `SNAP_DRAWER`/`SNAP_DETAIL` (متغيرات بيئة عبر `SIMCTL_CHILD_`).
