# PRIVACY_CHECK — مراجعة الخصوصية لتطبيق SwiftUI (1.2.0)

> مراجعة ملفات فقط (لا بناء). **ن4 يتحقق بالبناء**: Archive ينجح، وتقرير الخصوصية (Product ▸ Archive ▸ Generate Privacy Report) يطابق هذا الملف. المصدر: `ios-native/SunnahApp/{Info.plist,PrivacyInfo.xcprivacy,SunnahApp.entitlements}` والحزم `artifacts/majalis/ios/App/{SunnahNative,SunnahDataKit,SunnahPrayer}` (فحص `grep` للـ APIs).

## 1) البيانات المجمَّعة (تُرسل خارج الجهاز)
المصدر: `AccountNetwork.swift`/`SupabaseAuthAdapter.swift` (Supabase Auth + `/rest/v1/*` + `POST /api/submissions`).

| فئة ASC | النوع | مرتبط بالمستخدم | تتبع | الغرض | الدليل |
|---|---|---|---|---|---|
| Contact Info | Email Address | نعم | لا | App Functionality | تسجيل الدخول |
| Contact Info | Name | نعم | لا | App Functionality | `full_name` في الجلسة |
| Identifiers | User ID | نعم | لا | App Functionality | معرّف Supabase |
| User Content | Other User Content | نعم | لا | App Functionality | `user_submissions`، `bookmarks` |
| Usage Data | Product Interaction | نعم | لا | App Functionality | `reading_resume`، `achievements`، `lesson_registrations` |

**غير مجمَّع:** الموقع (يُحسب على الجهاز، لا يُرسل)، اتجاه البوصلة، الصوت (لا تسجيل)، Device ID/رمز APNs (التطبيق الأصلي لا يسجّل إشعارات بعيدة)، التشخيصات (لا SDK ولا Crash reporter في الكود). الأرقام الهاتفية (نموذج دعوة) غير موجودة في الأصلي. لا SDK تحليلات؛ مفتاح «التحليلات الاختيارية» في مركز الخصوصية افتراضيًا مُعطّل ولا مُرسِل له في الأصلي.
**التتبع:** لا (`NSPrivacyTracking=false`، لا نطاقات تتبع).

## 2) Required Reason APIs
| الفئة | الاستخدام | السبب | الحالة |
|---|---|---|---|
| UserDefaults | `@AppStorage`/`UserDefaults` للتفضيلات + `Shared/SunnahSharedData` (App Group للويدجت) | `CA92.1` + **`1C8F.1` (أُضيف)** | ✅ |
| File timestamp | `DiskCache.swift` يقرأ `modificationDate` لملفات داخل حاوية التطبيق | `C617.1` | ✅ |
| Disk space / System boot time / Active keyboard | لا استخدام (بحث `systemFreeSize`, `volumeAvailableCapacity`, `systemUptime`, `mach_absolute_time`) | — | لا إعلان |

`attributesOfItem[.size]` (حجم الملف) ليس من الفئة ولا يحتاج إعلانًا.

## 3) ما أُصلح في الملفات (هذا الـPR)
- `PrivacyInfo.xcprivacy`: أضيف سبب `1C8F.1`، وأنواع: Name، Other User Content، Product Interaction (كانت Email وUser ID فقط)، وحُدّث التعليق.

## 4) ملاحظات لا تُعدَّل دون بناء (قرار ن4)
- `NSMicrophoneUsageDescription`: لا كود تسجيل في الأصلي (AVAudioSession/Engine في هدف Capacitor فقط). نصّه يَعِد بالتسميع؛ إن لم يُشحن التسميع فاحذف المفتاح وإلا فسيسأل المراجع.
- `NSMotionUsageDescription`: البوصلة تستخدم `CLLocationManager` heading لا CoreMotion؛ المفتاح غير ضروري.
- `NSUserNotificationsUsageDescription`: ليس مفتاح iOS صالحًا (بلا أثر)؛ طلب الإذن يتم بـ `UNUserNotificationCenter`.
- `SunnahApp.entitlements`: `aps-environment=development` — التوقيع التلقائي عند التصدير لـ App Store يحوّله إلى `production`؛ تأكّد من ذلك في الـIPA (`codesign -d --entitlements :-`). إن لم تُستخدم الإشعارات البعيدة فاحذف القيمة والقدرة.
- ملحقات الويدجت وLive Activity: `generate-xcodeproj.rb` لا يولّد لها أهدافًا (هدف `SunnahApp` فقط، `MARKETING_VERSION=1.2.0`، `CURRENT_PROJECT_VERSION=100`)، فلا حاجة لبيان خصوصية لها الآن؛ إن أُضيفت لاحقًا فلكلٍّ `PrivacyInfo.xcprivacy` (UserDefaults لمجموعة التطبيق `1C8F.1`). لذلك `NSSupportsLiveActivities` بلا أثر حتى ذلك الحين.
- `UIBackgroundModes`: `audio` (تشغيل القرآن) و`fetch` (BGTask `…prayer-refresh`) — كلاهما له استخدام؛ لا `remote-notification`.

## 5) ملء «App Privacy» في App Store Connect
App Store Connect ← التطبيق ← **App Privacy** ← **Edit** (Data Types):
1. «Do you or your third-party partners collect data from this app?» = **Yes**.
2. اختر: **Contact Info** ▸ Email Address، Name؛ **Identifiers** ▸ User ID؛ **User Content** ▸ Other User Content؛ **Usage Data** ▸ Product Interaction.
3. لكل نوع: Purpose = **App Functionality** فقط؛ Linked to user = **Yes**؛ Used for tracking = **No**.
4. **Publish**. رابط سياسة الخصوصية (Privacy Policy URL) إلزامي: استخدم الصفحة الحالية المنشورة للتطبيق (لم أتحقق منها هنا).
القائمة الأوسع في `docs/store-release/APP_STORE_PRIVACY_ANSWERS_DRAFT.md` مبنية على تطبيق Capacitor (تشمل Phone/Device ID/Analytics)؛ **للأصلي استخدم هذا الملف**، وإن أبقيتم الأوسع فهو آمن (إفصاح زائد) لكنه غير دقيق.
