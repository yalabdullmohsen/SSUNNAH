# طلبات قسم «العقيدة والتزكية» (aqidah) — لـن2 (وما يخص التصدير لـن1)

الكود: `Sources/SunnahNative/Sections/aqidah/` (27 مسارًا). لم يُعدَّل أي ملف مشترك.

## 1) ربط مطلوب في ملف مشترك (ن2/ن3)
- في جذر التطبيق بعد `GeneratedScreens.registerAll(in:)`: استدعاء `AqidahSection.register(in:)`. يسجّل المعرّفات الـ21 نفسها فيحلّ محلّ شاشات `AqidahScreens` المولَّدة (السجل قاموس، والأخير يفوز).
- في محلّل المسارات: `AqidahSection.resolve(path:)` **قبل** `GeneratedScreens.resolve(path:)` لمسارات المعاملات الستة (`/discover-islam/{articles,doubts,questions}/:slug`، `/discover-islam/new-muslim/:day`، `/islamic-sects/:id`، `/tawhid/:slug`).
- منفذ `DawahContactSubmitting` (إدخال صف في `dawah_contact_requests` بأعمدة `DawahContactRequest`) يُحقن بـ`.environment(\.dawahContact, …)`. بدونه يظهر النموذج والإرسال معطّل مع تنبيه.
- بعد الربط يمكن حذف `AqidahScreens` من المولّد أو إبقاؤه؛ لا تعارض أسماء.

## 2) نقص في القوالب
1. **قائمة مجموعات/تبويبات**: 11 صفحة (الأخلاق، الرقائق، الملائكة، الجنة والنار، علامات الساعة، الأمراض القلبية، حكم السلف، آداب طالب العلم، موضوعات الإيمان، موضوعات التزكية، الأسرة والمجتمع) + «كيف أصبح مسلمًا» بنيتها مجموعات بعناوين وعناصر تتمدد. `ListTemplate` مسطّح بلا مجموعات ولا بحث، فكُتب `AqidahGroupedScreen` محليًا. أقترح ترقيته قالبًا مشتركًا (يفيد الفقه والسيرة أيضًا).
2. **`ContentItem` بلا init عام** (فيه `init(from:)` فقط)، فلا تستطيع الأقسام بناءه من نماذجها. لذلك تعرض شاشاتي نماذجها بمكوّنات التصميم مباشرة.
3. **عنوان الشاشة المولَّدة** واحد لكل القسم («العقيدة والتزكية»). الأفضل أن يحمل المولّد عنوان الصفحة من الخريطة.
4. **خطوط النصوص الشرعية**: `Sunnah.Typography` بلا مستوى للآية (Amiri Quran) ولا للحديث (Amiri). الشواهد تُعرض الآن بخط `body`. مطلوب `Sunnah.Typography.quran` و`.hadith`.
5. **بحث عربي مشترك**: كتبت `AqidahContent.normalize/matches` محليًا (التشكيل والهمزات والتاء المربوطة والألف المقصورة). الأولى أن يكون مشتركًا مع البحث العام.
6. **مسارات :id المولَّدة** تبحث في `[ContentItem]` بـ`id` فقط. أسئلة التعريف بالإسلام والشبهات والمقالات تُفتح بـ`slug`، ومسار المسلم الجديد بـ`day_number`.

## 3) ملفات التصدير المطلوبة (ن1: `export-ios-data.mjs`) → `Data/aqidah/`
كل المحتوى اليوم مكتوب داخل ملفات TS للويب أو في Supabase، وليس في `public/data`. لن يظهر شيء أصليًا حتى يصدّره السكربت ويصدّق عليه بقواعد §5 في DATA_CONTRACT (مع `content-hold.json`). الحقول كما في المصدر بلا إعادة صياغة:

| الملف | المسار | المصدر | الشكل |
|---|---|---|---|
| `adab-talab-ilm.json` | /adab-talab-ilm | `views/AdabTalabIlmPage.tsx` (FADL_ITEMS…KUTUB) | `[{id,title,items:[{id,title,summary?,body?,reference?}]}]` تبويب = مجموعة |
| `akhlaq.json` | /akhlaq | `views/AkhlaqPage.tsx` (AKHLAQ حسب الفئة) | نفسه |
| `alamat-saah.json` | /alamat-saah | `views/AlamatSaahPage.tsx` (SUGHRA/KUBRA/TAHDHUKAT) | نفسه |
| `amrad-qalbiyya.json` | /amrad-qalbiyya | `views/AmradQalbiyyaPage.tsx` (DISEASES) | نفسه |
| `hikam-salaf.json` | /hikam-salaf | `views/HikamSalafPage.tsx` (HIKAM حسب الفئة) | نفسه |
| `janna-naar.json` | /janna-naar | `views/JannaNaarPage.tsx` | نفسه |
| `malaika.json` | /malaika | `views/MalaikaPage.tsx` | نفسه |
| `raqaiq.json` | /raqaiq | `views/RaqaiqPage.tsx` | نفسه |
| `iman-topics.json` | /iman-topics | `lib/iman-topics-data` (IMAN_TOPICS: DarsSection) | `DarsSection[]` كما هو (`lessons` مقبول) |
| `tazkiya-topics.json` | /tazkiya-topics | `lib/tazkiya-topics-data` (TAZKIYA_TOPICS) | `DarsSection[]` |
| `usra-mujtama.json` | /usra-mujtama | `lib/usra-mujtama-data.ts` (USRA_MUJTAMA) | `DarsSection[]` |
| `discover-islam-how-to-convert.json` | /discover-islam/how-to-convert | `views/HowToBecomeMuslimPage.tsx` (كتل ثابتة) | مجموعات |
| `asma-husna.json` | /asma-husna | `lib/asma-husna-data.ts` (ASMAA) | `AsmaEntry[]` كما هو؛ يُستبعد `unsourced` |
| `tawhid.json` | /tawhid، /tawhid/:slug | `lib/tawhid-topics.ts` (TAWHID_TOPICS) | `TawhidTopic[]` |
| `islamic-sects.json` | /islamic-sects، /:id | `data/islamic-sects.ts` + ميتا النشر | `IslamicSect & {publicationStatus}`؛ يُعرض `PUBLISHED` فقط. البنود الموسومة «تحتاج إحالة» تبقى خارج التصدير |
| `discover-islam-questions.json` | /discover-islam/questions، /:slug | `dawah_questions` (منشور ومعتمد) أو `dawah-static-fallback.ts` | صفوف الجدول snake_case |
| `discover-islam-doubts.json` | /discover-islam/doubts، /:slug | `dawah_shubuhat` | نفسه |
| `discover-islam-articles.json` | /discover-islam، /articles/:slug | `dawah_articles` | نفسه |
| `discover-islam-new-muslim.json` | /discover-islam/new-muslim، /:day | `new_muslim_path` | `{id,day_number,audience,title,content_ar}` |
| `tazkiya.json` | /tazkiya | `pages/tazkiya/TazkiyaHubPage.tsx` (البطاقات) | `SectionLink[]` = `{id,title,subtitle,route}` (روابط تنقل فقط) |

`/discover-islam/contact` بلا ملف (نموذج).

## 4) قرارات
- التقدّم في مسار المسلم الجديد محفوظ على الجهاز فقط (`aqidah.newMuslim.completed`). مزامنته مع `new_muslim_progress` للمستخدم المسجَّل تحتاج منفذ مصادقة، وهي مؤجلة.
- القبول في Swift دفاع ثانٍ فقط، والمرجع هو سكربت التصدير.
