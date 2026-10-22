# إجابات App Privacy (App Store Connect) — سُنّة iOS

كل إجابة مرفقة بدليلها في المستودع. الحالة: جاهزة لإدخال المالك؛ لا تُرفع قبل إذنه.

| السؤال | الإجابة | الدليل |
|---|---|---|
| هل يتتبّع التطبيق المستخدم (Tracking)؟ | لا | `PrivacyInfo.xcprivacy`: `NSPrivacyTracking=false`، `NSPrivacyTrackingDomains` فارغة |
| تحليلات/إعلانات/SDK طرف ثالث | لا يوجد | الحزم المستوردة: Adhan (حساب محلي) + حزم محلية؛ لا Firebase/Sentry/Analytics في `ios-native` ولا `SunnahNative/Sources` |
| البريد الإلكتروني | يُجمع، مرتبط بالحساب، **ليس** للتتبع، الغرض: App Functionality | `NSPrivacyCollectedDataTypeEmailAddress` (Linked=true, Tracking=false) |
| الاسم | كالسابق | `NSPrivacyCollectedDataTypeName` |
| المعرّف (User ID) | كالسابق | `NSPrivacyCollectedDataTypeUserID` |
| محتوى آخر للمستخدم (مساهمات/مفضلة) | كالسابق | `NSPrivacyCollectedDataTypeOtherUserContent` |
| تفاعل المنتج (متابعة القراءة/الإنجازات) | كالسابق | `NSPrivacyCollectedDataTypeProductInteraction` |
| الموقع | **لا يُجمع**: يبقى على الجهاز لحساب المواقيت/القبلة ولا يُرسل | `Info.plist: NSLocationWhenInUseUsageDescription`؛ لا إرسال للموقع في `RemoteTransport` |
| الصحة/المالية/جهات الاتصال/الصور/الصوت | لا | لا مفاتيح كاميرا/جهات اتصال في `Info.plist`. الميكروفون للتسميع فقط (قرار المالك 2026-10-22): معالجة على الجهاز، لا إرسال ولا حفظ ← لا يُعدّ جمعًا للصوت |
| واجهات «السبب المطلوب» | UserDefaults (CA92.1, 1C8F.1)، File timestamp (C617.1) | `PrivacyInfo.xcprivacy` |
| الخلفية | audio + fetch؛ BGTask: `com.yousef.majlisilm.prayer-refresh` | `Info.plist` |
| التشفير (Export Compliance) | `ITSAppUsesNonExemptEncryption=false`: صحيح لأن التشفير الوحيد HTTPS القياسي | `Info.plist` سطر 17؛ لا CryptoKit/CommonCrypto/SecKey/CCCrypt في `ios-native` ولا `SunnahNative/Sources` |

الحذف داخل التطبيق: الحساب ← مركز الخصوصية ← «حذف الحساب نهائيًا» (`AccountDeletionView`) يستدعي RPC `delete_my_account` في Supabase بلا الموقع، ثم signOut ومسح محلي. **الحالة:** الدالة مطبَّقة على الإنتاج بدليلين: قراءة تعريفها (Claude بعد تطبيق يوسف لها) وتجربة المالك للحذف والتصدير على جهازه (إفادة المالك). بريد الدعم متغيّر واحد `SUPPORT_EMAIL` في `config.js` بمستودع `sunnah-legal` (القيمة الحالية info@ssunnah.com وصلاحيتها غير مؤكدة؛ المالك يحدّدها). الصفحتان في `yalabdullmohsen/sunnah-legal` (المصدر الوحيد؛ أُزيل `docs/site`).

**شرط:** أي SDK أو إرسال بيانات جديد يعيد هذا الجدول قبل الرفع.

## الجدول النهائي: «مصرَّح به» مقابل «مستخدم فعلًا» (فحص ساكن للكود 2026-10-16)

| البند | مصرَّح به | مستخدم فعلًا (الدليل) | الحالة | صاحب الفرق |
|---|---|---|---|---|
| Email / Name / User ID | مجمَّع، مرتبط، بلا تتبع | Supabase Auth (`SupabaseAuthAdapter.swift`)؛ `submitter_email` يُرسل مع المساهمة (`AccountNetwork.swift:155`) | مطابق | — |
| Other User Content | مجمَّع | `POST rest/v1/user_submissions` (`AccountNetwork.swift:156`) + المفضلة | مطابق؛ الوثائق كانت تذكر `/api/submissions` | وثائق: ن5 (مُصحَّح في REVIEW_NOTES/APPSTORE_METADATA) |
| Product Interaction | مجمَّع | `reading_resume`، `achievements`، `lesson_registrations` | مطابق | — |
| الموقع | غير مجمَّع | يُحسب على الجهاز ولا يُرسل | مطابق | — |
| التحليلات / SDK | لا | لا SDK (بحث `grep` صفر) | مطابق | — |
| التتبع | لا | `NSPrivacyTracking=false` | مطابق | — |
| الإشعارات | محلية فقط | لا `aps-environment`؛ `UNUserNotificationCenter` | مطابق | — |
| تصدير الحساب | — | RPC `export_my_account` (`AccountNetwork.swift:170`) | مطابق للكود | — |
| حذف الحساب | مسار ظاهر | RPC `delete_my_account` (`SupabaseAuthAdapter.swift:42`) | الدالتان مطبَّقتان على الإنتاج (قراءة التعريف + تجربة المالك)؛ المصدر في `docs/native/backend/*.sql` | لا إجراء؛ كرّر الاختبار على RC النهائي |
| نطاق الموقع | — | `www.ssunnah.com` في `/api/*` والاستشهادات | PRIVACY_CHECK يقول إن النطاق معلّق (402) | يوسف: قرار النطاق |
| مضيفا الصوت (EveryAyah/MP3Quran) | غير مذكورين | تنزيل وتشغيل التلاوة (`OfflineRecitation.swift:147`) | غير مُصرَّح به صراحةً؛ لا بيانات شخصية تُرسل (غير مفحوص بالتشغيل) | يوسف: قرار الإفصاح |
| تقرير Archive Privacy | — | لم يُولَّد | غير متحقق | ن4 بإذن يوسف |

التفاصيل والأسطر في `PRIVACY_AUDIT_CLOUD.md`.
