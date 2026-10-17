# طلب إلى ن4: تعديلات docs/site وتعارضات Privacy Report (من ن5، 2026-10-17)

ن5 لا يعدّل `docs/site`. الأدلة من الكود المدموج في `native-app`؛ المسارات الفعلية: الإعدادات ← «مركز الخصوصية» ← «تصدير بيانات الحساب» / «حذف الحساب نهائيًا» (`AccountPrivacyCenterScreen.swift:36,55`)، «تواصل معنا» (`SettingsScreens.swift:53`)، وعنوان الدعم `AccountTexts.contactEmail` = `info@ssunnah.com` (يطابق `config.js:3`).

## أ) تعديلات docs/site المطلوبة
| # | الملف:السطر | المطلوب |
|---|---|---|
| 1 | `support.html` بعد السطر 8 (الأسئلة العربية) | أضِف سؤال «كيف أصدّر بياناتي؟»: الإعدادات ← مركز الخصوصية ← تصدير بيانات الحساب (يحتاج دخولًا واتصالًا). |
| 2 | `support.html` بعد السطر 15 (النسخة الإنجليزية) | مرآة السؤال أعلاه: Settings → Privacy Center → Export account data. |
| 3 | `support.html` 6 و13 | قائمة صفحات زر الإبلاغ «المكتبة والسيرة والعقيدة والحديث» ناقصة: الزر موجود أيضًا في الفقه وضعيف الحديث وصفحات القرآن المنشورة (`DetailTemplate:26`، `ArticleTemplate:26`، `HadithScreens:109`، `WeakHadithScreens:170`، `PublishedScreens+Native:63`). اكتب صيغة عامة بلا قائمة صفحات: «الإبلاغ متاح من داخل كل صفحة محتوى» (زر في أسفل الصفحة وأيقونة في شريط التنقل)، لتبقى صحيحة مع كل قسم جديد. |
| 4 | `support.html` 7 و8 (الدخول والحذف) | وحّد مسار الحذف: «الإعدادات ← مركز الخصوصية ← حذف الحساب نهائيًا ثم اكتب «حذف»»، وأن الدخول اختياري. |
| 5 | `privacy.html` 9 والفقرة الإنجليزية المقابلة (بيان الذكاء الاصطناعي) | تأكد أن القناة «الإعدادات ← تواصل معنا» أو `info@ssunnah.com` فقط، وأن النص لا ينسب مراجعة لأي شيخ (لم أجد ادعاء مراجعة؛ أبقِ ذلك). |
| 6 | `privacy.html` (تاريخ «آخر تحديث» 2026-10-16) | حدّثه عند أي تعديل أعلاه. |
| 7 | `docs/site` كله | حارس الروابط `native-static-links-check.sh` (#3410) لا يغطيها: غطِّها أو ضع حارسًا يفحص أن روابط الخصوصية/الدعم في ASC تفتح 200 بعد النشر. |

## ب) تعارضات ASC_APP_PRIVACY_ANSWERS مع PrivacyInfo.xcprivacy (لـPrivacy Report)
قرأت `ios-native/SunnahApp/PrivacyInfo.xcprivacy` (هدف SunnahApp) و`SunnahWatchResources` و`PrayerWidgetResources` والمُرفَق Capacitor.
1. **الاسم:** المانيفست الأصلي يعلن `Name` (مرتبط، غير تتبّع، AppFunctionality) والوثيقة تذكره (2.2) — لا تعارض. يلزم تأكيد أنه فعلًا يُجمع (حقل الاسم عند التسجيل) وإلا يُحذف من الاثنين.
2. **الهاتف:** المانيفست الأصلي بلا `PhoneNumber` والوثيقة «لا يُجمع» — لا تعارض. التعارض فقط مع مانيفست **Capacitor** (`artifacts/majalis/ios/App/App/PrivacyInfo.xcprivacy`) الذي يعلن PhoneNumber وDeviceID وSearchHistory وCrashData وPerformanceData وغرض Analytics. **المطلوب:** أن يؤكد Privacy Report من أرشيف حقيقي أي مانيفست مُضمَّن؛ إن كان الأصلي فقط فالوثيقة صحيحة.
3. **remote-notification:** ليس بندًا في المانيفست. الوثيقة وREVIEW_NOTES تقولان لا APNs (لا `aps-environment` في `SunnahApp.entitlements`) و`UIBackgroundModes` = audio, fetch. **المطلوب:** تأكيد Info.plist والـentitlements من الأرشيف المرفوع (plutil/codesign).
4. **Product Interaction (2.5):** الوثيقة بلا file:line لموضع الجمع (`content_views`). المطلوب إسناده أو سحبه.
5. **Privacy Report:** AUDIT يقول أُنجز وOWNER_CHECKLIST:64 يقول لا — يبقى غير مُثبَت حتى تقرير من أرشيف حقيقي.
6. الساعة والويدجت: لا بيانات مجمّعة في مانيفستيهما (الويدجت UserDefaults 1C8F.1 فقط).
