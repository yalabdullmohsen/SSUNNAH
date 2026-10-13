# OWNER_CHECKLIST — ما يدخله المالك في App Store Connect (سُنّة 1.2.0)

> تُدخل كما هي. لا بناء ولا رفع دون إذنك (`store/TESTFLIGHT_STEPS.md`).

## 1) التصنيف العمري — النتيجة 4+ (مؤكَّد)
App Store Connect ← سُنّة ← **App Information** ← **Age Rating** ← **Edit**، والإجابات بندًا بندًا:

| البند | الإجابة |
|---|---|
| محتوى مستخدمين عام / تواصل بين المستخدمين (User-Generated Content) | **No** — المساهمات خاصة بصاحبها ومُراجَعة، ولا تعليقات ولا رسائل |
| ويب مفتوح / متصفح داخل التطبيق (Unrestricted Web Access) | **No** — لا WKWebView ولا SFSafariViewController |
| إعلانات (Advertising) | **No** — لا SDK إعلانات |
| شراء داخل التطبيق / اشتراكات (In-App Purchase) | **No** — لا StoreKit |
| باقي البنود (عنف، جنس، عُري، قمار، مخدرات، رعب، ألفاظ، محتوى طبي) | **None / No** |

النتيجة المتوقعة: **4+**. التفاصيل والأدلة: `store/APPSTORE_METADATA.md`.

## 2) بقية الخطوات اليدوية
1. **Primary Category** = Reference (الثانوية اختيارية: Lifestyle).
2. **App Privacy**: وفق §5 في `store/PRIVACY_CHECK.md` ← Publish.
3. **Privacy Policy URL** = `https://www.ssunnah.com/privacy`، **Support URL** = `https://www.ssunnah.com/support`.
4. **App Review Information**: الصق `store/REVIEW_NOTES.md` (مسار الدخول: «مساهماتي» ← «تسجيل الدخول»)، وحساب تجريبي إن أردت.
5. الاسم والوصف والكلمات المفتاحية (ar-SA وen-US) من `store/APPSTORE_METADATA.md`، و«ما الجديد» من `store/WHATS_NEW.md`.
6. اللقطات: `store/SCREENSHOTS.md`.
