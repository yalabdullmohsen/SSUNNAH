# ASC_REVIEW_INFORMATION — حقول App Review Information (سُنّة)

> ✅ **الهدف المرفوع (تأكيد يوسف):** `SunnahApp` من `ios-native` (أرشيف 104؛ إذن الموقع فقط، بلا ميكروفون ولا حركة ولا إشعارات بعيدة). هدف Capacitor القديم مُعطَّل ولا يُرفع. النطاقان `www.ssunnah.com` و`majlisilm.com` موقوفان (تُركت المواقع): لا يُذكران حيّين. الشروط = EULA القياسي من Apple مع شاشة داخل التطبيق لبنودنا. روابط الخصوصية والدعم تُعتمد بعد جدول ن4.


> تُنقل القيم إلى App Store Connect ← الإصدار ← App Review Information. **لا كلمات مرور في المستودع (عام).** رقم البناء/الإصدار: انظر `docs/native/release-state.json`.
> لا يكرر هذا الملف `docs/native/store/REVIEW_NOTES.md` (الأساس، ويُلصق منه النص الإنجليزي الكامل)؛ يضيف ما ينقص أو يتغير أدناه.

## 1) الحقول

| حقل ASC | القيمة |
|---|---|
| Sign-in required | نعم (اختياري عمليًا: كل شيء عدا الحساب والمساهمات والمزامنة يعمل دونه) |
| User name | `apple.review@ssunnah.com` (`docs/native/RELEASE.md:67`) |
| Password | `<في ASC فقط>` |
| First / Last name | `<يحدده المالك>` |
| Phone | `<يحدده المالك>` |
| Email | `<بريد المالك — يحدده المالك>` (بريد الدعم الحالي في `app-privacy.md:20` غير مؤكد الصلاحية) |
| Attachment | لا حاجة |

شروط الحساب: مؤكَّد البريد (Auto Confirm) لأن `mailer_autoconfirm=false` (`REVIEW_NOTES.md`، قسم «التسجيل لدى المراجع») فلا يستطيع المراجع إنشاء حساب صالح بنفسه. حساب المراجع لا يُحذف (`RELEASE.md:67`)؛ **ينبّه المراجع في Notes ألا يجرّب «حذف الحساب» عليه** وأن ينشئ حسابًا مؤقتًا إن توفّر له بريد، وإلا فالبديل: حساب ثانٍ مخصص للحذف يجهّزه المالك قبل الإرسال (يوجد `test.delete@ssunnah.com` للمالك، للحذف مرة واحدة، `RELEASE.md:67`؛ لا يُكتب في ASC إلا إن قرر المالك). تحقق قبل كل إرسال أن الحساب يدخل فعلًا.

## 2) Notes — النص الجاهز (English، يُلصق بعد/بدل نص REVIEW_NOTES حسب قرار المالك)

```
Sunnah (com.yousef.majlisilm) is an Arabic Islamic-learning app: Qur'an mushaf, adhkar, hadith, fiqh, seerah, prayer times and Qibla. The bundle ID and store listing are unchanged from the published app. Interface language is Arabic (RTL).

RELIGIOUS CONTENT: all Qur'an, hadith, adhkar and fiqh texts are curated and bundled/published unchanged from our own sources; the app does not author or edit them, and there is no public user-generated content or social feed. Privacy policy: https://yalabdullmohsen.github.io/sunnah-legal/privacy.html - Support: https://yalabdullmohsen.github.io/sunnah-legal/support.html

SIGN-IN (optional): e-mail + password only (Supabase Auth); no Sign in with Apple or social login. Use the demo account in the fields above. Path: sections list > "My Contributions" (مساهماتي) > "تسجيل الدخول" (Sign in). Registration sends a confirmation e-mail first, so please use the demo account.

ACCOUNT DELETION (Guideline 5.1.1(v)): signed in > Account > Privacy Center (مركز الخصوصية) > "حذف الحساب نهائيًا" (Delete account permanently) > type the word «حذف» > confirm. The app calls the server function delete_my_account (RPC, authenticated users only), then signs out and clears local data. This deletes the account and its data, so please do NOT use the demo account for this step; create a disposable account, or contact us and we will provide one.

DATA EXPORT: signed in > Account > Privacy Center > "تصدير بيانات الحساب" (Export account data) produces a JSON file (RPC export_my_account) that can be saved or shared. Device-only preferences can be downloaded from Settings.

NOTIFICATIONS: prayer-time and adhkar reminders are scheduled locally on the device (the primary mechanism); the app is also configured for remote push (APNs) for announcements. No marketing or advertising notifications. Permission is requested in context and can be changed in Settings > Notifications. Time Sensitive is used for prayer-time reminders.

PERMISSIONS (purpose strings are in Info.plist):
- Location When In Use: compute prayer times and Qibla; approximate location is kept on the device and not sent to our servers.
- Microphone: Recitation (tasmee') mode inside the mushaf; speech is processed on the device only, not sent or stored.
- Motion/orientation: orient the Qibla compass.
- Notifications: reminders described above.
No tracking, no ads, no third-party analytics SDK. App Tracking Transparency is not used. Background modes: audio (recitation playback), fetch/background refresh (prayer reminder refresh).

Most content works offline. Online-only: sign-in, bookmark/progress sync, user submissions, account export/delete, newly published content; offline these show an explanatory state.
```

## 3) الترجمة العربية (للمالك)

- التطبيق: «سُنّة» تطبيق تعلّم إسلامي عربي (مصحف، أذكار، حديث، فقه، سيرة، مواقيت، قبلة)، الواجهة عربية RTL، والمعرّف والإدراج دون تغيير.
- المحتوى الديني: منسَّق ومنشور كما هو من مصادرنا، لا نؤلفه ولا نعدّله، ولا محتوى مستخدمين علنيًا ولا تغذية اجتماعية. رابطا الخصوصية والدعم على github.io (قرار المالك).
- الدخول اختياري: بريد وكلمة مرور فقط (Supabase)، بلا Sign in with Apple. استخدم الحساب التجريبي.
- حذف الحساب: الحساب ← مركز الخصوصية ← «حذف الحساب نهائيًا» ← اكتب «حذف» ← تأكيد؛ يستدعي RPC `delete_my_account` ثم يخرج ويمسح المحلي. لا يُجرَّب على الحساب التجريبي.
- التصدير: مركز الخصوصية ← «تصدير بيانات الحساب» ← ملف JSON للحفظ/المشاركة.
- الإشعارات: محلية (الأساس) + تهيئة للدفع البعيد؛ لا إشعارات تسويقية.
- الأذونات: الموقع (المواقيت والقبلة، محلي)، الميكروفون (التسميع على الجهاز)، الحركة (بوصلة القبلة)، الإشعارات.
- لا تتبّع ولا إعلانات ولا تحليلات طرف ثالث.

## 4) ما يضيفه هذا الملف أو يغيّره عن `REVIEW_NOTES.md`

1. **حُسم التعارض:** الهدف المرفوع `SunnahApp` من `ios-native` (أرشيف 104)؛ `ios-native/SunnahApp/Info.plist:19` الموقع فقط، و:22 `UIBackgroundModes` = `audio, fetch`، ولا ميكروفون ولا حركة ولا `remote-notification` ولا `aps-environment` في `SunnahApp.entitlements`. يطابق `REVIEW_NOTES.md`. هدف Capacitor (`artifacts/majalis/ios/App/App/Info.plist` وفيه الميكروفون والحركة) مُعطَّل ولا يُرفع.
2. دليلا `delete_my_account`: (أ) **الكود**: العميل `SupabaseAccountDeleter` يطلب `POST rest/v1/rpc/delete_my_account` بجلسة المستخدم بلا معرّف (`artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Platform/AccountDeletion.swift:12,30`)، والتدفق: حذف ثم `signOut` ثم مسح محلي ولا مسح عند الفشل (:67-75، العبارة «حذف» :62)، والواجهة `AccountDeletionView` (`.../Special/AccountScreens.swift:81`، تسجيل المسار :123)، ومدخلها من مركز الخصوصية (`.../Sections/account/AccountPrivacyCenterScreen.swift:49-50`)، وتعريف الدالة في `docs/native/backend/delete-account.sql` (revoke من anon، grant لـauthenticated) ونسخة `docs/native/backend/migrations/delete_my_account.sql:28-29`. (ب) **تحقّق Claude (منسّق المشروع) من تعريف الدالة على الإنتاج بقراءتها بعد أن طبّقها المالك، وجرّب المالك الحذف والتصدير على جهازه ونجحا**: الدالة مطبَّقة على الإنتاج بالنص الجديد (تحقق عبر `pg_get_functiondef` في 2026-10-16) واختبار الحذف والتصدير ناجح من جهاز المالك (`PRIVACY_AUDIT_CLOUD.md:15,118`). (استعلام قراءة فقط، بلا SQL كتابة).
3. التصدير: الزر وملف `ssunnah-data-export.json` و`ShareLink` في `AccountPrivacyCenterScreen.swift:29-45,70-82`؛ RPC `export_my_account` في `.../account/AccountNetwork.swift:167-170`. المسار ليس في الإعدادات بل في مركز الخصوصية (الإعدادات تتيح تنزيل تفضيلات الجهاز فقط، `AccountPrivacyCenterScreen.swift:45`).
4. تنبيه المراجع ألا يحذف الحساب التجريبي (جديد؛ `REVIEW_NOTES.md` يقترح حسابًا مؤقتًا فقط).
5. لا دفع بعيد في الهدف المرفوع؛ يوجد Time Sensitive في `SunnahApp.entitlements` (إشعارات محلية).

## 5) مجهول / غير متحقَّق منه

- «معالجة التسميع على الجهاز فقط»: نص الإذن في Info.plist (:58) وسجل `c72c5f689` يقولان ذلك؛ **لم أراجع** شبكة `TasmeeEngine` (`artifacts/majalis/ios/App/App/Tasmee/`) بنفسي. يلزم التحقق قبل الإرسال (`PRIVACY_CHECK.md`).
- هل الدفع البعيد مفعّل فعلًا من JS (`@capacitor/push-notifications`) في البناء الأصلي أم تهيئة فقط: غير مثبت (`AppDelegate.swift:109-122` يوثّق التسجيل فقط).
- اسم/هاتف/بريد جهة الاتصال، وصلاحية الحساب التجريبي لحظة الإرسال: إجراء المالك.
- رقم البناء: `docs/native/release-state.json` فقط.
