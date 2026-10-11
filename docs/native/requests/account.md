# طلبات قسم «الحساب والإعدادات» (account) لـن2/ن4

القسم في `Sources/SunnahNative/Sections/account/` (19 شاشة). كل ما يلي يحتاج ملفًا مشتركًا فلم يُعدَّل.

## 1) ربط القسم بالتطبيق
- استدعاء `AccountSection.register(in:)` من نقطة التسجيل (`GeneratedScreens.registerAll` أو `SpecialScreens.registerAll`).
- استدعاء `AccountSection.resolve(_:)` من `GeneratedScreens.resolve(path:)` لمسار `/updates/auto/:slug`.
- المعرّفات = المسار بلا `/`: about, calendar, car-mode, contact, data-licenses, fatwa-policy, feature-tour, islam-stats, mosque-mode, my-submissions, notification-settings, offline, privacy, privacy-center, qibla, stats, submit, updates.
- لم يُنسخ ناتج المولّد (`--owner ن3`): كل قوالبه تقرأ ملفات محزومة غير موجودة (`about.json`, `calendar.json`…)، والشاشات هنا خاصة تقرأ النصوص المنقولة حرفيًا أو الشبكة.

## 2) نقل الشبكة (DataStore)
الشاشات تقرأ عبر `ContentSource.remote(path:)` بالاصطلاح التالي، ويلزم أن يوجّه DataStore المسار حسب بادئته:
| البادئة | الوجهة | مستخدمها |
|---|---|---|
| `/data/…` و`/api/…` | الموقع `https://www.ssunnah.com` | الدروس (التقويم/السيارة)، المستجدات، مقترحاتي |
| `/rest/v1/…` | Supabase REST (مع `apikey`) | platform_updates، bookmarks، user_achievements، lesson_registrations، reading_resume |
- `requireAuth: true` يحتاج ترويسة `Authorization: Bearer <access_token>` من مفتاح `access_token` الذي يكتبه `SupabaseAuthAdapter`.

## 3) طلبات الكتابة
- `AccountAPI` يرسل POST مباشرة بـURLSession إلى `/api/submissions` و`/api/account/export` (DataStore للقراءة فقط). يُفضَّل منفذ مشترك للطلبات الموثَّقة (يقرأ `VERCEL_API_BASE_URL` كما يفعل المحوّل) بدل العنوان الثابت.

## 4) الجلسة
- `AccountSession.read` يقرأ `access_token` و`user_email` (المحوّل الأصلي) ويستخرج المعرّف من مطالبة `sub`، ثم يرجع لجلسة الويب القديمة `sb-ngmvmlulzacrlicuagyp-auth-token`. الأفضل أن يعرض `AuthServicing` المعرّف (`currentUserId`) بدل فك الرمز.

## 5) معاملات الاستعلام في التوجيه
- `/contact?topic=…` يحتاج تمرير الاستعلام للشاشة المسجّلة (`AccountContactScreen(topicParam:)`)؛ `registerView` لا يمرّر معاملات حاليًا.

## 6) قالب مشترك للوثائق القانونية
- الخصوصية وسياسة الفتوى وعن التطبيق والتراخيص بنيتها واحدة (أقسام → فقرات/قوائم). كُتبت هنا `AccountLegalDocumentView`؛ لو صار قالبًا مشتركًا (`LegalDocumentTemplate`) تستفيد منه `/terms` وغيرها.

## 7) قرار المالك (2026-10-11)
- المرجع الوحيد `ROUTE_TEMPLATE_MAP.json` و`FEATURE_PARITY.md`: ما خارج المسارات الـ212 المبقاة لا يُبنى ولا يُنقل، ولو كان تبويبًا في الويب.
- «الإسلام في أرقام»: يُعرض تبويبا «الإسلام في العالم» و«الحضارة الإسلامية» فقط. «الدلالات الكونية» ليس مسارًا مبقى فلم يُبنَ. «القرآن الكريم» لا يُنقل هنا ويُربط بمساره المبقى `/quran-hub/numbers` (قسم القرآن، ن3؛ نص المصحف محمي).
- ما لم يُنقل: صندوق سجل الإشعارات، كتابة الشارات وحذف «تابع من حيث توقفت»، إحصاءات التسبيح والسلسلة (0 حتى تُربط بمخزن المسبحة الأصلي)، لوحة أداء الاختبارات، سطر حالة الشبكة في مركز عدم الاتصال.
- وضع السيارة: `live_url` قد لا يكون بثًا صوتيًا مباشرًا يقبله AVPlayer.
