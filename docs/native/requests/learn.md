# طلبات قسم «الدروس والتعلم» (learn) — لـن2/ن1/ن4

القسم في `Sources/SunnahNative/Sections/learn/` (16 من 23 مسارًا أصلية). نقطة الربط الوحيدة: `LearnSection`.

## 1) ربط في جذر التطبيق (ملف مشترك — لا أعدّله)
- `LearnSection.register(in: .shared)` بجانب `SpecialScreens.registerAll`، و`LearnSection.resolve(path:)` بجانب `GeneratedScreens.resolve(path:)`.
- المعرّفات بصيغة المولّد: `lessons`، `lessons.archive`، `universities.compare`… (`LearnSection.screenIds`).

## 2) المولّد والخريطة (ن2)
مخرجات `generate-native-screens.mjs --owner ن3` للقسم **لم تُنسخ** لأنها لا تُبنى ولا تطابق البيانات:
- `/competitions/:id`: `CollectionHost` يعطي `[ContentItem]` و`QuizTemplate` يطلب `[QuizQuestion]` ⇒ خطأ نوع.
- كل المصادر `.bundled(name: "<المسار>")` بلا ملفات مقابلة في التصدير (`lessons`، `universities`…).
- تصنيف القالب في `ROUTE_TEMPLATE_MAP.json`: `/competitions` و`/competitions/:id` إعلانات مسابقات خارجية لا أسئلة (قائمة/تفاصيل)، و`/knowledge/:section` قائمة عناصر لا تفاصيل.
- اقتراح: حقل `source` لكل مسار في الخريطة (المولّد يدعمه) قبل أي توليد لاحق، وإلا يتعارض `LearnScreens` المولّد مع هذا المجلد.

## 3) نقص في القوالب (ن2)
- `QuizTemplate`: أسئلة `quiz/*.json` مفتوحة بلا خيارات، فيظهر خيار واحد هو الجواب. كتبت `LearnOpenQuizRunner` (إظهار الجواب ثم عرفتها/لم أعرفها كما في الويب). يُستحسن وضع «سؤال مفتوح» في القالب نفسه.

## 4) التصدير (ن1 — `scripts/native/export-ios-data.mjs`)
الشاشات تقرأ هذه الملفات من `Bundle.main` ولا تعرض شيئًا حتى تُصدَّر:
| الملف | المصدر | ملاحظة |
|---|---|---|
| `Data/learn/universities.json` | `src/data/universities-catalog.json` | 37، كلها `is_verified` |
| `Data/learn/institutions.json` | `src/data/institutions-catalog.json` | 44، كلها `contentStatus: needs_review` ⇒ قرار المالك قبل التصدير |
| `Data/learn/kuwait-sheikhs.json` | `src/lib/kuwait-sheikhs.ts` (`KUWAIT_SHEIKHS`) | TS ⇒ يحتاج تحويلًا إلى JSON |
| `Data/learn/competitions.json` | `src/lib/competitions/store.ts` | المنشور في الإنتاج 0 ⇒ `[]` (العيّنة demo لا تُصدَّر) |
| `Data/learn/durus-imaniyya.json`، `durus-mutanawwia.json` | `src/lib/durus-*-data.ts` | **محتوى شرعي**: ملخصات فيها نسبة أحاديث ودرجات ⇒ مهارة `sharia-content` قبل التصدير |
| `Data/graph/links.json` | `public/data/graph/links.json` | مذكور «اختياري» في DATA_CONTRACT |
| `Data/quiz/*` | موجود | يُستعمل كما هو |

## 5) الشبكة (ن1/ن4)
- `.remote(path:)` بمسار الموقع: `/data/lessons/chunk-000.json` و`/data/knowledge/<ملف>`. يلزم DataStore في `contentLoader` (اليوم `ContentLoader(bundle:)` بلا store ⇒ خطأ `noStore` وحالة «إعادة المحاولة»).
- `/knowledge/:section` يُبقي `review_status = verified` فقط.

## 6) مسارات تنتظر منفذًا غير موجود (`LearnSection.pendingRoutes`)
| المسار | ما يلزم |
|---|---|
| `/annual-courses/:id` | Supabase `annual_courses` (approved). البذرة `annual-courses-seed.ts` بيانات تجريبية لا تُعرض. |
| `/fawaid` | Supabase `fawaid` (approved) + إرسال فائدة بحساب. محتوى شرعي. |
| `/flashcards` | Supabase `verified_hadith_items` + `flashcard_reviews` بحساب (SM-2). |
| `/my-learning` | `user_learning_library`/`learning_paths`/`user_progress` بحساب. |
| `/progress` | مخزن تقدّم محلي مشترك بين الأقسام (آخر صفحة مصحف، المحفوظات، النشاط). |
| `/reading-plans` | `book_reading_plans` بحساب + فهرس المكتبة. |
| `/researcher` | `researcher_profiles` بحساب. |
المطلوب منفذ عميل Supabase (قراءة عامة + جلسة الحساب من `AuthSessionStoring`) في `PlatformServices`.
