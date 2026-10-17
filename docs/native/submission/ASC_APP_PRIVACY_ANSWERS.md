# ورقة إجابات «App Privacy» في App Store Connect — تطبيق «سُنّة» (iOS الأصلي)

> ✅ **الهدف المرفوع (تأكيد يوسف):** `SunnahApp` من `ios-native` (أرشيف 104؛ إذن الموقع فقط، بلا ميكروفون ولا حركة ولا إشعارات بعيدة). هدف Capacitor القديم مُعطَّل ولا يُرفع. النطاقان `www.ssunnah.com` و`majlisilm.com` موقوفان (تُركت المواقع): لا يُذكران حيّين. الشروط = EULA القياسي من Apple مع شاشة داخل التطبيق لبنودنا. روابط الخصوصية والدعم تُعتمد بعد جدول ن4.


الترتيب هو ترتيب واجهة ASC (App Store Connect ← App Privacy). انسخ عمود «الإجابة» كما هو. الرقم/البناء: انظر `docs/native/release-state.json`.
المصادر المختصرة: **AUDIT** = `docs/native/store/PRIVACY_AUDIT_CLOUD.md`، **CHECK** = `docs/native/store/PRIVACY_CHECK.md`، **AP** = `docs/native/store/app-privacy.md`، **MF** = `ios-native/SunnahApp/PrivacyInfo.xcprivacy`.

> **حدود التحقق:** كل ما يلي مبني على فحص ساكن للوثائق والكود. لم يُشغَّل التطبيق ولم يُلتقط Privacy Report ولا حركة شبكة حية (AUDIT بند 22). حالة الإنتاج لـ`delete_my_account`/`export_my_account` (مطبّقة، والحذف والتصدير ناجحان) هي **إفادة المالك** مع دليلين، ولم أتحقق منها بنفسي.

## 0. تعارضات (اقرأها أولًا)

| # | التعارض | التفصيل والمصدر | الأثر على الإجابات |
|---|---|---|---|
| 1 | manifest الأصلي ≠ manifest الـCapacitor | الأصلي (MF) يعلن 5 أنواع فقط. `artifacts/majalis/ios/App/App/PrivacyInfo.xcprivacy` أوسع (يضيف PhoneNumber وDeviceID وSearchHistory وCrashData وPerformanceData، وAnalytics غرضًا ثانيًا للتفاعل) وينقصه FileTimestamp وUserDefaults 1C8F.1. CHECK يصف `docs/store-release/APP_STORE_PRIVACY_ANSWERS_DRAFT.md` بأنه للـCapacitor ومبالغ في الإفصاح. | الإجابات أدناه للأصلي. **لم أتحقق أي manifest يُحزَّم في الثنائي المرفوع**؛ على يوسف التأكد أن الهدف المرفوع هو `ios-native/SunnahApp.xcodeproj`. |
| 2 | الميكروفون/التسميع | **محسوم:** `ios-native/SunnahApp/Info.plist:19` الموقع فقط، بلا ميكروفون/حركة؛ لا AVAudioSession تسجيل ولا SFSpeech ولا CMMotion في الهدف (بحث). ميكروفون Capacitor خارج الهدف المرفوع. | لا تصريح ميكروفون؛ الإجابات بلا Audio Data. |
| 3 | MetricKit غير مذكور في الوثائق | `ios-native/SunnahApp/Platform/PerformanceMetrics.swift` يشترك في `MXMetricManager` ويكتب JSON محليًا (آخر 14 ملفًا) ولا نداء شبكة فيه (grep). AP/CHECK يقولان «لا تشخيصات». | لا تغيير: البيانات لا تغادر الجهاز فليست «مجموعة». إن أُضيف رفع لاحقًا وجب تحديث Diagnostics (Crash/Performance). |
| 4 | Live Activity | **محسوم:** `ios-native/SunnahApp/Platform/LiveActivityAdapter.swift:1-23` يفوّض إلى `PrayerLiveActivityController` (محلي، بلا pushType)، ولا `NSSupportsLiveActivities` في `Info.plist` → لا تُدّعى في الوصف. | لا أثر على أنواع البيانات. |
| 5 | نطاق `www.ssunnah.com` | **محسوم بقرار المالك:** النطاقان `www.ssunnah.com` و`majlisilm.com` موقوفان وتُركت المواقع؛ لا يُكتب أنهما حيّان. | رابط الخصوصية والدعم يُحدَّد بعد جدول ن4. |
| 6 | Privacy Report | AUDIT بند 24 «مُنجَز بسكربت»، بينما `docs/native/store/OWNER_CHECKLIST.md:64` يقول إن Privacy Report لم يُتحقق منه. | يُعامل بوصفه **غير مُتحقَّق** حتى يُولَّد التقرير من أرشيف حقيقي. |
| 7 | نطاقات الصوت | إفصاح EveryAyah/MP3Quran مشروط بنتيجة `AUDIO_HEADERS_CHECK.md` (APPSTORE_METADATA 77–88)؛ لم يُشغَّل أي بند منه. | الإجابات أدناه (لا Device ID ولا Diagnostics) تفترض أن النتيجة لا تغيّر شيئًا. إن ظهرت متتبِّعات/رؤوس تعريف فزامِن CHECK §1 وMF وAP. |

## 1. Data Collection — «هل تجمع أنت أو شركاؤك بيانات من هذا التطبيق؟»

| | |
|---|---|
| **الإجابة (ع)** | نعم، نجمع بيانات |
| **Answer (EN)** | Yes, we collect data from this app |
| المصدر | AP «الإجابات»؛ CHECK §1 و§5؛ MF سطور 6–22 |
| ملاحظة | تُجمع فقط عند تسجيل الدخول (حساب Supabase) وإرسال مساهمة؛ كل شيء آخر محلي. بلا SDK طرف ثالث (APPSTORE_METADATA:15). |

## 2. أنواع البيانات المجمّعة (5) — لكل نوع: Purposes / Linked / Tracking

لكل نوع الإجابات الثلاث متطابقة: **Purposes = App Functionality فقط** (ولا شيء آخر: لا Analytics ولا Advertising ولا Personalization ولا Product Personalization ولا Developer's Advertising)، **Linked to You = نعم** (مرتبط بالمستخدم)، **Used for Tracking = لا**.

| # | فئة ASC ← النوع | الإجابة (ع) | Answer (EN) | المصدر (وثيقة) | المصدر (كود) |
|---|---|---|---|---|---|
| 2.1 | Contact Info ← **Email Address** | نعم مجمّع؛ الغرض: وظائف التطبيق؛ مرتبط بالمستخدم: نعم؛ تتبّع: لا | Collected; Purpose: App Functionality; Linked: Yes; Tracking: No | CHECK §1؛ AP؛ AUDIT جدول البنود | البريد يُرسَل عند الدخول وفي صف المساهمة: `AccountNetwork.swift:155`؛ تسجيل الدخول `SupabaseAuthAdapter.swift:42-44,51` |
| 2.2 | Contact Info ← **Name** | نعم مجمّع؛ الغرض: وظائف التطبيق؛ مرتبط: نعم؛ تتبّع: لا | Collected; App Functionality; Linked: Yes; Tracking: No | CHECK §1؛ AP | الاسم من بيانات الحساب `full_name` ومن حقل المساهم: `AccountNetwork.swift:90,101,150,153` (`submitter_name`) |
| 2.3 | Identifiers ← **User ID** | نعم مجمّع؛ وظائف التطبيق؛ مرتبط: نعم؛ تتبّع: لا | Collected; App Functionality; Linked: Yes; Tracking: No | CHECK §1؛ AP | معرّف المستخدم في الصف والجلسة: `AccountNetwork.swift:152` (`user_id`)، `:101` |
| 2.4 | User Content ← **Other User Content** | نعم مجمّع؛ وظائف التطبيق؛ مرتبط: نعم؛ تتبّع: لا | Collected; App Functionality; Linked: Yes; Tracking: No | CHECK §1؛ AP | مساهمات المستخدم (عنوان/وصف/ملف) تُدرج في `user_submissions`: `AccountNetwork.swift:152-156` (RLS: صفّ المستخدم وبحالة pending، تعليق `:162`) |
| 2.5 | Usage Data ← **Product Interaction** | نعم مجمّع؛ وظائف التطبيق؛ مرتبط: نعم؛ تتبّع: لا | Collected; App Functionality; Linked: Yes; Tracking: No | CHECK §1؛ AP | نشاط الحساب المتزامن (مثل إعدادات/تقدّم مرتبط بالحساب) عبر Supabase REST؛ **لم أحدد ملف:سطر بعينه** — المرجع AUDIT جدول البنود |

ملاحظات: (أ) حدّد في ASC لكل نوع الخيار «App Functionality» فقط. (ب) لو سأل ASC «هل تُستخدم للتتبع؟» أجب لا في الأنواع الخمسة. (ج) الحذف: المستخدم يحذف حسابه من داخل التطبيق (حساب ← مركز الخصوصية ← «حذف الحساب نهائيًا»، AP «مسار الحذف»، RPC `delete_my_account` عبر `SupabaseAuthAdapter.swift:80-82`)، والتصدير RPC `export_my_account` (`AccountNetwork.swift:170`)؛ **إفادة المالك** أن الحذف والتصدير نجحا من جهازه.

## 3. Tracking — «هل تستخدم البيانات للتتبع؟»

| | |
|---|---|
| **الإجابة (ع)** | لا، لا يتتبع التطبيق المستخدمين ولا يربط بياناتهم ببيانات أطراف أخرى لأغراض إعلانية |
| **Answer (EN)** | No. The app does not track users. |
| المصدر | AP؛ APPSTORE_METADATA:15,73؛ MF: `NSPrivacyTracking=false` وقائمة نطاقات تتبع فارغة (AUDIT: PrivacyInfo.xcprivacy:6-22) |
| ATT | لا يُطلب إذن التتبع ولا يوجد `NSUserTrackingUsageDescription` (APPSTORE_METADATA:15) |

## 4. أنواع البيانات غير المجمّعة (اختر «لا نجمع» لكل ما يلي)

| الفئة/النوع | الإجابة (ع) | Answer (EN) | المصدر |
|---|---|---|---|
| Location (Precise / Coarse) | لا يُجمع؛ الموقع يُقرأ على الجهاز لحساب المواقيت والقبلة ولا يغادره | Not collected (on-device only) | CHECK §1؛ AP؛ وصف الاستخدام `Info.plist:19`؛ المواقيت محمية ولم تُمسّ |
| Health & Fitness، Financial Info، Sensitive Info | لا يُجمع | Not collected | AP؛ AUDIT |
| Contacts، Browsing History، Search History | لا يُجمع | Not collected | AP؛ CHECK §1 (بخلاف manifest الـCapacitor، تعارض 1) |
| Contact Info ← Phone Number / Physical Address | لا يُجمع | Not collected | CHECK §1 |
| User Content ← Photos or Videos، Audio Data، Gameplay، Customer Support، Emails or Text Messages | لا يُجمع (الصوت: انظر تعارض 2؛ التسجيل إن وُجد محلي) | Not collected | CHECK §1 والسطر 40؛ AUDIT |
| Identifiers ← Device ID / Advertising | لا يُجمع (لا APNs: لا `aps-environment` في `SunnahApp.entitlements:5-17`؛ الإشعارات محلية فقط) | Not collected | CHECK §1؛ AUDIT |
| Purchases | لا يُجمع (لا مشتريات) | Not collected | AP |
| Diagnostics ← Crash / Performance / Other | لا يُجمع (MetricKit محلي فقط، تعارض 3) | Not collected | CHECK §1؛ `PerformanceMetrics.swift` |
| Usage Data ← Advertising Data / Other Usage Data | لا يُجمع | Not collected | AP |

## 5. Privacy Policy URL وPrivacy Choices

| البند | الإجابة |
|---|---|
| **Privacy Policy URL** | `https://yalabdullmohsen.github.io/sunnah-legal/privacy.html` (HTTP 200 بحسب APPSTORE_METADATA:14؛ لم أعد التحقق) |
| **User Privacy Choices URL** | اختياري. لا رابط موثّق في المصادر؛ اتركه فارغًا إلا إن قرّر المالك. حذف الحساب متاح داخل التطبيق (القسم 2). |
| Support URL | انظر `docs/native/store/OWNER_CHECKLIST.md:37-39` (لا أكرره هنا) |
| Export compliance | `ITSAppUsesNonExemptEncryption=false` (`Info.plist:17`، AP) |

## 6. Required Reason APIs (للمراجعة لا للنموذج)

| API | السبب | المصدر |
|---|---|---|
| UserDefaults | CA92.1 و1C8F.1 (المجموعة المشتركة للودجت) | MF؛ `PrayerWidgetResources/PrivacyInfo.xcprivacy` (1C8F.1 فقط) |
| File timestamp | C617.1 | MF؛ CHECK §2 |
| Background modes | audio وfetch + BGTask `com.yousef.majlisilm.prayer-refresh` | `Info.plist:22-23`؛ CHECK §4 |

## 6-ب. مطابقة PrivacyInfo.xcprivacy الفعلي (native-app، فُحصت بـplistlib)
- `SunnahApp`: Tracking=false، 5 أنواع (Email/UserID/Name/OtherUserContent/ProductInteraction) كلها Linked=true وTracking=false وغرضها AppFunctionality؛ APIs: UserDefaults (CA92.1,1C8F.1) وFileTimestamp (C617.1) → **يطابق الجدول 2 تمامًا**.
- `SunnahWatchResources` و`PrayerWidgetResources`: Tracking=false، بلا بيانات مجمّعة، UserDefaults 1C8F.1 فقط → لا أثر على إجابات ASC.
- الخانة الوحيدة المفتوحة: «تُطابَق بعد Privacy Report من ن4/يوسف».

## 7. ما لم يُتحقق منه
- أي manifest يُحزَّم فعليًا (تعارض 1) وإمكانية وصول التسميع/الميكروفون في الثنائي الأصلي (تعارض 2).
- Privacy Report من أرشيف حقيقي، والتقاط شبكة حي (AUDIT بند 22 و24).
- `AUDIO_HEADERS_CHECK.md`: لم يُنفَّذ أي بند.
- ملف:سطر دقيق لـProduct Interaction (2.5).
- حالة الإنتاج للحذف والتصدير: إفادة المالك فقط.
