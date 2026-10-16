# APPSTORE_METADATA — سُنّة 1.2.0 (App Store Connect)

> كل بند مطابق لما في التطبيق الأصلي الحالي (`FEATURE_PARITY.md`). حاسبة الفرائض موجودة ومذكورة؛ لا وعد بالتسميع ولا الأذان. حدود ASC: الاسم ≤30، العنوان الفرعي ≤30، الكلمات المفتاحية ≤100 (بفواصل بلا مسافات)، الوصف ≤4000. بنود «قرار المالك» تُراجَع قبل اللصق.

| الحقل | القيمة |
|---|---|
| Bundle ID | `com.yousef.majlisilm` (بلا تغيير، تحديث للتطبيق المنشور) |
| الإصدار / البناء | 1.2.0 / 100 |
| الأجهزة | iPhone وiPad (iOS 16.2+) |
| الفئة الأساسية | Reference — **قرار المالك (مؤكَّد)** |
| الفئة الثانوية | Lifestyle (اختياري) |
| التصنيف العمري | 4+ — **مؤكَّد من المالك**؛ إجابات الاستبيان أدناه |
| رابط الدعم | [https://yalabdullmohsen.github.io/sunnah-legal/support.html](https://yalabdullmohsen.github.io/sunnah-legal/support.html) — مستودع `yalabdullmohsen/sunnah-legal`، HTTP 200 |
| رابط الخصوصية | [https://yalabdullmohsen.github.io/sunnah-legal/privacy.html](https://yalabdullmohsen.github.io/sunnah-legal/privacy.html) — HTTP 200 |
| التتبع (ATT) | لا تتبع، لا إعلانات، لا SDK تحليلات (انظر `PRIVACY_CHECK.md`) |
| تسجيل الدخول | اختياري (انظر `REVIEW_NOTES.md`) |

## العربية (ar-SA)
**الاسم:** سُنّة
**العنوان الفرعي:** مصحف وأذكار وأحاديث ومواقيت
**الكلمات المفتاحية:** قرآن,مصحف,أذكار,حديث,فقه,سيرة,صلاة,مواقيت,قبلة,إسلام,سنة,تفسير,دعاء
**النص الترويجي (≤170):** مصحف كامل وأذكار وأحاديث ومواقيت الصلاة في تطبيق عربي أصلي يعمل بلا اتصال، بلا إعلانات ولا تتبع.
**الوصف:**
```
سُنّة تطبيق عربي أصلي بالكامل لتعلّم الدين ومرافقتك اليومية، لـ iPhone وiPad.

• المصحف الكامل: 604 صفحات بالرسم العثماني.
• حاسبة الفرائض (المواريث): تعمل على جهازك بلا اتصال.
• الأذكار والأدعية، والأحاديث، والفقه، والسيرة، وغيرها من أقسام العلم الشرعي.
• مواقيت الصلاة واتجاه القبلة تُحسَب على جهازك بحسب موقعك، مع تذكيرات الصلاة.
• يعمل بلا اتصال: المحتوى الأساسي مضمَّن في التطبيق. الميزات المرتبطة بالحساب أو بمحتوى جديد تحتاج اتصالًا.
• تصميم عربي من اليمين لليسار، ويدعم الوضع الداكن.
• تسجيل الدخول اختياري، وتُحفظ جلستك بأمان في سلسلة مفاتيح الجهاز (Keychain).
• لا إعلانات ولا تتبع.

المحتوى الشرعي منقول كما هو من موقع سُنّة المنشور دون تعديل.
```

## English (en-US)
**Name:** Sunnah
**Subtitle:** Quran, Adhkar, Hadith, Prayer
**Keywords:** quran,mushaf,adhkar,hadith,fiqh,seerah,prayer times,qibla,islam,sunnah,dua,muslim
**Promotional text (≤170):** Complete Mushaf, adhkar, hadith and prayer times in a native Arabic app that works offline. No ads, no tracking.
**Description:**
```
Sunnah is a fully native Arabic app for learning and daily companionship, for iPhone and iPad.

• Complete Mushaf: all 604 pages in Uthmani script.
• Inheritance (Fara'id) calculator: runs on your device, offline.
• Adhkar and supplications, hadith, fiqh, seerah and more sections of Islamic knowledge.
• Prayer times and Qibla direction calculated on your device from your location, with prayer reminders.
• Works offline: core content is bundled in the app. Account features and newly published content need a connection.
• Right-to-left Arabic design with Dark Mode support.
• Sign-in is optional; your session is stored securely in the device Keychain.
• No ads, no tracking.

Religious content is carried over unchanged from the published Sunnah website.
```

## ملاحظات اتساق
- الاسم العربي يطابق `CFBundleDisplayName` («سُنّة»)؛ الاسم الإنجليزي «Sunnah» اسم الإدراج في en-US فقط.
- `Info.plist` لا يحمل `LSApplicationCategoryType`؛ الفئة تُضبط في ASC فقط.
- «حاسبة الفرائض» أُضيفت بعد دمج #3110 (الشاشة `/mawarith/calculator` موجودة في `MawarithCalculatorScreen.swift`، عنوانها «حاسبة المواريث الإسلامية»).
- لا يُعدَّل أي نص علمي؛ هذه نصوص تسويقية للمتجر.

## إجابات استبيان التصنيف العمري (من كود SunnahNative، لا من الافتراض)
| السؤال | الجواب | الدليل |
|---|---|---|
| محتوى مستخدمين عام / تواصل بين المستخدمين | **لا** | الوحيد: «مساهماتي» ترسل إلى Supabase REST `rest/v1/user_submissions` (`AccountNetwork.swift:156`) وتعرض حالة مساهمات المستخدم نفسه فقط (`AccountSubmissionsScreens.swift`)؛ تخضع لمراجعة، ولا تُنشر لمستخدمين آخرين، ولا تعليقات ولا رسائل |
| ويب مفتوح / متصفح داخل التطبيق | **لا** | لا `WKWebView` ولا `SFSafariViewController`؛ الروابط الخارجية تُفتح بـ`openURL` في Safari خارج التطبيق |
| إعلانات | **لا** | لا SDK إعلانات (لا GoogleMobileAds ولا AdSupport) |
| شراء داخل التطبيق / اشتراكات | **لا** | لا `StoreKit` ولا منتجات |
| تتبع | **لا** | انظر `PRIVACY_CHECK.md` |
| محتوى بالغ/عنف/قمار/مخدرات/رعب | **لا** (None) | المحتوى شرعي تعليمي فقط |
**النتيجة:** كل الأسئلة «None/No» ⇒ 4+. **التصنيف 4+ مؤكَّد من المالك.** تُدخل الإجابات أعلاه في ASC كما هي (سؤال «User-generated content» = No لأن المساهمات خاصة بصاحبها ومُراجَعة). خطوات الإدخال: `OWNER_CHECKLIST.md`.

## إفصاح مضيفي الصوت (EveryAyah / MP3Quran) في ملصق الخصوصية — قرار المالك 2026-10-16 (مشروط)
القرار يتبع نتيجة `AUDIO_HEADERS_CHECK.md` (فحص ن4 على RC3). **النتيجة لم تُملأ بعد ⇒ لا حالة مختارة الآن.** الحالتان جاهزتان:

### الحالة أ — الطلبات لا تحمل إلا IP والـUser-Agent القياسي
- **ملصق ASC:** لا إفصاح إضافي (يبقى كما في `PRIVACY_CHECK.md` §5؛ لا نوع بيانات جديد).
- **سياسة الخصوصية** (`sunnah-legal/privacy.html`، بيد المالك): تُدرج فقرة مضيفي الصوت الواردة في `PRIVACY_CHECK.md` (قسم «فقرة مضيفي الصوت») كما هي: البث من خادم خارجي عند طلب التشغيل أو التنزيل فقط.
- **ملاحظات المراجع:** لا تغيير.

### الحالة ب — الطلبات تحمل معرّفات تتجاوز ذلك (ترويسة مخصصة، معرّف جهاز/حساب، رمز جلسة…)
- **ملصق ASC:** يُفصَح عن النوع الموافق لما وُجد فعلًا، مثلًا: Identifiers ▸ Device ID أو User ID، الغرض App Functionality، Linked to user بحسب ما إذا كان المعرّف مرتبطًا بالحساب، Tracking = No ما لم يُستخدم عبر تطبيقات أخرى. يُحدَّد النوع من الترويسة المرصودة لا من التخمين.
- **سياسة الخصوصية:** تُعدَّل الفقرة المذكورة لتسمّي المعرّف المرسل صراحةً (فقرتها الحالية تنفي إرسال أي معرّف، فلا تُنشر كما هي في هذه الحالة).
- **التزامن:** `PRIVACY_CHECK.md` §1 وملف `PrivacyInfo.xcprivacy` (قرار ن4) يُحدَّثان معًا بنفس النوع، وكذلك `app-privacy.md`.
- **إجراء:** إن كان المعرّف قابلًا للإزالة من الطلب فالأفضل إزالته (تعديل ن4) والعودة للحالة أ.

الدليل المطلوب لأيٍّ من الحالتين: جدول الترويسات المملوء في `AUDIO_HEADERS_CHECK.md` (لقطة Proxy لكل مضيف).
