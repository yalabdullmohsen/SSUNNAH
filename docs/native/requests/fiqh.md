# طلبات قسم «الفقه والعبادات» (fiqh) — إلى ن2

الكود: `Sources/SunnahNative/Sections/fiqh/` (نماذج + قواعد النشر + محوّلات + شاشة قراءة موحّدة) و`Tests/SunnahNativeTests/FiqhSectionTests.swift`.
المولّد (`generate-native-screens.mjs --out`) أعطى `FiqhScreens.swift` مطابقًا بايتيًا لما في `Generated/`؛ لم يُنسخ شيء إلى مجلد القسم لأن نسخه يكرّر الأنواع.

## 1) تصدير البيانات (`scripts/native/export-ios-data.mjs`)
القسم يقرأ من `Data/fiqh/` (المواضع في `FiqhSources`). لا شيء منها يُصدَّر الآن، فتظهر الشاشات «تعذّر تحميل المحتوى» حتى يُضاف:

| الملف المحزوم | المصدر | الشكل |
|---|---|---|
| `Data/fiqh/books.json` | `content/fiqh/books.json` | كما هو `{books:[…]}` بعد حذف المحجوز (الآن: الدرس `hajj-arkan-arafa`) |
| `Data/fiqh/book-aliases.json` | `content/fiqh/book-aliases.json` | كما هو |
| `Data/fiqh/guides/<slug>.json` | `src/lib/fiqh-guides/<slug>.ts` (jumuah, nikah, riba, ruqya, sadaqa, talaq, udhiya, waqf) | الكائن `FiqhGuideSection` |
| `Data/fiqh/madhahib.json` | `src/data/madhahib.ts` → `MADHAHIB` | مصفوفة |
| `Data/fiqh/maqasid-sharia.json` | `src/lib/maqasid-sharia-data.ts` → `MAQASID_SHARIA` | مصفوفة `DarsSection` |
| `Data/fiqh/prayer-ranks.json` | `src/lib/prayer-ranks-data.ts` → `RANKS` | مصفوفة |
| `Data/fiqh/usul-topics.json` | `src/lib/fiqh/fiqh-usul-topics.ts` → `USUL_HUB_TOPICS` | مصفوفة |
| `Data/fiqh/sins-and-rights.json` | `src/lib/sins-rights-data.ts` | `{topics: SINS_TOPICS, categories: SINS_CATEGORIES}` |
| `Data/fiqh/prophetic-medicine.json` | `src/lib/prophetic-medicine-seed.ts` → `PROPHETIC_MEDICINE_ITEMS` | مصفوفة |
| `Data/fiqh/amr-bil-maruf.json` | `src/lib/amr-bil-maruf-seed.ts` | `{levels, conditions, munkaraat: MAJOR_MUNKARAAT, maaruf: MAJOR_MAARUF}` |

ملاحظة بيانات: الدرس المحجوز `hajj-arkan-arafa` في `books.json` يحمل المفتاح `needsReview` مرتين (`true` ثم `false`)؛ JSON.parse يأخذ الأخير ومفكّك Swift قد لا يفعل. حذفه في التصدير (لأنه محجوز) يُنهي الالتباس.

تحقّقتُ أن هذه الوحدات تُقيَّم بـ`node --experimental-strip-types` (بعد حذف `import type`) وأن كل عنصر فيها يحمل الحقول الإلزامية في النماذج: 0 مخالفة.
قاعدة النشر للكتب منقولة في `FiqhVisibility` (مطابقة `isPublishedLesson/Chapter/Book`)، والذنوب تُعرض `reviewStatus == "reviewed"` فقط؛ استبعاد المحجوز يبقى في التصدير.

## 2) نقطة الدخول (`ios-native/SunnahApp/SunnahApp.swift`، ملف مشترك)
- `FiqhSection.register(in: .shared)` **بعد** `GeneratedScreens.registerAll` كي تحل شاشات القسم محل المولَّدة بالمعرّفات نفسها (16 معرّفًا).
- `FiqhSection.resolve(path:)` **قبل** `GeneratedScreens.resolve(path:)` لمسارات `:id`.
- ملاحظة: `SunnahApp` لا يستدعي `GeneratedScreens.registerAll` ولا يحلّ مسارات `.web` أصليًا حتى الآن.

## 3) نواقص في القوالب (لم أعدّلها)
- `GeneratedScreens/FiqhScreens.resolve`: `/fiqh/books/:b/chapters/:c` و`/lessons/:l` تعرض **الكتاب** لا الباب/المسألة (`ItemHost` يبحث بـ`c[2]` في قائمة مسطّحة). القسم يتجاوزها بـ`FiqhSection.resolve`.
- `ContentItem` بلا مُهيّئ عام، و`ItemHost/CollectionHost` خاصّان بـ`ContentItem`؛ لذا كتبتُ `FiqhLoadHost` عامًا داخل القسم. مضيف عام مشترك يغني عنه.
- `Sunnah.Typography` بلا خط نصوص شرعية (Amiri للأحاديث، Amiri Quran للآيات)؛ الأدلة تُعرض الآن بخط الواجهة داخل كتلة مميّزة.
- المولّد يسجّل `prayer-times` قائمةً من ملف غير موجود، بينما شاشتها الحقيقية `Special/PrayerScreen` (المعرّف `prayer`).

## 4) المسارات المتبقية (17 من 39)
- **محتوى مكتوب داخل JSX لا في وحدة بيانات** — يلزم نقله حرفيًا إلى وحدة بيانات ثم تصديره قبل أي شاشة: `/arkan` `/arkan-iman` `/fadail-aamal` `/fiqh-qawaid` `/hajj` `/janaza` `/mawarith` `/salah-guide` `/sawm` `/sujood-sahw` `/tahara` `/tawba` `/zakat`. تبقى على الشاشات المولَّدة.
- `/mawarith/calculator`: يحتاج نقل `src/lib/inheritance/engine.ts` (596 سطرًا) إلى Swift مع متجهات اختبار من الويب؛ مهمة مستقلة لأن خطأ القسمة ضرر شرعي ولا بناء هنا للتحقق.
- `/family`: بيانات مستخدم من Supabase (`FamilyModePage`) — تحتاج طبقة الحساب (ن3).
- `/prayer-times` و`/worship`: محرك المواقيت محمي، وشاشتها لدى ن3 (`PrayerScreen`).
