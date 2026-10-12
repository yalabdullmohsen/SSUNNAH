# لقطات App Store (iPhone 6.9")

## الوضع الحالي
لا مجلد `fastlane/screenshots` في المستودع (لم يوجد قط). لقطات الإصدارات السابقة تبقى في App Store Connect؛ إن كانت مجموعة 6.9" مكتملة منها فقد لا تحتاج رفعًا جديدًا (قد تُنسَخ تلقائيًا للأحجام الأصغر). الإصدار 1.2.0 واجهته جديدة (SwiftUI) فالأفضل لقطات جديدة.

## المقاس المطلوب
iPhone 6.9": **1320×2868** (iPhone 16/17 Pro Max) — يقبل ASC أيضًا 1290×2796 و1260×2736؛ من 1 إلى 10 لقطات PNG/JPEG بلا شفافية. اعتمدنا 1320×2868 ليغطي الأحجام الأصغر تلقائيًا.

## الشاشات الست (بالعربية RTL)
| # | الشاشة | الرابط العميق |
|---|---|---|
| 01 | الرئيسية | `majlisilm://` |
| 02 | المصحف | `majlisilm://mushaf` |
| 03 | المواقيت | `majlisilm://prayer-times` |
| 04 | القبلة | `majlisilm://qibla` |
| 05 | الأذكار | `majlisilm://adhkar` |
| 06 | المكتبة | `majlisilm://library` |

المسارات الستة موجودة في `ROUTE_TEMPLATE_MAP.json`، والتطبيق يفتحها عبر مخطط `majlisilm://` (`Route.path(from:)`).

## التشغيل (ن4 بعد بناء Release للمحاكي — لا يُشغَّل الآن)
```bash
xcodebuild -project ios-native/SunnahApp.xcodeproj -scheme SunnahApp -configuration Release \
  -sdk iphonesimulator -derivedDataPath ios-native/build/dd build
ios-native/scripts/capture-store-screenshots.sh \
  ios-native/build/dd/Build/Products/Release-iphonesimulator/SunnahApp.app
```
السكربت: ينشئ محاكيًا **مؤقتًا خاصًا به** (لا يمسّ المحاكيات المشتركة ويحذفه عند الانتهاء)، يضبط شريط الحالة 9:41 وموقع الرياض ويمنح إذن الموقع، يشغّل التطبيق بـ`-AppleLanguages (ar)`، يفتح كل رابط ويلتقط، ويتحقق من الأبعاد. المخرجات في `ios-native/build/screenshots/ar-SA/` (مُتجاهَلة في git).

## قبل الرفع
- راجع كل لقطة بالعين: لا نص مقطوع، لا شاشة تحميل/خطأ شبكة، ولا بيانات شخصية.
- الرفع: يدويًا في App Store Connect ← 1.2.0 ← Screenshots ← iPhone 6.9"، أو بـ`deliver` بوضع `screenshots_path: "ios-native/build/screenshots"` (يتطلب بنية `ar-SA/` وتفعيل اللغة؛ lane `native_release` يتخطى اللقطات حاليًا `skip_screenshots: true`).

## غير مُتحقَّق
السكربت لم يُشغَّل (المحاكي مشترك). أسماء الأجهزة/الـruntime تُستخلص من `simctl list`؛ إن ظهر حوار «فتح في التطبيق؟» عند `openurl` فأكّده يدويًا أول مرة أو بدّل الرابط إلى `https://www.ssunnah.com/<المسار>` (Universal Link).
