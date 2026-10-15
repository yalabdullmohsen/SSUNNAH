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
| الصحة/المالية/جهات الاتصال/الصور/الصوت | لا | لا مفاتيح كاميرا/ميكروفون/جهات اتصال في `Info.plist` |
| واجهات «السبب المطلوب» | UserDefaults (CA92.1, 1C8F.1)، File timestamp (C617.1) | `PrivacyInfo.xcprivacy` |
| الخلفية | audio + fetch؛ BGTask: `com.yousef.majlisilm.prayer-refresh` | `Info.plist` |
| التشفير (Export Compliance) | `ITSAppUsesNonExemptEncryption=false`: صحيح لأن التشفير الوحيد HTTPS القياسي | `Info.plist` سطر 17؛ لا CryptoKit/CommonCrypto/SecKey/CCCrypt في `ios-native` ولا `SunnahNative/Sources` |

الحذف داخل التطبيق: مركز الخصوصية ← «حذف الحساب نهائيًا» (`AccountDeletionView`) يستدعي RPC `delete_my_account` في Supabase بلا الموقع، ثم signOut ومسح محلي. **شرط:** الدالة في القاعدة يجهّزها المالك قبل الإرسال. بريد الدعم متغيّر واحد `SUPPORT_EMAIL` في `config.js` بمستودع `sunnah-legal` (القيمة الحالية info@ssunnah.com وصلاحيتها غير مؤكدة؛ المالك يحدّدها). الصفحتان في `yalabdullmohsen/sunnah-legal` (المصدر الوحيد؛ أُزيل `docs/site`).

**شرط:** أي SDK أو إرسال بيانات جديد يعيد هذا الجدول قبل الرفع.
