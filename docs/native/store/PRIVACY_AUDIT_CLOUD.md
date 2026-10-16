# تدقيق الخصوصية الساكن — التطبيق الأصلي مقابل وثائق App Store

> التاريخ: 2026-10-16 · النوع: قراءة كود فقط (بلا تشغيل ولا Archive) · النطاق: `ios-native/SunnahApp` وحزم `artifacts/majalis/ios/App/{SunnahNative,SunnahDataKit,SunnahPrayer}` و`docs/native/store/*`.

## الملخص

- عدد البنود: **24**
- مطابق: **14**
- غير مطابق: **7**
- غير متحقق منه: **3**

أهم حالات عدم التطابق:
1. الوثائق تقول إن المساهمات تُرسل إلى `POST /api/submissions` (الموقع)، والكود يرسلها مباشرة إلى Supabase `rest/v1/user_submissions` ومعها البريد.
2. `REVIEW_NOTES` تقول إن التصدير يعتمد على خادم الموقع، والكود يستدعي Supabase RPC `export_my_account`.
3. الدالتان `delete_my_account` و`export_my_account` معرَّفتان فقط في `docs/native/backend/*.sql` لا في أي migration، فوجودهما في الإنتاج غير مثبت.
4. روابط الخصوصية والمحتوى داخل التطبيق تشير إلى `https://www.ssunnah.com`، بينما `PRIVACY_CHECK` نفسه يصف هذا النطاق بأنه متوقف (HTTP 402).
5. `APPSTORE_METADATA` يتناقض مع نفسه بشأن حاسبة المواريث (السطر 3 مقابل 28/49)، مع أن الشاشة موجودة في الكود.

## الجدول

| # | البند | الدليل (ملف:سطر) | الحكم | الإجراء المقترح |
|---|---|---|---|---|
| 1 | إذن الموقع: «يستخدم التطبيق موقعك لحساب مواقيت الصلاة واتجاه القبلة. يُحفَظ الموقع التقريبي على جهازك فقط ولا يُرسَل إلى خوادمنا.» | `ios-native/SunnahApp/Info.plist:19`؛ الاستخدام: `SunnahPrayer/Sources/SunnahPrayer/DeviceLocator.swift:12,38` | مطابق | — |
| 2 | لا توجد مفاتيح `*UsageDescription` أخرى (كاميرا/ميكروفون/حركة/تتبع) | `ios-native/SunnahApp/Info.plist` (المفتاح الوحيد في :19)؛ `PRIVACY_CHECK.md:32`، `app-privacy.md:15` | مطابق | — |
| 3 | الموقع لا يُرسل للشبكة | لا مطابقة لـ `lat=/latitude=/lng=` في كود المصدر (المطابقات فقط في `SunnahPrayer/Tests/.../web-minute-parity.json`)؛ `RemoteTransport.swift:40-41,78` بلا معاملات موقع؛ `app-privacy.md:14` | مطابق | — |
| 4 | Associated Domains: `ssunnah.com`, `www.ssunnah.com`, `majlisilm.com`, `www.majlisilm.com` | `ios-native/SunnahApp/SunnahApp.entitlements:5-11` | مطابق (مستخدم: `Shared/SunnahPrayerDeepLink.swift:9`) | التحقق من ملف AASA على النطاقين حيًّا |
| 5 | App Group `group.com.yousef.majlisilm` | `SunnahApp.entitlements:12-15` | مطابق (مشاركة مع الويدجيت) | — |
| 6 | `usernotifications.time-sensitive` وإشعارات محلية فقط بلا `aps-environment` | `SunnahApp.entitlements:16-17`؛ `SunnahPrayer/.../PrayerNotificationScheduler.swift:13`، `NativeNotifications.swift:12`؛ `PRIVACY_CHECK.md:32`، `REVIEW_NOTES.md:13` | مطابق | — |
| 7 | أوضاع الخلفية `audio`, `fetch` ومهمة `com.yousef.majlisilm.prayer-refresh` | `Info.plist:22-23`؛ `PRIVACY_CHECK.md:35`، `app-privacy.md:17` | مطابق | — |
| 8 | التشفير غير المعفى = false | `Info.plist:17`؛ `app-privacy.md:18` | مطابق | — |
| 9 | لا تتبع ولا SDK إعلانات/تحليلات | `PrivacyInfo.xcprivacy:6-9`؛ بحث `AppTrackingTransparency|ATTrackingManager|AdSupport|ASIdentifierManager|Firebase|Crashlytics|Sentry|Mixpanel|Amplitude|GoogleMobileAds|FBSDK|identifierForVendor` = صفر نتائج؛ الاعتماد الخارجي الوحيد `SunnahPrayer/Package.swift:15` (adhan-swift)؛ `app-privacy.md:7-8` | مطابق | — |
| 10 | أسباب API المطلوبة: UserDefaults (CA92.1, 1C8F.1)، FileTimestamp (C617.1) | `PrivacyInfo.xcprivacy:13-22`؛ `PRIVACY_CHECK.md:22-23`، `app-privacy.md:16` | مطابق | — |
| 11 | البيانات المجمّعة: Email, UserID, Name, OtherUserContent, ProductInteraction (مرتبطة، بلا تتبع) | `PrivacyInfo.xcprivacy:29,39,49,59,69`؛ `app-privacy.md:9-13`؛ الكود: `AccountNetwork.swift:22-40,155` | مطابق | — |
| 12 | Supabase Auth (`/auth/v1/signup`, تسجيل الدخول، `/auth/v1/user`) ببريد وكلمة مرور | `ios-native/SunnahApp/Platform/SupabaseAuthAdapter.swift:51,80-82`؛ `REVIEW_NOTES.md:18,34` | مطابق | — |
| 13 | قراءة بيانات المستخدم من Supabase REST (user_submissions, bookmarks, achievements, lesson_registrations, reading_resume) بـ `user_id=eq.` | `AccountNetwork.swift:22,27,31,36,40,180-187`؛ `PRIVACY_CHECK.md:10-14` | مطابق | — |
| 14 | حذف الحساب: مسار حساب ← مركز الخصوصية ← «حذف الحساب نهائيًا» ← كتابة «حذف» ← RPC | `AccountPrivacyCenterScreen.swift:50`؛ `AccountScreens.swift:97-104,123`؛ `AccountDeletion.swift:11-12,30,53-75`؛ `SupabaseAuthAdapter.swift:44`؛ مدخل `/privacy-center` في `SectionsCatalog.swift:182` و`/account-deletion` في `:168`؛ `REVIEW_NOTES.md:16`، `app-privacy.md:20` | مطابق (في الكود والواجهة) | — |
| 15 | إرسال المساهمات | الوثائق: `PRIVACY_CHECK.md:6`، `REVIEW_NOTES.md:10,22`، `APPSTORE_METADATA.md:69` تقول `POST /api/submissions`؛ الكود: `AccountNetwork.swift:142-164` يرسل إلى `rest/v1/user_submissions` (:156)؛ بحث `api/submissions` في الكود = صفر | غير مطابق | تصحيح الوثائق الثلاث إلى Supabase REST مباشرة |
| 16 | الحقول المرسلة مع المساهمة (type, user_id, title, description, submitter_name, submitter_email, meta.source="ios-native") | `AccountNetwork.swift:142-164` (البريد :155)؛ `PRIVACY_CHECK.md:10-14` لا يذكر إرسال البريد ضمن المحتوى | غير مطابق (جزئي) | ذكر `submitter_email` صراحة في PRIVACY_CHECK |
| 17 | تصدير البيانات | الكود: `AccountPrivacyCenterScreen.swift:29-31,75` ← `AccountNetwork.swift:168-178` `rest/v1/rpc/export_my_account` (:170)؛ الوثيقة: `REVIEW_NOTES.md:31` «يعتمد على خادم الموقع» | غير مطابق | تصحيح REVIEW_NOTES:31 |
| 18 | تعريف `delete_my_account`/`export_my_account` في قاعدة البيانات | موجود فقط في `docs/native/backend/delete-account.sql` و`export-account.sql`؛ بحث في `supabase/` (53 ملف SQL) و`artifacts/supabase/` = صفر | غير مطابق (لا migration) | إضافة migration قابلة للتراجع وتطبيقها على staging ثم الإنتاج بأمر المالك؛ `app-privacy.md:20` و`REVIEW_NOTES.md:30` يشترطانه أصلًا |
| 19 | نطاق الموقع المستخدم داخل التطبيق | `RemoteTransport.swift:12,40` و`AccountTexts.swift:178` و`SunnahPrayerDeepLink.swift:9` = `https://www.ssunnah.com`؛ `PRIVACY_CHECK.md:42,46` يذكر أن النطاق متوقف (402) وأن رابط الخصوصية داخل التطبيق يمر به | غير مطابق | توحيد `siteURL` على نطاق حي (majlisilm.com) أو رابط الخصوصية المعتمد في `PRIVACY_CHECK.md:42` |
| 20 | اتصالات المحتوى بالموقع: `/api/auto-content`, `/api/updates`, `/api/citations/<slug>` | `AccountNetwork.swift:10,13,16`؛ `Special/CitationScreen.swift:25,96` | غير مطابق (تعتمد على النطاق نفسه في #19) | كما في #19، وذكرها في `REVIEW_NOTES.md:10` |
| 21 | حاسبة المواريث | `APPSTORE_METADATA.md:3` ينفي الوعد بها، و`:28,:49,:63` تَعِد بها؛ الشاشة موجودة: `Sections/fiqh/Mawarith/MawarithCalculatorScreen.swift` | غير مطابق (تناقض داخلي في الوثيقة) | حذف النفي من السطر 3 |
| 22 | التلاوة الصوتية من مضيفين خارجيين (EveryAyah, MP3Quran) | الإسناد فقط: `AccountTexts.swift:352-353`؛ التنزيل: `Audio/OfflineRecitation.swift:147` (`URLSession.shared.data(from:)`)، والتشغيل: `Platform/AVPlayerAudioEngine.swift:16`؛ لا عنوان مضيف حرفي في الكود (يأتي من البيانات) | غير متحقق | تأكيد المضيفين من ملفات بيانات القرّاء، وذكر انكشاف IP لطرف ثالث في app-privacy إن لزم |
| 23 | ملف خصوصية الويدجيت | `ios-native/PrayerWidgetResources/PrivacyInfo.xcprivacy` موجود؛ `PRIVACY_CHECK.md:33` | غير متحقق (لم يُقرأ محتواه) | قراءته ومقارنته |
| 24 | تقرير الخصوصية المجمّع من Archive | لا Archive في هذا التدقيق | غير متحقق | توليد Privacy Report من Xcode Organizer |

## ما لم يُتحقَّق منه

- السلوك وقت التشغيل (طلبات الشبكة الفعلية، حالة الأذونات) — التدقيق ساكن فقط.
- وجود الدالتين `delete_my_account` و`export_my_account` وصلاحياتهما (RLS/SECURITY DEFINER) في قاعدة الإنتاج.
- حالة HTTP الحية للنطاقات (`ssunnah.com`، `majlisilm.com`، رابط الخصوصية في `PRIVACY_CHECK.md:42`) وملفات AASA.
- مضيفو الصوت الفعليون (يُحمَّلون من بيانات القرّاء لا من الكود).
- محتوى `ios-native/PrayerWidgetResources/PrivacyInfo.xcprivacy`، وملفات تطبيق Capacitor في `artifacts/majalis/ios/App/App/` (خارج نطاق التطبيق الأصلي).
- Privacy Report الناتج عن Archive.
