# PRIVACY_CHECK — مراجعة الخصوصية لتطبيق SwiftUI (1.2.0)

> مراجعة ملفات فقط (لا بناء). **ن4 يتحقق بالبناء**: Archive ينجح، وتقرير الخصوصية (Product ▸ Archive ▸ Generate Privacy Report) يطابق هذا الملف. المصدر: `ios-native/SunnahApp/{Info.plist,PrivacyInfo.xcprivacy,SunnahApp.entitlements}` والحزم `artifacts/majalis/ios/App/{SunnahNative,SunnahDataKit,SunnahPrayer}` (فحص `grep` للـ APIs).

## 1) البيانات المجمَّعة (تُرسل خارج الجهاز)
المصدر: `AccountNetwork.swift`/`SupabaseAuthAdapter.swift` (Supabase Auth + `/rest/v1/*` + إدراج مباشر في `rest/v1/user_submissions` عبر RLS؛ التصدير `rpc/export_my_account` بجلسة المستخدم). يُرسل مع المساهمة البريد (`submitter_email`) والاسم الاختياري وهما مُعلنان أعلاه كـEmail Address وName.

| فئة ASC | النوع | مرتبط بالمستخدم | تتبع | الغرض | الدليل |
|---|---|---|---|---|---|
| Contact Info | Email Address | نعم | لا | App Functionality | تسجيل الدخول |
| Contact Info | Name | نعم | لا | App Functionality | `full_name` في الجلسة |
| Identifiers | User ID | نعم | لا | App Functionality | معرّف Supabase |
| User Content | Other User Content | نعم | لا | App Functionality | `user_submissions`، `bookmarks` |
| Usage Data | Product Interaction | نعم | لا | App Functionality | `reading_resume`، `achievements`، `lesson_registrations` |

**غير مجمَّع:** الموقع (يُحسب على الجهاز، لا يُرسل)، اتجاه البوصلة، الصوت (لا تسجيل)، Device ID/رمز APNs (التطبيق الأصلي لا يسجّل إشعارات بعيدة)، التشخيصات (لا SDK ولا Crash reporter في الكود). الأرقام الهاتفية (نموذج دعوة) غير موجودة في الأصلي. لا SDK تحليلات؛ مفتاح «التحليلات الاختيارية» في مركز الخصوصية افتراضيًا مُعطّل ولا مُرسِل له في الأصلي.
**التتبع:** لا (`NSPrivacyTracking=false`، لا نطاقات تتبع).

### فقرة مضيفي الصوت (مسودة لسياسة الخصوصية؛ تُلصق في `sunnah-legal/privacy.html` بيد المالك، لا في الويب هنا)
> عند تشغيل التلاوة أو تنزيلها يتصل التطبيق مباشرةً بخوادم **EveryAyah** و**MP3Quran** لجلب الملفات الصوتية. يصل عنوان الشبكة (IP) ونوع الجهاز الذي يرسله الاتصال إلى هذه الخوادم بحكم الاتصال نفسه، ولا يرسل التطبيق إليها أي بيانات أخرى (لا بريد ولا معرّف حساب ولا موقع)، ولا نجمع نحن أي بيانات عن ذلك. لا تُشغَّل هذه الاتصالات إلا عند طلبك التشغيل أو التنزيل، وتخضع سياسات تلك الجهات لشروطها.

- الدليل: `AccountTexts.swift` (قسم «التلاوات» في مصادر المحتوى يسمّي المضيفين)، و`OfflineRecitationTests.swift` (روابط `surahURL` على `*.mp3quran.net`). لم يُتحقق: أن الطلبات تخلو فعليًا من أي ترويسة مخصصة (يلزم فحص شبكة على RC بأداة Proxy، بند في `WHATS_NEW_VERIFICATION.md`).
- قرار المالك (2026-10-16، مشروط): الإفصاح في ملصق ASC يتبع نتيجة `AUDIO_HEADERS_CHECK.md`. إن لم تحمل الطلبات معرّفات تتجاوز IP والـUser-Agent القياسي فلا إفصاح إضافي في الملصق ويكفي نص السياسة أعلاه؛ وإن حملت معرّفات فيُفصَح. الحالتان جاهزتان في `APPSTORE_METADATA.md` (قسم «إفصاح مضيفي الصوت»). النتيجة لم تُملأ بعد (بانتظار بناء RC3).

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
- (محلول) لا `NSMicrophoneUsageDescription` ولا `NSMotionUsageDescription` ولا `NSUserNotificationsUsageDescription` في `Info.plist` الحالي، ولا `aps-environment` في الـentitlements؛ البوصلة تستخدم heading وطلب الإشعار بـ`UNUserNotificationCenter`.
- ملحق الويدجت `PrayerWidget` (مُضمَّن في هدف SunnahApp) له `PrayerWidgetResources/PrivacyInfo.xcprivacy` ضمن موارده: بلا تتبع ولا بيانات مجمّعة، وفئة UserDefaults بسبب `1C8F.1` (App Group)؛ لا شيفرة الويدجت تقرأ ختم ملفات أو واجهات سبب أخرى (فُحص 2026-10-15). المنصة: Live Activity غير مضافة.
- (محلول) نصوص الخصوصية والإعدادات والمساعدة في التطبيق طُوبقت مع الكود: حُذف ذكر «التسميع» والميكروفون وتسجيل الصوت ونموذج التعرّف الصوتي (لا ميزة ولا إذن)، وقسم «المساعد العلمي» (لا مساعد محادثة)، وصُحّح ذكر ملفات تعريف الارتباط إلى «التخزين على جهازك»، والإشعارات إلى تذكيرات محلية، وأرصدة المكتبات إلى التطبيق الأصلي (حزم محلية).
- **تحقق من الأرشيف الفعلي (بناء 104، 2026-10-16):** المرفوع هو هدف `SunnahApp` (ios-native)؛ `Info.plist` الفعلي فيه `NSLocationWhenInUseUsageDescription` فقط، والصلاحيات الموقَّعة: associated-domains وapplication-groups وtime-sensitive (+get-task-allow للتطوير)، بلا `aps-environment`. هدف Capacitor (`artifacts/majalis/ios/App/App`) يحمل المعرّف نفسه وفيه ميكروفون/حركة/remote-notification/aps لكنه **لا يُرفع**. يحرس ذلك `scripts/native-capabilities-check.py` مقابل `docs/native/capabilities-allowlist.json` (في native-release-check وبعد الأرشفة).
- `UIBackgroundModes`: `audio` (تشغيل القرآن) و`fetch` (BGTask `…prayer-refresh`) — كلاهما له استخدام؛ لا `remote-notification`.

## 5) ملء «App Privacy» في App Store Connect
App Store Connect ← التطبيق ← **App Privacy** ← **Edit** (Data Types):
1. «Do you or your third-party partners collect data from this app?» = **Yes**.
2. اختر: **Contact Info** ▸ Email Address، Name؛ **Identifiers** ▸ User ID؛ **User Content** ▸ Other User Content؛ **Usage Data** ▸ Product Interaction.
3. لكل نوع: Purpose = **App Functionality** فقط؛ Linked to user = **Yes**؛ Used for tracking = **No**.
4. **Publish**. رابط سياسة الخصوصية (Privacy Policy URL) إلزامي: استخدم `https://yalabdullmohsen.github.io/sunnah-legal/privacy.html` (مستودع `yalabdullmohsen/sunnah-legal` على GitHub Pages؛ الموقع ssunnah.com ميت HTTP 402).
القائمة الأوسع في `docs/store-release/APP_STORE_PRIVACY_ANSWERS_DRAFT.md` مبنية على تطبيق Capacitor (تشمل Phone/Device ID/Analytics)؛ **للأصلي استخدم هذا الملف**، وإن أبقيتم الأوسع فهو آمن (إفصاح زائد) لكنه غير دقيق.

## رابط الخصوصية داخل التطبيق (فحص ن1)
`AccountLegalScreens`/`AccountPrivacyCenterScreen` يستعملان المسار `/privacy` مع `siteURL = https://www.ssunnah.com` (`RemoteTransport`)؛ Info.plist بلا رابط خصوصية؛ لا `/privacy-policy` في كود التطبيق (يظهر فقط كتحويل إلى `/privacy` في `FEATURE_PARITY.md`). لا إصلاح لازم.

## قرار G1: لا إخفاء لمسارات /universities و/institutions و/islamic-landmarks (يوسف، 2026-10-16)
هذه شاشات أصلية ببيانات مدمجة (`ios-native/Data/learn/universities.json` وinstitutions.json وlandmarks) تعمل دون اتصال ولا تطلب نطاق الموقع، فلا تُخفى. الشبكة الوحيدة المسموحة هي Supabase (`RemoteTransport` يرفض كل مسار غير `/rest/v1/` و`/auth/v1/` بـbadPath). الروابط الثابتة (الخصوصية/الدعم) على github.io يتحقق منها `scripts/native-static-links-check.sh` (200)؛ `terms.html` يعيد 404 فلا يُربط في التطبيق وتبقى اتفاقية Apple القياسية، ويرفض الحارس ورود رابطه.
