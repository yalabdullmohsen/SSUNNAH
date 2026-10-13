# APPSTORE_METADATA — سُنّة 1.2.0 (App Store Connect)

> كل بند مطابق لما في التطبيق الأصلي الحالي (`FEATURE_PARITY.md`). لا وعد بحاسبة المواريث ولا التسميع ولا الأذان. حدود ASC: الاسم ≤30، العنوان الفرعي ≤30، الكلمات المفتاحية ≤100 (بفواصل بلا مسافات)، الوصف ≤4000. بنود «قرار المالك» تُراجَع قبل اللصق.

| الحقل | القيمة |
|---|---|
| Bundle ID | `com.yousef.majlisilm` (بلا تغيير، تحديث للتطبيق المنشور) |
| الإصدار / البناء | 1.2.0 / 100 |
| الأجهزة | iPhone وiPad (iOS 16.2+) |
| الفئة الأساسية | Reference — **قرار المالك (مؤكَّد)** |
| الفئة الثانوية | Lifestyle (اختياري) |
| التصنيف العمري | 4+ — قرار المالك مشروط بتأكيد الاستبيان أدناه |
| رابط الدعم | https://www.ssunnah.com/support (تحقق: 200) |
| رابط الخصوصية | https://www.ssunnah.com/privacy (تحقق: 200) |
| التتبع (ATT) | لا تتبع، لا إعلانات، لا SDK تحليلات (انظر `PRIVACY_CHECK.md`) |
| تسجيل الدخول | اختياري (انظر `REVIEW_NOTES.md`) |

## العربية (ar-SA)
**الاسم:** سُنّة
**العنوان الفرعي:** مصحف وأذكار وأحاديث ومواقيت
**الكلمات المفتاحية:** قرآن,مصحف,أذكار,حديث,فقه,سيرة,صلاة,مواقيت,قبلة,إسلام,سنة,تفسير,دعاء
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
| محتوى مستخدمين عام / تواصل بين المستخدمين | **لا** | الوحيد: «مساهماتي» ترسل `POST /api/submissions` وتعرض حالة مساهمات المستخدم نفسه فقط (`AccountSubmissionsScreens.swift`)؛ تخضع لمراجعة، ولا تُنشر لمستخدمين آخرين، ولا تعليقات ولا رسائل |
| ويب مفتوح / متصفح داخل التطبيق | **لا** | لا `WKWebView` ولا `SFSafariViewController`؛ الروابط الخارجية تُفتح بـ`openURL` في Safari خارج التطبيق |
| إعلانات | **لا** | لا SDK إعلانات (لا GoogleMobileAds ولا AdSupport) |
| شراء داخل التطبيق / اشتراكات | **لا** | لا `StoreKit` ولا منتجات |
| تتبع | **لا** | انظر `PRIVACY_CHECK.md` |
| محتوى بالغ/عنف/قمار/مخدرات/رعب | **لا** (None) | المحتوى شرعي تعليمي فقط |
**النتيجة:** كل الأسئلة «None/No» ⇒ 4+. يبقى القرار مشروطًا بتأكيد المالك للاستبيان في ASC (سؤال «User-generated content» يُجاب بـ No لأن المساهمات خاصة بصاحبها ومُراجَعة).
